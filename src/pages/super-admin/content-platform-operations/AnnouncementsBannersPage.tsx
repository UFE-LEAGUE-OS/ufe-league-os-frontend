import { useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Plus,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  GripVertical,
} from 'lucide-react';
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

type BannerStatus = 'Active' | 'Scheduled' | 'Draft' | 'Expired';

type Banner = {
  id: string;
  title: string;
  message: string;
  placement: string;
  status: BannerStatus;
  start: string;
  end: string;
};

const ANNOUNCEMENTS: Announcement[] = [
  { title: 'System Maintenance on May 20', type: 'Alert', audience: 'All Users', status: 'Scheduled', start: 'May 18, 2024 10:00 PM', end: 'May 20, 2024 11:59 PM' },
  { title: 'New Feature: Advanced Search', type: 'Info', audience: 'All Users', status: 'Active', start: 'May 18, 2024 9:00 AM', end: 'May 24, 2024 11:59 PM' },
  { title: 'Community Guidelines Update', type: 'Info', audience: 'All Users', status: 'Active', start: 'May 8, 2024 8:00 AM', end: 'May 21, 2024 11:59 PM' },
  { title: 'Holiday Schedule', type: 'Alert', audience: 'All Users', status: 'Expired', start: 'Apr 25, 2024', end: 'May 1, 2024' },
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'b1',
    title: 'New Feature: Advanced Search',
    message: 'Find what you need faster and smarter.',
    placement: 'Dashboard Top',
    status: 'Active',
    start: 'May 18, 2024',
    end: 'May 24, 2024',
  },
  {
    id: 'b2',
    title: 'Season Ticket Renewals Open',
    message: 'Lock in your seat before prices go up.',
    placement: 'Homepage Hero',
    status: 'Scheduled',
    start: 'Jun 1, 2024',
    end: 'Jun 15, 2024',
  },
  {
    id: 'b3',
    title: 'Fantasy League Registration',
    message: 'Build your squad for the new season.',
    placement: 'Fantasy Hub',
    status: 'Draft',
    start: '—',
    end: '—',
  },
  {
    id: 'b4',
    title: 'Holiday Fixture Notice',
    message: 'Updated kickoff times for the holiday round.',
    placement: 'Homepage Hero',
    status: 'Expired',
    start: 'Apr 20, 2024',
    end: 'Apr 27, 2024',
  },
];

function statusBadge(status: Announcement['status']) {
  if (status === 'Active') return <span className="badge badge-green">Active</span>;
  if (status === 'Scheduled') return <span className="badge badge-grey">Scheduled</span>;
  return <span className="badge badge-red">Expired</span>;
}

function bannerStatusBadge(status: BannerStatus) {
  if (status === 'Active') return <span className="badge badge-green">Active</span>;
  if (status === 'Scheduled') return <span className="badge badge-blue">Scheduled</span>;
  if (status === 'Draft') return <span className="badge badge-grey">Draft</span>;
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

  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [previewId, setPreviewId] = useState<string>(INITIAL_BANNERS[0].id);

  const previewBanner = banners.find((b) => b.id === previewId) ?? banners[0];

  function moveBanner(id: string, direction: 'up' | 'down') {
    setBanners((current) => {
      const index = current.findIndex((b) => b.id === id);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (index === -1 || targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  function removeBanner(id: string) {
    setBanners((current) => current.filter((b) => b.id !== id));
    if (previewId === id) {
      const remaining = banners.filter((b) => b.id !== id);
      setPreviewId(remaining[0]?.id ?? '');
    }
  }

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <div className="title-group">
          <div className="breadcrumb">Content &amp; Platform &nbsp;›&nbsp; Announcements &amp; Banners</div>
          <h1>Announcements &amp; Banners</h1>
        </div>
        <div className="page-actions">
          {activeTab === 'Announcements' ? (
            <button className="button-primary">
              <Plus size={15} style={{ marginRight: 6 }} />
              New Announcement
            </button>
          ) : (
            <button className="button-primary">
              <Plus size={15} style={{ marginRight: 6 }} />
              New Banner
            </button>
          )}
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
              <button className="button-secondary" onClick={() => setActiveTab('Banners')}>
                Manage Banners
              </button>
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
        <div className="split-layout split-2">
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 32 }}></th>
                  <th>Banner</th>
                  <th>Placement</th>
                  <th>Status</th>
                  <th>Start</th>
                  <th>End</th>
                  <th style={{ width: 96 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner, index) => (
                  <tr
                    key={banner.id}
                    onClick={() => setPreviewId(banner.id)}
                    style={{
                      cursor: 'pointer',
                      background: banner.id === previewId ? 'rgba(139, 92, 246, 0.06)' : undefined,
                    }}
                  >
                    <td>
                      <GripVertical size={14} className="cell-muted" />
                    </td>
                    <td>
                      <strong style={{ display: 'block', fontSize: 13 }}>{banner.title}</strong>
                      <span className="cell-muted" style={{ fontSize: 12 }}>{banner.message}</span>
                    </td>
                    <td className="cell-muted">{banner.placement}</td>
                    <td>{bannerStatusBadge(banner.status)}</td>
                    <td className="cell-muted">{banner.start}</td>
                    <td className="cell-muted">{banner.end}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="icon-btn"
                          disabled={index === 0}
                          onClick={() => moveBanner(banner.id, 'up')}
                          aria-label="Move up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          className="icon-btn"
                          disabled={index === banners.length - 1}
                          onClick={() => moveBanner(banner.id, 'down')}
                          aria-label="Move down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button className="icon-btn" aria-label="Edit banner">
                          <Pencil size={13} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => removeBanner(banner.id)}
                          aria-label="Delete banner"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {banners.length === 0 && (
                  <tr>
                    <td colSpan={7} className="cell-muted" style={{ textAlign: 'center', padding: '32px 0' }}>
                      No banners yet. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="panel-card banner-preview-card">
            <div className="panel-card-header">
              <h3>Live Preview</h3>
            </div>

            {previewBanner ? (
              <>
                <div className="banner-preview">
                  <span className="banner-preview-icon"><Megaphone size={18} /></span>
                  <div>
                    <strong>{previewBanner.title}</strong>
                    <p>{previewBanner.message}</p>
                  </div>
                  <button className="link-inline banner-preview-cta">Learn more</button>
                </div>

                <p className="panel-subtext">
                  Placement: {previewBanner.placement} · {previewBanner.start} – {previewBanner.end}
                </p>
              </>
            ) : (
              <p className="panel-empty-hint">Select a banner from the list to preview it here.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}