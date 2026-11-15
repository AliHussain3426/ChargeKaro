import { Schema, model, type Document } from 'mongoose';
import { PaymentStatus, PricingType } from '../../types/index.js';

/**
 * Payment module
 *
 * Phase 1 foundation: financial transaction records linked to a booking,
 * with provider references and status tracking.
 */

const paymentSchema = new Schema(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
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
    },
    provider: {
      type: String,
      required: true,
    },
    providerReference: {
      type: String,
      required: true,
      unique: true,
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
paymentSchema.index({ providerReference: 1 }, { unique: true });

export interface Payment extends Document {
  bookingId: Schema.Types.ObjectId;
  customerId: Schema.Types.ObjectId;
  supplierId: Schema.Types.ObjectId;
  provider: string;
  providerReference: string;
  amount: number;
  currency: string;
  billingType: string;
  status: PaymentStatus;
  refundAmount?: number;
}

export const Payment = model<Payment>('Payment', paymentSchema);
