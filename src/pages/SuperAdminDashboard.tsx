import { useState } from "react";
import "../styles/pages/SuperAdminDashboard.css";
import "../components/SuperAdminSideBar.css";
import {
    Users,
    ShieldCheck,
    Wallet,
    Menu,
    X,
    Search,
    Bell,
    ChevronDown,
    TrendingUp,
    TrendingDown,
    UserPlus,
    Trophy,
    Landmark,
    FileWarning,
    Server,
    Database,
    Radio,
} from "lucide-react";

import Footer from "../components/Footer";
import logo from "../assets/logo.png";
import profile from "../assets/kcca.png";
import heroImage from "../assets/hero.png";
import Sidebar from "../components/SuperAdminSideBar";


const STATS = [
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

export default function SuperAdminDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeNav, setActiveNav] = useState("dashboard");

    return (
        <div
            className="super-admin"
            style={{
                backgroundImage: `linear-gradient(rgba(15,18,24,.92), rgba(15,18,24,.96)), url(${heroImage})`,
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

            {/* BODY WRAPPER */}
            <div className="dashboard-layout">
                {/* SIDEBAR */}
                <Sidebar
                    collapsed={!sidebarOpen}
                    activeNav={activeNav}
                    onChange={setActiveNav}
                />

                {/* MAIN CONTENT */}
                <main className="main-content">
                    {/* HEADER WELCOME */}
                    <div className="dashboard-header">
                        <div>
                            <span className="eyebrow">System Overview</span>
                            <h1>Welcome back, Merab 👋</h1>
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
                </main>
            </div>

            {/* FOOTER */}
            <Footer />
        </div>
    );
}
