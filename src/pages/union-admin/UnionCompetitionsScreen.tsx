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
} from "../../components/union-admin/UnionAdminUi";
import {
  createUnionCompetitionIdentity,
  createUnionCompetitionEdition,
  createUnionAdminLeague,
  generateUnionAdminFixtures,
  getUnionAdminLeagueClubMemberships,
  getUnionGovernanceOptions,
  getUnionLeagueAdministrators,
  getUnionAdminManagementCompetitions,
  getUnionAdminManagementLeagues,
  getUnionAdminManagementSeasons,
  getUnionCompetitionEditions,
  getUnionCompetitionIdentities,
  transitionUnionCompetitionEdition,
  provisionUnionLeagueAdministrator,
  updateUnionAdminLeague,
  type UnionAdminCompetitionRecord,
  type UnionAdminLeagueClubMembership,
  type UnionAdminLeagueOption,
  type UnionAdminSeasonRecord,
  type UnionCompetitionEdition,
  type UnionCompetitionIdentity,
  type UnionWorkspaceOption,
  type UnionGovernanceOptions,
  type UnionLeagueAdministrator,
} from "../../services/unionAdminService";
import styles from "./UnionCompetitionsScreen.module.css";
import CompetitionCreationWizard from "./CompetitionCreationWizard";

type CompetitionView =
  | "directory"
  | "createEdit"
  | "entries"
  | "admins"
  | "fixtures"
  | "createCompetition"
  | "addSeason";
const views: Array<{ key: CompetitionView; label: string }> = [
  { key: "directory", label: "Directory" },
  { key: "createEdit", label: "Create / Edit" },
  { key: "entries", label: "Seasons & Club Entries" },
  { key: "admins", label: "Admins & Access" },
  { key: "fixtures", label: "Fixtures & Publication" },
];

function errorMessage(error: unknown) {
  const candidate = error as {
    response?: { status?: number; data?: { detail?: string } };
    message?: string;
  };
  if (candidate.response?.status === 403) {
    return "You do not have permission to view or change competitions in this workspace.";
  }
  return (
    candidate.response?.data?.detail ||
    candidate.message ||
    "The competition service could not be reached. Please retry."
  );
}

export interface UnionCompetitionsScreenProps {
  workspace: UnionWorkspaceOption;
}

export default function UnionCompetitionsScreen({ workspace }: UnionCompetitionsScreenProps) {
  const [view, setView] = useState<CompetitionView>("directory");
  const [identities, setIdentities] = useState<UnionCompetitionIdentity[]>([]);
  const [editions, setEditions] = useState<UnionCompetitionEdition[]>([]);
  const [leagues, setLeagues] = useState<UnionAdminLeagueOption[]>([]);
  const [seasons, setSeasons] = useState<UnionAdminSeasonRecord[]>([]);
  const [competitions, setCompetitions] = useState<UnionAdminCompetitionRecord[]>([]);
  const [memberships, setMemberships] = useState<UnionAdminLeagueClubMembership[]>([]);
  const [options, setOptions] = useState<UnionGovernanceOptions | null>(null);
  const [administrators, setAdministrators] = useState<UnionLeagueAdministrator[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [leagueId, setLeagueId] = useState("");
  const [seasonId, setSeasonId] = useState("");
  const [fixtureStart, setFixtureStart] = useState("");
  const [generated, setGenerated] = useState(0);
  const [leagueName, setLeagueName] = useState("");
  const [leagueDescription, setLeagueDescription] = useState("");
  const [editingLeague, setEditingLeague] = useState<number | null>(null);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminFirstName, setAdminFirstName] = useState("");
  const [adminLastName, setAdminLastName] = useState("");
  const [adminRole, setAdminRole] = useState("LEAGUE_ADMIN");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const loadGeneration = useRef(0);

  const selected = identities.find((item) => item.id === selectedId) ?? null;
  const canManage = workspace.permissions.includes("union.competitions.manage");

  const load = useCallback(async () => {
    const generation = ++loadGeneration.current;
    setLoading(true);
    setError("");
    setNotice("");
    setSelectedId(null);
    setEditions([]);
    setGenerated(0);
    setSearch("");
    setFixtureStart("");
    try {
      const [identityResult, leagueRows, seasonRows, competitionRows, membershipRows, governanceOptions] = await Promise.all([
        getUnionCompetitionIdentities(workspace.slug),
        getUnionAdminManagementLeagues(workspace.slug),
        getUnionAdminManagementSeasons(workspace.slug),
        getUnionAdminManagementCompetitions(workspace.slug),
        getUnionAdminLeagueClubMemberships(workspace.slug),
        getUnionGovernanceOptions(workspace.slug),
      ]);
      if (loadGeneration.current !== generation) return;
      setIdentities(identityResult.results);
      setLeagues(leagueRows);
      setSeasons(seasonRows);
      setCompetitions(competitionRows);
      setMemberships(membershipRows);
      setOptions(governanceOptions);
      setSelectedId(identityResult.results[0]?.id ?? null);
      setLeagueId(String(leagueRows[0]?.id ?? ""));
      setTemporaryPassword("");
    } catch (loadError) {
      if (loadGeneration.current === generation) setError(errorMessage(loadError));
    } finally {
      if (loadGeneration.current === generation) setLoading(false);
    }
  }, [workspace.slug]);

  useEffect(() => {
    if (!leagueId) { setAdministrators([]); return; }
    let current = true;
    getUnionLeagueAdministrators(workspace.slug, Number(leagueId))
      .then((rows) => { if (current) setAdministrators(rows); })
      .catch(() => { if (current) setAdministrators([]); });
    return () => { current = false; };
  }, [leagueId, workspace.slug]);

  useEffect(() => {
    void load();
    return () => {
      loadGeneration.current += 1;
    };
  }, [load]);
  useEffect(() => {
    if (!selectedId) { setEditions([]); return; }
    let current = true;
    getUnionCompetitionEditions(workspace.slug, selectedId).then((result) => { if (current) setEditions(result.results); }).catch((loadError) => { if (current) setError(errorMessage(loadError)); });
    return () => { current = false; };
  }, [selectedId, workspace.slug]);

  const filtered = useMemo(() => identities.filter((item) => `${item.name} ${item.sport} ${item.competition_type}`.toLowerCase().includes(search.toLowerCase())), [identities, search]);
  const selectedCompetition = selected ? competitions.find((item) => editions.some((edition) => edition.identity === selected.id && edition.competition_id === item.id)) : undefined;
  const selectedMemberships = selectedCompetition ? memberships.filter((item) => item.league === selectedCompetition.league && (!selectedCompetition.season_id || item.season === selectedCompetition.season_id)) : [];

  async function createIdentity(event: FormEvent) {
    event.preventDefault(); setWorking(true); setError("");
    try {
      const created = await createUnionCompetitionIdentity({ workspace: workspace.slug, name, description, primary_league: Number(leagueId), sport: workspace.sport, competition_type: "LEAGUE" });
      setIdentities((items) => [created, ...items]); setSelectedId(created.id); setView("directory"); setNotice(`Competition identity “${created.name}” created.`); setName(""); setDescription("");
    } catch (actionError) { setError(errorMessage(actionError)); } finally { setWorking(false); }
  }

  async function createEdition(event: FormEvent) {
    event.preventDefault(); if (!selected) return; setWorking(true); setError("");
    try {
      const created = await createUnionCompetitionEdition(workspace.slug, selected.id, { season: Number(seasonId) });
      setEditions((items) => [created, ...items]); setView("entries"); setNotice(`Edition for ${created.season_name} created.`); setSeasonId("");
    } catch (actionError) { setError(errorMessage(actionError)); } finally { setWorking(false); }
  }

  async function transition(edition: UnionCompetitionEdition, status: string) {
    const label = status.replaceAll("_", " ");
    let reason = "";
    if (status === "CANCELLED") {
      const suppliedReason = window.prompt(
        `Provide a reason for cancelling ${edition.season_name ?? edition.identity_name}.`,
      );
      if (!suppliedReason?.trim()) return;
      reason = suppliedReason.trim();
    } else if (!window.confirm(`Move ${edition.season_name} to ${label}?`)) {
      return;
    }
    setWorking(true);
    setError("");
    try {
      const updated = await transitionUnionCompetitionEdition(
        workspace.slug,
        edition.id,
        status,
        reason,
      );
      setEditions((items) =>
        items.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice(
        `${updated.season_name} moved to ${updated.status.replaceAll("_", " ")}.`,
      );
    } catch (actionError) {
      setError(errorMessage(actionError));
    } finally {
      setWorking(false);
    }
  }

  async function generateFixtures() {
    if (!selectedCompetition || !fixtureStart || generated || !window.confirm("Generate fixtures for this edition? Existing fixtures will be preserved.")) return;
    setWorking(true); setError("");
    try {
      const result = await generateUnionAdminFixtures({ workspace: workspace.slug, competition: selectedCompetition.id, start_date: fixtureStart, clear_existing: false });
      setGenerated(result.created_count); setNotice(`${result.created_count} fixtures generated successfully.`);
    } catch (actionError) { setError(errorMessage(actionError)); } finally { setWorking(false); }
  }

  async function saveLeague(event: FormEvent) {
    event.preventDefault(); setWorking(true); setError("");
    try {
      const payload = { workspace: workspace.slug, name: leagueName.trim(), description: leagueDescription.trim(), sport: options?.workspace.sport ?? workspace.sport };
      const saved = editingLeague ? await updateUnionAdminLeague(editingLeague, payload) : await createUnionAdminLeague(payload);
      setLeagues((rows) => editingLeague ? rows.map((item) => item.id === saved.id ? saved : item) : [saved, ...rows]);
      setLeagueId(String(saved.id)); setLeagueName(""); setLeagueDescription(""); setEditingLeague(null);
      setNotice(`League “${saved.name}” ${editingLeague ? "updated" : "created"}.`);
    } catch (actionError) { setError(errorMessage(actionError)); } finally { setWorking(false); }
  }

  async function assignAdministrator(event: FormEvent) {
    event.preventDefault(); if (!leagueId) return; setWorking(true); setError(""); setTemporaryPassword("");
    try {
      const result = await provisionUnionLeagueAdministrator(Number(leagueId), {
        workspace: workspace.slug,
        account: { email: adminEmail.trim(), first_name: adminFirstName.trim(), last_name: adminLastName.trim() },
        role: adminRole,
      });
      setAdministrators((rows) => [result.administrator, ...rows.filter((item) => item.id !== result.administrator.id)]);
      setTemporaryPassword(result.temporary_password ?? "");
      setNotice(result.created_user ? "New administrator account and scope created." : "Existing user attached to the League scope.");
      setAdminEmail(""); setAdminFirstName(""); setAdminLastName("");
    } catch (actionError) { setError(errorMessage(actionError)); } finally { setWorking(false); }
  }

  // Retained for compatibility with the legacy identity endpoint while the
  // guided workflow uses the atomic creation contract.
  void createIdentity;

  return <section className={styles.screen}>
    <ScreenHeader eyebrow="Governance" title="Leagues & Competitions" description="Manage League containers, permanent competition identities, draft editions, scoped administrators and publication." actions={canManage ? <button type="button" onClick={() => setView("createEdit")}>Create or edit</button> : undefined} />
    {notice ? <div className={styles.workflowNotice} role="status" aria-live="polite">{notice}</div> : null}
    {error ? <div><ErrorState message={error} /><button type="button" onClick={() => void load()}>Retry</button></div> : null}
    {loading ? <LoadingState label="Loading competitions…" /> : null}
    {!loading && !error ? <>
      <InternalTabs<CompetitionView> label="League and competition governance" active={view === "createCompetition" || view === "addSeason" ? "createEdit" : view} onChange={setView} items={views} />
      <div className={styles.heroSummaryGrid}><article><span>Competition identities</span><strong>{identities.length}</strong><small>Maintained in {workspace.name}</small></article><article><span>Selected editions</span><strong>{editions.length}</strong><small>{selected?.name ?? "Select a competition"}</small></article><article><span>Club entries</span><strong>{selectedMemberships.length}</strong><small>For the selected edition</small></article></div>
      {view === "directory" ? <div className={styles.directorySections}><section className={styles.formCard} aria-labelledby="league-containers"><h3 id="league-containers">League containers</h3>{leagues.length ? <RecordList records={leagues.map((item) => ({ id: `league-${item.id}`, title: item.name, subtitle: `${item.union_name ?? workspace.name} · ${item.sport}`, status: item.is_active ? "ACTIVE" : "INACTIVE", meta: `${item.competitions_count ?? 0} competitions · ${item.clubs_count ?? 0} clubs · ${item.administrators_count ?? 0} admins` }))} /> : <EmptyState title="No Leagues yet" description="Create the first League container for this workspace." />}</section><section className={styles.formCard} aria-labelledby="competition-identities"><h3 id="competition-identities">Permanent Competition identities</h3><label>Search competitions<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, sport or format" /></label>{filtered.length ? <RecordList records={filtered.map((item) => ({ id: String(item.id), title: item.name, subtitle: `${item.primary_league_name ?? "No League"} · ${item.sport} · ${item.competition_type}`, status: item.is_active ? "ACTIVE" : "INACTIVE", meta: `${item.editions_count} edition${item.editions_count === 1 ? "" : "s"}` }))} selectedId={String(selectedId ?? "")} onSelect={(id) => setSelectedId(Number(id))} /> : <EmptyState title={identities.length ? "No competitions match" : "No competitions yet"} description="Create a maintained Competition identity and its first draft edition." />}</section><section className={styles.formCard} aria-labelledby="competition-editions"><h3 id="competition-editions">Competition editions / seasons</h3>{editions.length ? <div className={styles.cardGrid}>{editions.map((edition) => <article key={edition.id}><StatusBadge>{edition.status.replaceAll("_", " ")}</StatusBadge><h3>{edition.identity_name}</h3><p>{edition.season_name ?? "No season"}</p></article>)}</div> : <EmptyState title="No editions for the selected Competition" description="Select an identity or create its first draft edition." />}</section></div> : null}
      {view === "createEdit" ? <div className={styles.workflowGrid}><form className={styles.formCard} onSubmit={saveLeague}><h3>{editingLeague ? "Edit League" : "Create League"}</h3><label>League name<input required value={leagueName} onChange={(event) => setLeagueName(event.target.value)} /></label><label>Workspace sport<input disabled value={options?.workspace.sport ?? workspace.sport} /></label><label>Description<textarea value={leagueDescription} onChange={(event) => setLeagueDescription(event.target.value)} /></label><button disabled={working || !canManage}>{editingLeague ? "Save League" : "Create League"}</button></form><aside className={styles.supportCard}><h3>Competition workflow</h3><p>Create a permanent identity, validated sport format, first draft edition, optional participation and administrator scope.</p><button type="button" disabled={!leagues.length} onClick={() => setView("createCompetition")}>Create Competition</button><div className={styles.linkGroup}>{leagues.map((item) => <button type="button" className={styles.subtleButton} key={item.id} onClick={() => { setEditingLeague(item.id); setLeagueName(item.name); setLeagueDescription(item.description); }}>Edit {item.name}</button>)}</div></aside></div> : null}
      {view === "entries" ? selected ? selectedMemberships.length ? <RecordList records={selectedMemberships.map((item) => ({ id: String(item.id), title: item.club_name, subtitle: `${item.league_name} · ${item.season_name ?? "No season"}`, status: item.status, meta: item.notes }))} /> : <EmptyState title="No club entries" description="No workspace membership records are attached to the selected competition edition." /> : <EmptyState title="Select a competition" description="Choose an identity before reviewing entries." /> : null}
      {view === "admins" ? <div className={styles.workflowGrid}><form className={styles.formCard} onSubmit={assignAdministrator}><h3>Assign League administrator</h3><label>League<select required value={leagueId} onChange={(event) => setLeagueId(event.target.value)}><option value="">Select League</option>{leagues.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><div className={styles.fieldGrid}><label>Email<input required type="email" value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} /></label><label>Role<select value={adminRole} onChange={(event) => setAdminRole(event.target.value)}>{options?.league_administrator_roles.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label>First name<input value={adminFirstName} onChange={(event) => setAdminFirstName(event.target.value)} /></label><label>Last name<input value={adminLastName} onChange={(event) => setAdminLastName(event.target.value)} /></label></div><button disabled={!canManage || working}>Attach or create administrator</button></form><aside className={styles.supportCard}><h3>Effective access</h3>{administrators.map((item) => <article key={item.id}><strong>{item.user_name}</strong><p>{item.role.replaceAll("_", " ")} · {item.is_active ? "Active" : "Inactive"}</p><small>{item.effective_permissions.join(", ")}</small></article>)}</aside>{temporaryPassword ? <div className={styles.passwordPanel} role="status"><h3>One-time temporary password</h3><code>{temporaryPassword}</code><p>Share it securely. It will disappear when dismissed or the workspace changes.</p><div className={styles.actionRow}><button type="button" onClick={() => void navigator.clipboard.writeText(temporaryPassword)}>Copy</button><button type="button" className={styles.subtleButton} onClick={() => setTemporaryPassword("")}>Dismiss</button></div></div> : null}</div> : null}
      {view === "fixtures" ? <div className={styles.detailGrid}>{selectedCompetition ? <div className={styles.formCard}><h3>Generate fixtures</h3><label>First match date<input type="date" value={fixtureStart} onChange={(event) => setFixtureStart(event.target.value)} /></label><button type="button" disabled={!canManage || working || !fixtureStart || generated > 0} onClick={() => void generateFixtures()}>{generated ? `${generated} fixtures generated` : "Generate fixtures"}</button></div> : <EmptyState title="No schedulable edition" description="Create an edition before generating fixtures." />}<aside className={styles.supportCard}><h3>Publication lifecycle</h3>{editions.map((edition) => <article key={edition.id}><StatusBadge>{edition.status.replaceAll("_", " ")}</StatusBadge><p>{edition.season_name}</p>{edition.allowed_transitions.map((status) => <button key={status} type="button" disabled={!canManage || working} onClick={() => void transition(edition, status)}>Move to {status.replaceAll("_", " ").toLowerCase()}</button>)}</article>)}</aside></div> : null}
      {view === "createCompetition" && options ? <CompetitionCreationWizard workspace={workspace} options={options} leagues={leagues} seasons={seasons} identities={identities} onCancel={() => setView("createEdit")} onError={setError} onCreated={(result) => { setIdentities((items) => [result.identity, ...items]); setSelectedId(result.identity.id); setEditions([result.edition]); setView("directory"); setNotice(`Competition identity “${result.identity.name}” and its first draft edition were created.`); }} /> : null}
      {view === "addSeason" ? selected ? <form className={styles.formCard} onSubmit={createEdition}><h3>Add season to {selected.name}</h3><label>Workspace season<select required value={seasonId} onChange={(event) => setSeasonId(event.target.value)}><option value="">Select season</option>{seasons.filter((season) => season.league === selected.primary_league && !editions.some((edition) => edition.season === season.id)).map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}</select></label><button disabled={working || !canManage}>Create draft edition</button></form> : <EmptyState title="Select a competition" description="Choose an identity before adding a season." /> : null}
    </> : null}
  </section>;
}
