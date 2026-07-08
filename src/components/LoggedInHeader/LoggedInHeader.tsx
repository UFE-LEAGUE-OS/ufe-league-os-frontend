import {
    Bell,
    Building2,
    ChevronDown,
    ChevronDownIcon,
    LayoutDashboard,
    LogOut,
    Search,
    User,
    X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import leagueLogo from "../../assets/logos/league-os-horizontal.png";
import { useAuth } from "../../hooks/useAuth.js";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getMyUnionWorkspaces } from "../../services/unionAdminService";
import styles from "./LoggedInHeader.module.css";

const navItems = [
    { label: "Sport", href: "/" },
    { label: "Leagues", href: "/" },
    { label: "Clubs", href: "/clubs" },
    { label: "Unions", href: "/unions" },
    { label: "Competitions", href: "/" },
    { label: "News", href: "/" },
    { label: "Club Memberships", href: "/memberships" },
    { label: "Tickets", href: "/dashboard/tickets" },
];

const dropdownNavItems = new Set(["Sport", "Leagues", "Clubs", "Competitions"]);

const searchableItems = [
    {
        title: "Fan Dashboard",
        description: "View your memberships, tickets, matches and rewards.",
        href: "/dashboard/fan",
        type: "Page",
    },
    {
        title: "Profile Overview",
        description: "Manage your League OS profile and settings.",
        href: "/profile",
        type: "Profile",
    },
    {
        title: "Edit Profile",
        description: "Update your personal information and contact details.",
        href: "/profile/edit",
        type: "Profile",
    },
    {
        title: "Profile & Interests",
        description:
            "Manage followed sports, clubs, leagues, competitions and alert preferences.",
        href: "/profile/interests",
        type: "Profile",
    },
    {
        title: "My Clubs",
        description: "View followed clubs, teams and memberships.",
        href: "/profile/clubs",
        type: "Profile",
    },
    {
        title: "Payment Methods",
        description: "Manage mobile money, cards and billing preferences.",
        href: "/profile/payments",
        type: "Profile",
    },
    {
        title: "Notifications",
        description: "Control match alerts, news alerts and reminders.",
        href: "/profile/notifications",
        type: "Profile",
    },
    {
        title: "Privacy & Security",
        description: "Manage password, privacy and account security.",
        href: "/profile/privacy",
        type: "Profile",
    },
    {
        title: "Help & Support",
        description: "Get help, contact support and browse FAQs.",
        href: "/profile/support",
        type: "Support",
    },
    {
        title: "KCB KOBS",
        description: "Rugby club profile, fixtures, news and memberships.",
        href: "/clubs",
        type: "Club",
    },
    {
        title: "SC Villa",
        description: "Football club profile, fixtures, news and memberships.",
        href: "/clubs",
        type: "Club",
    },
    {
        title: "City Oilers",
        description: "Basketball club profile, fixtures, news and memberships.",
        href: "/clubs",
        type: "Club",
    },
    {
        title: "Tickets",
        description: "Find upcoming match tickets and QR tickets.",
        href: "/dashboard/tickets",
        type: "Ticketing",
    },
    {
        title: "Club Memberships",
        description: "Explore club memberships, fan benefits and club supporter tiers.",
        href: "/memberships",
        type: "Membership",
    },
];

function LoggedInHeader() {
    const { currentUser } = useCurrentUser();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const userMenuRef = useRef<HTMLDivElement>(null);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [unionWorkspaceCount, setUnionWorkspaceCount] = useState(0);
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filteredSearchResults = useMemo(() => {
        if (!normalizedQuery) {
            return searchableItems.slice(0, 6);
        }

        return searchableItems
            .filter((item) => {
                const searchableText = `${item.title} ${item.description} ${item.type}`;

                return searchableText.toLowerCase().includes(normalizedQuery);
            })
            .slice(0, 8);
    }, [normalizedQuery]);

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

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setIsUserMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function handleLogout() {
        setIsUserMenuOpen(false);
        logout();

        navigate("/login", {
            replace: true,
            state: {
                message: "You have been logged out.",
            },
        });
    }



    function closeSearch() {
        setIsSearchOpen(false);
        setSearchQuery("");
    }

    function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const firstResult = filteredSearchResults[0];

        if (!firstResult) {
            return;
        }

        navigate(firstResult.href);
        closeSearch();
    }

    return (
        <header className={styles.header}>
            <Link to="/" className={styles.logoLink} aria-label="League OS home">
                <img src={leagueLogo} alt="League OS" />
            </Link>

            <nav className={styles.nav} aria-label="Main logged-in navigation">
                {navItems.map((item) => (
                    <NavLink to={item.href} className={styles.navLink} key={item.label}>
                        {item.label}
                        {dropdownNavItems.has(item.label) ? (
                            <ChevronDownIcon size={15} strokeWidth={2.8} aria-hidden="true" />
                        ) : null}
                    </NavLink>
                ))}
            </nav>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.iconButton}
                    aria-label="Open search"
                    aria-expanded={isSearchOpen}
                    onClick={() => setIsSearchOpen(true)}
                >
                    <Search size={28} strokeWidth={2.3} />
                </button>

                <Link
                    to="/profile/notifications"
                    className={styles.notificationButton}
                    aria-label="Notifications"
                    title="Notifications"
                >
                    <Bell size={25} strokeWidth={2.2} />
                </Link>

                <div className={styles.userMenu} ref={userMenuRef}>
                    <button
                        type="button"
                        className={styles.userButton}
                        aria-haspopup="menu"
                        aria-expanded={isUserMenuOpen}
                        onClick={() => setIsUserMenuOpen((currentValue) => !currentValue)}
                    >
                        <span className={styles.avatar}>
                            {currentUser.avatarUrl ? (
                                <img src={currentUser.avatarUrl} alt="" aria-hidden="true" />
                            ) : (
                                currentUser.avatarInitials
                            )}
                        </span>

                        <span className={styles.userText}>
                            <strong>{currentUser.name}</strong>
                            <small>View Profile</small>
                        </span>

                        <ChevronDown size={18} strokeWidth={2.5} aria-hidden="true" />
                    </button>

                    {isUserMenuOpen ? (
                        <div className={styles.userDropdown} role="menu">
                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setIsUserMenuOpen(false);
                                    navigate("/dashboard/fan");
                                }}
                            >
                                <LayoutDashboard size={16} strokeWidth={2.4} />
                                Dashboard
                            </button>

                            {unionWorkspaceCount > 0 ? (
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setIsUserMenuOpen(false);
                                        navigate("/dashboard/union-admin");
                                    }}
                                >
                                    <Building2 size={16} strokeWidth={2.4} />
                                    Union Workspace
                                </button>
                            ) : null}

                            <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setIsUserMenuOpen(false);
                                    navigate("/profile");
                                }}
                            >
                                <User size={16} strokeWidth={2.4} />
                                View Profile
                            </button>

                            <button type="button" role="menuitem" onClick={handleLogout}>
                                <LogOut size={16} strokeWidth={2.4} />
                                Log Out
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>

            {isSearchOpen ? (
                <div
                    className={styles.searchPanel}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Search League OS"
                >
                    <div className={styles.searchPanelInner}>
                        <div className={styles.searchPanelHeader}>
                            <div>
                                <h2>Search League OS</h2>
                                <p>Find pages, clubs, tickets, memberships and settings.</p>
                            </div>

                            <button
                                type="button"
                                className={styles.closeSearchButton}
                                aria-label="Close search"
                                onClick={closeSearch}
                            >
                                <X size={22} strokeWidth={2.5} />
                            </button>
                        </div>

                        <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
                            <Search size={22} strokeWidth={2.3} aria-hidden="true" />

                            <input
                                autoFocus
                                type="search"
                                placeholder="Search for clubs, tickets, profile settings..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />

                            <button type="submit">Search</button>
                        </form>

                        <div className={styles.searchResults}>
                            {filteredSearchResults.length > 0 ? (
                                filteredSearchResults.map((result) => (
                                    <Link
                                        to={result.href}
                                        className={styles.searchResult}
                                        key={`${result.type}-${result.title}`}
                                        onClick={closeSearch}
                                    >
                                        <span>{result.type}</span>

                                        <div>
                                            <strong>{result.title}</strong>
                                            <p>{result.description}</p>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className={styles.emptySearch}>
                                    <strong>No results found</strong>
                                    <p>Try searching for dashboard, profile, tickets or clubs.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
        </header>
    );
}

export default LoggedInHeader;