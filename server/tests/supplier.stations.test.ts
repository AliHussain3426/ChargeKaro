import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index.js';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';

async function resetDatabase(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

async function registerSupplier(agent: request.Agent, suffix: string) {
  const response = await agent.post('/api/auth/register/supplier').send({
    name: `Supplier ${suffix}`,
    businessName: `Business ${suffix}`,
    email: `supplier.${suffix}@example.com`,
    phone: '+923001112233',
    password: 'password123',
    passwordConfirm: 'password123',
  });

  expect(response.status).toBe(201);
  return response.body.data.user;
}

function stationPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Gulberg Charge Hub',
    description: 'Fast chargers near main boulevard',
    address: 'Main Boulevard, Gulberg, Lahore',
    city: 'Lahore',
    province: 'Punjab',
    country: 'Pakistan',
    location: { coordinates: [74.3436, 31.5204] },
    pricing: { amount: 55, currency: 'PKR', billingType: 'PER_KWH' },
    operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '23:00' },
    ...overrides,
  };
}

function terminalPayload(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Terminal GC-01',
    chargingMethod: 'DC',
    connectorTypes: ['CCS2'],
    maximumPowerKw: 50,
    capacity: 1,
    pricing: { amount: 60, currency: 'PKR', billingType: 'PER_KWH' },
    status: 'AVAILABLE',
    availability: true,
    ...overrides,
  };
}

describe('Supplier stations and terminals management', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('creates a station for the authenticated supplier (201) linked to their supplier profile', async () => {
    const agent = request.agent(app);
    await registerSupplier(agent, 'create');

    const response = await agent.post('/api/stations').send(stationPayload());

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.station.name).toBe('Gulberg Charge Hub');
    expect(response.body.data.station.address).toBe('Main Boulevard, Gulberg, Lahore');
    expect(response.body.data.station.location.coordinates).toEqual([74.3436, 31.5204]);
    expect(response.body.data.station.supplierId).toBeTruthy();

    const listResponse = await agent.get('/api/stations');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.stations).toHaveLength(1);
    expect(listResponse.body.data.stations[0]._id).toBe(response.body.data.station._id);
  });

  it('lists only stations owned by the authenticated supplier', async () => {
    const agentA = request.agent(app);
    const agentB = request.agent(app);
    await registerSupplier(agentA, 'ownera');
    await registerSupplier(agentB, 'ownerb');

    const createA = await agentA.post('/api/stations').send(stationPayload({ name: 'Station A' }));
    expect(createA.status).toBe(201);
    const createB = await agentB.post('/api/stations').send(stationPayload({ name: 'Station B' }));
    expect(createB.status).toBe(201);

    const listA = await agentA.get('/api/stations');
    expect(listA.status).toBe(200);
    expect(listA.body.data.stations).toHaveLength(1);
    expect(listA.body.data.stations[0].name).toBe('Station A');

    const listB = await agentB.get('/api/stations');
    expect(listB.status).toBe(200);
    expect(listB.body.data.stations).toHaveLength(1);
    expect(listB.body.data.stations[0].name).toBe('Station B');
  });

  it('creates a terminal under the supplier’s own station', async () => {
    const agent = request.agent(app);
    await registerSupplier(agent, 'terminal-owner');

    const stationResponse = await agent.post('/api/stations').send(stationPayload());
    const stationId = stationResponse.body.data.station._id as string;

    const response = await agent
      .post(`/api/stations/${stationId}/terminals`)
      .send(terminalPayload());

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.terminal.name).toBe('Terminal GC-01');
    expect(response.body.data.terminal.stationId).toBe(stationId);
    expect(response.body.data.terminal.maximumPowerKw).toBe(50);

    const listResponse = await agent.get(`/api/stations/${stationId}/terminals`);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.terminals).toHaveLength(1);
    expect(listResponse.body.data.terminals[0]._id).toBe(response.body.data.terminal._id);
  });

  it('denies creating a terminal under another supplier’s station (403)', async () => {
    const agentA = request.agent(app);
    const agentB = request.agent(app);
    await registerSupplier(agentA, 'station-owner-a');
    await registerSupplier(agentB, 'intruder-b');

    const stationResponse = await agentA.post('/api/stations').send(stationPayload());
    const stationId = stationResponse.body.data.station._id as string;

    const response = await agentB
      .post(`/api/stations/${stationId}/terminals`)
      .send(terminalPayload());

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);

    const terminalsAsOwner = await agentA.get(`/api/stations/${stationId}/terminals`);
    expect(terminalsAsOwner.status).toBe(200);
    expect(terminalsAsOwner.body.data.terminals).toHaveLength(0);
  });

  it('updates, toggles status, and deletes a terminal owned by the supplier', async () => {
    const agent = request.agent(app);
    await registerSupplier(agent, 'terminal-crud');

    const stationResponse = await agent.post('/api/stations').send(stationPayload());
    const stationId = stationResponse.body.data.station._id as string;
    const terminalResponse = await agent
      .post(`/api/stations/${stationId}/terminals`)
      .send(terminalPayload());
    const terminalId = terminalResponse.body.data.terminal._id as string;

    const updateResponse = await agent
      .patch(`/api/stations/${stationId}/terminals/${terminalId}`)
      .send({ name: 'Terminal GC-01 Updated', maximumPowerKw: 60 });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.terminal.name).toBe('Terminal GC-01 Updated');
    expect(updateResponse.body.data.terminal.maximumPowerKw).toBe(60);

    const statusResponse = await agent
      .patch(`/api/stations/${stationId}/terminals/${terminalId}/status`)
      .send({ status: 'OCCUPIED', availability: false });
    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.data.terminal.status).toBe('OCCUPIED');
    expect(statusResponse.body.data.terminal.availability).toBe(false);

    const deleteResponse = await agent.delete(`/api/stations/${stationId}/terminals/${terminalId}`);
    expect(deleteResponse.status).toBe(200);

    const listResponse = await agent.get(`/api/stations/${stationId}/terminals`);
    expect(listResponse.body.data.terminals).toHaveLength(0);
  });

  it('updates and deletes a station owned by the supplier', async () => {
    const agent = request.agent(app);
    await registerSupplier(agent, 'station-crud');

    const createResponse = await agent.post('/api/stations').send(stationPayload());
    const stationId = createResponse.body.data.station._id as string;

    const updateResponse = await agent.patch(`/api/stations/${stationId}`).send({
      name: 'Updated Hub',
      pricing: { amount: 70, currency: 'PKR', billingType: 'PER_KWH' },
    });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.station.name).toBe('Updated Hub');
    expect(updateResponse.body.data.station.pricing.amount).toBe(70);

    const deleteResponse = await agent.delete(`/api/stations/${stationId}`);
    expect(deleteResponse.status).toBe(200);

    const listResponse = await agent.get('/api/stations');
    expect(listResponse.body.data.stations).toHaveLength(0);
  });
});
