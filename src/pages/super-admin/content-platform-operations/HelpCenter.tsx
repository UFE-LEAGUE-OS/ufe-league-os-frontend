import { useState, useMemo } from 'react';
import { Search, Plus, Bold, Italic, Underline, Link2, Image as ImageIcon, List, Quote, Code, Trash2 } from 'lucide-react';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';

const topTabs = ['Articles', 'Categories', 'Settings'] as const;
type TopTab = typeof topTabs[number];

type ArticleStatus = 'Published' | 'Draft';

type Article = {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  status: ArticleStatus;
  content: string;
  updatedBy: string;
  updatedAt: string;
};

type Category = {
  id: string;
  name: string;
};

const CATEGORIES: Category[] = [
  { id: 'getting-started', name: 'Getting Started' },
  { id: 'account-profile', name: 'Account & Profile' },
  { id: 'billing-payments', name: 'Billing & Payments' },
  { id: 'features', name: 'Features' },
  { id: 'privacy-security', name: 'Privacy & Security' },
  { id: 'troubleshooting', name: 'Troubleshooting' },
  { id: 'general', name: 'General' },
];

const ARTICLES: Article[] = [
  {
    id: 'create-account',
    title: 'How to Create an Account',
    slug: 'how-to-create-account',
    categoryId: 'getting-started',
    status: 'Published',
    content: `To create an account:\n1. Click the Sign Up button on the top right.\n2. Enter your email address and password.\n3. Verify your email address.\n4. You're all set!`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 13, 2024 10:15 AM',
  },
  {
    id: 'reset-password',
    title: 'How to Reset Your Password',
    slug: 'how-to-reset-password',
    categoryId: 'account-profile',
    status: 'Published',
    content: `To reset your password:\n1. Go to the login page and click "Forgot password?"\n2. Enter your email address.\n3. Check your inbox for a reset link.\n4. Choose a new password.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 11, 2024 3:40 PM',
  },
  {
    id: 'understanding-dashboard',
    title: 'Understanding Your Dashboard',
    slug: 'understanding-your-dashboard',
    categoryId: 'features',
    status: 'Published',
    content: `Your dashboard gives you a quick overview of your fixtures, tickets, memberships, and fantasy teams in one place.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 10, 2024 9:05 AM',
  },
  {
    id: 'managing-notifications',
    title: 'Managing Notifications',
    slug: 'managing-notifications',
    categoryId: 'account-profile',
    status: 'Draft',
    content: `You can manage which notifications you receive from Profile > Notifications. Choose between push, email, and SMS alerts for match updates, ticket reminders, and fantasy deadlines.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 9, 2024 1:20 PM',
  },
  {
    id: 'how-billing-works',
    title: 'How Billing Works',
    slug: 'how-billing-works',
    categoryId: 'billing-payments',
    status: 'Published',
    content: `Memberships and tickets are billed at checkout using Mobile Money, bank transfer, or card. Refunds are processed within 5-7 business days.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 6, 2024 11:50 AM',
  },
];

function statusBadge(status: ArticleStatus) {
  return status === 'Published'
    ? <span className="badge badge-green">Published</span>
    : <span className="badge badge-amber">Draft</span>;
}

function formatNow() {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HelpCenter() {
  const [tab, setTab] = useState<TopTab>('Articles');

  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [articles, setArticles] = useState<Article[]>(ARTICLES);

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [activeArticleId, setActiveArticleId] = useState<string>(ARTICLES[0].id);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [toast, setToast] = useState<string | null>(null);

  // Editable draft for the active article
  const activeArticle = useMemo(
    () => articles.find((a) => a.id === activeArticleId) ?? articles[0],
    [articles, activeArticleId]
  );
  const [draft, setDraft] = useState<Article>(activeArticle);

  // Keep draft in sync when switching articles
  if (draft.id !== activeArticle.id) {
    setDraft(activeArticle);
  }

  function categoryCount(categoryId: string) {
    return articles.filter((a) => a.categoryId === categoryId).length;
  }

  const filteredArticles = articles.filter((a) => {
    const matchesCategory = activeCategoryId === 'all' || a.categoryId === activeCategoryId;
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function updateDraft<K extends keyof Article>(field: K, value: Article[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }

  function handleSaveArticle() {
    const updated: Article = {
      ...draft,
      updatedBy: 'Merab Apio',
      updatedAt: formatNow(),
    };
    setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    showToast('Changes saved');
  }

  function handleAddCategory() {
    const name = newCategoryName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setCategories((prev) => [...prev, { id, name }]);
    setNewCategoryName('');
    showToast('Category added');
  }

  function handleDeleteCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (activeCategoryId === id) setActiveCategoryId('all');
    showToast('Category removed');
  }

  // ---- Settings tab state ----
  const [publicComments, setPublicComments] = useState(true);
  const [showSearchWidget, setShowSearchWidget] = useState(true);
  const [defaultCategory, setDefaultCategory] = useState('getting-started');
  const [supportLinkVisible, setSupportLinkVisible] = useState(true);

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <div className="title-group">
          <h1>Help Center</h1>
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
          {tab === 'Articles' && (
            <button
              className="button-primary"
              onClick={() => {
                const id = `article-${Date.now()}`;
                const newArticle: Article = {
                  id,
                  title: 'Untitled Article',
                  slug: 'untitled-article',
                  categoryId: activeCategoryId === 'all' ? categories[0]?.id ?? 'general' : activeCategoryId,
                  status: 'Draft',
                  content: '',
                  updatedBy: 'Merab Apio',
                  updatedAt: formatNow(),
                };
                setArticles((prev) => [newArticle, ...prev]);
                setActiveArticleId(id);
              }}
            >
              <Plus size={15} style={{ marginRight: 6 }} />
              New Article
            </button>
          )}
        </div>
      </section>

      <div className="content-tabs">
        {topTabs.map((t) => (
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

      {tab === 'Articles' && (
        <div className="split-layout split-2-narrow">
          {/* Categories sidebar */}
          <div>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
              Categories
            </h3>
            <div className="list-panel">
              <button
                type="button"
                className={`list-row ${activeCategoryId === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategoryId('all')}
              >
                <span className="list-row-title">All Categories</span>
                <span className="list-row-count">{articles.length}</span>
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`list-row ${activeCategoryId === c.id ? 'active' : ''}`}
                  onClick={() => setActiveCategoryId(c.id)}
                >
                  <span className="list-row-title">{c.name}</span>
                  <span className="list-row-count">{categoryCount(c.id)}</span>
                </button>
              ))}
              <button
                type="button"
                className="link-inline"
                style={{ marginTop: 8, padding: '8px 14px', textAlign: 'left' }}
                onClick={() => setTab('Categories')}
              >
                + Add Category
              </button>
            </div>
          </div>

          {/* Articles + editor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                Articles
              </h3>

              <div className="ops-search" style={{ marginBottom: 12 }}>
                <Search size={15} />
                <input
                  placeholder="Search articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="list-panel">
                {filteredArticles.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`list-row ${activeArticleId === a.id ? 'active' : ''}`}
                    onClick={() => setActiveArticleId(a.id)}
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span className="list-row-title">{a.title}</span>
                    {statusBadge(a.status)}
                  </button>
                ))}

                {filteredArticles.length === 0 && (
                  <p className="panel-empty-hint" style={{ padding: '12px 14px' }}>
                    No articles match your search.
                  </p>
                )}
              </div>
            </div>

            <div className="content-editor-panel">
              <div className="field-group">
                <label style={{ fontSize: 16, textTransform: 'none', letterSpacing: 0, color: 'var(--text)' }}>
                  <input
                    value={draft.title}
                    onChange={(e) => updateDraft('title', e.target.value)}
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      background: 'transparent',
                      border: 'none',
                      padding: '4px 0',
                    }}
                  />
                </label>
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Slug</label>
                  <input
                    value={draft.slug}
                    onChange={(e) => updateDraft('slug', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Status</label>
                  <select
                    className="page-select"
                    value={draft.status}
                    onChange={(e) => updateDraft('status', e.target.value as ArticleStatus)}
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="field-group">
                <label>Content</label>
                <div className="rich-textarea">
                  <div className="rich-toolbar">
                    <button type="button"><Bold size={13} /></button>
                    <button type="button"><Italic size={13} /></button>
                    <button type="button"><Underline size={13} /></button>
                    <button type="button"><Link2 size={13} /></button>
                    <button type="button"><ImageIcon size={13} /></button>
                    <button type="button"><List size={13} /></button>
                    <button type="button"><Quote size={13} /></button>
                    <button type="button"><Code size={13} /></button>
                  </div>
                  <textarea
                    rows={10}
                    value={draft.content}
                    onChange={(e) => updateDraft('content', e.target.value)}
                  />
                </div>
              </div>

              <div className="content-footer-bar">
                <span className="content-footer-meta">
                  Last updated by {activeArticle.updatedBy} on {activeArticle.updatedAt}
                </span>
                <div className="content-footer-actions">
                  <button className="button-primary" onClick={handleSaveArticle}>
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Categories' && (
        <div className="content-editor-panel">
          <h3>Manage Categories</h3>

          <div className="field-row">
            <div className="field-group" style={{ gridColumn: '1 / -1' }}>
              <label>Add New Category</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Fantasy Leagues"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  style={{ flex: 1 }}
                />
                <button className="button-primary" onClick={handleAddCategory}>
                  <Plus size={15} style={{ marginRight: 6 }} />
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Articles</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td className="cell-muted">{categoryCount(c.id)}</td>
                    <td>
                      <button
                        className="icon-btn"
                        onClick={() => handleDeleteCategory(c.id)}
                        aria-label="Delete category"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Settings' && (
        <div className="content-editor-panel">
          <div className="content-section" style={{ borderTop: 'none', paddingTop: 0 }}>
            <h3>Display Settings</h3>

            <div className="field-group">
              <label>Default Category</label>
              <select
                className="page-select"
                value={defaultCategory}
                onChange={(e) => setDefaultCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="toggle-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, color: 'var(--text)' }}>Show search widget on public site</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={showSearchWidget}
                  onChange={(e) => setShowSearchWidget(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="toggle-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, color: 'var(--text)' }}>Allow public comments on articles</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={publicComments}
                  onChange={(e) => setPublicComments(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="toggle-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, color: 'var(--text)' }}>Show "Contact Support" link on articles</span>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={supportLinkVisible}
                  onChange={(e) => setSupportLinkVisible(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>

          <div className="content-footer-bar">
            <span className="content-footer-meta">Changes apply immediately after saving.</span>
            <div className="content-footer-actions">
              <button className="button-primary" onClick={() => showToast('Settings saved')}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}