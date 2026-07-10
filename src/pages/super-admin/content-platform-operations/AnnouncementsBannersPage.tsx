import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Megaphone, Plus } from 'lucide-react';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css';
import '../../../styles/pages/super-admin/content-platform-operations/AnnouncementsBannersPage.css';

const tabs = ['Announcements', 'Banners'] as const;
type Tab = typeof tabs[number];

type Announcement = {
  title: string;
  type: 'Alert' | 'Info';
  audience: string;
  status: 'Scheduled' | 'Active' | 'Expired';
  start: string;
  end: string;
};

const ANNOUNCEMENTS: Announcement[] = [
  { title: 'System Maintenance on May 20', type: 'Alert', audience: 'All Users', status: 'Scheduled', start: 'May 18, 2024 10:00 PM', end: 'May 20, 2024 11:59 PM' },
  { title: 'New Feature: Advanced Search', type: 'Info', audience: 'All Users', status: 'Active', start: 'May 18, 2024 9:00 AM', end: 'May 24, 2024 11:59 PM' },
  { title: 'Community Guidelines Update', type: 'Info', audience: 'All Users', status: 'Active', start: 'May 8, 2024 8:00 AM', end: 'May 21, 2024 11:59 PM' },
  { title: 'Holiday Schedule', type: 'Alert', audience: 'All Users', status: 'Expired', start: 'Apr 25, 2024', end: 'May 1, 2024' },
];

function statusBadge(status: Announcement['status']) {
  if (status === 'Active') return <span className="badge badge-green">Active</span>;
  if (status === 'Scheduled') return <span className="badge badge-grey">Scheduled</span>;
  return <span className="badge badge-red">Expired</span>;
}

function typeBadge(type: Announcement['type']) {
  return type === 'Alert'
    ? <span className="ann-type ann-type-alert">Alert</span>
    : <span className="ann-type ann-type-info">Info</span>;
}

export default function AnnouncementsBannersPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Announcements');
  const [search, setSearch] = useState('');

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <div className="title-group">
          <div className="breadcrumb">Content &amp; Platform &nbsp;›&nbsp; Announcements &amp; Banners</div>
          <h1>Announcements &amp; Banners</h1>
        </div>
        <div className="page-actions">
          <button className="button-primary">
            <Plus size={15} style={{ marginRight: 6 }} />
            New Announcement
          </button>
        </div>
      </section>

      <div className="content-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`content-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Announcements' && (
        <>
          <div className="ops-toolbar">
            <select className="page-select">
              <option>All Types</option>
              <option>Alert</option>
              <option>Info</option>
            </select>
            <select className="page-select">
              <option>All Status</option>
              <option>Scheduled</option>
              <option>Active</option>
              <option>Expired</option>
            </select>
            <div className="ops-search">
              <Search size={15} />
              <input
                placeholder="Search announcements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Audience</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {ANNOUNCEMENTS.filter((a) =>
                  a.title.toLowerCase().includes(search.toLowerCase())
                ).map((a) => (
                  <tr key={a.title}>
                    <td>{a.title}</td>
                    <td>{typeBadge(a.type)}</td>
                    <td className="cell-muted">{a.audience}</td>
                    <td>{statusBadge(a.status)}</td>
                    <td className="cell-muted">{a.start}</td>
                    <td className="cell-muted">{a.end}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="table-pagination">
              <span>Showing 1 to 4 of 4</span>
              <div className="pager">
                <button disabled><ChevronLeft size={14} /></button>
                <button className="current">1</button>
                <button><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>

          <div className="panel-card banner-preview-card">
            <div className="panel-card-header">
              <h3>Active Banner Preview</h3>
              <button className="button-secondary">Manage Banners</button>
            </div>
            <div className="banner-preview">
              <span className="banner-preview-icon"><Megaphone size={18} /></span>
              <div>
                <strong>New Feature: Advanced Search</strong>
                <p>Find what you need faster and smarter.</p>
              </div>
              <button className="link-inline banner-preview-cta">Learn more</button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'Banners' && (
        <div className="content-editor-panel">
          <p className="panel-empty-hint">
            Manage the banners shown across the public site and dashboard. Reorder, schedule,
            or retire banners from here.
          </p>
        </div>
      )}
    </main>
  );
}