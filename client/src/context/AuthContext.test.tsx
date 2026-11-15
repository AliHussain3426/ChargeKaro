import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

const sampleUser = {
  id: 'user_1',
  name: 'Green Driver',
  email: 'driver@example.com',
  role: 'CUSTOMER',
};

function sessionResponse(user: unknown = sampleUser): Response {
  return jsonResponse({ success: true, data: { user } });
}

function SessionProbe() {
  const { user, loading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user-email">{user?.email ?? 'none'}</span>
      <button type="button" onClick={() => login('driver@example.com', 'password123')}>
        do-login
      </button>
      <button type="button" onClick={() => logout()}>
        do-logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('starts in a loading state and resolves to no user when there is no session', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ success: false }, 401));

    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading').textContent).toBe('true');

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('user-email').textContent).toBe('none');
  });

  it('sets the user after a successful session restore', async () => {
    fetchMock.mockResolvedValue(sessionResponse());

    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('driver@example.com');
    });
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('stores the authenticated user when the login action succeeds', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(jsonResponse({ success: false }, 401));
      }
      if (url.endsWith('/auth/login')) {
        return Promise.resolve(sessionResponse());
      }
      return Promise.resolve(jsonResponse({ success: true }));
    });

    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>
    );

    screen.getByText('do-login').click();

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('driver@example.com');
    });
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('clears the user when the logout action runs', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith('/auth/me')) {
        return Promise.resolve(sessionResponse());
      }
      return Promise.resolve(jsonResponse({ success: true, data: undefined }));
    });

    render(
      <AuthProvider>
        <SessionProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('driver@example.com');
    });

    screen.getByText('do-logout').click();

    await waitFor(() => {
      expect(screen.getByTestId('user-email').textContent).toBe('none');
    });
  });
});
