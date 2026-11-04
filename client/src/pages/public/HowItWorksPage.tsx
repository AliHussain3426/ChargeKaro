import { Link } from 'react-router-dom';
import { Search, CalendarCheck, Zap, CreditCard } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Discover Stations',
    description: 'Use our map to find nearby charging stations or search by location along your planned route.',
  },
  {
    icon: CalendarCheck,
    title: 'Book Your Slot',
    description: 'Check real-time availability and reserve a charging terminal at your preferred station.',
  },
  {
    icon: Zap,
    title: 'Charge Your Vehicle',
    description: 'Arrive at the station, connect your vehicle, and monitor the charging progress in the app.',
  },
  {
    icon: CreditCard,
    title: 'Pay & Go',
    description: 'Complete your payment securely when the charging session is finished.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground text-center">How It Works</h1>
        <p className="mt-4 text-foreground-secondary text-center max-w-xl mx-auto">
          GreenCharge makes EV charging simple and reliable across Pakistan. Here is how the process works.
        </p>

        <div className="mt-12 flex flex-col gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="flex gap-5 items-start">
              <div className="shrink-0 size-12 rounded-[10px] bg-primary-light flex items-center justify-center">
                <step.icon className="size-6 text-primary" />
              </div>
              <div>
                <div className="text-xs font-medium text-foreground-muted mb-1">Step {index + 1}</div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-foreground-secondary leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-[10px] bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}

