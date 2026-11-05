import { BarChart3 } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="mt-1 text-sm text-foreground-secondary">Platform performance, usage statistics, and insights.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: '—' },
          { label: 'Revenue', value: '—' },
          { label: 'Active Users', value: '—' },
          { label: 'Station Utilization', value: '—' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[12px] bg-surface border border-border-light p-5">
            <p className="text-sm text-foreground-secondary">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="rounded-[12px] bg-surface border border-border-light p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Platform Analytics</h2>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 className="size-14 text-foreground-muted/30 mb-3" />
          <p className="text-sm font-medium text-foreground-muted">Analytics charts will appear here</p>
          <p className="text-xs text-foreground-muted mt-1">Charts and graphs will render when data is available.</p>
        </div>
      </div>
    </div>
  );
}

