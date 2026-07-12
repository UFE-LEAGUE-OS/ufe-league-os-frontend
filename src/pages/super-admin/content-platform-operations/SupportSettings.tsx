import { useState } from 'react';
import FilterDropdown from '../../../components/FilterDropdown';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';
import SuperAdminBackButton from '../../../components/SuperAdminBackButton';

const tabs = ['General', 'Ticket Settings', 'SLA & Escalations', 'Automation', 'Integrations'] as const;
type Tab = typeof tabs[number];

type SupportHoursMode = '24-7' | 'custom';

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '10px 0',
      }}
    >
      <span style={{ fontSize: 13.5, color: 'var(--text)' }}>{label}</span>
      {children}
    </div>
  );
}

export default function SupportSettings() {
  const [tab, setTab] = useState<Tab>('General');
  const [toast, setToast] = useState<string | null>(null);

  // ---- General ----
  const [supportEmail, setSupportEmail] = useState('support@leagueos.com');
  const [fromEmail, setFromEmail] = useState('support@leagueos.com');
  const [hoursMode, setHoursMode] = useState<SupportHoursMode>('24-7');
  const [timezone, setTimezone] = useState('UTC+00:00');
  const [language, setLanguage] = useState('English');
  const [allowSubmit, setAllowSubmit] = useState(true);
  const [requireLogin, setRequireLogin] = useState(true);
  const [channels, setChannels] = useState({
    webForm: true,
    email: true,
    liveChat: true,
    phone: false,
    social: true,
  });

  // ---- Ticket Settings ----
  const [autoAssign, setAutoAssign] = useState(true);
  const [defaultPriority, setDefaultPriority] = useState('Normal');
  const [ticketPrefix, setTicketPrefix] = useState('LOS-');
  const [maxAttachmentMb, setMaxAttachmentMb] = useState(10);
  const [allowReopen, setAllowReopen] = useState(true);
  const [autoCloseDays, setAutoCloseDays] = useState(7);

  // ---- SLA & Escalations ----
  const [firstResponseHrs, setFirstResponseHrs] = useState(4);
  const [resolutionHrs, setResolutionHrs] = useState(48);
  const [escalateOnBreach, setEscalateOnBreach] = useState(true);
  const [notifyManager, setNotifyManager] = useState(true);
  const [businessHoursOnly, setBusinessHoursOnly] = useState(true);

  // ---- Automation ----
  const [autoReply, setAutoReply] = useState(true);
  const [autoReplyMessage, setAutoReplyMessage] = useState(
    "Thanks for reaching out! We've received your ticket and will respond shortly."
  );
  const [autoTagging, setAutoTagging] = useState(true);
  const [csatSurvey, setCsatSurvey] = useState(true);

  // ---- Integrations ----
  const [integrations, setIntegrations] = useState({
    slack: true,
    zendesk: false,
    hubspot: false,
    whatsapp: true,
  });

  function toggleChannel(key: keyof typeof channels) {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleIntegration(key: keyof typeof integrations) {
    setIntegrations((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    setToast('Changes saved');
    setTimeout(() => setToast(null), 2200);
  }

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <SuperAdminBackButton />
        <div className="title-group">
          <h1>Support Settings</h1>
        </div>
      </section>

      <div className="content-tabs">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            className={`content-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="content-editor-panel">
        {tab === 'General' && (
          <>
            <div className="content-section" style={{ borderTop: 'none', paddingTop: 0 }}>
              <h3>General Settings</h3>

              <div className="field-row">
                <div className="field-group">
                  <label>Support Email</label>
                  <input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
                </div>
                <div className="field-group">
                  <label>From Email (for replies)</label>
                  <input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
                </div>
              </div>

              <div className="field-group">
                <label>Support Hours</label>
                <div className="pill-radio-group" style={{ gap: 8 }}>
                  <label className={`pill-radio ${hoursMode === '24-7' ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="hours-mode"
                      checked={hoursMode === '24-7'}
                      onChange={() => setHoursMode('24-7')}
                    />
                    24/7
                  </label>
                  <label className={`pill-radio ${hoursMode === 'custom' ? 'checked' : ''}`}>
                    <input
                      type="radio"
                      name="hours-mode"
                      checked={hoursMode === 'custom'}
                      onChange={() => setHoursMode('custom')}
                    />
                    Custom Hours
                  </label>
                </div>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Timezone</label>
                  <FilterDropdown
                    value={timezone}
                    options={['UTC+00:00', 'UTC+01:00', 'UTC+03:00', 'UTC-05:00']}
                    onChange={setTimezone}
                  />
                </div>
                <div className="field-group">
                  <label>Default Language</label>
                  <FilterDropdown
                    value={language}
                    options={['English', 'French', 'Swahili', 'Luganda']}
                    onChange={setLanguage}
                  />
                </div>
              </div>

              <div className="toggle-row" style={{ display: 'flex' }}>
                <SettingRow label="Allow Users to Submit Tickets">
                  <Toggle checked={allowSubmit} onChange={setAllowSubmit} />
                </SettingRow>
              </div>
              <SettingRow label="Require Login to Submit Ticket">
                <Toggle checked={requireLogin} onChange={setRequireLogin} />
              </SettingRow>
            </div>

            <div className="content-section">
              <h3>Support Channels</h3>
              <SettingRow label="Web Ticket Form">
                <Toggle checked={channels.webForm} onChange={() => toggleChannel('webForm')} />
              </SettingRow>
              <SettingRow label="Email">
                <Toggle checked={channels.email} onChange={() => toggleChannel('email')} />
              </SettingRow>
              <SettingRow label="Live Chat">
                <Toggle checked={channels.liveChat} onChange={() => toggleChannel('liveChat')} />
              </SettingRow>
              <SettingRow label="Phone Support">
                <Toggle checked={channels.phone} onChange={() => toggleChannel('phone')} />
              </SettingRow>
              <SettingRow label="Social Media">
                <Toggle checked={channels.social} onChange={() => toggleChannel('social')} />
              </SettingRow>
            </div>
          </>
        )}

        {tab === 'Ticket Settings' && (
          <div className="content-section" style={{ borderTop: 'none', paddingTop: 0 }}>
            <h3>Ticket Behavior</h3>

            <SettingRow label="Auto-assign new tickets">
              <Toggle checked={autoAssign} onChange={setAutoAssign} />
            </SettingRow>

            <div className="field-row">
              <div className="field-group">
                <label>Default Priority</label>
                <FilterDropdown
                  value={defaultPriority}
                  options={['Low', 'Normal', 'High', 'Urgent']}
                  onChange={setDefaultPriority}
                />
              </div>
              <div className="field-group">
                <label>Ticket ID Prefix</label>
                <input value={ticketPrefix} onChange={(e) => setTicketPrefix(e.target.value)} />
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label>
                  Max Attachment Size
                  <span className="field-hint">Applies to all support channels</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={maxAttachmentMb}
                  onChange={(e) => setMaxAttachmentMb(Number(e.target.value))}
                />
              </div>
              <div className="field-group">
                <label>
                  Auto-close After Resolved
                  <span className="field-hint">Days with no reply before ticket closes</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={autoCloseDays}
                  onChange={(e) => setAutoCloseDays(Number(e.target.value))}
                />
              </div>
            </div>

            <SettingRow label="Allow users to reopen closed tickets">
              <Toggle checked={allowReopen} onChange={setAllowReopen} />
            </SettingRow>
          </div>
        )}

        {tab === 'SLA & Escalations' && (
          <div className="content-section" style={{ borderTop: 'none', paddingTop: 0 }}>
            <h3>Response Time Targets</h3>

            <div className="field-row">
              <div className="field-group">
                <label>First Response SLA (hours)</label>
                <input
                  type="number"
                  min={1}
                  value={firstResponseHrs}
                  onChange={(e) => setFirstResponseHrs(Number(e.target.value))}
                />
              </div>
              <div className="field-group">
                <label>Resolution SLA (hours)</label>
                <input
                  type="number"
                  min={1}
                  value={resolutionHrs}
                  onChange={(e) => setResolutionHrs(Number(e.target.value))}
                />
              </div>
            </div>

            <SettingRow label="Count business hours only">
              <Toggle checked={businessHoursOnly} onChange={setBusinessHoursOnly} />
            </SettingRow>

            <h3 style={{ marginTop: 8 }}>Escalation Rules</h3>

            <SettingRow label="Automatically escalate on SLA breach">
              <Toggle checked={escalateOnBreach} onChange={setEscalateOnBreach} />
            </SettingRow>
            <SettingRow label="Notify team manager on escalation">
              <Toggle checked={notifyManager} onChange={setNotifyManager} />
            </SettingRow>

            {escalateOnBreach && (
              <div className="info-banner">
                Tickets breaching SLA will auto-escalate to the next tier and notify assigned managers.
              </div>
            )}
          </div>
        )}

        {tab === 'Automation' && (
          <div className="content-section" style={{ borderTop: 'none', paddingTop: 0 }}>
            <h3>Automated Replies</h3>

            <SettingRow label="Send auto-reply on new ticket">
              <Toggle checked={autoReply} onChange={setAutoReply} />
            </SettingRow>

            {autoReply && (
              <div className="field-group">
                <label>Auto-reply Message</label>
                <textarea
                  rows={4}
                  value={autoReplyMessage}
                  onChange={(e) => setAutoReplyMessage(e.target.value)}
                />
              </div>
            )}

            <h3 style={{ marginTop: 8 }}>Workflow</h3>

            <SettingRow label="Auto-tag tickets by keyword">
              <Toggle checked={autoTagging} onChange={setAutoTagging} />
            </SettingRow>
            <SettingRow label="Send CSAT survey after resolution">
              <Toggle checked={csatSurvey} onChange={setCsatSurvey} />
            </SettingRow>
          </div>
        )}

        {tab === 'Integrations' && (
          <div className="content-section" style={{ borderTop: 'none', paddingTop: 0 }}>
            <h3>Connected Tools</h3>

            <SettingRow label="Slack notifications">
              <Toggle checked={integrations.slack} onChange={() => toggleIntegration('slack')} />
            </SettingRow>
            <SettingRow label="Zendesk sync">
              <Toggle checked={integrations.zendesk} onChange={() => toggleIntegration('zendesk')} />
            </SettingRow>
            <SettingRow label="HubSpot sync">
              <Toggle checked={integrations.hubspot} onChange={() => toggleIntegration('hubspot')} />
            </SettingRow>
            <SettingRow label="WhatsApp Business">
              <Toggle checked={integrations.whatsapp} onChange={() => toggleIntegration('whatsapp')} />
            </SettingRow>

            <span className="form-hint">
              Disabling an integration stops new tickets from syncing but keeps existing history.
            </span>
          </div>
        )}

        <div className="content-footer-bar">
          <span className="content-footer-meta">
            {toast ?? 'Changes apply immediately after saving.'}
          </span>
          <div className="content-footer-actions">
            <button className="button-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}