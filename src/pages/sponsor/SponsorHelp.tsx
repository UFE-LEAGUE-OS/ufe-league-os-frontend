import { useState } from 'react';
import {
  FiSearch,
  FiBook,
  FiBarChart2,
  FiCreditCard,
  FiTool,
  FiUsers,
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiPhone,
  FiMessageSquare,
  FiFileText,
  FiVideo,
  FiExternalLink,
  FiSend,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { useAuthStore } from '../../store/authStore';
import './SponsorHelp.css';

type Tab = 'general' | 'corporate' | 'individual' | 'payments';

const quickCards = [
  {
    icon: FiBook,
    title: 'Getting Started',
    desc: 'Learn how to set up your sponsor profile and launch your first campaign.',
    color: 'sh-card-purple',
  },
  {
    icon: FiBarChart2,
    title: 'Campaign Management',
    desc: 'Create, manage and track the performance of your sponsorship campaigns.',
    color: 'sh-card-blue',
  },
  {
    icon: FiCreditCard,
    title: 'Payments & Billing',
    desc: 'Understand payment methods, invoices and billing cycles.',
    color: 'sh-card-green',
  },
  {
    icon: FiTool,
    title: 'Technical Issues',
    desc: 'Resolve common technical problems and platform errors.',
    color: 'sh-card-orange',
  },
];

const corporateQuickCards = [
  {
    icon: FiUsers,
    title: 'Team Management',
    desc: 'Add team members, assign roles and manage permissions for your organization.',
    color: 'sh-card-teal',
  },
];

const faqs: Record<string, { q: string; a: string }[]> = {
  general: [
    {
      q: 'How do I become a verified sponsor on League OS?',
      a: 'To become a verified sponsor, complete your sponsor profile, upload the required verification documents (Certificate of Incorporation, TIN, and company logo for corporate sponsors), and submit your application. Our team reviews applications within 2-3 business days.',
    },
    {
      q: 'What types of sponsorship opportunities are available?',
      a: 'League OS offers club sponsorships, league sponsorships, player sponsorships, event sponsorships, grassroots development sponsorships, and digital campaign sponsorships across football, rugby, basketball, and other sports.',
    },
    {
      q: 'How do I track the performance of my sponsorship campaigns?',
      a: "Navigate to Campaign Analytics from your dashboard or sidebar. You'll find detailed metrics including reach, impressions, engagements, ROI and media value with comparison data from previous periods.",
    },
    {
      q: 'Can I run multiple campaigns at the same time?',
      a: 'Yes, you can run multiple campaigns simultaneously. Each campaign is tracked independently with its own performance metrics, budget and reporting.',
    },
    {
      q: 'How do I create a new sponsorship campaign?',
      a: "Click 'Create Campaign' from your dashboard or the Campaigns page. You'll be guided through a 5-step process: Campaign Info, Targeting, Budget, Review and Launch.",
    },
  ],
  corporate: [
    {
      q: 'How do I add team members to my corporate sponsor account?',
      a: "Go to My Team from the sidebar, then click 'Invite Member'. Enter the team member's email address and assign them a role (Admin, Manager, Editor, Analyst, or Viewer). They'll receive an invitation email to join your account.",
    },
    {
      q: 'What are the different team member roles and permissions?',
      a: 'Admin has full access, Manager can manage campaigns and team, Editor can create and edit campaigns, Analyst can view analytics only, and Viewer has read-only access to dashboards and reports.',
    },
    {
      q: 'How do I manage billing and invoices for my organization?',
      a: 'Go to Settings → Billing & Payments to view your payment methods, billing information, and download invoices. You can also set up automatic payments and manage invoice preferences.',
    },
    {
      q: 'Can I have multiple payment methods for my corporate account?',
      a: 'Yes, you can add multiple payment methods including Mobile Money (MTN, Airtel) and bank transfers. You can set a default payment method and switch between them for different transactions.',
    },
  ],
  individual: [
    {
      q: 'What is the minimum budget for an individual sponsor?',
      a: 'Individual sponsorships start from as low as UGX 1,000,000 per campaign. You can choose from various budget ranges depending on the type and scale of sponsorship you prefer.',
    },
    {
      q: 'Can I sponsor a specific athlete or player as an individual?',
      a: 'Yes, player sponsorship is one of our most popular individual sponsorship options. You can browse available athletes, view their profiles and performance stats, and submit a sponsorship proposal.',
    },
  ],
  payments: [
    {
      q: 'What payment methods are accepted?',
      a: 'We accept Mobile Money (MTN Mobile Money and Airtel Money), bank transfers, and major debit/credit cards. All payments are processed securely through Flutterwave.',
    },
    {
      q: 'When will I receive an invoice for my sponsorship payment?',
      a: "Invoices are generated automatically after each payment is confirmed. You can download them from Settings → Billing & Payments or from the payment confirmation email sent to your registered email address.",
    },
    {
      q: 'What happens if my payment fails?',
      a: "If a payment fails, you'll receive an email notification with instructions to retry. Your campaign will be paused until payment is confirmed. Contact support if you continue experiencing payment issues.",
    },
  ],
};

const resources: {
  icon: React.ElementType;
  title: string;
  desc: string;
  type: string;
  link: string;
  corporateOnly?: boolean;
}[] = [
  {
    icon: FiFileText,
    title: 'Sponsor Onboarding Guide',
    desc: 'Step-by-step guide to setting up your sponsor account.',
    type: 'PDF Guide',
    link: '#',
  },
  {
    icon: FiVideo,
    title: 'Campaign Creation Tutorial',
    desc: 'Video walkthrough on creating and launching campaigns.',
    type: 'Video',
    link: '#',
  },
  {
    icon: FiFileText,
    title: 'Sponsorship Packages Overview',
    desc: 'Detailed breakdown of all available sponsorship tiers.',
    type: 'PDF Guide',
    link: '#',
  },
  {
    icon: FiFileText,
    title: 'Analytics & ROI Explained',
    desc: 'Understanding your campaign performance metrics.',
    type: 'Article',
    link: '#',
  },
  {
    icon: FiVideo,
    title: 'Team Management Tutorial',
    desc: 'How to add and manage team members.',
    type: 'Video',
    link: '#',
    corporateOnly: true,
  },
  {
    icon: FiFileText,
    title: 'Billing & Payments FAQ',
    desc: 'Common questions about payments and invoicing.',
    type: 'Article',
    link: '#',
  },
];

export default function SponsorHelp() {
  const user = useAuthStore((state) => state.user);
  const sponsorType = (user?.sponsor_type as string) ?? 'CORPORATE';
  const isIndividual = sponsorType === 'INDIVIDUAL';

  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Tab>('general');
  const [ticket, setTicket] = useState({ subject: '', message: '', priority: 'Medium' });
  const [ticketSent, setTicketSent] = useState(false);

  const faqCategories: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    ...(!isIndividual ? [{ id: 'corporate' as Tab, label: 'Corporate & Teams' }] : []),
    ...(isIndividual ? [{ id: 'individual' as Tab, label: 'Individual Sponsors' }] : []),
    { id: 'payments', label: 'Payments' },
  ];

  const currentFaqs = faqs[activeCategory] ?? [];

  const filteredFaqs = search
    ? Object.values(faqs).flat().filter(
        (f) =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
      )
    : currentFaqs;

  const handleTicketSubmit = () => {
    setTicketSent(true);
    setTicket({ subject: '', message: '', priority: 'Medium' });
    setTimeout(() => setTicketSent(false), 4000);
  };

  const allCards = isIndividual
    ? quickCards
    : [...quickCards, ...corporateQuickCards];

  return (
    <div className="shelp-page">
      <div className="shelp-layout">
        <SponsorSidebar />

        <main className="shelp-main landing-page">

          {/* Header */}
          <div className="shelp-header">
            <h1 className="shelp-title">Help & Support</h1>
            <p className="shelp-subtitle">
              Find answers, guides and support for your {isIndividual ? 'individual' : 'corporate'} sponsorship account.
            </p>
            <div className="shelp-search-wrap">
              <FiSearch size={18} className="shelp-search-icon" />
              <input
                className="shelp-search"
                type="text"
                placeholder="Search help topics, FAQs, guides..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Quick help cards */}
          {!search && (
            <div className="shelp-quick-grid">
              {allCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className={`shelp-quick-card ${card.color}`}>
                    <div className="shelp-quick-icon-wrap">
                      <Icon size={22} className="shelp-quick-icon" />
                    </div>
                    <div className="shelp-quick-title">{card.title}</div>
                    <div className="shelp-quick-desc">{card.desc}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* FAQ section */}
          <div className="shelp-faq-section">
            <div className="shelp-faq-header">
              <h2 className="shelp-section-title">
                {search ? `Search results for "${search}"` : 'Frequently Asked Questions'}
              </h2>
              {!search && (
                <div className="shelp-faq-cats">
                  {faqCategories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`shelp-faq-cat ${activeCategory === cat.id ? 'shelp-faq-cat-active' : ''}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="shelp-faq-list">
              {filteredFaqs.length === 0 ? (
                <div className="shelp-no-results">
                  No results found for "{search}". Try a different search term or browse the categories above.
                </div>
              ) : (
                filteredFaqs.map((faq, index) => {
                  const key = `${activeCategory}-${index}`;
                  const isOpen = openFaq === key;
                  return (
                    <div
                      key={key}
                      className={`shelp-faq-item ${isOpen ? 'shelp-faq-open' : ''}`}
                    >
                      <button
                        className="shelp-faq-question"
                        onClick={() => setOpenFaq(isOpen ? null : key)}
                      >
                        <span>{faq.q}</span>
                        {isOpen
                          ? <FiChevronUp size={16} className="shelp-faq-chevron" />
                          : <FiChevronDown size={16} className="shelp-faq-chevron" />
                        }
                      </button>
                      {isOpen && (
                        <div className="shelp-faq-answer">{faq.a}</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom grid: Contact + Resources */}
          <div className="shelp-bottom-grid">

            {/* Contact Support */}
            <div className="shelp-contact-card">
              <h2 className="shelp-section-title">Contact Support</h2>
              <p className="shelp-contact-desc">
                Can't find what you're looking for? Our team is ready to help.
              </p>

              <div className="shelp-contact-options">
                <a href="mailto:sponsors@leagueos.ug" className="shelp-contact-option">
                  <div className="shelp-contact-icon-wrap shelp-contact-purple">
                    <FiMail size={18} />
                  </div>
                  <div>
                    <div className="shelp-contact-label">Email Support</div>
                    <div className="shelp-contact-val">sponsors@leagueos.ug</div>
                  </div>
                </a>
                <a href="tel:+256800123456" className="shelp-contact-option">
                  <div className="shelp-contact-icon-wrap shelp-contact-green">
                    <FiPhone size={18} />
                  </div>
                  <div>
                    <div className="shelp-contact-label">Phone Support</div>
                    <div className="shelp-contact-val">+256 800 123 456</div>
                  </div>
                </a>
                <div className="shelp-contact-option">
                  <div className="shelp-contact-icon-wrap shelp-contact-blue">
                    <FiMessageSquare size={18} />
                  </div>
                  <div>
                    <div className="shelp-contact-label">Live Chat</div>
                    <div className="shelp-contact-val">Available Mon–Fri, 8am–6pm EAT</div>
                  </div>
                </div>
              </div>

              <div className="shelp-ticket-form">
                <h3 className="shelp-ticket-title">Submit a Support Ticket</h3>
                {ticketSent ? (
                  <div className="shelp-ticket-success">
                    ✓ Your ticket has been submitted. We'll get back to you within 24 hours.
                  </div>
                ) : (
                  <>
                    <div className="shelp-field-group">
                      <label className="shelp-label">Subject</label>
                      <input
                        className="shelp-input"
                        type="text"
                        placeholder="Brief description of your issue"
                        value={ticket.subject}
                        onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                      />
                    </div>
                    <div className="shelp-field-group">
                      <label className="shelp-label">Priority</label>
                      <select
                        className="shelp-input shelp-select"
                        value={ticket.priority}
                        onChange={(e) => setTicket({ ...ticket, priority: e.target.value })}
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                    <div className="shelp-field-group">
                      <label className="shelp-label">Message</label>
                      <textarea
                        className="shelp-input shelp-textarea"
                        placeholder="Describe your issue in detail..."
                        rows={4}
                        value={ticket.message}
                        onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                      />
                    </div>
                    <button
                      className="shelp-submit-btn"
                      onClick={handleTicketSubmit}
                      disabled={!ticket.subject || !ticket.message}
                    >
                      <FiSend size={15} /> Submit Ticket
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Resources */}
            <div className="shelp-resources-card">
              <h2 className="shelp-section-title">Resources & Guides</h2>
              <p className="shelp-contact-desc">
                Explore our library of guides, tutorials and documentation.
              </p>
              <div className="shelp-resources-list">
                {resources
                  .filter((r) => !r.corporateOnly || !isIndividual)
                  .map((resource) => {
                    const Icon = resource.icon;
                    return (
                      <a
                        key={resource.title}
                        href={resource.link}
                        className="shelp-resource-item"
                      >
                        <div className="shelp-resource-icon-wrap">
                          <Icon size={16} className="shelp-resource-icon" />
                        </div>
                        <div className="shelp-resource-info">
                          <div className="shelp-resource-title">{resource.title}</div>
                          <div className="shelp-resource-desc">{resource.desc}</div>
                          <span className="shelp-resource-type">{resource.type}</span>
                        </div>
                        <FiExternalLink size={14} className="shelp-resource-link" />
                      </a>
                    );
                  })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}