import { useEffect, useMemo, useState } from "react";
import {
    Download,
    Search,
    SlidersHorizontal,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import styles from "./UnionAdminBudgetOversight.module.css";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

type BudgetRecord = {
    id: number;
    name: string;
    category: string;
    allocated: string;
    spent: string;
    remaining: string;
    utilization: number;
    status: string;
    lastUpdated: string;
};

const sampleBudgets: BudgetRecord[] = [
    {
        id: 1,
        name: "Operations",
        category: "Staff & facilities",
        allocated: "UGX 120,000,000",
        spent: "UGX 78,400,000",
        remaining: "UGX 41,600,000",
        utilization: 65.3,
        status: "On track",
        lastUpdated: "Today",
    },
    {
        id: 2,
        name: "Competitions",
        category: "League, cup, series",
        allocated: "UGX 200,000,000",
        spent: "UGX 142,000,000",
        remaining: "UGX 58,000,000",
        utilization: 71.0,
        status: "Watch",
        lastUpdated: "Yesterday",
    },
    {
        id: 3,
        name: "Development",
        category: "Youth, women, officials",
        allocated: "UGX 55,000,000",
        spent: "UGX 49,500,000",
        remaining: "UGX 5,500,000",
        utilization: 90.0,
        status: "At limit",
        lastUpdated: "2 days ago",
    },
];

type SortDirection = "asc" | "desc";

type SortConfig = {
    key: string;
    direction: SortDirection;
};

export default function UnionAdminBudgetOversight() {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sort, setSort] = useState<SortConfig>({ key: "name", direction: "asc" });
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const debouncedSearch = useDebouncedValue(searchQuery, 250);

    const statuses = useMemo(() => {
        const values = new Set(sampleBudgets.map((item) => item.status));
        return Array.from(values).sort();
    }, []);

    const filteredBudgets = useMemo(() => {
        const lowerSearch = debouncedSearch.toLowerCase();

        return sampleBudgets.filter((item) => {
            const matchesSearch =
                !lowerSearch ||
                [item.name, item.category, item.status].some((value) =>
                    value.toLowerCase().includes(lowerSearch),
                );

            const matchesStatus = statusFilter === "all" || item.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [debouncedSearch, statusFilter]);

    const sortedBudgets = useMemo(() => {
        return [...filteredBudgets].sort((a, b) => {
            const aValue = a[sort.key as keyof BudgetRecord];
            const bValue = b[sort.key as keyof BudgetRecord];

            if (typeof aValue === "number" && typeof bValue === "number") {
                return sort.direction === "asc" ? aValue - bValue : bValue - aValue;
            }

            const aString = String(aValue ?? "");
            const bString = String(bValue ?? "");

            return sort.direction === "asc"
                ? aString.localeCompare(bString)
                : bString.localeCompare(aString);
        });
    }, [filteredBudgets, sort]);

    const totalPages = Math.max(1, Math.ceil(sortedBudgets.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const paginatedBudgets = sortedBudgets.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize,
    );

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter]);

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

    return (
        <section className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Budget oversight</h1>
                    <p>Track allocated budgets, actual spending and remaining balances across union cost centres.</p>
                </div>
                <button className={styles.primaryButton} type="button">
                    <Download size={16} strokeWidth={2.2} aria-hidden="true" />
                    Export
                </button>
            </header>

            <div className={styles.controls}>
                <label className={styles.searchField}>
                    <Search size={16} strokeWidth={2.2} aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Search budgets by name, category or status..."
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
                                { key: "name", label: "Budget" },
                                { key: "category", label: "Category" },
                                { key: "allocated", label: "Allocated" },
                                { key: "spent", label: "Spent" },
                                { key: "remaining", label: "Remaining" },
                                { key: "utilization", label: "Utilization" },
                                { key: "status", label: "Status" },
                                { key: "lastUpdated", label: "Updated" },
                            ].map((column) => (
                                <th key={column.key}>
                                    <button type="button" onClick={() => handleSort(column.key)}>
                                        <span>{column.label}</span>
                                        {renderSortIcon(column.key)}
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedBudgets.length > 0 ? (
                            paginatedBudgets.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <strong>{item.name}</strong>
                                    </td>
                                    <td>{item.category}</td>
                                    <td>{item.allocated}</td>
                                    <td>{item.spent}</td>
                                    <td>{item.remaining}</td>
                                    <td>{item.utilization.toFixed(1)}%</td>
                                    <td>
                                        <span
                                            className={
                                                item.utilization >= 90
                                                    ? styles.statusDanger
                                                    : item.utilization >= 70
                                                      ? styles.statusWarning
                                                      : styles.statusSuccess
                                            }
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>{item.lastUpdated}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className={styles.emptyRow}>
                                    No budget records found for the selected filters.
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