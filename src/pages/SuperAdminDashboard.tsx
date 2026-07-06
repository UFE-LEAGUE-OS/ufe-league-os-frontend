import { useState } from "react";
import { Outlet } from "react-router-dom";

import "../styles/pages/SuperAdminDashboard.css";
import "../components/SuperAdminSideBar.css";

import Footer from "../components/Footer";
import superImage from "../assets/cta-banner.png";
import Sidebar from "../components/SuperAdminSideBar";
import SuperAdminTopBar from "../components/SuperAdminTopBar";

export default function SuperAdminDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div
            className="super-admin"
            style={{
                backgroundImage: `linear-gradient(rgba(15, 18, 24, 0.38), rgba(15, 18, 24, 0.34)), url(${superImage})`,
            }}
        >
            <SuperAdminTopBar
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen((current) => !current)}
            />

            <div className="dashboard-layout">
                <Sidebar collapsed={!sidebarOpen} />

                <main className="main-content">
                    <Outlet />
                </main>
            </div>

            <Footer />
        </div>
    );
}