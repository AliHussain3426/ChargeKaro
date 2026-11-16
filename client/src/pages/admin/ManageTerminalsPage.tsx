import { useEffect, useMemo, useState } from 'react';
import { Plug } from 'lucide-react';
import AdminListWorkspace from '@/components/dashboard/AdminListWorkspace';
import { listAdminTerminals, type AdminTerminal } from '@/services/admin';

function toRow(t: AdminTerminal) {
  const station = t.stationId as any;
  const status = t.status || (t.availability ? 'AVAILABLE' : 'UNAVAILABLE');
  const group = status === 'AVAILABLE' ? 'Available' : status === 'OCCUPIED' ? 'In use' : 'Offline';
  const connectors = (t.connectorTypes || []).join(', ') || '—';
  const price = t.pricing ? `${t.pricing.currency} ${t.pricing.amount} / ${t.pricing.billingType}` : '—';
  return {
    id: t._id,
    name: t.name || 'Terminal',
    meta: `${station?.name || 'Station'}${station?.city ? `, ${station.city}` : ''} · ${connectors} · ${t.maximumPowerKw ?? '—'} kW`,
    status,
    value: price,
    group,
    details: [
      { label: 'Terminal ID', value: t._id || '—' },
      { label: 'Station', value: station?.name || '—' },
      { label: 'City', value: station?.city || '—' },
      { label: 'Charging method', value: t.chargingMethod || '—' },
      { label: 'Connectors', value: connectors },
      { label: 'Max power', value: t.maximumPowerKw != null ? `${t.maximumPowerKw} kW` : '—' },
      { label: 'Availability', value: t.availability ? 'Available' : 'Unavailable' },
      { label: 'Status', value: status },
      { label: 'Pricing', value: price },
    ],
  };
}

export default function ManageTerminalsPage() {
  const [items, setItems] = useState<AdminTerminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listAdminTerminals();
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load terminals.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => items.map(toRow), [items]);
  return <AdminListWorkspace title="Terminals" description="Monitor connector compatibility, availability, and published rates across the network." itemLabel="Terminal" tabs={['All terminals', 'Available', 'In use', 'Offline']} rows={rows} icon={Plug} loading={loading} error={error} live />;
}
