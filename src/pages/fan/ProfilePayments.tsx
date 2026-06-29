import {
    AlertTriangle,
    ArrowUpRight,
    Banknote,
    CheckCircle2,
    Clock,
    CreditCard,
    Download,
    FileText,
    RefreshCw,
    Search,
    ShieldCheck,
    Ticket,
    Trophy,
    WalletCards,
    XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./PaymentMethodsPage.module.css";

type PaymentStatus = "Successful" | "Pending" | "Failed" | "Refunded";
type PaymentCategory = "Ticket" | "Membership" | "Sponsorship" | "Wallet";

interface PaymentRecord {
    id: string;
    title: string;
    category: PaymentCategory;
    beneficiary: string;
    amount: string;
    status: PaymentStatus;
    date: string;
    method: string;
    reference: string;
    receiptNo: string;
    description: string;
    icon: LucideIcon;
}

const payments: PaymentRecord[] = [
    {
        id: "pay-kobs-ticket",
        title: "KCB KOBS vs Heathens RFC",
        category: "Ticket",
        beneficiary: "KCB KOBS",
        amount: "UGX 40,000",
        status: "Successful",
        date: "18 May 2025",
        method: "Flutterwave • Mobile Money",
        reference: "FLW-TKT-2025-0018",
        receiptNo: "LOS-RCPT-0018",
        description: "Two VIP Stand tickets for Nile Special Rugby Premiership.",
        icon: Ticket,
    },
    {
        id: "pay-kobs-gold",
        title: "KCB KOBS Gold Membership",
        category: "Membership",
        beneficiary: "KCB KOBS",
        amount: "UGX 120,000",
        status: "Successful",
        date: "15 May 2025",
        method: "Flutterwave • Card",
        reference: "FLW-MEM-2025-0042",
        receiptNo: "LOS-RCPT-0042",
        description: "Annual Gold Membership with ticket discounts and club benefits.",
        icon: Trophy,
    },
    {
        id: "pay-oilers-ticket",
        title: "City Oilers vs Nam Blazers",
        category: "Ticket",
        beneficiary: "National Basketball League",
        amount: "UGX 15,000",
        status: "Pending",
        date: "Today",
        method: "Flutterwave • Mobile Money",
        reference: "FLW-TKT-2025-0077",
        receiptNo: "Pending",
        description: "Pending checkout confirmation for basketball match ticket.",
        icon: Ticket,
    },
    {
        id: "pay-pirates-bronze",
        title: "Black Pirates Bronze Membership",
        category: "Membership",
        beneficiary: "Black Pirates RFC",
        amount: "UGX 50,000",
        status: "Failed",
        date: "Yesterday",
        method: "Flutterwave • Mobile Money",
        reference: "FLW-MEM-2025-0031",
        receiptNo: "Not issued",
        description: "Payment failed before membership activation.",
        icon: Trophy,
    },
    {
        id: "pay-sponsor-support",
        title: "Fan Sponsor Support Pack",
        category: "Sponsorship",
        beneficiary: "Nile Special Rugby League",
        amount: "UGX 75,000",
        status: "Successful",
        date: "02 May 2025",
        method: "Flutterwave • Card",
        reference: "FLW-SPN-2025-0011",
        receiptNo: "LOS-RCPT-0011",
        description: "Fan sponsorship contribution for league campaign support.",
        icon: Banknote,
    },
    {
        id: "pay-refund-kcca",
        title: "KCCA FC vs Vipers SC Ticket Refund",
        category: "Ticket",
        beneficiary: "Uganda Premier League",
        amount: "UGX 25,000",
        status: "Refunded",
        date: "20 Apr 2025",
        method: "Flutterwave • Refund",
        reference: "FLW-REF-2025-0008",
        receiptNo: "LOS-RCPT-0008",
        description: "Refund processed after fixture postponement.",
        icon: RefreshCw,
    },
];

const paymentMethods = [
    {
        id: "mtn",
        title: "MTN Mobile Money",
        detail: "+256 77X XXX XXX",
        status: "Default",
    },
    {
        id: "airtel",
        title: "Airtel Money",
        detail: "+256 75X XXX XXX",
        status: "Available",
    },
    {
        id: "card",
        title: "Visa / Mastercard",
        detail: "Cards supported through Flutterwave",
        status: "Checkout only",
    },
];

const categoryOptions: Array<"All" | PaymentCategory> = [
    "All",
    "Ticket",
    "Membership",
    "Sponsorship",
    "Wallet",
];

function getStatusClass(status: PaymentStatus) {
    if (status === "Successful") return styles.successStatus;
    if (status === "Pending") return styles.pendingStatus;
    if (status === "Failed") return styles.failedStatus;
    return styles.refundedStatus;
}

function parseAmount(value: string) {
    const numeric = value.replace(/[^\d]/g, "");
    return Number(numeric || 0);
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
    return (
        <span className={getStatusClass(status)}>
            {status === "Successful" ? (
                <CheckCircle2 size={14} strokeWidth={2.4} aria-hidden="true" />
            ) : null}
            {status === "Pending" ? (
                <Clock size={14} strokeWidth={2.4} aria-hidden="true" />
            ) : null}
            {status === "Failed" ? (
                <XCircle size={14} strokeWidth={2.4} aria-hidden="true" />
            ) : null}
            {status === "Refunded" ? (
                <RefreshCw size={14} strokeWidth={2.4} aria-hidden="true" />
            ) : null}
            {status}
        </span>
    );
}

function WalletPaymentCenter() {
    const [activeCategory, setActiveCategory] =
        useState<"All" | PaymentCategory>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<PaymentRecord>(payments[0]);

    const filteredPayments = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();

        return payments.filter((payment) => {
            const matchesCategory =
                activeCategory === "All" || payment.category === activeCategory;

            const matchesSearch =
                normalizedSearch.length === 0 ||
                [
                    payment.title,
                    payment.beneficiary,
                    payment.amount,
                    payment.status,
                    payment.reference,
                    payment.receiptNo,
                    payment.category,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(normalizedSearch);

            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchQuery]);

    const totals = useMemo(() => {
        const successfulTotal = payments
            .filter((payment) => payment.status === "Successful")
            .reduce((total, payment) => total + parseAmount(payment.amount), 0);

        return {
            totalPaid: `UGX ${(successfulTotal / 1000).toFixed(0)}K`,
            successful: payments.filter((payment) => payment.status === "Successful").length,
            pending: payments.filter((payment) => payment.status === "Pending").length,
            failed: payments.filter((payment) => payment.status === "Failed").length,
        };
    }, []);

    function handleDownloadReceipt(payment: PaymentRecord) {
        setSelectedPayment(payment);
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>Fan Wallet</span>
                    <h1>Wallet & Payment Center</h1>
                    <p>
                        Track ticket payments, memberships, sponsorships, pending checkouts
                        and receipts. This screen is using dummy data until admin payment
                        workflows are completed.
                    </p>
                </div>

                <Link to="/tickets" className={styles.primaryHeaderAction}>
                    <Ticket size={18} strokeWidth={2.4} aria-hidden="true" />
                    Buy Tickets
                </Link>
            </header>

            <section className={styles.summaryGrid} aria-label="Payment summary">
                <article className={`${styles.summaryCard} ${styles.purple}`}>
                    <div>
                        <p>Total Paid</p>
                        <strong>{totals.totalPaid}</strong>
                        <span>Successful payments</span>
                    </div>
                    <WalletCards size={38} strokeWidth={2.1} aria-hidden="true" />
                </article>

                <article className={`${styles.summaryCard} ${styles.green}`}>
                    <div>
                        <p>Successful</p>
                        <strong>{totals.successful}</strong>
                        <span>Receipts available</span>
                    </div>
                    <CheckCircle2 size={38} strokeWidth={2.1} aria-hidden="true" />
                </article>

                <article className={`${styles.summaryCard} ${styles.orange}`}>
                    <div>
                        <p>Pending</p>
                        <strong>{totals.pending}</strong>
                        <span>Awaiting confirmation</span>
                    </div>
                    <Clock size={38} strokeWidth={2.1} aria-hidden="true" />
                </article>

                <article className={`${styles.summaryCard} ${styles.red}`}>
                    <div>
                        <p>Failed</p>
                        <strong>{totals.failed}</strong>
                        <span>Retry available</span>
                    </div>
                    <XCircle size={38} strokeWidth={2.1} aria-hidden="true" />
                </article>
            </section>

            <section className={styles.gatewayNotice}>
                <span>
                    <ShieldCheck size={28} strokeWidth={2.3} aria-hidden="true" />
                </span>

                <div>
                    <h2>Payments are prepared for Flutterwave</h2>
                    <p>
                        The frontend is ready for mobile money, card payments, payment
                        receipts and retry flows. Live backend connection will come after
                        admin dashboards and payment creation flows are completed.
                    </p>
                </div>

                <Link to="/profile/privacy">Security Settings</Link>
            </section>

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Payment History</h2>
                                <p>Dummy records covering tickets, memberships and sponsorships.</p>
                            </div>

                            <div className={styles.searchBox}>
                                <Search size={16} strokeWidth={2.3} aria-hidden="true" />
                                <input
                                    type="search"
                                    placeholder="Search payment, receipt, reference..."
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.categoryTabs}>
                            {categoryOptions.map((category) => (
                                <button
                                    type="button"
                                    key={category}
                                    className={
                                        activeCategory === category ? styles.activeCategoryTab : ""
                                    }
                                    onClick={() => setActiveCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <div className={styles.transactionList}>
                            {filteredPayments.map((payment) => {
                                const PaymentIcon = payment.icon;

                                return (
                                    <article
                                        className={styles.transactionCard}
                                        key={payment.id}
                                    >
                                        <span className={styles.transactionIcon}>
                                            <PaymentIcon
                                                size={26}
                                                strokeWidth={2.3}
                                                aria-hidden="true"
                                            />
                                        </span>

                                        <div className={styles.transactionInfo}>
                                            <div className={styles.transactionTitleRow}>
                                                <h3>{payment.title}</h3>
                                                <PaymentStatusBadge status={payment.status} />
                                            </div>

                                            <p>{payment.description}</p>

                                            <div className={styles.transactionMeta}>
                                                <span>{payment.category}</span>
                                                <span>{payment.beneficiary}</span>
                                                <span>{payment.method}</span>
                                                <span>{payment.date}</span>
                                            </div>
                                        </div>

                                        <div className={styles.transactionAmount}>
                                            <strong>{payment.amount}</strong>

                                            <div className={styles.transactionActions}>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedPayment(payment)}
                                                >
                                                    <FileText
                                                        size={15}
                                                        strokeWidth={2.3}
                                                        aria-hidden="true"
                                                    />
                                                    View
                                                </button>

                                                {payment.status === "Failed" ? (
                                                    <button type="button">
                                                        <RefreshCw
                                                            size={15}
                                                            strokeWidth={2.3}
                                                            aria-hidden="true"
                                                        />
                                                        Retry
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownloadReceipt(payment)}
                                                    >
                                                        <Download
                                                            size={15}
                                                            strokeWidth={2.3}
                                                            aria-hidden="true"
                                                        />
                                                        Receipt
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Saved Payment Options</h2>
                                <p>Placeholder payment methods for future checkout preferences.</p>
                            </div>
                        </div>

                        <div className={styles.paymentMethodGrid}>
                            {paymentMethods.map((method) => (
                                <article className={styles.paymentMethodCard} key={method.id}>
                                    <CreditCard size={24} strokeWidth={2.3} aria-hidden="true" />
                                    <div>
                                        <h3>{method.title}</h3>
                                        <p>{method.detail}</p>
                                    </div>
                                    <span>{method.status}</span>
                                </article>
                            ))}
                        </div>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.receiptPanel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <FileText size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Receipt Detail</h2>
                                <p>Selected dummy payment receipt.</p>
                            </div>
                        </div>

                        <dl className={styles.receiptDetail}>
                            <div>
                                <dt>Title</dt>
                                <dd>{selectedPayment.title}</dd>
                            </div>
                            <div>
                                <dt>Amount</dt>
                                <dd>{selectedPayment.amount}</dd>
                            </div>
                            <div>
                                <dt>Status</dt>
                                <dd>
                                    <PaymentStatusBadge status={selectedPayment.status} />
                                </dd>
                            </div>
                            <div>
                                <dt>Reference</dt>
                                <dd>{selectedPayment.reference}</dd>
                            </div>
                            <div>
                                <dt>Receipt No.</dt>
                                <dd>{selectedPayment.receiptNo}</dd>
                            </div>
                            <div>
                                <dt>Gateway</dt>
                                <dd>{selectedPayment.method}</dd>
                            </div>
                        </dl>

                        <button type="button" className={styles.fullWidthButton}>
                            <Download size={17} strokeWidth={2.4} aria-hidden="true" />
                            Download Receipt
                        </button>
                    </section>

                    <section className={styles.warningCard}>
                        <AlertTriangle size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Payment flow note</h2>
                            <p>
                                This is still a frontend dummy-data screen. Real payments should
                                only be connected after the club, league and admin dashboards can
                                create payable items.
                            </p>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <ArrowUpRight size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Quick Actions</h2>
                                <p>Common fan payment actions.</p>
                            </div>
                        </div>

                        <div className={styles.quickActionList}>
                            <Link to="/tickets">Buy Match Tickets</Link>
                            <Link to="/memberships">Explore Memberships</Link>
                            <Link to="/dashboard/tickets">View My Tickets</Link>
                            <Link to="/profile/support">Payment Support</Link>
                        </div>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default WalletPaymentCenter;
