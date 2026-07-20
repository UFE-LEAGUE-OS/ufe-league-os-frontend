import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createUnionNationalTeam,
  createUnionNationalTeamMember,
  getUnionNationalTeamMembers,
  getUnionNationalTeams,
  getUnionOfficialReadiness,
  getUnionRegistrationApplications,
  updateUnionNationalTeam,
  updateUnionRegistrationApplication,
  type UnionNationalTeam,
  type UnionNationalTeamMember,
  type UnionNationalTeamMemberType,
  type UnionNationalTeamStatus,
  type UnionOfficialReadiness,
  type UnionRegistrationApplication,
  type UnionRegistrationApplicationStatus,
} from "../../services/unionAdminService";
import styles from "./UnionOperationalPanels.module.css";

type WorkspacePanelProps = {
  workspaceSlug: string;
  workspaceName: string;
};

function errorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { detail?: unknown } } }).response?.data?.detail === "string"
  ) {
    return (error as { response: { data: { detail: string } } }).response.data.detail;
  }
  return fallback;
}

function formatDate(value: string | null) {
  if (!value) return "Not reviewed";
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

function statusLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function StatusBadge({ value }: { value: string }) {
  return <span className={styles.statusBadge}>{statusLabel(value)}</span>;
}

export function UnionNationalTeamsPanel({ workspaceSlug, workspaceName }: WorkspacePanelProps) {
  const generationRef = useRef(0);
  const [teams, setTeams] = useState<UnionNationalTeam[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [members, setMembers] = useState<UnionNationalTeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [isSavingMember, setIsSavingMember] = useState(false);
  const [error, setError] = useState("");
  const [memberError, setMemberError] = useState("");
  const [notice, setNotice] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamCategory, setTeamCategory] = useState("");
  const [teamStatus, setTeamStatus] = useState<UnionNationalTeamStatus>("ACTIVE");
  const [memberName, setMemberName] = useState("");
  const [memberType, setMemberType] = useState<UnionNationalTeamMemberType>("PLAYER");
  const [memberRole, setMemberRole] = useState("");

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId) ?? null,
    [selectedTeamId, teams],
  );

  const loadTeams = useCallback(async (generation: number, preferredTeamId?: number) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getUnionNationalTeams(workspaceSlug);
      if (generationRef.current !== generation) return;
      if (response.results.some((team) => team.workspace_slug !== workspaceSlug)) {
        throw new Error("National Team response belongs to a different workspace.");
      }
      setTeams(response.results);
      setSelectedTeamId((current) => {
        const requested = preferredTeamId ?? current;
        if (requested && response.results.some((team) => team.id === requested)) return requested;
        return response.results[0]?.id ?? null;
      });
    } catch (loadError) {
      if (generationRef.current !== generation) return;
      setTeams([]);
      setSelectedTeamId(null);
      setError(errorMessage(loadError, "National Teams could not be loaded."));
    } finally {
      if (generationRef.current === generation) setIsLoading(false);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    const generation = ++generationRef.current;
    setTeams([]);
    setMembers([]);
    setSelectedTeamId(null);
    setError("");
    setMemberError("");
    setNotice("");
    setTeamName("");
    setTeamCategory("");
    setMemberName("");
    setMemberRole("");
    void loadTeams(generation);
    return () => {
      generationRef.current += 1;
    };
  }, [loadTeams, workspaceSlug]);

  useEffect(() => {
    const generation = generationRef.current;
    if (!selectedTeamId) {
      setMembers([]);
      setIsLoadingMembers(false);
      return;
    }

    let active = true;
    setIsLoadingMembers(true);
    setMemberError("");
    getUnionNationalTeamMembers(selectedTeamId, workspaceSlug)
      .then((response) => {
        if (!active || generationRef.current !== generation) return;
        if (response.results.some((member) => member.team !== selectedTeamId)) {
          throw new Error("National Team member response belongs to a different team.");
        }
        setMembers(response.results);
      })
      .catch((loadError) => {
        if (!active || generationRef.current !== generation) return;
        setMembers([]);
        setMemberError(errorMessage(loadError, "National Team members could not be loaded."));
      })
      .finally(() => {
        if (active && generationRef.current === generation) setIsLoadingMembers(false);
      });

    return () => {
      active = false;
    };
  }, [selectedTeamId, workspaceSlug]);

  async function handleCreateTeam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!teamName.trim() || !teamCategory.trim() || isSavingTeam) return;
    const generation = generationRef.current;
    setIsSavingTeam(true);
    setNotice("");
    setError("");
    try {
      const created = await createUnionNationalTeam({
        workspace: workspaceSlug,
        name: teamName.trim(),
        category: teamCategory.trim(),
        status: teamStatus,
      });
      if (generationRef.current !== generation || created.workspace_slug !== workspaceSlug) return;
      setTeamName("");
      setTeamCategory("");
      setNotice(`${created.name} was created.`);
      await loadTeams(generation, created.id);
    } catch (saveError) {
      if (generationRef.current !== generation) return;
      setError(errorMessage(saveError, "The National Team could not be created."));
    } finally {
      if (generationRef.current === generation) setIsSavingTeam(false);
    }
  }

  async function handleStatusChange(team: UnionNationalTeam, status: UnionNationalTeamStatus) {
    const generation = generationRef.current;
    setNotice("");
    setError("");
    try {
      const updated = await updateUnionNationalTeam(team.id, workspaceSlug, { status });
      if (generationRef.current !== generation || updated.workspace_slug !== workspaceSlug) return;
      setTeams((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setNotice(`${updated.name} status was updated.`);
    } catch (saveError) {
      if (generationRef.current !== generation) return;
      setError(errorMessage(saveError, "The National Team status could not be updated."));
    }
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTeamId || !memberName.trim() || isSavingMember) return;
    const generation = generationRef.current;
    setIsSavingMember(true);
    setMemberError("");
    setNotice("");
    try {
      const created = await createUnionNationalTeamMember(selectedTeamId, {
        workspace: workspaceSlug,
        full_name: memberName.trim(),
        member_type: memberType,
        role: memberRole.trim(),
      });
      if (generationRef.current !== generation || created.team !== selectedTeamId) return;
      setMembers((current) => [...current, created]);
      setTeams((current) =>
        current.map((team) =>
          team.id === selectedTeamId
            ? {
                ...team,
                players: team.players + (created.member_type === "PLAYER" ? 1 : 0),
                staff: team.staff + (created.member_type === "STAFF" ? 1 : 0),
              }
            : team,
        ),
      );
      setMemberName("");
      setMemberRole("");
      setNotice(`${created.full_name} was added to ${created.team_name}.`);
    } catch (saveError) {
      if (generationRef.current !== generation) return;
      setMemberError(errorMessage(saveError, "The team member could not be added."));
    } finally {
      if (generationRef.current === generation) setIsSavingMember(false);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="national-teams-title">
      <header className={styles.header}>
        <div>
          <span>Union-owned teams</span>
          <h2 id="national-teams-title">National Teams</h2>
          <p>Maintain representative teams and their player or staff pools for {workspaceName}.</p>
        </div>
      </header>

      {error ? <div className={styles.error} role="alert">{error}</div> : null}
      {notice ? <div className={styles.notice} role="status">{notice}</div> : null}

      <div className={styles.split}>
        <div>
          <form className={styles.form} onSubmit={handleCreateTeam}>
            <h3>Create National Team</h3>
            <label>
              Team name
              <input value={teamName} onChange={(event) => setTeamName(event.target.value)} required />
            </label>
            <label>
              Category
              <input
                value={teamCategory}
                onChange={(event) => setTeamCategory(event.target.value)}
                placeholder="Senior Men, Senior Women, U20…"
                required
              />
            </label>
            <label>
              Status
              <select value={teamStatus} onChange={(event) => setTeamStatus(event.target.value as UnionNationalTeamStatus)}>
                <option value="ACTIVE">Active</option>
                <option value="CAMP">In Camp</option>
                <option value="SELECTION">Selection</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </label>
            <button type="submit" disabled={isSavingTeam}>{isSavingTeam ? "Creating…" : "Create team"}</button>
          </form>
        </div>

        <div className={styles.tableShell}>
          <table>
            <thead>
              <tr><th>Team</th><th>Category</th><th>Players</th><th>Staff</th><th>Status</th></tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5}>Loading National Teams…</td></tr>
              ) : teams.length === 0 ? (
                <tr><td colSpan={5}>No maintained National Teams exist for this workspace.</td></tr>
              ) : teams.map((team) => (
                <tr key={team.id} className={team.id === selectedTeamId ? styles.selectedRow : undefined}>
                  <td><button type="button" className={styles.linkButton} onClick={() => setSelectedTeamId(team.id)}>{team.name}</button></td>
                  <td>{team.category}</td>
                  <td>{team.players}</td>
                  <td>{team.staff}</td>
                  <td>
                    <select
                      aria-label={`Status for ${team.name}`}
                      value={team.status}
                      onChange={(event) => void handleStatusChange(team, event.target.value as UnionNationalTeamStatus)}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="CAMP">In Camp</option>
                      <option value="SELECTION">Selection</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTeam ? (
        <div className={styles.rosterSection}>
          <div className={styles.sectionTitle}>
            <div><span>Selected team</span><h3>{selectedTeam.name} roster</h3></div>
            <StatusBadge value={selectedTeam.status} />
          </div>
          {memberError ? <div className={styles.error} role="alert">{memberError}</div> : null}
          <div className={styles.split}>
            <form className={styles.form} onSubmit={handleAddMember}>
              <h3>Add player or staff member</h3>
              <label>
                Full name
                <input value={memberName} onChange={(event) => setMemberName(event.target.value)} required />
              </label>
              <label>
                Member type
                <select value={memberType} onChange={(event) => setMemberType(event.target.value as UnionNationalTeamMemberType)}>
                  <option value="PLAYER">Player</option>
                  <option value="STAFF">Staff</option>
                </select>
              </label>
              <label>
                Role or position
                <input value={memberRole} onChange={(event) => setMemberRole(event.target.value)} />
              </label>
              <button type="submit" disabled={isSavingMember}>{isSavingMember ? "Adding…" : "Add member"}</button>
            </form>
            <div className={styles.tableShell}>
              <table>
                <thead><tr><th>Name</th><th>Type</th><th>Role</th><th>Club</th><th>Status</th></tr></thead>
                <tbody>
                  {isLoadingMembers ? (
                    <tr><td colSpan={5}>Loading roster…</td></tr>
                  ) : members.length === 0 ? (
                    <tr><td colSpan={5}>No maintained roster members are attached to this team.</td></tr>
                  ) : members.map((member) => (
                    <tr key={member.id}>
                      <td>{member.full_name}</td>
                      <td>{member.member_type_display}</td>
                      <td>{member.role || "Not set"}</td>
                      <td>{member.club_name || "Unattached"}</td>
                      <td><StatusBadge value={member.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function UnionRegistrationsPanel({ workspaceSlug, workspaceName }: WorkspacePanelProps) {
  const generationRef = useRef(0);
  const [applications, setApplications] = useState<UnionRegistrationApplication[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [documentsComplete, setDocumentsComplete] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState("");

  const selected = useMemo(
    () => applications.find((application) => application.id === selectedId) ?? null,
    [applications, selectedId],
  );

  useEffect(() => {
    const generation = ++generationRef.current;
    setApplications([]);
    setSelectedId(null);
    setIsLoading(true);
    setError("");
    setNotice("");
    getUnionRegistrationApplications(workspaceSlug)
      .then((response) => {
        if (generationRef.current !== generation) return;
        if (response.results.some((application) => application.workspace_slug !== workspaceSlug)) {
          throw new Error("Registration response belongs to a different workspace.");
        }
        setApplications(response.results);
        setSelectedId(response.results[0]?.id ?? null);
      })
      .catch((loadError) => {
        if (generationRef.current !== generation) return;
        setError(errorMessage(loadError, "Registration applications could not be loaded."));
      })
      .finally(() => {
        if (generationRef.current === generation) setIsLoading(false);
      });
    return () => {
      generationRef.current += 1;
    };
  }, [workspaceSlug]);

  useEffect(() => {
    setDocumentsComplete(selected?.documents_complete ?? false);
    setReviewerNotes(selected?.reviewer_notes ?? "");
  }, [selected?.documents_complete, selected?.id, selected?.reviewer_notes]);

  async function review(status: UnionRegistrationApplicationStatus) {
    if (!selected || isSaving) return;
    const generation = generationRef.current;
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await updateUnionRegistrationApplication(selected.id, workspaceSlug, {
        status,
        documents_complete: documentsComplete,
        reviewer_notes: reviewerNotes.trim(),
      });
      if (generationRef.current !== generation || updated.workspace_slug !== workspaceSlug) return;
      setApplications((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setNotice(`${updated.applicant_name} is now ${updated.status_display.toLowerCase()}.`);
    } catch (saveError) {
      if (generationRef.current !== generation) return;
      setError(errorMessage(saveError, "The registration review could not be saved."));
    } finally {
      if (generationRef.current === generation) setIsSaving(false);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="registrations-title">
      <header className={styles.header}>
        <div>
          <span>Approval centre</span>
          <h2 id="registrations-title">Registration applications</h2>
          <p>Review maintained player, transfer, renewal, squad and staff applications for {workspaceName}.</p>
        </div>
      </header>
      {error ? <div className={styles.error} role="alert">{error}</div> : null}
      {notice ? <div className={styles.notice} role="status">{notice}</div> : null}
      <div className={styles.split}>
        <div className={styles.tableShell}>
          <table>
            <thead><tr><th>Applicant</th><th>Club</th><th>Type</th><th>Submitted</th><th>Status</th></tr></thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5}>Loading registration applications…</td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan={5}>No maintained registration applications exist for this workspace.</td></tr>
              ) : applications.map((application) => (
                <tr key={application.id} className={application.id === selectedId ? styles.selectedRow : undefined}>
                  <td><button type="button" className={styles.linkButton} onClick={() => { setSelectedId(application.id); setNotice(""); }}>{application.applicant_name}</button></td>
                  <td>{application.club_name}</td>
                  <td>{application.application_type_display}</td>
                  <td>{formatDate(application.submitted_at)}</td>
                  <td><StatusBadge value={application.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className={styles.form}>
          {selected ? (
            <>
              <h3>Review {selected.applicant_name}</h3>
              <dl className={styles.details}>
                <div><dt>Club</dt><dd>{selected.club_name}</dd></div>
                <div><dt>Registration number</dt><dd>{selected.registration_number || "Not supit ed"}</dd></div>
                <div><dt>Competition</dt><dd>{selected.competition_name || "Not linked"}</dd></div>
                <div><dt>Reviewed</dt><dd>{formatDate(selected.reviewed_at)}</dd></div>
              </dl>
              <label className={styles.checkboxRow}>
                <input type="checkbox" checked={documentsComplete} onChange={(event) => setDocumentsComplete(event.target.checked)} />
                Required documents are complete
              </label>
              <label>
                Reviewer notes
                <textarea value={reviewerNotes} onChange={(event) => setReviewerNotes(event.target.value)} rows={5} />
              </label>
              <div className={styles.actionGrid}>
                <button type="button" disabled={isSaving} onClick={() => void review("UNDER_REVIEW")}>Mark under review</button>
                <button type="button" disabled={isSaving} onClick={() => void review("DOCUMENTS_REQUIRED")}>Request documents</button>
                <button type="button" disabled={isSaving} onClick={() => void review("APPROVED")}>Approve</button>
                <button type="button" disabled={isSaving} onClick={() => void review("REJECTED")}>Reject</button>
              </div>
            </>
          ) : (
            <p>Select an application to review it.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

export function UnionOfficialReadinessPanel({ workspaceSlug, workspaceName }: WorkspacePanelProps) {
  const generationRef = useRef(0);
  const [readiness, setReadiness] = useState<UnionOfficialReadiness | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const generation = ++generationRef.current;
    setReadiness(null);
    setIsLoading(true);
    setError("");
    getUnionOfficialReadiness(workspaceSlug)
      .then((response) => {
        if (generationRef.current !== generation) return;
        if (response.workspace.slug !== workspaceSlug) {
          throw new Error("Official readiness response belongs to a different workspace.");
        }
        setReadiness(response);
      })
      .catch((loadError) => {
        if (generationRef.current !== generation) return;
        setError(errorMessage(loadError, "Official readiness could not be loaded."));
      })
      .finally(() => {
        if (generationRef.current === generation) setIsLoading(false);
      });
    return () => {
      generationRef.current += 1;
    };
  }, [workspaceSlug]);

  return (
    <section className={styles.panel} aria-labelledby="official-readiness-title">
      <header className={styles.header}>
        <div>
          <span>Matchday readiness</span>
          <h2 id="official-readiness-title">Official readiness</h2>
          <p>Maintained assignment coverage and response status for upcoming {workspaceName} fixtures.</p>
        </div>
      </header>
      {error ? <div className={styles.error} role="alert">{error}</div> : null}
      {isLoading ? <div className={styles.empty}>Loading official readiness…</div> : null}
      {readiness ? (
        <>
          <div className={styles.metrics}>
            <article><span>Officials</span><strong>{readiness.summary.officials_total}</strong><small>{readiness.summary.officials_available} available</small></article>
            <article><span>Upcoming fixtures</span><strong>{readiness.summary.upcoming_fixtures}</strong><small>Workspace scoped</small></article>
            <article><span>No assignments</span><strong>{readiness.summary.fixtures_without_assignments}</strong><small>Need appointments</small></article>
            <article><span>Pending responses</span><strong>{readiness.summary.fixtures_with_pending_responses}</strong><small>Awaiting officials</small></article>
          </div>
          <div className={styles.tableShell}>
            <table>
              <thead><tr><th>Fixture</th><th>Competition</th><th>Date</th><th>Assignments</th><th>Accepted</th><th>Readiness</th></tr></thead>
              <tbody>
                {readiness.fixtures.length === 0 ? (
                  <tr><td colSpan={6}>No upcoming fixtures require readiness reporting.</td></tr>
                ) : readiness.fixtures.map((fixture) => (
                  <tr key={fixture.id}>
                    <td>{fixture.match}</td>
                    <td>{fixture.competition}</td>
                    <td>{formatDate(fixture.match_date)}</td>
                    <td>{fixture.assignment_count}</td>
                    <td>{fixture.accepted_count}</td>
                    <td><StatusBadge value={fixture.readiness} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
