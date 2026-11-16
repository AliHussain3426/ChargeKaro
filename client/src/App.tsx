import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';

// Auth
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Layouts
import PublicLayout from '@/components/layout/PublicLayout';

// Public pages
import LandingPage from '@/pages/public/LandingPage';
import NotFoundPage from '@/pages/public/NotFoundPage';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterSelectPage from '@/pages/auth/RegisterSelectPage';
import CustomerRegisterPage from '@/pages/auth/CustomerRegisterPage';
import SupplierRegisterPage from '@/pages/auth/SupplierRegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// Dashboard shells
import CustomerApp from '@/pages/customer/CustomerApp';
import SupplierApp from '@/pages/supplier/SupplierApp';
import AdminApp from '@/pages/admin/AdminApp';

// Customer pages
import CustomerOverview from '@/pages/customer/CustomerOverview';
import FindStationsPage from '@/pages/customer/FindStationsPage';
import MyBookingsPage from '@/pages/customer/MyBookingsPage';
import MyVehiclesPage from '@/pages/customer/MyVehiclesPage';
import CustomerNotificationsPage from '@/pages/customer/CustomerNotificationsPage';
import CustomerProfilePage from '@/pages/customer/CustomerProfilePage';

// Supplier pages
import SupplierOverview from '@/pages/supplier/SupplierOverview';
import BookingRequestsPage from '@/pages/supplier/BookingRequestsPage';
import MyStationsPage from '@/pages/supplier/MyStationsPage';
import ChargingTerminalsPage from '@/pages/supplier/ChargingTerminalsPage';
import EarningsPage from '@/pages/supplier/EarningsPage';
import SupplierNotificationsPage from '@/pages/supplier/SupplierNotificationsPage';
import SupplierProfilePage from '@/pages/supplier/SupplierProfilePage';

// Admin pages
import AdminOverview from '@/pages/admin/AdminOverview';
import ManageUsersPage from '@/pages/admin/ManageUsersPage';
import ManageSuppliersPage from '@/pages/admin/ManageSuppliersPage';
import ManageStationsPage from '@/pages/admin/ManageStationsPage';
import ManageTerminalsPage from '@/pages/admin/ManageTerminalsPage';
import ManageBookingsPage from '@/pages/admin/ManageBookingsPage';
import AdminReportsPage from '@/pages/admin/AdminReportsPage';
import SystemSettingsPage from '@/pages/admin/SystemSettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* ── Public routes ── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/how-it-works" element={<Navigate to="/#how-it-works" replace />} />
            <Route path="/for-customers" element={<Navigate to="/#for-customers" replace />} />
            <Route path="/for-suppliers" element={<Navigate to="/#for-suppliers" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterSelectPage />} />
            <Route path="/register/customer" element={<CustomerRegisterPage />} />
            <Route path="/register/supplier" element={<SupplierRegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* ── Customer routes (driver accounts only) ── */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute roles={['CUSTOMER']}>
                <CustomerApp />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerOverview />} />
            <Route path="stations" element={<FindStationsPage />} />
            <Route path="bookings" element={<MyBookingsPage />} />
            <Route path="vehicles" element={<MyVehiclesPage />} />
            <Route path="notifications" element={<CustomerNotificationsPage />} />
            <Route path="profile" element={<CustomerProfilePage />} />
          </Route>

          {/* ── Supplier routes (supplier accounts only) ── */}
          <Route
            path="/supplier"
            element={
              <ProtectedRoute roles={['SUPPLIER']}>
                <SupplierApp />
              </ProtectedRoute>
            }
          >
            <Route index element={<SupplierOverview />} />
            <Route path="bookings" element={<BookingRequestsPage />} />
            <Route path="stations" element={<MyStationsPage />} />
            <Route path="terminals" element={<ChargingTerminalsPage />} />
            <Route path="earnings" element={<EarningsPage />} />
            <Route path="notifications" element={<SupplierNotificationsPage />} />
            <Route path="profile" element={<SupplierProfilePage />} />
          </Route>

          {/* ── Admin routes (super admin accounts only) ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <AdminApp />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="suppliers" element={<ManageSuppliersPage />} />
            <Route path="stations" element={<ManageStationsPage />} />
            <Route path="terminals" element={<ManageTerminalsPage />} />
            <Route path="bookings" element={<ManageBookingsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="settings" element={<SystemSettingsPage />} />
          </Route>

          {/* ── 404 ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
