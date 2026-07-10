import { useState } from 'react';
import { Plus, Edit2, Trash2, Copy, ChevronDown, ChevronUp } from 'lucide-react';

interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
}

const MOCK_ROLES: RoleTemplate[] = [
  { id: 'r1', name: 'Super Admin',  description: 'Full platform access with all privileges.',                       userCount: 3,   permissions: ['users.*', 'roles.*', 'platform.*', 'finance.*', 'audit.*', 'impersonate'], isSystem: true },
  { id: 'r2', name: 'Admin',        description: 'Manage users, content, and platform settings.',                   userCount: 12,  permissions: ['users.read', 'users.write', 'platform.read', 'platform.write', 'audit.read'], isSystem: true },
  { id: 'r3', name: 'Club Owner',   description: 'Manage their own club, roster, and match data.',                  userCount: 89,  permissions: ['club.manage', 'roster.manage', 'fixtures.read', 'finance.club'], isSystem: true },
  { id: 'r4', name: 'Referee',      description: 'Access match assignments and submit match reports.',               userCount: 34,  permissions: ['fixtures.read', 'reports.write', 'scores.write'], isSystem: true },
  { id: 'r5', name: 'Sponsor',      description: 'View analytics, manage campaigns, and sponsorship profile.',      userCount: 56,  permissions: ['analytics.read', 'campaigns.manage', 'sponsor.profile'], isSystem: true },
  { id: 'r6', name: 'Fan',          description: 'Follow clubs, buy tickets, play fantasy, access news feed.',      userCount: 3240, permissions: ['clubs.follow', 'tickets.buy', 'fantasy.play', 'news.read'], isSystem: true },
  { id: 'r7', name: 'Media Officer', description: 'Upload media, manage club news and press releases.',             userCount: 14,  permissions: ['media.upload', 'news.write', 'clubs.read'], isSystem: false },
];

export default function RoleTemplates() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h2>Role Templates</h2>
          <p>Define and manage permission templates assigned to platform users.</p>
        </div>
        <button className="adm-btn" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> New Role Template
        </button>
      </div>

      <div className="adm-cards-grid">
        {MOCK_ROLES.map(role => (
          <div key={role.id} className="adm-card">
            <div className="adm-card-header">
              <div>
                <div className="adm-card-title">{role.name}
                  {role.isSystem && <span className="adm-tag adm-tag-purple">System</span>}
                </div>
                <div className="adm-card-sub">{role.userCount.toLocaleString()} users assigned</div>
              </div>
              <div className="adm-card-actions">
                {!role.isSystem && <button className="adm-icon-btn"><Edit2 size={14} /></button>}
                <button className="adm-icon-btn"><Copy size={14} /></button>
                {!role.isSystem && <button className="adm-icon-btn danger"><Trash2 size={14} /></button>}
              </div>
            </div>
            <p className="adm-card-desc">{role.description}</p>
            <button className="adm-expand-btn" onClick={() => setExpanded(expanded === role.id ? null : role.id)}>
              {expanded === role.id ? <><ChevronUp size={14} /> Hide permissions</> : <><ChevronDown size={14} /> View permissions ({role.permissions.length})</>}
            </button>
            {expanded === role.id && (
              <div className="adm-perms-list">
                {role.permissions.map(p => (
                  <span key={p} className="adm-perm-chip">{p}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="adm-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h2>New Role Template</h2>
            <div className="adm-form">
              <label>Role Name
                <input placeholder="e.g. League Commissioner" value={newRole.name} onChange={e => setNewRole(p => ({ ...p, name: e.target.value }))} />
              </label>
              <label>Description
                <textarea rows={3} placeholder="What can this role do?" value={newRole.description} onChange={e => setNewRole(p => ({ ...p, description: e.target.value }))} />
              </label>
            </div>
            <div className="adm-modal-actions">
              <button className="adm-btn adm-btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="adm-btn" onClick={() => setShowCreate(false)}>Create Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
