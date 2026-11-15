import { useEffect, useMemo, useState } from 'react';
import { CircleDollarSign, WalletCards } from 'lucide-react';
import { getSupplierEarnings, type EarningsSummary, type Payment } from '@/services/payments';

function formatMoney(amount: number, currency = 'PKR'): string {
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function paymentLabel(payment: Payment): string {
  const booking = payment.bookingId as any;
  if (booking && typeof booking === 'object') {
    return booking.bookingReference || `Booking ${booking._id ?? ''}`.trim();
  }
  return 'Booking payment';
}

function paymentDate(payment: Payment): string {
  const date = payment.processedAt || payment.updatedAt || payment.createdAt;
  if (!date) return '—';
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getSupplierEarnings();
        if (!cancelled) setEarnings(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load earnings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const currency = earnings?.currency ?? 'PKR';
  const recent = useMemo(() => (earnings?.payments ?? []).slice(0, 10), [earnings]);

  return (
    <div className="workspace-page">
      <header className="workspace-head">
        <div>
          <h1>Earnings</h1>
          <p>A clear view of confirmed payments and settlement calculations.</p>
        </div>
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="workspace-metric-strip">
        <div className="workspace-metric">
          <span>Gross (paid)</span>
          <strong>{loading ? '…' : formatMoney(earnings?.gross ?? 0, currency)}</strong>
          <small>{earnings?.paidCount ?? 0} confirmed payment{(earnings?.paidCount ?? 0) === 1 ? '' : 's'}</small>
        </div>
        <div className="workspace-metric">
          <span>Net payable</span>
          <strong>{loading ? '…' : formatMoney(earnings?.netPayable ?? 0, currency)}</strong>
          <small>After {Math.round((earnings?.feeRate ?? 0.1) * 100)}% platform fee ({formatMoney(earnings?.platformFee ?? 0, currency)})</small>
        </div>
        <div className="workspace-metric">
          <span>Pending / Failed</span>
          <strong>{loading ? '…' : formatMoney(earnings?.pendingAmount ?? 0, currency)}</strong>
          <small>Failed: {formatMoney(earnings?.failedAmount ?? 0, currency)}</small>
        </div>
      </section>

      <section className="workspace-panel">
        <div className="workspace-panel-head">
          <div>
            <h2>Confirmed payments</h2>
            <p>Payments contributing to supplier earnings (real data).</p>
          </div>
          <WalletCards className="size-5 text-primary" />
        </div>
        {loading ? (
          <p>Loading earnings…</p>
        ) : recent.length === 0 ? (
          <p>No confirmed payments yet.</p>
        ) : (
          <ul className="workspace-list">
            {recent.map((payment) => (
              <li className="workspace-list-row" key={payment._id}>
                <span className="workspace-row-icon"><CircleDollarSign className="size-4" /></span>
                <div className="workspace-row-main">
                  <strong>{paymentLabel(payment)}</strong>
                  <span>{paymentDate(payment)} · Ref {payment.providerReference}</span>
                </div>
                <span className="workspace-row-value">
                  {formatMoney(payment.amount, payment.currency)}
                  <small><span className="workspace-status">{payment.status}</span></small>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
