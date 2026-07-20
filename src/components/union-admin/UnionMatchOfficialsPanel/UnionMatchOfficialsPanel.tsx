import {
  BadgeCheck,
  CalendarCheck,
  CalendarRange,
  DollarSign,
  FileCheck2,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  UnionWorkspacePermission,
  UnionWorkspaceRole,
} from "../../../services/unionAdminService";
import OfficialAppointmentsPanel from "../../OfficialAppointmentsPanel/OfficialAppointmentsPanel";
import UnionAdminRefereesPanel from "../../UnionAdminRefereesPanel/UnionAdminRefereesPanel";
import { UnionOfficialReadinessPanel } from "../../UnionOperationalPanels/UnionOperationalPanels";
import styles from "./UnionMatchOfficialsPanel.module.css";

type MatchOfficialsView =
  | "overview"
  | "directory"
  | "appointments"
  | "availability"
  | "reports"
  | "documents"
  | "allowances";

type Props = {
  workspaceSlug: string;
  workspaceName: string;
  workspaceSport: string;
  workspaceRole: UnionWorkspaceRole;
  permissions: UnionWorkspacePermission[];
};

type ViewDefinition = {
  key: MatchOfficialsView;
  label: string;
  icon: typeof ShieldCheck;
  permissions?: UnionWorkspacePermission[];
};

const views: ViewDefinition[] = [
  {
    key: "overview",
    label: "Overview & Readiness",
    icon: ShieldCheck,
  },
  {
    key: "directory",
    label: "Official Directory",
    icon: BadgeCheck,
    permissions: ["union.referees.manage"],
  },
  {
    key: "appointments",
    label: "Appointments",
    icon: CalendarCheck,
    permissions: ["union.official.appointments.view"],
  },
  {
    key: "availability",
    label: "Availability",
    icon: CalendarRange,
    permissions: ["union.official.availability.manage"],
  },
  {
    key: "reports",
    label: "Match Reports",
    icon: FileText,
    permissions: ["union.official.reports.manage"],
  },
  {
    key: "documents",
    label: "Documents",
    icon: FileCheck2,
    permissions: ["union.official.documents.view"],
  },
  {
    key: "allowances",
    label: "Allowances",
    icon: DollarSign,
    permissions: ["union.official.payments.view"],
  },
];

function UnavailableModule({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className={styles.unavailablePanel}>
      <span>{eyebrow}</span>

      <h2>{title}</h2>

      <p>{description}</p>

      <div className={styles.unavailableNotice}>
        This screen is included in the approved frontend workflow. Saving and
        maintained records will be enabled when its Union-scoped backend
        contract is connected.
      </div>
    </section>
  );
}

export default function UnionMatchOfficialsPanel({
  workspaceSlug,
  workspaceName,
  workspaceSport,
  workspaceRole,
  permissions,
}: Props) {
  const availableViews = useMemo(
    () =>
      views.filter(
        (view) =>
          !view.permissions ||
          view.permissions.some((permission) =>
            permissions.includes(permission),
          ),
      ),
    [permissions],
  );

  const [activeView, setActiveView] =
    useState<MatchOfficialsView>("overview");

  const currentView = availableViews.some(
    (view) => view.key === activeView,
  )
    ? activeView
    : availableViews[0]?.key ?? "overview";

  return (
    <div className={styles.shell}>
      <section className={styles.moduleHeader}>
        <div>
          <span>Official management</span>

          <h2>Match Officials</h2>

          <p>
            Register, verify, appoint and monitor{" "}
            {workspaceSport || "sport"} officials working under{" "}
            {workspaceName}.
          </p>
        </div>

        <div className={styles.scopeBadge}>
          Workspace scoped
        </div>
      </section>

      <nav
        className={styles.tabList}
        aria-label="Match Officials sections"
      >
        {availableViews.map((view) => {
          const Icon = view.icon;
          const isActive = view.key === currentView;

          return (
            <button
              key={view.key}
              className={
                isActive
                  ? styles.activeTab
                  : styles.tab
              }
              type="button"
              onClick={() => setActiveView(view.key)}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={17}
                strokeWidth={2.25}
                aria-hidden="true"
              />

              <span>{view.label}</span>
            </button>
          );
        })}
      </nav>

      <div className={styles.content}>
        {currentView === "overview" ? (
          <UnionOfficialReadinessPanel
            workspaceSlug={workspaceSlug}
            workspaceName={workspaceName}
          />
        ) : null}

        {currentView === "directory" ? (
          <UnionAdminRefereesPanel
            workspaceSlug={workspaceSlug}
            workspaceName={workspaceName}
            workspaceSport={workspaceSport}
            canManageOfficials={permissions.includes(
              "union.referees.manage",
            )}
          />
        ) : null}

        {currentView === "appointments" ? (
          <OfficialAppointmentsPanel
            mode={
              workspaceRole === "MATCH_OFFICIAL"
                ? "official"
                : "union"
            }
            workspaceSlug={workspaceSlug}
            workspaceName={workspaceName}
          />
        ) : null}

        {currentView === "availability" ? (
          <UnavailableModule
            eyebrow="Official readiness"
            title="Availability calendar"
            description="Review available, unavailable, tentative and conflicting dates for registered officials."
          />
        ) : null}

        {currentView === "reports" ? (
          <UnavailableModule
            eyebrow="Post-match workflow"
            title="Match reports and incidents"
            description="Track submitted match reports, incident reports, overdue submissions and review status."
          />
        ) : null}

        {currentView === "documents" ? (
          <UnavailableModule
            eyebrow="Official compliance"
            title="Documents and certifications"
            description="Review certification levels, expiry dates, identity evidence and compliance documents."
          />
        ) : null}

        {currentView === "allowances" ? (
          <UnavailableModule
            eyebrow="Official finance"
            title="Allowances and claims"
            description="Review approved appointment allowances, outstanding claims and payment references."
          />
        ) : null}
      </div>
    </div>
  );
}
