import { describe, expect, it } from 'vitest';
import { validateBookingForm } from './FindStationsPage';
import { bookingStatusBadgeClass } from '../supplier/BookingRequestsPage';

describe('Booking form validation', () => {
  it('requires vehicle, terminal, and valid time window', () => {
    const errors = validateBookingForm({ vehicleId: '', terminalId: '', startTime: '', endTime: '' });
    expect(errors.vehicleId).toBeTruthy();
    expect(errors.terminalId).toBeTruthy();
    expect(errors.startTime).toBeTruthy();
    expect(errors.endTime).toBeTruthy();
  });

  it('rejects when end time is not after start time', () => {
    const errors = validateBookingForm({
      vehicleId: 'v1',
      terminalId: 't1',
      startTime: '2026-12-01T11:00',
      endTime: '2026-12-01T10:00',
    });
    expect(errors.endTime).toBeTruthy();
  });

  it('accepts a valid booking form', () => {
    const errors = validateBookingForm({
      vehicleId: 'v1',
      terminalId: 't1',
      startTime: '2026-12-01T10:00',
      endTime: '2026-12-01T11:00',
    });
    expect(errors).toEqual({});
  });
});

describe('Booking status badges', () => {
  it('returns muted class for terminal/rejected statuses', () => {
    expect(bookingStatusBadgeClass('REJECTED')).toContain('workspace-status--muted');
    expect(bookingStatusBadgeClass('CANCELLED')).toContain('workspace-status--muted');
    expect(bookingStatusBadgeClass('COMPLETED')).toContain('workspace-status--muted');
  });

  it('returns warning/active classes for in-flight statuses', () => {
    expect(bookingStatusBadgeClass('ACCEPTED_AWAITING_PAYMENT')).toContain('workspace-status--warning');
    expect(bookingStatusBadgeClass('PENDING_SUPPLIER')).toBe('workspace-status');
  });
});
