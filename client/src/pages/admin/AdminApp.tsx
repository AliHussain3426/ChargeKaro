import DashboardLayout from '@/components/layout/DashboardLayout';
import type { NavItem } from '@/types';
import { LayoutDashboard, Users, Store, MapPin, Plug, CalendarCheck, BarChart3, Settings, UserCog, Bell } from 'lucide-react';

const sidebarItems: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Suppliers', href: '/admin/suppliers', icon: Store },
  { label: 'Stations', href: '/admin/stations', icon: MapPin },
  { label: 'Terminals', href: '/admin/terminals', icon: Plug },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
  { label: 'Profile & Settings', href: '/admin/profile', icon: UserCog },
  { label: 'System Settings', href: '/admin/settings', icon: Settings },
];

const mobileNavItems: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Stations', href: '/admin/stations', icon: MapPin },
  { label: 'Alerts', href: '/admin/notifications', icon: Bell },
];

const mobileDrawerItems: NavItem[] = [
  { label: 'Suppliers', href: '/admin/suppliers', icon: Store },
  { label: 'Terminals', href: '/admin/terminals', icon: Plug },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { label: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
  { label: 'Profile & Settings', href: '/admin/profile', icon: UserCog },
  { label: 'System Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminApp() {
  return (
    <DashboardLayout
      role="admin"
      sidebarItems={sidebarItems}
      mobileNavItems={mobileNavItems}
      mobileDrawerItems={mobileDrawerItems}
    />
  );
}

