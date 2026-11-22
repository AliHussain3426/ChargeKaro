import { useMemo, useState, type ComponentType } from 'react';
import { ChevronRight, Search, X } from 'lucide-react';

export type RowAction = { label: string; onClick: () => void | Promise<void>; tone?: 'danger' | 'default' | 'warning' | 'success'; disabled?: boolean };
export type RowDetail = { label: string; value: string };
export type Row = { id?: string; name: string; meta: string; status: string; value: string; group: string; details?: RowDetail[]; actions?: RowAction[] };

interface AdminListWorkspaceProps {
  title: string;
  description: string;
  itemLabel: string;
  tabs: string[];
  rows: Row[];
  icon: ComponentType<{ className?: string }>;
  loading?: boolean;
  error?: string;
  live?: boolean;
}

function statusTone(status: string): string {
  if (status === 'Pending' || status === 'Attention' || status === 'PENDING' || status === 'UNVERIFIED') return 'workspace-status--warning';
  if (['Offline', 'Suspended', 'Rejected', 'Cancelled', 'Expired', 'REJECTED', 'CANCELLED', 'EXPIRED', 'FAILED', 'SUSPENDED', 'UNAVAILABLE', 'MAINTENANCE'].includes(status)) return 'workspace-status--muted';
  return '';
}

export default function AdminListWorkspace({ title, description, itemLabel, tabs, rows, icon: Icon, loading, error, live }: AdminListWorkspaceProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState(tabs[0] ?? 'All');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const visibleRows = useMemo(
    () => rows.filter((row) => (activeTab === tabs[0] || row.group === activeTab) && `${row.name} ${row.meta} ${row.status} ${row.value}`.toLowerCase().includes(query.toLowerCase())),
    [activeTab, query, rows, tabs]
  );

  const selected = selectedKey == null ? null : visibleRows.find((r) => (r.id ?? `${r.name}-${r.value}-${r.group}`) === selectedKey) ?? null;

  return (
    <div className="admin-page">
      <header className="workspace-head">
        <div>
          <p className="admin-context">ChargeKaro platform</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span className="admin-freshness">{live ? 'Live data' : 'Prototype data · not live'}</span>
      </header>
      <div className="admin-controls">
        <label className="admin-search">
          <Search className="size-4" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${itemLabel.toLowerCase()}`} aria-label={`Search ${itemLabel.toLowerCase()}`} />
        </label>
        <nav className="workspace-tabs admin-tabs" aria-label={`${itemLabel} filters`}>
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? 'is-active' : ''} type="button">{tab}</button>
          ))}
        </nav>
      </div>
      <section className="workspace-panel admin-list-panel">
        <div className="workspace-panel-head">
          <div>
            <h2>{loading ? 'Loading…' : `${visibleRows.length} ${itemLabel.toLowerCase()}${visibleRows.length === 1 ? '' : 's'}`}</h2>
            <p>{live ? 'Select an item to view full details.' : 'Select an item to view details (prototype data).'}</p>
          </div>
          <Icon className="size-5 text-primary" />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {loading ? (
          <p>Loading {itemLabel.toLowerCase()}s…</p>
        ) : (
          <>
            <ul className="workspace-list">
              {visibleRows.map((row, index) => {
                const key = row.id ?? `${row.name}-${row.value}-${row.group}-${index}`;
                const active = selectedKey === key;
                return (
                  <li className={`workspace-list-row admin-list-row ${active ? 'is-selected' : ''}`} key={key}>
                    <span className="workspace-row-icon"><Icon className="size-4" /></span>
                    <div className="workspace-row-main"><strong>{row.name}</strong><span>{row.meta}</span></div>
                    <span className="workspace-row-value">
                      {row.value}
                      <small><span className={`workspace-status ${statusTone(row.status)}`}>{row.status}</span></small>
                    </span>
                    <button type="button" onClick={() => setSelectedKey(active ? null : key)} className="admin-review">
                      {active ? <>Hide <X className="size-3" /></> : <>View details <ChevronRight className="size-3" /></>}
                    </button>
                  </li>
                );
              })}
            </ul>
            {visibleRows.length === 0 && <div className="workspace-empty"><strong>No matches</strong><p>Try another filter or search term.</p></div>}
          </>
        )}
      </section>

      {selected && (
        <section className="workspace-panel admin-detail-panel" aria-label={`${itemLabel} details`}>
          <div className="workspace-panel-head">
            <div>
              <p className="admin-context">{itemLabel} details</p>
              <h2>{selected.name}</h2>
              <p>{selected.meta}</p>
            </div>
            <button type="button" className="admin-review" onClick={() => setSelectedKey(null)} aria-label="Close details"><X className="size-4" /></button>
          </div>
          <div className="admin-detail-grid">
            <div className="admin-detail-item"><span className="admin-detail-label">Status</span><span className={`workspace-status ${statusTone(selected.status)}`}>{selected.status}</span></div>
            <div className="admin-detail-item"><span className="admin-detail-label">Summary</span><strong>{selected.value}</strong></div>
            {(selected.details && selected.details.length > 0 ? selected.details : [{ label: 'Info', value: 'No additional details available.' }]).map((d) => (
              <div className="admin-detail-item" key={`${d.label}-${d.value}`}>
                <span className="admin-detail-label">{d.label}</span>
                <strong style={{ overflowWrap: 'anywhere' }}>{d.value || '—'}</strong>
              </div>
            ))}
          </div>
          <div className="admin-detail-actions">
            <p className="admin-detail-actions__label">Actions</p>
            {selected.actions?.some((a) => a.label.toLowerCase().includes('verify')) && (
              <p className="admin-detail-actions__hint">Verify this supplier to allow the account to log in and use the platform.</p>
            )}
            <div className="admin-detail-actions__buttons">
              {selected.actions && selected.actions.length > 0 ? (
                selected.actions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className={`admin-action-btn admin-action-btn--${action.tone ?? 'default'}`}
                    onClick={() => void action.onClick()}
                    disabled={action.disabled}
                  >
                    {action.label}
                  </button>
                ))
              ) : (
                <p style={{ margin: 0, color: '#64748B', fontSize: '.84rem' }}>No actions available for this item.</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
