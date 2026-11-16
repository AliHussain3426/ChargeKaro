import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarCheck, ChevronRight, MapPin, PlugZap, Store, Users } from 'lucide-react';
import { getAdminOverview, type AdminOverviewCounts } from '@/services/admin';

export default function AdminOverview() {
  const [counts, setCounts] = useState<AdminOverviewCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const overview = await getAdminOverview();
        if (!cancelled) setCounts(overview.counts);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load overview.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="admin-page admin-overview">
      <header className="overview-intro">
        <div>
          <p className="overview-location"><Store className="size-4" /> ChargeKaro platform</p>
          <h1>Keep the network clear and accountable.</h1>
          <p>{counts ? `${counts.pendingBookings} booking request${counts.pendingBookings === 1 ? '' : 's'} awaiting supplier decisions across ${counts.stations} station${counts.stations === 1 ? '' : 's'}.` : 'Loading platform status…'}</p>
        </div>
        <Link to="/admin/reports" className="overview-primary">Open reports <ArrowUpRight className="size-4" /></Link>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="admin-command-board">
        <div>
          <span className="overview-tag">Network attention</span>
          <h2>{counts ? `${counts.terminals} terminal${counts.terminals === 1 ? '' : 's'} and ${counts.bookings} booking${counts.bookings === 1 ? '' : 's'} under oversight.` : 'Loading…'}</h2>
          <p>Review stations, terminals, and booking activity using live platform data.</p>
          <Link to="/admin/terminals" className="admin-command-action">Review terminals <ChevronRight className="size-4" /></Link>
        </div>
        <div className="admin-command-map">
          <span className="admin-map-pin"><MapPin className="size-5" /></span>
          <span className="admin-map-pin admin-map-pin--minor"><PlugZap className="size-4" /></span>
        </div>
      </section>

      <section className="admin-kpi-grid">
        <Link to="/admin/users"><Users className="size-5" /><span>Active accounts</span><strong>{loading ? '…' : (counts?.users ?? 0)}</strong><small>Drivers, suppliers, and platform roles</small></Link>
        <Link to="/admin/stations"><Store className="size-5" /><span>Stations</span><strong>{loading ? '…' : (counts?.stations ?? 0)}</strong><small>Published charging locations</small></Link>
        <Link to="/admin/bookings"><CalendarCheck className="size-5" /><span>Requests awaiting review</span><strong>{loading ? '…' : (counts?.pendingBookings ?? 0)}</strong><small>Pending supplier decision</small></Link>
      </section>

      <section className="admin-work-grid">
        <article className="workspace-panel">
          <div className="workspace-panel-head"><div><h2>Platform summary</h2><p>Live aggregate counts</p></div></div>
          <div className="admin-priority-list">
            <Link to="/admin/users"><Users className="size-4" /><div><strong>{counts?.customers ?? 0} customers · {counts?.suppliers ?? 0} suppliers</strong><span>User accounts by role</span></div><ChevronRight className="size-4" /></Link>
            <Link to="/admin/terminals"><PlugZap className="size-4" /><div><strong>{counts?.terminals ?? 0} terminals</strong><span>Across all stations</span></div><ChevronRight className="size-4" /></Link>
            <Link to="/admin/bookings"><CalendarCheck className="size-4" /><div><strong>{counts?.confirmedBookings ?? 0} active/confirmed · {counts?.completedBookings ?? 0} completed</strong><span>Booking pipeline</span></div><ChevronRight className="size-4" /></Link>
          </div>
        </article>
        <article className="workspace-panel">
          <div className="workspace-panel-head"><div><h2>Payments</h2><p>Confirmed payment records</p></div></div>
          <div className="admin-priority-list">
            <div><div><strong>{counts?.paidPayments ?? 0} paid payment{(counts?.paidPayments ?? 0) === 1 ? '' : 's'}</strong><span>Contributing to supplier earnings</span></div></div>
            <Link to="/admin/reports" className="workspace-text-button">View reports <ChevronRight className="size-4" /></Link>
          </div>
        </article>
      </section>
    </div>
  );
}
