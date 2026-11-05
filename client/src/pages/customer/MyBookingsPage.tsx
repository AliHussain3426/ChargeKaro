import { useState } from 'react';
import { CalendarDays, ChevronRight, Clock3, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const bookings = [
  { status: 'Upcoming', station: 'Gulberg Charge Hub', detail: 'Thursday, 14 Nov · 10:30–11:30', connector: 'Type 2 · 45 kW', state: 'confirmed' },
  { status: 'Completed', station: 'DHA Phase 5 EV Stop', detail: 'Monday, 04 Nov · 18:00–19:00', connector: 'Type 2 · 22 kW', state: 'done' },
];

export default function MyBookingsPage() {
  const [active, setActive] = useState('All');
  const tabs = ['All', 'Upcoming', 'Completed'];
  const visible = active === 'All' ? bookings : bookings.filter((booking) => booking.status === active);
  return <div className="workspace-page"><header className="workspace-head"><div><h1>My bookings</h1><p>Keep track of your confirmed sessions and charging history.</p></div><Link className="workspace-action" to="/customer/stations">Find a station <ChevronRight className="size-4" /></Link></header><nav className="workspace-tabs" aria-label="Booking filters">{tabs.map((tab) => <button key={tab} className={active === tab ? 'is-active' : ''} onClick={() => setActive(tab)}>{tab}</button>)}</nav><section className="workspace-panel"><div className="workspace-panel-head"><div><h2>{visible.length} {active.toLowerCase()} booking{visible.length === 1 ? '' : 's'}</h2><p>Bookings shown here are sample workspace data.</p></div></div><ul className="workspace-list">{visible.map((booking) => <li className="workspace-list-row" key={booking.station + booking.status}><span className="workspace-row-icon"><CalendarDays className="size-4" /></span><div className="workspace-row-main"><strong>{booking.station}</strong><span><Clock3 className="mr-1 inline size-3" />{booking.detail} · {booking.connector}</span></div><span className={`workspace-status ${booking.state === 'done' ? 'workspace-status--muted' : ''}`}>{booking.status}</span><Link aria-label={`View ${booking.station} booking`} className="workspace-text-button" to="/customer/stations"><MapPin className="size-4" /></Link></li>)}</ul></section></div>;
}
