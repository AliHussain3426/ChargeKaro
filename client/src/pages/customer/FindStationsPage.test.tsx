import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { filterAndRankStations, type DiscoveryFilters } from './FindStationsPage';
import type { DiscoveryStation } from '@/services/discovery';

// Mock map and API for jsdom-safe rendering
vi.mock('./StationMap', () => ({
  default: ({ stations }: { stations: DiscoveryStation[] }) => (
    <div data-testid="station-map">markers:{stations.length}</div>
  ),
}));

vi.mock('@/services/discovery', () => ({
  discoverStations: vi.fn(async () => []),
  getRoute: vi.fn(async () => ({
    distanceMeters: 1000,
    durationSeconds: 120,
    geometry: { type: 'LineString', coordinates: [] },
    source: 'osrm',
  })),
}));

vi.mock('@/services/vehicles', () => ({
  listVehicles: vi.fn(async () => []),
}));

vi.mock('@/services/bookings', () => ({
  createBooking: vi.fn(async () => ({ _id: 'b1', bookingReference: 'BK-1', status: 'PENDING_SUPPLIER' })),
}));

import FindStationsPage from './FindStationsPage';

const baseStation = (overrides: Partial<DiscoveryStation> = {}): DiscoveryStation => ({
  _id: overrides._id ?? 's1',
  supplierId: 'sup1',
  name: overrides.name ?? 'Station One',
  address: 'Main Road',
  city: 'Lahore',
  country: 'Pakistan',
  location: { type: 'Point', coordinates: [74.34, 31.52] },
  pricing: { amount: 50, currency: 'PKR', billingType: 'PER_KWH' },
  operatingHours: { timezone: 'Asia/Karachi', opensAt: '08:00', closesAt: '22:00' },
  terminals: overrides.terminals ?? [
    {
      _id: 't1',
      stationId: overrides._id ?? 's1',
      name: 'T1',
      chargingMethod: 'DC',
      connectorTypes: ['CCS2'],
      maximumPowerKw: 50,
      capacity: 1,
      pricing: { amount: 55, currency: 'PKR', billingType: 'PER_KWH' },
      status: 'AVAILABLE',
      availability: true,
    } as any,
  ],
  availableTerminalCount: overrides.availableTerminalCount ?? 1,
  distanceKm: overrides.distanceKm,
});

const defaultFilters: DiscoveryFilters = { q: '', available: false, connector: '', minPower: '' };

describe('FindStationsPage discovery logic', () => {
  afterEach(() => cleanup());

  it('filters stations by query text', () => {
    const stations = [baseStation({ _id: '1', name: 'Gulberg Hub' }), baseStation({ _id: '2', name: 'DHA Stop' })];
    const result = filterAndRankStations(stations, { ...defaultFilters, q: 'gulberg' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Gulberg Hub');
  });

  it('filters stations requiring available terminals', () => {
    const stations = [baseStation({ _id: '1', availableTerminalCount: 1 }), baseStation({ _id: '2', availableTerminalCount: 0 })];
    const result = filterAndRankStations(stations, { ...defaultFilters, available: true });
    expect(result).toHaveLength(1);
    expect(result[0]._id).toBe('1');
  });

  it('filters stations by connector and minimum power', () => {
    const stations = [
      baseStation({ _id: '1', terminals: [{ ...(baseStation().terminals[0] as any), connectorTypes: ['CCS2'], maximumPowerKw: 60 }] }),
      baseStation({ _id: '2', terminals: [{ ...(baseStation().terminals[0] as any), connectorTypes: ['Type 2'], maximumPowerKw: 22 }] }),
    ];
    expect(filterAndRankStations(stations, { ...defaultFilters, connector: 'CCS2' }).map((s) => s._id)).toEqual(['1']);
    expect(filterAndRankStations(stations, { ...defaultFilters, minPower: '50' }).map((s) => s._id)).toEqual(['1']);
  });

  it('renders discovery page with map placeholder (jsdom-safe)', async () => {
    render(
      <MemoryRouter>
        <FindStationsPage />
      </MemoryRouter>
    );
    expect(await screen.findByText('Find a charger')).toBeTruthy();
    expect(screen.getByTestId('station-map')).toBeTruthy();
  });
});
