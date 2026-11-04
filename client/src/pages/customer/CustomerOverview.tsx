import { Link } from 'react-router-dom';
import { MapPin, Calendar, Car, Bell } from 'lucide-react';

const quickActions = [
  { icon: MapPin, label: 'Find Stations', href: '/customer/stations', color: 'bg-primary-light text-primary' },
  { icon: Calendar, label: 'My Bookings', href: '/customer/bookings', color: 'bg-info-light text-info' },
  { icon: Car, label: 'My Vehicles', href: '/customer/vehicles', color: 'bg-success-light text-success' },
  { icon: Bell, label: 'Notifications', href: '/customer/notifications', color: 'bg-warning-light text-warning' },
];

export default function CustomerOverview() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-foreground-secondary">Welcome back! Here is your charging overview.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="rounded-[12px] bg-surface border border-border-light p-4 hover:shadow-md transition-all group"
          >
            <div className={`size-10 rounded-[10px] ${action.color} flex items-center justify-center`}>
              <action.icon className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              {action.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Stats placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: '—' },
          { label: 'Active Bookings', value: '—' },
          { label: 'Registered Vehicles', value: '—' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[12px] bg-surface border border-border-light p-5">
            <p className="text-sm text-foreground-secondary">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity placeholder */}
      <div className="rounded-[12px] bg-surface border border-border-light p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Calendar className="size-10 text-foreground-muted/40 mb-3" />
          <p className="text-sm text-foreground-muted">No recent activity yet.</p>
          <p className="text-xs text-foreground-muted mt-1">Your booking history will appear here.</p>
        </div>
      </div>
    </div>
  );
}

