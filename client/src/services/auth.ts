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
  profileImage?: string;
  createdAt?: string;
}

export interface AuthProfile {
  id?: string;
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
  verificationStatus?: string;
  preferences?: Record<string, unknown>;
  profileImage?: string;
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

export interface RegisterSupplierResult {
  user: User;
  pendingVerification: boolean;
  message: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
  profileImage?: string | null;
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  passwordConfirm: string;
}

function normalizeUser(raw: AuthUserResponse): User {
  return {
    _id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    phone: raw.phone,
    avatar: raw.avatar ?? raw.profileImage,
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

  async registerSupplier(input: RegisterSupplierInput): Promise<RegisterSupplierResult> {
    const data = await apiFetch<{ user: AuthUserResponse; pendingVerification?: boolean; message?: string }>('/auth/register/supplier', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return {
      user: normalizeUser(data.user),
      pendingVerification: Boolean(data.pendingVerification),
      message: data.message ?? '',
    };
  },

  async login(email: string, password: string): Promise<User> {
    return requestUser('/auth/login', { email, password });
  },

  async me(): Promise<User> {
    const data = await apiFetch<{ user: AuthUserResponse; profile?: AuthProfile | null }>('/auth/me');
    return normalizeUser(data.user);
  },

  async getProfile(): Promise<{ user: User; profile: AuthProfile | null }> {
    const data = await apiFetch<{ user: AuthUserResponse; profile?: AuthProfile | null }>('/auth/profile');
    return { user: normalizeUser(data.user), profile: data.profile ?? null };
  },

  async updateProfile(input: UpdateProfileInput): Promise<{ user: User; profile: AuthProfile | null }> {
    const data = await apiFetch<{ user: AuthUserResponse; profile?: AuthProfile | null }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return { user: normalizeUser(data.user), profile: data.profile ?? null };
  },

  async logout(): Promise<void> {
    await apiFetch<undefined>('/auth/logout', { method: 'POST' });
  },

  async changePassword(input: ChangePasswordInput): Promise<string> {
    const data = await apiFetch<{ message?: string } | undefined>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return data?.message ?? 'Password changed successfully.';
  },

  async forgotPassword(email: string): Promise<string> {
    const data = await apiFetch<{ message?: string } | undefined>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data?.message ?? 'Password reset instructions were generated.';
  },
};

export default authService;
