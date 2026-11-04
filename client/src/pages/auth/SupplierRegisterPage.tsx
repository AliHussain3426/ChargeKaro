import { Link } from 'react-router-dom';

export default function SupplierRegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Supplier Registration</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Register your charging business on GreenCharge
          </p>
        </div>

        <form className="rounded-[12px] bg-surface border border-border-light p-6 sm:p-8">
          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <input id="name" type="text" placeholder="Your full name" className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="business" className="block text-sm font-medium text-foreground mb-1.5">Business Name</label>
              <input id="business" type="text" placeholder="Your company or business name" className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Business Email</label>
              <input id="email" type="email" placeholder="business@example.com" className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
              <input id="phone" type="tel" placeholder="+92 300 1234567" className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input id="password" type="password" placeholder="Create a strong password" className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
              <input id="confirm" type="password" placeholder="Re-enter your password" className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
            </div>
            <button type="submit" className="w-full rounded-[10px] bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
              Register as Supplier
            </button>
          </div>
          <p className="mt-6 text-center text-sm text-foreground-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-hover font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

