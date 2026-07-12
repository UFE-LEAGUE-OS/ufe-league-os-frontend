import {
  ExternalLink,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import {
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";

import logoHorizontal from "../../assets/logos/league-os-horizontal.png";
import styles from "./AdminWorkspaceLayout.module.css";

export type AdminWorkspaceNavItem<T extends string> = {
  key: T;
  label: string;
  icon: LucideIcon;
};

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

function logout() {
  [
    "league_os_access_token",
    "league_os_refresh_token",
    "league_os_user",
    "accessToken",
    "refreshToken",
  ].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  window.location.assign("/login");
}

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
  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.brand}>
          <img src={logoHorizontal} alt="League OS" />
        </Link>

        <div className={styles.workspaceBadge}>
          <span>
            {workspaceTitle
              .split(/\s+/)
              .map((part) => part.charAt(0))
              .join("")
              .slice(0, 4)
              .toUpperCase()}
          </span>

          <div>
            <strong>{workspaceTitle}</strong>
            <small>{workspaceSubtitle}</small>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeTab;

            return (
              <button
                key={item.key}
                type="button"
                className={
                  isActive
                    ? styles.activeNavButton
                    : styles.navButton
                }
                onClick={() => onTabChange(item.key)}
              >
                <Icon size={19} strokeWidth={2.2} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          className={styles.logout}
          type="button"
          onClick={logout}
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </aside>

      <main className={styles.main}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <span>{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          <div className={styles.headerActions}>
            {headerActions}

            {publicPath && publicLabel ? (
              <Link
                className={styles.publicLink}
                to={publicPath}
              >
                {publicLabel}
                <ExternalLink size={16} />
              </Link>
            ) : null}
          </div>
        </header>

        <div className={styles.mobileNav}>
          <label htmlFor="workspace-section">
            Dashboard section
          </label>

          <select
            id="workspace-section"
            value={activeTab}
            onChange={(event) =>
              onTabChange(event.target.value as T)
            }
          >
            {navItems.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.content}>{children}</div>
      </main>
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
          <article className={styles.statCard} key={stat.label}>
            <div>
              <span>{stat.label}</span>
              <strong>{loading ? "…" : stat.value}</strong>
              <small>{stat.detail}</small>
            </div>

            <Icon size={29} strokeWidth={2.1} />
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
    <div className={`${styles.stateCard} ${styles.errorState}`}>
      <strong>Workspace data could not be loaded</strong>
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
    <span className={`${styles.statusPill} ${tone}`}>
      {formatStatus(value)}
    </span>
  );
}

export function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1),
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

export { styles as adminWorkspaceStyles };
