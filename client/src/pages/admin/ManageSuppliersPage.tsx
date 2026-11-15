import { useEffect, useMemo, useState } from 'react';
import { Store } from 'lucide-react';
import AdminListWorkspace from '@/components/dashboard/AdminListWorkspace';
import { listAdminSuppliers, type AdminSupplier } from '@/services/admin';

function toRow(s: AdminSupplier) {
  const verification = s.verificationStatus || 'UNVERIFIED';
  const group = verification === 'VERIFIED' ? 'Verified' : verification === 'PENDING' ? 'Pending' : verification === 'REJECTED' || verification === 'UNVERIFIED' ? 'Unverified' : 'Other';
  const user = s.user as any;
  return {
    name: s.businessName || user?.name || 'Supplier',
    meta: `${user?.email || '—'} · ${s.stationCount ?? 0} station${(s.stationCount ?? 0) === 1 ? '' : 's'}`,
    status: verification,
    value: `${s.stationCount ?? 0} locations`,
    group,
  };
}

export default function ManageSuppliersPage() {
  const [items, setItems] = useState<AdminSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listAdminSuppliers();
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load suppliers.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => items.map(toRow), [items]);
  return <AdminListWorkspace title="Suppliers" description="Review station operators, verification status, and published network presence." itemLabel="Supplier" tabs={['All suppliers', 'Verified', 'Pending', 'Unverified']} rows={rows} icon={Store} loading={loading} error={error} live />;
}
