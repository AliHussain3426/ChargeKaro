import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index.js';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';

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

async function promoteToAdmin(email: string) {
  const { User } = await import('../src/modules/auth/model.js');
  await User.updateOne({ email } as any, { $set: { role: 'ADMIN' } } as any).exec();
}

async function setupPaidPayment(suffix: string, price = 100) {
  const supplier = request.agent(app);
  const customer = request.agent(app);
  await registerSupplier(supplier, `s${suffix}`);
  await registerCustomer(customer, `c${suffix}`);

  const stationRes = await supplier.post('/api/stations').send({
    name: `Refund Station ${suffix}`,
    address: '123 Test Road',
    city: 'Lahore',
    location: { coordinates: [74.3436, 31.5204] },
    pricing: { amount: price, currency: 'PKR', billingType: 'PER_KWH' },
    operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '22:00' },
  });
  expect(stationRes.status).toBe(201);
  const stationId = stationRes.body.data.station._id as string;
  const terminalRes = await supplier.post(`/api/stations/${stationId}/terminals`).send({
    name: `Terminal R-${suffix}`,
    chargingMethod: 'DC',
    connectorTypes: ['Type 2'],
    maximumPowerKw: 50,
    capacity: 1,
    pricing: { amount: price, currency: 'PKR', billingType: 'PER_KWH' },
    status: 'AVAILABLE',
    availability: true,
  });
  expect(terminalRes.status).toBe(201);
  const terminalId = terminalRes.body.data.terminal._id as string;

  const vehicleRes = await customer.post('/api/vehicles').send({
    manufacturer: 'Nissan',
    model: `Leaf ${suffix}`,
    vehicleCategory: 'ELECTRIC_CAR',
    connectorTypes: ['Type 2'],
  });
  expect(vehicleRes.status).toBe(201);
  const vehicleId = vehicleRes.body.data.vehicle._id as string;

  const bookingRes = await customer.post('/api/bookings').send({
    vehicleId,
    stationId,
    terminalId,
    requestedStartTime: '2026-12-21T10:00:00.000Z',
    requestedEndTime: '2026-12-21T11:00:00.000Z',
  });
  expect(bookingRes.status).toBe(201);
  const bookingId = bookingRes.body.data.booking._id as string;
  await supplier.post(`/api/bookings/${bookingId}/accept`);
  await customer.post(`/api/payments/bookings/${bookingId}/initiate`).send({});
  const paid = await customer.post(`/api/payments/bookings/${bookingId}/success`).send({});
  expect(paid.status).toBe(200);
  const paymentId = paid.body.data.payment._id as string;

  return { supplier, customer, bookingId, paymentId, amount: price };
}

describe('Refunds (P0.3)', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('processes full refund and updates payment/booking consistently', async () => {
    const { customer, bookingId, paymentId, amount } = await setupPaidPayment('full');

    const res = await customer.post(`/api/payments/${paymentId}/refunds`).send({ reason: 'Customer request' });
    expect([200, 202]).toContain(res.status);
    expect(res.body.success).toBe(true);
    expect(res.body.data.refund.status).toBe('SUCCEEDED');
    expect(res.body.data.refund.type).toBe('FULL');
    expect(res.body.data.refund.amount).toBe(amount);
    expect(res.body.data.refund.providerRefundReference).toBeTruthy();

    const paymentRes = await customer.get(`/api/payments/${paymentId}`);
    expect(paymentRes.status).toBe(200);
    expect(paymentRes.body.data.payment.status).toBe('REFUNDED');
    expect(paymentRes.body.data.payment.refundAmount).toBe(amount);

    const bookingRes = await customer.get(`/api/bookings/${bookingId}`);
    expect(bookingRes.status).toBe(200);
    expect(bookingRes.body.data.booking.paymentStatus).toBe('REFUNDED');

    const history = await customer.get(`/api/payments/${paymentId}/refunds`);
    expect(history.status).toBe(200);
    expect(history.body.data.refunds).toHaveLength(1);
  });

  it('supports partial refunds and multiple partial refunds up to full amount', async () => {
    const { customer, paymentId } = await setupPaidPayment('partial', 100);

    const r1 = await customer.post(`/api/payments/${paymentId}/refunds`).send({ amount: 30, reason: 'Partial 1' });
    expect([200, 202]).toContain(r1.status);
    expect(r1.body.data.refund.status).toBe('SUCCEEDED');
    expect(r1.body.data.refund.type).toBe('PARTIAL');

    let paymentRes = await customer.get(`/api/payments/${paymentId}`);
    expect(paymentRes.body.data.payment.status).toBe('PARTIALLY_REFUNDED');
    expect(paymentRes.body.data.payment.refundAmount).toBe(30);

    const r2 = await customer.post(`/api/payments/${paymentId}/refunds`).send({ amount: 70, reason: 'Partial 2' });
    expect([200, 202]).toContain(r2.status);
    expect(r2.body.data.refund.status).toBe('SUCCEEDED');
    expect(r2.body.data.refund.type).toBe('FULL'); // remaining balance fully refunded

    paymentRes = await customer.get(`/api/payments/${paymentId}`);
    expect(paymentRes.body.data.payment.status).toBe('REFUNDED');
    expect(paymentRes.body.data.payment.refundAmount).toBe(100);

    const history = await customer.get(`/api/payments/${paymentId}/refunds`);
    expect(history.body.data.refunds).toHaveLength(2);
  });

  it('rejects over-refund and invalid amounts', async () => {
    const { customer, paymentId } = await setupPaidPayment('over', 50);

    const over = await customer.post(`/api/payments/${paymentId}/refunds`).send({ amount: 60, reason: 'Too much' });
    expect(over.status).toBe(400);

    const zero = await customer.post(`/api/payments/${paymentId}/refunds`).send({ amount: 0, reason: 'Zero' });
    expect(zero.status).toBe(400);

    const ok = await customer.post(`/api/payments/${paymentId}/refunds`).send({ amount: 20, reason: 'Ok' });
    expect([200, 202]).toContain(ok.status);
    const overRemaining = await customer.post(`/api/payments/${paymentId}/refunds`).send({ amount: 40, reason: 'Over remaining' });
    expect(overRemaining.status).toBe(400);
  });

  it('prevents duplicate refund processing via idempotency key', async () => {
    const { customer, paymentId } = await setupPaidPayment('idem', 80);
    const payload = { amount: 20, reason: 'Idempotent', idempotencyKey: 'refund-key-1' };

    const first = await customer.post(`/api/payments/${paymentId}/refunds`).send(payload);
    expect([200, 202]).toContain(first.status);
    expect(first.body.data.refund.status).toBe('SUCCEEDED');

    const second = await customer.post(`/api/payments/${paymentId}/refunds`).send(payload);
    expect([200, 202]).toContain(second.status);
    expect(second.body.data.refund._id).toBe(first.body.data.refund._id);

    const history = await customer.get(`/api/payments/${paymentId}/refunds`);
    expect(history.body.data.refunds).toHaveLength(1);

    const paymentRes = await customer.get(`/api/payments/${paymentId}`);
    expect(paymentRes.body.data.payment.refundAmount).toBe(20);
  });

  it('prevents concurrent refunds from over-refunding the same payment', async () => {
    const { customer, paymentId } = await setupPaidPayment('race', 50);

    const [a, b] = await Promise.all([
      customer.post(`/api/payments/${paymentId}/refunds`).send({ amount: 40, reason: 'Race A' }),
      customer.post(`/api/payments/${paymentId}/refunds`).send({ amount: 40, reason: 'Race B' }),
    ]);

    const statuses = [a.status, b.status].sort((x, y) => x - y);
    // one should succeed (200/202) and other should be rejected (400/409) due to in-flight/balance checks
    expect(statuses[0]).toBeGreaterThanOrEqual(200);
    expect(statuses[1]).toBeGreaterThanOrEqual(400);
    const successCount = [a, b].filter((r) => r.status === 200 || r.status === 202).length;
    expect(successCount).toBe(1);

    const paymentRes = await customer.get(`/api/payments/${paymentId}`);
    expect(paymentRes.body.data.payment.refundAmount).toBe(40);
    expect(paymentRes.body.data.payment.status).toBe('PARTIALLY_REFUNDED');
  });

  it('enforces ownership/authorization (IDOR/BOLA prevention)', async () => {
    const { paymentId } = await setupPaidPayment('authz', 60);
    const other = request.agent(app);
    await registerCustomer(other, 'other-ref');

    const forbidden = await other.post(`/api/payments/${paymentId}/refunds`).send({ reason: 'Steal' });
    expect([401, 403, 404]).toContain(forbidden.status);

    const listForbidden = await other.get(`/api/payments/${paymentId}/refunds`);
    expect([401, 403, 404]).toContain(listForbidden.status);
  });

  it('handles provider failure honestly and does not mark payment refunded', async () => {
    const { customer, paymentId } = await setupPaidPayment('fail', 70);

    const res = await customer.post(`/api/payments/${paymentId}/refunds`).send({ reason: 'simulate_provider_failure please' });
    expect([200, 202]).toContain(res.status);
    expect(res.body.data.refund.status).toBe('FAILED');
    expect(res.body.data.refund.failureReason).toBeTruthy();

    const paymentRes = await customer.get(`/api/payments/${paymentId}`);
    expect(paymentRes.body.data.payment.status).toBe('PAID');
    expect(paymentRes.body.data.payment.refundAmount ?? 0).toBe(0);

    // retry/new request can succeed
    const retry = await customer.post(`/api/payments/${paymentId}/refunds`).send({ reason: 'Retry ok' });
    expect([200, 202]).toContain(retry.status);
    expect(retry.body.data.refund.status).toBe('SUCCEEDED');
  });

  it('allows admin to view refund history', async () => {
    const { customer, paymentId } = await setupPaidPayment('admin', 40);
    const created = await customer.post(`/api/payments/${paymentId}/refunds`).send({ reason: 'Admin view' });
    expect(created.body.data.refund.status).toBe('SUCCEEDED');

    const admin = request.agent(app);
    await admin.post('/api/auth/register/customer').send({ name: 'Admin', email: 'admin.refunds@example.com', password: 'password123', passwordConfirm: 'password123' });
    await promoteToAdmin('admin.refunds@example.com');
    // re-login as admin role context
    const adminLogin = request.agent(app);
    await adminLogin.post('/api/auth/login').send({ email: 'admin.refunds@example.com', password: 'password123' });

    const list = await adminLogin.get('/api/payments/refunds');
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data.refunds)).toBe(true);
    expect(list.body.data.refunds.length).toBeGreaterThanOrEqual(1);
  });
});