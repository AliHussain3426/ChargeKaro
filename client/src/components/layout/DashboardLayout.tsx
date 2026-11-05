import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bell, ChevronLeft, ChevronRight, LogOut, Menu, X, Zap } from 'lucide-react';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isActive = (href: string) => href === `/${role}` ? location.pathname === href : location.pathname.startsWith(href);

  useEffect(() => {
    const syncSidebarWidth = () => {
      if (window.innerWidth <= 900) {
        setIsSidebarCollapsed(false);
        setIsMenuOpen(false);
      } else if (window.innerWidth <= 1180) {
        setIsSidebarCollapsed(true);
      }
    };

    syncSidebarWidth();
    window.addEventListener('resize', syncSidebarWidth);
    return () => window.removeEventListener('resize', syncSidebarWidth);
  }, []);

  return (
    <div className={cn('dashboard-root', isSidebarCollapsed && 'dashboard-root--sidebar-collapsed')}>
      {isMenuOpen && <button className="fixed inset-0 z-20 bg-[#143530]/25 lg:hidden" aria-label="Close navigation" onClick={() => setIsMenuOpen(false)} />}
      <aside className={cn('dashboard-sidebar transition-transform duration-200', isMenuOpen ? 'translate-x-0 shadow-xl' : '')}>
        <div className="dashboard-brand"><Link to="/" className="brand" aria-label="GreenCharge home"><span className="brand-mark"><Zap className="size-4 fill-current" /></span><span>GreenCharge</span></Link><button type="button" onClick={() => setIsSidebarCollapsed((isCollapsed) => !isCollapsed)} className="sidebar-toggle" aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-pressed={isSidebarCollapsed}>{isSidebarCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}</button><p className="dashboard-role">{roleLabels[role]}</p><button onClick={() => setIsMenuOpen(false)} className="absolute right-3 top-3 p-2 text-foreground lg:hidden" aria-label="Close navigation"><X className="size-4" /></button></div>
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
