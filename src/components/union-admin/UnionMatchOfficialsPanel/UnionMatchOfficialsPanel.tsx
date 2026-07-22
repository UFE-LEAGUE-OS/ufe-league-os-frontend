import {
  BadgeCheck,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  | "appointments";

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
];

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

  useEffect(() => {
    setActiveView("overview");
  }, [workspaceSlug]);

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

          <div className={styles.moduleTitle}>Match Officials</div>

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
        role="tablist"
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
              role="tab"
              aria-selected={isActive}
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

      </div>
    </div>
  );
}
