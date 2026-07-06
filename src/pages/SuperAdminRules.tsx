import { useState, useMemo } from "react";
import "../styles/pages/SuperAdminDashboard.css";
import "../styles/pages/SuperVariantsPage.css";
import "../components/SuperAdminSideBar.css";
import { Menu, X, Plus, Pencil, Search, Inbox } from "lucide-react";

import Footer from "../components/Footer";
import Sidebar from "../components/SuperAdminSideBar";

/* ---------------- TYPES ---------------- */

type Scope = "Global" | "Football" | "Basketball" | "Rugby";
type Category = "Eligibility" | "Conduct" | "Certification" | "Facility";
type CategoryFilter = "All" | Category;
type Tone = "green" | "amber" | "purple" | "muted";

type Rule = {
    id: string;
    scope: Scope;
    category: Category;
    title: string;
    description: string;
    status: "Active" | "Draft" | "Archived";
    version: number;
    updated: string;
};

type FormState = {
    scope: Scope;
    category: Category;
    title: string;
    description: string;
    status: "Active" | "Draft" | "Archived";
};

/* ---------------- CONSTANTS ---------------- */

const SCOPES: Scope[] = ["Global", "Football", "Basketball", "Rugby"];
const CATEGORIES: Category[] = ["Eligibility", "Conduct", "Certification", "Facility"];

const CATEGORY_ACCENT: Record<Category, Tone> = {
    Eligibility: "green",
    Conduct: "amber",
    Certification: "purple",
    Facility: "muted",
};

const STATUS_TONE: Record<Rule["status"], Tone> = {
    Active: "green",
    Draft: "amber",
    Archived: "muted",
};

/* ---------------- DATA ---------------- */

const INITIAL_RULES: Rule[] = [
    {
        id: "r1",
        scope: "Global",
        category: "Conduct",
        title: "Code of conduct",
        description: "Baseline behavior standard for all players, staff, and officials platform-wide.",
        status: "Active",
        version: 3,
        updated: "1 month ago",
    },
    {
        id: "r2",
        scope: "Global",
        category: "Certification",
        title: "Referee certification tiers",
        description: "Bronze/Silver/Gold certification levels required to officiate by competition tier.",
        status: "Active",
        version: 2,
        updated: "3 weeks ago",
    },
    {
        id: "r3",
        scope: "Football",
        category: "Eligibility",
        title: "Squad registration deadline",
        description: "Squads must be registered 14 days before season start; no mid-season additions above cap.",
        status: "Active",
        version: 1,
        updated: "2 days ago",
    },
    {
        id: "r4",
        scope: "Basketball",
        category: "Facility",
        title: "Court certification standard",
        description: "Courts must meet FIBA-equivalent dimension and flooring standards to host sanctioned games.",
        status: "Draft",
        version: 1,
        updated: "5 hours ago",
    },
];

const EMPTY_FORM: FormState = {
    scope: "Global",
    category: "Eligibility",
    title: "",
    description: "",
    status: "Draft",
};

/* ---------------- COMPONENT ---------------- */

export default function RulesAndStandards() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [rules, setRules] = useState<Rule[]>(INITIAL_RULES);

    const [activeScope, setActiveScope] = useState<"All" | Scope>("All");
    const [categoryFilter, setCategoryFilter] = useState<"All" | Category>("All");
    const [query, setQuery] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    /* ---------------- FILTERED ---------------- */

    const filtered = useMemo(() => {
        return rules.filter((r) => {
            if (activeScope !== "All" && r.scope !== activeScope) return false;
            if (categoryFilter !== "All" && r.category !== categoryFilter) return false;
            if (query && !r.title.toLowerCase().includes(query.toLowerCase())) return false;
            return true;
        });
    }, [rules, activeScope, categoryFilter, query]);

    /* ---------------- COUNTS ---------------- */

    const counts = useMemo(() => {
        const c: Record<string, number> = { All: rules.length, Global: 0, Football: 0, Basketball: 0, Rugby: 0 };
        rules.forEach((r) => { c[r.scope]++; });
        return c;
    }, [rules]);

    /* ---------------- ACTIONS ---------------- */

    function openCreate() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    }

    function openEdit(rule: Rule) {
        setEditingId(rule.id);
        setForm({
            scope: rule.scope,
            category: rule.category,
            title: rule.title,
            description: rule.description,
            status: rule.status,
        });
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (editingId) {
            setRules((prev) =>
                prev.map((r) =>
                    r.id === editingId
                        ? { ...r, ...form, version: r.version + 1, updated: "Just now" }
                        : r
                )
            );
        } else {
            const newRule: Rule = {
                id: `r${Date.now()}`,
                ...form,
                version: 1,
                updated: "Just now",
            };
            setRules((prev) => [newRule, ...prev]);
        }
        closeModal();
    }

    function setStatus(rule: Rule, status: Rule["status"]) {
        if (status === rule.status) return;
        setRules((prev) =>
            prev.map((r) => (r.id === rule.id ? { ...r, status, updated: "Just now" } : r))
        );
    }

    /* ---------------- UI ---------------- */

    return (
        <div className="super-adminv">
            <header className="admin-header">
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X /> : <Menu />}
                </button>
            </header>

            <div className="dashboard-layout">
                <Sidebar collapsed={!sidebarOpen} />

                <main className="main-content">
                    <div className="variants-page-header">
                        <div>
                            <h2>Rules & standards</h2>
                            <p>Eligibility, conduct, certification, and facility requirements — global or per sport.</p>
                        </div>
                        <button className="icon-action-btn" onClick={openCreate} style={{ flex: "0 0 auto" }}>
                            <Plus size={16} /> New rule
                        </button>
                    </div>

                    <div className="variants-toolbar">
                        <div className="sport-tabs">
                            <button
                                className={`sport-tab ${activeScope === "All" ? "active" : ""}`}
                                onClick={() => setActiveScope("All")}
                            >
                                All <span className="tab-count">{counts.All}</span>
                            </button>
                            {SCOPES.map((scope) => (
                                <button
                                    key={scope}
                                    className={`sport-tab ${activeScope === scope ? "active" : ""}`}
                                    onClick={() => setActiveScope(scope)}
                                >
                                    {scope} <span className="tab-count">{counts[scope]}</span>
                                </button>
                            ))}
                        </div>

                        <div className="toolbar-right">
                            <select
                                className="status-select"
                                value={categoryFilter}
                                onChange={(e) =>
                                    setCategoryFilter(e.target.value as CategoryFilter)
                                }
                            >
                                <option value="All">All categories</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            <div className="toolbar-search">
                                <Search size={14} />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search rules..."
                                />
                            </div>
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <Inbox size={32} />
                            <h3>No rules match your filters</h3>
                            <p>Try a different scope, category, or search term.</p>
                        </div>
                    ) : (
                        <section className="variant-grid">
                            {filtered.map((r) => (
                                <div key={r.id} className="variant-card">
                                    <div className="variant-card-top">
                                        <span className="sport-pill">{r.scope}</span>
                                        <span className={`status-badge tone-${STATUS_TONE[r.status]}`}>
                                            {r.status}
                                        </span>
                                    </div>

                                    <h3 className="variant-name">{r.title}</h3>
                                    <div className={`variant-code tone-${CATEGORY_ACCENT[r.category]}`}>
                                        {r.category} · v{r.version}
                                    </div>

                                    <div className="variant-meta">
                                        <div className="variant-meta-item">{r.description}</div>
                                    </div>

                                    <div className="variant-card-footer">
                                        <span className="variant-updated">Updated {r.updated}</span>
                                    </div>

                                    <div className="variant-actions">
                                        <button className="icon-action-btn subtle" onClick={() => openEdit(r)}>
                                            <Pencil size={14} /> Edit
                                        </button>
                                        <select
                                            className={`status-select tone-${STATUS_TONE[r.status]}`}
                                            value={r.status}
                                            onChange={(e) => setStatus(r, e.target.value as Rule["status"])}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Draft">Draft</option>
                                            <option value="Archived">Archived</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}
                </main>
            </div>

            <Footer />

            {modalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingId ? "Edit rule" : "New rule"}</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={16} />
                            </button>
                        </div>

                        <form className="variant-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <label>
                                    Scope
                                    <select
                                        value={form.scope}
                                        onChange={(e) => setForm({ ...form, scope: e.target.value as Scope })}
                                    >
                                        {SCOPES.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Category
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                                    >
                                        {CATEGORIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <label>
                                Title
                                <input
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Code of conduct"
                                />
                            </label>

                            <label>
                                Description
                                <input
                                    required
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="What does this rule require?"
                                />
                            </label>

                            <label>
                                Status
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value as Rule["status"] })}
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Active">Active</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </label>

                            <div className="modal-actions">
                                <button type="button" className="icon-action-btn subtle" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="icon-action-btn">
                                    {editingId ? "Save changes" : "Create rule"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

