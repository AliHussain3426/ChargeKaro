import { apiFetch } from './api';

export interface ChargingSession {
  _id: string;
  bookingId: string | { _id: string; bookingReference?: string; status?: string; paymentStatus?: string };
  userId: string | { _id: string; name?: string; email?: string };
  vehicleId: string | { _id: string; manufacturer?: string; model?: string; vehicleCategory?: string; batteryCapacityKwh?: number };
  stationId: string | { _id: string; name?: string; address?: string; city?: string; pricing?: any };
  terminalId?: string | { _id: string; name?: string };
  initialSocPercent: number;
  finalSocPercent?: number;
  sessionStartTime: string;
  sessionCompletionTime?: string;
  status: 'ACTIVE' | 'COMPLETED';
  batteryCapacityKwhSnapshot: number;
  stationRatePkrPerKwhSnapshot: number;
  currency?: string;
  energyConsumedKwh?: number;
  totalPricePkr?: number;
  paymentStatus: 'PENDING' | 'PAID' | string;
  paymentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChargingReceipt {
  sessionId: string;
  transactionId: string;
  bookingReference?: string;
  customerName?: string;
  vehicle?: { name?: string; model?: string; manufacturer?: string; batteryCapacityKwh?: number } | null;
  stationName?: string;
  initialSocPercent: number;
  finalSocPercent?: number;
  energyConsumedKwh?: number;
  chargingRatePkrPerKwh: number;
  totalAmountPkr?: number;
  sessionStartTime: string;
  sessionCompletionTime?: string;
  paymentStatus: string;
  currency?: string;
}

export async function startChargingSession(bookingId: string, initialSocPercent: number): Promise<ChargingSession> {
  const data = await apiFetch<{ session: ChargingSession }>('/charging-sessions', {
    method: 'POST',
    body: JSON.stringify({ bookingId, initialSocPercent }),
  });
  return data.session;
}

export async function completeChargingSession(sessionId: string, finalSocPercent: number): Promise<ChargingSession> {
  const data = await apiFetch<{ session: ChargingSession }>(`/charging-sessions/${sessionId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ finalSocPercent }),
  });
  return data.session;
}

export async function listSupplierChargingSessions(params: { status?: string; bookingId?: string } = {}): Promise<ChargingSession[]> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  if (params.bookingId) qs.set('bookingId', params.bookingId);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const data = await apiFetch<{ sessions: ChargingSession[] }>(`/charging-sessions/supplier${suffix}`);
  return data.sessions ?? [];
}

export async function getSupplierChargingSession(sessionId: string): Promise<ChargingSession> {
  const data = await apiFetch<{ session: ChargingSession }>(`/charging-sessions/supplier/${sessionId}`);
  return data.session;
}

export async function listMyChargingSessions(): Promise<ChargingSession[]> {
  const data = await apiFetch<{ sessions: ChargingSession[] }>('/charging-sessions/me');
  return data.sessions ?? [];
}

export async function getChargingReceipt(sessionId: string): Promise<ChargingReceipt> {
  const data = await apiFetch<{ receipt: ChargingReceipt }>(`/charging-sessions/${sessionId}/receipt`);
  return data.receipt;
}
