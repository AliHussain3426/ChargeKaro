import { Bell } from 'lucide-react';

export default function CustomerNotificationsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="mt-1 text-sm text-foreground-secondary">Stay updated on your bookings and activity.</p>
      </div>

      <div className="rounded-[12px] bg-surface border border-border-light p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Bell className="size-12 text-foreground-muted/30 mb-3" />
          <p className="text-sm font-medium text-foreground-muted">No notifications</p>
          <p className="text-xs text-foreground-muted mt-1">You're all caught up.</p>
        </div>
      </div>
    </div>
  );
}

