import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/index.js';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';
import { User } from '../src/modules/auth/model.js';

describe('Auth module - password reset', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  it('generates a password reset token for a registered customer', async () => {
    const registerResponse = await request(app).post('/api/auth/register/customer').send({
      name: 'Green Reset Driver',
      email: 'driver.reset@example.com',
      password: 'password123',
      passwordConfirm: 'password123',
    });
    expect(registerResponse.status).toBe(201);

    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'driver.reset@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const user = await User.findOne({ email: 'driver.reset@example.com' })
      .select('+resetPasswordToken +resetPasswordExpires')
      .exec();
    expect(user?.resetPasswordToken).toBeDefined();
    expect(user?.resetPasswordExpires).toBeDefined();
  });

  it('rejects password reset with an invalid token', async () => {
    const response = await request(app).post('/api/auth/reset-password').send({
      token: 'invalid-reset-token',
      password: 'newPassword123',
      passwordConfirm: 'newPassword123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('resets the password and allows login with the new password', async () => {
    const registerResponse = await request(app).post('/api/auth/register/customer').send({
      name: 'Green New Password Driver',
      email: 'driver.newpassword@example.com',
      password: 'oldPassword123',
      passwordConfirm: 'oldPassword123',
    });
    expect(registerResponse.status).toBe(201);

    await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'driver.newpassword@example.com' });

    const user = await User.findOne({ email: 'driver.newpassword@example.com' })
      .select('+resetPasswordToken +resetPasswordExpires')
      .exec();
    const resetToken = user?.resetPasswordToken as string;

    const resetResponse = await request(app).post('/api/auth/reset-password').send({
      token: resetToken,
      password: 'newPassword456',
      passwordConfirm: 'newPassword456',
    });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.success).toBe(true);

    const oldLoginResponse = await request(app).post('/api/auth/login').send({
      email: 'driver.newpassword@example.com',
      password: 'oldPassword123',
    });
    expect(oldLoginResponse.status).toBe(401);

    const newLoginResponse = await request(app).post('/api/auth/login').send({
      email: 'driver.newpassword@example.com',
      password: 'newPassword456',
    });
    expect(newLoginResponse.status).toBe(200);
  });
});
