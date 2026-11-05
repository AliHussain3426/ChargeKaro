import { Store, Search } from 'lucide-react';

const tabs = ['All', 'Verified', 'Pending', 'Suspended'];

export default function ManageSuppliersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Manage Suppliers</h1>
        <p className="mt-1 text-sm text-foreground-secondary">Review, verify, and manage charging station suppliers.</p>
      </div>

      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search suppliers by name or email..."
            className="w-full rounded-[10px] border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
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
      </div>

      <div className="rounded-[12px] bg-surface border border-border-light p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Store className="size-12 text-foreground-muted/30 mb-3" />
          <p className="text-sm font-medium text-foreground-muted">No suppliers to display</p>
          <p className="text-xs text-foreground-muted mt-1">Registered suppliers will appear here.</p>
        </div>
      </div>
    </div>
  );
}

