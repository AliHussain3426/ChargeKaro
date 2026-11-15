// Payments module
//
// Payment records, status transitions, webhook-ready idempotent processing,
// and supplier earnings calculations.

import crypto from 'crypto';
import { Payment } from './model.js';
import { Booking } from '../bookings/model.js';
import { SupplierProfile } from '../auth/model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { BookingStatus, PaymentStatus } from '../../types/index.js';
import { notificationService } from '../notifications/service.js';

const PLATFORM_FEE_RATE = 0.1; // 10%

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

    const payment = await new Payment({
      bookingId: booking._id,
      customerId: booking.customerId,
      supplierId: booking.supplierId,
      provider: opts.provider ?? 'stub',
      providerReference: generateProviderReference('booking'),
      idempotencyKey: opts.idempotencyKey,
      amount: booking.priceSnapshot.amount,
      currency: booking.priceSnapshot.currency,
      billingType: booking.priceSnapshot.billingType,
      status: PaymentStatus.UNPAID,
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

    const payment = await this.createOrGetForBooking(bookingId, { idempotencyKey: opts.idempotencyKey });

    if (payment.status === PaymentStatus.PAID) {
      if (booking.status === BookingStatus.ACCEPTED_AWAITING_PAYMENT) {
        (booking as any).status = BookingStatus.CONFIRMED;
        (booking as any).paymentStatus = PaymentStatus.PAID;
        await booking.save();
      }
      return { payment, booking };
    }

    if (payment.status === PaymentStatus.UNPAID || payment.status === PaymentStatus.FAILED) {
      (payment as any).status = PaymentStatus.PROCESSING;
      (payment as any).failureReason = undefined;
      await payment.save();
    }

    // Payment flow is integration-deferred: client confirms success/failure (stub/redirect)
    // and webhooks can also drive finalization idempotently.
    return { payment, booking };
  },

  async finalizeSuccess(paymentOrReference: { paymentId?: string; providerReference?: string; provider?: string; bookingId?: string }) {
    let payment: any = null;
    if (paymentOrReference.providerReference) {
      payment = await Payment.findOne({ providerReference: paymentOrReference.providerReference } as any).exec();
    } else if (paymentOrReference.paymentId) {
      payment = await Payment.findById(paymentOrReference.paymentId).exec();
    } else if (paymentOrReference.bookingId) {
      payment = await Payment.findOne({ bookingId: paymentOrReference.bookingId } as any).sort({ createdAt: -1 }).exec();
    }
    if (!payment) throw new AppError('Payment not found', 404);

    if (payment.status === PaymentStatus.PAID) {
      const booking = await Booking.findById(payment.bookingId).exec();
      return { payment, booking };
    }

    (payment as any).status = PaymentStatus.PAID;
    (payment as any).processedAt = new Date();
    (payment as any).failureReason = undefined;
    await payment.save();

    const booking = await Booking.findById(payment.bookingId).exec();
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.status === BookingStatus.ACCEPTED_AWAITING_PAYMENT) {
      (booking as any).status = BookingStatus.CONFIRMED;
    }
    (booking as any).paymentStatus = PaymentStatus.PAID;
    await booking.save();

    await notificationService.notifyPaymentUpdate(booking, PaymentStatus.PAID);
    return { payment, booking };
  },

  async finalizeFailure(paymentOrReference: { paymentId?: string; providerReference?: string; bookingId?: string; reason?: string }) {
    let payment: any = null;
    if (paymentOrReference.providerReference) {
      payment = await Payment.findOne({ providerReference: paymentOrReference.providerReference } as any).exec();
    } else if (paymentOrReference.paymentId) {
      payment = await Payment.findById(paymentOrReference.paymentId).exec();
    } else if (paymentOrReference.bookingId) {
      payment = await Payment.findOne({ bookingId: paymentOrReference.bookingId } as any).sort({ createdAt: -1 }).exec();
    }
    if (!payment) throw new AppError('Payment not found', 404);

    if (payment.status === PaymentStatus.PAID) {
      // idempotent: do not downgrade a paid payment
      const booking = await Booking.findById(payment.bookingId).exec();
      return { payment, booking };
    }

    (payment as any).status = PaymentStatus.FAILED;
    (payment as any).processedAt = new Date();
    (payment as any).failureReason = paymentOrReference.reason ?? 'Payment failed';
    await payment.save();

    const booking = await Booking.findById(payment.bookingId).exec();
    if (booking) {
      (booking as any).paymentStatus = PaymentStatus.FAILED;
      // Booking remains ACCEPTED_AWAITING_PAYMENT on payment failure per requirements
      await booking.save();
      await notificationService.notifyPaymentUpdate(booking, PaymentStatus.FAILED);
    }

    return { payment, booking };
  },

  async handleWebhook(provider: string, payload: any) {
    const providerReference = String(payload?.providerReference ?? payload?.data?.id ?? payload?.id ?? '').trim();
    const eventId = String(payload?.eventId ?? payload?.event_id ?? '').trim();
    const outcome = String(payload?.status ?? payload?.outcome ?? '').toLowerCase();
    if (!providerReference && !payload?.bookingId) {
      throw new AppError('Webhook payload missing payment reference', 400);
    }

    // Idempotency: if we've already seen this providerReference in a terminal state, return it.
    let payment = providerReference
      ? await Payment.findOne({ provider, providerReference } as any).exec()
      : null;

    if (!payment && payload?.bookingId) {
      payment = await Payment.findOne({ bookingId: payload.bookingId } as any).sort({ createdAt: -1 }).exec();
    }

    if (payment && (payment.status === PaymentStatus.PAID || payment.status === PaymentStatus.FAILED)) {
      const booking = await Booking.findById(payment.bookingId).exec();
      return { payment, booking, idempotent: true, eventId: eventId || undefined };
    }

    if (!payment) {
      if (payload?.bookingId) {
        payment = await this.createOrGetForBooking(String(payload.bookingId), { provider });
        if (providerReference) {
          // ensure deterministic reference for this provider event if not set
          (payment as any).provider = provider;
          (payment as any).providerReference = providerReference;
          await payment.save();
        }
      } else {
        throw new AppError('Payment not found for webhook', 404);
      }
    }

    if (outcome === 'success' || outcome === 'paid' || outcome === 'succeeded') {
      return { ...(await this.finalizeSuccess({ paymentId: payment._id.toString(), providerReference })), idempotent: false, eventId: eventId || undefined };
    }
    if (outcome === 'failed' || outcome === 'failure') {
      return { ...(await this.finalizeFailure({ paymentId: payment._id.toString(), providerReference, reason: payload?.reason })), idempotent: false, eventId: eventId || undefined };
    }

    // Unknown/non-terminal webhook: acknowledge without changing state
    const booking = await Booking.findById(payment.bookingId).exec();
    return { payment, booking, idempotent: true, eventId: eventId || undefined };
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
      currency: paidPayments[0]?.currency ?? 'PKR',
      paidCount: paidPayments.length,
      pendingAmount,
      failedAmount,
      payments: paidPayments,
    };
  },
};

export type PaymentService = typeof paymentService;
