import {
  ExternalLink,
  Home,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import logoMark from "../../assets/league-os-mark.svg";
import logoHorizontal from "../../assets/logos/league-os-horizontal.png";
import styles from "./AdminWorkspaceLayout.module.css";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type AdminWorkspaceNavItem<T extends string> = {
  key: T;
  label: string;
  icon: LucideIcon;
};

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
  /** Navigation items rendered as buttons */
  navItems: AdminWorkspaceNavItem<T>[];
  /** Currently active tab key */
  activeTab: T;
  /** Called when a nav item is clicked */
  onTabChange: (tab: T) => void;
  /** Whether the sidebar is collapsed to an icon rail */
  isCollapsed: boolean;
  /** Toggle collapse state */
  onToggleCollapse: () => void;
};

export function AdminSidebar<T extends string>({
  workspaceTitle,
  workspaceSubtitle,
  navItems,
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
}: AdminSidebarProps<T>) {
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeTab;

            return (
              <button
                key={item.key}
                type="button"
                className={
                  isActive ? styles.activeNavButton : styles.navButton
                }
                onClick={() => onTabChange(item.key)}
                aria-label={item.label}
                title={item.label}
              >
                <Icon size={20} strokeWidth={2.15} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
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
};

export function AdminMobileBottomNav<T extends string>({
  navItems,
  activeTab,
  onTabChange,
  isMenuOpen,
  onToggleMenu,
}: AdminMobileBottomNavProps<T>) {
  const primaryItems = navItems.slice(0, 4);

  return (
    <nav
      className={styles.mobileNav}
      aria-label="Mobile admin workspace navigation"
    >
      {primaryItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.key === activeTab;

        return (
          <button
            key={item.key}
            type="button"
            className={
              isActive
                ? `${styles.mobileNavButton} ${styles.activeMobileNavButton}`
                : styles.mobileNavButton
            }
            onClick={() => onTabChange(item.key)}
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
  navItems: AdminWorkspaceNavItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  onClose: () => void;
  publicPath?: string;
  publicLabel?: string;
};

export function AdminMobileDrawer<T extends string>({
  workspaceTitle,
  navItems,
  activeTab,
  onTabChange,
  onClose,
  publicPath,
  publicLabel,
}: AdminMobileDrawerProps<T>) {
  function handleTabChange(tab: T) {
    onTabChange(tab);
    onClose();
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
          <section className={styles.drawerSection}>
            <h2>Workspace sections</h2>

            <div className={styles.drawerLinks}>
              {navItems.map((item) => {
                const Icon = item.icon;
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
              })}
            </div>
          </section>

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