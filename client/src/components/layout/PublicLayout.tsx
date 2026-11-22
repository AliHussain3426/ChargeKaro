import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, LayoutDashboard, LogOut, Mail, Menu, Moon, Sun, User, X, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import type { UserRole } from '@/types';
import './public-layout.css';

const navLinks = [
  { label: 'Home', href: '/', hash: '' },
  { label: 'How It Works', href: '/#how-it-works', hash: '#how-it-works' },
  { label: 'About / Helpline', href: '/#about-help', hash: '#about-help' },
];

const copyrightYear = new Date().getFullYear();

const dashboardPathByRole: Record<UserRole, string> = {
  CUSTOMER: '/customer',
  SUPPLIER: '/supplier',
  ADMIN: '/admin',
};

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, loading, logout } = useAuth();
  const isAuthRoute = location.pathname === '/login'
    || location.pathname === '/forgot-password'
    || location.pathname.startsWith('/register');
  const isNavActive = (hash: string) => location.pathname === '/' && location.hash === hash;
  const dashboardPath = user ? dashboardPathByRole[user.role] : '/login';

  useEffect(() => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProfileOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [profileOpen]);

  async function handleGoToDashboard() {
    setProfileOpen(false);
    navigate(dashboardPath);
  }

  async function handleLogout() {
    setProfileOpen(false);
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div className={cn('site-shell flex flex-col', isAuthRoute && 'site-shell--auth')}>
      {!isAuthRoute && <header className="site-header sticky top-0 z-40">
        <div className="site-header-inner">
          <Link to="/" className="brand" aria-label="ChargeKaro home">
            <span className="brand-mark"><Zap className="size-4 fill-current" /></span>
            <span>ChargeKaro</span><span className="brand-suffix">Pakistan</span>
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
            <button
              type="button"
              onClick={toggleTheme}
              className="site-login site-theme-toggle"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>

            {!loading && user ? (
              <div className="site-profile" ref={profileRef}>
                <button
                  type="button"
                  className="site-profile-trigger"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-haspopup="dialog"
                  aria-expanded={profileOpen}
                  aria-label="Open account menu"
                  title="Account"
                >
                  <span className="site-profile-avatar">{user.avatar ? <img src={user.avatar} alt={`${user.name} profile`} className="site-profile-avatar-img" /> : <User className="size-4" />}</span>
                </button>
                {profileOpen && (
                  <div className="site-profile-modal" role="dialog" aria-label="Account menu">
                    <div className="site-profile-modal-head">
                      <span className="site-profile-avatar site-profile-avatar--lg">{user.avatar ? <img src={user.avatar} alt={`${user.name} profile`} className="site-profile-avatar-img" /> : <User className="size-5" />}</span>
                      <div>
                        <p className="site-profile-name">{user.name}</p>
                        <p className="site-profile-email">{user.email}</p>
                      </div>
                    </div>
                    <p className="site-profile-role">{user.role === 'CUSTOMER' ? 'Driver account' : user.role === 'SUPPLIER' ? 'Supplier account' : 'Admin account'}</p>
                    <button type="button" className="gc-button gc-button-primary site-profile-action" onClick={handleGoToDashboard}>
                      <LayoutDashboard className="size-4" /> Go to Dashboard
                    </button>
                    <button type="button" className="site-profile-secondary" onClick={handleLogout}>
                      <LogOut className="size-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : !loading ? (
              <>
                <Link to="/login" className="site-login">
                  Log In
                </Link>
                <Link to="/register" className="gc-button gc-button-primary">
                  Get Started
                </Link>
              </>
            ) : null}

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
              {!loading && user ? (
                <>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); navigate(dashboardPath); }} className="block w-full py-2 text-left text-foreground-secondary transition-colors hover:text-primary">
                    Go to Dashboard
                  </button>
                  <button type="button" onClick={() => { setMobileMenuOpen(false); void handleLogout(); }} className="block w-full py-2 text-left text-foreground-secondary transition-colors hover:text-primary">
                    Sign out
                  </button>
                </>
              ) : !loading ? (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-foreground-secondary hover:text-primary transition-colors"
                >
                  Log In
                </Link>
              ) : null}
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
              <p className="footer-kicker">ChargeKaro Pakistan</p>
              <h2 id="footer-cta-title">Your next charging stop should feel certain.</h2>
              <p>Create an account to find charging stations or list your charging services on the network.</p>
            </div>
            <div className="footer-cta-actions">
              <Link to="/register/customer" className="footer-primary-action">Find a charger <ArrowUpRight className="size-4" /></Link>
              <Link to="/register/supplier" className="footer-secondary-action">List a station</Link>
            </div>
          </section>

          <div className="footer-columns">
            <div className="footer-brand-column">
              <Link to="/" className="brand footer-brand" aria-label="ChargeKaro home">
                <span className="brand-mark"><Zap className="size-4 fill-current" /></span>
                <span>ChargeKaro</span><span className="brand-suffix">Pakistan</span>
              </Link>
              <p>Clearer charging decisions for EV users and charging operators.</p>
              <a className="footer-mail" href="mailto:support@chargekaro.pk"><Mail className="size-4" /> support@chargekaro.pk</a>
            </div>
            <nav aria-label="Explore ChargeKaro">
              <p className="footer-column-title">Explore</p>
              <Link to="/">Home</Link>
              <Link to="/#how-it-works">How it works</Link>
              <Link to="/#about-help">About / Helpline</Link>
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
            <span>© {copyrightYear} ChargeKaro Pakistan</span>
            <span>EV charging, made straightforward.</span>
          </div>
        </div>
      </footer>
      }
    </div>
  );
}

