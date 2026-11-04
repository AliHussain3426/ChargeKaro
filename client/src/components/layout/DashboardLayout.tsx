import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Zap, Menu, X, LogOut, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavItem } from '@/types';

interface DashboardLayoutProps {
  role: 'customer' | 'supplier' | 'admin';
  sidebarItems: NavItem[];
  mobileNavItems?: NavItem[];
}

export default function DashboardLayout({ role, sidebarItems, mobileNavItems }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const roleLabel = role === 'customer' ? 'Customer' : role === 'supplier' ? 'Supplier' : 'Admin';

  const isActive = (href: string) => {
    if (href === `/${role}`) return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-5">
          <Zap className="size-5 text-primary shrink-0" />
          <span className="font-bold text-primary">GreenCharge</span>
          <span className="ml-auto rounded-[8px] bg-primary-light px-2 py-0.5 text-xs font-medium text-primary">
            {roleLabel}
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-2 lg:hidden text-foreground-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Sidebar nav */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="flex flex-col gap-1">
            {sidebarItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground-secondary hover:bg-surface-elevated hover:text-foreground'
                    )}
                  >
                    {Icon && <Icon className="size-4 shrink-0" />}
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={cn(
                        'ml-auto rounded-full px-2 py-0.5 text-xs font-medium',
                        active
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-danger text-white'
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-border p-3">
          <Link
            to="/login"
            className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-foreground-secondary hover:bg-surface-elevated hover:text-danger transition-colors"
          >
            <LogOut className="size-4" />
            Log Out
          </Link>
        </div>
      </aside>

      {/* Main content area */}
      <div className={cn('transition-all duration-200', 'lg:pl-64')}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/90 backdrop-blur-sm px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-foreground-muted hover:text-foreground"
          >
            <Menu className="size-5" />
          </button>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative rounded-[8px] p-2 text-foreground-muted hover:text-foreground hover:bg-surface-elevated transition-colors">
              <Bell className="size-5" />
              <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger" />
            </button>
            <div className="size-8 rounded-full bg-primary-light flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">U</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="mx-auto max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {mobileNavItems && mobileNavItems.length > 0 && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface lg:hidden">
          <div className="flex items-center justify-around h-16 px-2">
            {mobileNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-[8px] px-3 py-1.5 min-w-[64px] transition-colors',
                    active ? 'text-primary' : 'text-foreground-muted'
                  )}
                >
                  {Icon && <Icon className="size-5" />}
                  <span className="text-[11px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

