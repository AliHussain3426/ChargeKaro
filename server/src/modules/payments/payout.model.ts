import { Schema, model, type Document, Types } from 'mongoose';

export enum PayoutStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PROCESSING = 'PROCESSING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface PayoutStatusHistory {
  status: PayoutStatus;
  at: Date;
  by?: Types.ObjectId;
  note?: string;
}

const payoutHistorySchema = new Schema<PayoutStatusHistory>(
  {
    status: { type: String, enum: Object.values(PayoutStatus), required: true },
    at: { type: Date, required: true },
    by: { type: Schema.Types.ObjectId, ref: 'User' },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const payoutSchema = new Schema(
  {
    supplierId: { type: Schema.Types.ObjectId, ref: 'SupplierProfile', required: true, index: true },
    settlementIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Settlement' }], default: [] },
    currency: { type: String, required: true, default: 'PKR' },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(PayoutStatus), default: PayoutStatus.PENDING, index: true },
    payoutReference: { type: String, trim: true, unique: true, sparse: true },
    provider: { type: String, trim: true, default: 'manual' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    processedAt: { type: Date },
    failureReason: { type: String, trim: true },
    notes: { type: String, trim: true },
    statusHistory: { type: [payoutHistorySchema], default: [] },
  },
  { timestamps: true }
);

payoutSchema.index({ supplierId: 1, status: 1, createdAt: -1 });

export interface PayoutDocument extends Document {
  supplierId: Types.ObjectId;
  settlementIds: Types.ObjectId[];
  currency: string;
  amount: number;
  status: PayoutStatus;
  payoutReference?: string;
  provider: string;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  processedAt?: Date;
  failureReason?: string;
  notes?: string;
  statusHistory: PayoutStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
}

export const Payout = model<PayoutDocument>('Payout', payoutSchema);