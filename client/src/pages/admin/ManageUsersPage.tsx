import { useEffect, useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import AdminListWorkspace from '@/components/dashboard/AdminListWorkspace';
import { listAdminUsers, type AdminUser } from '@/services/admin';

function toRow(user: AdminUser) {
  const role = user.role || 'USER';
  const group = role === 'CUSTOMER' ? 'Customers' : role === 'SUPPLIER' ? 'Suppliers' : role === 'ADMIN' ? 'Admins' : 'Other';
  return {
    name: user.name || 'User',
    meta: `${user.email || '—'} · ${role.toLowerCase()}`,
    status: user.accountStatus || 'ACTIVE',
    value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—',
    group,
  };
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await listAdminUsers();
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load users.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => users.map(toRow), [users]);
  return <AdminListWorkspace title="Users" description="Review the people and organisations with access to GreenCharge." itemLabel="User" tabs={['All users', 'Customers', 'Suppliers', 'Admins']} rows={rows} icon={Users} loading={loading} error={error} live />;
}
