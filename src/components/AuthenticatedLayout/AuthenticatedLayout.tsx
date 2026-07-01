import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Outlet } from "react-router-dom";
import AuthenticatedFooter from "../AuthenticatedFooter/AuthenticatedFooter";
import MobileFanNavigation from "../MobileFanNavigation/MobileFanNavigation";
import UserSidebar from "../UserSidebar/UserSidebar";
import styles from "./AuthenticatedLayout.module.css";

function AuthenticatedLayout() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className={styles.shell}>
            <div
                className={`${styles.body} ${
                    isSidebarCollapsed ? styles.bodySidebarCollapsed : ""
                }`}
            >
                <button
                    type="button"
                    className={styles.sidebarToggle}
                    onClick={() =>
                        setIsSidebarCollapsed((currentValue) => !currentValue)
                    }
                    aria-label={
                        isSidebarCollapsed
                            ? "Expand fan sidebar"
                            : "Collapse fan sidebar"
                    }
                    title={
                        isSidebarCollapsed
                            ? "Expand fan sidebar"
                            : "Collapse fan sidebar"
                    }
                >
                    {isSidebarCollapsed ? (
                        <PanelLeftOpen size={19} strokeWidth={2.4} aria-hidden="true" />
                    ) : (
                        <PanelLeftClose size={19} strokeWidth={2.4} aria-hidden="true" />
                    )}
                </button>

                <div className={styles.desktopSidebar}>
                    <UserSidebar isCollapsed={isSidebarCollapsed} />
                </div>

                <div className={styles.contentArea}>
                    <main className={styles.content}>
                        <Outlet />
                    </main>

                    <AuthenticatedFooter />
                </div>
            </div>

            <MobileFanNavigation />
        </div>
    );
}

export default AuthenticatedLayout;
