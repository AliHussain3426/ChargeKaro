import { Schema, model, type Document, Types } from 'mongoose';

export enum RefundStatus {
  REQUESTED = 'REQUESTED',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED',
}

const refundSchema = new Schema(
  {
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'SupplierProfile', required: true, index: true },
    amount: { type: Number, required: true, min: [0.01, 'Refund amount must be positive'] },
    currency: { type: String, default: 'PKR' },
    reason: { type: String, trim: true, required: true },
    status: { type: String, enum: Object.values(RefundStatus), default: RefundStatus.REQUESTED, index: true },
    type: { type: String, enum: ['FULL', 'PARTIAL'], required: true },
    provider: { type: String, required: true, trim: true },
    providerRefundReference: { type: String, trim: true },
    idempotencyKey: { type: String, trim: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requestedByRole: { type: String, enum: ['CUSTOMER', 'ADMIN'], required: true },
    processedAt: { type: Date },
    failureReason: { type: String, trim: true },
  },
  { timestamps: true }
);

refundSchema.index({ paymentId: 1, status: 1, createdAt: -1 });
refundSchema.index(
  { paymentId: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } }
);
refundSchema.index(
  { provider: 1, providerRefundReference: 1 },
  { unique: true, partialFilterExpression: { providerRefundReference: { $type: 'string' } } }
);

export interface RefundDocument extends Document {
  paymentId: Types.ObjectId;
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  supplierId: Types.ObjectId;
  amount: number;
  currency: string;
  reason: string;
  status: RefundStatus;
  type: 'FULL' | 'PARTIAL';
  provider: string;
  providerRefundReference?: string;
  idempotencyKey?: string;
  requestedBy: Types.ObjectId;
  requestedByRole: 'CUSTOMER' | 'ADMIN';
  processedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const Refund = model<RefundDocument>('Refund', refundSchema);