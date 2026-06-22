import {
    Bell,
    Check,
    Heart,
    Search,
    ShieldCheck,
    SlidersHorizontal,
    Trophy,
    Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
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

const interestGroups: InterestGroup[] = [
    {
        id: "sports",
        title: "Favourite Sports",
        description: "Choose the sports you want to follow closely.",
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
        description: "Follow clubs and teams for updates, fixtures and news.",
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
        title: "Competitions & Leagues",
        description: "Select competitions you want on your feed.",
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

const alertPreferences = [
    {
        id: "match-reminders",
        title: "Match Reminders",
        description: "Get alerts before matches involving your followed teams.",
        enabled: true,
    },
    {
        id: "breaking-news",
        title: "Breaking News",
        description: "Receive important club, league and competition updates.",
        enabled: true,
    },
    {
        id: "ticket-alerts",
        title: "Ticket Alerts",
        description: "Know when tickets become available for followed teams.",
        enabled: true,
    },
    {
        id: "marketing",
        title: "Promotions & Offers",
        description: "Receive sponsor offers, discounts and membership deals.",
        enabled: false,
    },
];

function ProfileInterestsPage() {
    const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelectedIds);
    const [searchQuery, setSearchQuery] = useState("");

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const selectedCount = selectedIds.length;

    const totalOptions = interestGroups.reduce(
        (total, group) => total + group.options.length,
        0,
    );

    const filteredGroups = useMemo(() => {
        if (!normalizedSearchQuery) {
            return interestGroups;
        }

        return interestGroups
            .map((group) => ({
                ...group,
                options: group.options.filter((option) => {
                    const searchableText = `${option.label} ${option.subtitle} ${group.title}`;

                    return searchableText.toLowerCase().includes(normalizedSearchQuery);
                }),
            }))
            .filter((group) => group.options.length > 0);
    }, [normalizedSearchQuery]);

    function toggleInterest(optionId: string) {
        setSelectedIds((currentIds) => {
            if (currentIds.includes(optionId)) {
                return currentIds.filter((id) => id !== optionId);
            }

            return [...currentIds, optionId];
        });
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Profile &amp; Interests</h1>
                    <p>
                        Control the clubs, sports, leagues and updates that shape your
                        League OS experience.
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

                            <h2>Personalize Your Fan Experience</h2>
                            <p>
                                Your selections decide what appears first on your dashboard,
                                news feed, alerts, tickets and membership recommendations.
                            </p>
                        </div>

                        <div className={styles.summaryStat}>
                            <strong>{selectedCount}</strong>
                            <span>Selected Interests</span>
                            <small>{totalOptions} available options</small>
                        </div>
                    </section>

                    <section className={styles.searchCard}>
                        <Search size={21} strokeWidth={2.3} aria-hidden="true" />

                        <input
                            type="search"
                            placeholder="Search sports, clubs, leagues or competitions..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                        />
                    </section>

                    <div className={styles.interestSections}>
                        {filteredGroups.map((group) => {
                            const GroupIcon = group.icon;

                            return (
                                <section className={styles.interestSection} key={group.id}>
                                    <div className={styles.sectionIntro}>
                                        <span>
                                            <GroupIcon size={24} strokeWidth={2.4} aria-hidden="true" />
                                        </span>

                                        <div>
                                            <h2>{group.title}</h2>
                                            <p>{group.description}</p>
                                        </div>
                                    </div>

                                    <div className={styles.optionGrid}>
                                        {group.options.map((option) => {
                                            const isSelected = selectedIds.includes(option.id);

                                            return (
                                                <button
                                                    type="button"
                                                    className={`${styles.preferenceCard} ${isSelected ? styles.preferenceCardSelected : ""
                                                        } ${styles[option.tone]}`}
                                                    key={option.id}
                                                    onClick={() => toggleInterest(option.id)}
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
                        })}
                    </div>
                </main>

                <aside className={styles.sideColumn}>
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
                            <label className={styles.toggleRow}>
                                <span>
                                    <strong>Prioritize followed clubs</strong>
                                    <small>Show followed clubs before general sports news.</small>
                                </span>

                                <input type="checkbox" defaultChecked />
                            </label>

                            <label className={styles.toggleRow}>
                                <span>
                                    <strong>Show sponsor offers</strong>
                                    <small>Include relevant sponsor offers and discounts.</small>
                                </span>

                                <input type="checkbox" defaultChecked />
                            </label>

                            <label className={styles.toggleRow}>
                                <span>
                                    <strong>Community league updates</strong>
                                    <small>Include Budo, SMACK, Ntare and other leagues.</small>
                                </span>

                                <input type="checkbox" defaultChecked />
                            </label>
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

                                    <input type="checkbox" defaultChecked={preference.enabled} />
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
                            <h2>Your preferences are saved locally for now.</h2>
                            <p>
                                Backend integration will later save these choices to your fan
                                profile.
                            </p>
                        </div>

                        <button type="button">Save Preferences</button>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default ProfileInterestsPage;