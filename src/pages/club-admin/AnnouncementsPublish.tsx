import { useState, useMemo } from 'react';
import {
  Search,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  WorkspacePanel,
  WorkspaceEmpty,
  adminWorkspaceStyles as styles,
} from '../../components/AdminWorkspaceLayout/AdminWorkspaceLayout';

type AnnouncementType = 'Alert' | 'Info';
type AnnouncementStatus = 'Scheduled' | 'Active' | 'Expired';
type AnnouncementAudience = 'All Members' | 'Active Members' | 'Pending Members';

type Announcement = {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  start: string;
  end: string;
  created_at: string;
};

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'System Maintenance on May 20',
    message: 'We will be performing system maintenance on May 20 from 10:00 PM to 11:59 PM. During this time, some services may be unavailable.',
    type: 'Alert',
    audience: 'All Members',
    status: 'Scheduled',
    start: '2024-05-18T22:00',
    end: '2024-05-20T23:59',
    created_at: '2024-05-15T10:00',
  },
  {
    id: 'ann-2',
    title: 'New Feature: Advanced Search',
    message: 'We have launched advanced search functionality. Find what you need faster and smarter with our new search features.',
    type: 'Info',
    audience: 'All Members',
    status: 'Active',
    start: '2024-05-18T09:00',
    end: '2024-05-24T23:59',
    created_at: '2024-05-18T08:00',
  },
  {
    id: 'ann-3',
    title: 'Community Guidelines Update',
    message: 'We have updated our community guidelines. Please review the changes to ensure a positive experience for all members.',
    type: 'Info',
    audience: 'Active Members',
    status: 'Active',
    start: '2024-05-08T08:00',
    end: '2024-05-21T23:59',
    created_at: '2024-05-07T14:00',
  },
  {
    id: 'ann-4',
    title: 'Holiday Schedule',
    message: 'Please note our holiday schedule for the upcoming festive season. Some services may have limited availability.',
    type: 'Alert',
    audience: 'All Members',
    status: 'Expired',
    start: '2024-04-25T00:00',
    end: '2024-05-01T23:59',
    created_at: '2024-04-20T09:00',
  },
];

function statusBadge(status: AnnouncementStatus) {
  if (status === 'Active') return <span className="badge badge-green">Active</span>;
  if (status === 'Scheduled') return <span className="badge badge-grey">Scheduled</span>;
  return <span className="badge badge-red">Expired</span>;
}

function typeBadge(type: AnnouncementType) {
  return type === 'Alert'
    ? <span className="ann-type ann-type-alert">Alert</span>
    : <span className="ann-type ann-type-info">Info</span>;
}

function formatDate(dateString: string): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AnnouncementsPublish() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesSearch =
        !searchQuery ||
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.message.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || ann.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || ann.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [announcements, searchQuery, statusFilter, typeFilter]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
    }
  };

  const handleToggleStatus = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((ann) => {
        if (ann.id !== id) return ann;

        if (ann.status === 'Active') {
          return { ...ann, status: 'Expired' as AnnouncementStatus };
        } else if (ann.status === 'Scheduled') {
          return { ...ann, status: 'Active' as AnnouncementStatus };
        }
        return ann;
      }),
    );
  };

  return (
    <>
      <WorkspacePanel
        eyebrow="Communications"
        title="Announcements"
        description="Manage and publish announcements for your club members."
        actions={
          <div className="announcements-filter-bar">
            <div className="announcements-search-wrap">
              <Search size={16} className="announcements-search-icon" />
              <input
                className="announcements-search-input"
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="announcements-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Expired">Expired</option>
            </select>
            <select
              className="announcements-filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="Alert">Alert</option>
              <option value="Info">Info</option>
            </select>
          </div>
        }
      >
        {filteredAnnouncements.length === 0 ? (
          <WorkspaceEmpty
            title="No announcements found"
            description="Create your first announcement to communicate with your members."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Audience</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnnouncements.map((ann) => (
                  <tr key={ann.id}>
                    <td>
                      <span className={styles.tablePrimary}>{ann.title}</span>
                      <span className={styles.tableSecondary}>
                        {ann.message.substring(0, 60)}
                        {ann.message.length > 60 ? '...' : ''}
                      </span>
                    </td>
                    <td>{typeBadge(ann.type)}</td>
                    <td>{ann.audience}</td>
                    <td>{statusBadge(ann.status)}</td>
                    <td>{formatDate(ann.start)}</td>
                    <td>{formatDate(ann.end)}</td>
                    <td>
                      <div className="announcements-actions">
                        <button
                          type="button"
                          className="announcements-action-button"
                          onClick={() => handleToggleStatus(ann.id)}
                          title={ann.status === 'Active' ? 'Expire' : 'Activate'}
                        >
                          {ann.status === 'Active' ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          type="button"
                          className="announcements-action-button"
                          onClick={() => handleDelete(ann.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    </>
  );
}