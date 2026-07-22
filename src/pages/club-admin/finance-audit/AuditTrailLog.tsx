import {
  Activity,
  Download,
  Eye,
  FileSearch,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  WorkspaceEmpty,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
  WorkspaceStatus,
  adminWorkspaceStyles as layoutStyles,
  formatWorkspaceDate,
} from "../../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import {
  getApiErrorMessage,
  getAuditTrail,
  type AuditLogEntry,
  type AuditTrailData,
  type AuditTrailParams,
} from "../../../services/clubFinanceAuditService";
import styles from "./FinanceAudit.module.css";

const CATEGORY_FILTERS = [
  "ALL",
  "FINANCE",
  "ROLE_CHANGE",
  "GOVERNANCE",
  "ACCESS_VIOLATION",
  "PAYMENT",
] as const;

const PAGE_SIZE = 10;

interface AuditTrailLogProps {
  clubId: number;
}

function formatLabel(value: string) {
  if (value === "ALL") return "All Categories";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function stringifyMetadata(metadata?: Record<string, unknown>) {
  if (!metadata || Object.keys(metadata).length === 0) return "No metadata";

  return Object.entries(metadata)
    .map(([key, value]) => {
      const displayValue =
        typeof value === "string" || typeof value === "number"
          ? value
          : JSON.stringify(value);

      return `${formatLabel(key)}: ${displayValue}`;
    })
    .join(" | ");
}

function downloadCsv(rows: AuditLogEntry[], filename: string) {
  const headers = [
    "Timestamp",
    "Actor",
    "Action",
    "Category",
    "Target",
    "IP Address",
    "Path",
    "Details",
  ];

  const escape = (value: unknown) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  const csv = [
    headers.join(","),
    ...rows.map((entry) =>
      [
        entry.timestamp,
        entry.actorEmail
          ? `${entry.actorName} <${entry.actorEmail}>`
          : entry.actorName,
        formatLabel(entry.action),
        entry.categoryDisplay || formatLabel(entry.category || ""),
        entry.targetEmail
          ? `${entry.target} <${entry.targetEmail}>`
          : entry.target,
        entry.ipAddress,
        entry.path,
        stringifyMetadata(entry.metadata),
      ]
        .map(escape)
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AuditTrailLog({ clubId }: AuditTrailLogProps) {
  const [data, setData] = useState<AuditTrailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<(typeof CATEGORY_FILTERS)[number]>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const requestIdRef = useRef(0);

  const params = useMemo<AuditTrailParams>(
    () => ({
      category: categoryFilter !== "ALL" ? categoryFilter : undefined,
      search: searchQuery.trim() || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      page,
      page_size: PAGE_SIZE,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    [categoryFilter, endDate, page, searchQuery, startDate],
  );

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError("");

    try {
      const result = await getAuditTrail(clubId, params);
      if (requestId !== requestIdRef.current) return;

      setData(result);
      setSelectedEntryId((current) => {
        if (current && result.entries.some((entry) => entry.id === current)) {
          return current;
        }

        return result.entries[0]?.id ?? null;
      });
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return;
      setData(null);
      setError(
        getApiErrorMessage(
          loadError,
          "Audit trail activity could not be loaded.",
        ),
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [clubId, params]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, endDate, searchQuery, startDate]);

  const entries = data?.entries ?? [];
  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return entries.filter((entry) => {
      const categoryMatches =
        categoryFilter === "ALL" || entry.category === categoryFilter;

      if (!categoryMatches) return false;
      if (!query) return true;

      return [
        entry.actorName,
        entry.actorEmail,
        entry.action,
        entry.category,
        entry.categoryDisplay,
        entry.target,
        entry.targetEmail,
        entry.ipAddress,
        entry.path,
        stringifyMetadata(entry.metadata),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [categoryFilter, entries, searchQuery]);

  const backendTotal = data?.count ?? filteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(backendTotal / PAGE_SIZE));
  const selectedEntry =
    entries.find((entry) => entry.id === selectedEntryId) ??
    filteredEntries[0] ??
    null;

  const stats = useMemo(() => {
    const uniqueActors = new Set(
      entries.map((entry) => entry.actorEmail || entry.actorName),
    ).size;
    const sensitiveEvents = entries.filter((entry) =>
      ["ACCESS_VIOLATION", "ROLE_CHANGE", "GOVERNANCE"].includes(
        entry.category || "",
      ),
    ).length;
    const failedEvents = entries.filter((entry) =>
      String(entry.statusCode ?? "").startsWith("4") ||
      String(entry.statusCode ?? "").startsWith("5"),
    ).length;

    return [
      {
        key: "events",
        label: "AUDIT EVENTS",
        value: backendTotal.toLocaleString("en-UG"),
        detail: `${entries.length} loaded`,
        icon: Activity,
        accent: "#a879ff",
      },
      {
        key: "actors",
        label: "ACTIVE ACTORS",
        value: uniqueActors.toLocaleString("en-UG"),
        detail: "In current results",
        icon: UserRound,
        accent: "#38bdf8",
      },
      {
        key: "sensitive",
        label: "SENSITIVE EVENTS",
        value: sensitiveEvents.toLocaleString("en-UG"),
        detail: "Governance or access",
        icon: ShieldCheck,
        accent: "#ffd179",
      },
      {
        key: "failed",
        label: "FAILED REQUESTS",
        value: failedEvents.toLocaleString("en-UG"),
        detail: "4xx or 5xx statuses",
        icon: FileSearch,
        accent: "#ff9b9b",
      },
    ] as const;
  }, [backendTotal, entries]);

  function clearFilters() {
    setSearchQuery("");
    setCategoryFilter("ALL");
    setStartDate("");
    setEndDate("");
  }

  if (isLoading && !data) {
    return <WorkspaceLoading label="Loading audit trail..." />;
  }

  if (error && !data) {
    return <WorkspaceError message={error} onRetry={() => void load()} />;
  }

  return (
    <div className={styles.page}>
      <section
        className={styles.statsGrid}
        style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className={styles.statCard} key={stat.key}>
              <div className={styles.statCardTop}>
                <span
                  className={styles.statIcon}
                  style={{
                    background: `${stat.accent}22`,
                    color: stat.accent,
                  }}
                >
                  <Icon size={17} />
                </span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>

              <span className={styles.statValue}>{stat.value}</span>
              <div className={styles.statFooter}>
                <div className={styles.statFooterText}>
                  <span className={styles.trendNote}>{stat.detail}</span>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <WorkspacePanel
        eyebrow="Finance & Audit"
        title="Audit Trail Log"
        description="Review who changed what, when it happened, and the technical context captured by League OS."
        actions={
          <>
            <button
              type="button"
              className={layoutStyles.secondaryButton}
              onClick={() => void load()}
              disabled={isLoading}
            >
              <RefreshCw size={14} />
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              className={layoutStyles.primaryButton}
              onClick={() =>
                downloadCsv(filteredEntries, `audit-trail-${clubId}.csv`)
              }
              disabled={filteredEntries.length === 0}
            >
              <Download size={14} />
              Export CSV
            </button>
          </>
        }
      >
        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="search"
              placeholder="Search actor, target, action, IP, or metadata"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className={`${styles.controlSelect} ${styles.searchInput}`}
            />
          </div>

          <select
            aria-label="Filter by category"
            className={styles.controlSelect}
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(
                event.target.value as (typeof CATEGORY_FILTERS)[number],
              )
            }
          >
            {CATEGORY_FILTERS.map((category) => (
              <option key={category} value={category}>
                {formatLabel(category)}
              </option>
            ))}
          </select>

          <input
            aria-label="Start date"
            type="date"
            className={styles.controlSelect}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <input
            aria-label="End date"
            type="date"
            className={styles.controlSelect}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />

          <button
            type="button"
            className={styles.controlButton}
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>

        {error && data ? (
          <div className={layoutStyles.validationCard}>
            <strong>Some information may be stale</strong>
            <span>{error}</span>
          </div>
        ) : null}

        <div className={styles.contentGrid}>
          <div style={{ minWidth: 0, display: "grid", gap: 12 }}>
            {filteredEntries.length === 0 ? (
              <WorkspaceEmpty
                title="No audit entries found"
                description="No audit trail records match the current filters."
              />
            ) : (
              <div className={layoutStyles.tableShell}>
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Actor</th>
                      <th>Action</th>
                      <th>Target</th>
                      <th>Source</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className={`${styles.tableRow} ${
                          entry.id === selectedEntryId
                            ? styles.tableRowSelected
                            : ""
                        }`}
                        onClick={() => setSelectedEntryId(entry.id)}
                      >
                        <td>{formatWorkspaceDate(entry.timestamp)}</td>
                        <td>
                          <span className={layoutStyles.tablePrimary}>
                            {entry.actorName}
                          </span>
                          {entry.actorEmail ? (
                            <span className={layoutStyles.tableSecondary}>
                              {entry.actorEmail}
                            </span>
                          ) : null}
                        </td>
                        <td>
                          <WorkspaceStatus
                            value={entry.categoryDisplay || entry.action}
                          />
                        </td>
                        <td>
                          <span className={layoutStyles.tablePrimary}>
                            {entry.target}
                          </span>
                          {entry.targetEmail ? (
                            <span className={layoutStyles.tableSecondary}>
                              {entry.targetEmail}
                            </span>
                          ) : null}
                        </td>
                        <td>
                          <span>{entry.ipAddress || "Unknown IP"}</span>
                          {entry.method || entry.path ? (
                            <span className={layoutStyles.tableSecondary}>
                              {[entry.method, entry.path]
                                .filter(Boolean)
                                .join(" ")}
                            </span>
                          ) : null}
                        </td>
                        <td>
                          <button
                            type="button"
                            aria-label="View audit entry"
                            className={styles.iconButton}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedEntryId(entry.id);
                            }}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {backendTotal > PAGE_SIZE ? (
              <div className={styles.paginationFooter}>
                <span className={styles.pageInfo}>
                  Page {page} of {totalPages} | {backendTotal} entries
                </span>
                <div className={styles.pagination}>
                  <button
                    type="button"
                    className={styles.pageButton}
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className={styles.pageButton}
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <aside className={styles.donutCard}>
            <h3 className={styles.cardHeading}>Entry Details</h3>

            {selectedEntry ? (
              <div style={{ display: "grid", gap: 16 }}>
                <div className={styles.previewTop}>
                  <span className={styles.previewLabel}>
                    {formatWorkspaceDate(selectedEntry.timestamp)}
                  </span>
                  <WorkspaceStatus
                    value={
                      selectedEntry.categoryDisplay ||
                      selectedEntry.category ||
                      selectedEntry.action
                    }
                  />
                </div>

                <dl className={styles.previewDetailList}>
                  {[
                    ["Actor", selectedEntry.actorName],
                    ["Action", formatLabel(selectedEntry.action)],
                    ["Target", selectedEntry.target],
                    ["IP Address", selectedEntry.ipAddress || "Not recorded"],
                    [
                      "Request",
                      [selectedEntry.method, selectedEntry.path]
                        .filter(Boolean)
                        .join(" ") || "Not recorded",
                    ],
                    [
                      "Status Code",
                      selectedEntry.statusCode
                        ? String(selectedEntry.statusCode)
                        : "Not recorded",
                    ],
                  ].map(([term, value]) => (
                    <div key={term} className={styles.previewDetailRow}>
                      <dt className={styles.previewTerm}>{term}</dt>
                      <dd className={styles.previewValue}>{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className={styles.metadataBlock}>
                  <span className={styles.previewLabel}>Metadata</span>
                  <pre>{stringifyMetadata(selectedEntry.metadata)}</pre>
                </div>
              </div>
            ) : (
              <WorkspaceEmpty
                title="No entry selected"
                description="Select an audit entry to inspect the recorded details."
              />
            )}
          </aside>
        </div>
      </WorkspacePanel>
    </div>
  );
}
