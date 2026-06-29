import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    CreditCard,
    Loader2,
    MapPin,
    ShieldCheck,
    Ticket,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    getMatchTicketTypes,
    initializeTicketCheckout,
} from "../../services/ticketCheckoutService";
import type { TicketTypeApi } from "../../services/ticketCheckoutService";
import styles from "./TicketCheckoutPage.module.css";

type DemoMatch = {
    id: string;
    label: string;
    competition: string;
    date: string;
    time: string;
    venue: string;
    homeTeam: string;
    awayTeam: string;
};

type ApiError = {
    response?: {
        data?: {
            detail?: string;
            message?: string;
            error?: string;
            ticket_type_id?: string[] | string;
            ticket_type?: string[] | string;
            quantity?: string[] | string;
            non_field_errors?: string[];
        };
    };
};

const demoMatches: Record<string, DemoMatch> = {
    "1": {
        id: "1",
        label: "KCCA FC vs Vipers SC",
        competition: "Uganda Premier League",
        date: "Sat, 24 May 2025",
        time: "4:00 PM",
        venue: "MTN Omondi Stadium, Lugogo",
        homeTeam: "KCCA FC",
        awayTeam: "Vipers SC",
    },
    "2": {
        id: "2",
        label: "SC Villa vs Express FC",
        competition: "Uganda Premier League",
        date: "Sun, 25 May 2025",
        time: "4:00 PM",
        venue: "Mandela National Stadium, Namboole",
        homeTeam: "SC Villa",
        awayTeam: "Express FC",
    },
    "3": {
        id: "3",
        label: "Betway KOBS vs Stanbic Pirates",
        competition: "Nile Special Rugby Premiership",
        date: "Sat, 31 May 2025",
        time: "2:00 PM",
        venue: "Kyadondo Rugby Club",
        homeTeam: "Betway KOBS",
        awayTeam: "Stanbic Pirates",
    },
};

function formatCurrency(amount: number, currency = "UGX") {
    return `${currency} ${amount.toLocaleString()}`;
}

function firstApiMessage(value?: string | string[]) {
    if (Array.isArray(value)) return value[0];
    return value;
}

function getCheckoutErrorMessage(error: unknown) {
    const data = (error as ApiError).response?.data;

    return (
        firstApiMessage(data?.detail) ||
        firstApiMessage(data?.message) ||
        firstApiMessage(data?.error) ||
        firstApiMessage(data?.ticket_type_id) ||
        firstApiMessage(data?.ticket_type) ||
        firstApiMessage(data?.quantity) ||
        firstApiMessage(data?.non_field_errors) ||
        "Ticket checkout could not be initialized. Confirm the backend has active ticket types for this match and try again."
    );
}

function getFallbackTicketTypes(matchId: string): TicketTypeApi[] {
    const match = demoMatches[matchId] ?? demoMatches["1"];

    return [
        {
            id: 1,
            match: Number(matchId) || 1,
            match_label: match.label,
            name: "Ordinary",
            description: "Ordinary match access ticket.",
            price: "10000.00",
            currency: "UGX",
            quantity_available: 100,
            quantity_sold: 0,
            active_reserved_quantity: 0,
            remaining_quantity: 100,
            status: "ACTIVE",
        },
        {
            id: 2,
            match: Number(matchId) || 1,
            match_label: match.label,
            name: "VIP",
            description: "VIP match access ticket.",
            price: "50000.00",
            currency: "UGX",
            quantity_available: 25,
            quantity_sold: 0,
            active_reserved_quantity: 0,
            remaining_quantity: 25,
            status: "ACTIVE",
        },
    ];
}

function getDemoMatch(matchId: string): DemoMatch {
    return demoMatches[matchId] ?? {
        id: matchId,
        label: "League OS Demo Match",
        competition: "League OS Ticketing",
        date: "Upcoming match",
        time: "Match time",
        venue: "Match venue",
        homeTeam: "Home Team",
        awayTeam: "Away Team",
    };
}

function TicketCheckoutPage() {
    const { matchId = "1" } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const preferredTier = searchParams.get("tier") === "vip" ? "vip" : "ordinary";

    const [ticketTypes, setTicketTypes] = useState<TicketTypeApi[]>([]);
    const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<number | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pageMessage, setPageMessage] = useState("");
    const [usesLiveBackendTickets, setUsesLiveBackendTickets] = useState(false);

    const demoMatch = useMemo(() => getDemoMatch(matchId), [matchId]);

    const selectedTicketType = useMemo(() => {
        return (
            ticketTypes.find((ticketType) => ticketType.id === selectedTicketTypeId) ??
            ticketTypes[0] ??
            null
        );
    }, [selectedTicketTypeId, ticketTypes]);

    const ticketPrice = Number(selectedTicketType?.price ?? 0);
    const totalAmount = ticketPrice * quantity;
    const remainingQuantity = selectedTicketType?.remaining_quantity ?? 1;
    const maxQuantity = Math.max(1, Math.min(10, remainingQuantity));

    useEffect(() => {
        let isMounted = true;

        const timeoutId = window.setTimeout(() => {
            async function loadTicketTypes() {
                setIsLoading(true);
                setPageMessage("");

                try {
                    const response = await getMatchTicketTypes(matchId);

                    if (!isMounted) return;

                    const activeTypes = response.ticket_types.filter(
                        (ticketType) => ticketType.status === "ACTIVE",
                    );

                    setTicketTypes(activeTypes);
                    setUsesLiveBackendTickets(activeTypes.length > 0);

                    const preferredType =
                        activeTypes.find((ticketType) =>
                            ticketType.name.toLowerCase().includes(preferredTier),
                        ) ?? activeTypes[0];

                    setSelectedTicketTypeId(preferredType?.id ?? null);
                } catch {
                    if (!isMounted) return;

                    const fallbackTypes = getFallbackTicketTypes(matchId);
                    setUsesLiveBackendTickets(false);
                    setTicketTypes(fallbackTypes);

                    const preferredType =
                        fallbackTypes.find((ticketType) =>
                            ticketType.name.toLowerCase().includes(preferredTier),
                        ) ?? fallbackTypes[0];

                    setSelectedTicketTypeId(preferredType?.id ?? null);
                    setPageMessage(
                        "Live backend ticket types were not found for this match, so sample ticket types are shown for browsing only. Flutterwave payment is disabled until this match has real backend ticket types.",
                    );
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                }
            }

            void loadTicketTypes();
        }, 0);

        return () => {
            isMounted = false;
            window.clearTimeout(timeoutId);
        };
    }, [matchId, preferredTier]);

    async function handleCheckout() {
        if (!selectedTicketType) {
            setPageMessage("Please select a ticket type before continuing.");
            return;
        }

        if (!usesLiveBackendTickets) {
            setPageMessage(
                "This match is currently using public demo ticket data only. Please seed real backend ticket types for this match before using Flutterwave checkout.",
            );
            return;
        }

        setIsSubmitting(true);
        setPageMessage("");

        try {
            const response = await initializeTicketCheckout({
                ticket_type_id: selectedTicketType.id,
                quantity,
            });

            localStorage.setItem(
                "league_os_pending_ticket_checkout",
                JSON.stringify({
                    tx_ref: response.tx_ref,
                    order_id: response.order.id,
                    match_id: matchId,
                    ticket_type_id: selectedTicketType.id,
                    quantity,
                }),
            );

            if (response.checkout_url) {
                window.location.assign(response.checkout_url);
                return;
            }

            navigate("/tickets/payment/processing", {
                replace: true,
                state: { tx_ref: response.tx_ref },
            });
        } catch (error) {
            setPageMessage(getCheckoutErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className={styles.page}>
            <div className={styles.breadcrumb}>
                <Link to="/tickets">
                    <ArrowLeft size={16} strokeWidth={2.3} aria-hidden="true" />
                    Back to tickets
                </Link>
            </div>

            <header className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>Ticket Checkout</span>
                    <h1>Complete your match ticket order</h1>
                    <p>
                        Select your ticket type and quantity. Payment is completed securely
                        through Flutterwave.
                    </p>
                </div>
            </header>

            {pageMessage ? (
                <div className={styles.notice} role="alert">
                    <AlertTriangle size={18} strokeWidth={2.3} aria-hidden="true" />
                    {pageMessage}
                </div>
            ) : null}

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.matchCard}>
                        <span>{demoMatch.competition}</span>
                        <h2>{demoMatch.label}</h2>

                        <div className={styles.matchTeams}>
                            <strong>{demoMatch.homeTeam}</strong>
                            <b>VS</b>
                            <strong>{demoMatch.awayTeam}</strong>
                        </div>

                        <div className={styles.matchMeta}>
                            <p>
                                <CalendarDays size={16} strokeWidth={2.3} aria-hidden="true" />
                                {demoMatch.date} • {demoMatch.time}
                            </p>
                            <p>
                                <MapPin size={16} strokeWidth={2.3} aria-hidden="true" />
                                {demoMatch.venue}
                            </p>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Select Ticket Type</h2>
                                <p>Choose the ticket category you want to purchase.</p>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className={styles.loadingBox}>
                                <Loader2 size={24} strokeWidth={2.3} aria-hidden="true" />
                                Loading ticket types...
                            </div>
                        ) : (
                            <div className={styles.ticketTypeGrid}>
                                {ticketTypes.map((ticketType) => {
                                    const isSelected = ticketType.id === selectedTicketTypeId;

                                    return (
                                        <button
                                            type="button"
                                            key={ticketType.id}
                                            className={
                                                isSelected
                                                    ? `${styles.ticketTypeCard} ${styles.selectedTicketType}`
                                                    : styles.ticketTypeCard
                                            }
                                            onClick={() => {
                                                setSelectedTicketTypeId(ticketType.id);
                                                setQuantity(1);
                                            }}
                                        >
                                            <span>
                                                <Ticket size={22} strokeWidth={2.3} aria-hidden="true" />
                                            </span>

                                            <div>
                                                <h3>{ticketType.name}</h3>
                                                <p>{ticketType.description || "Match access ticket"}</p>
                                            </div>

                                            <strong>
                                                {formatCurrency(Number(ticketType.price), ticketType.currency)}
                                            </strong>

                                            <small>
                                                {ticketType.remaining_quantity} tickets available
                                            </small>

                                            {isSelected ? (
                                                <em>
                                                    <CheckCircle2
                                                        size={16}
                                                        strokeWidth={2.4}
                                                        aria-hidden="true"
                                                    />
                                                    Selected
                                                </em>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </main>

                <aside className={styles.checkoutPanel}>
                    <div className={styles.sideHeader}>
                        <span>
                            <CreditCard size={26} strokeWidth={2.3} aria-hidden="true" />
                        </span>

                        <div>
                            <h2>Order Summary</h2>
                            <p>Review your ticket order before payment.</p>
                        </div>
                    </div>

                    <dl className={styles.summaryList}>
                        <div>
                            <dt>Match</dt>
                            <dd>{demoMatch.label}</dd>
                        </div>
                        <div>
                            <dt>Ticket Type</dt>
                            <dd>{selectedTicketType?.name ?? "Select ticket"}</dd>
                        </div>
                        <div>
                            <dt>Unit Price</dt>
                            <dd>
                                {selectedTicketType
                                    ? formatCurrency(ticketPrice, selectedTicketType.currency)
                                    : "UGX 0"}
                            </dd>
                        </div>
                    </dl>

                    <label className={styles.quantityField}>
                        Quantity
                        <select
                            value={quantity}
                            onChange={(event) => setQuantity(Number(event.target.value))}
                            disabled={!selectedTicketType || isSubmitting}
                        >
                            {Array.from({ length: maxQuantity }, (_, index) => index + 1).map(
                                (value) => (
                                    <option value={value} key={value}>
                                        {value}
                                    </option>
                                ),
                            )}
                        </select>
                    </label>

                    <div className={styles.totalRow}>
                        <span>Total</span>
                        <strong>
                            {selectedTicketType
                                ? formatCurrency(totalAmount, selectedTicketType.currency)
                                : "UGX 0"}
                        </strong>
                    </div>

                    <button
                        type="button"
                        className={styles.checkoutButton}
                        onClick={handleCheckout}
                        disabled={isLoading || isSubmitting || !selectedTicketType || !usesLiveBackendTickets}
                    >
                        {!usesLiveBackendTickets ? (
                            <>
                                <AlertTriangle size={18} strokeWidth={2.4} aria-hidden="true" />
                                Backend ticket types required
                            </>
                        ) : isSubmitting ? (
                            <>
                                <Loader2 size={18} strokeWidth={2.4} aria-hidden="true" />
                                Redirecting...
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={18} strokeWidth={2.4} aria-hidden="true" />
                                Pay with Flutterwave
                            </>
                        )}
                    </button>

                    <p className={styles.secureNote}>
                        Flutterwave will handle Mobile Money and card payment options on the
                        secure hosted checkout page.
                    </p>
                </aside>
            </div>
        </section>
    );
}

export default TicketCheckoutPage;
