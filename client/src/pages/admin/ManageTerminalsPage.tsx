import { Plug, Search } from 'lucide-react';

export default function ManageTerminalsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Manage Terminals</h1>
        <p className="mt-1 text-sm text-foreground-secondary">View and monitor all charging terminals across all stations.</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
        <input
          type="text"
          placeholder="Search terminals by ID, station, or type..."
          className="w-full rounded-[10px] border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>

      <div className="rounded-[12px] bg-surface border border-border-light p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Plug className="size-12 text-foreground-muted/30 mb-3" />
          <p className="text-sm font-medium text-foreground-muted">No terminals to display</p>
          <p className="text-xs text-foreground-muted mt-1">All platform terminals will be listed here.</p>
        </div>
      </div>
    </div>
  );
}

