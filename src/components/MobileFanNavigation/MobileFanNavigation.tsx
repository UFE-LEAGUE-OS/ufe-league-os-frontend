import {
    BarChart3,
    Bell,
    Building2,
    CalendarDays,
    CircleHelp,
    Compass,
    CreditCard,
    Goal,
    Handshake,
    Home,
    Lock,
    Menu,
    Newspaper,
    ShieldCheck,
    Swords,
    Ticket,
    Trophy,
    UserRound,
    Users,
    X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { getEntitlementsForDashboard } from "../../utils/dashboardAccess.js";
import styles from "./MobileFanNavigation.module.css";

interface MobileNavLink {
    label: string;
    href: string;
    icon: LucideIcon;
    requiresFan?: boolean;
}

interface MobileNavSection {
    title: string;
    links: MobileNavLink[];
}

const mainLinks: MobileNavLink[] = [
    { label: "Home", href: "/dashboard/fan", icon: Home, requiresFan: true },
    { label: "Browse", href: "/clubs", icon: Compass },
    { label: "Tickets", href: "/dashboard/tickets", icon: Ticket },
    { label: "Profile", href: "/profile", icon: UserRound },
];

const drawerSections: MobileNavSection[] = [
    {
        title: "Main",
        links: [
            { label: "Dashboard", href: "/dashboard/fan", icon: Home, requiresFan: true },
            { label: "My Clubs", href: "/profile/clubs", icon: ShieldCheck },
            { label: "My Tickets", href: "/dashboard/tickets", icon: Ticket, requiresFan: true },
            { label: "My Memberships", href: "/dashboard/memberships", icon: Trophy, requiresFan: true },
            { label: "Payments", href: "/profile/payments", icon: CreditCard },
        ],
    },
    {
        title: "Browse",
        links: [
            { label: "Competitions", href: "/competitions", icon: Trophy },
            { label: "Clubs & Teams", href: "/clubs", icon: Users },
            { label: "Unions", href: "/unions", icon: Building2 },
            { label: "Fixtures", href: "/fixtures", icon: CalendarDays },
            { label: "Results", href: "/results", icon: BarChart3 },
            { label: "Tickets", href: "/tickets", icon: Ticket },
            { label: "News", href: "/news", icon: Newspaper },
        ],
    },
    {
        title: "Engage",
        links: [
            { label: "Fantasy", href: "/fantasy", icon: Swords, requiresFan: true },
            { label: "Polls Hub", href: "/fan/polls", icon: BarChart3, requiresFan: true },
            { label: "MVP Voting", href: "/fan/mvp-voting", icon: Goal, requiresFan: true },
            { label: "Become a Sponsor", href: "/sponsorhub", icon: Handshake },
        ],
    },
    {
        title: "Settings",
        links: [
            { label: "Notifications", href: "/profile/notifications", icon: Bell },
            { label: "Privacy & Security", href: "/profile/privacy", icon: Lock },
            { label: "Help & Support", href: "/profile/support", icon: CircleHelp },
        ],
    },
];

function MobileFanNavigation() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const authenticatedUser = useAuthStore((state) => state.user);
    const location = useLocation();
    const dashboardAccess = authenticatedUser?.dashboard_access;
    const fanEntitlement =
        getEntitlementsForDashboard(dashboardAccess, "FAN")[0] ?? null;
    const unionEntitlement =
        getEntitlementsForDashboard(
            dashboardAccess,
            "UNION_WORKSPACE",
        )[0] ?? null;
    const sponsorEntitlement =
        getEntitlementsForDashboard(dashboardAccess, "SPONSOR")[0] ?? null;

    useEffect(() => {
        setIsDrawerOpen(false);
    }, [location.pathname]);

    return (
        <>
            {isDrawerOpen && (
                <button
                    type="button"
                    className={styles.backdrop}
                    aria-label="Close mobile menu"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            <aside
                className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ""}`}
                aria-label="Mobile dashboard menu"
            >
                <div className={styles.drawerHeader}>
                    <div>
                        <span>League OS</span>
                        <strong>Fan Menu</strong>
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
                    {unionEntitlement ? (
                        <section className={styles.drawerSection}>
                            <h2>Admin workspace</h2>
                            <div className={styles.drawerLinks}>
                                <NavLink
                                    to={unionEntitlement.route}
                                    className={({ isActive }) =>
                                        isActive
                                            ? `${styles.drawerLink} ${styles.activeDrawerLink}`
                                            : styles.drawerLink
                                    }
                                >
                                    <Building2 size={19} strokeWidth={2.2} aria-hidden="true" />
                                    Union Workspace
                                </NavLink>
                            </div>
                        </section>
                    ) : null}

                    {drawerSections.map((section) => (
                        <section className={styles.drawerSection} key={section.title}>
                            <h2>{section.title}</h2>

                            <div className={styles.drawerLinks}>
                                {section.links.map((link) => {
                                    if (link.requiresFan && !fanEntitlement) {
                                        return null;
                                    }

                                    const Icon = link.icon;
                                    const href =
                                        link.href === "/dashboard/fan"
                                            ? fanEntitlement?.route ?? link.href
                                            : link.href === "/sponsorhub"
                                                ? sponsorEntitlement?.route ?? link.href
                                                : link.href;

                                    return (
                                        <NavLink
                                            key={href}
                                            to={href}
                                            className={({ isActive }) =>
                                                isActive
                                                    ? `${styles.drawerLink} ${styles.activeDrawerLink}`
                                                    : styles.drawerLink
                                            }
                                        >
                                            <Icon size={19} strokeWidth={2.2} aria-hidden="true" />
                                            {link.label}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            </aside>

            <nav className={styles.mobileNav} aria-label="Mobile fan navigation">
                {mainLinks
                    .filter((link) => !link.requiresFan || fanEntitlement)
                    .map((link) => {
                    const Icon = link.icon;
                    const href =
                        link.href === "/dashboard/fan"
                            ? fanEntitlement?.route ?? link.href
                            : link.href;

                    return (
                        <NavLink
                            key={href}
                            to={href}
                            className={({ isActive }) =>
                                isActive
                                    ? `${styles.mobileNavLink} ${styles.activeMobileNavLink}`
                                    : styles.mobileNavLink
                            }
                        >
                            <Icon size={20} strokeWidth={2.3} aria-hidden="true" />
                            <span>{link.label}</span>
                        </NavLink>
                    );
                })}

                <button
                    type="button"
                    className={`${styles.mobileNavLink} ${isDrawerOpen ? styles.activeMobileNavLink : ""}`}
                    onClick={() => setIsDrawerOpen((currentValue) => !currentValue)}
                    aria-label="Open more navigation"
                    aria-expanded={isDrawerOpen}
                >
                    <Menu size={20} strokeWidth={2.3} aria-hidden="true" />
                    <span>More</span>
                </button>
            </nav>
        </>
    );
}

export default MobileFanNavigation;
