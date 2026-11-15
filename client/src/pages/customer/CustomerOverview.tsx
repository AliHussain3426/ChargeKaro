import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, CarFront, ChevronRight, MapPin, PlugZap, Route } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { listVehicles, type Vehicle } from '@/services/vehicles';
import { listBookings, type Booking } from '@/services/bookings';
import { discoverStations, type DiscoveryStation } from '@/services/discovery';

function isUpcoming(status: string) {
  return ['PENDING_SUPPLIER', 'ACCEPTED_AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'].includes(status);
}

export default function CustomerOverview() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stations, setStations] = useState<DiscoveryStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [v, b, s] = await Promise.all([
          listVehicles().catch(() => [] as Vehicle[]),
          listBookings().catch(() => [] as Booking[]),
          discoverStations({}).catch(() => [] as DiscoveryStation[]),
        ]);
        if (!cancelled) {
          setVehicles(v);
          setBookings(b);
          setStations(s);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const primaryVehicle = vehicles[0];
  const upcoming = useMemo(() => bookings.filter((b) => isUpcoming(b.status)), [bookings]);
  const nextBooking = upcoming[0];
  const nearestStation = stations[0];

  return (
    <div className="overview-page driver-overview">
      <header className="overview-intro">
        <div>
          <p className="overview-location"><MapPin className="size-4" /> {user?.name ? `Welcome, ${user.name}` : 'Your dashboard'}</p>
          <h1>Your next charge is within reach.</h1>
          <p>
            {loading
              ? 'Loading your vehicles, bookings, and nearby stations…'
              : `${vehicles.length} vehicle${vehicles.length === 1 ? '' : 's'} · ${upcoming.length} upcoming booking${upcoming.length === 1 ? '' : 's'} · ${stations.length} station${stations.length === 1 ? '' : 's'} discovered.`}
          </p>
        </div>
        <Link to="/customer/stations" className="overview-primary">Plan a charging stop <ArrowUpRight className="size-4" /></Link>
      </header>

      <section className="driver-stage">
        <article className="charge-portrait">
          <div className="charge-portrait-copy">
            <span className="overview-tag">{primaryVehicle ? `${primaryVehicle.manufacturer} ${primaryVehicle.model}` : 'Vehicle profile'}</span>
            <h2>{primaryVehicle ? `${primaryVehicle.manufacturer} ${primaryVehicle.model}` : 'Add your vehicle'}</h2>
            <p>{primaryVehicle ? `Compatible connectors: ${(primaryVehicle.connectorTypes || []).join(', ') || '—'}.` : 'Register a vehicle to get compatible station matches and faster bookings.'}</p>
          </div>
          <div className="charge-orbit" aria-label="Vehicle summary">
            <div className="charge-orbit-inner"><CarFront className="size-7" /><strong>{vehicles.length}</strong><span>Vehicles</span></div>
          </div>
          <div className="charge-portrait-foot">
            <span><b>{upcoming.length}</b> upcoming</span>
            <span><b>{bookings.length}</b> total bookings</span>
            <span><b>{stations.length}</b> stations found</span>
          </div>
        </article>

        <article className="next-stop-card">
          <div className="next-stop-map"><span className="next-stop-route" /><span className="next-stop-pin next-stop-pin--origin"><Route className="size-3" /></span><span className="next-stop-pin next-stop-pin--station"><PlugZap className="size-3" /></span></div>
          <div className="next-stop-copy">
            <span className="overview-tag overview-tag--green">{nextBooking ? 'Next booking' : 'Nearby station'}</span>
            <h2>{nextBooking ? nextBooking.bookingReference : (nearestStation?.name ?? 'Find a charger')}</h2>
            <p>
              {nextBooking
                ? `${nextBooking.status.replace(/_/g, ' ')} · ${new Date(nextBooking.requestedStartTime).toLocaleString()}`
                : (nearestStation ? `${nearestStation.address}${nearestStation.city ? `, ${nearestStation.city}` : ''}` : 'Search and discover compatible stations near you.')}
            </p>
            <div className="next-stop-meta">
              <span>{nearestStation ? `${nearestStation.availableTerminalCount ?? 0}/${nearestStation.terminals.length} available` : 'Discovery'}</span>
              <span>{nearestStation?.terminals?.[0]?.maximumPowerKw ? `${nearestStation.terminals[0].maximumPowerKw} kW` : 'Live data'}</span>
            </div>
            <Link to={nextBooking ? '/customer/bookings' : '/customer/stations'} className="overview-text-link">
              {nextBooking ? 'View bookings' : 'View station details'} <ChevronRight className="size-4" />
            </Link>
          </div>
        </article>
      </section>

      <section className="driver-lower-grid">
        <article className="overview-action-card">
          <div><span className="overview-icon"><CalendarDays className="size-5" /></span><h2>Reserve before you leave.</h2><p>Choose a compatible charger and request the time that works for your journey.</p></div>
          <Link to="/customer/stations" className="overview-text-link">Choose a station <ChevronRight className="size-4" /></Link>
        </article>
        <article className="overview-vehicle-card">
          <CarFront className="size-5" />
          <div>
            <span>Your vehicle profile</span>
            <strong>{primaryVehicle ? `${primaryVehicle.manufacturer} ${primaryVehicle.model} is ready` : 'No vehicle added yet'}</strong>
            <p>Keep charging details current to improve station matches.</p>
          </div>
          <Link to="/customer/vehicles" aria-label="Manage vehicles"><ChevronRight className="size-5" /></Link>
        </article>
        <article className="overview-route-card">
          <Route className="size-5" />
          <div><span>Bookings</span><strong>{upcoming.length ? `${upcoming.length} upcoming session${upcoming.length === 1 ? '' : 's'} tracked.` : 'No upcoming bookings yet.'}</strong></div>
        </article>
      </section>
    </div>
  );
}
