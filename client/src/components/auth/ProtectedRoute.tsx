import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

const roleHomePaths: Record<UserRole, string> = {
  CUSTOMER: '/customer',
  SUPPLIER: '/supplier',
  ADMIN: '/admin',
};

export default function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="route-guard-loading" role="status" aria-live="polite">
        Checking your session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={roleHomePaths[user.role] ?? '/'} replace />;
  }

  return <>{children}</>;
}
