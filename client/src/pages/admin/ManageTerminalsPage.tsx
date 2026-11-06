import { Plug } from 'lucide-react';
import AdminListWorkspace from '@/components/dashboard/AdminListWorkspace';
const rows = [{ name: 'GC-01', meta: 'Gulberg Charge Hub · Type 2 · 45 kW', status: 'Available', value: 'PKR 75/kWh', group: 'Available' }, { name: 'GC-02', meta: 'Gulberg Charge Hub · CCS2 · 50 kW', status: 'In use', value: 'PKR 85/kWh', group: 'In use' }, { name: 'DHA-01', meta: 'DHA Phase 5 EV Stop · Type 2 · 22 kW', status: 'Offline', value: 'PKR 65/kWh', group: 'Offline' }];
export default function ManageTerminalsPage() { return <AdminListWorkspace title="Terminals" description="Monitor connector compatibility, availability, and published rates across the network." itemLabel="Terminal" tabs={['All terminals', 'Available', 'In use', 'Offline']} rows={rows} icon={Plug} />; }
