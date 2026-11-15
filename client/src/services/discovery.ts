import { apiFetch } from './api';
import type { Station, Terminal } from './stations';

export interface DiscoveryStation extends Station {
  distanceKm?: number;
  terminals: Terminal[];
  availableTerminalCount: number;
}

export interface DiscoveryQuery {
  lat?: number;
  lng?: number;
  radius?: number;
  city?: string;
  q?: string;
  available?: boolean;
  connector?: string;
  minPower?: number;
  maxPrice?: number;
}

export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  source: string;
}

function appendParam(params: URLSearchParams, key: string, value: unknown) {
  if (value === undefined || value === null || value === '') return;
  params.set(key, String(value));
}

export async function discoverStations(query: DiscoveryQuery): Promise<DiscoveryStation[]> {
  const params = new URLSearchParams();
  appendParam(params, 'lat', query.lat);
  appendParam(params, 'lng', query.lng);
  appendParam(params, 'radius', query.radius);
  appendParam(params, 'city', query.city);
  appendParam(params, 'q', query.q);
  appendParam(params, 'available', query.available);
  appendParam(params, 'connector', query.connector);
  appendParam(params, 'minPower', query.minPower);
  appendParam(params, 'maxPrice', query.maxPrice);

  const qs = params.toString();
  const data = await apiFetch<{ stations: DiscoveryStation[] }>(`/discovery/stations${qs ? `?${qs}` : ''}`);
  return data.stations ?? [];
}

export async function getRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<RouteResult> {
  const params = new URLSearchParams({
    originLat: String(origin.lat),
    originLng: String(origin.lng),
    destLat: String(destination.lat),
    destLng: String(destination.lng),
  });
  const data = await apiFetch<{ route: RouteResult }>(`/routes?${params.toString()}`);
  return data.route;
}
