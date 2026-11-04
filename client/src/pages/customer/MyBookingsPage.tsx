import { Calendar } from 'lucide-react';

const tabs = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

export default function MyBookingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
        <p className="mt-1 text-sm text-foreground-secondary">Track and manage your charging bookings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`shrink-0 rounded-[8px] px-4 py-2 text-sm font-medium transition-colors ${
              i === 0
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface text-foreground-secondary hover:bg-surface-elevated'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="rounded-[12px] bg-surface border border-border-light p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="size-12 text-foreground-muted/30 mb-3" />
          <p className="text-sm font-medium text-foreground-muted">No bookings yet</p>
          <p className="text-xs text-foreground-muted mt-1 max-w-xs">
            When you book a charging session, it will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

