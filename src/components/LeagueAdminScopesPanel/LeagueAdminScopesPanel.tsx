import { LoaderCircle, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getUnionAdminManagementCompetitions,
  getUnionAdminManagementLeagues,
  type UnionAdminCompetitionRecord,
  type UnionAdminLeagueOption,
} from "../../services/unionAdminService";
import {
  createUnionAdminLeagueScope,
  deleteUnionAdminLeagueScope,
  getUnionAdminLeagueScopes,
  updateUnionAdminLeagueScope,
  type LeagueAdminScope,
  type LeagueAdminScopeRole,
} from "../../services/officialAppointmentService";
import styles from "./LeagueAdminScopesPanel.module.css";

type Props = {
  workspaceSlug: string;
};

const ROLE_OPTIONS: Array<{ value: LeagueAdminScopeRole; label: string }> = [
  { value: "LEAGUE_ADMIN", label: "League Administrator" },
  { value: "COMPETITION_ADMIN", label: "Competition Administrator" },
  { value: "OFFICIALS_COORDINATOR", label: "Officials Coordinator" },
  { value: "VIEWER", label: "Viewer" },
];

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
    if (detail) return detail;
  }
  return fallback;
}

export default function LeagueAdminScopesPanel({ workspaceSlug }: Props) {
  const workspaceGenerationRef = useRef(0);
  const requestGenerationRef = useRef(0);
  const workspaceSlugRef = useRef(workspaceSlug);
  workspaceSlugRef.current = workspaceSlug;
  const [scopes, setScopes] = useState<LeagueAdminScope[]>([]);
  const [leagues, setLeagues] = useState<UnionAdminLeagueOption[]>([]);
  const [competitions, setCompetitions] = useState<UnionAdminCompetitionRecord[]>([]);
  const [email, setEmail] = useState("");
  const [leagueId, setLeagueId] = useState("");
  const [competitionId, setCompetitionId] = useState("");
  const [role, setRole] = useState<LeagueAdminScopeRole>("LEAGUE_ADMIN");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const requestedWorkspace = workspaceSlug;
    const workspaceGeneration = workspaceGenerationRef.current;
    const requestGeneration = ++requestGenerationRef.current;
    const isCurrent = () => workspaceSlugRef.current === requestedWorkspace && workspaceGenerationRef.current === workspaceGeneration && requestGenerationRef.current === requestGeneration;
    setIsLoading(true);
    setError("");
    try {
      const [scopeRows, leagueRows, competitionRows] = await Promise.all([
        getUnionAdminLeagueScopes(requestedWorkspace),
        getUnionAdminManagementLeagues(requestedWorkspace),
        getUnionAdminManagementCompetitions(requestedWorkspace),
      ]);
      if (!isCurrent()) return;
      setScopes(scopeRows);
      setLeagues(leagueRows);
      setCompetitions(competitionRows);
      setLeagueId((current) => leagueRows.some((league) => String(league.id) === current) ? current : String(leagueRows[0]?.id ?? ""));
    } catch (loadError) {
      if (!isCurrent()) return;
      setError(getErrorMessage(loadError, "League administration scopes could not be loaded."));
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    workspaceGenerationRef.current += 1;
    setScopes([]); setLeagues([]); setCompetitions([]); setEmail(""); setLeagueId(""); setCompetitionId("");
    setRole("LEAGUE_ADMIN"); setNotice(""); setError(""); setIsSaving(false); setBusyId(null);
    void load();
    return () => { workspaceGenerationRef.current += 1; };
  }, [load]);

  const availableCompetitions = useMemo(
    () => competitions.filter((competition) => String(competition.league) === leagueId),
    [competitions, leagueId],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !leagueId) {
      setError("Enter an existing user email and select a league.");
      return;
    }
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      await createUnionAdminLeagueScope({
        workspace: workspaceSlug,
        email: email.trim(),
        league: Number(leagueId),
        competition: competitionId ? Number(competitionId) : null,
        role,
        is_active: true,
      });
      setEmail("");
      setCompetitionId("");
      setNotice("League or competition administration access has been saved.");
      await load();
    } catch (saveError) {
      setError(getErrorMessage(saveError, "The administration scope could not be saved."));
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleScope(scope: LeagueAdminScope) {
    setBusyId(scope.id);
    setError("");
    try {
      await updateUnionAdminLeagueScope(workspaceSlug, scope.id, {
        is_active: !scope.is_active,
      });
      await load();
    } catch (updateError) {
      setError(getErrorMessage(updateError, "The scope status could not be updated."));
    } finally {
      setBusyId(null);
    }
  }

  async function removeScope(scope: LeagueAdminScope) {
    setBusyId(scope.id);
    setError("");
    try {
      await deleteUnionAdminLeagueScope(workspaceSlug, scope.id);
      setNotice("The administration scope has been removed.");
      await load();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "The administration scope could not be removed."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div>
          <span>Delegated competition operations</span>
          <h3>League and competition administrators</h3>
          <p>Grant operational access while the union retains official certification, discipline and full oversight.</p>
        </div>
        <button type="button" onClick={() => void load()}><RefreshCw size={17} /> Refresh</button>
      </header>

      {error ? <p className={styles.error}>{error}</p> : null}
      {notice ? <p className={styles.notice}>{notice}</p> : null}

      <form className={styles.form} onSubmit={submit}>
        <label>
          Existing user email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" />
        </label>
        <label>
          League
          <select value={leagueId} onChange={(event) => { setLeagueId(event.target.value); setCompetitionId(""); }}>
            <option value="">Select league</option>
            {leagues.map((league) => <option key={league.id} value={league.id}>{league.name}</option>)}
          </select>
        </label>
        <label>
          Competition scope
          <select value={competitionId} onChange={(event) => setCompetitionId(event.target.value)}>
            <option value="">All competitions in league</option>
            {availableCompetitions.map((competition) => <option key={competition.id} value={competition.id}>{competition.name}</option>)}
          </select>
        </label>
        <label>
          Operational role
          <select value={role} onChange={(event) => setRole(event.target.value as LeagueAdminScopeRole)}>
            {ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <button className={styles.primary} type="submit" disabled={isSaving}>
          {isSaving ? <LoaderCircle className={styles.spin} size={18} /> : <Plus size={18} />}
          {isSaving ? "Saving..." : "Grant access"}
        </button>
      </form>

      {isLoading ? (
        <div className={styles.empty}><LoaderCircle className={styles.spin} /> Loading scopes...</div>
      ) : scopes.length === 0 ? (
        <div className={styles.empty}><ShieldCheck size={30} /><strong>No delegated league access yet</strong></div>
      ) : (
        <div className={styles.list}>
          {scopes.map((scope) => (
            <article key={scope.id}>
              <div>
                <strong>{scope.user_full_name || scope.user_email}</strong>
                <span>{scope.user_email}</span>
              </div>
              <div>
                <strong>{scope.competition_name ?? scope.league_name}</strong>
                <span>{scope.competition_name ? `${scope.league_name} · competition only` : "All league competitions"}</span>
              </div>
              <div>
                <strong>{scope.role_display}</strong>
                <span>{scope.is_active ? "Active" : "Inactive"}</span>
              </div>
              <div className={styles.actions}>
                <button type="button" disabled={busyId === scope.id} onClick={() => void toggleScope(scope)}>{scope.is_active ? "Deactivate" : "Activate"}</button>
                <button className={styles.delete} type="button" disabled={busyId === scope.id} onClick={() => void removeScope(scope)}><Trash2 size={16} /> Remove</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
