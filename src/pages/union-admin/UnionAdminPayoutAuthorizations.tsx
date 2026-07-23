import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
    CheckCircle2,
    Eye,
    Search,
    SlidersHorizontal,
    XCircle,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import styles from "./UnionAdminPayoutAuthorizations.module.css";
import { type UnionFinanceDashboard, getUnionFinanceDashboard } from "../../services/unionAdminService";

type SortDirection = "asc" | "desc";

type SortConfig = {
    key: string;
    direction: SortDirection;
};

type PayoutRecord = {
    beneficiary: string;
    category: string;
    amount: string;
    status: string;
    reference: string;
};

export default function UnionAdminPayoutAuthorizations() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sort, setSort] = useState<SortConfig>({ key: "beneficiary", direction: "asc" });
    const [page, setPage] = useState(1);
    const [data, setData] = useState<UnionFinanceDashboard | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const pageSize = 10;

    const payouts = useMemo(() => {
        if (!data) return [];
        return data.payout_queue.map((item) => ({
            beneficiary: item.beneficiary,
            category: item.category,
            amount: item.amount.display,
            status: item.status,
            reference: item.reference,
        }));
    }, [data]);

    const statuses = useMemo(() => {
        const values = new Set(payouts.map((payout) => payout.status));
        return Array.from(values).sort();
    }, [payouts]);

    const filteredPayouts = useMemo(() => {
        const lowerSearch = searchQuery.toLowerCase();

        return payouts.filter((payout) => {
            const matchesSearch =
                !lowerSearch ||
                [
                    payout.beneficiary,
                    payout.category,
                    payout.amount,
                    payout.status,
                    payout.reference,
                ].some((value) => value.toLowerCase().includes(lowerSearch));

            const matchesStatus = statusFilter === "all" || payout.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [payouts, searchQuery, statusFilter]);

    const sortedPayouts = useMemo(() => {
        return [...filteredPayouts].sort((a, b) => {
            const aValue = a[sort.key as keyof PayoutRecord];
            const bValue = b[sort.key as keyof PayoutRecord];

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
            }

            const aString = String(aValue ?? "");
            const bString = String(bValue ?? "");

            return sort.direction === "asc"
                ? aString.localeCompare(bString)
                : bString.localeCompare(aString);
        });
    }, [filteredPayouts, sort]);

    const totalPages = Math.max(1, Math.ceil(sortedPayouts.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginatedPayouts = sortedPayouts.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
    );

    const pendingCount = payouts.filter((payout) => payout.status.toLowerCase() === "pending").length;

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
                    setError("Payout data could not be loaded.");
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
        if (lowered === "authorized") return styles.statusAuthorized;
        if (lowered === "rejected") return styles.statusRejected;
        if (lowered === "paid") return styles.statusPaid;

        return "";
    }

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Payout authorizations</h1>
                    <p>
                        {pendingCount} payout{pendingCount === 1 ? "" : "s"} awaiting authorization review.
                    </p>
                </div>
            </header>

            {error ? <div className={styles.alertBanner}>{error}</div> : null}
            {isLoading ? <div className={styles.alertBanner}>Loading payouts…</div> : null}

            <div className={styles.controls}>
                <label className={styles.searchField}>
                    <Search size={16} strokeWidth={2.2} aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Search by beneficiary, category, status or reference..."
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
                                { key: "beneficiary", label: "Beneficiary" },
                                { key: "category", label: "Category" },
                                { key: "amount", label: "Amount" },
                                { key: "status", label: "Status" },
                                { key: "reference", label: "Reference" },
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
                        {paginatedPayouts.length > 0 ? (
                            paginatedPayouts.map((payout) => (
                                <tr key={payout.reference}>
                                    <td><strong>{payout.beneficiary}</strong></td>
                                    <td>{payout.category}</td>
                                    <td>{payout.amount}</td>
                                    <td>
                                        <span className={statusBadge(payout.status)}>{payout.status}</span>
                                    </td>
                                    <td>{payout.reference}</td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <button type="button" className={styles.actionView} title="View">
                                                <Eye size={15} strokeWidth={2.2} aria-hidden="true" />
                                            </button>
                                            <button type="button" className={styles.actionApprove} title="Authorize">
                                                <CheckCircle2 size={15} strokeWidth={2.2} aria-hidden="true" />
                                            </button>
                                            <button type="button" className={styles.actionReject} title="Reject">
                                                <XCircle size={15} strokeWidth={2.2} aria-hidden="true" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className={styles.emptyRow}>
                                    No payouts found for the selected filters.
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