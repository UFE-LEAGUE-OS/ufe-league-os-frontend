import {
    Bell,
    CalendarDays,
    CircleHelp,
    CreditCard,
    FileText,
    Grid2X2,
    Heart,
    Home,
    Link as LinkIcon,
    Lock,
    Newspaper,
    ShieldCheck,
    SlidersHorizontal,
    Star,
    Ticket,
    Trophy,
    User,
    Users,
    Swords,
    Handshake,
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
        title: "Account",
        links: [
            { label: "Dashboard", href: "/dashboard/fan", icon: Home },
            { label: "Overview", href: "/profile", icon: Grid2X2 },
            { label: "Edit Profile", href: "/profile/edit", icon: User },
            { label: "My Clubs", href: "/profile/clubs", icon: ShieldCheck },
            { label: "Payments & Receipts", href: "/profile/payments", icon: CreditCard },
            { label: "Notifications", href: "/profile/notifications", icon: Bell },
            { label: "Privacy & Security", href: "/profile/privacy", icon: Lock },
            { label: "Help & Support", href: "/profile/support", icon: CircleHelp },
        ],
    },
    {
        title: "Fan Hub",
        links: [
            { label: "My Matches", href: "/fixtures", icon: CalendarDays },
            { label: "My Tickets", href: "/dashboard/tickets", icon: Ticket },
            { label: "My Memberships", href: "/dashboard/memberships", icon: Trophy },
            { label: "Fantasy", href: "/fantasy", icon: Swords },
            { label: "Become a Sponsor", href: "/sponsor/apply", icon: Handshake },
            { label: "Watchlist", href: "/dashboard/watchlist", icon: Heart },
            { label: "News Feed", href: "/dashboard/news", icon: Newspaper },
            { label: "Rewards & Benefits", href: "/profile/clubs", icon: Star },
        ],
    },
    {
        title: "Preferences",
        links: [
            { label: "Followed Interests", href: "/profile/interests", icon: Heart },
            { label: "Manage Alerts", href: "/profile/alerts", icon: Bell },
            {
                label: "Content Preferences",
                href: "/profile/content-preferences",
                icon: SlidersHorizontal,
            },
            {
                label: "Connected Accounts",
                href: "/profile/connected-accounts",
                icon: LinkIcon,
            },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Terms of Service", href: "/terms", icon: FileText },
            { label: "Privacy Policy", href: "/privacy", icon: Lock },
        ],
    },
];

interface UserSidebarProps {
    isCollapsed?: boolean;
}

const quickActions = [
    { label: "Explore Competitions", href: "/competitions", icon: Trophy },
    { label: "Browse Clubs", href: "/clubs", icon: Users },
    { label: "Buy Tickets", href: "/tickets", icon: Ticket },
    { label: "Explore Club Memberships", href: "/memberships", icon: ShieldCheck },
];

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
                View Public Profile
            </NavLink>

            <nav className={styles.nav} aria-label="User account navigation">
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

            <section className={styles.quickActions} aria-labelledby="quick-actions-title">
                <h3 id="quick-actions-title">Quick Actions</h3>

                <ul>
                    {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                            <li key={action.href}>
                                <NavLink to={action.href}>
                                    <Icon size={18} strokeWidth={2.1} aria-hidden="true" />
                                    {action.label}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </section>

            <div className={styles.premiumCard}>
                <div className={styles.premiumIcon}>♕</div>
                <h2>Become a Club Member</h2>
                <p>
                    Support your favourite clubs directly and unlock club-specific benefits,
                    ticket discounts and rewards.
                </p>
                <NavLink to="/memberships">Explore Club Memberships →</NavLink>
            </div>
        </aside>
    );
}

export default UserSidebar;