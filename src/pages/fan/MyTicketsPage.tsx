import {
    CalendarDays,
    CheckCircle2,
    CircleHelp,
    Download,
    MapPin,
    QrCode,
    Search,
    Share2,
    Ticket,
    Timer,
    XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./MyTicketsPage.module.css";

type TicketStatus = "Confirmed" | "Completed" | "Cancelled";

type FanTicket = {
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
};

type RecommendedTicket = {
    id: string;
    dateDay: string;
    dateMonth: string;
    competition: string;
    title: string;
    dateTime: string;
    venue: string;
    price: string;
    image: string;
};

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
        title: "Pirates RFC vs Black Pirates",
        homeLogo: "/assets/clubs/black-pirates.png",
        awayLogo: "/assets/clubs/impis-rfc.jpg",
        homeTeam: "Pirates RFC",
        awayTeam: "Black Pirates",
        dateTime: "Sun, 01 Jun 2025 • 2:00 PM EAT",
        venue: "Legends Rugby Grounds, Namboole",
        ticketType: "Regular",
        quantity: 3,
        seat: "B45, B46, B47",
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
                    <dt>Ticket Type</dt>
                    <dd>{ticket.ticketType}</dd>
                </div>
                <div>
                    <dt>Qty</dt>
                    <dd>{ticket.quantity}</dd>
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
                    <Ticket size={16} strokeWidth={2.2} aria-hidden="true" />
                    {isPast ? "View Details" : "View Ticket"}
                </Link>
                {!isPast ? (
                    <>
                        <button type="button">
                            <Download size={16} strokeWidth={2.2} aria-hidden="true" />
                            Download
                        </button>
                        <button type="button">
                            <Share2 size={16} strokeWidth={2.2} aria-hidden="true" />
                            Transfer Ticket
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
    return (
        <section className={styles.page}>
            <div className={styles.breadcrumb}>Home / Profile / My Tickets</div>

            <header className={styles.hero}>
                <div>
                    <span className={styles.eyebrow}>Fan Ticket Wallet</span>
                    <h1>My Tickets</h1>
                    <p>View, download and manage your upcoming and past match tickets.</p>
                </div>

                <div className={styles.heroSearch}>
                    <Search size={18} strokeWidth={2.2} aria-hidden="true" />
                    <input type="search" placeholder="Search by match, club, order ID..." />
                </div>
            </header>

            <div className={styles.tabs} aria-label="Ticket sections">
                <button type="button" className={styles.activeTab}>My Tickets</button>
                <button type="button">Orders</button>
                <button type="button">Resale Requests</button>
            </div>

            <div className={styles.layoutGrid}>
                <main className={styles.ticketColumn}>
                    <section className={styles.ticketSection}>
                        <div className={styles.sectionHeader}>
                            <h2>
                                <Ticket size={18} strokeWidth={2.3} aria-hidden="true" />
                                Upcoming Tickets
                            </h2>
                            <Link to="/tickets">View All Upcoming →</Link>
                        </div>

                        <div className={styles.ticketList}>
                            {upcomingTickets.map((ticket) => (
                                <TicketCard ticket={ticket} key={ticket.id} />
                            ))}
                        </div>
                    </section>

                    <section className={styles.ticketSection}>
                        <div className={styles.sectionHeader}>
                            <h2>
                                <Timer size={18} strokeWidth={2.3} aria-hidden="true" />
                                Past Tickets
                            </h2>
                            <Link to="/tickets">View All Past →</Link>
                        </div>

                        <div className={styles.ticketList}>
                            {pastTickets.map((ticket) => (
                                <TicketCard ticket={ticket} isPast key={ticket.id} />
                            ))}
                        </div>
                    </section>

                    <section className={styles.helpCard}>
                        <div>
                            <CircleHelp size={24} strokeWidth={2.3} aria-hidden="true" />
                            <div>
                                <h2>Need Help?</h2>
                                <p>
                                    If you have questions about tickets, transfers or downloads,
                                    our support team can help.
                                </p>
                            </div>
                        </div>
                        <Link to="/profile/support">Contact Support</Link>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.qrPreviewCard}>
                        <span>Next Ticket</span>
                        <h2>KCB KOBS vs Heathens RFC</h2>
                        <div className={styles.qrBox}>
                            <QrCode size={96} strokeWidth={2.3} aria-hidden="true" />
                        </div>
                        <p>Gate B • VIP Stand • Seats A12, A13</p>
                        <Link to="/dashboard/tickets/kobs-heathens-vip">Open QR Ticket</Link>
                    </section>

                    <section className={styles.recommendedPanel}>
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
                </aside>
            </div>
        </section>
    );
}

export default MyTicketsPage;
