import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';
import { authenticate, authorize } from '../src/middleware/auth.js';
import {
  authorizeCustomerVehicle,
  authorizeCustomerBooking,
  authorizeSupplierStation,
  authorizeSupplierTerminal,
} from '../src/middleware/ownership.js';
import { User, SupplierProfile } from '../src/modules/auth/model.js';
import { Vehicle } from '../src/modules/vehicles/model.js';
import { Booking } from '../src/modules/bookings/model.js';
import { Station } from '../src/modules/stations/model.js';
import { Terminal } from '../src/modules/terminals/model.js';
import { signAccessToken } from '../src/utils/jwt.js';

function buildRbacApp(): express.Express {
  const app = express();
  app.get('/api/roles/supplier-only', authenticate, authorize('SUPPLIER'), (_req, res) => {
    res.json({ success: true, data: { role: 'SUPPLIER' } });
  });
  app.get('/api/roles/customer-only', authenticate, authorize('CUSTOMER'), (_req, res) => {
    res.json({ success: true, data: { role: 'CUSTOMER' } });
  });
  app.get('/api/roles/admin-only', authenticate, authorize('ADMIN'), (_req, res) => {
    res.json({ success: true, data: { role: 'ADMIN' } });
  });
  return app;
}

function buildOwnershipApp(): express.Express {
  const app = express();
  app.get(
    '/api/vehicles/:vehicleId',
    authenticate,
    authorize('CUSTOMER'),
    authorizeCustomerVehicle,
    (req, res) => {
      res.json({ success: true, data: { vehicleId: req.params.vehicleId } });
    }
  );
  app.get(
    '/api/bookings/:bookingId',
    authenticate,
    authorize('CUSTOMER'),
    authorizeCustomerBooking,
    (req, res) => {
      res.json({ success: true, data: { bookingId: req.params.bookingId } });
    }
  );
  app.get(
    '/api/stations/:stationId',
    authenticate,
    authorize('SUPPLIER'),
    authorizeSupplierStation,
    (req, res) => {
      res.json({ success: true, data: { stationId: req.params.stationId } });
    }
  );
  app.get(
    '/api/terminals/:terminalId',
    authenticate,
    authorize('SUPPLIER'),
    authorizeSupplierTerminal,
    (req, res) => {
      res.json({ success: true, data: { terminalId: req.params.terminalId } });
    }
  );
  return app;
}

function bearer(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

async function createUserWithToken(role: 'CUSTOMER' | 'SUPPLIER' | 'ADMIN', email: string) {
  const user = await new User({
    name: `User ${email}`,
    email,
    passwordHash: 'hashed-password-placeholder-value',
    role,
    accountStatus: 'ACTIVE',
    verificationStatus: 'UNVERIFIED',
  }).save();
  const token = signAccessToken({ userId: user._id.toString(), email: user.email, role: user.role });
  return { user, token };
}

describe('Auth module - RBAC', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  it('rejects unauthenticated access to protected role routes', async () => {
    const response = await request(buildRbacApp()).get('/api/roles/supplier-only');
    expect(response.status).toBe(401);
  });

  it('allows suppliers on supplier-only routes but rejects customers', async () => {
    const app = buildRbacApp();
    const { token: customerToken } = await createUserWithToken('CUSTOMER', 'rbac.customer@example.com');
    const { token: supplierToken } = await createUserWithToken('SUPPLIER', 'rbac.supplier@example.com');

    const customerResponse = await request(app)
      .get('/api/roles/supplier-only')
      .set(bearer(customerToken));
    expect(customerResponse.status).toBe(403);

    const supplierResponse = await request(app)
      .get('/api/roles/supplier-only')
      .set(bearer(supplierToken));
    expect(supplierResponse.status).toBe(200);
  });

  it('allows customers on customer-only routes but rejects suppliers', async () => {
    const app = buildRbacApp();
    const { token: customerToken } = await createUserWithToken('CUSTOMER', 'rbac.customer2@example.com');
    const { token: supplierToken } = await createUserWithToken('SUPPLIER', 'rbac.supplier2@example.com');

    const customerResponse = await request(app)
      .get('/api/roles/customer-only')
      .set(bearer(customerToken));
    expect(customerResponse.status).toBe(200);

    const supplierResponse = await request(app)
      .get('/api/roles/customer-only')
      .set(bearer(supplierToken));
    expect(supplierResponse.status).toBe(403);
  });

  it('allows admins on admin-only routes but rejects customers', async () => {
    const app = buildRbacApp();
    const { token: customerToken } = await createUserWithToken('CUSTOMER', 'rbac.customer3@example.com');
    const { token: adminToken } = await createUserWithToken('ADMIN', 'rbac.admin@example.com');

    const customerResponse = await request(app)
      .get('/api/roles/admin-only')
      .set(bearer(customerToken));
    expect(customerResponse.status).toBe(403);

    const adminResponse = await request(app)
      .get('/api/roles/admin-only')
      .set(bearer(adminToken));
    expect(adminResponse.status).toBe(200);
  });
});

describe('Auth module - ownership', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  it('lets a customer access their own vehicle but denies another customer', async () => {
    const app = buildOwnershipApp();
    const owner = await createUserWithToken('CUSTOMER', 'vehicle.owner@example.com');
    const other = await createUserWithToken('CUSTOMER', 'vehicle.other@example.com');

    const vehicle = await new Vehicle({
      customerId: owner.user._id,
      manufacturer: 'Nissan',
      model: 'Leaf',
      vehicleCategory: 'ELECTRIC_CAR',
    }).save();

    const ownerResponse = await request(app)
      .get(`/api/vehicles/${vehicle._id.toString()}`)
      .set(bearer(owner.token));
    expect(ownerResponse.status).toBe(200);

    const otherResponse = await request(app)
      .get(`/api/vehicles/${vehicle._id.toString()}`)
      .set(bearer(other.token));
    expect(otherResponse.status).toBe(403);
  });

  it('lets a customer access their own booking but denies another customer', async () => {
    const app = buildOwnershipApp();
    const owner = await createUserWithToken('CUSTOMER', 'booking.owner@example.com');
    const other = await createUserWithToken('CUSTOMER', 'booking.other@example.com');

    const booking = await new Booking({
      bookingReference: 'BK-RBAC-OWNERSHIP-0001',
      customerId: owner.user._id,
      supplierId: owner.user._id,
      vehicleId: owner.user._id,
      stationId: owner.user._id,
      terminalId: owner.user._id,
      requestedStartTime: new Date('2026-11-20T10:00:00.000Z'),
      requestedEndTime: new Date('2026-11-20T12:00:00.000Z'),
      priceSnapshot: { amount: 300, currency: 'PKR', billingType: 'PER_KWH' },
      status: 'PENDING_SUPPLIER',
      paymentStatus: 'UNPAID',
    }).save();

    const ownerResponse = await request(app)
      .get(`/api/bookings/${booking._id.toString()}`)
      .set(bearer(owner.token));
    expect(ownerResponse.status).toBe(200);

    const otherResponse = await request(app)
      .get(`/api/bookings/${booking._id.toString()}`)
      .set(bearer(other.token));
    expect(otherResponse.status).toBe(403);
  });

  it('lets a supplier access their own station but denies another supplier', async () => {
    const app = buildOwnershipApp();
    const owner = await createUserWithToken('SUPPLIER', 'station.owner@example.com');
    const other = await createUserWithToken('SUPPLIER', 'station.other@example.com');

    const ownerProfile = await new SupplierProfile({
      user: owner.user._id,
      businessName: 'Owner Charging Services',
      verificationStatus: 'UNVERIFIED',
    }).save();

    const station = await new Station({
      supplierId: ownerProfile._id,
      name: 'Owner Charge Hub',
      address: '1 Owner Street, Karachi',
      location: { type: 'Point', coordinates: [67.0384, 24.8615] },
      pricing: { amount: 150, currency: 'PKR', billingType: 'PER_KWH' },
      operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '23:00' },
    }).save();

    const ownerResponse = await request(app)
      .get(`/api/stations/${station._id.toString()}`)
      .set(bearer(owner.token));
    expect(ownerResponse.status).toBe(200);

    const otherResponse = await request(app)
      .get(`/api/stations/${station._id.toString()}`)
      .set(bearer(other.token));
    expect(otherResponse.status).toBe(403);
  });

  it('lets a supplier access their own terminal but denies another supplier', async () => {
    const app = buildOwnershipApp();
    const owner = await createUserWithToken('SUPPLIER', 'terminal.owner@example.com');
    const other = await createUserWithToken('SUPPLIER', 'terminal.other@example.com');

    const ownerProfile = await new SupplierProfile({
      user: owner.user._id,
      businessName: 'Terminal Owner Charging Services',
      verificationStatus: 'UNVERIFIED',
    }).save();

    const station = await new Station({
      supplierId: ownerProfile._id,
      name: 'Terminal Owner Charge Hub',
      address: '2 Terminal Avenue, Karachi',
      location: { type: 'Point', coordinates: [67.0484, 24.8715] },
      pricing: { amount: 150, currency: 'PKR', billingType: 'PER_KWH' },
      operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '23:00' },
    }).save();

    const terminal = await new Terminal({
      stationId: station._id,
      name: 'Terminal TO-01',
      chargingMethod: 'AC',
      connectorTypes: ['TYPE_2'],
      maximumPowerKw: 22,
      capacity: 1,
      pricing: { amount: 60, currency: 'PKR', billingType: 'PER_KWH' },
      status: 'AVAILABLE',
      availability: true,
    }).save();

    const ownerResponse = await request(app)
      .get(`/api/terminals/${terminal._id.toString()}`)
      .set(bearer(owner.token));
    expect(ownerResponse.status).toBe(200);

    const otherResponse = await request(app)
      .get(`/api/terminals/${terminal._id.toString()}`)
      .set(bearer(other.token));
    expect(otherResponse.status).toBe(403);
  });
});
