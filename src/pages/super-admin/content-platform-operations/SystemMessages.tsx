import { useState, useMemo } from 'react';
import {
  Search,
  Bell,
  Plus,
  MoreVertical,
  Globe,
  Smartphone,
  Mail,
  MessageSquare,
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  ListOrdered,
  ImageIcon,
  Smile,
  RotateCcw,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import FilterDropdown from '../../../components/FilterDropdown';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';

const scopeTabs = ['All Messages', 'By Category', 'By Status', 'Scheduled', 'Archived'] as const;
type ScopeTab = typeof scopeTabs[number];

const detailTabs = ['Details', 'Targeting', 'History'] as const;
type DetailTab = typeof detailTabs[number];

type Category = 'Maintenance' | 'Announcement' | 'Security' | 'Update' | 'Promotion' | 'Alert';
type Status = 'Active' | 'Scheduled' | 'Expired' | 'Draft';
type Priority = 'High' | 'Medium' | 'Low';
type Platform = 'inApp' | 'push' | 'email' | 'sms';

type SystemMessage = {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: Status;
  priority: Priority;
  platforms: Record<Platform, boolean>;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  noEndDate: boolean;
  body: string;
  showTo: string;
  frequency: string;
};

const CATEGORY_COLOR: Record<Category, string> = {
  Maintenance: '#A78BFA',
  Announcement: '#60A5FA',
  Security: '#F87171',
  Update: '#4ADE80',
  Promotion: '#F472B6',
  Alert: '#FB923C',
};

function statusBadge(status: Status) {
  if (status === 'Active') return <span className="badge badge-green">Active</span>;
  if (status === 'Scheduled') return <span className="badge badge-blue">Scheduled</span>;
  if (status === 'Draft') return <span className="badge badge-amber">Draft</span>;
  return <span className="badge badge-grey">Expired</span>;
}

function priorityBadge(priority: Priority) {
  if (priority === 'High') return <span className="badge badge-red">High</span>;
  if (priority === 'Medium') return <span className="badge badge-amber">Medium</span>;
  return <span className="badge badge-blue">Low</span>;
}

const BASE_MESSAGES: Omit<SystemMessage, 'id'>[] = [
  {
    title: 'Scheduled Maintenance',
    description: "We'll be performing scheduled maintenance on...",
    category: 'Maintenance',
    status: 'Active',
    priority: 'High',
    platforms: { inApp: true, push: true, email: true, sms: false },
    startDate: 'May 12, 2024', startTime: '10:00 PM',
    endDate: 'May 13, 2024', endTime: '02:00 AM',
    noEndDate: false,
    body: "We'll be performing scheduled maintenance on May 12, 2024 from 10:00 PM to May 13, 2024 02:00 AM (UTC).\n\nDuring this time, some features may be unavailable.\n\nWe apologize for any inconvenience.",
    showTo: 'All Users',
    frequency: 'Once per session',
  },
  {
    title: 'New Season Launch',
    description: 'The new season is now live! Explore new...',
    category: 'Announcement',
    status: 'Active',
    priority: 'Medium',
    platforms: { inApp: true, push: true, email: true, sms: false },
    startDate: 'May 10, 2024', startTime: '09:00 AM',
    endDate: 'May 20, 2024', endTime: '11:59 PM',
    noEndDate: false,
    body: 'The new season is now live! Explore new fixtures, standings, and fantasy leagues across all competitions.',
    showTo: 'All Users',
    frequency: 'Once per session',
  },
  {
    title: 'Security Update',
    description: "We've updated our security to keep your...",
    category: 'Security',
    status: 'Active',
    priority: 'High',
    platforms: { inApp: true, push: false, email: true, sms: false },
    startDate: 'May 8, 2024', startTime: '08:00 AM',
    endDate: 'May 15, 2024', endTime: '11:59 PM',
    noEndDate: false,
    body: "We've updated our security systems to keep your account safer. No action is required on your part.",
    showTo: 'All Users',
    frequency: 'Always',
  },
  {
    title: 'Ticket System Update',
    description: 'We have updated our ticketing system for...',
    category: 'Update',
    status: 'Scheduled',
    priority: 'Medium',
    platforms: { inApp: true, push: true, email: true, sms: false },
    startDate: 'May 15, 2024', startTime: '12:00 AM',
    endDate: 'May 18, 2024', endTime: '11:59 PM',
    noEndDate: false,
    body: 'We have updated our ticketing system for a faster, smoother checkout experience.',
    showTo: 'All Users',
    frequency: 'Once per session',
  },
  {
    title: 'Fan Appreciation Week',
    description: 'Thank you for your support! Enjoy exclusive...',
    category: 'Promotion',
    status: 'Active',
    priority: 'Low',
    platforms: { inApp: true, push: true, email: true, sms: false },
    startDate: 'May 5, 2024', startTime: '12:00 AM',
    endDate: 'May 12, 2024', endTime: '11:59 PM',
    noEndDate: false,
    body: 'Thank you for your support! Enjoy exclusive discounts on memberships and merchandise this week only.',
    showTo: 'All Users',
    frequency: 'Once per day',
  },
  {
    title: 'Payment Processing Delay',
    description: 'Some payment transactions may take longer...',
    category: 'Alert',
    status: 'Expired',
    priority: 'High',
    platforms: { inApp: true, push: true, email: true, sms: false },
    startDate: 'May 1, 2024', startTime: '09:00 AM',
    endDate: 'May 3, 2024', endTime: '06:00 PM',
    noEndDate: false,
    body: 'Some payment transactions may take longer than usual to process due to a provider outage. We are monitoring the situation closely.',
    showTo: 'All Users',
    frequency: 'Always',
  },
  {
    title: 'New Feature Available',
    description: 'Check out our new live match statistics...',
    category: 'Update',
    status: 'Active',
    priority: 'Low',
    platforms: { inApp: true, push: true, email: true, sms: false },
    startDate: 'Apr 28, 2024', startTime: '12:00 AM',
    endDate: 'May 10, 2024', endTime: '11:59 PM',
    noEndDate: false,
    body: 'Check out our new live match statistics feature, available now on all fixtures.',
    showTo: 'All Users',
    frequency: 'Once per session',
  },
  {
    title: 'General Announcement',
    description: 'Important info for all users on the...',
    category: 'Announcement',
    status: 'Draft',
    priority: 'Medium',
    platforms: { inApp: true, push: false, email: false, sms: false },
    startDate: '-', startTime: '',
    endDate: '-', endTime: '',
    noEndDate: true,
    body: 'Important info for all users on the platform. Finish drafting this message before publishing.',
    showTo: 'All Users',
    frequency: 'Once per session',
  },
];

const ALL_MESSAGES: SystemMessage[] = Array.from({ length: 24 }, (_, i) => {
  const base = BASE_MESSAGES[i % BASE_MESSAGES.length];
  const copyNumber = Math.floor(i / BASE_MESSAGES.length);
  return {
    ...base,
    id: `msg-${i + 1}`,
    title: copyNumber === 0 ? base.title : `${base.title} (${copyNumber + 1})`,
  };
});

const PAGE_SIZE = 8;

function PlatformIcons({ platforms }: { platforms: Record<Platform, boolean> }) {
  return (
    <div style={{ display: 'flex', gap: 8, color: 'var(--muted)' }}>
      {platforms.inApp && <Globe size={15} />}
      {platforms.push && <Smartphone size={15} />}
      {platforms.email && <Mail size={15} />}
      {platforms.sms && <MessageSquare size={15} />}
    </div>
  );
}

export default function SystemMessages() {
  const [messages, setMessages] = useState<SystemMessage[]>(ALL_MESSAGES);
  const [scopeTab, setScopeTab] = useState<ScopeTab>('All Messages');
  const [detailTab, setDetailTab] = useState<DetailTab>('Details');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [platformFilter, setPlatformFilter] = useState('All Platforms');
  const [timeFilter, setTimeFilter] = useState('All Time');

  const [page, setPage] = useState(1);
  const [activeId, setActiveId] = useState(ALL_MESSAGES[0].id);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const activeMessage = useMemo(
    () => messages.find((m) => m.id === activeId) ?? messages[0],
    [messages, activeId]
  );
  const [draft, setDraft] = useState<SystemMessage>(activeMessage);
  if (draft.id !== activeMessage.id) {
    setDraft(activeMessage);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  const scopedMessages = messages.filter((m) => {
    if (scopeTab === 'Scheduled') return m.status === 'Scheduled';
    if (scopeTab === 'Archived') return m.status === 'Expired';
    return true;
  });

  const filteredMessages = scopedMessages.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || m.category === categoryFilter;
    const matchesStatus = statusFilter === 'All Statuses' || m.status === statusFilter;
    const matchesPlatform =
      platformFilter === 'All Platforms' ||
      (platformFilter === 'In-App' && m.platforms.inApp) ||
      (platformFilter === 'Push' && m.platforms.push) ||
      (platformFilter === 'Email' && m.platforms.email) ||
      (platformFilter === 'SMS' && m.platforms.sms);
    return matchesSearch && matchesCategory && matchesStatus && matchesPlatform;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMessages.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageMessages = filteredMessages.slice(pageStart, pageStart + PAGE_SIZE);

  function updateDraft<K extends keyof SystemMessage>(field: K, value: SystemMessage[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function togglePlatform(platform: Platform) {
    setDraft((prev) => ({
      ...prev,
      platforms: { ...prev.platforms, [platform]: !prev.platforms[platform] },
    }));
  }

  function handleSave() {
    setMessages((prev) => prev.map((m) => (m.id === draft.id ? draft : m)));
    showToast('Changes saved');
  }

  function handleCancel() {
    setDraft(activeMessage);
    showToast('Changes discarded');
  }

  function handleNewMessage() {
    const id = `msg-new-${Date.now()}`;
    const newMessage: SystemMessage = {
      id,
      title: 'New System Message',
      description: '',
      category: 'Announcement',
      status: 'Draft',
      priority: 'Medium',
      platforms: { inApp: true, push: false, email: false, sms: false },
      startDate: '-',
      startTime: '',
      endDate: '-',
      endTime: '',
      noEndDate: true,
      body: '',
      showTo: 'All Users',
      frequency: 'Once per session',
    };
    setMessages((prev) => [newMessage, ...prev]);
    setActiveId(id);
    setScopeTab('All Messages');
  }

  return (
    <main className="super-admin-page content-child">
      {/* Top utility bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 18,
        }}
      >
        <span className="breadcrumb" style={{ margin: 0, flexShrink: 0 }}>
          Content &amp; Platform &nbsp;›&nbsp; <strong style={{ color: 'var(--text)' }}>System Messages</strong>
        </span>

        <div className="ops-search" style={{ flex: 1 }}>
          <Search size={15} />
          <input
            placeholder="Search system messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="icon-btn" style={{ position: 'relative' }} aria-label="Notifications">
          <Bell size={15} />
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#F87171',
            }}
          />
        </button>

        <button className="button-primary" onClick={handleNewMessage} style={{ flexShrink: 0 }}>
          <Plus size={15} style={{ marginRight: 6 }} />
          New Message
        </button>
      </div>

      <section className="page-heading">
        <div className="title-group">
          <h1>System Messages</h1>
          <p className="panel-subtext" style={{ margin: '4px 0 0' }}>
            Create, manage and configure in-app system messages shown to users across the platform.
          </p>
        </div>
        {toast && (
          <span
            style={{
              fontSize: 12.5,
              color: '#A78BFA',
              background: 'rgba(139, 92, 246, 0.12)',
              padding: '6px 12px',
              borderRadius: 999,
              height: 'fit-content',
            }}
          >
            {toast}
          </span>
        )}
      </section>

      <div className="content-tabs">
        {scopeTabs.map((t) => (
          <button
            key={t}
            type="button"
            className={`content-tab ${scopeTab === t ? 'active' : ''}`}
            onClick={() => {
              setScopeTab(t);
              setPage(1);
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="ops-toolbar">
        <FilterDropdown
          value={categoryFilter}
          options={['All Categories', 'Maintenance', 'Announcement', 'Security', 'Update', 'Promotion', 'Alert']}
          onChange={(v) => { setCategoryFilter(v); setPage(1); }}
        />
        <FilterDropdown
          value={statusFilter}
          options={['All Statuses', 'Active', 'Scheduled', 'Expired', 'Draft']}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
        />
        <FilterDropdown
          value={platformFilter}
          options={['All Platforms', 'In-App', 'Push', 'Email', 'SMS']}
          onChange={(v) => { setPlatformFilter(v); setPage(1); }}
        />
        <FilterDropdown
          value={timeFilter}
          options={['All Time', 'Today', 'This Week', 'This Month']}
          onChange={setTimeFilter}
        />
        <button
          className="button-secondary"
          style={{ width: 'auto', marginLeft: 'auto' }}
          onClick={() => showToast('Advanced filters coming soon')}
        >
          Filters
        </button>
      </div>

      <div className="split-layout" style={{ gridTemplateColumns: '1fr 380px' }}>
        {/* Message list */}
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Platforms</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pageMessages.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => setActiveId(m.id)}
                  style={{
                    cursor: 'pointer',
                    background: m.id === activeId ? 'rgba(139, 92, 246, 0.08)' : undefined,
                  }}
                >
                  <td style={{ maxWidth: 220 }}>
                    <strong style={{ display: 'block', fontSize: 13 }}>{m.title}</strong>
                    <span
                      className="cell-muted"
                      style={{
                        fontSize: 12,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {m.description}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: CATEGORY_COLOR[m.category],
                          flexShrink: 0,
                        }}
                      />
                      {m.category}
                    </span>
                  </td>
                  <td><PlatformIcons platforms={m.platforms} /></td>
                  <td>{statusBadge(m.status)}</td>
                  <td>{priorityBadge(m.priority)}</td>
                  <td className="cell-muted" style={{ fontSize: 12.5 }}>
                    {m.startDate}
                    {m.startTime && <><br />{m.startTime}</>}
                  </td>
                  <td className="cell-muted" style={{ fontSize: 12.5 }}>
                    {m.endDate}
                    {m.endTime && <><br />{m.endTime}</>}
                  </td>
                  <td onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                    <button
                      className="icon-btn"
                      aria-label="More actions"
                      onClick={() => setOpenMenuId((prev) => (prev === m.id ? null : m.id))}
                    >
                      <MoreVertical size={14} />
                    </button>
                    {openMenuId === m.id && (
                      <div className="filter-dropdown-menu" style={{ top: 'calc(100% + 4px)' }}>
                        <button
                          className="filter-dropdown-option"
                          onClick={() => { setActiveId(m.id); setOpenMenuId(null); }}
                        >
                          Edit
                        </button>
                        <button
                          className="filter-dropdown-option"
                          onClick={() => {
                            setMessages((prev) => prev.map((x) =>
                              x.id === m.id ? { ...x, status: x.status === 'Expired' ? 'Active' : 'Expired' } : x
                            ));
                            setOpenMenuId(null);
                            showToast(m.status === 'Expired' ? 'Message restored' : 'Message archived');
                          }}
                        >
                          {m.status === 'Expired' ? 'Restore' : 'Archive'}
                        </button>
                        <button
                          className="filter-dropdown-option"
                          onClick={() => {
                            setMessages((prev) => prev.filter((x) => x.id !== m.id));
                            setOpenMenuId(null);
                            showToast('Message deleted');
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {pageMessages.length === 0 && (
                <tr>
                  <td colSpan={8} className="cell-muted" style={{ textAlign: 'center', padding: '32px 0' }}>
                    No messages match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="table-pagination">
            <span>
              Showing {filteredMessages.length === 0 ? 0 : pageStart + 1} to{' '}
              {Math.min(pageStart + PAGE_SIZE, filteredMessages.length)} of {filteredMessages.length} results
            </span>
            <div className="pager">
              <button disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={p === currentPage ? 'current' : ''}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Detail / edit panel */}
        <div className="panel-card">
          <div className="panel-card-header">
            <h3>{draft.title || 'Untitled Message'}</h3>
            {statusBadge(draft.status)}
          </div>

          <div className="content-tabs" style={{ margin: '0 0 4px' }}>
            {detailTabs.map((t) => (
              <button
                key={t}
                type="button"
                className={`content-tab ${detailTab === t ? 'active' : ''}`}
                onClick={() => setDetailTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {detailTab === 'Details' && (
            <>
              <div className="field-group">
                <label>Title *</label>
                <input value={draft.title} onChange={(e) => updateDraft('title', e.target.value)} />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Category</label>
                  <select
                    className="page-select"
                    value={draft.category}
                    onChange={(e) => updateDraft('category', e.target.value as Category)}
                  >
                    {Object.keys(CATEGORY_COLOR).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="field-group">
                  <label>Priority</label>
                  <select
                    className="page-select"
                    value={draft.priority}
                    onChange={(e) => updateDraft('priority', e.target.value as Priority)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="field-group">
                <label>Message *</label>
                <div className="rich-textarea">
                  <div className="rich-toolbar">
                    <button type="button"><Bold size={13} /></button>
                    <button type="button"><Italic size={13} /></button>
                    <button type="button"><Underline size={13} /></button>
                    <button type="button"><Link2 size={13} /></button>
                    <button type="button"><List size={13} /></button>
                    <button type="button"><ListOrdered size={13} /></button>
                    <button type="button"><ImageIcon size={13} /></button>
                    <button type="button"><Smile size={13} /></button>
                    <button type="button"><RotateCcw size={13} /></button>
                    <button type="button"><HelpCircle size={13} /></button>
                  </div>
                  <textarea
                    rows={6}
                    value={draft.body}
                    onChange={(e) => updateDraft('body', e.target.value)}
                  />
                </div>
              </div>

              <div className="field-group">
                <label>Platforms *</label>
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={draft.platforms.inApp} onChange={() => togglePlatform('inApp')} />
                    In-App
                  </label>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={draft.platforms.push} onChange={() => togglePlatform('push')} />
                    Push
                  </label>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={draft.platforms.email} onChange={() => togglePlatform('email')} />
                    Email
                  </label>
                  <label className="checkbox-row">
                    <input type="checkbox" checked={draft.platforms.sms} onChange={() => togglePlatform('sms')} />
                    SMS
                  </label>
                </div>
              </div>

              <div className="content-section">
                <h3>Schedule</h3>

                <div className="field-group">
                  <label>Start Date &amp; Time</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="date"
                      style={{ flex: 1 }}
                      onChange={(e) =>
                        updateDraft(
                          'startDate',
                          new Date(e.target.value).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })
                        )
                      }
                    />
                    <input
                      type="time"
                      style={{ flex: 1 }}
                      onChange={(e) => updateDraft('startTime', e.target.value)}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label>End Date &amp; Time</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      type="date"
                      disabled={draft.noEndDate}
                      style={{ flex: 1 }}
                      onChange={(e) =>
                        updateDraft(
                          'endDate',
                          new Date(e.target.value).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })
                        )
                      }
                    />
                    <input
                      type="time"
                      disabled={draft.noEndDate}
                      style={{ flex: 1 }}
                      onChange={(e) => updateDraft('endTime', e.target.value)}
                    />
                  </div>
                </div>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={draft.noEndDate}
                    onChange={(e) => updateDraft('noEndDate', e.target.checked)}
                  />
                  No end date (show indefinitely)
                </label>
              </div>

              <div className="content-section">
                <h3>Display Settings</h3>

                <div className="field-row">
                  <div className="field-group">
                    <label>Show to</label>
                    <select
                      className="page-select"
                      value={draft.showTo}
                      onChange={(e) => updateDraft('showTo', e.target.value)}
                    >
                      <option>All Users</option>
                      <option>Fans Only</option>
                      <option>Union Admins</option>
                      <option>Sponsors</option>
                    </select>
                  </div>
                  <div className="field-group">
                    <label>Frequency</label>
                    <select
                      className="page-select"
                      value={draft.frequency}
                      onChange={(e) => updateDraft('frequency', e.target.value)}
                    >
                      <option>Once per session</option>
                      <option>Once per day</option>
                      <option>Always</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {detailTab === 'Targeting' && (
            <div className="content-section" style={{ borderTop: 'none', paddingTop: 0 }}>
              <div className="field-group">
                <label>Audience</label>
                <select
                  className="page-select"
                  value={draft.showTo}
                  onChange={(e) => updateDraft('showTo', e.target.value)}
                >
                  <option>All Users</option>
                  <option>Fans Only</option>
                  <option>Union Admins</option>
                  <option>Sponsors</option>
                </select>
              </div>
              <p className="panel-empty-hint">
                Additional targeting rules (region, device type, plan tier) can be layered on here once
                the segmentation service is connected.
              </p>
            </div>
          )}

          {detailTab === 'History' && (
            <div className="list-panel">
              <div className="list-row" style={{ cursor: 'default' }}>
                <span className="list-row-title">Created by Merab Apio</span>
                <span className="list-row-count">May 1, 2024</span>
              </div>
              <div className="list-row" style={{ cursor: 'default' }}>
                <span className="list-row-title">Priority changed to {draft.priority}</span>
                <span className="list-row-count">May 3, 2024</span>
              </div>
              <div className="list-row" style={{ cursor: 'default' }}>
                <span className="list-row-title">Published to {draft.showTo}</span>
                <span className="list-row-count">{draft.startDate}</span>
              </div>
            </div>
          )}

          <div className="content-footer-bar">
            <button className="button-secondary" onClick={handleCancel}>Cancel</button>
            <button className="button-primary" onClick={handleSave}>Save Changes</button>
          </div>
        </div>
      </div>
    </main>
  );
}