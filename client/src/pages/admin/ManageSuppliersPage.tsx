import { useCallback, useEffect, useMemo, useState } from 'react';
import { Store } from 'lucide-react';
import AdminListWorkspace from '@/components/dashboard/AdminListWorkspace';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { deleteAdminUser, listAdminSuppliers, updateAdminSupplier, updateAdminUser, type AdminSupplier } from '@/services/admin';

export default function ManageSuppliersPage() {
  const [items, setItems] = useState<AdminSupplier[]>([]);
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
      const data = await listAdminSuppliers();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suppliers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleVerify = useCallback((s: AdminSupplier, status: 'VERIFIED' | 'REJECTED') => {
    openConfirm({
      title: status === 'VERIFIED' ? 'Approve supplier?' : 'Reject supplier?',
      message: `${status === 'VERIFIED' ? 'Approve and verify' : 'Reject'} "${s.businessName || 'this supplier'}"? ${status === 'VERIFIED' ? 'The supplier will be able to log in and use their account.' : 'The supplier account will be blocked until reviewed again.'}`,
      confirmLabel: status === 'VERIFIED' ? 'Approve supplier' : 'Reject supplier',
      tone: status === 'VERIFIED' ? 'default' : 'warning',
      onConfirm: async () => {
        setActionMessage(''); setError('');
        try {
          await updateAdminSupplier(s._id, { verificationStatus: status });
          setActionMessage(`Supplier ${status === 'VERIFIED' ? 'verified' : 'rejected'} successfully.`);
          await load();
        } catch (err) { setError(err instanceof Error ? err.message : 'Failed to update supplier.'); }
      },
    });
  }, [load, openConfirm]);

  const handleSuspendUser = useCallback((s: AdminSupplier) => {
    const user = s.user as any;
    const userId = user?._id;
    if (!userId) return;
    const next = user?.accountStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    openConfirm({
      title: next === 'SUSPENDED' ? 'Suspend supplier account?' : 'Reactivate supplier account?',
      message: `${next === 'SUSPENDED' ? 'Suspend/block' : 'Reactivate'} "${s.businessName || user?.name || 'supplier'}"? ${next === 'SUSPENDED' ? 'The supplier will not be able to log in until reactivated.' : 'The supplier will regain account access.'}`,
      confirmLabel: next === 'SUSPENDED' ? 'Suspend / Block' : 'Reactivate',
      tone: next === 'SUSPENDED' ? 'warning' : 'default',
      onConfirm: async () => {
        setActionMessage(''); setError('');
        try {
          await updateAdminUser(userId, { accountStatus: next });
          setActionMessage(`Supplier account ${next === 'SUSPENDED' ? 'suspended' : 'reactivated'} successfully.`);
          await load();
        } catch (err) { setError(err instanceof Error ? err.message : 'Failed to update supplier account.'); }
      },
    });
  }, [load, openConfirm]);

  const handleDeleteUser = useCallback((s: AdminSupplier) => {
    const user = s.user as any;
    const userId = user?._id;
    if (!userId) return;
    openConfirm({
      title: 'Delete supplier account?',
      message: `Delete "${s.businessName || user?.name || 'supplier'}" permanently? This action cannot be undone. Deletion may be blocked if the supplier has stations or bookings.`,
      confirmLabel: 'Delete account',
      tone: 'danger',
      onConfirm: async () => {
        setActionMessage(''); setError('');
        try {
          await deleteAdminUser(userId);
          setActionMessage('Supplier account deleted successfully.');
          await load();
        } catch (err) { setError(err instanceof Error ? err.message : 'Failed to delete supplier account.'); }
      },
    });
  }, [load, openConfirm]);

  const rows = useMemo(() => items.map((s) => {
    const verification = s.verificationStatus || 'UNVERIFIED';
    const group = verification === 'VERIFIED' ? 'Verified' : verification === 'PENDING' ? 'Pending' : verification === 'REJECTED' || verification === 'UNVERIFIED' ? 'Unverified' : 'Other';
    const user = s.user as any;
    const userSuspended = user?.accountStatus === 'SUSPENDED';
    return {
      id: s._id,
      name: s.businessName || user?.name || 'Supplier',
      meta: `${user?.email || '—'} · ${s.stationCount ?? 0} station${(s.stationCount ?? 0) === 1 ? '' : 's'}`,
      status: verification,
      value: `${s.stationCount ?? 0} locations`,
      group,
      details: [
        { label: 'Supplier profile ID', value: s._id || '—' },
        { label: 'Business name', value: s.businessName || '—' },
        { label: 'Contact name', value: user?.name || '—' },
        { label: 'Email', value: user?.email || '—' },
        { label: 'User account status', value: user?.accountStatus || '—' },
        { label: 'Verification', value: verification },
        { label: 'Stations', value: String(s.stationCount ?? 0) },
        { label: 'Created', value: s.createdAt ? new Date(s.createdAt).toLocaleString() : '—' },
      ],
      actions: [
        ...(verification !== 'VERIFIED' ? [{ label: 'Verify Supplier', onClick: () => handleVerify(s, 'VERIFIED'), tone: 'success' as const }] : []),
        ...(verification !== 'REJECTED' ? [{ label: 'Reject supplier', onClick: () => handleVerify(s, 'REJECTED'), tone: 'warning' as const }] : []),
        { label: userSuspended ? 'Reactivate account' : 'Suspend / Block account', onClick: () => handleSuspendUser(s), tone: userSuspended ? 'default' as const : 'warning' as const },
        { label: 'Delete account', onClick: () => handleDeleteUser(s), tone: 'danger' as const },
      ],
    };
  }), [items, handleVerify, handleSuspendUser, handleDeleteUser]);

  return (
    <div>
      {actionMessage && <p className="form-success" role="status" style={{ marginBottom: 12 }}>{actionMessage}</p>}
      <AdminListWorkspace title="Suppliers" description="Review station operators, verify supplier accounts, and manage access." itemLabel="Supplier" tabs={['All suppliers', 'Verified', 'Pending', 'Unverified']} rows={rows} icon={Store} loading={loading} error={error} live />
      <ConfirmDialog open={confirm.open} title={confirm.title} message={confirm.message} confirmLabel={confirm.confirmLabel} tone={confirm.tone} loading={confirmLoading} onConfirm={() => void runConfirm()} onCancel={closeConfirm} />
    </div>
  );
}
