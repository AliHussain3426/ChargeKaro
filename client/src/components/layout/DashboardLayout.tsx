import { useState } from 'react';
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
  const location = useLocation();
  const isActive = (href: string) => href === `/${role}` ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <div className="dashboard-root">
      {isMenuOpen && <button className="fixed inset-0 z-20 bg-[#143530]/25 lg:hidden" aria-label="Close navigation" onClick={() => setIsMenuOpen(false)} />}
      <aside className={cn('dashboard-sidebar transition-transform duration-200', isMenuOpen ? 'translate-x-0 shadow-xl' : '')}>
        <div className="dashboard-brand"><Link to="/" className="brand"><span className="brand-mark"><Zap className="size-4 fill-current" /></span><span>GreenCharge</span></Link><p className="dashboard-role">{roleLabels[role]}</p><button onClick={() => setIsMenuOpen(false)} className="absolute right-3 top-3 p-2 text-foreground lg:hidden" aria-label="Close navigation"><X className="size-4" /></button></div>
        <nav className="dashboard-nav" aria-label={`${role} navigation`}>
          {sidebarItems.map((item) => { const Icon = item.icon; return <Link key={item.href} to={item.href} className={cn(isActive(item.href) && 'active')} onClick={() => setIsMenuOpen(false)}>{Icon && <Icon className="size-4" />}<span>{item.label}</span>{item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}</Link>; })}
        </nav>
        <Link className="dashboard-logout" to="/login"><LogOut className="size-4" /> Sign out</Link>
      </aside>
      <div className="dashboard-canvas">
        <header className="dashboard-topbar"><button className="mobile-trigger" onClick={() => setIsMenuOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></button><span className="topbar-scope">{roleLabels[role]}</span><div className="topbar-actions"><button className="topbar-icon" aria-label="View notifications"><Bell className="size-5" /></button><span className="avatar">{role === 'customer' ? 'AY' : role === 'supplier' ? 'GN' : 'AD'}</span></div></header>
        <main className="dashboard-content"><div className="dashboard-content-inner"><Outlet /></div></main>
      </div>
      {mobileNavItems.length > 0 && <nav className="dashboard-bottom-nav" aria-label="Mobile navigation">{mobileNavItems.map((item) => { const Icon = item.icon; return <Link key={item.href} to={item.href} className={cn(isActive(item.href) && 'active')}>{Icon && <Icon className="size-5" />}<span>{item.label}</span></Link>; })}</nav>}
    </div>
  );
}
