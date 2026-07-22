import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  createUnionCompetitionWorkflow,
  getUnionCompetitionEligibleAdministrators,
  type UnionAdminLeagueOption,
  type UnionAdminSeasonRecord,
  type UnionCompetitionEligibleAdministrator,
  type UnionCompetitionIdentity,
  type UnionCompetitionFormat,
  type UnionWorkspaceOption,
} from "../../services/unionAdminService";
import styles from "./UnionCompetitionsScreen.module.css";

const steps = ["Identity", "Format", "Administrators", "First season", "Club participation", "Review"];
const types = ["LEAGUE", "KNOCKOUT", "GROUP_AND_KNOCKOUT", "TOURNAMENT", "SERIES", "COMMUNITY"];

function collectApiMessages(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectApiMessages);
  if (value && typeof value === "object") return Object.values(value).flatMap(collectApiMessages);
  return [];
}

type Props = {
  workspace: UnionWorkspaceOption;
  leagues: UnionAdminLeagueOption[];
  seasons: UnionAdminSeasonRecord[];
  identities: UnionCompetitionIdentity[];
  onCancel: () => void;
  onCreated: (result: Awaited<ReturnType<typeof createUnionCompetitionWorkflow>>) => void;
  onError: (message: string) => void;
};

export default function CompetitionCreationWizard({ workspace, leagues, seasons, identities, onCancel, onCreated, onError }: Props) {
  const [step, setStep] = useState(0);
  const [working, setWorking] = useState(false);
  const [eligible, setEligible] = useState<UnionCompetitionEligibleAdministrator[]>([]);
  const [administratorLoadFailed, setAdministratorLoadFailed] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("LEAGUE");
  const [league, setLeague] = useState(String(leagues[0]?.id ?? ""));
  const [tier, setTier] = useState("1");
  const [higher, setHigher] = useState("");
  const [format, setFormat] = useState("DOUBLE_ROUND_ROBIN");
  const [minimumClubs, setMinimumClubs] = useState("4");
  const [maximumClubs, setMaximumClubs] = useState("16");
  const [duration, setDuration] = useState("90");
  const [promotion, setPromotion] = useState(false);
  const [relegation, setRelegation] = useState(false);
  const [promoted, setPromoted] = useState("0");
  const [relegated, setRelegated] = useState("0");
  const [admin, setAdmin] = useState("");
  const [adminRole, setAdminRole] = useState("COMPETITION_ADMIN");
  const [season, setSeason] = useState("");
  const [registrationOpen, setRegistrationOpen] = useState("");
  const [registrationClose, setRegistrationClose] = useState("");
  const [entryFee, setEntryFee] = useState("");

  useEffect(() => {
    let current = true;
    setAdministratorLoadFailed(false);
    getUnionCompetitionEligibleAdministrators(workspace.slug)
      .then((rows) => { if (current) setEligible(rows); })
      .catch(() => { if (current) { setEligible([]); setAdministratorLoadFailed(true); } });
    return () => { current = false; };
  }, [workspace.slug]);

  const availableSeasons = useMemo(() => seasons.filter((item) => item.league === Number(league)), [league, seasons]);
  function validateStep() {
    if (step === 0) {
      if (!name.trim()) return "Enter a competition name before continuing.";
      if (!league) return "Select a primary league before continuing.";
      if (!Number.isInteger(Number(tier)) || Number(tier) < 1) return "Tier must be a whole number of 1 or more.";
    }
    if (step === 1) {
      const minimum = Number(minimumClubs);
      const maximum = Number(maximumClubs);
      const minutes = Number(duration);
      if (!Number.isInteger(minutes) || minutes < 10 || minutes > 240) return "Match duration must be a whole number between 10 and 240 minutes.";
      if (!Number.isInteger(minimum) || minimum < 2 || minimum > 256) return "Minimum clubs must be a whole number between 2 and 256.";
      if (!Number.isInteger(maximum) || maximum < minimum || maximum > 256) return "Maximum clubs must be a whole number between the minimum and 256.";
      if (promotion && (!Number.isInteger(Number(promoted)) || Number(promoted) < 1 || Number(promoted) > 32)) return "Promoted clubs must be a whole number between 1 and 32.";
      if (relegation && (!Number.isInteger(Number(relegated)) || Number(relegated) < 1 || Number(relegated) > 32)) return "Relegated clubs must be a whole number between 1 and 32.";
    }
    if (step === 2) {
      if (administratorLoadFailed) return "Administrator choices could not be loaded. Close and reopen the wizard before continuing.";
      if (!admin) return "Select an active workspace administrator before continuing.";
    }
    if (step === 3) {
      if (!season || !availableSeasons.some((item) => item.id === Number(season))) return "Select a season belonging to the primary league.";
      if (registrationOpen && registrationClose && new Date(registrationClose) < new Date(registrationOpen)) return "Registration cannot close before it opens.";
      if (entryFee && (!Number.isFinite(Number(entryFee)) || Number(entryFee) < 0)) return "Entry fee must be zero or a positive amount.";
    }
    return "";
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const invalid = validateStep();
    if (invalid) { setValidationMessage(invalid); return; }
    setValidationMessage("");
    if (step < 5) { setStep((value) => value + 1); return; }
    setWorking(true);
    try {
      const result = await createUnionCompetitionWorkflow({
        workspace: workspace.slug,
        identity: {
          name: name.trim(), description: description.trim(), primary_league: Number(league), sport: workspace.sport,
          competition_type: type, tier: Number(tier), ...(higher ? { higher_competition: Number(higher) } : {}), is_active: true,
          default_eligibility_rules: {},
          default_format: {
            format: format as UnionCompetitionFormat["format"], number_of_legs: format === "DOUBLE_ROUND_ROBIN" ? 2 : 1,
            ...(format === "GROUPS_AND_KNOCKOUT" ? { number_of_groups: 4, clubs_per_group: 4, advancing_per_group: 2 } : {}),
            home_and_away: format === "DOUBLE_ROUND_ROBIN", match_duration_minutes: Number(duration), minimum_clubs: Number(minimumClubs), maximum_clubs: Number(maximumClubs),
            promotion_enabled: promotion, relegation_enabled: relegation, number_promoted: promotion ? Number(promoted) : 0, number_relegated: relegation ? Number(relegated) : 0,
            points_for_win: 3, points_for_draw: 1, points_for_loss: 0, tie_break_order: ["POINTS", "SCORE_DIFFERENCE", "SCORES_FOR"], gameweek_structure: "WEEKLY",
          },
        },
        first_edition: { season: Number(season), currency: "UGX", ...(registrationOpen ? { registration_opens_at: new Date(registrationOpen).toISOString() } : {}), ...(registrationClose ? { registration_closes_at: new Date(registrationClose).toISOString() } : {}), ...(entryFee ? { entry_fee: entryFee } : {}) },
        administrators: [{ user: Number(admin), role: adminRole }],
      });
      onCreated(result);
    } catch (error) {
      const candidate = error as { response?: { data?: unknown } };
      const apiMessages = collectApiMessages(candidate.response?.data);
      onError(candidate.response
        ? `Competition was not created${apiMessages.length ? `: ${apiMessages.join(" ")}` : ". The server rejected the request."}`
        : "Competition creation could not be confirmed. Check the competition directory before retrying.");
    } finally { setWorking(false); }
  }

  return <form className={styles.wizard} onSubmit={submit}>
    <div className={styles.wizardHeader}><div><span>Step {step + 1} of {steps.length}</span><h3>{steps[step]}</h3></div><button type="button" className={styles.subtleButton} onClick={onCancel}>Close wizard</button></div>
    <ol className={styles.stepper} aria-label="Competition creation progress">{steps.map((label, index) => <li key={label} aria-current={index === step ? "step" : undefined} className={index === step ? styles.activeStep : index < step ? styles.completeStep : ""}><span>{index + 1}</span>{label}</li>)}</ol>
    {step === 0 ? <fieldset><legend>Permanent competition identity</legend><div className={styles.fieldGrid}><label>Competition name<input required value={name} onChange={(event) => setName(event.target.value)} /></label><label>Sport<input value={workspace.sport} disabled /></label><label>Competition type<select value={type} onChange={(event) => setType(event.target.value)}>{types.map((item) => <option key={item}>{item}</option>)}</select></label><label>Tier<input type="number" min="1" value={tier} onChange={(event) => setTier(event.target.value)} /></label><label>Primary league<select required value={league} onChange={(event) => setLeague(event.target.value)}><option value="">Select league</option>{leagues.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Higher competition<select value={higher} onChange={(event) => setHigher(event.target.value)}><option value="">None</option>{identities.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div><label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label></fieldset> : null}
    {step === 1 ? <fieldset><legend>Validated competition format</legend><div className={styles.fieldGrid}><label>Format<select value={format} onChange={(event) => setFormat(event.target.value)}><option value="SINGLE_ROUND_ROBIN">Single round-robin</option><option value="DOUBLE_ROUND_ROBIN">Double round-robin</option><option value="STRAIGHT_KNOCKOUT">Straight knockout</option><option value="GROUPS_AND_KNOCKOUT">Groups and knockout</option><option value="LEAGUE_AND_PLAYOFFS">League and playoffs</option><option value="SERIES">Series</option></select></label><label>Match duration (minutes)<input type="number" min="10" max="240" value={duration} onChange={(event) => setDuration(event.target.value)} /></label><label>Minimum clubs<input type="number" min="2" value={minimumClubs} onChange={(event) => setMinimumClubs(event.target.value)} /></label><label>Maximum clubs<input type="number" min="2" value={maximumClubs} onChange={(event) => setMaximumClubs(event.target.value)} /></label></div><div className={styles.checkGrid}><label><input type="checkbox" checked={promotion} onChange={(event) => setPromotion(event.target.checked)} /> Promotion enabled</label><label><input type="checkbox" checked={relegation} onChange={(event) => setRelegation(event.target.checked)} /> Relegation enabled</label></div><div className={styles.fieldGrid}>{promotion ? <label>Number promoted<input type="number" min="1" value={promoted} onChange={(event) => setPromoted(event.target.value)} /></label> : null}{relegation ? <label>Number relegated<input type="number" min="1" value={relegated} onChange={(event) => setRelegated(event.target.value)} /></label> : null}</div></fieldset> : null}
    {step === 2 ? <fieldset><legend>Administrator assignment</legend>{administratorLoadFailed ? <p role="alert">Administrator choices could not be loaded. Close and reopen the wizard to retry.</p> : null}<div className={styles.fieldGrid}><label>Active workspace user<select required value={admin} onChange={(event) => setAdmin(event.target.value)}><option value="">Select user</option>{eligible.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.email}</option>)}</select></label><label>Responsibility<select value={adminRole} onChange={(event) => setAdminRole(event.target.value)}><option value="LEAGUE_ADMIN">Primary League Administrator</option><option value="COMPETITION_ADMIN">Competition Administrator</option><option value="FIXTURES_MANAGER">Fixtures Manager</option><option value="REGISTRAR">Registrar</option><option value="VIEWER">Read-only administrator</option></select></label></div><p className={styles.mutedText}>Only active maintained users in {workspace.name} are eligible. Backend permissions remain authoritative.</p></fieldset> : null}
    {step === 3 ? <fieldset><legend>First draft season</legend><div className={styles.fieldGrid}><label>Season<select required value={season} onChange={(event) => setSeason(event.target.value)}><option value="">Select season</option>{availableSeasons.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Currency<input value="UGX" disabled /></label><label>Registration opens<input type="datetime-local" value={registrationOpen} onChange={(event) => setRegistrationOpen(event.target.value)} /></label><label>Registration closes<input type="datetime-local" value={registrationClose} onChange={(event) => setRegistrationClose(event.target.value)} /></label><label>Entry fee<input inputMode="decimal" value={entryFee} onChange={(event) => setEntryFee(event.target.value)} /></label></div><p className={styles.mutedText}>The edition remains in DRAFT. It will not be published or activated automatically.</p></fieldset> : null}
    {step === 4 ? <fieldset><legend>Season club participation</legend><p>No clubs are silently enrolled during creation. After the draft is created, use Club Entries to invite and confirm eligible Union clubs against the maintained season membership records.</p><p className={styles.mutedText}>This avoids deriving a final season list from incomplete paginated data.</p></fieldset> : null}
    {step === 5 ? <fieldset><legend>Review before creation</legend><dl><dt>Identity</dt><dd>{name} · {workspace.sport} · {type}</dd><dt>Format</dt><dd>{format.replaceAll("_", " ")} · {minimumClubs}–{maximumClubs} clubs</dd><dt>Administrator</dt><dd>{eligible.find((item) => item.id === Number(admin))?.name ?? "Not selected"} · {adminRole.replaceAll("_", " ")}</dd><dt>First edition</dt><dd>{availableSeasons.find((item) => item.id === Number(season))?.name ?? "Not selected"} · DRAFT</dd><dt>Movements</dt><dd>{promotion ? `${promoted} promoted` : "Promotion disabled"}; {relegation ? `${relegated} relegated` : "relegation disabled"}</dd><dt>Club entries</dt><dd>None automatically enrolled</dd></dl></fieldset> : null}
    {validationMessage ? <p role="alert">{validationMessage}</p> : null}
    <div className={styles.wizardActions}>{step > 0 ? <button type="button" className={styles.subtleButton} onClick={() => { setValidationMessage(""); setStep((value) => value - 1); }}>Back</button> : <span />}<button type="submit" disabled={working}>{step === 5 ? (working ? "Creating…" : "Create draft competition") : "Continue"}</button></div>
  </form>;
}
