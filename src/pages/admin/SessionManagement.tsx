import { useState } from 'react';
import { Search, LogOut, ShieldOff, Monitor, Smartphone, Globe } from 'lucide-react';

type DeviceType = 'desktop' | 'mobile' | 'tablet';
type SessionStatus = 'Active' | 'Idle' | 'Expired';

interface Session {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  device: DeviceType;
  browser: string;
  ip: string;
  location: string;
  startedAt: string;
  lastActive: string;
  status: SessionStatus;
}

const MOCK_SESSIONS: Session[] = [
  { id: 's1', userId: 'u1', userName: 'Merab Apio',        userRole: 'Super Admin', device: 'desktop', browser: 'Chrome 124',  ip: '192.168.1.12', location: 'Kampala, UG',  startedAt: '09:14',  lastActive: 'Now',    status: 'Active' },
  { id: 's2', userId: 'u2', userName: 'Patricia Nakato',   userRole: 'Admin',       device: 'desktop', browser: 'Firefox 125', ip: '10.0.0.5',     location: 'Entebbe, UG',  startedAt: '10:02',  lastActive: '3m ago', status: 'Active' },
  { id: 's3', userId: 'u3', userName: 'John Wokorach',     userRole: 'Club Owner',  device: 'mobile',  browser: 'Safari 17',   ip: '41.220.5.100', location: 'Jinja, UG',    startedAt: '08:45',  lastActive: '18m ago',status: 'Idle' },
  { id: 's4', userId: 'u4', userName: 'Aisha Ssempijja',   userRole: 'Fan',         device: 'mobile',  browser: 'Chrome 124',  ip: '102.0.0.1',    location: 'Nairobi, KE',  startedAt: '11:30',  lastActive: '1h ago', status: 'Idle' },
  { id: 's5', userId: 'u5', userName: 'Brian Odongo',      userRole: 'Sponsor',     device: 'desktop', browser: 'Edge 123',    ip: '196.0.0.22',   location: 'Kampala, UG',  startedAt: 'Yesterday', lastActive: '2d ago',status: 'Expired' },
  { id: 's6', userId: 'u6', userName: 'Diana Achen',       userRole: 'Admin',       device: 'tablet',  browser: 'Safari 17',   ip: '172.16.0.3',   location: 'Gulu, UG',     startedAt: '13:00',  lastActive: '5m ago', status: 'Active' },
  { id: 's7', userId: 'u7', userName: 'Samuel Kirabo',     userRole: 'Fan',         device: 'mobile',  browser: 'Chrome 124',  ip: '41.210.1.50',  location: 'Mbarara, UG',  startedAt: '14:22',  lastActive: '2m ago', status: 'Active' },
];

const DeviceIcon = ({ type }: { type: DeviceType }) => {
  if (type === 'mobile')  return <Smartphone size={14} />;
  if (type === 'tablet')  return <Monitor size={14} />;
  return <Monitor size={14} />;
};

const statusColor: Record<SessionStatus, string> = {
  Active:  'var(--green)',
  Idle:    'var(--amber)',
  Expired: 'var(--muted)',
};

export default function SessionManagement() {
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState<SessionStatus | 'All'>('All');
  const [sessions, setSessions]   = useState<Session[]>(MOCK_SESSIONS);

  const filtered = sessions.filter(s => {
    const matchSearch = s.userName.toLowerCase().includes(search.toLowerCase()) ||
                        s.ip.includes(search) || s.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const terminate = (id: string) => setSessions(prev => prev.filter(s => s.id !== id));
  const terminateAll = () => setSessions(prev => prev.filter(s => s.userId === 'u1')); // keep own session

  const active  = sessions.filter(s => s.status === 'Active').length;
  const idle    = sessions.filter(s => s.status === 'Idle').length;
  const expired = sessions.filter(s => s.status === 'Expired').length;

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h2>Session Management &amp; Access Control</h2>
          <p>Monitor active sessions, enforce access controls, and terminate suspicious activity.</p>
        </div>
        <button className="adm-btn" style={{ background: 'var(--red)' }} onClick={terminateAll}>
          <ShieldOff size={15} /> Terminate All (except yours)
        </button>
      </div>

      {/* Stats */}
      <div className="adm-stats-row">
        <div className="adm-stat-card accent-green">
          <span className="adm-stat-value">{active}</span>
          <span className="adm-stat-label">Active Sessions</span>
        </div>
        <div className="adm-stat-card accent-amber">
          <span className="adm-stat-value">{idle}</span>
          <span className="adm-stat-label">Idle Sessions</span>
        </div>
        <div className="adm-stat-card accent-purple">
          <span className="adm-stat-value">{expired}</span>
          <span className="adm-stat-label">Expired</span>
        </div>
        <div className="adm-stat-card accent-purple">
          <span className="adm-stat-value">{sessions.length}</span>
          <span className="adm-stat-label">Total Sessions</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="adm-toolbar">
        <div className="adm-search">
          <Search size={15} />
          <input placeholder="Search by user, IP or location…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="adm-select" value={statusFilter} onChange={e => setStatus(e.target.value as typeof statusFilter)}>
          <option value="All">All Status</option>
          <option>Active</option>
          <option>Idle</option>
          <option>Expired</option>
        </select>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Device</th>
              <th>IP Address</th>
              <th>Location</th>
              <th>Started</th>
              <th>Last Active</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td>
                  <div className="adm-user-cell">
                    <div className="adm-avatar">{s.userName[0]}</div>
                    <div>
                      <div className="adm-user-name">{s.userName}</div>
                      <div className="adm-user-email">{s.userRole}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="adm-user-cell" style={{ gap: 6 }}>
                    <span style={{ color: 'var(--muted)' }}><DeviceIcon type={s.device} /></span>
                    <span style={{ fontSize: 12 }}>{s.browser}</span>
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.ip}</td>
                <td>
                  <div className="adm-user-cell" style={{ gap: 5 }}>
                    <Globe size={12} style={{ color: 'var(--muted)' }} />
                    <span style={{ fontSize: 12 }}>{s.location}</span>
                  </div>
                </td>
                <td className="adm-muted" style={{ fontSize: 12 }}>{s.startedAt}</td>
                <td className="adm-muted" style={{ fontSize: 12 }}>{s.lastActive}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <span className="adm-status-dot" style={{ background: statusColor[s.status] }} />
                    {s.status}
                  </div>
                </td>
                <td>
                  {s.userId !== 'u1' && (
                    <button className="adm-icon-btn danger" title="Terminate session" onClick={() => terminate(s.id)}>
                      <LogOut size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="adm-table-footer">Showing {filtered.length} of {sessions.length} sessions</div>
    </div>
  );
}
