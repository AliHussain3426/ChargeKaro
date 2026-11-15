import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Types } from 'mongoose';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';
import { Booking } from '../src/modules/bookings/model.js';
import { BookingStatus, PaymentStatus, PricingType } from '../src/types/index.js';

function buildValidBookingInput() {
  return {
    bookingReference: 'BK-2026-000001',
    customerId: new Types.ObjectId(),
    supplierId: new Types.ObjectId(),
    vehicleId: new Types.ObjectId(),
    stationId: new Types.ObjectId(),
    terminalId: new Types.ObjectId(),
    requestedStartTime: new Date('2026-11-20T10:00:00.000Z'),
    requestedEndTime: new Date('2026-11-20T12:00:00.000Z'),
    priceSnapshot: {
      amount: 300,
      currency: 'PKR',
      billingType: PricingType.PER_KWH,
    },
    status: BookingStatus.PENDING_SUPPLIER,
    paymentStatus: PaymentStatus.UNPAID,
  };
}

describe('Booking model', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  it('defaults new bookings to the PENDING_SUPPLIER status', () => {
    const booking = new Booking(buildValidBookingInput());

    expect(booking.status).toBe(BookingStatus.PENDING_SUPPLIER);
    expect(booking.paymentStatus).toBe(PaymentStatus.UNPAID);
    expect(booking.validateSync()).toBeUndefined();
  });

  it.each([
    BookingStatus.PENDING_SUPPLIER,
    BookingStatus.ACCEPTED_AWAITING_PAYMENT,
    BookingStatus.REJECTED,
    BookingStatus.CONFIRMED,
    BookingStatus.IN_PROGRESS,
    BookingStatus.CANCELLED,
    BookingStatus.EXPIRED,
    BookingStatus.COMPLETED,
  ])('accepts the booking status %s', (status) => {
    const booking = new Booking({ ...buildValidBookingInput(), status });

    expect(booking.status).toBe(status);
    expect(booking.validateSync()).toBeUndefined();
  });

  it('rejects a booking status outside the BookingStatus enum', () => {
    const booking = new Booking({
      ...buildValidBookingInput(),
      status: 'NOT_A_STATUS',
    });

    const validationError = booking.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors['status']).toBeDefined();
  });
});
