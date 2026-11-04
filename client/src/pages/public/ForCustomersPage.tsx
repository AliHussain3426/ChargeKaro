import { Link } from 'react-router-dom';
import { MapPin, Clock, Battery, Shield } from 'lucide-react';

const benefits = [
  { icon: MapPin, title: 'Station Discovery', desc: 'Find charging stations near you or anywhere along your route with our interactive map.' },
  { icon: Clock, title: 'Easy Booking', desc: 'Reserve your charging slot in advance — no more waiting at busy stations.' },
  { icon: Battery, title: 'Multiple Charger Types', desc: 'Filter by connector type, power level, and compatibility with your vehicle.' },
  { icon: Shield, title: 'Secure Payments', desc: 'Pay for charging sessions securely through the platform.' },
];

export default function ForCustomersPage() {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground">For EV Owners</h1>
          <p className="mt-4 text-foreground-secondary">
            Discover, book, and charge at stations across Pakistan. GreenCharge takes the hassle
            out of keeping your EV on the road.
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
            to="/register/customer"
            className="inline-flex items-center justify-center rounded-[10px] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            Create Customer Account
          </Link>
        </div>
      </div>
    </div>
  );
}

