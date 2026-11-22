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
  const response = await agent.post('/api/auth/register/customer').send({
    name: `Customer ${suffix}`,
    email: `customer.${suffix}@example.com`,
    phone: '+923000000001',
    password: 'password123',
    passwordConfirm: 'password123',
  });
  expect(response.status).toBe(201);
  return response.body.data.user;
}

async function registerSupplier(agent: request.Agent, suffix: string) {
  const response = await agent.post('/api/auth/register/supplier').send({
    name: `Supplier ${suffix}`,
    businessName: `Business ${suffix}`,
    email: `supplier.${suffix}@example.com`,
    phone: '+923000000002',
    password: 'password123',
    passwordConfirm: 'password123',
  });
  expect(response.status).toBe(201);
  // Auto-approve supplier for tests (admin verification now required)
  const _supplierEmail = response.body.data.user.email;
  const { User: _U, SupplierProfile: _SP } = await import('../src/modules/auth/model.js');
  const _sUser = await _U.findOne({ email: _supplierEmail }).exec();
  if (_sUser) {
    await _U.updateOne({ _id: _sUser._id }, { $set: { accountStatus: 'ACTIVE', verificationStatus: 'VERIFIED' } } as any).exec();
    await _SP.updateOne({ user: _sUser._id }, { $set: { verificationStatus: 'VERIFIED' } } as any).exec();
  }
  const _login = await agent.post('/api/auth/login').send({ email: _supplierEmail, password: 'password123' });
  expect(_login.status).toBe(200);
  return response.body.data.user;
}

function stationPayload() {
  return {
    name: 'Test Station',
    address: '123 Test Road, Lahore',
    city: 'Lahore',
    province: 'Punjab',
    country: 'Pakistan',
    location: { coordinates: [74.3436, 31.5204] },
    pricing: { amount: 50, currency: 'PKR', billingType: 'PER_KWH' },
    operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '22:00' },
  };
}

function terminalPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Terminal T-1',
    chargingMethod: 'DC',
    connectorTypes: ['CCS2', 'Type 2'],
    maximumPowerKw: 50,
    capacity: 1,
    pricing: { amount: 55, currency: 'PKR', billingType: 'PER_KWH' },
    status: 'AVAILABLE',
    availability: true,
    ...overrides,
  };
}

function vehiclePayload(overrides: Record<string, unknown> = {}) {
  return {
    manufacturer: 'Nissan',
    model: 'Leaf',
    vehicleCategory: 'ELECTRIC_CAR',
    modelYear: 2021,
    batteryCapacityKwh: 40,
    connectorTypes: ['Type 2'],
    maximumChargingPowerKw: 50,
    ...overrides,
  };
}

describe('Customer vehicles and bookings', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates a vehicle linked to the authenticated customer', async () => {
    const agent = request.agent(app);
    const user = await registerCustomer(agent, 'veh-create');

    const response = await agent.post('/api/vehicles').send(vehiclePayload());

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.vehicle.manufacturer).toBe('Nissan');
    expect(response.body.data.vehicle.customerId).toBeTruthy();
    // owner implied by successful scoped list below
    const list = await agent.get('/api/vehicles');
    expect(list.status).toBe(200);
    expect(list.body.data.vehicles).toHaveLength(1);
    expect(list.body.data.vehicles[0]._id).toBe(response.body.data.vehicle._id);
  });

  it('lists only vehicles owned by the authenticated customer', async () => {
    const agentA = request.agent(app);
    const agentB = request.agent(app);
    await registerCustomer(agentA, 'veh-a');
    await registerCustomer(agentB, 'veh-b');

    const createA = await agentA.post('/api/vehicles').send(vehiclePayload({ model: 'Leaf A' }));
    expect(createA.status).toBe(201);
    const createB = await agentB.post('/api/vehicles').send(vehiclePayload({ model: 'Leaf B' }));
    expect(createB.status).toBe(201);

    const listA = await agentA.get('/api/vehicles');
    expect(listA.status).toBe(200);
    expect(listA.body.data.vehicles).toHaveLength(1);
    expect(listA.body.data.vehicles[0].model).toBe('Leaf A');

    const listB = await agentB.get('/api/vehicles');
    expect(listB.status).toBe(200);
    expect(listB.body.data.vehicles).toHaveLength(1);
    expect(listB.body.data.vehicles[0].model).toBe('Leaf B');
  });

  it('creates a booking validating ownership and compatibility, and rejects insufficient availability', async () => {
    const supplierAgent = request.agent(app);
    const customerAgent = request.agent(app);
    const otherCustomerAgent = request.agent(app);
    await registerSupplier(supplierAgent, 'book-sup');
    await registerCustomer(customerAgent, 'book-cust');
    await registerCustomer(otherCustomerAgent, 'book-other');

    const stationRes = await supplierAgent.post('/api/stations').send(stationPayload());
    expect(stationRes.status).toBe(201);
    const stationId = stationRes.body.data.station._id as string;
    const terminalRes = await supplierAgent
      .post(`/api/stations/${stationId}/terminals`)
      .send(terminalPayload({ capacity: 1, connectorTypes: ['Type 2'] }));
    expect(terminalRes.status).toBe(201);
    const terminalId = terminalRes.body.data.terminal._id as string;

    const vehicleRes = await customerAgent.post('/api/vehicles').send(vehiclePayload({ connectorTypes: ['Type 2'] }));
    expect(vehicleRes.status).toBe(201);
    const vehicleId = vehicleRes.body.data.vehicle._id as string;
    const otherVehicleRes = await otherCustomerAgent.post('/api/vehicles').send(vehiclePayload({ model: 'Other' }));
    expect(otherVehicleRes.status).toBe(201);
    const otherVehicleId = otherVehicleRes.body.data.vehicle._id as string;

    const start = new Date('2026-12-01T10:00:00.000Z').toISOString();
    const end = new Date('2026-12-01T11:00:00.000Z').toISOString();

    // cannot book using another customer's vehicle
    const forbidden = await customerAgent.post('/api/bookings').send({
      vehicleId: otherVehicleId,
      stationId,
      terminalId,
      requestedStartTime: start,
      requestedEndTime: end,
    });
    expect(forbidden.status).toBe(403);

    // incompatible connector
    const incompatibleVehicle = await customerAgent.post('/api/vehicles').send(
      vehiclePayload({ model: 'CHAdeMO Car', connectorTypes: ['CHAdeMO'] })
    );
    const incompatible = await customerAgent.post('/api/bookings').send({
      vehicleId: incompatibleVehicle.body.data.vehicle._id,
      stationId,
      terminalId,
      requestedStartTime: start,
      requestedEndTime: end,
    });
    expect(incompatible.status).toBe(400);

    // successful booking
    const created = await customerAgent.post('/api/bookings').send({
      vehicleId,
      stationId,
      terminalId,
      requestedStartTime: start,
      requestedEndTime: end,
    });
    expect(created.status).toBe(201);
    expect(created.body.success).toBe(true);
    expect(created.body.data.booking.customerId).toBeTruthy();
    expect(created.body.data.booking.stationId).toBe(stationId);
    expect(created.body.data.booking.terminalId).toBe(terminalId);
    expect(created.body.data.booking.status).toBe('PENDING_SUPPLIER');

    // insufficient availability (capacity reached for overlapping window)
    const secondVehicle = await customerAgent.post('/api/vehicles').send(
      vehiclePayload({ model: 'Leaf 2', connectorTypes: ['Type 2'] })
    );
    const conflict = await customerAgent.post('/api/bookings').send({
      vehicleId: secondVehicle.body.data.vehicle._id,
      stationId,
      terminalId,
      requestedStartTime: new Date('2026-12-01T10:30:00.000Z').toISOString(),
      requestedEndTime: new Date('2026-12-01T11:30:00.000Z').toISOString(),
    });
    expect(conflict.status).toBe(409);
  });

  it('lists only bookings owned by the authenticated customer', async () => {
    const supplierAgent = request.agent(app);
    const agentA = request.agent(app);
    const agentB = request.agent(app);
    await registerSupplier(supplierAgent, 'list-sup');
    await registerCustomer(agentA, 'list-a');
    await registerCustomer(agentB, 'list-b');

    const stationRes = await supplierAgent.post('/api/stations').send(stationPayload());
    const stationId = stationRes.body.data.station._id as string;
    const terminalRes = await supplierAgent
      .post(`/api/stations/${stationId}/terminals`)
      .send(terminalPayload({ capacity: 5 }));
    const terminalId = terminalRes.body.data.terminal._id as string;

    const vehicleA = await agentA.post('/api/vehicles').send(vehiclePayload({ model: 'A' }));
    const vehicleB = await agentB.post('/api/vehicles').send(vehiclePayload({ model: 'B' }));

    const bookingA = await agentA.post('/api/bookings').send({
      vehicleId: vehicleA.body.data.vehicle._id,
      stationId,
      terminalId,
      requestedStartTime: '2026-12-02T10:00:00.000Z',
      requestedEndTime: '2026-12-02T11:00:00.000Z',
    });
    expect(bookingA.status).toBe(201);

    const bookingB = await agentB.post('/api/bookings').send({
      vehicleId: vehicleB.body.data.vehicle._id,
      stationId,
      terminalId,
      requestedStartTime: '2026-12-02T12:00:00.000Z',
      requestedEndTime: '2026-12-02T13:00:00.000Z',
    });
    expect(bookingB.status).toBe(201);

    const listA = await agentA.get('/api/bookings');
    expect(listA.status).toBe(200);
    expect(listA.body.data.bookings).toHaveLength(1);
    expect(listA.body.data.bookings[0]._id).toBe(bookingA.body.data.booking._id);

    const listB = await agentB.get('/api/bookings');
    expect(listB.status).toBe(200);
    expect(listB.body.data.bookings).toHaveLength(1);
    expect(listB.body.data.bookings[0]._id).toBe(bookingB.body.data.booking._id);
  });
});
