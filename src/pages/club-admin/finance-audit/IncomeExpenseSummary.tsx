import {
  BarChart3,
  Building2,
  FileBarChart,
  Megaphone,
  Users as UsersIcon,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
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
  adminWorkspaceStyles as styles,
} from "../../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import {
  getApiErrorMessage,
  getIncomeExpenseSummary,
  type IncomeExpenseSummaryData,
  type IncomeExpenseSummaryParams,
  type IncomeExpenseTrendPeriod,
} from "../../../services/clubFinanceAuditService";
import "../../../styles/pages/club-admin/finance-audit/IncomeExpenseSummary.css";

const TREND_PERIOD_OPTIONS: {
  value: IncomeExpenseTrendPeriod;
  label: string;
}[] = [
  { value: "thisYear", label: "This Year" },
  { value: "last12Months", label: "Last 12 Months" },
  { value: "lastYear", label: "Last Year" },
];

const STAT_ICONS = {
  totalIncome: Wallet,
  totalExpenses: FileBarChart,
  netProfit: BarChart3,
  operatingCosts: Building2,
  sponsorshipIncome: Megaphone,
  membershipIncome: UsersIcon,
} as const;

function formatUgx(value: number) {
  return `UGX ${Math.round(value).toLocaleString()}`;
}

function StatCard({
  statKey,
  stat,
}: {
  statKey: keyof typeof STAT_ICONS;
  stat: IncomeExpenseSummaryData["stats"][keyof typeof STAT_ICONS];
}) {
  const Icon = STAT_ICONS[statKey];
  const isTrend = stat.footer.kind === "trend";
  const isUp =
    isTrend && stat.footer.kind === "trend" && stat.footer.direction === "up";

  return (
    <article className="ies-stat-card">
      <span className="ies-stat-icon" style={{ color: stat.accent }}>
        <Icon size={18} />
      </span>
      <div className="ies-stat-body">
        <span className="ies-stat-label">{stat.label}</span>
        <strong className="ies-stat-value">{stat.value}</strong>
        <span
          className={`ies-stat-footer ${
            isTrend ? (isUp ? "up" : "down") : "note"
          }`}
        >
          {stat.footer.value}
          <span className="ies-stat-caption">{stat.footer.caption}</span>
        </span>
      </div>
    </article>
  );
}

export interface IncomeExpenseSummaryProps {
  clubId: number;
}

export default function IncomeExpenseSummary({
  clubId,
}: IncomeExpenseSummaryProps) {
  const [data, setData] = useState<IncomeExpenseSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [trendPeriod, setTrendPeriod] =
    useState<IncomeExpenseTrendPeriod>("thisYear");

  const params = useMemo<IncomeExpenseSummaryParams>(
    () => ({ trend_period: trendPeriod }),
    [trendPeriod],
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await getIncomeExpenseSummary(clubId, params);
      setData(result);
    } catch (loadError) {
      setData(null);
      setError(
        getApiErrorMessage(
          loadError,
          "Income & expense summary could not be loaded.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [clubId, params]);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading && !data) {
    return (
      <WorkspacePanel
        eyebrow="Finance & Audit"
        title="Income & Expense Summary"
        description="Overview of club income, expenses and financial performance."
      >
        <WorkspaceEmpty
          title="Loading income & expense summary…"
          description="Fetching revenue, cost breakdowns, and cash flow."
        />
      </WorkspacePanel>
    );
  }

  if (error && !data) {
    return (
      <WorkspacePanel
        eyebrow="Finance & Audit"
        title="Income & Expense Summary"
        description="Overview of club income, expenses and financial performance."
      >
        <WorkspaceError message={error} onRetry={() => void load()} />
      </WorkspacePanel>
    );
  }

  if (!data) return null;

  return (
    <div className="ies-page">
      {error ? (
        <div className={styles.validationCard}>
          <strong>Some information may be stale</strong>
          <span>{error}</span>
        </div>
      ) : null}

      <div className="ies-stat-grid">
        <StatCard statKey="totalIncome" stat={data.stats.totalIncome} />
        <StatCard statKey="totalExpenses" stat={data.stats.totalExpenses} />
        <StatCard statKey="netProfit" stat={data.stats.netProfit} />
        <StatCard statKey="operatingCosts" stat={data.stats.operatingCosts} />
        <StatCard
          statKey="sponsorshipIncome"
          stat={data.stats.sponsorshipIncome}
        />
        <StatCard
          statKey="membershipIncome"
          stat={data.stats.membershipIncome}
        />
      </div>

      <div className="ies-chart-row">
        <WorkspacePanel
          eyebrow="Trend"
          title="Income vs Expense Trend"
          description="Monthly income and expenses compared."
          actions={
            <select
              aria-label="Trend period"
              className="ies-period-select"
              value={trendPeriod}
              onChange={(e) =>
                setTrendPeriod(e.target.value as IncomeExpenseTrendPeriod)
              }
            >
              {TREND_PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          }
        >
          {data.incomeVsExpenseTrend.length === 0 ? (
            <WorkspaceEmpty
              title="No trend data yet"
              description="Income and expense trends will appear here once recorded."
            />
          ) : (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <AreaChart data={data.incomeVsExpenseTrend}>
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
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#22c55e"
                    fill="rgba(34, 197, 94, 0.18)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#ef4444"
                    fill="rgba(239, 68, 68, 0.14)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Breakdown"
          title="Income Sources"
          description="Share of income by source."
        >
          {data.incomeSources.length === 0 ? (
            <WorkspaceEmpty
              title="No income sources yet"
              description="Income source breakdown will appear once revenue is recorded."
            />
          ) : (
            <div className="ies-donut-row">
              <div className="ies-donut-wrap">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data.incomeSources}
                      dataKey="amount"
                      nameKey="source"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {data.incomeSources.map((slice) => (
                        <Cell key={slice.source} fill={slice.color} />
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
                        const source = item?.payload?.source ?? "";
                        const share = item?.payload?.share ?? 0;
                        return [
                          formatUgx(amount),
                          `${source} · ${(share * 100).toFixed(0)}%`,
                        ];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="ies-donut-center">
                  <span>Total Income</span>
                  <strong>{formatUgx(data.totalIncomeSources)}</strong>
                </div>
              </div>

              <ul className="ies-legend">
                {data.incomeSources.map((slice) => (
                  <li className="ies-legend-row" key={slice.source}>
                    <span
                      className="ies-legend-dot"
                      style={{ background: slice.color }}
                    />
                    <div className="ies-legend-text">
                      <strong>
                        {slice.source} · {(slice.share * 100).toFixed(0)}%
                      </strong>
                      <span>{formatUgx(slice.amount)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Cash flow"
          title="Monthly Cash Flow"
          description="Cash in, cash out, and net cash flow per month."
        >
          {data.monthlyCashFlow.length === 0 ? (
            <WorkspaceEmpty
              title="No cash flow data yet"
              description="Monthly cash flow will appear once transactions are recorded."
            />
          ) : (
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <ComposedChart data={data.monthlyCashFlow}>
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
                  <Legend />
                  <Bar
                    dataKey="cashIn"
                    name="Cash In"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="cashOut"
                    name="Cash Out"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    type="monotone"
                    dataKey="netCashFlow"
                    name="Net Cash Flow"
                    stroke="var(--purple, #7c5cff)"
                    strokeWidth={2}
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </WorkspacePanel>
      </div>

      <div className="ies-table-row">
        <WorkspacePanel
          eyebrow="Expenses"
          title="Expense Breakdown"
          description="Spend by category, this period."
        >
          {data.expenseBreakdown.length === 0 ? (
            <WorkspaceEmpty
              title="No expenses recorded"
              description="Expense categories will appear here once recorded."
            />
          ) : (
            <div className={styles.tableShell}>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>% of Expenses</th>
                  </tr>
                </thead>
                <tbody>
                  {data.expenseBreakdown.map((row) => (
                    <tr key={row.category}>
                      <td>{row.category}</td>
                      <td>{formatUgx(row.amount)}</td>
                      <td>{row.percentOfExpenses.toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="ies-total-row">
                    <td>Total</td>
                    <td>
                      {formatUgx(
                        data.expenseBreakdown.reduce(
                          (sum, row) => sum + row.amount,
                          0,
                        ),
                      )}
                    </td>
                    <td>100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Summary"
          title="Financial Summary"
          description="Income, expenses, and net profit by month."
        >
          {data.financialSummary.length === 0 ? (
            <WorkspaceEmpty
              title="No monthly summary yet"
              description="A month-by-month summary will appear once data spans more than one month."
            />
          ) : (
            <div className={styles.tableShell}>
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Income</th>
                    <th>Expenses</th>
                    <th>Net Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.financialSummary.map((row) => (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td>{formatUgx(row.income)}</td>
                      <td>{formatUgx(row.expenses)}</td>
                      <td>{formatUgx(row.netProfit)}</td>
                    </tr>
                  ))}
                  <tr className="ies-total-row">
                    <td>Total</td>
                    <td>
                      {formatUgx(
                        data.financialSummary.reduce(
                          (sum, row) => sum + row.income,
                          0,
                        ),
                      )}
                    </td>
                    <td>
                      {formatUgx(
                        data.financialSummary.reduce(
                          (sum, row) => sum + row.expenses,
                          0,
                        ),
                      )}
                    </td>
                    <td>
                      {formatUgx(
                        data.financialSummary.reduce(
                          (sum, row) => sum + row.netProfit,
                          0,
                        ),
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </WorkspacePanel>
      </div>
    </div>
  );
}