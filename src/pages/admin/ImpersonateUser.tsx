import { useState } from 'react';
import { Search, Eye, ShieldAlert, X, CheckCircle } from 'lucide-react';

interface ImpersonateTarget {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface ImpersonationLog {
  id: string;
  adminName: string;
  targetName: string;
  targetRole: string;
  reason: string;
  startedAt: string;
  duration: string;
  actionsViewed: number;
}

const MOCK_USERS: ImpersonateTarget[] = [
  { id: 'u2', name: 'Patricia Nakato',   email: 'pat@gmail.com',   role: 'Admin',      status: 'Active' },
  { id: 'u3', name: 'John Wokorach',     email: 'john@gmail.com',  role: 'Club Owner', status: 'Active' },
  { id: 'u4', name: 'Aisha Ssempijja',   email: 'aisha@gmail.com', role: 'Fan',        status: 'Active' },
  { id: 'u5', name: 'Brian Odongo',      email: 'brian@gmail.com', role: 'Sponsor',    status: 'Active' },
  { id: 'u6', name: 'Diana Achen',       email: 'diana@gmail.com', role: 'Admin',      status: 'Active' },
  { id: 'u7', name: 'Samuel Kirabo',     email: 'sam@gmail.com',   role: 'Fan',        status: 'Active' },
];

const MOCK_LOGS: ImpersonationLog[] = [
  { id: 'l1', adminName: 'Merab Apio', targetName: 'John Wokorach',   targetRole: 'Club Owner', reason: 'Debugging club settings issue',      startedAt: '2026-07-04 14:22', duration: '8 min',  actionsViewed: 12 },
  { id: 'l2', adminName: 'Merab Apio', targetName: 'Aisha Ssempijja', targetRole: 'Fan',        reason: 'Checking ticket purchase flow',       startedAt: '2026-07-03 11:05', duration: '5 min',  actionsViewed: 7  },
  { id: 'l3', adminName: 'Merab Apio', targetName: 'Brian Odongo',    targetRole: 'Sponsor',    reason: 'Validating sponsor dashboard access', startedAt: '2026-07-02 09:40', duration: '14 min', actionsViewed: 21 },
];

export default function ImpersonateUser() {
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<ImpersonateTarget | null>(null);
  const [reason, setReason]         = useState('');
  const [activeSession, setActive]  = useState(false);
  const [confirmed, setConfirmed]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const filtered = MOCK_USERS.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const startImpersonation = () => {
    if (!reason.trim()) return;
    setActive(true);
    setShowConfirm(false);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 3000);
  };

  const endImpersonation = () => {
    setActive(false);
    setSelected(null);
    setReason('');
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h2>Impersonate User</h2>
          <p>View the platform exactly as another user sees it. Read-only — no write actions permitted.</p>
        </div>
      </div>

      {/* Warning banner */}
      <div className="adm-warn-banner">
        <ShieldAlert size={16} />
        <span>
          <strong>Read-only mode enforced.</strong> All impersonation sessions are fully audit-logged including duration, pages visited, and initiating admin. Impersonation cannot perform write operations.
        </span>
      </div>

      {/* Active session banner */}
      {activeSession && selected && (
        <div className="adm-active-session-banner">
          <Eye size={16} />
          <span>
            You are currently viewing as <strong>{selected.name}</strong> ({selected.role}) — read-only
          </span>
          <button className="adm-end-session-btn" onClick={endImpersonation}>
            <X size={14} /> End Session
          </button>
        </div>
      )}

      {confirmed && (
        <div className="adm-success-banner">
          <CheckCircle size={15} />
          Impersonation session started for <strong>{selected?.name}</strong>. Session is being recorded.
        </div>
      )}

      <div className="adm-impersonate-layout">
        {/* Left: User selector */}
        <div className="adm-impersonate-left">
          <h3 className="adm-section-title">Select a User to Impersonate</h3>
          <div className="adm-search" style={{ marginBottom: 12 }}>
            <Search size={15} />
            <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="adm-user-list">
            {filtered.map(u => (
              <div
                key={u.id}
                className={`adm-user-list-item${selected?.id === u.id ? ' adm-user-list-item-active' : ''}`}
                onClick={() => { setSelected(u); setReason(''); }}
              >
                <div className="adm-avatar">{u.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div className="adm-user-name">{u.name}</div>
                  <div className="adm-user-email">{u.email}</div>
                </div>
                <span className="adm-role-badge">{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Reason + confirm */}
        <div className="adm-impersonate-right">
          <h3 className="adm-section-title">Impersonation Details</h3>

          {selected ? (
            <div className="adm-impersonate-form">
              <div className="adm-selected-user-card">
                <div className="adm-avatar" style={{ width: 44, height: 44, fontSize: 18 }}>{selected.name[0]}</div>
                <div>
                  <div className="adm-user-name">{selected.name}</div>
                  <div className="adm-user-email">{selected.email}</div>
                  <span className="adm-role-badge" style={{ marginTop: 4, display: 'inline-block' }}>{selected.role}</span>
                </div>
              </div>

              <label className="adm-form-label">
                Reason for Impersonation *
                <textarea
                  rows={4}
                  placeholder="Describe the business reason (e.g. debugging user-reported issue #1234)…"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="adm-form-textarea"
                />
              </label>

              <div className="adm-impersonate-rules">
                <div className="adm-rule-item">✓ Read-only access — no writes permitted</div>
                <div className="adm-rule-item">✓ Session recorded in audit log</div>
                <div className="adm-rule-item">✓ User is not notified</div>
                <div className="adm-rule-item">✓ Session auto-terminates after 30 min idle</div>
              </div>

              <button
                className="adm-btn"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={!reason.trim() || activeSession}
                onClick={() => setShowConfirm(true)}
              >
                <Eye size={15} /> Start Impersonation Session
              </button>
            </div>
          ) : (
            <div className="adm-empty-state">
              <Eye size={32} style={{ color: 'var(--muted)', marginBottom: 10 }} />
              <p>Select a user from the list to begin.</p>
            </div>
          )}

          {/* Confirmation dialog */}
          {showConfirm && selected && (
            <div className="adm-modal-overlay" onClick={() => setShowConfirm(false)}>
              <div className="adm-modal" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <ShieldAlert size={22} style={{ color: 'var(--amber)' }} />
                  <h2 style={{ margin: 0 }}>Confirm Impersonation</h2>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 16 }}>
                  You are about to view the platform as <strong>{selected.name}</strong> ({selected.role}). This action will be permanently logged in the audit trail.
                </p>
                <div className="adm-modal-actions">
                  <button className="adm-btn adm-btn-ghost" onClick={() => setShowConfirm(false)}>Cancel</button>
                  <button className="adm-btn" onClick={startImpersonation}>
                    <Eye size={14} /> Confirm &amp; Start
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit history */}
      <div style={{ marginTop: 32 }}>
        <h3 className="adm-section-title" style={{ marginBottom: 12 }}>Recent Impersonation History</h3>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Target User</th>
                <th>Reason</th>
                <th>Started At</th>
                <th>Duration</th>
                <th>Pages Viewed</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LOGS.map(l => (
                <tr key={l.id}>
                  <td className="adm-user-name">{l.adminName}</td>
                  <td>
                    <div>
                      <div className="adm-user-name">{l.targetName}</div>
                      <div className="adm-user-email">{l.targetRole}</div>
                    </div>
                  </td>
                  <td className="adm-muted" style={{ fontSize: 12, maxWidth: 220 }}>{l.reason}</td>
                  <td className="adm-muted" style={{ fontSize: 12 }}>{l.startedAt}</td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{l.duration}</td>
                  <td style={{ fontSize: 13 }}>{l.actionsViewed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
