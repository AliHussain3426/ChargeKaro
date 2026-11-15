import { Schema, model, type Document } from 'mongoose';

const paymentWebhookEventSchema = new Schema(
  {
    provider: { type: String, required: true, trim: true, index: true },
    eventId: { type: String, required: true, trim: true },
    providerReference: { type: String, trim: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    outcome: { type: String, trim: true },
    payloadHash: { type: String, trim: true },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

paymentWebhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

export interface PaymentWebhookEventDocument extends Document {
  provider: string;
  eventId: string;
  providerReference?: string;
  paymentId?: Schema.Types.ObjectId;
  outcome?: string;
  payloadHash?: string;
  processedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const PaymentWebhookEvent = model<PaymentWebhookEventDocument>('PaymentWebhookEvent', paymentWebhookEventSchema);