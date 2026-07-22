import { useState } from "react";
import {
  ExternalLink,
  FileText,
  Megaphone,
  Calendar,
  Building2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Search,
  ArrowUpDown,
  type LucideIcon,
} from "lucide-react";
import { WorkspacePanel } from "../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";

type NoticePriority = "high" | "medium" | "low";
type NoticeStatus = "active" | "archived";

type NoticeCircular = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  priority: NoticePriority;
  status: NoticeStatus;
  issuedBy: string;
  dateIssued: string;
  effectiveDate: string;
  category: string;
  attachments?: number;
};

const NOTICES_DATA: NoticeCircular[] = [
  {
    id: "nc-001",
    title: "League Rule Amendment 2026/27",
    description:
      "Updated league rules regarding player substitutions and matchday protocols for the upcoming season.",
    icon: FileText,
    priority: "high",
    status: "active",
    issuedBy: "UFE League Committee",
    dateIssued: "2026-07-15",
    effectiveDate: "2026-08-01",
    category: "Regulatory",
    attachments: 2,
  },
  {
    id: "nc-002",
    title: "Stadium Safety Compliance Update",
    description:
      "New safety requirements for all home venues. Clubs must submit updated safety certificates by August 15th.",
    icon: Shield,
    priority: "high",
    status: "active",
    issuedBy: "UFE Safety & Security",
    dateIssued: "2026-07-10",
    effectiveDate: "2026-08-15",
    category: "Compliance",
    attachments: 1,
  },
  {
    id: "nc-003",
    title: "Season Ticket Pricing Guidelines",
    description:
      "Approved pricing bands for season tickets for the 2026/27 season. Clubs are to adhere to the minimum and maximum thresholds.",
    icon: Megaphone,
    priority: "medium",
    status: "active",
    issuedBy: "UFE Commercial Department",
    dateIssued: "2026-07-08",
    effectiveDate: "2026-08-01",
    category: "Ticketing",
  },
  {
    id: "nc-004",
    title: "Youth Academy Registration Deadline",
    description:
      "All clubs must register their youth academy categories and squads before the start of the season.",
    icon: Building2,
    priority: "medium",
    status: "active",
    issuedBy: "UFE Youth Development",
    dateIssued: "2026-06-20",
    effectiveDate: "2026-08-20",
    category: "Registration",
  },
  {
    id: "nc-005",
    title: "Broadcast & Media Rights Circular",
    description:
      "Media accreditation process and broadcast requirements for the upcoming season.",
    icon: ExternalLink,
    priority: "low",
    status: "archived",
    issuedBy: "UFE Media & Communications",
    dateIssued: "2026-05-15",
    effectiveDate: "2026-06-01",
    category: "Media",
    attachments: 3,
  },
  {
    id: "nc-006",
    title: "Anti-Doping Education Programme",
    description:
      "Mandatory anti-doping awareness sessions for all registered players and coaching staff.",
    icon: AlertTriangle,
    priority: "medium",
    status: "active",
    issuedBy: "UFE Medical Commission",
    dateIssued: "2026-07-01",
    effectiveDate: "2026-09-01",
    category: "Welfare",
    attachments: 1,
  },
];

function PriorityBadge({ priority }: { priority: NoticePriority }) {
  const colors: Record<NoticePriority, string> = {
    high: "ncl-priority-high",
    medium: "ncl-priority-medium",
    low: "ncl-priority-low",
  };
  const labels: Record<NoticePriority, string> = {
    high: "High",
    medium: "Medium",
    low: "Low",
  };
  return (
    <span className={`ncl-priority-badge ${colors[priority]}`}>
      {priority === "high" ? (
        <AlertTriangle size={12} />
      ) : (
        <CheckCircle2 size={12} />
      )}
      {labels[priority]}
    </span>
  );
}

function formatDate(isoString: string) {
  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
  }).format(new Date(isoString));
}

export default function NoticesCirculars() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [sortAsc, setSortAsc] = useState(false);

  const categories = Array.from(new Set(NOTICES_DATA.map((n) => n.category)));
  const priorities: NoticePriority[] = ["high", "medium", "low"];

  const filtered = NOTICES_DATA.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "ALL" || notice.category === filterCategory;
    const matchesPriority =
      filterPriority === "ALL" || notice.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  }).sort((a, b) => {
    const dateA = new Date(a.dateIssued).getTime();
    const dateB = new Date(b.dateIssued).getTime();
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

  const activeCount = NOTICES_DATA.filter((n) => n.status === "active").length;
  const highPriorityCount = NOTICES_DATA.filter(
    (n) => n.priority === "high" && n.status === "active",
  ).length;

  return (
    <div className="notices-circulars-page">
      {/* Stats */}
      <div className="ncl-stats-row">
        <div className="ncl-stat-card">
          <Megaphone size={22} aria-hidden="true" />
          <strong>{NOTICES_DATA.length}</strong>
          <span>Total Notices</span>
        </div>
        <div className="ncl-stat-card ncl-stat-active">
          <CheckCircle2 size={22} aria-hidden="true" />
          <strong>{activeCount}</strong>
          <span>Active</span>
        </div>
        <div className="ncl-stat-card ncl-stat-high">
          <AlertTriangle size={22} aria-hidden="true" />
          <strong>{highPriorityCount}</strong>
          <span>High Priority</span>
        </div>
      </div>

      {/* Filters */}
      <WorkspacePanel
        title="Notices & Circulars"
        description="Official communications, regulatory updates, and circulars issued by the league."
      >
        <div className="ncl-filters">
          <div className="ncl-search-wrap">
            <Search size={15} className="ncl-search-icon" />
            <input
              type="text"
              className="ncl-search-input"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="ncl-filter-select"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="ncl-filter-select"
          >
            <option value="ALL">All Priorities</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="ncl-sort-btn"
            onClick={() => setSortAsc(!sortAsc)}
            title={sortAsc ? "Sort newest first" : "Sort oldest first"}
          >
            <ArrowUpDown size={15} />
            {sortAsc ? "Oldest" : "Newest"}
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="ncl-empty">
            <FileText size={40} aria-hidden="true" />
            <strong>No notices found</strong>
            <span>Try adjusting your search or filter criteria.</span>
          </div>
        ) : (
          <div className="ncl-list">
            {filtered.map((notice) => {
              const Icon = notice.icon;
              return (
                <div
                  key={notice.id}
                  className={`ncl-card ${
                    notice.status === "archived" ? "ncl-card-archived" : ""
                  }`}
                >
                  <div className="ncl-card-header">
                    <div className="ncl-card-icon-wrap">
                      <Icon size={20} aria-hidden="true" />
                    </div>
                    <div className="ncl-card-title-group">
                      <strong>{notice.title}</strong>
                      <span className="ncl-card-category">
                        {notice.category}
                      </span>
                    </div>
                    <PriorityBadge priority={notice.priority} />
                  </div>

                  <p className="ncl-card-desc">{notice.description}</p>

                  <div className="ncl-card-meta">
                    <span className="ncl-meta-chip">
                      <Calendar size={12} aria-hidden="true" />
                      Issued: {formatDate(notice.dateIssued)}
                    </span>
                    <span className="ncl-meta-chip">
                      Effective: {formatDate(notice.effectiveDate)}
                    </span>
                    <span className="ncl-meta-chip">
                      <Building2 size={12} aria-hidden="true" />
                      {notice.issuedBy}
                    </span>
                    {notice.attachments && (
                      <span className="ncl-meta-chip">
                        {notice.attachments} attachment
                        {notice.attachments > 1 ? "s" : ""}
                      </span>
                    )}
                    <span
                      className={`ncl-status-chip ${
                        notice.status === "active"
                          ? "ncl-status-active"
                          : "ncl-status-archived"
                      }`}
                    >
                      {notice.status === "active" ? "Active" : "Archived"}
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