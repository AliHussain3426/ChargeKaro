import { MapPin, Filter } from 'lucide-react';

export default function FindStationsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Find Charging Stations</h1>
          <p className="mt-1 text-sm text-foreground-secondary">Discover stations near you or search by location.</p>
        </div>
        <button className="hidden sm:inline-flex items-center gap-2 rounded-[8px] border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground-secondary hover:bg-surface-elevated transition-colors">
          <Filter className="size-4" />
          Filters
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search by city, area, or station name..."
            className="w-full rounded-[10px] border border-border bg-surface pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </div>

      {/* Map placeholder */}
      <div className="rounded-[12px] bg-surface border border-border-light overflow-hidden">
        <div className="h-[400px] flex items-center justify-center bg-background">
          <div className="text-center">
            <MapPin className="size-12 text-foreground-muted/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground-muted">Map View</p>
            <p className="text-xs text-foreground-muted mt-1">Interactive map will load here (Leaflet + OpenStreetMap)</p>
          </div>
        </div>
      </div>

      {/* Station list placeholder */}
      <div className="mt-6 rounded-[12px] bg-surface border border-border-light p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Nearby Stations</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-foreground-muted">No stations to display.</p>
          <p className="text-xs text-foreground-muted mt-1">Search or allow location access to see nearby stations.</p>
        </div>
      </div>
    </div>
  );
}

