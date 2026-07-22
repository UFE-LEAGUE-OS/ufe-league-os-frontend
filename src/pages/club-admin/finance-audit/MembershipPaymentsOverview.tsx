import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Download,
  RefreshCw,
  Search,
  ShieldAlert,
  Users as UsersIcon,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
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
  exportMembershipPayments,
  getApiErrorMessage,
  getMembershipPayments,
  type FinanceStat,
  type MembershipPaymentsData,
  type MembershipPaymentsParams,
} from "../../../services/clubFinanceAuditService";
import "../../../styles/pages/club-admin/finance-audit/MembershipPaymentsOverview.css";

const STATUS_FILTERS = ["ALL", "COMPLETED", "PENDING", "FAILED", "REFUNDED"] as const;

const STAT_ICONS = {
  totalRevenue: Wallet,
  activeMembers: UsersIcon,
  renewals: RefreshCw,
  expiredMemberships: ShieldAlert,
  refunds: CreditCard,
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
            {isUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
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

export interface MembershipPaymentsOverviewProps {
  clubId: number;
}

export default function MembershipPaymentsOverview({
  clubId,
}: MembershipPaymentsOverviewProps) {
  const [data, setData] = useState<MembershipPaymentsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<
    (typeof STATUS_FILTERS)[number]
  >("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const requestIdRef = useRef(0);

  const params = useMemo<MembershipPaymentsParams>(
    () => ({
      plan: planFilter !== "ALL" ? planFilter : undefined,
      payment_method: methodFilter !== "ALL" ? methodFilter : undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      search: searchQuery.trim() || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    }),
    [planFilter, methodFilter, statusFilter, searchQuery, startDate, endDate],
  );

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError("");

    try {
      const result = await getMembershipPayments(clubId, params);
      if (requestId !== requestIdRef.current) return;
      setData(result);
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return;
      setData(null);
      setError(
        getApiErrorMessage(
          loadError,
          "Membership payments could not be loaded.",
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
      const blob = await exportMembershipPayments(clubId, params);
      downloadBlob(blob, `membership-payments-${clubId}.csv`);
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
        title="Membership Payments"
        description="View and manage membership payment summaries and subscriptions."
      >
        <WorkspaceEmpty
          title="Loading membership payments…"
          description="Fetching revenue, plan distribution, and recent transactions."
        />
      </WorkspacePanel>
    );
  }

  if (error && !data) {
    return (
      <WorkspacePanel
        eyebrow="Finance & Audit"
        title="Membership Payments"
        description="View and manage membership payment summaries and subscriptions."
      >
        <WorkspaceError message={error} onRetry={() => void load()} />
      </WorkspacePanel>
    );
  }

  if (!data) return null;

  const planOptions = ["ALL", ...data.availablePlans];
  const methodOptions = ["ALL", ...data.availablePaymentMethods];

  return (
    <div className="mpo-page">
      {error ? (
        <div className={styles.validationCard}>
          <strong>Some information may be stale</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mpo-stat-grid">
        <StatCard statKey="totalRevenue" stat={data.stats.totalRevenue} />
        <StatCard statKey="activeMembers" stat={data.stats.activeMembers} />
        <StatCard statKey="renewals" stat={data.stats.renewals} />
        <StatCard
          statKey="expiredMemberships"
          stat={data.stats.expiredMemberships}
        />
        <StatCard statKey="refunds" stat={data.stats.refunds} />
      </div>

      <div className="mpo-chart-row">
        <WorkspacePanel
          eyebrow="Trend"
          title="Membership Revenue Trend"
          description="Daily revenue collected from membership payments."
        >
          {data.revenueTrend.length === 0 ? (
            <WorkspaceEmpty
              title="No revenue recorded yet"
              description="Revenue will appear here once membership payments are collected."
            />
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={data.revenueTrend}>
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
          title="Membership Plan Distribution"
          description="Share of revenue by membership plan."
        >
          {data.planBreakdown.length === 0 ? (
            <WorkspaceEmpty
              title="No plans with revenue yet"
              description="Plan distribution will appear once payments are recorded."
            />
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.planBreakdown}
                    dataKey="amount"
                    nameKey="plan"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {data.planBreakdown.map((slice) => (
                      <Cell key={slice.plan} fill={slice.color} />
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
                      const plan = item?.payload?.plan ?? "";
                      const share = item?.payload?.share ?? 0;
                      return [formatUgx(amount), `${plan} · ${(share * 100).toFixed(1)}%`];
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="This year"
          title="Monthly Membership Revenue"
          description="Revenue collected from membership payments per month."
        >
          {data.monthlyRevenue.length === 0 ? (
            <WorkspaceEmpty
              title="No monthly data yet"
              description="Monthly totals will appear once payments span more than one month."
            />
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={data.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted)" />
                  <YAxis stroke="var(--muted)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      color: "var(--text)",
                    }}
                    formatter={(value) =>
                      typeof value === "number" ? formatUgx(value) : "—"
                    }
                  />
                  <Bar
                    dataKey="amount"
                    fill="var(--purple, #7c5cff)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </WorkspacePanel>
      </div>

      <WorkspacePanel
        eyebrow="Transactions"
        title="Recent Membership Payments"
        description="Search and filter individual membership payment records."
        actions={
          <div className="mpo-toolbar">
            <div className="mpo-search-wrap">
              <Search size={15} className="mpo-search-icon" />
              <input
                className="mpo-search-input"
                type="search"
                placeholder="Search by package, owner or transaction reference"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              aria-label="Filter by plan"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              {planOptions.map((plan) => (
                <option key={plan} value={plan}>
                  {plan === "ALL" ? "All Plans" : plan}
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
              aria-label="Filter agreements by status"
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
            description="No membership payments match the current filters."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <span className={styles.tablePrimary}>
                        {payment.memberName}
                      </span>
                      <span className={styles.tableSecondary}>
                        {payment.memberRef}
                      </span>
                    </td>
                    <td>{payment.plan}</td>
                    <td>{formatUgx(payment.amount)}</td>
                    <td>{payment.method}</td>
                    <td>{payment.transactionId}</td>
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