import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';

const authState = vi.hoisted(() => ({
  user: null as { role?: 'CUSTOMER' | 'SUPPLIER' | 'ADMIN'; email?: string } | null,
  loading: false,
  login: vi.fn(),
  registerCustomer: vi.fn(),
  registerSupplier: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => authState,
}));

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/customer" element={<div>Customer home</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    authState.user = null;
    authState.loading = false;
    authState.login.mockReset();
    authState.registerCustomer.mockReset();
    authState.registerSupplier.mockReset();
    authState.logout.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the sign-in form', () => {
    renderLoginPage();

    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeTruthy();
  });

  it('submits the entered credentials to the login action and navigates on success', async () => {
    authState.login.mockResolvedValue({ role: 'CUSTOMER', email: 'driver@example.com' });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'driver@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(authState.login).toHaveBeenCalledWith('driver@example.com', 'password123');
    });
    await waitFor(() => {
      expect(screen.getByText('Customer home')).toBeTruthy();
    });
  });

  it('shows an error state when login fails', async () => {
    authState.login.mockRejectedValue(new Error('Invalid email or password'));

    renderLoginPage();

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'driver@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe('Invalid email or password');
  });
});
