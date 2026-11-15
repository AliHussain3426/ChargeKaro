import { apiFetch } from './api';

export interface BookingStationRef {
  _id: string;
  name?: string;
  address?: string;
  city?: string;
}

export interface BookingTerminalRef {
  _id: string;
  name?: string;
  connectorTypes?: string[];
  maximumPowerKw?: number;
}

export interface BookingVehicleRef {
  _id: string;
  manufacturer?: string;
  model?: string;
}

export interface Booking {
  _id: string;
  bookingReference: string;
  customerId: string;
  supplierId: string;
  vehicleId: string | BookingVehicleRef;
  stationId: string | BookingStationRef;
  terminalId: string | BookingTerminalRef;
  requestedStartTime: string;
  requestedEndTime: string;
  priceSnapshot: {
    amount: number;
    currency: string;
    billingType: string;
  };
  status: string;
  paymentStatus: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingInput {
  vehicleId: string;
  stationId: string;
  terminalId: string;
  requestedStartTime: string;
  requestedEndTime: string;
}

export async function listBookings(): Promise<Booking[]> {
  const data = await apiFetch<{ bookings: Booking[] }>('/bookings');
  return data.bookings ?? [];
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const data = await apiFetch<{ booking: Booking }>('/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.booking;
}

async function bookingAction(bookingId: string, action: string): Promise<Booking> {
  const data = await apiFetch<{ booking: Booking }>(`/bookings/${bookingId}/${action}`, {
    method: 'POST',
  });
  return data.booking;
}

export const acceptBooking = (id: string) => bookingAction(id, 'accept');
export const rejectBooking = (id: string) => bookingAction(id, 'reject');
export const payBooking = (id: string) => bookingAction(id, 'pay');
export const cancelBooking = (id: string) => bookingAction(id, 'cancel');
export const startBooking = (id: string) => bookingAction(id, 'start');
export const completeBooking = (id: string) => bookingAction(id, 'complete');
export const expireBooking = (id: string) => bookingAction(id, 'expire');
