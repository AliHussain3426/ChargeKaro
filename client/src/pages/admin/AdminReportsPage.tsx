import { useEffect, useState } from 'react';
import { BarChart3, ChevronRight, CircleDollarSign, PlugZap, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAdminReports, type AdminReports } from '@/services/admin';

function formatMoney(amount: number) {
  return `PKR ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAdminReports();
        if (!cancelled) setReports(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load reports.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const counts = reports?.counts;

  return (
    <div className="admin-page">
      <header className="workspace-head">
        <div>
          <p className="admin-context">GreenCharge platform</p>
          <h1>Reports &amp; analytics</h1>
          <p>Live reporting for network activity, bookings, and payment value.</p>
        </div>
        <span className="admin-freshness">Live data</span>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="admin-report-hero">
        <div>
          <span>Network activity</span>
          <strong>{loading ? 'Loading…' : `${counts?.completedBookings ?? 0} completed charging session${(counts?.completedBookings ?? 0) === 1 ? '' : 's'}`}</strong>
          <p>{counts ? `${counts.bookings} total bookings · ${counts.pendingBookings} pending supplier review · ${counts.paidPayments} paid payments.` : 'Loading platform metrics…'}</p>
        </div>
        <div className="admin-report-bars" aria-label="Activity summary">
          <i /><i /><i /><i /><i className="is-active" /><i /><i />
        </div>
      </section>

      <section className="admin-report-grid">
        <article className="workspace-panel workspace-card">
          <CircleDollarSign className="size-5 text-primary" />
          <h3>{loading ? '…' : formatMoney(reports?.revenue.gross ?? 0)}</h3>
          <p>Gross paid value (fee {formatMoney(reports?.revenue.platformFee ?? 0)}, net {formatMoney(reports?.revenue.netPayable ?? 0)}).</p>
          <Link to="/admin/bookings" className="workspace-text-button">View bookings <ChevronRight className="size-4" /></Link>
        </article>
        <article className="workspace-panel workspace-card">
          <PlugZap className="size-5 text-primary" />
          <h3>{loading ? '…' : `${counts?.terminals ?? 0} terminals`}</h3>
          <p>Across {counts?.stations ?? 0} stations on the network.</p>
          <Link to="/admin/terminals" className="workspace-text-button">Review terminals <ChevronRight className="size-4" /></Link>
        </article>
        <article className="workspace-panel workspace-card">
          <Route className="size-5 text-primary" />
          <h3>{loading ? '…' : `${counts?.users ?? 0} users`}</h3>
          <p>{counts?.customers ?? 0} customers and {counts?.suppliers ?? 0} suppliers.</p>
          <Link to="/admin/users" className="workspace-text-button">Review users <ChevronRight className="size-4" /></Link>
        </article>
      </section>

      <div className="workspace-notice"><BarChart3 className="size-4" /> Reporting uses live booking, station, terminal, and payment records from the admin API.</div>
    </div>
  );
}
