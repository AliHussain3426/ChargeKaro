import { Schema, model, type Document } from 'mongoose';
import { VehicleCategory } from '../../types/index.js';

/**
 * Vehicle module
 *
 * Phase 1 foundation: customer-owned vehicle records with battery and
 * charging connector specifications used for compatibility checks and
 * station recommendations.
 */

// Note: the vehicle schema declares a `model` field (vehicle model name), but
// Mongoose 9's base Document type already exposes a conflicting `model` member,
// so it is intentionally not redeclared on this interface.

const vehicleSchema = new Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleCategory: {
      type: String,
      enum: VehicleCategory,
      required: true,
    },
    modelYear: {
      type: Number,
      min: [1980, 'Model year must be 1980 or later'],
    },
    batteryCapacityKwh: {
      type: Number,
      min: [0, 'Battery capacity cannot be negative'],
    },
    connectorTypes: {
      type: [String],
      default: [],
    },
    maximumChargingPowerKw: {
      type: Number,
      min: [0, 'Maximum charging power cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

vehicleSchema.index({ customerId: 1, createdAt: -1 });

export interface Vehicle extends Document {
  customerId: Schema.Types.ObjectId;
  manufacturer: string;
  vehicleCategory: VehicleCategory;
  modelYear?: number;
  batteryCapacityKwh?: number;
  connectorTypes: string[];
  maximumChargingPowerKw?: number;
}

export const Vehicle = model<Vehicle>('Vehicle', vehicleSchema);
