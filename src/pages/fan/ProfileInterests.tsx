import {
    Bell,
    Check,
    Heart,
    RotateCcw,
    Save,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Trophy,
    Users,
    X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ProfileInterestsPage.module.css";

interface InterestOption {
    id: string;
    label: string;
    subtitle: string;
    image: string;
    tone: "purple" | "orange" | "blue" | "green";
}

interface InterestGroup {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    options: InterestOption[];
}

interface TogglePreference {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
}

const STORAGE_KEY = "league-os-profile-interests";

const interestGroups: InterestGroup[] = [
    {
        id: "sports",
        title: "Sports",
        description: "Choose the sports you want League OS to prioritize.",
        icon: Trophy,
        options: [
            {
                id: "rugby",
                label: "Rugby",
                subtitle: "15s, 7s, 10s",
                image: "/assets/sports/rugby-promo.png",
                tone: "purple",
            },
            {
                id: "football",
                label: "Football",
                subtitle: "UPL & community leagues",
                image: "/assets/sports/football-promo.png",
                tone: "orange",
            },
            {
                id: "basketball",
                label: "Basketball",
                subtitle: "NBL & club basketball",
                image: "/assets/sports/basketball-promo.png",
                tone: "blue",
            },
        ],
    },
    {
        id: "clubs",
        title: "Clubs & Teams",
        description: "Follow clubs and teams for updates, fixtures, tickets and news.",
        icon: ShieldCheck,
        options: [
            {
                id: "kobs",
                label: "KCB KOBS",
                subtitle: "Rugby Club",
                image: "/assets/clubs/kobs.jpg",
                tone: "purple",
            },
            {
                id: "sc-villa",
                label: "SC Villa",
                subtitle: "Football Club",
                image: "/assets/clubs/sc-villa.png",
                tone: "blue",
            },
            {
                id: "city-oilers",
                label: "City Oilers",
                subtitle: "Basketball Club",
                image: "/assets/clubs/city-oilers.png",
                tone: "orange",
            },
            {
                id: "vipers",
                label: "Vipers SC",
                subtitle: "Football Club",
                image: "/assets/clubs/vipers-sc.png",
                tone: "green",
            },
            {
                id: "black-pirates",
                label: "Black Pirates",
                subtitle: "Rugby Club",
                image: "/assets/clubs/black-pirates.png",
                tone: "purple",
            },
            {
                id: "kcca",
                label: "KCCA FC",
                subtitle: "Football Club",
                image: "/assets/clubs/kcca-fc.png",
                tone: "blue",
            },
        ],
    },
    {
        id: "competitions",
        title: "Competitions",
        description: "Select competitions you want in your dashboard and feed.",
        icon: Users,
        options: [
            {
                id: "nile-rugby",
                label: "Nile Special Rugby",
                subtitle: "Rugby Premiership",
                image: "/assets/competitions/nile-rugby.jpg",
                tone: "purple",
            },
            {
                id: "uganda-premier-league",
                label: "Uganda Premier League",
                subtitle: "Football",
                image: "/assets/competitions/star-times-upl.png",
                tone: "orange",
            },
            {
                id: "nbl",
                label: "National Basketball League",
                subtitle: "Basketball",
                image: "/assets/competitions/national-basketball.png",
                tone: "blue",
            },
            {
                id: "budo-league",
                label: "Budo League",
                subtitle: "Community Football",
                image: "/assets/competitions/budo-league.png",
                tone: "green",
            },
        ],
    },
];

const defaultSelectedIds = [
    "rugby",
    "football",
    "basketball",
    "kobs",
    "sc-villa",
    "city-oilers",
    "nile-rugby",
];

const defaultFeedPreferences: TogglePreference[] = [
    {
        id: "prioritize-clubs",
        title: "Prioritize followed clubs",
        description: "Show followed clubs before general sports news.",
        enabled: true,
    },
    {
        id: "sponsor-offers",
        title: "Show sponsor offers",
        description: "Include relevant sponsor offers and discounts.",
        enabled: true,
    },
    {
        id: "community-leagues",
        title: "Community league updates",
        description: "Include Budo, SMACK, Ntare and other community leagues.",
        enabled: true,
    },
];

const defaultAlertPreferences: TogglePreference[] = [
    {
        id: "match-reminders",
        title: "Match reminders",
        description: "Get alerts before matches involving your followed teams.",
        enabled: true,
    },
    {
        id: "breaking-news",
        title: "Breaking news",
        description: "Receive important club, league and competition updates.",
        enabled: true,
    },
    {
        id: "ticket-alerts",
        title: "Ticket alerts",
        description: "Know when tickets become available for followed teams.",
        enabled: true,
    },
    {
        id: "marketing",
        title: "Promotions & offers",
        description: "Receive sponsor offers, discounts and membership deals.",
        enabled: false,
    },
];

const allOptions = interestGroups.flatMap((group) =>
    group.options.map((option) => ({
        ...option,
        groupTitle: group.title,
    })),
);

function loadStoredPreferences() {
    try {
        const storedValue = window.localStorage.getItem(STORAGE_KEY);

        if (!storedValue) {
            return null;
        }

        return JSON.parse(storedValue) as {
            selectedIds?: string[];
            feedPreferences?: TogglePreference[];
            alertPreferences?: TogglePreference[];
        };
    } catch {
        return null;
    }
}

function ProfileInterestsPage() {
    const storedPreferences = loadStoredPreferences();

    const [selectedIds, setSelectedIds] = useState<string[]>(
        storedPreferences?.selectedIds ?? defaultSelectedIds,
    );
    const [feedPreferences, setFeedPreferences] = useState<TogglePreference[]>(
        storedPreferences?.feedPreferences ?? defaultFeedPreferences,
    );
    const [alertPreferences, setAlertPreferences] = useState<TogglePreference[]>(
        storedPreferences?.alertPreferences ?? defaultAlertPreferences,
    );
    const [activeGroupId, setActiveGroupId] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [saveMessage, setSaveMessage] = useState("");

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const selectedOptions = useMemo(
        () => allOptions.filter((option) => selectedIds.includes(option.id)),
        [selectedIds],
    );

    const totalOptions = allOptions.length;

    const filteredGroups = useMemo(() => {
        return interestGroups
            .filter((group) => activeGroupId === "all" || group.id === activeGroupId)
            .map((group) => ({
                ...group,
                options: group.options.filter((option) => {
                    if (!normalizedSearchQuery) {
                        return true;
                    }

                    const searchableText = `${option.label} ${option.subtitle} ${group.title}`;

                    return searchableText.toLowerCase().includes(normalizedSearchQuery);
                }),
            }))
            .filter((group) => group.options.length > 0);
    }, [activeGroupId, normalizedSearchQuery]);

    useEffect(() => {
        if (!saveMessage) {
            return undefined;
        }

        const timer = window.setTimeout(() => setSaveMessage(""), 3000);

        return () => window.clearTimeout(timer);
    }, [saveMessage]);

    function toggleInterest(optionId: string) {
        setSelectedIds((currentIds) => {
            if (currentIds.includes(optionId)) {
                return currentIds.filter((id) => id !== optionId);
            }

            return [...currentIds, optionId];
        });
    }

    function removeSelectedInterest(optionId: string) {
        setSelectedIds((currentIds) => currentIds.filter((id) => id !== optionId));
    }

    function togglePreference(
        type: "feed" | "alert",
        preferenceId: string,
    ) {
        const updater = (preference: TogglePreference) =>
            preference.id === preferenceId
                ? { ...preference, enabled: !preference.enabled }
                : preference;

        if (type === "feed") {
            setFeedPreferences((currentPreferences) => currentPreferences.map(updater));
            return;
        }

        setAlertPreferences((currentPreferences) => currentPreferences.map(updater));
    }

    function savePreferences() {
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                selectedIds,
                feedPreferences,
                alertPreferences,
            }),
        );

        setSaveMessage("Preferences saved on this device.");
    }

    function resetPreferences() {
        setSelectedIds(defaultSelectedIds);
        setFeedPreferences(defaultFeedPreferences);
        setAlertPreferences(defaultAlertPreferences);
        window.localStorage.removeItem(STORAGE_KEY);
        setSaveMessage("Preferences reset to defaults.");
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Profile &amp; Interests</h1>
                    <p>
                        Choose what you want League OS to prioritize across your dashboard,
                        match alerts, news feed, tickets and recommendations.
                    </p>
                </div>

                <Link to="/profile" className={styles.backLink}>
                    Back to Profile
                </Link>
            </header>

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.heroCard}>
                        <div>
                            <span className={styles.heroIcon}>
                                <Heart size={32} strokeWidth={2.4} aria-hidden="true" />
                            </span>

                            <h2>Your Fan Preferences</h2>
                            <p>
                                This page controls what appears first for you. It is separate
                                from your personal profile details.
                            </p>
                        </div>

                        <div className={styles.summaryStat}>
                            <strong>{selectedIds.length}</strong>
                            <span>Selected</span>
                            <small>{totalOptions} available options</small>
                        </div>
                    </section>

                    <section className={styles.toolbarCard}>
                        <div className={styles.searchCard}>
                            <Search size={21} strokeWidth={2.3} aria-hidden="true" />

                            <input
                                type="search"
                                placeholder="Search sports, clubs, teams or competitions..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />

                            {searchQuery ? (
                                <button
                                    type="button"
                                    aria-label="Clear search"
                                    onClick={() => setSearchQuery("")}
                                >
                                    <X size={18} strokeWidth={2.4} />
                                </button>
                            ) : null}
                        </div>

                        <div className={styles.tabs} aria-label="Interest groups">
                            <button
                                type="button"
                                className={activeGroupId === "all" ? styles.activeTab : ""}
                                onClick={() => setActiveGroupId("all")}
                            >
                                All <span>{allOptions.length}</span>
                            </button>

                            {interestGroups.map((group) => (
                                <button
                                    type="button"
                                    className={activeGroupId === group.id ? styles.activeTab : ""}
                                    key={group.id}
                                    onClick={() => setActiveGroupId(group.id)}
                                >
                                    {group.title} <span>{group.options.length}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className={styles.browseHelpers} aria-label="Browse more options">
                        <div>
                            <h2>Need more options?</h2>
                            <p>
                                Use the full browse pages when you want to explore every club,
                                team or competition before following them.
                            </p>
                        </div>

                        <div>
                            <Link to="/clubs">Browse all clubs</Link>
                            <Link to="/competitions">Browse all competitions</Link>
                        </div>
                    </section>

                    <div className={styles.interestSections}>
                        {filteredGroups.length > 0 ? (
                            filteredGroups.map((group) => {
                                const GroupIcon = group.icon;

                                return (
                                    <section className={styles.interestSection} key={group.id}>
                                        <div className={styles.sectionIntro}>
                                            <span>
                                                <GroupIcon
                                                    size={24}
                                                    strokeWidth={2.4}
                                                    aria-hidden="true"
                                                />
                                            </span>

                                            <div>
                                                <h2>{group.title}</h2>
                                                <p>{group.description}</p>
                                            </div>

                                            {group.id === "clubs" ? (
                                                <Link to="/clubs" className={styles.sectionViewAll}>
                                                    View All Clubs →
                                                </Link>
                                            ) : null}

                                            {group.id === "competitions" ? (
                                                <Link to="/competitions" className={styles.sectionViewAll}>
                                                    View All Competitions →
                                                </Link>
                                            ) : null}
                                        </div>

                                        <div className={styles.optionGrid}>
                                            {group.options.map((option) => {
                                                const isSelected = selectedIds.includes(option.id);

                                                return (
                                                    <button
                                                        type="button"
                                                        className={`${styles.preferenceCard} ${
                                                            isSelected ? styles.preferenceCardSelected : ""
                                                        } ${styles[option.tone]}`}
                                                        key={option.id}
                                                        onClick={() => toggleInterest(option.id)}
                                                        aria-pressed={isSelected}
                                                    >
                                                        <img src={option.image} alt="" aria-hidden="true" />

                                                        <span>
                                                            <strong>{option.label}</strong>
                                                            <small>{option.subtitle}</small>
                                                        </span>

                                                        {isSelected ? (
                                                            <span className={styles.selectedBadge}>
                                                                <Check
                                                                    size={15}
                                                                    strokeWidth={3}
                                                                    aria-hidden="true"
                                                                />
                                                            </span>
                                                        ) : null}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </section>
                                );
                            })
                        ) : (
                            <section className={styles.emptySearchState}>
                                <Search size={34} strokeWidth={2.2} aria-hidden="true" />
                                <h2>No matching interests found</h2>
                                <p>
                                    Try searching for a sport, club, team, league or competition.
                                </p>
                                <button type="button" onClick={() => setSearchQuery("")}>
                                    Clear Search
                                </button>
                            </section>
                        )}
                    </div>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.sidePanel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <Check size={24} strokeWidth={2.4} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Selected Interests</h2>
                                <p>These will shape your fan dashboard.</p>
                            </div>
                        </div>

                        <div className={styles.selectedChips}>
                            {selectedOptions.length > 0 ? (
                                selectedOptions.map((option) => (
                                    <button
                                        type="button"
                                        key={option.id}
                                        onClick={() => removeSelectedInterest(option.id)}
                                        title={`Remove ${option.label}`}
                                    >
                                        <img src={option.image} alt="" aria-hidden="true" />
                                        {option.label}
                                        <X size={14} strokeWidth={2.6} aria-hidden="true" />
                                    </button>
                                ))
                            ) : (
                                <p className={styles.emptySelectedText}>
                                    Select at least one interest to personalize your dashboard.
                                </p>
                            )}
                        </div>
                    </section>

                    <section className={styles.sidePanel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <SlidersHorizontal
                                    size={24}
                                    strokeWidth={2.4}
                                    aria-hidden="true"
                                />
                            </span>

                            <div>
                                <h2>Feed Preferences</h2>
                                <p>Choose how your home feed should behave.</p>
                            </div>
                        </div>

                        <div className={styles.preferenceRows}>
                            {feedPreferences.map((preference) => (
                                <label className={styles.toggleRow} key={preference.id}>
                                    <span>
                                        <strong>{preference.title}</strong>
                                        <small>{preference.description}</small>
                                    </span>

                                    <input
                                        type="checkbox"
                                        checked={preference.enabled}
                                        onChange={() => togglePreference("feed", preference.id)}
                                    />
                                </label>
                            ))}
                        </div>
                    </section>

                    <section className={styles.sidePanel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <Bell size={24} strokeWidth={2.4} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Alert Preferences</h2>
                                <p>Decide what League OS can notify you about.</p>
                            </div>
                        </div>

                        <div className={styles.preferenceRows}>
                            {alertPreferences.map((preference) => (
                                <label className={styles.toggleRow} key={preference.id}>
                                    <span>
                                        <strong>{preference.title}</strong>
                                        <small>{preference.description}</small>
                                    </span>

                                    <input
                                        type="checkbox"
                                        checked={preference.enabled}
                                        onChange={() => togglePreference("alert", preference.id)}
                                    />
                                </label>
                            ))}
                        </div>

                        <Link to="/profile/notifications" className={styles.panelLink}>
                            Manage notification settings →
                        </Link>
                    </section>

                    <section className={styles.saveCard}>
                        <ShieldCheck size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Save Your Preferences</h2>
                            <p>
                                Saved locally for now. Later, these can be persisted to the fan
                                profile API.
                            </p>
                        </div>

                        {saveMessage ? <p className={styles.saveMessage}>{saveMessage}</p> : null}

                        <div className={styles.saveActions}>
                            <button type="button" onClick={savePreferences}>
                                <Save size={17} strokeWidth={2.4} aria-hidden="true" />
                                Save
                            </button>

                            <button type="button" onClick={resetPreferences}>
                                <RotateCcw size={17} strokeWidth={2.4} aria-hidden="true" />
                                Reset
                            </button>
                        </div>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default ProfileInterestsPage;
