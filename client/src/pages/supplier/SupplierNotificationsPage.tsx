import { useEffect, useState } from 'react';
import { Bell, CalendarCheck, CheckCircle2, CircleDollarSign, XCircle } from 'lucide-react';
import { listNotifications, markAllNotificationsRead, markNotificationRead, type NotificationItem } from '@/services/notifications';

function iconFor(type: string) {
  if (type.includes('PAYMENT')) return type === 'PAYMENT_SUCCESS' ? CircleDollarSign : XCircle;
  if (type === 'BOOKING_REJECTED' || type === 'BOOKING_CANCELLED') return XCircle;
  if (type === 'BOOKING_ACCEPTED') return CheckCircle2;
  return CalendarCheck;
}

function timeLabel(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function SupplierNotificationsPage() {
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
          <p>Operational updates for your stations, booking requests, and payments.</p>
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
            <h2>Operational updates</h2>
            <p>{items.length} item{items.length === 1 ? '' : 's'}{unread ? ` · ${unread} unread` : ''}</p>
          </div>
          <Bell className="size-5 text-primary" />
        </div>
        {loading ? (
          <div className="workspace-empty"><p>Loading notifications…</p></div>
        ) : items.length === 0 ? (
          <div className="workspace-empty">
            <Bell className="size-5" />
            <strong>No notifications yet</strong>
            <p>Booking requests, station activity, and payment updates will appear here.</p>
          </div>
        ) : (
          <ul className="workspace-list">
            {items.map((n) => {
              const Icon = iconFor(n.type);
              return (
                <li className={`workspace-list-row${!n.readAt ? ' workspace-list-row--unread' : ''}`} key={n._id}>
                  <span className="workspace-row-icon"><Icon className="size-4" /></span>
                  <div className="workspace-row-main">
                    <strong>{n.title}</strong>
                    <span className="workspace-row-message">{n.message}</span>
                  </div>
                  <div className="workspace-notification-meta">
                    <time className="workspace-notification-time">{timeLabel(n.createdAt)}</time>
                    {!n.readAt ? (
                      <button className="workspace-text-button" type="button" onClick={() => void handleMarkRead(n._id)}>Mark read</button>
                    ) : (
                      <span className="workspace-status workspace-status--muted">Read</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
