import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index.js';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';
import { computeSettlementAmounts } from '../src/modules/payments/settlement.service.js';
import { Settlement, SettlementStatus } from '../src/modules/payments/settlement.model.js';
import { Payout, PayoutStatus } from '../src/modules/payments/payout.model.js';

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

async function loginAdmin(agent: request.Agent, suffix = 'admin') {
  const email = `${suffix}.settlements@example.com`;
  await agent.post('/api/auth/register/customer').send({ name: `Admin ${suffix}`, email, password: 'password123', passwordConfirm: 'password123' });
  const { User } = await import('../src/modules/auth/model.js');
  await User.updateOne({ email } as any, { $set: { role: 'ADMIN' } } as any).exec();
  const admin = request.agent(app);
  const login = await admin.post('/api/auth/login').send({ email, password: 'password123' });
  expect(login.status).toBe(200);
  return admin;
}

async function setupPaidPayment(opts: { suffix: string; price?: number; start?: string; end?: string }) {
  const { suffix, price = 100, start = '2026-12-22T10:00:00.000Z', end = '2026-12-22T11:00:00.000Z' } = opts;
  const supplier = request.agent(app);
  const customer = request.agent(app);
  await registerSupplier(supplier, `s${suffix}`);
  await registerCustomer(customer, `c${suffix}`);

  const stationRes = await supplier.post('/api/stations').send({
    name: `Settlement Station ${suffix}`,
    address: '123 Test Road',
    city: 'Lahore',
    location: { coordinates: [74.3436, 31.5204] },
    pricing: { amount: price, currency: 'PKR', billingType: 'PER_KWH' },
    operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '22:00' },
  });
  expect(stationRes.status).toBe(201);
  const stationId = stationRes.body.data.station._id as string;
  const terminalRes = await supplier.post(`/api/stations/${stationId}/terminals`).send({
    name: `Terminal S-${suffix}`,
    chargingMethod: 'DC',
    connectorTypes: ['Type 2'],
    maximumPowerKw: 50,
    capacity: 5,
    pricing: { amount: price, currency: 'PKR', billingType: 'PER_KWH' },
    status: 'AVAILABLE',
    availability: true,
  });
  expect(terminalRes.status).toBe(201);
  const terminalId = terminalRes.body.data.terminal._id as string;

  const vehicleRes = await customer.post('/api/vehicles').send({
    manufacturer: 'Nissan', model: `Leaf ${suffix}`, vehicleCategory: 'ELECTRIC_CAR', connectorTypes: ['Type 2'],
  });
  expect(vehicleRes.status).toBe(201);
  const vehicleId = vehicleRes.body.data.vehicle._id as string;

  const bookingRes = await customer.post('/api/bookings').send({ vehicleId, stationId, terminalId, requestedStartTime: start, requestedEndTime: end });
  expect(bookingRes.status).toBe(201);
  const bookingId = bookingRes.body.data.booking._id as string;
  const accept = await supplier.post(`/api/bookings/${bookingId}/accept`);
  expect(accept.status).toBe(200);
  await customer.post(`/api/payments/bookings/${bookingId}/initiate`).send({});
  const paid = await customer.post(`/api/payments/bookings/${bookingId}/success`).send({});
  expect(paid.status).toBe(200);
  const paymentId = paid.body.data.payment._id as string;

  return { supplier, customer, bookingId, paymentId, stationId, terminalId };
}

describe('Settlement calculation utility (P0.4)', () => {
  it('computes gross, fee, and net payable correctly (fee on retained amount)', () => {
    const r = computeSettlementAmounts({ grossAmount: 200, succeededRefundAmount: 0, platformFeeRate: 0.1 });
    expect(r.grossAmount).toBe(200);
    expect(r.platformFee).toBe(20);
    expect(r.refundDeduction).toBe(0);
    expect(r.netPayable).toBe(180);
  });

  it('computes correctly with full and partial refund deductions', () => {
    const partial = computeSettlementAmounts({ grossAmount: 100, succeededRefundAmount: 30, platformFeeRate: 0.1 });
    expect(partial.refundDeduction).toBe(30);
    expect(partial.platformFee).toBe(7); // 10% of retained 70
    expect(partial.netPayable).toBe(63);

    const full = computeSettlementAmounts({ grossAmount: 100, succeededRefundAmount: 100, platformFeeRate: 0.1 });
    expect(full.refundDeduction).toBe(100);
    expect(full.platformFee).toBe(0);
    expect(full.netPayable).toBe(0);
  });

  it('handles multiple/large refund totals without negative balances', () => {
    const r = computeSettlementAmounts({ grossAmount: 100, succeededRefundAmount: 150, platformFeeRate: 0.1, otherDeductions: 10 });
    expect(r.refundDeduction).toBe(100);
    expect(r.netPayable).toBe(0);
  });
});

describe('Settlements & payouts (P0.4)', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });
  afterAll(async () => {
    await stopTestDatabase();
  });
  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates settlement for confirmed payment and exposes supplier balance/history', async () => {
    const { supplier } = await setupPaidPayment({ suffix: 'base', price: 100 });
    const settlementsRes = await supplier.get('/api/payments/settlements/me');
    expect(settlementsRes.status).toBe(200);
    const settlements = settlementsRes.body.data.settlements;
    expect(settlements.length).toBe(1);
    expect(settlements[0].grossAmount).toBe(100);
    expect(settlements[0].platformFee).toBe(10);
    expect(settlements[0].refundDeduction).toBe(0);
    expect(settlements[0].netPayable).toBe(90);
    expect(settlements[0].status).toBe(SettlementStatus.CALCULATED);

    const balanceRes = await supplier.get('/api/payments/settlements/balance/me');
    expect(balanceRes.status).toBe(200);
    const b = balanceRes.body.data.balance;
    expect(b.gross).toBe(100);
    expect(b.platformFees).toBe(10);
    expect(b.netPayable).toBe(90);
    expect(b.availableForPayout).toBe(90);
  });

  it('integrates full, partial, and multiple partial refunds into settlement recalculation', async () => {
    const { customer, supplier, paymentId } = await setupPaidPayment({ suffix: 'refunds', price: 100 });

    const r1 = await customer.post(`/api/payments/${paymentId}/refunds`).send({ amount: 30, reason: 'Partial 1' });
    expect([200, 202]).toContain(r1.status);
    let settlements = (await supplier.get('/api/payments/settlements/me')).body.data.settlements;
    expect(settlements[0].refundDeduction).toBe(30);
    expect(settlements[0].netPayable).toBe(63);

    const r2 = await customer.post(`/api/payments/${paymentId}/refunds`).send({ amount: 70, reason: 'Partial 2' });
    expect([200, 202]).toContain(r2.status);
    settlements = (await supplier.get('/api/payments/settlements/me')).body.data.settlements;
    expect(settlements[0].refundDeduction).toBe(100);
    expect(settlements[0].netPayable).toBe(0);
    expect(settlements[0].adjustments.length).toBeGreaterThanOrEqual(2);
  });

  it('excludes failed/pending payments and failed refunds from payable deductions', async () => {
    const supplier = request.agent(app);
    const customer = request.agent(app);
    await registerSupplier(supplier, 'excl-s');
    await registerCustomer(customer, 'excl-c');
    const stationRes = await supplier.post('/api/stations').send({
      name: 'Excl Station', address: '123 Test Road', city: 'Lahore', location: { coordinates: [74.3436, 31.5204] },
      pricing: { amount: 50, currency: 'PKR', billingType: 'PER_KWH' },
      operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '22:00' },
    });
    expect(stationRes.status, JSON.stringify(stationRes.body)).toBe(201);
    const stationId = stationRes.body.data.station._id as string;
    const terminalRes = await supplier.post(`/api/stations/${stationId}/terminals`).send({
      name: 'Excl T', chargingMethod: 'DC', connectorTypes: ['Type 2'], maximumPowerKw: 50, capacity: 5,
      pricing: { amount: 50, currency: 'PKR', billingType: 'PER_KWH' }, status: 'AVAILABLE', availability: true,
    });
    expect(terminalRes.status).toBe(201);
    const terminalId = terminalRes.body.data.terminal._id as string;
    const vRes = await customer.post('/api/vehicles').send({ manufacturer: 'N', model: '1', vehicleCategory: 'ELECTRIC_CAR', connectorTypes: ['Type 2'] });
    expect(vRes.status).toBe(201);
    const v1 = vRes.body.data.vehicle._id as string;
    const b1 = await customer.post('/api/bookings').send({ vehicleId: v1, stationId, terminalId, requestedStartTime: '2026-12-23T10:00:00.000Z', requestedEndTime: '2026-12-23T11:00:00.000Z' });
    expect(b1.status).toBe(201);
    const id1 = b1.body.data.booking._id as string;
    const accept = await supplier.post(`/api/bookings/${id1}/accept`);
    expect(accept.status).toBe(200);
    await customer.post(`/api/payments/bookings/${id1}/initiate`).send({});
    const failedPay = await customer.post(`/api/payments/bookings/${id1}/failure`).send({ reason: 'declined' });
    expect(failedPay.status).toBe(200);

    // no eligible payment settlement
    const settlementsRes = await supplier.get('/api/payments/settlements/me');
    expect(settlementsRes.status).toBe(200);
    expect(settlementsRes.body.data.settlements.length).toBe(0);

    // failed refund should not deduct
    const { customer: c2, supplier: s2, paymentId } = await setupPaidPayment({ suffix: 'failref', price: 70 });
    const fail = await c2.post(`/api/payments/${paymentId}/refunds`).send({ reason: 'simulate_provider_failure' });
    expect(fail.body.data.refund.status).toBe('FAILED');
    const settlements = (await s2.get('/api/payments/settlements/me')).body.data.settlements;
    expect(settlements[0].refundDeduction).toBe(0);
    expect(settlements[0].netPayable).toBe(63);
  });

  it('prevents duplicate settlement creation and supports idempotent reconciliation', async () => {
    const { supplier, paymentId } = await setupPaidPayment({ suffix: 'idem', price: 100 });
    const before = await Settlement.countDocuments({} as any).exec();
    expect(before).toBe(1);

    const admin = await loginAdmin(request.agent(app), 'idem');
    // get supplier profile id via admin suppliers list
    const suppliersRes = await admin.get('/api/admin/suppliers');
    expect(suppliersRes.status).toBe(200);
    const supplierProfileId = suppliersRes.body.data.suppliers[0]._id as string;

    const rec1 = await admin.post(`/api/admin/settlements/suppliers/${supplierProfileId}/reconcile`);
    expect(rec1.status).toBe(200);
    const rec2 = await admin.post(`/api/admin/settlements/suppliers/${supplierProfileId}/reconcile`);
    expect(rec2.status).toBe(200);
    const [r3, r4] = await Promise.all([
      admin.post(`/api/admin/settlements/suppliers/${supplierProfileId}/reconcile`),
      admin.post(`/api/admin/settlements/suppliers/${supplierProfileId}/reconcile`),
    ]);
    expect(r3.status).toBe(200);
    expect(r4.status).toBe(200);

    const after = await Settlement.countDocuments({} as any).exec();
    expect(after).toBe(1);
    const settlement = await Settlement.findOne({ paymentId } as any).exec();
    expect(settlement).toBeTruthy();
    expect(settlement!.netPayable).toBe(90);
  });

  it('recalculates safely when refund occurs after settlement approval/payout processing', async () => {
    const { supplier, customer, paymentId } = await setupPaidPayment({ suffix: 'after', price: 100 });
    const admin = await loginAdmin(request.agent(app), 'after');
    const supplierProfileId = (await admin.get('/api/admin/suppliers')).body.data.suppliers[0]._id as string;

    const settlements = (await admin.get('/api/admin/settlements')).body.data.settlements;
    expect(settlements.length).toBe(1);
    const settlementId = settlements[0]._id as string;

    const approved = await admin.post(`/api/admin/settlements/${settlementId}/approve`).send({ note: 'ok' });
    expect(approved.status).toBe(200);
    const payoutRes = await admin.post(`/api/admin/payouts/suppliers/${supplierProfileId}`).send({});
    expect(payoutRes.status).toBe(200);
    expect(payoutRes.body.data.payout.status).toBe(PayoutStatus.PROCESSING);

    const refund = await customer.post(`/api/payments/${paymentId}/refunds`).send({ amount: 20, reason: 'Post-approval' });
    expect([200, 202]).toContain(refund.status);

    const updated = await Settlement.findById(settlementId).exec();
    expect(updated).toBeTruthy();
    expect(updated!.refundDeduction).toBe(20);
    expect(updated!.netPayable).toBe(72); // retained 80, fee 8
    expect((updated!.adjustments || []).some((a: any) => a.reason === 'refund_succeeded')).toBe(true);
  });

  it('enforces RBAC/supplier isolation and rejects unauthorized access', async () => {
    const { supplier: s1 } = await setupPaidPayment({ suffix: 'iso1', price: 60 });
    const { supplier: s2 } = await setupPaidPayment({ suffix: 'iso2', price: 60 });
    const admin = await loginAdmin(request.agent(app), 'iso');
    const suppliers = (await admin.get('/api/admin/suppliers')).body.data.suppliers;
    const id2 = suppliers.find((s: any) => s.businessName === 'Business siso2')._id as string;
    const id1 = suppliers.find((s: any) => s.businessName === 'Business siso1')._id as string;
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();

    const s1Settlements = (await s1.get('/api/payments/settlements/me')).body.data.settlements;
    expect(s1Settlements.length).toBe(1);
    expect(s1Settlements[0].grossAmount).toBe(60);
    const s2Settlements = (await s2.get('/api/payments/settlements/me')).body.data.settlements;
    expect(s2Settlements.length).toBe(1);

    // supplier cannot access admin endpoints
    const forbidden = await s1.get('/api/admin/settlements');
    expect([401, 403]).toContain(forbidden.status);

    // customer cannot access supplier settlement endpoints
    const customer = request.agent(app);
    await registerCustomer(customer, 'nope');
    const custForbid = await customer.get('/api/payments/settlements/me');
    expect([401, 403]).toContain(custForbid.status);

    // settlements belong to specific supplier only (approve then create payout for supplier 2)
    const s2SettlementId = s2Settlements[0]._id as string;
    const approveS2 = await admin.post(`/api/admin/settlements/${s2SettlementId}/approve`).send({});
    expect(approveS2.status).toBe(200);
    const created = await admin.post(`/api/admin/payouts/suppliers/${id2}`).send({});
    expect(created.status).toBe(200);
    const linked = await Settlement.find({ payoutId: created.body.data.payout._id } as any).exec();
    expect(linked.length).toBeGreaterThan(0);
    expect(linked.every((s: any) => s.supplierId.toString() === id2)).toBe(true);
  });

  it('rejects invalid payout transitions and never marks payout PAID without verified external confirmation', async () => {
    await setupPaidPayment({ suffix: 'payout', price: 100 });
    const admin = await loginAdmin(request.agent(app), 'payout');
    const supplierProfileId = (await admin.get('/api/admin/suppliers')).body.data.suppliers[0]._id as string;
    const settlementId = (await admin.get('/api/admin/settlements')).body.data.settlements[0]._id as string;
    await admin.post(`/api/admin/settlements/${settlementId}/approve`).send({});
    const payout = (await admin.post(`/api/admin/payouts/suppliers/${supplierProfileId}`).send({})).body.data.payout;

    const paidAttempt = await admin.patch(`/api/admin/payouts/${payout._id}/status`).send({ status: PayoutStatus.PAID, note: 'manual' });
    expect(paidAttempt.status).toBe(400);
    // Must not allow fake PAID: rejected as invalid transition and/or missing verified external confirmation.
    expect(String(paidAttempt.body?.message || '')).toMatch(/invalid payout status transition|verified external payout/i);

    const bad = await admin.patch(`/api/admin/payouts/${payout._id}/status`).send({ status: 'UNKNOWN' });
    expect(bad.status).toBe(400);

    const approved = await admin.patch(`/api/admin/payouts/${payout._id}/status`).send({ status: PayoutStatus.APPROVED, note: 'reviewed' });
    expect(approved.status).toBe(200);

    // cannot go from APPROVED to PAID
    const paidAgain = await admin.patch(`/api/admin/payouts/${payout._id}/status`).send({ status: PayoutStatus.PAID });
    expect(paidAgain.status).toBe(400);

    const still = await Payout.findById(payout._id).exec();
    expect(still!.status).not.toBe(PayoutStatus.PAID);
  });
});
