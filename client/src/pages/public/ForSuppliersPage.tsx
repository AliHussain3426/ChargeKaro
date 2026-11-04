import { Link } from 'react-router-dom';
import { Store, BarChart3, Users, Settings } from 'lucide-react';

const benefits = [
  { icon: Store, title: 'List Your Stations', desc: 'Add your charging stations and terminals to reach EV owners across Pakistan.' },
  { icon: Users, title: 'Receive Bookings', desc: 'Get booking requests from customers and manage them from your dashboard.' },
  { icon: BarChart3, title: 'Track Earnings', desc: 'Monitor your revenue, transaction history, and performance analytics.' },
  { icon: Settings, title: 'Manage Everything', desc: 'Configure pricing, availability, operating hours, and terminal details.' },
];

export default function ForSuppliersPage() {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground">For Charging Suppliers</h1>
          <p className="mt-4 text-foreground-secondary">
            Grow your charging business by connecting with EV owners on GreenCharge. List your
            stations, manage bookings, and track your earnings.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-[12px] bg-surface p-6 border border-border-light">
              <div className="size-10 rounded-[10px] bg-primary-light flex items-center justify-center">
                <b.icon className="size-5 text-primary" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{b.title}</h3>
              <p className="mt-2 text-sm text-foreground-secondary leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/register/supplier"
            className="inline-flex items-center justify-center rounded-[10px] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            Register as Supplier
          </Link>
        </div>
      </div>
    </div>
  );
}

