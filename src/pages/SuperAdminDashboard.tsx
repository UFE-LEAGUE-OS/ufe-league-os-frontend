import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "../styles/pages/SuperAdminDashboard.css";
import "../components/SuperAdminSideBar.css";

import Footer from "../components/Footer";
import SuperAdminTopBar from "../components/SuperAdminTopBar";
import heroImage from "../assets/hero.png";
import Sidebar from "../components/SuperAdminSideBar";

export default function SuperAdminDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeNav, setActiveNav] = useState("dashboard");
    const location = useLocation();

    useEffect(() => {
        const base = "/super-admin";
        const p = location.pathname;

        if (p === base || p === `${base}/` || p === `${base}/dashboard`) {
            setActiveNav("dashboard");
            return;
        }

        if (p.startsWith(`${base}/`)) {
            const seg = p.slice(base.length + 1).split("/")[0];

            const financePaths = new Set([
                "payments-audit",
                "transaction-trail",
                "approvals-queue",
                "chargebacks-refunds",
                "data-access-log",
                "security-events",
            ]);

            if (financePaths.has(seg)) {
                setActiveNav("finance");
                return;
            }

            const map: Record<string, string> = {
                users: "users",
                platform: "platform",
                governance: "governance",
                settings: "settings",
            };

            if (map[seg]) {
                setActiveNav(map[seg]);
                return;
            }
        }

        setActiveNav("");
    }, [location.pathname]);

    const handleNavChange = (id: string) => {
        setActiveNav((current) => (current === id ? "" : id));
    };

    return (
        <div
            className="super-admin"
            style={{
                backgroundImage: `linear-gradient(rgba(15,18,24,.92), rgba(15,18,24,.96)), url(${heroImage})`,
                "--blue": "#38BDF8",
                "--blue-tint": "rgba(56, 189, 248, 0.12)",
            } as React.CSSProperties}
        >
            <SuperAdminTopBar
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((current) => !current)}
            />

            <div className="dashboard-layout">
                <Sidebar
                    collapsed={!sidebarOpen}
                    activeNav={activeNav}
                    onChange={handleNavChange}
                />

                <main className="main-content">
                    <Outlet />
                </main>
            </div>

            <Footer />
        </div>
    );
}