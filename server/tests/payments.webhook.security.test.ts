import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index.js';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';
import { env } from '../src/config/env.js';
import { createSandboxWebhookSignature } from '../src/modules/payments/providers/index.js';

async function resetDatabase(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

async function registerCustomer(agent: request.Agent, suffix: string) {
  const res = await agent.post('/api/auth/register/customer').send({
    name: `Customer ${suffix}`,
    email: `customer.${suffix}@example.com`,
    password: 'password123',
    passwordConfirm: 'password123',
  });
  expect(res.status).toBe(201);
}

async function registerSupplier(agent: request.Agent, suffix: string) {
  const res = await agent.post('/api/auth/register/supplier').send({
    name: `Supplier ${suffix}`,
    businessName: `Business ${suffix}`,
    email: `supplier.${suffix}@example.com`,
    password: 'password123',
    passwordConfirm: 'password123',
  });
  expect(res.status).toBe(201);
}

async function setupStationTerminal(supplier: request.Agent) {
  const stationRes = await supplier.post('/api/stations').send({
    name: 'Webhook Station',
    address: '123 Test Road',
    city: 'Lahore',
    location: { coordinates: [74.3436, 31.5204] },
    pricing: { amount: 50, currency: 'PKR', billingType: 'PER_KWH' },
    operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '22:00' },
  });
  expect(stationRes.status).toBe(201);
  const stationId = stationRes.body.data.station._id as string;
  const terminalRes = await supplier.post(`/api/stations/${stationId}/terminals`).send({
    name: 'Terminal WH-1',
    chargingMethod: 'DC',
    connectorTypes: ['Type 2'],
    maximumPowerKw: 50,
    capacity: 1,
    pricing: { amount: 70, currency: 'PKR', billingType: 'PER_KWH' },
    status: 'AVAILABLE',
    availability: true,
  });
  expect(terminalRes.status).toBe(201);
  return { stationId, terminalId: terminalRes.body.data.terminal._id as string };
}

async function createVehicle(agent: request.Agent, suffix: string) {
  const res = await agent.post('/api/vehicles').send({
    manufacturer: 'Nissan',
    model: `Leaf ${suffix}`,
    vehicleCategory: 'ELECTRIC_CAR',
    connectorTypes: ['Type 2'],
  });
  expect(res.status).toBe(201);
  return res.body.data.vehicle._id as string;
}

async function createAcceptedBooking(suffix: string) {
  const supplier = request.agent(app);
  const customer = request.agent(app);
  await registerSupplier(supplier, `s${suffix}`);
  await registerCustomer(customer, `c${suffix}`);
  const { stationId, terminalId } = await setupStationTerminal(supplier);
  const vehicleId = await createVehicle(customer, suffix);
  const bookingRes = await customer.post('/api/bookings').send({
    vehicleId,
    stationId,
    terminalId,
    requestedStartTime: '2026-12-20T10:00:00.000Z',
    requestedEndTime: '2026-12-20T11:00:00.000Z',
  });
  expect(bookingRes.status).toBe(201);
  const bookingId = bookingRes.body.data.booking._id as string;
  const accept = await supplier.post(`/api/bookings/${bookingId}/accept`);
  expect(accept.status).toBe(200);
  const initiate = await customer.post(`/api/payments/bookings/${bookingId}/initiate`).send({});
  expect(initiate.status).toBe(200);
  expect(initiate.body.data.payment.status).toBe('PROCESSING');
  return {
    bookingId,
    payment: initiate.body.data.payment as { providerReference: string; _id: string; provider: string; checkoutUrl?: string },
    supplier,
    customer,
  };
}

function postSignedWebhook(body: Record<string, unknown>, opts: { secret?: string; signature?: string; timestamp?: number } = {}) {
  const raw = JSON.stringify(body);
  const secret = opts.secret ?? env.PAYMENT_WEBHOOK_SECRET;
  const signature = opts.signature ?? createSandboxWebhookSignature(Buffer.from(raw), secret, opts.timestamp);
  return request(app)
    .post('/api/payments/webhooks/sandbox')
    .set('Content-Type', 'application/json')
    .set('x-payment-signature', signature)
    .send(raw);
}

describe('Payments webhook security (P0.2)', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('rejects webhook without signature', async () => {
    const res = await request(app)
      .post('/api/payments/webhooks/sandbox')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ eventId: 'evt_nosig', providerReference: 'x', status: 'success' }));
    expect(res.status).toBe(400);
  });

  it('rejects webhook with invalid signature', async () => {
    const { payment } = await createAcceptedBooking('bad-sig');
    const body = { eventId: 'evt_bad_sig', providerReference: payment.providerReference, status: 'success' };
    const res = await postSignedWebhook(body, { secret: 'wrong-secret' });
    expect(res.status).toBe(400);
  });

  it('rejects webhook with replayed/timestamp-outside-tolerance signature', async () => {
    const { payment } = await createAcceptedBooking('replay');
    const body = { eventId: 'evt_replay_window', providerReference: payment.providerReference, status: 'success' };
    const oldTs = Math.floor(Date.now() / 1000) - 60 * 60; // 1 hour old
    const res = await postSignedWebhook(body, { timestamp: oldTs });
    expect(res.status).toBe(400);
  });

  it('processes valid signed webhook and is idempotent for duplicate/replayed events', async () => {
    const { payment, bookingId, customer } = await createAcceptedBooking('ok');
    const body = { eventId: 'evt_ok_1', providerReference: payment.providerReference, bookingId, status: 'success' };

    const first = await postSignedWebhook(body);
    expect(first.status).toBe(200);
    expect(first.body.success).toBe(true);
    expect(first.body.data.payment.status).toBe('PAID');
    expect(first.body.data.booking.status).toBe('CONFIRMED');
    expect(first.body.data.idempotent).toBe(false);

    const second = await postSignedWebhook(body);
    expect(second.status).toBe(200);
    expect(second.body.data.idempotent).toBe(true);
    expect(second.body.data.payment.status).toBe('PAID');
    expect(second.body.data.booking.status).toBe('CONFIRMED');

    // payment record remains singular/consistent
    const bookingState = await customer.get(`/api/bookings/${bookingId}`);
    expect(bookingState.status).toBe(200);
    expect(bookingState.body.data.booking.status).toBe('CONFIRMED');
    expect(bookingState.body.data.booking.paymentStatus).toBe('PAID');
  });

  it('does not downgrade a paid payment via failed webhook (idempotent safety)', async () => {
    const { payment, bookingId } = await createAcceptedBooking('noflip');
    const successBody = { eventId: 'evt_paid_once', providerReference: payment.providerReference, bookingId, status: 'success' };
    const ok = await postSignedWebhook(successBody);
    expect(ok.status).toBe(200);
    expect(ok.body.data.payment.status).toBe('PAID');

    const failBody = { eventId: 'evt_fail_after', providerReference: payment.providerReference, bookingId, status: 'failed', reason: 'late failure' };
    const lateFail = await postSignedWebhook(failBody);
    expect(lateFail.status).toBe(200);
    expect(lateFail.body.data.payment.status).toBe('PAID');
    expect(lateFail.body.data.booking.status).toBe('CONFIRMED');
  });
});

describe('Payment initiation/verification (P0.1 baseline)', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('initiation returns provider/server-initiated processing payment (sandbox) without trusting client', async () => {
    const { payment, bookingId } = await createAcceptedBooking('init');
    expect(payment.provider).toBe('sandbox');
    expect(payment.providerReference).toBeTruthy();
    expect(payment.checkoutUrl || payment.providerReference).toBeTruthy();
    // cannot mark paid by arbitrary success call from non-owner context; owner flow still server-verified
    const other = request.agent(app);
    await registerCustomer(other, 'other-init');
    const bad = await other.post(`/api/payments/bookings/${bookingId}/success`).send({});
    expect([401, 403]).toContain(bad.status);
  });
});