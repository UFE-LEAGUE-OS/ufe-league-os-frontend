import {
  ExternalLink,
  Home,
  LogOut,
  Menu,
  Minus,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import AuthenticatedFooter from "../AuthenticatedFooter/AuthenticatedFooter";
import logoMark from "../../assets/league-os-mark.svg";
import logoHorizontal from "../../assets/logos/league-os-horizontal.png";
import styles from "./AdminWorkspaceLayout.module.css";

export type AdminWorkspaceNavItem<T extends string> = {
  key: T;
  label: string;
  icon: LucideIcon;
  /**
   * Optional sub-pages rendered indented beneath this item once
   * expanded (e.g. "Membership" revealing "Members Directory",
   * "Renewals & Expiry", "Tiers & Pricing", "Requests Queue", "Export
   * Reports" — the same pattern as "User Management" in the
   * super-admin sidebar). When present, the parent item is a
   * toggle — clicking it expands/collapses the group instead of
   * navigating anywhere; only the children carry real tabs.
   */
  children?: AdminWorkspaceNavItem<T>[];
};

// Optional grouping: pass navItems as AdminWorkspaceNavGroup<T>[]
// instead of a flat AdminWorkspaceNavItem<T>[] to render section
// headers (e.g. "OPERATIONS", "GOVERNANCE") above clusters of nav
// buttons, similar to the Fan Dashboard's MAIN / BROWSE / ENGAGE
// sections. Flat arrays still work exactly as before — this is
// backward compatible, nothing existing needs to change unless you
// want grouping.
export type AdminWorkspaceNavGroup<T extends string> = {
  label: string;
  items: AdminWorkspaceNavItem<T>[];
};

type NavItemsProp<T extends string> =
  | AdminWorkspaceNavItem<T>[]
  | AdminWorkspaceNavGroup<T>[];

function isGroupedNavItems<T extends string>(
  navItems: NavItemsProp<T>,
): navItems is AdminWorkspaceNavGroup<T>[] {
  return (
    navItems.length > 0 &&
    "items" in navItems[0]
  );
}

function flattenNavItems<T extends string>(
  navItems: NavItemsProp<T>,
): AdminWorkspaceNavItem<T>[] {
  return isGroupedNavItems(navItems)
    ? navItems.flatMap((group) => group.items)
    : navItems;
}

function asGroups<T extends string>(
  navItems: NavItemsProp<T>,
): AdminWorkspaceNavGroup<T>[] {
  return isGroupedNavItems(navItems)
    ? navItems
    : [{ label: "", items: navItems }];
}

function findOwningParent<T extends string>(
  items: AdminWorkspaceNavItem<T>[],
  tab: T,
): AdminWorkspaceNavItem<T> | undefined {
  return items.find((item) =>
    item.children?.some((child) => child.key === tab),
  );
}

type LayoutProps<T extends string> = {
  workspaceTitle: string;
  workspaceSubtitle: string;
  eyebrow: string;
  title: string;
  description: string;
  navItems: NavItemsProp<T>;
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

function getWorkspaceInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 4)
    .toUpperCase();

  return initials || "LOS";
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const [expandedKeys, setExpandedKeys] = useState<
    Set<T>
  >(() => new Set());

  const flatNavItems = useMemo(
    () => flattenNavItems(navItems),
    [navItems],
  );

  const navGroups = useMemo(
    () => asGroups(navItems),
    [navItems],
  );

  const mobilePrimaryItems = useMemo(
    () => flatNavItems.slice(0, 4),
    [flatNavItems],
  );

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  // Whichever group contains the active tab stays expanded — e.g.
  // landing directly on a Membership sub-page keeps Membership open
  // instead of showing the active page nowhere in a collapsed list.
  useEffect(() => {
    const owningParent = findOwningParent(
      flatNavItems,
      activeTab,
    );

    if (owningParent) {
      setExpandedKeys((current) => {
        if (current.has(owningParent.key)) return current;
        const next = new Set(current);
        next.add(owningParent.key);
        return next;
      });
    }
  }, [activeTab, flatNavItems]);

  function handleTabChange(tab: T) {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  }

  function toggleExpanded(item: AdminWorkspaceNavItem<T>) {
    setExpandedKeys((current) => {
      const next = new Set(current);

      if (next.has(item.key)) {
        next.delete(item.key);
      } else {
        next.add(item.key);
      }

      return next;
    });
  }

  function renderNavItem(item: AdminWorkspaceNavItem<T>) {
    const Icon = item.icon;
    const hasChildren = Boolean(item.children?.length);

    if (!hasChildren) {
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
          onClick={() => handleTabChange(item.key)}
          aria-label={item.label}
          title={item.label}
        >
          <Icon
            size={20}
            strokeWidth={2.15}
            aria-hidden="true"
          />
          <span>{item.label}</span>
        </button>
      );
    }

    const isExpanded = expandedKeys.has(item.key);
    const hasActiveChild = item.children!.some(
      (child) => child.key === activeTab,
    );

    return (
      <div key={item.key}>
        <button
          type="button"
          className={
            hasActiveChild
              ? styles.activeNavButton
              : styles.navButton
          }
          onClick={() => toggleExpanded(item)}
          aria-expanded={isExpanded}
          aria-label={item.label}
          title={item.label}
        >
          <Icon
            size={20}
            strokeWidth={2.15}
            aria-hidden="true"
          />
          <span>{item.label}</span>

          {isExpanded ? (
            <Minus
              size={14}
              strokeWidth={2.6}
              className={styles.navToggleIcon}
              aria-hidden="true"
            />
          ) : (
            <Plus
              size={14}
              strokeWidth={2.6}
              className={styles.navToggleIcon}
              aria-hidden="true"
            />
          )}
        </button>

        {isExpanded ? (
          <div className={styles.navChildren}>
            {item.children!.map((child) => {
              const ChildIcon = child.icon;
              const isChildActive = child.key === activeTab;

              return (
                <button
                  key={child.key}
                  type="button"
                  className={
                    isChildActive
                      ? styles.activeNavChildButton
                      : styles.navChildButton
                  }
                  onClick={() => handleTabChange(child.key)}
                >
                  <ChildIcon
                    size={15}
                    strokeWidth={2.1}
                    aria-hidden="true"
                  />
                  <span>{child.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  function renderDrawerNavItem(
    item: AdminWorkspaceNavItem<T>,
  ) {
    const Icon = item.icon;
    const hasChildren = Boolean(item.children?.length);

    if (!hasChildren) {
      const isActive = item.key === activeTab;

      return (
        <button
          key={item.key}
          type="button"
          className={
            isActive
              ? `${styles.drawerButton} ${styles.activeDrawerButton}`
              : styles.drawerButton
          }
          onClick={() => handleTabChange(item.key)}
        >
          <Icon
            size={19}
            strokeWidth={2.2}
            aria-hidden="true"
          />
          <span>{item.label}</span>
        </button>
      );
    }

    const isExpanded = expandedKeys.has(item.key);
    const hasActiveChild = item.children!.some(
      (child) => child.key === activeTab,
    );

    return (
      <div key={item.key} style={{ gridColumn: "1 / -1" }}>
        <button
          type="button"
          className={
            hasActiveChild
              ? `${styles.drawerButton} ${styles.activeDrawerButton}`
              : styles.drawerButton
          }
          onClick={() => toggleExpanded(item)}
          aria-expanded={isExpanded}
          style={{ width: "100%" }}
        >
          <Icon
            size={19}
            strokeWidth={2.2}
            aria-hidden="true"
          />
          <span>{item.label}</span>

          {isExpanded ? (
            <Minus
              size={14}
              strokeWidth={2.6}
              className={styles.navToggleIcon}
              aria-hidden="true"
            />
          ) : (
            <Plus
              size={14}
              strokeWidth={2.6}
              className={styles.navToggleIcon}
              aria-hidden="true"
            />
          )}
        </button>

        {isExpanded ? (
          <div className={styles.drawerChildren}>
            {item.children!.map((child) => {
              const ChildIcon = child.icon;
              const isChildActive = child.key === activeTab;

              return (
                <button
                  key={child.key}
                  type="button"
                  className={
                    isChildActive
                      ? styles.activeDrawerChildButton
                      : styles.drawerChildButton
                  }
                  onClick={() => handleTabChange(child.key)}
                >
                  <ChildIcon
                    size={16}
                    strokeWidth={2.1}
                    aria-hidden="true"
                  />
                  <span>{child.label}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
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
        {/*
          Pinned via `position: fixed` in the CSS module — deliberately
          no inline `style` prop here. An inline style would win over
          the CSS module class on the properties it sets, so adding a
          `position`/`top` override here would silently undo that fix.
        */}
        <aside className={styles.sidebar}>
          <Link
            to="/dashboard/fan"
            className={styles.brand}
            aria-label="Open Fan Dashboard"
          >
            <img
              className={styles.logoHorizontal}
              src={logoHorizontal}
              alt="League OS"
            />

            <img
              className={styles.logoMark}
              src={logoMark}
              alt=""
              aria-hidden="true"
            />
          </Link>

          <span className={styles.portalLabel}>
            ADMIN WORKSPACE
          </span>

          <div className={styles.workspaceBadge}>
            <span className={styles.workspaceAvatar}>
              {getWorkspaceInitials(workspaceTitle)}
            </span>

            <div className={styles.workspaceDetails}>
              <strong>{workspaceTitle}</strong>
              <small>{workspaceSubtitle}</small>
            </div>
          </div>

          <Link
            to="/dashboard/fan"
            className={styles.workspaceSwitchLink}
            title="Back to Fan Dashboard"
          >
            <Home
              size={19}
              strokeWidth={2.2}
              aria-hidden="true"
            />
            <span>Fan Dashboard</span>
          </Link>

          <nav
            className={styles.nav}
            aria-label={`${workspaceTitle} navigation`}
          >
            {navGroups.map((group, groupIndex) => (
              <div key={group.label || `group-${groupIndex}`}>
                {group.label ? (
                  <span className={styles.navGroupLabel}>
                    {group.label}
                  </span>
                ) : null}

                {group.items.map(renderNavItem)}
              </div>
            ))}
          </nav>

          <button
            className={styles.logout}
            type="button"
            onClick={logout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut
              size={19}
              strokeWidth={2.2}
              aria-hidden="true"
            />
            <span>Log out</span>
          </button>
        </aside>

        <button
          type="button"
          className={styles.sidebarToggle}
          onClick={() =>
            setIsSidebarCollapsed(
              (currentValue) => !currentValue,
            )
          }
          aria-label={
            isSidebarCollapsed
              ? "Expand admin sidebar"
              : "Collapse admin sidebar"
          }
          title={
            isSidebarCollapsed
              ? "Expand admin sidebar"
              : "Collapse admin sidebar"
          }
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen
              size={19}
              strokeWidth={2.4}
              aria-hidden="true"
            />
          ) : (
            <PanelLeftClose
              size={19}
              strokeWidth={2.4}
              aria-hidden="true"
            />
          )}
        </button>

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

                <Link
                  className={styles.secondaryHeaderLink}
                  to="/dashboard/fan"
                >
                  <Home size={16} aria-hidden="true" />
                  Back to Fan Dashboard
                </Link>
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
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close workspace menu"
          onClick={() =>
            setIsMobileMenuOpen(false)
          }
        />
      ) : null}

      {isMobileMenuOpen ? (
        <aside
          className={`${styles.drawer} ${styles.drawerOpen}`}
          aria-label="Admin workspace menu"
        >
          <header className={styles.drawerHeader}>
            <div>
              <span>{workspaceTitle}</span>
              <strong>Workspace Menu</strong>
            </div>

            <button
              type="button"
              aria-label="Close workspace menu"
              onClick={() =>
                setIsMobileMenuOpen(false)
              }
            >
              <X
                size={20}
                strokeWidth={2.4}
                aria-hidden="true"
              />
            </button>
          </header>

          <div className={styles.drawerContent}>
            {navGroups.map((group, groupIndex) => (
              <section
                className={styles.drawerSection}
                key={group.label || `drawer-group-${groupIndex}`}
              >
                <h2>
                  {group.label || "Workspace sections"}
                </h2>

                <div className={styles.drawerLinks}>
                  {group.items.map(renderDrawerNavItem)}
                </div>
              </section>
            ))}

            <section className={styles.drawerSection}>
              <h2>Quick links</h2>

              <div className={styles.drawerLinks}>
                <Link
                  to="/dashboard/fan"
                  className={styles.drawerLink}
                  onClick={() =>
                    setIsMobileMenuOpen(false)
                  }
                >
                  <Home
                    size={19}
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                  Back to Fan Dashboard
                </Link>

                {publicPath && publicLabel ? (
                  <Link
                    to={publicPath}
                    className={styles.drawerLink}
                    onClick={() =>
                      setIsMobileMenuOpen(false)
                    }
                  >
                    <ExternalLink
                      size={19}
                      strokeWidth={2.2}
                      aria-hidden="true"
                    />
                    {publicLabel}
                  </Link>
                ) : null}

                <button
                  type="button"
                  className={styles.drawerLogout}
                  onClick={logout}
                >
                  <LogOut
                    size={19}
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                  Log out
                </button>
              </div>
            </section>
          </div>
        </aside>
      ) : null}

      <nav
        className={styles.mobileNav}
        aria-label="Mobile admin workspace navigation"
      >
        {mobilePrimaryItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.key === activeTab ||
            (item.children?.some(
              (child) => child.key === activeTab,
            ) ??
              false);
          const hasChildren = Boolean(item.children?.length);

          return (
            <button
              key={item.key}
              type="button"
              className={
                isActive
                  ? `${styles.mobileNavButton} ${styles.activeMobileNavButton}`
                  : styles.mobileNavButton
              }
              // No room for a submenu down here — items with children
              // open the drawer, where their sub-pages are listed,
              // rather than guessing which one was meant.
              onClick={() =>
                hasChildren
                  ? setIsMobileMenuOpen(true)
                  : handleTabChange(item.key)
              }
              aria-label={item.label}
            >
              <Icon
                size={20}
                strokeWidth={2.3}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          className={
            isMobileMenuOpen
              ? `${styles.mobileNavButton} ${styles.activeMobileNavButton}`
              : styles.mobileNavButton
          }
          onClick={() =>
            setIsMobileMenuOpen(
              (currentValue) => !currentValue,
            )
          }
          aria-label="Open more navigation"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu
            size={20}
            strokeWidth={2.3}
            aria-hidden="true"
          />
          <span>More</span>
        </button>
      </nav>
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

export { styles as adminWorkspaceStyles };