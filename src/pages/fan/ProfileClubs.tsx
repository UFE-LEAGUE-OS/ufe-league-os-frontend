import {
    Bell,
    CalendarDays,
    Check,
    Crown,
    Heart,
    Plus,
    Search,
    ShieldCheck,
    Star,
    Ticket,
    Trophy,
    Users,
    X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./MyClubsPage.module.css";

interface Club {
    id: string;
    slug: string;
    name: string;
    sport: "Rugby" | "Football" | "Basketball";
    type: string;
    logo: string;
    members: string;
    membership: string;
    nextMatch?: string;
    reason?: string;
}

interface Membership {
    id: string;
    slug: string;
    clubName: string;
    tier: string;
    sport: string;
    status: string;
    validUntil: string;
    renewal: string;
    logo: string;
    tone: "purple" | "blue" | "orange" | "green";
    benefits: string[];
}

interface ClubMatch {
    id: string;
    club: string;
    opponent: string;
    competition: string;
    date: string;
    time: string;
    venue: string;
    logo: string;
}

const initialFollowedClubs: Club[] = [
    {
        id: "kobs",
        slug: "kobs",
        name: "KCB KOBS",
        sport: "Rugby",
        type: "Rugby Club",
        logo: "/assets/clubs/kobs.jpg",
        members: "12.4K fans",
        membership: "Gold Member",
        nextMatch: "vs Heathens RFC",
    },
    {
        id: "sc-villa",
        slug: "sc-villa",
        name: "SC Villa",
        sport: "Football",
        type: "Football Club",
        logo: "/assets/clubs/sc-villa.png",
        members: "45.1K fans",
        membership: "Silver Member",
        nextMatch: "vs Vipers SC",
    },
    {
        id: "city-oilers",
        slug: "city-oilers",
        name: "City Oilers",
        sport: "Basketball",
        type: "Basketball Club",
        logo: "/assets/clubs/city-oilers.png",
        members: "8.7K fans",
        membership: "Not a member",
        nextMatch: "vs Namuwongo Blazers",
    },
    {
        id: "vipers",
        slug: "vipers-sc",
        name: "Vipers SC",
        sport: "Football",
        type: "Football Club",
        logo: "/assets/clubs/vipers-sc.png",
        members: "39.8K fans",
        membership: "Not a member",
    },
    {
        id: "black-pirates",
        slug: "black-pirates",
        name: "Black Pirates",
        sport: "Rugby",
        type: "Rugby Club",
        logo: "/assets/clubs/black-pirates.png",
        members: "10.2K fans",
        membership: "Not a member",
    },
    {
        id: "kcca",
        slug: "kcca-fc",
        name: "KCCA FC",
        sport: "Football",
        type: "Football Club",
        logo: "/assets/clubs/kcca-fc.png",
        members: "33.6K fans",
        membership: "Not a member",
    },
];

const activeMemberships: Membership[] = [
    {
        id: "kobs-gold",
        slug: "kobs",
        clubName: "KCB KOBS",
        tier: "Gold Member",
        sport: "Rugby Club",
        status: "Active",
        validUntil: "18 May 2026",
        renewal: "Auto-renew off",
        logo: "/assets/clubs/kobs.jpg",
        tone: "purple",
        benefits: [
            "10% ticket discount",
            "Priority derby tickets",
            "Club shop discount",
            "Member-only events",
        ],
    },
    {
        id: "villa-silver",
        slug: "sc-villa",
        clubName: "SC Villa",
        tier: "Silver Member",
        sport: "Football Club",
        status: "Active",
        validUntil: "12 Aug 2025",
        renewal: "Renewal due in 54 days",
        logo: "/assets/clubs/sc-villa.png",
        tone: "blue",
        benefits: [
            "Matchday ticket discount",
            "Digital membership card",
            "Club news alerts",
            "Fan events access",
        ],
    },
];

const upcomingClubMatches: ClubMatch[] = [
    {
        id: "kobs-heathens",
        club: "KCB KOBS",
        opponent: "Heathens RFC",
        competition: "Nile Special Rugby Premiership",
        date: "Sat, 18 May",
        time: "4:00 PM",
        venue: "Kings Park Stadium",
        logo: "/assets/clubs/kobs.jpg",
    },
    {
        id: "villa-vipers",
        club: "SC Villa",
        opponent: "Vipers SC",
        competition: "Uganda Premier League",
        date: "Sun, 19 May",
        time: "4:00 PM",
        venue: "Mandela National Stadium",
        logo: "/assets/clubs/sc-villa.png",
    },
    {
        id: "oilers-blazers",
        club: "City Oilers",
        opponent: "Namuwongo Blazers",
        competition: "National Basketball League",
        date: "Wed, 22 May",
        time: "7:00 PM",
        venue: "Lugogo Indoor Arena",
        logo: "/assets/clubs/city-oilers.png",
    },
];

const recommendedClubs: Club[] = [
    {
        id: "heathens",
        slug: "heathens",
        name: "Platinum Credit Heathens",
        sport: "Rugby",
        type: "Rugby Club",
        reason: "Popular with rugby fans",
        logo: "/assets/clubs/platinum-heathens.jpg",
        members: "11.1K fans",
        membership: "Not a member",
    },
    {
        id: "namuwongo-blazers",
        slug: "namuwongo-blazers",
        name: "Namuwongo Blazers",
        sport: "Basketball",
        type: "Basketball Club",
        reason: "You follow basketball",
        logo: "/assets/clubs/namuwongo-blazers.png",
        members: "6.4K fans",
        membership: "Not a member",
    },
    {
        id: "express",
        slug: "express-fc",
        name: "Express FC",
        sport: "Football",
        type: "Football Club",
        reason: "Trending in football",
        logo: "/assets/clubs/express-fc.png",
        members: "28.7K fans",
        membership: "Not a member",
    },
];

const sportFilters = ["All", "Rugby", "Football", "Basketball"] as const;

function MyClubsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSportFilter, setActiveSportFilter] =
        useState<(typeof sportFilters)[number]>("All");
    const [followedClubs, setFollowedClubs] = useState(initialFollowedClubs);
    const [dismissedRecommendationIds, setDismissedRecommendationIds] = useState<string[]>([]);

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const filteredFollowedClubs = useMemo(() => {
        return followedClubs.filter((club) => {
            const matchesSport =
                activeSportFilter === "All" || club.sport === activeSportFilter;

            const searchableText = `${club.name} ${club.type} ${club.membership} ${club.sport}`;

            const matchesSearch =
                !normalizedSearchQuery ||
                searchableText.toLowerCase().includes(normalizedSearchQuery);

            return matchesSport && matchesSearch;
        });
    }, [activeSportFilter, followedClubs, normalizedSearchQuery]);

    const visibleRecommendations = recommendedClubs.filter(
        (club) =>
            !followedClubs.some((followedClub) => followedClub.id === club.id) &&
            !dismissedRecommendationIds.includes(club.id),
    );

    const summaryCards = [
        {
            label: "Followed Clubs",
            value: String(followedClubs.length),
            detail: "Across 3 sports",
            icon: ShieldCheck,
            tone: "purple",
        },
        {
            label: "Active Club Memberships",
            value: String(activeMemberships.length),
            detail: "Digital cards ready",
            icon: Crown,
            tone: "orange",
        },
        {
            label: "Upcoming Club Matches",
            value: String(upcomingClubMatches.length),
            detail: "Next 7 days",
            icon: CalendarDays,
            tone: "blue",
        },
        {
            label: "Saved Benefits",
            value: "8",
            detail: "Ready to use",
            icon: Star,
            tone: "green",
        },
    ];

    function followRecommendedClub(club: Club) {
        setFollowedClubs((currentClubs) => [
            ...currentClubs,
            {
                ...club,
                membership: "Not a member",
            },
        ]);

        setDismissedRecommendationIds((currentIds) => [...currentIds, club.id]);
    }

    function unfollowClub(clubId: string) {
        setFollowedClubs((currentClubs) =>
            currentClubs.filter((club) => club.id !== clubId),
        );
    }

    function clearSearch() {
        setSearchQuery("");
        setActiveSportFilter("All");
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>My Clubs</h1>
                    <p>
                        Follow clubs, manage club memberships, track matches and use
                        club-specific fan benefits.
                    </p>
                </div>

                <Link to="/clubs" className={styles.primaryHeaderAction}>
                    <Plus size={18} strokeWidth={2.4} aria-hidden="true" />
                    Explore Clubs
                </Link>
            </header>

            <section className={styles.explainerCard}>
                <span>
                    <Trophy size={34} strokeWidth={2.3} aria-hidden="true" />
                </span>

                <div>
                    <h2>Your Club Hub</h2>
                    <p>
                        This page summarizes the clubs you follow, active memberships,
                        upcoming fixtures, benefits and suggested clubs. Full discovery
                        still happens on the public Clubs page.
                    </p>
                </div>

                <Link to="/profile/interests">Manage Interests</Link>
            </section>

            <section className={styles.summaryGrid} aria-label="Club summary">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article
                            className={`${styles.summaryCard} ${styles[card.tone]}`}
                            key={card.label}
                        >
                            <div>
                                <p>{card.label}</p>
                                <strong>{card.value}</strong>
                                <span>{card.detail}</span>
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
                                <h2>Followed Clubs</h2>
                                <p>
                                    Clubs you follow affect your dashboard, news feed,
                                    fixtures and ticket alerts.
                                </p>
                            </div>

                            <Link to="/clubs">View All Clubs</Link>
                        </div>

                        <div className={styles.clubToolbar}>
                            <div className={styles.searchCard}>
                                <Search size={20} strokeWidth={2.3} aria-hidden="true" />

                                <input
                                    type="search"
                                    placeholder="Search your followed clubs..."
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                />

                                {searchQuery ? (
                                    <button type="button" onClick={() => setSearchQuery("")}>
                                        <X size={17} strokeWidth={2.4} />
                                    </button>
                                ) : null}
                            </div>

                            <div className={styles.filterPills}>
                                {sportFilters.map((filter) => (
                                    <button
                                        type="button"
                                        key={filter}
                                        className={
                                            activeSportFilter === filter
                                                ? styles.activeFilterPill
                                                : ""
                                        }
                                        onClick={() => setActiveSportFilter(filter)}
                                    >
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredFollowedClubs.length > 0 ? (
                            <div className={styles.clubGrid}>
                                {filteredFollowedClubs.map((club) => (
                                    <article className={styles.clubCard} key={club.id}>
                                        <div className={styles.clubLogoWrap}>
                                            <img src={club.logo} alt="" aria-hidden="true" />
                                        </div>

                                        <div>
                                            <h3>{club.name}</h3>
                                            <p>{club.type}</p>
                                            <span>{club.members}</span>
                                        </div>

                                        <div className={styles.clubMembershipStatus}>
                                            {club.membership === "Not a member" ? (
                                                <span className={styles.notMember}>
                                                    Not a member
                                                </span>
                                            ) : (
                                                <span className={styles.memberBadge}>
                                                    {club.membership}
                                                </span>
                                            )}
                                        </div>

                                        {club.nextMatch ? (
                                            <small className={styles.nextMatch}>
                                                Next: {club.nextMatch}
                                            </small>
                                        ) : null}

                                        <div className={styles.clubActions}>
                                            <Link to={`/clubs/${club.slug}`}>View Club</Link>

                                            {club.membership === "Not a member" ? (
                                                <Link to={`/memberships/${club.slug}`}>
                                                    Join Club
                                                </Link>
                                            ) : (
                                                <Link to="/dashboard/memberships">
                                                    View Membership
                                                </Link>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => unfollowClub(club.id)}
                                            >
                                                Unfollow
                                            </button>
                                        </div>
                                    </article>
                                ))}

                                <Link to="/clubs" className={styles.followMoreClubCard}>
                                    <span>
                                        <Plus size={34} strokeWidth={2.4} aria-hidden="true" />
                                    </span>

                                    <div>
                                        <h3>Follow More Clubs</h3>
                                        <p>Discover clubs, teams and leagues to personalize your dashboard.</p>
                                    </div>

                                    <strong>Browse Clubs →</strong>
                                </Link>
                            </div>
                        ) : (
                            <section className={styles.emptyState}>
                                <Heart size={38} strokeWidth={2.2} aria-hidden="true" />
                                <h2>No clubs match your filters</h2>
                                <p>
                                    Try a different sport, clear your search, or browse all
                                    clubs to follow more teams.
                                </p>

                                <div>
                                    <button type="button" onClick={clearSearch}>
                                        Clear Filters
                                    </button>
                                    <Link to="/clubs">Browse Clubs</Link>
                                </div>
                            </section>
                        )}
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Active Club Memberships</h2>
                                <p>
                                    Memberships you have purchased from clubs through League OS.
                                </p>
                            </div>

                            <Link to="/memberships">View Club Memberships</Link>
                        </div>

                        {activeMemberships.length > 0 ? (
                            <div className={styles.membershipList}>
                                {activeMemberships.map((membership) => (
                                    <article
                                        className={`${styles.membershipCard} ${styles[membership.tone]}`}
                                        key={membership.id}
                                    >
                                        <div className={styles.membershipTop}>
                                            <img src={membership.logo} alt="" aria-hidden="true" />

                                            <div>
                                                <h3>{membership.clubName}</h3>
                                                <p>{membership.sport}</p>
                                            </div>

                                            <span>{membership.status}</span>
                                        </div>

                                        <div className={styles.membershipTier}>
                                            <Crown
                                                size={30}
                                                strokeWidth={2.2}
                                                aria-hidden="true"
                                            />

                                            <div>
                                                <strong>{membership.tier}</strong>
                                                <p>Valid until {membership.validUntil}</p>
                                                <small>{membership.renewal}</small>
                                            </div>
                                        </div>

                                        <div className={styles.benefitList}>
                                            {membership.benefits.map((benefit) => (
                                                <span key={benefit}>{benefit}</span>
                                            ))}
                                        </div>

                                        <div className={styles.membershipActions}>
                                            <Link to="/dashboard/memberships">View Card</Link>
                                            <Link to={`/memberships/${membership.slug}`}>
                                                Renew / Upgrade
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <section className={styles.emptyState}>
                                <Crown size={38} strokeWidth={2.2} aria-hidden="true" />
                                <h2>No active memberships yet</h2>
                                <p>
                                    Join a club membership to unlock benefits, ticket discounts
                                    and digital membership cards.
                                </p>
                                <Link to="/memberships">Explore Memberships</Link>
                            </section>
                        )}
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Upcoming Club Matches</h2>
                                <p>Matches involving your followed clubs.</p>
                            </div>

                            <Link to="/fixtures">View All</Link>
                        </div>

                        <div className={styles.matchList}>
                            {upcomingClubMatches.map((match) => (
                                <article className={styles.matchItem} key={match.id}>
                                    <img src={match.logo} alt="" aria-hidden="true" />

                                    <div>
                                        <h3>
                                            {match.club} <span>vs</span> {match.opponent}
                                        </h3>
                                        <p>{match.competition}</p>
                                        <small>
                                            {match.date} • {match.time}
                                        </small>
                                        <small>{match.venue}</small>
                                    </div>

                                    <div className={styles.matchActions}>
                                        <Link to="/tickets">
                                            <Ticket
                                                size={16}
                                                strokeWidth={2.2}
                                                aria-hidden="true"
                                            />
                                            Tickets
                                        </Link>

                                        <button
                                            type="button"
                                            aria-label={`Set alert for ${match.club}`}
                                        >
                                            <Bell size={17} strokeWidth={2.2} />
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Recommended Clubs</h2>
                                <p>Based on your sports and followed teams.</p>
                            </div>
                        </div>

                        {visibleRecommendations.length > 0 ? (
                            <div className={styles.recommendedList}>
                                {visibleRecommendations.map((club) => (
                                    <article className={styles.recommendedItem} key={club.id}>
                                        <img src={club.logo} alt="" aria-hidden="true" />

                                        <div>
                                            <h3>{club.name}</h3>
                                            <p>{club.type}</p>
                                            <small>
                                                {club.reason ?? "Recommended"}
                                            </small>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => followRecommendedClub(club)}
                                        >
                                            <Heart
                                                size={17}
                                                strokeWidth={2.3}
                                                aria-hidden="true"
                                            />
                                            Follow
                                        </button>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <section className={styles.compactEmptyState}>
                                <Check size={28} strokeWidth={2.4} aria-hidden="true" />
                                <h3>You are all caught up</h3>
                                <p>No new recommendations for now.</p>
                            </section>
                        )}
                    </section>

                    <section className={styles.clubSupportCard}>
                        <Users size={48} strokeWidth={2.2} aria-hidden="true" />

                        <div>
                            <h2>Support your club directly</h2>
                            <p>
                                Club membership payments should go to the club or its approved
                                payment account. League OS manages the fan experience and the
                                membership record.
                            </p>
                        </div>

                        <Link to="/memberships">Compare Club Tiers →</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default MyClubsPage;
