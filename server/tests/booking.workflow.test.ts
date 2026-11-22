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
  // Auto-approve supplier for tests (admin verification now required)
  const _supplierEmail = res.body.data.user.email;
  const { User: _U, SupplierProfile: _SP } = await import('../src/modules/auth/model.js');
  const _sUser = await _U.findOne({ email: _supplierEmail }).exec();
  if (_sUser) {
    await _U.updateOne({ _id: _sUser._id }, { $set: { accountStatus: 'ACTIVE', verificationStatus: 'VERIFIED' } } as any).exec();
    await _SP.updateOne({ user: _sUser._id }, { $set: { verificationStatus: 'VERIFIED' } } as any).exec();
  }
  const _login = await agent.post('/api/auth/login').send({ email: _supplierEmail, password: 'password123' });
  expect(_login.status).toBe(200);
}

async function setupStationTerminal(supplier: request.Agent, terminalOverrides: Record<string, unknown> = {}) {
  const stationRes = await supplier.post('/api/stations').send({
    name: 'Workflow Station',
    address: '123 Test Road',
    city: 'Lahore',
    location: { coordinates: [74.3436, 31.5204] },
    pricing: { amount: 50, currency: 'PKR', billingType: 'PER_KWH' },
    operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '22:00' },
  });
  expect(stationRes.status).toBe(201);
  const stationId = stationRes.body.data.station._id as string;
  const terminalRes = await supplier.post(`/api/stations/${stationId}/terminals`).send({
    name: 'Terminal WF-1',
    chargingMethod: 'DC',
    connectorTypes: ['Type 2'],
    maximumPowerKw: 50,
    capacity: 1,
    pricing: { amount: 55, currency: 'PKR', billingType: 'PER_KWH' },
    status: 'AVAILABLE',
    availability: true,
    ...terminalOverrides,
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

function bookingBody(vehicleId: string, stationId: string, terminalId: string, start = '2026-12-10T10:00:00.000Z', end = '2026-12-10T11:00:00.000Z') {
  return { vehicleId, stationId, terminalId, requestedStartTime: start, requestedEndTime: end };
}

describe('Booking workflow state machine', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates a booking in PENDING_SUPPLIER state', async () => {
    const supplier = request.agent(app);
    const customer = request.agent(app);
    await registerSupplier(supplier, 'wf1');
    await registerCustomer(customer, 'wf1');
    const { stationId, terminalId } = await setupStationTerminal(supplier);
    const vehicleId = await createVehicle(customer, 'wf1');

    const res = await customer.post('/api/bookings').send(bookingBody(vehicleId, stationId, terminalId));
    expect(res.status).toBe(201);
    expect(res.body.data.booking.status).toBe('PENDING_SUPPLIER');
    expect(res.body.data.booking.priceSnapshot.amount).toBe(55);
  });

  it('supplier accept moves to ACCEPTED_AWAITING_PAYMENT and reject moves to REJECTED', async () => {
    const supplier = request.agent(app);
    const customer = request.agent(app);
    await registerSupplier(supplier, 'wf2');
    await registerCustomer(customer, 'wf2');
    const { stationId, terminalId } = await setupStationTerminal(supplier, { capacity: 2 });

    const v1 = await createVehicle(customer, 'a');
    const b1 = await customer.post('/api/bookings').send(bookingBody(v1, stationId, terminalId));
    expect(b1.status).toBe(201);
    const accept = await supplier.post(`/api/bookings/${b1.body.data.booking._id}/accept`);
    expect(accept.status).toBe(200);
    expect(accept.body.data.booking.status).toBe('ACCEPTED_AWAITING_PAYMENT');

    const v2 = await createVehicle(customer, 'b');
    const b2 = await customer.post('/api/bookings').send(bookingBody(v2, stationId, terminalId, '2026-12-10T12:00:00.000Z', '2026-12-10T13:00:00.000Z'));
    expect(b2.status).toBe(201);
    const reject = await supplier.post(`/api/bookings/${b2.body.data.booking._id}/reject`);
    expect(reject.status).toBe(200);
    expect(reject.body.data.booking.status).toBe('REJECTED');
  });

  it('prevents concurrent booking conflicts on the same terminal (one succeeds)', async () => {
    const supplier = request.agent(app);
    const customerA = request.agent(app);
    const customerB = request.agent(app);
    await registerSupplier(supplier, 'wf3');
    await registerCustomer(customerA, 'wf3a');
    await registerCustomer(customerB, 'wf3b');
    const { stationId, terminalId } = await setupStationTerminal(supplier, { capacity: 1 });
    const vA = await createVehicle(customerA, 'ca');
    const vB = await createVehicle(customerB, 'cb');

    const payload = { stationId, terminalId, requestedStartTime: '2026-12-11T10:00:00.000Z', requestedEndTime: '2026-12-11T11:00:00.000Z' };
    const [r1, r2] = await Promise.all([
      customerA.post('/api/bookings').send({ ...payload, vehicleId: vA }),
      customerB.post('/api/bookings').send({ ...payload, vehicleId: vB }),
    ]);

    const statuses = [r1.status, r2.status].sort((a, b) => a - b);
    expect(statuses).toEqual([201, 409]);
  });

  it('handles cancellation and expiry transitions', async () => {
    const supplier = request.agent(app);
    const customer = request.agent(app);
    await registerSupplier(supplier, 'wf4');
    await registerCustomer(customer, 'wf4');
    const { stationId, terminalId } = await setupStationTerminal(supplier, { capacity: 2 });

    // PENDING_SUPPLIER -> CANCELLED (customer)
    const v1 = await createVehicle(customer, 'c1');
    const b1 = await customer.post('/api/bookings').send(bookingBody(v1, stationId, terminalId));
    const cancel = await customer.post(`/api/bookings/${b1.body.data.booking._id}/cancel`);
    expect(cancel.status).toBe(200);
    expect(cancel.body.data.booking.status).toBe('CANCELLED');

    // ACCEPTED_AWAITING_PAYMENT -> EXPIRED
    const v2 = await createVehicle(customer, 'c2');
    const b2 = await customer.post('/api/bookings').send(bookingBody(v2, stationId, terminalId, '2026-12-11T12:00:00.000Z', '2026-12-11T13:00:00.000Z'));
    await supplier.post(`/api/bookings/${b2.body.data.booking._id}/accept`);
    const expire = await supplier.post(`/api/bookings/${b2.body.data.booking._id}/expire`);
    expect(expire.status).toBe(200);
    expect(expire.body.data.booking.status).toBe('EXPIRED');

    // CONFIRMED -> CANCELLED and full happy path to COMPLETED
    const v3 = await createVehicle(customer, 'c3');
    const b3 = await customer.post('/api/bookings').send(bookingBody(v3, stationId, terminalId, '2026-12-11T14:00:00.000Z', '2026-12-11T15:00:00.000Z'));
    await supplier.post(`/api/bookings/${b3.body.data.booking._id}/accept`);
    await customer.post(`/api/bookings/${b3.body.data.booking._id}/pay`);
    const start = await supplier.post(`/api/bookings/${b3.body.data.booking._id}/start`);
    expect(start.body.data.booking.status).toBe('IN_PROGRESS');
    const complete = await supplier.post(`/api/bookings/${b3.body.data.booking._id}/complete`);
    expect(complete.status).toBe(200);
    expect(complete.body.data.booking.status).toBe('COMPLETED');

    const v4 = await createVehicle(customer, 'c4');
    const b4 = await customer.post('/api/bookings').send(bookingBody(v4, stationId, terminalId, '2026-12-11T16:00:00.000Z', '2026-12-11T17:00:00.000Z'));
    await supplier.post(`/api/bookings/${b4.body.data.booking._id}/accept`);
    await customer.post(`/api/bookings/${b4.body.data.booking._id}/pay`);
    const cancelConfirmed = await customer.post(`/api/bookings/${b4.body.data.booking._id}/cancel`);
    expect(cancelConfirmed.status).toBe(200);
    expect(cancelConfirmed.body.data.booking.status).toBe('CANCELLED');
  });
});
