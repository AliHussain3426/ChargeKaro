import { apiFetch } from './api';

export interface Vehicle {
  _id: string;
  customerId: string;
  manufacturer: string;
  model: string;
  vehicleCategory: string;
  modelYear?: number;
  batteryCapacityKwh?: number;
  connectorTypes: string[];
  maximumChargingPowerKw?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehicleInput {
  manufacturer: string;
  model: string;
  vehicleCategory: string;
  modelYear?: number;
  batteryCapacityKwh?: number;
  connectorTypes?: string[];
  maximumChargingPowerKw?: number;
}

export async function listVehicles(): Promise<Vehicle[]> {
  const data = await apiFetch<{ vehicles: Vehicle[] }>('/vehicles');
  return data.vehicles ?? [];
}

export async function createVehicle(input: CreateVehicleInput): Promise<Vehicle> {
  const data = await apiFetch<{ vehicle: Vehicle }>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data.vehicle;
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  await apiFetch<unknown>(`/vehicles/${vehicleId}`, { method: 'DELETE' });
}
