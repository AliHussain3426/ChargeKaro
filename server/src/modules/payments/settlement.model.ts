import { Schema, model, type Document, Types } from 'mongoose';

export enum SettlementStatus {
  PENDING = 'PENDING',
  CALCULATED = 'CALCULATED',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface SettlementAdjustment {
  at: Date;
  reason: string;
  grossAmount: number;
  platformFee: number;
  refundDeduction: number;
  otherDeductions: number;
  netPayable: number;
  note?: string;
}

const adjustmentSchema = new Schema<SettlementAdjustment>(
  {
    at: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    grossAmount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    refundDeduction: { type: Number, required: true },
    otherDeductions: { type: Number, required: true },
    netPayable: { type: Number, required: true },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const settlementSchema = new Schema(
  {
    supplierId: { type: Schema.Types.ObjectId, ref: 'SupplierProfile', required: true, index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true, unique: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    currency: { type: String, required: true, default: 'PKR' },
    grossAmount: { type: Number, required: true, min: 0 },
    platformFeeRate: { type: Number, required: true, min: 0, max: 1 },
    platformFee: { type: Number, required: true, min: 0 },
    refundDeduction: { type: Number, required: true, min: 0, default: 0 },
    otherDeductions: { type: Number, required: true, min: 0, default: 0 },
    netPayable: { type: Number, required: true },
    status: { type: String, enum: Object.values(SettlementStatus), default: SettlementStatus.CALCULATED, index: true },
    settlementPeriod: { type: String, trim: true },
    payoutId: { type: Schema.Types.ObjectId, ref: 'Payout' },
    processedAt: { type: Date },
    notes: { type: String, trim: true },
    adjustments: { type: [adjustmentSchema], default: [] },
  },
  { timestamps: true }
);

settlementSchema.index({ supplierId: 1, status: 1, createdAt: -1 });

export interface SettlementDocument extends Document {
  supplierId: Types.ObjectId;
  paymentId: Types.ObjectId;
  bookingId: Types.ObjectId;
  currency: string;
  grossAmount: number;
  platformFeeRate: number;
  platformFee: number;
  refundDeduction: number;
  otherDeductions: number;
  netPayable: number;
  status: SettlementStatus;
  settlementPeriod?: string;
  payoutId?: Types.ObjectId;
  processedAt?: Date;
  notes?: string;
  adjustments: SettlementAdjustment[];
  createdAt: Date;
  updatedAt: Date;
}

export const Settlement = model<SettlementDocument>('Settlement', settlementSchema);