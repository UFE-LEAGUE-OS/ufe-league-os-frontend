import { useMemo, useRef, useState } from 'react';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';
import FilterDropdown from '../../../components/FilterDropdown';

const tabs = ['Content', 'SEO', 'Navigation', 'Access'] as const;
type Tab = typeof tabs[number];

type NavLink = {
  id: string;
  label: string;
  url: string;
  hidden: boolean;
};

type PageData = {
  pageTitle: string;
  slug: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string | null;
  whyTitle: string;
  metaTitle: string;
  metaDescription: string;
  socialImage: string | null;
  navLinks: NavLink[];
  publiclyVisible: boolean;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
};

const PAGE_NAMES = ['Home Page', 'About Page', 'Pricing Page'] as const;
type PageName = typeof PAGE_NAMES[number];

const makeInitialPages = (): Record<PageName, PageData> => ({
  'Home Page': {
    pageTitle: 'Welcome to League OS',
    slug: 'welcome-to-league-os',
    heroTitle: 'Built for Leagues. Designed for Champions.',
    heroSubtitle: 'Power your league operations, engage your community, and grow the game.',
    heroImage: null,
    whyTitle: '',
    metaTitle: 'League OS — Manage your league with ease',
    metaDescription: '',
    socialImage: null,
    navLinks: [
      { id: 'nav-1', label: 'Home', url: '/', hidden: false },
      { id: 'nav-2', label: 'Pricing', url: '/pricing', hidden: false },
      { id: 'nav-3', label: 'About', url: '/about', hidden: false },
    ],
    publiclyVisible: true,
    lastUpdatedBy: 'Merab Apio',
    lastUpdatedAt: 'May 13, 2024 10:15 AM',
  },
  'About Page': {
    pageTitle: 'About League OS',
    slug: 'about',
    heroTitle: 'The team behind the platform',
    heroSubtitle: 'A small crew obsessed with making league operations painless.',
    heroImage: null,
    whyTitle: '',
    metaTitle: 'About League OS',
    metaDescription: '',
    socialImage: null,
    navLinks: [
      { id: 'nav-1', label: 'Home', url: '/', hidden: false },
      { id: 'nav-2', label: 'About', url: '/about', hidden: false },
    ],
    publiclyVisible: true,
    lastUpdatedBy: 'Merab Apio',
    lastUpdatedAt: 'Apr 2, 2024 3:40 PM',
  },
  'Pricing Page': {
    pageTitle: 'League OS Pricing',
    slug: 'pricing',
    heroTitle: 'Plans for leagues of every size',
    heroSubtitle: 'Start free. Upgrade when your league grows.',
    heroImage: null,
    whyTitle: '',
    metaTitle: 'League OS Pricing',
    metaDescription: '',
    socialImage: null,
    navLinks: [
      { id: 'nav-1', label: 'Home', url: '/', hidden: false },
      { id: 'nav-2', label: 'Pricing', url: '/pricing', hidden: false },
    ],
    publiclyVisible: true,
    lastUpdatedBy: 'Merab Apio',
    lastUpdatedAt: 'Mar 28, 2024 9:05 AM',
  },
});

function formatNow(): string {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

type SaveState = 'idle' | 'saving' | 'saved';

export default function PublicContentEditorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Content');
  const [selectedPage, setSelectedPage] = useState<PageName>('Home Page');
  const [pages, setPages] = useState<Record<PageName, PageData>>(makeInitialPages);
  const [savedPages, setSavedPages] = useState<Record<PageName, PageData>>(makeInitialPages);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [toast, setToast] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const socialImageInputRef = useRef<HTMLInputElement>(null);

  const current = pages[selectedPage];
  const isDirty = useMemo(
    () => JSON.stringify(current) !== JSON.stringify(savedPages[selectedPage]),
    [current, savedPages, selectedPage]
  );

  function updateCurrent(patch: Partial<PageData>) {
    setPages((prev) => ({ ...prev, [selectedPage]: { ...prev[selectedPage], ...patch } }));
  }

  function handlePageSwitch(name: PageName) {
    setSelectedPage(name);
    setSaveState('idle');
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  }

  function persist(kind: 'draft' | 'publish') {
    setSaveState('saving');
    window.setTimeout(() => {
      const stamped: PageData = {
        ...current,
        lastUpdatedBy: 'You',
        lastUpdatedAt: formatNow(),
      };
      setPages((prev) => ({ ...prev, [selectedPage]: stamped }));
      setSavedPages((prev) => ({ ...prev, [selectedPage]: stamped }));
      setSaveState('saved');
      showToast(kind === 'draft' ? 'Draft saved' : 'Page published');
      window.setTimeout(() => setSaveState('idle'), 1500);
    }, 600);
  }

  function handleImagePick(file: File | null, target: 'hero' | 'social') {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (target === 'hero') updateCurrent({ heroImage: dataUrl });
      else updateCurrent({ socialImage: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  function addNavLink() {
    const newLink: NavLink = {
      id: `nav-${Date.now()}`,
      label: 'New link',
      url: '/',
      hidden: false,
    };
    updateCurrent({ navLinks: [...current.navLinks, newLink] });
  }

  function updateNavLink(id: string, patch: Partial<NavLink>) {
    updateCurrent({
      navLinks: current.navLinks.map((link) => (link.id === id ? { ...link, ...patch } : link)),
    });
  }

  function removeNavLink(id: string) {
    updateCurrent({ navLinks: current.navLinks.filter((link) => link.id !== id) });
  }

  function moveNavLink(id: string, direction: -1 | 1) {
    const links = [...current.navLinks];
    const index = links.findIndex((link) => link.id === id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= links.length) return;
    [links[index], links[targetIndex]] = [links[targetIndex], links[index]];
    updateCurrent({ navLinks: links });
  }

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <div className="title-group">
          <div className="breadcrumb">Content & Platform &nbsp;›&nbsp; Public Content &nbsp;›&nbsp; {selectedPage}</div>
          <h1>
            Edit Page
            {isDirty && (
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#9a6b00',
                  background: '#fff3d6',
                  borderRadius: 999,
                  padding: '2px 10px',
                  verticalAlign: 'middle',
                }}
              >
                Unsaved changes
              </span>
            )}
          </h1>
        </div>
        <div className="page-actions">
          <FilterDropdown
            value={selectedPage}
            options={[...PAGE_NAMES]}
            onChange={(value) => handlePageSwitch(value as PageName)}
          />
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
              <input value={current.pageTitle} onChange={(e) => updateCurrent({ pageTitle: e.target.value })} />
            </div>
            <div className="field-group">
              <label>Slug</label>
              <input value={current.slug} onChange={(e) => updateCurrent({ slug: e.target.value })} />
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
                <textarea
                  value={current.heroTitle}
                  onChange={(e) => updateCurrent({ heroTitle: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <div className="field-group">
              <label>Subtitle</label>
              <textarea
                value={current.heroSubtitle}
                onChange={(e) => updateCurrent({ heroSubtitle: e.target.value })}
                rows={2}
              />
            </div>

            <div className="field-group">
              <label>Hero Image</label>
              <div className="hero-image-picker">
                <div
                  className="hero-image-preview"
                  style={
                    current.heroImage
                      ? { backgroundImage: `url(${current.heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : undefined
                  }
                />
                <div className="hero-image-actions">
                  <input
                    ref={heroImageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleImagePick(e.target.files?.[0] ?? null, 'hero')}
                  />
                  <button className="button-secondary" onClick={() => heroImageInputRef.current?.click()}>
                    Change image
                  </button>
                  {current.heroImage && (
                    <button className="button-secondary" onClick={() => updateCurrent({ heroImage: null })}>
                      Remove
                    </button>
                  )}
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
                <textarea
                  value={current.whyTitle}
                  onChange={(e) => updateCurrent({ whyTitle: e.target.value })}
                  rows={2}
                  placeholder="Everything you need to run your league"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'SEO' && (
        <div className="content-editor-panel">
          <div className="field-group">
            <label>Meta Title</label>
            <input
              placeholder="League OS — Manage your league with ease"
              value={current.metaTitle}
              onChange={(e) => updateCurrent({ metaTitle: e.target.value })}
            />
          </div>
          <div className="field-group">
            <label>Meta Description</label>
            <textarea
              rows={3}
              placeholder="A short description shown in search results…"
              value={current.metaDescription}
              onChange={(e) => updateCurrent({ metaDescription: e.target.value })}
            />
            <span className="hero-image-hint">{current.metaDescription.length}/160 characters</span>
          </div>
          <div className="field-group">
            <label>Social Share Image</label>
            <div className="hero-image-picker">
              <div
                className="hero-image-preview"
                style={
                  current.socialImage
                    ? { backgroundImage: `url(${current.socialImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                    : undefined
                }
              />
              <input
                ref={socialImageInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleImagePick(e.target.files?.[0] ?? null, 'social')}
              />
              <button className="button-secondary" onClick={() => socialImageInputRef.current?.click()}>
                Upload image
              </button>
              {current.socialImage && (
                <button className="button-secondary" onClick={() => updateCurrent({ socialImage: null })}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Navigation' && (
        <div className="content-editor-panel">
          <p className="panel-empty-hint">
            Navigation menu builder — reorder, add, or hide top-level links shown on the public site.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {current.navLinks.map((link, index) => (
              <div
                key={link.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  border: '1px solid #e3e3e3',
                  borderRadius: 8,
                  padding: '10px 12px',
                  opacity: link.hidden ? 0.55 : 1,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <button
                    type="button"
                    className="button-secondary"
                    disabled={index === 0}
                    onClick={() => moveNavLink(link.id, -1)}
                    style={{ padding: '2px 8px', lineHeight: 1 }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="button-secondary"
                    disabled={index === current.navLinks.length - 1}
                    onClick={() => moveNavLink(link.id, 1)}
                    style={{ padding: '2px 8px', lineHeight: 1 }}
                  >
                    ↓
                  </button>
                </div>

                <input
                  value={link.label}
                  onChange={(e) => updateNavLink(link.id, { label: e.target.value })}
                  placeholder="Label"
                  style={{ flex: '0 0 160px' }}
                />
                <input
                  value={link.url}
                  onChange={(e) => updateNavLink(link.id, { url: e.target.value })}
                  placeholder="/path"
                  style={{ flex: 1 }}
                />

                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={!link.hidden}
                    onChange={(e) => updateNavLink(link.id, { hidden: !e.target.checked })}
                  />
                  Visible
                </label>

                <button type="button" className="button-secondary" onClick={() => removeNavLink(link.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="button-secondary" style={{ marginTop: 12 }} onClick={addNavLink}>
            + Add link
          </button>
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
              <input
                type="checkbox"
                checked={current.publiclyVisible}
                onChange={(e) => updateCurrent({ publiclyVisible: e.target.checked })}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          {!current.publiclyVisible && (
            <p className="panel-empty-hint">
              This page is hidden from the public site and can only be reached with a direct admin preview link.
            </p>
          )}
        </div>
      )}

      <div className="content-footer-bar">
        <span className="content-footer-meta">
          Last updated by {current.lastUpdatedBy} on {current.lastUpdatedAt}
        </span>
        <div className="content-footer-actions">
          <button className="button-secondary" onClick={() => setPreviewOpen(true)}>
            Preview
          </button>
          <button
            className="button-secondary"
            disabled={saveState === 'saving'}
            onClick={() => persist('draft')}
          >
            {saveState === 'saving' ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            className="button-primary"
            disabled={saveState === 'saving'}
            onClick={() => persist('publish')}
          >
            {saveState === 'saving' ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: '#1f2937',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 8,
            fontSize: 14,
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          {toast}
        </div>
      )}

      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setPreviewOpen(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              width: 'min(720px, 90vw)',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <strong>Preview — {current.pageTitle}</strong>
              <button className="button-secondary" onClick={() => setPreviewOpen(false)}>
                Close
              </button>
            </div>
            <div
              style={{
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid #eee',
              }}
            >
              <div
                style={{
                  minHeight: 220,
                  background: current.heroImage
                    ? `url(${current.heroImage}) center/cover`
                    : 'linear-gradient(135deg, #2c3e50, #4b6584)',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: 32,
                }}
              >
                <h2 style={{ margin: '0 0 8px' }}>{current.heroTitle}</h2>
                <p style={{ margin: 0, maxWidth: 480 }}>{current.heroSubtitle}</p>
              </div>
              {current.whyTitle && (
                <div style={{ padding: 24, textAlign: 'center' }}>
                  <h3 style={{ margin: 0 }}>{current.whyTitle}</h3>
                </div>
              )}
            </div>
            <p style={{ fontSize: 12, color: '#888', marginTop: 12 }}>
              yourleague.os/{current.slug} · {current.publiclyVisible ? 'Public' : 'Hidden'}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}