import {
    Bell,
    CalendarDays,
    CheckCircle2,
    Clock,
    Mail,
    Megaphone,
    MessageSquare,
    Moon,
    Save,
    ShieldCheck,
    Smartphone,
    Ticket,
    Trophy,
    XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
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
                description: "Notify me when Flutterwave payments succeed or fail.",
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

const recentNotifications = [
    {
        id: "notice-001",
        title: "KCB KOBS Gold Membership confirmed",
        description: "Your club membership payment was successful.",
        time: "Today, 10:24 AM",
        status: "Delivered",
        icon: CheckCircle2,
    },
    {
        id: "notice-002",
        title: "KOBS vs Heathens ticket available",
        description: "Tickets are now open for your followed club.",
        time: "Yesterday, 4:12 PM",
        status: "Delivered",
        icon: Ticket,
    },
    {
        id: "notice-003",
        title: "City Oilers payment still pending",
        description: "Your payment is awaiting gateway confirmation.",
        time: "Yesterday, 11:38 AM",
        status: "Pending",
        icon: Clock,
    },
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

function NotificationsPage() {
    const [channels, setChannels] = useState<ChannelPreference[]>(initialChannels);
    const [alertGroups, setAlertGroups] =
        useState<AlertGroup[]>(initialAlertGroups);
    const [quietHoursEnabled, setQuietHoursEnabled] = useState(true);
    const [saveMessage, setSaveMessage] = useState("");

    const enabledChannels = channels.filter((channel) => channel.enabled).length;

    const enabledAlerts = alertGroups.reduce((total, group) => {
        return total + group.alerts.filter((alert) => alert.enabled).length;
    }, 0);

    const totalAlerts = alertGroups.reduce(
        (total, group) => total + group.alerts.length,
        0,
    );

    function toggleChannel(channelId: string) {
        setChannels((currentChannels) =>
            currentChannels.map((channel) =>
                channel.id === channelId
                    ? { ...channel, enabled: !channel.enabled }
                    : channel,
            ),
        );

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

    function handleSave() {
        setSaveMessage("Notification preferences saved locally for now.");
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Notifications</h1>
                    <p>
                        Choose how League OS should alert you about clubs, matches, tickets,
                        payments, memberships and news.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.primaryHeaderAction}
                    onClick={handleSave}
                >
                    <Save size={18} strokeWidth={2.4} aria-hidden="true" />
                    Save Preferences
                </button>
            </header>

            {saveMessage ? (
                <div className={styles.saveMessage} role="status">
                    <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                    {saveMessage}
                </div>
            ) : null}

            <section className={styles.summaryGrid} aria-label="Notification summary">
                <article className={`${styles.summaryCard} ${styles.purple}`}>
                    <div>
                        <p>Enabled Channels</p>
                        <strong>{enabledChannels}</strong>
                        <span>Out of {channels.length}</span>
                    </div>

                    <Bell size={38} strokeWidth={2.1} aria-hidden="true" />
                </article>

                <article className={`${styles.summaryCard} ${styles.green}`}>
                    <div>
                        <p>Active Alerts</p>
                        <strong>{enabledAlerts}</strong>
                        <span>Out of {totalAlerts}</span>
                    </div>

                    <CheckCircle2 size={38} strokeWidth={2.1} aria-hidden="true" />
                </article>

                <article className={`${styles.summaryCard} ${styles.orange}`}>
                    <div>
                        <p>Quiet Hours</p>
                        <strong>{quietHoursEnabled ? "On" : "Off"}</strong>
                        <span>10:00 PM - 7:00 AM</span>
                    </div>

                    <Moon size={38} strokeWidth={2.1} aria-hidden="true" />
                </article>

                <article className={`${styles.summaryCard} ${styles.blue}`}>
                    <div>
                        <p>Recent Alerts</p>
                        <strong>{recentNotifications.length}</strong>
                        <span>Last 48 hours</span>
                    </div>

                    <MessageSquare size={38} strokeWidth={2.1} aria-hidden="true" />
                </article>
            </section>

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Notification Channels</h2>
                                <p>
                                    These control where alerts are sent. Backend integration will
                                    later persist these settings to your fan profile.
                                </p>
                            </div>
                        </div>

                        <div className={styles.channelGrid}>
                            {channels.map((channel) => {
                                const ChannelIcon = channel.icon;

                                return (
                                    <button
                                        type="button"
                                        className={`${styles.channelCard} ${channel.enabled ? styles.channelCardEnabled : ""
                                            } ${styles[channel.tone]}`}
                                        key={channel.id}
                                        onClick={() => toggleChannel(channel.id)}
                                    >
                                        <span className={styles.channelIcon}>
                                            <ChannelIcon
                                                size={26}
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
                                    Decide which types of club, ticket, match and membership
                                    alerts should be sent.
                                </p>
                            </div>
                        </div>

                        <div className={styles.alertGroups}>
                            {alertGroups.map((group) => {
                                const GroupIcon = group.icon;

                                return (
                                    <section className={styles.alertGroup} key={group.id}>
                                        <div className={styles.alertGroupHeader}>
                                            <span>
                                                <GroupIcon
                                                    size={24}
                                                    strokeWidth={2.4}
                                                    aria-hidden="true"
                                                />
                                            </span>

                                            <div>
                                                <h3>{group.title}</h3>
                                                <p>{group.description}</p>
                                            </div>
                                        </div>

                                        <div className={styles.alertList}>
                                            {group.alerts.map((alert) => (
                                                <label className={styles.alertRow} key={alert.id}>
                                                    <input
                                                        type="checkbox"
                                                        checked={alert.enabled}
                                                        onChange={() => toggleAlert(group.id, alert.id)}
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
                                );
                            })}
                        </div>
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
                                <small>10:00 PM to 7:00 AM</small>
                            </span>
                        </label>

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
                                <h2>Recent Notifications</h2>
                                <p>Latest alerts sent to your account.</p>
                            </div>
                        </div>

                        <div className={styles.recentList}>
                            {recentNotifications.map((notification) => {
                                const NotificationIcon = notification.icon;

                                return (
                                    <article className={styles.recentItem} key={notification.id}>
                                        <span>
                                            <NotificationIcon
                                                size={20}
                                                strokeWidth={2.3}
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <div>
                                            <h3>{notification.title}</h3>
                                            <p>{notification.description}</p>
                                            <small>{notification.time}</small>
                                        </div>

                                        {notification.status === "Delivered" ? (
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
                            })}
                        </div>
                    </section>

                    <section className={styles.warningCard}>
                        <XCircle size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Do not disable critical alerts</h2>
                            <p>
                                Account security, OTP, payment status and QR ticket confirmation
                                alerts should remain available because they protect the fan and
                                help complete transactions.
                            </p>
                        </div>

                        <Link to="/profile/privacy">Review Security Settings</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default NotificationsPage;