import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Outlet } from "react-router-dom";
import LoggedInHeader from "../LoggedInHeader/LoggedInHeader";
import UserSidebar from "../UserSidebar/UserSidebar";
import styles from "./AuthenticatedLayout.module.css";

function AuthenticatedLayout() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    return (
        <div className={styles.shell}>
            <LoggedInHeader />

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

                <UserSidebar isCollapsed={isSidebarCollapsed} />

                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AuthenticatedLayout;