import { useCallback, useEffect, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import AdminListWorkspace from '@/components/dashboard/AdminListWorkspace';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { deleteAdminUser, listAdminUsers, updateAdminUser, type AdminUser } from '@/services/admin';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [confirm, setConfirm] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    tone: 'danger' | 'warning' | 'default';
    onConfirm: () => Promise<void>;
  }>({ open: false, title: '', message: '', confirmLabel: 'Confirm', tone: 'default', onConfirm: async () => {} });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAdminUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openConfirm = useCallback((cfg: Omit<typeof confirm, 'open'>) => {
    setConfirm({ ...cfg, open: true });
  }, [confirm]);

  const closeConfirm = useCallback(() => {
    if (!confirmLoading) setConfirm((c) => ({ ...c, open: false }));
  }, [confirmLoading]);

  const runConfirm = useCallback(async () => {
    setConfirmLoading(true);
    try {
      await confirm.onConfirm();
      setConfirm((c) => ({ ...c, open: false }));
    } finally {
      setConfirmLoading(false);
    }
  }, [confirm]);

  const handleSuspendToggle = useCallback((user: AdminUser) => {
    const id = user._id || user.id;
    if (!id) return;
    const nextStatus = user.accountStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const label = nextStatus === 'SUSPENDED' ? 'Suspend / Block' : 'Reactivate';
    openConfirm({
      title: `${label} user?`,
      message: `Are you sure you want to ${nextStatus === 'SUSPENDED' ? 'suspend/block' : 'reactivate'} ${user.name || 'this user'}? ${nextStatus === 'SUSPENDED' ? 'They will not be able to log in until reactivated.' : 'They will be able to access their account again.'}`,
      confirmLabel: label,
      tone: nextStatus === 'SUSPENDED' ? 'warning' : 'default',
      onConfirm: async () => {
        setActionMessage('');
        setError('');
        try {
          await updateAdminUser(id, { accountStatus: nextStatus });
          setActionMessage(`User ${nextStatus === 'SUSPENDED' ? 'suspended' : 'reactivated'} successfully.`);
          await load();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to update user.');
        }
      },
    });
  }, [load, openConfirm]);

  const handleDelete = useCallback((user: AdminUser) => {
    const id = user._id || user.id;
    if (!id) return;
    openConfirm({
      title: 'Delete user?',
      message: `Delete ${user.name || 'this user'} permanently? This action cannot be undone. If the user has bookings or supplier stations, deletion may be blocked.`,
      confirmLabel: 'Delete user',
      tone: 'danger',
      onConfirm: async () => {
        setActionMessage('');
        setError('');
        try {
          await deleteAdminUser(id);
          setActionMessage('User deleted successfully.');
          await load();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to delete user.');
        }
      },
    });
  }, [load, openConfirm]);

  const handleVerifySupplier = useCallback((user: AdminUser) => {
    const id = user._id || user.id;
    if (!id) return;
    openConfirm({
      title: 'Verify supplier?',
      message: `Verify ${user.name || 'this supplier'}? This will mark the supplier account as verified and allow them to log in and use the platform.`,
      confirmLabel: 'Verify Supplier',
      tone: 'default',
      onConfirm: async () => {
        setActionMessage('');
        setError('');
        try {
          await updateAdminUser(id, { verificationStatus: 'VERIFIED' });
          setActionMessage('Supplier verified successfully.');
          await load();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to verify supplier.');
        }
      },
    });
  }, [load, openConfirm]);

  const rows = useMemo(() => users.map((user) => {
    const role = user.role || 'USER';
    const group = role === 'CUSTOMER' ? 'Customers' : role === 'SUPPLIER' ? 'Suppliers' : role === 'ADMIN' ? 'Admins' : 'Other';
    const isSuspended = user.accountStatus === 'SUSPENDED';
    const isAdmin = role === 'ADMIN';
    const canVerifySupplier = role === 'SUPPLIER' && user.verificationStatus !== 'VERIFIED';
    return {
      id: user._id || user.id,
      name: user.name || 'User',
      meta: `${user.email || '—'} · ${role.toLowerCase()}`,
      status: user.accountStatus || 'ACTIVE',
      value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—',
      group,
      details: [
        { label: 'User ID', value: user._id || user.id || '—' },
        { label: 'Email', value: user.email || '—' },
        { label: 'Phone', value: user.phone || '—' },
        { label: 'Role', value: role },
        { label: 'Account status', value: user.accountStatus || '—' },
        { label: 'Verification', value: user.verificationStatus || '—' },
        { label: 'Joined', value: user.createdAt ? new Date(user.createdAt).toLocaleString() : '—' },
      ],
      actions: isAdmin ? [] : [
        ...(canVerifySupplier ? [{
          label: 'Verify Supplier',
          onClick: () => handleVerifySupplier(user),
          tone: 'success' as const,
        }] : []),
        {
          label: isSuspended ? 'Reactivate user' : 'Suspend / Block user',
          onClick: () => handleSuspendToggle(user),
          tone: (isSuspended ? 'default' : 'warning') as 'default' | 'warning',
        },
        {
          label: 'Delete user',
          onClick: () => handleDelete(user),
          tone: 'danger' as const,
        },
      ],
    };
  }), [users, handleSuspendToggle, handleDelete, handleVerifySupplier]);

  return (
    <div>
      {actionMessage && <p className="form-success" role="status" style={{ marginBottom: 12 }}>{actionMessage}</p>}
      <AdminListWorkspace title="Users" description="Review and manage people and organisations with access to ChargeKaro." itemLabel="User" tabs={['All users', 'Customers', 'Suppliers', 'Admins']} rows={rows} icon={Users} loading={loading} error={error} live />
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmLabel={confirm.confirmLabel}
        tone={confirm.tone}
        loading={confirmLoading}
        onConfirm={() => void runConfirm()}
        onCancel={closeConfirm}
      />
    </div>
  );
}
