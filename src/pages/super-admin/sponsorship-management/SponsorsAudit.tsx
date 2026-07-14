import { useMemo, useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import "../../../styles/pages/super-admin/sponsorship-management/sponsorshipManagement.css";

interface AuditLog {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  target: string;
  status: "Success" | "Failed" | "Pending";
}

const SEED_LOGS: AuditLog[] = [
  {
    id: 1,
    timestamp: "14 Jul 2026 • 10:30 AM",
    user: "Merab Apio",
    action: "Created Framework",
    module: "Sponsor Frameworks",
    target: "Gold Sponsorship",
    status: "Success",
  },
  {
    id: 2,
    timestamp: "14 Jul 2026 • 09:45 AM",
    user: "Sarah",
    action: "Updated Placement",
    module: "Placements",
    target: "Homepage Banner",
    status: "Success",
  },
  {
    id: 3,
    timestamp: "13 Jul 2026 • 04:20 PM",
    user: "James",
    action: "Approved Campaign",
    module: "Approvals",
    target: "MTN Fan Campaign",
    status: "Success",
  },
  {
    id: 4,
    timestamp: "13 Jul 2026 • 02:10 PM",
    user: "Admin",
    action: "Modified Benefit Share",
    module: "Benefit Sharing",
    target: "Premier League Policy",
    status: "Pending",
  },
  {
    id: 5,
    timestamp: "12 Jul 2026 • 11:35 AM",
    user: "Grace",
    action: "Deleted Placement",
    module: "Placements",
    target: "Sidebar Banner",
    status: "Failed",
  },
];

function downloadCsv(rows: AuditLog[], filename: string) {
  const headers: (keyof AuditLog)[] = [
    "timestamp",
    "user",
    "action",
    "module",
    "target",
    "status",
  ];

  const escapeCell = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvLines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCell(String(row[h]))).join(",")),
  ];

  const blob = new Blob([csvLines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function SponsorAudits() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | AuditLog["status"]>(
    "All"
  );
  const [moduleFilter, setModuleFilter] = useState<string>("All");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const [logs, setLogs] = useState<AuditLog[]>(SEED_LOGS);

  const moduleOptions = useMemo(() => {
    const unique = Array.from(new Set(logs.map((l) => l.module)));
    return ["All", ...unique];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = Object.values(log)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || log.status === statusFilter;
      const matchesModule = moduleFilter === "All" || log.module === moduleFilter;
      return matchesSearch && matchesStatus && matchesModule;
    });
  }, [logs, search, statusFilter, moduleFilter]);

  const successCount = logs.filter((l) => l.status === "Success").length;
  const failedCount = logs.filter((l) => l.status === "Failed").length;
  const pendingCount = logs.filter((l) => l.status === "Pending").length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulated fetch — swap this block for a real API call, e.g.
    // const data = await fetchAuditLogs(); setLogs(data);
    setTimeout(() => {
      setLogs(SEED_LOGS);
      setIsRefreshing(false);
      setLastRefreshed(new Date());
    }, 700);
  };

  const handleExportCsv = () => {
    if (filteredLogs.length === 0) return;
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    downloadCsv(filteredLogs, `sponsor-audit-logs-${stamp}.csv`);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setModuleFilter("All");
  };

  const hasActiveFilters =
    search !== "" || statusFilter !== "All" || moduleFilter !== "All";

  // Close modal on Escape key
  useEffect(() => {
    if (!selectedLog) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedLog(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedLog]);

  return (
    <div className="sponsor-audits">
      <div className="page-header">
        <div>
          <h2>Compliance & Audit Logs</h2>
          <p>
            Monitor sponsorship activities, approvals, updates, and compliance
            history.
          </p>
          {lastRefreshed && (
            <p style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: 4 }}>
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </p>
          )}
        </div>

        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? "Refreshing..." : "Refresh Logs"}
        </button>
      </div>

      <div className="audit-summary">
        <div className="summary-card">
          <h3>Total Logs</h3>
          <span>{logs.length}</span>
        </div>

        <div className="summary-card success">
          <h3>Successful</h3>
          <span>{successCount}</span>
        </div>

        <div className="summary-card pending">
          <h3>Pending</h3>
          <span>{pendingCount}</span>
        </div>

        <div className="summary-card failed">
          <h3>Failed</h3>
          <span>{failedCount}</span>
        </div>
      </div>

      <div className="audit-toolbar">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "All" | AuditLog["status"])
          }
          aria-label="Filter by status"
        >
          <option value="All">All Statuses</option>
          <option value="Success">Success</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          aria-label="Filter by module"
        >
          {moduleOptions.map((m) => (
            <option key={m} value={m}>
              {m === "All" ? "All Modules" : m}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        )}

        <button onClick={handleExportCsv} disabled={filteredLogs.length === 0}>
          Export CSV
        </button>
      </div>

      <div className="audit-table-container">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>User</th>
              <th>Action</th>
              <th>Module</th>
              <th>Target</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td>{log.user}</td>
                <td>{log.action}</td>
                <td>{log.module}</td>
                <td>{log.target}</td>

                <td>
                  <span className={`status ${log.status.toLowerCase()}`}>
                    {log.status}
                  </span>
                </td>

                <td>
                  <button
                    className="view-btn"
                    onClick={() => setSelectedLog(log)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-state">
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <div
          className="audit-modal-overlay"
          onClick={() => setSelectedLog(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="audit-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 24,
              width: "min(480px, 90vw)",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ margin: 0 }}>Audit Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                aria-label="Close"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <dl style={{ display: "grid", rowGap: 10 }}>
              <div>
                <dt style={{ fontWeight: 600, fontSize: "0.8rem", opacity: 0.7 }}>
                  Date & Time
                </dt>
                <dd style={{ margin: 0 }}>{selectedLog.timestamp}</dd>
              </div>
              <div>
                <dt style={{ fontWeight: 600, fontSize: "0.8rem", opacity: 0.7 }}>
                  User
                </dt>
                <dd style={{ margin: 0 }}>{selectedLog.user}</dd>
              </div>
              <div>
                <dt style={{ fontWeight: 600, fontSize: "0.8rem", opacity: 0.7 }}>
                  Action
                </dt>
                <dd style={{ margin: 0 }}>{selectedLog.action}</dd>
              </div>
              <div>
                <dt style={{ fontWeight: 600, fontSize: "0.8rem", opacity: 0.7 }}>
                  Module
                </dt>
                <dd style={{ margin: 0 }}>{selectedLog.module}</dd>
              </div>
              <div>
                <dt style={{ fontWeight: 600, fontSize: "0.8rem", opacity: 0.7 }}>
                  Target
                </dt>
                <dd style={{ margin: 0 }}>{selectedLog.target}</dd>
              </div>
              <div>
                <dt style={{ fontWeight: 600, fontSize: "0.8rem", opacity: 0.7 }}>
                  Status
                </dt>
                <dd style={{ margin: 0 }}>
                  <span className={`status ${selectedLog.status.toLowerCase()}`}>
                    {selectedLog.status}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
