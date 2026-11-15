import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { BatteryCharging, Loader2, PlugZap, Plus, Trash2 } from 'lucide-react';
import { createVehicle, deleteVehicle, listVehicles, type Vehicle } from '@/services/vehicles';

interface VehicleFormValues {
  manufacturer: string;
  model: string;
  vehicleCategory: string;
  modelYear: string;
  batteryCapacityKwh: string;
  connectorTypes: string;
  maximumChargingPowerKw: string;
}

type VehicleFormErrors = Partial<Record<keyof VehicleFormValues, string>>;

const initialForm: VehicleFormValues = {
  manufacturer: '',
  model: '',
  vehicleCategory: 'ELECTRIC_CAR',
  modelYear: '',
  batteryCapacityKwh: '',
  connectorTypes: 'Type 2',
  maximumChargingPowerKw: '',
};

function validate(values: VehicleFormValues): VehicleFormErrors {
  const errors: VehicleFormErrors = {};
  if (!values.manufacturer.trim()) errors.manufacturer = 'Manufacturer is required.';
  if (!values.model.trim()) errors.model = 'Model is required.';
  if (values.modelYear.trim()) {
    const year = Number(values.modelYear);
    if (!Number.isInteger(year) || year < 1980 || year > 2100) errors.modelYear = 'Enter a valid year.';
  }
  if (values.batteryCapacityKwh.trim()) {
    const cap = Number(values.batteryCapacityKwh);
    if (!Number.isFinite(cap) || cap < 0) errors.batteryCapacityKwh = 'Enter a valid capacity.';
  }
  if (values.maximumChargingPowerKw.trim()) {
    const power = Number(values.maximumChargingPowerKw);
    if (!Number.isFinite(power) || power < 0) errors.maximumChargingPowerKw = 'Enter a valid power value.';
  }
  return errors;
}

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<VehicleFormValues>(initialForm);
  const [errors, setErrors] = useState<VehicleFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  async function loadVehicles() {
    setLoading(true);
    setError('');
    try {
      setVehicles(await listVehicles());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVehicles();
  }, []);

  function update<K extends keyof VehicleFormValues>(key: K, value: VehicleFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setError('');
    try {
      const vehicle = await createVehicle({
        manufacturer: form.manufacturer.trim(),
        model: form.model.trim(),
        vehicleCategory: form.vehicleCategory,
        modelYear: form.modelYear.trim() ? Number(form.modelYear) : undefined,
        batteryCapacityKwh: form.batteryCapacityKwh.trim() ? Number(form.batteryCapacityKwh) : undefined,
        connectorTypes: form.connectorTypes.split(',').map((v) => v.trim()).filter(Boolean),
        maximumChargingPowerKw: form.maximumChargingPowerKw.trim() ? Number(form.maximumChargingPowerKw) : undefined,
      });
      setVehicles((current) => [vehicle, ...current]);
      setForm(initialForm);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create vehicle.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(vehicleId: string) {
    try {
      await deleteVehicle(vehicleId);
      setVehicles((current) => current.filter((v) => v._id !== vehicleId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle.');
    }
  }

  return (
    <div className="workspace-page">
      <header className="workspace-head">
        <div>
          <h1>My vehicles</h1>
          <p>Save your vehicle details so stations and chargers can be matched to your connector and charging needs.</p>
        </div>
        <button className="workspace-action" type="button" onClick={() => setShowForm((v) => !v)}>
          <Plus className="size-4" /> {showForm ? 'Close form' : 'Add vehicle'}
        </button>
      </header>

      {showForm && (
        <section className="workspace-panel" style={{ marginBottom: '1.25rem' }}>
          <div className="workspace-panel-head"><div><h2>Add vehicle</h2><p>Enter manufacturer, model, and charging compatibility details.</p></div></div>
          <form className="workspace-form" onSubmit={handleSubmit} noValidate>
            <div className="workspace-form-grid">
              <label className="workspace-field"><span>Manufacturer</span><input value={form.manufacturer} onChange={(e) => update('manufacturer', e.target.value)} placeholder="Nissan" />{errors.manufacturer && <em className="workspace-field-error">{errors.manufacturer}</em>}</label>
              <label className="workspace-field"><span>Model</span><input value={form.model} onChange={(e) => update('model', e.target.value)} placeholder="Leaf" />{errors.model && <em className="workspace-field-error">{errors.model}</em>}</label>
              <label className="workspace-field"><span>Category</span><select value={form.vehicleCategory} onChange={(e) => update('vehicleCategory', e.target.value)}><option value="ELECTRIC_CAR">Electric car</option><option value="ELECTRIC_MOTORCYCLE">Electric motorcycle</option><option value="ELECTRIC_SCOOTER">Electric scooter</option><option value="ELECTRIC_BICYCLE">Electric bicycle</option><option value="OTHER">Other</option></select></label>
              <label className="workspace-field"><span>Model year</span><input value={form.modelYear} onChange={(e) => update('modelYear', e.target.value)} placeholder="2021" inputMode="numeric" />{errors.modelYear && <em className="workspace-field-error">{errors.modelYear}</em>}</label>
              <label className="workspace-field"><span>Battery capacity (kWh)</span><input value={form.batteryCapacityKwh} onChange={(e) => update('batteryCapacityKwh', e.target.value)} placeholder="40" inputMode="decimal" />{errors.batteryCapacityKwh && <em className="workspace-field-error">{errors.batteryCapacityKwh}</em>}</label>
              <label className="workspace-field"><span>Max charging power (kW)</span><input value={form.maximumChargingPowerKw} onChange={(e) => update('maximumChargingPowerKw', e.target.value)} placeholder="50" inputMode="decimal" />{errors.maximumChargingPowerKw && <em className="workspace-field-error">{errors.maximumChargingPowerKw}</em>}</label>
              <label className="workspace-field workspace-field--full"><span>Connector types (comma separated)</span><input value={form.connectorTypes} onChange={(e) => update('connectorTypes', e.target.value)} placeholder="Type 2, CCS2" /></label>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="workspace-form-actions">
              <button className="workspace-action" type="submit" disabled={submitting}>{submitting ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : 'Save vehicle'}</button>
              {hasErrors && <span className="workspace-field-error">Please fix the highlighted fields.</span>}
            </div>
          </form>
        </section>
      )}

      {error && !showForm && <div className="workspace-notice" role="alert">{error}</div>}

      {loading ? (
        <section className="workspace-panel"><p>Loading vehicles…</p></section>
      ) : vehicles.length === 0 ? (
        <section className="workspace-panel"><p>No vehicles saved yet. Add a vehicle to get compatible station recommendations.</p></section>
      ) : (
        <section className="workspace-card-grid">
          {vehicles.map((vehicle) => (
            <article className="workspace-panel workspace-card" key={vehicle._id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3>{vehicle.manufacturer} {vehicle.model}</h3>
                  <p>{vehicle.modelYear ? `${vehicle.modelYear} · ` : ''}{vehicle.vehicleCategory.replace(/_/g, ' ').toLowerCase()}</p>
                </div>
                <BatteryCharging className="size-5 text-primary" />
              </div>
              <div className="workspace-card-footer">
                <span className="inline-flex items-center gap-2 text-sm font-semibold"><PlugZap className="size-4 text-primary" /> {(vehicle.connectorTypes?.length ? vehicle.connectorTypes.join(', ') : 'No connectors set')}{vehicle.batteryCapacityKwh ? ` · ${vehicle.batteryCapacityKwh} kWh` : ''}</span>
                <button className="workspace-text-button" type="button" onClick={() => void handleDelete(vehicle._id)}><Trash2 className="size-4" /> Delete</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
