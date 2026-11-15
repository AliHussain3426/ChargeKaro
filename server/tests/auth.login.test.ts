import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';

describe('Auth module - login, session, and logout', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  it('registers a customer, logs in, and issues an access token with an HttpOnly cookie', async () => {
    const registerResponse = await request(app).post('/api/auth/register/customer').send({
      name: 'Green Driver Session',
      email: 'driver.session@example.com',
      phone: '+923001112233',
      password: 'password123',
      passwordConfirm: 'password123',
    });
    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'driver.session@example.com',
      password: 'password123',
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
    expect(loginResponse.body.data.accessToken).toBeDefined();
    expect(loginResponse.body.data.refreshToken).toBeDefined();
    expect(loginResponse.body.data.user.email).toBe('driver.session@example.com');

    const setCookies = (loginResponse.headers['set-cookie'] as string[]) ?? [];
    expect(setCookies.some((cookie) => cookie.startsWith('accessToken='))).toBe(true);
    expect(setCookies.some((cookie) => cookie.startsWith('refreshToken='))).toBe(true);
  });

  it('rejects login with a wrong password', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'driver.session@example.com',
      password: 'wrongPassword123',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('returns the authenticated user from GET /api/auth/me', async () => {
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'driver.session@example.com',
      password: 'password123',
    });
    expect(loginResponse.status).toBe(200);
    const accessToken = loginResponse.body.data.accessToken as string;

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.success).toBe(true);
    expect(meResponse.body.data.user.email).toBe('driver.session@example.com');
  });

  it('clears the auth cookies on logout', async () => {
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'driver.session@example.com',
      password: 'password123',
    });
    const accessToken = loginResponse.body.data.accessToken as string;

    const logoutResponse = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.success).toBe(true);

    const setCookies = (logoutResponse.headers['set-cookie'] as string[]) ?? [];
    const clearedAccessCookie = setCookies.find((cookie) => cookie.startsWith('accessToken='));
    expect(clearedAccessCookie).toBeDefined();
    expect(clearedAccessCookie).toContain('Expires=Thu, 01 Jan 1970');
  });

  it('rejects /api/auth/me without a token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
