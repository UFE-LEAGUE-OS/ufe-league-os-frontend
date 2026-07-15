import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Settings,
    ShieldCheck,
    Users,
    Bell,
    CreditCard,
    Palette,
    PlugZap,
    DatabaseBackup,
    ClipboardList,
    Wrench,
    Server,
    LifeBuoy,
    Search,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    X,
} from "lucide-react";
import "../../../styles/pages/super-admin/superadmin-settings/SuperAdminSettings.css";
import { useAuthStore } from "../../../store/authStore";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SettingCard {
    title: string;
    description: string;
    icon: React.ElementType;
    path: string;
    category: "system" | "users" | "finance" | "content";
}

type ToastKind = "success" | "error" | "info";

interface Toast {
    message: string;
    kind: ToastKind;
    id: number;
}

type RefreshState = "idle" | "refreshing" | "refreshed" | "error";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const ALL_SETTINGS: SettingCard[] = [
    {
        title: "General",
        description: "Platform name, language, timezone and preferences.",
        icon: Settings,
        path: "/super-admin/settings/general",
        category: "system",
    },
    {
        title: "Security",
        description: "Passwords, authentication and access control.",
        icon: ShieldCheck,
        path: "/super-admin/settings/security",
        category: "system",
    },
    {
        title: "Users",
        description: "Registration and account configuration.",
        icon: Users,
        path: "/super-admin/settings/users",
        category: "users",
    },
    {
        title: "Notifications",
        description: "Email, SMS and push notifications.",
        icon: Bell,
        path: "/super-admin/settings/notifications",
        category: "content",
    },
    {
        title: "Payments",
        description: "Payment gateways and billing settings.",
        icon: CreditCard,
        path: "/super-admin/settings/payments",
        category: "finance",
    },
    {
        title: "Branding",
        description: "Logo, colours and platform branding.",
        icon: Palette,
        path: "/super-admin/settings/branding",
        category: "content",
    },
    {
        title: "Integrations",
        description: "Third-party services and APIs.",
        icon: PlugZap,
        path: "/super-admin/settings/integrations",
        category: "system",
    },
    {
        title: "Backup",
        description: "Backup and restore platform data.",
        icon: DatabaseBackup,
        path: "/super-admin/settings/backup",
        category: "system",
    },
    {
        title: "Audit Logs",
        description: "View system activity and audit history.",
        icon: ClipboardList,
        path: "/super-admin/settings/audit-logs",
        category: "system",
    },
    {
        title: "Maintenance",
        description: "Maintenance mode and cache management.",
        icon: Wrench,
        path: "/super-admin/settings/maintenance",
        category: "system",
    },
    {
        title: "System Info",
        description: "Server, version and storage information.",
        icon: Server,
        path: "/super-admin/settings/system",
        category: "system",
    },
    {
        title: "Help & Support",
        description: "Documentation and support resources.",
        icon: LifeBuoy,
        path: "/super-admin/settings/support",
        category: "content",
    },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

let toastId = 0;
function nextToastId() {
    toastId += 1;
    return toastId;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SuperAdminSettings() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    /* ---- Search & filter ---- */
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] =
        useState<string>("All");

    /* ---- Overview data ---- */
    const [overview, setOverview] = useState({
        version: "v1.0.0",
        environment: "Development",
        activeUsers: "—",
        lastBackup: "—",
    });
    const [refreshState, setRefreshState] =
        useState<RefreshState>("idle");

    /* ---- Toast ---- */
    const [toasts, setToasts] = useState<Toast[]>([]);

    /* ---- Navigate with optional toast feedback ---- */
    const navigateTo = useCallback(
        (path: string, label: string) => {
            navigate(path);
            addToast(`Navigating to ${label}…`, "info");
        },
        [navigate],
    );

    /* ---- Toast helpers ---- */
    const addToast = useCallback(
        (message: string, kind: ToastKind = "info") => {
            const id = nextToastId();
            setToasts((prev) => [...prev, { message, kind, id }]);
        },
        [],
    );

    const dismissToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    /* ---- Auto-dismiss toasts after 4s ---- */
    useEffect(() => {
        if (toasts.length === 0) return;
        const last = toasts[toasts.length - 1];
        const timer = setTimeout(() => dismissToast(last.id), 4000);
        return () => clearTimeout(timer);
    }, [toasts, dismissToast]);

    /* ---- Filtered settings ---- */
    const filteredSettings = useMemo(() => {
        const q = search.toLowerCase().trim();
        return ALL_SETTINGS.filter((item) => {
            const matchesSearch =
                !q ||
                item.title.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q);
            const matchesCategory =
                categoryFilter === "All" ||
                item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [search, categoryFilter]);

    /* ---- Refresh overview (simulated async) ---- */
    const refreshOverview = useCallback(async () => {
        setRefreshState("refreshing");
        try {
            // Simulate fetching fresh data from a backend endpoint
            await new Promise((resolve) => setTimeout(resolve, 1200));
            setOverview({
                version: "v1.0.0",
                environment: "Development",
                activeUsers: "1,248",
                lastBackup: "Today 08:30",
            });
            setRefreshState("refreshed");
            addToast("Overview data refreshed", "success");
        } catch {
            setRefreshState("error");
            addToast("Failed to refresh overview", "error");
        } finally {
            // Reset refresh state after a moment
            setTimeout(() => setRefreshState("idle"), 2000);
        }
    }, [addToast]);

    /* ---- Fetch overview on mount ---- */
    useEffect(() => {
        refreshOverview();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ---- Distinct categories for filter dropdown ---- */
    const categories = useMemo(() => {
        const set = new Set(ALL_SETTINGS.map((s) => s.category));
        return ["All", ...Array.from(set)];
    }, []);

    /* ---- Count per category for badges ---- */
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        ALL_SETTINGS.forEach((s) => {
            counts[s.category] = (counts[s.category] ?? 0) + 1;
        });
        return counts;
    }, []);

    /* ---- Render ---- */
    return (
        <div className="settings-page">
            {/* ---- Toast container ---- */}
            {toasts.length > 0 && (
                <div className="settings-toast-container">
                    {toasts.map((t) => (
                        <div
                            key={t.id}
                            className={`settings-toast settings-toast--${t.kind}`}
                        >
                            {t.kind === "success" && (
                                <CheckCircle size={18} />
                            )}
                            {t.kind === "error" && (
                                <AlertTriangle size={18} />
                            )}
                            {t.kind === "info" && <RefreshCw size={18} />}
                            <span>{t.message}</span>
                            <button
                                type="button"
                                className="settings-toast-close"
                                onClick={() => dismissToast(t.id)}
                                aria-label="Dismiss"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ---- Header ---- */}
            <div className="settings-header">
                <div>
                    <h1>Settings</h1>
                    <p>
                        Configure and manage League OS platform settings.
                        {user?.email && (
                            <span className="settings-user-hint">
                                {" "}
                                &middot; logged in as{" "}
                                <strong>{user.email}</strong>
                            </span>
                        )}
                    </p>
                </div>

                <div className="settings-header-actions">
                    <div className="settings-search">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search settings…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                type="button"
                                className="settings-search-clear"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        className="settings-refresh-btn"
                        onClick={refreshOverview}
                        disabled={refreshState === "refreshing"}
                        title="Refresh overview data"
                    >
                        <RefreshCw
                            size={18}
                            className={
                                refreshState === "refreshing"
                                    ? "spin"
                                    : ""
                            }
                        />
                    </button>
                </div>
            </div>

            {/* ---- Overview cards ---- */}
            <div className="settings-overview">
                <div className="overview-card">
                    <h4>Platform Version</h4>
                    <span>{overview.version}</span>
                </div>

                <div className="overview-card">
                    <h4>Environment</h4>
                    <span>{overview.environment}</span>
                </div>

                <div className="overview-card">
                    <h4>Active Users</h4>
                    <span>{overview.activeUsers}</span>
                </div>

                <div className="overview-card">
                    <h4>Last Backup</h4>
                    <span>{overview.lastBackup}</span>
                </div>
            </div>

            {/* ---- Category filter chips ---- */}
            <div className="settings-category-chips">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        className={`settings-chip${
                            categoryFilter === cat
                                ? " settings-chip--active"
                                : ""
                        }`}
                        onClick={() => setCategoryFilter(cat)}
                    >
                        {cat === "All" ? "All" : cat}
                        {cat !== "All" && categoryCounts[cat] != null && (
                            <span className="settings-chip-count">
                                {categoryCounts[cat]}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* ---- Settings grid or empty state ---- */}
            {filteredSettings.length === 0 ? (
                <div className="settings-empty">
                    <Search size={40} />
                    <h3>No settings found</h3>
                    <p>
                        Try adjusting your search or filter to find what
                        you're looking for.
                    </p>
                    <button
                        type="button"
                        className="settings-empty-reset"
                        onClick={() => {
                            setSearch("");
                            setCategoryFilter("All");
                        }}
                    >
                        Reset filters
                    </button>
                </div>
            ) : (
                <div className="settings-grid">
                    {filteredSettings.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className="settings-card"
                            >
                                <Icon size={32} />

                                <h3>{item.title}</h3>

                                <p>{item.description}</p>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigateTo(
                                            item.path,
                                            item.title,
                                        )
                                    }
                                >
                                    Manage
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}