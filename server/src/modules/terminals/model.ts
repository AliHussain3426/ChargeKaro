import { Schema, model, type Document } from 'mongoose';
import { PricingType, TerminalStatus } from '../../types/index.js';

/**
 * Terminal module
 *
 * Phase 1 foundation: individual charging units that belong to a station,
 * with connector, power, pricing, availability, and operational status.
 */

const pricingSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: [0, 'Pricing amount cannot be negative'],
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

const terminalSchema = new Schema(
  {
    stationId: {
      type: Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    chargingMethod: {
      type: String,
      default: 'AC',
    },
    connectorTypes: {
      type: [String],
      default: [],
    },
    maximumPowerKw: {
      type: Number,
      required: true,
      min: [0, 'Maximum charging power cannot be negative'],
    },
    capacity: {
      type: Number,
      default: 1,
      min: [1, 'Terminal capacity must be at least 1'],
    },
    pricing: {
      type: pricingSchema,
      required: true,
    },
    status: {
      type: String,
      enum: TerminalStatus,
      default: TerminalStatus.AVAILABLE,
    },
    availability: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

terminalSchema.index({ stationId: 1, status: 1 });
terminalSchema.index({ status: 1, availability: 1 });

export interface Terminal extends Document {
  stationId: Schema.Types.ObjectId;
  name: string;
  chargingMethod: string;
  connectorTypes: string[];
  maximumPowerKw: number;
  capacity: number;
  pricing: {
    amount: number;
    currency: string;
    billingType: string;
  };
  status: TerminalStatus;
  availability: boolean;
}

export const Terminal = model<Terminal>('Terminal', terminalSchema);
