import { useState } from 'react';
import { Bold, Italic, Underline, List, AlignLeft, Plus } from 'lucide-react';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css';
import '../../../styles/pages/super-admin/content-platform-operations/NotificationTemplatesPage.css';

const channelTabs = ['Push', 'Email', 'SMS', 'In-App'] as const;
type ChannelTab = typeof channelTabs[number];

const TEMPLATES = [
  { id: 'welcome-email', name: 'Welcome Email', variables: 7 },
  { id: 'password-reset', name: 'Password Reset', variables: 5 },
  { id: 'email-verification', name: 'Email Verification', variables: 3 },
  { id: 'new-follower', name: 'New Follower', variables: 7 },
  { id: 'account-login-alert', name: 'Account Login Alert', variables: 4 },
  { id: 'subscription-expiring', name: 'Subscription Expiring', variables: 6 },
];

const VARIABLES = ['{{user_name}}', '{{platform_name}}', '{{user_email}}', '{{activation_link}}'];

export default function NotificationTemplatesPage() {
  const [channel, setChannel] = useState<ChannelTab>('Email');
  const [activeTemplate, setActiveTemplate] = useState('welcome-email');
  const [templateName, setTemplateName] = useState('Welcome Email');
  const [subject, setSubject] = useState('Welcome to {{platform_name}} 🎉');
  const [body, setBody] = useState(
    `Hi {{user_name}},\n\nWelcome to {{platform_name}}! We're excited to have you on board.\n\nGet started by exploring your dashboard and setting up your profile.\n\nCheers,\nThe {{platform_name}} Team`
  );

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <div className="title-group">
          <div className="breadcrumb">Content &amp; Platform &nbsp;›&nbsp; Notification Templates</div>
          <h1>Notification Templates</h1>
        </div>
        <div className="page-actions">
          <button className="button-primary">
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
            onClick={() => setChannel(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="split-layout split-2-narrow">
        <div className="list-panel template-list">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`list-row ${activeTemplate === t.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTemplate(t.id);
                setTemplateName(t.name);
              }}
            >
              <span className="list-row-title">{t.name}</span>
              <span className="list-row-count">{t.variables}</span>
            </button>
          ))}
        </div>

        <div className="content-editor-panel template-editor">
          <div className="field-row template-name-row">
            <div className="field-group">
              <label>Template Name</label>
              <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
            </div>
            <div className="template-editor-actions">
              <button className="button-secondary">Save Draft</button>
              <button className="button-primary">Save Template</button>
            </div>
          </div>

          <div className="field-group">
            <label>Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>

          <div className="field-group">
            <label>Body</label>
            <div className="rich-textarea">
              <div className="rich-toolbar">
                <button type="button"><Bold size={13} /></button>
                <button type="button"><Italic size={13} /></button>
                <button type="button"><Underline size={13} /></button>
                <button type="button"><List size={13} /></button>
                <button type="button"><AlignLeft size={13} /></button>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={9}
              />
            </div>
          </div>

          <div className="field-group">
            <label>Available Variables</label>
            <div className="tag-row">
              {VARIABLES.map((v) => (
                <span key={v} className="tag-pill">{v}</span>
              ))}
            </div>
          </div>

          <span className="content-footer-meta">Last updated by Merab Apio on May 13, 2024 10:15 AM</span>
        </div>
      </div>
    </main>
  );
}