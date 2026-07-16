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
import { Link } from "react-router-dom";

import logoMark from "../../assets/league-os-mark.svg";
import logoHorizontal from "../../assets/logos/league-os-horizontal.png";
import styles from "./AdminWorkspaceLayout.module.css";

/* eslint-disable react-refresh/only-export-components */
// This file deliberately exports utility functions alongside components
// so consumers can import everything they need from one place.

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

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

export type NavItemsProp<T extends string> =
  | AdminWorkspaceNavItem<T>[]
  | AdminWorkspaceNavGroup<T>[];

function isGroupedNavItems<T extends string>(
  navItems: NavItemsProp<T>,
): navItems is AdminWorkspaceNavGroup<T>[] {
  return navItems.length > 0 && "items" in navItems[0];
}

export function flattenNavItems<T extends string>(
  navItems: NavItemsProp<T>,
): AdminWorkspaceNavItem<T>[] {
  return isGroupedNavItems(navItems)
    ? navItems.flatMap((group) => group.items)
    : navItems;
}

export function asNavGroups<T extends string>(
  navItems: NavItemsProp<T>,
): AdminWorkspaceNavGroup<T>[] {
  return isGroupedNavItems(navItems)
    ? navItems
    : [{ label: "", items: navItems }];
}

export function findOwningParent<T extends string>(
  items: AdminWorkspaceNavItem<T>[],
  tab: T,
): AdminWorkspaceNavItem<T> | undefined {
  return items.find((item) =>
    item.children?.some((child) => child.key === tab),
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function logout() {
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

export function getWorkspaceInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 4)
    .toUpperCase();

  return initials || "LOS";
}

// ---------------------------------------------------------------------------
// Desktop sidebar (visible on screens wider than 980 px)
// ---------------------------------------------------------------------------

export type AdminSidebarProps<T extends string> = {
  /** Displayed in the workspace badge */
  workspaceTitle: string;
  /** Subtitle shown below the workspace name */
  workspaceSubtitle: string;
  /** Navigation groups rendered as section headers + buttons */
  navGroups: AdminWorkspaceNavGroup<T>[];
  /** Currently active tab key */
  activeTab: T;
  /** Called when a nav item (with no children) is clicked */
  onTabChange: (tab: T) => void;
  /** Which parent items are currently expanded, showing their children */
  expandedKeys: Set<T>;
  /** Called when a parent item with children is clicked, to expand/collapse it */
  onToggleExpand: (item: AdminWorkspaceNavItem<T>) => void;
  /** Whether the sidebar is collapsed to an icon rail */
  isCollapsed: boolean;
  /** Toggle collapse state */
  onToggleCollapse: () => void;
};

export function AdminSidebar<T extends string>({
  workspaceTitle,
  workspaceSubtitle,
  navGroups,
  activeTab,
  onTabChange,
  expandedKeys,
  onToggleExpand,
  isCollapsed,
  onToggleCollapse,
}: AdminSidebarProps<T>) {
  function renderNavItem(item: AdminWorkspaceNavItem<T>) {
    const Icon = item.icon;
    const hasChildren = Boolean(item.children?.length);

    if (!hasChildren) {
      const isActive = item.key === activeTab;

      return (
        <button
          key={item.key}
          type="button"
          className={isActive ? styles.activeNavButton : styles.navButton}
          onClick={() => onTabChange(item.key)}
          aria-label={item.label}
          title={item.label}
        >
          <Icon size={20} strokeWidth={2.15} aria-hidden="true" />
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
          className={hasActiveChild ? styles.activeNavButton : styles.navButton}
          onClick={() => onToggleExpand(item)}
          aria-expanded={isExpanded}
          aria-label={item.label}
          title={item.label}
        >
          <Icon size={20} strokeWidth={2.15} aria-hidden="true" />
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
                  onClick={() => onTabChange(child.key)}
                >
                  <ChildIcon size={15} strokeWidth={2.1} aria-hidden="true" />
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
    <>
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

        <span className={styles.portalLabel}>ADMIN WORKSPACE</span>

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
          <Home size={19} strokeWidth={2.2} aria-hidden="true" />
          <span>Fan Dashboard</span>
        </Link>

        <nav
          className={styles.nav}
          aria-label={`${workspaceTitle} navigation`}
        >
          {navGroups.map((group, groupIndex) => (
            <div key={group.label || `group-${groupIndex}`}>
              {group.label ? (
                <span className={styles.navGroupLabel}>{group.label}</span>
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
          <LogOut size={19} strokeWidth={2.2} aria-hidden="true" />
          <span>Log out</span>
        </button>
      </aside>

      <button
        type="button"
        className={styles.sidebarToggle}
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
        title={isCollapsed ? "Expand admin sidebar" : "Collapse admin sidebar"}
      >
        {isCollapsed ? (
          <PanelLeftOpen size={19} strokeWidth={2.4} aria-hidden="true" />
        ) : (
          <PanelLeftClose size={19} strokeWidth={2.4} aria-hidden="true" />
        )}
      </button>
    </>
  );
}

// ---------------------------------------------------------------------------
// Mobile bottom navigation (visible on screens up to 980 px)
// ---------------------------------------------------------------------------

export type AdminMobileBottomNavProps<T extends string> = {
  navItems: AdminWorkspaceNavItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  /** Explicitly opens the drawer — used when a primary item with
   * children is tapped, since there's no room for a submenu here. */
  onOpenMenu: () => void;
};

export function AdminMobileBottomNav<T extends string>({
  navItems,
  activeTab,
  onTabChange,
  isMenuOpen,
  onToggleMenu,
  onOpenMenu,
}: AdminMobileBottomNavProps<T>) {
  const primaryItems = navItems.slice(0, 4);

  return (
    <nav
      className={styles.mobileNav}
      aria-label="Mobile admin workspace navigation"
    >
      {primaryItems.map((item) => {
        const Icon = item.icon;
        const hasChildren = Boolean(item.children?.length);
        const isActive =
          item.key === activeTab ||
          (item.children?.some((child) => child.key === activeTab) ?? false);

        return (
          <button
            key={item.key}
            type="button"
            className={
              isActive
                ? `${styles.mobileNavButton} ${styles.activeMobileNavButton}`
                : styles.mobileNavButton
            }
            onClick={() => (hasChildren ? onOpenMenu() : onTabChange(item.key))}
            aria-label={item.label}
          >
            <Icon size={20} strokeWidth={2.3} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}

      <button
        type="button"
        className={
          isMenuOpen
            ? `${styles.mobileNavButton} ${styles.activeMobileNavButton}`
            : styles.mobileNavButton
        }
        onClick={onToggleMenu}
        aria-label="Open more navigation"
        aria-expanded={isMenuOpen}
      >
        <Menu size={20} strokeWidth={2.3} aria-hidden="true" />
        <span>More</span>
      </button>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Mobile drawer overlay
// ---------------------------------------------------------------------------

export type AdminMobileDrawerProps<T extends string> = {
  workspaceTitle: string;
  navGroups: AdminWorkspaceNavGroup<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  expandedKeys: Set<T>;
  onToggleExpand: (item: AdminWorkspaceNavItem<T>) => void;
  onClose: () => void;
  publicPath?: string;
  publicLabel?: string;
};

export function AdminMobileDrawer<T extends string>({
  workspaceTitle,
  navGroups,
  activeTab,
  onTabChange,
  expandedKeys,
  onToggleExpand,
  onClose,
  publicPath,
  publicLabel,
}: AdminMobileDrawerProps<T>) {
  function handleTabChange(tab: T) {
    onTabChange(tab);
    onClose();
  }

  function renderDrawerNavItem(item: AdminWorkspaceNavItem<T>) {
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
          <Icon size={19} strokeWidth={2.2} aria-hidden="true" />
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
          onClick={() => onToggleExpand(item)}
          aria-expanded={isExpanded}
          style={{ width: "100%" }}
        >
          <Icon size={19} strokeWidth={2.2} aria-hidden="true" />
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
                  <ChildIcon size={16} strokeWidth={2.1} aria-hidden="true" />
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
    <>
      <button
        type="button"
        className={styles.backdrop}
        aria-label="Close workspace menu"
        onClick={onClose}
      />

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
            onClick={onClose}
          >
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </header>

        <div className={styles.drawerContent}>
          {navGroups.map((group, groupIndex) => (
            <section
              className={styles.drawerSection}
              key={group.label || `drawer-group-${groupIndex}`}
            >
              <h2>{group.label || "Workspace sections"}</h2>

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
                onClick={onClose}
              >
                <Home size={19} strokeWidth={2.2} aria-hidden="true" />
                Back to Fan Dashboard
              </Link>

              {publicPath && publicLabel ? (
                <Link
                  to={publicPath}
                  className={styles.drawerLink}
                  onClick={onClose}
                >
                  <ExternalLink size={19} strokeWidth={2.2} aria-hidden="true" />
                  {publicLabel}
                </Link>
              ) : null}

              <button type="button" className={styles.drawerLogout} onClick={logout}>
                <LogOut size={19} strokeWidth={2.2} aria-hidden="true" />
                Log out
              </button>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
