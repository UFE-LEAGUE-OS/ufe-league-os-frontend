import {
  Users,
  Inbox,
  RefreshCw,
  Layers,
  FileDown,
  Search,
  Plus,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminWorkspaceLayout, {
  type AdminWorkspaceNavItem,
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

type TabKey = "directory" | "renewals" | "tiers" | "requests" | "reports";

const navItems: AdminWorkspaceNavItem<TabKey>[] = [
  { key: "directory", label: "Members Directory", icon: Users },
  { key: "renewals", label: "Renewals & Expiry", icon: RefreshCw },
  { key: "tiers", label: "Tiers & Pricing", icon: Layers },
  { key: "requests", label: "Requests Queue", icon: Inbox },
  { key: "reports", label: "Export Reports", icon: FileDown },
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
        .join(",")
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

const emptyPlanForm: {
  name: string;
  description: string;
  tier: string;
  billing_cycle: string;
  price_amount: string;
  currency: string;
  benefits: string;
  is_active: boolean;
  is_visible: boolean;
} = {
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

export default function ClubMembershipManagement() {
  const [activeTab, setActiveTab] = useState<TabKey>("directory");

  const [workspace, setWorkspace] = useState<ClubAdminWorkspaceData | null>(null);
  const [subscriptions, setSubscriptions] = useState<BackendMembershipSubscription[]>([]);
  const [plans, setPlans] = useState<BackendMembershipPlan[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [planForm, setPlanForm] = useState(emptyPlanForm);
  const [planFormError, setPlanFormError] = useState("");
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const workspaceData = await getClubAdminWorkspace();
      setWorkspace(workspaceData);

      const clubId = workspaceData.club.id;
      const [subsResult, plansResult] = await Promise.all([
        getClubSubscriptions(clubId),
        getClubMembershipPlans(clubId),
      ]);

      setSubscriptions(subsResult);
      setPlans(plansResult);
    } catch (loadError) {
      setError(
        getApiErrorMessage(
          loadError,
          "The club membership workspace could not be loaded."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
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
    return subscriptions.filter((sub) => sub.status === "PENDING_PAYMENT");
  }, [subscriptions]);

  const stats = [
    {
      label: "Total Members",
      value: subscriptions.length,
      detail: "All subscriptions on record",
      icon: Users,
    },
    {
      label: "Active",
      value: subscriptions.filter((s) => s.status === "ACTIVE").length,
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

  const openCreatePlan = () => {
    setEditingPlanId(null);
    setPlanForm(emptyPlanForm);
    setPlanFormError("");
    setShowPlanForm(true);
  };

  const openEditPlan = (plan: BackendMembershipPlan) => {
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
  };

  const closePlanForm = () => {
    setShowPlanForm(false);
    setEditingPlanId(null);
    setPlanForm(emptyPlanForm);
    setPlanFormError("");
  };

  const savePlan = async () => {
    if (!workspace) return;

    if (!planForm.name.trim() || !planForm.price_amount.trim()) {
      setPlanFormError("Plan name and price are required.");
      return;
    }

    setIsSavingPlan(true);
    setPlanFormError("");

    const payload = {
      club: workspace.club.id,
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
        const updated = await updateMembershipPlan(editingPlanId, payload);
        setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createMembershipPlan(payload);
        setPlans((prev) => [...prev, created]);
      }
      closePlanForm();
    } catch (saveError) {
      setPlanFormError(
        getApiErrorMessage(saveError, "The membership plan could not be saved.")
      );
    } finally {
      setIsSavingPlan(false);
    }
  };

  const exportDirectoryCsv = () => {
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
    downloadCsv(`${workspace?.club.slug ?? "club"}-members-directory.csv`, rows);
  };

  const exportRenewalsCsv = () => {
    const rows = [
      ["Email", "Plan", "Ends", "Days Left"],
      ...renewalSubscriptions.map((sub) => [
        sub.user_email,
        sub.plan_name,
        sub.ends_at ?? "",
        String(sub.daysLeft ?? ""),
      ]),
    ];
    downloadCsv(`${workspace?.club.slug ?? "club"}-renewals.csv`, rows);
  };

  let content: React.ReactNode = null;

  if (isLoading) {
    content = <WorkspaceLoading />;
  } else if (error) {
    content = <WorkspaceError message={error} onRetry={loadData} />;
  } else if (activeTab === "directory") {
    content = (
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
                      <span className={styles.tablePrimary}>{sub.user_email}</span>
                    </td>
                    <td>{sub.plan_name}</td>
                    <td>
                      <WorkspaceStatus value={sub.status} />
                    </td>
                    <td>{sub.starts_at ? formatWorkspaceDate(sub.starts_at) : "—"}</td>
                    <td>{sub.ends_at ? formatWorkspaceDate(sub.ends_at) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  } else if (activeTab === "renewals") {
    content = (
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
                        <span className={styles.tablePrimary}>{sub.user_email}</span>
                      </td>
                      <td>{sub.plan_name}</td>
                      <td>{sub.ends_at ? formatWorkspaceDate(sub.ends_at) : "—"}</td>
                      <td>{sub.daysLeft} day{sub.daysLeft === 1 ? "" : "s"}</td>
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
                        <span className={styles.tablePrimary}>{sub.user_email}</span>
                      </td>
                      <td>{sub.plan_name}</td>
                      <td>{sub.ends_at ? formatWorkspaceDate(sub.ends_at) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WorkspacePanel>
      </>
    );
  } else if (activeTab === "tiers") {
    content = (
      <WorkspacePanel
        eyebrow="Membership Plans"
        title="Tiers & Pricing"
        description="Configure the membership tiers available for your club."
        actions={
          <button type="button" className={styles.primaryButton} onClick={openCreatePlan}>
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
                      <span className={styles.tablePrimary}>{plan.name}</span>
                    </td>
                    <td>{plan.tier}</td>
                    <td>{plan.billing_cycle}</td>
                    <td>
                      {formatMembershipCurrency(Number(plan.price_amount), plan.currency)}
                    </td>
                    <td>
                      <WorkspaceStatus value={plan.is_visible ? "ACTIVE" : "HIDDEN"} />
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
            <div className="cmm-form-card" onClick={(e) => e.stopPropagation()}>
              <div className="cmm-form-header">
                <h3>{editingPlanId ? "Edit Membership Plan" : "New Membership Plan"}</h3>
                <button type="button" onClick={closePlanForm} className="cmm-form-close">
                  <X size={18} />
                </button>
              </div>

              <div className="cmm-form-grid">
                <label>
                  Plan Name
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="Gold Membership"
                  />
                </label>
                <label>
                  Tier
                  <select
                    value={planForm.tier}
                    onChange={(e) => setPlanForm({ ...planForm, tier: e.target.value })}
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
                      setPlanForm({ ...planForm, billing_cycle: e.target.value })
                    }
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="SEMI_ANNUAL">Semi-Annual</option>
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
                      setPlanForm({ ...planForm, price_amount: e.target.value })
                    }
                    placeholder="150000"
                  />
                </label>
                <label>
                  Currency
                  <input
                    type="text"
                    value={planForm.currency}
                    onChange={(e) => setPlanForm({ ...planForm, currency: e.target.value })}
                    placeholder="UGX"
                  />
                </label>
                <label className="cmm-form-full">
                  Description
                  <textarea
                    value={planForm.description}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, description: e.target.value })
                    }
                    rows={2}
                  />
                </label>
                <label className="cmm-form-full">
                  Benefits (one per line)
                  <textarea
                    value={planForm.benefits}
                    onChange={(e) => setPlanForm({ ...planForm, benefits: e.target.value })}
                    rows={3}
                    placeholder={"Priority ticket access\nExclusive merchandise discount"}
                  />
                </label>
                <label className="cmm-checkbox-row">
                  <input
                    type="checkbox"
                    checked={planForm.is_visible}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, is_visible: e.target.checked })
                    }
                  />
                  Visible to fans
                </label>
                <label className="cmm-checkbox-row">
                  <input
                    type="checkbox"
                    checked={planForm.is_active}
                    onChange={(e) =>
                      setPlanForm({ ...planForm, is_active: e.target.checked })
                    }
                  />
                  Active
                </label>
              </div>

              {planFormError && <p className="cmm-form-error">{planFormError}</p>}

              <div className="cmm-form-actions">
                <button type="button" className={styles.secondaryButton} onClick={closePlanForm}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={savePlan}
                  disabled={isSavingPlan}
                >
                  {isSavingPlan ? "Saving..." : editingPlanId ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </WorkspacePanel>
    );
  } else if (activeTab === "requests") {
    content = (
      <WorkspacePanel
        eyebrow="Requests"
        title="Membership Requests Queue"
        description="Members with a subscription awaiting completed payment."
      >
        <div className="cmm-notice-banner">
          Approve/reject actions are not yet available — membership activation currently
          happens automatically once payment is confirmed. This list is read-only until
          a manual review workflow is added on the backend.
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
                      <span className={styles.tablePrimary}>{sub.user_email}</span>
                    </td>
                    <td>{sub.plan_name}</td>
                    <td>{formatWorkspaceDate(sub.created_at)}</td>
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
  } else if (activeTab === "reports") {
    content = (
      <WorkspacePanel
        eyebrow="Reports"
        title="Export Reports"
        description="Download membership data as CSV files for offline reporting."
      >
        <div className="cmm-report-grid">
          <div className="cmm-report-card">
            <h4>Members Directory</h4>
            <p>Export the currently filtered members directory list.</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={exportDirectoryCsv}
              disabled={filteredSubscriptions.length === 0}
            >
              <FileDown size={15} /> Export CSV
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
              <FileDown size={15} /> Export CSV
            </button>
          </div>
        </div>
      </WorkspacePanel>
    );
  }

  return (
    <AdminWorkspaceLayout<TabKey>
      workspaceTitle={workspace?.club.name ?? "Club Membership"}
      workspaceSubtitle={
        workspace ? `${workspace.club.sport_display} membership management` : "Club-scoped access"
      }
      eyebrow="Membership Management"
      title="Club Membership Management"
      description="Manage members, requests, renewals, tiers and reports for your club."
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      publicPath={workspace ? `/clubs/${workspace.club.slug}` : "/clubs"}
      publicLabel="View club page"
    >
      {!isLoading && !error && <WorkspaceStatGrid stats={stats} />}
      {content}
    </AdminWorkspaceLayout>
  );
}