import { useState } from 'react';
import { Search, Plus, MoreVertical, ShieldCheck, ShieldOff, Trash2, Eye, UserCog } from 'lucide-react';

type UserStatus = 'Active' | 'Suspended' | 'Pending';
type UserRole = 'Super Admin' | 'Admin' | 'Club Owner' | 'Fan' | 'Sponsor' | 'Referee';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joined: string;
  lastSeen: string;
}

const MOCK_USERS: AdminUser[] = [
  { id: 'u1', name: 'Marcus Richardson', email: 'marcus@gmail.com',  role: 'Super Admin', status: 'Active',    joined: '12 Jan 2024', lastSeen: '2m ago' },
  { id: 'u2', name: 'Patricia Nakato',   email: 'pat@gmail.com',     role: 'Admin',       status: 'Active',    joined: '3 Mar 2024',  lastSeen: '1h ago' },
  { id: 'u3', name: 'John Wokorach',     email: 'john@gmail.com',    role: 'Club Owner',  status: 'Active',    joined: '5 May 2024',  lastSeen: '3h ago' },
  { id: 'u4', name: 'Aisha Ssempijja',   email: 'aisha@gmail.com',   role: 'Fan',         status: 'Active',    joined: '1 Jun 2024',  lastSeen: 'Today' },
  { id: 'u5', name: 'Brian Odongo',      email: 'brian@gmail.com',   role: 'Sponsor',     status: 'Suspended', joined: '20 Jul 2024', lastSeen: '2d ago' },
  { id: 'u6', name: 'Ivan Magomu',       email: 'ivan@gmail.com',    role: 'Referee',     status: 'Pending',   joined: '8 Aug 2024',  lastSeen: '1w ago' },
  { id: 'u7', name: 'Diana Achen',       email: 'diana@gmail.com',   role: 'Admin',       status: 'Active',    joined: '2 Sep 2024',  lastSeen: '30m ago' },
  { id: 'u8', name: 'Samuel Kirabo',     email: 'sam@gmail.com',     role: 'Fan',         status: 'Active',    joined: '14 Oct 2024', lastSeen: 'Now' },
];

const ROLE_OPTIONS: UserRole[] = ['Super Admin', 'Admin', 'Club Owner', 'Fan', 'Sponsor', 'Referee'];

const statusColor: Record<UserStatus, string> = {
  Active:    'var(--green)',
  Suspended: 'var(--red)',
  Pending:   'var(--amber)',
};

const STATS = [
  { label: 'Pending Notifications', value: 156, accent: 'purple' },
  { label: 'Active Today',          value: '3,109', accent: 'green' },
  { label: 'Flagged',               value: 24, accent: 'red' },
];

export default function UserManagement() {
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'All'>('All');
  const [menuOpen, setMenuOpen]   = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser]     = useState({ name: '', email: '', role: 'Fan' as UserRole });

  const filtered = MOCK_USERS.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'All' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="adm-page">
      {/* Stats row */}
      <div className="adm-stats-row">
        {STATS.map(s => (
          <div key={s.label} className={`adm-stat-card accent-${s.accent}`}>
            <span className="adm-stat-value">{s.value}</span>
            <span className="adm-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="adm-toolbar">
        <div className="adm-search">
          <Search size={15} />
          <input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="adm-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}>
          <option value="All">All Roles</option>
          {ROLE_OPTIONS.map(r => <option key={r}>{r}</option>)}
        </select>
        <button className="adm-btn" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> Create New User
        </button>
        <button className="adm-btn adm-btn-ghost">
          <ShieldOff size={15} /> Suspend User
        </button>
      </div>

      {/* Table */}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Last Seen</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="adm-user-cell">
                    <div className="adm-avatar">{u.name[0]}</div>
                    <div>
                      <div className="adm-user-name">{u.name}</div>
                      <div className="adm-user-email">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td><span className="adm-role-badge">{u.role}</span></td>
                <td>
                  <span className="adm-status-dot" style={{ background: statusColor[u.status] }} />
                  {u.status}
                </td>
                <td className="adm-muted">{u.joined}</td>
                <td className="adm-muted">{u.lastSeen}</td>
                <td>
                  <div className="adm-actions-wrap">
                    <button className="adm-icon-btn" title="View profile">
                      <Eye size={14} />
                    </button>
                    <button className="adm-icon-btn" title="Edit role">
                      <UserCog size={14} />
                    </button>
                    <button
                      className={`adm-icon-btn${u.status === 'Suspended' ? '' : ' danger'}`}
                      title={u.status === 'Suspended' ? 'Restore access' : 'Suspend user'}
                    >
                      {u.status === 'Suspended' ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                    </button>
                    <div className="adm-more-wrap">
                      <button
                        className="adm-icon-btn"
                        title="More actions"
                        onClick={() => setMenuOpen(menuOpen === u.id ? null : u.id)}
                      >
                        <MoreVertical size={14} />
                      </button>
                      {menuOpen === u.id && (
                        <div className="adm-dropdown">
                          <button onClick={() => setMenuOpen(null)}>
                            <Eye size={13} /> View Profile
                          </button>
                          <button onClick={() => setMenuOpen(null)}>
                            <UserCog size={13} /> Edit Role
                          </button>
                          <button onClick={() => setMenuOpen(null)}>
                            <ShieldCheck size={13} /> Restore Access
                          </button>
                          <button onClick={() => setMenuOpen(null)} style={{ color: 'var(--red)' }}>
                            <Trash2 size={13} /> Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="adm-table-footer">Showing {filtered.length} of {MOCK_USERS.length} users</div>

      {/* Create user modal */}
      {showCreate && (
        <div className="adm-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h2>Create New User</h2>
            <div className="adm-form">
              <label>Full Name
                <input type="text" placeholder="Enter full name" value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} />
              </label>
              <label>Email
                <input type="email" placeholder="user@example.com" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} />
              </label>
              <label>Role
                <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value as UserRole }))}>
                  {ROLE_OPTIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </label>
            </div>
            <div className="adm-modal-actions">
              <button className="adm-btn adm-btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="adm-btn" onClick={() => setShowCreate(false)}>Create User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
