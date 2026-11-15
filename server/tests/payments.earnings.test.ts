import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index.js';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';
import { calculateEarnings } from '../src/modules/payments/service.js';

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

async function setupStationTerminal(supplier: request.Agent, price = 55) {
  const stationRes = await supplier.post('/api/stations').send({
    name: 'Payment Station',
    address: '123 Test Road',
    city: 'Lahore',
    location: { coordinates: [74.3436, 31.5204] },
    pricing: { amount: 50, currency: 'PKR', billingType: 'PER_KWH' },
    operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '22:00' },
  });
  expect(stationRes.status).toBe(201);
  const stationId = stationRes.body.data.station._id as string;
  const terminalRes = await supplier.post(`/api/stations/${stationId}/terminals`).send({
    name: 'Terminal Pay-1',
    chargingMethod: 'DC',
    connectorTypes: ['Type 2'],
    maximumPowerKw: 50,
    capacity: 1,
    pricing: { amount: price, currency: 'PKR', billingType: 'PER_KWH' },
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

function bookingBody(vehicleId: string, stationId: string, terminalId: string, start = '2026-12-12T10:00:00.000Z', end = '2026-12-12T11:00:00.000Z') {
  return { vehicleId, stationId, terminalId, requestedStartTime: start, requestedEndTime: end };
}

describe('Payments and earnings', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates payment on acceptance and payment success updates booking to CONFIRMED (PAID)', async () => {
    const supplier = request.agent(app);
    const customer = request.agent(app);
    await registerSupplier(supplier, 'pay1');
    await registerCustomer(customer, 'pay1');
    const { stationId, terminalId } = await setupStationTerminal(supplier, 100);
    const vehicleId = await createVehicle(customer, 'pay1');

    const bookingRes = await customer.post('/api/bookings').send(bookingBody(vehicleId, stationId, terminalId));
    expect(bookingRes.status).toBe(201);
    const bookingId = bookingRes.body.data.booking._id as string;

    const accept = await supplier.post(`/api/bookings/${bookingId}/accept`);
    expect(accept.status).toBe(200);
    expect(accept.body.data.booking.status).toBe('ACCEPTED_AWAITING_PAYMENT');

    const initiate = await customer.post(`/api/payments/bookings/${bookingId}/initiate`).send({});
    expect(initiate.status).toBe(200);
    expect(initiate.body.data.payment.status).toBe('PROCESSING');

    const success = await customer.post(`/api/payments/bookings/${bookingId}/success`).send({});
    expect(success.status).toBe(200);
    expect(success.body.data.payment.status).toBe('PAID');
    expect(success.body.data.booking.status).toBe('CONFIRMED');
    expect(success.body.data.booking.paymentStatus).toBe('PAID');

    // idempotent re-confirm
    const successAgain = await customer.post(`/api/payments/bookings/${bookingId}/success`).send({});
    expect(successAgain.status).toBe(200);
    expect(successAgain.body.data.payment.status).toBe('PAID');
  });

  it('payment failure keeps booking ACCEPTED_AWAITING_PAYMENT and marks payment FAILED', async () => {
    const supplier = request.agent(app);
    const customer = request.agent(app);
    await registerSupplier(supplier, 'pay2');
    await registerCustomer(customer, 'pay2');
    const { stationId, terminalId } = await setupStationTerminal(supplier, 80);
    const vehicleId = await createVehicle(customer, 'pay2');

    const bookingRes = await customer.post('/api/bookings').send(bookingBody(vehicleId, stationId, terminalId));
    const bookingId = bookingRes.body.data.booking._id as string;
    await supplier.post(`/api/bookings/${bookingId}/accept`);

    await customer.post(`/api/payments/bookings/${bookingId}/initiate`).send({});
    const failed = await customer.post(`/api/payments/bookings/${bookingId}/failure`).send({ reason: 'Card declined' });
    expect(failed.status).toBe(200);
    expect(failed.body.data.payment.status).toBe('FAILED');
    expect(failed.body.data.booking.status).toBe('ACCEPTED_AWAITING_PAYMENT');
    expect(failed.body.data.booking.paymentStatus).toBe('FAILED');

    // can retry: initiate again moves to processing
    const retry = await customer.post(`/api/payments/bookings/${bookingId}/initiate`).send({});
    expect(retry.status).toBe(200);
    expect(retry.body.data.payment.status).toBe('PROCESSING');
  });

  it('computes supplier earnings (gross, platform fee, net) from confirmed payments', async () => {
    const supplier = request.agent(app);
    const customer = request.agent(app);
    await registerSupplier(supplier, 'earn1');
    await registerCustomer(customer, 'earn1');
    const { stationId, terminalId } = await setupStationTerminal(supplier, 100);
    const vehicleId = await createVehicle(customer, 'earn1');

    const b1 = await customer.post('/api/bookings').send(bookingBody(vehicleId, stationId, terminalId, '2026-12-13T10:00:00.000Z', '2026-12-13T11:00:00.000Z'));
    const id1 = b1.body.data.booking._id as string;
    await supplier.post(`/api/bookings/${id1}/accept`);
    await customer.post(`/api/payments/bookings/${id1}/initiate`).send({});
    await customer.post(`/api/payments/bookings/${id1}/success`).send({});

    const v2 = await createVehicle(customer, 'earn2');
    const b2 = await customer.post('/api/bookings').send(bookingBody(v2, stationId, terminalId, '2026-12-13T12:00:00.000Z', '2026-12-13T13:00:00.000Z'));
    const id2 = b2.body.data.booking._id as string;
    await supplier.post(`/api/bookings/${id2}/accept`);
    await customer.post(`/api/payments/bookings/${id2}/initiate`).send({});
    await customer.post(`/api/payments/bookings/${id2}/success`).send({});

    const earningsRes = await supplier.get('/api/payments/earnings/me');
    expect(earningsRes.status).toBe(200);
    const earnings = earningsRes.body.data.earnings;
    expect(earnings.gross).toBe(200);
    expect(earnings.platformFee).toBe(20);
    expect(earnings.netPayable).toBe(180);
    expect(earnings.paidCount).toBe(2);
  });
});

describe('Earnings calculation utility', () => {
  it('computes gross, fee, and net', () => {
    expect(calculateEarnings([100, 50], 0.1)).toEqual({ gross: 150, platformFee: 15, netPayable: 135, feeRate: 0.1 });
    expect(calculateEarnings([], 0.1)).toEqual({ gross: 0, platformFee: 0, netPayable: 0, feeRate: 0.1 });
  });
});
