import { useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import AdminListWorkspace from '@/components/dashboard/AdminListWorkspace';
import { listAdminStations, type AdminStation } from '@/services/admin';

function toRow(st: AdminStation) {
  const supplier = st.supplierId as any;
  const supplierName = supplier?.businessName || supplier?.user?.name || 'Supplier';
  const terminalCount = st.terminalCount ?? 0;
  const group = terminalCount > 0 ? 'With terminals' : 'No terminals';
  return {
    name: st.name || 'Station',
    meta: `${st.address || ''}${st.city ? `, ${st.city}` : ''} · ${supplierName}`,
    status: terminalCount > 0 ? 'ACTIVE' : 'Attention',
    value: `${terminalCount} terminal${terminalCount === 1 ? '' : 's'}`,
    group,
  };
}

export default function ManageStationsPage() {
  const [items, setItems] = useState<AdminStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listAdminStations();
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load stations.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => items.map(toRow), [items]);
  return <AdminListWorkspace title="Stations" description="Oversee charging stations across the platform." itemLabel="Station" tabs={['All stations', 'With terminals', 'No terminals']} rows={rows} icon={MapPin} loading={loading} error={error} live />;
}
