import type { LucideIcon } from "lucide-react";
import { Building2, Home, LogOut, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { UnionWorkspaceRole } from "../../services/unionAdminService";
import styles from "./MobileUnionNavigation.module.css";

export interface MobileUnionNavItem {
    key: string;
    label: string;
    icon: LucideIcon;
}



function normalizeNavValue(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findPreferredItem(items: MobileUnionNavItem[], preference: string) {
    const wanted = normalizeNavValue(preference);

    return items.find((item) => {
        const key = normalizeNavValue(item.key);
        const label = normalizeNavValue(item.label);

        return key === wanted || label === wanted || key.includes(wanted) || label.includes(wanted);
    });
}

function getRolePreferredKeys(workspaceRole: UnionWorkspaceRole) {
    switch (workspaceRole) {
        case "TICKETING_OFFICER":
            return ["overview", "ticketing", "entrylogs", "scanner"];
        case "MATCH_OFFICIAL":
            return ["overview", "matchofficials", "appointments", "profile"];
        case "REGISTRAR":
            return ["overview", "registrations", "clubs", "competitions"];
        case "FINANCE_OFFICER":
            return ["overview", "finance", "competitions", "clubs"];
        case "COMMUNICATIONS_OFFICER":
            return ["overview", "comms", "clubs", "competitions"];
        case "COMPETITIONS_MANAGER":
            return ["overview", "competitions", "clubs", "matchofficials"];
        case "REFEREE_MANAGER":
            return ["overview", "matchofficials", "competitions", "clubs"];
        default:
            return ["overview", "competitions", "clubs", "finance"];
    }
}



interface MobileUnionNavigationProps {
    activeKey: string;
    items: MobileUnionNavItem[];
    workspaceName: string;
    workspaceRole: UnionWorkspaceRole;
    onTabChange: (key: string) => void;
    onLogout: () => void;
}

function MobileUnionNavigation({
    activeKey,
    items,
    workspaceName,
    workspaceRole,
    onTabChange,
    onLogout,
}: MobileUnionNavigationProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const visibleItems = useMemo(() => {
        const preferredKeys = getRolePreferredKeys(workspaceRole);
        const selectedItems: MobileUnionNavItem[] = [];
        const selectedKeys = new Set<string>();

        preferredKeys.forEach((preference) => {
            const item = findPreferredItem(items, preference);

            if (item && !selectedKeys.has(item.key)) {
                selectedItems.push(item);
                selectedKeys.add(item.key);
            }
        });

        items.forEach((item) => {
            if (!selectedKeys.has(item.key)) {
                selectedItems.push(item);
                selectedKeys.add(item.key);
            }
        });

        return selectedItems.slice(0, 4);
    }, [items, workspaceRole]);

    useEffect(() => {
        setIsDrawerOpen(false);
    }, [activeKey]);

    function handleTabClick(key: string) {
        onTabChange(key);
        setIsDrawerOpen(false);
    }

    return (
        <>
            {isDrawerOpen ? (
                <button
                    className={styles.backdrop}
                    type="button"
                    aria-label="Close union workspace menu"
                    onClick={() => setIsDrawerOpen(false)}
                />
            ) : null}

            <aside
                className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ""}`}
                aria-label="Union workspace mobile menu"
            >
                <div className={styles.drawerHeader}>
                    <div className={styles.drawerWorkspaceIcon}>
                        <Building2 size={20} strokeWidth={2.4} aria-hidden="true" />
                    </div>

                    <div>
                        <span>Union Workspace</span>
                        <strong>{workspaceName}</strong>
                        <small>{workspaceRole}</small>
                    </div>

                    <button
                        type="button"
                        aria-label="Close mobile menu"
                        onClick={() => setIsDrawerOpen(false)}
                    >
                        <X size={20} strokeWidth={2.4} aria-hidden="true" />
                    </button>
                </div>

                <div className={styles.drawerContent}>
                    <section className={styles.drawerSection}>
                        <h2>Workspace modules</h2>

                        <div className={styles.drawerLinks}>
                            {items.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeKey === item.key;

                                return (
                                    <button
                                        key={item.key}
                                        className={
                                            isActive
                                                ? `${styles.drawerLink} ${styles.activeDrawerLink}`
                                                : styles.drawerLink
                                        }
                                        type="button"
                                        onClick={() => handleTabClick(item.key)}
                                    >
                                        <Icon size={19} strokeWidth={2.25} aria-hidden="true" />
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
                                className={styles.drawerLink}
                                to="/"
                            >
                                <Home
                                    size={19}
                                    strokeWidth={2.25}
                                    aria-hidden="true"
                                />
                                <span>League OS Home</span>
                            </Link>
                            <Link className={styles.drawerLink} to="/unions">
                                <Building2 size={19} strokeWidth={2.25} aria-hidden="true" />
                                <span>Public Unions Page</span>
                            </Link>
                            <button className={styles.drawerLink} type="button" onClick={onLogout}>
                                <LogOut size={19} strokeWidth={2.25} aria-hidden="true" />
                                <span>Log out</span>
                            </button>
                        </div>
                    </section>
                </div>
            </aside>

            <nav className={styles.mobileNav} aria-label="Union workspace mobile navigation">
                {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeKey === item.key;

                    return (
                        <button
                            key={item.key}
                            type="button"
                            className={
                                isActive
                                    ? `${styles.mobileNavLink} ${styles.activeMobileNavLink}`
                                    : styles.mobileNavLink
                            }
                            onClick={() => handleTabClick(item.key)}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <Icon size={20} strokeWidth={2.3} aria-hidden="true" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}

                <button
                    type="button"
                    className={`${styles.mobileNavLink} ${isDrawerOpen ? styles.activeMobileNavLink : ""}`}
                    onClick={() => setIsDrawerOpen((currentValue) => !currentValue)}
                    aria-label="Open more union workspace navigation"
                    aria-expanded={isDrawerOpen}
                >
                    <Menu size={20} strokeWidth={2.3} aria-hidden="true" />
                    <span>More</span>
                </button>
            </nav>
        </>
    );
}

export default MobileUnionNavigation;
