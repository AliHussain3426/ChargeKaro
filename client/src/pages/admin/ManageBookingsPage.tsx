import { CalendarCheck } from 'lucide-react';
import AdminListWorkspace from '@/components/dashboard/AdminListWorkspace';

const rows = [
  { name: 'BK-1024 · Ayesha Khan', meta: 'Gulberg Charge Hub · Thu, 14 Nov · 10:30–11:30', status: 'Confirmed', value: 'PKR 1,440', group: 'Confirmed' },
  { name: 'BK-1025 · Hassan Ali', meta: 'Gulberg Charge Hub · Fri, 15 Nov · 14:00–15:00', status: 'Pending', value: 'PKR 1,200', group: 'Pending' },
  { name: 'BK-1017 · Zara Malik', meta: 'DHA Phase 5 EV Stop · Mon, 04 Nov · 18:00–19:00', status: 'Completed', value: 'PKR 720', group: 'Completed' },
];

export default function ManageBookingsPage() { return <AdminListWorkspace title="Bookings" description="Oversee charging session requests and their platform status." itemLabel="Booking" tabs={['All bookings', 'Pending', 'Confirmed', 'Completed']} rows={rows} icon={CalendarCheck} />; }
