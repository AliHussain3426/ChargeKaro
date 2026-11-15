// Bookings module
//
// Business logic for booking creation, retrieval, and state transitions.

import crypto from 'crypto';
import { Booking } from './model.js';
import { Vehicle } from '../vehicles/model.js';
import { Station } from '../stations/model.js';
import { Terminal } from '../terminals/model.js';
import { SupplierProfile } from '../auth/model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { BookingStatus, TerminalStatus } from '../../types/index.js';
import { paymentService } from '../payments/service.js';
import { notificationService } from '../notifications/service.js';

export interface CreateBookingInput {
  vehicleId: string;
  stationId: string;
  terminalId: string;
  requestedStartTime: Date | string;
  requestedEndTime: Date | string;
}

const terminalLocks = new Map<string, Promise<void>>();

async function withTerminalLock<T>(terminalId: string, fn: () => Promise<T>): Promise<T> {
  const key = terminalId.toString();
  const previous = terminalLocks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  terminalLocks.set(key, previous.then(() => current));
  await previous;
  try {
    return await fn();
  } finally {
    release();
    if (terminalLocks.get(key) === current) {
      terminalLocks.delete(key);
    }
  }
}

function normalizeConnectors(values: string[] | undefined): string[] {
  return (values ?? []).map((value) => value.trim().toLowerCase()).filter(Boolean);
}

function areCompatible(vehicleConnectors: string[], terminalConnectors: string[]): boolean {
  if (vehicleConnectors.length === 0) return true;
  if (terminalConnectors.length === 0) return false;
  const terminalSet = new Set(terminalConnectors);
  return vehicleConnectors.some((connector) => terminalSet.has(connector));
}

function generateBookingReference(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BK-${stamp}-${rand}`;
}

const ACTIVE_SLOT_STATUSES = [
  BookingStatus.PENDING_SUPPLIER,
  BookingStatus.ACCEPTED_AWAITING_PAYMENT,
  BookingStatus.CONFIRMED,
  BookingStatus.IN_PROGRESS,
];

function populateBooking(query: any) {
  return query
    .populate('stationId', 'name address city')
    .populate('terminalId', 'name connectorTypes maximumPowerKw pricing')
    .populate('vehicleId', 'manufacturer model connectorTypes');
}

async function requireSupplierProfile(userId: string) {
  const profile = await SupplierProfile.findOne({ user: userId } as any).exec();
  if (!profile) {
    throw new AppError('Supplier profile not found', 404);
  }
  return profile as any;
}

export const bookingService = {
  async createBooking(customerId: string, input: CreateBookingInput) {
    const start = new Date(input.requestedStartTime);
    const end = new Date(input.requestedEndTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      throw new AppError('Requested booking time window is invalid', 400);
    }

    const vehicle = await Vehicle.findById(input.vehicleId).exec();
    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }
    if (vehicle.customerId.toString() !== customerId) {
      throw new AppError('Forbidden: vehicle access denied', 403);
    }

    const station = await Station.findById(input.stationId).exec();
    if (!station) {
      throw new AppError('Station not found', 404);
    }

    const terminal = await Terminal.findById(input.terminalId).exec();
    if (!terminal) {
      throw new AppError('Terminal not found', 404);
    }
    if (terminal.stationId.toString() !== station._id.toString()) {
      throw new AppError('Terminal does not belong to the selected station', 400);
    }

    const vehicleConnectors = normalizeConnectors(vehicle.connectorTypes);
    const terminalConnectors = normalizeConnectors(terminal.connectorTypes);
    if (!areCompatible(vehicleConnectors, terminalConnectors)) {
      throw new AppError('Vehicle is not compatible with the selected terminal', 400);
    }

    if (!terminal.availability || terminal.status !== TerminalStatus.AVAILABLE) {
      throw new AppError('Selected terminal is not available for booking', 409);
    }

    return withTerminalLock(terminal._id.toString(), async () => {
      const overlapCount = await Booking.countDocuments({
        terminalId: terminal._id,
        status: { $in: ACTIVE_SLOT_STATUSES },
        requestedStartTime: { $lt: end },
        requestedEndTime: { $gt: start },
      } as any).exec();

      if (overlapCount >= (terminal.capacity ?? 1)) {
        throw new AppError('Insufficient availability for the selected time window', 409);
      }

      const booking = await new Booking({
        bookingReference: generateBookingReference(),
        customerId,
        supplierId: station.supplierId,
        vehicleId: vehicle._id,
        stationId: station._id,
        terminalId: terminal._id,
        requestedStartTime: start,
        requestedEndTime: end,
        priceSnapshot: {
          amount: terminal.pricing?.amount ?? station.pricing.amount,
          currency: terminal.pricing?.currency ?? station.pricing.currency,
          billingType: terminal.pricing?.billingType ?? station.pricing.billingType,
        },
        status: BookingStatus.PENDING_SUPPLIER,
        paymentStatus: 'UNPAID',
      }).save();

      await notificationService.notifyBookingSubmitted(booking);
      return booking;
    });
  },

  async listCustomerBookings(customerId: string) {
    return populateBooking(Booking.find({ customerId } as any))
      .sort({ requestedStartTime: -1, createdAt: -1 })
      .exec();
  },

  async getCustomerBooking(customerId: string, bookingId: string) {
    const booking = await populateBooking(Booking.findById(bookingId)).exec();
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    if ((booking as any).customerId.toString() !== customerId) {
      throw new AppError('Forbidden: booking access denied', 403);
    }
    return booking;
  },

  async listSupplierBookings(userId: string) {
    const profile = await requireSupplierProfile(userId);
    return populateBooking(Booking.find({ supplierId: profile._id } as any))
      .sort({ requestedStartTime: -1, createdAt: -1 })
      .exec();
  },

  async getSupplierBooking(userId: string, bookingId: string) {
    const profile = await requireSupplierProfile(userId);
    const booking = await populateBooking(Booking.findById(bookingId)).exec();
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }
    if ((booking as any).supplierId.toString() !== profile._id.toString()) {
      throw new AppError('Forbidden: booking access denied', 403);
    }
    return booking;
  },

  async transitionBooking(
    bookingId: string,
    actor: { role: 'CUSTOMER' | 'SUPPLIER'; userId: string },
    action: 'accept' | 'reject' | 'pay' | 'cancel' | 'expire' | 'start' | 'complete'
  ) {
    const booking = await Booking.findById(bookingId).exec();
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (actor.role === 'CUSTOMER') {
      if (booking.customerId.toString() !== actor.userId) {
        throw new AppError('Forbidden: booking access denied', 403);
      }
    } else {
      const profile = await requireSupplierProfile(actor.userId);
      if (booking.supplierId.toString() !== profile._id.toString()) {
        throw new AppError('Forbidden: booking access denied', 403);
      }
    }

    const status = booking.status as BookingStatus;

    const set = (next: BookingStatus, paymentStatus?: string) => {
      booking.status = next;
      if (paymentStatus) (booking as any).paymentStatus = paymentStatus;
    };

    switch (action) {
      case 'accept':
        if (actor.role !== 'SUPPLIER' || status !== BookingStatus.PENDING_SUPPLIER) {
          throw new AppError('Invalid booking transition', 400);
        }
        set(BookingStatus.ACCEPTED_AWAITING_PAYMENT);
        await booking.save();
        await paymentService.createOrGetForBooking(booking._id.toString());
        await notificationService.notifyBookingAccepted(booking);
        return populateBooking(Booking.findById(booking._id)).exec();
      case 'reject':
        if (actor.role !== 'SUPPLIER' || status !== BookingStatus.PENDING_SUPPLIER) {
          throw new AppError('Invalid booking transition', 400);
        }
        set(BookingStatus.REJECTED);
        await booking.save();
        await notificationService.notifyBookingRejected(booking);
        return populateBooking(Booking.findById(booking._id)).exec();
      case 'pay':
        if (actor.role !== 'CUSTOMER' || status !== BookingStatus.ACCEPTED_AWAITING_PAYMENT) {
          throw new AppError('Invalid booking transition', 400);
        }
        await paymentService.initiatePayment(actor.userId, booking._id.toString());
        await paymentService.finalizeSuccess({ bookingId: booking._id.toString() });
        return populateBooking(Booking.findById(booking._id)).exec();
      case 'cancel':
        if (actor.role === 'CUSTOMER' && ![BookingStatus.PENDING_SUPPLIER, BookingStatus.ACCEPTED_AWAITING_PAYMENT, BookingStatus.CONFIRMED].includes(status)) {
          throw new AppError('Invalid booking transition', 400);
        }
        if (actor.role === 'SUPPLIER' && status !== BookingStatus.CONFIRMED) {
          throw new AppError('Invalid booking transition', 400);
        }
        set(BookingStatus.CANCELLED);
        await booking.save();
        await notificationService.notifyBookingCancelled(booking, actor.role);
        return populateBooking(Booking.findById(booking._id)).exec();
      case 'expire':
        if (status !== BookingStatus.ACCEPTED_AWAITING_PAYMENT) {
          throw new AppError('Invalid booking transition', 400);
        }
        set(BookingStatus.EXPIRED);
        break;
      case 'start':
        if (actor.role !== 'SUPPLIER' || status !== BookingStatus.CONFIRMED) {
          throw new AppError('Invalid booking transition', 400);
        }
        set(BookingStatus.IN_PROGRESS);
        break;
      case 'complete':
        if (actor.role !== 'SUPPLIER' || status !== BookingStatus.IN_PROGRESS) {
          throw new AppError('Invalid booking transition', 400);
        }
        set(BookingStatus.COMPLETED);
        break;
      default:
        throw new AppError('Unsupported booking action', 400);
    }

    await booking.save();
    return populateBooking(Booking.findById(booking._id)).exec();
  },

  // Backward-compatible names used by earlier code/tests if any
  async listBookings(customerId: string) {
    return this.listCustomerBookings(customerId);
  },
  async getBooking(customerId: string, bookingId: string) {
    return this.getCustomerBooking(customerId, bookingId);
  },
};

export type BookingService = typeof bookingService;
