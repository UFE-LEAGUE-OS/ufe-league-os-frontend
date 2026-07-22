import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EmptyState, ErrorState, LoadingState, RecordList, ScreenHeader, StatusBadge } from "../../components/union-admin/UnionAdminUi";
import {
  createUnionNationalTeam,
  createUnionNationalTeamMember,
  deleteUnionNationalTeamMember,
  getUnionNationalTeamMembers,
  getUnionNationalTeams,
  updateUnionNationalTeam,
  updateUnionNationalTeamMember,
  type UnionNationalTeam,
  type UnionNationalTeamMember,
  type UnionNationalTeamMemberStatus,
  type UnionNationalTeamStatus,
} from "../../services/unionAdminService";
import styles from "./UnionNationalTeamsScreen.module.css";

function messageFor(error: unknown) {
  const response = (error as { response?: { status?: number; data?: { detail?: string } } })?.response;
  if (response?.status === 403) return "You do not have permission to manage National Teams in this workspace.";
  return response?.data?.detail || "National Teams could not be loaded. Please retry.";
}

export interface UnionNationalTeamsScreenProps {
  workspaceSlug: string;
  workspaceName: string;
  canManage: boolean;
}

export default function UnionNationalTeamsScreen({ workspaceSlug, workspaceName, canManage }: UnionNationalTeamsScreenProps) {
  const generation = useRef(0);
  const [teams, setTeams] = useState<UnionNationalTeam[]>([]);
  const [members, setMembers] = useState<UnionNationalTeamMember[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [teamName, setTeamName] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberType, setMemberType] = useState<"PLAYER" | "STAFF">("PLAYER");
  const [memberRole, setMemberRole] = useState("");

  const selected = teams.find((team) => team.id === selectedId) ?? null;
  const filtered = useMemo(() => teams.filter((team) => `${team.name} ${team.category} ${team.gender} ${team.age_group}`.toLowerCase().includes(query.toLowerCase()) && (statusFilter === "ALL" || team.status === statusFilter)), [query, statusFilter, teams]);

  const loadTeams = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true); setError(""); setNotice(""); setTeams([]); setMembers([]); setSelectedId(null);
    try {
      const response = await getUnionNationalTeams(workspaceSlug);
      if (generation.current !== current) return;
      if (response.results.some((team) => team.workspace_slug !== workspaceSlug)) throw new Error("National Team response belongs to another workspace.");
      setTeams(response.results); setSelectedId(response.results[0]?.id ?? null);
    } catch (loadError) { if (generation.current === current) setError(messageFor(loadError)); }
    finally { if (generation.current === current) setLoading(false); }
  }, [workspaceSlug]);

  useEffect(() => {
    setQuery(""); setStatusFilter("ALL"); void loadTeams();
    return () => { generation.current += 1; };
  }, [loadTeams]);

  useEffect(() => {
    const current = generation.current;
    setMembers([]);
    if (!selectedId) return;
    setMembersLoading(true);
    getUnionNationalTeamMembers(selectedId, workspaceSlug)
      .then((response) => { if (generation.current === current) setMembers(response.results); })
      .catch((loadError) => { if (generation.current === current) setError(messageFor(loadError)); })
      .finally(() => { if (generation.current === current) setMembersLoading(false); });
  }, [selectedId, workspaceSlug]);

  async function createTeam(event: FormEvent) {
    event.preventDefault(); setWorking(true); setError("");
    try {
      const created = await createUnionNationalTeam({ workspace: workspaceSlug, name: teamName.trim(), category: category.trim(), gender: gender.trim(), status: "ACTIVE" });
      setTeams((current) => [created, ...current]); setSelectedId(created.id); setTeamName(""); setCategory(""); setGender(""); setNotice(`${created.name} was created.`);
    } catch (actionError) { setError(messageFor(actionError)); } finally { setWorking(false); }
  }

  async function updateTeamStatus(status: UnionNationalTeamStatus) {
    if (!selected) return;
    setWorking(true); setError("");
    try { const updated = await updateUnionNationalTeam(selected.id, workspaceSlug, { status }); setTeams((current) => current.map((team) => team.id === updated.id ? updated : team)); }
    catch (actionError) { setError(messageFor(actionError)); } finally { setWorking(false); }
  }

  async function addMember(event: FormEvent) {
    event.preventDefault(); if (!selected) return; setWorking(true); setError("");
    try { const created = await createUnionNationalTeamMember(selected.id, { workspace: workspaceSlug, full_name: memberName.trim(), member_type: memberType, role: memberRole.trim() }); setMembers((current) => [...current, created]); setMemberName(""); setMemberRole(""); setNotice(`${created.full_name} was added.`); }
    catch (actionError) { setError(messageFor(actionError)); } finally { setWorking(false); }
  }

  async function updateMemberStatus(member: UnionNationalTeamMember, status: UnionNationalTeamMemberStatus) {
    if (!selected) return;
    try { const updated = await updateUnionNationalTeamMember(selected.id, member.id, workspaceSlug, { status }); setMembers((current) => current.map((item) => item.id === updated.id ? updated : item)); }
    catch (actionError) { setError(messageFor(actionError)); }
  }

  async function removeMember(member: UnionNationalTeamMember) {
    if (!selected || !window.confirm(`Remove ${member.full_name} from ${selected.name}?`)) return;
    try { await deleteUnionNationalTeamMember(selected.id, member.id, workspaceSlug); setMembers((current) => current.filter((item) => item.id !== member.id)); setNotice(`${member.full_name} was removed.`); }
    catch (actionError) { setError(messageFor(actionError)); }
  }

  return <section className={styles.screen}>
    <ScreenHeader eyebrow="Representative teams" title="National Teams" description={`Maintain Union-owned teams and their player and staff rosters for ${workspaceName}.`} />
    {notice ? <div className={styles.notice} role="status" aria-live="polite">{notice}</div> : null}
    {error ? <div className={styles.error}><ErrorState message={error} /><button type="button" onClick={() => void loadTeams()}>Retry</button></div> : null}
    <div className={styles.filters}><label>Search teams<input aria-label="Search teams" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label>Status<select aria-label="Team status filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All statuses</option><option value="ACTIVE">Active</option><option value="CAMP">In camp</option><option value="SELECTION">Selection</option><option value="INACTIVE">Inactive</option></select></label></div>
    {loading ? <LoadingState label="Loading National Teams…" /> : null}
    {!loading && !error && filtered.length === 0 ? <EmptyState title={teams.length ? "No teams match" : "No National Teams"} description={teams.length ? "Change the filters to see other teams." : "Representative teams for this workspace will appear here."} /> : null}
    {!loading && teams.length ? <div className={styles.masterDetail}><RecordList records={filtered.map((team) => ({ id: String(team.id), title: team.name, subtitle: `${team.category} · ${team.gender || "Open"}`, status: team.status, meta: `${team.players} players · ${team.staff} staff` }))} selectedId={String(selectedId ?? "")} onSelect={(id) => setSelectedId(Number(id))} /><article className={styles.detail}>{selected ? <><div className={styles.heading}><div><StatusBadge>{selected.status_display}</StatusBadge><h3>{selected.name}</h3></div>{canManage ? <select aria-label={`Status for ${selected.name}`} value={selected.status} disabled={working} onChange={(event) => void updateTeamStatus(event.target.value as UnionNationalTeamStatus)}><option value="ACTIVE">Active</option><option value="CAMP">In camp</option><option value="SELECTION">Selection</option><option value="INACTIVE">Inactive</option></select> : null}</div><dl><dt>Category</dt><dd>{selected.category}</dd><dt>Gender</dt><dd>{selected.gender || "Open"}</dd><dt>Age group</dt><dd>{selected.age_group || "Not set"}</dd><dt>Head coach</dt><dd>{selected.head_coach || "Not assigned"}</dd></dl><h4>Roster</h4>{membersLoading ? <LoadingState label="Loading roster…" /> : members.length ? <div className={styles.roster}>{members.map((member) => <article key={member.id}><div><strong>{member.full_name}</strong><span>{member.member_type_display} · {member.role || "Role not set"} · {member.club_name || "Unattached"}</span></div>{canManage ? <><select aria-label={`Status for ${member.full_name}`} value={member.status} onChange={(event) => void updateMemberStatus(member, event.target.value as UnionNationalTeamMemberStatus)}><option value="ACTIVE">Active</option><option value="INJURED">Injured</option><option value="UNAVAILABLE">Unavailable</option><option value="RELEASED">Released</option></select><button type="button" onClick={() => void removeMember(member)}>Remove</button></> : <StatusBadge>{member.status_display}</StatusBadge>}</article>)}</div> : <EmptyState title="No roster members" description="Add the first player or staff member to this team." />}{canManage ? <form className={styles.form} onSubmit={addMember}><h4>Add roster member</h4><label>Full name<input required value={memberName} onChange={(event) => setMemberName(event.target.value)} /></label><label>Member type<select value={memberType} onChange={(event) => setMemberType(event.target.value as "PLAYER" | "STAFF")}><option value="PLAYER">Player</option><option value="STAFF">Staff</option></select></label><label>Role or position<input value={memberRole} onChange={(event) => setMemberRole(event.target.value)} /></label><button disabled={working}>Add member</button></form> : <p className={styles.readOnly}>You have read-only access to this roster.</p>}</> : null}</article></div> : null}
    {canManage ? <form className={styles.form} onSubmit={createTeam}><h3>Create National Team</h3><label>Team name<input required value={teamName} onChange={(event) => setTeamName(event.target.value)} /></label><label>Category<input required value={category} onChange={(event) => setCategory(event.target.value)} /></label><label>Gender<input value={gender} onChange={(event) => setGender(event.target.value)} /></label><button disabled={working}>Create team</button></form> : null}
  </section>;
}
