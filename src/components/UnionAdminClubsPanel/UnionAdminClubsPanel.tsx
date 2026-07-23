import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  deleteUnionAdminClub,
  getUnionAdminClubs,
  updateUnionAdminClub,
  type UnionAdminClubRecord,
  type UnionAdminLeagueClubMembership,
} from "../../services/unionAdminService";
import styles from "./UnionAdminClubsPanel.module.css";

type Props = {
  workspaceSlug: string;
  workspaceLabel: string;
  sport: string;
  fallbackClubs: Array<{
    id: string | number;
    name: string;
    category?: string;
    teams?: number;
    players?: number;
    compliance?: string;
    admin?: string;
  }>;
};

const sportOptions = [
  { value: "RUGBY", label: "Rugby" },
  { value: "FOOTBALL", label: "Football" },
  { value: "BASKETBALL", label: "Basketball" },
  { value: "MULTI_SPORT", label: "Multi-Sport" },
  { value: "OTHER", label: "Other" },
];

function normaliseSport(sport: string) {
  const value = sport.trim().toUpperCase().replace(/\s+/g, "_");
  return sportOptions.some((option) => option.value === value) ? value : "OTHER";
}

function getErrorMessage(error: unknown) {
  const maybeError = error as {
    response?: {
      data?: {
        detail?: string;
        message?: string;
      };
    };
    message?: string;
  };
  return (
    maybeError.response?.data?.detail ??
    maybeError.response?.data?.message ??
    maybeError.message ??
    "The action could not be completed."
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function mapMembershipToClubRecord(membership: UnionAdminLeagueClubMembership): UnionAdminClubRecord {
  return {
    id: membership.club,
    name: membership.club_name,
    category: "League Club",
    slug: membership.club_slug,
    short_name: membership.club_short_name,
    sport: "",
    sport_display: `${membership.league_name} • ${membership.season_name ?? "No season"}`,
    logo_url: null,
    banner_url: null,
    primary_color: "",
    secondary_color: "",
    admin: "",
    admin_name: membership.notes || "",
    admin_email: "",
    teams: 0,
    players: 0,
    compliance: membership.status_display,
    memberships: [membership],
    created_at: membership.created_at,
  };
}

function fallbackToClubRecord(club: Props["fallbackClubs"][number], sport: string): UnionAdminClubRecord {
  return {
    id: Number(club.id),
    name: club.name,
    category: club.category ?? "Club",
    slug: club.name.toLowerCase().replace(/\s+/g, "-"),
    short_name: "",
    sport: normaliseSport(sport),
    sport_display: club.category ?? sport,
    logo_url: null,
    banner_url: null,
    primary_color: "",
    secondary_color: "",
    admin: "",
    admin_name: club.admin ?? "",
    admin_email: "",
    teams: club.teams ?? 0,
    players: club.players ?? 0,
    compliance: club.compliance ?? "Review",
    memberships: [],
    created_at: "",
  };
}

export default function UnionAdminClubsPanel({ workspaceSlug, workspaceLabel, sport, fallbackClubs }: Props) {
  const [clubs, setClubs] = useState<UnionAdminClubRecord[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    short_name: "",
    sport: normaliseSport(sport),
    primary_color: "",
    secondary_color: "",
    admin_email: "",
  });

  const fallbackRecords = useMemo(
    () => fallbackClubs.map((club) => fallbackToClubRecord(club, sport)),
    [fallbackClubs, sport],
  );

  const visibleClubs = clubs.length > 0 ? clubs : fallbackRecords;

  const filteredClubs = visibleClubs.filter((club) =>
    `${club.name} ${club.short_name} ${club.sport_display} ${club.admin_name} ${club.compliance}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const selectedClub =
    visibleClubs.find((club) => club.id === selectedClubId) ??
    filteredClubs[0] ??
    visibleClubs[0] ??
    null;

  function resetForm(nextSport = sport) {
    setForm({
      name: "",
      short_name: "",
      sport: normaliseSport(nextSport),
      primary_color: "",
      secondary_color: "",
      admin_email: "",
    });
  }

  function loadClubIntoForm(club: UnionAdminClubRecord) {
    setForm({
      name: club.name,
      short_name: club.short_name ?? "",
      sport: club.sport ?? "",
      primary_color: club.primary_color ?? "",
      secondary_color: club.secondary_color ?? "",
      admin_email: club.admin_email ?? "",
    });
    setSelectedClubId(club.id);
    setShowForm(true);
  }

  async function refreshClubs(searchValue = query) {
    setIsLoading(true);
    try {
      const nextMemberships = await getUnionAdminClubs(workspaceSlug, searchValue);
      const nextClubs = nextMemberships.map(mapMembershipToClubRecord);
      setClubs(nextClubs);
      setFailureMessage("");
      if (!selectedClubId && nextClubs[0]) {
        setSelectedClubId(nextClubs[0].id);
      }
    } catch (error) {
      setFailureMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!workspaceSlug) return;
    resetForm(sport);
    void refreshClubs("");
  }, [workspaceSlug, sport]);

  function submitClub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    setFailureMessage("");

    if (selectedClubId && showForm) {
      void updateUnionAdminClub(selectedClubId, {
        workspace: workspaceSlug,
        status: "ACTIVE",
        notes: form.name.trim(),
      })
        .then(() => {
          const savedName = form.name.trim() || selectedClub?.name || "Club";
          setSuccessMessage(`${savedName} updated successfully.`);
          setShowForm(false);
          resetForm();
          return refreshClubs();
        })
        .catch((error: unknown) => {
          setFailureMessage(getErrorMessage(error));
        })
        .finally(() => {
          setIsSaving(false);
        });
    }
  }

  function deleteSelectedClub() {
    if (!selectedClub) return;
    setIsSaving(true);
    setSuccessMessage("");
    setFailureMessage("");

    void deleteUnionAdminClub(selectedClub.id, workspaceSlug)
      .then(() => {
        setSuccessMessage(`${selectedClub.name} deleted.`);
        setSelectedClubId(null);
        return refreshClubs();
      })
      .catch((error: unknown) => {
        setFailureMessage(getErrorMessage(error));
      })
      .finally(() => {
        setIsSaving(false);
      });
  }

  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarText}>
          <span>Club directory</span>
          <h3>Clubs and teams</h3>
          <p>
            Manage real club profiles for {workspaceLabel}, assign existing admins, review membership status
            and prepare clubs for league seasons and fixtures.
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.secondaryButton} type="button" onClick={() => void refreshClubs()}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => {
              setSelectedClubId(null);
              resetForm();
              setShowForm(true);
            }}
          >
            Add Club
          </button>
        </div>
      </div>

      {successMessage ? <div className={`${styles.alert} ${styles.success}`}>{successMessage}</div> : null}
      {failureMessage ? <div className={`${styles.alert} ${styles.failure}`}>{failureMessage}</div> : null}

      <div className={styles.searchBar}>
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => void refreshClubs(query)}
          placeholder="Search clubs, admins, compliance or sport"
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.clubList}>
            {filteredClubs.map((club) => (
              <button
                className={styles.clubRow}
                key={club.id}
                type="button"
                onClick={() => setSelectedClubId(club.id)}
              >
                <span className={styles.logo}>
                  {club.logo_url ? <img alt="" src={club.logo_url} /> : initials(club.name)}
                </span>
                <span>
                  <strong>{club.name}</strong>
                  <small>
                    {club.sport_display} • {club.admin_name || "No club admin assigned"}
                  </small>
                </span>
                <span className={styles.badge}>{club.compliance}</span>
              </button>
            ))}
            {filteredClubs.length === 0 ? <div className={styles.empty}>No clubs found.</div> : null}
          </div>
        </div>

        <aside className={styles.card}>
          {showForm ? (
            <form className={styles.formGrid} onSubmit={submitClub}>
              <label className={styles.fullWidth}>
                Club name
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="KCB KOBS"
                />
              </label>
              <label>
                Short name
                <input
                  value={form.short_name}
                  onChange={(event) => setForm((current) => ({ ...current, short_name: event.target.value }))}
                  placeholder="KOBS"
                />
              </label>
              <label>
                Sport
                <select
                  value={form.sport}
                  onChange={(event) => setForm((current) => ({ ...current, sport: event.target.value }))}
                >
                  {sportOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Primary color
                <input
                  value={form.primary_color}
                  onChange={(event) => setForm((current) => ({ ...current, primary_color: event.target.value }))}
                  placeholder="#160e39"
                />
              </label>
              <label>
                Secondary color
                <input
                  value={form.secondary_color}
                  onChange={(event) => setForm((current) => ({ ...current, secondary_color: event.target.value }))}
                  placeholder="#f97316"
                />
              </label>
              <label className={styles.fullWidth}>
                Existing admin email
                <input
                  value={form.admin_email}
                  onChange={(event) => setForm((current) => ({ ...current, admin_email: event.target.value }))}
                  placeholder="club.admin@example.com"
                />
              </label>
              <div className={styles.formActions}>
                <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Club"}
                </button>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : selectedClub ? (
            <>
              <div className={styles.detailHeader}>
                <span className={styles.logo}>
                  {selectedClub.logo_url ? <img alt="" src={selectedClub.logo_url} /> : initials(selectedClub.name)}
                </span>
                <div>
                  <strong>{selectedClub.name}</strong>
                  <span>{selectedClub.sport_display}</span>
                </div>
              </div>
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span>Teams</span>
                  <strong>{selectedClub.teams}</strong>
                </div>
                <div className={styles.metaItem}>
                  <span>Players</span>
                  <strong>{selectedClub.players}</strong>
                </div>
                <div className={styles.metaItem}>
                  <span>Compliance</span>
                  <strong>{selectedClub.compliance}</strong>
                </div>
                <div className={styles.metaItem}>
                  <span>Club admin</span>
                  <strong>{selectedClub.admin_name || "Not assigned"}</strong>
                </div>
              </div>
              <h4>League memberships</h4>
              <div className={styles.memberships}>
                {(selectedClub.memberships ?? []).map((membership) => (
                  <div className={styles.membership} key={membership.id}>
                    <strong>{membership.league_name}</strong>
                    <span>
                      {membership.season_name ?? "No season"} • {membership.status_display}
                    </span>
                  </div>
                ))}
                {(selectedClub.memberships ?? []).length === 0 ? (
                  <div className={styles.empty}>
                    This club is not attached to a league season yet. Use the Competition management workflow
                    to add it to a league and season.
                  </div>
                ) : null}
              </div>
              <div className={styles.actions}>
                <button className={styles.secondaryButton} type="button" onClick={() => loadClubIntoForm(selectedClub)}>
                  Edit Club
                </button>
                <button className={styles.dangerButton} type="button" onClick={deleteSelectedClub} disabled={isSaving}>
                  Delete if unattached
                </button>
              </div>
            </>
          ) : (
            <div className={styles.empty}>Select a club to view details.</div>
          )}
        </aside>
      </div>
    </section>
  );
}