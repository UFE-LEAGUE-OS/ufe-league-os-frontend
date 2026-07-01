import {
    ArrowUpRight,
    Banknote,
    CheckCircle2,
    Clock,
    Download,
    FileText,
    RefreshCw,
    Search,
    Ticket,
    Trophy,
    WalletCards,
    X,
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
    logo?: string;
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
        logo: "/assets/clubs/kobs.jpg",
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
        logo: "/assets/clubs/kobs.jpg",
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
        logo: "/assets/clubs/city-oilers.png",
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
        logo: "/assets/clubs/black-pirates.png",
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
        logo: "/assets/competitions/nile-rugby.jpg",
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
        logo: "/assets/clubs/kcca-fc.png",
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

    const SelectedPaymentIcon = selectedPayment.icon;

    function handleDownloadReceipt(payment: PaymentRecord) {
        setSelectedPayment(payment);
    }

    function clearPaymentFilters() {
        setSearchQuery("");
        setActiveCategory("All");
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

                                {searchQuery ? (
                                    <button
                                        type="button"
                                        className={styles.clearSearchButton}
                                        aria-label="Clear payment search"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <X size={15} strokeWidth={2.4} />
                                    </button>
                                ) : null}
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
                                    <span>
                                        {category === "All"
                                            ? payments.length
                                            : payments.filter((payment) => payment.category === category)
                                                  .length}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className={styles.transactionList}>
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map((payment) => {
                                    const PaymentIcon = payment.icon;

                                    return (
                                    <article
                                        className={styles.transactionCard}
                                        key={payment.id}
                                    >
                                        <span className={styles.transactionIcon}>
                                            {payment.logo ? (
                                                <img src={payment.logo} alt="" aria-hidden="true" />
                                            ) : (
                                                <PaymentIcon
                                                    size={26}
                                                    strokeWidth={2.3}
                                                    aria-hidden="true"
                                                />
                                            )}
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
                                                    className={styles.viewButton}
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
                                                    <button type="button" className={styles.retryButton}>
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
                                                        className={styles.receiptButton}
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
                                })
                            ) : (
                                <section className={styles.paymentEmptyState}>
                                    <Search size={38} strokeWidth={2.2} aria-hidden="true" />
                                    <h2>No payments found</h2>
                                    <p>
                                        Try another search term, change the category filter, or clear
                                        the filters to see all payment records.
                                    </p>

                                    <div>
                                        <button type="button" onClick={clearPaymentFilters}>
                                            Clear Filters
                                        </button>
                                        <Link to="/tickets">Buy Tickets</Link>
                                    </div>
                                </section>
                            )}
                        </div>
                    </section>

                    <section className={styles.paymentPartnerBanner} aria-label="Sponsored payment partner placement">
                        <div>
                            <span>Sponsored</span>
                            <h2>Payment Partner Slot</h2>
                            <p>
                                Use this space for Flutterwave, mobile money partners, bank offers,
                                ticket cashback, membership discounts or sponsor payment campaigns.
                            </p>
                        </div>

                        <Link to="/sponsor/apply">Explore Partner Options →</Link>
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

                        <div className={styles.receiptSummary}>
                            <span className={styles.receiptLogo}>
                                {selectedPayment.logo ? (
                                    <img src={selectedPayment.logo} alt="" aria-hidden="true" />
                                ) : (
                                    <SelectedPaymentIcon
                                        size={26}
                                        strokeWidth={2.3}
                                        aria-hidden="true"
                                    />
                                )}
                            </span>

                            <div>
                                <strong>{selectedPayment.title}</strong>
                                <p>{selectedPayment.category} • {selectedPayment.beneficiary}</p>
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
