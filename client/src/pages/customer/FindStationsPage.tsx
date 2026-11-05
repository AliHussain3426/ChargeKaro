import { ArrowUpRight, ChevronDown, Filter, Navigation, PlugZap, Search, SlidersHorizontal } from 'lucide-react';

const stations = [
  { name: 'Gulberg Charge Hub', place: 'Main Boulevard, Lahore', distance: '1.8 km', ports: '2 ports open', power: '45 kW', status: 'Available' },
  { name: 'DHA Phase 5 EV Stop', place: 'Commercial Area, Lahore', distance: '4.2 km', ports: '1 port open', power: '22 kW', status: 'Available' },
  { name: 'Johar Town Fast Charge', place: 'Abdul Haque Road, Lahore', distance: '6.7 km', ports: 'All ports occupied', power: '50 kW', status: 'Busy' },
];

export default function FindStationsPage() {
  return (
    <div className="enter">
      <div className="flex items-end justify-between mb-7">
        <div>
          <p className="eyebrow">Station discovery</p><h1 className="mt-1 text-3xl font-bold text-foreground">Find a charger</h1>
          <p className="mt-2 text-sm text-foreground-secondary">Showing compatible stations close to your current location.</p>
        </div>
        <button className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-foreground-secondary hover:bg-surface-elevated transition-colors">
          <Filter className="size-4" />
          Filters
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search by city, area, or station name..."
            defaultValue="Near Gulberg, Lahore" className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white sm:hidden"><SlidersHorizontal className="size-4" /> Filters</button>
      </div>

      {/* Map placeholder */}
      <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
        <section className="app-panel overflow-hidden rounded-xl">
          <div className="flex items-center justify-between p-5"><div><p className="eyebrow">Nearby stations</p><h2 className="mt-1 text-lg font-bold">3 compatible chargers</h2></div><button className="text-foreground-muted"><ChevronDown className="size-5" /></button></div>
          <div className="border-t border-[#e3ecea]">
            {stations.map((station) => <article key={station.name} className="group border-b border-[#e3ecea] p-5 last:border-b-0 hover:bg-[#f7fbfa]"><div className="flex gap-3"><span className={`mt-1 status-dot ${station.status === 'Busy' ? 'busy' : ''}`} /><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><h3 className="font-semibold text-foreground">{station.name}</h3><span className="shrink-0 text-sm font-semibold text-foreground">{station.distance}</span></div><p className="mt-1 text-sm text-foreground-secondary">{station.place}</p><div className="mt-3 flex items-center justify-between text-xs text-foreground-muted"><span>{station.power} · {station.ports}</span><button className="inline-flex items-center font-semibold text-primary">Details <ArrowUpRight className="ml-1 size-3" /></button></div></div></div></article>)}
          </div>
        </section>
        <section className="route-pattern relative min-h-[440px] overflow-hidden rounded-xl bg-[#d8ebe7] p-6">
          <div className="absolute inset-x-[-12%] top-[48%] h-14 -rotate-[30deg] bg-[#f7fbfa]" /><div className="absolute left-[43%] top-[-15%] h-[125%] w-12 rotate-[25deg] bg-[#f7fbfa]" />
          <div className="absolute left-[16%] top-[18%] grid size-10 place-items-center rounded-full bg-white text-primary shadow-md"><PlugZap className="size-5" /></div><div className="absolute right-[19%] top-[30%] grid size-11 place-items-center rounded-full bg-primary text-white shadow-md"><PlugZap className="size-5" /></div><div className="absolute bottom-[20%] right-[30%] grid size-10 place-items-center rounded-full bg-white text-primary shadow-md"><PlugZap className="size-5" /></div>
          <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-white p-4 shadow-lg"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-primary-light text-primary"><Navigation className="size-5" /></span><div><p className="text-sm font-semibold text-foreground">Your location</p><p className="text-xs text-foreground-secondary">Gulberg, Lahore</p></div></div></div>
        </section>
      </div>
    </div>
  );
}

