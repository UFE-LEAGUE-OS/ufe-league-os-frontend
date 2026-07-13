import {
  BarChart3,
  ClipboardList,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  TicketCheck,
  TriangleAlert,
  Users,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminWorkspaceLayout, {
  type AdminWorkspaceNavItem,
  WorkspaceEmpty,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
  WorkspaceStatGrid,
  WorkspaceStatus,
  adminWorkspaceStyles as styles,
  formatWorkspaceDate,
} from "../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import {
  getApiErrorMessage,
  getTicketingOfficerWorkspace,
  validateWorkspaceTicket,
  type TicketValidationResult,
  type TicketingOfficerWorkspaceData,
} from "../../services/adminWorkspaceService";

type TabKey =
  | "overview"
  | "events"
  | "scanner"
  | "logs";

const navItems: AdminWorkspaceNavItem<TabKey>[] = [
  {
    key: "overview",
    label: "Overview",
    icon: BarChart3,
  },
  {
    key: "events",
    label: "Assigned Events",
    icon: TicketCheck,
  },
  {
    key: "scanner",
    label: "Ticket Scanner",
    icon: ScanLine,
  },
  {
    key: "logs",
    label: "Entry Logs",
    icon: ClipboardList,
  },
];

export default function TicketingOfficerDashboard() {
  const [activeTab, setActiveTab] =
    useState<TabKey>("overview");
  const [data, setData] =
    useState<TicketingOfficerWorkspaceData | null>(null);
  const [selectedScope, setSelectedScope] = useState("");
  const [selectedMatch, setSelectedMatch] = useState("");
  const [scannedCode, setScannedCode] = useState("");
  const [validationResult, setValidationResult] =
    useState<TicketValidationResult | null>(null);
  const [validationError, setValidationError] =
    useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] =
    useState(false);
  const [error, setError] = useState("");

  const loadWorkspace = useCallback(
    async (scopeKey?: string) => {
      setIsLoading(true);
      setError("");

      try {
        const nextData =
          await getTicketingOfficerWorkspace(scopeKey);

        setData(nextData);
        setSelectedScope(
          nextData.selected_scope.key,
        );

        setSelectedMatch((current) => {
          if (
            current &&
            nextData.events.some(
              (event) => String(event.id) === current,
            )
          ) {
            return current;
          }

          return String(nextData.events[0]?.id ?? "");
        });
      } catch (loadError) {
        setData(null);
        setError(
          getApiErrorMessage(
            loadError,
            "The ticketing workspace could not be loaded.",
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const stats = useMemo(
    () => [
      {
        label: "Active Events",
        value: data?.summary.active_events ?? 0,
        detail: "Ticketed upcoming matches",
        icon: TicketCheck,
      },
      {
        label: "Tickets Sold",
        value: data?.summary.tickets_sold ?? 0,
        detail: "Issued tickets in this scope",
        icon: Users,
      },
      {
        label: "Checked In",
        value: data?.summary.checked_in ?? 0,
        detail: "Successful gate admissions",
        icon: ShieldCheck,
      },
      {
        label: "Pending Issues",
        value: data?.summary.pending_issues ?? 0,
        detail: "Rejected or exceptional scans",
        icon: TriangleAlert,
      },
    ],
    [data],
  );

  async function handleScopeChange(scopeKey: string) {
    setSelectedScope(scopeKey);
    setValidationResult(null);
    setValidationError("");
    await loadWorkspace(scopeKey);
  }

  async function handleValidation(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!scannedCode.trim()) {
      setValidationError(
        "Enter or scan a ticket code first.",
      );
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setValidationError("");

    try {
      const result = await validateWorkspaceTicket({
        scannedCode,
        matchId: selectedMatch
          ? Number(selectedMatch)
          : undefined,
      });

      setValidationResult(result);
      setScannedCode("");

      await loadWorkspace(selectedScope || undefined);
    } catch (validationFailure) {
      const responseData =
        typeof validationFailure === "object" &&
        validationFailure !== null &&
        "response" in validationFailure
          ? (
              validationFailure as {
                response?: {
                  data?: TicketValidationResult;
                };
              }
            ).response?.data
          : undefined;

      if (responseData?.result) {
        setValidationResult(responseData);
      } else {
        setValidationError(
          getApiErrorMessage(
            validationFailure,
            "The ticket could not be validated.",
          ),
        );
      }

      await loadWorkspace(selectedScope || undefined);
    } finally {
      setIsValidating(false);
    }
  }

  function renderEvents() {
    const events = data?.events ?? [];

    return (
      <WorkspacePanel
        eyebrow="Assigned access control"
        title="Ticketed match events"
        description="Only events falling within the selected union or club ticketing scope are shown."
      >
        {events.length === 0 ? (
          <WorkspaceEmpty
            title="No ticketed events"
            description="No upcoming matches in this scope currently have active ticket inventory."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Ticket Types</th>
                  <th>Sold</th>
                  <th>Checked In</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {events.map((match) => (
                  <tr key={match.id}>
                    <td>
                      <span className={styles.tablePrimary}>
                        {match.label}
                      </span>
                      <span
                        className={styles.tableSecondary}
                      >
                        {match.competition}
                      </span>
                    </td>
                    <td>
                      {formatWorkspaceDate(
                        match.match_date,
                      )}
                    </td>
                    <td>{match.venue || "TBC"}</td>
                    <td>{match.ticket_types}</td>
                    <td>{match.tickets_sold}</td>
                    <td>{match.checked_in}</td>
                    <td>
                      <WorkspaceStatus
                        value={match.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderScanner() {
    return (
      <div className={styles.gridTwo}>
        <WorkspacePanel
          eyebrow="Gate operations"
          title="Validate a ticket"
          description="Scan a QR code or paste its ticket UUID, then select the match being accessed."
        >
          <form
            className={styles.formGrid}
            onSubmit={handleValidation}
          >
            <div
              className={`${styles.field} ${styles.fieldFull}`}
            >
              <label htmlFor="ticket-code">
                Ticket code
              </label>

              <input
                id="ticket-code"
                autoComplete="off"
                value={scannedCode}
                onChange={(event) =>
                  setScannedCode(event.target.value)
                }
                placeholder="Paste UUID or LOS-TICKET:UUID"
              />
            </div>

            <div
              className={`${styles.field} ${styles.fieldFull}`}
            >
              <label htmlFor="ticket-match">
                Match
              </label>

              <select
                id="ticket-match"
                value={selectedMatch}
                onChange={(event) =>
                  setSelectedMatch(event.target.value)
                }
              >
                <option value="">
                  Validate against ticket match
                </option>

                {(data?.events ?? []).map((match) => (
                  <option
                    key={match.id}
                    value={match.id}
                  >
                    {match.label} ·{" "}
                    {formatWorkspaceDate(
                      match.match_date,
                    )}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`${styles.toolbar} ${styles.fieldFull}`}
            >
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={isValidating}
              >
                <ScanLine size={18} />
                {isValidating
                  ? "Validating…"
                  : "Validate ticket"}
              </button>
            </div>
          </form>

          {validationError ? (
            <div
              className={`${styles.validationCard} ${styles.validationFailure}`}
            >
              <strong>Validation failed</strong>
              <span>{validationError}</span>
            </div>
          ) : null}

          {validationResult ? (
            <div
              className={`${styles.validationCard} ${
                validationResult.result === "VALID"
                  ? styles.validationSuccess
                  : styles.validationFailure
              }`}
            >
              <WorkspaceStatus
                value={validationResult.result}
              />

              <strong>
                {validationResult.result_display ??
                  validationResult.result}
              </strong>

              <span>{validationResult.message}</span>

              {validationResult.ticket ? (
                <small>
                  Ticket #{validationResult.ticket.id} ·{" "}
                  {validationResult.ticket.ticket_type_name ??
                    "Match admission"}
                </small>
              ) : null}
            </div>
          ) : null}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Scanner guidance"
          title="Gate validation rules"
          description="Every attempt is recorded against the authenticated officer and selected ticketing scope."
        >
          <div className={styles.scopeGrid}>
            <article className={styles.scopeCard}>
              <span>Valid</span>
              <strong>Admit supporter</strong>
              <small>
                The ticket is active, belongs to the event and
                has not been used.
              </small>
            </article>

            <article className={styles.scopeCard}>
              <span>Already used</span>
              <strong>Do not admit</strong>
              <small>
                Confirm identity and escalate through the
                matchday supervisor.
              </small>
            </article>

            <article className={styles.scopeCard}>
              <span>Wrong match</span>
              <strong>Redirect supporter</strong>
              <small>
                The ticket belongs to another fixture or access
                window.
              </small>
            </article>

            <article className={styles.scopeCard}>
              <span>Invalid</span>
              <strong>Escalate</strong>
              <small>
                Record the failed scan and refer it to the
                ticketing lead.
              </small>
            </article>
          </div>
        </WorkspacePanel>
      </div>
    );
  }

  function renderLogs() {
    const logs = data?.recent_logs ?? [];

    return (
      <WorkspacePanel
        eyebrow="Attendance audit"
        title="Recent entry logs"
        description="Latest ticket checks recorded for matches in the selected scope."
      >
        {logs.length === 0 ? (
          <WorkspaceEmpty
            title="No entry logs"
            description="Validation attempts will appear here after the first ticket is scanned."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Match</th>
                  <th>Officer</th>
                  <th>Result</th>
                  <th>Message</th>
                  <th>Time</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className={styles.tablePrimary}>
                        {log.match}
                      </span>
                    </td>
                    <td>{log.scanned_by}</td>
                    <td>
                      <WorkspaceStatus
                        value={log.result}
                      />
                    </td>
                    <td>{log.message || "—"}</td>
                    <td>
                      {formatWorkspaceDate(
                        log.created_at,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderOverview() {
    return (
      <>
        <WorkspaceStatGrid stats={stats} />

        <WorkspacePanel
          eyebrow="Current access scope"
          title={
            data?.selected_scope.name ??
            "Ticketing operations"
          }
          description={
            data
              ? `${data.selected_scope.scope_type === "UNION" ? "Union-wide" : "Club-level"} ticketing access for ${data.selected_scope.sport}.`
              : "Ticketing scope information is loading."
          }
        >
          <div className={styles.scopeGrid}>
            {(data?.available_scopes ?? []).map(
              (scope) => (
                <article
                  className={styles.scopeCard}
                  key={scope.key}
                >
                  <span>{scope.scope_type}</span>
                  <strong>{scope.name}</strong>
                  <small>
                    {scope.sport} · {scope.short_name}
                  </small>
                </article>
              ),
            )}
          </div>
        </WorkspacePanel>

        {renderEvents()}
      </>
    );
  }

  let content;

  if (isLoading && !data) {
    content = (
      <WorkspaceLoading label="Loading ticketing operations…" />
    );
  } else if (error && !data) {
    content = (
      <WorkspaceError
        message={error}
        onRetry={() => void loadWorkspace()}
      />
    );
  } else if (activeTab === "events") {
    content = renderEvents();
  } else if (activeTab === "scanner") {
    content = renderScanner();
  } else if (activeTab === "logs") {
    content = renderLogs();
  } else {
    content = renderOverview();
  }

  const workspace =
    data?.selected_scope ?? data?.available_scopes[0];

  return (
    <AdminWorkspaceLayout<TabKey>
      workspaceTitle={
        workspace?.name ?? "Ticketing Operations"
      }
      workspaceSubtitle={
        workspace
          ? `${workspace.scope_type === "UNION" ? "Union" : "Club"} ticketing officer`
          : "Scoped matchday access"
      }
      eyebrow="Ticketing officer workspace"
      title="Matchday Access Control"
      description="Manage assigned ticket events, validate supporter entry and maintain a complete gate-audit record."
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      publicPath="/tickets"
      publicLabel="View tickets"
      headerActions={
        <>
          {(data?.available_scopes.length ?? 0) > 1 ? (
            <select
              className={styles.scopeSelect}
              aria-label="Ticketing scope"
              value={selectedScope}
              onChange={(event) =>
                void handleScopeChange(
                  event.target.value,
                )
              }
            >
              {data?.available_scopes.map((scope) => (
                <option
                  key={scope.key}
                  value={scope.key}
                >
                  {scope.short_name} ·{" "}
                  {scope.scope_type}
                </option>
              ))}
            </select>
          ) : null}

          <button
            className={styles.publicLink}
            type="button"
            disabled={isLoading}
            onClick={() =>
              void loadWorkspace(
                selectedScope || undefined,
              )
            }
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </>
      }
    >
      {error && data ? (
        <div className={styles.validationCard}>
          <strong>Some information may be stale</strong>
          <span>{error}</span>
        </div>
      ) : null}

      {content}
    </AdminWorkspaceLayout>
  );
}
