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
  generateUnionAdminFixtures,
  getUnionAdminLeagueClubMemberships,
  getUnionAdminManagementCompetitions,
  getUnionAdminManagementLeagues,
  getUnionAdminManagementSeasons,
  getUnionCompetitionEditions,
  getUnionCompetitionIdentities,
  transitionUnionCompetitionEdition,
  type UnionAdminCompetitionRecord,
  type UnionAdminLeagueClubMembership,
  type UnionAdminLeagueOption,
  type UnionAdminSeasonRecord,
  type UnionCompetitionEdition,
  type UnionCompetitionIdentity,
  type UnionWorkspaceOption,
} from "../../services/unionAdminService";
import styles from "./UnionCompetitionsScreen.module.css";
import CompetitionCreationWizard from "./CompetitionCreationWizard";

type CompetitionView =
  | "directory"
  | "identity"
  | "editions"
  | "entries"
  | "scheduling"
  | "publication"
  | "createCompetition"
  | "addSeason";
const views: Array<{ key: CompetitionView; label: string }> = [
  { key: "directory", label: "Competition Directory" },
  { key: "identity", label: "Identity Detail" },
  { key: "editions", label: "Editions / Seasons" },
  { key: "entries", label: "Club Entries" },
  { key: "scheduling", label: "Scheduling / Fixtures" },
  { key: "publication", label: "Publication & Lifecycle" },
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
      const [identityResult, leagueRows, seasonRows, competitionRows, membershipRows] = await Promise.all([
        getUnionCompetitionIdentities(workspace.slug),
        getUnionAdminManagementLeagues(workspace.slug),
        getUnionAdminManagementSeasons(workspace.slug),
        getUnionAdminManagementCompetitions(workspace.slug),
        getUnionAdminLeagueClubMemberships(workspace.slug),
      ]);
      if (loadGeneration.current !== generation) return;
      setIdentities(identityResult.results);
      setLeagues(leagueRows);
      setSeasons(seasonRows);
      setCompetitions(competitionRows);
      setMemberships(membershipRows);
      setSelectedId(identityResult.results[0]?.id ?? null);
      setLeagueId(String(leagueRows[0]?.id ?? ""));
    } catch (loadError) {
      if (loadGeneration.current === generation) setError(errorMessage(loadError));
    } finally {
      if (loadGeneration.current === generation) setLoading(false);
    }
  }, [workspace.slug]);

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
      setIdentities((items) => [created, ...items]); setSelectedId(created.id); setView("identity"); setNotice(`Competition identity “${created.name}” created.`); setName(""); setDescription("");
    } catch (actionError) { setError(errorMessage(actionError)); } finally { setWorking(false); }
  }

  async function createEdition(event: FormEvent) {
    event.preventDefault(); if (!selected) return; setWorking(true); setError("");
    try {
      const created = await createUnionCompetitionEdition(workspace.slug, selected.id, { season: Number(seasonId) });
      setEditions((items) => [created, ...items]); setView("editions"); setNotice(`Edition for ${created.season_name} created.`); setSeasonId("");
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

  // Retained for compatibility with the legacy identity endpoint while the
  // guided workflow uses the atomic creation contract.
  void createIdentity;

  return <section className={styles.screen}>
    <ScreenHeader eyebrow="Competitions" title="Competition control room" description="Manage maintained competition identities, seasonal editions, club entries and fixture preparation." actions={canManage ? <div className={styles.inlineActionGroup}><button type="button" onClick={() => setView("createCompetition")}>Create Competition</button><button type="button" className={styles.subtleButton} disabled={!selected} onClick={() => setView("addSeason")}>Add Season</button></div> : undefined} />
    {notice ? <div className={styles.workflowNotice} role="status" aria-live="polite">{notice}</div> : null}
    {error ? <div><ErrorState message={error} /><button type="button" onClick={() => void load()}>Retry</button></div> : null}
    {loading ? <LoadingState label="Loading competitions…" /> : null}
    {!loading && !error ? <>
      <InternalTabs<CompetitionView> label="Competition views" active={view === "createCompetition" || view === "addSeason" ? "directory" : view} onChange={setView} items={views} />
      <div className={styles.heroSummaryGrid}><article><span>Competition identities</span><strong>{identities.length}</strong><small>Maintained in {workspace.name}</small></article><article><span>Selected editions</span><strong>{editions.length}</strong><small>{selected?.name ?? "Select a competition"}</small></article><article><span>Club entries</span><strong>{selectedMemberships.length}</strong><small>For the selected edition</small></article></div>
      {view === "directory" ? <div className={styles.formCard}><label>Search competitions<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, sport or format" /></label>{filtered.length ? <RecordList records={filtered.map((item) => ({ id: String(item.id), title: item.name, subtitle: `${item.sport} · ${item.competition_type}`, status: item.is_active ? "ACTIVE" : "INACTIVE", meta: `${item.editions_count} edition${item.editions_count === 1 ? "" : "s"}` }))} selectedId={String(selectedId ?? "")} onSelect={(id) => { setSelectedId(Number(id)); setView("identity"); }} /> : <EmptyState title={identities.length ? "No competitions match" : "No competitions yet"} description={identities.length ? "Change the search term to see other maintained identities." : "Create the first competition identity for this workspace."} />}</div> : null}
      {view === "identity" ? selected ? <div className={styles.detailGrid}><article><h3>{selected.name}</h3><dl><dt>Slug</dt><dd>{selected.slug}</dd><dt>Sport</dt><dd>{selected.sport}</dd><dt>Type</dt><dd>{selected.competition_type}</dd><dt>Primary league</dt><dd>{selected.primary_league_name ?? "Not assigned"}</dd><dt>Description</dt><dd>{selected.description || "No description provided."}</dd><dt>Status</dt><dd><StatusBadge>{selected.is_active ? "ACTIVE" : "INACTIVE"}</StatusBadge></dd></dl></article><aside><h3>Maintained record</h3><p className={styles.mutedText}>This identity groups editions across seasons. Editing is unavailable until the backend exposes an update contract.</p></aside></div> : <EmptyState title="Select a competition" description="Choose a maintained identity from the directory." /> : null}
      {view === "editions" ? editions.length ? <div className={styles.cardGrid}>{editions.map((edition) => <article key={edition.id}><StatusBadge>{edition.status.replaceAll("_", " ")}</StatusBadge><h3>{edition.season_name}</h3><dl><dt>League competition</dt><dd>{edition.competition_slug}</dd><dt>Registration opens</dt><dd>{edition.registration_opens_at ?? "Not set"}</dd><dt>Registration closes</dt><dd>{edition.registration_closes_at ?? "Not set"}</dd></dl></article>)}</div> : <EmptyState title="No editions yet" description="Add a workspace season to the selected competition identity." /> : null}
      {view === "entries" ? selected ? selectedMemberships.length ? <RecordList records={selectedMemberships.map((item) => ({ id: String(item.id), title: item.club_name, subtitle: `${item.league_name} · ${item.season_name ?? "No season"}`, status: item.status, meta: item.notes }))} /> : <EmptyState title="No club entries" description="No workspace membership records are attached to the selected competition edition." /> : <EmptyState title="Select a competition" description="Choose an identity before reviewing entries." /> : null}
      {view === "scheduling" ? selectedCompetition ? <div className={styles.detailGrid}><div className={styles.formCard}><h3>Generate fixtures</h3><label>First match date<input type="date" value={fixtureStart} onChange={(event) => setFixtureStart(event.target.value)} /></label><button type="button" disabled={!canManage || working || !fixtureStart || generated > 0} onClick={() => void generateFixtures()}>{generated ? `${generated} fixtures generated` : "Generate fixtures"}</button></div><aside className={styles.supportCard}><h3>{selectedCompetition.name}</h3><p>{selectedCompetition.matches_count} existing fixtures · {selectedCompetition.clubs_count} clubs</p><p className={styles.mutedText}>Generation uses the backend schedule validator and will not clear existing fixtures.</p></aside></div> : <EmptyState title="No schedulable edition" description="Create an edition before generating fixtures." /> : null}
      {view === "publication" ? editions.length ? <div className={styles.timeline}>{editions.map((edition) => <article key={edition.id}><StatusBadge>{edition.status.replaceAll("_", " ")}</StatusBadge><h3>{edition.season_name}</h3><div className={styles.linkGroup}>{(edition.allowed_transitions ?? []).map((status) => <button key={status} type="button" className={status === "CANCELLED" ? styles.subtleButton : undefined} disabled={!canManage || working} onClick={() => void transition(edition, status)}>Move to {status.replaceAll("_", " ").toLowerCase()}</button>)}</div>{!edition.allowed_transitions?.length ? <p className={styles.mutedText}>No further lifecycle actions are available.</p> : null}</article>)}</div> : <EmptyState title="No lifecycle records" description="Create an edition to begin the competition lifecycle." /> : null}
      {view === "createCompetition" ? <CompetitionCreationWizard workspace={workspace} leagues={leagues} seasons={seasons} identities={identities} onCancel={() => setView("directory")} onError={setError} onCreated={(result) => { setIdentities((items) => [result.identity, ...items]); setSelectedId(result.identity.id); setEditions([result.edition]); setView("identity"); setNotice(`Competition identity “${result.identity.name}” and its first draft edition were created.`); }} /> : null}
      {view === "addSeason" ? selected ? <form className={styles.formCard} onSubmit={createEdition}><h3>Add season to {selected.name}</h3><label>Workspace season<select required value={seasonId} onChange={(event) => setSeasonId(event.target.value)}><option value="">Select season</option>{seasons.filter((season) => season.league === selected.primary_league && !editions.some((edition) => edition.season === season.id)).map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}</select></label><button disabled={working || !canManage}>Create draft edition</button></form> : <EmptyState title="Select a competition" description="Choose an identity before adding a season." /> : null}
    </> : null}
  </section>;
}
