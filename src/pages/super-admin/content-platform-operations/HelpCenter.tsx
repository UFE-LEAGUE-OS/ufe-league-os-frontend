import { useState, useMemo } from 'react';
import { Search, Plus, Bold, Italic, Underline, Link2, Image as ImageIcon, List, Quote, Code, Trash2, Pencil, X } from 'lucide-react';
import FilterDropdown from '../../../components/FilterDropdown';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminOpsShared.css';
import '../../../styles/pages/super-admin/content-platform-operations/SuperAdminContent.css';
import SuperAdminBackButton from '../../../components/SuperAdminBackButton';

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
  // Getting Started
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
    id: 'navigating-the-app',
    title: 'Navigating the App for the First Time',
    slug: 'navigating-the-app',
    categoryId: 'getting-started',
    status: 'Published',
    content: `Once you're logged in, use the bottom navigation to move between Home, Fixtures, Fantasy, Tickets, and Profile. Tap any club or player to see more details.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 12, 2024 8:00 AM',
  },
  {
    id: 'choosing-favorite-teams',
    title: 'Choosing Your Favorite Teams',
    slug: 'choosing-favorite-teams',
    categoryId: 'getting-started',
    status: 'Published',
    content: `Go to Profile > Interests and select the clubs and leagues you follow. This personalizes your feed and match notifications.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 11, 2024 11:00 AM',
  },

  // Account & Profile
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
    id: 'updating-profile-info',
    title: 'Updating Your Profile Information',
    slug: 'updating-profile-info',
    categoryId: 'account-profile',
    status: 'Published',
    content: `Go to Profile > Edit to update your name, photo, phone number, and email address at any time.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 7, 2024 4:15 PM',
  },
  {
    id: 'deleting-your-account',
    title: 'Deleting Your Account',
    slug: 'deleting-your-account',
    categoryId: 'account-profile',
    status: 'Published',
    content: `To permanently delete your account, go to Profile > Privacy > Delete Account. This action cannot be undone and removes all your data.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 4, 2024 9:30 AM',
  },

  // Billing & Payments
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
  {
    id: 'accepted-payment-methods',
    title: 'Accepted Payment Methods',
    slug: 'accepted-payment-methods',
    categoryId: 'billing-payments',
    status: 'Published',
    content: `We accept MTN Mobile Money, Airtel Money, Visa, Mastercard, and direct bank transfer for all memberships and ticket purchases.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 5, 2024 2:10 PM',
  },
  {
    id: 'requesting-a-refund',
    title: 'Requesting a Refund',
    slug: 'requesting-a-refund',
    categoryId: 'billing-payments',
    status: 'Published',
    content: `Refund requests can be submitted from Dashboard > Tickets > Order Details > Request Refund. Approved refunds are returned to your original payment method within 5-7 business days.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 3, 2024 10:00 AM',
  },

  // Features
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
    id: 'download-a-ticket',
    title: 'Download a Ticket',
    slug: 'download-a-ticket',
    categoryId: 'features',
    status: 'Published',
    content: `Open Dashboard > Tickets, select your order, and tap Download to save a PDF copy or add it to your mobile wallet.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 8, 2024 3:00 PM',
  },
  {
    id: 'using-fantasy-leagues',
    title: 'Using Fantasy Leagues',
    slug: 'using-fantasy-leagues',
    categoryId: 'features',
    status: 'Published',
    content: `Create or join a fantasy league from the Fantasy tab, build your squad within budget, and track your ranking each gameweek.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 7, 2024 1:45 PM',
  },
  {
    id: 'live-match-stats',
    title: 'Following Live Match Stats',
    slug: 'live-match-stats',
    categoryId: 'features',
    status: 'Draft',
    content: `Tap any live fixture to see real-time score updates, lineups, and key match events as they happen.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 6, 2024 9:20 AM',
  },

  // Privacy & Security
  {
    id: 'two-factor-authentication',
    title: 'Setting Up Two-Factor Authentication',
    slug: 'two-factor-authentication',
    categoryId: 'privacy-security',
    status: 'Published',
    content: `Enable two-factor authentication from Profile > Privacy > Security to add an extra layer of protection to your account using SMS or an authenticator app.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 12, 2024 5:30 PM',
  },
  {
    id: 'who-can-see-my-profile',
    title: 'Who Can See My Profile',
    slug: 'who-can-see-my-profile',
    categoryId: 'privacy-security',
    status: 'Published',
    content: `By default, your profile is visible to other fans on the platform. You can restrict visibility to followers only from Profile > Privacy > Visibility.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 9, 2024 2:00 PM',
  },
  {
    id: 'recognizing-phishing-attempts',
    title: 'Recognizing Phishing Attempts',
    slug: 'recognizing-phishing-attempts',
    categoryId: 'privacy-security',
    status: 'Published',
    content: `We will never ask for your password by email or SMS. If a message asks you to "verify" your account via a link, don't click it — report it to support instead.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 5, 2024 8:40 AM',
  },

  // Troubleshooting
  {
    id: 'app-not-loading',
    title: 'App Not Loading or Crashing',
    slug: 'app-not-loading',
    categoryId: 'troubleshooting',
    status: 'Published',
    content: `Try closing and reopening the app, checking your internet connection, and updating to the latest version. If the issue persists, clear the app cache from your device settings.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 11, 2024 7:15 AM',
  },
  {
    id: 'payment-not-going-through',
    title: 'Payment Not Going Through',
    slug: 'payment-not-going-through',
    categoryId: 'troubleshooting',
    status: 'Published',
    content: `Confirm your payment details are correct and that you have sufficient balance. Mobile Money payments can take up to 2 minutes to confirm — avoid retrying immediately.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 8, 2024 12:30 PM',
  },
  {
    id: 'not-receiving-notifications',
    title: 'Not Receiving Notifications',
    slug: 'not-receiving-notifications',
    categoryId: 'troubleshooting',
    status: 'Draft',
    content: `Check that notifications are enabled both in the app (Profile > Notifications) and in your device's system settings for this app.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 4, 2024 6:50 PM',
  },

  // General
  {
    id: 'contacting-support',
    title: 'Contacting Support',
    slug: 'contacting-support',
    categoryId: 'general',
    status: 'Published',
    content: `You can reach our support team via live chat, email at support@leagueos.com, or by submitting a ticket from Profile > Support.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 10, 2024 4:00 PM',
  },
  {
    id: 'supported-devices',
    title: 'Supported Devices and Browsers',
    slug: 'supported-devices',
    categoryId: 'general',
    status: 'Published',
    content: `LeagueOS works on iOS 14+, Android 9+, and modern browsers including Chrome, Safari, Edge, and Firefox.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 6, 2024 10:10 AM',
  },
  {
    id: 'accessibility-features',
    title: 'Accessibility Features',
    slug: 'accessibility-features',
    categoryId: 'general',
    status: 'Draft',
    content: `LeagueOS supports screen readers, adjustable text size, and high-contrast mode. Enable these from your device's accessibility settings.`,
    updatedBy: 'Merab Apio',
    updatedAt: 'May 3, 2024 3:25 PM',
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

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
        style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
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

export default function HelpCenter() {
  const [tab, setTab] = useState<TopTab>('Articles');

  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [articles, setArticles] = useState<Article[]>(ARTICLES);

  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [activeArticleId, setActiveArticleId] = useState<string>(ARTICLES[0].id);
  const [showArticleEditor, setShowArticleEditor] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  // ---- Add Category (+ first article) modal ----
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryArticleTitle, setNewCategoryArticleTitle] = useState('');
  const [newCategoryArticleContent, setNewCategoryArticleContent] = useState('');
  const [newCategoryNameError, setNewCategoryNameError] = useState<string | null>(null);

  // ---- Edit Category (rename) modal ----
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryNameError, setEditCategoryNameError] = useState<string | null>(null);

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

  function selectArticle(id: string) {
    setActiveArticleId(id);
    setShowArticleEditor(true);
  }

  function handleSaveArticle() {
    if (!draft.title.trim()) {
      showToast('Title is required');
      return;
    }
    const updated: Article = {
      ...draft,
      updatedBy: 'Merab Apio',
      updatedAt: formatNow(),
    };
    setArticles((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    showToast('Changes saved — article is in the selected category');
    setShowArticleEditor(false);
  }

  function handleNewArticle() {
    const id = genId('article');
    const categoryId = activeCategoryId === 'all' ? categories[0]?.id ?? 'general' : activeCategoryId;
    const newArticle: Article = {
      id,
      title: 'Untitled Article',
      slug: 'untitled-article',
      categoryId,
      status: 'Draft',
      content: '',
      updatedBy: 'Merab Apio',
      updatedAt: formatNow(),
    };
    setArticles((prev) => [newArticle, ...prev]);
    setActiveArticleId(id);
    setShowArticleEditor(true);
    showToast('New article created — remember to save it');
  }

  // ---- Add Category + first article ----

  function openCategoryModal() {
    setNewCategoryName('');
    setNewCategoryArticleTitle('');
    setNewCategoryArticleContent('');
    setNewCategoryNameError(null);
    setCategoryModalOpen(true);
  }

  function handleCreateCategoryWithArticle() {
    const name = newCategoryName.trim();
    if (!name) {
      setNewCategoryNameError('Category name is required.');
      return;
    }

    const categoryId = slugify(name) || genId('cat');
    if (categories.some((c) => c.id === categoryId)) {
      setNewCategoryNameError('A category with this name already exists.');
      return;
    }

    setNewCategoryNameError(null);
    setCategories((prev) => [...prev, { id: categoryId, name }]);

    const articleTitle = newCategoryArticleTitle.trim();
    let newArticleId: string | null = null;

    if (articleTitle) {
      newArticleId = genId('article');
      const newArticle: Article = {
        id: newArticleId,
        title: articleTitle,
        slug: slugify(articleTitle),
        categoryId,
        status: 'Draft',
        content: newCategoryArticleContent,
        updatedBy: 'Merab Apio',
        updatedAt: formatNow(),
      };
      setArticles((prev) => [newArticle, ...prev]);
    }

    setActiveCategoryId(categoryId);
    if (newArticleId) {
      setActiveArticleId(newArticleId);
      setShowArticleEditor(true);
    }
    setCategoryModalOpen(false);
    setTab('Articles');
    showToast(articleTitle ? 'Category and article created' : 'Category created');
  }

  // ---- Edit / rename category ----

  function openEditCategory(c: Category) {
    setEditingCategory(c);
    setEditCategoryName(c.name);
    setEditCategoryNameError(null);
  }

  function handleSaveCategoryName() {
    if (!editingCategory) return;
    const name = editCategoryName.trim();

    if (!name) {
      setEditCategoryNameError('Category name is required.');
      return;
    }

    setEditCategoryNameError(null);
    setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? { ...c, name } : c)));
    setEditingCategory(null);
    showToast('Category updated');
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

  const defaultCategoryLabel = categories.find((c) => c.id === defaultCategory)?.name ?? 'Select category';
  const draftCategoryLabel = categories.find((c) => c.id === draft.categoryId)?.name ?? 'Select category';

  return (
    <main className="super-admin-page content-child">
      <section className="page-heading">
        <SuperAdminBackButton />
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
            <button className="button-primary" onClick={handleNewArticle}>
              <Plus size={15} style={{ marginRight: 6 }} />
              New Article
            </button>
          )}
          {tab === 'Categories' && (
            <button className="button-primary" onClick={openCategoryModal}>
              <Plus size={15} style={{ marginRight: 6 }} />
              New Category
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
                onClick={openCategoryModal}
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
                    className={`list-row ${showArticleEditor && activeArticleId === a.id ? 'active' : ''}`}
                    onClick={() => selectArticle(a.id)}
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

            {showArticleEditor ? (
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
                    <FilterDropdown
                      value={draft.status}
                      options={['Published', 'Draft']}
                      onChange={(v) => updateDraft('status', v as ArticleStatus)}
                    />
                  </div>
                </div>

                <div className="field-group">
                  <label>Category</label>
                  <FilterDropdown
                    value={draftCategoryLabel}
                    options={categories.map((c) => c.name)}
                    onChange={(name) => {
                      const category = categories.find((c) => c.name === name);
                      if (category) updateDraft('categoryId', category.id);
                    }}
                  />
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
                    <button className="button-secondary" onClick={() => setShowArticleEditor(false)}>
                      Cancel
                    </button>
                    <button className="button-primary" onClick={handleSaveArticle}>
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="panel-empty-hint" style={{ padding: '12px 2px' }}>
                Select an article from the list, or click "New Article" to start editing.
              </p>
            )}
          </div>
        </div>
      )}

      {tab === 'Categories' && (
        <div className="content-editor-panel">
          <div className="panel-card-header">
            <h3>Manage Categories</h3>
            <button className="button-primary" onClick={openCategoryModal}>
              <Plus size={15} style={{ marginRight: 6 }} />
              Add Category
            </button>
          </div>

          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Articles</th>
                  <th style={{ width: 90 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td className="cell-muted">{categoryCount(c.id)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="icon-btn"
                          onClick={() => openEditCategory(c)}
                          aria-label="Edit category"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          className="icon-btn"
                          onClick={() => handleDeleteCategory(c.id)}
                          aria-label="Delete category"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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
              <FilterDropdown
                value={defaultCategoryLabel}
                options={categories.map((c) => c.name)}
                onChange={(name) => {
                  const category = categories.find((c) => c.name === name);
                  if (category) setDefaultCategory(category.id);
                }}
              />
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

      {/* Add Category + first article modal */}
      {categoryModalOpen && (
        <Modal title="New Category" onClose={() => setCategoryModalOpen(false)}>
          <div className="field-group">
            <label>Category Name</label>
            <input
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                if (newCategoryNameError) setNewCategoryNameError(null);
              }}
              placeholder="e.g. Fantasy Leagues"
              autoFocus
              aria-invalid={Boolean(newCategoryNameError)}
              aria-describedby={newCategoryNameError ? 'new-category-name-error' : undefined}
            />
            {newCategoryNameError && (
              <span id="new-category-name-error" className="field-error" role="alert">
                {newCategoryNameError}
              </span>
            )}
          </div>

          <div className="content-section" style={{ borderTop: 'none', paddingTop: 0 }}>
            <h3 style={{ fontSize: 13 }}>First Article (optional)</h3>
            <p className="form-hint" style={{ margin: '-8px 0 4px' }}>
              Give the category a starting article now, or skip and add one later.
            </p>

            <div className="field-group">
              <label>Article Title</label>
              <input
                value={newCategoryArticleTitle}
                onChange={(e) => setNewCategoryArticleTitle(e.target.value)}
                placeholder="e.g. How to Join a Fantasy League"
              />
            </div>

            <div className="field-group">
              <label>Content</label>
              <textarea
                rows={4}
                value={newCategoryArticleContent}
                onChange={(e) => setNewCategoryArticleContent(e.target.value)}
                placeholder="Write the article body..."
              />
            </div>
          </div>

          <div className="content-footer-actions" style={{ justifyContent: 'flex-end' }}>
            <button className="button-secondary" onClick={() => setCategoryModalOpen(false)}>Cancel</button>
            <button className="button-primary" onClick={handleCreateCategoryWithArticle}>
              Create Category
            </button>
          </div>
        </Modal>
      )}

      {/* Edit category modal */}
      {editingCategory && (
        <Modal title="Edit Category" onClose={() => setEditingCategory(null)}>
          <div className="field-group">
            <label>Category Name</label>
            <input
              value={editCategoryName}
              onChange={(e) => {
                setEditCategoryName(e.target.value);
                if (editCategoryNameError) setEditCategoryNameError(null);
              }}
              autoFocus
              aria-invalid={Boolean(editCategoryNameError)}
              aria-describedby={editCategoryNameError ? 'edit-category-name-error' : undefined}
            />
            {editCategoryNameError && (
              <span id="edit-category-name-error" className="field-error" role="alert">
                {editCategoryNameError}
              </span>
            )}
          </div>

          <div className="content-footer-actions" style={{ justifyContent: 'flex-end' }}>
            <button className="button-secondary" onClick={() => setEditingCategory(null)}>Cancel</button>
            <button className="button-primary" onClick={handleSaveCategoryName}>
              Save Changes
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}