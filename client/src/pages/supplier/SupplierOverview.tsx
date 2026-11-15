import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarCheck, ChevronRight, CircleDollarSign, PlugZap, Store, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { listStations, listTerminals, type Station, type Terminal } from '@/services/stations';
import { listBookings, type Booking } from '@/services/bookings';
import { getSupplierEarnings } from '@/services/payments';

export default function SupplierOverview() {
  const { user } = useAuth();
  const [stations, setStations] = useState<Station[]>([]);
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [netPayable, setNetPayable] = useState<number>(0);
  const [paidCount, setPaidCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [sts, bks, earnings] = await Promise.all([
          listStations().catch(() => [] as Station[]),
          listBookings().catch(() => [] as Booking[]),
          getSupplierEarnings().catch(() => null),
        ]);
        if (cancelled) return;
        setStations(sts);
        setBookings(bks);
        if (earnings) {
          setNetPayable(earnings.netPayable ?? 0);
          setPaidCount(earnings.paidCount ?? 0);
        }
        const terminalLists = await Promise.all(
          sts.map((s) => listTerminals(s._id).catch(() => [] as Terminal[]))
        );
        if (!cancelled) setTerminals(terminalLists.flat());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const pending = useMemo(() => bookings.filter((b) => b.status === 'PENDING_SUPPLIER'), [bookings]);
  const availableTerminals = terminals.filter((t) => t.availability && t.status === 'AVAILABLE').length;
  const primaryStation = stations[0];

  return (
    <div className="overview-page supplier-overview">
      <header className="overview-intro">
        <div>
          <p className="overview-location"><Store className="size-4" /> {user?.name || 'Supplier workspace'}</p>
          <h1>Keep the charging network in motion.</h1>
          <p>{loading ? 'Loading your stations, terminals, and bookings…' : `${stations.length} station${stations.length === 1 ? '' : 's'} · ${pending.length} booking request${pending.length === 1 ? '' : 's'} awaiting decision.`}</p>
        </div>
        <Link to="/supplier/stations" className="overview-primary">Manage stations <ArrowUpRight className="size-4" /></Link>
      </header>

      <section className="supplier-stage">
        <article className="supplier-command-card">
          <div className="supplier-command-copy">
            <span className="overview-tag">Today’s operating picture</span>
            <h2>{pending.length} request{pending.length === 1 ? '' : 's'} waiting for a decision.</h2>
            <p>Review incoming booking requests and keep terminal availability up to date.</p>
            <Link to="/supplier/bookings" className="supplier-command-action">Review booking requests <ChevronRight className="size-4" /></Link>
          </div>
          <div className="supplier-command-count"><span>Requests</span><strong>{pending.length}</strong><small>Awaiting review</small></div>
          <div className="supplier-command-signals">
            <span><b>{stations.length}</b> stations</span>
            <span><b>{terminals.length}</b> terminals tracked</span>
            <span><b>{availableTerminals}</b> ports available</span>
          </div>
        </article>

        <article className="supplier-station-focus">
          <div className="supplier-station-map"><span className="supplier-map-mark"><Zap className="size-4" /></span></div>
          <div>
            <span className="overview-tag overview-tag--green">Station status</span>
            <h2>{primaryStation?.name ?? 'No station yet'}</h2>
            <p>{primaryStation ? `${primaryStation.address}${primaryStation.city ? `, ${primaryStation.city}` : ''}` : 'Add a station to start receiving bookings.'}</p>
            <div className="next-stop-meta"><span>{terminals.length} terminals</span><span>{availableTerminals} available</span></div>
            <Link to="/supplier/terminals" className="overview-text-link">Review terminals <ChevronRight className="size-4" /></Link>
          </div>
        </article>
      </section>

      <section className="supplier-lower-grid">
        <article className="supplier-insight-card">
          <CalendarCheck className="size-5" />
          <div><span>Booking queue</span><strong>{pending.length ? 'Review requests before their proposed start time.' : 'No pending requests right now.'}</strong><p>Accept or reject requests from the bookings workspace.</p></div>
          <Link to="/supplier/bookings"><ChevronRight className="size-5" /></Link>
        </article>
        <article className="supplier-insight-card">
          <PlugZap className="size-5" />
          <div><span>Terminal coverage</span><strong>{availableTerminals} of {terminals.length} terminals available.</strong><p>Keep terminal status and availability accurate for drivers.</p></div>
          <Link to="/supplier/terminals"><ChevronRight className="size-5" /></Link>
        </article>
        <article className="supplier-earning-card">
          <CircleDollarSign className="size-5" />
          <span>Net payable</span>
          <strong>PKR {netPayable.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
          <p>From {paidCount} confirmed paid booking{paidCount === 1 ? '' : 's'}.</p>
          <Link to="/supplier/earnings" className="overview-text-link">View earnings <ChevronRight className="size-4" /></Link>
        </article>
      </section>
    </div>
  );
}
