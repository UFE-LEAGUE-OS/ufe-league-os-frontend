import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Search, Menu, ChevronLeft, ChevronDown, LogOut, Edit3 } from "lucide-react";
import logo from "../assets/logo.png";
import profile from "../assets/kcca.png";
import "./TopBar.css";

type Props = {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
};

export default function SuperAdminTopBar({
  sidebarOpen = false,
  onToggleSidebar = () => {},
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="topbar-icon-btn"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Open sidebar"}
          onClick={onToggleSidebar}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
        </button>
        <div className="topbar-logo">
          <img src={logo} alt="League OS" />
        </div>
      </div>

      <div className="topbar-center">
        <div className="topbar-search">
          <Search size={16} />
          <input type="search" placeholder="Search users, reports, alerts..." />
        </div>
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="topbar-badge">3</span>
        </button>

        <span className="topbar-divider" aria-hidden="true" />

        <div className="topbar-profile" ref={dropdownRef}>
          <button
            type="button"
            className="topbar-profile-btn"
            onClick={() => setMenuOpen((current) => !current)}
          >
            <img src={profile} alt="Merab Apio" />
            <div className="topbar-profile-meta">
              <span>Merab Apio</span>
              <small>Super Admin</small>
            </div>
            <ChevronDown size={16} />
          </button>

          {menuOpen && (
            <div className="topbar-profile-menu">
              <Link to="/super-admin/profile" className="topbar-profile-menu-item">
                <Edit3 size={16} />
                Edit profile
              </Link>
              <button type="button" className="topbar-profile-menu-item" onClick={() => window.location.assign("/login") }>
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}