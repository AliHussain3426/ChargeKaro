// Payments module
//
// Payment records, provider-agnostic initiation/verification, webhook processing
// with signature verification + replay/dedupe protection, and supplier earnings.

import crypto from 'crypto';
import { Payment } from './model.js';
import { PaymentWebhookEvent } from './webhookEvent.model.js';
import { Booking } from '../bookings/model.js';
import { SupplierProfile } from '../auth/model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { BookingStatus, PaymentStatus } from '../../types/index.js';
import { notificationService } from '../notifications/service.js';
import { env } from '../../config/env.js';
import { getPaymentProvider, getWebhookSecret } from './providers/index.js';

const PLATFORM_FEE_RATE = env.PLATFORM_COMMISSION_RATE ?? 0.1; // configurable (SRS policy pending confirmation)

function generateProviderReference(prefix = 'pay'): string {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

export function calculateEarnings(amounts: number[], feeRate = PLATFORM_FEE_RATE) {
  const gross = amounts.reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
  const platformFee = Math.round(gross * feeRate * 100) / 100;
  const netPayable = Math.round((gross - platformFee) * 100) / 100;
  return { gross, platformFee, netPayable, feeRate };
}

async function requireSupplierProfile(userId: string) {
  const profile = await SupplierProfile.findOne({ user: userId } as any).exec();
  if (!profile) {
    throw new AppError('Supplier profile not found', 404);
  }
  return profile as any;
}

async function applyPaidState(payment: any) {
  if (payment.status === PaymentStatus.PAID) {
    const booking = await Booking.findById(payment.bookingId).exec();
    return { payment, booking };
  }
  payment.status = PaymentStatus.PAID;
  payment.processedAt = new Date();
  payment.failureReason = undefined;
  await payment.save();

  const booking = await Booking.findById(payment.bookingId).exec();
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status === BookingStatus.ACCEPTED_AWAITING_PAYMENT) {
    (booking as any).status = BookingStatus.CONFIRMED;
  }
  (booking as any).paymentStatus = PaymentStatus.PAID;
  await booking.save();
  try {
    const { settlementService } = await import('./settlement.service.js');
    await settlementService.reconcileForPayment(payment._id.toString(), 'payment_confirmed');
  } catch {
    // settlement reconciliation is best-effort here; admin/supplier reconciliation can recover
  }
  await notificationService.notifyPaymentUpdate(booking, PaymentStatus.PAID);
  return { payment, booking };
}

async function applyFailedState(payment: any, reason?: string) {
  if (payment.status === PaymentStatus.PAID) {
    const booking = await Booking.findById(payment.bookingId).exec();
    return { payment, booking };
  }
  payment.status = PaymentStatus.FAILED;
  payment.processedAt = new Date();
  payment.failureReason = reason ?? 'Payment failed';
  await payment.save();

  const booking = await Booking.findById(payment.bookingId).exec();
  if (booking) {
    (booking as any).paymentStatus = PaymentStatus.FAILED;
    await booking.save();
    await notificationService.notifyPaymentUpdate(booking, PaymentStatus.FAILED);
  }
  return { payment, booking };
}

export const paymentService = {
  PLATFORM_FEE_RATE,

  async createOrGetForBooking(bookingId: string, opts: { provider?: string; idempotencyKey?: string } = {}) {
    const booking = await Booking.findById(bookingId).exec();
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (opts.idempotencyKey) {
      const existingByKey = await Payment.findOne({ bookingId: booking._id, idempotencyKey: opts.idempotencyKey } as any).exec();
      if (existingByKey) return existingByKey;
    }

    const existingActive = await Payment.findOne({
      bookingId: booking._id,
      status: { $in: [PaymentStatus.UNPAID, PaymentStatus.PROCESSING, PaymentStatus.PAID] },
    } as any)
      .sort({ createdAt: -1 })
      .exec();
    if (existingActive) {
      if (opts.idempotencyKey && !existingActive.idempotencyKey) {
        (existingActive as any).idempotencyKey = opts.idempotencyKey;
        await existingActive.save();
      }
      return existingActive;
    }

    const provider = opts.provider ?? env.PAYMENT_PROVIDER ?? 'sandbox';
    const payment = await new Payment({
      bookingId: booking._id,
      customerId: booking.customerId,
      supplierId: booking.supplierId,
      provider,
      providerReference: generateProviderReference('booking'),
      idempotencyKey: opts.idempotencyKey,
      amount: booking.priceSnapshot.amount,
      currency: booking.priceSnapshot.currency ?? env.PAYMENT_CURRENCY,
      billingType: booking.priceSnapshot.billingType,
      status: PaymentStatus.UNPAID,
      providerEventIds: [],
    }).save();

    return payment;
  },

  async initiatePayment(customerUserId: string, bookingId: string, opts: { idempotencyKey?: string } = {}) {
    const booking = await Booking.findById(bookingId).exec();
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.customerId.toString() !== customerUserId) {
      throw new AppError('Forbidden: booking access denied', 403);
    }
    if (booking.status !== BookingStatus.ACCEPTED_AWAITING_PAYMENT) {
      throw new AppError('Booking is not awaiting payment', 400);
    }

    const payment = await this.createOrGetForBooking(bookingId, { idempotencyKey: opts.idempotencyKey, provider: env.PAYMENT_PROVIDER });

    if (payment.status === PaymentStatus.PAID) {
      if (booking.status === BookingStatus.ACCEPTED_AWAITING_PAYMENT) {
        (booking as any).status = BookingStatus.CONFIRMED;
        (booking as any).paymentStatus = PaymentStatus.PAID;
        await booking.save();
      }
      return { payment, booking };
    }

    const provider = getPaymentProvider(payment.provider);
    const initiation = await provider.initiate(payment as any, { booking, clientUrl: env.CLIENT_URL });
    (payment as any).provider = initiation.provider || provider.name;
    (payment as any).providerReference = initiation.providerReference || (payment as any).providerReference;
    if (initiation.providerSessionId) (payment as any).providerSessionId = initiation.providerSessionId;
    if (initiation.checkoutUrl) (payment as any).checkoutUrl = initiation.checkoutUrl;

    if (payment.status === PaymentStatus.UNPAID || payment.status === PaymentStatus.FAILED) {
      (payment as any).status = PaymentStatus.PROCESSING;
      (payment as any).failureReason = undefined;
    }
    await payment.save();

    // Never mark paid based on client input. Final state is set by server-verified
    // provider confirmation (webhook or verified completion flow).
    return { payment, booking };
  },

  async finalizeSuccess(paymentOrReference: { paymentId?: string; providerReference?: string; bookingId?: string }, actor?: { userId?: string; role?: string }) {
    let payment: any = null;
    if (paymentOrReference.providerReference) {
      payment = await Payment.findOne({ providerReference: paymentOrReference.providerReference } as any).exec();
    } else if (paymentOrReference.paymentId) {
      payment = await Payment.findById(paymentOrReference.paymentId).exec();
    } else if (paymentOrReference.bookingId) {
      payment = await Payment.findOne({ bookingId: paymentOrReference.bookingId } as any).sort({ createdAt: -1 }).exec();
    }
    if (!payment) throw new AppError('Payment not found', 404);

    if (actor?.userId && actor.role === 'CUSTOMER' && payment.customerId.toString() !== actor.userId) {
      throw new AppError('Forbidden: payment access denied', 403);
    }
    if (payment.status === PaymentStatus.PAID) {
      const booking = await Booking.findById(payment.bookingId).exec();
      return { payment, booking };
    }
    if (![PaymentStatus.PROCESSING, PaymentStatus.UNPAID].includes(payment.status)) {
      const booking = await Booking.findById(payment.bookingId).exec();
      return { payment, booking };
    }

    const provider = getPaymentProvider(payment.provider);
    const verified = await provider.verifyPayment(payment);
    // Sandbox/server-verified completion: allow confirming an initiated/processing payment.
    // For real providers, webhooks or provider API verification should be the source of truth.
    if (verified.status === 'paid' || (provider.name === 'sandbox' && verified.status === 'processing')) {
      return applyPaidState(payment);
    }
    if (verified.status === 'failed') {
      return applyFailedState(payment, verified.reason);
    }
    // remain processing/unpaid
    const booking = await Booking.findById(payment.bookingId).exec();
    return { payment, booking };
  },

  async finalizeFailure(paymentOrReference: { paymentId?: string; providerReference?: string; bookingId?: string; reason?: string }, actor?: { userId?: string; role?: string }) {
    let payment: any = null;
    if (paymentOrReference.providerReference) {
      payment = await Payment.findOne({ providerReference: paymentOrReference.providerReference } as any).exec();
    } else if (paymentOrReference.paymentId) {
      payment = await Payment.findById(paymentOrReference.paymentId).exec();
    } else if (paymentOrReference.bookingId) {
      payment = await Payment.findOne({ bookingId: paymentOrReference.bookingId } as any).sort({ createdAt: -1 }).exec();
    }
    if (!payment) throw new AppError('Payment not found', 404);

    if (actor?.userId && actor.role === 'CUSTOMER' && payment.customerId.toString() !== actor.userId) {
      throw new AppError('Forbidden: payment access denied', 403);
    }
    if (payment.status === PaymentStatus.PAID) {
      const booking = await Booking.findById(payment.bookingId).exec();
      return { payment, booking };
    }

    const provider = getPaymentProvider(payment.provider);
    const verified = await provider.verifyPayment(payment);
    const reason = paymentOrReference.reason ?? verified.reason ?? 'Payment failed';
    if (verified.status === 'paid') {
      return applyPaidState(payment);
    }
    // Only allow failure transition for initiated payments (server-verified context)
    if ([PaymentStatus.PROCESSING, PaymentStatus.UNPAID, PaymentStatus.FAILED].includes(payment.status)) {
      return applyFailedState(payment, reason);
    }
    const booking = await Booking.findById(payment.bookingId).exec();
    return { payment, booking };
  },

  async handleWebhook(providerName: string, payload: any, rawBody?: Buffer, headers: Record<string, string | string[] | undefined> = {}) {
    const provider = getPaymentProvider(providerName);
    const secret = getWebhookSecret(provider.name);

    if (!rawBody || rawBody.length === 0) {
      throw new AppError('Missing raw webhook payload for signature verification', 400);
    }

    const event = await provider.verifyAndParseWebhook({ rawBody, headers, body: payload, secret });

    // Replay/event dedupe protection
    const eventHash = crypto.createHash('sha256').update(rawBody).digest('hex');
    const existingEvent = await PaymentWebhookEvent.findOne({ provider: event.provider, eventId: event.eventId } as any).exec();
    if (existingEvent) {
      const payment = existingEvent.paymentId ? await Payment.findById(existingEvent.paymentId).exec() : null;
      const booking = payment ? await Booking.findById((payment as any).bookingId).exec() : null;
      return { payment, booking, idempotent: true, eventId: event.eventId, replayed: true };
    }

    let payment: any = null;
    if (event.providerReference) {
      payment = await Payment.findOne({ providerReference: event.providerReference } as any).exec();
    }
    if (!payment && event.bookingId) {
      payment = await Payment.findOne({ bookingId: event.bookingId } as any).sort({ createdAt: -1 }).exec();
    }
    if (!payment) {
      if (event.bookingId) {
        payment = await this.createOrGetForBooking(String(event.bookingId), { provider: event.provider });
        if (event.providerReference) {
          payment.provider = event.provider;
          payment.providerReference = event.providerReference;
          await payment.save();
        }
      } else {
        throw new AppError('Payment not found for webhook', 404);
      }
    }

    // Payment-level idempotency guard
    if (Array.isArray(payment.providerEventIds) && payment.providerEventIds.includes(event.eventId)) {
      const booking = await Booking.findById(payment.bookingId).exec();
      return { payment, booking, idempotent: true, eventId: event.eventId };
    }

    let result: any = { payment, booking: await Booking.findById(payment.bookingId).exec(), idempotent: true, eventId: event.eventId };
    if (event.outcome === 'success') {
      result = { ...(await applyPaidState(payment)), idempotent: false, eventId: event.eventId };
    } else if (event.outcome === 'failed') {
      result = { ...(await applyFailedState(payment, event.reason)), idempotent: false, eventId: event.eventId };
    }

    // Record processed event (unique index enforces dedupe under races)
    try {
      await PaymentWebhookEvent.create({
        provider: event.provider,
        eventId: event.eventId,
        providerReference: event.providerReference,
        paymentId: payment._id,
        outcome: event.outcome,
        payloadHash: eventHash,
        processedAt: new Date(),
      } as any);
    } catch (err: any) {
      // duplicate key => replay-safe idempotent response
      if (!(err && err.code === 11000)) throw err;
      result.idempotent = true;
      result.replayed = true;
    }

    if (!Array.isArray(payment.providerEventIds)) payment.providerEventIds = [];
    if (!payment.providerEventIds.includes(event.eventId)) {
      payment.providerEventIds.push(event.eventId);
      await payment.save();
    }

    return result;
  },

  async listPaymentsForCustomer(userId: string) {
    return Payment.find({ customerId: userId } as any).sort({ createdAt: -1 }).exec();
  },

  async getPayment(userId: string, role: string, paymentId: string) {
    const payment = await Payment.findById(paymentId).exec();
    if (!payment) throw new AppError('Payment not found', 404);
    if (role === 'SUPPLIER') {
      const profile = await requireSupplierProfile(userId);
      if (payment.supplierId.toString() !== profile._id.toString()) {
        throw new AppError('Forbidden: payment access denied', 403);
      }
    } else if (payment.customerId.toString() !== userId) {
      throw new AppError('Forbidden: payment access denied', 403);
    }
    return payment;
  },

  async getSupplierEarnings(userId: string) {
    const profile = await requireSupplierProfile(userId);
    const paidPayments = await Payment.find({ supplierId: profile._id, status: PaymentStatus.PAID } as any)
      .sort({ createdAt: -1 })
      .populate({ path: 'bookingId', select: 'bookingReference stationId requestedStartTime requestedEndTime' })
      .exec();

    const totals = calculateEarnings(paidPayments.map((p: any) => p.amount));

    const pendingPayments = await Payment.find({
      supplierId: profile._id,
      status: { $in: [PaymentStatus.UNPAID, PaymentStatus.PROCESSING] },
    } as any).exec();
    const pendingAmount = pendingPayments.reduce((sum, p: any) => sum + (p.amount || 0), 0);

    const failedPayments = await Payment.find({ supplierId: profile._id, status: PaymentStatus.FAILED } as any).exec();
    const failedAmount = failedPayments.reduce((sum, p: any) => sum + (p.amount || 0), 0);

    return {
      ...totals,
      currency: paidPayments[0]?.currency ?? env.PAYMENT_CURRENCY ?? 'PKR',
      paidCount: paidPayments.length,
      pendingAmount,
      failedAmount,
      payments: paidPayments,
    };
  },
};

export type PaymentService = typeof paymentService;