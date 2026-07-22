import { Building2, RefreshCw, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  createUnionAdminClub,
  deleteUnionAdminClub,
  getUnionAdminClubs,
  updateUnionAdminClub,
  type UnionAdminClubRecord,
} from "../../services/unionAdminService";
import SafeImage from "../SafeImage/SafeImage";
import styles from "./UnionAdminClubsPanel.module.css";

type Props = {
  workspaceSlug: string;
  workspaceLabel: string;
  sport: string;
  canManageClubs: boolean;
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

export default function UnionAdminClubsPanel({
  workspaceSlug,
  workspaceLabel,
  sport,
  canManageClubs,
}: Props) {
  const workspaceSlugRef = useRef(workspaceSlug);
  const workspaceGenerationRef = useRef(0);
  const requestGenerationRef = useRef(0);
  workspaceSlugRef.current = workspaceSlug;
  const [clubs, setClubs] = useState<UnionAdminClubRecord[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [affiliationStatus, setAffiliationStatus] = useState("ALL");
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

  const filteredClubs = clubs.filter((club) => {
    const matchesQuery =
      `${club.name} ${club.short_name} ${club.sport_display} ${club.admin_name} ${club.compliance}`
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesStatus =
      affiliationStatus === "ALL" ||
      club.memberships.some((membership) => membership.status === affiliationStatus);
    return matchesQuery && matchesStatus;
  });

  const selectedClub =
    filteredClubs.find((club) => club.id === selectedClubId) ??
    filteredClubs[0] ??
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
      short_name: club.short_name,
      sport: club.sport,
      primary_color: club.primary_color,
      secondary_color: club.secondary_color,
      admin_email: club.admin_email,
    });
    setSelectedClubId(club.id);
    setShowForm(true);
  }

  async function refreshClubs(searchValue = query) {
    const requestWorkspaceSlug = workspaceSlug;
    const workspaceGeneration = workspaceGenerationRef.current;
    const requestGeneration = ++requestGenerationRef.current;
    const isCurrentRequest = () =>
      workspaceSlugRef.current === requestWorkspaceSlug &&
      workspaceGenerationRef.current === workspaceGeneration &&
      requestGenerationRef.current === requestGeneration;

    setIsLoading(true);

    try {
      const nextClubs = await getUnionAdminClubs(requestWorkspaceSlug, searchValue);
      if (!isCurrentRequest()) return;

      setClubs(nextClubs);
      setFailureMessage("");

      if (!selectedClubId && nextClubs[0]) {
        setSelectedClubId(nextClubs[0].id);
      }
    } catch (error) {
      if (!isCurrentRequest()) return;

      setFailureMessage(getErrorMessage(error));
    } finally {
      if (isCurrentRequest()) setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!workspaceSlug) return;

    workspaceGenerationRef.current += 1;
    resetForm(sport);
    setQuery("");
    setAffiliationStatus("ALL");
    setSelectedClubId(null);
    setClubs([]);
    setIsSaving(false);
    setSuccessMessage("");
    setFailureMessage("");
    void refreshClubs("");

    return () => {
      workspaceGenerationRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceSlug, sport]);

  function submitClub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const mutationWorkspaceSlug = workspaceSlug;
    const mutationGeneration = workspaceGenerationRef.current;
    const isCurrentMutation = () =>
      workspaceSlugRef.current === mutationWorkspaceSlug &&
      workspaceGenerationRef.current === mutationGeneration;

    setIsSaving(true);
    setSuccessMessage("");
    setFailureMessage("");

    const payload = {
      workspace: workspaceSlug,
      name: form.name.trim(),
      short_name: form.short_name.trim(),
      sport: form.sport,
      primary_color: form.primary_color.trim(),
      secondary_color: form.secondary_color.trim(),
      admin_email: form.admin_email.trim(),
    };

    const request = selectedClubId && showForm
      ? updateUnionAdminClub(selectedClubId, payload)
      : createUnionAdminClub(payload);

    void request
      .then((club) => {
        if (!isCurrentMutation()) return;

        setSelectedClubId(club.id);
        setSuccessMessage(`${club.name} saved successfully.`);
        setShowForm(false);
        resetForm();
        return refreshClubs();
      })
      .catch((error: unknown) => {
        if (!isCurrentMutation()) return;

        setFailureMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (isCurrentMutation()) setIsSaving(false);
      });
  }

  function deleteSelectedClub() {
    if (!selectedClub) return;
    if (
      !window.confirm(
        `Delete ${selectedClub.name}? This is only allowed when the club has no league, fixture or standings records.`,
      )
    ) {
      return;
    }

    const mutationWorkspaceSlug = workspaceSlug;
    const mutationGeneration = workspaceGenerationRef.current;
    const isCurrentMutation = () =>
      workspaceSlugRef.current === mutationWorkspaceSlug &&
      workspaceGenerationRef.current === mutationGeneration;

    setIsSaving(true);
    setSuccessMessage("");
    setFailureMessage("");

    void deleteUnionAdminClub(selectedClub.id, workspaceSlug)
      .then(() => {
        if (!isCurrentMutation()) return;

        setSuccessMessage(`${selectedClub.name} deleted.`);
        setSelectedClubId(null);
        return refreshClubs();
      })
      .catch((error: unknown) => {
        if (!isCurrentMutation()) return;

        setFailureMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (isCurrentMutation()) setIsSaving(false);
      });
  }

  return (
    <section className={styles.panel}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarText}>
          <span>Club directory</span>
          <h2>Clubs and teams</h2>
          <p>
            Manage real club profiles for {workspaceLabel}, assign existing admins, review membership status
            and prepare clubs for league seasons and fixtures.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={() => void refreshClubs()}
          >
            <RefreshCw size={16} aria-hidden="true" />
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
          {canManageClubs ? (
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
          ) : null}
        </div>
      </div>

      {successMessage ? <div className={`${styles.alert} ${styles.success}`} role="status" aria-live="polite">{successMessage}</div> : null}
      {failureMessage ? <div className={`${styles.alert} ${styles.failure}`} role="alert">{failureMessage}<button type="button" onClick={() => void refreshClubs()}>Retry</button></div> : null}

      <div className={styles.searchBar}>
        <Search size={18} />
        <input
          aria-label="Search clubs"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => void refreshClubs(query)}
          placeholder="Search clubs, admins, compliance or sport"
        />
        <select
          aria-label="Affiliation status"
          value={affiliationStatus}
          onChange={(event) => setAffiliationStatus(event.target.value)}
        >
          <option value="ALL">All affiliations</option>
          <option value="ACTIVE">Active</option>
          <option value="INVITED">Invited</option>
          <option value="PROMOTED">Promoted</option>
          <option value="RELEGATED">Relegated</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </select>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.clubList}>
            {isLoading && clubs.length === 0 ? (
              <div className={styles.empty} role="status">Loading clubs…</div>
            ) : null}
            {!isLoading && filteredClubs.map((club) => (
              <button
                className={`${styles.clubRow} ${
                  selectedClub?.id === club.id
                    ? styles.clubRowActive
                    : ""
                }`}
                key={club.id}
                type="button"
                onClick={() => setSelectedClubId(club.id)}
              >
                <SafeImage
                  alt={`${club.name} logo`}
                  className={styles.logoImage}
                  fallback={
                    initials(club.name) || (
                      <Building2 size={18} aria-hidden="true" />
                    )
                  }
                  fallbackClassName={styles.logo}
                  src={club.logo_url}
                />

                <span className={styles.clubIdentity}>
                  <strong>{club.name}</strong>
                  <small>{club.sport_display}</small>
                  <span>
                    {club.admin_name || "No club admin assigned"}
                  </span>
                </span>

                <span className={styles.badge}>
                  {club.compliance}
                </span>
              </button>
            ))}

            {!isLoading && filteredClubs.length === 0 ? <div className={styles.empty}>{clubs.length ? "No clubs match the current filters." : "No clubs are affiliated with this workspace yet."}</div> : null}
          </div>
        </div>

        <aside className={styles.card}>
          {showForm && canManageClubs ? (
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
                  <X size={15} aria-hidden="true" />
                  Cancel
                </button>
              </div>
            </form>
          ) : selectedClub ? (
            <>
              <div className={styles.detailHeader}>
                <SafeImage
                  alt={`${selectedClub.name} logo`}
                  className={styles.logoImage}
                  fallback={
                    initials(selectedClub.name) || (
                      <Building2 size={20} aria-hidden="true" />
                    )
                  }
                  fallbackClassName={styles.logo}
                  src={selectedClub.logo_url}
                />

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
                {selectedClub.memberships.map((membership) => (
                  <div className={styles.membership} key={membership.id}>
                    <strong>{membership.league_name}</strong>
                    <span>
                      {membership.season_name ?? "No season"} • {membership.status_display}
                    </span>
                  </div>
                ))}

                {selectedClub.memberships.length === 0 ? (
                  <div className={styles.empty}>
                    This club is not attached to a league season yet. Use the Competition management workflow
                    to add it to a league and season.
                  </div>
                ) : null}
              </div>

              <div className={styles.actions}>
                <a className={styles.secondaryButton} href={`/clubs/${selectedClub.slug}`}>
                  View public club page
                </a>
              </div>

              {canManageClubs ? (
                <div className={styles.actions}>
                  <button className={styles.secondaryButton} type="button" onClick={() => loadClubIntoForm(selectedClub)}>
                    Edit Club
                  </button>
                  <button className={styles.dangerButton} type="button" onClick={deleteSelectedClub} disabled={isSaving}>
                    Delete if unattached
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className={styles.empty}>Select a club to view details.</div>
          )}
        </aside>
      </div>
    </section>
  );
}
