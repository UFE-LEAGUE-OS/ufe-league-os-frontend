import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiShield,
  FiSliders,
  FiEdit2,
  FiMoreVertical,
  FiEye,
  FiBarChart2,
  FiPlus,
  FiClock,
  FiUser,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import '../../styles/pages/landing.css';
import './SponsorPermissions.css';

const stats = [
  { icon: FiUsers, iconBg: 'sp-icon-purple', label: 'Roles', value: '05', sub: 'Total roles defined' },
  { icon: FiShield, iconBg: 'sp-icon-purple', label: 'System Permissions', value: '42', sub: 'Predefined platform permissions' },
  { icon: FiSliders, iconBg: 'sp-icon-purple', label: 'Custom Permissions', value: '08', sub: 'Organization specific permissions' },
  { icon: FiUsers, iconBg: 'sp-icon-purple', label: 'Total Assignments', value: '68', sub: 'Across all roles' },
];

const roles = [
  {
    id: 1,
    icon: FiClock,
    name: 'Admin',
    badge: 'System Role',
    desc: 'Full platform access. Can manage all sponsors, campaigns, contracts, teams, and settings.',
    sysCount: '42 / 42',
    sysPercent: 'All',
    sysColor: 'sp-perm-green',
    custCount: '8 / 8',
    custPercent: 'All',
    custColor: 'sp-perm-green',
  },
  {
    id: 2,
    icon: FiUser,
    name: 'Manager',
    badge: 'System Role',
    desc: 'Manage sponsors, campaigns, and activations. Can view reports and manage team members.',
    sysCount: '34 / 42',
    sysPercent: '81%',
    sysColor: 'sp-perm-orange',
    custCount: '5 / 8',
    custPercent: '63%',
    custColor: 'sp-perm-orange',
  },
  {
    id: 3,
    icon: FiEdit2,
    name: 'Editor',
    badge: 'System Role',
    desc: 'Create and edit campaigns, packages, and activations. Limited access to reports and settings.',
    sysCount: '22 / 42',
    sysPercent: '52%',
    sysColor: 'sp-perm-orange',
    custCount: '3 / 8',
    custPercent: '38%',
    custColor: 'sp-perm-orange',
  },
  {
    id: 4,
    icon: FiBarChart2,
    name: 'Analyst',
    badge: 'System Role',
    desc: 'View reports, analytics, and performance data. No permission to edit content.',
    sysCount: '15 / 42',
    sysPercent: '36%',
    sysColor: 'sp-perm-orange',
    custCount: '2 / 8',
    custPercent: '25%',
    custColor: 'sp-perm-orange',
  },
  {
    id: 5,
    icon: FiEye,
    name: 'Viewer',
    badge: 'System Role',
    desc: 'Read-only access to dashboards and reports. No edit or management permissions.',
    sysCount: '8 / 42',
    sysPercent: '19%',
    sysColor: 'sp-perm-red',
    custCount: '0 / 8',
    custPercent: '0%',
    custColor: 'sp-perm-red',
  },
];

export default function SponsorPermissions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'roles' | 'matrix'>('roles');

  return (
    <div className="sp-page">

      <div className="sp-layout">
        <SponsorSidebar />

        <main className="sp-main landing-page">

          {/* Header */}
          <div className="sp-header">
            <div>
              <h1 className="sp-title">Team Members</h1>
              <p className="sp-subtitle">
                Manage your corporate team members and their access.
              </p>
            </div>
            <button
              className="sp-add-role-btn"
              onClick={() => navigate('/sponsor/team/roles/new')}
            >
              Add Role <FiPlus size={16} />
            </button>
          </div>

          {/* Stats */}
          <div className="sp-stats-row">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="sp-stat-card">
                  <div className={`sp-stat-icon-wrap ${stat.iconBg}`}>
                    <Icon size={20} className="sp-stat-icon" />
                  </div>
                  <div className="sp-stat-info">
                    <div className="sp-stat-label">{stat.label}</div>
                    <div className="sp-stat-value">{stat.value}</div>
                    <div className="sp-stat-sub">{stat.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="sp-tabs">
            <button
              className={`sp-tab ${activeTab === 'roles' ? 'sp-tab-active' : ''}`}
              onClick={() => setActiveTab('roles')}
            >
              Roles
            </button>
            <button
              className={`sp-tab ${activeTab === 'matrix' ? 'sp-tab-active' : ''}`}
              onClick={() => setActiveTab('matrix')}
            >
              Permission Matrix
            </button>
          </div>

          {/* Roles table */}
          {activeTab === 'roles' && (
            <div className="sp-table-card">
              <div className="sp-table-header">
                <div className="sp-th sp-th-role">ROLE</div>
                <div className="sp-th sp-th-desc">DESCRIPTION</div>
                <div className="sp-th sp-th-sys">SYSTEM PERMISSIONS</div>
                <div className="sp-th sp-th-cust">CUSTOM PERMISSIONS</div>
                <div className="sp-th sp-th-actions">ACTIONS</div>
              </div>

              <div className="sp-table-body">
                {roles.map((role) => {
                  const Icon = role.icon;
                  return (
                    <div key={role.id} className="sp-table-row">
                      {/* Role */}
                      <div className="sp-td sp-td-role">
                        <div className="sp-role-icon-wrap">
                          <Icon size={16} className="sp-role-icon" />
                        </div>
                        <div>
                          <div className="sp-role-name">{role.name}</div>
                          <span className="sp-system-badge">{role.badge}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="sp-td sp-td-desc">
                        {role.desc}
                      </div>

                      {/* System Permissions */}
                      <div className="sp-td sp-td-sys">
                        <div className="sp-perm-count">{role.sysCount}</div>
                        <div className={`sp-perm-percent ${role.sysColor}`}>
                          {role.sysPercent}
                        </div>
                      </div>

                      {/* Custom Permissions */}
                      <div className="sp-td sp-td-cust">
                        <div className="sp-perm-count">{role.custCount}</div>
                        <div className={`sp-perm-percent ${role.custColor}`}>
                          {role.custPercent}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="sp-td sp-td-actions">
                        <button className="sp-action-btn" title="Edit">
                          <FiEdit2 size={15} />
                        </button>
                        <button className="sp-action-btn" title="More">
                          <FiMoreVertical size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Permission Matrix placeholder */}
          {activeTab === 'matrix' && (
            <div className="sp-placeholder">
              <FiShield size={32} className="sp-placeholder-icon" />
              <div className="sp-placeholder-text">Permission Matrix coming soon</div>
            </div>
          )}
        </main>

        {/* Ad panel */}
        <div className="sp-ad-panel">
          <div className="sp-ad-card sp-ad-green">
            <div className="sp-ad-content">
              <div className="sp-ad-logo-text">KCB</div>
              <div className="sp-ad-brand">BANK</div>
              <div className="sp-ad-tagline">For People. <strong>For Better.</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}