import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Check, Clock3, Loader2, Play, Square, X, Zap } from 'lucide-react';
import { acceptBooking, listBookings, rejectBooking, type Booking } from '@/services/bookings';
import {
  completeChargingSession,
  listSupplierChargingSessions,
  startChargingSession,
  type ChargingSession,
} from '@/services/chargingSessions';

function labelOf(ref: any, fallback: string): string {
  if (ref && typeof ref === 'object') return ref.name || ref.manufacturer || fallback;
  return fallback;
}

function vehicleLabel(b: Booking): string {
  if (b.vehicleId && typeof b.vehicleId === 'object') {
    const v = b.vehicleId as any;
    return `${v.manufacturer ?? ''} ${v.model ?? ''}`.trim() || 'Vehicle';
  }
  return 'Vehicle';
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

function statusBadgeClass(status: string): string {
  if (['REJECTED', 'CANCELLED', 'EXPIRED'].includes(status)) return 'workspace-status workspace-status--muted';
  if (['ACCEPTED_AWAITING_PAYMENT', 'IN_PROGRESS', 'PENDING_SUPPLIER'].includes(status)) return 'workspace-status workspace-status--warning';
  if (['COMPLETED', 'CONFIRMED'].includes(status)) return 'workspace-status';
  return 'workspace-status workspace-status--muted';
}

function money(amount?: number, currency = 'PKR'): string {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return '—';
  return `${currency} ${amount.toFixed(2)}`;
}

export function bookingStatusBadgeClass(status: string): string {
  return statusBadgeClass(status);
}

export default function BookingRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sessions, setSessions] = useState<ChargingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [initialSocByBooking, setInitialSocByBooking] = useState<Record<string, string>>({});
  const [finalSocBySession, setFinalSocBySession] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [b, s] = await Promise.all([listBookings(), listSupplierChargingSessions()]);
      setBookings(b);
      setSessions(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings/sessions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const pendingCount = useMemo(() => bookings.filter((b) => b.status === 'PENDING_SUPPLIER').length, [bookings]);
  const activeSessionByBooking = useMemo(() => {
    const map = new Map<string, ChargingSession>();
    for (const s of sessions) {
      const bid = typeof s.bookingId === 'object' ? (s.bookingId as any)._id : s.bookingId;
      if (s.status === 'ACTIVE' && bid) map.set(String(bid), s);
    }
    return map;
  }, [sessions]);
  const latestCompletedSessionByBooking = useMemo(() => {
    const map = new Map<string, ChargingSession>();
    for (const s of sessions) {
      const bid = typeof s.bookingId === 'object' ? (s.bookingId as any)._id : s.bookingId;
      if (s.status === 'COMPLETED' && bid && !map.has(String(bid))) map.set(String(bid), s);
    }
    return map;
  }, [sessions]);
  const activeSessions = useMemo(() => sessions.filter((s) => s.status === 'ACTIVE'), [sessions]);

  async function actBooking(id: string, action: 'accept' | 'reject') {
    setBusyId(id);
    setError('');
    try {
      const updated = action === 'accept' ? await acceptBooking(id) : await rejectBooking(id);
      setBookings((current) => current.map((b) => (b._id === id ? updated : b)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking.');
    } finally {
      setBusyId(null);
    }
  }

  async function onStartSession(booking: Booking) {
    const raw = initialSocByBooking[booking._id];
    const initial = Number(raw);
    if (!Number.isFinite(initial) || initial < 0 || initial > 100) {
      setError('Enter a valid initial battery percentage between 0 and 100.');
      return;
    }
    setBusyId(booking._id);
    setError('');
    try {
      await startChargingSession(booking._id, initial);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start charging session.');
    } finally {
      setBusyId(null);
    }
  }

  async function onCompleteSession(session: ChargingSession) {
    const raw = finalSocBySession[session._id];
    const finalSoc = Number(raw);
    if (!Number.isFinite(finalSoc) || finalSoc < 0 || finalSoc > 100) {
      setError('Enter a valid final battery percentage between 0 and 100.');
      return;
    }
    if (finalSoc < Number(session.initialSocPercent)) {
      setError('Final battery percentage must be greater than or equal to initial battery percentage.');
      return;
    }
    setBusyId(session._id);
    setError('');
    try {
      await completeChargingSession(session._id, finalSoc);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete charging session.');
    } finally {
      setBusyId(null);
    }
  }

  const upcomingOrActiveBookings = bookings.filter((b) => !['REJECTED', 'CANCELLED', 'EXPIRED'].includes(b.status));

  return (
    <div className="workspace-page">
      <header className="workspace-head">
        <div>
          <h1>Bookings & charging sessions</h1>
          <p>Review booking requests, start charging sessions with initial SOC, and complete sessions to generate bills.</p>
        </div>
      </header>

      <div className="workspace-notice">
        <CalendarCheck className="size-4" /> {pendingCount} request{pendingCount === 1 ? '' : 's'} need a decision · {activeSessions.length} active session{activeSessions.length === 1 ? '' : 's'}.
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="workspace-panel">
        <div className="workspace-panel-head">
          <div>
            <h2>Active charging sessions</h2>
            <p>Enter final battery percentage to complete a session and calculate the bill.</p>
          </div>
        </div>
        {loading ? <p>Loading…</p> : activeSessions.length === 0 ? <p>No active charging sessions.</p> : (
          <ul className="workspace-list">
            {activeSessions.map((s) => {
              const booking = typeof s.bookingId === 'object' ? (s.bookingId as any) : null;
              const vehicle = typeof s.vehicleId === 'object' ? (s.vehicleId as any) : null;
              const station = typeof s.stationId === 'object' ? (s.stationId as any) : null;
              const vName = vehicle ? `${vehicle.manufacturer ?? ''} ${vehicle.model ?? ''}`.trim() : 'Vehicle';
              const busy = busyId === s._id;
              return (
                <li className="workspace-list-row" key={s._id} style={{ alignItems: 'flex-start' }}>
                  <span className="workspace-row-icon"><Zap className="size-4" /></span>
                  <div className="workspace-row-main" style={{ gap: '.35rem' }}>
                    <strong>{vName} · {station?.name ?? 'Station'} {booking?.bookingReference ? `· ${booking.bookingReference}` : ''}</strong>
                    <span>Initial SOC: {s.initialSocPercent}% · Battery: {s.batteryCapacityKwhSnapshot} kWh · Rate: {money(s.stationRatePkrPerKwhSnapshot, s.currency)}/kWh · Started: {new Date(s.sessionStartTime).toLocaleString()}</span>
                    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '.25rem' }}>
                      <label style={{ fontSize: '.85rem' }}>
                        Final SOC (%)
                        <input
                          type="number"
                          min={s.initialSocPercent}
                          max={100}
                          step="0.1"
                          value={finalSocBySession[s._id] ?? ''}
                          onChange={(e) => setFinalSocBySession((c) => ({ ...c, [s._id]: e.target.value }))}
                          style={{ marginLeft: '.4rem', width: '110px' }}
                        />
                      </label>
                      <button className="accept" type="button" disabled={busy} onClick={() => void onCompleteSession(s)}>
                        {busy ? <Loader2 className="mr-1 inline size-3 animate-spin" /> : <Square className="mr-1 inline size-3" />}Complete session
                      </button>
                    </div>
                  </div>
                  <span className="workspace-status workspace-status--warning">ACTIVE</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="workspace-panel">
        <div className="workspace-panel-head">
          <div>
            <h2>Upcoming bookings & session actions</h2>
            <p>Select a booking, enter initial battery percentage, and start a charging session.</p>
          </div>
        </div>

        {loading ? <p>Loading booking requests…</p> : upcomingOrActiveBookings.length === 0 ? <p>No bookings yet.</p> : (
          <ul className="workspace-list">
            {upcomingOrActiveBookings.map((booking) => {
              const station = labelOf(booking.stationId, 'Station');
              const terminal = labelOf(booking.terminalId, 'Terminal');
              const vehicle = vehicleLabel(booking);
              const busy = busyId === booking._id;
              const activeSession = activeSessionByBooking.get(booking._id);
              const completedSession = latestCompletedSessionByBooking.get(booking._id);
              const canStart = !activeSession && ['CONFIRMED', 'IN_PROGRESS', 'ACCEPTED_AWAITING_PAYMENT', 'PENDING_SUPPLIER'].includes(booking.status);
              return (
                <li className="workspace-list-row" key={booking._id} style={{ alignItems: 'flex-start' }}>
                  <span className="workspace-row-icon"><CalendarCheck className="size-4" /></span>
                  <div className="workspace-row-main" style={{ gap: '.35rem' }}>
                    <strong>{vehicle} · {station}</strong>
                    <span><Clock3 className="mr-1 inline size-3" />{formatRange(booking.requestedStartTime, booking.requestedEndTime)} · {terminal} · Ref: {booking.bookingReference}</span>
                    <span>Vehicle/terminal details available to worker · Booking status: {booking.status.replace(/_/g, ' ')}</span>

                    {booking.status === 'PENDING_SUPPLIER' && (
                      <div className="workspace-action-row" style={{ marginTop: '.25rem' }}>
                        <button className="decline" type="button" disabled={busy} onClick={() => void actBooking(booking._id, 'reject')}>
                          {busy ? <Loader2 className="mr-1 inline size-3 animate-spin" /> : <X className="mr-1 inline size-3" />}Decline
                        </button>
                        <button className="accept" type="button" disabled={busy} onClick={() => void actBooking(booking._id, 'accept')}>
                          {busy ? <Loader2 className="mr-1 inline size-3 animate-spin" /> : <Check className="mr-1 inline size-3" />}Accept
                        </button>
                      </div>
                    )}

                    {canStart && (
                      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '.25rem' }}>
                        <label style={{ fontSize: '.85rem' }}>
                          Initial SOC (%)
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step="0.1"
                            value={initialSocByBooking[booking._id] ?? ''}
                            onChange={(e) => setInitialSocByBooking((c) => ({ ...c, [booking._id]: e.target.value }))}
                            style={{ marginLeft: '.4rem', width: '110px' }}
                          />
                        </label>
                        <button className="accept" type="button" disabled={busy} onClick={() => void onStartSession(booking)}>
                          {busy ? <Loader2 className="mr-1 inline size-3 animate-spin" /> : <Play className="mr-1 inline size-3" />}Start charging session
                        </button>
                      </div>
                    )}

                    {activeSession && <span className="workspace-status workspace-status--warning">Session active · Initial {activeSession.initialSocPercent}%</span>}

                    {completedSession && (
                      <div style={{ marginTop: '.25rem', fontSize: '.85rem', padding: '.5rem .6rem', border: '1px solid #E2E8F0', borderRadius: '10px', background: '#F8FAFC' }}>
                        <strong>Calculated bill</strong>
                        <div>Initial: {completedSession.initialSocPercent}% → Final: {completedSession.finalSocPercent}% · Energy: {completedSession.energyConsumedKwh} kWh</div>
                        <div>Rate: {money(completedSession.stationRatePkrPerKwhSnapshot, completedSession.currency)}/kWh · Total: {money(completedSession.totalPricePkr, completedSession.currency)}</div>
                        <div>Payment: {(completedSession.paymentStatus || 'PENDING').toString()}</div>
                      </div>
                    )}
                  </div>
                  <span className={statusBadgeClass(booking.status)}>{booking.status.replace(/_/g, ' ')}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
