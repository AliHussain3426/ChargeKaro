import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index.js';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';
import { User } from '../src/modules/auth/model.js';

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
  return res.body.data.user;
}

async function loginAs(email: string, password = 'password123') {
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/login').send({ email, password });
  expect(res.status).toBe(200);
  return agent;
}

async function promoteToAdmin(email: string) {
  await User.updateOne({ email }, { $set: { role: 'ADMIN' } } as any).exec();
}

async function setupStationTerminal(supplier: request.Agent) {
  const stationRes = await supplier.post('/api/stations').send({
    name: 'Admin Station',
    address: '123 Test Road',
    city: 'Lahore',
    location: { coordinates: [74.3436, 31.5204] },
    pricing: { amount: 50, currency: 'PKR', billingType: 'PER_KWH' },
    operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '22:00' },
  });
  expect(stationRes.status).toBe(201);
  const stationId = stationRes.body.data.station._id as string;
  const terminalRes = await supplier.post(`/api/stations/${stationId}/terminals`).send({
    name: 'Terminal A-1',
    chargingMethod: 'DC',
    connectorTypes: ['Type 2'],
    maximumPowerKw: 50,
    capacity: 1,
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

describe('Admin module', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('enforces admin-only RBAC on admin routes', async () => {
    const customer = request.agent(app);
    const supplier = request.agent(app);
    await registerCustomer(customer, 'rbac');
    await registerSupplier(supplier, 'rbac');

    const asCustomer = await customer.get('/api/admin/overview');
    expect(asCustomer.status).toBe(403);

    const asSupplier = await supplier.get('/api/admin/overview');
    expect(asSupplier.status).toBe(403);

    const anon = await request(app).get('/api/admin/overview');
    expect(anon.status).toBe(401);
  });

  it('prevents admin from modifying customer/supplier PII without permission', async () => {
    const customerAgent = request.agent(app);
    const supplierAgent = request.agent(app);
    const customer = await registerCustomer(customerAgent, 'pii');
    await registerSupplier(supplierAgent, 'pii');

    await promoteToAdmin('customer.pii@example.com');
    const admin = await loginAs('customer.pii@example.com');

    // attempt to modify another user's PII should be forbidden
    const supplierUser = await User.findOne({ email: 'supplier.pii@example.com' }).exec();
    expect(supplierUser).toBeTruthy();

    const piiAttempt = await admin.patch(`/api/admin/users/${supplierUser!._id.toString()}`).send({ email: 'hacked@example.com', name: 'Hacked' });
    expect(piiAttempt.status).toBe(403);

    // allowed non-PII oversight update
    const statusUpdate = await admin.patch(`/api/admin/users/${supplierUser!._id.toString()}`).send({ accountStatus: 'SUSPENDED' });
    expect(statusUpdate.status).toBe(200);
  });

  it('returns admin overview aggregates and oversight data', async () => {
    const supplier = request.agent(app);
    const customer = request.agent(app);
    const adminSeed = request.agent(app);

    await registerSupplier(supplier, 'agg');
    await registerCustomer(customer, 'agg');
    await registerCustomer(adminSeed, 'admin');

    const { stationId, terminalId } = await setupStationTerminal(supplier);
    const vehicleId = await createVehicle(customer, 'agg');
    const bookingRes = await customer.post('/api/bookings').send({
      vehicleId,
      stationId,
      terminalId,
      requestedStartTime: '2026-12-15T10:00:00.000Z',
      requestedEndTime: '2026-12-15T11:00:00.000Z',
    });
    expect(bookingRes.status).toBe(201);

    await promoteToAdmin('customer.admin@example.com');
    const admin = await loginAs('customer.admin@example.com');

    const overview = await admin.get('/api/admin/overview');
    expect(overview.status).toBe(200);
    const counts = overview.body.data.overview.counts;
    expect(counts.users).toBeGreaterThanOrEqual(3);
    expect(counts.customers).toBeGreaterThanOrEqual(1);
    expect(counts.suppliers).toBeGreaterThanOrEqual(1);
    expect(counts.stations).toBe(1);
    expect(counts.terminals).toBe(1);
    expect(counts.bookings).toBe(1);
    expect(typeof counts.pendingBookings).toBe('number');

    const users = await admin.get('/api/admin/users');
    expect(users.status).toBe(200);
    expect(Array.isArray(users.body.data.users)).toBe(true);

    const bookings = await admin.get('/api/admin/bookings');
    expect(bookings.status).toBe(200);
    expect(bookings.body.data.bookings.length).toBe(1);

    const reports = await admin.get('/api/admin/reports');
    expect(reports.status).toBe(200);
    expect(reports.body.data.reports.counts.bookings).toBe(1);
  });

  it('allows admin to suspend and delete users, and suspend/delete stations', async () => {
    const adminSeed = request.agent(app);
    const customer = request.agent(app);
    const supplier = request.agent(app);
    await registerCustomer(adminSeed, 'ops-admin');
    await registerCustomer(customer, 'ops-customer');
    await registerSupplier(supplier, 'ops-supplier');
    await promoteToAdmin('customer.ops-admin@example.com');
    const admin = await loginAs('customer.ops-admin@example.com');

    const customerUser = await User.findOne({ email: 'customer.ops-customer@example.com' }).exec();
    expect(customerUser).toBeTruthy();

    const suspendRes = await admin.patch(`/api/admin/users/${customerUser!._id.toString()}`).send({ accountStatus: 'SUSPENDED' });
    expect(suspendRes.status).toBe(200);

    const blockedLogin = await request(app).post('/api/auth/login').send({ email: 'customer.ops-customer@example.com', password: 'password123' });
    expect(blockedLogin.status).toBe(403);
    expect(String(blockedLogin.body.message)).toMatch(/suspended/i);

    const deleteRes = await admin.delete(`/api/admin/users/${customerUser!._id.toString()}`);
    expect(deleteRes.status).toBe(200);
    expect(await User.findById(customerUser!._id).exec()).toBeNull();

    const { stationId } = await setupStationTerminal(supplier);
    const suspendStation = await admin.patch(`/api/admin/stations/${stationId}`).send({ status: 'SUSPENDED' });
    expect(suspendStation.status).toBe(200);
    expect(suspendStation.body.data.station.status).toBe('SUSPENDED');

    const reactivateStation = await admin.patch(`/api/admin/stations/${stationId}`).send({ status: 'ACTIVE' });
    expect(reactivateStation.status).toBe(200);
    expect(reactivateStation.body.data.station.status).toBe('ACTIVE');

    const deleteStationBlocked = await admin.delete(`/api/admin/stations/${stationId}`);
    expect(deleteStationBlocked.status).toBe(409); // has terminal

    // remove terminal first via supplier agent then delete
    const terminals = await supplier.get(`/api/stations/${stationId}/terminals`);
    const terminalId = terminals.body.data.terminals[0]._id;
    const delTerminal = await supplier.delete(`/api/terminals/${terminalId}`);
    expect(delTerminal.status).toBe(200);

    const deleteStation = await admin.delete(`/api/admin/stations/${stationId}`);
    expect(deleteStation.status).toBe(200);
  });

  it('requires admin verification before supplier can login', async () => {
    const adminSeed = request.agent(app);
    await registerCustomer(adminSeed, 'verify-admin');
    await promoteToAdmin('customer.verify-admin@example.com');
    const admin = await loginAs('customer.verify-admin@example.com');

    const supplierReg = await request(app).post('/api/auth/register/supplier').send({
      name: 'Pending Supplier',
      businessName: 'Pending Business',
      email: 'pending.supplier@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });
    expect(supplierReg.status).toBe(201);
    expect(supplierReg.body.data.pendingVerification).toBe(true);
    expect(String(supplierReg.body.message)).toMatch(/24 hours/i);

    const blockedLogin = await request(app).post('/api/auth/login').send({ email: 'pending.supplier@example.com', password: 'password123' });
    expect(blockedLogin.status).toBe(403);
    expect(String(blockedLogin.body.message)).toMatch(/pending admin verification/i);

    const pendingProfile = await (await import('../src/modules/auth/model.js')).SupplierProfile.findOne({ businessName: 'Pending Business' }).exec();
    expect(pendingProfile).toBeTruthy();

    const approve = await admin.patch(`/api/admin/suppliers/${pendingProfile!._id.toString()}`).send({ verificationStatus: 'VERIFIED' });
    expect(approve.status).toBe(200);

    const login = await request(app).post('/api/auth/login').send({ email: 'pending.supplier@example.com', password: 'password123' });
    expect(login.status).toBe(200);
    expect(login.body.data.user.role).toBe('SUPPLIER');
  });
});
