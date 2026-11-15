import { describe, it, expect, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterSelectPage from './RegisterSelectPage';

describe('RegisterSelectPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the customer and supplier registration options', () => {
    render(
      <MemoryRouter>
        <RegisterSelectPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Driver account')).toBeTruthy();
    expect(screen.getByText('Supplier account')).toBeTruthy();

    const driverLink = screen.getByRole('link', { name: /Driver account/ });
    const supplierLink = screen.getByRole('link', { name: /Supplier account/ });

    expect(driverLink.getAttribute('href')).toBe('/register/customer');
    expect(supplierLink.getAttribute('href')).toBe('/register/supplier');
  });
});
