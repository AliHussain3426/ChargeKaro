import { useEffect, useState, type FormEvent } from 'react';
import { Bell, CalendarCheck, CheckCircle2, CircleDollarSign, Send, Trash2, XCircle } from 'lucide-react';
import { createNotification, deleteNotification, listNotifications, markAllNotificationsRead, markNotificationRead, type NotificationItem } from '@/services/notifications';

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

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<'ALL' | 'CUSTOMER' | 'SUPPLIER' | 'ADMIN'>('ALL');
  const [sending, setSending] = useState(false);

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

  async function handleDelete(id: string) {
    try {
      await deleteNotification(id);
      setItems((current) => current.filter((n) => n._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification.');
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setError('Title and message are required.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await createNotification({ title: title.trim(), message: message.trim(), targetRole, type: 'ADMIN_MESSAGE' });
      setTitle('');
      setMessage('');
      setTargetRole('ALL');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification.');
    } finally {
      setSending(false);
    }
  }

  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="workspace-page">
      <header className="workspace-head">
        <div>
          <h1>Notifications</h1>
          <p>Platform activity, booking updates, and messages from customer and supplier workflows.</p>
        </div>
        {unread > 0 && (
          <button className="workspace-text-button" type="button" onClick={() => void handleMarkAll()}>
            Mark all read
          </button>
        )}
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="workspace-panel mb-8">
        <div className="workspace-panel-head">
          <div>
            <h2>Send notification</h2>
            <p>Create and send a notification to all users or a specific role.</p>
          </div>
          <Send className="size-5 text-primary" />
        </div>
        <form className="workspace-form" onSubmit={handleCreate}>
          <label className="workspace-field">
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" maxLength={120} />
          </label>
          <label className="workspace-field">
            <span>Message</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write message for users..." rows={4} maxLength={500} />
          </label>
          <label className="workspace-field">
            <span>Target audience</span>
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value as 'ALL' | 'CUSTOMER' | 'SUPPLIER' | 'ADMIN')}>
              <option value="ALL">All users</option>
              <option value="CUSTOMER">Customers</option>
              <option value="SUPPLIER">Suppliers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </label>
          <div className="workspace-form-actions">
            <button className="gc-button gc-button-primary" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send notification'}</button>
          </div>
        </form>
      </section>

      <section className="workspace-panel">
        <div className="workspace-panel-head">
          <div>
            <h2>Platform notifications</h2>
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
            <p>Platform activity and sent messages will appear here.</p>
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
                    <div className="workspace-notification-actions">
                      {!n.readAt ? (
                        <button className="workspace-text-button" type="button" onClick={() => void handleMarkRead(n._id)}>Mark read</button>
                      ) : (
                        <span className="workspace-status workspace-status--muted">Read</span>
                      )}
                      <button className="workspace-text-button workspace-text-button--danger" type="button" onClick={() => void handleDelete(n._id)} aria-label="Delete notification" title="Delete notification">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
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
