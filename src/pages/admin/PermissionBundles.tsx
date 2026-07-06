import { useState } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';

interface Bundle {
  id: string;
  name: string;
  category: string;
  permissions: string[];
  assignedRoles: string[];
}

const MOCK_BUNDLES: Bundle[] = [
  { id: 'b1', name: 'Club Management',    category: 'Platform',   permissions: ['club.create','club.update','club.delete','roster.manage','club.finance'], assignedRoles: ['Club Owner', 'Admin'] },
  { id: 'b2', name: 'Financial Access',   category: 'Finance',    permissions: ['finance.read','finance.export','payments.manage','invoices.create'],      assignedRoles: ['Super Admin', 'Admin'] },
  { id: 'b3', name: 'Match Operations',   category: 'Fixtures',   permissions: ['fixtures.create','scores.write','reports.submit','officials.assign'],      assignedRoles: ['Admin', 'Referee'] },
  { id: 'b4', name: 'Audit & Compliance', category: 'Governance', permissions: ['audit.read','audit.export','sessions.view','impersonate.readonly'],         assignedRoles: ['Super Admin'] },
  { id: 'b5', name: 'Content & Media',    category: 'Content',    permissions: ['news.write','media.upload','press.manage','notifications.send'],            assignedRoles: ['Admin', 'Media Officer'] },
  { id: 'b6', name: 'Fan Engagement',     category: 'Fan',        permissions: ['polls.create','mvp.manage','fantasy.admin','quizzes.manage'],               assignedRoles: ['Admin'] },
  { id: 'b7', name: 'Sponsorship',        category: 'Sponsor',    permissions: ['sponsor.approve','campaigns.review','analytics.export','packages.manage'],  assignedRoles: ['Super Admin', 'Admin'] },
];

const CATEGORIES = ['All', 'Platform', 'Finance', 'Fixtures', 'Governance', 'Content', 'Fan', 'Sponsor'];

export default function PermissionBundles() {
  const [catFilter, setCatFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = MOCK_BUNDLES.filter(b => catFilter === 'All' || b.category === catFilter);

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h2>Permission Bundles</h2>
          <p>Group related permissions into reusable bundles and assign them to roles.</p>
        </div>
        <button className="adm-btn" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> New Bundle
        </button>
      </div>

      {/* Category filter chips */}
      <div className="adm-chips-row">
        {CATEGORIES.map(c => (
          <button key={c} className={`adm-chip${catFilter === c ? ' adm-chip-active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
        ))}
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Bundle</th>
              <th>Category</th>
              <th>Permissions</th>
              <th>Assigned Roles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id}>
                <td>
                  <div className="adm-user-cell">
                    <div className="adm-avatar" style={{ background: 'var(--purple-tint)', color: 'var(--purple)' }}>
                      <Package size={14} />
                    </div>
                    <span className="adm-user-name">{b.name}</span>
                  </div>
                </td>
                <td><span className="adm-tag adm-tag-gray">{b.category}</span></td>
                <td>
                  <div className="adm-perms-inline">
                    {b.permissions.slice(0, 3).map(p => <span key={p} className="adm-perm-chip">{p}</span>)}
                    {b.permissions.length > 3 && <span className="adm-perm-chip adm-perm-more">+{b.permissions.length - 3}</span>}
                  </div>
                </td>
                <td>
                  <div className="adm-perms-inline">
                    {b.assignedRoles.map(r => <span key={r} className="adm-role-badge">{r}</span>)}
                  </div>
                </td>
                <td>
                  <div className="adm-actions-wrap">
                    <button className="adm-icon-btn"><Edit2 size={14} /></button>
                    <button className="adm-icon-btn danger"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="adm-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h2>New Permission Bundle</h2>
            <div className="adm-form">
              <label>Bundle Name<input placeholder="e.g. Ticketing Operations" /></label>
              <label>Category
                <select><option>Platform</option><option>Finance</option><option>Fixtures</option><option>Governance</option></select>
              </label>
              <label>Permissions (comma separated)<textarea rows={3} placeholder="tickets.create, tickets.manage, …" /></label>
            </div>
            <div className="adm-modal-actions">
              <button className="adm-btn adm-btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="adm-btn" onClick={() => setShowCreate(false)}>Save Bundle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
