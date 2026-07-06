import { useNavigate } from "react-router-dom";
import {
    Users,
    ShieldCheck,
    Wallet,
    TrendingUp,
    TrendingDown,
    UserPlus,
    Trophy,
    Landmark,
    FileWarning,
    Server,
    Database,
    Radio,
    Flag,
    Building2,
    Layers,
    GitBranch,
    BookOpen,
    ClipboardCheck,
    ArrowRight,
} from "lucide-react";

const STATS = [
    {
        label: "Leagues",
        value: "24",
        delta: "+3",
        trend: "up",
        icon: Flag,
        accent: "green",
    },
    {
        label: "Clubs",
        value: "168",
        delta: "+12",
        trend: "up",
        icon: Building2,
        accent: "amber",
    },
    {
        label: "Total Users",
        value: "1,240",
        delta: "+4.2%",
        trend: "up",
        icon: Users,
        accent: "green",
    },
    {
        label: "Revenue",
        value: "$32,500",
        delta: "+1.8%",
        trend: "up",
        icon: Landmark,
        accent: "amber",
    },
    {
        label: "Active Matches",
        value: "18",
        delta: "LIVE",
        trend: "live",
        icon: Trophy,
        accent: "green",
    },
    {
        label: "Open Reports",
        value: "06",
        delta: "-2 today",
        trend: "down",
        icon: FileWarning,
        accent: "red",
    },
    {
        label: "Pending Standards",
        value: "03",
        delta: "Needs review",
        trend: "down",
        icon: ClipboardCheck,
        accent: "red",
    },
];

const ACTIVITY = [
    { text: "New user registered", meta: "Kato W. · Owner", time: "2m ago", tone: "green" },
    { text: "Finance report generated", meta: "Q3 settlement", time: "18m ago", tone: "amber" },
    { text: "Match fixture updated", meta: "KCCA FC vs URA FC", time: "41m ago", tone: "green" },
    { text: "Admin logged in", meta: "Merab Apio", time: "1h ago", tone: "muted" },
    { text: "Dispute flagged for review", meta: "Case #0092", time: "3h ago", tone: "red" },
];

const SYSTEM_HEALTH = [
    { label: "API Uptime", value: 99, icon: Server },
    { label: "Server Load", value: 42, icon: Radio },
    { label: "Database", value: 87, icon: Database },
];

// Governance pipeline: how a rule set moves from definition to being live for league admins.
const GOVERNANCE_PIPELINE = [
    {
        key: "variants",
        label: "Sport Variants",
        detail: "24 active",
        sub: "Football, Basketball, Rugby",
        icon: Layers,
        path: "/sports-variants",
    },
    {
        key: "formats",
        label: "Competition Formats",
        detail: "12 templates",
        sub: "League, knockout, groups",
        icon: GitBranch,
        path: "/super-admin/competition-formats",
    },
    {
        key: "rules",
        label: "Rules & Standards",
        detail: "15 published",
        sub: "Eligibility, conduct, discipline",
        icon: BookOpen,
        path: "/super-admin/rules",
    },
    {
        key: "publish",
        label: "Publish Standards",
        detail: "3 pending",
        sub: "Awaiting your approval",
        icon: ClipboardCheck,
        alert: true,
        path: "/super-admin/publish-standards",
    },
];

export default function SuperAdminHome() {
    const navigate = useNavigate();

    return (
        <>
            {/* HEADER WELCOME */}
            <div className="dashboard-header">
                <div>
                    <h1>Welcome back, Merab </h1>
                    <p>Here's what's happening across League OS today.</p>
                </div>
            </div>

            {/* STAT TILES */}
            <section className="stat-grid">
                {STATS.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div className={`stat-tile accent-${stat.accent}`} key={stat.label}>
                            <div className="stat-tile-top">
                                <span className="stat-icon">
                                    <Icon size={18} />
                                </span>
                                {stat.trend === "live" ? (
                                    <span className="trend live">
                                        <span className="pulse" /> LIVE
                                    </span>
                                ) : (
                                    <span className={`trend ${stat.trend}`}>
                                        {stat.trend === "up" ? (
                                            <TrendingUp size={14} />
                                        ) : (
                                            <TrendingDown size={14} />
                                        )}
                                        {stat.delta}
                                    </span>
                                )}
                            </div>
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                    );
                })}
            </section>

            {/* GOVERNANCE PIPELINE */}
            <section className="panel governance-panel">
                <div className="panel-header">
                    <div>
                        <h3>Governance &amp; Standards</h3>
                        <p className="governance-subtitle">
                            How a rule moves from definition to live on the platform
                        </p>
                    </div>
                </div>

                <div className="governance-pipeline">
                    {GOVERNANCE_PIPELINE.map((stage, i) => {
                        const Icon = stage.icon;
                        const isLast = i === GOVERNANCE_PIPELINE.length - 1;
                        return (
                            <div className="governance-stage-wrap" key={stage.key}>
                                <button
                                    className={`governance-stage${stage.alert ? " alert" : ""}`}
                                    type="button"
                                    onClick={() => navigate(stage.path)}
                                >
                                    <span className="governance-stage-icon">
                                        <Icon size={18} />
                                    </span>

                                    <span className="governance-stage-body">
                                        <strong>{stage.label}</strong>
                                        <span className="governance-stage-detail">{stage.detail}</span>
                                        <span className="governance-stage-sub">{stage.sub}</span>
                                    </span>
                                </button>
                                {!isLast && (
                                    <span className="governance-connector" aria-hidden="true">
                                        <ArrowRight size={16} />
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* DASHBOARD GRID */}
            <div className="dashboard-grid">
                {/* QUICK ACTIONS */}
                <section className="panel quick-actions">
                    <h3>Quick Actions</h3>

                    <button className="action-btn">
                        <UserPlus size={17} />
                        Add New User
                    </button>
                    <button className="action-btn">
                        <Trophy size={17} />
                        Manage Sports
                    </button>
                    <button className="action-btn">
                        <BookOpen size={17} />
                        Manage Standards
                    </button>
                    <button className="action-btn">
                        <Wallet size={17} />
                        Finance
                    </button>
                    <button className="action-btn subtle">
                        <ShieldCheck size={17} />
                        View Audit Logs
                    </button>
                </section>

                {/* ACTIVITY FEED */}
                <section className="panel activity">
                    <div className="panel-header">
                        <h3>Recent Activity</h3>
                        <button className="link-btn">View all</button>
                    </div>

                    <ul className="activity-list">
                        {ACTIVITY.map((item) => (
                            <li key={item.text}>
                                <span className={`activity-dot tone-${item.tone}`} />
                                <div className="activity-body">
                                    <p>{item.text}</p>
                                    <span className="activity-meta">{item.meta}</span>
                                </div>
                                <span className="activity-time">{item.time}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* SYSTEM HEALTH */}
                <section className="panel health">
                    <h3>System Health</h3>

                    {SYSTEM_HEALTH.map((h) => {
                        const Icon = h.icon;
                        return (
                            <div className="health-row" key={h.label}>
                                <div className="health-label">
                                    <Icon size={15} />
                                    <span>{h.label}</span>
                                    <strong>{h.value}%</strong>
                                </div>
                                <div className="health-bar">
                                    <div
                                        className="health-bar-fill"
                                        style={{ width: `${h.value}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </section>
            </div>
        </>
    );
}