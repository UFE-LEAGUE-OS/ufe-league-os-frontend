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
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useAuth } from "../../hooks/useAuth";
import DashboardEmptyState from "../../components/DashboardEmptyState/DashboardEmptyState";
import {
    createMyMembershipCard,
    getMyMembership,
    type BackendMembershipCard,
    type BackendMembershipSubscription,
} from "../../services/fanMembershipService";
import {
    getMyTickets,
    type TicketApi,
} from "../../services/ticketingService";
import {
    getFanWalletSummary,
    type BackendPaymentItem,
    type WalletSummary,
} from "../../services/fanPaymentService";
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

const dashboardSponsorPlacements = [
    {
        id: "nile-special-matchday",
        label: "Matchday Sponsor",
        sponsor: "Nile Special",
        headline: "Own the matchday moment",
        description:
            "Promote ticket bundles, fan offers and club experiences to rugby supporters.",
        cta: "View Sponsor Hub",
        to: "/sponsor/apply",
        tag: "Rugby",
    },
    {
        id: "kcb-club-membership",
        label: "Club Partner",
        sponsor: "KCB Bank",
        headline: "Power club memberships",
        description:
            "Feature membership offers, supporter rewards and payment campaigns.",
        cta: "Explore Memberships",
        to: "/memberships",
        tag: "Memberships",
    },
    {
        id: "mtn-fan-engagement",
        label: "Fan Engagement",
        sponsor: "MTN Uganda",
        headline: "Reach fans beyond the stadium",
        description:
            "Use digital placements for offers, ticket reminders and matchday activations.",
        cta: "Open Tickets",
        to: "/tickets",
        tag: "Tickets",
    },
];



interface DashboardMembership {
    id: string;
    club: string;
    sport: string;
    tier: string;
    validUntil: string;
    memberNumber: string;
    qrCodeData: string;
    logo: string;
}

function formatDashboardMembershipDate(value?: string | null) {
    if (!value) {
        return "Date pending";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date pending";
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function normalizeDashboardMembershipTier(value?: string) {
    if (!value) {
        return "Member";
    }

    const cleanValue = value.replace(/_/g, " ").trim();

    return `${cleanValue.charAt(0).toUpperCase()}${cleanValue.slice(1).toLowerCase()} Member`;
}

function buildDashboardClubInitials(name: string) {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "LO"
    );
}

function mapBackendDashboardMembership(
    subscription: BackendMembershipSubscription,
    card?: BackendMembershipCard | null,
): DashboardMembership {
    const activeCard = card ?? subscription.card ?? null;
    const clubName = subscription.club_name || activeCard?.club_name || "Club Membership";
    const tierSource = activeCard?.tier || subscription.plan_name;
    const validUntil = activeCard?.valid_until || subscription.ends_at;

    return {
        id: String(subscription.id),
        club: clubName,
        sport: `${normalizeDashboardMembershipTier(tierSource)} • Club Membership`,
        tier: normalizeDashboardMembershipTier(tierSource),
        validUntil: formatDashboardMembershipDate(validUntil),
        memberNumber: activeCard?.card_number || `MEMBERSHIP-${subscription.id}`,
        qrCodeData: activeCard?.qr_code_data || `membership:${subscription.id}`,
        logo: "",
    };
}

function DashboardMembershipLogo({
    logo,
    club,
}: {
    logo: string;
    club: string;
}) {
    return logo ? (
        <img src={logo} alt="" aria-hidden="true" />
    ) : (
        <span className={styles.membershipClubMark}>
            {buildDashboardClubInitials(club)}
        </span>
    );
}

interface DashboardTicket {
    id: string;
    competition: string;
    title: string;
    home: string;
    away: string;
    date: string;
    time: string;
    venue: string;
    ticketType: string;
    status: string;
    ticketCode: string;
    orderId: string;
}

function parseDashboardTicketMatch(matchLabel: string) {
    const cleanLabel = matchLabel || "Match Ticket";
    const [matchTitle, rawDate] = cleanLabel.split(" - ");
    const teams = matchTitle.split(/\s+vs\s+/i);

    return {
        title: matchTitle.trim() || cleanLabel,
        rawDate: rawDate?.trim() || "",
        home: teams[0]?.trim() || "Home Team",
        away: teams[1]?.trim() || "Away Team",
    };
}

function formatDashboardTicketDate(rawDate: string, fallback?: string | null) {
    const dateValue = rawDate ? `${rawDate}T15:00:00` : fallback;

    if (!dateValue) {
        return {
            date: "Date pending",
            time: "Kickoff TBA",
        };
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return {
            date: "Date pending",
            time: "Kickoff TBA",
        };
    }

    return {
        date: date.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
        time: rawDate
            ? "Kickoff TBA"
            : date.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
              }),
    };
}

function normalizeDashboardTicketStatus(status: string) {
    const normalizedStatus = status.toUpperCase();

    if (normalizedStatus === "ACTIVE" || normalizedStatus === "ISSUED") {
        return "Confirmed";
    }

    if (normalizedStatus === "USED") {
        return "Used";
    }

    if (normalizedStatus === "CANCELLED") {
        return "Cancelled";
    }

    if (normalizedStatus === "REFUNDED") {
        return "Refunded";
    }

    if (normalizedStatus === "EXPIRED") {
        return "Expired";
    }

    return status || "Confirmed";
}

function shortenDashboardCode(value: string, startLength = 8, endLength = 6) {
    if (!value) {
        return "Pending";
    }

    if (value.length <= startLength + endLength + 3) {
        return value;
    }

    return `${value.slice(0, startLength)}...${value.slice(-endLength)}`;
}

function mapBackendDashboardTicket(ticket: TicketApi): DashboardTicket {
    const match = parseDashboardTicketMatch(ticket.match_label);
    const dateParts = formatDashboardTicketDate(match.rawDate, ticket.issued_at);

    return {
        id: String(ticket.id),
        competition: "League OS Ticketing",
        title: match.title,
        home: match.home,
        away: match.away,
        date: dateParts.date,
        time: dateParts.time,
        venue: "Venue to be confirmed",
        ticketType: ticket.ticket_type_name || "Match Ticket",
        status: normalizeDashboardTicketStatus(ticket.status),
        ticketCode: shortenDashboardCode(ticket.ticket_code),
        orderId: `#ORDER-${ticket.order}`,
    };
}

function selectDashboardTicket(tickets: TicketApi[]) {
    const upcomingStatuses = ["ACTIVE", "ISSUED"];
    const upcomingTicket = tickets.find((ticket) =>
        upcomingStatuses.includes(ticket.status.toUpperCase()),
    );

    return upcomingTicket ?? tickets[0] ?? null;
}

function formatDashboardCurrency(amount: string | number, currency = "UGX") {
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
        return `${currency} ${amount}`;
    }

    return new Intl.NumberFormat("en-UG", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(numericAmount);
}

function formatDashboardPaymentDate(value?: string | null) {
    if (!value) {
        return "Date pending";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date pending";
    }

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function normalizeDashboardPaymentStatus(status: string) {
    const normalizedStatus = status.toUpperCase();

    if (normalizedStatus === "COMPLETED" || normalizedStatus === "SUCCESSFUL") {
        return "successful";
    }

    if (normalizedStatus === "PENDING") {
        return "pending";
    }

    if (normalizedStatus === "FAILED") {
        return "failed";
    }

    if (normalizedStatus === "REFUNDED") {
        return "refunded";
    }

    return "pending";
}



function FanDashboardPage() {
    const { currentUser } = useCurrentUser();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
    const [isCompactView, setIsCompactView] = useState(false);
    const [sponsorPage, setSponsorPage] = useState(0);
    const [dashboardMemberships, setDashboardMemberships] = useState<DashboardMembership[]>([]);
    const [isLoadingMemberships, setIsLoadingMemberships] = useState(true);
    const [membershipError, setMembershipError] = useState("");
    const [dashboardTicket, setDashboardTicket] = useState<DashboardTicket | null>(null);
    const [isLoadingTickets, setIsLoadingTickets] = useState(true);
    const [ticketError, setTicketError] = useState("");
    const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);
    const [paymentError, setPaymentError] = useState("");

    const loadDashboardMemberships = useCallback(async () => {
        setIsLoadingMemberships(true);
        setMembershipError("");

        try {
            const subscription = await getMyMembership();

            if (!subscription) {
                setDashboardMemberships([]);
                return;
            }

            const card = subscription.card ?? (await createMyMembershipCard());

            setDashboardMemberships([
                mapBackendDashboardMembership(subscription, card),
            ]);
        } catch {
            setDashboardMemberships([]);
            setMembershipError(
                "We could not load your membership card. Confirm the backend is running and you are logged in.",
            );
        } finally {
            setIsLoadingMemberships(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboardMemberships();
    }, [loadDashboardMemberships]);

    const loadDashboardTickets = useCallback(async () => {
        setIsLoadingTickets(true);
        setTicketError("");

        try {
            const tickets = await getMyTickets();
            const selectedTicket = selectDashboardTicket(tickets);

            setDashboardTicket(
                selectedTicket ? mapBackendDashboardTicket(selectedTicket) : null,
            );
        } catch {
            setDashboardTicket(null);
            setTicketError(
                "We could not load your backend tickets. Confirm the backend is running and you are logged in.",
            );
        } finally {
            setIsLoadingTickets(false);
        }
    }, []);

    const loadDashboardPayments = useCallback(async () => {
        setIsLoadingPayments(true);
        setPaymentError("");

        try {
            const summary = await getFanWalletSummary(5);
            setWalletSummary(summary);
        } catch {
            setWalletSummary(null);
            setPaymentError(
                "We could not load your payment summary. Confirm the backend is running and you are logged in.",
            );
        } finally {
            setIsLoadingPayments(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboardTickets();
        void loadDashboardPayments();
    }, [loadDashboardPayments, loadDashboardTickets]);

    const matchSlots = Array.from({ length: 4 }, (_, index) => upcomingMatches[index] ?? null);
    const clubSlots = Array.from({ length: 4 }, (_, index) => followedClubs[index] ?? null);
    const newsSlots = Array.from({ length: 3 }, (_, index) => latestNews[index] ?? null);
    const membershipSlots =
        dashboardMemberships.length > 0 ? dashboardMemberships.slice(0, 2) : [null];

    const recentDashboardPayments = walletSummary?.recent_payments ?? [];
    const walletCurrency = walletSummary?.currency ?? "UGX";
    const walletTotalSpent = walletSummary
        ? formatDashboardCurrency(walletSummary.total_spent, walletCurrency)
        : formatDashboardCurrency(0, walletCurrency);
    const activeSponsorPlacement =
        dashboardSponsorPlacements[sponsorPage % dashboardSponsorPlacements.length];

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
                        {isLoadingMemberships ? (
                            <article
                                className={`${styles.membershipItem} ${styles.membershipPlaceholder}`}
                            >
                                <div className={styles.membershipPlaceholderIcon}>♕</div>

                                <div>
                                    <h3>Loading memberships</h3>
                                    <p>Checking your active club card.</p>
                                </div>
                            </article>
                        ) : null}

                        {!isLoadingMemberships && membershipError ? (
                            <article
                                className={`${styles.membershipItem} ${styles.membershipPlaceholder}`}
                            >
                                <div className={styles.membershipPlaceholderIcon}>!</div>

                                <div>
                                    <h3>Membership sync issue</h3>
                                    <p>{membershipError}</p>
                                </div>

                                <button
                                    type="button"
                                    className={styles.membershipRetryButton}
                                    onClick={loadDashboardMemberships}
                                >
                                    Retry
                                </button>
                            </article>
                        ) : null}

                        {!isLoadingMemberships && !membershipError
                            ? membershipSlots.map((membership, index) =>
                                  membership ? (
                                      <article
                                          className={`${styles.membershipItem} ${styles.membershipPassCard}`}
                                          key={membership.id}
                                      >
                                          <div className={styles.membershipPassHeader}>
                                              <DashboardMembershipLogo
                                                  logo={membership.logo}
                                                  club={membership.club}
                                              />

                                              <div>
                                                  <span>Active Club Card</span>
                                                  <h3>{membership.club}</h3>
                                                  <p>{membership.tier}</p>
                                              </div>

                                              <strong className={styles.membershipStatusPill}>
                                                  <span aria-hidden="true" />
                                                  Active
                                              </strong>
                                          </div>

                                          <div className={styles.membershipPassDivider} />

                                          <div className={styles.membershipPassBody}>
                                              <div className={styles.membershipInfoStack}>
                                                  <div className={styles.membershipInfoRow}>
                                                      <span className={styles.membershipInfoIcon}>
                                                          <CalendarDays
                                                              size={18}
                                                              strokeWidth={2.4}
                                                              aria-hidden="true"
                                                          />
                                                      </span>

                                                      <div>
                                                          <small>Valid Until</small>
                                                          <strong>{membership.validUntil}</strong>
                                                      </div>
                                                  </div>

                                                  <div className={styles.membershipInfoRow}>
                                                      <span className={styles.membershipInfoIcon}>
                                                          <Ticket
                                                              size={18}
                                                              strokeWidth={2.4}
                                                              aria-hidden="true"
                                                          />
                                                      </span>

                                                      <div>
                                                          <small>Member No.</small>
                                                          <strong>{membership.memberNumber}</strong>
                                                      </div>
                                                  </div>

                                                  <div className={styles.membershipTierRow}>
                                                      <Crown
                                                          size={22}
                                                          strokeWidth={2.4}
                                                          aria-hidden="true"
                                                      />

                                                      <div>
                                                          <strong>{membership.tier}</strong>
                                                          <small>Club Membership</small>
                                                      </div>
                                                  </div>
                                              </div>

                                              <div
                                                  className={styles.membershipQrPanel}
                                                  title={membership.qrCodeData}
                                              >
                                                  <div className={styles.membershipQrBox}>
                                                      <QrCode
                                                          size={74}
                                                          strokeWidth={2.45}
                                                          aria-hidden="true"
                                                      />
                                                  </div>

                                                  <span>Scan to verify</span>
                                              </div>
                                          </div>

                                          <Link
                                              to="/dashboard/memberships"
                                              className={styles.membershipPassButton}
                                          >
                                              View Digital Card
                                              <Ticket
                                                  size={18}
                                                  strokeWidth={2.4}
                                                  aria-hidden="true"
                                              />
                                          </Link>
                                      </article>
                                  ) : (
                                      <article
                                          className={`${styles.membershipItem} ${styles.membershipPlaceholder}`}
                                          key={`membership-placeholder-${index}`}
                                      >
                                          <div className={styles.membershipPlaceholderIcon}>
                                              ♕
                                          </div>

                                          <div>
                                              <h3>No membership yet</h3>
                                              <p>Join a club to unlock benefits.</p>
                                          </div>

                                          <Link to="/memberships">Explore</Link>
                                      </article>
                                  ),
                              )
                            : null}
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

                    {isLoadingTickets ? (
                        <DashboardEmptyState
                            icon="🎟"
                            title="Loading tickets"
                            message="Checking your backend ticket wallet."
                            actionLabel="Open Tickets"
                            actionTo="/dashboard/tickets"
                            compact
                        />
                    ) : null}

                    {!isLoadingTickets && ticketError ? (
                        <div className={styles.dashboardSyncCard}>
                            <div>
                                <h3>Ticket sync issue</h3>
                                <p>{ticketError}</p>
                            </div>

                            <button type="button" onClick={loadDashboardTickets}>
                                Retry
                            </button>
                        </div>
                    ) : null}

                    {!isLoadingTickets && !ticketError && dashboardTicket ? (
                        <div className={styles.ticketDashboardCard}>
                            <div className={styles.ticketDashboardInfo}>
                                <span>{dashboardTicket.competition}</span>
                                <h3>
                                    {dashboardTicket.home}
                                    <small>vs</small>
                                    {dashboardTicket.away}
                                </h3>

                                <dl>
                                    <div>
                                        <dt>Date</dt>
                                        <dd>{dashboardTicket.date}</dd>
                                    </div>

                                    <div>
                                        <dt>Time</dt>
                                        <dd>{dashboardTicket.time}</dd>
                                    </div>

                                    <div>
                                        <dt>Type</dt>
                                        <dd>{dashboardTicket.ticketType}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div className={styles.ticketDashboardPass}>
                                <span>{dashboardTicket.status}</span>
                                <strong>{dashboardTicket.ticketCode}</strong>

                                <div className={styles.ticketDashboardQr}>
                                    <QrCode size={70} strokeWidth={2.4} aria-hidden="true" />
                                </div>

                                <Link to={`/dashboard/tickets/${dashboardTicket.id}`}>
                                    Open QR
                                </Link>
                            </div>
                        </div>
                    ) : null}

                    {!isLoadingTickets && !ticketError && !dashboardTicket ? (
                        <DashboardEmptyState
                            icon="🎟"
                            title="No active tickets"
                            message="Your upcoming match tickets will appear here after purchase."
                            actionLabel="Buy Tickets"
                            actionTo="/tickets"
                            compact
                        />
                    ) : null}

                    <Link to="/dashboard/tickets" className={styles.panelFooterLink}>
                        View All Tickets →
                    </Link>
                </section>

                <section className={`${styles.panel} ${styles.dashboardPaymentsPanel}`}>
                    <div className={styles.panelHeader}>
                        <h2>Payments</h2>
                        <Link to="/profile/payments">View All</Link>
                    </div>

                    {isLoadingPayments ? (
                        <DashboardEmptyState
                            icon="💳"
                            title="Loading payments"
                            message="Checking your backend payment history."
                            actionLabel="Open Payments"
                            actionTo="/profile/payments"
                            compact
                        />
                    ) : null}

                    {!isLoadingPayments && paymentError ? (
                        <div className={styles.dashboardSyncCard}>
                            <div>
                                <h3>Payment sync issue</h3>
                                <p>{paymentError}</p>
                            </div>

                            <button type="button" onClick={loadDashboardPayments}>
                                Retry
                            </button>
                        </div>
                    ) : null}

                    {!isLoadingPayments && !paymentError && walletSummary ? (
                        <>
                            <div className={styles.walletSummaryCard}>
                                <div>
                                    <span>Total Paid</span>
                                    <strong>{walletTotalSpent}</strong>
                                    <p>{walletSummary.balance_note}</p>
                                </div>

                                <dl>
                                    <div>
                                        <dt>Successful</dt>
                                        <dd>{walletSummary.successful_payments_count}</dd>
                                    </div>

                                    <div>
                                        <dt>Pending</dt>
                                        <dd>{walletSummary.pending_payments_count}</dd>
                                    </div>

                                    <div>
                                        <dt>Failed</dt>
                                        <dd>{walletSummary.failed_payments_count}</dd>
                                    </div>
                                </dl>
                            </div>

                            {recentDashboardPayments.length > 0 ? (
                                <div className={styles.dashboardPaymentList}>
                                    {recentDashboardPayments
                                        .slice(0, 2)
                                        .map((payment: BackendPaymentItem) => (
                                            <article
                                                className={styles.dashboardPaymentItem}
                                                key={`${payment.source}-${payment.id}-${payment.reference}`}
                                            >
                                                <div>
                                                    <h3>
                                                        {payment.payment_type_label ||
                                                            payment.payment_type}
                                                    </h3>
                                                    <p>
                                                        {payment.description ||
                                                            payment.reference ||
                                                            "Payment record"}
                                                    </p>
                                                    <small>
                                                        {formatDashboardPaymentDate(
                                                            payment.created_at,
                                                        )}
                                                    </small>
                                                </div>

                                                <span>
                                                    <strong>
                                                        {formatDashboardCurrency(
                                                            payment.amount,
                                                            payment.currency,
                                                        )}
                                                    </strong>
                                                    <em
                                                        className={
                                                            styles.dashboardPaymentStatus
                                                        }
                                                        data-status={normalizeDashboardPaymentStatus(
                                                            payment.status,
                                                        )}
                                                    >
                                                        {payment.status_label ||
                                                            payment.status}
                                                    </em>
                                                </span>
                                            </article>
                                        ))}
                                </div>
                            ) : (
                                <DashboardEmptyState
                                    icon="💳"
                                    title="No payments yet"
                                    message="Ticket, membership and sponsorship payments will appear here."
                                    actionLabel="Open Payments"
                                    actionTo="/profile/payments"
                                    compact
                                />
                            )}
                        </>
                    ) : null}

                    {!isLoadingPayments && !paymentError && !walletSummary ? (
                        <DashboardEmptyState
                            icon="💳"
                            title="No payment summary"
                            message="Your payment summary will appear after your first payment."
                            actionLabel="Open Payments"
                            actionTo="/profile/payments"
                            compact
                        />
                    ) : null}

                    <Link to="/profile/payments" className={styles.panelFooterLink}>
                        Open Payment Center →
                    </Link>
                </section>

                <section className={`${styles.panel} ${styles.sponsorSpotlightPanel}`}>
                    <div className={styles.panelHeader}>
                        <h2>Sponsor Spotlight</h2>
                        <Link to="/sponsor/apply">Advertise</Link>
                    </div>

                    <article className={styles.sponsorSpotlightCard}>
                        <div className={styles.sponsorTopLine}>
                            <span>{activeSponsorPlacement.label}</span>
                            <strong>{activeSponsorPlacement.tag}</strong>
                        </div>

                        <div className={styles.sponsorLogoMark}>
                            {activeSponsorPlacement.sponsor
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")}
                        </div>

                        <div>
                            <p>{activeSponsorPlacement.sponsor}</p>
                            <h3>{activeSponsorPlacement.headline}</h3>
                            <small>{activeSponsorPlacement.description}</small>
                        </div>

                        <div className={styles.sponsorActions}>
                            <Link to={activeSponsorPlacement.to}>
                                {activeSponsorPlacement.cta}
                            </Link>

                            <div className={styles.sponsorPager}>
                                <button
                                    type="button"
                                    aria-label="Previous sponsor placement"
                                    onClick={() =>
                                        setSponsorPage((currentPage) =>
                                            currentPage === 0
                                                ? dashboardSponsorPlacements.length - 1
                                                : currentPage - 1,
                                        )
                                    }
                                >
                                    ‹
                                </button>

                                <span>
                                    {sponsorPage + 1}/{dashboardSponsorPlacements.length}
                                </span>

                                <button
                                    type="button"
                                    aria-label="Next sponsor placement"
                                    onClick={() =>
                                        setSponsorPage((currentPage) =>
                                            (currentPage + 1) %
                                            dashboardSponsorPlacements.length,
                                        )
                                    }
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    </article>
                </section>
            </div>
        </section>
    );
}

export default FanDashboardPage;