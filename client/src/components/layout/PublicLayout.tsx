import { Outlet, Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Mail, Zap, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import './public-layout.css';

const navLinks = [
  { label: 'Home', href: '/', hash: '' },
  { label: 'How It Works', href: '/#how-it-works', hash: '#how-it-works' },
  { label: 'For Customers', href: '/#for-customers', hash: '#for-customers' },
  { label: 'For Suppliers', href: '/#for-suppliers', hash: '#for-suppliers' },
];

const copyrightYear = new Date().getFullYear();

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login'
    || location.pathname === '/forgot-password'
    || location.pathname.startsWith('/register');
  const isNavActive = (hash: string) => location.pathname === '/' && location.hash === hash;

  return (
    <div className={cn('site-shell flex flex-col', isAuthRoute && 'site-shell--auth')}>
      {!isAuthRoute && <header className="site-header sticky top-0 z-40">
        <div className="site-header-inner">
          <Link to="/" className="brand" aria-label="GreenCharge home">
            <span className="brand-mark"><Zap className="size-4 fill-current" /></span>
            <span>GreenCharge</span><span className="brand-suffix">Pakistan</span>
          </Link>

          {/* Desktop nav */}
          <nav className="site-nav" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                aria-current={isNavActive(link.hash) ? 'page' : undefined}
                className={cn(
                  'transition-colors',
                  isNavActive(link.hash)
                    ? 'text-primary'
                    : 'text-foreground-secondary hover:text-primary'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="site-actions site-glass-actions">
            <Link
              to="/login"
              className="site-login"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="gc-button gc-button-primary"
            >
              Get Started
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="site-menu"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="mobile-nav">
            <nav>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  aria-current={isNavActive(link.hash) ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'block py-2 transition-colors',
                    isNavActive(link.hash)
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
                className="block py-2 text-foreground-secondary hover:text-primary transition-colors"
              >
                Log In
              </Link>
            </nav>
          </div>
        )}
      </header>
      }

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {!isAuthRoute && <footer className="site-footer">
        <div className="gc-container">
          <section className="footer-cta" aria-labelledby="footer-cta-title">
            <div>
              <p className="footer-kicker">GreenCharge Pakistan</p>
              <h2 id="footer-cta-title">Your next charging stop should feel certain.</h2>
              <p>Start with a driver account, or bring your charging stations into the network.</p>
            </div>
            <div className="footer-cta-actions">
              <Link to="/register/customer" className="footer-primary-action">Find a charger <ArrowUpRight className="size-4" /></Link>
              <Link to="/register/supplier" className="footer-secondary-action">List a station</Link>
            </div>
          </section>

          <div className="footer-columns">
            <div className="footer-brand-column">
              <Link to="/" className="brand footer-brand" aria-label="GreenCharge home">
                <span className="brand-mark"><Zap className="size-4 fill-current" /></span>
                <span>GreenCharge</span><span className="brand-suffix">Pakistan</span>
              </Link>
              <p>Clearer charging decisions for drivers and charging operators.</p>
              <a className="footer-mail" href="mailto:support@greencharge.pk"><Mail className="size-4" /> support@greencharge.pk</a>
            </div>
            <nav aria-label="Explore GreenCharge">
              <p className="footer-column-title">Explore</p>
              <Link to="/">Home</Link>
              <Link to="/#how-it-works">How it works</Link>
              <Link to="/#for-customers">For EV drivers</Link>
              <Link to="/#for-suppliers">For station operators</Link>
            </nav>
            <nav aria-label="Account links">
              <p className="footer-column-title">Account</p>
              <Link to="/register">Create an account</Link>
              <Link to="/login">Sign in</Link>
              <Link to="/demo">Preview workspaces</Link>
              <Link to="/forgot-password">Reset password</Link>
            </nav>
            <div className="footer-status">
              <p className="footer-column-title">The network</p>
              <p><span className="footer-status-dot" /> Built for Pakistan&apos;s growing EV community.</p>
              <span>Station discovery, reservation management, and operator tools — in one product.</span>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {copyrightYear} GreenCharge Pakistan</span>
            <span>EV charging, made straightforward.</span>
          </div>
        </div>
      </footer>
      }
    </div>
  );
}

