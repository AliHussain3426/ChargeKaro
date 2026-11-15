import { Schema, model, type Document } from 'mongoose';
import {
  BookingStatus,
  PaymentStatus,
  PricingType,
} from '../../types/index.js';

/**
 * Booking module
 *
 * Phase 1 foundation: charging booking requests with a status state machine
 * and a price snapshot captured at request time.
 */

const priceSnapshotSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: [0, 'Price snapshot amount cannot be negative'],
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
  },
  { _id: false }
);

const bookingSchema = new Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
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
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    stationId: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    terminalId: {
      type: Schema.Types.ObjectId,
      ref: 'Terminal',
      required: true,
    },
    requestedStartTime: {
      type: Date,
      required: true,
    },
    requestedEndTime: {
      type: Date,
      required: true,
    },
    priceSnapshot: {
      type: priceSnapshotSchema,
      required: true,
    },
    status: {
      type: String,
      enum: BookingStatus,
      default: BookingStatus.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: PaymentStatus,
      default: PaymentStatus.UNPAID,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ terminalId: 1, requestedStartTime: 1 });

export interface Booking extends Document {
  bookingReference: string;
  customerId: Schema.Types.ObjectId;
  supplierId: Schema.Types.ObjectId;
  vehicleId: Schema.Types.ObjectId;
  stationId: Schema.Types.ObjectId;
  terminalId: Schema.Types.ObjectId;
  requestedStartTime: Date;
  requestedEndTime: Date;
  priceSnapshot: {
    amount: number;
    currency: string;
    billingType: string;
  };
  status: BookingStatus;
  paymentStatus: PaymentStatus;
}

export const Booking = model<Booking>('Booking', bookingSchema);
