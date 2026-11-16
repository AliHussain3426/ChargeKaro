import { useEffect, useState, type FormEvent } from 'react';
import { Building2, Check, ChevronRight, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService, type AuthProfile } from '@/services/auth';

type ProfileKind = 'customer' | 'supplier';

interface ProfileSettingsProps {
  kind: ProfileKind;
}

const profileCopy = {
  customer: {
    title: 'Profile & settings',
    description: 'Keep your driver details and charging updates ready when you need them.',
    role: 'Driver account',
    detailTitle: 'Driver details',
    nameLabel: 'Full name',
    detailCopy: 'These details appear on your booking requests and help suppliers contact you about an active charge.',
    notificationCopy: 'Choose the charging updates that should reach you.',
    helper: 'Booking confirmations, station updates, and payment reminders use this contact information.',
  },
  supplier: {
    title: 'Profile & settings',
    description: 'Manage the details customers see and the operational alerts your team receives.',
    role: 'Supplier account',
    detailTitle: 'Contact details',
    nameLabel: 'Contact name',
    detailCopy: 'Keep the primary station contact current so booking requests and service notices reach the right person.',
    notificationCopy: 'Choose which operational changes require an immediate alert.',
    helper: 'Your public station details are managed separately in My Stations.',
  },
} as const;

export default function ProfileSettings({ kind }: ProfileSettingsProps) {
  const { user, refreshUser } = useAuth();
  const content = profileCopy[kind];
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [serviceAlerts, setServiceAlerts] = useState(kind === 'supplier');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const AccountIcon = kind === 'customer' ? UserRound : Building2;

  useEffect(() => {
    let cancelled = false;
    setLoadingProfile(true);
    setError('');

    authService
      .getProfile()
      .then((data) => {
        if (cancelled) return;
        setProfile(data.profile);
        setName(data.user.name ?? '');
        setEmail(data.user.email ?? '');
        setPhone(data.user.phone ?? '');
        setBusinessName(data.profile?.businessName ?? '');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load profile.');
        if (user) {
          setName(user.name ?? '');
          setEmail(user.email ?? '');
          setPhone(user.phone ?? '');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?._id]);

  const saveChanges = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSaved(false);

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError('Name must be at least 2 characters long.');
      return;
    }
    if (kind === 'supplier' && businessName.trim().length > 0 && businessName.trim().length < 2) {
      setError('Business name must be at least 2 characters long.');
      return;
    }

    setSaving(true);
    try {
      const result = await authService.updateProfile({
        name: trimmedName,
        phone: phone.trim() || undefined,
        ...(kind === 'supplier' ? { businessName: businessName.trim() || undefined } : {}),
      });
      setProfile(result.profile);
      setName(result.user.name ?? '');
      setEmail(result.user.email ?? '');
      setPhone(result.user.phone ?? '');
      setBusinessName(result.profile?.businessName ?? '');
      await refreshUser();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (!user && loadingProfile) {
    return (
      <div className="settings-page">
        <header className="settings-title-row">
          <div>
            <h1>{content.title}</h1>
            <p>Loading your account details…</p>
          </div>
        </header>
      </div>
    );
  }

  const displayName = (name || user?.name || '—').trim() || '—';
  const displayEmail = (email || user?.email || '—').trim() || '—';
  const displayBusiness = businessName.trim() || profile?.businessName || '';

  return (
    <div className="settings-page">
      <header className="settings-title-row">
        <div>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </div>
        {saved && <span className="settings-saved"><Check className="size-4" /> Changes saved</span>}
      </header>

      <section className="settings-section settings-section--identity" aria-labelledby="account-summary-title">
        <div className="settings-section-copy">
          <p className="settings-section-kicker">Account</p>
          <h2 id="account-summary-title">Your account</h2>
          <p>{content.helper}</p>
        </div>
        <div className="settings-panel settings-profile-summary">
          <div className="settings-profile-mark"><AccountIcon className="size-5" /></div>
          <div className="settings-profile-main">
            <strong>{kind === 'supplier' && displayBusiness ? displayBusiness : displayName}</strong>
            <span>{displayEmail}</span>
            {kind === 'supplier' && displayBusiness && <span>{displayName}</span>}
          </div>
          <span className="settings-status">{content.role}</span>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="details-title">
        <div className="settings-section-copy">
          <p className="settings-section-kicker">Personal details</p>
          <h2 id="details-title">{content.detailTitle}</h2>
          <p>{content.detailCopy}</p>
        </div>
        <form className="settings-panel settings-form" onSubmit={saveChanges}>
          <div className="settings-form-grid">
            <label><span>{content.nameLabel}</span><div className="settings-input-wrap"><UserRound className="size-4" /><input aria-label={content.nameLabel} value={name} onChange={(e) => setName(e.target.value)} disabled={loadingProfile || saving} /></div></label>
            <label><span>Phone number</span><div className="settings-input-wrap"><Phone className="size-4" /><input aria-label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loadingProfile || saving} /></div></label>
            {kind === 'supplier' && (
              <label><span>Business name</span><div className="settings-input-wrap"><Building2 className="size-4" /><input aria-label="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} disabled={loadingProfile || saving} /></div></label>
            )}
          </div>
          <label><span>Email address</span><div className="settings-input-wrap"><Mail className="size-4" /><input aria-label="Email address" type="email" value={email} readOnly /></div></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="settings-form-footer"><p>Your account details are saved to your session and profile.</p><button className="settings-primary-action" type="submit" disabled={loadingProfile || saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
        </form>
      </section>

      <section className="settings-section" aria-labelledby="notifications-title">
        <div className="settings-section-copy">
          <p className="settings-section-kicker">Notifications</p>
          <h2 id="notifications-title">Stay informed</h2>
          <p>{content.notificationCopy}</p>
        </div>
        <div className="settings-panel settings-toggle-list">
          <ToggleRow title={kind === 'supplier' ? 'Booking requests' : 'Booking updates'} description={kind === 'supplier' ? 'New requests, cancellations, and customer messages.' : 'Request decisions, timing changes, and check-in reminders.'} checked={bookingAlerts} onChange={setBookingAlerts} />
          <ToggleRow title={kind === 'supplier' ? 'Station service alerts' : 'Charging reminders'} description={kind === 'supplier' ? 'Terminal availability and station service notices.' : 'Upcoming charging sessions and payment reminders.'} checked={serviceAlerts} onChange={setServiceAlerts} />
        </div>
      </section>

      <section className="settings-section settings-section--last" aria-labelledby="security-title">
        <div className="settings-section-copy">
          <p className="settings-section-kicker">Security</p>
          <h2 id="security-title">Sign-in security</h2>
          <p>Use a unique password and review your account access regularly.</p>
        </div>
        <div className="settings-panel settings-security-row"><div><span className="settings-inline-icon"><LockKeyhole className="size-4" /></span><div><strong>Password</strong><p>Last changed during account setup.</p></div></div><button className="settings-text-action" type="button">Change password <ChevronRight className="size-4" /></button></div>
      </section>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="settings-toggle-row"><div><strong>{title}</strong><p>{description}</p></div><button type="button" className={`settings-toggle ${checked ? 'is-on' : ''}`} role="switch" aria-checked={checked} aria-label={`Toggle ${title}`} onClick={() => onChange(!checked)}><span /></button></div>;
}
