import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';

describe('Auth module - profile', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  it('gets and updates profile fields, keeps email readonly, and supports profile image CRUD', async () => {
    const registerResponse = await request(app).post('/api/auth/register/customer').send({
      name: 'Profile User',
      email: 'profile.user@example.com',
      phone: '+923001234500',
      password: 'password123',
      passwordConfirm: 'password123',
    });
    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'profile.user@example.com',
      password: 'password123',
    });
    expect(loginResponse.status).toBe(200);
    const accessToken = loginResponse.body.data.accessToken as string;

    const getResponse = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.user.email).toBe('profile.user@example.com');
    expect(getResponse.body.data.user.name).toBe('Profile User');

    const imageDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
    const updateResponse = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Profile User Updated',
        phone: '+923009998877',
        profileImage: imageDataUrl,
        email: 'hacked@example.com',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.data.user.name).toBe('Profile User Updated');
    expect(updateResponse.body.data.user.phone).toBe('+923009998877');
    expect(updateResponse.body.data.user.email).toBe('profile.user@example.com');
    expect(updateResponse.body.data.profile.profileImage).toBe(imageDataUrl);

    const removeImageResponse = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ profileImage: null });

    expect(removeImageResponse.status).toBe(200);
    expect(removeImageResponse.body.data.profile.profileImage).toBeUndefined();
  });
});