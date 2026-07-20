import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Calendar,
  Shield,
  Users,
  DollarSign,
  Building2,
  TicketCheck,
  Megaphone,
  Award,
  type LucideIcon,
} from "lucide-react";
import { WorkspacePanel } from "../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";

type ChecklistStatus = "completed" | "pending" | "overdue";

type ChecklistItem = {
  id: string;
  category: string;
  label: string;
  description: string;
  icon: LucideIcon;
  status: ChecklistStatus;
  dueDate: string;
  assignedTo?: string;
  notes?: string;
};

type CategoryGroup = {
  label: string;
  items: ChecklistItem[];
};

const CHECKLIST_DATA: CategoryGroup[] = [
  {
    label: "Registration & Licensing",
    items: [
      {
        id: "cl-reg-1",
        category: "Registration & Licensing",
        label: "Club Registration Form",
        description: "Submit the annual club registration form with updated club details.",
        icon: FileText,
        status: "completed",
        dueDate: "2026-03-31",
        assignedTo: "Club Secretary",
        notes: "Filed on 2026-03-15",
      },
      {
        id: "cl-reg-2",
        category: "Registration & Licensing",
        label: "Season License Application",
        description: "Apply for the 2026/27 season participation license.",
        icon: Shield,
        status: "pending",
        dueDate: "2026-08-15",
        assignedTo: "Club Administrator",
      },
      {
        id: "cl-reg-3",
        category: "Registration & Licensing",
        label: "Club Officials Registration",
        description: "Register all club officials including board members and management.",
        icon: Users,
        status: "overdue",
        dueDate: "2026-05-01",
        assignedTo: "Club Secretary",
        notes: "2 board members still pending",
      },
    ],
  },
  {
    label: "Player Compliance",
    items: [
      {
        id: "cl-play-1",
        category: "Player Compliance",
        label: "Player Contracts Filing",
        description: "Submit all signed player contracts for the current season.",
        icon: FileText,
        status: "completed",
        dueDate: "2026-02-28",
        assignedTo: "Team Manager",
        notes: "25 contracts filed",
      },
      {
        id: "cl-play-2",
        category: "Player Compliance",
        label: "Medical Insurance Verification",
        description: "Verify and submit proof of medical insurance for all registered players.",
        icon: Shield,
        status: "pending",
        dueDate: "2026-07-01",
        assignedTo: "Team Manager",
      },
      {
        id: "cl-play-3",
        category: "Player Compliance",
        label: "Youth Player Safeguarding",
        description: "Complete safeguarding certification for staff working with youth players.",
        icon: Award,
        status: "pending",
        dueDate: "2026-09-01",
      },
    ],
  },
  {
    label: "Financial Compliance",
    items: [
      {
        id: "cl-fin-1",
        category: "Financial Compliance",
        label: "Annual Financial Statement",
        description: "Submit audited financial statements for the previous fiscal year.",
        icon: DollarSign,
        status: "overdue",
        dueDate: "2026-04-30",
        assignedTo: "Treasurer",
        notes: "Audit still in progress",
      },
      {
        id: "cl-fin-2",
        category: "Financial Compliance",
        label: "Tax Clearance Certificate",
        description: "Provide current tax clearance certificate from the revenue authority.",
        icon: ClipboardCheck,
        status: "pending",
        dueDate: "2026-06-30",
        assignedTo: "Treasurer",
      },
    ],
  },
  {
    label: "Matchday & Facilities",
    items: [
      {
        id: "cl-match-1",
        category: "Matchday & Facilities",
        label: "Stadium Safety Certificate",
        description: "Obtain and display current stadium safety certificate for home venues.",
        icon: Building2,
        status: "completed",
        dueDate: "2026-01-31",
        assignedTo: "Facilities Manager",
        notes: "Certificate valid until Dec 2026",
      },
      {
        id: "cl-match-2",
        category: "Matchday & Facilities",
        label: "Matchday Medical Coverage",
        description: "Confirm medical staff and ambulance coverage for all home matches.",
        icon: TicketCheck,
        status: "pending",
        dueDate: "2026-08-01",
        assignedTo: "Team Manager",
      },
      {
        id: "cl-match-3",
        category: "Matchday & Facilities",
        label: "Broadcast & Media Rights",
        description: "Complete broadcast compliance and media accreditation forms.",
        icon: Megaphone,
        status: "pending",
        dueDate: "2026-07-15",
      },
    ],
  },
];

function StatusIcon({ status }: { status: ChecklistStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 size={18} className="ccl-status-icon ccl-completed-icon" />;
    case "pending":
      return <Circle size={18} className="ccl-status-icon ccl-pending-icon" />;
    case "overdue":
      return <AlertTriangle size={18} className="ccl-status-icon ccl-overdue-icon" />;
  }
}

function formatDate(isoString: string) {
  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
  }).format(new Date(isoString));
}

function daysUntil(dateString: string): number {
  const target = new Date(dateString).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export default function ComplianceChecklist() {
  const [items, setItems] = useState<ChecklistItem[]>(
    () => CHECKLIST_DATA.flatMap((group) => group.items),
  );

  function toggleStatus(id: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus: Record<ChecklistStatus, ChecklistStatus> = {
          completed: "pending",
          pending: "completed",
          overdue: "pending",
        };
        return { ...item, status: nextStatus[item.status] };
      }),
    );
  }

  const stats = {
    total: items.length,
    completed: items.filter((i) => i.status === "completed").length,
    pending: items.filter((i) => i.status === "pending").length,
    overdue: items.filter((i) => i.status === "overdue").length,
  };

  const completionPercent =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Group items by category for rendering
  const groups: CategoryGroup[] = CHECKLIST_DATA.map((group) => ({
    ...group,
    items: items.filter((item) => item.category === group.label),
  }));

  return (
    <div className="compliance-checklist-page">
      {/* Stats */}
      <div className="ccl-stats-row">
        <div className="ccl-stat-card ccl-stat-progress">
          <div className="ccl-progress-circle">
            <svg viewBox="0 0 36 36" className="ccl-progress-svg">
              <path
                className="ccl-progress-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="ccl-progress-fill"
                strokeDasharray={`${completionPercent}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="ccl-progress-text">{completionPercent}%</span>
          </div>
          <div>
            <strong>Overall Progress</strong>
            <span>
              {stats.completed} of {stats.total} items completed
            </span>
          </div>
        </div>
        <div className="ccl-stat-card ccl-stat-green">
          <CheckCircle2 size={22} aria-hidden="true" />
          <strong>{stats.completed}</strong>
          <span>Completed</span>
        </div>
        <div className="ccl-stat-card ccl-stat-amber">
          <Circle size={22} aria-hidden="true" />
          <strong>{stats.pending}</strong>
          <span>Pending</span>
        </div>
        <div className="ccl-stat-card ccl-stat-red">
          <AlertTriangle size={22} aria-hidden="true" />
          <strong>{stats.overdue}</strong>
          <span>Overdue</span>
        </div>
      </div>

      {/* Filter tabs */}
      {/* Checklist groups */}
      {groups.map((group) => (
        <WorkspacePanel
          key={group.label}
          title={group.label}
          description={`${group.items.filter((i) => i.status === "completed").length} of ${group.items.length} items completed`}
        >
          <div className="ccl-items">
            {group.items.map((item) => {
              const Icon = item.icon;
              const daysLeft = daysUntil(item.dueDate);
              const isUrgent = daysLeft <= 30 && daysLeft > 0;
              const isPastDue = daysLeft < 0;

              return (
                <div
                  key={item.id}
                  className={`ccl-item ${item.status === "completed" ? "ccl-item-done" : ""}`}
                >
                  <button
                    type="button"
                    className="ccl-toggle-btn"
                    onClick={() => toggleStatus(item.id)}
                    aria-label={
                      item.status === "completed"
                        ? "Mark as pending"
                        : "Mark as completed"
                    }
                    title={
                      item.status === "completed"
                        ? "Mark as pending"
                        : "Mark as completed"
                    }
                  >
                    <StatusIcon status={item.status} />
                  </button>

                  <div className="ccl-item-body">
                    <div className="ccl-item-header">
                      <Icon size={16} className="ccl-item-icon" aria-hidden="true" />
                      <strong>{item.label}</strong>
                    </div>
                    <p className="ccl-item-desc">{item.description}</p>

                    <div className="ccl-item-meta">
                      <span className="ccl-meta-chip">
                        <Calendar size={12} aria-hidden="true" />
                        Due {formatDate(item.dueDate)}
                        {isPastDue && (
                          <span className="ccl-overdue-label">
                            ({Math.abs(daysLeft)} days overdue)
                          </span>
                        )}
                        {isUrgent && !isPastDue && (
                          <span className="ccl-urgent-label">
                            ({daysLeft} days left)
                          </span>
                        )}
                      </span>

                      {item.assignedTo && (
                        <span className="ccl-meta-chip">
                          <Users size={12} aria-hidden="true" />
                          {item.assignedTo}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <div className="ccl-item-notes">
                        <span>Note: {item.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </WorkspacePanel>
      ))}
    </div>
  );
}