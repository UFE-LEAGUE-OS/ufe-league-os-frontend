import { useCallback, useRef, useState } from "react";
import {
  Bold,
  Calendar,
  Clock,
  Eye,
  ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Megaphone,
  RotateCcw,
  Send,
  Underline,
  Users,
  AlertTriangle,
  Info,
  CheckCheck,
} from "lucide-react";
import {
  WorkspacePanel,
  adminWorkspaceStyles as styles,
} from "../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AnnouncementType = "alert" | "info" | "promotion" | "event" | "general";

type AudienceCategory =
  | "all_members"
  | "active_members"
  | "pending_members"
  | "season_ticket_holders"
  | "vip_premium"
  | "staff_only"
  | "custom";

type ScheduleMode = "publish_now" | "schedule_later";

type ConfirmationDetails = {
  title: string;
  audience: string;
  type: string;
  schedule: string;
  sentAt: string;
  recipients: number;
};

const AUDIENCE_LABELS: Record<AudienceCategory, string> = {
  all_members: "All Members",
  active_members: "Active Members",
  pending_members: "Pending Members",
  season_ticket_holders: "Season Ticket Holders",
  vip_premium: "VIP & Premium Members",
  staff_only: "Staff Only",
  custom: "Custom Selection",
};

const AUDIENCE_COUNTS: Record<AudienceCategory, number> = {
  all_members: 12500,
  active_members: 8700,
  pending_members: 340,
  season_ticket_holders: 3200,
  vip_premium: 450,
  staff_only: 85,
  custom: 0,
};

const TYPE_LABELS: Record<AnnouncementType, string> = {
  alert: "Alert",
  info: "Info",
  promotion: "Promotion",
  event: "Event",
  general: "General",
};

// ---------------------------------------------------------------------------
// Toolbar button helper
// ---------------------------------------------------------------------------

function ToolbarButton({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: typeof Bold;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`ann-richtext-btn${isActive ? " ann-richtext-btn-active" : ""}`}
      onClick={onClick}
      title={label}
      aria-label={label}
    >
      <Icon size={16} strokeWidth={2.2} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AnnouncementsCompose() {
  // ----- Form state -----
  const [title, setTitle] = useState("");
  const [messageHtml, setMessageHtml] = useState("");
  const [type, setType] = useState<AnnouncementType>("general");
  const [audience, setAudience] = useState<AudienceCategory>("all_members");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("publish_now");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // ----- Rich text formatting -----
  const editorRef = useRef<HTMLDivElement>(null);
  const [formats, setFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  const execCommand = useCallback(
    (command: string, value?: string) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      // Update format states
      setFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
      });
    },
    [],
  );

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      setMessageHtml(editorRef.current.innerHTML);
    }
  }, []);

  const insertLink = useCallback(() => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
    }
  }, [execCommand]);

  const insertImage = useCallback(() => {
    const url = prompt("Enter image URL:");
    if (url) {
      execCommand("insertImage", url);
    }
  }, [execCommand]);

  // ----- Submitting -----
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationDetails | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const plainText = editorRef.current?.textContent ?? "";
    if (!title.trim() || !plainText.trim()) {
      setSubmitError("Title and message are required.");
      return;
    }

    if (scheduleMode === "schedule_later" && (!scheduledDate || !scheduledTime)) {
      setSubmitError("Please select a scheduled date and time.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const now = new Date();
      setConfirmation({
        title: title.trim(),
        audience: AUDIENCE_LABELS[audience],
        type: TYPE_LABELS[type],
        schedule:
          scheduleMode === "publish_now"
            ? "Published immediately"
            : `Scheduled for ${scheduledDate} at ${scheduledTime}`,
        sentAt: now.toLocaleString("en-UG"),
        recipients: AUDIENCE_COUNTS[audience],
      });
      setShowConfirmation(true);
      setTitle("");
      setMessageHtml("");
      setScheduledDate("");
      setScheduledTime("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    } catch {
      setSubmitError("Failed to create announcement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartOver = () => {
    setShowConfirmation(false);
    setConfirmation(null);
    setSubmitError("");
  };

  // ----- Render -----

  if (showConfirmation && confirmation) {
    return (
      <WorkspacePanel
        eyebrow="Communications"
        title="Announcement Sent"
        description="Your announcement has been processed successfully."
      >
        <div className="ann-confirmation">
          <div className="ann-confirmation-icon-wrap">
            <CheckCheck size={48} strokeWidth={1.5} />
          </div>

          <h2 className="ann-confirmation-heading">Announcement Sent Successfully</h2>
          <p className="ann-confirmation-sub">
            Your message has been queued for delivery to the selected audience.
          </p>

          <div className="ann-confirmation-details">
            <div className="ann-confirmation-row">
              <span className="ann-confirmation-label">Title</span>
              <span className="ann-confirmation-value">{confirmation.title}</span>
            </div>
            <div className="ann-confirmation-row">
              <span className="ann-confirmation-label">Type</span>
              <span className="ann-confirmation-value">
                <span className={`ann-type-badge ann-type-${type}`}>
                  {confirmation.type}
                </span>
              </span>
            </div>
            <div className="ann-confirmation-row">
              <span className="ann-confirmation-label">
                <Users size={14} /> Audience
              </span>
              <span className="ann-confirmation-value">{confirmation.audience}</span>
            </div>
            <div className="ann-confirmation-row">
              <span className="ann-confirmation-label">
                <Clock size={14} /> Schedule
              </span>
              <span className="ann-confirmation-value">{confirmation.schedule}</span>
            </div>
            <div className="ann-confirmation-row">
              <span className="ann-confirmation-label">
                <Send size={14} /> Sent at
              </span>
              <span className="ann-confirmation-value">{confirmation.sentAt}</span>
            </div>
            <div className="ann-confirmation-row">
              <span className="ann-confirmation-label">
                <Users size={14} /> Recipients
              </span>
              <span className="ann-confirmation-value">
                {confirmation.recipients.toLocaleString()} members
              </span>
            </div>
          </div>

          <div className="ann-confirmation-actions">
            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleStartOver}
            >
              <Megaphone size={16} />
              Compose Another
            </button>
          </div>
        </div>
      </WorkspacePanel>
    );
  }

  return (
    <WorkspacePanel
      eyebrow="Communications"
      title="Announcement Composer"
      description="Create rich announcements, choose your audience, and publish or schedule them."
    >
      {/* Notification banners */}
      {submitError && (
        <div className="ann-error-banner">
          <AlertTriangle size={18} />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="ann-compose-form">
        {/* ---- Title ---- */}
        <div className="ann-field">
          <label htmlFor="ann-title">
            <Megaphone size={16} />
            Title
          </label>
          <input
            id="ann-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter announcement title..."
            maxLength={200}
          />
          <small>{title.length}/200 characters</small>
        </div>

        {/* ---- Type + Audience row ---- */}
        <div className="ann-field-row">
          <div className="ann-field">
            <label htmlFor="ann-type">
              <Info size={16} />
              Type
            </label>
            <select
              id="ann-type"
              value={type}
              onChange={(e) => setType(e.target.value as AnnouncementType)}
            >
              <option value="general">General</option>
              <option value="info">Info</option>
              <option value="alert">Alert</option>
              <option value="promotion">Promotion</option>
              <option value="event">Event</option>
            </select>
          </div>

          <div className="ann-field">
            <label htmlFor="ann-audience">
              <Users size={16} />
              Audience
            </label>
            <select
              id="ann-audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value as AudienceCategory)}
            >
              {(
                Object.entries(AUDIENCE_LABELS) as [AudienceCategory, string][]
              ).map(([key, label]) => (
                <option key={key} value={key}>
                  {label} ({AUDIENCE_COUNTS[key].toLocaleString()})
                </option>
              ))}
            </select>
            <small className="ann-audience-hint">
              <Users size={12} />
              {AUDIENCE_COUNTS[audience].toLocaleString()} recipients estimated
            </small>
          </div>
        </div>

        {/* ---- Rich text editor ---- */}
        <div className="ann-field">
          <label>Message</label>

          <div className="ann-richtext-toolbar">
            <ToolbarButton
              icon={Bold}
              label="Bold"
              isActive={formats.bold}
              onClick={() => execCommand("bold")}
            />
            <ToolbarButton
              icon={Italic}
              label="Italic"
              isActive={formats.italic}
              onClick={() => execCommand("italic")}
            />
            <ToolbarButton
              icon={Underline}
              label="Underline"
              isActive={formats.underline}
              onClick={() => execCommand("underline")}
            />

            <span className="ann-richtext-sep" />

            <ToolbarButton
              icon={List}
              label="Bullet list"
              onClick={() => execCommand("insertUnorderedList")}
            />
            <ToolbarButton
              icon={ListOrdered}
              label="Numbered list"
              onClick={() => execCommand("insertOrderedList")}
            />

            <span className="ann-richtext-sep" />

            <ToolbarButton icon={Link} label="Insert link" onClick={insertLink} />
            <ToolbarButton
              icon={ImageIcon}
              label="Insert image"
              onClick={insertImage}
            />
          </div>

          <div
            ref={editorRef}
            className="ann-richtext-editor"
            contentEditable
            onInput={handleEditorInput}
            onMouseUp={() =>
              setFormats({
                bold: document.queryCommandState("bold"),
                italic: document.queryCommandState("italic"),
                underline: document.queryCommandState("underline"),
              })
            }
            onKeyUp={() =>
              setFormats({
                bold: document.queryCommandState("bold"),
                italic: document.queryCommandState("italic"),
                underline: document.queryCommandState("underline"),
              })
            }
            data-placeholder="Write your announcement message here..."
            suppressContentEditableWarning
          />

          {/* Preview toggle */}
          {messageHtml && (
            <details className="ann-preview-toggle">
              <summary>
                <Eye size={14} />
                Preview message
              </summary>
              <div
                className="ann-preview-content"
                dangerouslySetInnerHTML={{ __html: messageHtml }}
              />
            </details>
          )}
        </div>

        {/* ---- Schedule / Publish toggle ---- */}
        <div className="ann-field">
          <label>Schedule</label>

          <div className="ann-schedule-toggle">
            <button
              type="button"
              className={`ann-schedule-option${
                scheduleMode === "publish_now" ? " ann-schedule-option-active" : ""
              }`}
              onClick={() => setScheduleMode("publish_now")}
            >
              <Send size={16} />
              <div>
                <strong>Publish Immediately</strong>
                <span>Send right away to the selected audience</span>
              </div>
            </button>

            <button
              type="button"
              className={`ann-schedule-option${
                scheduleMode === "schedule_later" ? " ann-schedule-option-active" : ""
              }`}
              onClick={() => setScheduleMode("schedule_later")}
            >
              <Calendar size={16} />
              <div>
                <strong>Schedule for Later</strong>
                <span>Choose a specific date and time</span>
              </div>
            </button>
          </div>

          {scheduleMode === "schedule_later" && (
            <div className="ann-schedule-datetime">
              <div className="ann-field">
                <label htmlFor="ann-sched-date">Date</label>
                <input
                  id="ann-sched-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                />
              </div>
              <div className="ann-field">
                <label htmlFor="ann-sched-time">Time</label>
                <input
                  id="ann-sched-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* ---- Actions ---- */}
        <div className="ann-form-actions">
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setTitle("");
              setMessageHtml("");
              setScheduledDate("");
              setScheduledTime("");
              setSubmitError("");
              if (editorRef.current) editorRef.current.innerHTML = "";
            }}
            disabled={isSubmitting}
          >
            <RotateCcw size={16} />
            Reset
          </button>
          <button
            type="submit"
            className={styles.primaryButton}
            disabled={isSubmitting}
          >
            <Send size={16} />
            {isSubmitting
              ? "Sending..."
              : scheduleMode === "publish_now"
                ? "Publish Announcement"
                : "Schedule Announcement"}
          </button>
        </div>
      </form>
    </WorkspacePanel>
  );
}