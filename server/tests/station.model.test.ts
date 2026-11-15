import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Types } from 'mongoose';
import { startTestDatabase, stopTestDatabase } from './helpers/mongo.js';
import { Station } from '../src/modules/stations/model.js';
import { PricingType } from '../src/types/index.js';

function buildValidStationInput() {
  return {
    supplierId: new Types.ObjectId(),
    name: 'Gulberg Charge Hub',
    address: '12 Main Street, Gulberg, Karachi',
    location: {
      type: 'Point',
      coordinates: [67.0384, 24.8615],
    },
    pricing: {
      amount: 150,
      currency: 'PKR',
      billingType: PricingType.PER_KWH,
    },
    operatingHours: {
      timezone: 'Asia/Karachi',
      opensAt: '08:00',
      closesAt: '23:00',
    },
  };
}

describe('Station model', () => {
  beforeAll(async () => {
    await startTestDatabase();
  });

  afterAll(async () => {
    await stopTestDatabase();
  });

  it('accepts a valid station with a valid GeoJSON point', () => {
    const station = new Station(buildValidStationInput());

    expect(station.validateSync()).toBeUndefined();
  });

  it('requires a location with GeoJSON point coordinates', () => {
    const { location: _omittedLocation, ...stationInput } = buildValidStationInput();
    const station = new Station(stationInput);

    const validationError = station.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError?.errors['location']).toBeDefined();
  });

  it('rejects coordinates outside the GeoJSON longitude and latitude ranges', () => {
    const invalidLongitudeStation = new Station({
      ...buildValidStationInput(),
      location: { type: 'Point', coordinates: [200, 24.8615] },
    });

    expect(invalidLongitudeStation.validateSync()).toBeDefined();

    const invalidLatitudeStation = new Station({
      ...buildValidStationInput(),
      location: { type: 'Point', coordinates: [67.0384, 95] },
    });

    expect(invalidLatitudeStation.validateSync()).toBeDefined();
  });
});
