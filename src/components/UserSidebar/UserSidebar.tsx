import {
    BarChart3,
    Bell,
    Building2,
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
    LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import leagueLogo from "../../assets/logos/league-os-horizontal.png";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getMyUnionWorkspaces } from "../../services/unionAdminService";
import logoHorizontal from "../../assets/logos/league-os-horizontal.png";
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
            { label: "Fantasy", href: "/fantasy", icon: Swords },
            { label: "Polls Hub", href: "/fan/polls", icon: BarChart3 },
            { label: "MVP Voting", href: "/fan/mvp-voting", icon: Goal },
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

interface UserSidebarProps {
    isCollapsed?: boolean;
}

function UserSidebar({ isCollapsed = false }: UserSidebarProps) {
    const { currentUser, profile } = useCurrentUser();

    function handleLogout() {
        [
            "league_os_access_token",
            "league_os_refresh_token",
            "league_os_user",
            "accessToken",
            "refreshToken",
        ].forEach((key) => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });

        window.location.assign("/login");
    }

    const [unionWorkspaceCount, setUnionWorkspaceCount] = useState(0);

    const profileRoles = useMemo(() => {
        return Array.isArray(profile?.roles)
            ? profile.roles.map((role) => String(role).toUpperCase())
            : [];
    }, [profile?.roles]);

    const hasUnionWorkspaceAccess =
        unionWorkspaceCount > 0 ||
        String(profile?.role ?? "").toUpperCase() === "UNION_ADMIN" ||
        profileRoles.includes("UNION_ADMIN");

    useEffect(() => {
        let isMounted = true;

        async function loadUnionWorkspaceCount() {
            try {
                const workspaces = await getMyUnionWorkspaces();

                if (isMounted) {
                    setUnionWorkspaceCount(workspaces.length);
                }
            } catch {
                if (isMounted) {
                    setUnionWorkspaceCount(0);
                }
            }
        }

        void loadUnionWorkspaceCount();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsedSidebar : ""}`}>

            <div className={styles.brandHeader}>
                <img
                    src={logoHorizontal}
                    alt="League OS"
                    className={styles.brandLogo}
                />
            </div>

            <div className={styles.userCard}>
                <span className={styles.avatar}>
                    {currentUser.avatarUrl ? (
                        <img src={currentUser.avatarUrl} alt="" aria-hidden="true" />
                    ) : (
                        currentUser.avatarInitials
                    )}
                </span>

                <div>
                    <h2>{currentUser.name}</h2>
                    <p>Fan ID: {currentUser.fanId}</p>
                </div>
            </div>

            <NavLink to="/profile" className={styles.publicProfileButton}>
                View Profile
            </NavLink>

            {hasUnionWorkspaceAccess ? (
                <NavLink to="/dashboard/union-admin" className={styles.workspaceButton}>
                    <Building2 size={18} strokeWidth={2.3} aria-hidden="true" />
                    <span>Union Workspace</span>
                </NavLink>
            ) : null}

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
        
            <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
            >
                <LogOut size={18} strokeWidth={2.2} aria-hidden="true" />
                <span>Log out</span>
            </button>

</aside>
    );
}

export default UserSidebar;
