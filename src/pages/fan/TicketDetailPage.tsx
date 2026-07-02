import {
    ArrowLeftRight,
    CheckCircle2,
    Copy,
    Download,
    ExternalLink,
    Headphones,
    Info,
    MapPin,
    QrCode,
    Share2,
    ShieldCheck,
    Ticket,
    WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    fetchTicketQrObjectUrl,
    getTicketById,
} from "../../services/ticketingService";
import type { TicketApi } from "../../services/ticketingService";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import styles from "./TicketDetailPage.module.css";

type TicketViewModel = {
    id: string;
    ticketCode: string;
    competition: string;
    title: string;
    homeTeam: string;
    awayTeam: string;
    homeLogo: string;
    awayLogo: string;
    dateDay: string;
    dateMonth: string;
    dateYear: string;
    time: string;
    venue: string;
    location: string;
    ticketType: string;
    quantity: string;
    seats: string;
    section: string;
    row: string;
    gate: string;
    access: string;
    orderId: string;
    bookedOn: string;
    price: string;
    status: string;
    holderName: string;
    holderEmail: string;
    holderPhone: string;
    fanId: string;
};

const demoTicket: TicketViewModel = {
    id: "kobs-heathens-vip",
    ticketCode: "TKT-845672-01",
    competition: "Nile Special Rugby Premiership",
    title: "KCB Kobs vs Heathens RFC",
    homeTeam: "KCB Kobs",
    awayTeam: "Heathens RFC",
    homeLogo: "/assets/clubs/kobs.jpg",
    awayLogo: "/assets/clubs/platinum-heathens.jpg",
    dateDay: "24",
    dateMonth: "MAY",
    dateYear: "2025",
    time: "4:00 PM EAT",
    venue: "Kings Park Arena",
    location: "Bweyogerere, Kampala",
    ticketType: "Match Ticket",
    quantity: "1",
    seats: "General Admission",
    section: "General",
    row: "Not assigned",
    gate: "Gate pending",
    access: "Standard matchday access",
    orderId: "#ORDER-PENDING",
    bookedOn: "Date pending",
    price: "See payment receipt",
    status: "CONFIRMED",
    holderName: "Current Fan",
    holderEmail: "Email unavailable",
    holderPhone: "Phone unavailable",
    fanId: "LOS-FAN",
};

type TicketHolderInfo = {
    holderName: string;
    holderEmail: string;
    holderPhone: string;
    fanId: string;
};

type TicketHolderSource = {
    name?: string;
    displayName?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    phoneNumber?: string;
    fanId?: string;
    id?: string | number;
};

function cleanValue(value: unknown, fallback: string) {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }

    if (typeof value === "number") {
        return String(value);
    }

    return fallback;
}

function buildTicketHolder(user: TicketHolderSource): TicketHolderInfo {
    const combinedName = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

    return {
        holderName: cleanValue(
            user.displayName || user.name || user.fullName || combinedName,
            "Current Fan",
        ),
        holderEmail: cleanValue(user.email, "Email unavailable"),
        holderPhone: cleanValue(user.phone || user.phoneNumber, "Phone unavailable"),
        fanId: cleanValue(user.fanId || user.id, "LOS-FAN"),
    };
}

function buildTeamInitials(name: string) {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join("") || "LO"
    );
}

function parseMatchLabel(matchLabel: string) {
    const cleanLabel = matchLabel || "Match Ticket";
    const [matchTitle, matchDate] = cleanLabel.split(" - ");
    const parts = matchTitle.split(/\s+vs\s+/i);

    return {
        title: matchTitle.trim() || cleanLabel,
        matchDate: matchDate?.trim() || "",
        homeTeam: parts[0]?.trim() || "Home Team",
        awayTeam: parts[1]?.trim() || "Away Team",
    };
}

function formatMatchDateFromLabel(matchDate: string, fallback?: string | null) {
    if (matchDate) {
        const date = new Date(`${matchDate}T15:00:00`);

        if (!Number.isNaN(date.getTime())) {
            return {
                dateDay: date.toLocaleString("en-US", { day: "2-digit" }),
                dateMonth: date
                    .toLocaleString("en-US", { month: "short" })
                    .toUpperCase(),
                dateYear: String(date.getFullYear()),
                time: "Kickoff TBA",
                bookedOn: formatDateParts(fallback).bookedOn,
            };
        }
    }

    return formatDateParts(fallback);
}

function formatDateParts(value?: string | null) {
    if (!value) {
        return {
            dateDay: demoTicket.dateDay,
            dateMonth: demoTicket.dateMonth,
            dateYear: demoTicket.dateYear,
            time: demoTicket.time,
            bookedOn: demoTicket.bookedOn,
        };
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return {
            dateDay: demoTicket.dateDay,
            dateMonth: demoTicket.dateMonth,
            dateYear: demoTicket.dateYear,
            time: demoTicket.time,
            bookedOn: demoTicket.bookedOn,
        };
    }

    return {
        dateDay: date.toLocaleString("en-US", { day: "2-digit" }),
        dateMonth: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
        dateYear: String(date.getFullYear()),
        time: date.toLocaleString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        }),
        bookedOn: date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
    };
}

function normalizeStatus(status: string) {
    if (status === "ACTIVE" || status === "ISSUED") return "CONFIRMED";
    if (status === "USED") return "USED";
    if (status === "CANCELLED") return "CANCELLED";
    if (status === "REFUNDED") return "REFUNDED";
    if (status === "EXPIRED") return "EXPIRED";
    return status || "CONFIRMED";
}

function mapTicketToViewModel(
    ticket: TicketApi | null,
    holder: TicketHolderInfo,
): TicketViewModel {
    if (!ticket) {
        return {
            ...demoTicket,
            ...holder,
        };
    }

    const match = parseMatchLabel(ticket.match_label);
    const dateParts = formatMatchDateFromLabel(match.matchDate, ticket.issued_at);

    return {
        ...demoTicket,
        ...holder,
        id: String(ticket.id),
        ticketCode: ticket.ticket_code || ticket.qr_payload || `TKT-${ticket.id}`,
        competition: "League OS Ticketing",
        title: match.title,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeLogo: "",
        awayLogo: "",
        venue: "Venue to be confirmed",
        location: "Check match details",
        ticketType: ticket.ticket_type_name || "Match Ticket",
        quantity: "1",
        seats: "General Admission",
        section: "General",
        row: "Not assigned",
        gate: "Gate pending",
        access: "Standard matchday access",
        price: "See payment receipt",
        orderId: `#ORDER-${ticket.order}`,
        status: normalizeStatus(ticket.status),
        ...dateParts,
    };
}

function TeamMark({ name, logo }: { name: string; logo: string }) {
    return logo ? (
        <img src={logo} alt="" aria-hidden="true" />
    ) : (
        <span className={styles.teamFallbackBadge}>{buildTeamInitials(name)}</span>
    );
}

function TicketQrPreview({
    qrObjectUrl,
    ticketCode,
}: {
    qrObjectUrl: string;
    ticketCode: string;
}) {
    return (
        <div className={styles.qrPreview}>
            <div className={styles.qrFrame}>
                {qrObjectUrl ? (
                    <img src={qrObjectUrl} alt="Ticket QR code" />
                ) : (
                    <QrCode size={144} strokeWidth={1.8} aria-hidden="true" />
                )}
            </div>

            <span>Ticket ID</span>
            <strong>{ticketCode}</strong>
            <p>This is your entry pass. Present this QR code at the gate.</p>
        </div>
    );
}

function TicketDetailPage() {
    const { ticketId } = useParams();
    const { currentUser } = useCurrentUser();
    const [ticket, setTicket] = useState<TicketApi | null>(null);
    const [qrObjectUrl, setQrObjectUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    const ticketHolder = useMemo(
        () => buildTicketHolder(currentUser as TicketHolderSource),
        [currentUser],
    );

    const ticketView = useMemo(
        () => mapTicketToViewModel(ticket, ticketHolder),
        [ticket, ticketHolder],
    );
    const canFetchBackendQr = Boolean(ticket?.id);

    useEffect(() => {
        let isMounted = true;

        const timeoutId = window.setTimeout(() => {
            async function loadTicket() {
                setIsLoading(true);
                setPageError("");

                try {
                    if (!ticketId) {
                        if (isMounted) {
                            setTicket(null);
                        }
                        return;
                    }

                    const loadedTicket = await getTicketById(ticketId);

                    if (isMounted) {
                        setTicket(loadedTicket);
                    }
                } catch {
                    if (isMounted) {
                        setTicket(null);
                        setPageError(
                            "We could not load this backend ticket. Check your connection and try again.",
                        );
                    }
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            }

            void loadTicket();
        }, 0);

        return () => {
            isMounted = false;
            window.clearTimeout(timeoutId);
        };
    }, [ticketId]);

    useEffect(() => {
        let isMounted = true;
        let objectUrl = "";

        const timeoutId = window.setTimeout(() => {
            async function loadQrCode() {
                if (!ticket?.id) {
                    setQrObjectUrl("");
                    return;
                }

                try {
                    objectUrl = await fetchTicketQrObjectUrl(ticket.id);

                    if (isMounted) {
                        setQrObjectUrl(objectUrl);
                    }
                } catch {
                    if (isMounted) {
                        setQrObjectUrl("");
                    }
                }
            }

            void loadQrCode();
        }, 0);

        return () => {
            isMounted = false;
            window.clearTimeout(timeoutId);

            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [ticket?.id]);

    async function copyTicketCode() {
        try {
            await navigator.clipboard.writeText(ticketView.ticketCode);
        } catch {
            // Clipboard may be blocked in some browsers. The visible ticket code remains available.
        }
    }

    function downloadQrCode() {
        if (!qrObjectUrl) return;

        const link = document.createElement("a");
        link.href = qrObjectUrl;
        link.download = `league-os-ticket-${ticketView.id}.svg`;
        link.click();
    }

    return (
        <section className={styles.page}>
            <div className={styles.breadcrumb}>
                Home <span>›</span> My Tickets <span>›</span> View Ticket
            </div>

            <header className={styles.pageHeader}>
                <div>
                    <h1>View Ticket</h1>
                    <p>{ticketView.competition}</p>
                </div>

                <Link to="/dashboard/tickets" className={styles.backLink}>
                    Back to My Tickets
                </Link>
            </header>

            {pageError ? (
                <div className={styles.notice}>
                    <Info size={18} strokeWidth={2.3} aria-hidden="true" />
                    {pageError}
                </div>
            ) : null}

            <section className={styles.ticketHero}>
                <div className={styles.dateBlock}>
                    <span>{ticketView.dateMonth}</span>
                    <strong>{ticketView.dateDay}</strong>
                    <em>{ticketView.dateYear}</em>
                    <small>{ticketView.time}</small>
                </div>

                <div className={styles.matchBlock}>
                    <span>{ticketView.competition}</span>
                    <h2>{ticketView.title}</h2>

                    <div className={styles.teamRow}>
                        <TeamMark name={ticketView.homeTeam} logo={ticketView.homeLogo} />
                        <strong>{ticketView.homeTeam}</strong>
                        <b>VS</b>
                        <TeamMark name={ticketView.awayTeam} logo={ticketView.awayLogo} />
                        <strong>{ticketView.awayTeam}</strong>
                    </div>

                    <p>
                        <MapPin size={15} strokeWidth={2.3} aria-hidden="true" />
                        {ticketView.venue}, {ticketView.location}
                    </p>
                </div>

                <dl className={styles.heroMeta}>
                    <div>
                        <dt>Ticket Type</dt>
                        <dd>{ticketView.ticketType}</dd>
                    </div>
                    <div>
                        <dt>Quantity</dt>
                        <dd>{ticketView.quantity}</dd>
                    </div>
                    <div>
                        <dt>Seats</dt>
                        <dd>{ticketView.seats}</dd>
                    </div>
                    <div>
                        <dt>Status</dt>
                        <dd>
                            <span className={styles.statusBadge}>
                                <CheckCircle2 size={15} strokeWidth={2.4} />
                                {ticketView.status}
                            </span>
                        </dd>
                    </div>
                    <div>
                        <dt>Order ID</dt>
                        <dd>{ticketView.orderId}</dd>
                    </div>
                    <div>
                        <dt>Booked On</dt>
                        <dd>{ticketView.bookedOn}</dd>
                    </div>
                    <div>
                        <dt>Price</dt>
                        <dd>{ticketView.price}</dd>
                    </div>
                    <div>
                        <dt>Format</dt>
                        <dd>E-Ticket</dd>
                    </div>
                </dl>
            </section>

            <nav className={styles.detailTabs} aria-label="Ticket detail sections">
                <button type="button" className={styles.activeTab}>
                    Ticket Details
                </button>
                <button type="button">Match Info</button>
                <button type="button">Entry Info</button>
            </nav>

            <div className={styles.detailGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.ticketPreviewCard}>
                        <div className={styles.cardHeader}>
                            <h2>Ticket Preview</h2>
                            {isLoading ? <span>Loading...</span> : null}
                        </div>

                        <TicketQrPreview
                            qrObjectUrl={qrObjectUrl}
                            ticketCode={ticketView.ticketCode}
                        />
                    </section>

                    <section className={styles.infoPanel}>
                        <div className={styles.infoColumn}>
                            <h2>
                                <MapPin size={18} strokeWidth={2.3} />
                                Seat & Location
                            </h2>

                            <dl>
                                <div>
                                    <dt>Ticket Type</dt>
                                    <dd>{ticketView.ticketType}</dd>
                                </div>
                                <div>
                                    <dt>Section</dt>
                                    <dd>{ticketView.section}</dd>
                                </div>
                                <div>
                                    <dt>Row</dt>
                                    <dd>{ticketView.row}</dd>
                                </div>
                                <div>
                                    <dt>Seats</dt>
                                    <dd>{ticketView.seats}</dd>
                                </div>
                                <div>
                                    <dt>Gate</dt>
                                    <dd>{ticketView.gate}</dd>
                                </div>
                                <div>
                                    <dt>Access</dt>
                                    <dd>{ticketView.access}</dd>
                                </div>
                            </dl>

                            <h2>
                                <ExternalLink size={18} strokeWidth={2.3} />
                                Venue Information
                            </h2>

                            <p>
                                {ticketView.venue}
                                <br />
                                {ticketView.location}
                            </p>

                            <Link to="/fixtures">View on Map</Link>
                        </div>

                        <div className={styles.infoColumn}>
                            <h2>
                                <Ticket size={18} strokeWidth={2.3} />
                                Ticket Holder
                            </h2>

                            <dl>
                                <div>
                                    <dt>Name</dt>
                                    <dd>{ticketView.holderName}</dd>
                                </div>
                                <div>
                                    <dt>Email</dt>
                                    <dd>{ticketView.holderEmail}</dd>
                                </div>
                                <div>
                                    <dt>Phone</dt>
                                    <dd>{ticketView.holderPhone}</dd>
                                </div>
                                <div>
                                    <dt>Fan ID</dt>
                                    <dd>{ticketView.fanId}</dd>
                                </div>
                            </dl>

                            <h2>
                                <ShieldCheck size={18} strokeWidth={2.3} />
                                Policy & Notes
                            </h2>

                            <ul>
                                <li>Tickets are non-refundable.</li>
                                <li>Transfer allowed until 6 hours before kick-off.</li>
                                <li>Arrive early to avoid queues.</li>
                                <li>Bring a valid ID for verification.</li>
                            </ul>
                        </div>
                    </section>

                    <section className={styles.entryNotice}>
                        <Info size={26} strokeWidth={2.4} aria-hidden="true" />
                        <p>
                            Please ensure you have a stable internet connection when presenting
                            your e-ticket at the gate. Screenshots or printed copies may not be
                            accepted.
                        </p>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.actionsPanel}>
                        <button type="button" className={styles.primaryAction}>
                            <QrCode size={18} strokeWidth={2.4} aria-hidden="true" />
                            View QR Ticket
                        </button>

                        <button
                            type="button"
                            className={styles.secondaryAction}
                            onClick={downloadQrCode}
                            disabled={!canFetchBackendQr || !qrObjectUrl}
                        >
                            <Download size={18} strokeWidth={2.4} aria-hidden="true" />
                            Download Ticket
                        </button>

                        <button type="button" className={styles.secondaryAction}>
                            <ArrowLeftRight size={18} strokeWidth={2.4} aria-hidden="true" />
                            Transfer Ticket
                        </button>

                        <button type="button" className={styles.secondaryAction}>
                            <Headphones size={18} strokeWidth={2.4} aria-hidden="true" />
                            Contact Support
                        </button>

                        <button
                            type="button"
                            className={styles.secondaryAction}
                            onClick={copyTicketCode}
                        >
                            <Copy size={18} strokeWidth={2.4} aria-hidden="true" />
                            Copy Ticket ID
                        </button>

                        <button type="button" className={styles.secondaryAction}>
                            <Share2 size={18} strokeWidth={2.4} aria-hidden="true" />
                            Share Ticket
                        </button>
                    </section>

                    <section className={styles.recommendedPanel}>
                        <div className={styles.recommendedHeader}>
                            <h2>Recommended For You</h2>
                            <Link to="/tickets">More Matches →</Link>
                        </div>

                        {[
                            ["SUN", "01", "JUN", "Pirates RFC vs Black Pirates", "2:00 PM EAT", "UGX 45,000"],
                            ["SUN", "08", "JUN", "Kobs vs Pirates RFC", "2:00 PM EAT", "UGX 40,000"],
                            ["SAT", "14", "JUN", "Heathens vs Rams RFC", "4:00 PM EAT", "UGX 35,000"],
                        ].map((match) => (
                            <article className={styles.recommendedMatch} key={match[3]}>
                                <div>
                                    <span>{match[0]}</span>
                                    <strong>{match[1]}</strong>
                                    <em>{match[2]}</em>
                                </div>

                                <section>
                                    <h3>{match[3]}</h3>
                                    <p>{match[4]}</p>
                                    <small>{match[5]}</small>
                                </section>

                                <Link to="/tickets">Buy Tickets</Link>
                            </article>
                        ))}
                    </section>

                    <section className={styles.walletPanel}>
                        <WalletCards size={38} strokeWidth={2.1} aria-hidden="true" />
                        <h2>Add to Wallet</h2>
                        <p>Wallet support is prepared as a placeholder for Apple Wallet and Google Pay.</p>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default TicketDetailPage;
