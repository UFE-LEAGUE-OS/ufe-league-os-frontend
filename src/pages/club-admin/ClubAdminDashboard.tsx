import {
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Download,
  FileBarChart,
  Inbox,
  Layers,
  Megaphone,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  TicketCheck,
  Trophy,
  UserCircle,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminWorkspaceLayout, {
  type AdminWorkspaceNavGroup,
  WorkspaceEmpty,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
  WorkspaceStatGrid,
  WorkspaceStatus,
  adminWorkspaceStyles as styles,
  formatWorkspaceDate,
} from "../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import {
  getApiErrorMessage,
  getClubAdminWorkspace,
  type ClubAdminWorkspaceData,
} from "../../services/adminWorkspaceService";
import {
  getClubSubscriptions,
  getClubMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  formatMembershipCurrency,
  type BackendMembershipSubscription,
  type BackendMembershipPlan,
} from "../../services/membershipService";
import "./ClubMembershipManagement.css";
import UserManagement from "./UserManagement";

type TabKey =
  | "overview"
  | "membership"
  | "membershipDirectory"
  | "membershipRenewals"
  | "membershipTiers"
  | "membershipRequests"
  | "membershipReports"
  | "teams"
  | "matches"
  | "finances"
  | "ticketing"
  | "facilities"
  | "profileBranding"
  | "sponsorshipMatchday"
  | "compliance"
  | "reports"
  | "communications"
  | "clubUsers"
  | "settings";

const navItems: AdminWorkspaceNavGroup<TabKey>[] = [
  {
    label: "Overview",
    items: [
      { key: "overview", label: "Dashboard", icon: BarChart3 },
    ],
  },
  {
    label: "Club Operations",
    items: [
      {
        key: "membership",
        label: "Membership",
        icon: CreditCard,
        children: [
          {
            key: "membershipDirectory",
            label: "Members Directory",
            icon: Users,
          },
          {
            key: "membershipRenewals",
            label: "Renewals & Expiry",
            icon: RefreshCw,
          },
          {
            key: "membershipTiers",
            label: "Tiers & Pricing",
            icon: Layers,
          },
          {
            key: "membershipRequests",
            label: "Requests Queue",
            icon: ClipboardList,
          },
          {
            key: "membershipReports",
            label: "Export Reports",
            icon: Download,
          },
        ],
      },
      { key: "teams", label: "Teams", icon: Trophy },
      { key: "matches", label: "Matches", icon: CalendarDays },
      { key: "finances", label: "Finances", icon: Wallet },
      { key: "ticketing", label: "Tickets", icon: TicketCheck },
      { key: "facilities", label: "Facilities", icon: Building2 },
    ],
  },
  {
    label: "Governance",
    items: [
      {
        key: "profileBranding",
        label: "Profile & Branding",
        icon: UserCircle,
      },
      {
        key: "sponsorshipMatchday",
        label: "Sponsorship & Matchday Operations",
        icon: Megaphone,
      },
      { key: "compliance", label: "Compliance", icon: ShieldCheck },
    ],
  },
  {
    label: "Administration",
    items: [
      { key: "reports", label: "Reports", icon: FileBarChart },
      {
        key: "communications",
        label: "Communications",
        icon: MessageSquare,
      },
      { key: "clubUsers", label: "Club Users", icon: Users },
      { key: "settings", label: "Settings", icon: SettingsIcon },
    ],
  },
];

const STATUS_FILTERS = [
  "ALL",
  "ACTIVE",
  "PENDING_PAYMENT",
  "PAUSED",
  "EXPIRED",
  "CANCELLED",
  "FAILED",
];

const emptyPlanForm = {
  name: "",
  description: "",
  tier: "STANDARD",
  billing_cycle: "MONTHLY",
  price_amount: "",
  currency: "UGX",
  benefits: "",
  is_active: true,
  is_visible: true,
};

function daysUntil(dateString: string | null): number | null {
  if (!dateString) return null;
  const target = new Date(dateString).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function downloadCsv(filename: string, rows: string[][]) {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ClubAdminDashboard() {
  const [activeTab, setActiveTab] =
    useState<TabKey>("overview");
  const [data, setData] =
    useState<ClubAdminWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Membership directory / plans state (shared across the five
  // membership child tabs, loaded alongside the main workspace).
  const [subscriptions, setSubscriptions] = useState<
    BackendMembershipSubscription[]
  >([]);
  const [plans, setPlans] = useState<BackendMembershipPlan[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(
    null,
  );
  const [planForm, setPlanForm] = useState(emptyPlanForm);
  const [planFormError, setPlanFormError] = useState("");
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Membership's five sub-pages render inline, in this same
  // workspace shell, the same way "User Management" expands in the
  // super-admin sidebar — so tab changes no longer need to navigate
  // away to a standalone route/page.
  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const workspaceData = await getClubAdminWorkspace();
      setData(workspaceData);

      const clubId = workspaceData.club.id;
      const [subsResult, plansResult] = await Promise.all([
        getClubSubscriptions(clubId),
        getClubMembershipPlans(clubId),
      ]);

      setSubscriptions(subsResult);
      setPlans(plansResult);
    } catch (loadError) {
      setData(null);
      setError(
        getApiErrorMessage(
          loadError,
          "The club workspace could not be loaded.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesStatus =
        statusFilter === "ALL" || sub.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        sub.user_email.toLowerCase().includes(query) ||
        sub.plan_name.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [subscriptions, statusFilter, searchQuery]);

  const renewalSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === "ACTIVE" && sub.ends_at)
      .map((sub) => ({ ...sub, daysLeft: daysUntil(sub.ends_at) }))
      .filter((sub) => sub.daysLeft !== null && sub.daysLeft <= 30)
      .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));
  }, [subscriptions]);

  const expiredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => sub.status === "EXPIRED");
  }, [subscriptions]);

  const pendingSubscriptions = useMemo(() => {
    return subscriptions.filter(
      (sub) => sub.status === "PENDING_PAYMENT",
    );
  }, [subscriptions]);

  const stats = useMemo(
    () => [
      {
        label: "Competitions",
        value: data?.summary.competitions ?? 0,
        detail: "Competitions featuring this club",
        icon: Trophy,
      },
      {
        label: "Upcoming Fixtures",
        value: data?.summary.upcoming_fixtures ?? 0,
        detail: "Scheduled club matches",
        icon: CalendarDays,
      },
      {
        label: "Tickets Sold",
        value: data?.summary.tickets_sold ?? 0,
        detail: "Issued match tickets",
        icon: TicketCheck,
      },
      {
        label: "Club Users",
        value: data?.summary.club_users ?? 0,
        detail: "Accounts attached to the club",
        icon: Users,
      },
    ],
    [data],
  );

  function renderFixtureTable(
    rows: ClubAdminWorkspaceData["upcoming_fixtures"],
    mode: "fixture" | "result",
  ) {
    if (rows.length === 0) {
      return (
        <WorkspaceEmpty
          title={
            mode === "fixture"
              ? "No upcoming fixtures"
              : "No completed results"
          }
          description={
            mode === "fixture"
              ? "Scheduled matches involving this club will appear here."
              : "Completed match results will appear here."
          }
        />
      );
    }

    return (
      <div className={styles.tableShell}>
        <table>
          <thead>
            <tr>
              <th>Match</th>
              <th>Competition</th>
              <th>Date</th>
              <th>Venue</th>
              {mode === "result" ? <th>Score</th> : null}
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((match) => (
              <tr key={match.id}>
                <td>
                  <span className={styles.tablePrimary}>
                    {match.label}
                  </span>
                  <span className={styles.tableSecondary}>
                    {match.league}
                  </span>
                </td>
                <td>{match.competition}</td>
                <td>
                  {formatWorkspaceDate(match.match_date)}
                </td>
                <td>{match.venue || "TBC"}</td>
                {mode === "result" ? (
                  <td>
                    {match.home_score ?? "—"} –{" "}
                    {match.away_score ?? "—"}
                  </td>
                ) : null}
                <td>
                  <WorkspaceStatus value={match.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderFinancialChart() {
    return data?.financial_overview?.length ? (
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data.financial_overview}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
            />
            <XAxis dataKey="month" stroke="var(--muted)" />
            <YAxis stroke="var(--muted)" />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            />
            <Legend />
            <Bar
              dataKey="income"
              fill="var(--green)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <WorkspaceEmpty
        title="No financial data"
        description="Income and expense records will appear here once available."
      />
    );
  }

  function renderOverview() {
    return (
      <>
        <WorkspaceStatGrid stats={stats} />

        <div className={styles.gridTwo}>
          <WorkspacePanel
            eyebrow="League participation"
            title="League memberships"
            description="Current league and season relationships recorded for this club."
          >
            {data?.league_memberships.length ? (
              <div className={styles.scopeGrid}>
                {data.league_memberships.map(
                  (membership) => (
                    <article
                      className={styles.scopeCard}
                      key={membership.id}
                    >
                      <span>
                        {membership.status_display}
                      </span>
                      <strong>{membership.league}</strong>
                      <small>
                        {membership.season ??
                          "No season assigned"}
                      </small>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <WorkspaceEmpty
                title="No league memberships"
                description="This club is not currently linked to a league season."
              />
            )}
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Ticketing readiness"
            title="Matchday access"
            description="Live ticket inventory and check-in totals for matches involving this club."
          >
            <div className={styles.scopeGrid}>
              <article className={styles.scopeCard}>
                <span>Ticket types</span>
                <strong>
                  {data?.summary.ticket_types ?? 0}
                </strong>
                <small>Configured inventory records</small>
              </article>

              <article className={styles.scopeCard}>
                <span>Checked in</span>
                <strong>
                  {data?.summary.checked_in ?? 0}
                </strong>
                <small>Tickets admitted at the gate</small>
              </article>
            </div>
          </WorkspacePanel>
        </div>

        <div className={styles.gridTwo}>
          <WorkspacePanel
            eyebrow="Club activity"
            title="Recent activity"
            description="The latest updates across your club."
          >
            {data?.recent_activity?.length ? (
              <div className={styles.scopeGrid}>
                {data.recent_activity.map((activity) => (
                  <article
                    className={styles.scopeCard}
                    key={activity.id}
                  >
                    <span>
                      {formatWorkspaceDate(
                        activity.timestamp,
                      )}
                    </span>
                    <strong>{activity.title}</strong>
                    <small>{activity.description}</small>
                  </article>
                ))}
              </div>
            ) : (
              <WorkspaceEmpty
                title="No recent activity"
                description="Updates like new members, results, and payments will appear here."
              />
            )}
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Club finances"
            title="Financial overview"
            description="Income vs expense across recent months."
            actions={
              <button
                type="button"
                className={styles.publicLink}
                onClick={() => setActiveTab("finances")}
              >
                View full finances
              </button>
            }
          >
            {renderFinancialChart()}
          </WorkspacePanel>
        </div>

        <WorkspacePanel
          eyebrow="Next matches"
          title="Upcoming fixtures"
          description="The next scheduled matches involving your club."
          actions={
            <button
              type="button"
              className={styles.publicLink}
              onClick={() => setActiveTab("matches")}
            >
              View all matches
            </button>
          }
        >
          {renderFixtureTable(
            data?.upcoming_fixtures ?? [],
            "fixture",
          )}
        </WorkspacePanel>
      </>
    );
  }

  function renderMatches() {
    return (
      <>
        <WorkspacePanel
          eyebrow="Club schedule"
          title="Upcoming fixtures"
          description="Every scheduled fixture involving this club."
        >
          {renderFixtureTable(
            data?.upcoming_fixtures ?? [],
            "fixture",
          )}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Club performance"
          title="Recent results"
          description="Completed match records involving this club."
        >
          {renderFixtureTable(
            data?.recent_results ?? [],
            "result",
          )}
        </WorkspacePanel>
      </>
    );
  }

  function renderFinances() {
    return (
      <WorkspacePanel
        eyebrow="Club finances"
        title="Financial overview"
        description="Income vs expense across recent months."
      >
        {renderFinancialChart()}
      </WorkspacePanel>
    );
  }

  function renderTicketing() {
    const events = data?.ticket_events ?? [];

    return (
      <WorkspacePanel
        eyebrow="Club ticketing"
        title="Ticketed match events"
        description="Inventory and admission figures for matches involving this club."
      >
        {events.length === 0 ? (
          <WorkspaceEmpty
            title="No ticketed events"
            description="No upcoming matches currently have ticket inventory configured."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Ticket Types</th>
                  <th>Sold</th>
                  <th>Checked In</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className={styles.tablePrimary}>
                        {event.label}
                      </span>
                      <span
                        className={styles.tableSecondary}
                      >
                        {event.competition}
                      </span>
                    </td>
                    <td>
                      {formatWorkspaceDate(
                        event.match_date,
                      )}
                    </td>
                    <td>{event.ticket_types}</td>
                    <td>{event.tickets_sold}</td>
                    <td>{event.checked_in}</td>
                    <td>
                      <WorkspaceStatus
                        value={event.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  // function renderStaff() {
  //   const staff = data?.staff ?? [];

  //   return (
  //     <WorkspacePanel
  //       eyebrow="Club access"
  //       title="Club administrators and officers"
  //       description="Active administrative and ticketing users attached to this club."
  //     >
  //       {staff.length === 0 ? (
  //         <WorkspaceEmpty
  //           title="No club users"
  //           description="No administrative accounts are currently attached to this club."
  //         />
  //       ) : (
  //         <div className={styles.tableShell}>
  //           <table>
  //             <thead>
  //               <tr>
  //                 <th>Name</th>
  //                 <th>Email</th>
  //                 <th>Role</th>
  //                 <th>Status</th>
  //               </tr>
  //             </thead>

  //             <tbody>
  //               {staff.map((user) => (
  //                 <tr key={user.id}>
  //                   <td>
  //                     <span className={styles.tablePrimary}>
  //                       {user.name}
  //                     </span>
  //                   </td>
  //                   <td>{user.email}</td>
  //                   <td>{user.role_display}</td>
  //                   <td>
  //                     <WorkspaceStatus value="ACTIVE" />
  //                   </td>
  //                 </tr>
  //               ))}
  //             </tbody>
  //           </table>
  //         </div>
  //       )}
  //     </WorkspacePanel>
  //   );
  // }

  /* ------------------------------------------------------------------ */
  /* Membership sub-pages (real content, ported from                    */
  /* ClubMembershipManagement.tsx so both entry points stay in sync)     */
  /* ------------------------------------------------------------------ */

  function openCreatePlan() {
    setEditingPlanId(null);
    setPlanForm(emptyPlanForm);
    setPlanFormError("");
    setShowPlanForm(true);
  }

  function openEditPlan(plan: BackendMembershipPlan) {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      tier: plan.tier,
      billing_cycle: plan.billing_cycle,
      price_amount: plan.price_amount,
      currency: plan.currency,
      benefits: (plan.benefits ?? []).join("\n"),
      is_active: plan.is_active,
      is_visible: plan.is_visible,
    });
    setPlanFormError("");
    setShowPlanForm(true);
  }

  function closePlanForm() {
    setShowPlanForm(false);
    setEditingPlanId(null);
    setPlanForm(emptyPlanForm);
    setPlanFormError("");
  }

  async function savePlan() {
    if (!data) return;

    if (!planForm.name.trim() || !planForm.price_amount.trim()) {
      setPlanFormError("Plan name and price are required.");
      return;
    }

    setIsSavingPlan(true);
    setPlanFormError("");

    const payload = {
      club: data.club.id,
      name: planForm.name.trim(),
      description: planForm.description.trim(),
      tier: planForm.tier,
      billing_cycle: planForm.billing_cycle,
      price_amount: planForm.price_amount.trim(),
      currency: planForm.currency,
      benefits: planForm.benefits
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean),
      is_active: planForm.is_active,
      is_visible: planForm.is_visible,
    };

    try {
      if (editingPlanId) {
        const updated = await updateMembershipPlan(
          editingPlanId,
          payload,
        );
        setPlans((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
      } else {
        const created = await createMembershipPlan(payload);
        setPlans((prev) => [...prev, created]);
      }
      closePlanForm();
    } catch (saveError) {
      setPlanFormError(
        getApiErrorMessage(
          saveError,
          "The membership plan could not be saved.",
        ),
      );
    } finally {
      setIsSavingPlan(false);
    }
  }

  function exportDirectoryCsv() {
    const rows = [
      ["Email", "Plan", "Status", "Starts", "Ends", "Created"],
      ...filteredSubscriptions.map((sub) => [
        sub.user_email,
        sub.plan_name,
        sub.status,
        sub.starts_at ?? "",
        sub.ends_at ?? "",
        sub.created_at,
      ]),
    ];
    downloadCsv(
      `${data?.club.slug ?? "club"}-members-directory.csv`,
      rows,
    );
  }

  function exportRenewalsCsv() {
    const rows = [
      ["Email", "Plan", "Ends", "Days Left"],
      ...renewalSubscriptions.map((sub) => [
        sub.user_email,
        sub.plan_name,
        sub.ends_at ?? "",
        String(sub.daysLeft ?? ""),
      ]),
    ];
    downloadCsv(`${data?.club.slug ?? "club"}-renewals.csv`, rows);
  }

  function renderMembershipDirectory() {
    return (
      <WorkspacePanel
        eyebrow="Members"
        title="Members Directory"
        description="All fan memberships recorded for your club."
        actions={
          <div className="cmm-filter-bar">
            <div className="cmm-search-wrap">
              <Search size={15} className="cmm-search-icon" />
              <input
                className="cmm-search-input"
                type="text"
                placeholder="Search by email or plan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="cmm-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Statuses" : s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {filteredSubscriptions.length === 0 ? (
          <WorkspaceEmpty
            title="No members found"
            description="No memberships match the current filters."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <span className={styles.tablePrimary}>
                        {sub.user_email}
                      </span>
                    </td>
                    <td>{sub.plan_name}</td>
                    <td>
                      <WorkspaceStatus value={sub.status} />
                    </td>
                    <td>
                      {sub.starts_at
                        ? formatWorkspaceDate(sub.starts_at)
                        : "—"}
                    </td>
                    <td>
                      {sub.ends_at
                        ? formatWorkspaceDate(sub.ends_at)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderMembershipRenewals() {
    return (
      <>
        <WorkspacePanel
          eyebrow="Renewals"
          title="Renewing within 30 days"
          description="Active members whose subscription is about to expire."
        >
          {renewalSubscriptions.length === 0 ? (
            <WorkspaceEmpty
              title="No upcoming renewals"
              description="No active members are due to renew in the next 30 days."
            />
          ) : (
            <div className={styles.tableShell}>
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Plan</th>
                    <th>Ends</th>
                    <th>Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  {renewalSubscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <span className={styles.tablePrimary}>
                          {sub.user_email}
                        </span>
                      </td>
                      <td>{sub.plan_name}</td>
                      <td>
                        {sub.ends_at
                          ? formatWorkspaceDate(sub.ends_at)
                          : "—"}
                      </td>
                      <td>
                        {sub.daysLeft} day
                        {sub.daysLeft === 1 ? "" : "s"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Expired"
          title="Expired Memberships"
          description="Members whose subscription has already lapsed."
        >
          {expiredSubscriptions.length === 0 ? (
            <WorkspaceEmpty
              title="No expired memberships"
              description="All memberships are currently in good standing."
            />
          ) : (
            <div className={styles.tableShell}>
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Plan</th>
                    <th>Expired On</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredSubscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <span className={styles.tablePrimary}>
                          {sub.user_email}
                        </span>
                      </td>
                      <td>{sub.plan_name}</td>
                      <td>
                        {sub.ends_at
                          ? formatWorkspaceDate(sub.ends_at)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WorkspacePanel>
      </>
    );
  }

  function renderMembershipTiers() {
    return (
      <WorkspacePanel
        eyebrow="Membership Plans"
        title="Tiers & Pricing"
        description="Configure the membership tiers available for your club."
        actions={
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openCreatePlan}
          >
            <Plus size={15} /> New Plan
          </button>
        }
      >
        {plans.length === 0 ? (
          <WorkspaceEmpty
            title="No membership plans yet"
            description="Create your first membership tier to start accepting members."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Tier</th>
                  <th>Billing</th>
                  <th>Price</th>
                  <th>Visibility</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td>
                      <span className={styles.tablePrimary}>
                        {plan.name}
                      </span>
                    </td>
                    <td>{plan.tier}</td>
                    <td>{plan.billing_cycle}</td>
                    <td>
                      {formatMembershipCurrency(
                        Number(plan.price_amount),
                        plan.currency,
                      )}
                    </td>
                    <td>
                      <WorkspaceStatus
                        value={
                          plan.is_visible ? "ACTIVE" : "HIDDEN"
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cmm-link-button"
                        onClick={() => openEditPlan(plan)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showPlanForm && (
          <div className="cmm-form-overlay" onClick={closePlanForm}>
            <div
              className="cmm-form-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cmm-form-header">
                <h3>
                  {editingPlanId
                    ? "Edit Membership Plan"
                    : "New Membership Plan"}
                </h3>
                <button
                  type="button"
                  onClick={closePlanForm}
                  className="cmm-form-close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="cmm-form-grid">
                <label>
                  Plan Name
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Gold Membership"
                  />
                </label>
                <label>
                  Tier
                  <select
                    value={planForm.tier}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        tier: e.target.value,
                      })
                    }
                  >
                    <option value="BRONZE">Bronze</option>
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="PLATINUM">Platinum</option>
                    <option value="STANDARD">Standard</option>
                  </select>
                </label>
                <label>
                  Billing Cycle
                  <select
                    value={planForm.billing_cycle}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        billing_cycle: e.target.value,
                      })
                    }
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="SEMI_ANNUAL">
                      Semi-Annual
                    </option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </label>
                <label>
                  Price Amount
                  <input
                    type="text"
                    inputMode="decimal"
                    value={planForm.price_amount}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        price_amount: e.target.value,
                      })
                    }
                    placeholder="150000"
                  />
                </label>
                <label>
                  Currency
                  <input
                    type="text"
                    value={planForm.currency}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        currency: e.target.value,
                      })
                    }
                    placeholder="UGX"
                  />
                </label>
                <label className="cmm-form-full">
                  Description
                  <textarea
                    value={planForm.description}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </label>
                <label className="cmm-form-full">
                  Benefits (one per line)
                  <textarea
                    value={planForm.benefits}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        benefits: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder={
                      "Priority ticket access\nExclusive merchandise discount"
                    }
                  />
                </label>
                <label className="cmm-checkbox-row">
                  <input
                    type="checkbox"
                    checked={planForm.is_visible}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        is_visible: e.target.checked,
                      })
                    }
                  />
                  Visible to fans
                </label>
                <label className="cmm-checkbox-row">
                  <input
                    type="checkbox"
                    checked={planForm.is_active}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
              </div>

              {planFormError && (
                <p className="cmm-form-error">{planFormError}</p>
              )}

              <div className="cmm-form-actions">
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={closePlanForm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => void savePlan()}
                  disabled={isSavingPlan}
                >
                  {isSavingPlan
                    ? "Saving..."
                    : editingPlanId
                      ? "Save Changes"
                      : "Create Plan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderMembershipRequests() {
    return (
      <WorkspacePanel
        eyebrow="Requests"
        title="Membership Requests Queue"
        description="Members with a subscription awaiting completed payment."
      >
        <div className="cmm-notice-banner">
          Approve/reject actions are not yet available —
          membership activation currently happens automatically
          once payment is confirmed. This list is read-only until a
          manual review workflow is added on the backend.
        </div>
        {pendingSubscriptions.length === 0 ? (
          <WorkspaceEmpty
            title="No pending requests"
            description="There are no memberships currently awaiting payment."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Requested</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingSubscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <span className={styles.tablePrimary}>
                        {sub.user_email}
                      </span>
                    </td>
                    <td>{sub.plan_name}</td>
                    <td>
                      {formatWorkspaceDate(sub.created_at)}
                    </td>
                    <td>
                      <WorkspaceStatus value={sub.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderMembershipReports() {
    return (
      <WorkspacePanel
        eyebrow="Reports"
        title="Export Reports"
        description="Download membership data as CSV files for offline reporting."
      >
        <div className="cmm-report-grid">
          <div className="cmm-report-card">
            <h4>Members Directory</h4>
            <p>
              Export the currently filtered members directory
              list.
            </p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={exportDirectoryCsv}
              disabled={filteredSubscriptions.length === 0}
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
          <div className="cmm-report-card">
            <h4>Upcoming Renewals</h4>
            <p>Export members renewing within the next 30 days.</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={exportRenewalsCsv}
              disabled={renewalSubscriptions.length === 0}
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>
      </WorkspacePanel>
    );
  }

  function renderMembershipOverview() {
    // Landing tab for "Membership" itself — a quick summary with
    // links into each sub-section, rather than a bare placeholder.
    const membershipStats = [
      {
        label: "Total Members",
        value: subscriptions.length,
        detail: "All subscriptions on record",
        icon: Users,
      },
      {
        label: "Active",
        value: subscriptions.filter((s) => s.status === "ACTIVE")
          .length,
        detail: "Currently active members",
        icon: Users,
      },
      {
        label: "Renewing Soon",
        value: renewalSubscriptions.length,
        detail: "Expiring within 30 days",
        icon: RefreshCw,
      },
      {
        label: "Pending Payment",
        value: pendingSubscriptions.length,
        detail: "Awaiting completed payment",
        icon: Inbox,
      },
    ];

    return (
      <>
        <WorkspaceStatGrid stats={membershipStats} />
        {renderMembershipDirectory()}
      </>
    );
  }

  function renderPlaceholder(
    title: string,
    description: string,
  ) {
    return (
      <WorkspacePanel
        eyebrow="Club administration"
        title={title}
        description={description}
      >
        <WorkspaceEmpty
          title={`${title} is not yet built out`}
          description="This section will surface full detail here once available."
        />
      </WorkspacePanel>
    );
  }

  let content;

  if (isLoading && !data) {
    content = (
      <WorkspaceLoading label="Loading club operations…" />
    );
  } else if (error && !data) {
    content = (
      <WorkspaceError
        message={error}
        onRetry={loadWorkspace}
      />
    );
  } else if (activeTab === "membership") {
    content = renderMembershipOverview();
  } else if (activeTab === "membershipDirectory") {
    content = renderMembershipDirectory();
  } else if (activeTab === "membershipRenewals") {
    content = renderMembershipRenewals();
  } else if (activeTab === "membershipTiers") {
    content = renderMembershipTiers();
  } else if (activeTab === "membershipRequests") {
    content = renderMembershipRequests();
  } else if (activeTab === "membershipReports") {
    content = renderMembershipReports();
  } else if (activeTab === "teams") {
    content = renderPlaceholder(
      "Teams",
      "Manage all teams belonging to this club.",
    );
  } else if (activeTab === "matches") {
    content = renderMatches();
  } else if (activeTab === "finances") {
    content = renderFinances();
  } else if (activeTab === "ticketing") {
    content = renderTicketing();
  } else if (activeTab === "facilities") {
    content = renderPlaceholder(
      "Facilities",
      "Manage grounds and facilities for this club.",
    );
  } else if (activeTab === "profileBranding") {
    content = renderPlaceholder(
      "Profile & Branding",
      "Manage your club's public profile, logo, and colors.",
    );
  } else if (activeTab === "sponsorshipMatchday") {
    content = renderPlaceholder(
      "Sponsorship",
      "Manage sponsors and matchday operational details.",
    );
  } else if (activeTab === "compliance") {
    content = renderPlaceholder(
      "Compliance",
      "Track club compliance and regulatory requirements.",
    );
  } else if (activeTab === "reports") {
    content = renderPlaceholder(
      "Reports",
      "Analytics and reports for this club.",
    );
  } else if (activeTab === "communications") {
    content = renderPlaceholder(
      "Communications",
      "Messages and alerts for this club.",
    );
} else if (activeTab === "clubUsers") {
    content = data ? (
      <UserManagement clubId={data.club.id} />
    ) : (
      <WorkspaceLoading label="Loading club users…" />
    );
  } else if (activeTab === "settings") {
    content = renderPlaceholder(
      "Settings",
      "Club-wide configuration and preferences.",
    );
  } else {
    content = renderOverview();
  }

  return (
    <AdminWorkspaceLayout<TabKey>
      workspaceTitle={data?.club.name ?? "Club Operations"}
      workspaceSubtitle={
        data
          ? `${data.club.sport_display} club administration`
          : "Club-scoped access"
      }
      eyebrow="Club administration"
      title={data?.club.name ?? "Club Operations"}
      description="Review your club’s competitions, fixtures, ticketing activity and administrative users using live League OS records."
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      publicPath={
        data ? `/clubs/${data.club.slug}` : "/clubs"
      }
      publicLabel="View club page"
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