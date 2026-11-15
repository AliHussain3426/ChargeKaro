import { useEffect, useState, type FormEvent } from 'react';
import { Check, CircleAlert, Mail, ShieldCheck } from 'lucide-react';
import { getSystemSettings, updateSystemSettings, type SystemSettings } from '@/services/admin';

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getSystemSettings();
        if (!cancelled) setSettings(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function saveSettings(event: FormEvent<HTMLFormElement>, patch: Partial<SystemSettings>) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const updated = await updateSystemSettings(patch);
      setSettings(updated);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }

  if (loading || !settings) {
    return <div className="settings-page"><p>{error || 'Loading settings…'}</p></div>;
  }

  return (
    <div className="settings-page">
      <header className="settings-title-row">
        <div>
          <h1>System settings</h1>
          <p>Set the platform defaults that shape booking, support, and operational notifications.</p>
        </div>
        {saved && <span className="settings-saved"><Check className="size-4" /> Saved</span>}
      </header>

      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="settings-section settings-section--identity" aria-labelledby="platform-details-title">
        <div className="settings-section-copy"><p className="settings-section-kicker">Platform</p><h2 id="platform-details-title">Platform details</h2><p>These values appear in customer-facing communications and support messages.</p></div>
        <form
          className="settings-panel settings-form"
          onSubmit={(e) => {
            const form = e.currentTarget;
            void saveSettings(e, {
              platformName: (form.elements.namedItem('platformName') as HTMLInputElement).value,
              supportEmail: (form.elements.namedItem('supportEmail') as HTMLInputElement).value,
            });
          }}
        >
          <label><span>Platform name</span><div className="settings-input-wrap"><input aria-label="Platform name" name="platformName" defaultValue={settings.platformName} /></div></label>
          <label><span>Support email</span><div className="settings-input-wrap"><Mail className="size-4" /><input aria-label="Support email" name="supportEmail" type="email" defaultValue={settings.supportEmail} /></div></label>
          <div className="settings-static-field"><span>Default currency</span><strong>{settings.currency} <small>Configured currency</small></strong></div>
          <div className="settings-form-footer"><p>Platform identity settings are managed by administrators.</p><button className="settings-primary-action" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save platform details'}</button></div>
        </form>
      </section>

      <section className="settings-section" aria-labelledby="booking-rules-title">
        <div className="settings-section-copy"><p className="settings-section-kicker">Bookings</p><h2 id="booking-rules-title">Booking rules</h2><p>Keep customer expectations and station availability rules aligned across the network.</p></div>
        <form
          className="settings-panel settings-form"
          onSubmit={(e) => {
            const form = e.currentTarget;
            void saveSettings(e, {
              advanceBookingWindowDays: Number((form.elements.namedItem('advanceBookingWindowDays') as HTMLInputElement).value),
              cancellationWindowHours: Number((form.elements.namedItem('cancellationWindowHours') as HTMLInputElement).value),
              platformCommissionPercent: Number((form.elements.namedItem('platformCommissionPercent') as HTMLInputElement).value),
            });
          }}
        >
          <div className="settings-form-grid">
            <label><span>Advance booking window</span><div className="settings-input-wrap"><input aria-label="Advance booking window" name="advanceBookingWindowDays" type="number" defaultValue={settings.advanceBookingWindowDays} /><em>days</em></div></label>
            <label><span>Cancellation window</span><div className="settings-input-wrap"><input aria-label="Cancellation window" name="cancellationWindowHours" type="number" defaultValue={settings.cancellationWindowHours} /><em>hours</em></div></label>
          </div>
          <label><span>Platform commission</span><div className="settings-input-wrap"><input aria-label="Platform commission" name="platformCommissionPercent" type="number" defaultValue={settings.platformCommissionPercent} /><em>%</em></div></label>
          <div className="settings-form-footer"><p>Commission applies to confirmed paid bookings in earnings calculations.</p><button className="settings-primary-action" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save booking rules'}</button></div>
        </form>
      </section>

      <section className="settings-section" aria-labelledby="operations-title">
        <div className="settings-section-copy"><p className="settings-section-kicker">Operations</p><h2 id="operations-title">Operational controls</h2><p>Use these controls to determine operational behavior and alerts.</p></div>
        <div className="settings-panel settings-toggle-list">
          <SettingsToggle title="Booking escalation alerts" description="Send a platform alert when a booking request remains unanswered." checked={settings.bookingEscalationAlerts} onChange={(value) => { setSettings({ ...settings, bookingEscalationAlerts: value }); void updateSystemSettings({ bookingEscalationAlerts: value }).then(setSettings).catch((err) => setError(err instanceof Error ? err.message : 'Failed to update')); }} />
          <SettingsToggle title="Maintenance mode" description="Pause new booking requests while administrators carry out maintenance." checked={settings.maintenanceMode} onChange={(value) => { setSettings({ ...settings, maintenanceMode: value }); void updateSystemSettings({ maintenanceMode: value }).then(setSettings).catch((err) => setError(err instanceof Error ? err.message : 'Failed to update')); }} />
        </div>
      </section>

      <section className="settings-section settings-section--last" aria-labelledby="admin-access-title">
        <div className="settings-section-copy"><p className="settings-section-kicker">Access</p><h2 id="admin-access-title">Administrator access</h2><p>Role access and oversight are managed from the user administration workspace.</p></div>
        <div className="settings-panel settings-security-row"><div><span className="settings-inline-icon"><ShieldCheck className="size-4" /></span><div><strong>Role permissions</strong><p>Review administrators and platform operators before changing access.</p></div></div><button className="settings-text-action" type="button">Review users <CircleAlert className="size-4" /></button></div>
      </section>
    </div>
  );
}

function SettingsToggle({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="settings-toggle-row">
      <div><strong>{title}</strong><p>{description}</p></div>
      <button type="button" className={`settings-toggle ${checked ? 'is-on' : ''}`} role="switch" aria-checked={checked} aria-label={`Toggle ${title}`} onClick={() => onChange(!checked)}><span /></button>
    </div>
  );
}
