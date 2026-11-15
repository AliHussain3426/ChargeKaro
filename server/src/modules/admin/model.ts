import { Schema, model, type Document } from 'mongoose';

const systemSettingsSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
    },
    platformName: { type: String, default: 'GreenCharge Pakistan' },
    supportEmail: { type: String, default: 'support@greencharge.pk' },
    currency: { type: String, default: 'PKR' },
    advanceBookingWindowDays: { type: Number, default: 7 },
    cancellationWindowHours: { type: Number, default: 2 },
    platformCommissionPercent: { type: Number, default: 10 },
    bookingEscalationAlerts: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export interface SystemSettingsDocument extends Document {
  key: string;
  platformName: string;
  supportEmail: string;
  currency: string;
  advanceBookingWindowDays: number;
  cancellationWindowHours: number;
  platformCommissionPercent: number;
  bookingEscalationAlerts: boolean;
  maintenanceMode: boolean;
}

export const SystemSettings = model<SystemSettingsDocument>('SystemSettings', systemSettingsSchema);
