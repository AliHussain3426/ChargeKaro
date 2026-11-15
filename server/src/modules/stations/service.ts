// Stations module
//
// Business logic for supplier-owned station management.

import { Station } from './model.js';
import { SupplierProfile } from '../auth/model.js';
import { AppError } from '../../middleware/errorHandler.js';

export interface StationInput {
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

async function requireSupplierProfile(userId: string) {
  const profile = await SupplierProfile.findOne({ user: userId } as any).exec();
  if (!profile) {
    throw new AppError('Supplier profile not found', 404);
  }
  return profile as any;
}

function normalizeStationPayload(input: Partial<StationInput>) {
  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.description !== undefined) payload.description = input.description;
  if (input.address !== undefined) payload.address = input.address;
  if (input.city !== undefined) payload.city = input.city;
  if (input.province !== undefined) payload.province = input.province;
  if (input.country !== undefined) payload.country = input.country;

  if (input.location?.coordinates) {
    payload.location = {
      type: 'Point',
      coordinates: input.location.coordinates,
    };
  }

  if (input.pricing) {
    payload.pricing = {
      amount: input.pricing.amount,
      ...(input.pricing.currency ? { currency: input.pricing.currency } : {}),
      ...(input.pricing.billingType ? { billingType: input.pricing.billingType } : {}),
    };
  }

  if (input.operatingHours) {
    payload.operatingHours = {
      opensAt: input.operatingHours.opensAt,
      closesAt: input.operatingHours.closesAt,
      ...(input.operatingHours.timezone
        ? { timezone: input.operatingHours.timezone }
        : {}),
    };
  }

  return payload;
}

export const stationService = {
  async createStation(userId: string, input: StationInput) {
    const profile = await requireSupplierProfile(userId);
    const payload = normalizeStationPayload(input);

    const station = await new Station({
      supplierId: profile._id,
      country: 'Pakistan',
      ...payload,
      // ensure nested defaults/requireds when partial maps provided
      pricing: {
        currency: 'PKR',
        ...(payload.pricing as Record<string, unknown> | undefined),
      },
      operatingHours: {
        timezone: 'Asia/Karachi',
        ...(payload.operatingHours as Record<string, unknown> | undefined),
      },
    }).save();

    return station;
  },

  async listStations(userId: string) {
    const profile = await requireSupplierProfile(userId);
    return Station.find({ supplierId: profile._id }).sort({ createdAt: -1 }).exec();
  },

  async getStation(userId: string, stationId: string) {
    const profile = await requireSupplierProfile(userId);
    const station = await Station.findById(stationId).exec();
    if (!station) {
      throw new AppError('Station not found', 404);
    }
    if (station.supplierId.toString() !== profile._id.toString()) {
      throw new AppError('Forbidden: station access denied', 403);
    }
    return station;
  },

  async updateStation(userId: string, stationId: string, input: Partial<StationInput>) {
    const profile = await requireSupplierProfile(userId);
    const station = await Station.findById(stationId).exec();
    if (!station) {
      throw new AppError('Station not found', 404);
    }
    if (station.supplierId.toString() !== profile._id.toString()) {
      throw new AppError('Forbidden: station access denied', 403);
    }

    const payload = normalizeStationPayload(input);
    if (payload.location) {
      station.location = payload.location as typeof station.location;
    }
    if (payload.pricing) {
      station.pricing = {
        ...station.pricing,
        ...(payload.pricing as typeof station.pricing),
      };
    }
    if (payload.operatingHours) {
      station.operatingHours = {
        ...station.operatingHours,
        ...(payload.operatingHours as typeof station.operatingHours),
      };
    }

    const simpleFields = ['name', 'description', 'address', 'city', 'province', 'country'] as const;
    for (const field of simpleFields) {
      if (payload[field] !== undefined) {
        (station as unknown as Record<string, unknown>)[field] = payload[field];
      }
    }

    await station.save();
    return station;
  },

  async deleteStation(userId: string, stationId: string) {
    const profile = await requireSupplierProfile(userId);
    const station = await Station.findById(stationId).exec();
    if (!station) {
      throw new AppError('Station not found', 404);
    }
    if (station.supplierId.toString() !== profile._id.toString()) {
      throw new AppError('Forbidden: station access denied', 403);
    }
    await station.deleteOne();
    return { deleted: true };
  },

  async getOwnedStation(userId: string, stationId: string) {
    return this.getStation(userId, stationId);
  },
};

export type StationService = typeof stationService;
