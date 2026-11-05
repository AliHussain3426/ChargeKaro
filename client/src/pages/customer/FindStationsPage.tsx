import { useMemo, useState } from 'react';
import { ArrowUpRight, Filter, MapPin, Navigation, PlugZap, Search, SlidersHorizontal } from 'lucide-react';

const stations = [
  { name: 'Gulberg Charge Hub', place: 'Main Boulevard, Lahore', distance: '1.8 km', ports: '2 ports open', power: '45 kW', status: 'Available' },
  { name: 'DHA Phase 5 EV Stop', place: 'Commercial Area, Lahore', distance: '4.2 km', ports: '1 port open', power: '22 kW', status: 'Available' },
  { name: 'Johar Town Fast Charge', place: 'Abdul Haque Road, Lahore', distance: '6.7 km', ports: 'All ports occupied', power: '50 kW', status: 'Busy' },
];

export default function FindStationsPage() {
  const [query, setQuery] = useState('Near Gulberg, Lahore');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [selected, setSelected] = useState(stations[0].name);
  const visibleStations = useMemo(() => stations.filter((station) => (!availableOnly || station.status === 'Available') && `${station.name} ${station.place}`.toLowerCase().includes(query.replace('Near ', '').toLowerCase().split(',')[0] || '')), [availableOnly, query]);
  const selectedStation = stations.find((station) => station.name === selected) ?? stations[0];

  return <div className="workspace-page station-discovery">
    <header className="workspace-head station-discovery-head"><div><h1>Find a charger</h1><p>Compatible charging points near Gulberg, Lahore for your Nissan Leaf.</p></div><button className={`workspace-action workspace-action--secondary station-filter ${availableOnly ? 'is-active' : ''}`} onClick={() => setAvailableOnly(!availableOnly)}><Filter className="size-4" />{availableOnly ? 'Available only' : 'Filters'}</button></header>
    <div className="station-search"><Search className="size-4" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a city, area, or station" aria-label="Search a city, area, or station" /><button type="button" onClick={() => setQuery('Near Gulberg, Lahore')} aria-label="Use Gulberg location"><Navigation className="size-4" /> <span>Use location</span></button></div>
    <div className="station-discovery-grid">
      <section className="workspace-panel station-results"><div className="workspace-panel-head"><div><h2>{visibleStations.length} compatible charger{visibleStations.length === 1 ? '' : 's'}</h2><p>{availableOnly ? 'Showing currently available ports only.' : 'Sorted by closest compatible station.'}</p></div><SlidersHorizontal className="size-4 text-foreground-muted" /></div><ul className="workspace-list">{visibleStations.map((station) => <li key={station.name}><button className={`station-result ${selected === station.name ? 'is-selected' : ''}`} onClick={() => setSelected(station.name)}><span className={`station-status-dot ${station.status === 'Busy' ? 'is-busy' : ''}`} /><span className="station-result-main"><strong>{station.name}</strong><small>{station.place}</small><em>{station.power} · {station.ports}</em></span><span className="station-result-side"><b>{station.distance}</b><span>{station.status}</span><ArrowUpRight className="size-4" /></span></button></li>)}</ul>{visibleStations.length === 0 && <div className="workspace-empty"><MapPin className="size-7" /><strong>No matching chargers</strong><p>Try another area or turn off the available-only filter.</p></div>}</section>
      <section className="station-map" aria-label="Station map preview"><span className="station-map-road station-map-road--one" /><span className="station-map-road station-map-road--two" /><button className="station-map-pin station-map-pin--origin" aria-label="Your location"><Navigation className="size-4" /></button><button className="station-map-pin station-map-pin--selected" aria-label={`${selectedStation.name}, selected`}><PlugZap className="size-4" /></button><button className="station-map-pin station-map-pin--other" aria-label="Another charging station"><PlugZap className="size-4" /></button><div className="station-map-summary"><span className="workspace-row-icon"><PlugZap className="size-4" /></span><div><strong>{selectedStation.name}</strong><p>{selectedStation.distance} away · {selectedStation.power} · {selectedStation.ports}</p></div><button className="workspace-text-button">Details <ArrowUpRight className="size-4" /></button></div></section>
    </div>
  </div>;
}
