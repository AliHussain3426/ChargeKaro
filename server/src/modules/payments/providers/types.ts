import type { PaymentDocument } from '../model.js';

export type NormalizedWebhookOutcome = 'success' | 'failed' | 'pending' | 'ignored';

export interface ProviderInitiationResult {
  provider: string;
  providerReference: string;
  providerSessionId?: string;
  checkoutUrl?: string;
  status?: 'processing' | 'requires_action' | 'unpaid';
  metadata?: Record<string, unknown>;
}

export interface ProviderWebhookEvent {
  provider: string;
  eventId: string;
  eventType?: string;
  providerReference?: string;
  bookingId?: string;
  outcome: NormalizedWebhookOutcome;
  reason?: string;
  raw?: unknown;
}

export interface ProviderRefundRequest {
  payment: PaymentDocument;
  amount: number;
  currency: string;
  reason?: string;
  idempotencyKey?: string;
}

export interface ProviderRefundResult {
  supported: boolean;
  status: 'succeeded' | 'failed' | 'pending' | 'unsupported';
  providerRefundReference?: string;
  failureReason?: string;
}

export interface PaymentProvider {
  name: string;
  initiate(payment: PaymentDocument, context: { booking: any; clientUrl: string }): Promise<ProviderInitiationResult>;
  verifyPayment(payment: PaymentDocument): Promise<{ status: 'paid' | 'failed' | 'processing' | 'unpaid'; reason?: string }>;
  verifyAndParseWebhook(args: {
    rawBody: Buffer;
    headers: Record<string, string | string[] | undefined>;
    body: any;
    secret: string;
  }): Promise<ProviderWebhookEvent>;
  refund?(request: ProviderRefundRequest): Promise<ProviderRefundResult>;
  supportsRefunds?: boolean;
}