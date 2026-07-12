import { useState, useMemo } from 'react';
import { ImageIcon, Send, Pencil, Eye, X, Search } from 'lucide-react';
import FilterDropdown from '../../../components/FilterDropdown';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';
import SuperAdminBackButton from '../../../components/SuperAdminBackButton';

const channelTabs = ['Push', 'Email', 'SMS'] as const;
type ChannelTab = typeof channelTabs[number];

type AudienceMode = 'all' | 'segment';
type ScheduleMode = 'now' | 'later';
type BroadcastStatus = 'Draft' | 'Queued' | 'Sent';

const SEGMENTS = [
  { id: 'active-fans', label: 'Active Fans (last 30 days)', count: 24560 },
  { id: 'season-ticket', label: 'Season Ticket Holders', count: 6120 },
  { id: 'fantasy-players', label: 'Fantasy League Players', count: 9840 },
  { id: 'inactive-90', label: 'Inactive 90+ Days', count: 3175 },
];

const ALL_USERS_COUNT = 24560;
const SEGMENT_SELECT_LABEL = 'Select segment...';

const TITLE_LIMIT = 100;
const MESSAGE_LIMIT_DEFAULT = 500;
const SMS_LIMIT = 160;

const HISTORY_PREVIEW_COUNT = 3;

type ChannelDraft = {
  title: string;
  message: string;
};

const INITIAL_DRAFTS: Record<ChannelTab, ChannelDraft> = {
  Push: { title: 'Important Update', message: "We're excited to announce our new tournament feature. Check it out now!" },
  Email: { title: '', message: '' },
  SMS: { title: '', message: '' },
};

type BroadcastRecord = {
  id: string;
  channel: ChannelTab;
  title: string;
  message: string;
  audienceLabel: string;
  segmentId: string; // '' means All Users
  recipientCount: number;
  status: BroadcastStatus;
  date: string;
};

const INITIAL_BROADCASTS: BroadcastRecord[] = [
  {
    id: 'bc-1',
    channel: 'Email',
    title: 'Season Ticket Renewals Open',
    message: 'Lock in your seat before prices go up.',
    audienceLabel: 'Season Ticket Holders',
    segmentId: 'season-ticket',
    recipientCount: 6120,
    status: 'Sent',
    date: 'May 9, 2024 9:00 AM',
  },
  {
    id: 'bc-2',
    channel: 'Push',
    title: 'Fantasy League Registration',
    message: 'Build your squad for the new season.',
    audienceLabel: 'Fantasy League Players',
    segmentId: 'fantasy-players',
    recipientCount: 9840,
    status: 'Sent',
    date: 'May 6, 2024 10:30 AM',
  },
  {
    id: 'bc-3',
    channel: 'SMS',
    title: '',
    message: 'Reminder: fixtures kick off at 6PM today.',
    audienceLabel: 'All Users',
    segmentId: '',
    recipientCount: 24560,
    status: 'Queued',
    date: 'May 15, 2024 9:00 AM',
  },
  {
    id: 'bc-4',
    channel: 'Email',
    title: 'Holiday Fixture Notice',
    message: 'Updated kickoff times for the holiday round.',
    audienceLabel: 'All Users',
    segmentId: '',
    recipientCount: 24560,
    status: 'Draft',
    date: 'May 12, 2024 3:40 PM',
  },
];

function statusBadge(status: BroadcastStatus) {
  if (status === 'Sent') return <span className="badge badge-green">Sent</span>;
  if (status === 'Queued') return <span className="badge badge-blue">Queued</span>;
  return <span className="badge badge-grey">Draft</span>;
}

function formatNow() {
  return new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function genId() {
  return `bc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// ---------- Mock audience data ----------

type AudienceMember = {
  id: string;
  name: string;
  email: string;
  location: string;
  status: 'Active' | 'Inactive';
  joined: string;
  segments: string[]; // segment ids this person belongs to
};

const FIRST_NAMES = ['Merab', 'Daniel', 'Grace', 'Peter', 'Sarah', 'Joseph', 'Aisha', 'Brian', 'Faith', 'Emmanuel', 'Ritah', 'Kevin', 'Patience', 'Isaac', 'Zainab', 'Moses'];
const LAST_NAMES = ['Apio', 'Okello', 'Nakato', 'Ssemwogerere', 'Mutebi', 'Achieng', 'Kato', 'Namugga', 'Wanyama', 'Byaruhanga'];
const LOCATIONS = ['Kampala', 'Entebbe', 'Jinja', 'Mbarara', 'Gulu', 'Mbale', 'Arua', 'Fort Portal'];

function generateAudience(count: number): AudienceMember[] {
  return Array.from({ length: count }, (_, i) => {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    const location = LOCATIONS[i % LOCATIONS.length];
    const segments: string[] = [];
    if (i % 4 === 0) segments.push('season-ticket');
    if (i % 3 === 0) segments.push('fantasy-players');
    if (i % 5 === 0) segments.push('inactive-90');
    if (i % 2 === 0) segments.push('active-fans');

    return {
      id: `user-${i + 1}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@leagueos.com`,
      location,
      status: i % 7 === 0 ? 'Inactive' : 'Active',
      joined: `Apr ${((i % 28) + 1)}, 2024`,
      segments,
    };
  });
}

const AUDIENCE_POOL = generateAudience(60);

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
        style={{ width: '100%', maxWidth: 760, maxHeight: '85vh', overflowY: 'auto' }}
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

const AUDIENCE_PAGE_SIZE = 8;

export default function Broadcasts() {
  const [channel, setChannel] = useState<ChannelTab>('Push');
  const [drafts, setDrafts] = useState<Record<ChannelTab, ChannelDraft>>(INITIAL_DRAFTS);

  const [audienceMode, setAudienceMode] = useState<AudienceMode>('all');
  const [segmentId, setSegmentId] = useState('');

  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('now');
  const [scheduleDate, setScheduleDate] = useState('2024-05-15');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [timezone, setTimezone] = useState('UTC+00:00');

  const [sendTestMessage, setSendTestMessage] = useState(true);
  const [trackClicks, setTrackClicks] = useState(true);

  const [imageAttached, setImageAttached] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [broadcasts, setBroadcasts] = useState<BroadcastRecord[]>(INITIAL_BROADCASTS);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [channelFilter, setChannelFilter] = useState('All Channels');
  const [historyExpanded, setHistoryExpanded] = useState(false);

  // Audience modal state
  const [audienceModalOpen, setAudienceModalOpen] = useState(false);
  const [audienceSearch, setAudienceSearch] = useState('');
  const [audienceLocationFilter, setAudienceLocationFilter] = useState('All Locations');
  const [audienceStatusFilter, setAudienceStatusFilter] = useState('All Status');
  const [audiencePage, setAudiencePage] = useState(1);

  const draft = drafts[channel];
  const messageLimit = channel === 'SMS' ? SMS_LIMIT : MESSAGE_LIMIT_DEFAULT;

  const segmentLabel = SEGMENTS.find((s) => s.id === segmentId)?.label ?? SEGMENT_SELECT_LABEL;

  function updateDraft(field: keyof ChannelDraft, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [channel]: { ...prev[channel], [field]: value },
    }));
  }

  const recipientCount = useMemo(() => {
    if (audienceMode === 'all') return ALL_USERS_COUNT;
    const segment = SEGMENTS.find((s) => s.id === segmentId);
    return segment ? segment.count : 0;
  }, [audienceMode, segmentId]);

  const audienceLabel = audienceMode === 'all' ? 'All Users' : (SEGMENTS.find((s) => s.id === segmentId)?.label ?? 'No segment selected');

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  function resetComposer() {
    setDrafts(INITIAL_DRAFTS);
    setAudienceMode('all');
    setSegmentId('');
    setScheduleMode('now');
    setImageAttached(false);
    setEditingId(null);
  }

  function handleSaveDraft() {
    const record: BroadcastRecord = {
      id: editingId ?? genId(),
      channel,
      title: draft.title,
      message: draft.message,
      audienceLabel,
      segmentId: audienceMode === 'segment' ? segmentId : '',
      recipientCount,
      status: 'Draft',
      date: formatNow(),
    };

    setBroadcasts((prev) =>
      editingId ? prev.map((b) => (b.id === editingId ? record : b)) : [record, ...prev]
    );

    showToast('Broadcast saved as draft');
    setEditingId(record.id);
  }

  function handleReviewAndSend() {
    if (audienceMode === 'segment' && !segmentId) {
      showToast('Select a target segment first');
      return;
    }
    if (!draft.message.trim()) {
      showToast('Add a message before sending');
      return;
    }

    const status: BroadcastStatus = scheduleMode === 'now' ? 'Sent' : 'Queued';
    const date =
      scheduleMode === 'now'
        ? formatNow()
        : `${new Date(scheduleDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${scheduleTime} (${timezone})`;

    const record: BroadcastRecord = {
      id: editingId ?? genId(),
      channel,
      title: draft.title,
      message: draft.message,
      audienceLabel,
      segmentId: audienceMode === 'segment' ? segmentId : '',
      recipientCount,
      status,
      date,
    };

    setBroadcasts((prev) =>
      editingId ? prev.map((b) => (b.id === editingId ? record : b)) : [record, ...prev]
    );

    showToast(
      status === 'Sent'
        ? `Queued to send to ${recipientCount.toLocaleString()} users`
        : `Scheduled for ${scheduleDate} at ${scheduleTime} (${timezone})`
    );

    resetComposer();
  }

  function loadDraftIntoComposer(record: BroadcastRecord) {
    setChannel(record.channel);
    setDrafts((prev) => ({ ...prev, [record.channel]: { title: record.title, message: record.message } }));
    setEditingId(record.id);

    if (record.segmentId) {
      setAudienceMode('segment');
      setSegmentId(record.segmentId);
    } else {
      setAudienceMode('all');
      setSegmentId('');
    }

    showToast(`Editing draft: ${record.title || record.message.slice(0, 30)}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const filteredBroadcasts = broadcasts.filter((b) => {
    const matchesStatus = statusFilter === 'All Statuses' || b.status === statusFilter;
    const matchesChannel = channelFilter === 'All Channels' || b.channel === channelFilter;
    return matchesStatus && matchesChannel;
  });

  const visibleBroadcasts = historyExpanded
    ? filteredBroadcasts
    : filteredBroadcasts.slice(0, HISTORY_PREVIEW_COUNT);

  const hasMoreHistory = filteredBroadcasts.length > HISTORY_PREVIEW_COUNT;

  // ---------- Audience modal logic ----------

  function openAudienceModal() {
    setAudienceSearch('');
    setAudienceLocationFilter('All Locations');
    setAudienceStatusFilter('All Status');
    setAudiencePage(1);
    setAudienceModalOpen(true);
  }

  const scopedAudience = useMemo(() => {
    if (audienceMode === 'all') return AUDIENCE_POOL;
    return AUDIENCE_POOL.filter((u) => u.segments.includes(segmentId));
  }, [audienceMode, segmentId]);

  const audienceLocations = useMemo(
    () => Array.from(new Set(scopedAudience.map((u) => u.location))).sort(),
    [scopedAudience]
  );

  const filteredAudience = scopedAudience.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(audienceSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(audienceSearch.toLowerCase());
    const matchesLocation = audienceLocationFilter === 'All Locations' || u.location === audienceLocationFilter;
    const matchesStatus = audienceStatusFilter === 'All Status' || u.status === audienceStatusFilter;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  const audienceTotalPages = Math.max(1, Math.ceil(filteredAudience.length / AUDIENCE_PAGE_SIZE));
  const audienceCurrentPage = Math.min(audiencePage, audienceTotalPages);
  const audiencePageStart = (audienceCurrentPage - 1) * AUDIENCE_PAGE_SIZE;
  const audiencePageRows = filteredAudience.slice(audiencePageStart, audiencePageStart + AUDIENCE_PAGE_SIZE);

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <SuperAdminBackButton />
        <div className="title-group">
          <h1>{editingId ? 'Edit Broadcast' : 'New Broadcast'}</h1>
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
          {editingId && (
            <button className="button-secondary" onClick={resetComposer}>
              Cancel Edit
            </button>
          )}
          <button className="button-secondary" onClick={handleSaveDraft}>
            Save as Draft
          </button>
          <button className="button-primary" onClick={handleReviewAndSend}>
            <Send size={14} style={{ marginRight: 6 }} />
            Review &amp; Send
          </button>
        </div>
      </section>

      <div className="content-tabs">
        {channelTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`content-tab ${channel === tab ? 'active' : ''}`}
            onClick={() => setChannel(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="split-layout split-2">
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="panel-card">
            <h3>Audience</h3>

            <label className={`pill-radio ${audienceMode === 'all' ? 'checked' : ''}`}>
              <input
                type="radio"
                name="audience-mode"
                checked={audienceMode === 'all'}
                onChange={() => setAudienceMode('all')}
              />
              All Users
            </label>

            <label className={`pill-radio ${audienceMode === 'segment' ? 'checked' : ''}`}>
              <input
                type="radio"
                name="audience-mode"
                checked={audienceMode === 'segment'}
                onChange={() => setAudienceMode('segment')}
              />
              Target Segment
            </label>

            {audienceMode === 'segment' && (
              <div style={{ paddingLeft: 26, marginTop: -6 }}>
                <FilterDropdown
                  value={segmentLabel}
                  options={[SEGMENT_SELECT_LABEL, ...SEGMENTS.map((s) => s.label)]}
                  onChange={(label) => {
                    const segment = SEGMENTS.find((s) => s.label === label);
                    setSegmentId(segment?.id ?? '');
                  }}
                />
              </div>
            )}

            <span className="form-hint">
              Estimated recipients: {recipientCount.toLocaleString()} users
            </span>
          </div>

          <div className="panel-card">
            <h3>Message</h3>

            {channel !== 'SMS' && (
              <div className="field-group">
                <label>Title</label>
                <input
                  value={draft.title}
                  maxLength={TITLE_LIMIT}
                  onChange={(e) => updateDraft('title', e.target.value)}
                  placeholder={channel === 'Email' ? 'Subject line' : 'Notification title'}
                />
                <span className="char-count">{draft.title.length}/{TITLE_LIMIT}</span>
              </div>
            )}

            <div className="field-group">
              <label>Message</label>
              <textarea
                rows={channel === 'SMS' ? 4 : 5}
                value={draft.message}
                maxLength={messageLimit}
                onChange={(e) => updateDraft('message', e.target.value)}
                placeholder={
                  channel === 'SMS'
                    ? 'Keep it short — SMS has a strict character limit.'
                    : "What's the announcement?"
                }
              />
              <span className="char-count">{draft.message.length}/{messageLimit}</span>
            </div>

            {channel !== 'SMS' && (
              <div className="field-group">
                <label>Media (Optional)</label>
                {imageAttached ? (
                  <div className="checkbox-row" style={{ justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text)', fontSize: 13 }}>image-attachment.png</span>
                    <button className="link-inline" onClick={() => setImageAttached(false)}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="link-inline"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    onClick={() => setImageAttached(true)}
                  >
                    <ImageIcon size={15} />
                    Add Image
                    <span className="form-hint" style={{ fontWeight: 400 }}>
                      &nbsp;PNG, JPG up to 5MB
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="panel-card">
            <h3>Schedule</h3>

            <label className={`pill-radio ${scheduleMode === 'now' ? 'checked' : ''}`}>
              <input
                type="radio"
                name="schedule-mode"
                checked={scheduleMode === 'now'}
                onChange={() => setScheduleMode('now')}
              />
              Send Now
            </label>

            <label className={`pill-radio ${scheduleMode === 'later' ? 'checked' : ''}`}>
              <input
                type="radio"
                name="schedule-mode"
                checked={scheduleMode === 'later'}
                onChange={() => setScheduleMode('later')}
              />
              Schedule For
            </label>

            {scheduleMode === 'later' && (
              <div className="pill-radio-schedule">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            )}

            <div className="field-group">
              <label>Timezone</label>
              <FilterDropdown
                value={timezone}
                options={['UTC+00:00', 'UTC+01:00', 'UTC+03:00', 'UTC-05:00']}
                onChange={setTimezone}
              />
            </div>
          </div>

          <div className="panel-card">
            <h3>Options</h3>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={sendTestMessage}
                onChange={(e) => setSendTestMessage(e.target.checked)}
              />
              Send test message
            </label>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={trackClicks}
                onChange={(e) => setTrackClicks(e.target.checked)}
              />
              Track clicks
            </label>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={openAudienceModal}
        className="info-banner"
        style={{
          marginTop: 20,
          width: '100%',
          textAlign: 'left',
          cursor: 'pointer',
          border: '1px solid rgba(139, 92, 246, 0.22)',
        }}
      >
        This broadcast will be sent to{' '}
        <strong style={{ color: '#FBBF24' }}>&nbsp;{recipientCount.toLocaleString()} users&nbsp;</strong>
        {scheduleMode === 'later' && (
          <> on {scheduleDate} at {scheduleTime} ({timezone})</>
        )}
        . <span style={{ textDecoration: 'underline' }}>View audience</span>
      </button>

      {/* ---------- Broadcast history ---------- */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 12px' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            Broadcast History
          </h3>
          {hasMoreHistory && (
            <button
              type="button"
              className="link-inline"
              onClick={() => setHistoryExpanded((current) => !current)}
            >
              {historyExpanded ? 'Show Less' : `View All (${filteredBroadcasts.length})`}
            </button>
          )}
        </div>

        <div className="ops-toolbar">
          <FilterDropdown
            value={statusFilter}
            options={['All Statuses', 'Draft', 'Queued', 'Sent']}
            onChange={(v) => { setStatusFilter(v); setHistoryExpanded(false); }}
          />
          <FilterDropdown
            value={channelFilter}
            options={['All Channels', 'Push', 'Email', 'SMS']}
            onChange={(v) => { setChannelFilter(v); setHistoryExpanded(false); }}
          />
        </div>

        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Broadcast</th>
                <th>Channel</th>
                <th>Audience</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ width: 70 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleBroadcasts.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong style={{ display: 'block', fontSize: 13 }}>
                      {b.title || b.message.slice(0, 40)}
                    </strong>
                    <span className="cell-muted" style={{ fontSize: 12 }}>{b.message}</span>
                  </td>
                  <td className="cell-muted">{b.channel}</td>
                  <td className="cell-muted">{b.audienceLabel}</td>
                  <td>{statusBadge(b.status)}</td>
                  <td className="cell-muted">{b.date}</td>
                  <td>
                    {b.status === 'Draft' ? (
                      <button
                        className="icon-btn"
                        aria-label="Edit draft"
                        onClick={() => loadDraftIntoComposer(b)}
                      >
                        <Pencil size={13} />
                      </button>
                    ) : (
                      <button
                        className="icon-btn"
                        aria-label="View broadcast"
                        onClick={() => showToast('Read-only — this broadcast has already gone out')}
                      >
                        <Eye size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredBroadcasts.length === 0 && (
                <tr>
                  <td colSpan={6} className="cell-muted" style={{ textAlign: 'center', padding: '32px 0' }}>
                    No broadcasts match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {hasMoreHistory && (
            <div className="table-pagination" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="link-inline"
                onClick={() => setHistoryExpanded((current) => !current)}
              >
                {historyExpanded
                  ? 'Show Less'
                  : `View All ${filteredBroadcasts.length} Broadcasts`}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Audience modal ---------- */}
      {audienceModalOpen && (
        <Modal title={`Audience — ${audienceLabel}`} onClose={() => setAudienceModalOpen(false)}>
          <div className="ops-toolbar" style={{ margin: '0 0 4px' }}>
            <FilterDropdown
              value={audienceLocationFilter}
              options={['All Locations', ...audienceLocations]}
              onChange={(v) => { setAudienceLocationFilter(v); setAudiencePage(1); }}
            />
            <FilterDropdown
              value={audienceStatusFilter}
              options={['All Status', 'Active', 'Inactive']}
              onChange={(v) => { setAudienceStatusFilter(v); setAudiencePage(1); }}
            />
            <div className="ops-search">
              <Search size={15} />
              <input
                placeholder="Search name or email..."
                value={audienceSearch}
                onChange={(e) => { setAudienceSearch(e.target.value); setAudiencePage(1); }}
              />
            </div>
          </div>

          <p className="form-hint" style={{ margin: '0 0 4px' }}>
            Showing a sample audience for preview. Full send targets {recipientCount.toLocaleString()} users.
          </p>

          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {audiencePageRows.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td className="cell-muted">{u.email}</td>
                    <td className="cell-muted">{u.location}</td>
                    <td>
                      {u.status === 'Active'
                        ? <span className="badge badge-green">Active</span>
                        : <span className="badge badge-grey">Inactive</span>}
                    </td>
                    <td className="cell-muted">{u.joined}</td>
                  </tr>
                ))}

                {audiencePageRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="cell-muted" style={{ textAlign: 'center', padding: '32px 0' }}>
                      No audience members match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="table-pagination">
              <span>
                Showing {filteredAudience.length === 0 ? 0 : audiencePageStart + 1} to{' '}
                {Math.min(audiencePageStart + AUDIENCE_PAGE_SIZE, filteredAudience.length)} of {filteredAudience.length}
              </span>
              <div className="pager">
                <button
                  disabled={audienceCurrentPage === 1}
                  onClick={() => setAudiencePage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>
                {Array.from({ length: audienceTotalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={p === audienceCurrentPage ? 'current' : ''}
                    onClick={() => setAudiencePage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={audienceCurrentPage === audienceTotalPages}
                  onClick={() => setAudiencePage((p) => Math.min(audienceTotalPages, p + 1))}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}