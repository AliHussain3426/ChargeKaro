import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Types } from 'mongoose';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';
import { Terminal } from '../src/modules/terminals/model.js';
import { TerminalStatus } from '../src/types/index.js';

function buildValidTerminalInput() {
  return {
    stationId: new Types.ObjectId(),
    name: 'Terminal GC-01',
    chargingMethod: 'AC',
    connectorTypes: ['TYPE_2'],
    maximumPowerKw: 22,
    capacity: 1,
    pricing: {
      amount: 60,
      currency: 'PKR',
      billingType: 'PER_KWH',
    },
    status: TerminalStatus.AVAILABLE,
    availability: true,
  };
}

describe('Terminal model', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  it('defaults new terminals to the AVAILABLE status', () => {
    const terminal = new Terminal({
      ...buildValidTerminalInput(),
      status: undefined,
      availability: undefined,
    });

    expect(terminal.status).toBe(TerminalStatus.AVAILABLE);
    expect(terminal.availability).toBe(true);
    expect(terminal.validateSync()).toBeUndefined();
  });

  it.each([
    TerminalStatus.AVAILABLE,
    TerminalStatus.OCCUPIED,
    TerminalStatus.UNAVAILABLE,
    TerminalStatus.MAINTENANCE,
  ])('accepts the terminal status %s', (status) => {
    const terminal = new Terminal({ ...buildValidTerminalInput(), status });

    expect(terminal.status).toBe(status);
    expect(terminal.validateSync()).toBeUndefined();
  });

  it('rejects a terminal status outside the TerminalStatus enum', () => {
    const terminal = new Terminal({
      ...buildValidTerminalInput(),
      status: 'BROKEN',
    });

    const validationError = terminal.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors['status']).toBeDefined();
  });
});
