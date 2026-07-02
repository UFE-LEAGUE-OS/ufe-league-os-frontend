import {
    AlertCircle,
    ArrowRight,
    Bell,
    CheckCircle2,
    ChevronDown,
    CircleHelp,
    Clock3,
    FileText,
    Headphones,
    LifeBuoy,
    Mail,
    MessageSquare,
    Phone,
    Search,
    Send,
    ShieldCheck,
    Ticket,
    Trophy,
    X,
    Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./SupportPage.module.css";

type SupportCategory =
    | "All"
    | "Tickets"
    | "Payments"
    | "Memberships"
    | "Account"
    | "Fantasy";

interface SummaryCard {
    label: string;
    value: string;
    detail: string;
    icon: LucideIcon;
    tone: "purple" | "green" | "orange" | "blue";
}

interface FaqItem {
    id: string;
    category: Exclude<SupportCategory, "All">;
    question: string;
    answer: string;
    icon: LucideIcon;
}

interface SupportRequest {
    id: string;
    title: string;
    status: "Open" | "Pending" | "Resolved";
    date: string;
    category: string;
    message?: string;
}

const categories: SupportCategory[] = [
    "All",
    "Tickets",
    "Payments",
    "Memberships",
    "Account",
    "Fantasy",
];

const faqItems: FaqItem[] = [
    {
        id: "qr-ticket",
        category: "Tickets",
        question: "Where do I find my QR ticket?",
        answer:
            "Open My Tickets and select Open QR on the active ticket. You can also download the ticket before matchday in case your network is weak.",
        icon: Ticket,
    },
    {
        id: "ticket-transfer",
        category: "Tickets",
        question: "Can I transfer a ticket to another fan?",
        answer:
            "Ticket transfer is planned for the fan ticket wallet. The current frontend shows the action while backend transfer rules are finalized.",
        icon: Send,
    },
    {
        id: "failed-payment",
        category: "Payments",
        question: "What should I do if a payment fails?",
        answer:
            "Open Payments, find the failed record and use Retry. If money was deducted but the ticket or membership did not activate, contact support with the payment reference.",
        icon: AlertCircle,
    },
    {
        id: "receipt",
        category: "Payments",
        question: "Where can I download receipts?",
        answer:
            "Receipts are available from Payments. Select a payment and use Download Receipt from the receipt detail panel.",
        icon: FileText,
    },
    {
        id: "membership-card",
        category: "Memberships",
        question: "Where is my digital membership card?",
        answer:
            "Open My Memberships and select the active club membership. Your digital card, QR preview and benefits are listed there.",
        icon: Trophy,
    },
    {
        id: "profile-edit",
        category: "Account",
        question: "Why does my profile information disappear after refresh?",
        answer:
            "Some profile fields are currently frontend-only until the backend profile persistence endpoint is connected. Once connected, saved fields will remain after refresh.",
        icon: ShieldCheck,
    },
    {
        id: "login-security",
        category: "Account",
        question: "How do I secure my account?",
        answer:
            "Open Privacy & Security to review active sessions, login alerts, profile privacy and password controls.",
        icon: ShieldCheck,
    },
    {
        id: "fantasy",
        category: "Fantasy",
        question: "When will fantasy league support be fully active?",
        answer:
            "Fantasy screens are being prepared in the fan area. Full scoring, squads, transfers and competition rules need backend fantasy endpoints.",
        icon: Zap,
    },
];

const defaultSupportRequests: SupportRequest[] = [
    {
        id: "LOS-SUP-0018",
        title: "Receipt download request",
        status: "Resolved",
        date: "18 May 2025",
        category: "Payments",
    },
    {
        id: "LOS-SUP-0017",
        title: "Ticket QR not opening",
        status: "Pending",
        date: "16 May 2025",
        category: "Tickets",
    },
    {
        id: "LOS-SUP-0016",
        title: "Profile update question",
        status: "Open",
        date: "14 May 2025",
        category: "Account",
    },
];

const SUPPORT_REQUESTS_STORAGE_KEY = "leagueos:fan-support-requests";

function readLocalSupportRequests(): SupportRequest[] {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const rawValue = window.localStorage.getItem(SUPPORT_REQUESTS_STORAGE_KEY);

        if (!rawValue) {
            return [];
        }

        const parsedValue = JSON.parse(rawValue) as SupportRequest[];

        return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
        return [];
    }
}

function writeLocalSupportRequests(requests: SupportRequest[]) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(
            SUPPORT_REQUESTS_STORAGE_KEY,
            JSON.stringify(requests),
        );
    } catch {
        // Local storage can fail in private browsing.
    }
}

function createLocalSupportRequest(topic: string, message: string): SupportRequest {
    const date = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date());

    return {
        id: `LOS-LOCAL-${Date.now().toString().slice(-6)}`,
        title: `${topic} support request`,
        status: "Open",
        date,
        category: topic,
        message,
    };
}

function getStatusClass(status: SupportRequest["status"]) {
    if (status === "Resolved") {
        return styles.resolvedStatus;
    }

    if (status === "Pending") {
        return styles.pendingStatus;
    }

    return styles.openStatus;
}

function SupportPage() {
    const [activeCategory, setActiveCategory] = useState<SupportCategory>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedFaqId, setExpandedFaqId] = useState(faqItems[0].id);
    const [supportTopic, setSupportTopic] = useState("Tickets");
    const [supportMessage, setSupportMessage] = useState("");
    const [saveMessage, setSaveMessage] = useState("");
    const [supportRequests, setSupportRequests] = useState<SupportRequest[]>(() => {
        const localRequests = readLocalSupportRequests();

        return [...localRequests, ...defaultSupportRequests].slice(0, 6);
    });

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const openRequestCount = useMemo(
        () =>
            supportRequests.filter(
                (request) =>
                    request.status === "Open" || request.status === "Pending",
            ).length,
        [supportRequests],
    );

    const filteredFaqs = useMemo(() => {
        return faqItems.filter((item) => {
            const matchesCategory =
                activeCategory === "All" || item.category === activeCategory;

            const matchesSearch =
                !normalizedSearchQuery ||
                `${item.question} ${item.answer} ${item.category}`
                    .toLowerCase()
                    .includes(normalizedSearchQuery);

            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, normalizedSearchQuery]);

    const summaryCards: SummaryCard[] = [
        {
            label: "Support Status",
            value: "Online",
            detail: "Fan support ready",
            icon: Headphones,
            tone: "green",
        },
        {
            label: "Open Requests",
            value: String(openRequestCount),
            detail: "Local support queue",
            icon: MessageSquare,
            tone: "purple",
        },
        {
            label: "Avg Response",
            value: "24h",
            detail: "Target response time",
            icon: Clock3,
            tone: "blue",
        },
        {
            label: "Help Topics",
            value: String(faqItems.length),
            detail: "Across fan modules",
            icon: CircleHelp,
            tone: "orange",
        },
    ];

    function clearFilters() {
        setSearchQuery("");
        setActiveCategory("All");
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedMessage = supportMessage.trim();

        if (!trimmedMessage) {
            setSaveMessage("Please describe the issue before submitting.");
            return;
        }

        const newRequest = createLocalSupportRequest(
            supportTopic,
            trimmedMessage,
        );

        const savedLocalRequests = readLocalSupportRequests();
        const updatedLocalRequests = [newRequest, ...savedLocalRequests].slice(0, 10);

        writeLocalSupportRequests(updatedLocalRequests);

        setSupportRequests(
            [...updatedLocalRequests, ...defaultSupportRequests].slice(0, 6),
        );

        setSaveMessage(
            `Support request ${newRequest.id} saved locally. Backend support ticket creation is not available yet.`,
        );
        setSupportMessage("");
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>Fan Help Center</span>
                    <h1>Support</h1>
                    <p>
                        Get help with tickets, memberships, payments, account access,
                        fantasy leagues and matchday issues.
                    </p>
                </div>

                <Link to="/profile/notifications" className={styles.primaryHeaderAction}>
                    <Bell size={18} strokeWidth={2.4} aria-hidden="true" />
                    Notification Settings
                </Link>
            </header>

            {saveMessage ? (
                <div className={styles.saveMessage} role="status">
                    <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                    {saveMessage}
                </div>
            ) : null}

            <section className={styles.summaryGrid} aria-label="Support summary">
                {summaryCards.map((card) => {
                    const CardIcon = card.icon;

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

                            <CardIcon size={38} strokeWidth={2.1} aria-hidden="true" />
                        </article>
                    );
                })}
            </section>

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.helpHero}>
                        <div>
                            <span>Need help?</span>
                            <h2>Search support before creating a request</h2>
                            <p>
                                Most fan issues can be solved from tickets, payments,
                                memberships or account settings.
                            </p>
                        </div>

                        <div className={styles.supportSearch}>
                            <Search size={18} strokeWidth={2.3} aria-hidden="true" />

                            <input
                                type="search"
                                placeholder="Search QR tickets, receipts, memberships, profile..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />

                            {searchQuery ? (
                                <button
                                    type="button"
                                    aria-label="Clear support search"
                                    onClick={() => setSearchQuery("")}
                                >
                                    <X size={16} strokeWidth={2.4} />
                                </button>
                            ) : null}
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Help Topics</h2>
                                <p>
                                    Choose a category or search for the issue you are facing.
                                </p>
                            </div>
                        </div>

                        <div className={styles.categoryPills}>
                            {categories.map((category) => (
                                <button
                                    type="button"
                                    key={category}
                                    className={
                                        activeCategory === category
                                            ? styles.activeCategoryPill
                                            : ""
                                    }
                                    onClick={() => setActiveCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {filteredFaqs.length > 0 ? (
                            <div className={styles.faqList}>
                                {filteredFaqs.map((item) => {
                                    const ItemIcon = item.icon;
                                    const expanded = expandedFaqId === item.id;

                                    return (
                                        <article
                                            className={`${styles.faqItem} ${
                                                expanded ? styles.expandedFaqItem : ""
                                            }`}
                                            key={item.id}
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setExpandedFaqId(
                                                        expanded ? "" : item.id,
                                                    )
                                                }
                                            >
                                                <span className={styles.faqIcon}>
                                                    <ItemIcon
                                                        size={22}
                                                        strokeWidth={2.4}
                                                        aria-hidden="true"
                                                    />
                                                </span>

                                                <span>
                                                    <strong>{item.question}</strong>
                                                    <small>{item.category}</small>
                                                </span>

                                                <ChevronDown
                                                    size={18}
                                                    strokeWidth={2.5}
                                                    aria-hidden="true"
                                                />
                                            </button>

                                            {expanded ? <p>{item.answer}</p> : null}
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <section className={styles.emptyState}>
                                <CircleHelp size={38} strokeWidth={2.2} aria-hidden="true" />
                                <h2>No help topics found</h2>
                                <p>
                                    Try a different search term, change the category or clear
                                    the filters.
                                </p>

                                <button type="button" onClick={clearFilters}>
                                    Clear Filters
                                </button>
                            </section>
                        )}
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Create Support Request</h2>
                                <p>
                                    Send a support request when the help topics do not solve the issue.
                                </p>
                            </div>
                        </div>

                        <form className={styles.supportForm} onSubmit={handleSubmit}>
                            <label>
                                <span>Topic</span>
                                <select
                                    value={supportTopic}
                                    onChange={(event) => setSupportTopic(event.target.value)}
                                >
                                    <option>Tickets</option>
                                    <option>Payments</option>
                                    <option>Memberships</option>
                                    <option>Account</option>
                                    <option>Fantasy</option>
                                    <option>Other</option>
                                </select>
                            </label>

                            <label>
                                <span>Message</span>
                                <textarea
                                    placeholder="Describe the issue and include any ticket, receipt or payment reference..."
                                    value={supportMessage}
                                    onChange={(event) =>
                                        setSupportMessage(event.target.value)
                                    }
                                    rows={6}
                                    required
                                />
                            </label>

                            <button type="submit" disabled={!supportMessage.trim()}>
                                <Send size={17} strokeWidth={2.4} aria-hidden="true" />
                                Submit Request
                            </button>
                        </form>
                    </section>

                    <section className={styles.quickLinksPanel}>
                        <article>
                            <Ticket size={28} strokeWidth={2.3} aria-hidden="true" />
                            <h3>Ticket Help</h3>
                            <p>Open your ticket wallet, QR codes and ticket history.</p>
                            <Link to="/dashboard/tickets">
                                My Tickets <ArrowRight size={15} />
                            </Link>
                        </article>

                        <article>
                            <FileText size={28} strokeWidth={2.3} aria-hidden="true" />
                            <h3>Payment Receipts</h3>
                            <p>Review payments, failed checkouts and receipt downloads.</p>
                            <Link to="/profile/payments">
                                Payments <ArrowRight size={15} />
                            </Link>
                        </article>

                        <article>
                            <Trophy size={28} strokeWidth={2.3} aria-hidden="true" />
                            <h3>Membership Help</h3>
                            <p>View club cards, renewals and membership benefits.</p>
                            <Link to="/dashboard/memberships">
                                Memberships <ArrowRight size={15} />
                            </Link>
                        </article>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.contactCard}>
                        <span>
                            <Headphones size={38} strokeWidth={2.3} aria-hidden="true" />
                        </span>

                        <div>
                            <h2>Contact Fan Support</h2>
                            <p>
                                Support can help with account, ticket, payment and membership questions.
                            </p>
                        </div>

                        <div className={styles.contactMethods}>
                            <a href="mailto:support@leagueos.local">
                                <Mail size={16} strokeWidth={2.4} aria-hidden="true" />
                                Email Support
                            </a>

                            <a href="tel:+256700000000">
                                <Phone size={16} strokeWidth={2.4} aria-hidden="true" />
                                Call Support
                            </a>
                        </div>
                    </section>

                    <section className={styles.matchdayCard}>
                        <span>
                            <LifeBuoy size={38} strokeWidth={2.3} aria-hidden="true" />
                        </span>

                        <div>
                            <h2>Matchday issue?</h2>
                            <p>
                                For QR tickets, entry gates or payment confirmation issues,
                                include your order ID and match name.
                            </p>
                        </div>

                        <Link to="/dashboard/tickets">Open Ticket Wallet →</Link>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <MessageSquare
                                    size={25}
                                    strokeWidth={2.3}
                                    aria-hidden="true"
                                />
                            </span>

                            <div>
                                <h2>Recent Requests</h2>
                                <p>Your latest local support requests. Backend ticket submission is not available yet.</p>
                            </div>
                        </div>

                        <div className={styles.requestList}>
                            {supportRequests.map((request) => (
                                <article className={styles.requestItem} key={request.id}>
                                    <div>
                                        <h3>{request.title}</h3>
                                        <p>{request.id} • {request.category}</p>
                                        <small>{request.date}</small>
                                    </div>

                                    <span className={getStatusClass(request.status)}>
                                        {request.status}
                                    </span>
                                </article>
                            ))}
                        </div>
                    </section>
                    <section className={styles.supportSponsorCard} aria-label="Sponsored support placement">
                        <span>Sponsored</span>

                        <div>
                            <h2>Support Partner Slot</h2>
                            <p>
                                Use this space for verified sponsor support, fan safety
                                campaigns, ticketing partners, matchday assistance or membership offers.
                            </p>
                        </div>

                        <Link to="/sponsor/apply">Explore Partner Options →</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default SupportPage;
