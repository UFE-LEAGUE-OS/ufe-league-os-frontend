import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  RecordList,
  ScreenHeader,
  StatusBadge,
} from "../../components/union-admin/UnionAdminUi";
import {
  approveUnionPlayerRegistration,
  assignUnionPlayerRegistrationReviewer,
  getUnionPlayerRegistrationSubmissionDetail,
  getUnionPlayerRegistrationSubmissions,
  rejectUnionPlayerRegistration,
  requestUnionPlayerRegistrationChanges,
  startUnionPlayerRegistrationReview,
  type UnionPlayerRegistrationSubmission,
  type UnionPlayerRegistrationSubmissionDetail,
  type UnionRegistrationValidationItem,
} from "../../services/unionAdminService";
import styles from "./UnionRegistrationsScreen.module.css";

const statusOptions = [
  "ALL",
  "SUBMITTED",
  "UNDER_REVIEW",
  "CHANGES_REQUESTED",
  "APPROVED",
  "REJECTED",
  "WITHDRAWN",
];

function formatValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "Not recorded";
  return String(value).replaceAll("_", " ");
}

function documentLabel(document: unknown, index: number) {
  if (typeof document === "string") return document;
  if (document && typeof document === "object") {
    const record = document as Record<string, unknown>;
    return String(record.name || record.label || record.reference || `Document ${index + 1}`);
  }
  return `Document ${index + 1}`;
}

function messageFor(error: unknown) {
  const response = (error as { response?: { status?: number; data?: { detail?: string } } })?.response;
  if (response?.status === 403) {
    return "You do not have permission to review registrations in this workspace.";
  }
  return response?.data?.detail || "Registration submissions could not be loaded. Please retry.";
}

function ValidationList({ title, items }: { title: string; items?: UnionRegistrationValidationItem[] }) {
  if (!items?.length) return null;
  return (
    <section className={styles.validationGroup}>
      <h4>{title}</h4>
      <ul>
        {items.map((item, index) => (
          <li key={`${item.code}-${index}`}>
            <strong>{formatValue(item.field)}</strong>
            <span>{item.message}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface UnionRegistrationsScreenProps {
  workspaceSlug: string;
  workspaceName: string;
  canManage?: boolean;
  canApprove?: boolean;
}

export default function UnionRegistrationsScreen({
  workspaceSlug,
  workspaceName,
  canManage = false,
  canApprove = false,
}: UnionRegistrationsScreenProps) {
  const requestGeneration = useRef(0);
  const detailGeneration = useRef(0);
  const [submissions, setSubmissions] = useState<UnionPlayerRegistrationSubmission[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<UnionPlayerRegistrationSubmissionDetail | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSubmissions = useCallback(async () => {
    const generation = ++requestGeneration.current;
    setLoading(true);
    setError("");
    setNotice("");
    setSelectedId(null);
    setDetail(null);
    try {
      const response = await getUnionPlayerRegistrationSubmissions(workspaceSlug, {
        search,
        status,
      });
      if (requestGeneration.current !== generation) return;
      setSubmissions(response.results ?? []);
      setSelectedId(response.results?.[0]?.id ?? null);
    } catch (loadError) {
      if (requestGeneration.current === generation) setError(messageFor(loadError));
    } finally {
      if (requestGeneration.current === generation) setLoading(false);
    }
  }, [search, status, workspaceSlug]);

  useEffect(() => {
    setSearchInput("");
    setSearch("");
    setStatus("ALL");
  }, [workspaceSlug]);

  useEffect(() => {
    void loadSubmissions();
    return () => {
      requestGeneration.current += 1;
    };
  }, [loadSubmissions]);

  useEffect(() => {
    const generation = ++detailGeneration.current;
    setDetail(null);
    setReason("");
    if (selectedId === null) return;
    setDetailLoading(true);
    getUnionPlayerRegistrationSubmissionDetail(workspaceSlug, selectedId)
      .then((response) => {
        if (detailGeneration.current === generation) setDetail(response);
      })
      .catch((loadError) => {
        if (detailGeneration.current === generation) setError(messageFor(loadError));
      })
      .finally(() => {
        if (detailGeneration.current === generation) setDetailLoading(false);
      });
    return () => {
      detailGeneration.current += 1;
    };
  }, [selectedId, workspaceSlug]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  function replaceSubmission(updated: UnionPlayerRegistrationSubmissionDetail) {
    setDetail(updated);
    setSubmissions((current) =>
      current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
    );
  }

  async function runAction(
    action: "assign" | "start" | "changes" | "approve" | "reject",
  ) {
    if (!detail || working) return;
    if (["changes", "approve", "reject"].includes(action) && !reason.trim()) {
      setError("Add a review reason before making this decision.");
      return;
    }
    if (["approve", "reject"].includes(action) && !window.confirm(`Confirm ${action} for ${detail.full_name}?`)) return;
    setWorking(true);
    setError("");
    setNotice("");
    try {
      if (action === "assign") {
        replaceSubmission(await assignUnionPlayerRegistrationReviewer(workspaceSlug, detail.id));
      } else if (action === "start") {
        replaceSubmission(await startUnionPlayerRegistrationReview(workspaceSlug, detail.id));
      } else if (action === "changes") {
        replaceSubmission(await requestUnionPlayerRegistrationChanges(workspaceSlug, detail.id, reason.trim()));
      } else if (action === "approve") {
        const result = await approveUnionPlayerRegistration(workspaceSlug, detail.id, reason.trim());
        replaceSubmission(result.submission);
      } else {
        replaceSubmission(await rejectUnionPlayerRegistration(workspaceSlug, detail.id, reason.trim()));
      }
      setReason("");
      setNotice(`Review action completed for ${detail.full_name}.`);
    } catch (actionError) {
      setError(messageFor(actionError));
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className={styles.screen}>
      <ScreenHeader
        eyebrow="Registration review"
        title="Player registration submissions"
        description={`Inspect submitted player evidence, validation and Union decisions for ${workspaceName}.`}
      />

      {notice ? <div className={styles.notice} role="status" aria-live="polite">{notice}</div> : null}
      {error ? <div className={styles.errorWrap}><ErrorState message={error} /><button type="button" onClick={() => void loadSubmissions()}>Retry</button></div> : null}

      <form className={styles.toolbar} onSubmit={submitSearch}>
        <label>
          Search submissions
          <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Player, number or club" />
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {statusOptions.map((option) => <option key={option} value={option}>{formatValue(option)}</option>)}
          </select>
        </label>
        <button type="submit">Apply filters</button>
      </form>

      {loading ? <LoadingState label="Loading registration submissions…" /> : null}
      {!loading && !error && submissions.length === 0 ? (
        <EmptyState
          title={search || status !== "ALL" ? "No submissions match" : "No registration submissions"}
          description={search || status !== "ALL" ? "Change or clear the filters to review other submissions." : "Submitted registrations for this workspace will appear here."}
        />
      ) : null}

      {!loading && submissions.length > 0 ? (
        <div className={styles.masterDetail}>
          <RecordList
            records={submissions.map((submission) => ({
              id: String(submission.id),
              title: submission.full_name,
              subtitle: `${submission.club_name} · ${submission.registration_number}`,
              status: submission.submission_status,
              meta: `${formatValue(submission.registration_type)} · ${submission.blocking_error_count} blocking`,
            }))}
            selectedId={String(selectedId ?? "")}
            onSelect={(id) => setSelectedId(Number(id))}
          />

          <article className={styles.detail}>
            {detailLoading ? <LoadingState label="Loading submission details…" /> : null}
            {!detailLoading && detail ? (
              <>
                <div className={styles.detailHeading}>
                  <div><StatusBadge>{formatValue(detail.submission_status)}</StatusBadge><h3>{detail.full_name}</h3></div>
                  <small>Revision {detail.submission_revision}</small>
                </div>
                <dl>
                  <dt>Registration number</dt><dd>{formatValue(detail.registration_number)}</dd>
                  <dt>Player identity</dt><dd>{detail.permanent_player_summary ? `${detail.permanent_player_summary.union_player_number} · ${detail.permanent_player_summary.full_name}` : "New Union player identity"}</dd>
                  <dt>Club</dt><dd>{detail.club_name}</dd>
                  <dt>Team</dt><dd>{formatValue(detail.team_name)}</dd>
                  <dt>Position</dt><dd>{formatValue(detail.position)}</dd>
                  <dt>Nationality</dt><dd>{formatValue(detail.nationality)}</dd>
                  <dt>Date of birth</dt><dd>{formatValue(detail.date_of_birth)}</dd>
                  <dt>Submitted by</dt><dd>{formatValue(detail.submitted_by_name)}</dd>
                  <dt>Assigned reviewer</dt><dd>{formatValue(detail.assigned_reviewer_name)}</dd>
                  <dt>Competition editions</dt><dd>{detail.requested_competition_editions.length ? detail.requested_competition_editions.join(", ") : "None requested"}</dd>
                </dl>

                <section className={styles.evidence}>
                  <h4>Document references</h4>
                  {detail.supporting_documents.length ? <ul>{detail.supporting_documents.map((document, index) => <li key={`${documentLabel(document, index)}-${index}`}>{documentLabel(document, index)}</li>)}</ul> : <p>No supporting document references were submitted.</p>}
                </section>

                <div className={styles.validationGrid}>
                  <ValidationList title="Blocking errors" items={detail.automatic_validation?.blocking_errors} />
                  <ValidationList title="Review warnings" items={detail.automatic_validation?.review_warnings} />
                  <ValidationList title="Passed checks" items={detail.automatic_validation?.passed_checks} />
                </div>

                {canManage || canApprove ? (
                  <div className={styles.reviewBox}>
                    <label>
                      Review comment / decision reason
                      <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} />
                    </label>
                    <div className={styles.actions}>
                      {canManage && detail.submission_status === "SUBMITTED" ? <><button type="button" disabled={working} onClick={() => void runAction("assign")}>Assign to me</button><button type="button" disabled={working} onClick={() => void runAction("start")}>Start review</button></> : null}
                      {canManage && detail.submission_status === "UNDER_REVIEW" ? <button type="button" disabled={working} onClick={() => void runAction("changes")}>Request changes</button> : null}
                      {canApprove && detail.submission_status === "UNDER_REVIEW" ? <><button type="button" disabled={working} onClick={() => void runAction("approve")}>Approve</button><button type="button" className={styles.danger} disabled={working} onClick={() => void runAction("reject")}>Reject</button></> : null}
                    </div>
                  </div>
                ) : <p className={styles.readOnly}>You have read-only access to registration submissions.</p>}
              </>
            ) : null}
          </article>
        </div>
      ) : null}
    </section>
  );
}
