import {
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Settings as SettingsIcon,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  TicketCheck,
  Trophy,
  Users,
  Wallet,
  FileBarChart,
  XCircle,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  approveChairmanBudget,
  getApiErrorMessage,
  getChairmanBudget,
  getChairmanWorkspace,
  overrideChairmanBudget,
  rejectChairmanBudget,
  type ChairmanWorkspaceData,
  type ClubBudget,
  type ClubBudgetCategoryAllocation,
} from "../../services/adminWorkspaceService";
import {
  BudgetStatusBadge,
  formatCurrency,
} from "../../utils/ClubBudgetDisplay";

type TabKey =
  | "overview"
  | "members"
  | "teams"
  | "matches"
  | "finances"
  | "tickets"
  | "facilities"
  | "reports"
  | "communications"
  | "settings";

const navItems: AdminWorkspaceNavItem<TabKey>[] = [
  { key: "overview", label: "Dashboard", icon: BarChart3 },
  { key: "members", label: "Members", icon: Users },
  { key: "teams", label: "Teams", icon: Trophy },
  {
    key: "matches",
    label: "Matches",
    icon: CalendarDays,
  },
  { key: "finances", label: "Finances", icon: Wallet },
  {
    key: "tickets",
    label: "Tickets",
    icon: TicketCheck,
  },
  {
    key: "facilities",
    label: "Facilities",
    icon: Building2,
  },
  {
    key: "reports",
    label: "Reports",
    icon: FileBarChart,
  },
  {
    key: "communications",
    label: "Communications",
    icon: MessageSquare,
  },
  {
    key: "settings",
    label: "Settings",
    icon: SettingsIcon,
  },
];

const quickAccessItems: Array<{
  key: TabKey;
  label: string;
  detail: string;
  icon: AdminWorkspaceNavItem<TabKey>["icon"];
}> = [
  {
    key: "members",
    label: "Members",
    detail: "Manage all members",
    icon: Users,
  },
  {
    key: "teams",
    label: "Teams",
    detail: "Manage all teams",
    icon: Trophy,
  },
  {
    key: "matches",
    label: "Matches",
    detail: "Fixtures & results",
    icon: CalendarDays,
  },
  {
    key: "finances",
    label: "Finances",
    detail: "Full financial control",
    icon: Wallet,
  },
  {
    key: "tickets",
    label: "Tickets",
    detail: "Ticketing & sales",
    icon: TicketCheck,
  },
  {
    key: "facilities",
    label: "Facilities",
    detail: "Grounds & facilities",
    icon: Building2,
  },
  {
    key: "reports",
    label: "Reports",
    detail: "Analytics & reports",
    icon: FileBarChart,
  },
  {
    key: "communications",
    label: "Communications",
    detail: "Messages & alerts",
    icon: MessageSquare,
  },
];

export default function ChairmanDashboard() {
  const [activeTab, setActiveTab] =
    useState<TabKey>("overview");
  const [data, setData] =
    useState<ChairmanWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Budget review state
  const [budget, setBudget] = useState<ClubBudget | null>(
    null,
  );
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState("");
  const [budgetNotice, setBudgetNotice] = useState("");
  const [isDeciding, setIsDeciding] = useState(false);
  const [showRejectForm, setShowRejectForm] =
    useState(false);
  const [rejectNote, setRejectNote] = useState("");

  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideRows, setOverrideRows] = useState<
    ClubBudgetCategoryAllocation[]
  >([]);
  const [isSavingOverride, setIsSavingOverride] =
    useState(false);

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setData(await getChairmanWorkspace());
    } catch (loadError) {
      setData(null);
      setError(
        getApiErrorMessage(
          loadError,
          "The chairman workspace could not be loaded.",
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
      const result = await getChairmanBudget();
      setBudget(result);
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
    if (
      activeTab === "finances" &&
      !budget &&
      !budgetLoading
    ) {
      void loadBudget();
    }
  }, [activeTab, budget, budgetLoading, loadBudget]);

  async function handleApprove() {
    setIsDeciding(true);
    setBudgetError("");
    setBudgetNotice("");

    try {
      const updated = await approveChairmanBudget();
      setBudget(updated);
      setBudgetNotice("Budget approved.");
    } catch (approveError) {
      setBudgetError(
        getApiErrorMessage(
          approveError,
          "The budget could not be approved.",
        ),
      );
    } finally {
      setIsDeciding(false);
    }
  }

  async function handleReject() {
    if (!rejectNote.trim()) {
      setBudgetError(
        "Add a note explaining the rejection so the treasurer can revise it.",
      );
      return;
    }

    setIsDeciding(true);
    setBudgetError("");
    setBudgetNotice("");

    try {
      const updated = await rejectChairmanBudget(
        rejectNote.trim(),
      );
      setBudget(updated);
      setBudgetNotice("Budget rejected.");
      setShowRejectForm(false);
      setRejectNote("");
    } catch (rejectError) {
      setBudgetError(
        getApiErrorMessage(
          rejectError,
          "The budget could not be rejected.",
        ),
      );
    } finally {
      setIsDeciding(false);
    }
  }

  function startOverride() {
    setOverrideRows(
      budget?.categories.length
        ? budget.categories.map((row) => ({ ...row }))
        : [
            {
              id: `new-${Date.now()}`,
              category: "",
              allocated: 0,
            },
          ],
    );
    setIsOverriding(true);
    setBudgetNotice("");
    setBudgetError("");
  }

  function updateOverrideRow(
    id: ClubBudgetCategoryAllocation["id"],
    field: "category" | "allocated",
    value: string,
  ) {
    setOverrideRows((current) =>
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

  function addOverrideRow() {
    setOverrideRows((current) => [
      ...current,
      {
        id: `new-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
        category: "",
        allocated: 0,
      },
    ]);
  }

  function removeOverrideRow(
    id: ClubBudgetCategoryAllocation["id"],
  ) {
    setOverrideRows((current) =>
      current.filter((row) => row.id !== id),
    );
  }

  async function handleSaveOverride() {
    setIsSavingOverride(true);
    setBudgetError("");
    setBudgetNotice("");

    try {
      const cleanedRows = overrideRows.filter(
        (row) => row.category.trim().length > 0,
      );
      const updated = await overrideChairmanBudget({
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
      setIsOverriding(false);
      setBudgetNotice(
        "Budget overridden and approved directly.",
      );
    } catch (overrideError) {
      setBudgetError(
        getApiErrorMessage(
          overrideError,
          "The override could not be saved.",
        ),
      );
    } finally {
      setIsSavingOverride(false);
    }
  }

  const overrideTotal = useMemo(
    () =>
      overrideRows.reduce(
        (sum, row) => sum + (Number(row.allocated) || 0),
        0,
      ),
    [overrideRows],
  );

  const stats = useMemo(
    () => [
      {
        label: "Total Members",
        value: data?.summary.total_members ?? 0,
        detail: "+12% this week",
        icon: Users,
      },
      {
        label: "Teams",
        value: data?.summary.teams ?? 0,
        detail: "+8% this week",
        icon: Trophy,
      },
      {
        label: "Active Matches",
        value: data?.summary.active_matches ?? 0,
        detail: "Live & upcoming",
        icon: CalendarDays,
      },
      {
        label: "Club Balance",
        value: formatCurrency(
          data?.summary.club_balance ?? 0,
        ),
        detail: "Available balance",
        icon: Wallet,
      },
    ],
    [data],
  );

  function renderOverview() {
    return (
      <>
        <WorkspaceStatGrid stats={stats} />

        <WorkspacePanel
          eyebrow="Full access"
          title="Quick access"
          description="Jump straight into any area of club operations."
        >
          <div className={styles.scopeGrid}>
            {quickAccessItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  type="button"
                  className={styles.scopeCard}
                  onClick={() => setActiveTab(item.key)}
                  style={{
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <Icon
                    size={22}
                    strokeWidth={2.1}
                    aria-hidden="true"
                  />
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </button>
              );
            })}
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Club profile"
          title="Club overview"
          description="Key facts about your club at a glance."
          actions={
            <button
              type="button"
              className={styles.publicLink}
              onClick={() => setActiveTab("reports")}
            >
              View all reports
            </button>
          }
        >
          {data?.club_overview ? (
            <div className={styles.scopeGrid}>
              <article className={styles.scopeCard}>
                <span>Founded</span>
                <strong>
                  {data.club_overview.founded}
                </strong>
              </article>

              <article className={styles.scopeCard}>
                <span>Total Players</span>
                <strong>
                  {data.club_overview.total_players}
                </strong>
              </article>

              <article className={styles.scopeCard}>
                <span>Active Sponsors</span>
                <strong>
                  {data.club_overview.active_sponsors}
                </strong>
              </article>

              <article className={styles.scopeCard}>
                <span>Leagues</span>
                <strong>
                  {data.club_overview.leagues}
                </strong>
              </article>
            </div>
          ) : (
            <WorkspaceEmpty
              title="No club overview data"
              description="Club profile details will appear here."
            />
          )}
        </WorkspacePanel>
      </>
    );
  }

  function renderBudgetTable(
    rowsToRender: ClubBudgetCategoryAllocation[],
  ) {
    const total = rowsToRender.reduce(
      (sum, row) => sum + (Number(row.allocated) || 0),
      0,
    );

    return (
      <>
        <div className={styles.tableShell}>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Allocated</th>
              </tr>
            </thead>
            <tbody>
              {rowsToRender.map((row) => (
                <tr key={row.id}>
                  <td>{row.category}</td>
                  <td style={{ fontWeight: 600 }}>
                    {formatCurrency(row.allocated)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>
            Total allocated: {formatCurrency(total)}
          </strong>
        </div>
      </>
    );
  }

  function renderOverrideEditor() {
    return (
      <>
        <div className={styles.tableShell}>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Allocated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {overrideRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="text"
                      value={row.category}
                      placeholder="e.g. Referees & officials"
                      onChange={(event) =>
                        updateOverrideRow(
                          row.id,
                          "category",
                          event.target.value,
                        )
                      }
                      style={{
                        width: "100%",
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: "var(--text)",
                      }}
                    />
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    <input
                      type="number"
                      min={0}
                      value={row.allocated}
                      onChange={(event) =>
                        updateOverrideRow(
                          row.id,
                          "allocated",
                          event.target.value,
                        )
                      }
                      style={{
                        width: "100%",
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        padding: "8px 10px",
                        color: "var(--text)",
                      }}
                    />
                  </td>
                  <td style={{ width: 40 }}>
                    <button
                      type="button"
                      aria-label="Remove category"
                      onClick={() =>
                        removeOverrideRow(row.id)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        display: "flex",
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  </td>
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
            Total allocated:{" "}
            {formatCurrency(overrideTotal)}
          </strong>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className={styles.publicLink}
              onClick={addOverrideRow}
            >
              Add category
            </button>

            <button
              type="button"
              className={styles.publicLink}
              onClick={() => setIsOverriding(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                isSavingOverride || overrideTotal <= 0
              }
              onClick={() => void handleSaveOverride()}
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
              {isSavingOverride ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShieldAlert size={16} />
              )}
              Save & approve override
            </button>
          </div>
        </div>
      </>
    );
  }

  function renderFinances() {
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
          title="No budget submitted yet"
          description="Once the treasurer submits a budget, it will appear here for approval."
        />
      );
    }

    return (
      <WorkspacePanel
        eyebrow="Season budget"
        title="Budget review"
        description="Review the treasurer's proposed allocations, approve, reject with a note, or override directly."
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

        <div
          className={styles.scopeGrid}
          style={{ marginBottom: 16 }}
        >
          <article className={styles.scopeCard}>
            <span>Submitted by</span>
            <strong>
              {budget.submitted_by ?? "Not submitted yet"}
            </strong>
          </article>

          <article className={styles.scopeCard}>
            <span>Submitted on</span>
            <strong>
              {budget.submitted_at
                ? formatWorkspaceDate(budget.submitted_at)
                : "—"}
            </strong>
          </article>

          <article className={styles.scopeCard}>
            <span>Last decision</span>
            <strong>
              {budget.decided_by
                ? `${budget.decided_by} on ${formatWorkspaceDate(
                    budget.decided_at ?? "",
                  )}`
                : "No decision yet"}
            </strong>
          </article>
        </div>

        {budget.decision_note ? (
          <div
            className={styles.validationCard}
            style={{ marginBottom: 16 }}
          >
            <MessageSquare size={18} />
            <strong>Decision note</strong>
            <span>{budget.decision_note}</span>
          </div>
        ) : null}

        {isOverriding
          ? renderOverrideEditor()
          : renderBudgetTable(budget.categories)}

        {!isOverriding ? (
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            {budget.status === "PENDING_APPROVAL" ? (
              <>
                <button
                  type="button"
                  disabled={isDeciding}
                  onClick={() => void handleApprove()}
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
                  {isDeciding ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Approve
                </button>

                <button
                  type="button"
                  className={styles.publicLink}
                  onClick={() =>
                    setShowRejectForm((current) => !current)
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#ef4444",
                  }}
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </>
            ) : null}

            <button
              type="button"
              className={styles.publicLink}
              onClick={startOverride}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <ShieldAlert size={16} />
              Override budget
            </button>
          </div>
        ) : null}

        {showRejectForm && !isOverriding ? (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              border: "1px solid var(--border)",
              borderRadius: 10,
              background: "var(--card)",
            }}
          >
            <label
              htmlFor="reject-note"
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              Reason for rejection
            </label>
            <textarea
              id="reject-note"
              value={rejectNote}
              onChange={(event) =>
                setRejectNote(event.target.value)
              }
              rows={3}
              placeholder="Let the treasurer know what needs to change…"
              style={{
                width: "100%",
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 10,
                color: "var(--text)",
                resize: "vertical",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 12,
              }}
            >
              <button
                type="button"
                disabled={isDeciding}
                onClick={() => void handleReject()}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {isDeciding ? "Rejecting…" : "Confirm reject"}
              </button>

              <button
                type="button"
                className={styles.publicLink}
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectNote("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </WorkspacePanel>
    );
  }

  function renderPlaceholder(
    title: string,
    description: string,
  ) {
    return (
      <WorkspacePanel
        eyebrow="Full access"
        title={title}
        description={description}
      >
        <WorkspaceEmpty
          title={`${title} is not yet built out`}
          description="This section will surface full detail here. For now, use the sidebar to check back once it ships."
        />
      </WorkspacePanel>
    );
  }

  let content;

  if (isLoading && !data) {
    content = (
      <WorkspaceLoading label="Loading chairman workspace…" />
    );
  } else if (error && !data) {
    content = (
      <WorkspaceError
        message={error}
        onRetry={loadWorkspace}
      />
    );
  } else if (activeTab === "members") {
    content = renderPlaceholder(
      "Members",
      "Manage all club members.",
    );
  } else if (activeTab === "teams") {
    content = renderPlaceholder(
      "Teams",
      "Manage all club teams.",
    );
  } else if (activeTab === "matches") {
    content = renderPlaceholder(
      "Matches",
      "Fixtures and results across the club.",
    );
  } else if (activeTab === "finances") {
    content = renderFinances();
  } else if (activeTab === "tickets") {
    content = renderPlaceholder(
      "Tickets",
      "Ticketing and sales across the club.",
    );
  } else if (activeTab === "facilities") {
    content = renderPlaceholder(
      "Facilities",
      "Grounds and facilities management.",
    );
  } else if (activeTab === "reports") {
    content = renderPlaceholder(
      "Reports",
      "Analytics and reports across the club.",
    );
  } else if (activeTab === "communications") {
    content = renderPlaceholder(
      "Communications",
      "Messages and alerts across the club.",
    );
  } else if (activeTab === "settings") {
    content = renderPlaceholder(
      "Settings",
      "Club-wide configuration.",
    );
  } else {
    content = renderOverview();
  }

  return (
    <AdminWorkspaceLayout<TabKey>
      workspaceTitle={data?.club.name ?? "Chairman"}
      workspaceSubtitle={
        data
          ? `${data.club.sport_display} club administration`
          : "Full club access"
      }
      eyebrow="Chairman"
      title="Chairman Dashboard"
      description="Full oversight of your club's members, teams, finances, and operations using live League OS records."
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