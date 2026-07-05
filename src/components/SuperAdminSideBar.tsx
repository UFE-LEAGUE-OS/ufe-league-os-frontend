import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Layers3,
  ShieldCheck,
  Wallet,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  expandable?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "User Management", icon: Users },
  { id: "platform", label: "Platform", icon: Layers3 },
  { id: "governance", label: "Governance", icon: ShieldCheck },
  { id: "finance", label: "Finance & Security", icon: Wallet, expandable: true },
  { id: "settings", label: "Settings", icon: Settings },
];

const FINANCE_LINKS = [
  { label: "Payments audit overview", to: "/super-admin/payments-audit" },
  { label: "Transaction trail viewer", to: "/super-admin/transaction-trail" },
  { label: "Approvals monitor queue", to: "/super-admin/approvals-queue" },
  { label: "Chargebacks & refunds", to: "/super-admin/chargebacks-refunds" },
  { label: "Data access audit log", to: "/super-admin/data-access-log" },
  { label: "Security events & alerts", to: "/super-admin/security-events" },
];

type Props = {
  collapsed: boolean;
  activeNav: string;
  onChange: (id: string) => void;
};

export default function Sidebar({ collapsed, activeNav, onChange }: Props) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <nav>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          const dashboardLink = item.id === "dashboard" ? "/super-admin/dashboard" : undefined;

          return (
            <div key={item.id}>
              {dashboardLink ? (
                <Link
                  to={dashboardLink}
                  className={`sidebar-button ${isActive ? "active" : ""}`}
                  onClick={() => onChange(item.id)}
                >
                  <Icon size={19} />
                  <span className="nav-label">{item.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  className={`sidebar-button ${isActive ? "active" : ""}`}
                  onClick={() => onChange(item.id)}
                >
                  <Icon size={19} />
                  <span className="nav-label">{item.label}</span>
                  {item.expandable && !collapsed && (
                    <span className="expand-indicator">{isActive ? "−" : "+"}</span>
                  )}
                </button>
              )}

              {item.id === "finance" && isActive && !collapsed && (
                <div className="sidebar-sublinks">
                  {FINANCE_LINKS.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`}
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-card">
          <span className="dot-live" />
          <div>
            <strong>Live season</strong>
            <p>2026 Premier Div.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}