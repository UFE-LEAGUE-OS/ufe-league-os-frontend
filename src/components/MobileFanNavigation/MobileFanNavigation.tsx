import {
    BarChart3,
    Bell,
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
import styles from "./MobileFanNavigation.module.css";

interface MobileNavLink {
    label: string;
    href: string;
    icon: LucideIcon;
}

interface MobileNavSection {
    title: string;
    links: MobileNavLink[];
}

const mainLinks: MobileNavLink[] = [
    { label: "Home", href: "/dashboard/fan", icon: Home },
    { label: "Browse", href: "/clubs", icon: Compass },
    { label: "Tickets", href: "/dashboard/tickets", icon: Ticket },
    { label: "Profile", href: "/profile", icon: UserRound },
];

const drawerSections: MobileNavSection[] = [
    {
        title: "Main",
        links: [
            { label: "Dashboard", href: "/dashboard/fan", icon: Home },
            { label: "My Clubs", href: "/profile/clubs", icon: ShieldCheck },
            { label: "My Tickets", href: "/dashboard/tickets", icon: Ticket },
            { label: "My Memberships", href: "/dashboard/memberships", icon: Trophy },
            { label: "Payments", href: "/profile/payments", icon: CreditCard },
        ],
    },
    {
        title: "Browse",
        links: [
            { label: "Competitions", href: "/competitions", icon: Trophy },
            { label: "Clubs & Teams", href: "/clubs", icon: Users },
            { label: "Fixtures", href: "/fixtures", icon: CalendarDays },
            { label: "Results", href: "/results", icon: BarChart3 },
            { label: "Tickets", href: "/tickets", icon: Ticket },
            { label: "News", href: "/news", icon: Newspaper },
        ],
    },
    {
        title: "Engage",
        links: [
            { label: "Fantasy", href: "/fantasy", icon: Swords },
            { label: "Polls Hub", href: "/fan/polls", icon: BarChart3 },
            { label: "MVP Voting", href: "/fan/mvp-voting", icon: Goal },
            { label: "Become a Sponsor", href: "/sponsor/apply", icon: Handshake },
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
    const location = useLocation();

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
                    {drawerSections.map((section) => (
                        <section className={styles.drawerSection} key={section.title}>
                            <h2>{section.title}</h2>

                            <div className={styles.drawerLinks}>
                                {section.links.map((link) => {
                                    const Icon = link.icon;

                                    return (
                                        <NavLink
                                            key={link.href}
                                            to={link.href}
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
                {mainLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                        <NavLink
                            key={link.href}
                            to={link.href}
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
