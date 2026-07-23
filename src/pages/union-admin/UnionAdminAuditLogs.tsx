import { useMemo, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    ChevronUp,
    ChevronDown,
    Download,
    Eye,
} from "lucide-react";
import styles from "./UnionAdminAuditLogs.module.css";
import { type UnionFinanceDashboard, getUnionFinanceDashboard } from "../../services/unionAdminService";

type SortDirection = "asc" | "desc";

type SortConfig = {
    key: string;
    direction: SortDirection;
};

type AuditRecord = {
    id: string;
    time: string;
    module: string;
    action: string;
    actor: string;
    status: string;
};

const sampleAuditLogs: AuditRecord[] = [
    {
        id: "1",
        time: "Today",
        module: "Finance",
        action: "Payment batch approved",
        actor: "Finance Officer",
        status: "Recorded",
    },
    {
        id: "2",
        time: "Today",
        module: "Payments",
        action: "Payout authorized",
        actor: "Union Admin",
        status: "Recorded",
    },
    {
        id: "3",
        time: "Yesterday",
        module: "Invoices",
        action: "Invoice verified",
        actor: "Finance Officer",
        status: "Recorded",
    },
    {
        id: "4",
        time: "Yesterday",
        module: "Transactions",
        action: "Transaction reviewed",
        actor: "Union Admin",
        status: "Recorded",
    },
    {
        id: "5",
        time: "2 days ago",
        module: "Budget",
        action: "Budget updated",
        actor: "Union Admin",
        status: "Recorded",
    },
];

export default function UnionAdminAuditLogs() {
    const [searchQuery, setSearchQuery] = useState("");
    const [moduleFilter, setModuleFilter] = useState("all");
    const [sort, setSort] = useState<SortConfig>({ key: "time", direction: "desc" });
    const [page, setPage] = useState(1);
    const [data, setData] = useState<UnionFinanceDashboard | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const pageSize = 10;

    const auditLogs = useMemo(() => {
        if (!data) return sampleAuditLogs;
        return data.recent_transactions.map((tx, index) => ({
            id: String(index),
            time: tx.date,
            module: tx.stream,
            action: `Transaction ${tx.reference}`,
            actor: tx.source,
            status: tx.status,
        }));
    }, [data]);

    const modules = useMemo(() => {
        const values = new Set(auditLogs.map((log) => log.module));
        return Array.from(values).sort();
    }, [auditLogs]);

    const filteredLogs = useMemo(() => {
        const lowerSearch = searchQuery.toLowerCase();

        return auditLogs.filter((log) => {
            const matchesSearch =
                !lowerSearch ||
                [log.module, log.action, log.actor, log.status].some((value) =>
                    value.toLowerCase().includes(lowerSearch),
                );

            const matchesModule = moduleFilter === "all" || log.module === moduleFilter;

            return matchesSearch && matchesModule;
        });
    }, [auditLogs, searchQuery, moduleFilter]);

    const sortedLogs = useMemo(() => {
        return [...filteredLogs].sort((a, b) => {
            const aValue = a[sort.key as keyof AuditRecord];
            const bValue = b[sort.key as keyof AuditRecord];

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
            }

            const aString = String(aValue ?? "");
            const bString = String(bValue ?? "");

            return sort.direction === "asc"
                ? aString.localeCompare(bString)
                : bString.localeCompare(aString);
        });
    }, [filteredLogs, sort]);

    const totalPages = Math.max(1, Math.ceil(sortedLogs.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginatedLogs = sortedLogs.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
    );

    useMemo(() => {
        setPage(1);
    }, [searchQuery, moduleFilter]);

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
                    setError("Audit log data could not be loaded.");
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

        if (lowered === "recorded") return styles.statusRecorded;
        if (lowered === "pending") return styles.statusPending;
        if (lowered === "failed") return styles.statusFailed;

        return "";
    }

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Audit logs</h1>
                    <p>Track sensitive workspace actions across finance, payments, invoices and settings.</p>
                </div>
                <button className={styles.secondaryButton} type="button">
                    <Download size={16} strokeWidth={2.2} aria-hidden="true" />
                    Export
                </button>
            </header>

            {error ? <div className={styles.alertBanner}>{error}</div> : null}
            {isLoading ? <div className={styles.alertBanner}>Loading audit logs…</div> : null}

            <div className={styles.controls}>
                <label className={styles.searchField}>
                    <Search size={16} strokeWidth={2.2} aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Search by module, action, actor or status..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                </label>

                <label className={styles.filterField}>
                    <SlidersHorizontal size={16} strokeWidth={2.2} aria-hidden="true" />
                    <select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)}>
                        <option value="all">All modules</option>
                        {modules.map((module) => (
                            <option key={module} value={module}>
                                {module}
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
                                { key: "time", label: "Time" },
                                { key: "module", label: "Module" },
                                { key: "action", label: "Action" },
                                { key: "actor", label: "Actor" },
                                { key: "status", label: "Status" },
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
                        {paginatedLogs.length > 0 ? (
                            paginatedLogs.map((log) => (
                                <tr key={log.id}>
                                    <td>{log.time}</td>
                                    <td><strong>{log.module}</strong></td>
                                    <td>{log.action}</td>
                                    <td>{log.actor}</td>
                                    <td>
                                        <span className={statusBadge(log.status)}>{log.status}</span>
                                    </td>
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
                                <td colSpan={6} className={styles.emptyRow}>
                                    No audit logs found for the selected filters.
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