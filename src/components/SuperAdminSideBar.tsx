import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Layers3,
  ShieldCheck,
  Wallet,
  Settings,
  Handshake,
  Plus,
  Minus,
  Trophy,
  ListChecks,
  BookOpen,
  Send,
  ClipboardList,
  Route,
  CheckSquare,
  RotateCcw,
  FileSearch,
  AlertTriangle,
  Users2,
  ArrowLeftRight,
  UserCheck,
  History,
  MonitorSmartphone,
  UserSearch,
  UserCog,
  Shield,
  FileEdit,
  Gamepad2,
  Eye,
  LayoutPanelTop,
  BadgeDollarSign,
  BarChart3,
  Package,
 
  ClipboardCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./SuperAdminSideBar.css";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  children?: {
    id: string;
    label: string;
    path: string;
    icon: LucideIcon;
  }[];
};

const NAV_ITEMS: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/super-admin"
  },
  {
    id: "users",
    label: "User Management",
    icon: Users,
    path: "/super-admin/users-management",
    children: [
    { id: "um-users",       label: "Manage Users",       path: "/super-admin/users-management", icon: UserCog },
    { id: "um-roles",       label: "Role Templates",     path: "/super-admin/role-templates",    icon: Shield },
    { id: "um-permissions", label: "Permission Bundles", path: "/super-admin/permissions",        icon: Users2 },
    { id: "um-crossrole",   label: "Cross-Role Access",  path: "/super-admin/cross-role",          icon: ArrowLeftRight },
    { id: "um-assignment",  label: "Role Assignment",    path: "/super-admin/role-assignment",     icon: UserCheck },
    { id: "um-audit",       label: "Audit Log",          path: "/super-admin/audit-log",           icon: History },
    { id: "um-sessions",    label: "Session Management", path: "/super-admin/sessions",            icon: MonitorSmartphone },
    { id: "um-impersonate", label: "Impersonate User",   path: "/super-admin/impersonate",         icon: UserSearch },
  ],
  },
  {
    id: "platform",
    label: "Platform",
    icon: Layers3,
    path: "/super-admin/platform"
  },
  {
    id: "governance",
    label: "Governance",
    icon: ShieldCheck,
    path: "/super-admin/governance",
    children: [
      { id: "sports", label: "Sports Variants", path: "/super-admin/sports-variants", icon:Trophy},
      { id: "competitions", label: "Competitions", path: "/super-admin/competition-formats", icon: ListChecks },
      { id: "rules", label: "Rules & Standards", path: "/super-admin/rules", icon: BookOpen },
      { id: "publish", label: "Publish Queue", path: "/super-admin/publish-standards", icon: Send },
      { id: "fantasy-config", label: "Fantasy Module Config", path: "/super-admin/fantasy-config", icon: Gamepad2 },
    ],
  },
  {
    id: "finance",
    label: "Finance & Security",
    icon: Wallet,
    path: "/super-admin/finance",
    children: [
      { id: "payments-audit", label: "Payments Audit", path: "/super-admin/payments-audit", icon: ClipboardList },
      { id: "transaction-trail", label: "Transaction Trail", path: "/super-admin/transaction-trail", icon: Route },
      { id: "approvals-queue", label: "Approvals Queue", path: "/super-admin/approvals-queue", icon: CheckSquare },
      { id: "chargebacks-refunds", label: "Chargebacks & Refunds", path: "/super-admin/chargebacks-refunds", icon: RotateCcw },
      { id: "data-access-log", label: "Data Access Log", path: "/super-admin/data-access-log", icon: FileSearch },
      { id: "security-events", label: "Security Events", path: "/super-admin/security-events", icon: AlertTriangle },
    ],
  },
  {
    id: "content-platform",
    label: "Content & Platform",
    icon: FileEdit,
    path: "/super-admin/content-platform",
    children: [
      { id: "public-content", label: "Public Content", path: "/super-admin/public-content", icon: FileEdit },
      { id: "announcements-banners", label: "Announcements & Banners", path: "/super-admin/announcements-banners", icon: Send },
      { id: "notification-templates", label: "Notification Templates", path: "/super-admin/notification-templates", icon: ClipboardList },
      { id: "broadcasts", label: "Broadcasts", path: "/super-admin/broadcasts", icon: Route },
      { id: "support-settings", label: "Support Settings", path: "/super-admin/support-settings", icon: Settings },
      { id: "help-center", label: "Help Center", path: "/super-admin/help-center", icon: BookOpen },
      { id: "feature-flags", label: "Feature Flags", path: "/super-admin/feature-flags", icon: CheckSquare },
      { id: "system-messages", label: "System Messages", path: "/super-admin/system-messages", icon: AlertTriangle },
      { id: "bulk-operations", label: "Bulk Operations", path: "/super-admin/bulk-operations", icon: RotateCcw },
    ],
  },
  {
    id: "sponsor",
    label: "Sponsorship Management",
    icon: Handshake,
    path: "/super-admin/sponsor-management",

  children: [
  { id: "sm-frameworks", label: "Sponsor Frameworks", path: "/super-admin/frameworks", icon: Layers3 },
{ id: "sm-visibility", label: "Campaign Visibility", path: "/super-admin/visibility", icon: Eye },
{ id: "sm-placements", label: "Placements Manager", path: "/super-admin/placements", icon: LayoutPanelTop },
{ id: "sm-benefits", label: "Benefit Sharing", path: "/super-admin/benefit-sharing", icon: BadgeDollarSign },
{ id: "sm-inventory", label: "Sponsorship Inventory", path: "/super-admin/inventory", icon: Package },
{ id: "sm-performance", label: "Campaign Performance", path: "/super-admin/performance", icon: BarChart3 },
{ id: "sm-approvals", label: "Approvals Workflow", path: "/super-admin/approvals", icon: ClipboardCheck},
{ id: "sm-audits", label: "Compliance & Audit Logs", path: "/super-admin/audits", icon: ClipboardList },
 
],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    path: "/super-admin/settings"
  },
];

type Props = {
  collapsed: boolean;
};

export default function Sidebar({ collapsed }: Props) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const activeParent = NAV_ITEMS.find((item) =>
      item.children?.some((child) => location.pathname === child.path)
    );
    setOpenMenu(activeParent ? activeParent.id : null);
  }, [location.pathname]);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <nav>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isOpen = openMenu === item.id;

          // If item has children (Governance, Finance & Security)
          if (item.children) {
            const isChildActive = item.children.some(
              (child) => location.pathname === child.path
            );

            return (
              <div key={item.id} className="nav-group">
                {/* Parent still NavLink (same style as others) */}
                <NavLink
                  to={item.path}
                  className={() =>
                    isChildActive ? "active" : ""
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenMenu((prev) => (prev === item.id ? null : item.id));
                  }}
                >
                  <Icon size={19} />
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-toggle-icon">
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </NavLink>

                {/* Children */}
                {isOpen && (
                  <div className="nav-children">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <NavLink
                          key={child.id}
                          to={child.path}
                          className={({ isActive }) =>
                            isActive ? "active sub-link" : "sub-link"
                          }
                        >
                          <ChildIcon size={16} />
                          <span className="nav-label">{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Normal items (unchanged style)
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.id === "dashboard"}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon size={19} />
              <span className="nav-label">{item.label}</span>
            </NavLink>
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
