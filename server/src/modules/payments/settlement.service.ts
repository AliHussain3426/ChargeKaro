import crypto from 'crypto';
import { Types } from 'mongoose';
import { Settlement, SettlementStatus } from './settlement.model.js';
import { Payout, PayoutStatus } from './payout.model.js';
import { Payment } from './model.js';
import { Refund, RefundStatus } from './refund.model.js';
import { SupplierProfile } from '../auth/model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { PaymentStatus } from '../../types/index.js';
import { env } from '../../config/env.js';

const settlementLocks = new Map<string, Promise<void>>();
const supplierReconcileLocks = new Map<string, Promise<void>>();

async function withLock<T>(map: Map<string, Promise<void>>, key: string, fn: () => Promise<T>): Promise<T> {
  const previous = map.get(key) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => { release = resolve; });
  map.set(key, previous.then(() => current));
  await previous;
  try {
    return await fn();
  } finally {
    release();
    if (map.get(key) === current) map.delete(key);
  }
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getCommissionRate(): number {
  const rate = Number(env.PLATFORM_COMMISSION_RATE);
  if (!Number.isFinite(rate) || rate < 0 || rate > 1) return 0.1;
  return rate;
}

async function requireSupplierProfileByUser(userId: string) {
  const profile = await SupplierProfile.findOne({ user: userId } as any).exec();
  if (!profile) throw new AppError('Supplier profile not found', 404);
  return profile as any;
}

function settlementPeriod(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function computeSettlementAmounts(input: {
  grossAmount: number;
  succeededRefundAmount: number;
  platformFeeRate: number;
  otherDeductions?: number;
}) {
  const grossAmount = roundMoney(Math.max(0, input.grossAmount));
  const refundDeduction = roundMoney(Math.min(grossAmount, Math.max(0, input.succeededRefundAmount)));
  const otherDeductions = roundMoney(Math.max(0, input.otherDeductions ?? 0));
  // Fee applied to retained amount (gross - refunds) to avoid negative balances when policy is pending.
  const retained = roundMoney(Math.max(0, grossAmount - refundDeduction));
  const platformFee = roundMoney(retained * input.platformFeeRate);
  const netPayable = roundMoney(Math.max(0, retained - platformFee - otherDeductions));
  return { grossAmount, platformFee, refundDeduction, otherDeductions, netPayable, platformFeeRate: input.platformFeeRate };
}

async function getSucceededRefundTotal(paymentId: Types.ObjectId | string): Promise<number> {
  const agg = await Refund.aggregate([
    { $match: { paymentId: new Types.ObjectId(paymentId.toString()), status: RefundStatus.SUCCEEDED } },
    { $group: { _id: '$paymentId', total: { $sum: '$amount' } } },
  ]).exec();
  return roundMoney(agg[0]?.total ?? 0);
}

function isEligiblePayment(payment: any): boolean {
  return [PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED].includes(payment.status);
}

async function reconcilePaymentSettlement(paymentId: string, reason = 'reconcile') {
  return withLock(settlementLocks, paymentId, async () => {
    const payment = await Payment.findById(paymentId).exec();
    if (!payment) throw new AppError('Payment not found', 404);
    if (!isEligiblePayment(payment)) return null;

    const succeededRefundAmount = await getSucceededRefundTotal(payment._id);
    const rate = getCommissionRate();
    const amounts = computeSettlementAmounts({ grossAmount: payment.amount, succeededRefundAmount, platformFeeRate: rate });

    let settlement = await Settlement.findOne({ paymentId: payment._id } as any).exec();
    const now = new Date();
    if (!settlement) {
      settlement = await Settlement.create({
        supplierId: payment.supplierId,
        paymentId: payment._id,
        bookingId: payment.bookingId,
        currency: payment.currency || env.PAYMENT_CURRENCY || 'PKR',
        ...amounts,
        status: SettlementStatus.CALCULATED,
        settlementPeriod: settlementPeriod(payment.processedAt || payment.createdAt || now),
        adjustments: [{
          at: now,
          reason,
          grossAmount: amounts.grossAmount,
          platformFee: amounts.platformFee,
          refundDeduction: amounts.refundDeduction,
          otherDeductions: amounts.otherDeductions,
          netPayable: amounts.netPayable,
          note: 'Initial settlement calculation',
        }],
      } as any);
      return settlement;
    }

    const changed = settlement.grossAmount !== amounts.grossAmount
      || settlement.platformFee !== amounts.platformFee
      || settlement.refundDeduction !== amounts.refundDeduction
      || settlement.otherDeductions !== amounts.otherDeductions
      || settlement.netPayable !== amounts.netPayable
      || settlement.platformFeeRate !== amounts.platformFeeRate;

    if (!changed) return settlement;

    // If already in payout flow/paid, record adjustment but do not destructively alter settled facts except auditable recalculation.
    settlement.grossAmount = amounts.grossAmount;
    settlement.platformFee = amounts.platformFee;
    settlement.refundDeduction = amounts.refundDeduction;
    settlement.otherDeductions = amounts.otherDeductions;
    settlement.netPayable = amounts.netPayable;
    settlement.platformFeeRate = amounts.platformFeeRate;
    settlement.adjustments = [
      ...(settlement.adjustments || []),
      {
        at: now,
        reason,
        grossAmount: amounts.grossAmount,
        platformFee: amounts.platformFee,
        refundDeduction: amounts.refundDeduction,
        otherDeductions: amounts.otherDeductions,
        netPayable: amounts.netPayable,
        note: settlement.status === SettlementStatus.PAID ? 'Post-payout adjustment recorded (manual review may be required)' : 'Recalculated',
      },
    ];
    await settlement.save();
    return settlement;
  });
}

export const settlementService = {
  computeSettlementAmounts,

  async reconcileForPayment(paymentId: string, reason?: string) {
    return reconcilePaymentSettlement(paymentId, reason ?? 'reconcile');
  },

  async reconcileForSupplier(supplierProfileId: string) {
    return withLock(supplierReconcileLocks, supplierProfileId, async () => {
      const payments = await Payment.find({
        supplierId: supplierProfileId,
        status: { $in: [PaymentStatus.PAID, PaymentStatus.PARTIALLY_REFUNDED, PaymentStatus.REFUNDED] },
      } as any).select('_id').exec();
      const results = [];
      for (const p of payments) {
        const s = await reconcilePaymentSettlement(p._id.toString(), 'supplier_reconcile');
        if (s) results.push(s);
      }
      return results;
    });
  },

  async listForSupplierUser(userId: string) {
    const profile = await requireSupplierProfileByUser(userId);
    await this.reconcileForSupplier(profile._id.toString());
    const settlements = await Settlement.find({ supplierId: profile._id } as any)
      .sort({ createdAt: -1 })
      .populate({ path: 'paymentId', select: 'provider providerReference amount status refundAmount currency processedAt createdAt' })
      .populate({ path: 'bookingId', select: 'bookingReference status paymentStatus requestedStartTime requestedEndTime' })
      .exec();
    return settlements;
  },

  async getSupplierBalance(userId: string) {
    const profile = await requireSupplierProfileByUser(userId);
    await this.reconcileForSupplier(profile._id.toString());
    const settlements = await Settlement.find({ supplierId: profile._id } as any).exec();
    const sum = (statuses: SettlementStatus[]) => roundMoney(settlements.filter(s => statuses.includes(s.status as SettlementStatus)).reduce((acc, s) => acc + (s.netPayable || 0), 0));
    const gross = roundMoney(settlements.reduce((acc, s) => acc + (s.grossAmount || 0), 0));
    const platformFees = roundMoney(settlements.reduce((acc, s) => acc + (s.platformFee || 0), 0));
    const refundDeductions = roundMoney(settlements.reduce((acc, s) => acc + (s.refundDeduction || 0), 0));
    const netPayable = roundMoney(settlements.reduce((acc, s) => acc + (s.netPayable || 0), 0));
    return {
      supplierId: profile._id.toString(),
      currency: settlements[0]?.currency ?? env.PAYMENT_CURRENCY ?? 'PKR',
      gross,
      platformFees,
      refundDeductions,
      netPayable,
      availableForPayout: sum([SettlementStatus.CALCULATED, SettlementStatus.APPROVED]),
      inProcessing: sum([SettlementStatus.PROCESSING]),
      paidOut: sum([SettlementStatus.PAID]),
      pendingOrFailed: sum([SettlementStatus.PENDING, SettlementStatus.FAILED, SettlementStatus.CANCELLED]),
      settlementCount: settlements.length,
      commissionRate: getCommissionRate(),
      commissionPolicyNote: 'Platform commission rate is configurable (PLATFORM_COMMISSION_RATE / system settings). Final payout/commission policy pending SRS confirmation.',
    };
  },

  async adminListSettlements() {
    const settlements = await Settlement.find({})
      .sort({ createdAt: -1 })
      .populate({ path: 'supplierId', select: 'businessName user verificationStatus' })
      .populate({ path: 'paymentId', select: 'provider providerReference amount status refundAmount currency processedAt' })
      .populate({ path: 'bookingId', select: 'bookingReference status paymentStatus' })
      .exec();
    return settlements;
  },

  async adminGetSettlement(settlementId: string) {
    const settlement = await Settlement.findById(settlementId)
      .populate({ path: 'supplierId', select: 'businessName user verificationStatus' })
      .populate({ path: 'paymentId', select: 'provider providerReference amount status refundAmount currency processedAt createdAt' })
      .populate({ path: 'bookingId', select: 'bookingReference status paymentStatus requestedStartTime requestedEndTime' })
      .populate({ path: 'payoutId' })
      .exec();
    if (!settlement) throw new AppError('Settlement not found', 404);
    return settlement;
  },

  async adminApproveSettlement(settlementId: string, actorUserId: string, note?: string) {
    const settlement = await Settlement.findById(settlementId).exec();
    if (!settlement) throw new AppError('Settlement not found', 404);
    if (![SettlementStatus.CALCULATED, SettlementStatus.PENDING].includes(settlement.status as SettlementStatus)) {
      throw new AppError('Invalid settlement transition', 400);
    }
    settlement.status = SettlementStatus.APPROVED;
    if (note) settlement.notes = note;
    settlement.adjustments = [...(settlement.adjustments || []), {
      at: new Date(), reason: 'approved', grossAmount: settlement.grossAmount, platformFee: settlement.platformFee,
      refundDeduction: settlement.refundDeduction, otherDeductions: settlement.otherDeductions, netPayable: settlement.netPayable, note: note || `Approved by ${actorUserId}`
    }];
    await settlement.save();
    return settlement;
  },

  async adminCreatePayout(supplierProfileId: string, actorUserId: string, settlementIds?: string[]) {
    const filter: any = { supplierId: supplierProfileId, status: SettlementStatus.APPROVED };
    if (settlementIds && settlementIds.length > 0) filter._id = { $in: settlementIds };
    const settlements = await Settlement.find(filter).exec();
    if (settlements.length === 0) throw new AppError('No approved settlements available for payout', 400);
    const currency = settlements[0].currency || env.PAYMENT_CURRENCY || 'PKR';
    if (settlements.some(s => s.currency !== currency)) throw new AppError('Mixed-currency payouts are not supported', 400);
    const amount = roundMoney(settlements.reduce((sum, s) => sum + (s.netPayable || 0), 0));
    const payout = await Payout.create({
      supplierId: supplierProfileId,
      settlementIds: settlements.map(s => s._id),
      currency,
      amount,
      status: PayoutStatus.PENDING,
      provider: 'manual',
      payoutReference: `payout_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`,
      statusHistory: [{ status: PayoutStatus.PENDING, at: new Date(), by: new Types.ObjectId(actorUserId), note: 'Payout record created (internal/manual workflow)' }],
    } as any);

    await Settlement.updateMany(
      { _id: { $in: settlements.map(s => s._id) } } as any,
      { $set: { status: SettlementStatus.PROCESSING, payoutId: payout._id } } as any
    ).exec();
    payout.status = PayoutStatus.PROCESSING;
    payout.statusHistory.push({ status: PayoutStatus.PROCESSING, at: new Date(), by: new Types.ObjectId(actorUserId), note: 'Linked settlements moved to processing (no bank transfer executed)' });
    await payout.save();
    return payout;
  },

  async adminUpdatePayoutStatus(payoutId: string, actorUserId: string, status: PayoutStatus, note?: string) {
    const payout = await Payout.findById(payoutId).exec();
    if (!payout) throw new AppError('Payout not found', 404);

    const allowed: Record<string, PayoutStatus[]> = {
      [PayoutStatus.PENDING]: [PayoutStatus.PROCESSING, PayoutStatus.CANCELLED],
      [PayoutStatus.PROCESSING]: [PayoutStatus.APPROVED, PayoutStatus.FAILED, PayoutStatus.CANCELLED],
      [PayoutStatus.APPROVED]: [PayoutStatus.PROCESSING, PayoutStatus.FAILED, PayoutStatus.CANCELLED],
      [PayoutStatus.FAILED]: [PayoutStatus.PROCESSING, PayoutStatus.CANCELLED],
      [PayoutStatus.PAID]: [],
      [PayoutStatus.CANCELLED]: [],
    };
    if (!allowed[payout.status]?.includes(status)) {
      throw new AppError('Invalid payout status transition', 400);
    }
    if (status === PayoutStatus.PAID) {
      throw new AppError('Payout cannot be marked PAID without verified external payout/provider confirmation. Use manual processing states or integrate a payout provider.', 400);
    }

    payout.status = status;
    if (status === PayoutStatus.FAILED) payout.failureReason = note || 'Payout processing failed';
    if (status === PayoutStatus.APPROVED) { payout.approvedBy = new Types.ObjectId(actorUserId); payout.approvedAt = new Date(); }
    payout.statusHistory.push({ status, at: new Date(), by: new Types.ObjectId(actorUserId), note });
    await payout.save();

    if (status === PayoutStatus.CANCELLED || status === PayoutStatus.FAILED) {
      await Settlement.updateMany({ payoutId: payout._id } as any, { $set: { status: SettlementStatus.APPROVED }, $unset: { payoutId: '' } } as any).exec();
    }
    return payout;
  },

  async adminListPayouts(supplierProfileId?: string) {
    const filter: any = {};
    if (supplierProfileId) filter.supplierId = supplierProfileId;
    return Payout.find(filter).sort({ createdAt: -1 }).populate({ path: 'supplierId', select: 'businessName user' }).exec();
  },

  async supplierListPayouts(userId: string) {
    const profile = await requireSupplierProfileByUser(userId);
    return Payout.find({ supplierId: profile._id } as any).sort({ createdAt: -1 }).exec();
  },
};

export type SettlementService = typeof settlementService;