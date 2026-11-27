import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronRight, Clock3, CreditCard, FileText, Loader2, XCircle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { listBookings, type Booking } from '@/services/bookings';
import { confirmPaymentFailure, confirmPaymentSuccess, initiatePayment } from '@/services/payments';
import { getChargingReceipt, listMyChargingSessions, type ChargingReceipt, type ChargingSession } from '@/services/chargingSessions';

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

function money(amount?: number, currency = 'PKR'): string {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return '—';
  return `${currency} ${amount.toFixed(2)}`;
}

function sessionForBooking(sessions: ChargingSession[], bookingId: string): ChargingSession | undefined {
  return sessions.find((s) => (typeof s.bookingId === 'object' ? (s.bookingId as any)._id : s.bookingId) === bookingId);
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [receipts, setReceipts] = useState<Record<string, ChargingReceipt>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState('All');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payBusy, setPayBusy] = useState(false);

  async function load() {
    try {
      const [b, s] = await Promise.all([listBookings(), listMyChargingSessions()]);
      setBookings(b);
      setSessions(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const tabs = ['All', 'Upcoming', 'Completed', 'Receipts'];

  const visible = useMemo(() => {
    if (active === 'Upcoming') return bookings.filter((b) => isUpcoming(b.status));
    if (active === 'Completed') return bookings.filter((b) => b.status === 'COMPLETED' || !!sessionForBooking(sessions, b._id));
    return bookings;
  }, [active, bookings, sessions]);

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
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to process payment');
    } finally {
      setPayBusy(false);
    }
  }

  async function loadReceipt(sessionId: string) {
    try {
      const r = await getChargingReceipt(sessionId);
      setReceipts((c) => ({ ...c, [sessionId]: r }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load receipt');
    }
  }

  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');

  return (
    <div className="workspace-page">
      <header className="workspace-head">
        <div>
          <h1>My bookings & charging</h1>
          <p>Track charging sessions, battery SOC, energy consumed, costs, payments, and receipts.</p>
        </div>
        <Link className="workspace-action" to="/customer/stations">Find a station <ChevronRight className="size-4" /></Link>
      </header>

      <nav className="workspace-tabs" aria-label="Booking filters">
        {tabs.map((tab) => (
          <button key={tab} type="button" className={active === tab ? 'is-active' : ''} onClick={() => setActive(tab)}>{tab}</button>
        ))}
      </nav>

      {error && <p className="form-error" role="alert">{error}</p>}

      {active === 'Receipts' ? (
        <section className="workspace-panel">
          <div className="workspace-panel-head">
            <div>
              <h2>Charging receipts</h2>
              <p>Access receipts for completed charging sessions.</p>
            </div>
          </div>
          {loading ? <p>Loading…</p> : completedSessions.length === 0 ? <p>No receipts yet.</p> : (
            <ul className="workspace-list">
              {completedSessions.map((s) => {
                const r = receipts[s._id];
                const vehicle = typeof s.vehicleId === 'object' ? (s.vehicleId as any) : null;
                const station = typeof s.stationId === 'object' ? (s.stationId as any) : null;
                return (
                  <li className="workspace-list-row" key={s._id} style={{ alignItems: 'flex-start' }}>
                    <span className="workspace-row-icon"><FileText className="size-4" /></span>
                    <div className="workspace-row-main" style={{ gap: '.3rem' }}>
                      <strong>{station?.name ?? 'Station'} · {vehicle ? `${vehicle.manufacturer ?? ''} ${vehicle.model ?? ''}`.trim() : 'Vehicle'}</strong>
                      <span>Session/Transaction: {s._id} · {s.sessionCompletionTime ? new Date(s.sessionCompletionTime).toLocaleString() : ''}</span>
                      <span>Initial {s.initialSocPercent}% → Final {s.finalSocPercent}% · Energy {s.energyConsumedKwh} kWh · Rate {money(s.stationRatePkrPerKwhSnapshot, s.currency)}/kWh · Total {money(s.totalPricePkr, s.currency)}</span>
                      <span>Payment status: {(s.paymentStatus || 'PENDING').toString()}</span>
                      {!r ? (
                        <button className="workspace-text-button" type="button" onClick={() => void loadReceipt(s._id)}>View full receipt</button>
                      ) : (
                        <div style={{ marginTop: '.35rem', padding: '.6rem .75rem', border: '1px solid #E2E8F0', borderRadius: '10px', background: '#F8FAFC', fontSize: '.85rem', overflowWrap: 'anywhere' }}>
                          <div><strong>Transaction/Session ID:</strong> {r.transactionId}</div>
                          <div><strong>Customer:</strong> {r.customerName ?? '—'} · <strong>Booking:</strong> {r.bookingReference ?? '—'}</div>
                          <div><strong>Vehicle:</strong> {r.vehicle?.name ?? '—'} · <strong>Battery:</strong> {r.vehicle?.batteryCapacityKwh ?? '—'} kWh</div>
                          <div><strong>Station:</strong> {r.stationName ?? '—'}</div>
                          <div><strong>Initial SOC:</strong> {r.initialSocPercent}% · <strong>Final SOC:</strong> {r.finalSocPercent}%</div>
                          <div><strong>Energy consumed:</strong> {r.energyConsumedKwh} kWh · <strong>Rate:</strong> {money(r.chargingRatePkrPerKwh, r.currency)}/kWh</div>
                          <div><strong>Total amount:</strong> {money(r.totalAmountPkr, r.currency)}</div>
                          <div><strong>Start:</strong> {r.sessionStartTime ? new Date(r.sessionStartTime).toLocaleString() : '—'} · <strong>Completion:</strong> {r.sessionCompletionTime ? new Date(r.sessionCompletionTime).toLocaleString() : '—'}</div>
                          <div><strong>Payment status:</strong> {r.paymentStatus}</div>
                        </div>
                      )}
                    </div>
                    <span className={`workspace-status ${r?.paymentStatus === 'PAID' ? '' : 'workspace-status--muted'}`}>{(s.paymentStatus || 'PENDING').toString()}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ) : (
        <section className="workspace-panel">
          <div className="workspace-panel-head">
            <div>
              <h2>{visible.length} {active.toLowerCase()} booking{visible.length === 1 ? '' : 's'}</h2>
              <p>Bookings, charging session status, SOC, energy, cost, and payment.</p>
            </div>
          </div>

          {loading ? (
            <p>Loading bookings…</p>
          ) : visible.length === 0 ? (
            <p>No bookings to show yet.</p>
          ) : (
            <ul className="workspace-list">
              {visible.map((booking) => {
                const place = stationLabel(booking);
                const sub = stationSubLabel(booking);
                const s = sessionForBooking(sessions, booking._id);
                const muted = ['CANCELLED', 'REJECTED', 'EXPIRED'].includes(booking.status) && !s;
                const awaitingPayment = booking.status === 'ACCEPTED_AWAITING_PAYMENT';
                const sessionBillUnpaid = s?.status === 'COMPLETED' && (s.paymentStatus === 'PENDING' || s.paymentStatus === 'UNPAID') && s.totalPricePkr != null;
                const canPay = sessionBillUnpaid || (awaitingPayment && !sessionBillUnpaid);
                const inPaymentFlow = payingId === booking._id;
                return (
                  <li className="workspace-list-row" key={booking._id} style={{ alignItems: 'flex-start' }}>
                    <span className="workspace-row-icon">{s ? <Zap className="size-4" /> : <CalendarDays className="size-4" />}</span>
                    <div className="workspace-row-main">
                      <strong>{place}</strong>
                      <span style={{ overflowWrap: 'anywhere' }}><Clock3 className="mr-1 inline size-3" />{formatRange(booking.requestedStartTime, booking.requestedEndTime)} · {terminalLabel(booking)}{sub ? ` · ${sub}` : ''}</span>
                      <span style={{ fontSize: '.78rem', color: 'var(--gc-ink-soft)', overflowWrap: 'anywhere' }}>
                        Ref: {booking.bookingReference} · Booking payment: {(booking.paymentStatus || 'UNPAID').replace(/_/g, ' ')}
                      </span>
                      {s && (
                        <div style={{ marginTop: '.35rem', fontSize: '.85rem', padding: '.5rem .6rem', border: '1px solid #E2E8F0', borderRadius: '10px', background: '#F8FAFC', overflowWrap: 'anywhere' }}>
                          <strong>Charging session ({s.status})</strong>
                          <div>Initial SOC: {s.initialSocPercent}% {s.finalSocPercent != null ? `→ Final SOC: ${s.finalSocPercent}%` : ''}</div>
                          {s.energyConsumedKwh != null && <div>Energy consumed: {s.energyConsumedKwh} kWh · Rate: {money(s.stationRatePkrPerKwhSnapshot, s.currency)}/kWh</div>}
                          {s.totalPricePkr != null && <div>Total charging cost: {money(s.totalPricePkr, s.currency)}</div>}
                          <div>Session payment status: {(s.paymentStatus || 'PENDING').toString()}</div>
                          {s.sessionStartTime && <div>Started: {new Date(s.sessionStartTime).toLocaleString()} {s.sessionCompletionTime ? `· Completed: ${new Date(s.sessionCompletionTime).toLocaleString()}` : ''}</div>}
                        </div>
                      )}
                      {inPaymentFlow && (
                        <div style={{ marginTop: '.5rem', padding: '.6rem .75rem', border: '1px solid #E2E8F0', borderRadius: '10px', background: '#F8FAFC' }}>
                          <p style={{ margin: 0, fontSize: '.85rem', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                            <CreditCard className="size-4" /> Complete payment through existing payment flow (stub/integration-safe).
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
                    {canPay && !inPaymentFlow && (
                      <button className="workspace-text-button" type="button" disabled={payBusy} onClick={() => void handleStartPayment(booking._id)}>
                        {payBusy ? <Loader2 className="size-4 animate-spin" /> : (sessionBillUnpaid ? `Pay ${money(s?.totalPricePkr, s?.currency)}` : 'Pay now')}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
