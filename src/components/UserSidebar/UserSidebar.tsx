import {
    BarChart3,
    Bell,
    CalendarDays,
    CircleHelp,
    CreditCard,
    Goal,
    Grid2X2,
    Handshake,
    Home,
    Lock,
    Newspaper,
    ShieldCheck,
    Swords,
    Ticket,
    Trophy,
    Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import styles from "./UserSidebar.module.css";

interface SidebarLink {
    label: string;
    href: string;
    icon: LucideIcon;
}

interface SidebarSection {
    title: string;
    links: SidebarLink[];
}

const sidebarSections: SidebarSection[] = [
    {
        title: "Main",
        links: [
            { label: "Dashboard", href: "/dashboard/fan", icon: Home },
            { label: "Profile", href: "/profile", icon: Grid2X2 },
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

interface UserSidebarProps {
    isCollapsed?: boolean;
}

function UserSidebar({ isCollapsed = false }: UserSidebarProps) {
    const { currentUser } = useCurrentUser();

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsedSidebar : ""}`}>
            <div className={styles.userCard}>
                <span className={styles.avatar}>{currentUser.avatarInitials}</span>

                <div>
                    <h2>{currentUser.name}</h2>
                    <p>Fan ID: {currentUser.fanId}</p>
                </div>
            </div>

            <NavLink to="/profile" className={styles.publicProfileButton}>
                View Profile
            </NavLink>

            <nav className={styles.nav} aria-label="Fan dashboard navigation">
                {sidebarSections.map((section) => (
                    <section className={styles.navSection} key={section.title}>
                        <h3>{section.title}</h3>

                        <ul>
                            {section.links.map((link) => {
                                const Icon = link.icon;

                                return (
                                    <li key={link.href}>
                                        <NavLink
                                            to={link.href}
                                            className={({ isActive }) =>
                                                isActive
                                                    ? `${styles.navLink} ${styles.activeNavLink}`
                                                    : styles.navLink
                                            }
                                        >
                                            <Icon size={20} strokeWidth={2.1} aria-hidden="true" />
                                            {link.label}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                ))}
            </nav>
        </aside>
    );
}

export default UserSidebar;
