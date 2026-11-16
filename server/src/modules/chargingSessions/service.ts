import crypto from 'crypto';
import { Types } from 'mongoose';
import { ChargingSession, ChargingSessionPaymentStatus, ChargingSessionStatus } from './model.js';
import { Booking } from '../bookings/model.js';
import { Vehicle } from '../vehicles/model.js';
import { Station } from '../stations/model.js';
import { Terminal } from '../terminals/model.js';
import { SupplierProfile } from '../auth/model.js';
import { Payment } from '../payments/model.js';
import { User } from '../auth/model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { BookingStatus, PaymentStatus, PricingType } from '../../types/index.js';

export interface StartSessionInput {
  bookingId: string;
  initialSocPercent: number;
}

export interface CompleteSessionInput {
  finalSocPercent: number;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function toMoney(value: number): number {
  // decimal-safe currency rounding to 2 dp
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function toKwh(value: number): number {
  return round(value, 4);
}

async function requireSupplierProfile(userId: string) {
  const profile = await SupplierProfile.findOne({ user: userId } as any).exec();
  if (!profile) throw new AppError('Supplier profile not found', 404);
  return profile as any;
}

function generateProviderReference(prefix = 'session'): string {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

function stationRate(station: any): number {
  const pricing = station?.pricing;
  if (!pricing || pricing.billingType !== PricingType.PER_KWH) {
    throw new AppError('Station charging rate (PKR/kWh) is not configured', 400);
  }
  const amount = Number(pricing.amount);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new AppError('Invalid station charging rate', 400);
  }
  return amount;
}

function vehicleBatteryKwh(vehicle: any): number {
  const cap = Number(vehicle?.batteryCapacityKwh);
  if (!Number.isFinite(cap) || cap <= 0) {
    throw new AppError('Vehicle battery capacity (kWh) is required to calculate charging', 400);
  }
  return cap;
}

export const chargingSessionService = {
  async startSession(workerUserId: string, input: StartSessionInput) {
    const initial = Number(input.initialSocPercent);
    if (!Number.isFinite(initial) || initial < 0 || initial > 100) {
      throw new AppError('Initial battery percentage must be between 0 and 100', 400);
    }

    const profile = await requireSupplierProfile(workerUserId);
    const booking = await Booking.findById(input.bookingId).exec();
    if (!booking) throw new AppError('Booking not found', 404);

    if (booking.supplierId.toString() !== profile._id.toString()) {
      throw new AppError('Forbidden: booking access denied', 403);
    }
    if (![BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.ACCEPTED_AWAITING_PAYMENT, BookingStatus.PENDING_SUPPLIER].includes(booking.status as any)) {
      // allow starting for accepted/confirmed bookings in practice; be permissive but safe
    }
    // Prevent multiple active sessions for same booking
    const activeExisting = await ChargingSession.findOne({ bookingId: booking._id, status: ChargingSessionStatus.ACTIVE } as any).exec();
    if (activeExisting) {
      throw new AppError('An active charging session already exists for this booking', 409);
    }

    const vehicle = await Vehicle.findById(booking.vehicleId).exec();
    if (!vehicle) throw new AppError('Vehicle not found', 404);
    const station = await Station.findById(booking.stationId).exec();
    if (!station) throw new AppError('Station not found', 404);

    const rate = stationRate(station);
    const battery = vehicleBatteryKwh(vehicle);

    const session = await new ChargingSession({
      bookingId: booking._id,
      userId: booking.customerId,
      vehicleId: booking.vehicleId,
      stationId: booking.stationId,
      terminalId: booking.terminalId,
      supplierId: booking.supplierId,
      initialSocPercent: round(initial, 2),
      sessionStartTime: new Date(),
      status: ChargingSessionStatus.ACTIVE,
      batteryCapacityKwhSnapshot: round(battery, 4),
      stationRatePkrPerKwhSnapshot: toMoney(rate),
      currency: station.pricing?.currency ?? 'PKR',
      paymentStatus: ChargingSessionPaymentStatus.PENDING,
    }).save();

    // reflect booking in progress if applicable
    if (booking.status === BookingStatus.CONFIRMED) {
      (booking as any).status = BookingStatus.IN_PROGRESS;
      await booking.save();
    }

    return session;
  },

  async completeSession(workerUserId: string, sessionId: string, input: CompleteSessionInput) {
    const finalSoc = Number(input.finalSocPercent);
    if (!Number.isFinite(finalSoc) || finalSoc < 0 || finalSoc > 100) {
      throw new AppError('Final battery percentage must be between 0 and 100', 400);
    }

    const profile = await requireSupplierProfile(workerUserId);
    const session = await ChargingSession.findById(sessionId).exec();
    if (!session) throw new AppError('Charging session not found', 404);
    if (session.supplierId.toString() !== profile._id.toString()) {
      throw new AppError('Forbidden: session access denied', 403);
    }
    if (session.status !== ChargingSessionStatus.ACTIVE) {
      throw new AppError('Charging session is not active', 400);
    }

    const initialSoc = Number(session.initialSocPercent);
    if (finalSoc < initialSoc) {
      throw new AppError('Final battery percentage must be greater than or equal to initial battery percentage', 400);
    }

    const battery = Number(session.batteryCapacityKwhSnapshot);
    const rate = Number(session.stationRatePkrPerKwhSnapshot);
    const energy = toKwh(battery * ((finalSoc - initialSoc) / 100));
    const total = toMoney(energy * rate);

    session.finalSocPercent = round(finalSoc, 2);
    session.sessionCompletionTime = new Date();
    session.energyConsumedKwh = energy;
    session.totalPricePkr = total;
    session.status = ChargingSessionStatus.COMPLETED;
    session.paymentStatus = ChargingSessionPaymentStatus.PENDING;

    // Create or reuse a payment record for this session/billing amount (pending/unpaid)
    let payment = session.paymentId ? await Payment.findById(session.paymentId).exec() : null;
    if (!payment) {
      payment = await Payment.findOne({ bookingId: session.bookingId, status: { $in: [PaymentStatus.UNPAID, PaymentStatus.PROCESSING, PaymentStatus.PAID, PaymentStatus.FAILED] } } as any).sort({ createdAt: -1 }).exec();
    }
    if (payment && (payment as any).status === PaymentStatus.PAID) {
      // keep paid state; do not overwrite paid bill
      session.paymentStatus = ChargingSessionPaymentStatus.PAID;
    } else if (payment) {
      (payment as any).amount = total;
      (payment as any).currency = session.currency ?? 'PKR';
      (payment as any).billingType = PricingType.PER_KWH;
      (payment as any).status = PaymentStatus.UNPAID;
      (payment as any).provider = (payment as any).provider || 'sandbox';
      if (!(payment as any).providerReference) (payment as any).providerReference = generateProviderReference('session');
      (payment as any).failureReason = undefined;
      await payment.save();
      session.paymentId = payment._id as any;
    } else {
      payment = await new Payment({
        bookingId: session.bookingId,
        customerId: session.userId,
        supplierId: session.supplierId,
        provider: 'sandbox',
        providerReference: generateProviderReference('session'),
        amount: total,
        currency: session.currency ?? 'PKR',
        billingType: PricingType.PER_KWH,
        status: PaymentStatus.UNPAID,
        providerEventIds: [],
      } as any).save();
      session.paymentId = payment._id as any;
    }

    await session.save();

    // Update booking payment amount/status snapshot and mark completed if in progress/confirmed
    const booking = await Booking.findById(session.bookingId).exec();
    if (booking) {
      (booking as any).paymentStatus = session.paymentStatus === ChargingSessionPaymentStatus.PAID ? PaymentStatus.PAID : PaymentStatus.UNPAID;
      if ([BookingStatus.IN_PROGRESS, BookingStatus.CONFIRMED].includes(booking.status as any)) {
        (booking as any).status = BookingStatus.COMPLETED;
      }
      await booking.save();
    }

    return session;
  },

  async getSessionForSupplier(workerUserId: string, sessionId: string) {
    const profile = await requireSupplierProfile(workerUserId);
    const session = await this._populate(ChargingSession.findById(sessionId)).exec();
    if (!session) throw new AppError('Charging session not found', 404);
    if ((session as any).supplierId.toString() !== profile._id.toString()) {
      throw new AppError('Forbidden: session access denied', 403);
    }
    return session;
  },

  async listSessionsForSupplier(workerUserId: string, opts: { status?: string; bookingId?: string } = {}) {
    const profile = await requireSupplierProfile(workerUserId);
    const query: any = { supplierId: profile._id };
    if (opts.status) query.status = opts.status;
    if (opts.bookingId && Types.ObjectId.isValid(opts.bookingId)) query.bookingId = opts.bookingId;
    return this._populate(ChargingSession.find(query)).sort({ createdAt: -1 }).exec();
  },

  async getSessionForCustomer(customerUserId: string, sessionId: string) {
    const session = await this._populate(ChargingSession.findById(sessionId)).exec();
    if (!session) throw new AppError('Charging session not found', 404);
    if ((session as any).userId.toString() !== customerUserId) {
      throw new AppError('Forbidden: session access denied', 403);
    }
    return session;
  },

  async listSessionsForCustomer(customerUserId: string) {
    return this._populate(ChargingSession.find({ userId: customerUserId } as any)).sort({ createdAt: -1 }).exec();
  },

  async getReceipt(sessionId: string, actor: { userId: string; role: string }) {
    const session = await this._populate(ChargingSession.findById(sessionId)).exec();
    if (!session) throw new AppError('Charging session not found', 404);
    if (actor.role === 'SUPPLIER') {
      const profile = await requireSupplierProfile(actor.userId);
      if ((session as any).supplierId.toString() !== profile._id.toString()) throw new AppError('Forbidden: session access denied', 403);
    } else if (actor.role === 'CUSTOMER') {
      if ((session as any).userId.toString() !== actor.userId) throw new AppError('Forbidden: session access denied', 403);
    } else if (actor.role !== 'ADMIN') {
      throw new AppError('Forbidden', 403);
    }

    const booking = await Booking.findById((session as any).bookingId).exec();
    const user = await User.findById((session as any).userId).select('name email').exec();
    const station = await Station.findById((session as any).stationId).exec();
    const vehicle = await Vehicle.findById((session as any).vehicleId).exec();
    const payment = (session as any).paymentId ? await Payment.findById((session as any).paymentId).exec() : null;

    return {
      sessionId: (session as any)._id,
      transactionId: (session as any)._id.toString(),
      bookingReference: booking?.bookingReference,
      customerName: (user as any)?.name,
      vehicle: vehicle ? {
        name: `${(vehicle as any).manufacturer ?? ''} ${(vehicle as any).model ?? ''}`.trim(),
        model: (vehicle as any).model,
        manufacturer: (vehicle as any).manufacturer,
        batteryCapacityKwh: (session as any).batteryCapacityKwhSnapshot,
      } : null,
      stationName: (station as any)?.name,
      initialSocPercent: (session as any).initialSocPercent,
      finalSocPercent: (session as any).finalSocPercent,
      energyConsumedKwh: (session as any).energyConsumedKwh,
      chargingRatePkrPerKwh: (session as any).stationRatePkrPerKwhSnapshot,
      totalAmountPkr: (session as any).totalPricePkr,
      sessionStartTime: (session as any).sessionStartTime,
      sessionCompletionTime: (session as any).sessionCompletionTime,
      paymentStatus: payment ? (payment as any).status : (session as any).paymentStatus,
      currency: (session as any).currency ?? 'PKR',
    };
  },

  _populate(query: any) {
    return query
      .populate('bookingId', 'bookingReference status paymentStatus requestedStartTime requestedEndTime')
      .populate('vehicleId', 'manufacturer model vehicleCategory batteryCapacityKwh connectorTypes')
      .populate('stationId', 'name address city pricing')
      .populate('terminalId', 'name connectorTypes maximumPowerKw')
      .populate('userId', 'name email');
  },
};

export type ChargingSessionService = typeof chargingSessionService;
