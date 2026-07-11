import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X,
} from 'lucide-react';
import FilterDropdown from '../../../components/FilterDropdown';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css';
import '../../../styles/pages/super-admin/content-platform-operations/AnnouncementsBannersPage.css';

const tabs = ['Announcements', 'Banners'] as const;
type Tab = typeof tabs[number];

type AnnouncementType = 'Alert' | 'Info';
type AnnouncementStatus = 'Scheduled' | 'Active' | 'Expired';

type Announcement = {
  id: string;
  title: string;
  type: AnnouncementType;
  audience: string;
  status: AnnouncementStatus;
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

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'System Maintenance on May 20', type: 'Alert', audience: 'All Users', status: 'Scheduled', start: 'May 18, 2024 10:00 PM', end: 'May 20, 2024 11:59 PM' },
  { id: 'a2', title: 'New Feature: Advanced Search', type: 'Info', audience: 'All Users', status: 'Active', start: 'May 18, 2024 9:00 AM', end: 'May 24, 2024 11:59 PM' },
  { id: 'a3', title: 'Community Guidelines Update', type: 'Info', audience: 'All Users', status: 'Active', start: 'May 8, 2024 8:00 AM', end: 'May 21, 2024 11:59 PM' },
  { id: 'a4', title: 'Holiday Schedule', type: 'Alert', audience: 'All Users', status: 'Expired', start: 'Apr 25, 2024', end: 'May 1, 2024' },
];

const INITIAL_BANNERS: Banner[] = [
  { id: 'b1', title: 'New Feature: Advanced Search', message: 'Find what you need faster and smarter.', placement: 'Dashboard Top', status: 'Active', start: 'May 18, 2024', end: 'May 24, 2024' },
  { id: 'b2', title: 'Season Ticket Renewals Open', message: 'Lock in your seat before prices go up.', placement: 'Homepage Hero', status: 'Scheduled', start: 'Jun 1, 2024', end: 'Jun 15, 2024' },
  { id: 'b3', title: 'Fantasy League Registration', message: 'Build your squad for the new season.', placement: 'Fantasy Hub', status: 'Draft', start: '—', end: '—' },
  { id: 'b4', title: 'Holiday Fixture Notice', message: 'Updated kickoff times for the holiday round.', placement: 'Homepage Hero', status: 'Expired', start: 'Apr 20, 2024', end: 'Apr 27, 2024' },
];

function statusBadge(status: AnnouncementStatus) {
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

function typeBadge(type: AnnouncementType) {
  return type === 'Alert'
    ? <span className="ann-type ann-type-alert">Alert</span>
    : <span className="ann-type ann-type-info">Info</span>;
}

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel-card"
        style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="panel-card-header">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AnnouncementsBannersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Announcements');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [announcementModal, setAnnouncementModal] = useState<Announcement | 'new' | null>(null);
  const [announcementDraft, setAnnouncementDraft] = useState<Omit<Announcement, 'id'>>({
    title: '', type: 'Info', audience: 'All Users', status: 'Scheduled', start: '', end: '',
  });

  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [previewId, setPreviewId] = useState<string>(INITIAL_BANNERS[0].id);
  const [bannerStatusFilter, setBannerStatusFilter] = useState('All Status');
  const [bannerPlacementFilter, setBannerPlacementFilter] = useState('All Placements');
  const [bannerSearch, setBannerSearch] = useState('');
  const [bannerModal, setBannerModal] = useState<Banner | 'new' | null>(null);
  const [bannerDraft, setBannerDraft] = useState<Omit<Banner, 'id'>>({
    title: '', message: '', placement: 'Dashboard Top', status: 'Draft', start: '', end: '',
  });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  // ---------- Announcements ----------

  const filteredAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const featuredAnnouncement = useMemo(
    () => announcements.find((a) => a.status === 'Active') ?? announcements[0],
    [announcements]
  );

  function openNewAnnouncement() {
    setAnnouncementDraft({ title: '', type: 'Info', audience: 'All Users', status: 'Scheduled', start: '', end: '' });
    setAnnouncementModal('new');
  }

  function openEditAnnouncement(a: Announcement) {
    setAnnouncementDraft({ title: a.title, type: a.type, audience: a.audience, status: a.status, start: a.start, end: a.end });
    setAnnouncementModal(a);
  }

  function saveAnnouncement() {
    if (!announcementDraft.title.trim()) {
      showToast('Title is required');
      return;
    }

    if (announcementModal === 'new') {
      setAnnouncements((prev) => [{ id: genId('ann'), ...announcementDraft }, ...prev]);
      showToast('Announcement created');
    } else if (announcementModal) {
      const id = announcementModal.id;
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? { id, ...announcementDraft } : a)));
      showToast('Announcement updated');
    }
    setAnnouncementModal(null);
  }

  // ---------- Banners ----------

  const placements = useMemo(
    () => Array.from(new Set(banners.map((b) => b.placement))),
    [banners]
  );

  const filteredBanners = banners.filter((b) => {
    const matchesStatus = bannerStatusFilter === 'All Status' || b.status === bannerStatusFilter;
    const matchesPlacement = bannerPlacementFilter === 'All Placements' || b.placement === bannerPlacementFilter;
    const matchesSearch = b.title.toLowerCase().includes(bannerSearch.toLowerCase());
    return matchesStatus && matchesPlacement && matchesSearch;
  });

  const previewBanner = banners.find((b) => b.id === previewId) ?? banners[0];

  function moveBanner(id: string, direction: 'up' | 'down') {
    setBanners((current) => {
      const index = current.findIndex((b) => b.id === id);
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (index === -1 || targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  function openNewBanner() {
    setBannerDraft({ title: '', message: '', placement: 'Dashboard Top', status: 'Draft', start: '', end: '' });
    setBannerModal('new');
  }

  function openEditBanner(b: Banner) {
    setBannerDraft({ title: b.title, message: b.message, placement: b.placement, status: b.status, start: b.start, end: b.end });
    setBannerModal(b);
  }

  function saveBanner() {
    if (!bannerDraft.title.trim()) {
      showToast('Title is required');
      return;
    }

    if (bannerModal === 'new') {
      const newBanner: Banner = { id: genId('ban'), ...bannerDraft };
      setBanners((prev) => [newBanner, ...prev]);
      setPreviewId(newBanner.id);
      showToast('Banner created');
    } else if (bannerModal) {
      const id = bannerModal.id;
      setBanners((prev) => prev.map((b) => (b.id === id ? { id, ...bannerDraft } : b)));
      showToast('Banner updated');
    }
    setBannerModal(null);
  }

  function removeBanner(id: string) {
    setBanners((current) => current.filter((b) => b.id !== id));
    if (previewId === id) {
      const remaining = banners.filter((b) => b.id !== id);
      setPreviewId(remaining[0]?.id ?? '');
    }
    showToast('Banner deleted');
  }

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <div className="title-group">
          <div className="breadcrumb">Content &amp; Platform &nbsp;›&nbsp; Announcements &amp; Banners</div>
          <h1>Announcements &amp; Banners</h1>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {toast && (
            <span
              style={{
                fontSize: 12.5,
                color: '#A78BFA',
                background: 'rgba(139, 92, 246, 0.12)',
                padding: '6px 12px',
                borderRadius: 999,
              }}
            >
              {toast}
            </span>
          )}
          {activeTab === 'Announcements' ? (
            <button className="button-primary" onClick={openNewAnnouncement}>
              <Plus size={15} style={{ marginRight: 6 }} />
              New Announcement
            </button>
          ) : (
            <button className="button-primary" onClick={openNewBanner}>
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
                  <th style={{ width: 60 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnnouncements.map((a) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{typeBadge(a.type)}</td>
                    <td className="cell-muted">{a.audience}</td>
                    <td>{statusBadge(a.status)}</td>
                    <td className="cell-muted">{a.start}</td>
                    <td className="cell-muted">{a.end}</td>
                    <td>
                      <button className="icon-btn" onClick={() => openEditAnnouncement(a)} aria-label="Edit announcement">
                        <Pencil size={13} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredAnnouncements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="cell-muted" style={{ textAlign: 'center', padding: '32px 0' }}>
                      No announcements match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="table-pagination">
              <span>Showing 1 to {filteredAnnouncements.length} of {filteredAnnouncements.length}</span>
              <div className="pager">
                <button disabled><ChevronLeft size={14} /></button>
                <button className="current">1</button>
                <button disabled><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>

          {featuredAnnouncement && (
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
                  <strong>{featuredAnnouncement.title}</strong>
                  <p>Find what you need faster and smarter.</p>
                </div>
                <button
                  className="link-inline banner-preview-cta"
                  onClick={() => navigate(`/super-admin/announcements/${featuredAnnouncement.id}`)}
                >
                  Learn more
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'Banners' && (
        <>
          <div className="ops-toolbar">
            <FilterDropdown
              value={bannerStatusFilter}
              options={['All Status', 'Active', 'Scheduled', 'Draft', 'Expired']}
              onChange={setBannerStatusFilter}
            />
            <FilterDropdown
              value={bannerPlacementFilter}
              options={['All Placements', ...placements]}
              onChange={setBannerPlacementFilter}
            />
            <div className="ops-search">
              <Search size={15} />
              <input
                placeholder="Search banners..."
                value={bannerSearch}
                onChange={(e) => setBannerSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="split-layout split-2">
            <div className="table-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Banner</th>
                    <th>Placement</th>
                    <th>Status</th>
                    <th>Start</th>
                    <th>End</th>
                    <th style={{ width: 130 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBanners.map((banner, index) => (
                    <tr
                      key={banner.id}
                      onClick={() => setPreviewId(banner.id)}
                      style={{
                        cursor: 'pointer',
                        background: banner.id === previewId ? 'rgba(139, 92, 246, 0.06)' : undefined,
                      }}
                    >
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
                            disabled={index === filteredBanners.length - 1}
                            onClick={() => moveBanner(banner.id, 'down')}
                            aria-label="Move down"
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button className="icon-btn" onClick={() => openEditBanner(banner)} aria-label="Edit banner">
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

                  {filteredBanners.length === 0 && (
                    <tr>
                      <td colSpan={6} className="cell-muted" style={{ textAlign: 'center', padding: '32px 0' }}>
                        No banners match your filters.
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
        </>
      )}

      {/* Announcement create/edit modal */}
      {announcementModal && (
        <Modal
          title={announcementModal === 'new' ? 'New Announcement' : 'Edit Announcement'}
          onClose={() => setAnnouncementModal(null)}
        >
          <div className="field-group">
            <label>Title</label>
            <input
              value={announcementDraft.title}
              onChange={(e) => setAnnouncementDraft((d) => ({ ...d, title: e.target.value }))}
            />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Type</label>
              <select
                className="page-select"
                value={announcementDraft.type}
                onChange={(e) => setAnnouncementDraft((d) => ({ ...d, type: e.target.value as AnnouncementType }))}
              >
                <option value="Info">Info</option>
                <option value="Alert">Alert</option>
              </select>
            </div>
            <div className="field-group">
              <label>Status</label>
              <select
                className="page-select"
                value={announcementDraft.status}
                onChange={(e) => setAnnouncementDraft((d) => ({ ...d, status: e.target.value as AnnouncementStatus }))}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="field-group">
            <label>Audience</label>
            <input
              value={announcementDraft.audience}
              onChange={(e) => setAnnouncementDraft((d) => ({ ...d, audience: e.target.value }))}
            />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Start Date</label>
              <input
                placeholder="May 18, 2024 10:00 PM"
                value={announcementDraft.start}
                onChange={(e) => setAnnouncementDraft((d) => ({ ...d, start: e.target.value }))}
              />
            </div>
            <div className="field-group">
              <label>End Date</label>
              <input
                placeholder="May 20, 2024 11:59 PM"
                value={announcementDraft.end}
                onChange={(e) => setAnnouncementDraft((d) => ({ ...d, end: e.target.value }))}
              />
            </div>
          </div>

          <div className="content-footer-actions" style={{ justifyContent: 'flex-end' }}>
            <button className="button-secondary" onClick={() => setAnnouncementModal(null)}>Cancel</button>
            <button className="button-primary" onClick={saveAnnouncement}>
              {announcementModal === 'new' ? 'Create Announcement' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}

      {/* Banner create/edit modal */}
      {bannerModal && (
        <Modal
          title={bannerModal === 'new' ? 'New Banner' : 'Edit Banner'}
          onClose={() => setBannerModal(null)}
        >
          <div className="field-group">
            <label>Title</label>
            <input
              value={bannerDraft.title}
              onChange={(e) => setBannerDraft((d) => ({ ...d, title: e.target.value }))}
            />
          </div>

          <div className="field-group">
            <label>Message</label>
            <textarea
              rows={2}
              value={bannerDraft.message}
              onChange={(e) => setBannerDraft((d) => ({ ...d, message: e.target.value }))}
            />
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Placement</label>
              <input
                value={bannerDraft.placement}
                onChange={(e) => setBannerDraft((d) => ({ ...d, placement: e.target.value }))}
              />
            </div>
            <div className="field-group">
              <label>Status</label>
              <select
                className="page-select"
                value={bannerDraft.status}
                onChange={(e) => setBannerDraft((d) => ({ ...d, status: e.target.value as BannerStatus }))}
              >
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field-group">
              <label>Start Date</label>
              <input
                placeholder="Jun 1, 2024"
                value={bannerDraft.start}
                onChange={(e) => setBannerDraft((d) => ({ ...d, start: e.target.value }))}
              />
            </div>
            <div className="field-group">
              <label>End Date</label>
              <input
                placeholder="Jun 15, 2024"
                value={bannerDraft.end}
                onChange={(e) => setBannerDraft((d) => ({ ...d, end: e.target.value }))}
              />
            </div>
          </div>

          <div className="content-footer-actions" style={{ justifyContent: 'flex-end' }}>
            <button className="button-secondary" onClick={() => setBannerModal(null)}>Cancel</button>
            <button className="button-primary" onClick={saveBanner}>
              {bannerModal === 'new' ? 'Create Banner' : 'Save Changes'}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}