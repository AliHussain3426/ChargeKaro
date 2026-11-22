import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index.js';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';

async function resetDatabase(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
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

async function registerCustomer(agent: request.Agent, suffix: string) {
  const res = await agent.post('/api/auth/register/customer').send({
    name: `Customer ${suffix}`,
    email: `customer.${suffix}@example.com`,
    password: 'password123',
    passwordConfirm: 'password123',
  });
  expect(res.status).toBe(201);
}

function stationPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Station A',
    address: 'Main Road',
    city: 'Lahore',
    location: { coordinates: [74.3436, 31.5204] },
    pricing: { amount: 50, currency: 'PKR', billingType: 'PER_KWH' },
    operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '22:00' },
    ...overrides,
  };
}

function terminalPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: 'T1',
    chargingMethod: 'DC',
    connectorTypes: ['CCS2'],
    maximumPowerKw: 50,
    capacity: 1,
    pricing: { amount: 55, currency: 'PKR', billingType: 'PER_KWH' },
    status: 'AVAILABLE',
    availability: true,
    ...overrides,
  };
}

describe('Discovery and routing', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('returns stations within radius with available terminals', async () => {
    const supplier = request.agent(app);
    const customer = request.agent(app);
    await registerSupplier(supplier, 'disc1');
    await registerCustomer(customer, 'disc1');

    // Station near Lahore center
    const s1 = await supplier.post('/api/stations').send(
      stationPayload({ name: 'Near Station', location: { coordinates: [74.3436, 31.5204] } })
    );
    expect(s1.status).toBe(201);
    const nearId = s1.body.data.station._id as string;
    await supplier.post(`/api/stations/${nearId}/terminals`).send(
      terminalPayload({ status: 'AVAILABLE', availability: true })
    );

    // Station far away (Karachi)
    const s2 = await supplier.post('/api/stations').send(
      stationPayload({ name: 'Far Station', city: 'Karachi', location: { coordinates: [67.0011, 24.8607] } })
    );
    expect(s2.status).toBe(201);
    const farId = s2.body.data.station._id as string;
    await supplier.post(`/api/stations/${farId}/terminals`).send(
      terminalPayload({ status: 'AVAILABLE', availability: true })
    );

    const res = await customer.get('/api/discovery/stations').query({
      lat: 31.5204,
      lng: 74.3436,
      radius: 10,
      available: true,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const stations = res.body.data.stations as any[];
    expect(stations.length).toBe(1);
    expect(stations[0].name).toBe('Near Station');
    expect(stations[0].availableTerminalCount).toBe(1);
    expect(stations[0].terminals.length).toBe(1);
  });

  it('filters discovery by connector and power', async () => {
    const supplier = request.agent(app);
    const customer = request.agent(app);
    await registerSupplier(supplier, 'disc2');
    await registerCustomer(customer, 'disc2');

    const s1 = await supplier.post('/api/stations').send(
      stationPayload({ name: 'Fast CCS', location: { coordinates: [74.35, 31.52] } })
    );
    const id1 = s1.body.data.station._id as string;
    await supplier.post(`/api/stations/${id1}/terminals`).send(
      terminalPayload({ connectorTypes: ['CCS2'], maximumPowerKw: 60, status: 'AVAILABLE', availability: true })
    );

    const s2 = await supplier.post('/api/stations').send(
      stationPayload({ name: 'Slow Type2', location: { coordinates: [74.351, 31.521] } })
    );
    const id2 = s2.body.data.station._id as string;
    await supplier.post(`/api/stations/${id2}/terminals`).send(
      terminalPayload({ connectorTypes: ['Type 2'], maximumPowerKw: 22, status: 'AVAILABLE', availability: true })
    );

    const byConnector = await customer.get('/api/discovery/stations').query({
      lat: 31.52,
      lng: 74.35,
      radius: 20,
      connector: 'CCS2',
    });
    expect(byConnector.status).toBe(200);
    expect(byConnector.body.data.stations).toHaveLength(1);
    expect(byConnector.body.data.stations[0].name).toBe('Fast CCS');

    const byPower = await customer.get('/api/discovery/stations').query({
      lat: 31.52,
      lng: 74.35,
      radius: 20,
      minPower: 50,
    });
    expect(byPower.status).toBe(200);
    expect(byPower.body.data.stations).toHaveLength(1);
    expect(byPower.body.data.stations[0].name).toBe('Fast CCS');
  });

  it('returns route distance and geometry from routing endpoint', async () => {
    const customer = request.agent(app);
    await registerCustomer(customer, 'route1');

    const mockRoute = {
      routes: [
        {
          distance: 1234.5,
          duration: 456.7,
          geometry: {
            type: 'LineString',
            coordinates: [
              [74.3436, 31.5204],
              [74.35, 31.53],
            ],
          },
        },
      ],
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockRoute,
    } as any);

    const res = await customer.get('/api/routes').query({
      originLat: 31.5204,
      originLng: 74.3436,
      destLat: 31.53,
      destLng: 74.35,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.route.distanceMeters).toBe(1234.5);
    expect(res.body.data.route.durationSeconds).toBe(456.7);
    expect(res.body.data.route.geometry.type).toBe('LineString');
    expect(res.body.data.route.geometry.coordinates).toHaveLength(2);
    expect(fetchSpy).toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
