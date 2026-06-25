import {
    Bell,
    CalendarDays,
    Crown,
    QrCode,
    Settings2,
    Star,
    Ticket,
    Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
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
        value: "3",
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

const benefits = [
    "10% Ticket Discounts",
    "Exclusive Content",
    "Early Access to Tickets",
    "Member Only Events",
];

function FanDashboardPage() {
    const { currentUser } = useCurrentUser();
    return (
        <section className={styles.page}>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Welcome back, {currentUser.name.split(" ")[0]}! 👋</h1>
                    <p>Here&apos;s what&apos;s happening in your world.</p>
                </div>

                <button type="button" className={styles.customizeButton}>
                    <Settings2 size={18} strokeWidth={2.3} aria-hidden="true" />
                    Customize Dashboard
                </button>
            </div>

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
                        {upcomingMatches.map((match) => (
                            <article className={styles.matchItem} key={match.id}>
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

                                    <img src={match.awayLogo} alt="" aria-hidden="true" />
                                </div>

                                <div className={styles.matchActions}>
                                    <Link to="/dashboard/tickets">Tickets</Link>
                                    <button type="button" aria-label={`Set alert for ${match.home}`}>
                                        <Bell size={18} strokeWidth={2.2} />
                                    </button>
                                </div>
                            </article>
                        ))}
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
                        {followedClubs.map((club) => (
                            <Link to="/clubs" className={styles.clubCard} key={club.id}>
                                <span>
                                    <img src={club.logo} alt="" aria-hidden="true" />
                                </span>

                                <strong>{club.name}</strong>
                                <small>{club.sport}</small>
                            </Link>
                        ))}
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
                        {latestNews.map((news) => (
                            <Link to="/news" className={styles.newsItem} key={news.id}>
                                <img src={news.image} alt="" aria-hidden="true" />

                                <div>
                                    <span>{news.category}</span>
                                    <h3>{news.title}</h3>
                                    <p>{news.time}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className={`${styles.panel} ${styles.membershipsPanel}`}>
                    <div className={styles.panelHeader}>
                        <h2>My Memberships</h2>
                        <Link to="/dashboard/memberships">View All</Link>
                    </div>

                    <div className={styles.membershipList}>
                        {memberships.map((membership) => (
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
                        ))}
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

                    <div className={styles.ticketContent}>
                        <div>
                            <p>Nile Special Rugby Premiership</p>
                            <h3>
                                KCB KOBS
                                <span>vs</span>
                                Heathens RFC
                            </h3>
                            <p>Sat, 18 May 2025 • 4:00 PM</p>
                            <p>Kings Park Stadium</p>
                        </div>

                        <div className={styles.qrTicket}>
                            <span>Regular Stand</span>
                            <strong>Gate B</strong>
                            <p>Row 12</p>
                            <p>Seat 23</p>
                            <div className={styles.fakeQr}>
                                <QrCode size={68} strokeWidth={2.5} aria-hidden="true" />
                            </div>
                        </div>
                    </div>

                    <Link to="/dashboard/tickets" className={styles.panelFooterLink}>
                        View All Tickets →
                    </Link>
                </section>

                <section className={`${styles.panel} ${styles.rewardsPanel}`}>
                    <div className={styles.panelHeader}>
                        <h2>Rewards &amp; Benefits</h2>
                        <Link to="/profile/clubs">View All</Link>
                    </div>

                    <div className={styles.rewardSummary}>
                        <Star size={40} strokeWidth={2.2} aria-hidden="true" />

                        <div>
                            <strong>1,250</strong>
                            <p>Total Points</p>
                        </div>

                        <div className={styles.rewardProgress}>
                            <span>Next Reward</span>
                            <strong>1,500 pts</strong>
                            <div>
                                <span />
                            </div>
                            <small>250 pts to go</small>
                        </div>
                    </div>

                    <div className={styles.benefitGrid}>
                        {benefits.map((benefit) => (
                            <span key={benefit}>{benefit}</span>
                        ))}
                    </div>

                    <Link to="/profile/clubs" className={styles.panelFooterLink}>
                        Explore All Benefits →
                    </Link>
                </section>
            </div>
        </section>
    );
}

export default FanDashboardPage;