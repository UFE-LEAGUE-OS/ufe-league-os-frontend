import {
    Bell,
    CalendarDays,
    Crown,
    LogOut,
    QrCode,
    Settings2,
    Star,
    Ticket,
    Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useAuth } from "../../hooks/useAuth";
import DashboardEmptyState from "../../components/DashboardEmptyState/DashboardEmptyState";
import styles from "./FanDashboardPage.module.css";

const summaryCards = [
    {
        label: "My Memberships",
        value: "2",
        detail: "Active",
        icon: Crown,
        tone: "purple",
    },
    {
        label: "Upcoming Matches",
        value: "4",
        detail: "Next 7 Days",
        icon: CalendarDays,
        tone: "blue",
    },
    {
        label: "Tickets",
        value: "1",
        detail: "Upcoming",
        icon: Ticket,
        tone: "purple",
    },
    {
        label: "Reward Points",
        value: "1,250",
        detail: "Total Points",
        icon: Star,
        tone: "orange",
    },
    {
        label: "Following",
        value: "4",
        detail: "Clubs / Teams",
        icon: Users,
        tone: "blue",
    },
];

const upcomingMatches = [
    {
        id: "kobs-heathens",
        home: "KCB KOBS",
        away: "Heathens RFC",
        sport: "Rugby",
        date: "Sat, 18 May 2025",
        time: "4:00 PM",
        venue: "Kings Park Stadium, Kampala",
        homeLogo: "/assets/clubs/kobs.jpg",
        awayLogo: "/assets/clubs/platinum-heathens.jpg",
    },
    {
        id: "villa-vipers",
        home: "SC Villa",
        away: "Vipers SC",
        sport: "Football",
        date: "Sun, 19 May 2025",
        time: "4:00 PM",
        venue: "Mandela National Stadium",
        homeLogo: "/assets/clubs/sc-villa.png",
        awayLogo: "/assets/clubs/vipers-sc.png",
    },
    {
        id: "kobs-women-buffaloes",
        home: "KOBS Women",
        away: "Toyota Buffaloes",
        sport: "Rugby",
        date: "Mon, 20 May 2025",
        time: "3:00 PM",
        venue: "Kings Park Stadium, Kampala",
        homeLogo: "/assets/clubs/kobs.jpg",
        awayLogo: "/assets/clubs/buffaloes.png",
    },
    {
        id: "pirates-hippos",
        home: "Black Pirates",
        away: "Jinja Hippos",
        sport: "Rugby",
        date: "Wed, 22 May 2025",
        time: "4:30 PM",
        venue: "Kings Park Arena, Bweyogerere",
        homeLogo: "/assets/clubs/black-pirates.png",
        awayLogo: "/assets/clubs/jinja-hippos.png",
    },
];

const followedClubs = [
    {
        id: "kobs",
        name: "KCB KOBS",
        sport: "Rugby Club",
        logo: "/assets/clubs/kobs.jpg",
    },
    {
        id: "sc-villa",
        name: "SC Villa",
        sport: "Football Club",
        logo: "/assets/clubs/sc-villa.png",
    },
    {
        id: "city-oilers",
        name: "City Oilers",
        sport: "Basketball Club",
        logo: "/assets/clubs/city-oilers.png",
    },
    {
        id: "kobs-women",
        name: "KOBS Women",
        sport: "Rugby Team",
        logo: "/assets/clubs/kobs.jpg",
    },
];

const latestNews = [
    {
        id: "kobs-transfer",
        category: "Transfer",
        title: "KCB KOBS sign new forward in record-breaking deal",
        time: "2 hours ago",
        image: "/assets/news/transfer-news.png",
    },
    {
        id: "villa-win",
        category: "Match Report",
        title: "SC Villa secure crucial win in five-goal thriller",
        time: "5 hours ago",
        image: "/assets/news/oilers-preview.png",
    },
    {
        id: "city-oilers-kit",
        category: "Announcement",
        title: "City Oilers unveil new kit for the upcoming season",
        time: "1 day ago",
        image: "/assets/news/stadium-news.png",
    },
    {
        id: "league-super-cup",
        category: "Preview",
        title: "Super Cup weekend set to open the new community league calendar",
        time: "2 days ago",
        image: "/assets/news/super-cup.png",
    },
];

const memberships = [
    {
        id: "kobs-membership",
        club: "KCB KOBS",
        sport: "Rugby Club",
        validUntil: "18 May 2026",
        logo: "/assets/clubs/kobs.jpg",
    },
    {
        id: "villa-membership",
        club: "SC Villa",
        sport: "Football Club",
        validUntil: "12 Aug 2025",
        logo: "/assets/clubs/sc-villa.png",
    },
];

const activeTicket = {
    competition: "Nile Special Rugby Premiership",
    home: "KCB KOBS",
    away: "Heathens RFC",
    date: "Sat, 18 May 2025",
    time: "4:00 PM",
    venue: "Kings Park Stadium",
    stand: "Regular Stand",
    gate: "Gate B",
    row: "Row 12",
    seat: "Seat 23",
};

function FanDashboardPage() {
    const { currentUser } = useCurrentUser();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const [isCompactView, setIsCompactView] = useState(false);

    const matchSlots = Array.from({ length: 4 }, (_, index) => upcomingMatches[index] ?? null);
    const clubSlots = Array.from({ length: 4 }, (_, index) => followedClubs[index] ?? null);
    const newsSlots = Array.from({ length: 4 }, (_, index) => latestNews[index] ?? null);
    const membershipSlots = Array.from({ length: 2 }, (_, index) => memberships[index] ?? null);

    function handleLogout() {
        logout();
        navigate("/login", {
            replace: true,
            state: {
                message: "You have been logged out.",
            },
        });
    }

    return (
        <section className={`${styles.page} ${isCompactView ? styles.compactPage : ""}`}>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Welcome back, {currentUser.name.split(" ")[0]}!</h1>
                    <p>Here&apos;s what&apos;s happening in your world.</p>
                </div>

                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={`${styles.customizeButton} ${isCustomizeOpen ? styles.activeCustomizeButton : ""
                            }`}
                        onClick={() => setIsCustomizeOpen((currentValue) => !currentValue)}
                        aria-expanded={isCustomizeOpen}
                        aria-controls="dashboard-customize-panel"
                    >
                        <Settings2 size={18} strokeWidth={2.3} aria-hidden="true" />
                        Customize Dashboard
                    </button>

                    <button
                        type="button"
                        className={`${styles.customizeButton} ${styles.logoutButton}`}
                        onClick={handleLogout}
                    >
                        <LogOut size={18} strokeWidth={2.3} aria-hidden="true" />
                        Logout
                    </button>
                </div>
            </div>

            {isCustomizeOpen && (
                <div className={styles.customizePanel} id="dashboard-customize-panel">
                    <div>
                        <h2>Customize Dashboard</h2>
                        <p>
                            Adjust your dashboard view for easier scanning. We can later persist
                            these preferences to the backend.
                        </p>
                    </div>

                    <label className={styles.customizeOption}>
                        <input
                            type="checkbox"
                            checked={isCompactView}
                            onChange={(event) => setIsCompactView(event.target.checked)}
                        />
                        Use compact dashboard cards
                    </label>

                    <div className={styles.customizeLinks}>
                        <Link to="/profile/clubs">Manage followed clubs</Link>
                        <Link to="/profile/notifications">Notification preferences</Link>
                    </div>
                </div>
            )}

            <div className={styles.summaryGrid}>
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
            </div>

            <div className={styles.mainGrid}>
                <section className={`${styles.panel} ${styles.matchesPanel}`}>
                    <div className={styles.panelHeader}>
                        <h2>Upcoming Matches</h2>
                        <Link to="/fixtures">View All</Link>
                    </div>

                    <div className={styles.matchList}>
                        {matchSlots.map((match, index) =>
                            match ? (
                                <article
                                    className={styles.matchItem}
                                    key={match.id}
                                    tabIndex={0}
                                >
                                    <div className={styles.matchTeams}>
                                        <img src={match.homeLogo} alt="" aria-hidden="true" />

                                        <div>
                                            <h3>{match.home}</h3>
                                            <p>{match.sport}</p>
                                            <span>
                                                {match.date} • {match.time}
                                            </span>
                                            <small>{match.venue}</small>
                                        </div>

                                        <strong>VS</strong>

                                        <div className={styles.awayTeamBlock}>
                                            <img src={match.awayLogo} alt="" aria-hidden="true" />
                                            <small className={styles.awayTeamName}>{match.away}</small>
                                        </div>
                                    </div>

                                    <div className={styles.matchActions}>
                                        <Link to="/dashboard/tickets">Tickets</Link>
                                        <button
                                            type="button"
                                            aria-label={`Set alert for ${match.home}`}
                                        >
                                            <Bell size={18} strokeWidth={2.2} />
                                        </button>
                                    </div>
                                </article>
                            ) : (
                                <article
                                    className={`${styles.matchItem} ${styles.matchPlaceholder}`}
                                    key={`match-placeholder-${index}`}
                                >
                                    <div>
                                        <h3>Fixture slot open</h3>
                                        <p>New match details will appear here once published.</p>
                                    </div>

                                    <Link to="/fixtures">Browse Fixtures</Link>
                                </article>
                            )
                        )}
                    </div>

                    <Link to="/fixtures" className={styles.panelFooterLink}>
                        View Full Fixtures →
                    </Link>
                </section>

                <section className={`${styles.panel} ${styles.clubsPanel}`}>
                    <div className={styles.panelHeader}>
                        <h2>My Clubs &amp; Teams</h2>
                        <Link to="/profile/clubs">View All</Link>
                    </div>

                    <div className={styles.clubGrid}>
                        {clubSlots.map((club, index) =>
                            club ? (
                                <Link to="/clubs" className={styles.clubCard} key={club.id}>
                                    <span>
                                        <img src={club.logo} alt="" aria-hidden="true" />
                                    </span>

                                    <strong>{club.name}</strong>
                                    <small>{club.sport}</small>
                                </Link>
                            ) : (
                                <Link
                                    to="/clubs"
                                    className={`${styles.clubCard} ${styles.clubPlaceholder}`}
                                    key={`club-placeholder-${index}`}
                                >
                                    <span>+</span>
                                    <strong>Follow a club</strong>
                                    <small>Personalize your dashboard</small>
                                </Link>
                            )
                        )}
                    </div>

                    <p className={styles.helperText}>
                        Follow more clubs and teams to get personalized updates.
                    </p>

                    <Link to="/clubs" className={styles.outlineAction}>
                        Explore Clubs →
                    </Link>
                </section>

                <section className={`${styles.panel} ${styles.newsPanel}`}>
                    <div className={styles.panelHeader}>
                        <h2>Latest News</h2>
                        <Link to="/news">View All</Link>
                    </div>

                    <div className={styles.newsList}>
                        {newsSlots.map((news, index) =>
                            news ? (
                                <Link to="/news" className={styles.newsItem} key={news.id}>
                                    <img src={news.image} alt="" aria-hidden="true" />

                                    <div>
                                        <span>{news.category}</span>
                                        <h3>{news.title}</h3>
                                        <p>{news.time}</p>
                                    </div>
                                </Link>
                            ) : (
                                <Link
                                    to="/news"
                                    className={`${styles.newsItem} ${styles.newsPlaceholder}`}
                                    key={`news-placeholder-${index}`}
                                >
                                    <div className={styles.newsPlaceholderImage}>📰</div>

                                    <div>
                                        <span>Update pending</span>
                                        <h3>More club and league news will appear here.</h3>
                                        <p>Check back soon</p>
                                    </div>
                                </Link>
                            )
                        )}
                    </div>
                </section>

                <section className={`${styles.panel} ${styles.membershipsPanel}`}>
                    <div className={styles.panelHeader}>
                        <h2>My Memberships</h2>
                        <Link to="/dashboard/memberships">View All</Link>
                    </div>

                    <div className={styles.membershipList}>
                        {membershipSlots.map((membership, index) =>
                            membership ? (
                                <article className={styles.membershipItem} key={membership.id}>
                                    <img src={membership.logo} alt="" aria-hidden="true" />

                                    <div>
                                        <h3>{membership.club}</h3>
                                        <p>{membership.sport}</p>
                                    </div>

                                    <span>
                                        Valid Until
                                        <strong>{membership.validUntil}</strong>
                                    </span>

                                    <Link to="/dashboard/memberships">View Card</Link>
                                </article>
                            ) : (
                                <article
                                    className={`${styles.membershipItem} ${styles.membershipPlaceholder}`}
                                    key={`membership-placeholder-${index}`}
                                >
                                    <div className={styles.membershipPlaceholderIcon}>♕</div>

                                    <div>
                                        <h3>No membership yet</h3>
                                        <p>Join a club to unlock benefits.</p>
                                    </div>

                                    <Link to="/memberships">Explore</Link>
                                </article>
                            )
                        )}
                    </div>

                    <Link to="/dashboard/memberships" className={styles.panelFooterLink}>
                        Manage Memberships →
                    </Link>
                </section>

                <section className={`${styles.panel} ${styles.ticketPanel}`}>
                    <div className={styles.panelHeader}>
                        <h2>My Tickets</h2>
                        <Link to="/dashboard/tickets">View All</Link>
                    </div>

                    {activeTicket ? (
                        <div className={styles.ticketContent}>
                            <div>
                                <p>{activeTicket.competition}</p>
                                <h3>
                                    {activeTicket.home}
                                    <span>vs</span>
                                    {activeTicket.away}
                                </h3>
                                <p>
                                    {activeTicket.date} • {activeTicket.time}
                                </p>
                                <p>{activeTicket.venue}</p>
                            </div>

                            <div className={styles.qrTicket}>
                                <span>{activeTicket.stand}</span>
                                <strong>{activeTicket.gate}</strong>
                                <p>{activeTicket.row}</p>
                                <p>{activeTicket.seat}</p>
                                <div className={styles.fakeQr}>
                                    <QrCode size={68} strokeWidth={2.5} aria-hidden="true" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <DashboardEmptyState
                            icon="🎟"
                            title="No active tickets"
                            message="Your upcoming match tickets will appear here after purchase."
                            actionLabel="Buy Tickets"
                            actionTo="/tickets"
                            compact
                        />
                    )}

                    <Link to="/dashboard/tickets" className={styles.panelFooterLink}>
                        View All Tickets →
                    </Link>
                </section>
            </div>
        </section>
    );
}

export default FanDashboardPage;