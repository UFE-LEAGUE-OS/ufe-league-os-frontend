import {
  LayoutDashboard,
  Users,
  Layers3,
  ShieldCheck,
  Wallet,
  Settings,
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: any;
  
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard},
  { id: "users", label: "User Management", icon: Users },
  { id: "platform", label: "Platform", icon: Layers3},
  { id: "governance", label: "Governance", icon: ShieldCheck },
  { id: "finance", label: "Finance", icon: Wallet},
  { id: "settings", label: "Settings", icon: Settings },
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

          return (
            <a
              key={item.id}
              className={activeNav === item.id ? "active" : ""}
              onClick={() => onChange(item.id)}
            >
              
              <Icon size={19} />
              <span className="nav-label">{item.label}</span>
            </a>
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