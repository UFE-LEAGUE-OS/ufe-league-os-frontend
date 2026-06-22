import {
    Bell,
    ChevronRight,
    CreditCard,
    Heart,
    HelpCircle,
    Lock,
    MapPin,
    PenLine,
    ShieldCheck,
    Trophy,
    User,
    Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import styles from "./ProfileOverviewPage.module.css";

const profileActions = [
    {
        title: "Edit Profile",
        description: "Update your personal information, profile picture, and account details.",
        href: "/profile/edit",
        icon: User,
        tone: "purple",
    },
    {
        title: "Profile & Interests",
        description:
            "Manage the sports, clubs, leagues and competitions that shape your fan experience.",
        href: "/profile/interests",
        icon: Heart,
        tone: "purple",
    },
    {
        title: "My Clubs",
        description: "Manage your favorite clubs, view memberships, and club notifications.",
        href: "/profile/clubs",
        icon: ShieldCheck,
        tone: "orange",
    },
    {
        title: "Payments & Receipts",
        description: "View club membership payments, ticket receipts, refunds and checkout history.",
        href: "/profile/payments",
        icon: CreditCard,
        tone: "green",
    },
    {
        title: "Notifications",
        description: "Customize what you want to hear about and how you want to be notified.",
        href: "/profile/notifications",
        icon: Bell,
        tone: "blue",
    },
    {
        title: "Privacy & Security",
        description: "Control your privacy settings, security preferences, and connected accounts.",
        href: "/profile/privacy",
        icon: Lock,
        tone: "yellow",
    },
    {
        title: "Help & Support",
        description: "Get help, browse FAQs, or contact our support team anytime.",
        href: "/profile/support",
        icon: HelpCircle,
        tone: "cyan",
    },
];

const recentActivity = [
    {
        title: "Profile Updated",
        description: "You updated your profile information",
        time: "2h ago",
        icon: User,
        tone: "purple",
    },
    {
        title: "Joined City Oilers",
        description: "You joined City Oilers Basketball Club",
        time: "1d ago",
        icon: ShieldCheck,
        tone: "orange",
    },
    {
        title: "Payment Method Added",
        description: "MTN Mobile Money •••• 4242",
        time: "2d ago",
        icon: CreditCard,
        tone: "green",
    },
    {
        title: "Notification Settings",
        description: "You updated your notification preferences",
        time: "3d ago",
        icon: Bell,
        tone: "blue",
    },
];

const quickActions = [
    {
        title: "Edit Profile",
        description: "Update your personal information",
        href: "/profile/edit",
        icon: PenLine,
    },
    {
        title: "Manage Alerts",
        description: "Customize your notifications",
        href: "/profile/notifications",
        icon: Bell,
    },
    {
        title: "Contact Support",
        description: "Get help from our support team",
        href: "/profile/support",
        icon: HelpCircle,
    },
];

const interests = [
    {
        label: "Rugby",
        image: "/assets/sports/rugby-promo.png",
    },
    {
        label: "Football",
        image: "/assets/sports/football-promo.png",
    },
    {
        label: "Basketball",
        image: "/assets/sports/basketball-promo.png",
    },
    {
        label: "KCCA FC",
        image: "/assets/clubs/kcca-fc.png",
    },
    {
        label: "SC Villa",
        image: "/assets/clubs/sc-villa.png",
    },
];

function ProfileOverviewPage() {
    const { currentUser } = useCurrentUser();
    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <h1>Profile, Settings &amp; Support</h1>
                <p>Manage your account, preferences, and get the most out of League OS.</p>
            </header>

            <div className={styles.layoutGrid}>
                <div className={styles.mainColumn}>
                    <section className={styles.profileHero}>
                        <div className={styles.profileIdentity}>
                            <div className={styles.avatarWrap}>
                                <span>{currentUser.avatarInitials}</span>

                                <button type="button" aria-label="Change profile photo">
                                    <PenLine size={15} strokeWidth={2.4} />
                                </button>
                            </div>

                            <div>
                                <h2>
                                    {currentUser.name}
                                    <ShieldCheck size={23} strokeWidth={2.4} aria-hidden="true" />
                                </h2>

                                <p>{currentUser.email}</p>

                                <div className={styles.profileMeta}>
                                    <span>
                                        <MapPin size={16} strokeWidth={2.2} />
                                        {currentUser.location}
                                    </span>

                                    <span>
                                        <Trophy size={16} strokeWidth={2.2} />
                                        {currentUser.favoriteSport}
                                    </span>

                                    <span>
                                        <Users size={16} strokeWidth={2.2} />
                                        Member since May 2024
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.membershipBadge}>
                            <span>
                                <Trophy size={26} strokeWidth={2.2} />
                            </span>

                            <div>
                                <strong>{currentUser.membership}</strong>
                                <p>Renews on 12 May 2025</p>
                            </div>

                            <Link to="/dashboard/memberships">Manage Club Membership →</Link>
                        </div>
                    </section>

                    <section className={styles.actionGrid} aria-label="Profile actions">
                        {profileActions.map((action) => {
                            const Icon = action.icon;

                            return (
                                <Link
                                    to={action.href}
                                    className={`${styles.actionCard} ${styles[action.tone]}`}
                                    key={action.title}
                                >
                                    <span className={styles.actionIcon}>
                                        <Icon size={34} strokeWidth={2.1} aria-hidden="true" />
                                    </span>

                                    <div>
                                        <h2>{action.title}</h2>
                                        <p>{action.description}</p>
                                    </div>

                                    <ChevronRight size={22} strokeWidth={2.4} aria-hidden="true" />
                                </Link>
                            );
                        })}
                    </section>

                    <section className={styles.interestsPanel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>
                                    <Heart size={24} strokeWidth={2.4} aria-hidden="true" />
                                    Your Interests
                                </h2>
                                <p>We tailor your experience based on what you love.</p>
                            </div>

                            <Link to="/profile/interests">Manage Interests</Link>
                        </div>

                        <div className={styles.interestList}>
                            {interests.map((interest) => (
                                <span className={styles.interestChip} key={interest.label}>
                                    <img src={interest.image} alt="" aria-hidden="true" />
                                    {interest.label}
                                    <strong>✓</strong>
                                </span>
                            ))}

                            <span className={styles.moreChip}>+ 3 more</span>
                        </div>
                    </section>
                </div>

                <aside className={styles.sideColumn}>
                    <section className={styles.sidePanel}>
                        <div className={styles.panelHeader}>
                            <h2>Recent Activity</h2>
                            <Link to="/profile">View All</Link>
                        </div>

                        <div className={styles.activityList}>
                            {recentActivity.map((activity) => {
                                const Icon = activity.icon;

                                return (
                                    <article className={styles.activityItem} key={activity.title}>
                                        <span className={`${styles.activityIcon} ${styles[activity.tone]}`}>
                                            <Icon size={20} strokeWidth={2.2} aria-hidden="true" />
                                        </span>

                                        <div>
                                            <h3>{activity.title}</h3>
                                            <p>{activity.description}</p>
                                        </div>

                                        <time>{activity.time}</time>
                                    </article>
                                );
                            })}
                        </div>
                    </section>

                    <section className={styles.sidePanel}>
                        <h2>Quick Actions</h2>

                        <div className={styles.quickActionList}>
                            {quickActions.map((action) => {
                                const Icon = action.icon;

                                return (
                                    <Link to={action.href} className={styles.quickAction} key={action.title}>
                                        <span>
                                            <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
                                        </span>

                                        <div>
                                            <strong>{action.title}</strong>
                                            <p>{action.description}</p>
                                        </div>

                                        <ChevronRight size={20} strokeWidth={2.4} aria-hidden="true" />
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    <section className={styles.supportCard}>
                        <span>
                            <HelpCircle size={48} strokeWidth={2.2} aria-hidden="true" />
                        </span>

                        <div>
                            <h2>Need Help?</h2>
                            <p>Our support team is here for you 24/7.</p>
                        </div>

                        <Link to="/profile/support">Contact Support →</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

export default ProfileOverviewPage;