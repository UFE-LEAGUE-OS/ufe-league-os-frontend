import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, X } from 'lucide-react';
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

function slugifyKey(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
}

function genId() {
  return `flag-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

const EMPTY_ENVIRONMENTS: FeatureFlag['environments'] = {
  Production: { enabled: false, rollout: 0 },
  Staging: { enabled: false, rollout: 0 },
  Development: { enabled: false, rollout: 0 },
};

type FlagDraft = {
  name: string;
  key: string;
  description: string;
  primaryEnvironment: Environment;
  environments: FeatureFlag['environments'];
};

const EMPTY_DRAFT: FlagDraft = {
  name: '',
  key: '',
  description: '',
  primaryEnvironment: 'Development',
  environments: EMPTY_ENVIRONMENTS,
};

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel-card"
        style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="panel-card-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function FeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [envFilter, setEnvFilter] = useState('All Environments');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [modalMode, setModalMode] = useState<'new' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formDraft, setFormDraft] = useState<FlagDraft>(EMPTY_DRAFT);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }

  const filteredFlags = flags.filter((f) => {
    const status = overallStatus(f);
    const matchesStatus = statusFilter === 'All Status' || statusFilter === status;
    const matchesEnv = envFilter === 'All Environments' || envFilter === f.primaryEnvironment;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.key.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesEnv && matchesSearch;
  });

  function openNewFlagModal() {
    setFormDraft(EMPTY_DRAFT);
    setEditingId(null);
    setModalMode('new');
  }

  function openEditFlagModal(flag: FeatureFlag) {
    setFormDraft({
      name: flag.name,
      key: flag.key,
      description: flag.description,
      primaryEnvironment: flag.primaryEnvironment,
      environments: flag.environments,
    });
    setEditingId(flag.id);
    setModalMode('edit');
  }

  function closeModal() {
    setModalMode(null);
    setEditingId(null);
  }

  function updateFormField<K extends keyof FlagDraft>(field: K, value: FlagDraft[K]) {
    setFormDraft((prev) => ({ ...prev, [field]: value }));
  }

  function updateFormEnv(env: Environment, patch: Partial<{ enabled: boolean; rollout: number }>) {
    setFormDraft((prev) => ({
      ...prev,
      environments: {
        ...prev.environments,
        [env]: { ...prev.environments[env], ...patch },
      },
    }));
  }

  function handleNameChange(name: string) {
    setFormDraft((prev) => ({
      ...prev,
      name,
      key: modalMode === 'new' ? slugifyKey(name) : prev.key,
    }));
  }

  function handleSaveFlag() {
    if (!formDraft.name.trim()) {
      showToast('Flag name is required');
      return;
    }
    if (!formDraft.key.trim()) {
      showToast('Flag key is required');
      return;
    }
    if (modalMode === 'new' && flags.some((f) => f.key === formDraft.key)) {
      showToast('A flag with this key already exists');
      return;
    }

    const anyEnvEnabled = ENVIRONMENTS.some((env) => formDraft.environments[env].enabled);
    // Pick the primary environment as whichever is enabled with the highest rollout, falling back to the selected one
    const primaryEnvironment = anyEnvEnabled
      ? ENVIRONMENTS.filter((env) => formDraft.environments[env].enabled).sort(
          (a, b) => formDraft.environments[b].rollout - formDraft.environments[a].rollout
        )[0]
      : formDraft.primaryEnvironment;

    const record: FeatureFlag = {
      id: editingId ?? genId(),
      name: formDraft.name.trim(),
      key: formDraft.key.trim(),
      description: formDraft.description.trim(),
      primaryEnvironment,
      environments: formDraft.environments,
      updatedAt: formatToday(),
    };

    setFlags((prev) =>
      editingId ? prev.map((f) => (f.id === editingId ? record : f)) : [record, ...prev]
    );

    showToast(editingId ? 'Flag updated' : 'Flag created');
    closeModal();
  }

  function handleDeleteFlag(id: string) {
    setFlags((prev) => prev.filter((f) => f.id !== id));
    showToast('Flag deleted');
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
          <button className="button-primary" onClick={openNewFlagModal}>
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

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Feature Flag</th>
              <th>Key</th>
              <th>Environment</th>
              <th>Status</th>
              <th>Rollout</th>
              <th>Updated</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlags.map((f) => {
              const status = overallStatus(f);
              const rollout = f.environments[f.primaryEnvironment].rollout;

              return (
                <tr key={f.id}>
                  <td><strong style={{ fontSize: 13 }}>{f.name}</strong></td>
                  <td className="cell-mono">{f.key}</td>
                  <td className="cell-muted">{f.primaryEnvironment}</td>
                  <td>{statusPill(status)}</td>
                  <td className="cell-muted">{rollout}%</td>
                  <td className="cell-muted">{f.updatedAt}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="icon-btn" onClick={() => openEditFlagModal(f)} aria-label="Edit flag">
                        <Pencil size={13} />
                      </button>
                      <button className="icon-btn" onClick={() => handleDeleteFlag(f.id)} aria-label="Delete flag">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredFlags.length === 0 && (
              <tr>
                <td colSpan={7} className="cell-muted" style={{ textAlign: 'center', padding: '32px 0' }}>
                  No flags match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New / Edit flag modal */}
      {modalMode && (
        <Modal title={modalMode === 'new' ? 'New Feature Flag' : 'Edit Feature Flag'} onClose={closeModal}>
          <div className="field-group">
            <label>Flag Name</label>
            <input
              value={formDraft.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. New Checkout Flow"
              autoFocus
            />
          </div>

          <div className="field-group">
            <label>
              Key
              <span className="field-hint">Used in code — lowercase, underscores only</span>
            </label>
            <input
              value={formDraft.key}
              onChange={(e) => updateFormField('key', slugifyKey(e.target.value))}
              placeholder="e.g. new_checkout_flow"
              className="cell-mono"
              disabled={modalMode === 'edit'}
            />
          </div>

          <div className="field-group">
            <label>Description</label>
            <textarea
              rows={2}
              value={formDraft.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              placeholder="What does this flag control?"
            />
          </div>

          <div className="field-group">
            <label>Environments</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {ENVIRONMENTS.map((env) => {
                const state = formDraft.environments[env];
                return (
                  <div key={env} className="env-row">
                    <label className="env-name">
                      <input
                        type="checkbox"
                        checked={state.enabled}
                        onChange={(e) =>
                          updateFormEnv(env, {
                            enabled: e.target.checked,
                            rollout: e.target.checked ? state.rollout || 10 : 0,
                          })
                        }
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
                      onChange={(e) => updateFormEnv(env, { rollout: Number(e.target.value) })}
                    />
                    <span className="env-pct">{state.rollout}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="content-footer-actions" style={{ justifyContent: 'flex-end' }}>
            <button className="button-secondary" onClick={closeModal}>Cancel</button>
            <button className="button-primary" onClick={handleSaveFlag}>
              {modalMode === 'new' ? 'Create Flag' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}