import { useEffect, useRef, useState, type FocusEvent } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import type { NavItem } from '@/types';

interface DashboardLayoutProps {
  role: 'customer' | 'supplier' | 'admin';
  sidebarItems: NavItem[];
  mobileNavItems?: NavItem[];
  mobileDrawerItems?: NavItem[];
}

const roleLabels = { customer: 'Driver workspace', supplier: 'Supplier workspace', admin: 'Platform operations' };
const roleBadgeLabels = { customer: 'Driver', supplier: 'Supplier', admin: 'Admin' };

function initialsFor(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function DashboardLayout({ role, sidebarItems, mobileNavItems = [], mobileDrawerItems = [] }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const isActive = (href: string) => href === `/${role}` ? location.pathname === href : location.pathname.startsWith(href);

  useEffect(() => {
    const resetSidebarForMobile = () => {
      if (window.innerWidth <= 900) {
        setIsSidebarExpanded(false);
      } else if (window.innerWidth <= 1180) {
        setIsSidebarExpanded(false);
      }
    };

    resetSidebarForMobile();
    window.addEventListener('resize', resetSidebarForMobile);
    return () => {
      window.removeEventListener('resize', resetSidebarForMobile);
      if (collapseTimerRef.current) window.clearTimeout(collapseTimerRef.current);
    };
  }, []);

  const isDesktopRail = () => window.innerWidth > 900;

  const expandSidebar = () => {
    if (!isDesktopRail()) return;
    if (collapseTimerRef.current) window.clearTimeout(collapseTimerRef.current);
    setIsSidebarExpanded(true);
  };

  const collapseSidebar = () => {
    if (!isDesktopRail()) return;
    if (collapseTimerRef.current) window.clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = window.setTimeout(() => {
      if (!sidebarRef.current?.matches(':focus-within')) setIsSidebarExpanded(false);
    }, 140);
  };

  const handleSidebarBlur = (event: FocusEvent<HTMLElement>) => {
    const nextElement = event.relatedTarget as Node | null;
    if (!nextElement || !event.currentTarget.contains(nextElement)) collapseSidebar();
  };

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  const userInitials = initialsFor(user?.name ?? '') || (role === 'customer' ? 'AY' : role === 'supplier' ? 'GN' : 'AD');

  return (
    <div className={cn('dashboard-root', isSidebarExpanded && 'dashboard-root--sidebar-expanded')}>
      <aside ref={sidebarRef} onMouseEnter={expandSidebar} onMouseLeave={collapseSidebar} onFocus={expandSidebar} onBlur={handleSidebarBlur} className="dashboard-sidebar">
        <div className="dashboard-brand"><Link to="/" className="brand" aria-label="GreenCharge home"><span className="brand-mark"><Zap className="size-4 fill-current" /></span><span>GreenCharge</span></Link><p className="dashboard-role">{roleLabels[role]}</p><p className="dashboard-account"><span className="dashboard-account-avatar">{userInitials}</span><span className="dashboard-account-text"><strong>{user?.name ?? 'Signed out'}</strong><span className="role-badge">{roleBadgeLabels[role]}</span></span></p></div>
        <nav className="dashboard-nav" aria-label={`${role} navigation`}>
          {sidebarItems.map((item) => { const Icon = item.icon; return <Link key={item.href} to={item.href} title={item.label} aria-label={item.label} className={cn(isActive(item.href) && 'active')}>{Icon && <Icon className="size-4" />}<span>{item.label}</span>{item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}</Link>; })}
        </nav>
        <button type="button" className="dashboard-logout" onClick={handleLogout} disabled={isLoggingOut} title="Sign out" aria-label="Sign out"><LogOut className="size-4" /> <span>{isLoggingOut ? 'Signing out…' : 'Sign out'}</span></button>
      </aside>
      <div className="dashboard-canvas">
        <header className="dashboard-topbar">{mobileDrawerItems.length > 0 && <button className="mobile-drawer-trigger" type="button" onClick={() => setIsMobileDrawerOpen(true)} aria-label="Open more workspace options" aria-expanded={isMobileDrawerOpen}><Menu className="size-5" /></button>}<span className="topbar-scope">{roleLabels[role]}</span><div className="topbar-actions"><button className="topbar-icon" aria-label="View notifications"><Bell className="size-5" /></button><span className="topbar-user"><span className="topbar-user-name">{user?.name ?? 'Signed out'}</span><span className="role-badge">{roleBadgeLabels[role]}</span></span><span className="avatar">{userInitials}</span></div></header>
        <main className="dashboard-content"><div className="dashboard-content-inner"><Outlet /></div></main>
      </div>
      {mobileNavItems.length > 0 && <nav className="dashboard-bottom-nav" aria-label="Mobile navigation">{mobileNavItems.map((item) => { const Icon = item.icon; return <Link key={item.href} to={item.href} className={cn(isActive(item.href) && 'active')}>{Icon && <Icon className="size-5" />}<span>{item.label}</span></Link>; })}</nav>}
      {mobileDrawerItems.length > 0 && <>
        <button type="button" className={cn('mobile-drawer-backdrop', isMobileDrawerOpen && 'mobile-drawer-backdrop--visible')} onClick={() => setIsMobileDrawerOpen(false)} aria-label="Close more workspace options" tabIndex={isMobileDrawerOpen ? 0 : -1} />
        <aside className={cn('mobile-drawer', isMobileDrawerOpen && 'mobile-drawer--open')} aria-hidden={!isMobileDrawerOpen} aria-label="More workspace options">
          <div className="mobile-drawer-head"><div><span className="mobile-drawer-kicker">{roleLabels[role]}</span><h2>More options</h2></div><button type="button" className="mobile-drawer-close" onClick={() => setIsMobileDrawerOpen(false)} aria-label="Close more workspace options"><X className="size-5" /></button></div>
          <nav className="mobile-drawer-nav" aria-label={`${role} secondary navigation`}>
            {mobileDrawerItems.map((item) => { const Icon = item.icon; return <Link key={item.href} to={item.href} onClick={() => setIsMobileDrawerOpen(false)} className={cn(isActive(item.href) && 'active')}>{Icon && <Icon className="size-5" />}<span>{item.label}</span>{item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}</Link>; })}
          </nav>
          <button type="button" className="mobile-drawer-logout" onClick={handleLogout} disabled={isLoggingOut}><LogOut className="size-5" /><span>{isLoggingOut ? 'Signing out…' : 'Sign out'}</span></button>
        </aside>
      </>}
    </div>
  );
}
