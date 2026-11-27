import { useEffect, useRef, useState, type FocusEvent } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, CalendarCheck, CheckCircle2, CircleDollarSign, Home, LogOut, Menu, Moon, Sun, User, UserCircle, X, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import BrandLogo from '@/components/ui/BrandLogo';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import type { NavItem } from '@/types';
import { listNotifications, markAllNotificationsRead, markNotificationRead, type NotificationItem } from '@/services/notifications';
import './public-layout.css';

interface DashboardLayoutProps {
  role: 'customer' | 'supplier' | 'admin';
  sidebarItems: NavItem[];
  mobileNavItems?: NavItem[];
  mobileDrawerItems?: NavItem[];
}

const roleLabels = { customer: 'Driver workspace', supplier: 'Supplier workspace', admin: 'Platform operations' };
const profileHrefByRole = {
  customer: '/customer/profile',
  supplier: '/supplier/profile',
  admin: '/admin/profile',
} as const;
const notificationsHrefByRole = {
  customer: '/customer/notifications',
  supplier: '/supplier/notifications',
  admin: '/admin/notifications',
} as const;

function notificationIconFor(type: string) {
  if (type.includes('PAYMENT')) return type === 'PAYMENT_SUCCESS' ? CheckCircle2 : CircleDollarSign;
  if (type === 'BOOKING_REJECTED' || type === 'BOOKING_CANCELLED') return XCircle;
  return CalendarCheck;
}

function notificationTimeLabel(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function DashboardLayout({ role, sidebarItems, mobileNavItems = [], mobileDrawerItems = [] }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notificationItems, setNotificationItems] = useState<NotificationItem[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const isActive = (href: string) => href === `/${role}` ? location.pathname === href : location.pathname.startsWith(href);

  const profileHref = profileHrefByRole[role];
  const notificationsHref = notificationsHrefByRole[role];
  const hasNotificationsPage = true;
  const unreadNotifications = notificationItems.filter((item) => !item.readAt).length;

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

  useEffect(() => {
    if (!hasNotificationsPage) {
      setNotificationItems([]);
      return;
    }
    let cancelled = false;
    const loadNotifications = async () => {
      setNotificationsLoading(true);
      try {
        const items = await listNotifications();
        if (!cancelled) setNotificationItems(items);
      } catch {
        if (!cancelled) setNotificationItems([]);
      } finally {
        if (!cancelled) setNotificationsLoading(false);
      }
    };
    void loadNotifications();
    return () => { cancelled = true; };
  }, [hasNotificationsPage, location.pathname]);

  useEffect(() => { setProfileOpen(false); setNotificationsOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!profileOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
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

  useEffect(() => {
    if (!notificationsOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setNotificationsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [notificationsOpen]);

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

  async function refreshNotifications() {
    if (!hasNotificationsPage) return;
    setNotificationsLoading(true);
    try {
      setNotificationItems(await listNotifications());
    } catch {
      setNotificationItems([]);
    } finally {
      setNotificationsLoading(false);
    }
  }

  async function handleNotificationToggle() {
    if (!hasNotificationsPage) {
      navigate(notificationsHref);
      return;
    }
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);
    if (nextOpen) void refreshNotifications();
  }

  async function handleNotificationRead(id: string) {
    try {
      const updated = await markNotificationRead(id);
      setNotificationItems((current) => current.map((item) => (item._id === id ? updated : item)));
    } catch {
      // Keep preview usable even if mark-read fails; full page shows errors.
    }
  }

  async function handleNotificationsMarkAll() {
    try {
      await markAllNotificationsRead();
      setNotificationItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
    } catch {
      // Keep preview usable; full page handles explicit error messaging.
    }
  }

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      setProfileOpen(false);
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className={cn('dashboard-root', isSidebarExpanded && 'dashboard-root--sidebar-expanded')}>
      <aside ref={sidebarRef} onMouseEnter={expandSidebar} onMouseLeave={collapseSidebar} onFocus={expandSidebar} onBlur={handleSidebarBlur} className="dashboard-sidebar">
        <div className="dashboard-brand"><Link to="/" className="brand" aria-label="ChargeKaro home"><BrandLogo /><span>ChargeKaro</span></Link><p className="dashboard-role">{roleLabels[role]}</p></div>
        <nav className="dashboard-nav" aria-label={`${role} navigation`}>
          {sidebarItems.map((item) => { const Icon = item.icon; return <Link key={item.href} to={item.href} title={item.label} aria-label={item.label} className={cn(isActive(item.href) && 'active')}>{Icon && <Icon className="size-4" />}<span>{item.label}</span>{item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}</Link>; })}
        </nav>
      </aside>
      <div className="dashboard-canvas">
        <header className="dashboard-topbar">
          {mobileDrawerItems.length > 0 && <button className="mobile-drawer-trigger" type="button" onClick={() => setIsMobileDrawerOpen(true)} aria-label="Open more workspace options" aria-expanded={isMobileDrawerOpen}><Menu className="size-5" /></button>}
          <span className="topbar-scope">{roleLabels[role]}</span>
          <div className="topbar-actions">
            <button type="button" className="topbar-icon" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}</button>
            <div className="dashboard-notifications" ref={notificationsRef}>
              <button
                type="button"
                className="topbar-icon dashboard-notifications-trigger"
                onClick={() => void handleNotificationToggle()}
                aria-label="Open notifications"
                aria-haspopup={hasNotificationsPage ? 'dialog' : undefined}
                aria-expanded={hasNotificationsPage ? notificationsOpen : undefined}
                title="Notifications"
              >
                <Bell className="size-5" />
                {unreadNotifications > 0 && <span className="nav-badge dashboard-notifications-badge">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>}
              </button>
              {hasNotificationsPage && notificationsOpen && (
                <div className="dashboard-notifications-modal site-profile-modal" role="dialog" aria-label="Notifications" data-open="true">
                  <div className="dashboard-notifications-head">
                    <div>
                      <p className="site-profile-name">Notifications</p>
                      <p className="site-profile-email">{unreadNotifications > 0 ? `${unreadNotifications} unread` : 'You are all caught up'}</p>
                    </div>
                    {unreadNotifications > 0 && (
                      <button type="button" className="workspace-text-button dashboard-notifications-mark-all" onClick={() => void handleNotificationsMarkAll()}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="dashboard-notifications-list">
                    {notificationsLoading ? (
                      <p className="dashboard-notifications-state">Loading notifications…</p>
                    ) : notificationItems.length === 0 ? (
                      <p className="dashboard-notifications-state">No notifications yet.</p>
                    ) : (
                      notificationItems.slice(0, 5).map((item) => {
                        const Icon = notificationIconFor(item.type);
                        return (
                          <button
                            key={item._id}
                            type="button"
                            className={cn('dashboard-notification-item', !item.readAt && 'dashboard-notification-item--unread')}
                            onClick={() => { if (!item.readAt) void handleNotificationRead(item._id); }}
                          >
                            <span className="dashboard-notification-icon"><Icon className="size-4" /></span>
                            <span className="dashboard-notification-body">
                              <strong>{item.title}</strong>
                              <span>{item.message}</span>
                              <small>{notificationTimeLabel(item.createdAt)}</small>
                            </span>
                            {!item.readAt && <span className="dashboard-notification-dot" aria-hidden="true" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                  <Link to={notificationsHref} className="gc-button gc-button-primary dashboard-notifications-more" onClick={() => setNotificationsOpen(false)}>
                    Show more
                  </Link>
                </div>
              )}
            </div>

            <div className="site-profile dashboard-profile" ref={profileRef}>
              <button
                type="button"
                className="site-profile-trigger dashboard-profile-trigger"
                onClick={() => setProfileOpen((open) => !open)}
                aria-haspopup="dialog"
                aria-expanded={profileOpen}
                aria-label="Open account menu"
                title="Account"
              >
                <span className="site-profile-avatar dashboard-profile-avatar">
                  {user?.avatar ? <img src={user.avatar} alt={`${user.name} profile`} className="site-profile-avatar-img" /> : <User className="size-4" />}
                </span>
              </button>
              {profileOpen && (
                <div className="site-profile-modal dashboard-profile-modal" role="dialog" aria-label="Account menu">
                  <div className="site-profile-modal-head">
                    <span className="site-profile-avatar site-profile-avatar--lg dashboard-profile-avatar">
                      {user?.avatar ? <img src={user.avatar} alt={`${user.name} profile`} className="site-profile-avatar-img" /> : <User className="size-5" />}
                    </span>
                    <div>
                      <p className="site-profile-name">{user?.name}</p>
                      <p className="site-profile-email">{user?.email}</p>
                    </div>
                  </div>
                  <p className="site-profile-role">{roleLabels[role]}</p>
                  <Link to="/" className="gc-button gc-button-primary site-profile-action" onClick={() => setProfileOpen(false)}>
                    <Home className="size-4" /> Go to Home
                  </Link>
                  <Link to={profileHref} className="site-profile-secondary dashboard-profile-link" onClick={() => setProfileOpen(false)}>
                    <UserCircle className="size-4" /> Profile &amp; Settings
                  </Link>
                  <button type="button" className="site-profile-secondary" onClick={handleLogout} disabled={isLoggingOut}>
                    <LogOut className="size-4" /> {isLoggingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
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
        </aside>
      </>}
    </div>
  );
}
