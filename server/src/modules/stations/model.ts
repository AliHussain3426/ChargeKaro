import { Schema, model, type Document } from 'mongoose';
import { PricingType, StationStatus } from '../../types/index.js';

/**
 * Station module
 *
 * Phase 1 foundation: supplier-owned charging stations with GeoJSON point
 * coordinates, pricing, and operating hours.
 */

const geoJsonPointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (value: unknown): boolean => {
          if (!Array.isArray(value) || value.length !== 2) {
            return false;
          }
          const [longitude, latitude] = value.map((entry) => Number(entry));
          if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
            return false;
          }
          if (longitude < -180 || longitude > 180) {
            return false;
          }
          if (latitude < -90 || latitude > 90) {
            return false;
          }
          return true;
        },
        message:
          'Station location must be a valid GeoJSON point as [longitude, latitude].',
      },
    },
  },
  { _id: false }
);

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

const operatingHoursSchema = new Schema(
  {
    timezone: {
      type: String,
      default: 'Asia/Karachi',
    },
    opensAt: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Opening time must be a valid HH:mm value'],
    },
    closesAt: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'Closing time must be a valid HH:mm value'],
    },
  },
  { _id: false }
);

const stationSchema = new Schema(
  {
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: 'SupplierProfile',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    province: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      default: 'Pakistan',
    },
    location: {
      type: geoJsonPointSchema,
      required: true,
    },
    pricing: {
      type: pricingSchema,
      required: true,
    },
    operatingHours: {
      type: operatingHoursSchema,
      required: true,
    },
    status: {
      type: String,
      enum: StationStatus,
      default: StationStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

stationSchema.index({ location: '2dsphere' });
stationSchema.index({ supplierId: 1, createdAt: -1 });

export interface Station extends Document {
  supplierId: Schema.Types.ObjectId;
  name: string;
  description?: string;
  address: string;
  city?: string;
  province?: string;
  country: string;
  location: {
    type: string;
    coordinates: number[];
  };
  pricing: {
    amount: number;
    currency: string;
    billingType: string;
  };
  operatingHours: {
    timezone: string;
    opensAt: string;
    closesAt: string;
  };
  status: StationStatus;
}

export const Station = model<Station>('Station', stationSchema);
