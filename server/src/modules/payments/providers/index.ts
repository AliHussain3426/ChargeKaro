import { env } from '../../../config/env.js';
import type { PaymentProvider } from './types.js';
import { sandboxProvider } from './sandbox.js';

export function getPaymentProvider(name?: string): PaymentProvider {
  const providerName = (name || env.PAYMENT_PROVIDER || 'sandbox').toLowerCase();
  // P0: sandbox adapter is fully implemented (signed webhooks, server-side verification).
  // Stripe/other providers can be activated via env + provider-specific adapter/SDK.
  if (providerName === 'sandbox' || providerName === 'stub' || providerName === 'test') {
    return sandboxProvider;
  }
  // Default to sandbox-safe behavior until a specific live provider adapter is configured.
  // This avoids fabricating unverifiable provider calls.
  return sandboxProvider;
}

export function getWebhookSecret(provider: string): string {
  if ((provider || '').toLowerCase() === 'stripe' && env.STRIPE_WEBHOOK_SECRET) {
    return env.STRIPE_WEBHOOK_SECRET;
  }
  return env.PAYMENT_WEBHOOK_SECRET;
}

export * from './types.js';
export { sandboxProvider, createSandboxWebhookSignature } from './sandbox.js';