import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  createUnionAdminCompetition,
  bulkAddUnionAdminLeagueClubMemberships,
  createUnionAdminSeason,
  generateUnionAdminFixtures,
  getUnionAdminLeagueClubMemberships,
  getUnionAdminManagementCompetitions,
  getUnionAdminManagementLeagues,
  getUnionAdminManagementSeasons,
  promoteRelegateUnionAdminClub,
  removeUnionAdminLeagueClubMembership,
  rescheduleUnionAdminFixture,
  updateUnionAdminLeagueClubMembership,
  type UnionAdminClubMembershipStatus,
  type UnionAdminCompetitionRecord,
  type UnionAdminGeneratedFixture,
  type UnionAdminLeagueClubMembership,
  type UnionAdminLeagueOption,
  type UnionAdminSeasonRecord,
} from "../../services/unionAdminService";
import styles from "./UnionAdminManagementWorkflow.module.css";

type WorkflowMode = "competition" | "season" | "club" | "movement" | "fixtures";

type FixtureMatchDay = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

type ClubOption = {
  id: string;
  name: string;
};

type Props = {
  workspaceSlug: string;
  workspaceLabel: string;
  clubs: ClubOption[];
};

const statusOptions: UnionAdminClubMembershipStatus[] = [
  "ACTIVE",
  "PROMOTED",
  "RELEGATED",
  "WITHDRAWN",
  "INVITED",
  "SUSPENDED",
];

const matchDayOptions: FixtureMatchDay[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const fixtureStatusOptions = ["SCHEDULED", "POSTPONED", "CANCELLED", "ABANDONED"];

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

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function nextYearIsoDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

function toNumber(value: string) {
  const numberValue = Number.parseInt(value, 10);

  if (Number.isNaN(numberValue)) {
    throw new Error("Please select a valid option.");
  }

  return numberValue;
}

function splitMultiValueInput(value: string) {
  return value
    .replaceAll(String.fromCharCode(13), ",")
    .replaceAll(String.fromCharCode(10), ",")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function dateInputFromIso(value: string) {
  if (!value) {
    return todayIsoDate();
  }

  return new Date(value).toISOString().slice(0, 10);
}

function timeInputFromIso(value: string) {
  if (!value) {
    return "10:00";
  }

  return new Date(value).toTimeString().slice(0, 5);
}

function leagueLabel(league: UnionAdminLeagueOption) {
  return league.sport ? `${league.name} • ${league.sport}` : league.name;
}

function seasonLabel(season: UnionAdminSeasonRecord) {
  return `${season.name} • ${season.league_name}`;
}

function competitionLabel(competition: UnionAdminCompetitionRecord) {
  return `${competition.name} • ${competition.season}`;
}

export default function UnionAdminManagementWorkflow({ workspaceSlug, workspaceLabel, clubs }: Props) {
  const [mode, setMode] = useState<WorkflowMode>("competition");
  const [leagues, setLeagues] = useState<UnionAdminLeagueOption[]>([]);
  const [seasons, setSeasons] = useState<UnionAdminSeasonRecord[]>([]);
  const [competitions, setCompetitions] = useState<UnionAdminCompetitionRecord[]>([]);
  const [memberships, setMemberships] = useState<UnionAdminLeagueClubMembership[]>([]);
  const [generatedFixtures, setGeneratedFixtures] = useState<UnionAdminGeneratedFixture[]>([]);
  const [selectedFixture, setSelectedFixture] = useState<UnionAdminGeneratedFixture | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    scheduledDate: todayIsoDate(),
    kickoffTime: "10:00",
    venue: "Venue TBC",
    pitch: "Main Pitch",
    status: "SCHEDULED",
    round: "",
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");

  const [competitionForm, setCompetitionForm] = useState({
    league: "",
    season: "",
    seasonLabel: new Date().getFullYear().toString(),
    name: "",
    startDate: todayIsoDate(),
    endDate: nextYearIsoDate(),
  });

  const [seasonForm, setSeasonForm] = useState({
    league: "",
    name: "2026/27",
    startDate: todayIsoDate(),
    endDate: nextYearIsoDate(),
  });

  const [clubForm, setClubForm] = useState({
    league: "",
    season: "",
    club: "",
    status: "ACTIVE" as UnionAdminClubMembershipStatus,
    notes: "",
  });
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>([]);

  const [movementForm, setMovementForm] = useState({
    club: "",
    fromLeague: "",
    toLeague: "",
    season: "",
    targetSeason: "",
    movement: "PROMOTED" as "PROMOTED" | "RELEGATED",
    notes: "",
  });

  const [fixtureForm, setFixtureForm] = useState({
    competition: "",
    startDate: todayIsoDate(),
    firstKickoffTime: "10:00",
    intervalDays: "7",
    matchDurationMinutes: "80",
    turnaroundMinutes: "20",
    maxGamesPerDay: "6",
    matchDays: ["SATURDAY"] as FixtureMatchDay[],
    homeAndAway: true,
    clearExisting: false,
    venue: "Venue TBC",
    pitches: "Main Pitch",
    excludedDates: "",
  });

  const clubOptions = useMemo(() => {
    return Array.from(
      new Map(clubs.filter((club) => club.id && club.name).map((club) => [club.id, club])).values(),
    );
  }, [clubs]);

  const activeSeasonMembershipClubIds = useMemo(() => {
    return new Set(
      memberships
        .filter((membership) => {
          const sameLeague = !clubForm.league || String(membership.league) === clubForm.league;
          const sameSeason = !clubForm.season || String(membership.season ?? "") === clubForm.season;

          return sameLeague && sameSeason && membership.status !== "WITHDRAWN";
        })
        .map((membership) => String(membership.club)),
    );
  }, [clubForm.league, clubForm.season, memberships]);

  const selectedClubNames = useMemo(() => {
    const selected = new Set(selectedClubIds);

    return clubOptions
      .filter((club) => selected.has(club.id))
      .map((club) => club.name)
      .join(", ");
  }, [clubOptions, selectedClubIds]);

  function toggleClubSelection(clubId: string) {
    setSelectedClubIds((current) =>
      current.includes(clubId) ? current.filter((item) => item !== clubId) : [...current, clubId],
    );
  }

  function selectAllClubs() {
    setSelectedClubIds(clubOptions.map((club) => club.id));
  }

  function clearSelectedClubs() {
    setSelectedClubIds([]);
  }

  function applyDefaults(
    nextLeagues: UnionAdminLeagueOption[],
    nextSeasons: UnionAdminSeasonRecord[],
    nextCompetitions: UnionAdminCompetitionRecord[],
  ) {
    const defaultLeague = String(nextLeagues[0]?.id ?? "");
    const defaultSeason = String(nextSeasons[0]?.id ?? "");
    const defaultCompetition = String(nextCompetitions[0]?.id ?? "");
    const defaultClub = clubOptions[0]?.id ?? "";

    setCompetitionForm((current) => ({
      ...current,
      league: current.league || defaultLeague,
      season: current.season || defaultSeason,
      name: current.name || (nextLeagues[0] ? `${nextLeagues[0].name} ${current.seasonLabel}` : ""),
    }));

    setSeasonForm((current) => ({
      ...current,
      league: current.league || defaultLeague,
    }));

    setClubForm((current) => ({
      ...current,
      league: current.league || defaultLeague,
      season: current.season || defaultSeason,
      club: current.club || defaultClub,
    }));

    setMovementForm((current) => ({
      ...current,
      club: current.club || defaultClub,
      fromLeague: current.fromLeague || defaultLeague,
      toLeague: current.toLeague || String(nextLeagues[1]?.id ?? ""),
      season: current.season || defaultSeason,
      targetSeason: current.targetSeason || defaultSeason,
    }));

    setFixtureForm((current) => ({
      ...current,
      competition: current.competition || defaultCompetition,
    }));
  }

  async function refreshManagementData() {
    setIsLoading(true);

    try {
      const [nextLeagues, nextSeasons, nextCompetitions, nextMemberships] = await Promise.all([
        getUnionAdminManagementLeagues(workspaceSlug),
        getUnionAdminManagementSeasons(workspaceSlug),
        getUnionAdminManagementCompetitions(workspaceSlug),
        getUnionAdminLeagueClubMemberships(workspaceSlug),
      ]);

      setLeagues(nextLeagues);
      setSeasons(nextSeasons);
      setCompetitions(nextCompetitions);
      setMemberships(nextMemberships);
      applyDefaults(nextLeagues, nextSeasons, nextCompetitions);
      setFailureMessage("");
    } catch (error) {
      setFailureMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!workspaceSlug) return;

    void refreshManagementData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceSlug]);

  async function handleSubmit(action: () => Promise<string>, nextMode?: WorkflowMode) {
    setIsSaving(true);
    setSuccessMessage("");
    setFailureMessage("");

    try {
      const message = await action();
      await refreshManagementData();
      setSuccessMessage(message);
      if (nextMode) setMode(nextMode);
    } catch (error) {
      setFailureMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function submitCompetition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void handleSubmit(async () => {
      const competition = await createUnionAdminCompetition({
        workspace: workspaceSlug,
        league: toNumber(competitionForm.league),
        name: competitionForm.name.trim(),
        season: competitionForm.season ? toNumber(competitionForm.season) : undefined,
        season_label: competitionForm.season ? undefined : competitionForm.seasonLabel.trim(),
        start_date: competitionForm.startDate,
        end_date: competitionForm.endDate,
      });

      setFixtureForm((current) => ({ ...current, competition: String(competition.id) }));

      return `Competition ${competition.name} created. Create or select the season next.`;
    }, "season");
  }

  function submitSeason(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void handleSubmit(async () => {
      const season = await createUnionAdminSeason({
        workspace: workspaceSlug,
        league: toNumber(seasonForm.league),
        name: seasonForm.name.trim(),
        start_date: seasonForm.startDate,
        end_date: seasonForm.endDate,
      });

      setCompetitionForm((current) => ({
        ...current,
        league: String(season.league),
        season: String(season.id),
        seasonLabel: season.name,
      }));

      setClubForm((current) => ({
        ...current,
        league: String(season.league),
        season: String(season.id),
      }));

      return `Season ${season.name} created for ${season.league_name}. Add clubs next.`;
    }, "club");
  }

  function submitClub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void handleSubmit(async () => {
      if (selectedClubIds.length === 0) {
        throw new Error("Select at least one club to add to the season.");
      }

      const result = await bulkAddUnionAdminLeagueClubMemberships({
        workspace: workspaceSlug,
        league: toNumber(clubForm.league),
        season: toNumber(clubForm.season),
        club_ids: selectedClubIds,
        status: clubForm.status,
        notes: clubForm.notes.trim(),
      });

      return `${result.created} club entries created and ${result.updated} updated.`;
    }, "fixtures");
  }

  function submitMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void handleSubmit(async () => {
      const result = await promoteRelegateUnionAdminClub({
        workspace: workspaceSlug,
        club: movementForm.club,
        from_league: toNumber(movementForm.fromLeague),
        to_league: toNumber(movementForm.toLeague),
        season: movementForm.season ? toNumber(movementForm.season) : undefined,
        target_season: movementForm.targetSeason ? toNumber(movementForm.targetSeason) : undefined,
        movement: movementForm.movement,
        notes: movementForm.notes.trim(),
      });

      return `${result.target.club_name} marked as ${result.target.status_display}.`;
    });
  }

  function startReschedule(fixture: UnionAdminGeneratedFixture) {
    setSelectedFixture(fixture);
    setRescheduleForm({
      scheduledDate: dateInputFromIso(fixture.match_date),
      kickoffTime: timeInputFromIso(fixture.match_date),
      venue: fixture.venue || fixtureForm.venue || "Venue TBC",
      pitch: "Main Pitch",
      status: fixture.status || "SCHEDULED",
      round: fixture.round || "",
      reason: "",
    });
  }

  function submitFixtureReschedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFixture) {
      return;
    }

    void handleSubmit(async () => {
      const result = await rescheduleUnionAdminFixture(selectedFixture.id, {
        workspace: workspaceSlug,
        scheduled_date: rescheduleForm.scheduledDate,
        kickoff_time: rescheduleForm.kickoffTime,
        venue: rescheduleForm.venue.trim(),
        pitch: rescheduleForm.pitch.trim(),
        status: rescheduleForm.status,
        round: rescheduleForm.round.trim(),
        reason: rescheduleForm.reason.trim(),
      });

      setGeneratedFixtures((current) =>
        current.map((fixture) => (fixture.id === selectedFixture.id ? result.updated : fixture)),
      );
      setSelectedFixture(result.updated);

      return `${result.updated.home_club_name} vs ${result.updated.away_club_name} rescheduled.`;
    }, "fixtures");
  }

  function toggleFixtureMatchDay(day: FixtureMatchDay) {
    setFixtureForm((current) => {
      const nextDays = current.matchDays.includes(day)
        ? current.matchDays.filter((item) => item !== day)
        : [...current.matchDays, day];

      return {
        ...current,
        matchDays: nextDays.length > 0 ? nextDays : [day],
      };
    });
  }

  function submitFixtures(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void handleSubmit(async () => {
      const pitches = splitMultiValueInput(fixtureForm.pitches);
      const excludedDates = splitMultiValueInput(fixtureForm.excludedDates);

      const result = await generateUnionAdminFixtures({
        workspace: workspaceSlug,
        competition: toNumber(fixtureForm.competition),
        start_date: fixtureForm.startDate,
        first_kickoff_time: fixtureForm.firstKickoffTime,
        kickoff_time: fixtureForm.firstKickoffTime,
        match_days: fixtureForm.matchDays,
        interval_days: toNumber(fixtureForm.intervalDays),
        match_duration_minutes: toNumber(fixtureForm.matchDurationMinutes),
        turnaround_minutes: toNumber(fixtureForm.turnaroundMinutes),
        max_games_per_day: toNumber(fixtureForm.maxGamesPerDay),
        home_and_away: fixtureForm.homeAndAway,
        clear_existing: fixtureForm.clearExisting,
        venue: fixtureForm.venue.trim(),
        venues: [
          {
            name: fixtureForm.venue.trim() || "Venue TBC",
            pitches: pitches.length > 0 ? pitches : ["Main Pitch"],
          },
        ],
        excluded_dates: excludedDates,
      });

      setGeneratedFixtures(result.fixtures ?? []);

      return `${result.created_count} fixtures generated for ${result.competition.name}.`;
    });
  }

  return (
    <section className={styles.workflow} id="union-admin-management-workflow">
      <div className={styles.header}>
        <div>
          <span>Backend workflows</span>
          <h3>Competition → season → clubs → fixtures</h3>
          <p>
            Manage real competitions, create seasons for existing leagues, attach clubs, record promotion or
            relegation and generate fixtures for {workspaceLabel}.
          </p>
        </div>

        <button className={styles.refreshButton} type="button" onClick={() => void refreshManagementData()}>
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {successMessage ? <div className={`${styles.alert} ${styles.success}`}>{successMessage}</div> : null}
      {failureMessage ? <div className={`${styles.alert} ${styles.failure}`}>{failureMessage}</div> : null}

      <div className={styles.tabs}>
        {[
          ["competition", "Competition"],
          ["season", "Season"],
          ["club", "Add / Remove Club"],
          ["movement", "Promotion / Relegation"],
          ["fixtures", "Generate Fixtures"],
        ].map(([key, label]) => (
          <button
            className={`${styles.tabButton} ${mode === key ? styles.activeTab : ""}`}
            key={key}
            type="button"
            onClick={() => setMode(key as WorkflowMode)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {mode === "competition" ? (
          <form className={styles.card} onSubmit={submitCompetition}>
            <h4>Create competition</h4>
            <p>Select the league context and create a competition record. You can link it to a season now or after creating the season.</p>

            <div className={styles.formGrid}>
              <label>
                League
                <select
                  required
                  value={competitionForm.league}
                  onChange={(event) =>
                    setCompetitionForm((current) => ({ ...current, league: event.target.value }))
                  }
                >
                  <option value="">Select league</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {leagueLabel(league)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Existing season
                <select
                  value={competitionForm.season}
                  onChange={(event) =>
                    setCompetitionForm((current) => ({ ...current, season: event.target.value }))
                  }
                >
                  <option value="">No season selected yet</option>
                  {seasons
                    .filter((season) => !competitionForm.league || String(season.league) === competitionForm.league)
                    .map((season) => (
                      <option key={season.id} value={season.id}>
                        {seasonLabel(season)}
                      </option>
                    ))}
                </select>
              </label>

              <label className={styles.fullWidth}>
                Competition name
                <input
                  required
                  value={competitionForm.name}
                  onChange={(event) =>
                    setCompetitionForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Nile Special Rugby Premiership 2026/27"
                />
              </label>

              <label>
                Season label if no season exists
                <input
                  value={competitionForm.seasonLabel}
                  onChange={(event) =>
                    setCompetitionForm((current) => ({ ...current, seasonLabel: event.target.value }))
                  }
                  placeholder="2026/27"
                />
              </label>

              <label>
                Start date
                <input
                  type="date"
                  value={competitionForm.startDate}
                  onChange={(event) =>
                    setCompetitionForm((current) => ({ ...current, startDate: event.target.value }))
                  }
                />
              </label>

              <label>
                End date
                <input
                  type="date"
                  value={competitionForm.endDate}
                  onChange={(event) =>
                    setCompetitionForm((current) => ({ ...current, endDate: event.target.value }))
                  }
                />
              </label>

              <div className={styles.actions}>
                <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                  {isSaving ? "Creating..." : "Create Competition"}
                </button>
                <button className={styles.secondaryButton} type="button" onClick={() => setMode("season")}>
                  Next: Season
                </button>
              </div>
            </div>
          </form>
        ) : null}

        {mode === "season" ? (
          <form className={styles.card} onSubmit={submitSeason}>
            <h4>Create season</h4>
            <p>Create a new season under an already existing league. The form uses league names from the backend.</p>

            <div className={styles.formGrid}>
              <label>
                League
                <select
                  required
                  value={seasonForm.league}
                  onChange={(event) => setSeasonForm((current) => ({ ...current, league: event.target.value }))}
                >
                  <option value="">Select league</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {leagueLabel(league)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Season name
                <input
                  required
                  value={seasonForm.name}
                  onChange={(event) => setSeasonForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="2026/27"
                />
              </label>

              <label>
                Start date
                <input
                  type="date"
                  value={seasonForm.startDate}
                  onChange={(event) =>
                    setSeasonForm((current) => ({ ...current, startDate: event.target.value }))
                  }
                />
              </label>

              <label>
                End date
                <input
                  type="date"
                  value={seasonForm.endDate}
                  onChange={(event) => setSeasonForm((current) => ({ ...current, endDate: event.target.value }))}
                />
              </label>

              <div className={styles.actions}>
                <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                  {isSaving ? "Creating..." : "Create Season"}
                </button>
                <button className={styles.secondaryButton} type="button" onClick={() => setMode("club")}>
                  Next: Add Clubs
                </button>
              </div>
            </div>
          </form>
        ) : null}

        {mode === "club" ? (
          <form className={styles.card} onSubmit={submitClub}>
            <h4>Bulk add clubs to season</h4>
            <p>Select multiple clubs and attach them to the selected league season in one action.</p>

            <div className={styles.formGrid}>
              <label>
                League
                <select
                  required
                  value={clubForm.league}
                  onChange={(event) => setClubForm((current) => ({ ...current, league: event.target.value }))}
                >
                  <option value="">Select league</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {leagueLabel(league)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Season
                <select
                  required
                  value={clubForm.season}
                  onChange={(event) => setClubForm((current) => ({ ...current, season: event.target.value }))}
                >
                  <option value="">No season selected</option>
                  {seasons
                    .filter((season) => !clubForm.league || String(season.league) === clubForm.league)
                    .map((season) => (
                      <option key={season.id} value={season.id}>
                        {seasonLabel(season)}
                      </option>
                    ))}
                </select>
              </label>

              <fieldset className={`${styles.fullWidth} ${styles.checkboxFieldset}`}>
                <legend>Clubs</legend>

                <div className={styles.selectionActions}>
                  <button className={styles.secondaryButton} type="button" onClick={selectAllClubs}>
                    Select all
                  </button>
                  <button className={styles.secondaryButton} type="button" onClick={clearSelectedClubs}>
                    Clear
                  </button>
                </div>

                <div className={styles.checkboxGrid}>
                  {clubOptions.map((club) => (
                    <label className={styles.checkboxOption} key={club.id}>
                      <input
                        checked={selectedClubIds.includes(club.id)}
                        type="checkbox"
                        onChange={() => toggleClubSelection(club.id)}
                      />
                      <span>
                        <strong>{club.name}</strong>
                        {activeSeasonMembershipClubIds.has(club.id) ? <small>Already attached to this season</small> : null}
                      </span>
                    </label>
                  ))}
                </div>

                <small className={styles.helperText}>
                  {selectedClubIds.length} selected{selectedClubNames ? `: ${selectedClubNames}` : ""}
                </small>
              </fieldset>

              <label>
                Status
                <select
                  value={clubForm.status}
                  onChange={(event) =>
                    setClubForm((current) => ({
                      ...current,
                      status: event.target.value as UnionAdminClubMembershipStatus,
                    }))
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.fullWidth}>
                Notes
                <textarea
                  value={clubForm.notes}
                  onChange={(event) => setClubForm((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Reason, approval note, registration note or board decision"
                />
              </label>

              <div className={styles.actions}>
                <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Bulk Add Clubs"}
                </button>
                <button className={styles.secondaryButton} type="button" onClick={() => setMode("fixtures")}>
                  Next: Generate Fixtures
                </button>
              </div>
            </div>
          </form>
        ) : null}

        {mode === "movement" ? (
          <form className={styles.card} onSubmit={submitMovement}>
            <h4>Promotion / relegation</h4>
            <p>Move a club between leagues and keep an audit-friendly record of the movement.</p>

            <div className={styles.formGrid}>
              <label>
                Club
                <select
                  required
                  value={movementForm.club}
                  onChange={(event) => setMovementForm((current) => ({ ...current, club: event.target.value }))}
                >
                  <option value="">Select club</option>
                  {clubOptions.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Movement
                <select
                  value={movementForm.movement}
                  onChange={(event) =>
                    setMovementForm((current) => ({
                      ...current,
                      movement: event.target.value as "PROMOTED" | "RELEGATED",
                    }))
                  }
                >
                  <option value="PROMOTED">PROMOTED</option>
                  <option value="RELEGATED">RELEGATED</option>
                </select>
              </label>

              <label>
                From league
                <select
                  required
                  value={movementForm.fromLeague}
                  onChange={(event) =>
                    setMovementForm((current) => ({ ...current, fromLeague: event.target.value }))
                  }
                >
                  <option value="">Select source league</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {leagueLabel(league)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                To league
                <select
                  required
                  value={movementForm.toLeague}
                  onChange={(event) => setMovementForm((current) => ({ ...current, toLeague: event.target.value }))}
                >
                  <option value="">Select destination league</option>
                  {leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {leagueLabel(league)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Source season
                <select
                  value={movementForm.season}
                  onChange={(event) => setMovementForm((current) => ({ ...current, season: event.target.value }))}
                >
                  <option value="">No season selected</option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {seasonLabel(season)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Target season
                <select
                  value={movementForm.targetSeason}
                  onChange={(event) =>
                    setMovementForm((current) => ({ ...current, targetSeason: event.target.value }))
                  }
                >
                  <option value="">Use source season</option>
                  {seasons.map((season) => (
                    <option key={season.id} value={season.id}>
                      {seasonLabel(season)}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.fullWidth}>
                Notes
                <textarea
                  value={movementForm.notes}
                  onChange={(event) => setMovementForm((current) => ({ ...current, notes: event.target.value }))}
                  placeholder="Promotion/relegation decision, season outcome or committee note"
                />
              </label>

              <div className={styles.actions}>
                <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                  {isSaving ? "Recording..." : "Record Movement"}
                </button>
              </div>
            </div>
          </form>
        ) : null}

        {mode === "fixtures" ? (
          <form className={styles.card} onSubmit={submitFixtures}>
            <h4>Generate fixtures</h4>
            <p>
              Generate fixtures using match days, kickoff rules, match duration, venue capacity, pitches and rest dates.
            </p>

            <div className={styles.formGrid}>
              <label className={styles.fullWidth}>
                Competition
                <select
                  required
                  value={fixtureForm.competition}
                  onChange={(event) =>
                    setFixtureForm((current) => ({ ...current, competition: event.target.value }))
                  }
                >
                  <option value="">Select competition</option>
                  {competitions.map((competition) => (
                    <option key={competition.id} value={competition.id}>
                      {competitionLabel(competition)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Start date
                <input
                  type="date"
                  value={fixtureForm.startDate}
                  onChange={(event) =>
                    setFixtureForm((current) => ({ ...current, startDate: event.target.value }))
                  }
                />
              </label>

              <label>
                First kickoff time
                <input
                  type="time"
                  value={fixtureForm.firstKickoffTime}
                  onChange={(event) =>
                    setFixtureForm((current) => ({ ...current, firstKickoffTime: event.target.value }))
                  }
                />
              </label>

              <label>
                Interval days
                <input
                  min="1"
                  type="number"
                  value={fixtureForm.intervalDays}
                  onChange={(event) =>
                    setFixtureForm((current) => ({ ...current, intervalDays: event.target.value }))
                  }
                />
              </label>

              <label>
                Match duration minutes
                <input
                  min="1"
                  type="number"
                  value={fixtureForm.matchDurationMinutes}
                  onChange={(event) =>
                    setFixtureForm((current) => ({ ...current, matchDurationMinutes: event.target.value }))
                  }
                />
              </label>

              <label>
                Turnaround minutes
                <input
                  min="0"
                  type="number"
                  value={fixtureForm.turnaroundMinutes}
                  onChange={(event) =>
                    setFixtureForm((current) => ({ ...current, turnaroundMinutes: event.target.value }))
                  }
                />
              </label>

              <label>
                Max games per day
                <input
                  min="1"
                  type="number"
                  value={fixtureForm.maxGamesPerDay}
                  onChange={(event) =>
                    setFixtureForm((current) => ({ ...current, maxGamesPerDay: event.target.value }))
                  }
                />
              </label>

              <fieldset className={`${styles.fullWidth} ${styles.checkboxFieldset}`}>
                <legend>Allowed match days</legend>
                <div className={styles.dayToggleGrid}>
                  {matchDayOptions.map((day) => (
                    <label className={styles.dayToggle} key={day}>
                      <input
                        checked={fixtureForm.matchDays.includes(day)}
                        type="checkbox"
                        onChange={() => toggleFixtureMatchDay(day)}
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label>
                Venue
                <input
                  value={fixtureForm.venue}
                  onChange={(event) => setFixtureForm((current) => ({ ...current, venue: event.target.value }))}
                  placeholder="Kyadondo Rugby Club"
                />
              </label>

              <label>
                Pitches / courts / fields
                <input
                  value={fixtureForm.pitches}
                  onChange={(event) => setFixtureForm((current) => ({ ...current, pitches: event.target.value }))}
                  placeholder="Main Pitch, Pitch B"
                />
              </label>

              <label className={styles.fullWidth}>
                Excluded dates / rest weeks
                <textarea
                  value={fixtureForm.excludedDates}
                  onChange={(event) =>
                    setFixtureForm((current) => ({ ...current, excludedDates: event.target.value }))
                  }
                  placeholder={"2026-04-05\n2026-04-12"}
                />
                <small className={styles.helperText}>Use one date per line or comma-separated dates.</small>
              </label>

              <label>
                Home and away
                <select
                  value={fixtureForm.homeAndAway ? "yes" : "no"}
                  onChange={(event) =>
                    setFixtureForm((current) => ({ ...current, homeAndAway: event.target.value === "yes" }))
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">Single round</option>
                </select>
              </label>

              <label>
                Existing fixtures
                <select
                  value={fixtureForm.clearExisting ? "replace" : "keep"}
                  onChange={(event) =>
                    setFixtureForm((current) => ({ ...current, clearExisting: event.target.value === "replace" }))
                  }
                >
                  <option value="keep">Do not replace</option>
                  <option value="replace">Replace scheduled-only fixtures</option>
                </select>
              </label>

              <div className={`${styles.fullWidth} ${styles.fixtureSummary}`}>
                <strong>Schedule rule preview</strong>
                <span>
                  {fixtureForm.matchDays.join(", ")} • every {fixtureForm.intervalDays} day(s) • first kickoff {fixtureForm.firstKickoffTime} • {fixtureForm.matchDurationMinutes} min match + {fixtureForm.turnaroundMinutes} min turnaround
                </span>
              </div>

              <div className={styles.actions}>
                <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                  {isSaving ? "Generating..." : "Generate Fixtures"}
                </button>
              </div>
            </div>

            {generatedFixtures.length > 0 ? (
              <div className={styles.fixturePreview}>
                {generatedFixtures.slice(0, 8).map((fixture) => (
                  <div key={fixture.id}>
                    <strong>
                      {fixture.home_club_name} vs {fixture.away_club_name}
                    </strong>
                    <span>
                      {fixture.round} • {new Date(fixture.match_date).toLocaleString()} • {fixture.venue}
                    </span>
                    <button className={styles.secondaryButton} type="button" onClick={() => startReschedule(fixture)}>
                      Reschedule
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {selectedFixture ? (
              <form className={styles.reschedulePanel} onSubmit={submitFixtureReschedule}>
                <div className={styles.panelHeader}>
                  <div>
                    <strong>Reschedule fixture</strong>
                    <span>
                      {selectedFixture.home_club_name} vs {selectedFixture.away_club_name}
                    </span>
                  </div>
                  <button className={styles.secondaryButton} type="button" onClick={() => setSelectedFixture(null)}>
                    Close
                  </button>
                </div>

                <div className={styles.formGrid}>
                  <label>
                    New date
                    <input
                      type="date"
                      value={rescheduleForm.scheduledDate}
                      onChange={(event) =>
                        setRescheduleForm((current) => ({ ...current, scheduledDate: event.target.value }))
                      }
                    />
                  </label>

                  <label>
                    New kickoff time
                    <input
                      type="time"
                      value={rescheduleForm.kickoffTime}
                      onChange={(event) =>
                        setRescheduleForm((current) => ({ ...current, kickoffTime: event.target.value }))
                      }
                    />
                  </label>

                  <label>
                    Venue
                    <input
                      value={rescheduleForm.venue}
                      onChange={(event) => setRescheduleForm((current) => ({ ...current, venue: event.target.value }))}
                    />
                  </label>

                  <label>
                    Pitch / court / field
                    <input
                      value={rescheduleForm.pitch}
                      onChange={(event) => setRescheduleForm((current) => ({ ...current, pitch: event.target.value }))}
                    />
                  </label>

                  <label>
                    Round
                    <input
                      value={rescheduleForm.round}
                      onChange={(event) => setRescheduleForm((current) => ({ ...current, round: event.target.value }))}
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={rescheduleForm.status}
                      onChange={(event) => setRescheduleForm((current) => ({ ...current, status: event.target.value }))}
                    >
                      {fixtureStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.fullWidth}>
                    Reason for change
                    <textarea
                      required
                      value={rescheduleForm.reason}
                      onChange={(event) => setRescheduleForm((current) => ({ ...current, reason: event.target.value }))}
                      placeholder="Moved because of Easter weekend, public holiday, venue conflict, or club engagement."
                    />
                  </label>

                  <div className={styles.actions}>
                    <button className={styles.primaryButton} type="submit" disabled={isSaving}>
                      {isSaving ? "Saving..." : "Save Reschedule"}
                    </button>
                  </div>
                </div>
              </form>
            ) : null}
          </form>
        ) : null}

        <aside className={styles.card}>
          <h4>Current backend records</h4>
          <p>
            {leagues.length} leagues • {seasons.length} seasons • {competitions.length} competitions •{" "}
            {memberships.length} club entries
          </p>

          <div className={styles.list}>
            {memberships.slice(0, 12).map((membership) => (
              <div className={styles.listItem} key={membership.id}>
                <strong>{membership.club_name}</strong>
                <span>{membership.league_name}</span>
                <small>
                  {membership.season_name ?? "No season"} • {membership.status_display}
                </small>

                <div className={styles.itemActions}>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={() =>
                      void handleSubmit(async () => {
                        const updated = await updateUnionAdminLeagueClubMembership(membership.id, {
                          workspace: workspaceSlug,
                          status: "ACTIVE",
                          notes: membership.notes,
                        });

                        return `${updated.club_name} marked active.`;
                      })
                    }
                  >
                    Mark Active
                  </button>
                    <button
                      className={styles.dangerButton}
                      type="button"
                      onClick={() =>
                        void handleSubmit(async () => {
                          await removeUnionAdminLeagueClubMembership(membership.id, workspaceSlug);

                          return `${membership.club_name} removed from active league list.`;
                        })
                      }
                    >
                      Remove
                    </button>
                </div>
              </div>
            ))}

            {memberships.length === 0 ? <p>No league club entries yet.</p> : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
