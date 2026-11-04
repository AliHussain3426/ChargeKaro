import { Link } from 'react-router-dom';
import { Zap, MapPin, Calendar, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px] text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Find & Book EV Charging
            <br />
            <span className="text-primary">Across Pakistan</span>
          </h1>
          <p className="mt-5 text-lg text-foreground-secondary max-w-2xl mx-auto">
            Discover charging stations near you, book your slot, and charge your EV with
            confidence. Join Pakistan's growing electric vehicle community.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register/customer"
              className="inline-flex items-center justify-center rounded-[10px] bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary-hover transition-colors w-full sm:w-auto"
            >
              Start Charging
            </Link>
            <Link
              to="/for-suppliers"
              className="inline-flex items-center justify-center rounded-[10px] border border-border bg-surface px-6 py-3 text-base font-medium text-foreground hover:bg-surface-elevated transition-colors w-full sm:w-auto"
            >
              List Your Station
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="mx-auto max-w-[1440px]">
          <h2 className="text-2xl font-bold text-foreground text-center">
            How GreenCharge Works
          </h2>
          <p className="mt-3 text-foreground-secondary text-center max-w-xl mx-auto">
            Three simple steps to charge your electric vehicle anywhere in Pakistan.
          </p>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin, title: 'Find Stations', desc: 'Discover charging stations near your location or along your route.' },
              { icon: Calendar, title: 'Book a Slot', desc: 'Reserve your charging terminal in advance to skip the wait.' },
              { icon: Zap, title: 'Charge Up', desc: 'Arrive at the station, plug in, and charge your vehicle.' },
              { icon: Shield, title: 'Pay Securely', desc: 'Complete your payment securely through the platform.' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-[12px] bg-background p-6 border border-border-light"
              >
                <div className="size-10 rounded-[10px] bg-primary-light flex items-center justify-center">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-foreground-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="rounded-[14px] bg-primary p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground">
              Ready to go electric?
            </h2>
            <p className="mt-3 text-primary-foreground/80 max-w-lg mx-auto">
              Join thousands of EV owners and charging station suppliers on GreenCharge.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-[10px] bg-primary-foreground text-primary px-6 py-3 text-sm font-medium hover:bg-primary-foreground/90 transition-colors w-full sm:w-auto"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

