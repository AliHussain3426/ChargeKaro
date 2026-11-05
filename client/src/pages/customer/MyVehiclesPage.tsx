import { Car, Plus } from 'lucide-react';

export default function MyVehiclesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Vehicles</h1>
          <p className="mt-1 text-sm text-foreground-secondary">Manage your registered electric vehicles.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add Vehicle</span>
        </button>
      </div>

      {/* Empty state */}
      <div className="rounded-[12px] bg-surface border border-border-light p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Car className="size-12 text-foreground-muted/30 mb-3" />
          <p className="text-sm font-medium text-foreground-muted">No vehicles registered</p>
          <p className="text-xs text-foreground-muted mt-1 max-w-xs">
            Add your electric vehicle to get tailored charging station recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}

