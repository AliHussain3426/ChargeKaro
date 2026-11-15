import { useEffect } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DiscoveryStation } from '@/services/discovery';
import type { RouteResult } from '@/services/discovery';

// Fix default marker icons in bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error leaflet icon internals
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function FitBounds({ stations, userLocation, route }: { stations: DiscoveryStation[]; userLocation: { lat: number; lng: number } | null; route: RouteResult | null }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [];
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);
    stations.forEach((s) => {
      const [lng, lat] = s.location.coordinates;
      if (Number.isFinite(lat) && Number.isFinite(lng)) points.push([lat, lng]);
    });
    if (route?.geometry?.coordinates?.length) {
      route.geometry.coordinates.forEach(([lng, lat]) => points.push([lat, lng]));
    }
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [30, 30] });
    }
  }, [map, stations, userLocation, route]);
  return null;
}

export default function StationMap({
  stations,
  selectedStationId,
  onSelectStation,
  userLocation,
  route,
}: {
  stations: DiscoveryStation[];
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
  userLocation: { lat: number; lng: number } | null;
  route: RouteResult | null;
}) {
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : stations[0]
      ? [stations[0].location.coordinates[1], stations[0].location.coordinates[0]]
      : [31.5204, 74.3436];

  const routePositions: [number, number][] = (route?.geometry?.coordinates ?? []).map(([lng, lat]) => [lat, lng]);

  return (
    <div className="station-map-leaflet" style={{ height: '100%', minHeight: '320px' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%', borderRadius: '16px' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds stations={stations} userLocation={userLocation} route={route} />
        {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} />}
        {stations.map((station) => {
          const [lng, lat] = station.location.coordinates;
          return (
            <Marker
              key={station._id}
              position={[lat, lng]}
              eventHandlers={{ click: () => onSelectStation(station._id) }}
              opacity={selectedStationId === station._id ? 1 : 0.8}
            />
          );
        })}
        {routePositions.length > 1 && <Polyline positions={routePositions} color="#0b7d68" weight={4} />}
      </MapContainer>
    </div>
  );
}
