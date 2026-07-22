import { Building2, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

import {
  createUnionAdminClub,
  getUnionAdminClubs,
  getUnionAdminManagementLeagues,
  getUnionAdminManagementSeasons,
  getUnionGovernanceOptions,
  provisionUnionClubAdministrator,
  updateUnionAdminClub,
  type UnionAdminClubRecord,
  type UnionAdminLeagueOption,
  type UnionAdminSeasonRecord,
  type UnionGovernanceOptions,
} from "../../services/unionAdminService";
import SafeImage from "../SafeImage/SafeImage";
import styles from "./UnionAdminClubsPanel.module.css";

type Props = {
  workspaceSlug: string;
  workspaceLabel: string;
  sport: string;
  canManageClubs: boolean;
};
type Tab = "directory" | "create" | "memberships" | "admins" | "affiliation";
const tabs: Array<{ key: Tab; label: string }> = [
  { key: "directory", label: "Club Directory" },
  { key: "create", label: "Create / Edit Club" },
  { key: "memberships", label: "League Memberships" },
  { key: "admins", label: "Club Admins" },
  { key: "affiliation", label: "Affiliation & Status" },
];
const wizardSteps = [
  "Club Identity",
  "Contact & Branding",
  "Union Affiliation",
  "League Membership",
  "Club Administrator",
  "Review",
];

function errorMessage(error: unknown) {
  const candidate = error as {
    response?: { status?: number; data?: unknown };
    message?: string;
  };
  if (candidate.response?.status === 403)
    return "You do not have permission to manage Clubs in this workspace.";
  const collect = (value: unknown): string[] =>
    typeof value === "string"
      ? [value]
      : Array.isArray(value)
        ? value.flatMap(collect)
        : value && typeof value === "object"
          ? Object.values(value).flatMap(collect)
          : [];
  return (
    collect(candidate.response?.data)[0] ??
    candidate.message ??
    "The Club request could not be confirmed. Check the directory before retrying."
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

const emptyForm = (sport: string) => ({
  name: "",
  short_name: "",
  sport,
  founded_year: "",
  description: "",
  contact_email: "",
  phone_number: "",
  website: "",
  address: "",
  primary_color: "",
  secondary_color: "",
  affiliation_status: "APPLICATION_SUBMITTED",
  compliance_status: "PENDING",
  compliance_notes: "",
  league: "",
  season: "",
  membership_status: "INVITED",
  membership_notes: "",
  admin_email: "",
  admin_first_name: "",
  admin_last_name: "",
  admin_phone: "",
  admin_role: "CLUB_ADMIN",
});

export default function UnionAdminClubsPanel({
  workspaceSlug,
  workspaceLabel,
  sport,
  canManageClubs,
}: Props) {
  const generation = useRef(0);
  const [tab, setTab] = useState<Tab>("directory");
  const [clubs, setClubs] = useState<UnionAdminClubRecord[]>([]);
  const [options, setOptions] = useState<UnionGovernanceOptions | null>(null);
  const [leagues, setLeagues] = useState<UnionAdminLeagueOption[]>([]);
  const [seasons, setSeasons] = useState<UnionAdminSeasonRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm(sport));
  const [temporaryPassword, setTemporaryPassword] = useState("");

  const filtered = useMemo(
    () =>
      clubs.filter((club) => {
        const matchesQuery =
          `${club.name} ${club.short_name} ${club.sport_display} ${club.administrator?.user_name ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase());
        return (
          matchesQuery &&
          (statusFilter === "ALL" ||
            (club.affiliation_status ?? "NOT_RECORDED") === statusFilter)
        );
      }),
    [clubs, query, statusFilter],
  );
  const selected =
    filtered.find((club) => club.id === selectedId) ?? filtered[0] ?? null;

  async function load() {
    const current = ++generation.current;
    setLoading(true);
    setError("");
    try {
      const [clubRows, governance, leagueRows, seasonRows] = await Promise.all([
        getUnionAdminClubs(workspaceSlug, ""),
        getUnionGovernanceOptions(workspaceSlug),
        getUnionAdminManagementLeagues(workspaceSlug),
        getUnionAdminManagementSeasons(workspaceSlug),
      ]);
      if (current !== generation.current) return;
      setClubs(clubRows);
      setOptions(governance);
      setLeagues(leagueRows);
      setSeasons(seasonRows);
      setSelectedId(clubRows[0]?.id ?? null);
    } catch (loadError) {
      if (current === generation.current) setError(errorMessage(loadError));
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }

  useEffect(() => {
    generation.current += 1;
    setTab("directory");
    setClubs([]);
    setSelectedId(null);
    setQuery("");
    setStatusFilter("ALL");
    setNotice("");
    setError("");
    setTemporaryPassword("");
    setStep(0);
    setForm(emptyForm(sport));
    void load();
    return () => {
      generation.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceSlug, sport]);

  function updateField(
    name: keyof ReturnType<typeof emptyForm>,
    value: string,
  ) {
    setForm((current) => ({ ...current, [name]: value }));
  }
  function editClub(club: UnionAdminClubRecord) {
    setSelectedId(club.id);
    setStep(0);
    setForm({
      ...emptyForm(club.sport),
      name: club.name,
      short_name: club.short_name,
      founded_year: String(club.founded_year ?? ""),
      description: club.description,
      contact_email: club.contact_email,
      phone_number: club.phone_number,
      website: club.website,
      address: club.address,
      primary_color: club.primary_color,
      secondary_color: club.secondary_color,
      affiliation_status: club.affiliation_status,
      compliance_status: club.compliance_status,
      compliance_notes: club.compliance_notes,
      admin_email: club.administrator?.user_email ?? "",
      admin_role: club.administrator?.role ?? "CLUB_ADMIN",
    });
    setTab("create");
  }

  function validateStep() {
    if (step === 0 && !form.name.trim())
      return "Enter the Club name before continuing.";
    if (step === 0 && options?.workspace.is_multi_sport && !form.sport)
      return "Select a supported sport before continuing.";
    if (step === 2 && !form.affiliation_status)
      return "Select an affiliation status.";
    if (
      step === 3 &&
      form.league &&
      form.season &&
      !seasons.some(
        (item) =>
          item.id === Number(form.season) &&
          item.league === Number(form.league),
      )
    )
      return "Select a Season belonging to the chosen League.";
    if (step === 4 && !selected && !form.admin_email.trim())
      return "Enter the Club administrator email.";
    return "";
  }

  async function submitWizard(event: FormEvent) {
    event.preventDefault();
    const invalid = validateStep();
    if (invalid) {
      setError(invalid);
      return;
    }
    setError("");
    if (step < wizardSteps.length - 1) {
      setStep((value) => value + 1);
      return;
    }
    setWorking(true);
    setTemporaryPassword("");
    try {
      if (selected && form.name === selected.name) {
        const updated = await updateUnionAdminClub(selected.id, {
          workspace: workspaceSlug,
          name: form.name.trim(),
          short_name: form.short_name.trim(),
          sport: form.sport,
          founded_year: form.founded_year
            ? Number(form.founded_year)
            : undefined,
          description: form.description.trim(),
          contact_email: form.contact_email.trim(),
          phone_number: form.phone_number.trim(),
          website: form.website.trim(),
          address: form.address.trim(),
          primary_color: form.primary_color.trim(),
          secondary_color: form.secondary_color.trim(),
          affiliation_status: form.affiliation_status,
          compliance_status: form.compliance_status,
          compliance_notes: form.compliance_notes.trim(),
        });
        setClubs((rows) =>
          rows.map((item) => (item.id === updated.id ? updated : item)),
        );
        setNotice(`${updated.name} updated.`);
      } else {
        const result = await createUnionAdminClub({
          workspace: workspaceSlug,
          name: form.name.trim(),
          short_name: form.short_name.trim(),
          sport: form.sport,
          ...(form.founded_year
            ? { founded_year: Number(form.founded_year) }
            : {}),
          description: form.description.trim(),
          contact_email: form.contact_email.trim(),
          phone_number: form.phone_number.trim(),
          website: form.website.trim(),
          address: form.address.trim(),
          primary_color: form.primary_color.trim(),
          secondary_color: form.secondary_color.trim(),
          affiliation: {
            status: form.affiliation_status,
            compliance_status: form.compliance_status,
            compliance_notes: form.compliance_notes.trim(),
          },
          league_membership: form.league
            ? {
                league: Number(form.league),
                ...(form.season ? { season: Number(form.season) } : {}),
                status: form.membership_status,
                notes: form.membership_notes.trim(),
              }
            : null,
          administrator: {
            account: {
              email: form.admin_email.trim(),
              first_name: form.admin_first_name.trim(),
              last_name: form.admin_last_name.trim(),
              phone_number: form.admin_phone.trim(),
            },
            role: form.admin_role,
          },
        });
        setClubs((rows) => [result.club, ...rows]);
        setSelectedId(result.club.id);
        setTemporaryPassword(result.temporary_password ?? "");
        setNotice(
          result.account.created_user
            ? "Club and new administrator account created."
            : "Club created and existing user attached.",
        );
      }
      setTab("directory");
      setStep(0);
    } catch (actionError) {
      setError(errorMessage(actionError));
    } finally {
      setWorking(false);
    }
  }

  async function assignAdmin(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setWorking(true);
    setError("");
    setTemporaryPassword("");
    try {
      const result = await provisionUnionClubAdministrator(selected.id, {
        workspace: workspaceSlug,
        account: {
          email: form.admin_email.trim(),
          first_name: form.admin_first_name.trim(),
          last_name: form.admin_last_name.trim(),
          phone_number: form.admin_phone.trim(),
        },
        role: form.admin_role,
      });
      setTemporaryPassword(result.temporary_password ?? "");
      setNotice(
        result.created_user
          ? "New Club administrator account created."
          : "Existing user attached to this Club.",
      );
      await load();
    } catch (actionError) {
      setError(errorMessage(actionError));
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className={styles.panel}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarText}>
          <span>Club governance</span>
          <h2>Clubs</h2>
          <p>
            Manage affiliated Club identities, memberships, scoped
            administrators and compliance for {workspaceLabel}.
          </p>
        </div>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => void load()}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </header>
      <div
        className={styles.topNav}
        role="tablist"
        aria-label="Club governance"
      >
        <div>
          {tabs.map((item) => (
            <button
              key={item.key}
              role="tab"
              aria-selected={tab === item.key}
              className={tab === item.key ? styles.activeTab : ""}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {notice ? (
        <div className={`${styles.alert} ${styles.success}`} role="status">
          {notice}
        </div>
      ) : null}
      {error ? (
        <div className={`${styles.alert} ${styles.failure}`} role="alert">
          {error}
          <button type="button" onClick={() => void load()}>
            Retry
          </button>
        </div>
      ) : null}
      {temporaryPassword ? (
        <div className={styles.passwordPanel} role="status">
          <strong>One-time temporary password</strong>
          <code>{temporaryPassword}</code>
          <p>Share it securely. It is not stored in this browser.</p>
          <button
            type="button"
            onClick={() =>
              void navigator.clipboard.writeText(temporaryPassword)
            }
          >
            Copy
          </button>
          <button type="button" onClick={() => setTemporaryPassword("")}>
            Dismiss
          </button>
        </div>
      ) : null}
      {loading ? (
        <div className={styles.empty} role="status">
          Loading Clubs…
        </div>
      ) : null}
      {!loading && tab === "directory" ? (
        <>
          <div className={styles.searchBar}>
            <Search size={18} />
            <input
              aria-label="Search clubs"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search affiliated Clubs"
            />
            <select
              aria-label="Affiliation status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All affiliations</option>
              {options?.club_affiliation_statuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.clubList}>
                {filtered.map((club) => (
                  <button
                    key={club.id}
                    className={`${styles.clubRow} ${selected?.id === club.id ? styles.clubRowActive : ""}`}
                    onClick={() => setSelectedId(club.id)}
                  >
                    <SafeImage
                      alt={`${club.name} logo`}
                      className={styles.logoImage}
                      fallback={initials(club.name) || <Building2 size={18} />}
                      fallbackClassName={styles.logo}
                      src={club.logo_url}
                    />
                    <span className={styles.clubIdentity}>
                      <strong>{club.name}</strong>
                      <small>{club.sport_display}</small>
                      <span>
                        {club.administrator?.user_name ??
                          "No Club administrator"}
                      </span>
                    </span>
                    <span className={styles.badge}>
                  {(club.affiliation_status ?? "NOT_RECORDED").replaceAll(
                    "_",
                    " ",
                  )}
                    </span>
                  </button>
                ))}
                {!filtered.length ? (
                  <div className={styles.empty}>
                    No clubs are affiliated with this workspace yet.
                  </div>
                ) : null}
              </div>
            </div>
            <aside className={styles.card}>
              {selected ? (
                <>
                  <div className={styles.detailHeader}>
                    <strong>{selected.name}</strong>
                    <span>
                      {selected.short_name} ·{" "}
                      {selected.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                      <span>Teams</span>
                      <strong>{selected.teams}</strong>
                    </div>
                    <div className={styles.metaItem}>
                      <span>Players</span>
                      <strong>{selected.players}</strong>
                    </div>
                    <div className={styles.metaItem}>
                      <span>Affiliation</span>
                      <strong>
                          {(
                            selected.affiliation_status ?? "NOT_RECORDED"
                          ).replaceAll("_", " ")}
                      </strong>
                    </div>
                    <div className={styles.metaItem}>
                      <span>Compliance</span>
                      <strong>{selected.compliance_status}</strong>
                    </div>
                  </div>
                  {canManageClubs ? (
                    <button
                      className={styles.secondaryButton}
                      type="button"
                      onClick={() => editClub(selected)}
                    >
                      Edit Club
                    </button>
                  ) : null}
                </>
              ) : (
                <div className={styles.empty}>Select a Club.</div>
              )}
            </aside>
          </div>
        </>
      ) : null}
      {!loading && tab === "create" ? (
        canManageClubs ? (
          <form className={styles.wizard} onSubmit={submitWizard}>
            <div className={styles.wizardHeader}>
              <div>
                <span>Step {step + 1} of 6</span>
                <h3>{wizardSteps[step]}</h3>
              </div>
            </div>
            <ol className={styles.stepper}>
              {wizardSteps.map((item, index) => (
                <li
                  key={item}
                  aria-current={index === step ? "step" : undefined}
                >
                  {index + 1}. {item}
                </li>
              ))}
            </ol>
            {step === 0 ? (
              <fieldset>
                <label>
                  Club name
                  <input
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                </label>
                <label>
                  Short name
                  <input
                    value={form.short_name}
                    onChange={(e) => updateField("short_name", e.target.value)}
                  />
                </label>
                <label>
                  Sport
                  {options?.workspace.is_multi_sport ? (
                    <select
                      required
                      value={form.sport}
                      onChange={(e) => updateField("sport", e.target.value)}
                    >
                      <option value="">Select sport</option>
                      {options.supported_sports.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input disabled value={options?.workspace.sport ?? sport} />
                  )}
                </label>
                <label>
                  Founded year
                  <input
                    type="number"
                    value={form.founded_year}
                    onChange={(e) =>
                      updateField("founded_year", e.target.value)
                    }
                  />
                </label>
                <label>
                  Description
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </label>
              </fieldset>
            ) : null}
            {step === 1 ? (
              <fieldset>
                <label>
                  Contact email
                  <input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) =>
                      updateField("contact_email", e.target.value)
                    }
                  />
                </label>
                <label>
                  Phone
                  <input
                    value={form.phone_number}
                    onChange={(e) =>
                      updateField("phone_number", e.target.value)
                    }
                  />
                </label>
                <label>
                  Website
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => updateField("website", e.target.value)}
                  />
                </label>
                <label>
                  Address / location
                  <input
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                </label>
                <label>
                  Primary colour
                  <input
                    value={form.primary_color}
                    onChange={(e) =>
                      updateField("primary_color", e.target.value)
                    }
                  />
                </label>
                <label>
                  Secondary colour
                  <input
                    value={form.secondary_color}
                    onChange={(e) =>
                      updateField("secondary_color", e.target.value)
                    }
                  />
                </label>
              </fieldset>
            ) : null}
            {step === 2 ? (
              <fieldset>
                <label>
                  Affiliation status
                  <select
                    value={form.affiliation_status}
                    onChange={(e) =>
                      updateField("affiliation_status", e.target.value)
                    }
                  >
                    {options?.club_affiliation_statuses.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Compliance status
                  <input
                    value={form.compliance_status}
                    onChange={(e) =>
                      updateField("compliance_status", e.target.value)
                    }
                  />
                </label>
                <label>
                  Compliance notes
                  <textarea
                    value={form.compliance_notes}
                    onChange={(e) =>
                      updateField("compliance_notes", e.target.value)
                    }
                  />
                </label>
              </fieldset>
            ) : null}
            {step === 3 ? (
              <fieldset>
                <p>League membership is optional.</p>
                <label>
                  League
                  <select
                    value={form.league}
                    onChange={(e) => {
                      updateField("league", e.target.value);
                      updateField("season", "");
                    }}
                  >
                    <option value="">No initial League membership</option>
                    {leagues.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Season
                  <select
                    value={form.season}
                    onChange={(e) => updateField("season", e.target.value)}
                  >
                    <option value="">No Season</option>
                    {seasons
                      .filter((item) => item.league === Number(form.league))
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label>
                  Membership status
                  <select
                    value={form.membership_status}
                    onChange={(e) =>
                      updateField("membership_status", e.target.value)
                    }
                  >
                    {options?.league_membership_statuses.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>
            ) : null}
            {step === 4 ? (
              <fieldset>
                <label>
                  Administrator email
                  <input
                    required={!selected}
                    type="email"
                    value={form.admin_email}
                    onChange={(e) => updateField("admin_email", e.target.value)}
                  />
                </label>
                <label>
                  First name
                  <input
                    value={form.admin_first_name}
                    onChange={(e) =>
                      updateField("admin_first_name", e.target.value)
                    }
                  />
                </label>
                <label>
                  Last name
                  <input
                    value={form.admin_last_name}
                    onChange={(e) =>
                      updateField("admin_last_name", e.target.value)
                    }
                  />
                </label>
                <label>
                  Role
                  <select
                    value={form.admin_role}
                    onChange={(e) => updateField("admin_role", e.target.value)}
                  >
                    {options?.club_administrator_roles.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </fieldset>
            ) : null}
            {step === 5 ? (
              <fieldset>
                <dl>
                  <dt>Club</dt>
                  <dd>
                    {form.name} · {form.sport}
                  </dd>
                  <dt>Affiliation</dt>
                  <dd>{form.affiliation_status}</dd>
                  <dt>League membership</dt>
                  <dd>
                    {form.league
                      ? leagues.find((item) => item.id === Number(form.league))
                          ?.name
                      : "None"}
                  </dd>
                  <dt>Administrator</dt>
                  <dd>
                    {form.admin_email || selected?.administrator?.user_email} ·{" "}
                    {form.admin_role}
                  </dd>
                </dl>
                <label>
                  <input required type="checkbox" /> I confirm these governance
                  records.
                </label>
              </fieldset>
            ) : null}
            <div className={styles.formActions}>
              {step > 0 ? (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setStep((value) => value - 1)}
                >
                  Back
                </button>
              ) : null}
              <button className={styles.primaryButton} disabled={working}>
                {step === 5 ? "Create Club" : "Continue"}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.empty}>
            You do not have permission to change Clubs.
          </div>
        )
      ) : null}
      {!loading && tab === "memberships" ? (
        <div className={styles.card}>
          <h3>League Memberships</h3>
          {selected?.memberships.length ? (
            selected.memberships.map((item) => (
              <div className={styles.membership} key={item.id}>
                <strong>{item.league_name}</strong>
                <span>
                  {item.season_name ?? "No Season"} · {item.status_display}
                </span>
              </div>
            ))
          ) : (
            <div className={styles.empty}>
              The selected Club has no League membership. Membership remains
              optional.
            </div>
          )}
        </div>
      ) : null}
      {!loading && tab === "admins" ? (
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Club Administrators</h3>
            {selected?.administrator ? (
              <div className={styles.membership}>
                <strong>{selected.administrator.user_name}</strong>
                <span>
                  {selected.administrator.role.replaceAll("_", " ")} ·{" "}
                  {selected.administrator.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            ) : (
              <div className={styles.empty}>
                No maintained Club administrator scope.
              </div>
            )}
          </div>
          {canManageClubs && selected ? (
            <form className={styles.formGrid} onSubmit={assignAdmin}>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={form.admin_email}
                  onChange={(e) => updateField("admin_email", e.target.value)}
                />
              </label>
              <label>
                Role
                <select
                  value={form.admin_role}
                  onChange={(e) => updateField("admin_role", e.target.value)}
                >
                  {options?.club_administrator_roles.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                First name
                <input
                  value={form.admin_first_name}
                  onChange={(e) =>
                    updateField("admin_first_name", e.target.value)
                  }
                />
              </label>
              <label>
                Last name
                <input
                  value={form.admin_last_name}
                  onChange={(e) =>
                    updateField("admin_last_name", e.target.value)
                  }
                />
              </label>
              <button className={styles.primaryButton} disabled={working}>
                Attach or create administrator
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
      {!loading && tab === "affiliation" ? (
        selected ? (
          <form
            className={styles.formGrid}
            onSubmit={(event) => {
              event.preventDefault();
              editClub(selected);
              setStep(2);
            }}
          >
            <h3 className={styles.fullWidth}>Affiliation & Status</h3>
            <div className={styles.membership}>
              <strong>
                  {(
                    selected.affiliation_status ?? "NOT_RECORDED"
                  ).replaceAll("_", " ")}
              </strong>
              <span>{selected.compliance_status}</span>
              <p>{selected.compliance_notes || "No compliance notes."}</p>
            </div>
            {canManageClubs ? (
              <button className={styles.primaryButton}>Edit affiliation</button>
            ) : null}
          </form>
        ) : (
          <div className={styles.empty}>Select a Club.</div>
        )
      ) : null}
    </section>
  );
}
