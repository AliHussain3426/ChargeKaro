import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';
import { User, CustomerProfile, SupplierProfile } from '../src/modules/auth/model.js';
import { env } from '../src/config/env.js';
import { AccountStatus, UserRole, VerificationStatus } from '../src/types/index.js';

const mockBuildGoogleAuthorizationUrl = vi.fn();
const mockVerifyGoogleOAuthState = vi.fn();
const mockVerifyGoogleCallbackCode = vi.fn();

vi.mock('../src/modules/auth/google.js', async () => {
  const actual = await vi.importActual<typeof import('../src/modules/auth/google.js')>('../src/modules/auth/google.js');
  return {
    ...actual,
    buildGoogleAuthorizationUrl: (...args: unknown[]) => mockBuildGoogleAuthorizationUrl(...args),
    verifyGoogleOAuthState: (...args: unknown[]) => mockVerifyGoogleOAuthState(...args),
    verifyGoogleCallbackCode: (...args: unknown[]) => mockVerifyGoogleCallbackCode(...args),
  };
});

import app from '../src/index.js';

describe('Auth module - Google OAuth', () => {
  beforeAll(async () => {
    (env as any).GOOGLE_CLIENT_ID = 'test-google-client-id.apps.googleusercontent.com';
    (env as any).GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
    (env as any).GOOGLE_CALLBACK_URL = 'http://localhost:5000/api/auth/google/callback';
    (env as any).PRIMARY_CLIENT_URL = 'http://localhost:5173';
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  beforeEach(async () => {
    mockBuildGoogleAuthorizationUrl.mockReset();
    mockVerifyGoogleOAuthState.mockReset();
    mockVerifyGoogleCallbackCode.mockReset();
    await Promise.all([
      User.deleteMany({}),
      CustomerProfile.deleteMany({}),
      SupplierProfile.deleteMany({}),
    ]);
  });

  it('redirects to Google with state cookie for login intent', async () => {
    mockBuildGoogleAuthorizationUrl.mockReturnValue({
      url: 'https://accounts.google.com/o/oauth2/v2/auth?state=test-state',
      nonce: 'nonce-123',
    });

    const response = await request(app)
      .get('/api/auth/google')
      .query({ intent: 'login' });

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('accounts.google.com');
    expect(mockBuildGoogleAuthorizationUrl).toHaveBeenCalledWith('login', undefined);

    const cookies = (response.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
    expect(cookies.some((c) => c.startsWith('google_oauth_state='))).toBe(true);
  });

  it('creates a new customer from verified Google identity and sets auth cookies', async () => {
    mockVerifyGoogleOAuthState.mockReturnValue({ nonce: 'nonce-123', intent: 'customer_register' });
    mockVerifyGoogleCallbackCode.mockResolvedValue({
      googleId: 'google-sub-1',
      email: 'new.driver@example.com',
      emailVerified: true,
      name: 'New Driver',
      picture: 'https://example.com/pic.png',
    });

    const response = await request(app)
      .get('/api/auth/google/callback')
      .query({ code: 'valid-code', state: 'valid-state' })
      .set('Cookie', ['google_oauth_state=nonce-123; google_oauth_intent=customer_register']);

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('http://localhost:5173/customer');

    const cookies = (response.headers['set-cookie'] as unknown as string[] | undefined) ?? [];
    expect(cookies.some((c) => c.startsWith('accessToken='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);

    const user = await User.findOne({ email: 'new.driver@example.com' }).exec();
    expect(user).not.toBeNull();
    expect(user?.role).toBe(UserRole.CUSTOMER);
    expect(user?.googleId).toBe('google-sub-1');
    expect(user?.emailVerified).toBe(true);
    expect(user?.passwordHash).toBeUndefined();

    const profile = await CustomerProfile.findOne({ user: user?._id }).exec();
    expect(profile).not.toBeNull();
  });

  it('links an existing local account by verified email and allows Google login', async () => {
    await new User({
      name: 'Existing User',
      email: 'existing@example.com',
      passwordHash: '$2b$12$012345678901234567890uJv6vYfQ4WkQ8nQk8sQ8nQk8sQ8nQk8', // dummy hash shape not used
      role: UserRole.CUSTOMER,
      accountStatus: AccountStatus.ACTIVE,
      verificationStatus: VerificationStatus.UNVERIFIED,
    }).save();

    // Use a real hash for the existing user so normal login isn't broken in other assumptions; not needed here.
    // Update with a valid bcrypt hash.
    const bcrypt = await import('bcryptjs');
    await User.updateOne({ email: 'existing@example.com' }, { passwordHash: await bcrypt.hash('password123', 12) }).exec();
    await CustomerProfile.create({ user: (await User.findOne({ email: 'existing@example.com' }).exec())!._id, preferences: {} });

    mockVerifyGoogleOAuthState.mockReturnValue({ nonce: 'nonce-123', intent: 'login' });
    mockVerifyGoogleCallbackCode.mockResolvedValue({
      googleId: 'google-sub-link',
      email: 'existing@example.com',
      emailVerified: true,
      name: 'Existing User',
      picture: 'https://example.com/avatar.png',
    });

    const response = await request(app)
      .get('/api/auth/google/callback')
      .query({ code: 'valid-code', state: 'valid-state' })
      .set('Cookie', ['google_oauth_state=nonce-123; google_oauth_intent=login']);

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('/customer');

    const user = await User.findOne({ email: 'existing@example.com' }).exec();
    expect(user?.googleId).toBe('google-sub-link');
    expect(user?.emailVerified).toBe(true);

    const count = await User.countDocuments({ email: 'existing@example.com' }).exec();
    expect(count).toBe(1);
  });

  it('creates a pending supplier account for new Google supplier registration', async () => {
    mockVerifyGoogleOAuthState.mockReturnValue({ nonce: 'nonce-123', intent: 'supplier_register', businessName: 'Google Station Co' });
    mockVerifyGoogleCallbackCode.mockResolvedValue({
      googleId: 'google-sub-supplier',
      email: 'supplier@example.com',
      emailVerified: true,
      name: 'Supplier Owner',
      picture: undefined,
    });

    const response = await request(app)
      .get('/api/auth/google/callback')
      .query({ code: 'valid-code', state: 'valid-state' })
      .set('Cookie', ['google_oauth_state=nonce-123; google_oauth_intent=supplier_register']);

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('/register/supplier');
    expect(response.headers.location).toContain('status=pending_verification');

    const user = await User.findOne({ email: 'supplier@example.com' }).exec();
    expect(user?.role).toBe(UserRole.SUPPLIER);
    expect(user?.accountStatus).toBe(AccountStatus.PENDING);
    expect(user?.verificationStatus).toBe(VerificationStatus.PENDING);
    expect(user?.googleId).toBe('google-sub-supplier');

    const profile = await SupplierProfile.findOne({ user: user?._id }).exec();
    expect(profile?.businessName).toBe('Google Station Co');
  });

  it('rejects callback with invalid state', async () => {
    mockVerifyGoogleOAuthState.mockImplementation(() => {
      throw new Error('Invalid state');
    });

    const response = await request(app)
      .get('/api/auth/google/callback')
      .query({ code: 'valid-code', state: 'bad-state' })
      .set('Cookie', ['google_oauth_state=nonce-123; google_oauth_intent=login']);

    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('/login');
    expect(response.headers.location).toContain('error=');
  });
});