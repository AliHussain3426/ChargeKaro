import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import AdminListWorkspace from '@/components/dashboard/AdminListWorkspace';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { deleteAdminStation, listAdminStations, updateAdminStation, type AdminStation } from '@/services/admin';

export default function ManageStationsPage() {
  const [items, setItems] = useState<AdminStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; message: string; confirmLabel: string; tone: 'danger' | 'warning' | 'default'; onConfirm: () => Promise<void> }>({ open: false, title: '', message: '', confirmLabel: 'Confirm', tone: 'default', onConfirm: async () => {} });
  const [confirmLoading, setConfirmLoading] = useState(false);
  const closeConfirm = useCallback(() => { if (!confirmLoading) setConfirm((c) => ({ ...c, open: false })); }, [confirmLoading]);
  const runConfirm = useCallback(async () => { setConfirmLoading(true); try { await confirm.onConfirm(); setConfirm((c) => ({ ...c, open: false })); } finally { setConfirmLoading(false); } }, [confirm]);
  const openConfirm = useCallback((cfg: Omit<typeof confirm, 'open'>) => { setConfirm({ ...cfg, open: true }); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminStations();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleSuspendToggle = useCallback((st: AdminStation) => {
    const next = st.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    openConfirm({
      title: next === 'SUSPENDED' ? 'Suspend station?' : 'Reactivate station?',
      message: `${next === 'SUSPENDED' ? 'Suspend/block' : 'Reactivate'} "${st.name}"? ${next === 'SUSPENDED' ? 'Suspended stations will be hidden from discovery and cannot accept bookings.' : 'The station will become active again.'}`,
      confirmLabel: next === 'SUSPENDED' ? 'Suspend / Block' : 'Reactivate',
      tone: next === 'SUSPENDED' ? 'warning' : 'default',
      onConfirm: async () => {
        setActionMessage(''); setError('');
        try {
          await updateAdminStation(st._id, { status: next });
          setActionMessage(`Station ${next === 'SUSPENDED' ? 'suspended' : 'reactivated'} successfully.`);
          await load();
        } catch (err) { setError(err instanceof Error ? err.message : 'Failed to update station.'); }
      },
    });
  }, [load, openConfirm]);

  const handleDelete = useCallback((st: AdminStation) => {
    openConfirm({
      title: 'Delete station?',
      message: `Delete "${st.name}" permanently? This action cannot be undone. Deletion may be blocked if the station has terminals or bookings.`,
      confirmLabel: 'Delete station',
      tone: 'danger',
      onConfirm: async () => {
        setActionMessage(''); setError('');
        try {
          await deleteAdminStation(st._id);
          setActionMessage('Station deleted successfully.');
          await load();
        } catch (err) { setError(err instanceof Error ? err.message : 'Failed to delete station.'); }
      },
    });
  }, [load, openConfirm]);

  const rows = useMemo(() => items.map((st) => {
    const supplier = st.supplierId as any;
    const supplierName = supplier?.businessName || supplier?.user?.name || 'Supplier';
    const supplierEmail = supplier?.user?.email || '—';
    const terminalCount = st.terminalCount ?? 0;
    const status = st.status || 'ACTIVE';
    const group = status === 'SUSPENDED' ? 'Suspended' : terminalCount > 0 ? 'With terminals' : 'No terminals';
    const pricing = st.pricing ? `${st.pricing.currency} ${st.pricing.amount} / ${st.pricing.billingType}` : '—';
    const isSuspended = status === 'SUSPENDED';
    return {
      id: st._id,
      name: st.name || 'Station',
      meta: `${st.address || ''}${st.city ? `, ${st.city}` : ''} · ${supplierName}`,
      status,
      value: `${terminalCount} terminal${terminalCount === 1 ? '' : 's'}`,
      group,
      details: [
        { label: 'Station ID', value: st._id || '—' },
        { label: 'Status', value: status },
        { label: 'Address', value: st.address || '—' },
        { label: 'City', value: st.city || '—' },
        { label: 'Supplier', value: supplierName },
        { label: 'Supplier email', value: supplierEmail },
        { label: 'Terminals', value: String(terminalCount) },
        { label: 'Pricing', value: pricing },
        { label: 'Created', value: st.createdAt ? new Date(st.createdAt).toLocaleString() : '—' },
      ],
      actions: [
        { label: isSuspended ? 'Reactivate station' : 'Suspend / Block station', onClick: () => handleSuspendToggle(st), tone: isSuspended ? 'default' as const : 'warning' as const },
        { label: 'Delete station', onClick: () => handleDelete(st), tone: 'danger' as const },
      ],
    };
  }), [items, handleSuspendToggle, handleDelete]);

  return (
    <div>
      {actionMessage && <p className="form-success" role="status" style={{ marginBottom: 12 }}>{actionMessage}</p>}
      <AdminListWorkspace title="Stations" description="Oversee, suspend, or remove charging stations across the platform." itemLabel="Station" tabs={['All stations', 'With terminals', 'No terminals', 'Suspended']} rows={rows} icon={MapPin} loading={loading} error={error} live />
      <ConfirmDialog open={confirm.open} title={confirm.title} message={confirm.message} confirmLabel={confirm.confirmLabel} tone={confirm.tone} loading={confirmLoading} onConfirm={() => void runConfirm()} onCancel={closeConfirm} />
    </div>
  );
}
