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
    XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    getFanPaymentHistory,
    getFanWalletSummary,
    type BackendPaymentItem,
    type WalletSummary,
} from "../../services/fanPaymentService";
import styles from "./PaymentMethodsPage.module.css";

type PaymentStatus = "Successful" | "Pending" | "Failed" | "Refunded" | "Cancelled";
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

const categoryOptions: Array<"All" | PaymentCategory> = [
    "All",
    "Ticket",
    "Membership",
    "Sponsorship",
    "Wallet",
];

const PAYMENT_PAGE_SIZE_OPTIONS = [4, 8, 12];

function getStatusClass(status: PaymentStatus) {
    if (status === "Successful") return styles.successStatus;
    if (status === "Pending") return styles.pendingStatus;
    if (status === "Failed" || status === "Cancelled") return styles.failedStatus;
    return styles.refundedStatus;
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
            {status === "Failed" || status === "Cancelled" ? (
                <XCircle size={14} strokeWidth={2.4} aria-hidden="true" />
            ) : null}
            {status === "Refunded" ? (
                <RefreshCw size={14} strokeWidth={2.4} aria-hidden="true" />
            ) : null}
            {status}
        </span>
    );
}

function formatMoney(value: string | number, currency = "UGX") {
    const amount = Number(value || 0);

    return `${currency} ${new Intl.NumberFormat("en-UG", {
        maximumFractionDigits: 0,
    }).format(amount)}`;
}

function formatCompactMoney(value: string | number, currency = "UGX") {
    const amount = Number(value || 0);

    if (amount >= 1000000) {
        return `${currency} ${(amount / 1000000).toFixed(1)}M`;
    }

    if (amount >= 1000) {
        return `${currency} ${(amount / 1000).toFixed(0)}K`;
    }

    return formatMoney(amount, currency);
}

function formatDate(value?: string) {
    if (!value) {
        return "Date pending";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date pending";
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function mapStatus(status: string, statusLabel: string): PaymentStatus {
    const normalizedStatus = status.toUpperCase();

    if (normalizedStatus === "SUCCESSFUL" || normalizedStatus === "COMPLETED") {
        return "Successful";
    }

    if (normalizedStatus === "PENDING" || normalizedStatus === "PROCESSING") {
        return "Pending";
    }

    if (normalizedStatus === "FAILED") {
        return "Failed";
    }

    if (normalizedStatus === "CANCELLED" || normalizedStatus === "CANCELED") {
        return "Cancelled";
    }

    if (normalizedStatus === "REFUNDED") {
        return "Refunded";
    }

    if (statusLabel) {
        return statusLabel as PaymentStatus;
    }

    return "Pending";
}

function mapCategory(payment: BackendPaymentItem): PaymentCategory {
    const paymentType = payment.payment_type.toUpperCase();
    const source = payment.source.toUpperCase();

    if (paymentType.includes("TICKET") || source.includes("TICKET")) {
        return "Ticket";
    }

    if (paymentType.includes("MEMBERSHIP") || source.includes("MEMBER")) {
        return "Membership";
    }

    if (paymentType.includes("SPONSOR")) {
        return "Sponsorship";
    }

    return "Wallet";
}

function getIconForPayment(category: PaymentCategory, status: PaymentStatus) {
    if (status === "Refunded") return RefreshCw;
    if (category === "Ticket") return Ticket;
    if (category === "Membership") return Trophy;
    if (category === "Sponsorship") return Banknote;
    return WalletCards;
}

function getMetadataText(
    metadata: Record<string, unknown>,
    keys: string[],
    fallback: string,
) {
    for (const key of keys) {
        const value = metadata[key];

        if (typeof value === "string" && value.trim()) {
            return value;
        }

        if (typeof value === "number") {
            return String(value);
        }
    }

    return fallback;
}

function mapPaymentRecord(payment: BackendPaymentItem): PaymentRecord {
    const category = mapCategory(payment);
    const status = mapStatus(payment.status, payment.status_label);
    const icon = getIconForPayment(category, status);

    const title =
        payment.description ||
        payment.payment_type_label ||
        `${category} payment`;

    const beneficiary = getMetadataText(
        payment.metadata,
        [
            "beneficiary",
            "club_name",
            "competition_name",
            "league_name",
            "sponsor_name",
            "provider",
        ],
        payment.source.replace(/_/g, " "),
    );

    const method = getMetadataText(
        payment.metadata,
        ["gateway", "method", "payment_method", "provider"],
        "League OS Payments",
    );

    return {
        id: payment.id,
        title,
        category,
        beneficiary,
        amount: formatMoney(payment.amount, payment.currency),
        status,
        date: formatDate(payment.created_at),
        method,
        reference: payment.reference || "Reference pending",
        receiptNo:
            status === "Successful"
                ? `LOS-RCPT-${payment.source_id ?? payment.id}`
                : "Pending",
        description: payment.description || payment.payment_type_label,
        icon,
    };
}

function WalletPaymentCenter() {
    const [activeCategory, setActiveCategory] =
        useState<"All" | PaymentCategory>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [recordsPerPage, setRecordsPerPage] = useState(4);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    async function loadPayments() {
        setIsLoading(true);
        setErrorMessage("");

        try {
            const [wallet, history] = await Promise.all([
                getFanWalletSummary(10),
                getFanPaymentHistory(50),
            ]);

            const mappedPayments = history.results.map(mapPaymentRecord);

            setWalletSummary(wallet);
            setPayments(mappedPayments);
            setSelectedPayment(mappedPayments[0] ?? null);
            setCurrentPage(1);
        } catch {
            setErrorMessage(
                "We could not load your payment records. Confirm the local backend is running and you are logged in.",
            );
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        void loadPayments();
    }, []);

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
                    payment.method,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(normalizedSearch);

            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, payments, searchQuery]);

    const totalPaymentPages = Math.max(
        1,
        Math.ceil(filteredPayments.length / recordsPerPage),
    );

    const visiblePayments = useMemo(() => {
        const safePage = Math.min(currentPage, totalPaymentPages);
        const startIndex = (safePage - 1) * recordsPerPage;

        return filteredPayments.slice(startIndex, startIndex + recordsPerPage);
    }, [currentPage, filteredPayments, recordsPerPage, totalPaymentPages]);

    const paymentRangeStart =
        filteredPayments.length === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;

    const paymentRangeEnd = Math.min(
        currentPage * recordsPerPage,
        filteredPayments.length,
    );

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPaymentPages));
    }, [totalPaymentPages]);

    const totals = useMemo(
        () => ({
            totalPaid: walletSummary
                ? formatCompactMoney(walletSummary.total_spent, walletSummary.currency)
                : "UGX 0",
            successful: walletSummary?.successful_payments_count ?? 0,
            pending: walletSummary?.pending_payments_count ?? 0,
            failed: walletSummary?.failed_payments_count ?? 0,
            refunded: walletSummary?.refunded_payments_count ?? 0,
        }),
        [walletSummary],
    );

    const SelectedPaymentIcon = selectedPayment?.icon ?? FileText;

    function downloadReceipt(payment: PaymentRecord) {
        const receiptLines = [
            "LEAGUE OS PAYMENT RECEIPT",
            "=========================",
            `Receipt No: ${payment.receiptNo}`,
            `Title: ${payment.title}`,
            `Category: ${payment.category}`,
            `Beneficiary: ${payment.beneficiary}`,
            `Amount: ${payment.amount}`,
            `Status: ${payment.status}`,
            `Reference: ${payment.reference}`,
            `Gateway: ${payment.method}`,
            `Date: ${payment.date}`,
        ];

        const receiptBlob = new Blob([receiptLines.join("\n")], {
            type: "text/plain;charset=utf-8",
        });

        const receiptUrl = URL.createObjectURL(receiptBlob);
        const downloadLink = document.createElement("a");

        downloadLink.href = receiptUrl;
        downloadLink.download = `${payment.receiptNo}.txt`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();

        URL.revokeObjectURL(receiptUrl);
    }

    function handleDownloadReceipt(payment: PaymentRecord) {
        setSelectedPayment(payment);

        if (payment.status === "Successful") {
            downloadReceipt(payment);
        }
    }

    function clearPaymentFilters() {
        setSearchQuery("");
        setActiveCategory("All");
        setCurrentPage(1);
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <span className={styles.eyebrow}>Fan Wallet</span>
                    <h1>Wallet & Payment Center</h1>
                    <p>
                        Track ticket payments, memberships, sponsorship payments, pending
                        checkouts and receipts from the backend payment center.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.primaryHeaderAction}
                    onClick={() => void loadPayments()}
                    disabled={isLoading}
                >
                    <RefreshCw size={18} strokeWidth={2.4} aria-hidden="true" />
                    {isLoading ? "Refreshing..." : "Refresh"}
                </button>
            </header>

            {errorMessage ? (
                <section className={styles.warningCard} role="alert">
                    <XCircle size={22} strokeWidth={2.4} aria-hidden="true" />
                    <div>
                        <h2>Payment data unavailable</h2>
                        <p>{errorMessage}</p>
                    </div>
                </section>
            ) : null}

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
                        <span>{totals.refunded} refunded</span>
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
                                <p>
                                    Backend records from tickets, memberships, sponsorships and
                                    legacy payment history.
                                </p>
                            </div>

                            <div className={styles.searchBox}>
                                <Search size={17} strokeWidth={2.3} aria-hidden="true" />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) => {
                                        setSearchQuery(event.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Search payments"
                                    aria-label="Search payments"
                                />
                            </div>
                        </div>

                        <div className={styles.categoryTabs} aria-label="Payment filters">
                            {categoryOptions.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    className={
                                        activeCategory === category
                                            ? styles.activeCategoryTab
                                            : undefined
                                    }
                                    onClick={() => {
                                        setActiveCategory(category);
                                        setCurrentPage(1);
                                    }}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <div className={styles.paymentListControls}>
                            <p>
                                Showing {filteredPayments.length === 0 ? 0 : paymentRangeStart}-
                                {paymentRangeEnd} of {filteredPayments.length} payment records
                            </p>

                            <label>
                                Records per page
                                <select
                                    value={recordsPerPage}
                                    onChange={(event) => {
                                        setRecordsPerPage(Number(event.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    {PAYMENT_PAGE_SIZE_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className={styles.transactionList}>
                            {isLoading ? (
                                <section className={styles.paymentEmptyState}>
                                    <RefreshCw size={38} strokeWidth={2.2} aria-hidden="true" />
                                    <h2>Loading payments</h2>
                                    <p>Fetching your wallet and payment history from the backend.</p>
                                </section>
                            ) : null}

                            {!isLoading && filteredPayments.length > 0 ? (
                                visiblePayments.map((payment) => {
                                    const PaymentIcon = payment.icon;

                                    return (
                                        <article key={payment.id} className={styles.transactionCard}>
                                            <span className={styles.transactionIcon}>
                                                <PaymentIcon
                                                    size={25}
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
                                                        <Link
                                                            to="/profile/support"
                                                            className={styles.retryButton}
                                                        >
                                                            <RefreshCw
                                                                size={15}
                                                                strokeWidth={2.3}
                                                                aria-hidden="true"
                                                            />
                                                            Support
                                                        </Link>
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
                            ) : null}

                            {!isLoading && filteredPayments.length > recordsPerPage ? (
                                <nav
                                    className={styles.paymentPager}
                                    aria-label="Payment history pagination"
                                >
                                    <p>
                                        Showing {paymentRangeStart}-{paymentRangeEnd} of{" "}
                                        {filteredPayments.length} records
                                    </p>

                                    <div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage((page) => Math.max(1, page - 1))
                                            }
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </button>

                                        <span>
                                            Page {currentPage} of {totalPaymentPages}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage((page) =>
                                                    Math.min(totalPaymentPages, page + 1),
                                                )
                                            }
                                            disabled={currentPage === totalPaymentPages}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </nav>
                            ) : null}

                            {!isLoading && filteredPayments.length === 0 ? (
                                <section className={styles.paymentEmptyState}>
                                    <Search size={38} strokeWidth={2.2} aria-hidden="true" />
                                    <h2>No payments found</h2>
                                    <p>
                                        No backend payment records matched this view. Try another
                                        filter, clear the search, or make a local test payment record.
                                    </p>

                                    <div>
                                        <button type="button" onClick={clearPaymentFilters}>
                                            Clear Filters
                                        </button>
                                        <Link to="/tickets">Buy Tickets</Link>
                                    </div>
                                </section>
                            ) : null}
                        </div>
                    </section>

                    <section
                        className={styles.paymentPartnerBanner}
                        aria-label="Sponsored payment partner placement"
                    >
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
                                <p>
                                    {selectedPayment
                                        ? "Selected backend payment receipt."
                                        : "Select a payment to view receipt details."}
                                </p>
                            </div>
                        </div>

                        {selectedPayment ? (
                            <>
                                <div className={styles.receiptSummary}>
                                    <span className={styles.receiptLogo}>
                                        <SelectedPaymentIcon
                                            size={26}
                                            strokeWidth={2.3}
                                            aria-hidden="true"
                                        />
                                    </span>

                                    <div>
                                        <strong>{selectedPayment.title}</strong>
                                        <p>
                                            {selectedPayment.category} •{" "}
                                            {selectedPayment.beneficiary}
                                        </p>
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

                                {selectedPayment.status === "Successful" ? (
                                    <button
                                        type="button"
                                        className={styles.fullWidthButton}
                                        onClick={() => downloadReceipt(selectedPayment)}
                                    >
                                        <Download size={17} strokeWidth={2.4} aria-hidden="true" />
                                        Download Receipt
                                    </button>
                                ) : (
                                    <Link
                                        to="/profile/support"
                                        className={styles.fullWidthButton}
                                    >
                                        <XCircle size={17} strokeWidth={2.4} aria-hidden="true" />
                                        Get Payment Support
                                    </Link>
                                )}
                            </>
                        ) : (
                            <section className={styles.paymentEmptyState}>
                                <FileText size={34} strokeWidth={2.2} aria-hidden="true" />
                                <h2>No receipt selected</h2>
                                <p>Select a payment record to preview its receipt information.</p>
                            </section>
                        )}
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
