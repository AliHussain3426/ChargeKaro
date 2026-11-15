import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';
import { User, CustomerProfile, SupplierProfile } from '../src/modules/auth/model.js';

describe('Auth module - registration', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  it('creates a customer user and customer profile on customer registration', async () => {
    const response = await request(app).post('/api/auth/register/customer').send({
      name: 'Green Driver',
      email: 'driver.green@example.com',
      phone: '+923001234567',
      password: 'password123',
      passwordConfirm: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('driver.green@example.com');

    const user = await User.findOne({ email: 'driver.green@example.com' }).exec();
    expect(user).not.toBeNull();
    expect(user?.role).toBe('CUSTOMER');

    const profile = await CustomerProfile.findOne({ user: user?._id }).exec();
    expect(profile).not.toBeNull();
  });

  it('creates a supplier user and supplier profile on supplier registration', async () => {
    const response = await request(app).post('/api/auth/register/supplier').send({
      name: 'Green Operator',
      businessName: 'Green Charge Services',
      email: 'operator.green@example.com',
      phone: '+923009876543',
      password: 'password123',
      passwordConfirm: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('operator.green@example.com');

    const user = await User.findOne({ email: 'operator.green@example.com' }).exec();
    expect(user).not.toBeNull();
    expect(user?.role).toBe('SUPPLIER');

    const profile = await SupplierProfile.findOne({ user: user?._id }).exec();
    expect(profile).not.toBeNull();
    expect(profile?.businessName).toBe('Green Charge Services');
  });

  it('rejects customer registration with mismatched passwords', async () => {
    const response = await request(app).post('/api/auth/register/customer').send({
      name: 'Green Driver Two',
      email: 'driver.green.two@example.com',
      password: 'password123',
      passwordConfirm: 'differentPassword123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('rejects duplicate registration emails with a conflict', async () => {
    const response = await request(app).post('/api/auth/register/customer').send({
      name: 'Green Driver Duplicate',
      email: 'driver.green@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });
});
