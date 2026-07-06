import { useState, useMemo } from "react";
import "../components/SuperAdminSideBar.css";
import "../styles/pages/SuperAdminDashboard.css";
import "../styles/pages/SuperVariantsPage.css";

import {
    Menu,
    X,
    Plus,
    Search,
    Users,
    Trophy,
    Inbox,
    Bell,
    ChevronDown,
    CheckCircle2,
    Circle,
    XCircle,
    ShieldCheck,
    ArrowRight,
    Ban,
} from "lucide-react";

import Footer from "../components/Footer";
import Sidebar from "../components/SuperAdminSideBar";
import logo from "../assets/logo.png";
import profile from "../assets/kcca.png";
import superImage from "../assets/cta-banner.png";

/* ---------------- TYPES ---------------- */

type Sport = "Football" | "Basketball" | "Rugby";
type Stage = "Draft" | "Standards Review" | "Committee Approval" | "Published" | "Rejected";
type Role = "Competitions" | "Compliance" | "Technical";
type ItemStatus = "Pending" | "Passed" | "Failed";
type StageFilter = Stage | "All";

type ChecklistItem = {
    id: string;
    label: string;
    role: Role;
    gatesStage: Stage; // the stage this item must clear before advancing
    status: ItemStatus;
};

type Submission = {
    id: string;
    sport: Sport;
    leagueName: string;
    formatName: string;
    stage: Stage;
    submittedBy: string;
    checklist: ChecklistItem[];
    updated: string;
};

type FormState = {
    sport: Sport;
    leagueName: string;
    formatName: string;
    submittedBy: string;
};

/* ---------------- CONSTANTS ---------------- */

const SPORTS: Sport[] = ["Football", "Basketball", "Rugby"];

const STAGE_ORDER: Stage[] = ["Draft", "Standards Review", "Committee Approval", "Published"];

const STAGE_TONE: Record<Stage, string> = {
    Draft: "muted",
    "Standards Review": "amber",
    "Committee Approval": "amber",
    Published: "green",
    Rejected: "muted",
};

const SPORT_ACCENT: Record<Sport, string> = {
    Football: "green",
    Basketball: "amber",
    Rugby: "purple",
};

const ROLE_LABEL: Record<Role, string> = {
    Competitions: "Competitions Officer",
    Compliance: "Compliance Officer",
    Technical: "Technical Director",
};

/* Checklist template — each item gates the stage it's listed under.
   A submission clears a stage once every item with gatesStage === current stage is "Passed". */
function buildChecklist(): ChecklistItem[] {
    return [
        { id: "c1", label: "Fixtures schedule submitted", role: "Competitions", gatesStage: "Draft", status: "Pending" },
        { id: "c2", label: "Team registrations complete", role: "Competitions", gatesStage: "Draft", status: "Pending" },
        { id: "c3", label: "Venue list submitted", role: "Competitions", gatesStage: "Draft", status: "Pending" },

        { id: "c4", label: "Referee panel confirmed", role: "Competitions", gatesStage: "Standards Review", status: "Pending" },
        { id: "c5", label: "Club licensing verified", role: "Compliance", gatesStage: "Standards Review", status: "Pending" },
        { id: "c6", label: "Insurance certificates on file", role: "Compliance", gatesStage: "Standards Review", status: "Pending" },
        { id: "c7", label: "Anti-doping policy acknowledged", role: "Compliance", gatesStage: "Standards Review", status: "Pending" },

        { id: "c8", label: "Broadcast rights cleared", role: "Technical", gatesStage: "Committee Approval", status: "Pending" },
        { id: "c9", label: "Sponsorship agreements signed", role: "Technical", gatesStage: "Committee Approval", status: "Pending" },
        { id: "c10", label: "Technical director final sign-off", role: "Technical", gatesStage: "Committee Approval", status: "Pending" },
    ];
}

function withStatuses(overrides: Record<string, ItemStatus>): ChecklistItem[] {
    return buildChecklist().map((item) =>
        overrides[item.id] ? { ...item, status: overrides[item.id] } : item
    );
}

/* ---------------- DATA ---------------- */

const INITIAL_SUBMISSIONS: Submission[] = [
    {
        id: "s1",
        sport: "Football",
        leagueName: "KCCA Premier League 2026",
        formatName: "Premier League Format",
        stage: "Committee Approval",
        submittedBy: "Merab Apio",
        checklist: withStatuses({
            c1: "Passed", c2: "Passed", c3: "Passed",
            c4: "Passed", c5: "Passed", c6: "Passed", c7: "Passed",
            c8: "Passed", c9: "Pending", c10: "Pending",
        }),
        updated: "2 hours ago",
    },
    {
        id: "s2",
        sport: "Football",
        leagueName: "FUFA Big League",
        formatName: "Regional Group Stage",
        stage: "Standards Review",
        submittedBy: "James Okello",
        checklist: withStatuses({
            c1: "Passed", c2: "Passed", c3: "Passed",
            c4: "Passed", c5: "Pending", c6: "Failed", c7: "Pending",
        }),
        updated: "1 day ago",
    },
    {
        id: "s3",
        sport: "Basketball",
        leagueName: "National Basketball Conference",
        formatName: "Conference Round Robin",
        stage: "Draft",
        submittedBy: "Grace Nabatanzi",
        checklist: withStatuses({ c1: "Passed", c2: "Pending", c3: "Pending" }),
        updated: "3 hours ago",
    },
    {
        id: "s4",
        sport: "Football",
        leagueName: "Community Cup",
        formatName: "Community Cup Knockout",
        stage: "Published",
        submittedBy: "Merab Apio",
        checklist: withStatuses({
            c1: "Passed", c2: "Passed", c3: "Passed",
            c4: "Passed", c5: "Passed", c6: "Passed", c7: "Passed",
            c8: "Passed", c9: "Passed", c10: "Passed",
        }),
        updated: "1 week ago",
    },
    {
        id: "s5",
        sport: "Basketball",
        leagueName: "3x3 Street Series",
        formatName: "3x3 Knockout Showdown",
        stage: "Rejected",
        submittedBy: "James Okello",
        checklist: withStatuses({ c1: "Passed", c2: "Failed", c3: "Pending" }),
        updated: "4 days ago",
    },
];

const EMPTY_FORM: FormState = {
    sport: "Football",
    leagueName: "",
    formatName: "",
    submittedBy: "",
};

/* ---------------- HELPERS ---------------- */

function currentStageItems(sub: Submission) {
    return sub.checklist.filter((i) => i.gatesStage === sub.stage);
}

function stageProgress(sub: Submission) {
    const items = currentStageItems(sub);
    if (items.length === 0) return { passed: 0, total: 0 };
    return { passed: items.filter((i) => i.status === "Passed").length, total: items.length };
}

function canAdvance(sub: Submission) {
    const items = currentStageItems(sub);
    return items.length > 0 && items.every((i) => i.status === "Passed");
}

function nextStage(stage: Stage): Stage | null {
    const idx = STAGE_ORDER.indexOf(stage);
    if (idx === -1 || idx === STAGE_ORDER.length - 1) return null;
    return STAGE_ORDER[idx + 1];
}

function StatusIcon({ status }: { status: ItemStatus }) {
    if (status === "Passed") return <CheckCircle2 size={15} className="tone-green" />;
    if (status === "Failed") return <XCircle size={15} className="tone-muted" />;
    return <Circle size={15} className="tone-amber" />;
}

/* ---------------- COMPONENT ---------------- */

export default function PublishStandards() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [submissions, setSubmissions] = useState<Submission[]>(INITIAL_SUBMISSIONS);

    const [activeSport, setActiveSport] = useState<"All" | Sport>("All");
    const [stageFilter, setStageFilter] = useState<StageFilter>("All");
    const [query, setQuery] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);

    const [expandedId, setExpandedId] = useState<string | null>(null);

    /* ---------------- FILTERED ---------------- */

    const filtered = useMemo(() => {
        return submissions.filter((s) => {
            if (activeSport !== "All" && s.sport !== activeSport) return false;
            if (stageFilter !== "All" && s.stage !== stageFilter) return false;
            if (query && !s.leagueName.toLowerCase().includes(query.toLowerCase())) return false;
            return true;
        });
    }, [submissions, activeSport, stageFilter, query]);

    const counts = useMemo(() => {
        const c: Record<string, number> = { All: submissions.length, Football: 0, Basketball: 0, Rugby: 0 };
        submissions.forEach((s) => { c[s.sport]++; });
        return c;
    }, [submissions]);

    /* ---------------- ACTIONS ---------------- */

    function openCreate() {
        setForm(EMPTY_FORM);
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setForm(EMPTY_FORM);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const newSubmission: Submission = {
            id: `s${Date.now()}`,
            sport: form.sport,
            leagueName: form.leagueName,
            formatName: form.formatName,
            stage: "Draft",
            submittedBy: form.submittedBy,
            checklist: buildChecklist(),
            updated: "Just now",
        };
        setSubmissions((prev) => [newSubmission, ...prev]);
        closeModal();
    }

    function toggleItem(sub: Submission, item: ChecklistItem) {
        const order: ItemStatus[] = ["Pending", "Passed", "Failed"];
        const nextStatus = order[(order.indexOf(item.status) + 1) % order.length];
        setSubmissions((prev) =>
            prev.map((s) =>
                s.id === sub.id
                    ? {
                        ...s,
                        checklist: s.checklist.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i)),
                        updated: "Just now",
                    }
                    : s
            )
        );
    }

    function advance(sub: Submission) {
        const next = nextStage(sub.stage);
        if (!next || !canAdvance(sub)) return;
        setSubmissions((prev) =>
            prev.map((s) => (s.id === sub.id ? { ...s, stage: next, updated: "Just now" } : s))
        );
    }

    function reject(sub: Submission) {
        setSubmissions((prev) =>
            prev.map((s) => (s.id === sub.id ? { ...s, stage: "Rejected", updated: "Just now" } : s))
        );
    }

    function toggleExpand(id: string) {
        setExpandedId((prev) => (prev === id ? null : id));
    }

    /* ---------------- UI ---------------- */

    return (
        <div
            className="super-adminv"
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
                <Sidebar collapsed={!sidebarOpen} />

                <main className="main-content">
                    <div className="variants-page-header">
                        <div>
                            <h2>Publish Standards Workflow</h2>
                            <p>Every league clears Standards Review and Committee Approval before it goes live.</p>
                        </div>
                        <button className="icon-action-btn" onClick={openCreate} style={{ flex: "0 0 auto" }}>
                            <Plus size={16} /> Submit League
                        </button>
                    </div>

                    {/* TOOLBAR */}
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
                                value={stageFilter}
                                onChange={(e) =>
                                    setStageFilter(e.target.value as StageFilter)
                                }
                            >
                                <option value="All">All stages</option>
                                {STAGE_ORDER.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                                <option value="Rejected">Rejected</option>
                            </select>

                            <div className="toolbar-search">
                                <Search size={14} />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search leagues..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* LIST */}
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <Inbox size={32} />
                            <h3>No submissions match your filters</h3>
                            <p>Try a different sport, stage, or search term — or submit a league for review.</p>
                        </div>
                    ) : (
                        <section className="variant-grid">
                            {filtered.map((sub) => {
                                const progress = stageProgress(sub);
                                const pct = progress.total ? Math.round((progress.passed / progress.total) * 100) : 100;
                                const expanded = expandedId === sub.id;
                                const isTerminal = sub.stage === "Published" || sub.stage === "Rejected";

                                return (
                                    <div key={sub.id} className={`variant-card accent-${SPORT_ACCENT[sub.sport]}`}>
                                        <div className="variant-card-top">
                                            <span className={`sport-pill accent-${SPORT_ACCENT[sub.sport]}`}>
                                                {sub.sport}
                                            </span>
                                            <span className={`status-badge tone-${STAGE_TONE[sub.stage]}`}>
                                                {sub.stage}
                                            </span>
                                        </div>

                                        <h3 className="variant-name">{sub.leagueName}</h3>
                                        <div className="variant-code">{sub.formatName}</div>

                                        {/* Stage pipeline */}
                                        <div className="variant-meta-item" style={{ gap: 6, flexWrap: "wrap" }}>
                                            {STAGE_ORDER.map((stage, idx) => {
                                                const reached =
                                                    sub.stage !== "Rejected" &&
                                                    STAGE_ORDER.indexOf(sub.stage) >= idx;
                                                return (
                                                    <span key={stage} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                                                        <span
                                                            className={`status-badge tone-${reached ? "green" : "muted"}`}
                                                            style={{ fontSize: 11 }}
                                                        >
                                                            {stage}
                                                        </span>
                                                        {idx < STAGE_ORDER.length - 1 && <ArrowRight size={11} />}
                                                    </span>
                                                );
                                            })}
                                        </div>

                                        <div className="variant-meta">
                                            <div className="variant-meta-item">
                                                <Users size={14} />
                                                Submitted by {sub.submittedBy}
                                            </div>
                                            {!isTerminal && (
                                                <div className="variant-meta-item">
                                                    <ShieldCheck size={14} />
                                                    {progress.passed}/{progress.total} standards cleared for {sub.stage} ({pct}%)
                                                </div>
                                            )}
                                        </div>

                                        {/* Checklist */}
                                        {!isTerminal && (
                                            <div className="variant-meta" style={{ marginTop: 4 }}>
                                                <button
                                                    className="icon-action-btn subtle"
                                                    style={{ marginBottom: 6 }}
                                                    onClick={() => toggleExpand(sub.id)}
                                                >
                                                    {expanded ? "Hide checklist" : "Review checklist"}
                                                </button>

                                                {expanded && (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                                        {currentStageItems(sub).map((item) => (
                                                            <button
                                                                key={item.id}
                                                                className="variant-meta-item"
                                                                style={{
                                                                    cursor: "pointer",
                                                                    background: "none",
                                                                    border: "none",
                                                                    padding: 0,
                                                                    textAlign: "left",
                                                                    width: "100%",
                                                                }}
                                                                onClick={() => toggleItem(sub, item)}
                                                                title="Click to cycle: Pending → Passed → Failed"
                                                            >
                                                                <StatusIcon status={item.status} />
                                                                {item.label}
                                                                <span style={{ marginLeft: "auto", opacity: 0.6, fontSize: 11 }}>
                                                                    {ROLE_LABEL[item.role]}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="variant-card-footer">
                                            <span className="variant-leagues">
                                                <Trophy size={12} style={{ marginRight: 4, verticalAlign: "-2px" }} />
                                                {sub.stage}
                                            </span>
                                            <span className="variant-updated">Updated {sub.updated}</span>
                                        </div>

                                        {!isTerminal && (
                                            <div className="variant-actions">
                                                <button
                                                    className="icon-action-btn subtle"
                                                    onClick={() => reject(sub)}
                                                >
                                                    <Ban size={14} /> Reject
                                                </button>
                                                <button
                                                    className="icon-action-btn"
                                                    disabled={!canAdvance(sub)}
                                                    onClick={() => advance(sub)}
                                                    style={!canAdvance(sub) ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
                                                >
                                                    {sub.stage === "Committee Approval" ? "Publish" : "Advance"} <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
                            <h3>Submit League for Review</h3>
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
                                        onChange={(e) => setForm({ ...form, sport: e.target.value as Sport })}
                                    >
                                        {SPORTS.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Submitted by
                                    <input
                                        required
                                        value={form.submittedBy}
                                        onChange={(e) => setForm({ ...form, submittedBy: e.target.value })}
                                        placeholder="e.g. Merab Apio"
                                    />
                                </label>
                            </div>

                            <div className="form-row">
                                <label>
                                    League name
                                    <input
                                        required
                                        value={form.leagueName}
                                        onChange={(e) => setForm({ ...form, leagueName: e.target.value })}
                                        placeholder="e.g. KCCA Premier League 2026"
                                    />
                                </label>
                                <label>
                                    Competition format
                                    <input
                                        required
                                        value={form.formatName}
                                        onChange={(e) => setForm({ ...form, formatName: e.target.value })}
                                        placeholder="e.g. Premier League Format"
                                    />
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="icon-action-btn subtle" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="icon-action-btn">
                                    Submit for review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
