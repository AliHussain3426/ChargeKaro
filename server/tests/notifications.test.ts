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
  return res.body.data.user;
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
  return res.body.data.user;
}

async function setupStationTerminal(supplier: request.Agent) {
  const stationRes = await supplier.post('/api/stations').send({
    name: 'Notify Station',
    address: '123 Test Road',
    city: 'Lahore',
    location: { coordinates: [74.3436, 31.5204] },
    pricing: { amount: 50, currency: 'PKR', billingType: 'PER_KWH' },
    operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '22:00' },
  });
  expect(stationRes.status).toBe(201);
  const stationId = stationRes.body.data.station._id as string;
  const terminalRes = await supplier.post(`/api/stations/${stationId}/terminals`).send({
    name: 'Terminal N-1',
    chargingMethod: 'DC',
    connectorTypes: ['Type 2'],
    maximumPowerKw: 50,
    capacity: 2,
    pricing: { amount: 55, currency: 'PKR', billingType: 'PER_KWH' },
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

function bookingBody(vehicleId: string, stationId: string, terminalId: string, start = '2026-12-14T10:00:00.000Z', end = '2026-12-14T11:00:00.000Z') {
  return { vehicleId, stationId, terminalId, requestedStartTime: start, requestedEndTime: end };
}

describe('Notifications module', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates notifications on booking submit (customer and supplier)', async () => {
    const supplier = request.agent(app);
    const customer = request.agent(app);
    await registerSupplier(supplier, 'n1');
    await registerCustomer(customer, 'n1');
    const { stationId, terminalId } = await setupStationTerminal(supplier);
    const vehicleId = await createVehicle(customer, 'n1');

    const created = await customer.post('/api/bookings').send(bookingBody(vehicleId, stationId, terminalId));
    expect(created.status).toBe(201);

    const customerNotes = await customer.get('/api/notifications');
    expect(customerNotes.status).toBe(200);
    const cNotes = customerNotes.body.data.notifications as any[];
    expect(cNotes.some((n) => n.type === 'BOOKING_SUBMITTED')).toBe(true);

    const supplierNotes = await supplier.get('/api/notifications');
    expect(supplierNotes.status).toBe(200);
    const sNotes = supplierNotes.body.data.notifications as any[];
    expect(sNotes.some((n) => n.type === 'BOOKING_SUBMITTED')).toBe(true);
  });

  it('creates notifications on accept and reject', async () => {
    const supplier = request.agent(app);
    const customer = request.agent(app);
    await registerSupplier(supplier, 'n2');
    await registerCustomer(customer, 'n2');
    const { stationId, terminalId } = await setupStationTerminal(supplier);

    const v1 = await createVehicle(customer, 'a');
    const b1 = await customer.post('/api/bookings').send(bookingBody(v1, stationId, terminalId));
    expect(b1.status).toBe(201);
    await supplier.post(`/api/bookings/${b1.body.data.booking._id}/accept`);

    const afterAccept = await customer.get('/api/notifications');
    const acceptNotes = afterAccept.body.data.notifications as any[];
    expect(acceptNotes.some((n) => n.type === 'BOOKING_ACCEPTED')).toBe(true);

    const v2 = await createVehicle(customer, 'b');
    const b2 = await customer.post('/api/bookings').send(bookingBody(v2, stationId, terminalId, '2026-12-14T12:00:00.000Z', '2026-12-14T13:00:00.000Z'));
    expect(b2.status).toBe(201);
    await supplier.post(`/api/bookings/${b2.body.data.booking._id}/reject`);

    const afterReject = await customer.get('/api/notifications');
    const rejectNotes = afterReject.body.data.notifications as any[];
    expect(rejectNotes.some((n) => n.type === 'BOOKING_REJECTED')).toBe(true);
  });

  it('prevents users from reading or marking others notifications', async () => {
    const supplier = request.agent(app);
    const customerA = request.agent(app);
    const customerB = request.agent(app);
    await registerSupplier(supplier, 'n3');
    await registerCustomer(customerA, 'n3a');
    await registerCustomer(customerB, 'n3b');
    const { stationId, terminalId } = await setupStationTerminal(supplier);
    const vehicleId = await createVehicle(customerA, 'n3a');

    await customerA.post('/api/bookings').send(bookingBody(vehicleId, stationId, terminalId));
    const aNotesRes = await customerA.get('/api/notifications');
    const aNotes = aNotesRes.body.data.notifications as any[];
    expect(aNotes.length).toBeGreaterThan(0);
    const targetId = aNotes[0]._id as string;

    const forbiddenRead = await customerB.post(`/api/notifications/${targetId}/read`);
    expect(forbiddenRead.status).toBe(403);

    const bNotesRes = await customerB.get('/api/notifications');
    const bNotes = bNotesRes.body.data.notifications as any[];
    expect(bNotes.find((n) => n._id === targetId)).toBeUndefined();
  });
});
