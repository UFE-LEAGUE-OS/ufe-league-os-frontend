import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiGrid,
  FiSearch,
  FiChevronDown,
  FiFilter,
  FiEdit2,
  FiMoreVertical,
  FiSend,
  FiUserPlus,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import '../../styles/pages/landing.css';
import './CorporateTeamManagement.css';

const stats = [
  {
    icon: FiUsers,
    iconBg: 'ctm-icon-purple',
    label: 'Total Members',
    value: '12',
    sub: 'All team members',
    subColor: '',
  },
  {
    icon: FiCheckCircle,
    iconBg: 'ctm-icon-green',
    label: 'Active Members',
    value: '09',
    sub: '● Currently active',
    subColor: 'ctm-sub-green',
  },
  {
    icon: FiClock,
    iconBg: 'ctm-icon-orange',
    label: 'Pending Invites',
    value: '03',
    sub: '● Awaiting acceptance',
    subColor: 'ctm-sub-orange',
  },
  {
    icon: FiGrid,
    iconBg: 'ctm-icon-blue',
    label: 'Departments',
    value: '06',
    sub: 'All team members\nAcross organization',
    subColor: '',
  },
];

const members = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.kim@nilebreweries.com',
    avatar: null,
    initials: 'JD',
    isYou: true,
    role: 'Admin',
    roleColor: 'ctm-role-admin',
    roleDesc: 'Full Access',
    department: 'Sponsorships',
    status: 'Active',
    statusColor: 'ctm-status-active',
    isPending: false,
  },
  {
    id: 2,
    name: 'Amina Hassan',
    email: 'amina.hassan@nilebreweries.com',
    avatar: null,
    initials: 'AH',
    isYou: false,
    role: 'Manager',
    roleColor: 'ctm-role-manager',
    roleDesc: 'Manage & Approve',
    department: 'Marketing',
    status: 'Active',
    statusColor: 'ctm-status-active',
    isPending: false,
  },
  {
    id: 3,
    name: 'Brian Ochieng',
    email: 'brian.ochieng@nilebreweries.com',
    avatar: null,
    initials: 'BO',
    isYou: false,
    role: 'Editor',
    roleColor: 'ctm-role-editor',
    roleDesc: 'Edit & Collaborate',
    department: 'Partnerships',
    status: 'Active',
    statusColor: 'ctm-status-active',
    isPending: false,
  },
  {
    id: 4,
    name: 'Diana Namutebi',
    email: 'diana.namutebi@nilebreweries.com',
    avatar: null,
    initials: 'DN',
    isYou: false,
    role: 'Analyst',
    roleColor: 'ctm-role-analyst',
    roleDesc: 'View Analytics',
    department: 'Analytics',
    status: 'Active',
    statusColor: 'ctm-status-active',
    isPending: false,
  },
  {
    id: 5,
    name: 'Peter Kato',
    email: 'peter.kato@nilebreweries.com',
    avatar: null,
    initials: 'PK',
    isYou: false,
    role: 'Viewer',
    roleColor: 'ctm-role-viewer',
    roleDesc: 'View Only',
    department: 'Sales',
    status: 'Active',
    statusColor: 'ctm-status-active',
    isPending: false,
  },
  {
    id: 6,
    name: 'Nora Tumusiime',
    email: 'nora.tumusiime@nilebreweries.com',
    avatar: null,
    initials: 'NT',
    isYou: false,
    role: 'Viewer',
    roleColor: 'ctm-role-viewer',
    roleDesc: 'View Only',
    department: 'Finance',
    status: 'Pending',
    statusColor: 'ctm-status-pending',
    isPending: true,
  },
];

export default function CorporateTeamManagement() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [currentPage] = useState(1);

  const filtered = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="ctm-page">

      <div className="ctm-layout">
        <SponsorSidebar />

        <main className="ctm-main landing-page">

          {/* Header */}
          <div className="ctm-header">
            <div>
              <h1 className="ctm-title">Team Members</h1>
              <p className="ctm-subtitle">
                Manage your corporate team members and their access.
              </p>
            </div>
            <button
              className="ctm-invite-btn"
              onClick={() => navigate('/sponsor/team/invite')}
            >
              <FiUserPlus size={16} />
              Invite Member
            </button>
          </div>

          {/* Stats */}
          <div className="ctm-stats-row">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="ctm-stat-card">
                  <div className={`ctm-stat-icon-wrap ${stat.iconBg}`}>
                    <Icon size={20} className="ctm-stat-icon" />
                  </div>
                  <div className="ctm-stat-info">
                    <div className="ctm-stat-label">{stat.label}</div>
                    <div className="ctm-stat-value">{stat.value}</div>
                    <div className={`ctm-stat-sub ${stat.subColor}`}>
                      {stat.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search + filters */}
          <div className="ctm-controls">
            <div className="ctm-search-wrap">
              <FiSearch size={15} className="ctm-search-icon" />
              <input
                className="ctm-search"
                type="text"
                placeholder="Search members by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="ctm-filters">
              <div className="ctm-filter-select">
                All Departments <FiChevronDown size={14} />
              </div>
              <div className="ctm-filter-select">
                All Statuses <FiChevronDown size={14} />
              </div>
              <button className="ctm-filter-btn">
                <FiFilter size={15} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="ctm-table-card">
            <div className="ctm-table-header">
              <div className="ctm-th ctm-th-member">MEMBER</div>
              <div className="ctm-th ctm-th-role">ROLE</div>
              <div className="ctm-th ctm-th-dept">DEPARTMENT</div>
              <div className="ctm-th ctm-th-status">STATUS</div>
              <div className="ctm-th ctm-th-actions">ACTIONS</div>
            </div>

            <div className="ctm-table-body">
              {filtered.map((member) => (
                <div key={member.id} className="ctm-table-row">
                  {/* Member */}
                  <div className="ctm-td ctm-td-member">
                    <div className="ctm-avatar">{member.initials}</div>
                    <div className="ctm-member-info">
                      <div className="ctm-member-name-row">
                        <span className="ctm-member-name">{member.name}</span>
                        {member.isYou && (
                          <span className="ctm-you-badge">You</span>
                        )}
                      </div>
                      <div className="ctm-member-email">{member.email}</div>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="ctm-td ctm-td-role">
                    <span className={`ctm-role-badge ${member.roleColor}`}>
                      {member.role}
                    </span>
                    <div className="ctm-role-desc">{member.roleDesc}</div>
                  </div>

                  {/* Department */}
                  <div className="ctm-td ctm-td-dept">
                    {member.department}
                  </div>

                  {/* Status */}
                  <div className="ctm-td ctm-td-status">
                    <span className={`ctm-status-badge ${member.statusColor}`}>
                      ● {member.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="ctm-td ctm-td-actions">
                    {member.isPending ? (
                      <button className="ctm-action-icon-btn" title="Resend invite">
                        <FiSend size={15} />
                      </button>
                    ) : (
                      <button className="ctm-action-icon-btn" title="Edit">
                        <FiEdit2 size={15} />
                      </button>
                    )}
                    <button className="ctm-action-icon-btn" title="More">
                      <FiMoreVertical size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="ctm-pagination">
              <span className="ctm-pagination-info">
                Showing 1 to 6 of 12 members
              </span>
              <div className="ctm-pagination-controls">
                <button className="ctm-page-btn">
                  <FiChevronLeft size={15} />
                </button>
                <button className={`ctm-page-num ${currentPage === 1 ? 'ctm-page-active' : ''}`}>
                  1
                </button>
                <button className="ctm-page-num">2</button>
                <button className="ctm-page-btn">
                  <FiChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Ad panel */}
        <div className="ctm-ad-panel">
          <div className="ctm-ad-card">
            <div className="ctm-ad-placeholder">
              <div className="ctm-ad-logo">MTN</div>
              <div className="ctm-ad-brand">MTN Uganda</div>
              <div className="ctm-ad-tagline">everywhere you go</div>
              <div className="ctm-ad-sub">Y'ello everywhere you go</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}