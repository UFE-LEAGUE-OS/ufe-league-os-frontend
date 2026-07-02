import {
    Bell,
    CalendarDays,
    CheckCircle2,
    Clock,
    Mail,
    Megaphone,
    MessageSquare,
    Moon,
    RefreshCw,
    Save,
    Search,
    ShieldCheck,
    Smartphone,
    Ticket,
    Trophy,
    X,
    XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    getNotificationInbox,
    getNotificationPreferences,
    markAllNotificationsRead,
    markNotificationRead,
    updateNotificationPreferences,
} from "../../services/notificationService";
import type {
    AppNotification,
    NotificationCategory,
} from "../../services/notificationService";
import styles from "./NotificationsPage.module.css";

interface ChannelPreference {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
    icon: LucideIcon;
    tone: "purple" | "orange" | "blue" | "green";
}

interface AlertPreference {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
    priority: "High" | "Medium" | "Low";
}

interface AlertGroup {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    alerts: AlertPreference[];
}

type CategoryFilter = "ALL" | NotificationCategory;

const initialChannels: ChannelPreference[] = [
    {
        id: "push",
        title: "Push Notifications",
        description: "Receive alerts inside the League OS app experience.",
        enabled: true,
        icon: Bell,
        tone: "purple",
    },
    {
        id: "email",
        title: "Email Notifications",
        description: "Receive receipts, summaries and important account updates.",
        enabled: true,
        icon: Mail,
        tone: "blue",
    },
    {
        id: "sms",
        title: "SMS Alerts",
        description: "Receive urgent ticket, match and OTP-style updates by SMS.",
        enabled: false,
        icon: Smartphone,
        tone: "orange",
    },
    {
        id: "in-app",
        title: "In-App Messages",
        description: "Show notifications inside your fan dashboard inbox.",
        enabled: true,
        icon: MessageSquare,
        tone: "green",
    },
];

const initialAlertGroups: AlertGroup[] = [
    {
        id: "matches",
        title: "Match Alerts",
        description: "Fixtures, kick-off reminders, score updates and results.",
        icon: CalendarDays,
        alerts: [
            {
                id: "match-reminders",
                title: "Match reminders",
                description: "Notify me before matches involving followed clubs.",
                enabled: true,
                priority: "High",
            },
            {
                id: "live-score-updates",
                title: "Live score updates",
                description: "Send score updates for selected clubs and competitions.",
                enabled: true,
                priority: "Medium",
            },
            {
                id: "results-summary",
                title: "Results summary",
                description: "Send final score and match result summaries.",
                enabled: true,
                priority: "Medium",
            },
        ],
    },
    {
        id: "tickets",
        title: "Tickets & Payments",
        description: "Ticket releases, QR tickets, payment status and receipts.",
        icon: Ticket,
        alerts: [
            {
                id: "ticket-release",
                title: "Ticket release alerts",
                description: "Notify me when tickets open for followed clubs.",
                enabled: true,
                priority: "High",
            },
            {
                id: "qr-ticket-issued",
                title: "QR ticket issued",
                description: "Notify me when my ticket is confirmed and ready.",
                enabled: true,
                priority: "High",
            },
            {
                id: "payment-status",
                title: "Payment status updates",
                description: "Notify me when payments succeed or fail.",
                enabled: true,
                priority: "High",
            },
        ],
    },
    {
        id: "memberships",
        title: "Club Memberships",
        description: "Membership renewals, club benefits and member-only updates.",
        icon: Trophy,
        alerts: [
            {
                id: "membership-renewal",
                title: "Membership renewal reminders",
                description: "Remind me before club memberships expire.",
                enabled: true,
                priority: "High",
            },
            {
                id: "member-benefits",
                title: "Member benefit updates",
                description: "Notify me when new club benefits are available.",
                enabled: true,
                priority: "Medium",
            },
            {
                id: "club-member-events",
                title: "Club member events",
                description: "Notify me about member-only club events.",
                enabled: false,
                priority: "Low",
            },
        ],
    },
    {
        id: "clubs-news",
        title: "Clubs & News",
        description: "Club announcements, transfers, league news and sponsor offers.",
        icon: Megaphone,
        alerts: [
            {
                id: "club-announcements",
                title: "Club announcements",
                description: "Receive updates from clubs you follow.",
                enabled: true,
                priority: "Medium",
            },
            {
                id: "breaking-news",
                title: "Breaking sports news",
                description: "Receive major news across followed sports.",
                enabled: true,
                priority: "Medium",
            },
            {
                id: "sponsor-offers",
                title: "Sponsor offers",
                description: "Receive relevant fan offers and promotions.",
                enabled: false,
                priority: "Low",
            },
        ],
    },
];

const backendNotificationEventTypes = [
    "MATCH_REMINDER",
    "SCORE_UPDATE",
    "FOLLOWED_TEAM_NEWS",
    "STANDINGS_CHANGE",
    "TICKET_UPDATES",
    "TICKET_OFFER",
    "MEMBERSHIP_UPDATES",
    "SPONSORSHIP_UPDATES",
    "FANTASY_UPDATES",
    "LEAGUE_NEWS",
    "CLUB_NEWS",
    "GENERAL_NEWS",
    "MARKETING_UPDATES",
];

const NOTIFICATION_CHANNEL_STORAGE_KEY = "leagueos:fan-notification-channels";

interface ChannelSnapshot {
    email: boolean;
    push: boolean;
    inApp: boolean;
    sms: boolean;
}

function getChannelSnapshot(channels: ChannelPreference[]): ChannelSnapshot {
    return {
        email: channels.find((channel) => channel.id === "email")?.enabled ?? false,
        push: channels.find((channel) => channel.id === "push")?.enabled ?? false,
        inApp: channels.find((channel) => channel.id === "in-app")?.enabled ?? false,
        sms: channels.find((channel) => channel.id === "sms")?.enabled ?? false,
    };
}

function applyChannelSnapshot(
    channels: ChannelPreference[],
    snapshot: ChannelSnapshot,
): ChannelPreference[] {
    return channels.map((channel) => {
        if (channel.id === "email") {
            return { ...channel, enabled: snapshot.email };
        }

        if (channel.id === "push") {
            return { ...channel, enabled: snapshot.push };
        }

        if (channel.id === "in-app") {
            return { ...channel, enabled: snapshot.inApp };
        }

        if (channel.id === "sms") {
            return { ...channel, enabled: snapshot.sms };
        }

        return channel;
    });
}

function readLocalChannelSnapshot(): ChannelSnapshot | null {
    try {
        const rawValue = window.localStorage.getItem(
            NOTIFICATION_CHANNEL_STORAGE_KEY,
        );

        if (!rawValue) {
            return null;
        }

        return JSON.parse(rawValue) as ChannelSnapshot;
    } catch {
        return null;
    }
}

function writeLocalChannelSnapshot(snapshot: ChannelSnapshot) {
    try {
        window.localStorage.setItem(
            NOTIFICATION_CHANNEL_STORAGE_KEY,
            JSON.stringify(snapshot),
        );
    } catch {
        // Local storage can fail in private mode. Backend save can still work.
    }
}

function channelSnapshotToBackendPayload(snapshot: ChannelSnapshot) {
    return backendNotificationEventTypes.map((eventType) => ({
        event_type: eventType,
        email_enabled: snapshot.email,
        push_enabled: snapshot.push || snapshot.inApp,
        sms_enabled: snapshot.sms,
    }));
}

const categoryFilters: Array<{
    label: string;
    value: CategoryFilter;
    icon: LucideIcon;
}> = [
    { label: "All", value: "ALL", icon: MessageSquare },
    { label: "Tickets", value: "TICKET", icon: Ticket },
    { label: "Payments", value: "PAYMENT", icon: CheckCircle2 },
    { label: "Memberships", value: "MEMBERSHIP", icon: Trophy },
    { label: "Fantasy", value: "FANTASY", icon: Trophy },
    { label: "Matches", value: "MATCH", icon: CalendarDays },
    { label: "Clubs", value: "CLUB", icon: Megaphone },
    { label: "System", value: "SYSTEM", icon: ShieldCheck },
];

function getPriorityClass(priority: AlertPreference["priority"]) {
    if (priority === "High") {
        return styles.highPriority;
    }

    if (priority === "Medium") {
        return styles.mediumPriority;
    }

    return styles.lowPriority;
}

function getNotificationIcon(category: NotificationCategory) {
    if (category === "TICKET") return Ticket;
    if (category === "PAYMENT") return CheckCircle2;
    if (category === "MEMBERSHIP") return Trophy;
    if (category === "FANTASY") return Trophy;
    if (category === "MATCH") return CalendarDays;
    if (category === "CLUB") return Megaphone;
    return MessageSquare;
}

function formatNotificationDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Just now";
    }

    return date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function NotificationsPage() {
    const [channels, setChannels] = useState<ChannelPreference[]>(initialChannels);
    const [alertGroups, setAlertGroups] =
        useState<AlertGroup[]>(initialAlertGroups);
    const [activeAlertGroupId, setActiveAlertGroupId] = useState(
        initialAlertGroups[0].id,
    );
    const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
    const [quietStartTime, setQuietStartTime] = useState("22:00");
    const [quietEndTime, setQuietEndTime] = useState("07:00");
    const [saveMessage, setSaveMessage] = useState("");
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
    const [isSavingPreferences, setIsSavingPreferences] = useState(false);
    const [hasLoadedPreferences, setHasLoadedPreferences] = useState(false);
    const [preferenceSyncMessage, setPreferenceSyncMessage] = useState("");
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [isLoadingInbox, setIsLoadingInbox] = useState(true);
    const [isRefreshingInbox, setIsRefreshingInbox] = useState(false);
    const [inboxError, setInboxError] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const enabledChannels = channels.filter((channel) => channel.enabled).length;

    const enabledAlerts = alertGroups.reduce((total, group) => {
        return total + group.alerts.filter((alert) => alert.enabled).length;
    }, 0);

    const totalAlerts = alertGroups.reduce(
        (total, group) => total + group.alerts.length,
        0,
    );

    const channelSnapshot = useMemo(
        () => getChannelSnapshot(channels),
        [channels],
    );

    const latestNotifications = useMemo(
        () => notifications.slice(0, 5),
        [notifications],
    );

    const activeAlertGroup =
        alertGroups.find((group) => group.id === activeAlertGroupId) ??
        alertGroups[0];

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const visibleNotifications = useMemo(() => {
        if (!normalizedSearchQuery) {
            return notifications;
        }

        return notifications.filter((notification) =>
            `${notification.title} ${notification.message} ${notification.category_label}`
                .toLowerCase()
                .includes(normalizedSearchQuery),
        );
    }, [normalizedSearchQuery, notifications]);

    const loadNotifications = useCallback(
        async (options?: { silent?: boolean }) => {
            if (options?.silent) {
                setIsRefreshingInbox(true);
            } else {
                setIsLoadingInbox(true);
            }

            setInboxError("");

            try {
                const response = await getNotificationInbox({
                    limit: 25,
                    offset: 0,
                    unreadOnly,
                    category: categoryFilter === "ALL" ? undefined : categoryFilter,
                });

                setNotifications(response.results);
                setUnreadCount(response.unread_count);
                setTotalNotifications(response.count);
            } catch {
                setInboxError(
                    "We could not reach the backend notification inbox. Start the backend locally, confirm VITE_API_BASE_URL, and log in again.",
                );
            } finally {
                setIsLoadingInbox(false);
                setIsRefreshingInbox(false);
            }
        },
        [categoryFilter, unreadOnly],
    );

    async function loadNotificationPreferences() {
        setIsLoadingPreferences(true);
        setPreferenceSyncMessage("");

        const localSnapshot = readLocalChannelSnapshot();

        /*
         * Important:
         * The backend stores notification preferences per event type.
         * This page shows global channel settings.
         *
         * Therefore, browser-saved channel choices should be the first source
         * of truth for this UI. Backend defaults are only used when the browser
         * has no saved channel snapshot yet.
         */
        if (localSnapshot) {
            setChannels((currentChannels) =>
                applyChannelSnapshot(currentChannels, localSnapshot),
            );

            setPreferenceSyncMessage(
                "Notification preferences loaded from this browser.",
            );

            try {
                await updateNotificationPreferences(
                    channelSnapshotToBackendPayload(localSnapshot),
                );
            } catch {
                setPreferenceSyncMessage(
                    "Preferences loaded from this browser. Backend sync is unavailable.",
                );
            } finally {
                setIsLoadingPreferences(false);
                setHasLoadedPreferences(true);
            }

            return;
        }

        try {
            const preferences = await getNotificationPreferences();

            if (preferences.length > 0) {
                const backendSnapshot: ChannelSnapshot = {
                    email: preferences.some((preference) => preference.email_enabled),
                    push: preferences.some((preference) => preference.push_enabled),
                    inApp: preferences.some((preference) => preference.push_enabled),
                    sms: preferences.some((preference) => preference.sms_enabled),
                };

                setChannels((currentChannels) =>
                    applyChannelSnapshot(currentChannels, backendSnapshot),
                );

                writeLocalChannelSnapshot(backendSnapshot);
            }
        } catch {
            setPreferenceSyncMessage(
                "Backend is offline. Channel changes will be saved in this browser until backend sync is available.",
            );
        } finally {
            setIsLoadingPreferences(false);
            setHasLoadedPreferences(true);
        }
    }

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadNotifications();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [loadNotifications]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadNotificationPreferences();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, []);

    // Autosave notification channel changes after initial preference load.
    useEffect(() => {
        if (!hasLoadedPreferences) {
            return undefined;
        }

        writeLocalChannelSnapshot(channelSnapshot);
        setPreferenceSyncMessage("Saving notification preferences...");

        const timeoutId = window.setTimeout(() => {
            updateNotificationPreferences(
                channelSnapshotToBackendPayload(channelSnapshot),
            )
                .then(() => {
                    setPreferenceSyncMessage("Notification preferences autosaved.");
                })
                .catch(() => {
                    setPreferenceSyncMessage(
                        "Saved in this browser. Start the backend locally to sync.",
                    );
                });
        }, 700);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [channelSnapshot, hasLoadedPreferences]);

    function notifyHeaderBadgeChanged() {
        window.dispatchEvent(new Event("leagueos:notifications-updated"));
    }

    function toggleChannel(channelId: string) {
        setChannels((currentChannels) => {
            const updatedChannels = currentChannels.map((channel) =>
                channel.id === channelId
                    ? { ...channel, enabled: !channel.enabled }
                    : channel,
            );

            writeLocalChannelSnapshot(getChannelSnapshot(updatedChannels));

            return updatedChannels;
        });

        setSaveMessage("");
    }

    function toggleAlert(groupId: string, alertId: string) {
        setAlertGroups((currentGroups) =>
            currentGroups.map((group) => {
                if (group.id !== groupId) {
                    return group;
                }

                return {
                    ...group,
                    alerts: group.alerts.map((alert) =>
                        alert.id === alertId
                            ? { ...alert, enabled: !alert.enabled }
                            : alert,
                    ),
                };
            }),
        );

        setSaveMessage("");
    }

    async function handleSave() {
        setIsSavingPreferences(true);
        setSaveMessage("");
        setPreferenceSyncMessage("");

        writeLocalChannelSnapshot(channelSnapshot);

        try {
            await updateNotificationPreferences(
                channelSnapshotToBackendPayload(channelSnapshot),
            );

            setSaveMessage("Notification preferences saved to the backend.");
        } catch {
            setSaveMessage(
                "Saved in this browser. Start the backend locally to sync these preferences.",
            );
        } finally {
            setIsSavingPreferences(false);
        }
    }

    function clearInboxFilters() {
        setSearchQuery("");
        setCategoryFilter("ALL");
        setUnreadOnly(false);
    }

    async function handleMarkRead(notificationId: number) {
        try {
            const updatedNotification = await markNotificationRead(notificationId);

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification.id === notificationId
                        ? updatedNotification
                        : notification,
                ),
            );

            setUnreadCount((currentCount) => Math.max(0, currentCount - 1));
            notifyHeaderBadgeChanged();
        } catch {
            setInboxError("Could not mark that notification as read.");
        }
    }

    async function handleMarkAllRead() {
        try {
            const response = await markAllNotificationsRead();

            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) => ({
                    ...notification,
                    is_read: true,
                    read_at: notification.read_at ?? new Date().toISOString(),
                })),
            );

            setUnreadCount(response.unread_count);
            notifyHeaderBadgeChanged();
        } catch {
            setInboxError("Could not mark all notifications as read.");
        }
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>Fan Alerts</span>
                    <h1>Notifications</h1>
                    <p>
                        Manage how League OS alerts you and review your live fan inbox.
                    </p>
                </div>

                <div className={styles.headerActionGroup}>
                    <button
                        type="button"
                        className={styles.secondaryHeaderAction}
                        onClick={() => void loadNotifications({ silent: true })}
                        disabled={isRefreshingInbox}
                    >
                        <RefreshCw size={18} strokeWidth={2.4} aria-hidden="true" />
                        {isRefreshingInbox ? "Refreshing..." : "Refresh"}
                    </button>

                    <button
                        type="button"
                        className={styles.primaryHeaderAction}
                        onClick={() => void handleSave()}
                        disabled={isSavingPreferences || isLoadingPreferences}
                    >
                        <Save size={18} strokeWidth={2.4} aria-hidden="true" />
                        {isSavingPreferences ? "Saving..." : "Save Now"}
                    </button>
                </div>
            </header>

            {saveMessage ? (
                <div className={styles.saveMessage} role="status">
                    <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                    {saveMessage}
                </div>
            ) : null}

            {inboxError ? (
                <div className={styles.errorMessage} role="alert">
                    <XCircle size={19} strokeWidth={2.4} aria-hidden="true" />
                    {inboxError}
                </div>
            ) : null}

            {preferenceSyncMessage ? (
                <div className={styles.syncMessage} role="status">
                    <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                    {preferenceSyncMessage}
                </div>
            ) : null}

            <section className={styles.summaryGrid} aria-label="Notification summary">
                <article className={`${styles.summaryCard} ${styles.purple}`}>
                    <div>
                        <p>Unread Alerts</p>
                        <strong>{unreadCount}</strong>
                        <span>From backend inbox</span>
                    </div>

                    <Bell size={38} strokeWidth={2.1} aria-hidden="true" />
                </article>

                <article className={`${styles.summaryCard} ${styles.green}`}>
                    <div>
                        <p>Inbox Total</p>
                        <strong>{totalNotifications}</strong>
                        <span>Current filter</span>
                    </div>

                    <MessageSquare size={38} strokeWidth={2.1} aria-hidden="true" />
                </article>

                <article className={`${styles.summaryCard} ${styles.orange}`}>
                    <div>
                        <p>Quiet Hours</p>
                        <strong>{quietHoursEnabled ? "On" : "Off"}</strong>
                        <span>
                            {quietHoursEnabled
                                ? `${quietStartTime} - ${quietEndTime}`
                                : "Currently disabled"}
                        </span>
                    </div>

                    <Moon size={38} strokeWidth={2.1} aria-hidden="true" />
                </article>

                <article className={`${styles.summaryCard} ${styles.blue}`}>
                    <div>
                        <p>Enabled Channels</p>
                        <strong>{enabledChannels}</strong>
                        <span>
                            {enabledAlerts} of {totalAlerts} alert types on
                        </span>
                    </div>

                    <CheckCircle2 size={38} strokeWidth={2.1} aria-hidden="true" />
                </article>
            </section>

            <section className={styles.panel}>
                <div className={styles.panelHeader}>
                    <div>
                        <h2>Notification Inbox</h2>
                        <p>
                            Search, filter and mark backend notifications as read.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={styles.secondaryHeaderAction}
                        onClick={handleMarkAllRead}
                        disabled={unreadCount === 0}
                    >
                        Mark all as read
                    </button>
                </div>

                <div className={styles.inboxControls}>
                    <div className={styles.inboxSearch}>
                        <Search size={18} strokeWidth={2.3} aria-hidden="true" />

                        <input
                            type="search"
                            placeholder="Search alerts, tickets, payments or clubs..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />

                        {searchQuery ? (
                            <button
                                type="button"
                                aria-label="Clear notification search"
                                onClick={() => setSearchQuery("")}
                            >
                                <X size={16} strokeWidth={2.4} />
                            </button>
                        ) : null}
                    </div>

                    <div className={styles.filterPillRow} aria-label="Notification filters">
                        {categoryFilters.map((filter) => {
                            const FilterIcon = filter.icon;

                            return (
                                <button
                                    type="button"
                                    key={filter.value}
                                    className={`${styles.filterButton} ${
                                        categoryFilter === filter.value
                                            ? styles.activeFilterButton
                                            : ""
                                    }`}
                                    onClick={() => setCategoryFilter(filter.value)}
                                >
                                    <FilterIcon
                                        size={15}
                                        strokeWidth={2.4}
                                        aria-hidden="true"
                                    />
                                    {filter.label}
                                </button>
                            );
                        })}

                        <button
                            type="button"
                            className={`${styles.unreadToggle} ${
                                unreadOnly ? styles.activeUnreadToggle : ""
                            }`}
                            onClick={() => setUnreadOnly((currentValue) => !currentValue)}
                        >
                            Unread only
                        </button>
                    </div>
                </div>

                {isLoadingInbox ? (
                    <div className={styles.emptyState}>
                        <Clock size={26} strokeWidth={2.3} aria-hidden="true" />
                        <strong>Loading notifications...</strong>
                        <p>Please wait while we fetch your inbox.</p>
                    </div>
                ) : visibleNotifications.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Bell size={26} strokeWidth={2.3} aria-hidden="true" />
                        <strong>No notifications found</strong>
                        <p>
                            No notifications match the selected search or filter.
                            Ticket confirmations, QR tickets and payment alerts will appear here.
                        </p>

                        <button type="button" onClick={clearInboxFilters}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className={styles.fullInboxList}>
                        {visibleNotifications.map((notification) => {
                            const NotificationIcon = getNotificationIcon(
                                notification.category,
                            );

                            return (
                                <article
                                    className={`${styles.inboxItem} ${
                                        notification.is_read ? "" : styles.unreadInboxItem
                                    }`}
                                    key={notification.id}
                                >
                                    <span>
                                        <NotificationIcon
                                            size={21}
                                            strokeWidth={2.3}
                                            aria-hidden="true"
                                        />
                                    </span>

                                    <div>
                                        <div className={styles.notificationTitleRow}>
                                            <h3>{notification.title}</h3>

                                            {!notification.is_read ? (
                                                <em className={styles.unreadBadge}>Unread</em>
                                            ) : null}
                                        </div>

                                        <p>
                                            {notification.message ||
                                                "Open this notification for more details."}
                                        </p>

                                        <small>
                                            {notification.category_label} •{" "}
                                            {formatNotificationDate(notification.created_at)}
                                        </small>
                                    </div>

                                    <div className={styles.notificationActions}>
                                        {notification.action_url ? (
                                            <Link to={notification.action_url}>Open</Link>
                                        ) : null}

                                        {!notification.is_read ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void handleMarkRead(notification.id)
                                                }
                                            >
                                                Mark read
                                            </button>
                                        ) : (
                                            <CheckCircle2
                                                className={styles.deliveredIcon}
                                                size={19}
                                                strokeWidth={2.4}
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Notification Channels</h2>
                                <p>
                                    Choose where alerts can be sent. Channel preferences save
                                    to the backend preference endpoint.
                                </p>
                            </div>
                        </div>

                        <div className={styles.channelGrid}>
                            {channels.map((channel) => {
                                const ChannelIcon = channel.icon;

                                return (
                                    <button
                                        type="button"
                                        className={`${styles.channelCard} ${
                                            channel.enabled
                                                ? styles.channelCardEnabled
                                                : ""
                                        } ${styles[channel.tone]}`}
                                        key={channel.id}
                                        onClick={() => toggleChannel(channel.id)}
                                    >
                                        <span className={styles.channelIcon}>
                                            <ChannelIcon
                                                size={24}
                                                strokeWidth={2.3}
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <span className={styles.channelText}>
                                            <strong>{channel.title}</strong>
                                            <small>{channel.description}</small>
                                        </span>

                                        <span
                                            className={
                                                channel.enabled
                                                    ? styles.enabledBadge
                                                    : styles.disabledBadge
                                            }
                                        >
                                            {channel.enabled ? "Enabled" : "Off"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Alert Preferences</h2>
                                <p>
                                    Pick a category below and edit alert details locally. Backend storage currently saves channel preferences by event type.
                                </p>
                            </div>
                        </div>

                        <div className={styles.alertOverviewGrid}>
                            {alertGroups.map((group) => {
                                const GroupIcon = group.icon;
                                const enabledGroupAlerts = group.alerts.filter(
                                    (alert) => alert.enabled,
                                ).length;

                                return (
                                    <button
                                        type="button"
                                        className={`${styles.alertGroupButton} ${
                                            activeAlertGroupId === group.id
                                                ? styles.activeAlertGroupButton
                                                : ""
                                        }`}
                                        key={group.id}
                                        onClick={() => setActiveAlertGroupId(group.id)}
                                    >
                                        <span className={styles.alertGroupIcon}>
                                            <GroupIcon
                                                size={22}
                                                strokeWidth={2.4}
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <span>
                                            <strong>{group.title}</strong>
                                            <small>{group.description}</small>
                                        </span>

                                        <em className={styles.alertCount}>
                                            {enabledGroupAlerts}/{group.alerts.length}
                                        </em>
                                    </button>
                                );
                            })}
                        </div>

                        <section className={styles.alertDetailCard}>
                            <div className={styles.alertDetailHeader}>
                                <div>
                                    <h3>{activeAlertGroup.title}</h3>
                                    <p>{activeAlertGroup.description}</p>
                                </div>

                                <span>
                                    {
                                        activeAlertGroup.alerts.filter(
                                            (alert) => alert.enabled,
                                        ).length
                                    }{" "}
                                    active
                                </span>
                            </div>

                            <div className={styles.alertList}>
                                {activeAlertGroup.alerts.map((alert) => (
                                    <label className={styles.alertRow} key={alert.id}>
                                        <input
                                            type="checkbox"
                                            checked={alert.enabled}
                                            onChange={() =>
                                                toggleAlert(activeAlertGroup.id, alert.id)
                                            }
                                        />

                                        <span>
                                            <strong>{alert.title}</strong>
                                            <small>{alert.description}</small>
                                        </span>

                                        <em className={getPriorityClass(alert.priority)}>
                                            {alert.priority}
                                        </em>
                                    </label>
                                ))}
                            </div>
                        </section>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <Moon size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Quiet Hours</h2>
                                <p>Reduce non-urgent alerts during rest hours.</p>
                            </div>
                        </div>

                        <label className={styles.quietToggle}>
                            <input
                                type="checkbox"
                                checked={quietHoursEnabled}
                                onChange={() =>
                                    setQuietHoursEnabled((currentValue) => !currentValue)
                                }
                            />

                            <span>
                                <strong>Enable quiet hours</strong>
                                <small>
                                    {quietHoursEnabled
                                        ? `${quietStartTime} to ${quietEndTime}`
                                        : "Quiet hours disabled"}
                                </small>
                            </span>
                        </label>

                        <div className={styles.quietTimeGrid}>
                            <label>
                                <span>Start</span>
                                <input
                                    type="time"
                                    value={quietStartTime}
                                    disabled={!quietHoursEnabled}
                                    onChange={(event) => setQuietStartTime(event.target.value)}
                                />
                            </label>

                            <label>
                                <span>End</span>
                                <input
                                    type="time"
                                    value={quietEndTime}
                                    disabled={!quietHoursEnabled}
                                    onChange={(event) => setQuietEndTime(event.target.value)}
                                />
                            </label>
                        </div>

                        <div className={styles.quietNote}>
                            <ShieldCheck size={20} strokeWidth={2.3} aria-hidden="true" />
                            <p>
                                Payment confirmations, OTPs and urgent account security alerts
                                can still be delivered during quiet hours.
                            </p>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <Clock size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Latest Alerts</h2>
                                <p>Most recent backend notifications.</p>
                            </div>
                        </div>

                        <div className={styles.recentList}>
                            {latestNotifications.length === 0 ? (
                                <div className={styles.emptyMiniState}>
                                    No recent alerts yet.
                                </div>
                            ) : (
                                latestNotifications.map((notification) => {
                                    const NotificationIcon = getNotificationIcon(
                                        notification.category,
                                    );

                                    return (
                                        <article
                                            className={styles.recentItem}
                                            key={notification.id}
                                        >
                                            <span>
                                                <NotificationIcon
                                                    size={20}
                                                    strokeWidth={2.3}
                                                    aria-hidden="true"
                                                />
                                            </span>

                                            <div>
                                                <h3>{notification.title}</h3>
                                                <p>
                                                    {notification.message ||
                                                        notification.category_label}
                                                </p>
                                                <small>
                                                    {formatNotificationDate(
                                                        notification.created_at,
                                                    )}
                                                </small>
                                            </div>

                                            {notification.is_read ? (
                                                <CheckCircle2
                                                    className={styles.deliveredIcon}
                                                    size={18}
                                                    strokeWidth={2.4}
                                                    aria-hidden="true"
                                                />
                                            ) : (
                                                <Clock
                                                    className={styles.pendingIcon}
                                                    size={18}
                                                    strokeWidth={2.4}
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </article>
                                    );
                                })
                            )}
                        </div>
                    </section>
                    <section className={styles.notificationAdCard} aria-label="Sponsored fan alert placement">
                        <span>Sponsored</span>

                        <div>
                            <h2>Fan Alert Partner Slot</h2>
                            <p>
                                Reserve this space for sponsor offers, ticket release campaigns,
                                matchday reminders, club promotions or membership discounts.
                            </p>
                        </div>

                        <Link to="/sponsor/apply">Explore Partner Options →</Link>
                    </section>

                </aside>
            </div>
        </section>
    );
}

export default NotificationsPage;
