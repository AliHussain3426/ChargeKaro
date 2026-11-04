import { Link } from 'react-router-dom';
import { User, Store } from 'lucide-react';

export default function RegisterSelectPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Create an Account</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Choose how you want to use GreenCharge
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/register/customer"
            className="group rounded-[12px] bg-surface border border-border-light p-6 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="size-12 rounded-[10px] bg-primary-light flex items-center justify-center group-hover:bg-primary transition-colors">
              <User className="size-6 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">EV Owner</h3>
            <p className="mt-2 text-sm text-foreground-secondary leading-relaxed">
              Find stations, book charging slots, and manage your electric vehicles.
            </p>
          </Link>

          <Link
            to="/register/supplier"
            className="group rounded-[12px] bg-surface border border-border-light p-6 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="size-12 rounded-[10px] bg-primary-light flex items-center justify-center group-hover:bg-primary transition-colors">
              <Store className="size-6 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">Station Supplier</h3>
            <p className="mt-2 text-sm text-foreground-secondary leading-relaxed">
              List your charging stations, manage bookings, and grow your business.
            </p>
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-foreground-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary-hover font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

