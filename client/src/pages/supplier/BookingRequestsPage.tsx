import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Check, Clock3, Loader2, X } from 'lucide-react';
import { acceptBooking, listBookings, rejectBooking, type Booking } from '@/services/bookings';

function labelOf(ref: any, fallback: string): string {
  if (ref && typeof ref === 'object') return ref.name || ref.manufacturer || fallback;
  return fallback;
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

export function bookingStatusBadgeClass(status: string): string {
  if (['REJECTED', 'CANCELLED', 'EXPIRED', 'COMPLETED'].includes(status)) return 'workspace-status workspace-status--muted';
  if (['ACCEPTED_AWAITING_PAYMENT', 'IN_PROGRESS'].includes(status)) return 'workspace-status workspace-status--warning';
  return 'workspace-status';
}

export default function BookingRequestsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setBookings(await listBookings());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load booking requests.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const pendingCount = useMemo(
    () => bookings.filter((b) => b.status === 'PENDING_SUPPLIER').length,
    [bookings]
  );

  async function act(id: string, action: 'accept' | 'reject') {
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

  return (
    <div className="workspace-page">
      <header className="workspace-head">
        <div>
          <h1>Booking requests</h1>
          <p>Review upcoming charging sessions and confirm slots at your terminals.</p>
        </div>
      </header>

      <div className="workspace-notice">
        <CalendarCheck className="size-4" /> {pendingCount} request{pendingCount === 1 ? '' : 's'} need a decision.
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="workspace-panel">
        <div className="workspace-panel-head">
          <div>
            <h2>Incoming requests</h2>
            <p>Bookings for your stations and terminals.</p>
          </div>
        </div>

        {loading ? (
          <p>Loading booking requests…</p>
        ) : bookings.length === 0 ? (
          <p>No booking requests yet.</p>
        ) : (
          <ul className="workspace-list">
            {bookings.map((booking) => {
              const station = labelOf(booking.stationId, 'Station');
              const terminal = labelOf(booking.terminalId, 'Terminal');
              const vehicle = booking.vehicleId && typeof booking.vehicleId === 'object'
                ? `${(booking.vehicleId as any).manufacturer ?? ''} ${(booking.vehicleId as any).model ?? ''}`.trim() || 'Vehicle'
                : 'Vehicle';
              const busy = busyId === booking._id;
              return (
                <li className="workspace-list-row" key={booking._id}>
                  <span className="workspace-row-icon"><CalendarCheck className="size-4" /></span>
                  <div className="workspace-row-main">
                    <strong>{vehicle} · {station}</strong>
                    <span><Clock3 className="mr-1 inline size-3" />{formatRange(booking.requestedStartTime, booking.requestedEndTime)} · {terminal} · {booking.priceSnapshot.currency} {booking.priceSnapshot.amount}</span>
                  </div>
                  {booking.status === 'PENDING_SUPPLIER' ? (
                    <div className="workspace-action-row">
                      <button className="decline" type="button" disabled={busy} onClick={() => void act(booking._id, 'reject')}>
                        {busy ? <Loader2 className="mr-1 inline size-3 animate-spin" /> : <X className="mr-1 inline size-3" />}Decline
                      </button>
                      <button className="accept" type="button" disabled={busy} onClick={() => void act(booking._id, 'accept')}>
                        {busy ? <Loader2 className="mr-1 inline size-3 animate-spin" /> : <Check className="mr-1 inline size-3" />}Accept
                      </button>
                    </div>
                  ) : (
                    <span className={bookingStatusBadgeClass(booking.status)}>{booking.status.replace(/_/g, ' ')}</span>
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
