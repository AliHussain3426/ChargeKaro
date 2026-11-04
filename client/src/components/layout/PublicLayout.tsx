import { Outlet, Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'For Customers', href: '/for-customers' },
  { label: 'For Suppliers', href: '/for-suppliers' },
];

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-sm">
        <div className="mx-auto max-w-[1440px] flex items-center justify-between px-4 h-16 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <Zap className="size-6" />
            <span>GreenCharge</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'text-foreground-secondary hover:text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-sm font-medium text-foreground-secondary hover:text-primary transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-[10px] bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground-secondary hover:text-foreground"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-4">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'text-sm font-medium py-2 transition-colors',
                    location.pathname === link.href
                      ? 'text-primary'
                      : 'text-foreground-secondary hover:text-primary'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium py-2 text-foreground-secondary hover:text-primary transition-colors"
              >
                Log In
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Zap className="size-5" />
              <span>GreenCharge Pakistan</span>
            </div>
            <p className="text-sm text-foreground-muted">
              © {new Date().getFullYear()} GreenCharge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

