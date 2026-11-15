import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

interface MockUser {
  role?: 'CUSTOMER' | 'SUPPLIER' | 'ADMIN';
  name?: string;
  email?: string;
}

const authState = vi.hoisted(() => ({
  user: null as MockUser | null,
  loading: false,
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => authState,
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/customer"
          element={
            <ProtectedRoute roles={['CUSTOMER']}>
              <div>Customer workspace content</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier"
          element={
            <div>Supplier workspace content</div>
          }
        />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    authState.user = null;
    authState.loading = false;
  });

  afterEach(() => {
    cleanup();
  });

  it('redirects unauthenticated users to the login page', () => {
    renderAt('/customer');

    expect(screen.getByText('Login page')).toBeTruthy();
    expect(screen.queryByText('Customer workspace content')).toBeNull();
  });

  it('shows a loading state while the session is being restored', () => {
    authState.loading = true;

    renderAt('/customer');

    expect(screen.getByText(/Checking your session/)).toBeTruthy();
    expect(screen.queryByText('Customer workspace content')).toBeNull();
  });

  it('renders protected content for authenticated users with an allowed role', () => {
    authState.user = { role: 'CUSTOMER' };

    renderAt('/customer');

    expect(screen.getByText('Customer workspace content')).toBeTruthy();
    expect(screen.queryByText('Login page')).toBeNull();
  });

  it('redirects authenticated users away from areas reserved for another role', () => {
    authState.user = { role: 'SUPPLIER' };

    renderAt('/customer');

    expect(screen.getByText('Supplier workspace content')).toBeTruthy();
    expect(screen.queryByText('Customer workspace content')).toBeNull();
  });
});
