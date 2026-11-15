// Terminals module
//
// Business logic for supplier-owned terminal management.

import { Terminal } from './model.js';
import { Station } from '../stations/model.js';
import { SupplierProfile } from '../auth/model.js';
import { AppError } from '../../middleware/errorHandler.js';

export interface TerminalInput {
  name: string;
  chargingMethod?: string;
  connectorTypes?: string[];
  maximumPowerKw: number;
  capacity?: number;
  pricing: { amount: number; currency?: string; billingType?: string };
  status?: string;
  availability?: boolean;
}

async function requireSupplierProfile(userId: string) {
  const profile = await SupplierProfile.findOne({ user: userId } as any).exec();
  if (!profile) {
    throw new AppError('Supplier profile not found', 404);
  }
  return profile as any;
}

async function requireOwnedStation(userId: string, stationId: string) {
  const profile = await requireSupplierProfile(userId);
  const station = await Station.findById(stationId).exec();
  if (!station) {
    throw new AppError('Station not found', 404);
  }
  if (station.supplierId.toString() !== profile._id.toString()) {
    throw new AppError('Forbidden: station access denied', 403);
  }
  return station;
}

async function requireOwnedTerminal(userId: string, terminalId: string) {
  const profile = await requireSupplierProfile(userId);
  const terminal = await Terminal.findById(terminalId).exec();
  if (!terminal) {
    throw new AppError('Terminal not found', 404);
  }
  const station = await Station.findById(terminal.stationId).exec();
  if (!station || station.supplierId.toString() !== profile._id.toString()) {
    throw new AppError('Forbidden: terminal access denied', 403);
  }
  return terminal;
}

function normalizeTerminalPayload(input: Partial<TerminalInput>) {
  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.chargingMethod !== undefined) payload.chargingMethod = input.chargingMethod;
  if (input.connectorTypes !== undefined) payload.connectorTypes = input.connectorTypes;
  if (input.maximumPowerKw !== undefined) payload.maximumPowerKw = input.maximumPowerKw;
  if (input.capacity !== undefined) payload.capacity = input.capacity;
  if (input.status !== undefined) payload.status = input.status;
  if (input.availability !== undefined) payload.availability = input.availability;

  if (input.pricing) {
    payload.pricing = {
      amount: input.pricing.amount,
      ...(input.pricing.currency ? { currency: input.pricing.currency } : {}),
      ...(input.pricing.billingType ? { billingType: input.pricing.billingType } : {}),
    };
  }

  return payload;
}

export const terminalService = {
  async createTerminal(userId: string, stationId: string, input: TerminalInput) {
    await requireOwnedStation(userId, stationId);
    const payload = normalizeTerminalPayload(input);

    const terminal = await new Terminal({
      stationId,
      ...payload,
      pricing: {
        currency: 'PKR',
        ...(payload.pricing as Record<string, unknown> | undefined),
      },
    }).save();

    return terminal;
  },

  async listTerminals(userId: string, stationId: string) {
    await requireOwnedStation(userId, stationId);
    return Terminal.find({ stationId } as any).sort({ createdAt: -1 }).exec();
  },

  async updateTerminal(userId: string, terminalId: string, input: Partial<TerminalInput>) {
    const terminal = await requireOwnedTerminal(userId, terminalId);
    const payload = normalizeTerminalPayload(input);

    if (payload.pricing) {
      terminal.pricing = {
        ...terminal.pricing,
        ...(payload.pricing as typeof terminal.pricing),
      };
    }

    const simpleFields = ['name', 'chargingMethod', 'connectorTypes', 'maximumPowerKw', 'capacity', 'status', 'availability'] as const;
    for (const field of simpleFields) {
      if (payload[field] !== undefined) {
        (terminal as unknown as Record<string, unknown>)[field] = payload[field];
      }
    }

    await terminal.save();
    return terminal;
  },

  async updateTerminalStatus(userId: string, terminalId: string, input: { status?: string; availability?: boolean }) {
    return this.updateTerminal(userId, terminalId, input);
  },

  async deleteTerminal(userId: string, terminalId: string) {
    const terminal = await requireOwnedTerminal(userId, terminalId);
    await terminal.deleteOne();
    return { deleted: true };
  },
};

export type TerminalService = typeof terminalService;
