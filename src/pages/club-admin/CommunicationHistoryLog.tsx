import { useState } from "react";
import {
  MessageSquare,
  Mail,
  Send,
  Megaphone,
  FileText,
  Calendar,
  Users,
  Search,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { WorkspacePanel } from "../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";

type CommunicationType = "announcement" | "email" | "notification" | "broadcast";
type DeliveryStatus = "sent" | "pending" | "failed" | "scheduled";

type CommunicationLog = {
  id: string;
  title: string;
  description: string;
  type: CommunicationType;
  icon: LucideIcon;
  status: DeliveryStatus;
  sentBy: string;
  sentAt: string;
  recipients: number;
  delivered: number;
  failed: number;
  channel: string;
};

const LOG_DATA: CommunicationLog[] = [
  {
    id: "log-001",
    title: "Season Ticket Renewal Reminder",
    description:
      "Automated email reminder sent to all season ticket holders whose subscriptions are expiring.",
    type: "email",
    icon: Mail,
    status: "sent",
    sentBy: "System",
    sentAt: "2026-07-20T09:00:00",
    recipients: 1250,
    delivered: 1198,
    failed: 52,
    channel: "Email",
  },
  {
    id: "log-002",
    title: "Matchday Protocol Update",
    description:
      "Broadcast notification to all club staff regarding updated matchday procedures.",
    type: "broadcast",
    icon: Megaphone,
    status: "sent",
    sentBy: "Club Secretary",
    sentAt: "2026-07-19T14:30:00",
    recipients: 85,
    delivered: 85,
    failed: 0,
    channel: "In-App / SMS",
  },
  {
    id: "log-003",
    title: "Team Sheet Submission Reminder",
    description:
      "Reminder to all team managers to submit squad lists ahead of the weekend fixtures.",
    type: "notification",
    icon: MessageSquare,
    status: "scheduled",
    sentBy: "System",
    sentAt: "2026-07-25T08:00:00",
    recipients: 24,
    delivered: 0,
    failed: 0,
    channel: "Push Notification",
  },
  {
    id: "log-004",
    title: "New Sponsorship Announcement",
    description:
      "Press release announcing the new partnership with the club's principal sponsor.",
    type: "announcement",
    icon: FileText,
    status: "sent",
    sentBy: "Communications Officer",
    sentAt: "2026-07-18T11:00:00",
    recipients: 5000,
    delivered: 4870,
    failed: 130,
    channel: "Email / Social Media",
  },
  {
    id: "log-005",
    title: "Youth Trials Invitation",
    description:
      "Targeted emails sent to registered academy prospects inviting them for trials.",
    type: "email",
    icon: Mail,
    status: "pending",
    sentBy: "Youth Academy Director",
    sentAt: "2026-07-22T16:00:00",
    recipients: 340,
    delivered: 0,
    failed: 0,
    channel: "Email",
  },
  {
    id: "log-006",
    title: "Emergency Venue Change Notice",
    description:
      "Urgent broadcast to all ticketholders about a venue change for the upcoming match.",
    type: "broadcast",
    icon: Megaphone,
    status: "sent",
    sentBy: "Operations Manager",
    sentAt: "2026-07-17T18:45:00",
    recipients: 3200,
    delivered: 3150,
    failed: 50,
    channel: "SMS / In-App",
  },
  {
    id: "log-007",
    title: "Monthly Newsletter – July",
    description:
      "Monthly club newsletter featuring highlights, upcoming fixtures, and exclusive content.",
    type: "email",
    icon: Mail,
    status: "failed",
    sentBy: "Marketing Team",
    sentAt: "2026-07-15T10:00:00",
    recipients: 8500,
    delivered: 0,
    failed: 8500,
    channel: "Email",
  },
  {
    id: "log-008",
    title: "Training Schedule Change",
    description:
      "Notification to all players and coaching staff about adjusted training times.",
    type: "notification",
    icon: MessageSquare,
    status: "sent",
    sentBy: "Head Coach",
    sentAt: "2026-07-14T07:30:00",
    recipients: 45,
    delivered: 45,
    failed: 0,
    channel: "Push Notification",
  },
];

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const config: Record<DeliveryStatus, { className: string; icon: React.ReactNode; label: string }> =
    {
      sent: {
        className: "chl-status-sent",
        icon: <CheckCircle2 size={14} />,
        label: "Sent",
      },
      pending: {
        className: "chl-status-pending",
        icon: <Clock size={14} />,
        label: "Pending",
      },
      failed: {
        className: "chl-status-failed",
        icon: <XCircle size={14} />,
        label: "Failed",
      },
      scheduled: {
        className: "chl-status-scheduled",
        icon: <Clock size={14} />,
        label: "Scheduled",
      },
    };
  const c = config[status];
  return (
    <span className={`chl-status-badge ${c.className}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

function formatDateTime(isoString: string) {
  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

function TypeIcon({ type }: { type: CommunicationType }) {
  const icons: Record<CommunicationType, React.ReactNode> = {
    announcement: <FileText size={16} />,
    email: <Mail size={16} />,
    notification: <MessageSquare size={16} />,
    broadcast: <Megaphone size={16} />,
  };
  return <>{icons[type]}</>;
}

export default function CommunicationHistoryLog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [sortAsc, setSortAsc] = useState(false);

  const types: CommunicationType[] = ["announcement", "email", "notification", "broadcast"];
  const statuses: DeliveryStatus[] = ["sent", "pending", "failed", "scheduled"];

  const filtered = LOG_DATA.filter((log) => {
    const matchesSearch =
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.sentBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "ALL" || log.type === filterType;
    const matchesStatus = filterStatus === "ALL" || log.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  }).sort((a, b) => {
    const dateA = new Date(a.sentAt).getTime();
    const dateB = new Date(b.sentAt).getTime();
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  const totalSent = LOG_DATA.filter((l) => l.status === "sent").length;
  const totalFailed = LOG_DATA.filter((l) => l.status === "failed").reduce((sum, l) => sum + l.failed, 0);
  const totalRecipients = LOG_DATA.reduce((sum, l) => sum + l.recipients, 0);

  return (
    <div className="comm-history-log-page">
      {/* Stats */}
      <div className="chl-stats-row">
        <div className="chl-stat-card">
          <Send size={22} aria-hidden="true" />
          <strong>{LOG_DATA.length}</strong>
          <span>Total Communications</span>
        </div>
        <div className="chl-stat-card chl-stat-sent">
          <CheckCircle2 size={22} aria-hidden="true" />
          <strong>{totalSent}</strong>
          <span>Delivered</span>
        </div>
        <div className="chl-stat-card chl-stat-recipients">
          <Users size={22} aria-hidden="true" />
          <strong>{totalRecipients.toLocaleString()}</strong>
          <span>Total Recipients</span>
        </div>
        <div className="chl-stat-card chl-stat-failed">
          <XCircle size={22} aria-hidden="true" />
          <strong>{totalFailed.toLocaleString()}</strong>
          <span>Failed Deliveries</span>
        </div>
      </div>

      <WorkspacePanel
        title="Communication History Log"
        description="Track all communications sent from your club — announcements, emails, broadcasts, and notifications."
      >
        {/* Filters */}
        <div className="chl-filters">
          <div className="chl-search-wrap">
            <Search size={15} className="chl-search-icon" />
            <input
              type="text"
              className="chl-search-input"
              placeholder="Search communications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="chl-filter-select"
          >
            <option value="ALL">All Types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="chl-filter-select"
          >
            <option value="ALL">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="chl-sort-btn"
            onClick={() => setSortAsc(!sortAsc)}
            title={sortAsc ? "Sort newest first" : "Sort oldest first"}
          >
            <ArrowUpDown size={15} />
            {sortAsc ? "Oldest" : "Newest"}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="chl-empty">
            <MessageSquare size={40} aria-hidden="true" />
            <strong>No communications found</strong>
            <span>Try adjusting your search or filter criteria.</span>
          </div>
        ) : (
          <div className="chl-list">
            {filtered.map((log) => {
              const Icon = log.icon;
              return (
                <div key={log.id} className="chl-card">
                  <div className="chl-card-header">
                    <div className="chl-card-icon-wrap">
                      <Icon size={20} aria-hidden="true" />
                    </div>
                    <div className="chl-card-title-group">
                      <strong>{log.title}</strong>
                      <span className="chl-card-type">
                        <TypeIcon type={log.type} />
                        {log.type.charAt(0).toUpperCase() + log.type.slice(1)} ·{" "}
                        {log.channel}
                      </span>
                    </div>
                    <StatusBadge status={log.status} />
                  </div>

                  <p className="chl-card-desc">{log.description}</p>

                  <div className="chl-card-meta">
                    <span className="chl-meta-chip">
                      <Calendar size={12} aria-hidden="true" />
                      {formatDateTime(log.sentAt)}
                    </span>
                    <span className="chl-meta-chip">
                      <Users size={12} aria-hidden="true" />
                      {log.recipients.toLocaleString()} recipients
                    </span>
                    {log.status === "sent" && (
                      <>
                        <span className="chl-meta-chip chl-meta-success">
                          <CheckCircle2 size={12} aria-hidden="true" />
                          {log.delivered.toLocaleString()} delivered
                        </span>
                        {log.failed > 0 && (
                          <span className="chl-meta-chip chl-meta-error">
                            <XCircle size={12} aria-hidden="true" />
                            {log.failed.toLocaleString()} failed
                          </span>
                        )}
                      </>
                    )}
                    <span className="chl-meta-chip">
                      <Users size={12} aria-hidden="true" />
                      {log.sentBy}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </WorkspacePanel>
    </div>
  );
}