import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index.js';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';

async function resetDatabase(): Promise<void> {
  const collections = mongoose.connection.collections;
  await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
}

describe('E2E integration: full charging journey', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('customer registers, adds vehicle, finds station, books, supplier accepts, payment completes, session completes', async () => {
    const supplier = request.agent(app);
    const customer = request.agent(app);

    // Register supplier and create station/terminal
    const supplierReg = await supplier.post('/api/auth/register/supplier').send({
      name: 'Supplier E2E',
      businessName: 'E2E Charging Co',
      email: 'supplier.e2e@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });
    expect(supplierReg.status).toBe(201);

    const stationRes = await supplier.post('/api/stations').send({
      name: 'E2E Hub',
      address: 'Main Boulevard',
      city: 'Lahore',
      location: { coordinates: [74.3436, 31.5204] },
      pricing: { amount: 60, currency: 'PKR', billingType: 'PER_KWH' },
      operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '22:00' },
    });
    expect(stationRes.status).toBe(201);
    const stationId = stationRes.body.data.station._id as string;

    const terminalRes = await supplier.post(`/api/stations/${stationId}/terminals`).send({
      name: 'E2E-1',
      chargingMethod: 'DC',
      connectorTypes: ['Type 2'],
      maximumPowerKw: 50,
      capacity: 1,
      pricing: { amount: 60, currency: 'PKR', billingType: 'PER_KWH' },
      status: 'AVAILABLE',
      availability: true,
    });
    expect(terminalRes.status).toBe(201);
    const terminalId = terminalRes.body.data.terminal._id as string;

    // Customer registers
    const customerReg = await customer.post('/api/auth/register/customer').send({
      name: 'Customer E2E',
      email: 'customer.e2e@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });
    expect(customerReg.status).toBe(201);

    // Add vehicle
    const vehicleRes = await customer.post('/api/vehicles').send({
      manufacturer: 'Nissan',
      model: 'Leaf',
      vehicleCategory: 'ELECTRIC_CAR',
      connectorTypes: ['Type 2'],
    });
    expect(vehicleRes.status).toBe(201);
    const vehicleId = vehicleRes.body.data.vehicle._id as string;

    // Find station (discovery)
    const discoveryRes = await customer.get('/api/discovery').query({ lat: 31.5204, lng: 74.3436, radius: 10 });
    expect(discoveryRes.status).toBe(200);
    const discovered = discoveryRes.body.data.stations as any[];
    expect(discovered.some((s) => s._id === stationId)).toBe(true);

    // Book
    const bookingRes = await customer.post('/api/bookings').send({
      vehicleId,
      stationId,
      terminalId,
      requestedStartTime: '2026-12-20T10:00:00.000Z',
      requestedEndTime: '2026-12-20T11:00:00.000Z',
    });
    expect(bookingRes.status).toBe(201);
    const bookingId = bookingRes.body.data.booking._id as string;
    expect(bookingRes.body.data.booking.status).toBe('PENDING_SUPPLIER');

    // Supplier sees request and accepts
    const supplierBookings = await supplier.get('/api/bookings');
    expect(supplierBookings.status).toBe(200);
    expect((supplierBookings.body.data.bookings as any[]).some((b) => b._id === bookingId)).toBe(true);

    const acceptRes = await supplier.post(`/api/bookings/${bookingId}/accept`);
    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.data.booking.status).toBe('ACCEPTED_AWAITING_PAYMENT');

    // Customer payment (stub flow) -> confirmed
    const payInit = await customer.post(`/api/payments/bookings/${bookingId}/initiate`).send({});
    expect(payInit.status).toBe(200);
    const paySuccess = await customer.post(`/api/payments/bookings/${bookingId}/success`).send({});
    expect(paySuccess.status).toBe(200);
    expect(paySuccess.body.data.booking.status).toBe('CONFIRMED');
    expect(paySuccess.body.data.booking.paymentStatus).toBe('PAID');

    // Session progression -> completion
    const startRes = await supplier.post(`/api/bookings/${bookingId}/start`);
    expect(startRes.status).toBe(200);
    expect(startRes.body.data.booking.status).toBe('IN_PROGRESS');

    const completeRes = await supplier.post(`/api/bookings/${bookingId}/complete`);
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.booking.status).toBe('COMPLETED');

    // Customer can see completed booking
    const finalBookings = await customer.get('/api/bookings');
    expect(finalBookings.status).toBe(200);
    const completed = (finalBookings.body.data.bookings as any[]).find((b) => b._id === bookingId);
    expect(completed?.status).toBe('COMPLETED');
  });
});
