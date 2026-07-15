import {
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import AuthenticatedFooter from "../AuthenticatedFooter/AuthenticatedFooter";
import {
  AdminMobileBottomNav,
  AdminMobileDrawer,
  AdminSidebar,
  type AdminWorkspaceNavItem,
} from "./AdminWorkspaceSidebar";
import styles from "./AdminWorkspaceLayout.module.css";

type LayoutProps<T extends string> = {
  workspaceTitle: string;
  workspaceSubtitle: string;
  eyebrow: string;
  title: string;
  description: string;
  navItems: AdminWorkspaceNavItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  publicPath?: string;
  publicLabel?: string;
  headerActions?: ReactNode;
  children: ReactNode;
};

export type WorkspaceStat = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
};

export default function AdminWorkspaceLayout<
  T extends string,
>({
  workspaceTitle,
  workspaceSubtitle,
  eyebrow,
  title,
  description,
  navItems,
  activeTab,
  onTabChange,
  publicPath,
  publicLabel,
  headerActions,
  children,
}: LayoutProps<T>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  function handleTabChange(tab: T) {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  }

  return (
    <div className={styles.page}>
      <div
        className={`${styles.body} ${
          isSidebarCollapsed
            ? styles.bodySidebarCollapsed
            : ""
        }`}
      >
        <AdminSidebar
          workspaceTitle={workspaceTitle}
          workspaceSubtitle={workspaceSubtitle}
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() =>
            setIsSidebarCollapsed(
              (currentValue) => !currentValue,
            )
          }
        />

        <div className={styles.contentArea}>
          <main className={styles.main}>
            <header className={styles.hero}>
              <div className={styles.heroCopy}>
                <div className={styles.heroMeta}>
                  <span className={styles.eyebrow}>
                    {eyebrow}
                  </span>

                  <span className={styles.workspaceContext}>
                    {workspaceSubtitle}
                  </span>
                </div>

                <h1>{title}</h1>
                <p>{description}</p>
              </div>

              <div className={styles.headerActions}>
                {headerActions}

                {publicPath && publicLabel ? (
                  <Link
                    className={styles.primaryHeaderLink}
                    to={publicPath}
                  >
                    {publicLabel}
                    <ExternalLink
                      size={16}
                      aria-hidden="true"
                    />
                  </Link>
                ) : null}
              </div>
            </header>

            <div className={styles.content}>
              {children}
            </div>
          </main>
        </div>
      </div>

      <AuthenticatedFooter />

      {isMobileMenuOpen ? (
        <AdminMobileDrawer
          workspaceTitle={workspaceTitle}
          navItems={navItems}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onClose={() => setIsMobileMenuOpen(false)}
          publicPath={publicPath}
          publicLabel={publicLabel}
        />
      ) : null}

      <AdminMobileBottomNav
        navItems={navItems}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMenuOpen={isMobileMenuOpen}
        onToggleMenu={() =>
          setIsMobileMenuOpen(
            (currentValue) => !currentValue,
          )
        }
      />
    </div>
  );
}

export function WorkspaceStatGrid({
  stats,
  loading = false,
}: {
  stats: WorkspaceStat[];
  loading?: boolean;
}) {
  return (
    <section className={styles.statsGrid}>
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <article
            className={styles.statCard}
            key={stat.label}
          >
            <div>
              <span>{stat.label}</span>
              <strong>
                {loading ? "…" : stat.value}
              </strong>
              <small>{stat.detail}</small>
            </div>

            <Icon
              size={29}
              strokeWidth={2.1}
              aria-hidden="true"
            />
          </article>
        );
      })}
    </section>
  );
}

export function WorkspacePanel({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <header className={styles.panelHeader}>
        <div>
          {eyebrow ? <span>{eyebrow}</span> : null}
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>

        {actions ? (
          <div className={styles.panelActions}>
            {actions}
          </div>
        ) : null}
      </header>

      {children}
    </section>
  );
}

export function WorkspaceLoading({
  label = "Loading workspace data…",
}: {
  label?: string;
}) {
  return (
    <div className={styles.stateCard}>
      <div className={styles.loader} />
      <strong>{label}</strong>
      <span>
        Live information is being requested from League OS.
      </span>
    </div>
  );
}

export function WorkspaceError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className={`${styles.stateCard} ${styles.errorState}`}
    >
      <strong>
        Workspace data could not be loaded
      </strong>
      <span>{message}</span>

      <button
        type="button"
        className={styles.primaryButton}
        onClick={onRetry}
      >
        Try again
      </button>
    </div>
  );
}

export function WorkspaceEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className={styles.emptyState}>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function WorkspaceStatus({
  value,
}: {
  value: string;
}) {
  const normalized = value.toUpperCase();

  const tone =
    normalized.includes("ACTIVE") ||
    normalized.includes("ACCEPTED") ||
    normalized.includes("VALID") ||
    normalized.includes("COMPLETED")
      ? styles.statusSuccess
      : normalized.includes("DECLINED") ||
          normalized.includes("INVALID") ||
          normalized.includes("CANCELLED") ||
          normalized.includes("FAILED")
        ? styles.statusDanger
        : normalized.includes("POSTPONED") ||
            normalized.includes("PENDING") ||
            normalized.includes("ISSUE")
          ? styles.statusWarning
          : styles.statusInfo;

  return (
    <span
      className={`${styles.statusPill} ${tone}`}
    >
      {formatStatus(value)}
    </span>
  );
}

/* eslint-disable react-refresh/only-export-components */
// The utility functions below are deliberately exported from this file
// for convenience so consuming pages can import everything from one place.

export function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

export function formatWorkspaceDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export {
  AdminSidebar,
  AdminMobileBottomNav,
  AdminMobileDrawer,
  getWorkspaceInitials,
  logout,
} from "./AdminWorkspaceSidebar";
export type {
  AdminSidebarProps,
  AdminMobileBottomNavProps,
  AdminMobileDrawerProps,
  AdminWorkspaceNavItem,
} from "./AdminWorkspaceSidebar";

export { styles as adminWorkspaceStyles };
