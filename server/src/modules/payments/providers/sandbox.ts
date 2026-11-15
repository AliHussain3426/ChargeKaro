import crypto from 'crypto';
import type { PaymentDocument } from '../model.js';
import type { PaymentProvider, ProviderInitiationResult, ProviderWebhookEvent, NormalizedWebhookOutcome, ProviderRefundResult } from './types.js';
import { AppError } from '../../../middleware/errorHandler.js';

function timingSafeEqualHex(a: string, b: string): boolean {
  try {
    const ab = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
  } catch {
    return false;
  }
}

function signPayload(rawBody: Buffer, secret: string): string {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

export function createSandboxWebhookSignature(rawBody: Buffer, secret: string, timestamp?: number): string {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  const sig = signPayload(Buffer.concat([Buffer.from(String(ts) + '.'), rawBody]), secret);
  return `t=${ts},v1=${sig}`;
}

export function parseSandboxSignatureHeader(header: string | undefined): { t?: number; v1?: string } {
  if (!header) return {};
  const parts = header.split(',').map((p) => p.trim());
  const out: { t?: number; v1?: string } = {};
  for (const part of parts) {
    const [k, v] = part.split('=');
    if (k === 't' && v) out.t = Number(v);
    if (k === 'v1' && v) out.v1 = v;
  }
  return out;
}

export const sandboxProvider: PaymentProvider = {
  name: 'sandbox',
  supportsRefunds: true,

  async initiate(payment: PaymentDocument, context): Promise<ProviderInitiationResult> {
    const providerReference = payment.providerReference;
    const sessionId = `sandbox_sess_${payment._id.toString()}`;
    const checkoutUrl = `${context.clientUrl.replace(/\/$/, '')}/customer/bookings?payment=sandbox&bookingId=${payment.bookingId.toString()}&ref=${encodeURIComponent(providerReference)}`;
    return {
      provider: 'sandbox',
      providerReference,
      providerSessionId: sessionId,
      checkoutUrl,
      status: 'processing',
      metadata: { sandbox: true },
    };
  },

  async verifyPayment(payment: PaymentDocument): Promise<{ status: 'paid' | 'failed' | 'processing' | 'unpaid'; reason?: string }> {
    // Sandbox/server-verified confirmation: trust the persisted, server-controlled payment state.
    // Frontend "success/failure" endpoints may request finalization, but state transitions are
    // validated/idempotent and only applied to legitimately initiated payments owned by the actor.
    if (payment.status === 'PAID' || payment.status === 'REFUNDED' || payment.status === 'PARTIALLY_REFUNDED') return { status: 'paid' };
    if (payment.status === 'FAILED') return { status: 'failed', reason: payment.failureReason };
    if (payment.status === 'PROCESSING') return { status: 'processing' };
    return { status: 'unpaid' };
  },

  async verifyAndParseWebhook(args): Promise<ProviderWebhookEvent> {
    const header = (args.headers['x-payment-signature'] ?? args.headers['X-Payment-Signature']) as string | undefined;
    const { t, v1 } = parseSandboxSignatureHeader(header);
    if (!t || !v1) {
      throw new AppError('Invalid webhook signature', 400);
    }
    const now = Math.floor(Date.now() / 1000);
    const tolerance = 5 * 60; // 5 minutes replay window
    if (Math.abs(now - t) > tolerance) {
      throw new AppError('Webhook timestamp outside allowed tolerance', 400);
    }
    const expected = signPayload(Buffer.concat([Buffer.from(String(t) + '.'), args.rawBody]), args.secret);
    if (!timingSafeEqualHex(v1, expected)) {
      throw new AppError('Invalid webhook signature', 400);
    }

    const body = args.body ?? {};
    const eventId = String(body.eventId ?? body.id ?? body.event_id ?? '').trim();
    if (!eventId) {
      throw new AppError('Webhook event id is required', 400);
    }
    const providerReference = String(body.providerReference ?? body.data?.providerReference ?? body.data?.id ?? '').trim() || undefined;
    const bookingId = String(body.bookingId ?? body.data?.bookingId ?? '').trim() || undefined;
    const outcomeRaw = String(body.status ?? body.outcome ?? body.type ?? '').toLowerCase();
    let outcome: NormalizedWebhookOutcome = 'ignored';
    if (['success', 'paid', 'succeeded', 'payment.succeeded'].includes(outcomeRaw)) outcome = 'success';
    else if (['failed', 'failure', 'payment.failed'].includes(outcomeRaw)) outcome = 'failed';
    else if (['processing', 'pending'].includes(outcomeRaw)) outcome = 'pending';

    return {
      provider: 'sandbox',
      eventId,
      eventType: body.type,
      providerReference,
      bookingId,
      outcome,
      reason: body.reason,
      raw: body,
    };
  },

  async refund(request): Promise<ProviderRefundResult> {
    // Sandbox provider simulates a provider-confirmed refund for integration testing.
    // No real money movement occurs. Failures can be simulated via reason marker.
    const reason = (request.reason || '').toLowerCase();
    if (reason.includes('simulate_provider_failure')) {
      return { supported: true, status: 'failed', failureReason: 'Simulated sandbox provider refund failure' };
    }
    return {
      supported: true,
      status: 'succeeded',
      providerRefundReference: `sandbox_ref_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`,
    };
  },
};