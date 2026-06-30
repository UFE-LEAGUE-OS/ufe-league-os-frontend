import {
    Bell,
    ChevronDown,
    ChevronDownIcon,
    Search,
    X,
} from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import leagueLogo from "../../assets/logos/league-os-horizontal.png";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { getUnreadNotificationCount } from "../../services/notificationService";
import styles from "./LoggedInHeader.module.css";

const navItems = [
    { label: "Sport", href: "/" },
    { label: "Leagues", href: "/" },
    { label: "Clubs", href: "/clubs" },
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
    const navigate = useNavigate();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    useEffect(() => {
        let isMounted = true;

        async function loadUnreadNotifications() {
            try {
                const count = await getUnreadNotificationCount();

                if (isMounted) {
                    setUnreadNotifications(count);
                }
            } catch {
                if (isMounted) {
                    setUnreadNotifications(0);
                }
            }
        }

        void loadUnreadNotifications();

        function handleNotificationsUpdated() {
            void loadUnreadNotifications();
        }

        window.addEventListener(
            "leagueos:notifications-updated",
            handleNotificationsUpdated,
        );

        const intervalId = window.setInterval(() => {
            void loadUnreadNotifications();
        }, 60000);

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
            window.removeEventListener(
                "leagueos:notifications-updated",
                handleNotificationsUpdated,
            );
        };
    }, []);

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
                    aria-label={
                        unreadNotifications > 0
                            ? `${unreadNotifications} unread notifications`
                            : "Notifications"
                    }
                >
                    <Bell size={25} strokeWidth={2.2} />
                    {unreadNotifications > 0 ? (
                        <span>{unreadNotifications > 99 ? "99+" : unreadNotifications}</span>
                    ) : null}
                </Link>

                <button type="button" className={styles.userButton}>
                    <span className={styles.avatar}>{currentUser.avatarInitials}</span>

                    <span className={styles.userText}>
                        <strong>{currentUser.name}</strong>
                        <small>View Profile</small>
                    </span>

                    <ChevronDown size={18} strokeWidth={2.5} aria-hidden="true" />
                </button>
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