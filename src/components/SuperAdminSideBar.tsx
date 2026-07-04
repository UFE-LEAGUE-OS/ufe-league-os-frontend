import {
  LayoutDashboard,
  Users,
  Layers3,
  ShieldCheck,
  Wallet,
  Settings,

} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
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
    path: "/super-admin/users-management"
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
      { id: "sports", label: "Sports Variants", path: "/sports-variants" },
      { id: "competitions", label: "Competitions", path: "/super-admin/governance/competitions" },
      { id: "rules", label: "Rules & Standards", path: "/super-admin/governance/rules-standards" },
      { id: "publish", label: "Publish Queue", path: "/super-admin/governance/publish-queue" },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: Wallet,
    path: "/super-admin/finance"
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
  setOpenMenu(null);
}, [location.pathname]);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      <nav>
  {NAV_ITEMS.map((item) => {
    const Icon = item.icon;
    const isOpen = openMenu === item.id;

    // If item has children (Governance)
    if (item.children) {
      return (

        <div key={item.id} className="nav-group">

          {/* Parent still NavLink (same style as others) */}

          <NavLink
            to={item.path}
            className={({ isActive }) => {
  const isChildActive = item.children?.some(child =>
    location.pathname === child.path
  );

  return isActive || isChildActive
    ? "active"
    : "";
}}
            onClick={(e) => {
  e.preventDefault();
  setOpenMenu(prev =>
    prev === item.id ? null : item.id
  );
}}
          >
            <Icon size={19} />
            <span className="nav-label">{item.label}</span>
          </NavLink>

          {/* Children */}
          {isOpen && (
            <div className="nav-children">
              {item.children.map((child) => (
                <NavLink
                  key={child.id}
                  to={child.path}
                  className={({ isActive }) =>
                    isActive ? "active sub-link" : "sub-link"
                  }
                >
                  <span className="nav-label">{child.label}</span>
                </NavLink>
              ))}
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
        className={({ isActive }) =>
          isActive ? "active" : ""
        }
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