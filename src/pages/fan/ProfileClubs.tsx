import {
    Bell,
    CalendarDays,
    Crown,
    Heart,
    Plus,
    Search,
    ShieldCheck,
    Star,
    Ticket,
    Trophy,
    Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./MyClubsPage.module.css";

const summaryCards = [
    {
        label: "Followed Clubs",
        value: "6",
        detail: "Across 3 sports",
        icon: ShieldCheck,
        tone: "purple",
    },
    {
        label: "Active Club Memberships",
        value: "2",
        detail: "KOBS & SC Villa",
        icon: Crown,
        tone: "orange",
    },
    {
        label: "Upcoming Club Matches",
        value: "3",
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

const activeMemberships = [
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

const followedClubs = [
    {
        id: "kobs",
        slug: "kobs",
        name: "KCB KOBS",
        sport: "Rugby Club",
        logo: "/assets/clubs/kobs.jpg",
        members: "12.4K fans",
        membership: "Gold Member",
    },
    {
        id: "sc-villa",
        slug: "sc-villa",
        name: "SC Villa",
        sport: "Football Club",
        logo: "/assets/clubs/sc-villa.png",
        members: "45.1K fans",
        membership: "Silver Member",
    },
    {
        id: "city-oilers",
        slug: "city-oilers",
        name: "City Oilers",
        sport: "Basketball Club",
        logo: "/assets/clubs/city-oilers.png",
        members: "8.7K fans",
        membership: "Not a member",
    },
    {
        id: "vipers",
        slug: "vipers-sc",
        name: "Vipers SC",
        sport: "Football Club",
        logo: "/assets/clubs/vipers-sc.png",
        members: "39.8K fans",
        membership: "Not a member",
    },
    {
        id: "black-pirates",
        slug: "black-pirates",
        name: "Black Pirates",
        sport: "Rugby Club",
        logo: "/assets/clubs/black-pirates.png",
        members: "10.2K fans",
        membership: "Not a member",
    },
    {
        id: "kcca",
        slug: "kcca-fc",
        name: "KCCA FC",
        sport: "Football Club",
        logo: "/assets/clubs/kcca-fc.png",
        members: "33.6K fans",
        membership: "Not a member",
    },
];

const upcomingClubMatches = [
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

const recommendedClubs = [
    {
        id: "heathens",
        name: "Platinum Credit Heathens",
        sport: "Rugby Club",
        reason: "Popular with rugby fans",
        logo: "/assets/clubs/platinum-heathens.jpg",
    },
    {
        id: "namuwongo-blazers",
        name: "Namuwongo Blazers",
        sport: "Basketball Club",
        reason: "You follow basketball",
        logo: "/assets/clubs/namuwongo-blazers.png",
    },
    {
        id: "express",
        name: "Express FC",
        sport: "Football Club",
        reason: "Trending in football",
        logo: "/assets/clubs/express-fc.png",
    },
];

function MyClubsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const filteredFollowedClubs = useMemo(() => {
        if (!normalizedSearchQuery) {
            return followedClubs;
        }

        return followedClubs.filter((club) => {
            const searchableText = `${club.name} ${club.sport} ${club.membership}`;

            return searchableText.toLowerCase().includes(normalizedSearchQuery);
        });
    }, [normalizedSearchQuery]);

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
                    <h2>How club memberships work</h2>
                    <p>
                        Club memberships are created and managed by clubs. League OS helps
                        fans discover club tiers, purchase memberships, store digital
                        membership cards, receive club benefits and renew when needed.
                    </p>
                </div>

                <Link to="/memberships">Explore Club Memberships</Link>
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
                                <h2>Active Club Memberships</h2>
                                <p>
                                    These are memberships you have purchased from clubs through
                                    League OS.
                                </p>
                            </div>

                            <Link to="/memberships">View Club Memberships</Link>
                        </div>

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
                                        <Crown size={30} strokeWidth={2.2} aria-hidden="true" />

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
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Followed Clubs</h2>
                                <p>
                                    Clubs you follow affect your dashboard, news feed, fixtures
                                    and ticket alerts.
                                </p>
                            </div>

                            <Link to="/profile/interests">Manage Interests</Link>
                        </div>

                        <div className={styles.searchCard}>
                            <Search size={20} strokeWidth={2.3} aria-hidden="true" />

                            <input
                                type="search"
                                placeholder="Search your followed clubs..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </div>

                        <div className={styles.clubGrid}>
                            {filteredFollowedClubs.map((club) => (
                                <article className={styles.clubCard} key={club.id}>
                                    <div className={styles.clubLogoWrap}>
                                        <img src={club.logo} alt="" aria-hidden="true" />
                                    </div>

                                    <div>
                                        <h3>{club.name}</h3>
                                        <p>{club.sport}</p>
                                        <span>{club.members}</span>
                                    </div>

                                    <div className={styles.clubMembershipStatus}>
                                        {club.membership === "Not a member" ? (
                                            <span className={styles.notMember}>Not a member</span>
                                        ) : (
                                            <span className={styles.memberBadge}>
                                                {club.membership}
                                            </span>
                                        )}
                                    </div>

                                    <div className={styles.clubActions}>
                                        <Link to="/clubs">View Club</Link>

                                        {club.membership === "Not a member" ? (
                                            <Link to={`/memberships/${club.slug}`}>Join Club</Link>
                                        ) : (
                                            <Link to="/dashboard/memberships">
                                                View Membership
                                            </Link>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
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
                                            <Ticket size={16} strokeWidth={2.2} aria-hidden="true" />
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

                        <div className={styles.recommendedList}>
                            {recommendedClubs.map((club) => (
                                <article className={styles.recommendedItem} key={club.id}>
                                    <img src={club.logo} alt="" aria-hidden="true" />

                                    <div>
                                        <h3>{club.name}</h3>
                                        <p>{club.sport}</p>
                                        <small>{club.reason}</small>
                                    </div>

                                    <button type="button">
                                        <Heart size={17} strokeWidth={2.3} aria-hidden="true" />
                                        Follow
                                    </button>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className={styles.clubSupportCard}>
                        <Users size={48} strokeWidth={2.2} aria-hidden="true" />

                        <div>
                            <h2>Support your club directly</h2>
                            <p>
                                Club membership payments should go to the club or its approved
                                payment account. League OS only manages the experience and
                                records the membership.
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