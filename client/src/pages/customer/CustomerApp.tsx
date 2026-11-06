import DashboardLayout from '@/components/layout/DashboardLayout';
import type { NavItem } from '@/types';
import { LayoutDashboard, MapPin, Calendar, Car, Bell, UserCog } from 'lucide-react';

const sidebarItems: NavItem[] = [
  { label: 'Overview', href: '/customer', icon: LayoutDashboard },
  { label: 'Find Stations', href: '/customer/stations', icon: MapPin },
  { label: 'My Bookings', href: '/customer/bookings', icon: Calendar },
  { label: 'My Vehicles', href: '/customer/vehicles', icon: Car },
  { label: 'Notifications', href: '/customer/notifications', icon: Bell },
  { label: 'Profile & Settings', href: '/customer/profile', icon: UserCog },
];

const mobileNavItems: NavItem[] = [
  { label: 'Home', href: '/customer', icon: LayoutDashboard },
  { label: 'Explore', href: '/customer/stations', icon: MapPin },
  { label: 'Bookings', href: '/customer/bookings', icon: Calendar },
  { label: 'Alerts', href: '/customer/notifications', icon: Bell },
];

const mobileDrawerItems: NavItem[] = [
  { label: 'My Vehicles', href: '/customer/vehicles', icon: Car },
  { label: 'Profile & Settings', href: '/customer/profile', icon: UserCog },
];

export default function CustomerApp() {
  return (
    <DashboardLayout
      role="customer"
      sidebarItems={sidebarItems}
      mobileNavItems={mobileNavItems}
      mobileDrawerItems={mobileDrawerItems}
    />
  );
}

