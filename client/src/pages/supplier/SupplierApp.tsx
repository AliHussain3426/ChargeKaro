import DashboardLayout from '@/components/layout/DashboardLayout';
import type { NavItem } from '@/types';
import { LayoutDashboard, CalendarCheck, Store, Plug, DollarSign, Bell, UserCog } from 'lucide-react';

const sidebarItems: NavItem[] = [
  { label: 'Overview', href: '/supplier', icon: LayoutDashboard },
  { label: 'Booking Requests', href: '/supplier/bookings', icon: CalendarCheck },
  { label: 'My Stations', href: '/supplier/stations', icon: Store },
  { label: 'Charging Terminals', href: '/supplier/terminals', icon: Plug },
  { label: 'Earnings', href: '/supplier/earnings', icon: DollarSign },
  { label: 'Notifications', href: '/supplier/notifications', icon: Bell },
  { label: 'Profile & Settings', href: '/supplier/profile', icon: UserCog },
];

const mobileNavItems: NavItem[] = [
  { label: 'Overview', href: '/supplier', icon: LayoutDashboard },
  { label: 'Bookings', href: '/supplier/bookings', icon: CalendarCheck },
  { label: 'Stations', href: '/supplier/stations', icon: Store },
  { label: 'Alerts', href: '/supplier/notifications', icon: Bell },
];

const mobileDrawerItems: NavItem[] = [
  { label: 'Charging Terminals', href: '/supplier/terminals', icon: Plug },
  { label: 'Earnings', href: '/supplier/earnings', icon: DollarSign },
  { label: 'Profile & Settings', href: '/supplier/profile', icon: UserCog },
];

export default function SupplierApp() {
  return (
    <DashboardLayout
      role="supplier"
      sidebarItems={sidebarItems}
      mobileNavItems={mobileNavItems}
      mobileDrawerItems={mobileDrawerItems}
    />
  );
}

