import {
    AlertCircle,
    BookOpen,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    HelpCircle,
    LifeBuoy,
    Mail,
    MessageSquare,
    Phone,
    Search,
    Send,
    ShieldCheck,
    Ticket,
} from "lucide-react";
import type { FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./SupportPage.module.css";

interface SupportCategory {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    tone: "purple" | "orange" | "blue" | "green";
}

interface FaqItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

const supportCategories: SupportCategory[] = [
    {
        id: "tickets",
        title: "Tickets & QR Codes",
        description: "Get help with ticket purchases, QR tickets and match entry.",
        icon: Ticket,
        href: "/tickets",
        tone: "purple",
    },
    {
        id: "memberships",
        title: "Club Memberships",
        description: "Resolve club membership purchases, renewals and benefits.",
        icon: ShieldCheck,
        href: "/memberships",
        tone: "orange",
    },
    {
        id: "payments",
        title: "Payments & Receipts",
        description: "Check Flutterwave checkout status, receipts and refunds.",
        icon: FileText,
        href: "/profile/payments",
        tone: "blue",
    },
    {
        id: "account",
        title: "Account & Security",
        description: "Get help with login, OTP, password and privacy settings.",
        icon: LifeBuoy,
        href: "/profile/privacy",
        tone: "green",
    },
];

const faqItems: FaqItem[] = [
    {
        id: "faq-ticket-not-showing",
        question: "Why is my QR ticket not showing after payment?",
        answer:
            "Your ticket may still be waiting for payment confirmation. Check Payments & Receipts first. If the payment is successful but the ticket is missing, contact support with the payment reference.",
        category: "Tickets",
    },
    {
        id: "faq-membership-active",
        question: "When does my club membership become active?",
        answer:
            "A club membership becomes active after the payment is confirmed and the membership record is created for that club.",
        category: "Memberships",
    },
    {
        id: "faq-flutterwave-pending",
        question: "What does a pending Flutterwave payment mean?",
        answer:
            "Pending means the checkout request has been created but confirmation has not yet been received. You can check the status again from Payments & Receipts.",
        category: "Payments",
    },
    {
        id: "faq-change-interests",
        question: "How do I change the clubs and sports I follow?",
        answer:
            "Go to Profile & Interests and update your sports, clubs, leagues and alert preferences.",
        category: "Profile",
    },
    {
        id: "faq-otp",
        question: "I did not receive my OTP. What should I do?",
        answer:
            "Check the email or phone number entered, wait a few minutes, then request a new OTP. If it still fails, contact support.",
        category: "Account",
    },
];

const recentTickets = [
    {
        id: "support-001",
        subject: "QR ticket not visible",
        category: "Tickets",
        status: "Open",
        updated: "Today, 9:14 AM",
    },
    {
        id: "support-002",
        subject: "Membership receipt request",
        category: "Payments",
        status: "Resolved",
        updated: "Yesterday, 3:42 PM",
    },
    {
        id: "support-003",
        subject: "Change phone number",
        category: "Account",
        status: "In Review",
        updated: "2 days ago",
    },
];

function getTicketStatusClass(status: string) {
    if (status === "Resolved") {
        return styles.resolvedStatus;
    }

    if (status === "Open") {
        return styles.openStatus;
    }

    return styles.reviewStatus;
}

function SupportPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("General Support");
    const [supportMessage, setSupportMessage] = useState("");
    const [saveMessage, setSaveMessage] = useState("");

    const normalizedSearchQuery = searchQuery.trim().toLowerCase();

    const filteredFaqItems = useMemo(() => {
        if (!normalizedSearchQuery) {
            return faqItems;
        }

        return faqItems.filter((item) => {
            const searchableText = `${item.question} ${item.answer} ${item.category}`;

            return searchableText.toLowerCase().includes(normalizedSearchQuery);
        });
    }, [normalizedSearchQuery]);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!supportMessage.trim()) {
            setSaveMessage("Please enter a short support message first.");
            return;
        }

        setSaveMessage("Support request prepared locally for now.");
        setSupportMessage("");
    }

    return (
        <section className={styles.page}>
            <header className={styles.pageHeader}>
                <div>
                    <h1>Help &amp; Support</h1>
                    <p>
                        Get help with tickets, club memberships, payments, account access,
                        OTP verification and profile settings.
                    </p>
                </div>

                <a href="mailto:support@leagueos.test" className={styles.primaryHeaderAction}>
                    <Mail size={18} strokeWidth={2.4} aria-hidden="true" />
                    Email Support
                </a>
            </header>

            {saveMessage ? (
                <div className={styles.saveMessage} role="status">
                    <CheckCircle2 size={19} strokeWidth={2.4} aria-hidden="true" />
                    {saveMessage}
                </div>
            ) : null}

            <section className={styles.heroCard}>
                <span>
                    <LifeBuoy size={38} strokeWidth={2.3} aria-hidden="true" />
                </span>

                <div>
                    <h2>How can we help?</h2>
                    <p>
                        Search common issues, open a support request, or review your recent
                        support tickets.
                    </p>
                </div>

                <div className={styles.heroSearch}>
                    <Search size={20} strokeWidth={2.3} aria-hidden="true" />
                    <input
                        type="search"
                        placeholder="Search help topics, payments, tickets or OTP..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                </div>
            </section>

            <section className={styles.categoryGrid} aria-label="Support categories">
                {supportCategories.map((category) => {
                    const CategoryIcon = category.icon;

                    return (
                        <Link
                            to={category.href}
                            className={`${styles.categoryCard} ${styles[category.tone]}`}
                            key={category.id}
                        >
                            <span>
                                <CategoryIcon size={30} strokeWidth={2.2} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>{category.title}</h2>
                                <p>{category.description}</p>
                            </div>

                            <ExternalLink size={18} strokeWidth={2.4} aria-hidden="true" />
                        </Link>
                    );
                })}
            </section>

            <div className={styles.layoutGrid}>
                <main className={styles.mainColumn}>
                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Frequently Asked Questions</h2>
                                <p>
                                    Quick answers for common fan account, ticket, payment and club
                                    membership issues.
                                </p>
                            </div>
                        </div>

                        <div className={styles.faqList}>
                            {filteredFaqItems.map((item) => (
                                <article className={styles.faqItem} key={item.id}>
                                    <span>
                                        <HelpCircle size={22} strokeWidth={2.3} aria-hidden="true" />
                                    </span>

                                    <div>
                                        <strong>{item.question}</strong>
                                        <p>{item.answer}</p>
                                        <small>{item.category}</small>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <div>
                                <h2>Send a Support Request</h2>
                                <p>
                                    This form is local for now. Later it can connect to a backend
                                    support ticket endpoint.
                                </p>
                            </div>
                        </div>

                        <form className={styles.supportForm} onSubmit={handleSubmit}>
                            <label>
                                <span>Support Category</span>
                                <select
                                    value={selectedCategory}
                                    onChange={(event) => setSelectedCategory(event.target.value)}
                                >
                                    <option>General Support</option>
                                    <option>Tickets & QR Codes</option>
                                    <option>Club Memberships</option>
                                    <option>Payments & Receipts</option>
                                    <option>Account & Security</option>
                                    <option>Profile & Interests</option>
                                </select>
                            </label>

                            <label>
                                <span>Message</span>
                                <textarea
                                    rows={6}
                                    placeholder="Describe the issue clearly. Include payment reference or ticket number if relevant."
                                    value={supportMessage}
                                    onChange={(event) => setSupportMessage(event.target.value)}
                                />
                            </label>

                            <button type="submit">
                                <Send size={18} strokeWidth={2.4} aria-hidden="true" />
                                Submit Request
                            </button>
                        </form>
                    </section>
                </main>

                <aside className={styles.sideColumn}>
                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <MessageSquare size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Contact Options</h2>
                                <p>Choose the fastest way to get help.</p>
                            </div>
                        </div>

                        <div className={styles.contactList}>
                            <a href="mailto:support@leagueos.test">
                                <Mail size={20} strokeWidth={2.3} aria-hidden="true" />
                                <span>
                                    <strong>Email Support</strong>
                                    <small>support@leagueos.test</small>
                                </span>
                            </a>

                            <a href="tel:+256700000000">
                                <Phone size={20} strokeWidth={2.3} aria-hidden="true" />
                                <span>
                                    <strong>Call Support</strong>
                                    <small>+256 700 000 000</small>
                                </span>
                            </a>

                            <Link to="/profile/notifications">
                                <BellLinkIcon />
                                <span>
                                    <strong>Alert Settings</strong>
                                    <small>Control support and account notifications</small>
                                </span>
                            </Link>
                        </div>
                    </section>

                    <section className={styles.panel}>
                        <div className={styles.sidePanelHeader}>
                            <span>
                                <Clock size={26} strokeWidth={2.3} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>Recent Support Tickets</h2>
                                <p>Track your latest support conversations.</p>
                            </div>
                        </div>

                        <div className={styles.ticketList}>
                            {recentTickets.map((ticket) => (
                                <article className={styles.ticketItem} key={ticket.id}>
                                    <div>
                                        <strong>{ticket.subject}</strong>
                                        <p>
                                            {ticket.category} • {ticket.updated}
                                        </p>
                                    </div>

                                    <span className={getTicketStatusClass(ticket.status)}>
                                        {ticket.status}
                                    </span>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className={styles.statusCard}>
                        <CheckCircle2 size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Platform status</h2>
                            <p>
                                League OS frontend is running. Backend support ticket submission
                                will be connected later.
                            </p>
                        </div>

                        <Link to="/dashboard/fan">Back to Dashboard →</Link>
                    </section>

                    <section className={styles.warningCard}>
                        <AlertCircle size={42} strokeWidth={2.3} aria-hidden="true" />

                        <div>
                            <h2>Payment issue?</h2>
                            <p>
                                Include your Flutterwave checkout reference or League OS payment
                                reference when reporting payment problems.
                            </p>
                        </div>

                        <Link to="/profile/payments">View Payments & Receipts</Link>
                    </section>
                </aside>
            </div>
        </section>
    );
}

function BellLinkIcon() {
    return <BookOpen size={20} strokeWidth={2.3} aria-hidden="true" />;
}

export default SupportPage;