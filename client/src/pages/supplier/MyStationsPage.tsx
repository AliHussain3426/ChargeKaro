import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ChevronDown, ChevronRight, Loader2, MapPin, Plus, Store, Trash2 } from 'lucide-react';
import {
  createStation,
  deleteStation,
  listStations,
  type CreateStationInput,
  type Station,
} from '@/services/stations';

export interface StationFormValues {
  name: string;
  address: string;
  city: string;
  province: string;
  longitude: string;
  latitude: string;
  priceAmount: string;
  currency: string;
  billingType: string;
  opensAt: string;
  closesAt: string;
  description: string;
}

export type StationFormErrors = Partial<Record<keyof StationFormValues, string>>;

export const initialStationForm: StationFormValues = {
  name: '',
  address: '',
  city: '',
  province: '',
  longitude: '',
  latitude: '',
  priceAmount: '',
  currency: 'PKR',
  billingType: 'PER_KWH',
  opensAt: '08:00',
  closesAt: '22:00',
  description: '',
};

export function validateStationForm(values: StationFormValues): StationFormErrors {
  const errors: StationFormErrors = {};

  if (!values.name.trim() || values.name.trim().length < 2) {
    errors.name = 'Station name must be at least 2 characters.';
  }
  if (!values.address.trim() || values.address.trim().length < 3) {
    errors.address = 'Address is required.';
  }

  const lng = Number(values.longitude);
  if (values.longitude.trim() === '' || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    errors.longitude = 'Enter a valid longitude (-180 to 180).';
  }

  const lat = Number(values.latitude);
  if (values.latitude.trim() === '' || !Number.isFinite(lat) || lat < -90 || lat > 90) {
    errors.latitude = 'Enter a valid latitude (-90 to 90).';
  }

  const amount = Number(values.priceAmount);
  if (values.priceAmount.trim() === '' || !Number.isFinite(amount) || amount < 0) {
    errors.priceAmount = 'Enter a valid non-negative price.';
  }

  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timePattern.test(values.opensAt)) {
    errors.opensAt = 'Use HH:mm format.';
  }
  if (!timePattern.test(values.closesAt)) {
    errors.closesAt = 'Use HH:mm format.';
  }

  return errors;
}

function toCreateInput(values: StationFormValues): CreateStationInput {
  return {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    address: values.address.trim(),
    city: values.city.trim() || undefined,
    province: values.province.trim() || undefined,
    country: 'Pakistan',
    location: {
      coordinates: [Number(values.longitude), Number(values.latitude)],
    },
    pricing: {
      amount: Number(values.priceAmount),
      currency: values.currency.trim() || 'PKR',
      billingType: values.billingType,
    },
    operatingHours: {
      timezone: 'Asia/Karachi',
      opensAt: values.opensAt,
      closesAt: values.closesAt,
    },
  };
}

export default function MyStationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<StationFormValues>(initialStationForm);
  const [errors, setErrors] = useState<StationFormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  async function loadStations() {
    setLoading(true);
    setLoadError('');
    try {
      const data = await listStations();
      setStations(data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to load stations.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStations();
  }, []);

  function updateField<K extends keyof StationFormValues>(key: K, value: StationFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateStationForm(form);
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const station = await createStation(toCreateInput(form));
      setStations((current) => [station, ...current]);
      setForm(initialStationForm);
      setShowForm(false);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create station.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(stationId: string) {
    try {
      await deleteStation(stationId);
      setStations((current) => current.filter((station) => station._id !== stationId));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Failed to delete station.');
    }
  }

  return (
    <div className="workspace-page">
      <header className="workspace-head">
        <div>
          <h1>My stations</h1>
          <p>Manage the locations drivers see when they plan a charging stop.</p>
        </div>
        <button className="workspace-action" type="button" onClick={() => setShowForm((value) => !value)}>
          <Plus className="size-4" /> {showForm ? 'Close form' : 'Add station'}
        </button>
      </header>

      {showForm && (
        <section className="workspace-panel" style={{ marginBottom: '1.25rem' }}>
          <div className="workspace-panel-head">
            <div>
              <h2>Create station</h2>
              <p>Provide location, pricing, and operating details for drivers.</p>
            </div>
          </div>
          <form className="workspace-form" onSubmit={handleSubmit} noValidate>
            <div className="workspace-form-grid">
              <label className="workspace-field">
                <span>Station name</span>
                <input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="e.g. Gulberg Charge Hub" />
                {errors.name && <em className="workspace-field-error">{errors.name}</em>}
              </label>
              <label className="workspace-field">
                <span>Address</span>
                <input value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Street and area" />
                {errors.address && <em className="workspace-field-error">{errors.address}</em>}
              </label>
              <label className="workspace-field">
                <span>City</span>
                <input value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Lahore" />
              </label>
              <label className="workspace-field">
                <span>Province</span>
                <input value={form.province} onChange={(e) => updateField('province', e.target.value)} placeholder="Punjab" />
              </label>
              <label className="workspace-field">
                <span>Longitude</span>
                <input value={form.longitude} onChange={(e) => updateField('longitude', e.target.value)} placeholder="74.3436" inputMode="decimal" />
                {errors.longitude && <em className="workspace-field-error">{errors.longitude}</em>}
              </label>
              <label className="workspace-field">
                <span>Latitude</span>
                <input value={form.latitude} onChange={(e) => updateField('latitude', e.target.value)} placeholder="31.5204" inputMode="decimal" />
                {errors.latitude && <em className="workspace-field-error">{errors.latitude}</em>}
              </label>
              <label className="workspace-field">
                <span>Price amount</span>
                <input value={form.priceAmount} onChange={(e) => updateField('priceAmount', e.target.value)} placeholder="55" inputMode="decimal" />
                {errors.priceAmount && <em className="workspace-field-error">{errors.priceAmount}</em>}
              </label>
              <label className="workspace-field">
                <span>Currency</span>
                <input value={form.currency} onChange={(e) => updateField('currency', e.target.value)} placeholder="PKR" />
              </label>
              <label className="workspace-field">
                <span>Billing type</span>
                <select value={form.billingType} onChange={(e) => updateField('billingType', e.target.value)}>
                  <option value="PER_KWH">Per kWh</option>
                  <option value="PER_MINUTE">Per minute</option>
                  <option value="PER_SESSION">Per session</option>
                  <option value="FLAT">Flat</option>
                </select>
              </label>
              <label className="workspace-field">
                <span>Opens at</span>
                <input value={form.opensAt} onChange={(e) => updateField('opensAt', e.target.value)} placeholder="08:00" />
                {errors.opensAt && <em className="workspace-field-error">{errors.opensAt}</em>}
              </label>
              <label className="workspace-field">
                <span>Closes at</span>
                <input value={form.closesAt} onChange={(e) => updateField('closesAt', e.target.value)} placeholder="22:00" />
                {errors.closesAt && <em className="workspace-field-error">{errors.closesAt}</em>}
              </label>
              <label className="workspace-field workspace-field--full">
                <span>Description (optional)</span>
                <input value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Short description for drivers" />
              </label>
            </div>
            {submitError && <p className="form-error" role="alert">{submitError}</p>}
            <div className="workspace-form-actions">
              <button className="workspace-action" type="submit" disabled={submitting}>
                {submitting ? <><Loader2 className="size-4 animate-spin" /> Creating…</> : 'Create station'}
              </button>
              {hasErrors && <span className="workspace-field-error">Please fix the highlighted fields.</span>}
            </div>
          </form>
        </section>
      )}

      {loadError && <div className="workspace-notice" role="alert">{loadError}</div>}

      {loading ? (
        <section className="workspace-panel"><p>Loading stations…</p></section>
      ) : stations.length === 0 ? (
        <section className="workspace-panel"><p>No stations yet. Add your first station to make it visible to drivers.</p></section>
      ) : (
        <section className="workspace-card-grid">
          {stations.map((station) => {
            const expanded = expandedId === station._id;
            return (
              <article className="workspace-panel workspace-card" key={station._id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3>{station.name}</h3>
                    <p><MapPin className="mr-1 inline size-3" /> {station.address}{station.city ? `, ${station.city}` : ''}</p>
                    <p className="text-sm" style={{ marginTop: '.35rem', color: 'var(--gc-ink-soft)' }}>
                      {station.pricing.currency} {station.pricing.amount} / {station.pricing.billingType.replace(/_/g, ' ').toLowerCase()} · {station.operatingHours.opensAt}–{station.operatingHours.closesAt}
                    </p>
                  </div>
                  <span className="workspace-status">Active</span>
                </div>

                {expanded && (
                  <div className="admin-detail-grid workspace-inline-detail-grid">
                    <div className="admin-detail-item"><span className="admin-detail-label">Station ID</span><strong>{station._id}</strong></div>
                    <div className="admin-detail-item"><span className="admin-detail-label">City</span><strong>{station.city || '—'}</strong></div>
                    <div className="admin-detail-item"><span className="admin-detail-label">Province</span><strong>{station.province || '—'}</strong></div>
                    <div className="admin-detail-item"><span className="admin-detail-label">Country</span><strong>{station.country || '—'}</strong></div>
                    <div className="admin-detail-item"><span className="admin-detail-label">Coordinates</span><strong>{station.location.coordinates[1].toFixed(5)}, {station.location.coordinates[0].toFixed(5)}</strong></div>
                    <div className="admin-detail-item"><span className="admin-detail-label">Pricing</span><strong>{station.pricing.currency} {station.pricing.amount} ({station.pricing.billingType})</strong></div>
                    <div className="admin-detail-item"><span className="admin-detail-label">Operating hours</span><strong>{station.operatingHours.opensAt} – {station.operatingHours.closesAt} ({station.operatingHours.timezone || 'local'})</strong></div>
                    <div className="admin-detail-item" style={{ gridColumn: '1 / -1' }}><span className="admin-detail-label">Description</span><strong>{station.description || '—'}</strong></div>
                  </div>
                )}

                <div className="workspace-card-footer">
                  <span className="text-sm font-semibold"><Store className="mr-1 inline size-3" /> Managed by you</span>
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button className="workspace-text-button" type="button" onClick={() => void handleDelete(station._id)} aria-label={`Delete ${station.name}`}>
                      <Trash2 className="size-4" /> Delete
                    </button>
                    <button className="workspace-text-button" type="button" onClick={() => setExpandedId(expanded ? null : station._id)}>
                      {expanded ? <>Hide details <ChevronDown className="size-4" /></> : <>Details <ChevronRight className="size-4" /></>}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
