import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Enter your email address and we'll send you a reset link.
          </p>
        </div>

        <form className="rounded-[12px] bg-surface border border-border-light p-6 sm:p-8">
          <div className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <input id="email" type="email" placeholder="you@example.com" className="w-full rounded-[8px] border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent" />
            </div>
            <button type="submit" className="w-full rounded-[10px] bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
              Send Reset Link
            </button>
          </div>
          <p className="mt-6 text-center text-sm text-foreground-muted">
            Remember your password?{' '}
            <Link to="/login" className="text-primary hover:text-primary-hover font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

