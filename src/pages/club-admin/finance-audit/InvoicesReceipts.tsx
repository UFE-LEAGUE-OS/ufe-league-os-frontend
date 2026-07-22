// src/pages/club-admin/finance-audit/InvoicesReceiptsOverview.tsx
//
// "Invoices & receipts list" tab content for Finance & Audit.
// Mirrors MembershipPaymentsOverview.tsx / TicketingPaymentsOverview.tsx:
//   - fetches its own data given a clubId
//   - reuses WorkspaceStatus / formatWorkspaceDate / getApiErrorMessage
//   - reuses the shared finance-audit stat-card/panel styles for the
//     stats row + two-column content grid, and adminWorkspaceStyles
//     for the table shell / buttons so it matches the rest of the app.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  Download,
  Eye,
  FileText,
  Mail,
  Receipt,
  Search,
} from "lucide-react";

import {
  getApiErrorMessage,
  getInvoices,
  sendInvoiceReceiptEmail,
  type InvoiceRecord,
  type InvoiceStatus,
  type InvoicesData,
} from "../../../services/clubFinanceAuditService";
import {
  WorkspaceEmpty,
  WorkspaceError,
  WorkspaceLoading,
  WorkspaceStatus,
  adminWorkspaceStyles as layoutStyles,
  formatWorkspaceDate,
} from "../../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
// Shared stat-card / donut-card / table-card styles used across the
// Finance & Audit sub-pages (Membership payments, Ticketing payments, …).
// Adjust this path if your shared module lives under a different name.
import styles from "./FinanceAudit.module.css";

const STATUS_FILTERS: Array<InvoiceStatus | "ALL"> = [
  "ALL",
  "PAID",
  "OUTSTANDING",
  "OVERDUE",
  "VOID",
];

const PAGE_SIZE = 8;

function formatCurrency(amount: number, currency = "UGX") {
  return `${currency} ${amount.toLocaleString("en-UG")}`;
}

function formatStatusLabel(status: InvoiceStatus | "ALL") {
  if (status === "ALL") return "All Statuses";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

interface InvoicesReceiptsOverviewProps {
  clubId: number;
}

export default function InvoicesReceiptsOverview({
  clubId,
}: InvoicesReceiptsOverviewProps) {
  const [data, setData] = useState<InvoicesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">(
    "ALL",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [page, setPage] = useState(1);

  // "Send Email" action state for the Receipt Preview panel.
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const result = await getInvoices(clubId, {
        status: statusFilter,
        search: search || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });

      setData(result);
      setSelectedInvoiceId(
        (current) =>
          (current &&
          result.invoices.some((invoice) => invoice.id === current)
            ? current
            : result.invoices[0]?.id) ?? null,
      );
    } catch (loadError) {
      setError(
        getApiErrorMessage(
          loadError,
          "Invoices and receipts could not be loaded.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [clubId, statusFilter, search, startDate, endDate]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, startDate, endDate]);

  useEffect(() => {
    setEmailFeedback(null);
  }, [selectedInvoiceId]);

  const invoices = data?.invoices ?? [];

  // Search is also sent to the backend via `load()`, but we keep a
  // client-side pass too so paging/filtering feels instant while a
  // fresh request is in flight, and so it still works before the
  // backend ships full-text search support.
  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return invoices;

    return invoices.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.billedTo.toLowerCase().includes(query),
    );
  }, [invoices, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / PAGE_SIZE),
  );
  const pagedInvoices = filteredInvoices.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const stats = useMemo(() => {
    const paid = invoices.filter((invoice) => invoice.status === "PAID");
    const outstanding = invoices.filter(
      (invoice) => invoice.status === "OUTSTANDING",
    );
    const overdue = invoices.filter(
      (invoice) => invoice.status === "OVERDUE",
    );
    const receiptsIssued = invoices.filter((invoice) =>
      Boolean(invoice.receiptUrl),
    );
    const sum = (list: InvoiceRecord[]) =>
      list.reduce((total, invoice) => total + invoice.amount, 0);

    return [
      {
        key: "outstanding",
        label: "OUTSTANDING INVOICES",
        value: formatCurrency(
          data?.summary.outstandingTotal ?? sum(outstanding),
        ),
        detail: `${data?.summary.outstandingCount ?? outstanding.length} Invoices`,
        icon: FileText,
        accent: "#a879ff",
      },
      {
        key: "paid",
        label: "PAID INVOICES",
        value: formatCurrency(sum(paid)),
        detail: `${paid.length} Invoices`,
        icon: Banknote,
        accent: "#4ade80",
      },
      {
        key: "receipts",
        label: "RECEIPTS ISSUED",
        value: formatCurrency(sum(receiptsIssued)),
        detail: `${receiptsIssued.length} Receipts`,
        icon: Receipt,
        accent: "#38bdf8",
      },
      {
        key: "overdue",
        label: "OVERDUE AMOUNT",
        value: formatCurrency(sum(overdue)),
        detail: `${overdue.length} Invoices`,
        icon: AlertCircle,
        accent: "#ff9b9b",
      },
    ] as const;
  }, [invoices, data]);

  const selectedInvoice = useMemo(
    () =>
      invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null,
    [invoices, selectedInvoiceId],
  );

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setStartDate("");
    setEndDate("");
  }

  function downloadInvoice(invoice: InvoiceRecord) {
    if (!invoice.receiptUrl) return;
    window.open(invoice.receiptUrl, "_blank", "noopener,noreferrer");
  }

  async function sendReceiptEmail(invoice: InvoiceRecord) {
    setIsSendingEmail(true);
    setEmailFeedback(null);

    try {
      await sendInvoiceReceiptEmail(clubId, invoice.id);
      setEmailFeedback({
        kind: "success",
        message: "Receipt emailed successfully.",
      });
    } catch (sendError) {
      setEmailFeedback({
        kind: "error",
        message: getApiErrorMessage(
          sendError,
          "The receipt could not be emailed.",
        ),
      });
    } finally {
      setIsSendingEmail(false);
    }
  }

  if (isLoading && !data) {
    return <WorkspaceLoading label="Loading invoices & receipts…" />;
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

      <section className={styles.tableCard}>
        <div className={styles.tableCardHeader}>
          <h3 className={styles.cardHeading}>Invoices &amp; Receipts</h3>
          <span className={styles.viewAllLink}>
            View, manage and download invoices and receipts
          </span>
        </div>

        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search invoices by number, member, or description…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={`${styles.controlSelect} ${styles.searchInput}`}
            />
          </div>

          <select
            className={styles.controlSelect}
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as InvoiceStatus | "ALL")
            }
          >
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {formatStatusLabel(status)}
              </option>
            ))}
          </select>

          <input
            type="date"
            className={styles.controlSelect}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <input
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
            {pagedInvoices.length === 0 ? (
              <WorkspaceEmpty
                title="No invoices found"
                description="No invoices match the current filters."
              />
            ) : (
              <div className={layoutStyles.tableShell}>
                <table>
                  <thead>
                    <tr>
                      <th>Invoice No.</th>
                      <th>Member / Customer</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        onClick={() => setSelectedInvoiceId(invoice.id)}
                        className={`${styles.tableRow} ${
                          invoice.id === selectedInvoiceId
                            ? styles.tableRowSelected
                            : ""
                        }`}
                      >
                        <td>
                          <span className={layoutStyles.tablePrimary}>
                            {invoice.invoiceNumber}
                          </span>
                        </td>
                        <td>{invoice.billedTo}</td>
                        <td>{formatCurrency(invoice.amount)}</td>
                        <td>{formatWorkspaceDate(invoice.dueAt)}</td>
                        <td>
                          <WorkspaceStatus value={invoice.status} />
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <button
                              type="button"
                              aria-label="Preview invoice"
                              className={styles.iconButton}
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedInvoiceId(invoice.id);
                              }}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              aria-label="Download receipt"
                              disabled={!invoice.receiptUrl}
                              className={styles.iconButton}
                              onClick={(event) => {
                                event.stopPropagation();
                                downloadInvoice(invoice);
                              }}
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredInvoices.length > 0 ? (
              <div className={styles.paginationFooter}>
                <span className={styles.pageInfo}>
                  Showing {(page - 1) * PAGE_SIZE + 1}–
                  {(page - 1) * PAGE_SIZE + pagedInvoices.length} of{" "}
                  {filteredInvoices.length} invoices
                </span>

                <div className={styles.pagination}>
                  <button
                    type="button"
                    className={styles.pageButton}
                    disabled={page <= 1}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    ‹
                  </button>
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={`${styles.pageButton} ${
                        pageNumber === page ? styles.pageButtonActive : ""
                      }`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={styles.pageButton}
                    disabled={page >= totalPages}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    ›
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <aside className={styles.donutCard}>
            <h3 className={styles.cardHeading}>Receipt Preview</h3>

            {selectedInvoice ? (
              <div style={{ display: "grid", gap: 16 }}>
                <div className={styles.previewTop}>
                  <span className={styles.previewLabel}>Invoice</span>
                  <WorkspaceStatus value={selectedInvoice.status} />
                </div>

                <dl className={styles.previewDetailList}>
                  {[
                    ["Invoice No.", selectedInvoice.invoiceNumber],
                    [
                      "Date Issued",
                      formatWorkspaceDate(selectedInvoice.issuedAt),
                    ],
                    ["Billed To", selectedInvoice.billedTo],
                    ["Amount", formatCurrency(selectedInvoice.amount)],
                    ["Due Date", formatWorkspaceDate(selectedInvoice.dueAt)],
                  ].map(([term, value]) => (
                    <div key={term} className={styles.previewDetailRow}>
                      <dt className={styles.previewTerm}>{term}</dt>
                      <dd className={styles.previewValue}>{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className={styles.previewActions}>
                  <button
                    type="button"
                    className={layoutStyles.primaryButton}
                    disabled={!selectedInvoice.receiptUrl}
                    onClick={() => downloadInvoice(selectedInvoice)}
                  >
                    <Download size={14} /> Download PDF
                  </button>
                  <button
                    type="button"
                    className={layoutStyles.secondaryButton}
                    disabled={isSendingEmail}
                    onClick={() => void sendReceiptEmail(selectedInvoice)}
                  >
                    <Mail size={14} />{" "}
                    {isSendingEmail ? "Sending…" : "Send Email"}
                  </button>
                </div>

                {emailFeedback ? (
                  <span
                    className={`${styles.previewFeedback} ${
                      emailFeedback.kind === "success"
                        ? styles.previewFeedbackSuccess
                        : styles.previewFeedbackError
                    }`}
                  >
                    {emailFeedback.message}
                  </span>
                ) : null}
              </div>
            ) : (
              <WorkspaceEmpty
                title="No invoice selected"
                description="Select an invoice from the list to preview its receipt."
              />
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}