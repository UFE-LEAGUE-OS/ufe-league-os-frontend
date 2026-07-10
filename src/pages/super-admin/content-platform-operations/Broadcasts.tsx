import { useState, useMemo } from 'react';
import { ImageIcon, Send } from 'lucide-react';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';

const channelTabs = ['Push', 'Email', 'SMS'] as const;
type ChannelTab = typeof channelTabs[number];

type AudienceMode = 'all' | 'segment';
type ScheduleMode = 'now' | 'later';

const SEGMENTS = [
  { id: 'active-fans', label: 'Active Fans (last 30 days)', count: 24560 },
  { id: 'season-ticket', label: 'Season Ticket Holders', count: 6120 },
  { id: 'fantasy-players', label: 'Fantasy League Players', count: 9840 },
  { id: 'inactive-90', label: 'Inactive 90+ Days', count: 3175 },
];

const ALL_USERS_COUNT = 24560;

const TITLE_LIMIT = 100;
const MESSAGE_LIMIT_DEFAULT = 500;
const SMS_LIMIT = 160;

type ChannelDraft = {
  title: string;
  message: string;
};

const INITIAL_DRAFTS: Record<ChannelTab, ChannelDraft> = {
  Push: { title: 'Important Update', message: "We're excited to announce our new tournament feature. Check it out now!" },
  Email: { title: '', message: '' },
  SMS: { title: '', message: '' },
};

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

  const draft = drafts[channel];
  const messageLimit = channel === 'SMS' ? SMS_LIMIT : MESSAGE_LIMIT_DEFAULT;

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

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  function handleSaveDraft() {
    showToast('Broadcast saved as draft');
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
    showToast(
      scheduleMode === 'now'
        ? `Queued to send to ${recipientCount.toLocaleString()} users`
        : `Scheduled for ${scheduleDate} at ${scheduleTime} (${timezone})`
    );
  }

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <div className="title-group">
          <h1>New Broadcast</h1>
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
              <div className="field-group" style={{ paddingLeft: 26, marginTop: -6 }}>
                <select
                  className="page-select"
                  value={segmentId}
                  onChange={(e) => setSegmentId(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">Select segment...</option>
                  {SEGMENTS.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
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
              <select
                className="page-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                style={{ width: '100%' }}
              >
                <option>UTC+00:00</option>
                <option>UTC+01:00</option>
                <option>UTC+03:00</option>
                <option>UTC-05:00</option>
              </select>
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

      <div className="info-banner" style={{ marginTop: 20 }}>
        This broadcast will be sent to{' '}
        <strong style={{ color: '#FBBF24' }}>&nbsp;{recipientCount.toLocaleString()} users&nbsp;</strong>
        {scheduleMode === 'later' && (
          <> on {scheduleDate} at {scheduleTime} ({timezone})</>
        )}
        .
      </div>
    </main>
  );
}