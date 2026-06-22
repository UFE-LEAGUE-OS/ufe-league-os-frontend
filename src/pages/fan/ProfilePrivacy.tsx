import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Eye,
    KeyRound,
    Lock,
    LogOut,
    MailCheck,
    MonitorSmartphone,
    Save,
    ShieldAlert,
    ShieldCheck,
    Smartphone,
    Trash2,
    UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./PrivacySecurityPage.module.css";

interface SecurityStat {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    tone: "purple" | "green" | "orange" | "blue";
}

interface SecurityChecklistItem {
    id: string;
    title: string;
    description: string;
    status: "Complete" | "Recommended" | "Review";
    icon: LucideIcon;
}

interface SessionItem {
    id: string;
    device: string;
    location: string;
    browser: string;
    lastActive: string;
    current: boolean;
}

const securityStats: SecurityStat[] = [
    {
        label: "Security Score",
        value: "82%",
        detail: "Strong account protection",
        icon: ShieldCheck,
        tone: "green",
    },
    {
        label: "Verified Contact",
        value: "2",
        detail: "Email and phone verified",
        icon: MailCheck,
        tone: "purple",
    },
    {
        label: "Active Sessions",
        value: "3",
        detail: "Across your devices",
        icon: MonitorSmartphone,
        tone: "blue",
    },
    {
        label: "Privacy Mode",
        value: "Fans",
        detail: "Visible to followers",
        icon: Eye,
        tone: "orange",
    },
];

const checklistItems: SecurityChecklistItem[] = [
    {
        id: "email-verified",
        title: "Email verified",
        description: "Your email is confirmed and can receive account alerts.",
        status: "Complete",
        icon: MailCheck,
    },
    {
        id: "phone-verified",
        title: "Phone verified",
        description: "Your phone can be used for OTP and urgent ticket alerts.",
        status: "Complete",
        icon: Smartphone,
    },
    {
        id: "two-factor",
        title: "Two-factor authentication",
        description: "Add extra protection for login and sensitive account changes.",
        status: "Recommended",
        icon: Lock,
    },
    {
        id: "session-review",
        title: "Review active sessions",
        description: "Remove devices you no longer use or recognize.",
        status: "Review",
        icon: MonitorSmartphone,
    },
];

const initialSessions: SessionItem[] = [
    {
        id: "current-device",
        device: "Windows Laptop",
        location: "Kampala, Uganda",
        browser: "Microsoft Edge",
        lastActive: "Active now",
        current: true,
    },
    {
        id: "android-phone",
        device: "Android Phone",
        location: "Kampala, Uganda",
        browser: "Chrome Mobile",
        lastActive: "Yesterday, 8:42 PM",
        current: false,
    },
    {
        id: "old-laptop",
        device: "Unknown Laptop",
        location: "Entebbe, Uganda",
        browser: "Chrome",
        lastActive: "12 days ago",
        current: false,
    },
];

function getStatusClass(status: SecurityChecklistItem["status"]) {
    if (status === "Complete") {
        return styles.completeStatus;
    }

    if (status === "Recommended") {
        return styles.recommendedStatus;
    }

    return styles.reviewStatus;
}

function PrivacySecurityPage() {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [profileVisible, setProfileVisible] = useState(true);
    const [showFollowedClubs, setShowFollowedClubs] = useState(true);
    const [showActivity, setShowActivity] = useState(false);
    const [allowSponsorOffers, setAllowSponsorOffers] = useState(false);
    const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);
    const [saveMessage, setSaveMessage] = useState("");

    function removeSession(sessionId: string) {
        setSessions((currentSessions) =>
            currentSessions.filter((session) => session.id !== sessionId),
        );

        setSaveMessage("Session removed locally for now.");
    }

    function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaveMessage("Password change request prepared locally for now.");
    }

    function handleSavePrivacy() {
        setSaveMessage("Privacy settings saved locally for now.");
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Privacy &amp; Security</h1>
                    <p>
                        Manage your password, login protection, active sessions, profile
                        visibility and account privacy controls.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.primaryHeaderAction}
                    onClick={handleSavePrivacy}
                >
                    <Save size={18} strokeWidth={2.4} aria-hidden="true" />
                    Save Settings
                </button>
            </header>

            {saveMessage ? (
                <div className={styles.saveMessage} role="status">
                    <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                    {saveMessage}
                </div>
            ) : null}

            <section className={styles.summaryGrid} aria-label="Security summary">
                {securityStats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <article
                            className={`${styles.summaryCard} ${styles[stat.tone]}`}
                            key={stat.label}
                        >
                            <div>
                                <p>{stat.label}</p>
                                <strong>{stat.value}</strong>
                                <span>{stat.detail}</span>
                            </div>

                            <Icon size={38} strokeWidth={2.1} aria-hidden="true" />
                        </article>
                    );
                })}
            </section>

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Security Checklist</h2>
                                <p>
                                    Review the main protections needed for a safe League OS fan
                                    account.
                                </p>
                            </div>
                        </div>

                        <div className={styles.checklistGrid}>
                            {checklistItems.map((item) => {
                                const ItemIcon = item.icon;

                                return (
                                    <article className={styles.checklistCard} key={item.id}>
                                        <span className={styles.checklistIcon}>
                                            <ItemIcon size={25} strokeWidth={2.3} aria-hidden="true" />
                                        </span>

                                        <div>
                                            <h3>{item.title}</h3>
                                            <p>{item.description}</p>
                                        </div>

                                        <span className={getStatusClass(item.status)}>
                                            {item.status}
                                        </span>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Password &amp; Login Protection</h2>
                                <p>
                                    Password updates will later be connected to the backend
                                    account security endpoints.
                                </p>
                            </div>
                        </div>

                        <form className={styles.passwordForm} onSubmit={handlePasswordSubmit}>
                            <label>
                                <span>Current Password</span>
                                <input type="password" placeholder="Enter current password" />
                            </label>

                            <label>
                                <span>New Password</span>
                                <input type="password" placeholder="Enter new password" />
                            </label>

                            <label>
                                <span>Confirm New Password</span>
                                <input type="password" placeholder="Confirm new password" />
                            </label>

                            <button type="submit">
                                <KeyRound size={18} strokeWidth={2.4} aria-hidden="true" />
                                Update Password
                            </button>
                        </form>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Active Sessions</h2>
                                <p>
                                    These are devices currently or recently signed in to your
                                    League OS account.
                                </p>
                            </div>

                            <button type="button">
                                <LogOut size={17} strokeWidth={2.4} aria-hidden="true" />
                                Sign Out Others
                            </button>
                        </div>

                        <div className={styles.sessionList}>
                            {sessions.map((session) => (
                                <article className={styles.sessionItem} key={session.id}>
                                    <span className={styles.sessionIcon}>
                                        <MonitorSmartphone
                                            size={24}
                                            strokeWidth={2.3}
                                            aria-hidden="true"
                                        />
                                    </span>

                                    <div>
                                        <h3>{session.device}</h3>
                                        <p>
                                            {session.browser} • {session.location}
                                        </p>
                                        <small>{session.lastActive}</small>
                                    </div>

                                    {session.current ? (
                                        <span className={styles.currentSession}>Current</span>
                                    ) : (
                                        <button
                                            type="button"
                                            className={styles.removeSessionButton}
                                            onClick={() => removeSession(session.id)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <ShieldAlert size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Two-Factor Authentication</h2>
                                <p>Add another confirmation step when signing in.</p>
                            </div>
                        </div>

                        <label className={styles.toggleRow}>
                            <input
                                type="checkbox"
                                checked={twoFactorEnabled}
                                onChange={() =>
                                    setTwoFactorEnabled((currentValue) => !currentValue)
                                }
                            />

                            <span>
                                <strong>Enable two-factor authentication</strong>
                                <small>
                                    Later this can use email OTP, SMS OTP or authenticator app
                                    logic.
                                </small>
                            </span>
                        </label>

                        <div className={styles.securityNote}>
                            <Clock size={20} strokeWidth={2.3} aria-hidden="true" />
                            <p>
                                OTP login already exists in the registration flow. This setting
                                is for additional login protection after account creation.
                            </p>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <UserCheck size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Profile Privacy</h2>
                                <p>Control what other fans and clubs can see.</p>
                            </div>
                        </div>

                        <div className={styles.privacyControls}>
                            <label className={styles.toggleRow}>
                                <input
                                    type="checkbox"
                                    checked={profileVisible}
                                    onChange={() =>
                                        setProfileVisible((currentValue) => !currentValue)
                                    }
                                />

                                <span>
                                    <strong>Public fan profile</strong>
                                    <small>Allow others to see your fan profile.</small>
                                </span>
                            </label>

                            <label className={styles.toggleRow}>
                                <input
                                    type="checkbox"
                                    checked={showFollowedClubs}
                                    onChange={() =>
                                        setShowFollowedClubs((currentValue) => !currentValue)
                                    }
                                />

                                <span>
                                    <strong>Show followed clubs</strong>
                                    <small>Display clubs you follow on your profile.</small>
                                </span>
                            </label>

                            <label className={styles.toggleRow}>
                                <input
                                    type="checkbox"
                                    checked={showActivity}
                                    onChange={() =>
                                        setShowActivity((currentValue) => !currentValue)
                                    }
                                />

                                <span>
                                    <strong>Show activity history</strong>
                                    <small>Display recent fan activity and achievements.</small>
                                </span>
                            </label>

                            <label className={styles.toggleRow}>
                                <input
                                    type="checkbox"
                                    checked={allowSponsorOffers}
                                    onChange={() =>
                                        setAllowSponsorOffers((currentValue) => !currentValue)
                                    }
                                />

                                <span>
                                    <strong>Personalized sponsor offers</strong>
                                    <small>
                                        Allow relevant offers based on followed clubs and sports.
                                    </small>
                                </span>
                            </label>
                        </div>
                    </section>

                    <section className={styles.warningCard}>
                        <AlertTriangle size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Account deletion is permanent</h2>
                            <p>
                                Deleting an account should not automatically delete financial
                                transaction records, ticket audit records or legally required
                                payment history.
                            </p>
                        </div>

                        <button type="button">
                            <Trash2 size={17} strokeWidth={2.4} aria-hidden="true" />
                            Request Account Deletion
                        </button>
                    </section>

                    <section className={styles.supportCard}>
                        <Lock size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Need security help?</h2>
                            <p>
                                Report suspicious logins, lost access, payment issues or
                                account problems.
                            </p>
                        </div>

                        <Link to="/profile/support">Contact Support →</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default PrivacySecurityPage;