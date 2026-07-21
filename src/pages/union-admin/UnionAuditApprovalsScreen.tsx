import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  EmptyState,
  ErrorState,
  InternalTabs,
  LoadingState,
  RecordList,
  ScreenHeader,
  StatusBadge,
  type RecordListItem,
} from "../../components/union-admin/UnionAdminUi";
import {
  getUnionApprovals,
  getUnionAuditEvents,
  getUnionDocumentReferences,
  getUnionReviewComments,
  reviewUnionApproval,
  type UnionApprovalRecord,
  type UnionAuditEventRecord,
  type UnionDocumentReferenceRecord,
  type UnionReviewCommentRecord,
} from "../../services/unionAdminService";
import styles from "./UnionAdminScreens.module.css";

type GovernanceView = "approvals" | "audit" | "comments" | "documents";

type DetailRow = {
  label: string;
  value: string;
};

type GovernanceRecord = RecordListItem & {
  details: DetailRow[];
  approval?: UnionApprovalRecord;
  fileUrl?: string;
};

const views: Array<{ key: GovernanceView; label: string }> = [
  { key: "approvals", label: "Approval Queue" },
  { key: "audit", label: "Audit Events" },
  { key: "comments", label: "Review Comments" },
  { key: "documents", label: "Documents" },
];

const approvalStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

export interface UnionAuditApprovalsScreenProps {
  workspaceSlug: string;
  workspaceName: string;
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll(".", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMetadata(value: Record<string, unknown>) {
  if (!Object.keys(value).length) return "No metadata recorded";
  return JSON.stringify(value, null, 2);
}

function errorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { detail?: unknown } } }).response
      ?.data?.detail === "string"
  ) {
    return (error as { response: { data: { detail: string } } }).response.data
      .detail;
  }
  return "Governance records could not be loaded.";
}

function approvalRecord(approval: UnionApprovalRecord): GovernanceRecord {
  return {
    id: `approval-${approval.id}`,
    title: formatLabel(approval.action),
    subtitle: `${formatLabel(approval.subject_type)} #${approval.subject_id}`,
    status: approval.status,
    meta: `${approval.requested_by_email ?? "System request"} · ${formatDate(
      approval.created_at,
    )}`,
    approval,
    details: [
      { label: "Action", value: formatLabel(approval.action) },
      { label: "Subject type", value: formatLabel(approval.subject_type) },
      { label: "Subject ID", value: String(approval.subject_id) },
      {
        label: "Requested by",
        value: approval.requested_by_email ?? "System request",
      },
      { label: "Request reason", value: approval.reason || "Not recorded" },
      {
        label: "Reviewed by",
        value: approval.reviewed_by_email ?? "Not reviewed",
      },
      {
        label: "Decision reason",
        value: approval.decision_reason || "Not recorded",
      },
      { label: "Reviewed at", value: formatDate(approval.reviewed_at) },
      { label: "Created", value: formatDate(approval.created_at) },
      { label: "Metadata", value: formatMetadata(approval.metadata) },
    ],
  };
}

function auditRecord(event: UnionAuditEventRecord): GovernanceRecord {
  const target = event.target_type
    ? `${formatLabel(event.target_type)}${
        event.target_id === null ? "" : ` #${event.target_id}`
      }`
    : "Workspace";
  return {
    id: `audit-${event.id}`,
    title: formatLabel(event.action),
    subtitle: target,
    status: "RECORDED",
    meta: `${event.actor_email ?? "System"} · ${formatDate(event.created_at)}`,
    details: [
      { label: "Action", value: formatLabel(event.action) },
      { label: "Target", value: target },
      { label: "Actor", value: event.actor_email ?? "System" },
      { label: "Recorded", value: formatDate(event.created_at) },
      { label: "Metadata", value: formatMetadata(event.metadata) },
    ],
  };
}

function commentRecord(comment: UnionReviewCommentRecord): GovernanceRecord {
  return {
    id: `comment-${comment.id}`,
    title: comment.author_email ?? "Workspace reviewer",
    subtitle: `${formatLabel(comment.subject_type)} #${comment.subject_id}`,
    status: comment.is_internal ? "INTERNAL" : "SHARED",
    meta: formatDate(comment.created_at),
    details: [
      { label: "Comment", value: comment.body },
      { label: "Subject type", value: formatLabel(comment.subject_type) },
      { label: "Subject ID", value: String(comment.subject_id) },
      { label: "Author", value: comment.author_email ?? "System" },
      {
        label: "Visibility",
        value: comment.is_internal ? "Internal" : "Shared",
      },
      { label: "Created", value: formatDate(comment.created_at) },
      { label: "Updated", value: formatDate(comment.updated_at) },
    ],
  };
}

function documentRecord(
  document: UnionDocumentReferenceRecord,
): GovernanceRecord {
  return {
    id: `document-${document.id}`,
    title: document.title,
    subtitle: `${formatLabel(document.document_type)} · ${formatLabel(
      document.subject_type,
    )} #${document.subject_id}`,
    status: "AVAILABLE",
    meta: `${document.uploaded_by_email ?? "System"} · ${formatDate(
      document.created_at,
    )}`,
    fileUrl: document.file_url,
    details: [
      { label: "Document type", value: formatLabel(document.document_type) },
      { label: "Subject type", value: formatLabel(document.subject_type) },
      { label: "Subject ID", value: String(document.subject_id) },
      { label: "Uploaded by", value: document.uploaded_by_email ?? "System" },
      { label: "Created", value: formatDate(document.created_at) },
      { label: "File URL", value: document.file_url },
      { label: "Metadata", value: formatMetadata(document.metadata) },
    ],
  };
}

export default function UnionAuditApprovalsScreen({
  workspaceSlug,
  workspaceName,
}: UnionAuditApprovalsScreenProps) {
  const requestRef = useRef(0);
  const [view, setView] = useState<GovernanceView>("approvals");
  const [records, setRecords] = useState<GovernanceRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [decisionReason, setDecisionReason] = useState("");
  const [isDeciding, setIsDeciding] = useState(false);
  const [actionNotice, setActionNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const loadRecords = useCallback(async () => {
    const requestId = ++requestRef.current;
    setIsLoading(true);
    setLoadError("");
    setActionNotice("");
    setActionError("");

    try {
      let connectedRecords: GovernanceRecord[];
      if (view === "approvals") {
        const response = await getUnionApprovals(workspaceSlug, {
          status: statusFilter,
        });
        connectedRecords = response.results.map(approvalRecord);
      } else if (view === "audit") {
        const response = await getUnionAuditEvents(workspaceSlug);
        connectedRecords = response.results.map(auditRecord);
      } else if (view === "comments") {
        const response = await getUnionReviewComments(workspaceSlug);
        connectedRecords = response.results.map(commentRecord);
      } else {
        const response = await getUnionDocumentReferences(workspaceSlug);
        connectedRecords = response.results.map(documentRecord);
      }

      if (requestRef.current !== requestId) return;
      setRecords(connectedRecords);
      setSelectedId((current) =>
        connectedRecords.some((record) => record.id === current)
          ? current
          : connectedRecords[0]?.id,
      );
    } catch (error) {
      if (requestRef.current !== requestId) return;
      setRecords([]);
      setSelectedId(undefined);
      setLoadError(errorMessage(error));
    } finally {
      if (requestRef.current === requestId) setIsLoading(false);
    }
  }, [statusFilter, view, workspaceSlug]);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

  const visibleRecords = useMemo(() => {
    const normalizedSearch = appliedSearch.trim().toLowerCase();
    if (!normalizedSearch) return records;
    return records.filter((record) =>
      [record.title, record.subtitle, record.status, record.meta]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(normalizedSearch)),
    );
  }, [appliedSearch, records]);

  useEffect(() => {
    if (!visibleRecords.some((record) => record.id === selectedId)) {
      setSelectedId(visibleRecords[0]?.id);
    }
  }, [selectedId, visibleRecords]);

  const selectedRecord = visibleRecords.find(
    (record) => record.id === selectedId,
  );
  const pendingCount = records.filter(
    (record) => record.status === "PENDING",
  ).length;
  const completedCount = records.filter((record) =>
    ["APPROVED", "REJECTED", "CANCELLED", "RECORDED", "AVAILABLE"].includes(
      record.status,
    ),
  ).length;

  function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(search);
  }

  function handleViewChange(nextView: GovernanceView) {
    setView(nextView);
    setStatusFilter("ALL");
    setSearch("");
    setAppliedSearch("");
    setDecisionReason("");
  }

  async function handleDecision(decision: "APPROVED" | "REJECTED") {
    const approval = selectedRecord?.approval;
    if (!approval || approval.status !== "PENDING") return;

    setIsDeciding(true);
    setActionError("");
    setActionNotice("");
    try {
      const updated = await reviewUnionApproval(workspaceSlug, approval.id, {
        decision,
        decision_reason: decisionReason.trim(),
      });
      const updatedRecord = approvalRecord(updated);
      setRecords((current) =>
        current.map((record) =>
          record.id === updatedRecord.id ? updatedRecord : record,
        ),
      );
      setSelectedId(updatedRecord.id);
      setDecisionReason("");
      setActionNotice(
        decision === "APPROVED"
          ? "The approval request was approved."
          : "The approval request was rejected.",
      );
    } catch (error) {
      setActionError(errorMessage(error));
    } finally {
      setIsDeciding(false);
    }
  }

  return (
    <section className={styles.screen}>
      <ScreenHeader
        eyebrow="Audit & Approvals"
        title="Approval queue and audit evidence"
        description={`Review decisions, immutable audit events, comments and documents for ${workspaceName}.`}
      />

      <InternalTabs
        label="Governance record views"
        items={views}
        active={view}
        onChange={handleViewChange}
      />

      <form className={styles.toolbar} onSubmit={handleFilter}>
        <label>
          Search
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Action, subject, person or document"
          />
        </label>
        {view === "approvals" ? (
          <label>
            Status
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All statuses</option>
              {approvalStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatLabel(status)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button type="submit">Apply filters</button>
      </form>

      <div className={styles.heroSummaryGrid}>
        <article>
          <span>Records</span>
          <strong>{visibleRecords.length}</strong>
          <small>Visible in the selected governance view.</small>
        </article>
        <article>
          <span>Pending decisions</span>
          <strong>{pendingCount}</strong>
          <small>Approval requests that still require a decision.</small>
        </article>
        <article>
          <span>Recorded or completed</span>
          <strong>{completedCount}</strong>
          <small>Final decisions and preserved governance evidence.</small>
        </article>
      </div>

      {isLoading ? <LoadingState label="Loading governance records…" /> : null}
      {!isLoading && loadError ? <ErrorState message={loadError} /> : null}
      {!isLoading && !loadError && !visibleRecords.length ? (
        <EmptyState
          title="No governance records"
          description="The backend returned no records matching this workspace view and filter."
        />
      ) : null}

      {!isLoading && !loadError && selectedRecord ? (
        <div className={styles.masterDetail}>
          <RecordList
            records={visibleRecords}
            selectedId={selectedRecord.id}
            onSelect={setSelectedId}
          />
          <article>
            <StatusBadge>{formatLabel(selectedRecord.status)}</StatusBadge>
            <h3>{selectedRecord.title}</h3>
            <p>{selectedRecord.subtitle}</p>
            {selectedRecord.meta ? <p>{selectedRecord.meta}</p> : null}
            <dl>
              {selectedRecord.details.map((detail) => (
                <div key={detail.label}>
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>

            {selectedRecord.fileUrl ? (
              <div className={styles.actionRow}>
                <a
                  href={selectedRecord.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open document
                </a>
              </div>
            ) : null}

            {selectedRecord.approval?.status === "PENDING" ? (
              <div className={styles.form}>
                <label>
                  Decision reason
                  <textarea
                    value={decisionReason}
                    onChange={(event) => setDecisionReason(event.target.value)}
                    placeholder="Add a clear reason for this decision"
                  />
                </label>
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    disabled={isDeciding}
                    onClick={() => void handleDecision("APPROVED")}
                  >
                    {isDeciding ? "Saving…" : "Approve request"}
                  </button>
                  <button
                    type="button"
                    className={styles.subtleButton}
                    disabled={isDeciding}
                    onClick={() => void handleDecision("REJECTED")}
                  >
                    Reject request
                  </button>
                </div>
              </div>
            ) : null}

            {actionNotice ? (
              <p className={styles.workflowNotice}>{actionNotice}</p>
            ) : null}
            {actionError ? <ErrorState message={actionError} /> : null}
          </article>
        </div>
      ) : null}
    </section>
  );
}
