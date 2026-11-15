import type { ApiResponse } from '@/types';

/**
 * Central API client for the GreenCharge backend.
 *
 * - Base URL comes from `VITE_API_BASE_URL` (defaults to `/api`, which the
 *   Vite dev server proxies to the backend).
 * - Requests always include credentials so HttpOnly auth cookies are sent.
 * - Responses are unwrapped from the shared `ApiResponse` envelope; failures
 *   raise an `ApiError` carrying the status code and server message.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
}

export async function apiFetch<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  let body: ApiResponse<unknown> | null = null;
  try {
    body = (await response.json()) as ApiResponse<unknown>;
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new ApiError(
      body?.message ?? `Request failed with status ${response.status}`,
      response.status
    );
  }

  return body?.data as T;
}

export default apiFetch;
