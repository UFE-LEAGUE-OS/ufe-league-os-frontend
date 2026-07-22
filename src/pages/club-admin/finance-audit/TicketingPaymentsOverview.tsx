import {
  CreditCard,
  Download,
  RotateCcw,
  Search,
  Smartphone,
  TicketCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  WorkspaceEmpty,
  WorkspaceError,
  WorkspacePanel,
  WorkspaceStatus,
  adminWorkspaceStyles as styles,
  formatWorkspaceDate,
} from "../../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import {
  exportTicketingPayments,
  getApiErrorMessage,
  getTicketingPayments,
  type FinanceStat,
  type TicketingPaymentsData,
  type TicketingPaymentsParams,
  type TicketingTrendPeriod,
} from "../../../services/clubFinanceAuditService";
import "../../../styles/pages/club-admin/finance-audit/TicketingPaymentsOverview.css";

const STATUS_FILTERS = ["ALL", "COMPLETED", "PENDING", "FAILED", "REFUNDED"] as const;

const TREND_PERIODS: { value: TicketingTrendPeriod; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
];

const STAT_ICONS = {
  ticketsSold: TicketCheck,
  totalRevenue: Wallet,
  onlinePayments: CreditCard,
  mobileMoney: Smartphone,
  failedPayments: XCircle,
  refundRequests: RotateCcw,
} as const;

function formatUgx(value: number) {
  return `UGX ${Math.round(value).toLocaleString()}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function StatCard({ statKey, stat }: { statKey: keyof typeof STAT_ICONS; stat: FinanceStat }) {
  const Icon = STAT_ICONS[statKey];
  const isTrend = stat.footer.kind === "trend";
  const isUp = isTrend && stat.footer.kind === "trend" && stat.footer.direction === "up";

  return (
    <article className="mpo-stat-card">
      <span className="mpo-stat-icon" style={{ color: stat.accent }}>
        <Icon size={18} />
      </span>
      <div className="mpo-stat-body">
        <span className="mpo-stat-label">{stat.label}</span>
        <strong className="mpo-stat-value">{stat.value}</strong>
        {stat.footer.kind === "trend" ? (
          <span className={`mpo-stat-footer ${isUp ? "up" : "down"}`}>
            {stat.footer.value}
            <span className="mpo-stat-caption">{stat.footer.caption}</span>
          </span>
        ) : (
          <span className="mpo-stat-footer note">
            {stat.footer.value}
            <span className="mpo-stat-caption">{stat.footer.caption}</span>
          </span>
        )}
      </div>
    </article>
  );
}

export interface TicketingPaymentsOverviewProps {
  clubId: number;
}

export default function TicketingPaymentsOverview({
  clubId,
}: TicketingPaymentsOverviewProps) {
  const [data, setData] = useState<TicketingPaymentsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [matchFilter, setMatchFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<
    (typeof STATUS_FILTERS)[number]
  >("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [trendPeriod, setTrendPeriod] = useState<TicketingTrendPeriod>("30d");

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const requestIdRef = useRef(0);

  const params = useMemo<TicketingPaymentsParams>(
    () => ({
      match_id: matchFilter !== "ALL" ? Number(matchFilter) : undefined,
      payment_method: methodFilter !== "ALL" ? methodFilter : undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      search: searchQuery.trim() || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      trend_period: trendPeriod,
    }),
    [matchFilter, methodFilter, statusFilter, searchQuery, startDate, endDate, trendPeriod],
  );

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError("");

    try {
      const result = await getTicketingPayments(clubId, params);
      if (requestId !== requestIdRef.current) return;
      setData(result);
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return;
      setData(null);
      setError(
        getApiErrorMessage(
          loadError,
          "Ticketing payments could not be loaded.",
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

  async function handleExport() {
    setIsExporting(true);
    setExportError("");

    try {
      const blob = await exportTicketingPayments(clubId, params);
      downloadBlob(blob, `ticketing-payments-${clubId}.csv`);
    } catch (exportErr) {
      setExportError(
        getApiErrorMessage(
          exportErr,
          "The export could not be generated.",
        ),
      );
    } finally {
      setIsExporting(false);
    }
  }

  if (isLoading && !data) {
    return (
      <WorkspacePanel
        eyebrow="Finance & Audit"
        title="Ticketing Payments"
        description="Track ticket sales, payments, and refunds across all matches."
      >
        <WorkspaceEmpty
          title="Loading ticketing payments…"
          description="Fetching revenue, payment method mix, and recent purchases."
        />
      </WorkspacePanel>
    );
  }

  if (error && !data) {
    return (
      <WorkspacePanel
        eyebrow="Finance & Audit"
        title="Ticketing Payments"
        description="Track ticket sales, payments, and refunds across all matches."
      >
        <WorkspaceError message={error} onRetry={() => void load()} />
      </WorkspacePanel>
    );
  }

  if (!data) return null;

  const matchOptions = [
    { id: "ALL", label: "All Matches" },
    ...data.availableMatches.map((m) => ({ id: String(m.id), label: m.label })),
  ];
  const methodOptions = ["ALL", ...data.availablePaymentMethods];
  const maxMatchRevenue = Math.max(1, ...data.revenueByMatch.map((m) => m.amount));

  return (
    <div className="mpo-page">
      {error ? (
        <div className={styles.validationCard}>
          <strong>Some information may be stale</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mpo-stat-grid mpo-stat-grid-6">
        <StatCard statKey="ticketsSold" stat={data.stats.ticketsSold} />
        <StatCard statKey="totalRevenue" stat={data.stats.totalRevenue} />
        <StatCard statKey="onlinePayments" stat={data.stats.onlinePayments} />
        <StatCard statKey="mobileMoney" stat={data.stats.mobileMoney} />
        <StatCard statKey="failedPayments" stat={data.stats.failedPayments} />
        <StatCard statKey="refundRequests" stat={data.stats.refundRequests} />
      </div>

      <div className="mpo-chart-row">
        <WorkspacePanel
          eyebrow="Trend"
          title="Ticket Sales Trend"
          description="Ticket revenue collected over the selected period."
          actions={
            <select
              aria-label="Sales trend period"
              className="mpo-inline-select"
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value as TicketingTrendPeriod)}
            >
              {TREND_PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          }
        >
          {data.salesTrend.length === 0 ? (
            <WorkspaceEmpty
              title="No ticket sales recorded yet"
              description="Revenue will appear here once ticket payments are collected."
            />
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={data.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    stroke="var(--muted)"
                    tickFormatter={(value: string) => formatWorkspaceDate(value)}
                  />
                  <YAxis stroke="var(--muted)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                    labelFormatter={(value) =>
                      typeof value === "string" ? formatWorkspaceDate(value) : ""
                    }
                    formatter={(value) =>
                      typeof value === "number" ? formatUgx(value) : "—"
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--purple, #7c5cff)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Breakdown"
          title="Revenue by Payment Method"
          description="Share of ticket revenue by payment method."
        >
          {data.paymentMethodBreakdown.length === 0 ? (
            <WorkspaceEmpty
              title="No payment methods recorded yet"
              description="This breakdown will appear once ticket payments are recorded."
            />
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.paymentMethodBreakdown}
                    dataKey="amount"
                    nameKey="method"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {data.paymentMethodBreakdown.map((slice) => (
                      <Cell key={slice.method} fill={slice.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                    formatter={(value, _name, item) => {
                      const amount = typeof value === "number" ? value : 0;
                      const method = item?.payload?.method ?? "";
                      const share = item?.payload?.share ?? 0;
                      return [formatUgx(amount), `${method} · ${(share * 100).toFixed(1)}%`];
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="This month"
          title="Revenue by Match"
          description="Ticket revenue recorded per match this period."
        >
          {data.revenueByMatch.length === 0 ? (
            <WorkspaceEmpty
              title="No match revenue yet"
              description="Match-level revenue will appear once tickets are sold."
            />
          ) : (
            <ul className="mpo-match-revenue-list">
              {data.revenueByMatch.map((match) => (
                <li className="mpo-match-revenue-row" key={match.matchId}>
                  <div className="mpo-match-revenue-top">
                    <span className="mpo-match-revenue-label">{match.matchLabel}</span>
                    <span className="mpo-match-revenue-amount">
                      {formatUgx(match.amount)}
                    </span>
                  </div>
                  <div className="mpo-match-revenue-bar-track">
                    <div
                      className="mpo-match-revenue-bar-fill"
                      style={{
                        width: `${Math.max(4, (match.amount / maxMatchRevenue) * 100)}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </WorkspacePanel>
      </div>

      <WorkspacePanel
        eyebrow="Upcoming"
        title="Upcoming Matches Revenue"
        description="Projected ticket revenue for scheduled home fixtures."
      >
        {data.upcomingMatchesRevenue.length === 0 ? (
          <WorkspaceEmpty
            title="No upcoming matches"
            description="Projected revenue will appear here once home fixtures are scheduled."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Match</th>
                  <th>Date</th>
                  <th>Expected Revenue</th>
                  <th>Tickets Sold</th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingMatchesRevenue.map((match) => {
                  const percent =
                    match.ticketsAvailable > 0
                      ? Math.round((match.ticketsSold / match.ticketsAvailable) * 100)
                      : 0;

                  return (
                    <tr key={match.matchId}>
                      <td>
                        <span className={styles.tablePrimary}>{match.matchLabel}</span>
                      </td>
                      <td>{formatWorkspaceDate(match.matchDate)}</td>
                      <td>{formatUgx(match.expectedRevenue)}</td>
                      <td>
                        {match.ticketsSold} / {match.ticketsAvailable} ({percent}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>

      <WorkspacePanel
        eyebrow="Transactions"
        title="Recent Ticket Purchases"
        description="Search and filter individual ticket payment records."
        actions={
          <div className="mpo-toolbar">
            <div className="mpo-search-wrap">
              <Search size={15} className="mpo-search-icon" />
              <input
                className="mpo-search-input"
                type="search"
                placeholder="Search by buyer, match or transaction reference"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              aria-label="Filter by match"
              value={matchFilter}
              onChange={(e) => setMatchFilter(e.target.value)}
            >
              {matchOptions.map((match) => (
                <option key={match.id} value={match.id}>
                  {match.label}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by payment method"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              {methodOptions.map((method) => (
                <option key={method} value={method}>
                  {method === "ALL" ? "All Payment Methods" : method}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter payments by status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as (typeof STATUS_FILTERS)[number],
                )
              }
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Statuses" : s}
                </option>
              ))}
            </select>

            <label className="mpo-date-field">
              From
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label className="mpo-date-field">
              To
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => void handleExport()}
              disabled={isExporting}
            >
              <Download size={15} />
              {isExporting ? "Exporting…" : "Export"}
            </button>
          </div>
        }
      >
        {exportError ? (
          <div className={styles.validationCard}>
            <strong>Export failed</strong>
            <span>{exportError}</span>
          </div>
        ) : null}

        {data.payments.length === 0 ? (
          <WorkspaceEmpty
            title="No payments found"
            description="No ticket payments match the current filters."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Buyer</th>
                  <th>Match</th>
                  <th>Tickets</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <span className={styles.tablePrimary}>{payment.buyerName}</span>
                    </td>
                    <td>{payment.matchLabel}</td>
                    <td>{payment.ticketsCount}</td>
                    <td>{formatUgx(payment.amount)}</td>
                    <td>{payment.method}</td>
                    <td>
                      <WorkspaceStatus value={payment.status} />
                    </td>
                    <td>{formatWorkspaceDate(payment.paidAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    </div>
  );
}