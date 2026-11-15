import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import AdminListWorkspace from '@/components/dashboard/AdminListWorkspace';
import { listAdminBookings, type AdminBooking } from '@/services/admin';

function formatRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '—';
  return `${start.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}–${end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
}

function toRow(b: AdminBooking) {
  const customer = b.customerId as any;
  const station = b.stationId as any;
  const status = b.status || 'UNKNOWN';
  const group = ['PENDING_SUPPLIER', 'ACCEPTED_AWAITING_PAYMENT'].includes(status)
    ? 'Pending'
    : ['CONFIRMED', 'IN_PROGRESS'].includes(status)
      ? 'Confirmed'
      : status === 'COMPLETED'
        ? 'Completed'
        : 'Other';
  return {
    name: `${b.bookingReference} · ${customer?.name || 'Customer'}`,
    meta: `${station?.name || 'Station'} · ${formatRange(b.requestedStartTime, b.requestedEndTime)}`,
    status: status.replace(/_/g, ' '),
    value: b.priceSnapshot ? `${b.priceSnapshot.currency} ${b.priceSnapshot.amount}` : '—',
    group,
  };
}

export default function ManageBookingsPage() {
  const [items, setItems] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listAdminBookings();
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load bookings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => items.map(toRow), [items]);
  return <AdminListWorkspace title="Bookings" description="Oversee charging session requests and their platform status." itemLabel="Booking" tabs={['All bookings', 'Pending', 'Confirmed', 'Completed', 'Other']} rows={rows} icon={CalendarCheck} loading={loading} error={error} live />;
}
