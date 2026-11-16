import { Schema, model, type Document, Types } from 'mongoose';

export enum ChargingSessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export enum ChargingSessionPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

const chargingSessionSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    stationId: { type: Schema.Types.ObjectId, ref: 'Station', required: true },
    terminalId: { type: Schema.Types.ObjectId, ref: 'Terminal' },
    supplierId: { type: Schema.Types.ObjectId, ref: 'SupplierProfile', required: true, index: true },
    initialSocPercent: { type: Number, required: true, min: 0, max: 100 },
    finalSocPercent: { type: Number, min: 0, max: 100 },
    sessionStartTime: { type: Date, required: true },
    sessionCompletionTime: { type: Date },
    status: { type: String, enum: Object.values(ChargingSessionStatus), default: ChargingSessionStatus.ACTIVE, index: true },
    batteryCapacityKwhSnapshot: { type: Number, required: true, min: 0 },
    stationRatePkrPerKwhSnapshot: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'PKR' },
    energyConsumedKwh: { type: Number, min: 0 },
    totalPricePkr: { type: Number, min: 0 },
    paymentStatus: { type: String, enum: Object.values(ChargingSessionPaymentStatus), default: ChargingSessionPaymentStatus.PENDING },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
  },
  { timestamps: true }
);

chargingSessionSchema.index({ bookingId: 1, status: 1 });
chargingSessionSchema.index({ stationId: 1, status: 1, createdAt: -1 });

export interface ChargingSessionDocument extends Document {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  stationId: Types.ObjectId;
  terminalId?: Types.ObjectId;
  supplierId: Types.ObjectId;
  initialSocPercent: number;
  finalSocPercent?: number;
  sessionStartTime: Date;
  sessionCompletionTime?: Date;
  status: ChargingSessionStatus;
  batteryCapacityKwhSnapshot: number;
  stationRatePkrPerKwhSnapshot: number;
  currency: string;
  energyConsumedKwh?: number;
  totalPricePkr?: number;
  paymentStatus: ChargingSessionPaymentStatus;
  paymentId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ChargingSession = model<ChargingSessionDocument>('ChargingSession', chargingSessionSchema);
