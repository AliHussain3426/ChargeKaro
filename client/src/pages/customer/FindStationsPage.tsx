import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, CalendarPlus, Crosshair, Loader2, MapPin, Navigation, PlugZap, Search, SlidersHorizontal } from 'lucide-react';
import StationMap from './StationMap';
import { discoverStations, getRoute, type DiscoveryStation, type RouteResult } from '@/services/discovery';
import { listVehicles, type Vehicle } from '@/services/vehicles';
import { createBooking } from '@/services/bookings';

export interface DiscoveryFilters {
  q: string;
  available: boolean;
  connector: string;
  minPower: string;
}

export interface BookingFormValues {
  vehicleId: string;
  terminalId: string;
  startTime: string;
  endTime: string;
}

export type BookingFormErrors = Partial<Record<keyof BookingFormValues, string>>;

export function filterAndRankStations(stations: DiscoveryStation[], filters: DiscoveryFilters): DiscoveryStation[] {
  const q = filters.q.trim().toLowerCase();
  return stations.filter((station) => {
    if (filters.available && (station.availableTerminalCount ?? 0) <= 0) return false;
    if (filters.minPower) {
      const min = Number(filters.minPower);
      if (Number.isFinite(min)) {
        const hasPower = station.terminals.some((t) => (t.maximumPowerKw ?? 0) >= min);
        if (!hasPower) return false;
      }
    }
    if (filters.connector) {
      const needle = filters.connector.toLowerCase();
      const hasConnector = station.terminals.some((t) => (t.connectorTypes ?? []).some((c) => c.toLowerCase().includes(needle)));
      if (!hasConnector) return false;
    }
    if (q) {
      const hay = `${station.name} ${station.address} ${station.city ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function validateBookingForm(values: BookingFormValues): BookingFormErrors {
  const errors: BookingFormErrors = {};
  if (!values.vehicleId) errors.vehicleId = 'Select a vehicle.';
  if (!values.terminalId) errors.terminalId = 'Select a terminal.';
  if (!values.startTime) errors.startTime = 'Choose a start time.';
  if (!values.endTime) errors.endTime = 'Choose an end time.';
  if (values.startTime && values.endTime) {
    const start = new Date(values.startTime).getTime();
    const end = new Date(values.endTime).getTime();
    if (!(start < end)) errors.endTime = 'End time must be after start time.';
  }
  return errors;
}

function formatDistance(station: DiscoveryStation): string {
  if (typeof station.distanceKm === 'number') return `${station.distanceKm.toFixed(1)} km`;
  return 'Distance n/a';
}

export default function FindStationsPage() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<DiscoveryFilters>({ q: '', available: false, connector: '', minPower: '' });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [stations, setStations] = useState<DiscoveryStation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routing, setRouting] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormValues>({ vehicleId: '', terminalId: '', startTime: '', endTime: '' });
  const [bookingErrors, setBookingErrors] = useState<BookingFormErrors>({});
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  async function loadStations(loc: { lat: number; lng: number } | null, q: string) {
    setLoading(true);
    setError('');
    try {
      const data = await discoverStations({
        ...(loc ? { lat: loc.lat, lng: loc.lng, radius: 25 } : {}),
        q: q || undefined,
      });
      setStations(data);
      setSelectedId((current) => (current && data.some((s) => s._id === current) ? current : data[0]?._id ?? null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discover stations.');
      setStations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStations(null, '');
  }, []);

  useEffect(() => {
    let cancelled = false;
    listVehicles()
      .then((data) => { if (!cancelled) setVehicles(data); })
      .catch(() => { /* vehicles optional for browsing */ });
    return () => { cancelled = true; };
  }, []);

  const visibleStations = useMemo(
    () => filterAndRankStations(stations, { ...filters, q: query }),
    [stations, filters, query]
  );

  const selectedStation = visibleStations.find((s) => s._id === selectedId) ?? visibleStations[0] ?? null;

  useEffect(() => {
    if (selectedStation && !visibleStations.some((s) => s._id === selectedId)) {
      setSelectedId(selectedStation._id);
    }
  }, [selectedId, selectedStation, visibleStations]);

  useEffect(() => {
    if (selectedStation?.terminals?.[0]?._id) {
      setBookingForm((f) => ({ ...f, terminalId: f.terminalId && selectedStation.terminals.some(t => t._id === f.terminalId) ? f.terminalId : selectedStation.terminals[0]._id }));
    }
  }, [selectedStation]);

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not available in this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        void loadStations(loc, query);
      },
      () => setError('Unable to access your location.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handleSearch() {
    await loadStations(userLocation, query);
  }

  async function handleRoute() {
    if (!selectedStation) return;
    const [destLng, destLat] = selectedStation.location.coordinates;
    if (!userLocation) {
      setError('Use your location to compute a route to this station.');
      return;
    }
    setRouting(true);
    setError('');
    try {
      const result = await getRoute(userLocation, { lat: destLat, lng: destLng });
      setRoute(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute route.');
    } finally {
      setRouting(false);
    }
  }

  async function handleCreateBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStation) return;
    const nextErrors = validateBookingForm(bookingForm);
    setBookingErrors(nextErrors);
    setBookingMessage('');
    if (Object.keys(nextErrors).length > 0) return;

    setBookingSubmitting(true);
    try {
      const booking = await createBooking({
        vehicleId: bookingForm.vehicleId,
        stationId: selectedStation._id,
        terminalId: bookingForm.terminalId,
        requestedStartTime: new Date(bookingForm.startTime).toISOString(),
        requestedEndTime: new Date(bookingForm.endTime).toISOString(),
      });
      setBookingMessage(`Booking ${booking.bookingReference} created (${booking.status.replace(/_/g, ' ')}). Payment step is available after supplier accepts (stub).`);
      setShowBooking(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking.');
    } finally {
      setBookingSubmitting(false);
    }
  }

  return (
    <div className="workspace-page station-discovery">
      <header className="workspace-head station-discovery-head">
        <div>
          <h1>Find a charger</h1>
          <p>Discover compatible charging stations, compare availability, plan your route, and request a booking.</p>
        </div>
        <button
          className={`workspace-action workspace-action--secondary station-filter ${filters.available ? 'is-active' : ''}`}
          type="button"
          onClick={() => setFilters((f) => ({ ...f, available: !f.available }))}
        >
          <SlidersHorizontal className="size-4" />{filters.available ? 'Available only' : 'Filters'}
        </button>
      </header>

      <div className="station-search">
        <Search className="size-4" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch(); }}
          placeholder="Search a city, area, or station"
          aria-label="Search a city, area, or station"
        />
        <button type="button" onClick={() => void handleSearch()} aria-label="Search stations">
          <Search className="size-4" /> <span>Search</span>
        </button>
        <button type="button" onClick={handleUseLocation} aria-label="Use my location">
          <Crosshair className="size-4" /> <span>Use location</span>
        </button>
      </div>

      <div className="station-discovery-grid">
        <section className="workspace-panel station-results">
          <div className="workspace-panel-head">
            <div>
              <h2>{visibleStations.length} charger{visibleStations.length === 1 ? '' : 's'} found</h2>
              <p>{filters.available ? 'Showing stations with available terminals.' : userLocation ? 'Sorted by distance from your location.' : 'Search or use your location for nearby results.'}</p>
            </div>
            <label style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.78rem' }}>
              Min kW
              <input
                style={{ width: '72px', minHeight: '30px', border: '1px solid #d7e4df', borderRadius: '8px', padding: '0 .4rem' }}
                value={filters.minPower}
                onChange={(e) => setFilters((f) => ({ ...f, minPower: e.target.value }))}
                inputMode="decimal"
              />
            </label>
          </div>

          {error && <p className="form-error" role="alert" style={{ margin: '.75rem 1rem 0' }}>{error}</p>}
          {bookingMessage && <p className="workspace-notice" style={{ margin: '.75rem 1rem 0' }}>{bookingMessage}</p>}
          {loading ? (
            <p style={{ padding: '1rem 1.15rem' }}>Loading stations…</p>
          ) : (
            <ul className="workspace-list">
              {visibleStations.map((station) => (
                <li key={station._id}>
                  <button className={`station-result ${selectedStation?._id === station._id ? 'is-selected' : ''}`} onClick={() => { setSelectedId(station._id); setBookingMessage(''); }}>
                    <span className={`station-status-dot ${(station.availableTerminalCount ?? 0) > 0 ? '' : 'is-busy'}`} />
                    <span className="station-result-main">
                      <strong>{station.name}</strong>
                      <small>{station.address}{station.city ? `, ${station.city}` : ''}</small>
                      <em>{station.terminals[0]?.maximumPowerKw ?? '-'} kW · {station.availableTerminalCount}/{station.terminals.length} available</em>
                    </span>
                    <span className="station-result-side">
                      <b>{formatDistance(station)}</b>
                      <span>{(station.availableTerminalCount ?? 0) > 0 ? 'Available' : 'Busy'}</span>
                      <ArrowUpRight className="size-4" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!loading && visibleStations.length === 0 && (
            <div className="workspace-empty"><MapPin className="size-7" /><strong>No matching chargers</strong><p>Try another area, broaden filters, or use your location.</p></div>
          )}

          {selectedStation && (
            <div style={{ padding: '1rem 1.15rem', borderTop: '1px solid #e9f1ee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                <strong>Book {selectedStation.name}</strong>
                <button className="workspace-action" type="button" onClick={() => { setShowBooking((v) => !v); setError(''); }}>
                  <CalendarPlus className="size-4" /> {showBooking ? 'Close' : 'Request booking'}
                </button>
              </div>
              {showBooking && (
                <form className="workspace-form" onSubmit={handleCreateBooking} style={{ marginTop: '.75rem' }}>
                  <div className="workspace-form-grid">
                    <label className="workspace-field">
                      <span>Vehicle</span>
                      <select value={bookingForm.vehicleId} onChange={(e) => setBookingForm((f) => ({ ...f, vehicleId: e.target.value }))}>
                        <option value="">Select vehicle</option>
                        {vehicles.map((v) => <option key={v._id} value={v._id}>{v.manufacturer} {v.model}</option>)}
                      </select>
                      {bookingErrors.vehicleId && <em className="workspace-field-error">{bookingErrors.vehicleId}</em>}
                    </label>
                    <label className="workspace-field">
                      <span>Terminal</span>
                      <select value={bookingForm.terminalId} onChange={(e) => setBookingForm((f) => ({ ...f, terminalId: e.target.value }))}>
                        <option value="">Select terminal</option>
                        {selectedStation.terminals.map((t) => <option key={t._id} value={t._id}>{t.name} · {(t.connectorTypes || []).join(', ')} · {t.maximumPowerKw}kW</option>)}
                      </select>
                      {bookingErrors.terminalId && <em className="workspace-field-error">{bookingErrors.terminalId}</em>}
                    </label>
                    <label className="workspace-field">
                      <span>Start time</span>
                      <input type="datetime-local" value={bookingForm.startTime} onChange={(e) => setBookingForm((f) => ({ ...f, startTime: e.target.value }))} />
                      {bookingErrors.startTime && <em className="workspace-field-error">{bookingErrors.startTime}</em>}
                    </label>
                    <label className="workspace-field">
                      <span>End time</span>
                      <input type="datetime-local" value={bookingForm.endTime} onChange={(e) => setBookingForm((f) => ({ ...f, endTime: e.target.value }))} />
                      {bookingErrors.endTime && <em className="workspace-field-error">{bookingErrors.endTime}</em>}
                    </label>
                  </div>
                  <p style={{ fontSize: '.78rem', color: 'var(--gc-ink-soft)' }}>Flow: select vehicle → terminal → (optional route) → confirm. Payment step is a deferred stub (available after supplier accepts).</p>
                  <div className="workspace-form-actions">
                    <button className="workspace-action" type="submit" disabled={bookingSubmitting}>
                      {bookingSubmitting ? <><Loader2 className="size-4 animate-spin" /> Requesting…</> : 'Confirm booking request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>

        <section className="station-map" aria-label="Station map">
          <StationMap
            stations={visibleStations}
            selectedStationId={selectedStation?._id ?? null}
            onSelectStation={setSelectedId}
            userLocation={userLocation}
            route={route}
          />
          <div className="station-map-summary">
            <span className="workspace-row-icon"><PlugZap className="size-4" /></span>
            <div>
              <strong>{selectedStation?.name ?? 'Select a station'}</strong>
              <p>
                {selectedStation
                  ? `${formatDistance(selectedStation)} · ${selectedStation.availableTerminalCount}/${selectedStation.terminals.length} terminals available${route ? ` · Route ${(route.distanceMeters / 1000).toFixed(1)} km` : ''}`
                  : 'Search or use your location to find nearby chargers.'}
              </p>
            </div>
            <button className="workspace-text-button" type="button" onClick={() => void handleRoute()} disabled={!selectedStation || routing || !userLocation}>
              <Navigation className="size-4" /> {routing ? 'Routing…' : 'Route'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
