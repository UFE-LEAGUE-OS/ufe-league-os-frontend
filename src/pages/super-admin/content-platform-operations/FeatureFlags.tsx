import { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import FilterDropdown from '../../../components/FilterDropdown';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';

type FlagStatus = 'On' | 'Off';
type Environment = 'Production' | 'Staging' | 'Development';

type FeatureFlag = {
  id: string;
  name: string;
  key: string;
  primaryEnvironment: Environment;
  description: string;
  updatedAt: string;
  environments: Record<Environment, { enabled: boolean; rollout: number }>;
};

const ENVIRONMENTS: Environment[] = ['Production', 'Staging', 'Development'];

const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: 'new-dashboard',
    name: 'New Dashboard',
    key: 'new_dashboard',
    primaryEnvironment: 'Production',
    description: 'Enables the new dashboard experience for users.',
    updatedAt: 'May 13, 2024',
    environments: {
      Production: { enabled: true, rollout: 50 },
      Staging: { enabled: true, rollout: 30 },
      Development: { enabled: false, rollout: 0 },
    },
  },
  {
    id: 'advanced-search',
    name: 'Advanced Search',
    key: 'advanced_search',
    primaryEnvironment: 'Production',
    description: 'Faster, smarter search across clubs, players, and fixtures.',
    updatedAt: 'May 12, 2024',
    environments: {
      Production: { enabled: true, rollout: 100 },
      Staging: { enabled: true, rollout: 100 },
      Development: { enabled: true, rollout: 100 },
    },
  },
  {
    id: 'beta-payments-flow',
    name: 'Beta Payments Flow',
    key: 'beta_payments',
    primaryEnvironment: 'Production',
    description: 'New checkout flow for memberships and tickets.',
    updatedAt: 'May 10, 2024',
    environments: {
      Production: { enabled: false, rollout: 0 },
      Staging: { enabled: true, rollout: 40 },
      Development: { enabled: true, rollout: 100 },
    },
  },
  {
    id: 'ai-recommendations',
    name: 'AI Recommendations',
    key: 'ai_recommendations',
    primaryEnvironment: 'Staging',
    description: 'Personalized content recommendations powered by AI.',
    updatedAt: 'May 8, 2024',
    environments: {
      Production: { enabled: false, rollout: 0 },
      Staging: { enabled: true, rollout: 25 },
      Development: { enabled: true, rollout: 60 },
    },
  },
  {
    id: 'new-mobile-navigation',
    name: 'New Mobile Navigation',
    key: 'mobile_nav_v2',
    primaryEnvironment: 'Development',
    description: 'Redesigned bottom navigation for the mobile app.',
    updatedAt: 'May 5, 2024',
    environments: {
      Production: { enabled: false, rollout: 0 },
      Staging: { enabled: false, rollout: 0 },
      Development: { enabled: false, rollout: 0 },
    },
  },
];

function overallStatus(flag: FeatureFlag): FlagStatus {
  return flag.environments[flag.primaryEnvironment].enabled ? 'On' : 'Off';
}

function statusPill(status: FlagStatus) {
  return status === 'On'
    ? <span className="badge badge-green">On</span>
    : <span className="badge badge-grey">Off</span>;
}

function formatToday() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function FeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [envFilter, setEnvFilter] = useState('All Environments');
  const [search, setSearch] = useState('');
  const [activeFlagId, setActiveFlagId] = useState<string>(INITIAL_FLAGS[0].id);
  const [toast, setToast] = useState<string | null>(null);

  const activeFlag = useMemo(
    () => flags.find((f) => f.id === activeFlagId) ?? flags[0],
    [flags, activeFlagId]
  );

  const [draft, setDraft] = useState<FeatureFlag>(activeFlag);
  if (draft.id !== activeFlag.id) {
    setDraft(activeFlag);
  }

  const hasUnsavedChanges = JSON.stringify(draft.environments) !== JSON.stringify(activeFlag.environments);

  const filteredFlags = flags.filter((f) => {
    const status = overallStatus(f);
    const matchesStatus = statusFilter === 'All Status' || statusFilter === status;
    const matchesEnv = envFilter === 'All Environments' || envFilter === f.primaryEnvironment;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.key.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesEnv && matchesSearch;
  });

  function updateEnvEnabled(env: Environment, enabled: boolean) {
    setDraft((prev) => ({
      ...prev,
      environments: {
        ...prev.environments,
        [env]: { ...prev.environments[env], enabled, rollout: enabled ? prev.environments[env].rollout || 10 : 0 },
      },
    }));
  }

  function updateEnvRollout(env: Environment, rollout: number) {
    setDraft((prev) => ({
      ...prev,
      environments: {
        ...prev.environments,
        [env]: { ...prev.environments[env], rollout, enabled: rollout > 0 ? prev.environments[env].enabled : prev.environments[env].enabled },
      },
    }));
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }

  function handleSave() {
    const updated: FeatureFlag = { ...draft, updatedAt: formatToday() };
    setFlags((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    showToast('Changes saved');
  }

  function handleCancel() {
    setDraft(activeFlag);
  }

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <div className="title-group">
          <h1>Feature Flags</h1>
          <p className="panel-subtext" style={{ margin: '4px 0 0' }}>
            Control features across your platform. Changes are applied in real-time.
          </p>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {toast && (
            <span
              style={{
                fontSize: 12.5,
                color: '#A78BFA',
                background: 'rgba(139, 92, 246, 0.12)',
                padding: '6px 12px',
                borderRadius: 999,
              }}
            >
              {toast}
            </span>
          )}
          <button
            className="button-primary"
            onClick={() => {
              const id = `flag-${Date.now()}`;
              const newFlag: FeatureFlag = {
                id,
                name: 'New Flag',
                key: 'new_flag',
                primaryEnvironment: 'Development',
                description: '',
                updatedAt: formatToday(),
                environments: {
                  Production: { enabled: false, rollout: 0 },
                  Staging: { enabled: false, rollout: 0 },
                  Development: { enabled: false, rollout: 0 },
                },
              };
              setFlags((prev) => [newFlag, ...prev]);
              setActiveFlagId(id);
            }}
          >
            <Plus size={15} style={{ marginRight: 6 }} />
            New Flag
          </button>
        </div>
      </section>

      <div className="ops-toolbar">
        <FilterDropdown
          value={statusFilter}
          options={['All Status', 'On', 'Off']}
          onChange={setStatusFilter}
        />
        <FilterDropdown
          value={envFilter}
          options={['All Environments', 'Production', 'Staging', 'Development']}
          onChange={setEnvFilter}
        />
        <div className="ops-search">
          <Search size={15} />
          <input
            placeholder="Search flags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-card" style={{ marginBottom: 24 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Feature Flag</th>
              <th>Key</th>
              <th>Environment</th>
              <th>Status</th>
              <th>Rollout</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlags.map((f) => {
              const status = overallStatus(f);
              const rollout = f.environments[f.primaryEnvironment].rollout;

              return (
                <tr
                  key={f.id}
                  onClick={() => setActiveFlagId(f.id)}
                  style={{
                    cursor: 'pointer',
                    background: f.id === activeFlagId ? 'rgba(139, 92, 246, 0.08)' : undefined,
                  }}
                >
                  <td><strong style={{ fontSize: 13 }}>{f.name}</strong></td>
                  <td className="cell-mono">{f.key}</td>
                  <td className="cell-muted">{f.primaryEnvironment}</td>
                  <td>{statusPill(status)}</td>
                  <td className="cell-muted">{rollout}%</td>
                  <td className="cell-muted">{f.updatedAt}</td>
                </tr>
              );
            })}

            {filteredFlags.length === 0 && (
              <tr>
                <td colSpan={6} className="cell-muted" style={{ textAlign: 'center', padding: '32px 0' }}>
                  No flags match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="content-editor-panel">
        <div className="field-group">
          <label style={{ fontSize: 16, textTransform: 'none', letterSpacing: 0, color: 'var(--text)' }}>
            <input
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              style={{ fontSize: 16, fontWeight: 600, background: 'transparent', border: 'none', padding: '4px 0' }}
            />
          </label>
        </div>

        <div className="field-row">
          <div className="field-group">
            <label>Key</label>
            <span className="cell-mono" style={{ fontSize: 13 }}>{draft.key}</span>
          </div>

          <div className="field-group">
            <label>Environments</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {ENVIRONMENTS.map((env) => {
                const state = draft.environments[env];
                return (
                  <div key={env} className="env-row">
                    <label className="env-name">
                      <input
                        type="checkbox"
                        checked={state.enabled}
                        onChange={(e) => updateEnvEnabled(env, e.target.checked)}
                      />
                      {env}
                    </label>
                    <input
                      type="range"
                      className="mini-slider"
                      min={0}
                      max={100}
                      value={state.rollout}
                      disabled={!state.enabled}
                      onChange={(e) => updateEnvRollout(env, Number(e.target.value))}
                    />
                    <span className="env-pct">{state.rollout}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="field-group">
          <label>Description</label>
          <textarea
            rows={2}
            value={draft.description}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <div className="content-footer-bar">
          <span className="content-footer-meta">
            Last updated by Merab Apio on {activeFlag.updatedAt}, 10:15 AM
          </span>
          <div className="content-footer-actions">
            <button className="button-secondary" onClick={handleCancel} disabled={!hasUnsavedChanges}>
              Cancel
            </button>
            <button className="button-primary" onClick={handleSave} disabled={!hasUnsavedChanges}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}