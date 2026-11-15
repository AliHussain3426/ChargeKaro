import { apiFetch } from './api';
import type { Booking } from './bookings';

export interface Payment {
  _id: string;
  bookingId: string | { _id: string; bookingReference?: string; requestedStartTime?: string; requestedEndTime?: string; stationId?: any };
  customerId: string;
  supplierId: string;
  provider: string;
  providerReference: string;
  amount: number;
  currency: string;
  status: string;
  failureReason?: string;
  processedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EarningsSummary {
  gross: number;
  platformFee: number;
  netPayable: number;
  feeRate: number;
  currency: string;
  paidCount: number;
  pendingAmount: number;
  failedAmount: number;
  payments: Payment[];
}

export async function initiatePayment(bookingId: string): Promise<{ payment: Payment; booking: Booking }> {
  return apiFetch<{ payment: Payment; booking: Booking }>(`/payments/bookings/${bookingId}/initiate`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function confirmPaymentSuccess(bookingId: string): Promise<{ payment: Payment; booking: Booking }> {
  return apiFetch<{ payment: Payment; booking: Booking }>(`/payments/bookings/${bookingId}/success`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function confirmPaymentFailure(bookingId: string, reason?: string): Promise<{ payment: Payment; booking: Booking }> {
  return apiFetch<{ payment: Payment; booking: Booking }>(`/payments/bookings/${bookingId}/failure`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function getSupplierEarnings(): Promise<EarningsSummary> {
  const data = await apiFetch<{ earnings: EarningsSummary }>('/payments/earnings/me');
  return data.earnings;
}
