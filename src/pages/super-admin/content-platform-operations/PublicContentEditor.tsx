import { useState } from 'react';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';

const tabs = ['Content', 'SEO', 'Navigation', 'Access'] as const;
type Tab = typeof tabs[number];

export default function PublicContentEditorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Content');
  const [pageTitle, setPageTitle] = useState('Welcome to League OS');
  const [slug, setSlug] = useState('welcome-to-league-os');
  const [heroTitle, setHeroTitle] = useState('Built for Leagues. Designed for Champions.');
  const [heroSubtitle, setHeroSubtitle] = useState('Power your league operations, engage your community, and grow the game.');
  const [whyTitle, setWhyTitle] = useState('');

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <div className="title-group">
          <div className="breadcrumb">Content & Platform &nbsp;›&nbsp; Public Content &nbsp;›&nbsp; Home Page</div>
          <h1>Edit Page</h1>
        </div>
        <div className="page-actions">
          <select className="page-select">
            <option>Home Page</option>
            <option>About Page</option>
            <option>Pricing Page</option>
          </select>
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

      {activeTab === 'Content' && (
        <div className="content-editor-panel">
          <div className="field-row">
            <div className="field-group">
              <label>Page Title</label>
              <input value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} />
            </div>
            <div className="field-group">
              <label>Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} />
            </div>
          </div>

          <div className="content-section">
            <h3>Hero Section</h3>
            <div className="field-group">
              <label>Title</label>
              <div className="rich-textarea">
                <div className="rich-toolbar">
                  <button type="button"><b>B</b></button>
                  <button type="button"><i>I</i></button>
                  <button type="button"><u>U</u></button>
                  <button type="button">•</button>
                  <button type="button">≡</button>
                </div>
                <textarea value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} rows={2} />
              </div>
            </div>

            <div className="field-group">
              <label>Subtitle</label>
              <textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={2} />
            </div>

            <div className="field-group">
              <label>Hero Image</label>
              <div className="hero-image-picker">
                <div className="hero-image-preview" />
                <div className="hero-image-actions">
                  <button className="button-secondary">Change image</button>
                  <span className="hero-image-hint">Recommended: 1920x60px</span>
                </div>
              </div>
            </div>
          </div>

          <div className="content-section">
            <h3>Why League OS?</h3>
            <div className="field-group">
              <label>Title</label>
              <div className="rich-textarea">
                <div className="rich-toolbar">
                  <button type="button"><b>B</b></button>
                  <button type="button"><i>I</i></button>
                  <button type="button"><u>U</u></button>
                  <button type="button">•</button>
                  <button type="button">≡</button>
                </div>
                <textarea value={whyTitle} onChange={(e) => setWhyTitle(e.target.value)} rows={2} placeholder="Everything you need to run your league" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SEO' && (
        <div className="content-editor-panel">
          <div className="field-group">
            <label>Meta Title</label>
            <input placeholder="League OS — Manage your league with ease" />
          </div>
          <div className="field-group">
            <label>Meta Description</label>
            <textarea rows={3} placeholder="A short description shown in search results…" />
          </div>
          <div className="field-group">
            <label>Social Share Image</label>
            <div className="hero-image-picker">
              <div className="hero-image-preview" />
              <button className="button-secondary">Upload image</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Navigation' && (
        <div className="content-editor-panel">
          <p className="panel-empty-hint">Navigation menu builder — reorder, add, or hide top-level links shown on the public site.</p>
        </div>
      )}

      {activeTab === 'Access' && (
        <div className="content-editor-panel">
          <div className="field-group toggle-row">
            <div>
              <label>Publicly visible</label>
              <span className="field-hint">Anyone can view this page without logging in.</span>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      )}

      <div className="content-footer-bar">
        <span className="content-footer-meta">Last updated by Merab Apio on May 13, 2024 10:15 AM</span>
        <div className="content-footer-actions">
          <button className="button-secondary">Preview</button>
          <button className="button-secondary">Save Draft</button>
          <button className="button-primary">Publish</button>
        </div>
      </div>
    </main>
  );
}