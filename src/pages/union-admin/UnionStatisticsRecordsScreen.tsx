import { useCallback, useEffect, useRef, useState } from "react";

import { EmptyState, ErrorState, LoadingState, ScreenHeader } from "../../components/union-admin/UnionAdminUi";
import { getUnionDashboardOverview, type UnionDashboardSummary } from "../../services/unionAdminService";
import styles from "./UnionStatisticsRecordsScreen.module.css";

const metrics: Array<{ key: keyof UnionDashboardSummary; label: string; description: string }> = [
  { key: "active_competitions", label: "Active competitions", description: "Currently active maintained competitions" },
  { key: "member_clubs", label: "Member clubs", description: "Clubs affiliated with this Union" },
  { key: "national_teams", label: "National Teams", description: "Union-owned representative teams" },
  { key: "pending_approvals", label: "Pending approvals", description: "Workspace approval items awaiting action" },
  { key: "referees", label: "Match officials", description: "Maintained Union official profiles" },
  { key: "upcoming_matches", label: "Upcoming fixtures", description: "Scheduled future workspace matches" },
];

function messageFor(error: unknown) {
  const response = (error as { response?: { status?: number; data?: { detail?: string } } })?.response;
  if (response?.status === 403) return "You do not have permission to view statistics for this workspace.";
  return response?.data?.detail || "Workspace statistics could not be loaded. Please retry.";
}

export interface UnionStatisticsRecordsScreenProps { workspaceSlug: string; workspaceName: string }

export default function UnionStatisticsRecordsScreen({ workspaceSlug, workspaceName }: UnionStatisticsRecordsScreenProps) {
  const generation = useRef(0);
  const [summary, setSummary] = useState<UnionDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true); setError(""); setSummary(null);
    try { const response = await getUnionDashboardOverview(workspaceSlug); if (generation.current === current) setSummary(response.summary); }
    catch (loadError) { if (generation.current === current) setError(messageFor(loadError)); }
    finally { if (generation.current === current) setLoading(false); }
  }, [workspaceSlug]);

  useEffect(() => { void load(); return () => { generation.current += 1; }; }, [load]);

  return <section className={styles.screen}>
    <ScreenHeader eyebrow="Statistics & records" title="Workspace statistics" description={`Authoritative operational counts maintained by the backend for ${workspaceName}.`} />
    {loading ? <LoadingState label="Loading workspace statistics…" /> : null}
    {error ? <div className={styles.error}><ErrorState message={error} /><button type="button" onClick={() => void load()}>Retry</button></div> : null}
    {!loading && !error && summary ? <div className={styles.grid} aria-label="Workspace statistics">{metrics.map((metric) => <article key={metric.key}><span>{metric.label}</span><strong>{summary[metric.key] ?? 0}</strong><p>{metric.description}</p></article>)}</div> : null}
    {!loading && !error && !summary ? <EmptyState title="No statistics available" description="The backend did not return a workspace summary." /> : null}
  </section>;
}
