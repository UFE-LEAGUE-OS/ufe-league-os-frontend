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
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SafeImage from "../../components/SafeImage/SafeImage";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import {
    getPublicFixtures,
    type PublicFixtureApi,
} from "../../services/publicDashboardService";
import {
    fetchTicketQrObjectUrl,
    getMyTickets,
} from "../../services/ticketingService";
import type { TicketApi } from "../../services/ticketingService";
import styles from "./TicketDetailPage.module.css";

type TicketDetailTab = "ticket" | "match" | "entry";

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
    fixture: PublicFixtureApi | null,
): TicketViewModel {
    if (!ticket) {
        return {
            ...demoTicket,
            ...holder,
        };
    }

    const match = parseMatchLabel(ticket.match_label);
    const backendMatchDate = ticket.match_date ?? fixture?.match_date ?? null;
    const dateParts = backendMatchDate
        ? {
              dateDay: new Date(backendMatchDate).toLocaleString("en-US", { day: "2-digit" }),
              dateMonth: new Date(backendMatchDate)
                  .toLocaleString("en-US", { month: "short" })
                  .toUpperCase(),
              dateYear: String(new Date(backendMatchDate).getFullYear()),
              time: new Date(backendMatchDate).toLocaleString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
              }),
              bookedOn: formatDateParts(ticket.issued_at).bookedOn,
          }
        : formatMatchDateFromLabel(match.matchDate, ticket.issued_at);

    const homeTeam = ticket.home_club_name ?? fixture?.home_club_name ?? match.homeTeam;
    const awayTeam = ticket.away_club_name ?? fixture?.away_club_name ?? match.awayTeam;

    return {
        ...demoTicket,
        ...holder,
        id: String(ticket.id),
        ticketCode: ticket.ticket_code || ticket.qr_payload || `TKT-${ticket.id}`,
        competition: ticket.competition_name ?? fixture?.competition_name ?? "Match Ticket",
        title: `${homeTeam} vs ${awayTeam}`,
        homeTeam,
        awayTeam,
        homeLogo: ticket.home_club_logo_url ?? fixture?.home_club_logo_url ?? "",
        awayLogo: ticket.away_club_logo_url ?? fixture?.away_club_logo_url ?? "",
        venue: ticket.venue || fixture?.venue || "Venue to be confirmed",
        location: `Home venue for ${homeTeam}`,
        ticketType: ticket.ticket_type_name || "Match Ticket",
        quantity: "1",
        seats: "General Admission",
        section: "General",
        row: "Not assigned",
        gate: "QR ready",
        access: "Standard matchday access",
        price: "See payment receipt",
        orderId: `#ORDER-${ticket.order}`,
        status: normalizeStatus(ticket.status),
        ...dateParts,
    };
}

function normalizeMatchName(value: string) {
    return value
        .toLowerCase()
        .replace(/\s+-\s+\d{4}-\d{2}-\d{2}.*/, "")
        .replace(/\s+/g, " ")
        .trim();
}

function findFixtureForTicket(ticket: TicketApi, fixtures: PublicFixtureApi[]) {
    const byId = fixtures.find((fixture) => fixture.id === ticket.match_id);

    if (byId) {
        return byId;
    }

    const ticketMatchName = normalizeMatchName(ticket.match_label);

    return (
        fixtures.find((fixture) =>
            normalizeMatchName(`${fixture.home_club_name} vs ${fixture.away_club_name}`) === ticketMatchName,
        ) ?? null
    );
}

function fixtureDateParts(fixture: PublicFixtureApi) {
    const parts = formatDateParts(fixture.match_date);

    return {
        day: parts.dateDay,
        month: parts.dateMonth,
        time: parts.time,
        full: `${parts.dateDay} ${parts.dateMonth} ${parts.dateYear} • ${parts.time}`,
    };
}

function TeamMark({ name, logo }: { name: string; logo: string }) {
    return (
        <SafeImage
            src={logo}
            alt={name}
            className={styles.teamLogoImage}
            fallbackClassName={styles.teamFallbackBadge}
            fallback={buildTeamInitials(name)}
        />
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
    const navigate = useNavigate();
    const { currentUser } = useCurrentUser();
    const [ticket, setTicket] = useState<TicketApi | null>(null);
    const [allTickets, setAllTickets] = useState<TicketApi[]>([]);
    const [publicFixture, setPublicFixture] = useState<PublicFixtureApi | null>(null);
    const [recommendedFixtures, setRecommendedFixtures] = useState<PublicFixtureApi[]>([]);
    const [qrObjectUrl, setQrObjectUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [actionMessage, setActionMessage] = useState("");
    const [activeTab, setActiveTab] = useState<TicketDetailTab>("ticket");
    const qrSectionRef = useRef<HTMLElement | null>(null);
    const matchInfoRef = useRef<HTMLElement | null>(null);
    const entryInfoRef = useRef<HTMLElement | null>(null);

    const ticketHolder = useMemo(
        () => buildTicketHolder(currentUser as TicketHolderSource),
        [currentUser],
    );

    const ticketView = useMemo(
        () => mapTicketToViewModel(ticket, ticketHolder, publicFixture),
        [publicFixture, ticket, ticketHolder],
    );
    const canFetchBackendQr = Boolean(ticket?.id);

    const relatedTickets = useMemo(() => {
        if (!ticket) return [];

        return allTickets
            .filter(
                (candidate) =>
                    candidate.order === ticket.order ||
                    candidate.match_id === ticket.match_id,
            )
            .sort((a, b) => Number(a.id) - Number(b.id));
    }, [allTickets, ticket]);

    function scrollToSection(tab: TicketDetailTab) {
        setActiveTab(tab);
        const target =
            tab === "ticket" ? qrSectionRef.current : tab === "match" ? matchInfoRef.current : entryInfoRef.current;
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

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

                    const [tickets, fixtures] = await Promise.all([
                        getMyTickets(),
                        getPublicFixtures().catch(() => [] as PublicFixtureApi[]),
                    ]);
                    const loadedTicket =
                        tickets.find((candidate) => String(candidate.id) === String(ticketId)) ?? null;
                    const matchingFixture = loadedTicket
                        ? findFixtureForTicket(loadedTicket, fixtures)
                        : null;

                    if (isMounted) {
                        setTicket(loadedTicket);
                        setAllTickets(tickets);
                        setPublicFixture(matchingFixture ?? null);
                        setRecommendedFixtures(
                            fixtures
                                .filter((fixture) => fixture.id !== loadedTicket?.match_id)
                                .slice(0, 3),
                        );
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
            setActionMessage("Ticket ID copied to clipboard.");
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

    function handleTransferTicket() {
        setActionMessage(
            "Ticket transfer needs the backend transfer endpoint. For now, contact support with this ticket ID.",
        );
    }

    async function shareTicket() {
        const shareData = {
            title: `League OS ticket: ${ticketView.title}`,
            text: `${ticketView.title} • ${ticketView.dateDay} ${ticketView.dateMonth} ${ticketView.dateYear} • ${ticketView.ticketCode}`,
            url: window.location.href,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                setActionMessage("Ticket share sheet opened.");
                return;
            }

            await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
            setActionMessage("Ticket link copied. You can now share it manually.");
        } catch {
            setActionMessage("Share was cancelled or blocked by the browser.");
        }
    }

    return (
        <section className={styles.page}>
            <div className={styles.breadcrumb}>
                Home <span>›</span> My Tickets <span>›</span> View Ticket
            </div>

            <header className={styles.pageHeader}>
                <div>
                    <h1>Ticket QR & Match Details</h1>
                    <p>Use this page at the gate to present your QR code and confirm match access.</p>
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
                <button
                    type="button"
                    className={activeTab === "ticket" ? styles.activeTab : ""}
                    onClick={() => scrollToSection("ticket")}
                >
                    Ticket Details
                </button>
                <button
                    type="button"
                    className={activeTab === "match" ? styles.activeTab : ""}
                    onClick={() => scrollToSection("match")}
                >
                    Match Info
                </button>
                <button
                    type="button"
                    className={activeTab === "entry" ? styles.activeTab : ""}
                    onClick={() => scrollToSection("entry")}
                >
                    Entry Info
                </button>
            </nav>

            <div className={styles.detailGrid}>
                <main className={styles.mainColumn}>
                    {actionMessage ? (
                        <section className={styles.actionMessage} role="status">
                            <Info size={18} strokeWidth={2.3} aria-hidden="true" />
                            {actionMessage}
                        </section>
                    ) : null}

                    <section className={styles.ticketPreviewCard} ref={qrSectionRef}>
                        <div className={styles.cardHeader}>
                            <h2>Ticket Preview</h2>
                            {isLoading ? <span>Loading...</span> : null}
                        </div>

                        <TicketQrPreview
                            qrObjectUrl={qrObjectUrl}
                            ticketCode={ticketView.ticketCode}
                        />
                    </section>

                    {relatedTickets.length > 1 ? (
                        <section className={styles.relatedTicketsPanel}>
                            <div className={styles.cardHeader}>
                                <h2>Tickets in this purchase</h2>
                                <span>{relatedTickets.length} tickets</span>
                            </div>

                            <div className={styles.relatedTicketList}>
                                {relatedTickets.map((relatedTicket) => (
                                    <Link
                                        to={`/dashboard/tickets/${relatedTicket.id}`}
                                        key={relatedTicket.id}
                                        className={
                                            String(relatedTicket.id) === String(ticket?.id)
                                                ? `${styles.relatedTicketItem} ${styles.activeRelatedTicket}`
                                                : styles.relatedTicketItem
                                        }
                                    >
                                        <span>{relatedTicket.ticket_type_name}</span>
                                        <strong>{String(relatedTicket.ticket_code).slice(0, 8)}...</strong>
                                        <em>{normalizeStatus(relatedTicket.status)}</em>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ) : null}

                    <section className={styles.infoPanel} ref={matchInfoRef}>
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

                    <section className={styles.entryNotice} ref={entryInfoRef}>
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
                        <button
                            type="button"
                            className={styles.primaryAction}
                            onClick={() => scrollToSection("ticket")}
                        >
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

                        <button
                            type="button"
                            className={styles.secondaryAction}
                            onClick={handleTransferTicket}
                        >
                            <ArrowLeftRight size={18} strokeWidth={2.4} aria-hidden="true" />
                            Transfer Ticket
                        </button>

                        <button
                            type="button"
                            className={styles.secondaryAction}
                            onClick={() => navigate("/profile/support")}
                        >
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

                        <button
                            type="button"
                            className={styles.secondaryAction}
                            onClick={() => void shareTicket()}
                        >
                            <Share2 size={18} strokeWidth={2.4} aria-hidden="true" />
                            Share Ticket
                        </button>
                    </section>

                    <section className={styles.recommendedPanel}>
                        <div className={styles.recommendedHeader}>
                            <h2>Recommended For You</h2>
                            <Link to="/tickets">More Matches →</Link>
                        </div>

                        {recommendedFixtures.map((fixture) => {
                            const fixtureDate = fixtureDateParts(fixture);

                            return (
                                <article className={styles.recommendedMatch} key={fixture.id}>
                                    <div>
                                        <span>{fixtureDate.month}</span>
                                        <strong>{fixtureDate.day}</strong>
                                        <em>{fixtureDate.time}</em>
                                    </div>

                                    <section>
                                        <h3>{fixture.home_club_name} vs {fixture.away_club_name}</h3>
                                        <p>{fixtureDate.full}</p>
                                        <small>{fixture.venue || "Venue to be confirmed"}</small>
                                    </section>

                                    <Link to={`/tickets/${fixture.id}/checkout`}>Buy Tickets</Link>
                                </article>
                            );
                        })}
                    </section>

                    <section className={styles.sponsorPanel}>
                        <span>Sponsored</span>
                        <h2>Matchday partner space</h2>
                        <p>Use this slot for a club sponsor, ticket bundle, food voucher, transport partner or broadcast promotion.</p>
                        <Link to="/sponsor/apply">Advertise Here →</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default TicketDetailPage;
