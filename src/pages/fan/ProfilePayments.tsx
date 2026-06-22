import {
    AlertTriangle,
    CalendarDays,
    CheckCircle2,
    Clock,
    CreditCard,
    Download,
    ExternalLink,
    FileText,
    Lock,
    ReceiptText,
    RefreshCw,
    ShieldCheck,
    Ticket,
    Trophy,
    XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./PaymentMethodsPage.module.css";

const paymentStats = [
    {
        label: "Total Paid",
        value: "UGX 220K",
        detail: "Club memberships & tickets",
        icon: CreditCard,
        tone: "purple",
    },
    {
        label: "Successful Payments",
        value: "3",
        detail: "Completed through checkout",
        icon: CheckCircle2,
        tone: "green",
    },
    {
        label: "Pending Payments",
        value: "1",
        detail: "Awaiting confirmation",
        icon: Clock,
        tone: "orange",
    },
    {
        label: "Receipts",
        value: "3",
        detail: "Available to download",
        icon: ReceiptText,
        tone: "blue",
    },
];

const transactions = [
    {
        id: "tx-kobs-gold",
        title: "KCB KOBS Gold Membership",
        category: "Club Membership",
        club: "KCB KOBS",
        amount: "UGX 120,000",
        status: "Successful",
        date: "18 May 2025",
        reference: "LOS-KOBS-2025-001",
        gateway: "Flutterwave Checkout",
        icon: Trophy,
    },
    {
        id: "tx-kobs-ticket",
        title: "KCB KOBS vs Heathens RFC Ticket",
        category: "Match Ticket",
        club: "KCB KOBS",
        amount: "UGX 20,000",
        status: "Successful",
        date: "15 May 2025",
        reference: "LOS-TKT-2025-018",
        gateway: "Flutterwave Checkout",
        icon: Ticket,
    },
    {
        id: "tx-villa-silver",
        title: "SC Villa Silver Membership",
        category: "Club Membership",
        club: "SC Villa",
        amount: "UGX 80,000",
        status: "Successful",
        date: "12 Apr 2025",
        reference: "LOS-VILLA-2025-014",
        gateway: "Flutterwave Checkout",
        icon: Trophy,
    },
    {
        id: "tx-oilers-ticket",
        title: "City Oilers vs Namuwongo Blazers Ticket",
        category: "Match Ticket",
        club: "City Oilers",
        amount: "UGX 15,000",
        status: "Pending",
        date: "Today",
        reference: "LOS-TKT-2025-044",
        gateway: "Flutterwave Checkout",
        icon: Ticket,
    },
    {
        id: "tx-pirates-membership",
        title: "Black Pirates Bronze Membership",
        category: "Club Membership",
        club: "Black Pirates",
        amount: "UGX 50,000",
        status: "Failed",
        date: "Yesterday",
        reference: "LOS-PIRATES-2025-009",
        gateway: "Flutterwave Checkout",
        icon: Trophy,
    },
];

const receiptGroups = [
    {
        title: "Club Membership Receipts",
        description: "Receipts for memberships purchased from clubs.",
        icon: Trophy,
        items: [
            {
                title: "KCB KOBS Gold Membership",
                amount: "UGX 120,000",
                date: "18 May 2025",
                status: "Active Membership",
            },
            {
                title: "SC Villa Silver Membership",
                amount: "UGX 80,000",
                date: "12 Apr 2025",
                status: "Active Membership",
            },
        ],
    },
    {
        title: "Ticket Receipts",
        description: "Receipts for match tickets bought through League OS.",
        icon: Ticket,
        items: [
            {
                title: "KCB KOBS vs Heathens RFC",
                amount: "UGX 20,000",
                date: "15 May 2025",
                status: "QR Ticket Issued",
            },
        ],
    },
];

const refundItems = [
    {
        title: "No active refunds",
        description:
            "Refund requests and disputed payments will appear here when available.",
        status: "Clear",
    },
];

function getStatusClass(status: string) {
    if (status === "Successful") {
        return styles.successStatus;
    }

    if (status === "Pending") {
        return styles.pendingStatus;
    }

    if (status === "Failed") {
        return styles.failedStatus;
    }

    return styles.neutralStatus;
}

function getStatusIcon(status: string) {
    if (status === "Successful") {
        return CheckCircle2;
    }

    if (status === "Pending") {
        return Clock;
    }

    if (status === "Failed") {
        return XCircle;
    }

    return ReceiptText;
}

function PaymentMethodsPage() {
    const [checkoutPreference, setCheckoutPreference] = useState("ask-every-time");
    const [saveMessage, setSaveMessage] = useState("");

    function handleSavePreference() {
        setSaveMessage("Checkout preference saved locally for now.");
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Payments &amp; Receipts</h1>
                    <p>
                        View club membership payments, ticket receipts, failed payments,
                        refunds and Flutterwave checkout references.
                    </p>
                </div>

                <Link to="/memberships" className={styles.primaryHeaderAction}>
                    <Trophy size={18} strokeWidth={2.4} aria-hidden="true" />
                    Explore Club Memberships
                </Link>
            </header>

            <section className={styles.gatewayNotice}>
                <span>
                    <Lock size={34} strokeWidth={2.3} aria-hidden="true" />
                </span>

                <div>
                    <h2>Checkout is handled securely through Flutterwave</h2>
                    <p>
                        League OS records the payment status, receipt, membership or ticket
                        outcome. The fan chooses mobile money, card or other available
                        checkout options during the Flutterwave checkout flow.
                    </p>
                </div>

                <Link to="/profile/privacy">Payment Security</Link>
            </section>

            {saveMessage ? (
                <div className={styles.saveMessage} role="status">
                    <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                    {saveMessage}
                </div>
            ) : null}

            <section className={styles.summaryGrid} aria-label="Payment summary">
                {paymentStats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <article
                            className={`${styles.summaryCard} ${styles[stat.tone]}`}
                            key={stat.label}
                        >
                            <div>
                                <p>{stat.label}</p>
                                <strong>{stat.value}</strong>
                                <span>{stat.detail}</span>
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
                                <h2>Recent Payments</h2>
                                <p>
                                    These are payments initiated through League OS and processed
                                    through Flutterwave checkout.
                                </p>
                            </div>

                            <button type="button">
                                <Download size={17} strokeWidth={2.4} aria-hidden="true" />
                                Export
                            </button>
                        </div>

                        <div className={styles.transactionList}>
                            {transactions.map((transaction) => {
                                const TransactionIcon = transaction.icon;
                                const StatusIcon = getStatusIcon(transaction.status);

                                return (
                                    <article className={styles.transactionCard} key={transaction.id}>
                                        <span className={styles.transactionIcon}>
                                            <TransactionIcon
                                                size={24}
                                                strokeWidth={2.2}
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <div className={styles.transactionInfo}>
                                            <div className={styles.transactionTitleRow}>
                                                <h3>{transaction.title}</h3>

                                                <span className={getStatusClass(transaction.status)}>
                                                    <StatusIcon
                                                        size={14}
                                                        strokeWidth={2.6}
                                                        aria-hidden="true"
                                                    />
                                                    {transaction.status}
                                                </span>
                                            </div>

                                            <p>
                                                {transaction.category} • {transaction.club}
                                            </p>

                                            <div className={styles.transactionMeta}>
                                                <span>{transaction.gateway}</span>
                                                <span>Ref: {transaction.reference}</span>
                                                <span>{transaction.date}</span>
                                            </div>
                                        </div>

                                        <div className={styles.transactionAmount}>
                                            <strong>{transaction.amount}</strong>

                                            <div className={styles.transactionActions}>
                                                {transaction.status === "Successful" ? (
                                                    <button type="button">
                                                        <Download
                                                            size={15}
                                                            strokeWidth={2.4}
                                                            aria-hidden="true"
                                                        />
                                                        Receipt
                                                    </button>
                                                ) : null}

                                                {transaction.status === "Pending" ? (
                                                    <button type="button">
                                                        <RefreshCw
                                                            size={15}
                                                            strokeWidth={2.4}
                                                            aria-hidden="true"
                                                        />
                                                        Check Status
                                                    </button>
                                                ) : null}

                                                {transaction.status === "Failed" ? (
                                                    <button type="button">
                                                        <RefreshCw
                                                            size={15}
                                                            strokeWidth={2.4}
                                                            aria-hidden="true"
                                                        />
                                                        Retry
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className={styles.receiptGrid}>
                        {receiptGroups.map((group) => {
                            const GroupIcon = group.icon;

                            return (
                                <article className={styles.panel} key={group.title}>
                                    <div className={styles.sidePanelHeader}>
                                        <span>
                                            <GroupIcon size={26} strokeWidth={2.3} aria-hidden="true" />
                                        </span>

                                        <div>
                                            <h2>{group.title}</h2>
                                            <p>{group.description}</p>
                                        </div>
                                    </div>

                                    <div className={styles.receiptList}>
                                        {group.items.map((item) => (
                                            <article className={styles.receiptItem} key={item.title}>
                                                <div>
                                                    <h3>{item.title}</h3>
                                                    <p>
                                                        {item.date} • {item.status}
                                                    </p>
                                                </div>

                                                <strong>{item.amount}</strong>

                                                <button type="button">
                                                    <Download
                                                        size={15}
                                                        strokeWidth={2.4}
                                                        aria-hidden="true"
                                                    />
                                                    Download
                                                </button>
                                            </article>
                                        ))}
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <CreditCard size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Checkout Preference</h2>
                                <p>
                                    This only controls your preferred checkout starting point.
                                    Flutterwave still handles the payment method selection.
                                </p>
                            </div>
                        </div>

                        <label className={styles.preferenceOption}>
                            <input
                                type="radio"
                                name="checkoutPreference"
                                value="ask-every-time"
                                checked={checkoutPreference === "ask-every-time"}
                                onChange={(event) => setCheckoutPreference(event.target.value)}
                            />

                            <span>
                                <strong>Ask every time</strong>
                                <small>Show all available checkout options.</small>
                            </span>
                        </label>

                        <label className={styles.preferenceOption}>
                            <input
                                type="radio"
                                name="checkoutPreference"
                                value="mobile-money-first"
                                checked={checkoutPreference === "mobile-money-first"}
                                onChange={(event) => setCheckoutPreference(event.target.value)}
                            />

                            <span>
                                <strong>Start with mobile money</strong>
                                <small>Useful for MTN MoMo or Airtel Money checkout.</small>
                            </span>
                        </label>

                        <label className={styles.preferenceOption}>
                            <input
                                type="radio"
                                name="checkoutPreference"
                                value="card-first"
                                checked={checkoutPreference === "card-first"}
                                onChange={(event) => setCheckoutPreference(event.target.value)}
                            />

                            <span>
                                <strong>Start with card checkout</strong>
                                <small>Useful when you often pay using card options.</small>
                            </span>
                        </label>

                        <button
                            type="button"
                            className={styles.fullWidthButton}
                            onClick={handleSavePreference}
                        >
                            Save Preference
                        </button>
                    </section>

                    <section className={styles.warningCard}>
                        <AlertTriangle size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Do not store sensitive payment details here</h2>
                            <p>
                                League OS should avoid storing raw card numbers, PINs or mobile
                                money credentials. Those details belong inside the secure
                                checkout provider flow.
                            </p>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <ShieldCheck size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Payment Security</h2>
                                <p>What League OS should record after checkout.</p>
                            </div>
                        </div>

                        <div className={styles.securityList}>
                            <article>
                                <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                                <div>
                                    <strong>Payment status</strong>
                                    <p>Successful, pending, failed or refunded.</p>
                                </div>
                            </article>

                            <article>
                                <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                                <div>
                                    <strong>Gateway reference</strong>
                                    <p>Reference used to verify payment records.</p>
                                </div>
                            </article>

                            <article>
                                <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                                <div>
                                    <strong>Linked product</strong>
                                    <p>Ticket, club membership or renewal purchased.</p>
                                </div>
                            </article>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <CalendarDays size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Refunds &amp; Disputes</h2>
                                <p>Track refunds, reversals and payment issues.</p>
                            </div>
                        </div>

                        <div className={styles.refundList}>
                            {refundItems.map((item) => (
                                <article key={item.title}>
                                    <FileText size={20} strokeWidth={2.3} aria-hidden="true" />

                                    <div>
                                        <strong>{item.title}</strong>
                                        <p>{item.description}</p>
                                    </div>

                                    <span>{item.status}</span>
                                </article>
                            ))}
                        </div>

                        <Link to="/profile/support" className={styles.panelLink}>
                            Report Payment Issue
                            <ExternalLink size={15} strokeWidth={2.4} aria-hidden="true" />
                        </Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default PaymentMethodsPage;