import { useState, useMemo } from "react";
import "../components/SuperAdminSideBar.css";
import "../styles/pages/SuperAdminDashboard.css";
import "../styles/pages/SuperVariantsPage.css";

import {
    Menu,
    X,
    Plus,
    Pencil,
    Search,
    Users,
    Clock,
    Repeat,
    Trophy,
    Inbox,
    Bell,
    ChevronDown,
} from "lucide-react";

import Footer from "../components/Footer";
import Sidebar from "../components/SuperAdminSideBar";
import logo from "../assets/logo.png";
import profile from "../assets/kcca.png";
import superImage from "../assets/cta-banner.png";


/* ---------------- TYPES ---------------- */

type Variant = {
    id: string;
    sport: "Football" | "Basketball" | "Rugby";
    name: string;
    shortCode: string;
    teamSize: number;
    squadMax: number;
    duration: string;
    subs: number | string;
    status: "Active" | "Draft" | "Archived";
    leagues: number;
    updated: string;
};
type StatusFilter = "All" | Variant["status"];

type FormState = {
    sport: "Football" | "Basketball" | "Rugby";
    name: string;
    shortCode: string;
    teamSize: string;
    squadMax: string;
    duration: string;
    subs: string;
    status: "Active" | "Draft" | "Archived";
};

/* ---------------- CONSTANTS ---------------- */

const SPORTS: Variant["sport"][] = ["Football", "Basketball", "Rugby"];

const SPORT_ACCENT: Record<Variant["sport"], string> = {
    Football: "green",
    Basketball: "amber",
    Rugby: "purple",
};

const STATUS_TONE: Record<Variant["status"], string> = {
    Active: "green",
    Draft: "amber",
    Archived: "muted",
};

/* ---------------- DATA ---------------- */

const INITIAL_VARIANTS: Variant[] = [
    {
        id: "v1",
        sport: "Football",
        name: "11-a-side",
        shortCode: "FB-11",
        teamSize: 11,
        squadMax: 23,
        duration: "90 min",
        subs: 5,
        status: "Active",
        leagues: 14,
        updated: "2 days ago",
    },
    {
        id: "v2",
        sport: "Football",
        name: "7-a-side",
        shortCode: "FB-07",
        teamSize: 7,
        squadMax: 14,
        duration: "60 min",
        subs: "Rolling",
        status: "Active",
        leagues: 6,
        updated: "1 week ago",
    },
    {
        id: "v3",
        sport: "Football",
        name: "Futsal",
        shortCode: "FB-FS",
        teamSize: 5,
        squadMax: 12,
        duration: "40 min",
        subs: "Rolling",
        status: "Draft",
        leagues: 0,
        updated: "3 hours ago",
    },
    {
        id: "v4",
        sport: "Basketball",
        name: "5-on-5",
        shortCode: "BB-05",
        teamSize: 5,
        squadMax: 15,
        duration: "40 min",
        subs: "Unlimited",
        status: "Active",
        leagues: 9,
        updated: "5 days ago",
    },
    {
        id: "v5",
        sport: "Basketball",
        name: "3x3",
        shortCode: "BB-03",
        teamSize: 3,
        squadMax: 6,
        duration: "10 min",
        subs: "Unlimited",
        status: "Active",
        leagues: 3,
        updated: "2 weeks ago",
    },
];

const EMPTY_FORM: FormState = {
    sport: "Football",
    name: "",
    shortCode: "",
    teamSize: "",
    squadMax: "",
    duration: "",
    subs: "",
    status: "Draft",
};

/* ---------------- COMPONENT ---------------- */

export default function SportVariants() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [variants, setVariants] = useState<Variant[]>(INITIAL_VARIANTS);
    /*const [activeNav, setActiveNav] = useState("dashboard");*/
    const [activeSport, setActiveSport] = useState<"All" | Variant["sport"]>("All");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [query, setQuery] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    /* ---------------- FILTERED ---------------- */

    const filtered = useMemo(() => {
        return variants.filter((v) => {
            if (activeSport !== "All" && v.sport !== activeSport) return false;
            if (statusFilter !== "All" && v.status !== statusFilter) return false;
            if (query && !v.name.toLowerCase().includes(query.toLowerCase())) return false;
            return true;
        });
    }, [variants, activeSport, statusFilter, query]);

    /* ---------------- COUNTS ---------------- */

    const counts = useMemo(() => {
        const c: Record<string, number> = {
            All: variants.length,
            Football: 0,
            Basketball: 0,
            Rugby: 0,
        };

        variants.forEach((v) => {
            c[v.sport]++;
        });

        return c;
    }, [variants]);

    /* ---------------- ACTIONS ---------------- */

    function openCreate() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    }

    function openEdit(variant: Variant) {
        setEditingId(variant.id);
        setForm({
            sport: variant.sport,
            name: variant.name,
            shortCode: variant.shortCode,
            teamSize: String(variant.teamSize),
            squadMax: String(variant.squadMax),
            duration: variant.duration,
            subs: String(variant.subs),
            status: variant.status,
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

        const normalized: Omit<Variant, "id" | "leagues" | "updated"> = {
            sport: form.sport,
            name: form.name,
            shortCode: form.shortCode,
            teamSize: Number(form.teamSize),
            squadMax: Number(form.squadMax),
            duration: form.duration,
            subs: form.subs,
            status: form.status,
        };

        if (editingId) {
            setVariants((prev) =>
                prev.map((v) =>
                    v.id === editingId
                        ? { ...v, ...normalized, updated: "Just now" }
                        : v
                )
            );
        } else {
            const newVariant: Variant = {
                id: `v${Date.now()}`,
                ...normalized,
                leagues: 0,
                updated: "Just now",
            };

            setVariants((prev) => [newVariant, ...prev]);
        }

        closeModal();
    }

    function setStatus(variant: Variant, status: Variant["status"]) {
        if (status === variant.status) return;
        setVariants((prev) =>
            prev.map((v) =>
                v.id === variant.id
                    ? { ...v, status, updated: "Just now" }
                    : v
            )
        );
    }

    /* ---------------- UI ---------------- */

    return (
        <div className="super-adminv"
            style={{
                backgroundImage: `linear-gradient(rgba(15, 18, 24, 0.38), rgba(15, 18, 24, 0.34)), url(${superImage})`,
            }}
        >
            {/* HEADER */}
            <header className="admin-header">
                <div className="header-left">
                    <div className="menu-container">
                        <button
                            className="menu-btn"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Toggle navigation"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    <div className="header-logo">
                        <img src={logo} alt="League OS" />
                    </div>
                </div>

                <div className="header-search">
                    <Search size={16} />
                    <input type="text" placeholder="Search users, matches, transactions…" />
                </div>

                <div className="header-right">

                    <button className="icon-btn" aria-label="Notifications">
                        <Bell size={19} />
                        <span className="notif-badge">3</span>
                    </button>

                    <div className="header-profile">
                        <img src={profile} alt="Merab Apio" />
                        <div className="profile-meta">
                            <h4>Merab Apio</h4>
                            <span className="role-badge">Super Admin</span>
                        </div>
                        <ChevronDown size={16} className="profile-caret" />
                    </div>
                </div>
            </header>

            <div className="dashboard-layout">
                {/* SIDEBAR */}
                <Sidebar
                    collapsed={!sidebarOpen}

                />

                <main className="main-content">
                    <div className="variants-page-header">
                        <div>
                            <h2>Sport Variants</h2>
                            <p>Manage the formats leagues can be built on.</p>
                        </div>
                        <button className="icon-action-btn" onClick={openCreate} style={{ flex: "0 0 auto" }}>
                            <Plus size={16} /> New Variant
                        </button>
                    </div>

                    {/* TOOLBAR — single source of truth for sport filtering */}
                    <div className="variants-toolbar">
                        <div className="sport-tabs">
                            <button
                                className={`sport-tab ${activeSport === "All" ? "active" : ""}`}
                                onClick={() => setActiveSport("All")}
                            >
                                All <span className="tab-count">{counts.All}</span>
                            </button>
                            {SPORTS.map((sport) => (
                                <button
                                    key={sport}
                                    className={`sport-tab ${activeSport === sport ? "active" : ""}`}
                                    onClick={() => setActiveSport(sport)}
                                >
                                    {sport} <span className="tab-count">{counts[sport]}</span>
                                </button>
                            ))}
                        </div>

                        <div className="toolbar-right">
                            <select
                                className="status-select"
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value as StatusFilter)
                                }
                            >
                                <option value="All">All statuses</option>
                                <option value="Active">Active</option>
                                <option value="Draft">Draft</option>
                                <option value="Archived">Archived</option>
                            </select>

                            <div className="toolbar-search">
                                <Search size={14} />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search variants..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* GRID */}
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <Inbox size={32} />
                            <h3>No variants match your filters</h3>
                            <p>Try a different sport, status, or search term — or create a new variant.</p>
                        </div>
                    ) : (
                        <section className="variant-grid">
                            {filtered.map((v) => (
                                <div key={v.id} className={`variant-card accent-${SPORT_ACCENT[v.sport]}`}>
                                    <div className="variant-card-top">
                                        <span className={`sport-pill accent-${SPORT_ACCENT[v.sport]}`}>
                                            {v.sport}
                                        </span>
                                        <span className={`status-badge tone-${STATUS_TONE[v.status]}`}>
                                            {v.status}
                                        </span>
                                    </div>

                                    <h3 className="variant-name">{v.name}</h3>
                                    <div className="variant-code">{v.shortCode}</div>

                                    <div className="variant-meta">
                                        <div className="variant-meta-item">
                                            <Users size={14} />
                                            {v.teamSize} players &middot; squad max {v.squadMax}
                                        </div>
                                        <div className="variant-meta-item">
                                            <Clock size={14} />
                                            {v.duration}
                                        </div>
                                        <div className="variant-meta-item">
                                            <Repeat size={14} />
                                            {v.subs} subs
                                        </div>
                                    </div>

                                    <div className="variant-card-footer">
                                        <span className="variant-leagues">
                                            <Trophy size={12} style={{ marginRight: 4, verticalAlign: "-2px" }} />
                                            {v.leagues} {v.leagues === 1 ? "league" : "leagues"}
                                        </span>
                                        <span className="variant-updated">Updated {v.updated}</span>
                                    </div>

                                    <div className="variant-actions">
                                        <button className="icon-action-btn subtle" onClick={() => openEdit(v)}>
                                            <Pencil size={14} /> Edit
                                        </button>
                                        <select
                                            className={`status-select tone-${STATUS_TONE[v.status]}`}
                                            value={v.status}
                                            onChange={(e) => setStatus(v, e.target.value as Variant["status"])}
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

            {/* MODAL */}
            {modalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingId ? "Edit Variant" : "New Variant"}</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={16} />
                            </button>
                        </div>

                        <form className="variant-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <label>
                                    Sport
                                    <select
                                        value={form.sport}
                                        onChange={(e) => setForm({ ...form, sport: e.target.value as Variant["sport"] })}
                                    >
                                        {SPORTS.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Status
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value as Variant["status"] })}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Active">Active</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </label>
                            </div>

                            <div className="form-row">
                                <label>
                                    Name
                                    <input
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. 11-a-side"
                                    />
                                </label>
                                <label>
                                    Short code
                                    <input
                                        required
                                        value={form.shortCode}
                                        onChange={(e) => setForm({ ...form, shortCode: e.target.value })}
                                        placeholder="e.g. FB-11"
                                    />
                                </label>
                            </div>

                            <div className="form-row">
                                <label>
                                    Team size
                                    <input
                                        required
                                        type="number"
                                        min={1}
                                        value={form.teamSize}
                                        onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                                    />
                                </label>
                                <label>
                                    Squad max
                                    <input
                                        required
                                        type="number"
                                        min={1}
                                        value={form.squadMax}
                                        onChange={(e) => setForm({ ...form, squadMax: e.target.value })}
                                    />
                                </label>
                            </div>

                            <div className="form-row">
                                <label>
                                    Duration
                                    <input
                                        required
                                        value={form.duration}
                                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                        placeholder="e.g. 90 min"
                                    />
                                </label>
                                <label>
                                    Substitutions
                                    <input
                                        required
                                        value={form.subs}
                                        onChange={(e) => setForm({ ...form, subs: e.target.value })}
                                        placeholder="e.g. 5, Rolling, Unlimited"
                                    />
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="icon-action-btn subtle" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="icon-action-btn">
                                    {editingId ? "Save changes" : "Create variant"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}