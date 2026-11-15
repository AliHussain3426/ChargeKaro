import { useEffect, useState } from 'react';
import { Bell, CalendarCheck, CheckCircle2, CircleDollarSign, XCircle } from 'lucide-react';
import { listNotifications, markAllNotificationsRead, markNotificationRead, type NotificationItem } from '@/services/notifications';

function iconFor(type: string) {
  if (type.includes('PAYMENT')) return type === 'PAYMENT_SUCCESS' ? CheckCircle2 : CircleDollarSign;
  if (type === 'BOOKING_REJECTED' || type === 'BOOKING_CANCELLED') return XCircle;
  return CalendarCheck;
}

function timeLabel(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function CustomerNotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try {
      setItems(await listNotifications());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleMarkRead(id: string) {
    try {
      const updated = await markNotificationRead(id);
      setItems((current) => current.map((n) => (n._id === id ? updated : n)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read.');
    }
  }

  async function handleMarkAll() {
    try {
      await markAllNotificationsRead();
      setItems((current) => current.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notifications as read.');
    }
  }

  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="workspace-page">
      <header className="workspace-head">
        <div>
          <h1>Notifications</h1>
          <p>Updates about your charging plans, bookings, and payments.</p>
        </div>
        {unread > 0 && (
          <button className="workspace-text-button" type="button" onClick={() => void handleMarkAll()}>
            Mark all read
          </button>
        )}
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="workspace-panel">
        <div className="workspace-panel-head">
          <div>
            <h2>Recent updates</h2>
            <p>{items.length} item{items.length === 1 ? '' : 's'}{unread ? ` · ${unread} unread` : ''}</p>
          </div>
          <Bell className="size-5 text-primary" />
        </div>
        {loading ? (
          <p>Loading notifications…</p>
        ) : items.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <ul className="workspace-list">
            {items.map((n) => {
              const Icon = iconFor(n.type);
              return (
                <li className="workspace-list-row" key={n._id}>
                  <span className="workspace-row-icon"><Icon className="size-4" /></span>
                  <div className="workspace-row-main">
                    <strong>{n.title}</strong>
                    <span>{n.message}</span>
                  </div>
                  <span className="workspace-row-value" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.25rem' }}>
                    <span>{timeLabel(n.createdAt)}</span>
                    {!n.readAt ? (
                      <button className="workspace-text-button" type="button" onClick={() => void handleMarkRead(n._id)}>Mark read</button>
                    ) : (
                      <span className="workspace-status workspace-status--muted">Read</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
