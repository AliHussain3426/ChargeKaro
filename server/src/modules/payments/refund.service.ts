import { Types } from 'mongoose';
import { Payment } from './model.js';
import { Refund, RefundStatus } from './refund.model.js';
import { Booking } from '../bookings/model.js';
import { SupplierProfile } from '../auth/model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { PaymentStatus } from '../../types/index.js';
import { getPaymentProvider } from './providers/index.js';

const paymentRefundLocks = new Map<string, Promise<void>>();

async function withPaymentRefundLock<T>(paymentId: string, fn: () => Promise<T>): Promise<T> {
  const key = paymentId.toString();
  const previous = paymentRefundLocks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  paymentRefundLocks.set(key, previous.then(() => current));
  await previous;
  try {
    return await fn();
  } finally {
    release();
    if (paymentRefundLocks.get(key) === current) {
      paymentRefundLocks.delete(key);
    }
  }
}

async function requireSupplierProfile(userId: string) {
  const profile = await SupplierProfile.findOne({ user: userId } as any).exec();
  if (!profile) throw new AppError('Supplier profile not found', 404);
  return profile as any;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export interface RequestRefundInput {
  amount?: number; // if omitted => full remaining refundable amount
  reason: string;
  idempotencyKey?: string;
}

export const refundService = {
  async getRefundableSummary(paymentId: string) {
    const payment = await Payment.findById(paymentId).exec();
    if (!payment) throw new AppError('Payment not found', 404);
    const succeeded = await Refund.aggregate([
      { $match: { paymentId: new Types.ObjectId(paymentId), status: RefundStatus.SUCCEEDED } },
      { $group: { _id: '$paymentId', total: { $sum: '$amount' } } },
    ]).exec();
    const refunded = roundMoney(succeeded[0]?.total ?? 0);
    const remaining = roundMoney((payment.amount || 0) - refunded);
    return { payment, refunded, remaining };
  },

  async requestRefund(actor: { userId: string; role: string }, paymentId: string, input: RequestRefundInput) {
    if (!input?.reason || !String(input.reason).trim()) {
      throw new AppError('Refund reason is required', 400);
    }

    return withPaymentRefundLock(paymentId, async () => {
      const payment = await Payment.findById(paymentId).exec();
      if (!payment) throw new AppError('Payment not found', 404);

      // Authorization/ownership: customer can request refund for own payment; admin can request/process per policy.
      if (actor.role === 'CUSTOMER') {
        if (payment.customerId.toString() !== actor.userId) {
          throw new AppError('Forbidden: payment access denied', 403);
        }
      } else if (actor.role === 'ADMIN') {
        // allowed
      } else {
        throw new AppError('Forbidden: insufficient permissions for refund', 403);
      }

      if (payment.status !== PaymentStatus.PAID && payment.status !== PaymentStatus.PARTIALLY_REFUNDED) {
        throw new AppError('Payment is not eligible for refund', 400);
      }

      if (input.idempotencyKey) {
        const existingByKey = await Refund.findOne({ paymentId: payment._id, idempotencyKey: input.idempotencyKey } as any).exec();
        if (existingByKey) return existingByKey;
      }

      // Prevent duplicate in-flight requests for same payment unless explicitly idempotent/retry-safe
      const inFlight = await Refund.findOne({
        paymentId: payment._id,
        status: { $in: [RefundStatus.REQUESTED, RefundStatus.PROCESSING] },
      } as any).exec();
      if (inFlight) {
        if (input.idempotencyKey && inFlight.idempotencyKey === input.idempotencyKey) return inFlight;
        throw new AppError('A refund request is already in progress for this payment', 409);
      }

      const succeeded = await Refund.aggregate([
        { $match: { paymentId: payment._id, status: RefundStatus.SUCCEEDED } },
        { $group: { _id: '$paymentId', total: { $sum: '$amount' } } },
      ]).exec();
      const refundedSoFar = roundMoney(succeeded[0]?.total ?? 0);
      const remaining = roundMoney(payment.amount - refundedSoFar);
      if (remaining <= 0) {
        throw new AppError('Payment has no refundable balance', 400);
      }

      const requestedAmount = input.amount == null ? remaining : roundMoney(Number(input.amount));
      if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
        throw new AppError('Refund amount must be greater than zero', 400);
      }
      if (requestedAmount - remaining > 0.0001) {
        throw new AppError('Refund amount exceeds refundable balance', 400);
      }

      const type = requestedAmount === remaining ? 'FULL' : 'PARTIAL';
      const provider = getPaymentProvider(payment.provider);

      if (!provider.supportsRefunds || typeof provider.refund !== 'function') {
        // Honest unsupported-provider result (do not pretend refund occurred)
        const unsupported = await Refund.create({
          paymentId: payment._id,
          bookingId: payment.bookingId,
          customerId: payment.customerId,
          supplierId: payment.supplierId,
          amount: requestedAmount,
          currency: payment.currency,
          reason: String(input.reason).trim(),
          status: RefundStatus.FAILED,
          type,
          provider: payment.provider,
          idempotencyKey: input.idempotencyKey,
          requestedBy: actor.userId,
          requestedByRole: actor.role,
          processedAt: new Date(),
          failureReason: 'Refunds are not supported by the configured payment provider',
        } as any);
        return unsupported;
      }

      const refund = await Refund.create({
        paymentId: payment._id,
        bookingId: payment.bookingId,
        customerId: payment.customerId,
        supplierId: payment.supplierId,
        amount: requestedAmount,
        currency: payment.currency,
        reason: String(input.reason).trim(),
        status: RefundStatus.PROCESSING,
        type,
        provider: payment.provider,
        idempotencyKey: input.idempotencyKey,
        requestedBy: actor.userId,
        requestedByRole: actor.role,
      } as any);

      try {
        const result = await provider.refund({
          payment: payment as any,
          amount: requestedAmount,
          currency: payment.currency,
          reason: String(input.reason).trim(),
          idempotencyKey: input.idempotencyKey,
        });

        if (!result.supported || result.status === 'unsupported') {
          refund.status = RefundStatus.FAILED;
          refund.failureReason = result.failureReason || 'Refunds are not supported by the configured payment provider';
          refund.processedAt = new Date();
          await refund.save();
          return refund;
        }

        if (result.status === 'succeeded') {
          refund.status = RefundStatus.SUCCEEDED;
          refund.providerRefundReference = result.providerRefundReference;
          refund.processedAt = new Date();
          refund.failureReason = undefined;
          await refund.save();

          // Recompute total refunded from succeeded refunds to stay consistent/retry-safe
          const succeededNow = await Refund.aggregate([
            { $match: { paymentId: payment._id, status: RefundStatus.SUCCEEDED } },
            { $group: { _id: '$paymentId', total: { $sum: '$amount' } } },
          ]).exec();
          const totalRefunded = roundMoney(succeededNow[0]?.total ?? 0);
          payment.refundAmount = totalRefunded;
          payment.status = totalRefunded >= roundMoney(payment.amount) ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
          await payment.save();

          const booking = await Booking.findById(payment.bookingId).exec();
          if (booking) {
            (booking as any).paymentStatus = payment.status;
            await booking.save();
          }

          try {
            const { settlementService } = await import('./settlement.service.js');
            await settlementService.reconcileForPayment(payment._id.toString(), 'refund_succeeded');
          } catch {
            // best-effort; reconciliation endpoints can recover
          }

          return refund;
        }

        if (result.status === 'failed') {
          refund.status = RefundStatus.FAILED;
          refund.failureReason = result.failureReason || 'Provider refund failed';
          refund.processedAt = new Date();
          await refund.save();
          return refund;
        }

        // pending/unknown provider result: keep processing (can be reconciled later)
        refund.status = RefundStatus.PROCESSING;
        if (result.providerRefundReference) refund.providerRefundReference = result.providerRefundReference;
        await refund.save();
        return refund;
      } catch (err: any) {
        refund.status = RefundStatus.FAILED;
        refund.failureReason = err?.message || 'Provider refund processing failed';
        refund.processedAt = new Date();
        await refund.save();
        return refund;
      }
    });
  },

  async listRefunds(actor: { userId: string; role: string }, paymentId?: string) {
    if (actor.role === 'ADMIN') {
      const filter: any = {};
      if (paymentId) filter.paymentId = paymentId;
      return Refund.find(filter).sort({ createdAt: -1 }).exec();
    }
    if (actor.role === 'CUSTOMER') {
      if (paymentId) {
        const payment = await Payment.findById(paymentId).exec();
        if (!payment) throw new AppError('Payment not found', 404);
        if (payment.customerId.toString() !== actor.userId) {
          throw new AppError('Forbidden: payment access denied', 403);
        }
        return Refund.find({ paymentId } as any).sort({ createdAt: -1 }).exec();
      }
      return Refund.find({ customerId: actor.userId } as any).sort({ createdAt: -1 }).exec();
    }
    throw new AppError('Forbidden: insufficient permissions', 403);
  },

  async getRefund(actor: { userId: string; role: string }, refundId: string) {
    const refund = await Refund.findById(refundId).exec();
    if (!refund) throw new AppError('Refund not found', 404);
    if (actor.role === 'ADMIN') return refund;
    if (actor.role === 'CUSTOMER' && refund.customerId.toString() === actor.userId) return refund;
    throw new AppError('Forbidden: refund access denied', 403);
  },

  async getRefundByIdempotency(actor: { userId: string; role: string }, paymentId: string, idempotencyKey: string) {
    const payment = await Payment.findById(paymentId).exec();
    if (!payment) throw new AppError('Payment not found', 404);
    if (actor.role === 'CUSTOMER' && payment.customerId.toString() !== actor.userId) {
      throw new AppError('Forbidden: payment access denied', 403);
    }
    if (actor.role !== 'CUSTOMER' && actor.role !== 'ADMIN') {
      throw new AppError('Forbidden: insufficient permissions', 403);
    }
    const refund = await Refund.findOne({ paymentId, idempotencyKey } as any).exec();
    if (!refund) throw new AppError('Refund not found', 404);
    return refund;
  },
};

export type RefundService = typeof refundService;