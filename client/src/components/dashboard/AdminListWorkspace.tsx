import { useMemo, useState, type ComponentType } from 'react';
import { Check, ChevronRight, Search } from 'lucide-react';

export type Row = { name: string; meta: string; status: string; value: string; group: string };
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

export default function AdminListWorkspace({ title, description, itemLabel, tabs, rows, icon: Icon, loading, error, live }: AdminListWorkspaceProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState(tabs[0] ?? 'All');
  const [reviewed, setReviewed] = useState<number[]>([]);
  const visibleRows = useMemo(
    () => rows.filter((row) => (activeTab === tabs[0] || row.group === activeTab) && `${row.name} ${row.meta}`.toLowerCase().includes(query.toLowerCase())),
    [activeTab, query, rows, tabs]
  );
  const toggleReview = (index: number) => setReviewed((current) => (current.includes(index) ? current.filter((entry) => entry !== index) : [...current, index]));

  return (
    <div className="admin-page">
      <header className="workspace-head">
        <div>
          <p className="admin-context">GreenCharge platform</p>
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
            <p>{live ? 'Platform oversight data from the admin API.' : 'Review actions update this front-end preview only.'}</p>
          </div>
          <Icon className="size-5 text-primary" />
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {loading ? (
          <p>Loading {itemLabel.toLowerCase()}s…</p>
        ) : (
          <>
            <ul className="workspace-list">
              {visibleRows.map((row, index) => (
                <li className="workspace-list-row admin-list-row" key={`${row.name}-${row.value}-${row.group}-${index}`}>
                  <span className="workspace-row-icon"><Icon className="size-4" /></span>
                  <div className="workspace-row-main"><strong>{row.name}</strong><span>{row.meta}</span></div>
                  <span className="workspace-row-value">
                    {row.value}
                    <small><span className={`workspace-status ${row.status === 'Pending' || row.status === 'Attention' ? 'workspace-status--warning' : row.status === 'Offline' || row.status === 'Suspended' || row.status === 'Rejected' || row.status === 'Cancelled' || row.status === 'Expired' ? 'workspace-status--muted' : ''}`}>{row.status}</span></small>
                  </span>
                  <button type="button" onClick={() => toggleReview(index)} className={`admin-review ${reviewed.includes(index) ? 'is-reviewed' : ''}`}>
                    {reviewed.includes(index) ? <><Check className="size-3" /> Reviewed</> : <>Review <ChevronRight className="size-3" /></>}
                  </button>
                </li>
              ))}
            </ul>
            {visibleRows.length === 0 && <div className="workspace-empty"><strong>No matches</strong><p>Try another filter or search term.</p></div>}
          </>
        )}
      </section>
    </div>
  );
}
