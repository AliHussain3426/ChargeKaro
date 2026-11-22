import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Building2, Camera, Check, ChevronRight, LockKeyhole, Mail, Phone, Trash2, UserRound, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService, type AuthProfile } from '@/services/auth';

type ProfileKind = 'customer' | 'supplier' | 'admin';

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
  admin: {
    title: 'Profile & settings',
    description: 'Manage your administrator account details, profile photo, and password.',
    role: 'Admin account',
    detailTitle: 'Account details',
    nameLabel: 'Full name',
    detailCopy: 'Keep your administrator contact details up to date for platform operations and account security.',
    notificationCopy: 'Choose the platform updates you want to receive.',
    helper: 'Your email is read-only. Profile photo and password can be managed here.',
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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageDirty, setImageDirty] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const AccountIcon = kind === 'supplier' ? Building2 : UserRound;

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
        setProfileImage(data.profile?.profileImage ?? null);
        setImageDirty(false);
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
        ...(imageDirty ? { profileImage: profileImage } : {}),
        ...(kind === 'supplier' ? { businessName: businessName.trim() || undefined } : {}),
      });
      setProfile(result.profile);
      setName(result.user.name ?? '');
      setEmail(result.user.email ?? '');
      setPhone(result.user.phone ?? '');
      setBusinessName(result.profile?.businessName ?? '');
      setProfileImage(result.profile?.profileImage ?? null);
      setImageDirty(false);
      await refreshUser();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image is too large. Maximum size is 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result) {
        setError('Failed to read the selected image.');
        return;
      }
      setError('');
      setProfileImage(result);
      setImageDirty(true);
      setSaved(false);
    };
    reader.onerror = () => setError('Failed to read the selected image.');
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setImageDirty(true);
    setSaved(false);
    setError('');
  };

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordSaved(false);

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== passwordConfirm) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
        passwordConfirm,
      });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordConfirm('');
      setShowPasswordForm(false);
      setPasswordSaved(true);
      window.setTimeout(() => setPasswordSaved(false), 2600);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setPasswordSaving(false);
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
          <div className="settings-profile-mark settings-profile-mark--avatar">
            {profileImage ? (
              <img src={profileImage} alt={`${displayName} profile`} className="settings-profile-avatar" />
            ) : (
              <AccountIcon className="size-5" />
            )}
          </div>
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
          <div className="settings-avatar-field">
            <div className="settings-avatar-preview">
              {profileImage ? (
                <img src={profileImage} alt="Profile preview" className="settings-profile-avatar" />
              ) : (
                <AccountIcon className="size-6" />
              )}
            </div>
            <div className="settings-avatar-copy">
              <strong>Profile photo</strong>
              <p>Upload a clear image. JPG, PNG, or WebP, up to 2MB.</p>
              <div className="settings-avatar-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  onChange={handleImageChange}
                  aria-label="Upload profile photo"
                />
                <button type="button" className="settings-text-action" onClick={() => fileInputRef.current?.click()} disabled={loadingProfile || saving}>
                  <Camera className="size-4" /> {profileImage ? 'Change photo' : 'Upload photo'}
                </button>
                {profileImage && (
                  <button type="button" className="settings-text-action settings-text-action--danger" onClick={handleRemoveImage} disabled={loadingProfile || saving}>
                    <Trash2 className="size-4" /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="settings-form-grid">
            <label><span>{content.nameLabel}</span><div className="settings-input-wrap"><UserRound className="size-4" /><input aria-label={content.nameLabel} value={name} onChange={(e) => setName(e.target.value)} disabled={loadingProfile || saving} /></div></label>
            <label><span>Phone number</span><div className="settings-input-wrap"><Phone className="size-4" /><input aria-label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loadingProfile || saving} /></div></label>
            {kind === 'supplier' && (
              <label><span>Business name</span><div className="settings-input-wrap"><Building2 className="size-4" /><input aria-label="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} disabled={loadingProfile || saving} /></div></label>
            )}
          </div>
          <label><span>Email address</span><div className="settings-input-wrap"><Mail className="size-4" /><input aria-label="Email address" type="email" value={email} readOnly /></div><p className="settings-field-note">Email address is read-only for account security.</p></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="settings-form-footer"><p>Changes to your name, photo, and contact details are saved to your profile.</p><button className="settings-primary-action" type="submit" disabled={loadingProfile || saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
        </form>
      </section>

      <section className="settings-section" aria-labelledby="notifications-title">
        <div className="settings-section-copy">
          <p className="settings-section-kicker">Notifications</p>
          <h2 id="notifications-title">Stay informed</h2>
          <p>{content.notificationCopy}</p>
        </div>
        <div className="settings-panel settings-toggle-list">
          <ToggleRow
            title={kind === 'supplier' ? 'Booking requests' : kind === 'admin' ? 'Platform alerts' : 'Booking updates'}
            description={kind === 'supplier' ? 'New requests, cancellations, and customer messages.' : kind === 'admin' ? 'Important platform activity, booking escalations, and operational notices.' : 'Request decisions, timing changes, and check-in reminders.'}
            checked={bookingAlerts}
            onChange={setBookingAlerts}
          />
          <ToggleRow
            title={kind === 'supplier' ? 'Station service alerts' : kind === 'admin' ? 'System notifications' : 'Charging reminders'}
            description={kind === 'supplier' ? 'Terminal availability and station service notices.' : kind === 'admin' ? 'System health, maintenance, and account security updates.' : 'Upcoming charging sessions and payment reminders.'}
            checked={serviceAlerts}
            onChange={setServiceAlerts}
          />
        </div>
      </section>

      <section className="settings-section settings-section--last" aria-labelledby="security-title">
        <div className="settings-section-copy">
          <p className="settings-section-kicker">Security</p>
          <h2 id="security-title">Sign-in security</h2>
          <p>Use a unique password and review your account access regularly.</p>
        </div>
        <div className="settings-panel settings-security-panel">
          <div className="settings-security-row">
            <div>
              <span className="settings-inline-icon"><LockKeyhole className="size-4" /></span>
              <div>
                <strong>Password</strong>
                <p>{passwordSaved ? 'Password updated successfully.' : 'Change your password to keep your account secure.'}</p>
              </div>
            </div>
            <button
              className="settings-text-action"
              type="button"
              onClick={() => { setShowPasswordForm((v) => !v); setPasswordError(''); setPasswordSaved(false); }}
            >
              {showPasswordForm ? <><X className="size-4" /> Cancel</> : <>Change password <ChevronRight className="size-4" /></>}
            </button>
          </div>

          {showPasswordForm && (
            <form className="settings-password-form" onSubmit={handlePasswordChange}>
              <label>
                <span>Current password</span>
                <div className="settings-input-wrap"><LockKeyhole className="size-4" /><input aria-label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" disabled={passwordSaving} /></div>
              </label>
              <div className="settings-form-grid">
                <label>
                  <span>New password</span>
                  <div className="settings-input-wrap"><LockKeyhole className="size-4" /><input aria-label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" disabled={passwordSaving} /></div>
                </label>
                <label>
                  <span>Confirm new password</span>
                  <div className="settings-input-wrap"><LockKeyhole className="size-4" /><input aria-label="Confirm new password" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} autoComplete="new-password" disabled={passwordSaving} /></div>
                </label>
              </div>
              {passwordError && <p className="form-error" role="alert">{passwordError}</p>}
              <div className="settings-form-footer">
                <p>Use at least 8 characters for your new password.</p>
                <button className="settings-primary-action" type="submit" disabled={passwordSaving}>{passwordSaving ? 'Updating…' : 'Update password'}</button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="settings-toggle-row"><div><strong>{title}</strong><p>{description}</p></div><button type="button" className={`settings-toggle ${checked ? 'is-on' : ''}`} role="switch" aria-checked={checked} aria-label={`Toggle ${title}`} onClick={() => onChange(!checked)}><span /></button></div>;
}
