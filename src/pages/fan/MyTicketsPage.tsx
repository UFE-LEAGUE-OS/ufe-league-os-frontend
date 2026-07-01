import {
    CalendarDays,
    CheckCircle2,
    CircleHelp,
    Clock3,
    Download,
    MapPin,
    QrCode,
    ReceiptText,
    Search,
    Share2,
    Ticket,
    Timer,
    WalletCards,
    X,
    XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./MyTicketsPage.module.css";

type TicketStatus = "Confirmed" | "Completed" | "Cancelled";
type TicketTab = "upcoming" | "past" | "orders";

interface FanTicket {
    id: string;
    competition: string;
    dateDay: string;
    dateMonth: string;
    title: string;
    homeLogo: string;
    awayLogo: string;
    homeTeam: string;
    awayTeam: string;
    dateTime: string;
    venue: string;
    ticketType: string;
    quantity: number;
    seat: string;
    price: string;
    status: TicketStatus;
    orderId: string;
    bookedOn: string;
    gate: string;
}

interface RecommendedTicket {
    id: string;
    dateDay: string;
    dateMonth: string;
    competition: string;
    title: string;
    dateTime: string;
    venue: string;
    price: string;
    image: string;
}

interface SummaryCard {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    tone: "purple" | "blue" | "orange" | "green";
}

const upcomingTickets: FanTicket[] = [
    {
        id: "kobs-heathens-vip",
        competition: "Nile Special Rugby Premiership",
        dateDay: "24",
        dateMonth: "May",
        title: "KCB KOBS vs Heathens RFC",
        homeLogo: "/assets/clubs/kobs.jpg",
        awayLogo: "/assets/clubs/platinum-heathens.jpg",
        homeTeam: "KCB KOBS",
        awayTeam: "Heathens RFC",
        dateTime: "Sat, 24 May 2025 • 4:00 PM EAT",
        venue: "Kings Park Arena, Bweyogerere",
        ticketType: "VIP Stand",
        quantity: 2,
        seat: "A12, A13",
        gate: "Gate B",
        price: "UGX 120,000",
        status: "Confirmed",
        orderId: "#ORD-845672",
        bookedOn: "15 May 2025",
    },
    {
        id: "pirates-black-pirates-regular",
        competition: "Nile Special Rugby Premiership",
        dateDay: "01",
        dateMonth: "Jun",
        title: "Black Pirates vs Impis RFC",
        homeLogo: "/assets/clubs/black-pirates.png",
        awayLogo: "/assets/clubs/impis-rfc.jpg",
        homeTeam: "Black Pirates",
        awayTeam: "Impis RFC",
        dateTime: "Sun, 01 Jun 2025 • 2:00 PM EAT",
        venue: "Legends Rugby Grounds, Namboole",
        ticketType: "Regular",
        quantity: 3,
        seat: "B45, B46, B47",
        gate: "Gate A",
        price: "UGX 45,000",
        status: "Confirmed",
        orderId: "#ORD-845112",
        bookedOn: "10 May 2025",
    },
];

const pastTickets: FanTicket[] = [
    {
        id: "heathens-rams-completed",
        competition: "Nile Special Rugby Premiership",
        dateDay: "10",
        dateMonth: "May",
        title: "Heathens RFC vs Rams RFC",
        homeLogo: "/assets/clubs/platinum-heathens.jpg",
        awayLogo: "/assets/clubs/buffaloes.png",
        homeTeam: "Heathens RFC",
        awayTeam: "Rams RFC",
        dateTime: "Sat, 10 May 2025 • 4:00 PM EAT",
        venue: "Legends Rugby Grounds, Namboole",
        ticketType: "Regular",
        quantity: 2,
        seat: "C22, C23",
        gate: "Gate C",
        price: "UGX 40,000",
        status: "Completed",
        orderId: "#ORD-842009",
        bookedOn: "02 May 2025",
    },
];

const recommendedTickets: RecommendedTicket[] = [
    {
        id: "kobs-ura",
        dateDay: "07",
        dateMonth: "Jun",
        competition: "Nile Special Rugby Premiership",
        title: "KOBS vs URA RFC",
        dateTime: "Sat, 07 Jun 2025 • 4:00 PM EAT",
        venue: "Kings Park Arena, Bweyogerere",
        price: "UGX 50,000",
        image: "/assets/sports/rugby-promo.png",
    },
    {
        id: "kobs-pirates",
        dateDay: "08",
        dateMonth: "Jun",
        competition: "Nile Special Rugby Premiership",
        title: "KCB KOBS vs Pirates RFC",
        dateTime: "Sun, 08 Jun 2025 • 2:00 PM EAT",
        venue: "Kings Park Arena, Bweyogerere",
        price: "UGX 40,000",
        image: "/assets/clubs/kobs.jpg",
    },
    {
        id: "heathens-rams",
        dateDay: "14",
        dateMonth: "Jun",
        competition: "Nile Special Rugby Premiership",
        title: "Heathens RFC vs Rams RFC",
        dateTime: "Sat, 14 Jun 2025 • 4:00 PM EAT",
        venue: "Legends Rugby Grounds, Namboole",
        price: "UGX 35,000",
        image: "/assets/clubs/platinum-heathens.jpg",
    },
];

const statusIconMap = {
    Confirmed: CheckCircle2,
    Completed: CheckCircle2,
    Cancelled: XCircle,
};

function StatusBadge({ status }: { status: TicketStatus }) {
    const StatusIcon = statusIconMap[status];

    return (
        <span className={`${styles.statusBadge} ${styles[status.toLowerCase()]}`}>
            <StatusIcon size={14} strokeWidth={2.4} aria-hidden="true" />
            {status}
        </span>
    );
}

function EmptyState({
    title,
    message,
    actionLabel,
    actionTo,
}: {
    title: string;
    message: string;
    actionLabel: string;
    actionTo: string;
}) {
    return (
        <section className={styles.emptyState}>
            <Ticket size={42} strokeWidth={2.2} aria-hidden="true" />
            <h2>{title}</h2>
            <p>{message}</p>
            <Link to={actionTo}>{actionLabel}</Link>
        </section>
    );
}

function TicketCard({ ticket, isPast = false }: { ticket: FanTicket; isPast?: boolean }) {
    return (
        <article className={styles.ticketCard}>
            <div className={styles.ticketDate}>
                <span>{ticket.dateDay}</span>
                <strong>{ticket.dateMonth}</strong>
            </div>

            <div className={styles.ticketMain}>
                <span className={styles.competition}>{ticket.competition}</span>
                <h3>{ticket.title}</h3>

                <div className={styles.teamsRow}>
                    <img src={ticket.homeLogo} alt="" aria-hidden="true" />
                    <strong>{ticket.homeTeam}</strong>
                    <span>vs</span>
                    <img src={ticket.awayLogo} alt="" aria-hidden="true" />
                    <strong>{ticket.awayTeam}</strong>
                </div>

                <p>
                    <CalendarDays size={15} strokeWidth={2.2} aria-hidden="true" />
                    {ticket.dateTime}
                </p>

                <p>
                    <MapPin size={15} strokeWidth={2.2} aria-hidden="true" />
                    {ticket.venue}
                </p>
            </div>

            <dl className={styles.ticketMeta}>
                <div>
                    <dt>Type</dt>
                    <dd>{ticket.ticketType}</dd>
                </div>

                <div>
                    <dt>Qty</dt>
                    <dd>{ticket.quantity}</dd>
                </div>

                <div>
                    <dt>Gate</dt>
                    <dd>{ticket.gate}</dd>
                </div>

                <div>
                    <dt>Seat</dt>
                    <dd>{ticket.seat}</dd>
                </div>

                <div>
                    <dt>Price</dt>
                    <dd>{ticket.price}</dd>
                </div>

                <div>
                    <dt>Status</dt>
                    <dd>
                        <StatusBadge status={ticket.status} />
                    </dd>
                </div>

                <div>
                    <dt>Order ID</dt>
                    <dd>{ticket.orderId}</dd>
                </div>

                <div>
                    <dt>Booked On</dt>
                    <dd>{ticket.bookedOn}</dd>
                </div>
            </dl>

            <div className={styles.ticketActions}>
                <Link to={`/dashboard/tickets/${ticket.id}`} className={styles.primaryAction}>
                    <QrCode size={16} strokeWidth={2.2} aria-hidden="true" />
                    {isPast ? "View Details" : "Open QR"}
                </Link>

                {!isPast ? (
                    <>
                        <button type="button">
                            <Download size={16} strokeWidth={2.2} aria-hidden="true" />
                            Download
                        </button>

                        <button type="button">
                            <Share2 size={16} strokeWidth={2.2} aria-hidden="true" />
                            Transfer
                        </button>
                    </>
                ) : null}
            </div>
        </article>
    );
}

function RecommendedCard({ ticket }: { ticket: RecommendedTicket }) {
    return (
        <article className={styles.recommendedCard}>
            <div className={styles.recommendedImageWrap}>
                <img src={ticket.image} alt="" aria-hidden="true" />

                <span>
                    <strong>{ticket.dateDay}</strong>
                    {ticket.dateMonth}
                </span>
            </div>

            <div className={styles.recommendedContent}>
                <p>{ticket.competition}</p>
                <h3>{ticket.title}</h3>

                <span>
                    <CalendarDays size={14} strokeWidth={2.2} aria-hidden="true" />
                    {ticket.dateTime}
                </span>

                <span>
                    <MapPin size={14} strokeWidth={2.2} aria-hidden="true" />
                    {ticket.venue}
                </span>
            </div>

            <div className={styles.recommendedFooter}>
                <strong>{ticket.price}</strong>
                <Link to="/tickets">Buy Tickets</Link>
            </div>
        </article>
    );
}

function MyTicketsPage() {
    const [activeTab, setActiveTab] = useState<TicketTab>("upcoming");
    const [searchQuery, setSearchQuery] = useState("");

    const allTickets = useMemo(() => [...upcomingTickets, ...pastTickets], []);

    const summaryCards: SummaryCard[] = [
        {
            label: "Upcoming Tickets",
            value: String(upcomingTickets.length),
            detail: "Ready for QR scan",
            icon: Ticket,
            tone: "purple",
        },
        {
            label: "Past Tickets",
            value: String(pastTickets.length),
            detail: "Available in history",
            icon: Timer,
            tone: "blue",
        },
        {
            label: "Total Orders",
            value: String(allTickets.length),
            detail: "Ticket purchases",
            icon: ReceiptText,
            tone: "orange",
        },
        {
            label: "Wallet Status",
            value: "Active",
            detail: "QR tickets enabled",
            icon: WalletCards,
            tone: "green",
        },
    ];

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const searchedUpcomingTickets = useMemo(
        () =>
            upcomingTickets.filter((ticket) =>
                `${ticket.title} ${ticket.competition} ${ticket.venue} ${ticket.orderId}`
                    .toLowerCase()
                    .includes(normalizedSearchQuery),
            ),
        [normalizedSearchQuery],
    );

    const searchedPastTickets = useMemo(
        () =>
            pastTickets.filter((ticket) =>
                `${ticket.title} ${ticket.competition} ${ticket.venue} ${ticket.orderId}`
                    .toLowerCase()
                    .includes(normalizedSearchQuery),
            ),
        [normalizedSearchQuery],
    );

    const searchedOrders = useMemo(
        () =>
            allTickets.filter((ticket) =>
                `${ticket.title} ${ticket.competition} ${ticket.venue} ${ticket.orderId}`
                    .toLowerCase()
                    .includes(normalizedSearchQuery),
            ),
        [allTickets, normalizedSearchQuery],
    );

    const nextTicket = upcomingTickets[0];

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>My Tickets</h1>
                    <p>
                        View, download, transfer and manage your upcoming and past match
                        tickets from one fan wallet.
                    </p>
                </div>

                <Link to="/tickets" className={styles.primaryHeaderAction}>
                    <Ticket size={18} strokeWidth={2.4} aria-hidden="true" />
                    Buy Tickets
                </Link>
            </header>

            <section className={styles.walletHero}>
                <div>
                    <span className={styles.eyebrow}>Fan Ticket Wallet</span>
                    <h2>Matchday access in one place</h2>
                    <p>
                        Your QR ticket, order details, transfer options and ticket history
                        are organized here.
                    </p>
                </div>

                <div className={styles.heroSearch}>
                    <Search size={18} strokeWidth={2.2} aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Search by match, club, venue or order ID..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />

                    {searchQuery ? (
                        <button
                            type="button"
                            aria-label="Clear ticket search"
                            onClick={() => setSearchQuery("")}
                        >
                            <X size={17} strokeWidth={2.4} />
                        </button>
                    ) : null}
                </div>
            </section>

            <section className={styles.summaryGrid} aria-label="Ticket wallet summary">
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

            <div className={styles.tabs} aria-label="Ticket sections">
                <button
                    type="button"
                    className={activeTab === "upcoming" ? styles.activeTab : ""}
                    onClick={() => setActiveTab("upcoming")}
                >
                    Upcoming <span>{upcomingTickets.length}</span>
                </button>

                <button
                    type="button"
                    className={activeTab === "past" ? styles.activeTab : ""}
                    onClick={() => setActiveTab("past")}
                >
                    Past <span>{pastTickets.length}</span>
                </button>

                <button
                    type="button"
                    className={activeTab === "orders" ? styles.activeTab : ""}
                    onClick={() => setActiveTab("orders")}
                >
                    Orders <span>{allTickets.length}</span>
                </button>
            </div>

            <div className={styles.layoutGrid}>
                <main className={styles.ticketColumn}>
                    {activeTab === "upcoming" ? (
                        <section className={styles.ticketSection}>
                            <div className={styles.sectionHeader}>
                                <h2>
                                    <Ticket size={18} strokeWidth={2.3} aria-hidden="true" />
                                    Upcoming Tickets
                                </h2>

                                <Link to="/tickets">View Upcoming Matches →</Link>
                            </div>

                            {searchedUpcomingTickets.length > 0 ? (
                                <div className={styles.ticketList}>
                                    {searchedUpcomingTickets.map((ticket) => (
                                        <TicketCard ticket={ticket} key={ticket.id} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="No upcoming tickets found"
                                    message="Try another search or buy tickets for an upcoming match."
                                    actionLabel="Buy Tickets"
                                    actionTo="/tickets"
                                />
                            )}
                        </section>
                    ) : null}

                    {activeTab === "past" ? (
                        <section className={styles.ticketSection}>
                            <div className={styles.sectionHeader}>
                                <h2>
                                    <Clock3 size={18} strokeWidth={2.3} aria-hidden="true" />
                                    Past Tickets
                                </h2>

                                <Link to="/tickets">Browse Matches →</Link>
                            </div>

                            {searchedPastTickets.length > 0 ? (
                                <div className={styles.ticketList}>
                                    {searchedPastTickets.map((ticket) => (
                                        <TicketCard ticket={ticket} isPast key={ticket.id} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="No past tickets found"
                                    message="Past tickets and completed match access will appear here."
                                    actionLabel="Browse Fixtures"
                                    actionTo="/fixtures"
                                />
                            )}
                        </section>
                    ) : null}

                    {activeTab === "orders" ? (
                        <section className={styles.ticketSection}>
                            <div className={styles.sectionHeader}>
                                <h2>
                                    <ReceiptText size={18} strokeWidth={2.3} aria-hidden="true" />
                                    Ticket Orders
                                </h2>

                                <Link to="/profile/payments">View Payments →</Link>
                            </div>

                            {searchedOrders.length > 0 ? (
                                <div className={styles.orderList}>
                                    {searchedOrders.map((ticket) => (
                                        <article className={styles.orderCard} key={ticket.id}>
                                            <div>
                                                <span>{ticket.orderId}</span>
                                                <h3>{ticket.title}</h3>
                                                <p>{ticket.bookedOn}</p>
                                            </div>

                                            <dl>
                                                <div>
                                                    <dt>Amount</dt>
                                                    <dd>{ticket.price}</dd>
                                                </div>

                                                <div>
                                                    <dt>Qty</dt>
                                                    <dd>{ticket.quantity}</dd>
                                                </div>

                                                <div>
                                                    <dt>Status</dt>
                                                    <dd>
                                                        <StatusBadge status={ticket.status} />
                                                    </dd>
                                                </div>
                                            </dl>

                                            <Link to={`/dashboard/tickets/${ticket.id}`}>
                                                View Order
                                            </Link>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    title="No orders found"
                                    message="Your ticket orders and receipts will appear here after purchase."
                                    actionLabel="Buy Tickets"
                                    actionTo="/tickets"
                                />
                            )}
                        </section>
                    ) : null}

                    <section className={styles.helpCard}>
                        <div>
                            <CircleHelp size={24} strokeWidth={2.3} aria-hidden="true" />

                            <div>
                                <h2>Need Help?</h2>
                                <p>
                                    If you have questions about tickets, transfers, downloads
                                    or QR access, support can help.
                                </p>
                            </div>
                        </div>

                        <Link to="/profile/support">Contact Support</Link>
                    </section>

                    <section className={`${styles.recommendedPanel} ${styles.mainRecommendedPanel}`}>
                        <div className={styles.sectionHeader}>
                            <h2>Recommended For You</h2>
                            <Link to="/tickets">View All</Link>
                        </div>

                        <div className={styles.recommendedList}>
                            {recommendedTickets.map((ticket) => (
                                <RecommendedCard ticket={ticket} key={ticket.id} />
                            ))}
                        </div>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    {nextTicket ? (
                        <section className={styles.qrPreviewCard}>
                            <span>Next Ticket</span>
                            <h2>{nextTicket.title}</h2>

                            <div className={styles.qrBox}>
                                <QrCode size={96} strokeWidth={2.3} aria-hidden="true" />
                            </div>

                            <p>
                                {nextTicket.gate} • {nextTicket.ticketType} • Seats{" "}
                                {nextTicket.seat}
                            </p>

                            <Link to={`/dashboard/tickets/${nextTicket.id}`}>
                                Open QR Ticket
                            </Link>
                        </section>
                    ) : (
                        <section className={styles.qrPreviewCard}>
                            <span>No active QR</span>
                            <h2>No upcoming ticket yet</h2>

                            <div className={styles.qrBoxMuted}>
                                <QrCode size={84} strokeWidth={2.3} aria-hidden="true" />
                            </div>

                            <p>Your next QR ticket will appear here after purchase.</p>

                            <Link to="/tickets">Buy Tickets</Link>
                        </section>
                    )}

                    <section className={styles.ticketTipsCard}>
                        <h2>Ticket Tips</h2>

                        <ul>
                            <li>Open your QR ticket before reaching the gate.</li>
                            <li>Download your ticket if your network may be weak.</li>
                            <li>Use Transfer only when sending a ticket to another fan.</li>
                        </ul>

                        <Link to="/profile/support">Ticket Support →</Link>
                    </section>

                    <section className={styles.sponsorPlacementCard} aria-label="Sponsored matchday placement">
                        <span>Sponsored</span>

                        <div>
                            <h2>Matchday Partner Slot</h2>
                            <p>
                                Reserve this space for sponsor offers, ticket bundles,
                                club promotions or matchday campaigns.
                            </p>
                        </div>

                        <Link to="/sponsor/apply">View Sponsorship Options →</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default MyTicketsPage;
