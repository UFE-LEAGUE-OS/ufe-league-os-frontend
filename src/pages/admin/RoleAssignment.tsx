import { useState } from 'react';
import { Search, UserCog, Save, RefreshCw } from 'lucide-react';

type UserRole = 'Super Admin' | 'Admin' | 'Club Owner' | 'Fan' | 'Sponsor' | 'Referee' | 'Media Officer';

interface Assignment {
  userId: string;
  name: string;
  email: string;
  currentRole: UserRole;
  overrideRole: UserRole | null;
  overrideReason: string;
  overrideBy: string;
  overrideDate: string;
}

const ROLES: UserRole[] = ['Super Admin', 'Admin', 'Club Owner', 'Fan', 'Sponsor', 'Referee', 'Media Officer'];

const MOCK: Assignment[] = [
  { userId: 'u1', name: 'Marcus Richardson', email: 'marcus@gmail.com', currentRole: 'Admin',       overrideRole: 'Super Admin',   overrideReason: 'Temp promotion for onboarding', overrideBy: 'Merab Apio', overrideDate: '2 days ago' },
  { userId: 'u2', name: 'Patricia Nakato',   email: 'pat@gmail.com',   currentRole: 'Club Owner',   overrideRole: null,            overrideReason: '',                              overrideBy: '',           overrideDate: '' },
  { userId: 'u3', name: 'John Wokorach',     email: 'john@gmail.com',  currentRole: 'Fan',          overrideRole: 'Sponsor',       overrideReason: 'Pilot sponsor program',         overrideBy: 'Merab Apio', overrideDate: '1 week ago' },
  { userId: 'u4', name: 'Aisha Ssempijja',   email: 'aisha@gmail.com', currentRole: 'Referee',      overrideRole: null,            overrideReason: '',                              overrideBy: '',           overrideDate: '' },
  { userId: 'u5', name: 'Brian Odongo',      email: 'brian@gmail.com', currentRole: 'Media Officer',overrideRole: null,            overrideReason: '',                              overrideBy: '',           overrideDate: '' },
];

export default function RoleAssignment() {
  const [search, setSearch] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ role: UserRole; reason: string }>({ role: 'Fan', reason: '' });

  const filtered = assignments.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (a: Assignment) => {
    setEditing(a.userId);
    setDraft({ role: a.overrideRole ?? a.currentRole, reason: a.overrideReason });
  };

  const saveOverride = (userId: string) => {
    setAssignments(prev => prev.map(a =>
      a.userId === userId
        ? { ...a, overrideRole: draft.role !== a.currentRole ? draft.role : null, overrideReason: draft.reason, overrideBy: 'You', overrideDate: 'Just now' }
        : a
    ));
    setEditing(null);
  };

  const clearOverride = (userId: string) => {
    setAssignments(prev => prev.map(a => a.userId === userId ? { ...a, overrideRole: null, overrideReason: '', overrideBy: '', overrideDate: '' } : a));
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h2>Role Assignment &amp; Overrides</h2>
          <p>Assign roles to users and manage temporary role overrides with audit trail.</p>
        </div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-search">
          <Search size={15} />
          <input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Current Role</th>
              <th>Override Role</th>
              <th>Override Reason</th>
              <th>By / When</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.userId}>
                <td>
                  <div className="adm-user-cell">
                    <div className="adm-avatar">{a.name[0]}</div>
                    <div>
                      <div className="adm-user-name">{a.name}</div>
                      <div className="adm-user-email">{a.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="adm-role-badge">{a.currentRole}</span></td>
                <td>
                  {editing === a.userId ? (
                    <select className="adm-inline-select" value={draft.role} onChange={e => setDraft(p => ({ ...p, role: e.target.value as UserRole }))}>
                      {ROLES.map(r => <option key={r}>{r}</option>)}
                    </select>
                  ) : a.overrideRole ? (
                    <span className="adm-role-badge" style={{ background: 'var(--amber-tint)', color: 'var(--amber)' }}>{a.overrideRole}</span>
                  ) : <span className="adm-muted">—</span>}
                </td>
                <td>
                  {editing === a.userId ? (
                    <input className="adm-inline-input" placeholder="Reason for override…" value={draft.reason} onChange={e => setDraft(p => ({ ...p, reason: e.target.value }))} />
                  ) : <span className="adm-muted" style={{ fontSize: 12 }}>{a.overrideReason || '—'}</span>}
                </td>
                <td>
                  {a.overrideBy ? (
                    <div style={{ fontSize: 11 }}>
                      <div>{a.overrideBy}</div>
                      <div className="adm-muted">{a.overrideDate}</div>
                    </div>
                  ) : <span className="adm-muted">—</span>}
                </td>
                <td>
                  <div className="adm-actions-wrap">
                    {editing === a.userId ? (
                      <button className="adm-btn" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => saveOverride(a.userId)}>
                        <Save size={12} /> Save
                      </button>
                    ) : (
                      <button className="adm-icon-btn" title="Edit override" onClick={() => startEdit(a)}>
                        <UserCog size={14} />
                      </button>
                    )}
                    {a.overrideRole && (
                      <button className="adm-icon-btn danger" title="Clear override" onClick={() => clearOverride(a.userId)}>
                        <RefreshCw size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
