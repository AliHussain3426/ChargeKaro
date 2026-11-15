import { Schema, model, type Document, Types } from 'mongoose';
import { PaymentStatus, PricingType } from '../../types/index.js';

/**
 * Payment module
 *
 * Records payment attempts/transactions for bookings. Webhook-ready via
 * provider/providerReference uniqueness and idempotent processing helpers.
 */

const paymentSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'SupplierProfile',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      default: 'stub',
      trim: true,
    },
    providerReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Payment amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'PKR',
    },
    billingType: {
      type: String,
      enum: PricingType,
      default: PricingType.PER_KWH,
    },
    status: {
      type: String,
      enum: PaymentStatus,
      default: PaymentStatus.UNPAID,
      index: true,
    },
    failureReason: {
      type: String,
      trim: true,
    },
    processedAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ bookingId: 1, status: 1 });
paymentSchema.index({ supplierId: 1, status: 1, createdAt: -1 });
paymentSchema.index({ provider: 1, providerReference: 1 }, { unique: true });

export interface PaymentDocument extends Document {
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  supplierId: Types.ObjectId;
  provider: string;
  providerReference: string;
  idempotencyKey?: string;
  amount: number;
  currency: string;
  billingType: string;
  status: PaymentStatus;
  failureReason?: string;
  processedAt?: Date;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export const Payment = model<PaymentDocument>('Payment', paymentSchema);
