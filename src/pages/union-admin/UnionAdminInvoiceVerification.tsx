import { useMemo, useState } from "react";
import {
    CheckCircle2,
    Download,
    Eye,
    Search,
    SlidersHorizontal,
    XCircle,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import styles from "./UnionAdminInvoiceVerification.module.css";
import { type UnionFinanceDashboard, getUnionFinanceDashboard } from "../../services/unionAdminService";

type SortDirection = "asc" | "desc";

type SortConfig = {
    key: string;
    direction: SortDirection;
};

type InvoiceRecord = {
    reference: string;
    source: string;
    amount: string;
    status: string;
    date: string;
    stream: string;
};

export default function UnionAdminInvoiceVerification() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sort, setSort] = useState<SortConfig>({ key: "date", direction: "desc" });
    const [page, setPage] = useState(1);
    const [data, setdata] = useState<UnionFinanceDashboard | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const pageSize = 10;

    const invoices = useMemo(() => {
        if (!data) return [];
        return data.recent_transactions.map((tx) => ({
            reference: tx.reference,
            source: tx.source,
            amount: tx.amount.display,
            status: tx.status,
            date: tx.date,
            stream: tx.stream,
        }));
    }, [data]);

    const statuses = useMemo(() => {
        const values = new Set(invoices.map((invoice) => invoice.status));
        return Array.from(values).sort();
    }, [invoices]);

    const filteredInvoices = useMemo(() => {
        const lowerSearch = searchQuery.toLowerCase();

        return invoices.filter((invoice) => {
            const matchesSearch =
                !lowerSearch ||
                [invoice.reference, invoice.source, invoice.status, invoice.stream].some((value) =>
                    value.toLowerCase().includes(lowerSearch),
                );

            const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchQuery, statusFilter]);

    const sortedInvoices = useMemo(() => {
        return [...filteredInvoices].sort((a, b) => {
            const aValue = a[sort.key as keyof InvoiceRecord];
            const bValue = b[sort.key as keyof InvoiceRecord];

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
            }

            const aString = String(aValue ?? "");
            const bString = String(bValue ?? "");

            return sort.direction === "asc"
                ? aString.localeCompare(bString)
                : bString.localeCompare(aString);
        });
    }, [filteredInvoices, sort]);

    const totalPages = Math.max(1, Math.ceil(sortedInvoices.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginatedInvoices = sortedInvoices.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
    );

    const pendingCount = invoices.filter((invoice) => invoice.status.toLowerCase() === "pending").length;

    useMemo(() => {
        setPage(1);
    }, [searchQuery, statusFilter]);

    useMemo(() => {
        let isMounted = true;

        async function loadData() {
            setIsLoading(true);
            setError("");

            try {
                const response = await getUnionFinanceDashboard("");

                if (isMounted) {
                    setdata(response);
                }
            } catch {
                if (isMounted) {
                    setError("Invoice data could not be loaded.");
                    setdata(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadData();

        return () => {
            isMounted = false;
        };
    }, []);

    function handleSort(key: string) {
        setSort((previousSort) => {
            if (previousSort.key === key) {
                return {
                    key,
                    direction: previousSort.direction === "asc" ? "desc" : "asc",
                };
            }

            return { key, direction: "asc" };
        });
    }

    function renderSortIcon(key: string) {
        if (sort.key !== key) return null;
        return sort.direction === "asc" ? (
            <ChevronUp size={14} strokeWidth={2.4} aria-hidden="true" />
        ) : (
            <ChevronDown size={14} strokeWidth={2.4} aria-hidden="true" />
        );
    }

    function statusBadge(status: string) {
        const lowered = status.toLowerCase();

        if (lowered === "pending") return styles.statusPending;
        if (lowered === "verified") return styles.statusVerified;
        if (lowered === "rejected") return styles.statusRejected;
        if (lowered === "failed") return styles.statusFailed;

        return "";
    }

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Receipts & Invoice Verification</h1>
                    <p>
                        {pendingCount} invoice{pendingCount === 1 ? "" : "s"} awaiting verification.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.secondaryButton} type="button">
                        <Download size={16} strokeWidth={2.2} aria-hidden="true" />
                        Export
                    </button>
                </div>
            </header>

            {error ? <div className={styles.alertBanner}>{error}</div> : null}
            {isLoading ? <div className={styles.alertBanner}>Loading invoices…</div> : null}

            <div className={styles.controls}>
                <label className={styles.searchField}>
                    <Search size={16} strokeWidth={2.2} aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Search by reference, source, status or stream..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                </label>

                <label className={styles.filterField}>
                    <SlidersHorizontal size={16} strokeWidth={2.2} aria-hidden="true" />
                    <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                        <option value="all">All statuses</option>
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className={styles.tableShell}>
                <table>
                    <thead>
                        <tr>
                            {[
                                { key: "reference", label: "Reference" },
                                { key: "source", label: "Source" },
                                { key: "amount", label: "Amount" },
                                { key: "status", label: "Status" },
                                { key: "date", label: "Date" },
                                { key: "stream", label: "Stream" },
                            ].map((column) => (
                                <th key={column.key}>
                                    <button type="button" onClick={() => handleSort(column.key)}>
                                        <span>{column.label}</span>
                                        {renderSortIcon(column.key)}
                                    </button>
                                </th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedInvoices.length > 0 ? (
                            paginatedInvoices.map((invoice) => (
                                <tr key={invoice.reference}>
                                    <td><strong>{invoice.reference}</strong></td>
                                    <td>{invoice.source}</td>
                                    <td>{invoice.amount}</td>
                                    <td>
                                        <span className={statusBadge(invoice.status)}>{invoice.status}</span>
                                    </td>
                                    <td>{invoice.date}</td>
                                    <td>{invoice.stream}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button type="button" className={styles.actionView} title="Preview">
                                                <Eye size={15} strokeWidth={2.2} aria-hidden="true" />
                                            </button>
                                            <button type="button" className={styles.actionApprove} title="Verify">
                                                <CheckCircle2 size={15} strokeWidth={2.2} aria-hidden="true" />
                                            </button>
                                            <button type="button" className={styles.actionReject} title="Reject">
                                                <XCircle size={15} strokeWidth={2.2} aria-hidden="true" />
                                            </button>
                                            <button type="button" className={styles.actionDownload} title="Download">
                                                <Download size={15} strokeWidth={2.2} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className={styles.emptyRow}>
                                    No invoices found for the selected filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={styles.pagination}>
                <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                >
                    Previous
                </button>
                <span>
                    Page {safePage} of {totalPages}
                </span>
                <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
                >
                    Next
                </button>
            </div>
        </section>
    );
}