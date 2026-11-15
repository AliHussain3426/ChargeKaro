// Vehicles module
//
// Business logic for customer-owned vehicle management.

import { Vehicle } from './model.js';
import { AppError } from '../../middleware/errorHandler.js';

export interface VehicleInput {
  manufacturer: string;
  model: string;
  vehicleCategory: string;
  modelYear?: number;
  batteryCapacityKwh?: number;
  connectorTypes?: string[];
  maximumChargingPowerKw?: number;
}

function normalizePayload(input: Partial<VehicleInput>) {
  const payload: Record<string, unknown> = {};
  if (input.manufacturer !== undefined) payload.manufacturer = input.manufacturer;
  if (input.model !== undefined) payload.model = input.model;
  if (input.vehicleCategory !== undefined) payload.vehicleCategory = input.vehicleCategory;
  if (input.modelYear !== undefined) payload.modelYear = input.modelYear;
  if (input.batteryCapacityKwh !== undefined) payload.batteryCapacityKwh = input.batteryCapacityKwh;
  if (input.connectorTypes !== undefined) payload.connectorTypes = input.connectorTypes;
  if (input.maximumChargingPowerKw !== undefined) {
    payload.maximumChargingPowerKw = input.maximumChargingPowerKw;
  }
  return payload;
}

export const vehicleService = {
  async createVehicle(customerId: string, input: VehicleInput) {
    const vehicle = await new Vehicle({
      customerId,
      ...normalizePayload(input),
    }).save();
    return vehicle;
  },

  async listVehicles(customerId: string) {
    return Vehicle.find({ customerId } as any).sort({ createdAt: -1 }).exec();
  },

  async getVehicle(customerId: string, vehicleId: string) {
    const vehicle = await Vehicle.findById(vehicleId).exec();
    if (!vehicle) {
      throw new AppError('Vehicle not found', 404);
    }
    if (vehicle.customerId.toString() !== customerId) {
      throw new AppError('Forbidden: vehicle access denied', 403);
    }
    return vehicle;
  },

  async updateVehicle(customerId: string, vehicleId: string, input: Partial<VehicleInput>) {
    const vehicle = await this.getVehicle(customerId, vehicleId);
    const payload = normalizePayload(input);
    for (const [key, value] of Object.entries(payload)) {
      (vehicle as unknown as Record<string, unknown>)[key] = value;
    }
    await vehicle.save();
    return vehicle;
  },

  async deleteVehicle(customerId: string, vehicleId: string) {
    const vehicle = await this.getVehicle(customerId, vehicleId);
    await vehicle.deleteOne();
    return { deleted: true };
  },
};

export type VehicleService = typeof vehicleService;
