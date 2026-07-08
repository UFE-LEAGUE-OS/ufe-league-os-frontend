import { useState } from 'react';
import { Search, Download, Filter, ShieldCheck, UserCog, Eye, LogIn, LogOut, Trash2 } from 'lucide-react';

type ActionType = 'role_assigned' | 'role_removed' | 'override_set' | 'user_created' | 'user_suspended' | 'impersonation' | 'login' | 'logout' | 'permission_changed';

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: ActionType;
  target: string;
  details: string;
  ip: string;
}

const ACTION_LABELS: Record<ActionType, string> = {
  role_assigned:     'Role Assigned',
  role_removed:      'Role Removed',
  override_set:      'Override Set',
  user_created:      'User Created',
  user_suspended:    'User Suspended',
  impersonation:     'Impersonation',
  login:             'Login',
  logout:            'Logout',
  permission_changed:'Permission Changed',
};

const ACTION_COLORS: Record<ActionType, string> = {
  role_assigned:     'var(--green)',
  role_removed:      'var(--red)',
  override_set:      'var(--amber)',
  user_created:      'var(--purple)',
  user_suspended:    'var(--red)',
  impersonation:     'var(--amber)',
  login:             'var(--muted)',
  logout:            'var(--muted)',
  permission_changed:'var(--purple)',
};

const ACTION_ICONS: Record<ActionType, React.ReactNode> = {
  role_assigned:     <ShieldCheck size={13} />,
  role_removed:      <Trash2 size={13} />,
  override_set:      <UserCog size={13} />,
  user_created:      <UserCog size={13} />,
  user_suspended:    <ShieldCheck size={13} />,
  impersonation:     <Eye size={13} />,
  login:             <LogIn size={13} />,
  logout:            <LogOut size={13} />,
  permission_changed:<Filter size={13} />,
};

const MOCK_ENTRIES: AuditEntry[] = [
  { id: 'a1',  timestamp: '2026-07-04 17:32', actor: 'Merab Apio',        actorRole: 'Super Admin', action: 'role_assigned',     target: 'Marcus Richardson', details: 'Assigned role: Admin',                  ip: '192.168.1.12' },
  { id: 'a2',  timestamp: '2026-07-04 17:18', actor: 'Merab Apio',        actorRole: 'Super Admin', action: 'impersonation',     target: 'John Wokorach',     details: 'Impersonated for debugging (read-only)', ip: '192.168.1.12' },
  { id: 'a3',  timestamp: '2026-07-04 16:55', actor: 'Patricia Nakato',   actorRole: 'Admin',       action: 'user_created',      target: 'Aisha Ssempijja',   details: 'New user created with role: Fan',       ip: '10.0.0.5' },
  { id: 'a4',  timestamp: '2026-07-04 16:40', actor: 'Merab Apio',        actorRole: 'Super Admin', action: 'override_set',      target: 'Brian Odongo',      details: 'Temp override: Sponsor (pilot program)', ip: '192.168.1.12' },
  { id: 'a5',  timestamp: '2026-07-04 15:22', actor: 'Patricia Nakato',   actorRole: 'Admin',       action: 'user_suspended',    target: 'Anon User #44',     details: 'Suspended for ToS violation',           ip: '10.0.0.5' },
  { id: 'a6',  timestamp: '2026-07-04 14:10', actor: 'Merab Apio',        actorRole: 'Super Admin', action: 'permission_changed',target: 'Sponsor Role',      details: 'analytics.export added to bundle',      ip: '192.168.1.12' },
  { id: 'a7',  timestamp: '2026-07-04 13:45', actor: 'System',            actorRole: 'System',      action: 'login',             target: 'Diana Achen',       details: 'Successful login',                      ip: '41.220.5.100' },
  { id: 'a8',  timestamp: '2026-07-04 12:30', actor: 'Merab Apio',        actorRole: 'Super Admin', action: 'role_removed',      target: 'Ivan Magomu',       details: 'Role removed: Media Officer',           ip: '192.168.1.12' },
];

export default function AuditLog() {
  const [search, setSearch]         = useState('');
  const [actionFilter, setActionFilter] = useState<ActionType | 'All'>('All');

  const filtered = MOCK_ENTRIES.filter(e => {
    const matchSearch = e.actor.toLowerCase().includes(search.toLowerCase()) ||
                        e.target.toLowerCase().includes(search.toLowerCase()) ||
                        e.details.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'All' || e.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h2>Role Assignment Audit Log</h2>
          <p>Immutable record of all role changes, overrides, and governance actions.</p>
        </div>
        <button className="adm-btn adm-btn-ghost">
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="adm-toolbar">
        <div className="adm-search">
          <Search size={15} />
          <input placeholder="Search by actor, target or details…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="adm-select" value={actionFilter} onChange={e => setActionFilter(e.target.value as typeof actionFilter)}>
          <option value="All">All Actions</option>
          {(Object.keys(ACTION_LABELS) as ActionType[]).map(a => <option key={a} value={a}>{ACTION_LABELS[a]}</option>)}
        </select>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id}>
                <td className="adm-muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{e.timestamp}</td>
                <td>
                  <div className="adm-user-cell">
                    <div className="adm-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{e.actor[0]}</div>
                    <div>
                      <div className="adm-user-name" style={{ fontSize: 12 }}>{e.actor}</div>
                      <div className="adm-user-email">{e.actorRole}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="adm-action-badge" style={{ color: ACTION_COLORS[e.action], background: ACTION_COLORS[e.action] + '18' }}>
                    {ACTION_ICONS[e.action]}
                    {ACTION_LABELS[e.action]}
                  </span>
                </td>
                <td className="adm-user-name" style={{ fontSize: 13 }}>{e.target}</td>
                <td className="adm-muted" style={{ fontSize: 12, maxWidth: 240 }}>{e.details}</td>
                <td className="adm-muted" style={{ fontSize: 11, fontFamily: 'monospace' }}>{e.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="adm-table-footer">Showing {filtered.length} of {MOCK_ENTRIES.length} entries</div>
    </div>
  );
}
