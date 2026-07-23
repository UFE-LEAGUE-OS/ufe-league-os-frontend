import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
    Eye,
    Search,
    SlidersHorizontal,
    ChevronUp,
    ChevronDown,
    Download,
} from "lucide-react";
import styles from "./UnionAdminTransactionReview.module.css";
import { type UnionFinanceDashboard, getUnionFinanceDashboard } from "../../services/unionAdminService";

type SortDirection = "asc" | "desc";

type SortConfig = {
    key: string;
    direction: SortDirection;
};

type TransactionRecord = {
    reference: string;
    source: string;
    amount: string;
    status: string;
    date: string;
    stream: string;
};

export default function UnionAdminTransactionReview() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sort, setSort] = useState<SortConfig>({ key: "date", direction: "desc" });
    const [page, setPage] = useState(1);
    const [data, setData] = useState<UnionFinanceDashboard | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const pageSize = 10;

    const transactions = useMemo(() => {
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
        const values = new Set(transactions.map((tx) => tx.status));
        return Array.from(values).sort();
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        const lowerSearch = searchQuery.toLowerCase();

        return transactions.filter((tx) => {
            const matchesSearch =
                !lowerSearch ||
                [tx.reference, tx.source, tx.status, tx.stream].some((value) =>
                    value.toLowerCase().includes(lowerSearch),
                );

            const matchesStatus = statusFilter === "all" || tx.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [transactions, searchQuery, statusFilter]);

    const sortedTransactions = useMemo(() => {
        return [...filteredTransactions].sort((a, b) => {
            const aValue = a[sort.key as keyof TransactionRecord];
            const bValue = b[sort.key as keyof TransactionRecord];

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
            }

            const aString = String(aValue ?? "" );
            const bString = String(bValue ?? "");

            return sort.direction === "asc"
                ? aString.localeCompare(bString)
                : bString.localeCompare(aString);
        });
    }, [filteredTransactions, sort]);

    const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginatedTransactions = sortedTransactions.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
    );

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
                    setData(response);
                }
            } catch {
                if (isMounted) {
                    setError("Transaction data could not be loaded.");
                    setData(null);
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
        if (lowered === "approved") return styles.statusApproved;
        if (lowered === "rejected") return styles.statusRejected;
        if (lowered === "failed") return styles.statusFailed;
        if (lowered === "settled") return styles.statusSettled;

        return "";
    }

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Transaction review</h1>
                    <p>Review payment and revenue transactions across all union workspaces.</p>
                </div>
                <button className={styles.secondaryButton} type="button">
                    <Download size={16} strokeWidth={2.2} aria-hidden="true" />
                    Export
                </button>
            </header>

            {error ? <div className={styles.alertBanner}>{error}</div> : null}
            {isLoading ? <div className={styles.alertBanner}>Loading transactions…</div> : null}

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
                        {paginatedTransactions.length > 0 ? (
                            paginatedTransactions.map((tx) => (
                                <tr key={tx.reference}>
                                    <td><strong>{tx.reference}</strong></td>
                                    <td>{tx.source}</td>
                                    <td>{tx.amount}</td>
                                    <td>
                                        <span className={statusBadge(tx.status)}>{tx.status}</span>
                                    </td>
                                    <td>{tx.date}</td>
                                    <td>{tx.stream}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button type="button" className={styles.actionView} title="View Details">
                                                <Eye size={15} strokeWidth={2.2} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className={styles.emptyRow}>
                                    No transactions found for the selected filters.
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