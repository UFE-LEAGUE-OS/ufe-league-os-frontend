import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    EyeOff,
    FileText,
    KeyRound,
    Lock,
    LogOut,
    MailCheck,
    MonitorSmartphone,
    Save,
    ShieldAlert,
    ShieldCheck,
    Smartphone,
    Headphones,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    getInterestPreferences,
    updateInterestPreferences,
    type BackendProfileVisibility,
    type InterestPreferencePayload,
} from "../../services/privacyPreferenceService";
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

interface LoginEvent {
    id: string;
    title: string;
    device: string;
    location: string;
    time: string;
    status: "Successful" | "Review";
}

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

const loginEvents: LoginEvent[] = [
    {
        id: "login-001",
        title: "Successful login",
        device: "Windows Laptop",
        location: "Kampala, Uganda",
        time: "Today, 8:12 AM",
        status: "Successful",
    },
    {
        id: "login-002",
        title: "Successful login",
        device: "Android Phone",
        location: "Kampala, Uganda",
        time: "Yesterday, 8:42 PM",
        status: "Successful",
    },
    {
        id: "login-003",
        title: "Older device login",
        device: "Unknown Laptop",
        location: "Entebbe, Uganda",
        time: "12 days ago",
        status: "Review",
    },
];

const PRIVACY_SETTINGS_STORAGE_KEY = "leagueos:fan-privacy-security-settings";

interface PrivacyLocalSettings {
    twoFactorEnabled: boolean;
    loginAlertsEnabled: boolean;
    trustedDevicesEnabled: boolean;
    profileVisible: boolean;
    profileVisibility: string;
    showFollowedClubs: boolean;
    showActivity: boolean;
    allowSponsorOffers: boolean;
    allowPersonalization: boolean;
}

function readLocalPrivacySettings(): PrivacyLocalSettings | null {
    try {
        const rawValue = window.localStorage.getItem(PRIVACY_SETTINGS_STORAGE_KEY);

        if (!rawValue) {
            return null;
        }

        return JSON.parse(rawValue) as PrivacyLocalSettings;
    } catch {
        return null;
    }
}

function writeLocalPrivacySettings(settings: PrivacyLocalSettings) {
    try {
        window.localStorage.setItem(
            PRIVACY_SETTINGS_STORAGE_KEY,
            JSON.stringify(settings),
        );
    } catch {
        // Local storage may fail in private browsing. Backend save can still work.
    }
}

function visibilityLabelToBackend(value: string): BackendProfileVisibility {
    if (value === "Public") {
        return "PUBLIC";
    }

    if (value === "Private") {
        return "PRIVATE";
    }

    return "FOLLOWERS_ONLY";
}

function backendVisibilityToLabel(value: BackendProfileVisibility): string {
    if (value === "PUBLIC") {
        return "Public";
    }

    if (value === "PRIVATE") {
        return "Private";
    }

    return "Followers";
}

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
    const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
    const [trustedDevicesEnabled, setTrustedDevicesEnabled] = useState(true);
    const [profileVisible, setProfileVisible] = useState(true);
    const [profileVisibility, setProfileVisibility] = useState("Followers");
    const [showFollowedClubs, setShowFollowedClubs] = useState(true);
    const [showActivity, setShowActivity] = useState(false);
    const [allowSponsorOffers, setAllowSponsorOffers] = useState(false);
    const [allowPersonalization, setAllowPersonalization] = useState(true);
    const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [isLoadingPrivacy, setIsLoadingPrivacy] = useState(true);
    const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
    const [hasLoadedPrivacy, setHasLoadedPrivacy] = useState(false);

    const securityScore = useMemo(() => {
        let score = 70;

        if (twoFactorEnabled) score += 10;
        if (loginAlertsEnabled) score += 8;
        if (trustedDevicesEnabled) score += 4;
        if (sessions.length <= 2) score += 8;

        return Math.min(score, 100);
    }, [loginAlertsEnabled, sessions.length, trustedDevicesEnabled, twoFactorEnabled]);

    const privacySnapshot = useMemo(
        () => ({
            twoFactorEnabled,
            loginAlertsEnabled,
            trustedDevicesEnabled,
            profileVisible,
            profileVisibility,
            showFollowedClubs,
            showActivity,
            allowSponsorOffers,
            allowPersonalization,
        }),
        [
            allowPersonalization,
            allowSponsorOffers,
            loginAlertsEnabled,
            profileVisibility,
            profileVisible,
            showActivity,
            showFollowedClubs,
            trustedDevicesEnabled,
            twoFactorEnabled,
        ],
    );

    const backendPrivacyPayload = useMemo<InterestPreferencePayload>(
        () => ({
            profile_visibility: profileVisible
                ? visibilityLabelToBackend(profileVisibility)
                : "PRIVATE",
            show_followed_teams: showFollowedClubs,
            show_attended_matches: showActivity,
            activity_visibility: showActivity ? "FOLLOWERS_ONLY" : "PRIVATE",
            interested_in_highlights: allowPersonalization,
            interested_in_tickets: allowPersonalization,
            interested_in_merchandise: allowSponsorOffers,
        }),
        [
            allowPersonalization,
            allowSponsorOffers,
            profileVisibility,
            profileVisible,
            showActivity,
            showFollowedClubs,
        ],
    );

    const securityStats: SecurityStat[] = [
        {
            label: "Security Score",
            value: `${securityScore}%`,
            detail: twoFactorEnabled ? "Strong protection" : "2FA recommended",
            icon: ShieldCheck,
            tone: "green",
        },
        {
            label: "Login Protection",
            value: twoFactorEnabled ? "2FA On" : "Basic",
            detail: loginAlertsEnabled ? "Login alerts enabled" : "Login alerts off",
            icon: KeyRound,
            tone: "purple",
        },
        {
            label: "Active Sessions",
            value: String(sessions.length),
            detail: "Across your devices",
            icon: MonitorSmartphone,
            tone: "blue",
        },
        {
            label: "Profile Privacy",
            value: profileVisibility,
            detail: profileVisible ? "Profile visible" : "Profile hidden",
            icon: Eye,
            tone: "orange",
        },
    ];

    function applyPrivacySettings(settings: PrivacyLocalSettings) {
        setTwoFactorEnabled(settings.twoFactorEnabled);
        setLoginAlertsEnabled(settings.loginAlertsEnabled);
        setTrustedDevicesEnabled(settings.trustedDevicesEnabled);
        setProfileVisible(settings.profileVisible);
        setProfileVisibility(settings.profileVisibility);
        setShowFollowedClubs(settings.showFollowedClubs);
        setShowActivity(settings.showActivity);
        setAllowSponsorOffers(settings.allowSponsorOffers);
        setAllowPersonalization(settings.allowPersonalization);
    }

    async function loadPrivacySettings() {
        setIsLoadingPrivacy(true);

        const localSettings = readLocalPrivacySettings();

        if (localSettings) {
            applyPrivacySettings(localSettings);

            try {
                await updateInterestPreferences({
                    profile_visibility: localSettings.profileVisible
                        ? visibilityLabelToBackend(localSettings.profileVisibility)
                        : "PRIVATE",
                    show_followed_teams: localSettings.showFollowedClubs,
                    show_attended_matches: localSettings.showActivity,
                    activity_visibility: localSettings.showActivity
                        ? "FOLLOWERS_ONLY"
                        : "PRIVATE",
                    interested_in_highlights: localSettings.allowPersonalization,
                    interested_in_tickets: localSettings.allowPersonalization,
                    interested_in_merchandise: localSettings.allowSponsorOffers,
                });
            } catch {
                // Browser settings are still available even if backend sync fails.
            } finally {
                setIsLoadingPrivacy(false);
                setHasLoadedPrivacy(true);
            }

            return;
        }

        try {
            const backendPreferences = await getInterestPreferences();

            const backendSettings: PrivacyLocalSettings = {
                twoFactorEnabled,
                loginAlertsEnabled,
                trustedDevicesEnabled,
                profileVisible: backendPreferences.profile_visibility !== "PRIVATE",
                profileVisibility: backendVisibilityToLabel(
                    backendPreferences.profile_visibility,
                ),
                showFollowedClubs: backendPreferences.show_followed_teams,
                showActivity: backendPreferences.show_attended_matches,
                allowSponsorOffers: backendPreferences.interested_in_merchandise,
                allowPersonalization:
                    backendPreferences.interested_in_highlights ||
                    backendPreferences.interested_in_tickets,
            };

            applyPrivacySettings(backendSettings);
            writeLocalPrivacySettings(backendSettings);
        } catch {
            setSaveMessage(
                "Backend privacy preferences could not be loaded. Changes will be saved in this browser until backend sync is available.",
            );
        } finally {
            setIsLoadingPrivacy(false);
            setHasLoadedPrivacy(true);
        }
    }

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadPrivacySettings();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
        // Load once on mount. Local settings take priority over backend defaults.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!hasLoadedPrivacy) {
            return undefined;
        }

        writeLocalPrivacySettings(privacySnapshot);

        const timeoutId = window.setTimeout(() => {
            setIsSavingPrivacy(true);

            updateInterestPreferences(backendPrivacyPayload)
                .then(() => {
                    setSaveMessage("Privacy preferences autosaved.");
                })
                .catch(() => {
                    setSaveMessage(
                        "Privacy preferences saved in this browser. Backend sync is unavailable.",
                    );
                })
                .finally(() => {
                    setIsSavingPrivacy(false);
                });
        }, 700);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [backendPrivacyPayload, hasLoadedPrivacy, privacySnapshot]);

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

    async function handleSavePrivacy() {
        setIsSavingPrivacy(true);
        writeLocalPrivacySettings(privacySnapshot);

        try {
            await updateInterestPreferences(backendPrivacyPayload);
            setSaveMessage("Privacy preferences saved to the backend.");
        } catch {
            setSaveMessage(
                "Privacy preferences saved in this browser. Backend sync is unavailable.",
            );
        } finally {
            setIsSavingPrivacy(false);
        }
    }

    function handleDataExport() {
        setSaveMessage("Data export request prepared locally for now.");
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>Account Protection</span>
                    <h1>Privacy &amp; Security</h1>
                    <p>
                        Manage password changes, login protection, active sessions,
                        profile visibility and data controls.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.primaryHeaderAction}
                    onClick={() => void handleSavePrivacy()}
                    disabled={isSavingPrivacy || isLoadingPrivacy}
                >
                    <Save size={18} strokeWidth={2.4} aria-hidden="true" />
                    {isSavingPrivacy ? "Saving..." : "Save Now"}
                </button>
            </header>

            {saveMessage ? (
                <div className={styles.saveMessage} role="status">
                    <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                    {saveMessage}
                </div>
            ) : null}

            <section className={styles.summaryGrid} aria-label="Privacy and security summary">
                {securityStats.map((stat) => {
                    const StatIcon = stat.icon;

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

                            <StatIcon size={38} strokeWidth={2.1} aria-hidden="true" />
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
                                    Quick checks to keep your League OS fan account protected.
                                    Hover a card to view more detail.
                                </p>
                            </div>
                        </div>

                        <div className={styles.checklistGrid}>
                            {checklistItems.map((item) => {
                                const ItemIcon = item.icon;

                                return (
                                    <article className={styles.checklistCard} key={item.id}>
                                        <span className={styles.checklistIcon}>
                                            <ItemIcon
                                                size={24}
                                                strokeWidth={2.3}
                                                aria-hidden="true"
                                            />
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
                                <h2>Password</h2>
                                <p>
                                    Use a strong password and avoid reusing it on other services.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPasswordFields((currentValue) => !currentValue)
                                }
                            >
                                {showPasswordFields ? (
                                    <>
                                        <EyeOff
                                            size={16}
                                            strokeWidth={2.4}
                                            aria-hidden="true"
                                        />
                                        Hide Fields
                                    </>
                                ) : (
                                    <>
                                        <Eye size={16} strokeWidth={2.4} aria-hidden="true" />
                                        Change Password
                                    </>
                                )}
                            </button>
                        </div>

                        <form
                            className={`${styles.passwordForm} ${
                                showPasswordFields ? styles.passwordFormVisible : ""
                            }`}
                            onSubmit={handlePasswordSubmit}
                        >
                            <label>
                                <span>Current Password</span>
                                <input
                                    type="password"
                                    placeholder="Enter current password"
                                    disabled={!showPasswordFields}
                                />
                            </label>

                            <label>
                                <span>New Password</span>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    disabled={!showPasswordFields}
                                />
                            </label>

                            <label>
                                <span>Confirm Password</span>
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    disabled={!showPasswordFields}
                                />
                            </label>

                            <button type="submit" disabled={!showPasswordFields}>
                                <KeyRound size={17} strokeWidth={2.4} aria-hidden="true" />
                                Update Password
                            </button>
                        </form>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Login Protection</h2>
                                <p>
                                    Control how your account handles login security and device access.
                                </p>
                            </div>
                        </div>

                        <div className={styles.securityControlGrid}>
                            <label className={styles.securityControlCard}>
                                <span>
                                    <Lock size={22} strokeWidth={2.4} aria-hidden="true" />
                                </span>

                                <div>
                                    <strong>Two-factor authentication</strong>
                                    <small>
                                        Require an extra verification step for sensitive sign-ins.
                                    </small>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={twoFactorEnabled}
                                    onChange={() =>
                                        setTwoFactorEnabled((currentValue) => !currentValue)
                                    }
                                />
                            </label>

                            <label className={styles.securityControlCard}>
                                <span>
                                    <ShieldAlert
                                        size={22}
                                        strokeWidth={2.4}
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <strong>Login alerts</strong>
                                    <small>
                                        Notify me when my account is used on a new device.
                                    </small>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={loginAlertsEnabled}
                                    onChange={() =>
                                        setLoginAlertsEnabled((currentValue) => !currentValue)
                                    }
                                />
                            </label>

                            <label className={styles.securityControlCard}>
                                <span>
                                    <MonitorSmartphone
                                        size={22}
                                        strokeWidth={2.4}
                                        aria-hidden="true"
                                    />
                                </span>

                                <div>
                                    <strong>Remember trusted devices</strong>
                                    <small>
                                        Keep trusted devices signed in unless suspicious activity appears.
                                    </small>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={trustedDevicesEnabled}
                                    onChange={() =>
                                        setTrustedDevicesEnabled((currentValue) => !currentValue)
                                    }
                                />
                            </label>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Privacy Controls</h2>
                                <p>
                                    Choose what other fans can see and how your fan experience is personalized.
                                </p>
                            </div>
                        </div>

                        <div className={styles.privacyGrid}>
                            <label className={styles.selectField}>
                                <span>Profile visibility</span>
                                <select
                                    value={profileVisibility}
                                    onChange={(event) =>
                                        setProfileVisibility(event.target.value)
                                    }
                                >
                                    <option>Public</option>
                                    <option>Followers</option>
                                    <option>Private</option>
                                </select>
                            </label>

                            <label className={styles.toggleRow}>
                                <span>
                                    <strong>Show profile</strong>
                                    <small>Allow your fan profile to appear in public fan areas.</small>
                                </span>

                                <input
                                    type="checkbox"
                                    checked={profileVisible}
                                    onChange={() =>
                                        setProfileVisible((currentValue) => !currentValue)
                                    }
                                />
                            </label>

                            <label className={styles.toggleRow}>
                                <span>
                                    <strong>Show followed clubs</strong>
                                    <small>Display clubs and teams you follow on your fan profile.</small>
                                </span>

                                <input
                                    type="checkbox"
                                    checked={showFollowedClubs}
                                    onChange={() =>
                                        setShowFollowedClubs((currentValue) => !currentValue)
                                    }
                                />
                            </label>

                            <label className={styles.toggleRow}>
                                <span>
                                    <strong>Show recent activity</strong>
                                    <small>Allow recent fan activity to appear on your profile.</small>
                                </span>

                                <input
                                    type="checkbox"
                                    checked={showActivity}
                                    onChange={() =>
                                        setShowActivity((currentValue) => !currentValue)
                                    }
                                />
                            </label>

                            <label className={styles.toggleRow}>
                                <span>
                                    <strong>Personalized recommendations</strong>
                                    <small>Use fan preferences to improve clubs, tickets and news suggestions.</small>
                                </span>

                                <input
                                    type="checkbox"
                                    checked={allowPersonalization}
                                    onChange={() =>
                                        setAllowPersonalization((currentValue) => !currentValue)
                                    }
                                />
                            </label>

                            <label className={styles.toggleRow}>
                                <span>
                                    <strong>Sponsor offers</strong>
                                    <small>Allow relevant sponsor offers and promotions.</small>
                                </span>

                                <input
                                    type="checkbox"
                                    checked={allowSponsorOffers}
                                    onChange={() =>
                                        setAllowSponsorOffers((currentValue) => !currentValue)
                                    }
                                />
                            </label>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Active Sessions</h2>
                                <p>
                                    Review devices signed into your League OS account.
                                </p>
                            </div>
                        </div>

                        <div className={styles.sessionList}>
                            {sessions.map((session) => (
                                <article className={styles.sessionItem} key={session.id}>
                                    <span className={styles.sessionIcon}>
                                        <MonitorSmartphone
                                            size={23}
                                            strokeWidth={2.3}
                                            aria-hidden="true"
                                        />
                                    </span>

                                    <div>
                                        <h3>
                                            {session.device}
                                            {session.current ? (
                                                <em>Current</em>
                                            ) : null}
                                        </h3>

                                        <p>
                                            {session.browser} • {session.location}
                                        </p>

                                        <small>{session.lastActive}</small>
                                    </div>

                                    {session.current ? (
                                        <button
                                            type="button"
                                            className={styles.currentSessionButton}
                                            disabled
                                        >
                                            Current Device
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className={styles.removeSessionButton}
                                            onClick={() => removeSession(session.id)}
                                        >
                                            <LogOut
                                                size={16}
                                                strokeWidth={2.4}
                                                aria-hidden="true"
                                            />
                                            Remove
                                        </button>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.securityScoreCard}>
                        <span>
                            <ShieldCheck size={52} strokeWidth={2.2} aria-hidden="true" />
                        </span>

                        <div>
                            <h2>{securityScore}% Secure</h2>
                            <p>
                                Your account is protected, but enabling two-factor authentication
                                will improve your security score.
                            </p>
                        </div>

                        <div className={styles.scoreBar}>
                            <span style={{ width: `${securityScore}%` }} />
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <Clock size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Login History</h2>
                                <p>Recent account access activity.</p>
                            </div>
                        </div>

                        <div className={styles.loginHistoryList}>
                            {loginEvents.map((event) => (
                                <article className={styles.loginEventItem} key={event.id}>
                                    <span
                                        className={
                                            event.status === "Successful"
                                                ? styles.loginSuccessIcon
                                                : styles.loginReviewIcon
                                        }
                                    >
                                        {event.status === "Successful" ? (
                                            <CheckCircle2
                                                size={18}
                                                strokeWidth={2.4}
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <AlertTriangle
                                                size={18}
                                                strokeWidth={2.4}
                                                aria-hidden="true"
                                            />
                                        )}
                                    </span>

                                    <div>
                                        <h3>{event.title}</h3>
                                        <p>
                                            {event.device} • {event.location}
                                        </p>
                                        <small>{event.time}</small>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                    <section className={styles.privacySponsorCard} aria-label="Sponsored privacy placement">
                        <span>Sponsored</span>

                        <div>
                            <h2>Trusted Fan Partner Slot</h2>
                            <p>
                                Use this space for verified sponsor offers, account protection
                                campaigns, fan safety messages or premium membership promotions.
                            </p>
                        </div>

                        <Link to="/sponsor/apply">Explore Partner Options →</Link>
                    </section>

                    <section className={styles.dataControlSideCard}>
                        <span>Data Controls</span>

                        <div>
                            <h2>Fan account data</h2>
                            <p>
                                Request a data export, review payment receipts and prepare
                                account data requests from one place.
                            </p>
                        </div>

                        <div className={styles.dataControlSideActions}>
                            <button type="button" onClick={handleDataExport}>
                                <Download size={17} strokeWidth={2.4} aria-hidden="true" />
                                Request Export
                            </button>

                            <Link to="/profile/payments">
                                <FileText size={17} strokeWidth={2.4} aria-hidden="true" />
                                Receipts
                            </Link>
                        </div>
                    </section>


                    <section className={styles.supportCard}>
                        <span>
                            <Headphones size={38} strokeWidth={2.3} aria-hidden="true" />
                        </span>

                        <div>
                            <h2>Need account help?</h2>
                            <p>
                                Contact support if you see a device, login or account change
                                you do not recognize.
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
