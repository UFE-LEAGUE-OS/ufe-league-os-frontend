import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/pages/SuperAdminDashboard.css";
import "../components/SuperAdminSideBar.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "../styles/pages/SuperAdminDashboard.css";
import "../components/SuperAdminSideBar.css";
import "../pages/admin/admin.css";
import {
    Users,
    ShieldCheck,
    Wallet,
    UserPlus,
    Trophy,
    Landmark,
    FileWarning,
    Flag,
    Building2,
    Layers,
    GitBranch,
    BookOpen,
    ClipboardCheck,
    ArrowRight,
} from "lucide-react";

import Footer from "../components/Footer";
import superImage from "../assets/cta-banner.png";
import Sidebar from "../components/SuperAdminSideBar";
import SuperAdminTopBar from "../components/SuperAdminTopBar";





interface Activity {
    text: string;
    meta: string;
    time: string;
    tone: string;
}

export default function SuperAdminDashboard() {
    
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activities, setActivities] = useState<Activity[]>([]);
    
    const [dashboardStats, setDashboardStats] = useState({
    leagues: 0,
    clubs: 0,
    users: 0,
    revenue: 0,
    active_matches: 0,
    open_reports: 0,
    pending_standards: 0,
});

const [governanceStats, setGovernanceStats] = useState<{
    sport_variants: {
        total: number;
        active: number;
    };
    competition_formats: {
        total: number;
        active: number;
    };
    rules: {
        total: number;
        active: number;
    };
}>({
    sport_variants: {
        total: 0,
        active: 0,
    },
    competition_formats: {
        total: 0,
        active: 0,
    },
    rules: {
        total: 0,
        active: 0,
    },
});

const GOVERNANCE_PIPELINE = [
    { key: "variants", label: "Sport Variants",      detail: `${governanceStats.sport_variants.active} active`, sub:`${governanceStats.sport_variants.total} total variants`, icon: Layers, path: "/sports-variants", alert: false, },
    { key: "formats",  label: "Competition Formats", detail: `${governanceStats.competition_formats.active} active`, sub: `${governanceStats.competition_formats.total} total formats`, icon: GitBranch,      path: "/super-admin/competition-formats",  alert: false },
    { key: "rules",    label: "Rules & Standards",    detail: `${governanceStats.rules.active} active`, sub: `${governanceStats.rules.total} total rules`,  icon: BookOpen,       path: "/super-admin/rules",                alert: false },
    { key: "publish",  label: "Publish Standards",   detail: "3 pending",    sub: "Awaiting your approval",            icon: ClipboardCheck, path: "/super-admin/publish-standards",    alert: true  },
];


useEffect(() => {


    // Dashboard statistics
    axios
        .get("/api/dashboard/stats/")
        .then((response) => {

            console.log(
                "DASHBOARD STATS:",
                response.data
            );

            setDashboardStats(response.data);

        })
        .catch((error) => {

            console.error(
                "Dashboard stats error:",
                error
            );

        });



    // Recent activity
    // Recent activity
axios
    .get("/api/dashboard/activity/")
    .then((response) => {

        console.log(
            "ACTIVITY:",
            response.data
        );


        const activityData = Array.isArray(response.data)
            ? response.data
            : response.data.results || response.data.activities || [];


        setActivities(activityData);

    })
    .catch((error) => {

        console.error(
            "Activity error:",
            error
        );

    });

    // Governance statistics
    Promise.all([

        axios.get("/api/governance/sport-variants/"),

        axios.get("/api/governance/competition-formats/"),

        axios.get("/api/governance/rules/")

    ])

    .then(([variants, formats, rules]) => {


        const variantData = variants.data;

        const formatData = formats.data;

        const ruleData = rules.data;



        setGovernanceStats({

            sport_variants: {

                total: variantData.length,

                active:
                    variantData.filter(
                        (item:any)=>
                            item.status === "Active"
                    ).length,

            },


            competition_formats: {

                total: formatData.length,

                active:
                    formatData.filter(
                        (item:any)=>
                            item.status === "Active"
                    ).length,

            },


            rules: {

                total: ruleData.length,

                active:
                    ruleData.filter(
                        (item:any)=>
                            item.status === "Active"
                    ).length,

            }

        });


    })

    .catch((error)=>{

        console.error(
            "Governance stats error:",
            error
        );

    });



}, []);


const STATS = [
    {
        label: "Leagues",
        value: dashboardStats.leagues,
        icon: Flag,
        accent: "green"
    },

    {
        label: "Clubs",
        value: dashboardStats.clubs,
        icon: Building2,
        accent: "amber"
    },

    {
        label: "Total Users",
        value: dashboardStats.users,
        icon: Users,
        accent: "green"
    },

    {
        label: "Revenue",
        value: `$${dashboardStats.revenue}`,
        icon: Landmark,
        accent: "amber"
    },

    {
        label: "Active Matches",
        value: dashboardStats.active_matches,
        icon: Trophy,
        accent: "green"
    },

    {
        label: "Open Reports",
        value: dashboardStats.open_reports,
        icon: FileWarning,
        accent: "red"
    },

    {
        label: "Pending Standards",
        value: dashboardStats.pending_standards,
        icon: ClipboardCheck,
        accent: "red"
    },
];

    // Show <Outlet> content for any sub-route; show dashboard home only at /super-admin exactly
    const isHome = location.pathname === "/dashboard/super-admin" || location.pathname === "/dashboard/super-admin/";

    return (
        <div
            className="super-admin"
            style={{
                backgroundImage: `linear-gradient(rgba(15,18,24,.38), rgba(15,18,24,.34)), url(${superImage})`,
            }}
        >
            <SuperAdminTopBar
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((c) => !c)}
            />

            <div className="dashboard-layout">
                <Sidebar collapsed={!sidebarOpen} />

                <main className="main-content">
                    {/* Child route content (e.g. /super-admin/users-management) */}
                    {!isHome && <Outlet />}

                    {/* Dashboard home — only shown at /super-admin */}
                    {isHome && (
                        <>
                            <div className="dashboard-header">
                                <div>
                                    <h1>Welcome back, Admin</h1>
                                    <p>Here's what's happening across League OS today.</p>
                                </div>
                            </div>

                            {/* STAT TILES */}
                            <section className="stat-grid">
    {STATS.map((stat) => {
        const Icon = stat.icon;

        return (
            <div
                className={`stat-tile accent-${stat.accent}`}
                key={stat.label}
            >
                <div className="stat-tile-top">
                    <span className="stat-icon">
                        <Icon size={18} />
                    </span>
                </div>

                <span className="stat-value">
                    {stat.value}
                </span>

                <span className="stat-label">
                    {stat.label}
                </span>
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
                                                    <span className="governance-stage-icon"><Icon size={18} /></span>
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
                                <section className="panel quick-actions">
                                    <h3>Quick Actions</h3>
                                    <button className="action-btn" onClick={() => navigate("/super-admin/users-management")}>
                                        <UserPlus size={17} /> Manage Users
                                    </button>
                                    <button className="action-btn">
                                        <Trophy size={17} /> Manage Sports
                                    </button>
                                    <button className="action-btn">
                                        <BookOpen size={17} /> Manage Standards
                                    </button>
                                    <button className="action-btn">
                                        <Wallet size={17} /> Finance
                                    </button>
                                    <button className="action-btn subtle">
                                        <ShieldCheck size={17} /> View Audit Logs
                                    </button>
                                </section>

                                <section className="panel activity">
                                    <div className="panel-header">
                                        <h3>Recent Activity</h3>
                                        <button className="link-btn">View all</button>
                                    </div>
                                    <ul className="activity-list">
                                        {activities.map((item) => (
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

                             <section className="panel health">
    <h3>Admin Overview</h3>

    {/* USER MANAGEMENT */}
    <div className="health-row">
        <div className="health-label">
            <Users size={15} />
            <div>
                <span>User Management</span>
                <small>1,240 users</small>
            </div>
        </div>

        <strong>18 pending</strong>
    </div>


    {/* FINANCE */}
    <div className="health-row">
        <div className="health-label">
            <Wallet size={15} />
            <div>
                <span>Finance</span>
                <small>UGX 32M revenue</small>
            </div>
        </div>

        <strong>12 transactions</strong>
    </div>


    {/* AUDIT LOGS */}
    <div className="health-row">
        <div className="health-label">
            <ShieldCheck size={15} />
            <div>
                <span>Audit Logs</span>
                <small>45 actions today</small>
            </div>
        </div>

        <strong>3 alerts</strong>
    </div>


    {/* ACTION BUTTONS */}
    <div className="admin-overview-actions">

        <button
            className="link-btn"
            onClick={() => navigate("/super-admin/users-management")}
        >
            Manage Users
        </button>


        <button
            className="link-btn"
            onClick={() => navigate("/super-admin/finance")}
        >
            View Finance
        </button>


        <button
            className="link-btn"
            onClick={() => navigate("/super-admin/audit-logs")}
        >
            View Logs
        </button>

    </div>

</section>
                            </div>
                        </>
                    )}
                </main>
            </div>

            <Footer />
        </div>
    );
}
