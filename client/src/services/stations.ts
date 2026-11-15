import { apiFetch } from './api';

export interface StationPricing {
  amount: number;
  currency: string;
  billingType: string;
}

export interface StationOperatingHours {
  timezone: string;
  opensAt: string;
  closesAt: string;
}

export interface StationLocation {
  type: string;
  coordinates: [number, number];
}

export interface Station {
  _id: string;
  supplierId: string;
  name: string;
  description?: string;
  address: string;
  city?: string;
  province?: string;
  country: string;
  location: StationLocation;
  pricing: StationPricing;
  operatingHours: StationOperatingHours;
  createdAt?: string;
  updatedAt?: string;
}

export interface TerminalPricing {
  amount: number;
  currency: string;
  billingType: string;
}

export interface Terminal {
  _id: string;
  stationId: string;
  name: string;
  chargingMethod: string;
  connectorTypes: string[];
  maximumPowerKw: number;
  capacity: number;
  pricing: TerminalPricing;
  status: string;
  availability: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStationInput {
  name: string;
  description?: string;
  address: string;
  city?: string;
  province?: string;
  country?: string;
  location: { coordinates: [number, number] };
  pricing: { amount: number; currency?: string; billingType?: string };
  operatingHours: { timezone?: string; opensAt: string; closesAt: string };
}

export interface CreateTerminalInput {
  name: string;
  chargingMethod?: string;
  connectorTypes?: string[];
  maximumPowerKw: number;
  capacity?: number;
  pricing: { amount: number; currency?: string; billingType?: string };
  status?: string;
  availability?: boolean;
}

export async function listStations(): Promise<Station[]> {
  const data = await apiFetch<{ stations: Station[] }>('/stations');
  return data.stations ?? [];
}

export async function createStation(input: CreateStationInput): Promise<Station> {
  const data = await apiFetch<{ station: Station }>('/stations', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.station;
}

export async function updateStation(stationId: string, input: Partial<CreateStationInput>): Promise<Station> {
  const data = await apiFetch<{ station: Station }>(`/stations/${stationId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return data.station;
}

export async function deleteStation(stationId: string): Promise<void> {
  await apiFetch<unknown>(`/stations/${stationId}`, { method: 'DELETE' });
}

export async function listTerminals(stationId: string): Promise<Terminal[]> {
  const data = await apiFetch<{ terminals: Terminal[] }>(`/stations/${stationId}/terminals`);
  return data.terminals ?? [];
}

export async function createTerminal(stationId: string, input: CreateTerminalInput): Promise<Terminal> {
  const data = await apiFetch<{ terminal: Terminal }>(`/stations/${stationId}/terminals`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.terminal;
}

export async function updateTerminal(
  stationId: string,
  terminalId: string,
  input: Partial<CreateTerminalInput>
): Promise<Terminal> {
  const data = await apiFetch<{ terminal: Terminal }>(
    `/stations/${stationId}/terminals/${terminalId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    }
  );
  return data.terminal;
}

export async function updateTerminalStatus(
  stationId: string,
  terminalId: string,
  input: { status?: string; availability?: boolean }
): Promise<Terminal> {
  const data = await apiFetch<{ terminal: Terminal }>(
    `/stations/${stationId}/terminals/${terminalId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    }
  );
  return data.terminal;
}

export async function deleteTerminal(stationId: string, terminalId: string): Promise<void> {
  await apiFetch<unknown>(`/stations/${stationId}/terminals/${terminalId}`, { method: 'DELETE' });
}
