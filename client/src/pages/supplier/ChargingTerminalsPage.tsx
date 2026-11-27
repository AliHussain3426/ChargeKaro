import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Loader2, PlugZap, Plus, RefreshCw, Trash2 } from 'lucide-react';
import {
  createTerminal,
  deleteTerminal,
  listStations,
  listTerminals,
  updateTerminalStatus,
  type CreateTerminalInput,
  type Station,
  type Terminal,
} from '@/services/stations';

export interface TerminalFormValues {
  name: string;
  chargingMethod: string;
  connectorTypes: string;
  maximumPowerKw: string;
  capacity: string;
  priceAmount: string;
  currency: string;
  billingType: string;
  status: string;
  availability: boolean;
}

export type TerminalFormErrors = Partial<Record<keyof TerminalFormValues, string>>;

export const initialTerminalForm: TerminalFormValues = {
  name: '',
  chargingMethod: 'AC',
  connectorTypes: 'Type 2',
  maximumPowerKw: '',
  capacity: '1',
  priceAmount: '',
  currency: 'PKR',
  billingType: 'PER_KWH',
  status: 'AVAILABLE',
  availability: true,
};

export function validateTerminalForm(values: TerminalFormValues): TerminalFormErrors {
  const errors: TerminalFormErrors = {};
  if (!values.name.trim() || values.name.trim().length < 2) {
    errors.name = 'Terminal name must be at least 2 characters.';
  }
  const power = Number(values.maximumPowerKw);
  if (values.maximumPowerKw.trim() === '' || !Number.isFinite(power) || power < 0) {
    errors.maximumPowerKw = 'Enter a valid non-negative power value.';
  }
  const amount = Number(values.priceAmount);
  if (values.priceAmount.trim() === '' || !Number.isFinite(amount) || amount < 0) {
    errors.priceAmount = 'Enter a valid non-negative price.';
  }
  const capacity = Number(values.capacity);
  if (!Number.isInteger(capacity) || capacity < 1) {
    errors.capacity = 'Capacity must be at least 1.';
  }
  return errors;
}

function toCreateTerminalInput(values: TerminalFormValues): CreateTerminalInput {
  return {
    name: values.name.trim(),
    chargingMethod: values.chargingMethod.trim() || 'AC',
    connectorTypes: values.connectorTypes
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    maximumPowerKw: Number(values.maximumPowerKw),
    capacity: Number(values.capacity),
    pricing: {
      amount: Number(values.priceAmount),
      currency: values.currency.trim() || 'PKR',
      billingType: values.billingType,
    },
    status: values.status,
    availability: values.availability,
  };
}

function statusClass(status: string): string {
  if (status === 'OCCUPIED') return 'workspace-status workspace-status--warning';
  if (status === 'UNAVAILABLE' || status === 'MAINTENANCE') return 'workspace-status workspace-status--muted';
  return 'workspace-status';
}

export default function ChargingTerminalsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [loadingTerminals, setLoadingTerminals] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TerminalFormValues>(initialTerminalForm);
  const [errors, setErrors] = useState<TerminalFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedStation = useMemo(
    () => stations.find((station) => station._id === selectedStationId) ?? null,
    [stations, selectedStationId]
  );

  async function loadStations() {
    setLoadingStations(true);
    setError('');
    try {
      const data = await listStations();
      setStations(data);
      setSelectedStationId((current) => current || data[0]?._id || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stations.');
    } finally {
      setLoadingStations(false);
    }
  }

  async function loadTerminals(stationId: string) {
    if (!stationId) {
      setTerminals([]);
      return;
    }
    setLoadingTerminals(true);
    setError('');
    try {
      const data = await listTerminals(stationId);
      setTerminals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load terminals.');
    } finally {
      setLoadingTerminals(false);
    }
  }

  useEffect(() => {
    void loadStations();
  }, []);

  useEffect(() => {
    void loadTerminals(selectedStationId);
  }, [selectedStationId]);

  useEffect(() => {
    if (!loadingStations && stations.length === 0) {
      setSelectedStationId('');
      setTerminals([]);
      setShowForm(false);
    }
  }, [loadingStations, stations.length]);

  function updateField<K extends keyof TerminalFormValues>(key: K, value: TerminalFormValues[K]) {
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
    if (!selectedStationId) {
      setError('Select a station before adding a terminal.');
      return;
    }
    const nextErrors = validateTerminalForm(form);
    setErrors(nextErrors);
    setError('');
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const terminal = await createTerminal(selectedStationId, toCreateTerminalInput(form));
      setTerminals((current) => [terminal, ...current]);
      setForm(initialTerminalForm);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create terminal.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleAvailability(terminal: Terminal) {
    try {
      const nextAvailability = !terminal.availability;
      const nextStatus = nextAvailability ? 'AVAILABLE' : 'UNAVAILABLE';
      const updated = await updateTerminalStatus(selectedStationId, terminal._id, {
        availability: nextAvailability,
        status: nextStatus,
      });
      setTerminals((current) => current.map((item) => (item._id === terminal._id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update terminal status.');
    }
  }

  async function handleDelete(terminalId: string) {
    try {
      await deleteTerminal(selectedStationId, terminalId);
      setTerminals((current) => current.filter((terminal) => terminal._id !== terminalId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete terminal.');
    }
  }

  const canManageTerminals = Boolean(selectedStationId) && !loadingStations;

  return (
    <div className="workspace-page">
      <header className="workspace-head">
        <div>
          <h1>Charging terminals</h1>
          <p>Review connector capacity and availability across your stations.</p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          <button
            className="workspace-action workspace-action--secondary"
            type="button"
            onClick={() => void loadTerminals(selectedStationId)}
            disabled={!canManageTerminals || loadingTerminals}
          >
            <RefreshCw className="size-4" /> Refresh
          </button>
          <button
            className="workspace-action"
            type="button"
            onClick={() => {
              setError('');
              setShowForm((value) => !value);
            }}
            disabled={!canManageTerminals}
            title={!selectedStationId && !loadingStations ? 'Create a station before adding terminals' : undefined}
          >
            <Plus className="size-4" /> {showForm ? 'Close form' : 'Add terminal'}
          </button>
        </div>
      </header>

      {!loadingStations && stations.length === 0 && (
        <div className="workspace-notice" role="status" style={{ marginBottom: '1rem' }}>
          You need at least one station before you can add terminals. Create a station from <strong>My Stations</strong>, then return here to add terminals.
        </div>
      )}

      <section className="workspace-panel" style={{ marginBottom: '1.25rem' }}>
        <label className="workspace-field" style={{ maxWidth: '420px', width: '100%' }}>
          <span>Station</span>
          {loadingStations ? (
            <p>Loading stations…</p>
          ) : stations.length === 0 ? (
            <p>No stations available. Create a station first.</p>
          ) : (
            <select value={selectedStationId} onChange={(e) => setSelectedStationId(e.target.value)}>
              {stations.map((station) => (
                <option key={station._id} value={station._id}>{station.name}</option>
              ))}
            </select>
          )}
        </label>
        {selectedStation && (
          <p style={{ marginTop: '.5rem', color: 'var(--gc-ink-soft)', fontSize: '.85rem' }}>
            Managing terminals for <strong>{selectedStation.name}</strong> ({selectedStation.address})
          </p>
        )}
      </section>

      {showForm && selectedStationId && (
        <section className="workspace-panel" style={{ marginBottom: '1.25rem' }}>
          <div className="workspace-panel-head">
            <div>
              <h2>Create terminal</h2>
              <p>Define connector, power, pricing, and initial availability.</p>
            </div>
          </div>
          <form className="workspace-form" onSubmit={handleSubmit} noValidate>
            <div className="workspace-form-grid">
              <label className="workspace-field">
                <span>Terminal name</span>
                <input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="e.g. Terminal GC-01" />
                {errors.name && <em className="workspace-field-error">{errors.name}</em>}
              </label>
              <label className="workspace-field">
                <span>Charging method</span>
                <select value={form.chargingMethod} onChange={(e) => updateField('chargingMethod', e.target.value)}>
                  <option value="AC">AC</option>
                  <option value="DC">DC</option>
                </select>
              </label>
              <label className="workspace-field">
                <span>Connector types (comma separated)</span>
                <input value={form.connectorTypes} onChange={(e) => updateField('connectorTypes', e.target.value)} placeholder="Type 2, CCS2" />
              </label>
              <label className="workspace-field">
                <span>Maximum power (kW)</span>
                <input value={form.maximumPowerKw} onChange={(e) => updateField('maximumPowerKw', e.target.value)} placeholder="50" inputMode="decimal" />
                {errors.maximumPowerKw && <em className="workspace-field-error">{errors.maximumPowerKw}</em>}
              </label>
              <label className="workspace-field">
                <span>Capacity</span>
                <input value={form.capacity} onChange={(e) => updateField('capacity', e.target.value)} placeholder="1" inputMode="numeric" />
                {errors.capacity && <em className="workspace-field-error">{errors.capacity}</em>}
              </label>
              <label className="workspace-field">
                <span>Price amount</span>
                <input value={form.priceAmount} onChange={(e) => updateField('priceAmount', e.target.value)} placeholder="60" inputMode="decimal" />
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
                <span>Status</span>
                <select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </label>
              <label className="workspace-field">
                <span>Availability</span>
                <select value={form.availability ? 'true' : 'false'} onChange={(e) => updateField('availability', e.target.value === 'true')}>
                  <option value="true">Available to book</option>
                  <option value="false">Not available</option>
                </select>
              </label>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="workspace-form-actions">
              <button className="workspace-action" type="submit" disabled={submitting || !selectedStationId}>
                {submitting ? <><Loader2 className="size-4 animate-spin" /> Creating…</> : 'Create terminal'}
              </button>
              {Object.keys(errors).length > 0 && <span className="workspace-field-error">Please fix the highlighted fields.</span>}
            </div>
          </form>
        </section>
      )}

      {error && !showForm && <div className="workspace-notice" role="alert">{error}</div>}

      <section className="workspace-panel">
        <div className="workspace-panel-head">
          <div>
            <h2>{terminals.length} terminal{terminals.length === 1 ? '' : 's'}</h2>
            <p>{selectedStation ? `Terminals for ${selectedStation.name}.` : 'Select a station to manage terminals.'}</p>
          </div>
        </div>

        {loadingTerminals ? (
          <p>Loading terminals…</p>
        ) : !selectedStationId ? (
          <p>Select a station to view terminals.</p>
        ) : terminals.length === 0 ? (
          <p>No terminals yet. Add a terminal to this station.</p>
        ) : (
          <ul className="workspace-list">
            {terminals.map((terminal) => (
              <li className="workspace-list-row" key={terminal._id}>
                <span className="workspace-row-icon"><PlugZap className="size-4" /></span>
                <div className="workspace-row-main">
                  <strong>{terminal.name}</strong>
                  <span>
                    {selectedStation?.name ?? 'Station'} · {terminal.connectorTypes.join(', ') || terminal.chargingMethod} · {terminal.maximumPowerKw} kW · {terminal.pricing.currency} {terminal.pricing.amount}
                  </span>
                </div>
                <div className="workspace-inline-actions">
                  <span className={statusClass(terminal.status)}>{terminal.status.replace(/_/g, ' ')}</span>
                  <button className="workspace-text-button" type="button" onClick={() => void toggleAvailability(terminal)}>
                    {terminal.availability ? 'Set unavailable' : 'Set available'}
                  </button>
                  <button className="workspace-text-button" type="button" onClick={() => void handleDelete(terminal._id)} aria-label={`Delete ${terminal.name}`}>
                    <Trash2 className="size-4" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
