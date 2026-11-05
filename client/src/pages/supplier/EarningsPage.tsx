import { DollarSign } from 'lucide-react';

export default function EarningsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
        <p className="mt-1 text-sm text-foreground-secondary">Track your revenue and transaction history.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Earnings', value: '—' },
          { label: 'This Month', value: '—' },
          { label: 'Pending Payouts', value: '—' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[12px] bg-surface border border-border-light p-5">
            <p className="text-sm text-foreground-secondary">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      <div className="rounded-[12px] bg-surface border border-border-light p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Transaction History</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <DollarSign className="size-12 text-foreground-muted/30 mb-3" />
          <p className="text-sm font-medium text-foreground-muted">No transactions yet</p>
          <p className="text-xs text-foreground-muted mt-1">Completed bookings and payouts will appear here.</p>
        </div>
      </div>
    </div>
  );
}

