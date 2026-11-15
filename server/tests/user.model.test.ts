import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';
import { User } from '../src/modules/auth/model.js';
import { UserRole } from '../src/types/index.js';

describe('User model', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  it('requires name, email and passwordHash', () => {
    const user = new User({});

    const validationError = user.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors['name']).toBeDefined();
    expect(validationError?.errors['email']).toBeDefined();
    expect(validationError?.errors['passwordHash']).toBeDefined();
  });

  it('requires a valid email address', () => {
    const user = new User({
      name: 'Green Driver',
      passwordHash: 'a-very-long-password-hash-value',
      email: 'not-an-email',
    });

    const validationError = user.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors['email']).toBeDefined();
  });

  it('accepts valid customers, suppliers and admins with the correct role enum', () => {
    const customer = new User({
      name: 'Green Driver',
      email: 'customer@example.com',
      passwordHash: 'a-very-long-password-hash-value',
      role: UserRole.CUSTOMER,
    });
    expect(customer.validateSync()).toBeUndefined();

    const supplier = new User({
      name: 'Green Supplier',
      email: 'supplier@example.com',
      passwordHash: 'a-very-long-password-hash-value',
      role: UserRole.SUPPLIER,
    });
    expect(supplier.validateSync()).toBeUndefined();

    const admin = new User({
      name: 'Green Admin',
      email: 'admin@example.com',
      passwordHash: 'a-very-long-password-hash-value',
      role: UserRole.ADMIN,
    });
    expect(admin.validateSync()).toBeUndefined();
  });

  it('rejects a role outside the UserRole enum', () => {
    const user = new User({
      name: 'Green Driver',
      email: 'customer@example.com',
      passwordHash: 'a-very-long-password-hash-value',
      role: 'INVALID_ROLE',
    });

    const validationError = user.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors['role']).toBeDefined();
  });

  it('defaults new users to the CUSTOMER role', () => {
    const user = new User({
      name: 'Green Driver',
      email: 'customer@example.com',
      passwordHash: 'a-very-long-password-hash-value',
    });

    expect(user.role).toBe(UserRole.CUSTOMER);
    expect(user.validateSync()).toBeUndefined();
  });
});
