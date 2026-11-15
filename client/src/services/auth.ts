import { apiFetch } from './api';
import type { User, UserRole } from '@/types';

/**
 * Auth service: typed wrappers around the `/api/auth` endpoints.
 */

interface AuthUserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  accountStatus?: string;
  verificationStatus?: string;
  avatar?: string;
  createdAt?: string;
}

export interface RegisterCustomerInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  passwordConfirm: string;
}

export interface RegisterSupplierInput {
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  password: string;
  passwordConfirm: string;
}

function normalizeUser(raw: AuthUserResponse): User {
  return {
    _id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    phone: raw.phone,
    avatar: raw.avatar,
    createdAt: raw.createdAt ?? '',
    accountStatus: raw.accountStatus,
    verificationStatus: raw.verificationStatus,
  };
}

async function requestUser(path: string, body: Record<string, unknown>): Promise<User> {
  const data = await apiFetch<{ user: AuthUserResponse }>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return normalizeUser(data.user);
}

export const authService = {
  async registerCustomer(input: RegisterCustomerInput): Promise<User> {
    return requestUser('/auth/register/customer', input as unknown as Record<string, unknown>);
  },

  async registerSupplier(input: RegisterSupplierInput): Promise<User> {
    return requestUser('/auth/register/supplier', input as unknown as Record<string, unknown>);
  },

  async login(email: string, password: string): Promise<User> {
    return requestUser('/auth/login', { email, password });
  },

  async me(): Promise<User> {
    const data = await apiFetch<{ user: AuthUserResponse }>('/auth/me');
    return normalizeUser(data.user);
  },

  async logout(): Promise<void> {
    await apiFetch<undefined>('/auth/logout', { method: 'POST' });
  },

  async forgotPassword(email: string): Promise<string> {
    const data = await apiFetch<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data.message ?? 'Password reset instructions were generated.';
  },
};

export default authService;
