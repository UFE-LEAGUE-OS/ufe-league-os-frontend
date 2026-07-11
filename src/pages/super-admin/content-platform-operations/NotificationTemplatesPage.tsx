import { useState, useMemo, useEffect } from 'react';
import { Bold, Italic, Underline, List, AlignLeft, Plus, Check } from 'lucide-react';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css';
import '../../../styles/pages/super-admin/content-platform-operations/NotificationTemplatesPage.css';

const channelTabs = ['Push', 'Email', 'SMS', 'In-App'] as const;
type ChannelTab = typeof channelTabs[number];

type Template = {
  id: string;
  name: string;
  variables: number;
  subject?: string;
  title?: string;
  body: string;
  cta?: string;
  isDraft: boolean;
  updatedBy: string;
  updatedAt: string;
};

const VARIABLES = ['{{user_name}}', '{{platform_name}}', '{{user_email}}', '{{activation_link}}'];

const INITIAL_TEMPLATES: Record<ChannelTab, Template[]> = {
  Push: [
    {
      id: 'push-welcome',
      name: 'Welcome Push',
      variables: 2,
      title: 'Welcome, {{user_name}}!',
      body: "You're all set on {{platform_name}}. Tap to explore.",
      isDraft: false,
      updatedBy: 'Merab Apio',
      updatedAt: 'May 13, 2024 10:15 AM',
    },
    {
      id: 'push-login-alert',
      name: 'New Login Alert',
      variables: 2,
      title: 'New login detected',
      body: 'Was this you, {{user_name}}? Tap to review activity.',
      isDraft: false,
      updatedBy: 'Merab Apio',
      updatedAt: 'May 10, 2024 4:02 PM',
    },
    {
      id: 'push-follower',
      name: 'New Follower',
      variables: 2,
      title: 'New follower',
      body: '{{user_name}} started following you.',
      isDraft: false,
      updatedBy: 'Merab Apio',
      updatedAt: 'May 8, 2024 9:40 AM',
    },
  ],
  Email: [
    {
      id: 'welcome-email',
      name: 'Welcome Email',
      variables: 7,
      subject: 'Welcome to {{platform_name}} 🎉',
      body: `Hi {{user_name}},\n\nWelcome to {{platform_name}}! We're excited to have you on board.\n\nGet started by exploring your dashboard and setting up your profile.\n\nCheers,\nThe {{platform_name}} Team`,
      isDraft: false,
      updatedBy: 'Merab Apio',
      updatedAt: 'May 13, 2024 10:15 AM',
    },
    {
      id: 'password-reset',
      name: 'Password Reset',
      variables: 5,
      subject: 'Reset your {{platform_name}} password',
      body: `Hi {{user_name}},\n\nWe received a request to reset your password. Use the link below:\n\n{{activation_link}}\n\nIf you didn't request this, you can ignore this email.`,
      isDraft: false,
      updatedBy: 'Merab Apio',
      updatedAt: 'May 11, 2024 2:30 PM',
    },
    {
      id: 'email-verification',
      name: 'Email Verification',
      variables: 3,
      subject: 'Verify your email address',
      body: `Hi {{user_name}},\n\nPlease confirm your email address by clicking below:\n\n{{activation_link}}`,
      isDraft: false,
      updatedBy: 'Merab Apio',
      updatedAt: 'May 9, 2024 11:05 AM',
    },
    {
      id: 'subscription-expiring',
      name: 'Subscription Expiring',
      variables: 6,
      subject: 'Your {{platform_name}} subscription is expiring soon',
      body: `Hi {{user_name}},\n\nYour subscription is set to expire soon. Renew now to avoid losing access.`,
      isDraft: false,
      updatedBy: 'Merab Apio',
      updatedAt: 'May 6, 2024 8:12 AM',
    },
  ],
  SMS: [
    {
      id: 'sms-otp',
      name: 'OTP Code',
      variables: 2,
      body: 'Your {{platform_name}} code is {{activation_link}}. It expires in 10 minutes.',
      isDraft: false,
      updatedBy: 'Merab Apio',
      updatedAt: 'May 12, 2024 6:20 PM',
    },
    {
      id: 'sms-login-alert',
      name: 'Login Alert',
      variables: 1,
      body: 'New login to your {{platform_name}} account. Reply STOP to opt out.',
      isDraft: false,
      updatedBy: 'Merab Apio',
      updatedAt: 'May 10, 2024 3:55 PM',
    },
  ],
  'In-App': [
    {
      id: 'in-app-follower',
      name: 'New Follower',
      variables: 2,
      title: 'New follower',
      body: '{{user_name}} just followed you.',
      cta: 'View profile',
      isDraft: false,
      updatedBy: 'Merab Apio',
      updatedAt: 'May 7, 2024 1:00 PM',
    },
    {
      id: 'in-app-feature',
      name: 'Feature Announcement',
      variables: 2,
      title: 'New on {{platform_name}}',
      body: 'Check out what just launched.',
      cta: 'Learn more',
      isDraft: false,
      updatedBy: 'Merab Apio',
      updatedAt: 'May 5, 2024 9:30 AM',
    },
  ],
};

const SMS_CHAR_LIMIT = 160;
const CURRENT_USER = 'Merab Apio';

function formatNow() {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function genId() {
  return `tpl-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export default function NotificationTemplatesPage() {
  const [templatesState, setTemplatesState] = useState<Record<ChannelTab, Template[]>>(INITIAL_TEMPLATES);
  const [channel, setChannel] = useState<ChannelTab>('Push');
  const [activeTemplateId, setActiveTemplateId] = useState(INITIAL_TEMPLATES['Push'][0].id);
  const [listFilter, setListFilter] = useState<'all' | 'drafts'>('all');

  // Unsaved edits per template id, merged over the saved base when rendering
  const [pendingEdits, setPendingEdits] = useState<Record<string, Partial<Template>>>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const allTemplates = templatesState[channel];
  const templates = listFilter === 'drafts' ? allTemplates.filter((t) => t.isDraft) : allTemplates;
  const draftCount = allTemplates.filter((t) => t.isDraft).length;

  const baseTemplate = useMemo(
    () => allTemplates.find((t) => t.id === activeTemplateId) ?? allTemplates[0],
    [allTemplates, activeTemplateId]
  );
  const edit = pendingEdits[baseTemplate.id] ?? {};
  const current: Template = { ...baseTemplate, ...edit };
  const hasUnsavedChanges = Object.keys(edit).length > 0;

  function switchChannel(next: ChannelTab) {
    setChannel(next);
    setListFilter('all');
    setActiveTemplateId(templatesState[next][0]?.id ?? '');
  }

  function updateField<K extends keyof Template>(field: K, value: Template[K]) {
    setPendingEdits((prev) => ({
      ...prev,
      [current.id]: { ...prev[current.id], [field]: value },
    }));
  }

  function showToast(message: string) {
    setToast(message);
  }

  function commitDraft(field: 'id', markAsDraft: boolean) {
    const updated: Template = {
      ...current,
      isDraft: markAsDraft,
      updatedBy: CURRENT_USER,
      updatedAt: formatNow(),
    };

    setTemplatesState((prev) => ({
      ...prev,
      [channel]: prev[channel].map((t) => (t.id === updated.id ? updated : t)),
    }));

    setPendingEdits((prev) => {
      const next = { ...prev };
      delete next[updated.id];
      return next;
    });
  }

  function handleSaveDraft() {
    commitDraft('id', true);
    showToast('Saved as draft');
  }

  function handleSaveTemplate() {
    if (!current.name.trim()) {
      showToast('Template name is required');
      return;
    }
    commitDraft('id', false);
    showToast('Template saved');
  }

  function handleNewTemplate() {
    const id = genId();
    const blank: Template = {
      id,
      name: 'Untitled Template',
      variables: 0,
      title: channel === 'Push' || channel === 'In-App' ? '' : undefined,
      subject: channel === 'Email' ? '' : undefined,
      cta: channel === 'In-App' ? '' : undefined,
      body: '',
      isDraft: true,
      updatedBy: CURRENT_USER,
      updatedAt: formatNow(),
    };

    setTemplatesState((prev) => ({
      ...prev,
      [channel]: [blank, ...prev[channel]],
    }));

    setListFilter('all');
    setActiveTemplateId(id);
    showToast('New template created — remember to save it');
  }

  const smsCharCount = channel === 'SMS' ? current.body.length : null;

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <div className="title-group">
          <div className="breadcrumb">Content &amp; Platform &nbsp;›&nbsp; Notification Templates</div>
          <h1>Notification Templates</h1>
        </div>
        <div className="page-actions" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {toast && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                color: '#4ADE80',
                background: 'rgba(74, 222, 128, 0.12)',
                padding: '6px 12px',
                borderRadius: 999,
              }}
            >
              <Check size={13} />
              {toast}
            </span>
          )}
          <button className="button-primary" onClick={handleNewTemplate}>
            <Plus size={15} style={{ marginRight: 6 }} />
            New Template
          </button>
        </div>
      </section>

      <div className="content-tabs">
        {channelTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`content-tab ${channel === tab ? 'active' : ''}`}
            onClick={() => switchChannel(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="split-layout split-2-narrow">
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <button
              type="button"
              className={`subnav-item ${listFilter === 'all' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center' }}
              onClick={() => setListFilter('all')}
            >
              All ({allTemplates.length})
            </button>
            <button
              type="button"
              className={`subnav-item ${listFilter === 'drafts' ? 'active' : ''}`}
              style={{ flex: 1, textAlign: 'center' }}
              onClick={() => setListFilter('drafts')}
            >
              Drafts ({draftCount})
            </button>
          </div>

          <div className="list-panel template-list">
            {templates.map((t) => {
              const rowEdit = pendingEdits[t.id];
              const rowHasUnsaved = Boolean(rowEdit && Object.keys(rowEdit).length > 0);
              const rowName = rowEdit?.name ?? t.name;

              return (
                <button
                  key={t.id}
                  type="button"
                  className={`list-row ${current.id === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTemplateId(t.id)}
                >
                  <span className="list-row-title">
                    {rowName}
                    {t.isDraft && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#FBBF24',
                          background: 'rgba(251, 191, 36, 0.14)',
                          padding: '2px 6px',
                          borderRadius: 999,
                        }}
                      >
                        DRAFT
                      </span>
                    )}
                    {rowHasUnsaved && (
                      <span
                        title="Unsaved changes"
                        style={{
                          display: 'inline-block',
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          background: '#F87171',
                          marginLeft: 8,
                          verticalAlign: 'middle',
                        }}
                      />
                    )}
                  </span>
                  <span className="list-row-count">{t.variables}</span>
                </button>
              );
            })}

            {templates.length === 0 && (
              <p className="panel-empty-hint" style={{ padding: '12px 14px' }}>
                {listFilter === 'drafts' ? "No drafts saved for this channel yet." : 'No templates yet.'}
              </p>
            )}
          </div>
        </div>

        <div className="content-editor-panel template-editor">
          <div className="field-row template-name-row">
            <div className="field-group">
              <label>
                Template Name
                {current.isDraft && <span className="field-hint" style={{ color: '#FBBF24' }}> · Draft</span>}
              </label>
              <input
                value={current.name}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>
            <div className="template-editor-actions">
              <button className="button-secondary" onClick={handleSaveDraft}>
                Save Draft
              </button>
              <button className="button-primary" onClick={handleSaveTemplate}>
                Save Template
              </button>
            </div>
          </div>

          {(channel === 'Push' || channel === 'In-App') && (
            <div className="field-group">
              <label>Title</label>
              <input
                value={current.title ?? ''}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>
          )}

          {channel === 'Email' && (
            <div className="field-group">
              <label>Subject</label>
              <input
                value={current.subject ?? ''}
                onChange={(e) => updateField('subject', e.target.value)}
              />
            </div>
          )}

          <div className="field-group">
            <label>
              Body
              {channel === 'SMS' && (
                <span className="field-hint">
                  {smsCharCount}/{SMS_CHAR_LIMIT} characters
                  {smsCharCount !== null && smsCharCount > SMS_CHAR_LIMIT ? ' — over limit' : ''}
                </span>
              )}
            </label>

            {channel === 'Email' ? (
              <div className="rich-textarea">
                <div className="rich-toolbar">
                  <button type="button"><Bold size={13} /></button>
                  <button type="button"><Italic size={13} /></button>
                  <button type="button"><Underline size={13} /></button>
                  <button type="button"><List size={13} /></button>
                  <button type="button"><AlignLeft size={13} /></button>
                </div>
                <textarea
                  value={current.body}
                  onChange={(e) => updateField('body', e.target.value)}
                  rows={9}
                />
              </div>
            ) : (
              <textarea
                value={current.body}
                onChange={(e) => updateField('body', e.target.value)}
                rows={channel === 'SMS' ? 4 : 6}
                maxLength={channel === 'SMS' ? SMS_CHAR_LIMIT + 40 : undefined}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(148, 163, 184, 0.16)',
                  borderRadius: 12,
                  padding: '12px 14px',
                  color: 'var(--text)',
                  fontSize: 13.5,
                  outline: 'none',
                  resize: 'vertical',
                  width: '100%',
                }}
              />
            )}
          </div>

          {channel === 'In-App' && (
            <div className="field-group">
              <label>Call to Action Label</label>
              <input
                value={current.cta ?? ''}
                onChange={(e) => updateField('cta', e.target.value)}
              />
            </div>
          )}

          <div className="field-group">
            <label>Available Variables</label>
            <div className="tag-row">
              {VARIABLES.map((v) => (
                <span key={v} className="tag-pill">{v}</span>
              ))}
            </div>
          </div>

          <span className="content-footer-meta">
            Last updated by {current.updatedBy} on {current.updatedAt}
            {hasUnsavedChanges && (
              <span style={{ color: '#F87171', marginLeft: 8 }}>· Unsaved changes</span>
            )}
          </span>
        </div>
      </div>
    </main>
  );
}