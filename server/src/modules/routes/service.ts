import { AppError } from '../../middleware/errorHandler.js';

export interface RouteRequest {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}

export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  geometry: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  source: 'osrm';
}

function toNumber(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function parseRouteQuery(raw: Record<string, unknown>): RouteRequest {
  // Support originLat/originLng/destLat/destLng or origin=lat,lng & destination=lat,lng
  let originLat = toNumber(raw.originLat);
  let originLng = toNumber(raw.originLng);
  let destLat = toNumber(raw.destLat ?? raw.destinationLat);
  let destLng = toNumber(raw.destLng ?? raw.destinationLng);

  if (typeof raw.origin === 'string' && raw.origin.includes(',')) {
    const [a, b] = raw.origin.split(',').map((s) => toNumber(s.trim()));
    if (originLat === undefined) originLat = a;
    if (originLng === undefined) originLng = b;
  }
  if (typeof raw.destination === 'string' && raw.destination.includes(',')) {
    const [a, b] = raw.destination.split(',').map((s) => toNumber(s.trim()));
    if (destLat === undefined) destLat = a;
    if (destLng === undefined) destLng = b;
  }

  if (
    originLat === undefined ||
    originLng === undefined ||
    destLat === undefined ||
    destLng === undefined
  ) {
    throw new AppError('origin and destination coordinates are required', 400);
  }

  return { originLat, originLng, destLat, destLng };
}

export async function computeRoute(request: RouteRequest): Promise<RouteResult> {
  const { originLat, originLng, destLat, destLng } = request;
  const baseUrl = process.env.OSRM_BASE_URL || 'https://router.project-osrm.org';
  const url = `${baseUrl}/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new AppError('Failed to compute route', 502);
  }

  const data = (await response.json()) as any;
  const route = data?.routes?.[0];
  if (!route || !route.geometry) {
    throw new AppError('No route found', 404);
  }

  return {
    distanceMeters: route.distance ?? 0,
    durationSeconds: route.duration ?? 0,
    geometry: route.geometry,
    source: 'osrm',
  };
}
