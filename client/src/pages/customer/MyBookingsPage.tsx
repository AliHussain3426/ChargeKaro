import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronRight, Clock3, CreditCard, Loader2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listBookings, type Booking } from '@/services/bookings';
import { confirmPaymentFailure, confirmPaymentSuccess, initiatePayment } from '@/services/payments';

function stationLabel(booking: Booking): string {
  const station = booking.stationId as any;
  if (station && typeof station === 'object') {
    return station.name || 'Charging station';
  }
  return 'Charging station';
}

function stationSubLabel(booking: Booking): string {
  const station = booking.stationId as any;
  if (station && typeof station === 'object') {
    return [station.address, station.city].filter(Boolean).join(', ');
  }
  return '';
}

function terminalLabel(booking: Booking): string {
  const terminal = booking.terminalId as any;
  if (terminal && typeof terminal === 'object') {
    const connectors = Array.isArray(terminal.connectorTypes) ? terminal.connectorTypes.join(', ') : '';
    const power = terminal.maximumPowerKw ? `${terminal.maximumPowerKw} kW` : '';
    return [terminal.name, connectors, power].filter(Boolean).join(' · ');
  }
  return 'Terminal';
}

function formatRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Scheduled time unavailable';
  const date = start.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' });
  const startTime = start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const endTime = end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${date} · ${startTime}–${endTime}`;
}

function isUpcoming(status: string): boolean {
  return ['PENDING_SUPPLIER', 'ACCEPTED_AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'].includes(status);
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState('All');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payBusy, setPayBusy] = useState(false);

  async function load() {
    try {
      const data = await listBookings();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const tabs = ['All', 'Upcoming', 'Completed'];

  const visible = useMemo(() => {
    if (active === 'Upcoming') return bookings.filter((b) => isUpcoming(b.status));
    if (active === 'Completed') return bookings.filter((b) => b.status === 'COMPLETED');
    return bookings;
  }, [active, bookings]);

  async function handleStartPayment(bookingId: string) {
    setError('');
    setPayBusy(true);
    try {
      const { payment, booking } = await initiatePayment(bookingId);
      setBookings((current) => current.map((b) => (b._id === bookingId ? { ...b, ...booking, paymentStatus: payment.status } : b)));
      setPayingId(bookingId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to initiate payment');
    } finally {
      setPayBusy(false);
    }
  }

  async function handlePaymentResult(bookingId: string, success: boolean) {
    setError('');
    setPayBusy(true);
    try {
      const result = success
        ? await confirmPaymentSuccess(bookingId)
        : await confirmPaymentFailure(bookingId, 'Payment cancelled or failed (stub)');
      setBookings((current) =>
        current.map((b) =>
          b._id === bookingId ? { ...b, ...result.booking, paymentStatus: result.payment.status } : b
        )
      );
      setPayingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to process payment');
    } finally {
      setPayBusy(false);
    }
  }

  return (
    <div className="workspace-page">
      <header className="workspace-head">
        <div>
          <h1>My bookings</h1>
          <p>Track your requested, upcoming, and completed charging sessions.</p>
        </div>
        <Link className="workspace-action" to="/customer/stations">Find a station <ChevronRight className="size-4" /></Link>
      </header>

      <nav className="workspace-tabs" aria-label="Booking filters">
        {tabs.map((tab) => (
          <button key={tab} type="button" className={active === tab ? 'is-active' : ''} onClick={() => setActive(tab)}>{tab}</button>
        ))}
      </nav>

      <section className="workspace-panel">
        <div className="workspace-panel-head">
          <div>
            <h2>{visible.length} {active.toLowerCase()} booking{visible.length === 1 ? '' : 's'}</h2>
            <p>Your bookings are loaded from your account.</p>
          </div>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}
        {loading ? (
          <p>Loading bookings…</p>
        ) : visible.length === 0 ? (
          <p>No bookings to show yet.</p>
        ) : (
          <ul className="workspace-list">
            {visible.map((booking) => {
              const place = stationLabel(booking);
              const sub = stationSubLabel(booking);
              const muted = ['COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED'].includes(booking.status);
              const awaitingPayment = booking.status === 'ACCEPTED_AWAITING_PAYMENT';
              const inPaymentFlow = payingId === booking._id;
              return (
                <li className="workspace-list-row" key={booking._id}>
                  <span className="workspace-row-icon"><CalendarDays className="size-4" /></span>
                  <div className="workspace-row-main">
                    <strong>{place}</strong>
                    <span><Clock3 className="mr-1 inline size-3" />{formatRange(booking.requestedStartTime, booking.requestedEndTime)} · {terminalLabel(booking)}{sub ? ` · ${sub}` : ''}</span>
                    <span style={{ fontSize: '.78rem', color: 'var(--gc-ink-soft)' }}>
                      Ref: {booking.bookingReference} · {booking.priceSnapshot.currency} {booking.priceSnapshot.amount} · Payment: {(booking.paymentStatus || 'UNPAID').replace(/_/g, ' ')}
                    </span>
                    {inPaymentFlow && (
                      <div style={{ marginTop: '.5rem', padding: '.6rem .75rem', border: '1px solid #d7e4df', borderRadius: '10px', background: '#f7fbfa' }}>
                        <p style={{ margin: 0, fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                          <CreditCard className="size-4" /> Payment step (integration deferred): complete or simulate failure.
                        </p>
                        <div style={{ display: 'flex', gap: '.5rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
                          <button className="workspace-action" type="button" disabled={payBusy} onClick={() => void handlePaymentResult(booking._id, true)}>
                            {payBusy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />} Complete payment
                          </button>
                          <button className="workspace-text-button" type="button" disabled={payBusy} onClick={() => void handlePaymentResult(booking._id, false)}>
                            <XCircle className="size-4" /> Simulate failure
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className={`workspace-status ${muted ? 'workspace-status--muted' : ''}`}>{booking.status.replace(/_/g, ' ')}</span>
                  {awaitingPayment && !inPaymentFlow && (
                    <button
                      className="workspace-text-button"
                      type="button"
                      disabled={payBusy}
                      onClick={() => void handleStartPayment(booking._id)}
                    >
                      {payBusy ? <Loader2 className="size-4 animate-spin" /> : 'Pay now'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
