import { useState, type FormEvent } from 'react';
import { Check, CircleAlert, Mail, ShieldCheck } from 'lucide-react';

export default function SystemSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [requestAlerts, setRequestAlerts] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const saveSettings = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSaved(true); window.setTimeout(() => setSaved(false), 2600); };

  return <div className="settings-page">
    <header className="settings-title-row"><div><h1>System settings</h1><p>Set the platform defaults that shape booking, support, and operational notifications.</p></div>{saved && <span className="settings-saved"><Check className="size-4" /> Saved for this preview</span>}</header>

    <section className="settings-section settings-section--identity" aria-labelledby="platform-details-title">
      <div className="settings-section-copy"><p className="settings-section-kicker">Platform</p><h2 id="platform-details-title">Platform details</h2><p>These values appear in customer-facing communications and support messages.</p></div>
      <form className="settings-panel settings-form" onSubmit={saveSettings}>
        <label><span>Platform name</span><div className="settings-input-wrap"><input aria-label="Platform name" defaultValue="GreenCharge Pakistan" /></div></label>
        <label><span>Support email</span><div className="settings-input-wrap"><Mail className="size-4" /><input aria-label="Support email" type="email" defaultValue="support@greencharge.pk" /></div></label>
        <div className="settings-static-field"><span>Default currency</span><strong>PKR <small>Pakistani rupee</small></strong></div>
        <div className="settings-form-footer"><p>Currency is locked in this prototype until payment configuration is connected.</p><button className="settings-primary-action" type="submit">Save platform details</button></div>
      </form>
    </section>

    <section className="settings-section" aria-labelledby="booking-rules-title">
      <div className="settings-section-copy"><p className="settings-section-kicker">Bookings</p><h2 id="booking-rules-title">Booking rules</h2><p>Keep customer expectations and station availability rules aligned across the network.</p></div>
      <form className="settings-panel settings-form" onSubmit={saveSettings}>
        <div className="settings-form-grid"><label><span>Advance booking window</span><div className="settings-input-wrap"><input aria-label="Advance booking window" type="number" defaultValue="7" /><em>days</em></div></label><label><span>Cancellation window</span><div className="settings-input-wrap"><input aria-label="Cancellation window" type="number" defaultValue="2" /><em>hours</em></div></label></div>
        <label><span>Platform commission</span><div className="settings-input-wrap"><input aria-label="Platform commission" type="number" defaultValue="10" /><em>%</em></div></label>
        <div className="settings-form-footer"><p>Commission applies only after a booking is accepted and paid.</p><button className="settings-primary-action" type="submit">Save booking rules</button></div>
      </form>
    </section>

    <section className="settings-section" aria-labelledby="operations-title">
      <div className="settings-section-copy"><p className="settings-section-kicker">Operations</p><h2 id="operations-title">Operational controls</h2><p>Use these controls to determine the messages your operations team should receive.</p></div>
      <div className="settings-panel settings-toggle-list"><SettingsToggle title="Booking escalation alerts" description="Send a platform alert when a booking request remains unanswered." checked={requestAlerts} onChange={setRequestAlerts} /><SettingsToggle title="Maintenance mode" description="Pause new booking requests while administrators carry out maintenance." checked={maintenanceMode} onChange={setMaintenanceMode} /></div>
    </section>

    <section className="settings-section settings-section--last" aria-labelledby="admin-access-title">
      <div className="settings-section-copy"><p className="settings-section-kicker">Access</p><h2 id="admin-access-title">Administrator access</h2><p>Role access and audit records will be managed from the user administration workspace.</p></div>
      <div className="settings-panel settings-security-row"><div><span className="settings-inline-icon"><ShieldCheck className="size-4" /></span><div><strong>Role permissions</strong><p>Review administrators and platform operators before changing access.</p></div></div><button className="settings-text-action" type="button">Review users <CircleAlert className="size-4" /></button></div>
    </section>
  </div>;
}

function SettingsToggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <div className="settings-toggle-row"><div><strong>{title}</strong><p>{description}</p></div><button type="button" className={`settings-toggle ${checked ? 'is-on' : ''}`} role="switch" aria-checked={checked} aria-label={`Toggle ${title}`} onClick={() => onChange(!checked)}><span /></button></div>;
}
