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
  getUnionAuthoritativePlayerRegistrations,
  getUnionPlayerEligibilities,
  getUnionPlayerRegistrationSubmissions,
  getUnionPlayerTransfers,
  type UnionAuthoritativePlayerRegistration,
  type UnionPlayerEligibility,
  type UnionPlayerRegistrationSubmission,
  type UnionPlayerTransfer,
} from "../../services/unionAdminService";
import styles from "./UnionAdminScreens.module.css";

type PlayersTransfersView =
  "registry" | "submissions" | "eligibility" | "transfers" | "returns";

type DetailRow = {
  label: string;
  value: string;
};

type ConnectedRecord = RecordListItem & {
  details: DetailRow[];
};

const views: Array<{ key: PlayersTransfersView; label: string }> = [
  { key: "registry", label: "Player Registry" },
  { key: "submissions", label: "Registration Submissions" },
  { key: "eligibility", label: "Competition Eligibility" },
  { key: "transfers", label: "Transfers" },
  { key: "returns", label: "Loan Returns" },
];

const statusOptions: Record<PlayersTransfersView, string[]> = {
  registry: ["ACTIVE", "SUSPENDED", "EXPIRED"],
  submissions: [
    "SUBMITTED",
    "UNDER_REVIEW",
    "CHANGES_REQUESTED",
    "APPROVED",
    "REJECTED",
    "WITHDRAWN",
  ],
  eligibility: [
    "PENDING",
    "ELIGIBLE",
    "REJECTED",
    "SUSPENDED",
    "EXPIRED",
    "CANCELLED",
  ],
  transfers: [
    "SUBMITTED",
    "UNDER_REVIEW",
    "CHANGES_REQUESTED",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
    "ACTIVE",
    "RETURNED",
    "COMPLETED",
  ],
  returns: ["ACTIVE", "RETURNED", "COMPLETED"],
};

export interface UnionPlayersTransfersScreenProps {
  workspaceSlug: string;
  workspaceName: string;
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
  return "Player and transfer records could not be loaded.";
}

function registryRecord(
  registration: UnionAuthoritativePlayerRegistration,
): ConnectedRecord {
  return {
    id: `registration-${registration.id}`,
    title: registration.player_name,
    subtitle: `${registration.union_player_number} · ${registration.club_name}`,
    status: registration.status,
    meta: `${formatStatus(registration.registration_type)} · ${formatDate(
      registration.effective_from,
    )}`,
    details: [
      { label: "Union player number", value: registration.union_player_number },
      { label: "Club", value: registration.club_name },
      { label: "Team", value: registration.team_name ?? "Not assigned" },
      {
        label: "Registration type",
        value: formatStatus(registration.registration_type),
      },
      {
        label: "Effective from",
        value: formatDate(registration.effective_from),
      },
      { label: "Effective to", value: formatDate(registration.effective_to) },
      {
        label: "Approved by",
        value: registration.approved_by_name ?? "Not recorded",
      },
      {
        label: "Decision reason",
        value: registration.decision_reason || "No decision note recorded",
      },
    ],
  };
}

function submissionRecord(
  submission: UnionPlayerRegistrationSubmission,
): ConnectedRecord {
  return {
    id: `submission-${submission.id}`,
    title: submission.full_name,
    subtitle: `${submission.registration_number} · ${submission.club_name}`,
    status: submission.submission_status,
    meta: `${formatStatus(submission.registration_type)} · revision ${submission.submission_revision}`,
    details: [
      {
        label: "Union player number",
        value: submission.union_player_number ?? "New player identity",
      },
      { label: "Club", value: submission.club_name },
      { label: "Team", value: submission.team_name },
      { label: "Submitted", value: formatDate(submission.submitted_at) },
      {
        label: "Reviewer",
        value: submission.assigned_reviewer_name ?? "Not assigned",
      },
      { label: "Warnings", value: String(submission.warning_count) },
      {
        label: "Blocking errors",
        value: String(submission.blocking_error_count),
      },
    ],
  };
}

function eligibilityRecord(
  eligibility: UnionPlayerEligibility,
): ConnectedRecord {
  return {
    id: `eligibility-${eligibility.id}`,
    title: eligibility.player_name,
    subtitle: `${eligibility.competition_name} · ${eligibility.club_name}`,
    status: eligibility.status,
    meta: `${eligibility.union_player_number} · ${eligibility.edition_name}`,
    details: [
      { label: "Union player number", value: eligibility.union_player_number },
      { label: "Club", value: eligibility.club_name },
      { label: "Team", value: eligibility.team_name ?? "Not assigned" },
      { label: "Competition", value: eligibility.competition_name },
      { label: "Edition", value: eligibility.edition_name },
      { label: "Season", value: eligibility.season_name },
      { label: "Eligible from", value: formatDate(eligibility.eligible_from) },
      {
        label: "Eligible until",
        value: formatDate(eligibility.eligible_until),
      },
      {
        label: "Reviewed by",
        value: eligibility.reviewed_by_name ?? "Not reviewed",
      },
      {
        label: "Review warnings",
        value: String(eligibility.review_warning_count),
      },
    ],
  };
}

function transferRecord(transfer: UnionPlayerTransfer): ConnectedRecord {
  return {
    id: `transfer-${transfer.id}`,
    title: transfer.player_name,
    subtitle: `${transfer.source_club_name} → ${transfer.destination_club_name}`,
    status: transfer.status,
    meta: `${formatStatus(transfer.transfer_type)} · ${formatDate(
      transfer.effective_on,
    )}`,
    details: [
      { label: "Union player number", value: transfer.union_player_number },
      { label: "Transfer type", value: formatStatus(transfer.transfer_type) },
      { label: "Source club", value: transfer.source_club_name },
      { label: "Destination club", value: transfer.destination_club_name },
      {
        label: "Destination team",
        value: transfer.destination_team_name ?? "Not assigned",
      },
      { label: "Effective on", value: formatDate(transfer.effective_on) },
      { label: "Loan end", value: formatDate(transfer.loan_end_on) },
      {
        label: "Source response",
        value: formatStatus(transfer.source_club_response_status),
      },
      {
        label: "Player consent",
        value: formatStatus(transfer.player_consent_status),
      },
      {
        label: "Reviewer",
        value: transfer.reviewed_by_name ?? "Not reviewed",
      },
    ],
  };
}

export default function UnionPlayersTransfersScreen({
  workspaceSlug,
  workspaceName,
}: UnionPlayersTransfersScreenProps) {
  const requestRef = useRef(0);
  const [view, setView] = useState<PlayersTransfersView>("registry");
  const [records, setRecords] = useState<ConnectedRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRecords = useCallback(async () => {
    const requestId = ++requestRef.current;
    setIsLoading(true);
    setError("");

    try {
      const query = { search, status };
      let connectedRecords: ConnectedRecord[];

      if (view === "registry") {
        const response = await getUnionAuthoritativePlayerRegistrations(
          workspaceSlug,
          query,
        );
        connectedRecords = response.results.map(registryRecord);
      } else if (view === "submissions") {
        const response = await getUnionPlayerRegistrationSubmissions(
          workspaceSlug,
          query,
        );
        connectedRecords = response.results.map(submissionRecord);
      } else if (view === "eligibility") {
        const response = await getUnionPlayerEligibilities(
          workspaceSlug,
          query,
        );
        connectedRecords = response.results.map(eligibilityRecord);
      } else {
        const response = await getUnionPlayerTransfers(workspaceSlug, {
          ...query,
          transferType: view === "returns" ? "LOAN" : undefined,
        });
        connectedRecords = response.results.map(transferRecord);
      }

      if (requestRef.current !== requestId) return;
      setRecords(connectedRecords);
      setSelectedId((current) =>
        connectedRecords.some((record) => record.id === current)
          ? current
          : connectedRecords[0]?.id,
      );
    } catch (loadError) {
      if (requestRef.current !== requestId) return;
      setRecords([]);
      setSelectedId(undefined);
      setError(errorMessage(loadError));
    } finally {
      if (requestRef.current === requestId) setIsLoading(false);
    }
  }, [search, status, view, workspaceSlug]);

  useEffect(() => {
    void loadRecords();
    return () => {
      requestRef.current += 1;
    };
  }, [loadRecords]);

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedId) ?? records[0],
    [records, selectedId],
  );

  const summary = useMemo(() => {
    const pending = records.filter((record) =>
      ["PENDING", "SUBMITTED", "UNDER_REVIEW", "CHANGES_REQUESTED"].includes(
        record.status,
      ),
    ).length;
    const completed = records.filter((record) =>
      ["ACTIVE", "APPROVED", "ELIGIBLE", "RETURNED", "COMPLETED"].includes(
        record.status,
      ),
    ).length;
    return { total: records.length, pending, completed };
  }, [records]);

  function handleViewChange(nextView: PlayersTransfersView) {
    setView(nextView);
    setStatus("ALL");
    setSelectedId(undefined);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchDraft.trim());
  }

  return (
    <section className={styles.screen}>
      <ScreenHeader
        eyebrow="Players & Transfers"
        title="Player registration and movement"
        description={`Authoritative identities, competition eligibility and transfer records for ${workspaceName}.`}
      />
      <InternalTabs<PlayersTransfersView>
        label="Player and transfer views"
        active={view}
        onChange={handleViewChange}
        items={views}
      />

      <form className={styles.toolbar} onSubmit={handleSearch}>
        <label>
          Search
          <input
            type="search"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Player name, club or Union number"
          />
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="ALL">All statuses</option>
            {statusOptions[view].map((option) => (
              <option key={option} value={option}>
                {formatStatus(option)}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading…" : "Apply filters"}
        </button>
      </form>

      {!isLoading && !error ? (
        <div className={styles.heroSummaryGrid}>
          <article>
            <span>Records</span>
            <strong>{summary.total}</strong>
            <small>Visible in the current workspace view.</small>
          </article>
          <article>
            <span>Pending attention</span>
            <strong>{summary.pending}</strong>
            <small>Submitted, pending or under review.</small>
          </article>
          <article>
            <span>Active or completed</span>
            <strong>{summary.completed}</strong>
            <small>Approved, eligible, active or completed.</small>
          </article>
        </div>
      ) : null}

      {isLoading ? (
        <LoadingState label="Loading player workflow records…" />
      ) : null}
      {!isLoading && error ? <ErrorState message={error} /> : null}
      {!isLoading && !error && records.length === 0 ? (
        <EmptyState
          title="No matching records"
          description="No records matched the current workspace, status and search filters."
        />
      ) : null}
      {!isLoading && !error && selectedRecord ? (
        <div className={styles.masterDetail}>
          <RecordList
            records={records}
            selectedId={selectedRecord.id}
            onSelect={setSelectedId}
          />
          <article>
            <StatusBadge>{selectedRecord.status}</StatusBadge>
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
          </article>
        </div>
      ) : null}
    </section>
  );
}
