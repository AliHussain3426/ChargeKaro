import { useEffect, useRef, useState, type FocusEvent } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bell, LogOut, Menu, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

interface DashboardLayoutProps {
  role: 'customer' | 'supplier' | 'admin';
  sidebarItems: NavItem[];
  mobileNavItems?: NavItem[];
}

const roleLabels = { customer: 'Driver workspace', supplier: 'Supplier workspace', admin: 'Platform operations' };

export default function DashboardLayout({ role, sidebarItems, mobileNavItems = [] }: DashboardLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const isActive = (href: string) => href === `/${role}` ? location.pathname === href : location.pathname.startsWith(href);

  useEffect(() => {
    const resetSidebarForMobile = () => {
      if (window.innerWidth <= 900) {
        setIsSidebarExpanded(false);
        setIsMenuOpen(false);
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

  return (
    <div className={cn('dashboard-root', isSidebarExpanded && 'dashboard-root--sidebar-expanded')}>
      {isMenuOpen && <button className="fixed inset-0 z-20 bg-[#143530]/25 lg:hidden" aria-label="Close navigation" onClick={() => setIsMenuOpen(false)} />}
      <aside ref={sidebarRef} onMouseEnter={expandSidebar} onMouseLeave={collapseSidebar} onFocus={expandSidebar} onBlur={handleSidebarBlur} className={cn('dashboard-sidebar', isMenuOpen && 'dashboard-sidebar--open')}>
        <div className="dashboard-brand"><Link to="/" className="brand" aria-label="GreenCharge home"><span className="brand-mark"><Zap className="size-4 fill-current" /></span><span>GreenCharge</span></Link><p className="dashboard-role">{roleLabels[role]}</p><button onClick={() => setIsMenuOpen(false)} className="absolute right-3 top-3 p-2 text-foreground lg:hidden" aria-label="Close navigation"><X className="size-4" /></button></div>
        <nav className="dashboard-nav" aria-label={`${role} navigation`}>
          {sidebarItems.map((item) => { const Icon = item.icon; return <Link key={item.href} to={item.href} title={item.label} aria-label={item.label} className={cn(isActive(item.href) && 'active')} onClick={() => setIsMenuOpen(false)}>{Icon && <Icon className="size-4" />}<span>{item.label}</span>{item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}</Link>; })}
        </nav>
        <Link className="dashboard-logout" to="/login" title="Sign out" aria-label="Sign out"><LogOut className="size-4" /> <span>Sign out</span></Link>
      </aside>
      <div className="dashboard-canvas">
        <header className="dashboard-topbar"><button className="mobile-trigger" onClick={() => setIsMenuOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></button><span className="topbar-scope">{roleLabels[role]}</span><div className="topbar-actions"><button className="topbar-icon" aria-label="View notifications"><Bell className="size-5" /></button><span className="avatar">{role === 'customer' ? 'AY' : role === 'supplier' ? 'GN' : 'AD'}</span></div></header>
        <main className="dashboard-content"><div className="dashboard-content-inner"><Outlet /></div></main>
      </div>
      {mobileNavItems.length > 0 && <nav className="dashboard-bottom-nav" aria-label="Mobile navigation">{mobileNavItems.map((item) => { const Icon = item.icon; return <Link key={item.href} to={item.href} className={cn(isActive(item.href) && 'active')}>{Icon && <Icon className="size-5" />}<span>{item.label}</span></Link>; })}</nav>}
    </div>
  );
}
