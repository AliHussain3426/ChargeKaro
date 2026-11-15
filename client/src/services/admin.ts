import { apiFetch } from './api';

export interface AdminOverviewCounts {
  users: number;
  customers: number;
  suppliers: number;
  stations: number;
  terminals: number;
  bookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  paidPayments: number;
}

export interface AdminUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  accountStatus: string;
  verificationStatus?: string;
  createdAt?: string;
}

export interface AdminSupplier {
  _id: string;
  businessName?: string;
  verificationStatus?: string;
  stationCount?: number;
  user?: { name?: string; email?: string; accountStatus?: string };
  createdAt?: string;
}

export interface AdminStation {
  _id: string;
  name: string;
  address: string;
  city?: string;
  supplierId?: { businessName?: string; user?: { name?: string; email?: string } } | string;
  terminalCount?: number;
  pricing?: { amount: number; currency: string; billingType: string };
  createdAt?: string;
}

export interface AdminTerminal {
  _id: string;
  name: string;
  chargingMethod?: string;
  connectorTypes?: string[];
  maximumPowerKw?: number;
  status?: string;
  availability?: boolean;
  pricing?: { amount: number; currency: string; billingType: string };
  stationId?: { name?: string; city?: string } | string;
}

export interface AdminBooking {
  _id: string;
  bookingReference: string;
  status: string;
  paymentStatus: string;
  requestedStartTime: string;
  requestedEndTime: string;
  priceSnapshot?: { amount: number; currency: string };
  customerId?: { name?: string; email?: string } | string;
  stationId?: { name?: string; city?: string } | string;
  terminalId?: { name?: string } | string;
  createdAt?: string;
}

export interface AdminReports {
  counts: AdminOverviewCounts;
  revenue: { gross: number; platformFee: number; netPayable: number; feeRate: number };
  recentBookings: any[];
}

export interface SystemSettings {
  platformName: string;
  supportEmail: string;
  currency: string;
  advanceBookingWindowDays: number;
  cancellationWindowHours: number;
  platformCommissionPercent: number;
  bookingEscalationAlerts: boolean;
  maintenanceMode: boolean;
}

export async function getAdminOverview() {
  const data = await apiFetch<{ overview: { counts: AdminOverviewCounts } }>('/admin/overview');
  return data.overview;
}

export async function listAdminUsers() {
  const data = await apiFetch<{ users: AdminUser[] }>('/admin/users');
  return data.users ?? [];
}

export async function listAdminSuppliers() {
  const data = await apiFetch<{ suppliers: AdminSupplier[] }>('/admin/suppliers');
  return data.suppliers ?? [];
}

export async function listAdminStations() {
  const data = await apiFetch<{ stations: AdminStation[] }>('/admin/stations');
  return data.stations ?? [];
}

export async function listAdminTerminals() {
  const data = await apiFetch<{ terminals: AdminTerminal[] }>('/admin/terminals');
  return data.terminals ?? [];
}

export async function listAdminBookings() {
  const data = await apiFetch<{ bookings: AdminBooking[] }>('/admin/bookings');
  return data.bookings ?? [];
}

export async function getAdminReports() {
  const data = await apiFetch<{ reports: AdminReports }>('/admin/reports');
  return data.reports;
}

export async function getSystemSettings() {
  const data = await apiFetch<{ settings: SystemSettings }>('/admin/settings');
  return data.settings;
}

export async function updateSystemSettings(input: Partial<SystemSettings>) {
  const data = await apiFetch<{ settings: SystemSettings }>('/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return data.settings;
}
