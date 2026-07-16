import {
  AlertTriangle,
  BarChart3,
  Clock,
  FileBarChart,
  Loader2,
  PiggyBank,
  Plus,
  Receipt,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
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

import AdminWorkspaceLayout, {
  type AdminWorkspaceNavItem,
  WorkspaceEmpty,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
  WorkspaceStatGrid,
  adminWorkspaceStyles as styles,
  formatWorkspaceDate,
} from "../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import {
  getApiErrorMessage,
  getTreasurerBudget,
  getTreasurerWorkspace,
  saveTreasurerBudgetDraft,
  submitTreasurerBudgetForApproval,
  type ClubBudget,
  type ClubBudgetCategoryAllocation,
  type TreasurerWorkspaceData,
} from "../../services/adminWorkspaceService";
import {
  BudgetStatusBadge,
  formatCurrency,
} from "../../utils/ClubBudgetDisplay";

type TabKey =
  | "overview"
  | "transactions"
  | "income"
  | "expenses"
  | "budgets"
  | "reports";

const navItems: AdminWorkspaceNavItem<TabKey>[] = [
  {
    key: "overview",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    key: "transactions",
    label: "Transactions",
    icon: Receipt,
  },
  {
    key: "income",
    label: "Income",
    icon: TrendingUp,
  },
  {
    key: "expenses",
    label: "Expenses",
    icon: TrendingDown,
  },
  {
    key: "budgets",
    label: "Budgets",
    icon: PiggyBank,
  },
  {
    key: "reports",
    label: "Reports",
    icon: FileBarChart,
  },
];

const EXPENSE_COLORS = [
  "var(--green)",
  "#3b82f6",
  "#f97316",
  "var(--muted)",
];

function emptyRow(): ClubBudgetCategoryAllocation {
  return {
    id: `new-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,
    category: "",
    allocated: 0,
  };
}

export default function TreasurerDashboard() {
  const [activeTab, setActiveTab] =
    useState<TabKey>("overview");
  const [data, setData] =
    useState<TreasurerWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Budget workflow state
  const [budget, setBudget] = useState<ClubBudget | null>(
    null,
  );
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const [budgetNotice, setBudgetNotice] = useState("");
  const [rows, setRows] = useState<
    ClubBudgetCategoryAllocation[]
  >([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevising, setIsRevising] = useState(false);

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setData(await getTreasurerWorkspace());
    } catch (loadError) {
      setData(null);
      setError(
        getApiErrorMessage(
          loadError,
          "The finance workspace could not be loaded.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const loadBudget = useCallback(async () => {
    setBudgetLoading(true);
    setBudgetError("");

    try {
      const result = await getTreasurerBudget();
      setBudget(result);
      setRows(
        result.categories.length
          ? result.categories
          : [emptyRow()],
      );
      setIsRevising(false);
    } catch (loadError) {
      setBudgetError(
        getApiErrorMessage(
          loadError,
          "The budget could not be loaded.",
        ),
      );
    } finally {
      setBudgetLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "budgets" && !budget && !budgetLoading) {
      void loadBudget();
    }
  }, [activeTab, budget, budgetLoading, loadBudget]);

  const isEditable = useMemo(() => {
    if (!budget) return false;
    return (
      budget.status === "DRAFT" ||
      budget.status === "REJECTED" ||
      isRevising
    );
  }, [budget, isRevising]);

  const totalAllocated = useMemo(
    () =>
      rows.reduce(
        (sum, row) => sum + (Number(row.allocated) || 0),
        0,
      ),
    [rows],
  );

  function updateRow(
    id: ClubBudgetCategoryAllocation["id"],
    field: "category" | "allocated",
    value: string,
  ) {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]:
                field === "allocated"
                  ? Number(value) || 0
                  : value,
            }
          : row,
      ),
    );
  }

  function addRow() {
    setRows((current) => [...current, emptyRow()]);
  }

  function removeRow(id: ClubBudgetCategoryAllocation["id"]) {
    setRows((current) =>
      current.filter((row) => row.id !== id),
    );
  }

  async function handleSaveDraft() {
    setIsSavingDraft(true);
    setBudgetError("");
    setBudgetNotice("");

    try {
      const cleanedRows = rows.filter(
        (row) => row.category.trim().length > 0,
      );
      const updated = await saveTreasurerBudgetDraft({
        categories: cleanedRows.map((row) => ({
          id:
            typeof row.id === "string" &&
            row.id.startsWith("new-")
              ? undefined
              : row.id,
          category: row.category.trim(),
          allocated: row.allocated,
        })),
      });
      setBudget(updated);
      setRows(
        updated.categories.length
          ? updated.categories
          : [emptyRow()],
      );
      setIsRevising(false);
      setBudgetNotice("Draft saved.");
    } catch (saveError) {
      setBudgetError(
        getApiErrorMessage(
          saveError,
          "The draft could not be saved.",
        ),
      );
      // Re-throw so callers (e.g. handleSubmitForApproval) know the save
      // failed and don't proceed as if it had succeeded.
      throw saveError;
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handleSubmitForApproval() {
    setIsSubmitting(true);
    setBudgetError("");
    setBudgetNotice("");

    try {
      await handleSaveDraft();
      const submitted =
        await submitTreasurerBudgetForApproval();
      setBudget(submitted);
      setBudgetNotice(
        "Budget submitted to the chairman for approval.",
      );
    } catch (submitError) {
      // If the draft save itself failed, handleSaveDraft already set a
      // more specific budgetError — don't stomp on it with a generic one.
      setBudgetError((current) =>
        current
          ? current
          : getApiErrorMessage(
              submitError,
              "The budget could not be submitted for approval.",
            ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const stats = useMemo(
    () => [
      {
        label: "Club Balance",
        value: formatCurrency(
          data?.summary.club_balance ?? 0,
        ),
        detail: "Available balance",
        icon: Wallet,
      },
      {
        label: "Total Income",
        value: formatCurrency(
          data?.summary.total_income ?? 0,
        ),
        detail: "This season",
        icon: TrendingUp,
      },
      {
        label: "Total Expenses",
        value: formatCurrency(
          data?.summary.total_expenses ?? 0,
        ),
        detail: "This season",
        icon: TrendingDown,
      },
      {
        label: "Pending Payments",
        value: formatCurrency(
          data?.summary.pending_payments ?? 0,
        ),
        detail: `${
          data?.summary.pending_payments_count ?? 0
        } payments`,
        icon: Clock,
      },
    ],
    [data],
  );

  function renderTransactionTable(
    rowsToRender: TreasurerWorkspaceData["recent_transactions"],
  ) {
    if (rowsToRender.length === 0) {
      return (
        <WorkspaceEmpty
          title="No transactions"
          description="Income and expense records will appear here."
        />
      );
    }

    return (
      <div className={styles.tableShell}>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Category</th>
              <th>Date</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            {rowsToRender.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  <span className={styles.tablePrimary}>
                    {transaction.label}
                  </span>
                </td>
                <td>{transaction.category}</td>
                <td>
                  {formatWorkspaceDate(
                    transaction.created_at,
                  )}
                </td>
                <td
                  style={{
                    color:
                      transaction.type === "INCOME"
                        ? "var(--green)"
                        : "#ef4444",
                    fontWeight: 600,
                  }}
                >
                  {transaction.type === "INCOME"
                    ? "+"
                    : "-"}
                  {formatCurrency(
                    Math.abs(transaction.amount),
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderOverview() {
    return (
      <>
        <WorkspaceStatGrid stats={stats} />

        <div className={styles.gridTwo}>
          <WorkspacePanel
            eyebrow="Season trend"
            title="Income vs Expenses"
            description="Monthly income and expense totals for this club."
          >
            {data?.income_vs_expense?.length ? (
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <LineChart data={data.income_vs_expense}>
                    <XAxis
                      dataKey="month"
                      stroke="var(--muted)"
                    />
                    <YAxis stroke="var(--muted)" />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border:
                          "1px solid var(--border)",
                        color: "var(--text)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="var(--green)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <WorkspaceEmpty
                title="No financial trend data"
                description="Income and expense history will appear here."
              />
            )}
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Latest activity"
            title="Recent transactions"
            description="The most recent income and expense entries."
          >
            {renderTransactionTable(
              (data?.recent_transactions ?? []).slice(
                0,
                5,
              ),
            )}
          </WorkspacePanel>
        </div>

        <div className={styles.gridTwo}>
          <WorkspacePanel
            eyebrow="Season budget"
            title="Budget overview"
            description="Spend against the approved club budget."
            actions={
              <button
                type="button"
                className={styles.publicLink}
                onClick={() => setActiveTab("budgets")}
              >
                Manage budget
              </button>
            }
          >
            {data?.summary.budget_total ? (
              <div className={styles.scopeGrid}>
                <article className={styles.scopeCard}>
                  <span>
                    {Math.round(
                      (data.summary.budget_used /
                        data.summary.budget_total) *
                        100,
                    )}
                    % used
                  </span>
                  <strong>
                    {formatCurrency(
                      data.summary.budget_used,
                    )}{" "}
                    /{" "}
                    {formatCurrency(
                      data.summary.budget_total,
                    )}
                  </strong>
                  <div
                    style={{
                      marginTop: 10,
                      height: 8,
                      borderRadius: 999,
                      background: "var(--border)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          (data.summary.budget_used /
                            data.summary.budget_total) *
                            100,
                        )}%`,
                        height: "100%",
                        background: "var(--green)",
                      }}
                    />
                  </div>
                </article>
              </div>
            ) : (
              <WorkspaceEmpty
                title="No budget set"
                description="A season budget has not been configured yet."
              />
            )}
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Spend by category"
            title="Expense breakdown"
            description="Where club expenses are going this season."
          >
            {data?.expense_breakdown?.length ? (
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data.expense_breakdown}
                      dataKey="percentage"
                      nameKey="category"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {data.expense_breakdown.map(
                        (entry, index) => (
                          <Cell
                            key={entry.category}
                            fill={
                              EXPENSE_COLORS[
                                index %
                                  EXPENSE_COLORS.length
                              ]
                            }
                          />
                        ),
                      )}
                    </Pie>
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border:
                          "1px solid var(--border)",
                        color: "var(--text)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <WorkspaceEmpty
                title="No expense breakdown"
                description="Categorized expense data will appear here."
              />
            )}
          </WorkspacePanel>
        </div>
      </>
    );
  }

  function renderBudgets() {
    if (budgetLoading && !budget) {
      return <WorkspaceLoading label="Loading budget…" />;
    }

    if (budgetError && !budget) {
      return (
        <WorkspaceError
          message={budgetError}
          onRetry={loadBudget}
        />
      );
    }

    if (!budget) {
      return (
        <WorkspaceEmpty
          title="No budget yet"
          description="Create a draft budget to get started."
        />
      );
    }

    const locked = !isEditable;

    return (
      <WorkspacePanel
        eyebrow="Season budget"
        title="Budget allocations"
        description="Edit category allocations, save as a draft, then submit to the chairman for approval."
        actions={<BudgetStatusBadge status={budget.status} />}
      >
        {budgetNotice ? (
          <div
            className={styles.validationCard}
            style={{ marginBottom: 16 }}
          >
            <ShieldCheck size={18} />
            <span>{budgetNotice}</span>
          </div>
        ) : null}

        {budgetError ? (
          <div
            className={styles.validationCard}
            style={{ marginBottom: 16 }}
          >
            <AlertTriangle size={18} />
            <span>{budgetError}</span>
          </div>
        ) : null}

        {budget.status === "PENDING_APPROVAL" ? (
          <div
            className={styles.validationCard}
            style={{ marginBottom: 16 }}
          >
            <Clock size={18} />
            <strong>Awaiting chairman approval</strong>
            <span>
              This budget was submitted
              {budget.submitted_by
                ? ` by ${budget.submitted_by}`
                : ""}
              {budget.submitted_at
                ? ` on ${formatWorkspaceDate(
                    budget.submitted_at,
                  )}`
                : ""}
              . It can't be edited until the chairman
              decides.
            </span>
          </div>
        ) : null}

        {budget.status === "REJECTED" &&
        budget.decision_note ? (
          <div
            className={styles.validationCard}
            style={{ marginBottom: 16 }}
          >
            <AlertTriangle size={18} />
            <strong>Rejected by the chairman</strong>
            <span>{budget.decision_note}</span>
          </div>
        ) : null}

        {budget.status === "APPROVED" ? (
          <div
            className={styles.validationCard}
            style={{ marginBottom: 16 }}
          >
            <ShieldCheck size={18} />
            <strong>Approved</strong>
            <span>
              This budget is locked in
              {budget.decided_by
                ? ` by ${budget.decided_by}`
                : ""}
              {budget.decided_at
                ? ` on ${formatWorkspaceDate(
                    budget.decided_at,
                  )}`
                : ""}
              . Start a revision if it needs to change.
            </span>
          </div>
        ) : null}

        <div className={styles.tableShell}>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Allocated</th>
                {locked ? null : <th />}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    {locked ? (
                      row.category || (
                        <em>Unnamed category</em>
                      )
                    ) : (
                      <input
                        type="text"
                        value={row.category}
                        placeholder="e.g. Referees & officials"
                        onChange={(event) =>
                          updateRow(
                            row.id,
                            "category",
                            event.target.value,
                          )
                        }
                        style={{
                          width: "100%",
                          background: "var(--card)",
                          border:
                            "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "8px 10px",
                          color: "var(--text)",
                        }}
                      />
                    )}
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    {locked ? (
                      <span style={{ fontWeight: 600 }}>
                        {formatCurrency(row.allocated)}
                      </span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        value={row.allocated}
                        onChange={(event) =>
                          updateRow(
                            row.id,
                            "allocated",
                            event.target.value,
                          )
                        }
                        style={{
                          width: "100%",
                          background: "var(--card)",
                          border:
                            "1px solid var(--border)",
                          borderRadius: 8,
                          padding: "8px 10px",
                          color: "var(--text)",
                        }}
                      />
                    )}
                  </td>
                  {locked ? null : (
                    <td style={{ width: 40 }}>
                      <button
                        type="button"
                        aria-label="Remove category"
                        onClick={() => removeRow(row.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          display: "flex",
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <strong>
            Total allocated: {formatCurrency(totalAllocated)}
          </strong>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {locked && budget.status === "APPROVED" ? (
              <button
                type="button"
                className={styles.publicLink}
                onClick={() => setIsRevising(true)}
              >
                Start a revision
              </button>
            ) : null}

            {!locked ? (
              <>
                <button
                  type="button"
                  className={styles.publicLink}
                  onClick={addRow}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Plus size={16} />
                  Add category
                </button>

                <button
                  type="button"
                  disabled={isSavingDraft || isSubmitting}
                  onClick={() => void handleSaveDraft()}
                  className={styles.publicLink}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {isSavingDraft ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : null}
                  Save draft
                </button>

                <button
                  type="button"
                  disabled={
                    isSavingDraft ||
                    isSubmitting ||
                    totalAllocated <= 0
                  }
                  onClick={() =>
                    void handleSubmitForApproval()
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--green)",
                    color: "#04120a",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {isSubmitting ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={16} />
                  )}
                  Submit for approval
                </button>
              </>
            ) : null}
          </div>
        </div>
      </WorkspacePanel>
    );
  }

  let content;

  if (isLoading && !data) {
    content = (
      <WorkspaceLoading label="Loading finance workspace…" />
    );
  } else if (error && !data) {
    content = (
      <WorkspaceError
        message={error}
        onRetry={loadWorkspace}
      />
    );
  } else if (activeTab === "transactions") {
    content = (
      <WorkspacePanel
        eyebrow="All activity"
        title="Transactions"
        description="Every recorded income and expense entry."
      >
        {renderTransactionTable(
          data?.recent_transactions ?? [],
        )}
      </WorkspacePanel>
    );
  } else if (activeTab === "income") {
    content = (
      <WorkspacePanel
        eyebrow="Money in"
        title="Income"
        description="Income entries recorded for this club."
      >
        {renderTransactionTable(
          (data?.recent_transactions ?? []).filter(
            (transaction) =>
              transaction.type === "INCOME",
          ),
        )}
      </WorkspacePanel>
    );
  } else if (activeTab === "expenses") {
    content = (
      <WorkspacePanel
        eyebrow="Money out"
        title="Expenses"
        description="Expense entries recorded for this club."
      >
        {renderTransactionTable(
          (data?.recent_transactions ?? []).filter(
            (transaction) =>
              transaction.type === "EXPENSE",
          ),
        )}
      </WorkspacePanel>
    );
  } else if (activeTab === "budgets") {
    content = renderBudgets();
  } else if (activeTab === "reports") {
    content = (
      <WorkspacePanel
        eyebrow="Finance reports"
        title="Reports"
        description="Generated financial reports for this club."
      >
        <WorkspaceEmpty
          title="No reports yet"
          description="Generated finance reports will appear here."
        />
      </WorkspacePanel>
    );
  } else {
    content = renderOverview();
  }

  return (
    <AdminWorkspaceLayout<TabKey>
      workspaceTitle={data?.club.name ?? "Finance"}
      workspaceSubtitle={
        data
          ? `${data.club.sport_display} club finances`
          : "Treasurer access"
      }
      eyebrow="Treasurer"
      title="Finance Dashboard"
      description="Track club income, expenses, and budgets using live League OS records."
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerActions={
        <button
          type="button"
          className={styles.publicLink}
          disabled={isLoading}
          onClick={() => void loadWorkspace()}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      }
    >
      {error && data ? (
        <div className={styles.validationCard}>
          <ShieldCheck size={18} />
          <strong>Some information may be stale</strong>
          <span>{error}</span>
        </div>
      ) : null}

      {content}
    </AdminWorkspaceLayout>
  );
}