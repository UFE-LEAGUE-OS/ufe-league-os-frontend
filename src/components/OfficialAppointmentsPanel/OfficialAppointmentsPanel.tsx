import {
  CalendarCheck,
  Check,
  CircleAlert,
  Clock3,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPublicFixtures } from "../../services/publicDashboardService";
import {
  getUnionAdminManagementCompetitions,
  getUnionAdminMatchOfficials,
  type UnionAdminCompetitionRecord,
} from "../../services/unionAdminService";
import {
  createLeagueAdminAppointment,
  createUnionAdminAppointment,
  getLeagueAdminAppointments,
  getLeagueAdminFixtures,
  getLeagueAdminOfficials,
  getLeagueAdminScopes,
  getMyOfficialAppointments,
  getUnionAdminAppointments,
  respondToOfficialAppointment,
  updateLeagueAdminAppointment,
  updateUnionAdminAppointment,
  type AppointmentFixture,
  type AppointmentOfficial,
  type LeagueAdminScope,
  type OfficialAppointment,
  type OfficialAppointmentStatus,
  type OfficialRoleOption,
} from "../../services/officialAppointmentService";
import styles from "./OfficialAppointmentsPanel.module.css";

type PanelMode = "union" | "league" | "official";

type Props = {
  mode: PanelMode;
  workspaceSlug?: string;
  workspaceName?: string;
};

type AppointmentForm = {
  match: string;
  official: string;
  roleType: string;
  status: "PROPOSED" | "ASSIGNED";
  notes: string;
};

const EMPTY_FORM: AppointmentForm = {
  match: "",
  official: "",
  roleType: "",
  status: "ASSIGNED",
  notes: "",
};

const ADMIN_STATUS_FILTERS: Array<"ALL" | OfficialAppointmentStatus> = [
  "ALL",
  "PROPOSED",
  "ASSIGNED",
  "ACCEPTED",
  "DECLINED",
  "CANCELLED",
];

function errorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    if (response?.data?.detail) return response.data.detail;
  }
  return fallback;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function scopeLabel(scope: LeagueAdminScope) {
  if (scope.competition_name) {
    return `${scope.competition_name} · ${scope.role_display}`;
  }
  return `${scope.league_name} · All competitions`;
}

function statusClass(status: OfficialAppointmentStatus) {
  return styles[`status${status[0]}${status.slice(1).toLowerCase()}`] ?? "";
}

export default function OfficialAppointmentsPanel({
  mode,
  workspaceSlug,
  workspaceName,
}: Props) {
  const workspaceGenerationRef = useRef(0);
  const requestGenerationRef = useRef(0);
  const workspaceSlugRef = useRef(workspaceSlug);
  workspaceSlugRef.current = workspaceSlug;
  const [appointments, setAppointments] = useState<OfficialAppointment[]>([]);
  const [fixtures, setFixtures] = useState<AppointmentFixture[]>([]);
  const [officials, setOfficials] = useState<AppointmentOfficial[]>([]);
  const [roleOptions, setRoleOptions] = useState<OfficialRoleOption[]>([]);
  const [scopes, setScopes] = useState<LeagueAdminScope[]>([]);
  const [competitions, setCompetitions] = useState<UnionAdminCompetitionRecord[]>([]);
  const [selectedScopeId, setSelectedScopeId] = useState("");
  const [selectedCompetitionId, setSelectedCompetitionId] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | OfficialAppointmentStatus>("ALL");
  const [form, setForm] = useState<AppointmentForm>(EMPTY_FORM);
  const [decliningId, setDecliningId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedScope = useMemo(
    () => scopes.find((scope) => String(scope.id) === selectedScopeId) ?? scopes[0] ?? null,
    [scopes, selectedScopeId],
  );

  const filteredAppointments = useMemo(() => {
    if (statusFilter === "ALL") return appointments;
    return appointments.filter((appointment) => appointment.status === statusFilter);
  }, [appointments, statusFilter]);

  const loadOfficialAppointments = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setAppointments(await getMyOfficialAppointments());
    } catch (loadError) {
      setAppointments([]);
      setError(errorMessage(loadError, "Your appointments could not be loaded."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUnionData = useCallback(async () => {
    if (!workspaceSlug) return;
    const requestedWorkspace = workspaceSlug;
    const workspaceGeneration = workspaceGenerationRef.current;
    const requestGeneration = ++requestGenerationRef.current;
    const isCurrent = () => workspaceSlugRef.current === requestedWorkspace && workspaceGenerationRef.current === workspaceGeneration && requestGenerationRef.current === requestGeneration;
    setIsLoading(true);
    setError("");
    try {
      const [appointmentRows, competitionRows, officialDirectory] = await Promise.all([
        getUnionAdminAppointments(requestedWorkspace),
        getUnionAdminManagementCompetitions(requestedWorkspace),
        getUnionAdminMatchOfficials(requestedWorkspace),
      ]);
      if (!isCurrent()) return;
      setAppointments(appointmentRows);
      setCompetitions(competitionRows);
      setOfficials(officialDirectory.results);
      setRoleOptions(officialDirectory.role_options);
      setSelectedCompetitionId((current) =>
        competitionRows.some((competition) => String(competition.id) === current)
          ? current
          : String(competitionRows[0]?.id ?? ""),
      );
    } catch (loadError) {
      if (!isCurrent()) return;
      setError(errorMessage(loadError, "Union appointment operations could not be loaded."));
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  }, [workspaceSlug]);

  const loadLeagueBootstrap = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const scopeRows = await getLeagueAdminScopes();
      setScopes(scopeRows);
      setSelectedScopeId((current) => current || String(scopeRows[0]?.id ?? ""));
    } catch (loadError) {
      setScopes([]);
      setError(errorMessage(loadError, "League administration scopes could not be loaded."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadLeagueScopeData = useCallback(async (scope: LeagueAdminScope) => {
    setIsLoading(true);
    setError("");
    const params = scope.competition
      ? { competition: scope.competition }
      : { league: scope.league };
    try {
      const [appointmentRows, fixtureRows, officialDirectory] = await Promise.all([
        getLeagueAdminAppointments(params),
        getLeagueAdminFixtures(params),
        getLeagueAdminOfficials(params),
      ]);
      setAppointments(appointmentRows);
      setFixtures(fixtureRows);
      setOfficials(officialDirectory.results);
      setRoleOptions(officialDirectory.role_options);
    } catch (loadError) {
      setAppointments([]);
      setFixtures([]);
      setOfficials([]);
      setError(errorMessage(loadError, "This league appointment workspace could not be loaded."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    workspaceGenerationRef.current += 1;
    setAppointments([]); setFixtures([]); setOfficials([]); setRoleOptions([]); setCompetitions([]);
    setSelectedCompetitionId(""); setForm(EMPTY_FORM); setNotice(""); setError("");
    setIsSaving(false); setBusyId(null);
    setNotice("");
    setForm(EMPTY_FORM);
    setDecliningId(null);
    if (mode === "official") void loadOfficialAppointments();
    if (mode === "union") void loadUnionData();
    if (mode === "league") void loadLeagueBootstrap();
    return () => { workspaceGenerationRef.current += 1; };
  }, [mode, workspaceSlug, loadOfficialAppointments, loadUnionData, loadLeagueBootstrap]);

  useEffect(() => {
    if (mode === "league" && selectedScope) {
      void loadLeagueScopeData(selectedScope);
    }
  }, [mode, selectedScope, loadLeagueScopeData]);

  useEffect(() => {
    if (mode !== "union" || !selectedCompetitionId || !competitions.some((competition) => String(competition.id) === selectedCompetitionId)) {
      if (mode === "union") setFixtures([]);
      return;
    }
    const workspaceGeneration = workspaceGenerationRef.current;
    const fixtureGeneration = ++requestGenerationRef.current;
    let active = true;
    getPublicFixtures({ competitionId: Number(selectedCompetitionId) })
      .then((rows) => {
        if (active && workspaceGenerationRef.current === workspaceGeneration && requestGenerationRef.current === fixtureGeneration) setFixtures(rows);
      })
      .catch(() => {
        if (active && workspaceGenerationRef.current === workspaceGeneration && requestGenerationRef.current === fixtureGeneration) setFixtures([]);
      });
    return () => {
      active = false;
    };
  }, [mode, selectedCompetitionId, competitions]);

  useEffect(() => {
    if (!form.roleType && roleOptions[0]?.value) {
      setForm((current) => ({ ...current, roleType: roleOptions[0].value }));
    }
  }, [form.roleType, roleOptions]);

  const reload = useCallback(async () => {
    if (mode === "official") return loadOfficialAppointments();
    if (mode === "union") return loadUnionData();
    if (selectedScope) return loadLeagueScopeData(selectedScope);
  }, [mode, selectedScope, loadOfficialAppointments, loadUnionData, loadLeagueScopeData]);

  async function submitAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.match || !form.official || !form.roleType) {
      setError("Select a fixture, an eligible official and an appointment role.");
      return;
    }
    setIsSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = {
        match: Number(form.match),
        official: Number(form.official),
        role_type: form.roleType,
        status: form.status,
        notes: form.notes.trim(),
      } as const;
      if (mode === "league") {
        await createLeagueAdminAppointment(payload);
      } else if (mode === "union" && workspaceSlug) {
        await createUnionAdminAppointment(workspaceSlug, payload);
      }
      setForm({ ...EMPTY_FORM, roleType: roleOptions[0]?.value ?? "" });
      setNotice("The official appointment has been saved.");
      await reload();
    } catch (saveError) {
      setError(errorMessage(saveError, "The appointment could not be saved."));
    } finally {
      setIsSaving(false);
    }
  }

  async function cancelAppointment(appointment: OfficialAppointment) {
    setBusyId(appointment.id);
    setError("");
    try {
      if (mode === "league") {
        await updateLeagueAdminAppointment(appointment.id, { status: "CANCELLED" });
      } else if (mode === "union" && workspaceSlug) {
        await updateUnionAdminAppointment(workspaceSlug, appointment.id, {
          status: "CANCELLED",
        });
      }
      setNotice("The appointment has been cancelled without deleting its audit history.");
      await reload();
    } catch (updateError) {
      setError(errorMessage(updateError, "The appointment could not be cancelled."));
    } finally {
      setBusyId(null);
    }
  }

  async function respond(appointment: OfficialAppointment, status: "ACCEPTED" | "DECLINED") {
    setBusyId(appointment.id);
    setError("");
    try {
      await respondToOfficialAppointment(appointment.id, {
        status,
        response_note: status === "DECLINED" ? declineReason.trim() : "",
      });
      setDecliningId(null);
      setDeclineReason("");
      setNotice(status === "ACCEPTED" ? "Appointment accepted." : "Appointment declined.");
      await loadOfficialAppointments();
    } catch (responseError) {
      setError(errorMessage(responseError, "Your appointment response could not be saved."));
    } finally {
      setBusyId(null);
    }
  }

  const isAdminMode = mode !== "official";
  const title = mode === "official" ? "My match appointments" : "Match official appointments";
  const description =
    mode === "official"
      ? "Review every appointment across competitions and accept or decline assignments from one workspace."
      : "Officials remain owned by the union while fixture appointments are managed within authorised league and competition scopes.";

  return (
    <section className={styles.shell}>
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Shared appointments workflow</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <button className={styles.refreshButton} type="button" onClick={() => void reload()}>
          <RefreshCw size={17} /> Refresh
        </button>
      </header>

      {mode === "league" && scopes.length > 0 ? (
        <div className={styles.scopeBar}>
          <ShieldCheck size={18} />
          <label>
            Administration scope
            <select value={selectedScope?.id ?? ""} onChange={(event) => setSelectedScopeId(event.target.value)}>
              {scopes.map((scope) => (
                <option key={scope.id} value={scope.id}>{scopeLabel(scope)}</option>
              ))}
            </select>
          </label>
          <p>{selectedScope?.union_name} retains certification and union-wide oversight.</p>
        </div>
      ) : null}

      {mode === "union" ? (
        <div className={styles.scopeBar}>
          <ShieldCheck size={18} />
          <div>
            <strong>{workspaceName ?? "Union workspace"}</strong>
            <p>Full oversight across all leagues and competitions under this union.</p>
          </div>
        </div>
      ) : null}

      {error ? <div className={styles.error}><CircleAlert size={18} />{error}</div> : null}
      {notice ? <div className={styles.notice}><Check size={18} />{notice}</div> : null}

      {isAdminMode ? (
        <form className={styles.form} onSubmit={submitAppointment}>
          {mode === "union" ? (
            <label>
              Competition
              <select value={selectedCompetitionId} onChange={(event) => {
                setSelectedCompetitionId(event.target.value);
                setForm((current) => ({ ...current, match: "" }));
              }}>
                <option value="">Select competition</option>
                {competitions.map((competition) => (
                  <option key={competition.id} value={competition.id}>
                    {competition.name} · {competition.season_name ?? competition.season}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <label>
            Fixture
            <select value={form.match} onChange={(event) => setForm((current) => ({ ...current, match: event.target.value }))}>
              <option value="">Select fixture</option>
              {fixtures.map((fixture) => (
                <option key={fixture.id} value={fixture.id}>
                  {fixture.home_club_name} vs {fixture.away_club_name} · {formatDate(fixture.match_date)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Union-approved official
            <select value={form.official} onChange={(event) => setForm((current) => ({ ...current, official: event.target.value }))}>
              <option value="">Select official</option>
              {officials.map((official) => (
                <option key={official.id} value={official.id}>
                  {official.full_name} · {official.certification_level || official.role_type_display}
                </option>
              ))}
            </select>
          </label>
          <label>
            Matchday role
            <select value={form.roleType} onChange={(event) => setForm((current) => ({ ...current, roleType: event.target.value }))}>
              <option value="">Select role</option>
              {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
          </label>
          <label>
            Initial status
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AppointmentForm["status"] }))}>
              <option value="ASSIGNED">Assigned</option>
              <option value="PROPOSED">Proposed</option>
            </select>
          </label>
          <label className={styles.notesField}>
            Appointment instructions
            <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Arrival time, reporting point or matchday instructions" />
          </label>
          <button className={styles.primaryButton} type="submit" disabled={isSaving}>
            {isSaving ? <LoaderCircle className={styles.spin} size={18} /> : <CalendarCheck size={18} />}
            {isSaving ? "Saving..." : "Assign official"}
          </button>
        </form>
      ) : null}

      <div className={styles.toolbar}>
        <div className={styles.summaryCards}>
          <div><CalendarCheck size={18} /><strong>{appointments.length}</strong><span>Total</span></div>
          <div><Clock3 size={18} /><strong>{appointments.filter((item) => ["PROPOSED", "ASSIGNED"].includes(item.status)).length}</strong><span>Awaiting response</span></div>
          <div><UserCheck size={18} /><strong>{appointments.filter((item) => item.status === "ACCEPTED").length}</strong><span>Accepted</span></div>
        </div>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
          {ADMIN_STATUS_FILTERS.map((status) => <option key={status} value={status}>{status === "ALL" ? "All statuses" : status.replace("_", " ")}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className={styles.loading}><LoaderCircle className={styles.spin} /> Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className={styles.empty}>
          <CalendarCheck size={34} />
          <h3>No appointments found</h3>
          <p>{mode === "official" ? "New assignments will appear here after a league or competition administrator appoints you." : "Assign an eligible union official to an upcoming fixture."}</p>
        </div>
      ) : (
        <div className={styles.appointmentList}>
          {filteredAppointments.map((appointment) => (
            <article key={appointment.id} className={styles.appointmentCard}>
              <div className={styles.cardTop}>
                <div>
                  <span>{appointment.league_name} · {appointment.competition_name}</span>
                  <h3>{appointment.match_label}</h3>
                </div>
                <span className={`${styles.status} ${statusClass(appointment.status)}`}>{appointment.status_display}</span>
              </div>
              <div className={styles.metaGrid}>
                <p><strong>Date</strong>{formatDate(appointment.match_date)}</p>
                <p><strong>Venue</strong>{appointment.venue || "To be confirmed"}</p>
                <p><strong>Role</strong>{appointment.role_type_display}</p>
                <p><strong>Official</strong>{appointment.official_name}</p>
              </div>
              {appointment.notes ? <p className={styles.instructions}>{appointment.notes}</p> : null}
              {appointment.response_note ? <p className={styles.responseNote}><strong>Official response:</strong> {appointment.response_note}</p> : null}

              {mode === "official" && ["PROPOSED", "ASSIGNED"].includes(appointment.status) ? (
                <div className={styles.actions}>
                  <button className={styles.acceptButton} type="button" disabled={busyId === appointment.id} onClick={() => void respond(appointment, "ACCEPTED")}>
                    <Check size={17} /> Accept
                  </button>
                  <button className={styles.declineButton} type="button" disabled={busyId === appointment.id} onClick={() => setDecliningId(appointment.id)}>
                    <X size={17} /> Decline
                  </button>
                </div>
              ) : null}

              {decliningId === appointment.id ? (
                <div className={styles.declineBox}>
                  <label>
                    Reason for declining
                    <textarea value={declineReason} onChange={(event) => setDeclineReason(event.target.value)} placeholder="Explain why you are unavailable" />
                  </label>
                  <div className={styles.actions}>
                    <button className={styles.declineButton} type="button" disabled={!declineReason.trim() || busyId === appointment.id} onClick={() => void respond(appointment, "DECLINED")}>Confirm decline</button>
                    <button className={styles.secondaryButton} type="button" onClick={() => { setDecliningId(null); setDeclineReason(""); }}>Keep appointment</button>
                  </div>
                </div>
              ) : null}

              {isAdminMode && appointment.status !== "CANCELLED" ? (
                <div className={styles.actions}>
                  <button className={styles.secondaryButton} type="button" disabled={busyId === appointment.id} onClick={() => void cancelAppointment(appointment)}>
                    <X size={17} /> Cancel appointment
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
