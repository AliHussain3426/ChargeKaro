import { Station } from '../stations/model.js';
import { Terminal } from '../terminals/model.js';
import { StationStatus } from '../../types/index.js';

export interface DiscoveryQuery {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  city?: string;
  q?: string;
  available?: boolean;
  connector?: string;
  minPower?: number;
  maxPrice?: number;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return undefined;
}

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function normalizeDiscoveryQuery(raw: Record<string, unknown>): DiscoveryQuery {
  return {
    lat: toNumber(raw.lat),
    lng: toNumber(raw.lng),
    radiusKm: toNumber(raw.radius ?? raw.radiusKm),
    city: typeof raw.city === 'string' ? raw.city.trim() : undefined,
    q: typeof raw.q === 'string' ? raw.q.trim() : undefined,
    available: parseBoolean(raw.available),
    connector: typeof raw.connector === 'string' ? raw.connector.trim() : undefined,
    minPower: toNumber(raw.minPower ?? raw.power),
    maxPrice: toNumber(raw.maxPrice ?? raw.price),
  };
}

export async function discoverStations(query: DiscoveryQuery) {
  const hasGeo = typeof query.lat === 'number' && typeof query.lng === 'number';
  const radiusMeters = Math.max(0.1, query.radiusKm ?? 10) * 1000;

  const match: Record<string, unknown> = {
    status: { $ne: StationStatus.SUSPENDED },
  };

  if (query.city) {
    match.city = { $regex: query.city, $options: 'i' };
  }
  if (query.q) {
    match.$or = [
      { name: { $regex: query.q, $options: 'i' } },
      { address: { $regex: query.q, $options: 'i' } },
      { city: { $regex: query.q, $options: 'i' } },
    ];
  }

  let stations: any[] = [];

  if (hasGeo) {
    stations = await Station.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [query.lng as number, query.lat as number] },
          distanceField: 'distanceMeters',
          maxDistance: radiusMeters,
          spherical: true,
          query: match,
        },
      },
    ]).exec();
  } else {
    stations = await Station.find(match).lean().exec();
  }

  if (stations.length === 0) return [];

  const stationIds = stations.map((s) => s._id);
  const terminals = await Terminal.find({ stationId: { $in: stationIds } as any }).lean().exec();

  const terminalsByStation = new Map<string, any[]>();
  for (const terminal of terminals) {
    const key = terminal.stationId.toString();
    const list = terminalsByStation.get(key) ?? [];
    list.push(terminal);
    terminalsByStation.set(key, list);
  }

  const connectorNeedle = query.connector?.toLowerCase();

  const results = stations
    .map((station) => {
      let stationTerminals = terminalsByStation.get(station._id.toString()) ?? [];

      if (query.available) {
        stationTerminals = stationTerminals.filter(
          (t) => t.availability === true && t.status === 'AVAILABLE'
        );
      }
      if (connectorNeedle) {
        stationTerminals = stationTerminals.filter((t) =>
          (t.connectorTypes ?? []).some((c: string) => c.toLowerCase().includes(connectorNeedle))
        );
      }
      if (typeof query.minPower === 'number') {
        stationTerminals = stationTerminals.filter((t) => (t.maximumPowerKw ?? 0) >= query.minPower!);
      }
      if (typeof query.maxPrice === 'number') {
        stationTerminals = stationTerminals.filter((t) => (t.pricing?.amount ?? Infinity) <= query.maxPrice!);
      }

      const availableCount = stationTerminals.filter(
        (t) => t.availability === true && t.status === 'AVAILABLE'
      ).length;

      return {
        ...station,
        distanceKm:
          typeof station.distanceMeters === 'number'
            ? Math.round((station.distanceMeters / 1000) * 100) / 100
            : undefined,
        terminals: stationTerminals,
        availableTerminalCount: availableCount,
      };
    })
    .filter((station) => {
      // If terminal-level filters were requested, only keep stations with matching terminals
      const hasTerminalFilter =
        query.available !== undefined ||
        !!query.connector ||
        typeof query.minPower === 'number' ||
        typeof query.maxPrice === 'number';
      if (!hasTerminalFilter) return true;
      return station.terminals.length > 0;
    });

  return results;
}
