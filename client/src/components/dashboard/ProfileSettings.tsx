import { useState, type FormEvent } from 'react';
import { Building2, Check, ChevronRight, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';

type ProfileKind = 'customer' | 'supplier';

interface ProfileSettingsProps {
  kind: ProfileKind;
}

const profileContent = {
  customer: {
    title: 'Profile & settings',
    description: 'Keep your driver details and charging updates ready when you need them.',
    name: 'Ayesha Khan',
    email: 'ayesha.khan@greencharge.pk',
    phone: '+92 300 123 4567',
    role: 'Driver account',
    detailTitle: 'Driver details',
    detailCopy: 'These details appear on your booking requests and help suppliers contact you about an active charge.',
    notificationCopy: 'Choose the charging updates that should reach you.',
    helper: 'Booking confirmations, station updates, and payment reminders use this contact information.',
  },
  supplier: {
    title: 'Profile & settings',
    description: 'Manage the details customers see and the operational alerts your team receives.',
    name: 'GreenCharge North',
    email: 'operations@greenchargenorth.pk',
    phone: '+92 42 3890 2140',
    role: 'Supplier account',
    detailTitle: 'Business details',
    detailCopy: 'Keep the primary station contact current so booking requests and service notices reach the right person.',
    notificationCopy: 'Choose which operational changes require an immediate alert.',
    helper: 'Your public station details are managed separately in My Stations.',
  },
} as const;

export default function ProfileSettings({ kind }: ProfileSettingsProps) {
  const content = profileContent[kind];
  const [saved, setSaved] = useState(false);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [serviceAlerts, setServiceAlerts] = useState(kind === 'supplier');
  const AccountIcon = kind === 'customer' ? UserRound : Building2;

  const saveChanges = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2600);
  };

  return (
    <div className="settings-page">
      <header className="settings-title-row">
        <div>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
        </div>
        {saved && <span className="settings-saved"><Check className="size-4" /> Saved for this preview</span>}
      </header>

      <section className="settings-section settings-section--identity" aria-labelledby="account-summary-title">
        <div className="settings-section-copy">
          <p className="settings-section-kicker">Account</p>
          <h2 id="account-summary-title">Your account</h2>
          <p>{content.helper}</p>
        </div>
        <div className="settings-panel settings-profile-summary">
          <div className="settings-profile-mark"><AccountIcon className="size-5" /></div>
          <div className="settings-profile-main"><strong>{content.name}</strong><span>{content.email}</span></div>
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
            <label><span>{kind === 'supplier' ? 'Business name' : 'Full name'}</span><div className="settings-input-wrap"><AccountIcon className="size-4" /><input aria-label={kind === 'supplier' ? 'Business name' : 'Full name'} defaultValue={content.name} /></div></label>
            <label><span>Phone number</span><div className="settings-input-wrap"><Phone className="size-4" /><input aria-label="Phone number" type="tel" defaultValue={content.phone} /></div></label>
          </div>
          <label><span>Email address</span><div className="settings-input-wrap"><Mail className="size-4" /><input aria-label="Email address" type="email" defaultValue={content.email} /></div></label>
          <div className="settings-form-footer"><p>Changes are stored only in this front-end preview.</p><button className="settings-primary-action" type="submit">Save changes</button></div>
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
