import {
  BadgeCheck,
  Link2,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRoundCheck,
  X,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  createUnionAdminMatchOfficial,
  deleteUnionAdminMatchOfficial,
  getUnionAdminMatchOfficials,
  updateUnionAdminMatchOfficial,
  type UnionAdminMatchOfficial,
  type UnionAdminMatchOfficialsResponse,
  type UnionAdminOfficialStatus,
} from "../../services/unionAdminService";
import styles from "./UnionAdminRefereesPanel.module.css";

type Props = {
  workspaceSlug: string;
  workspaceName: string;
  workspaceSport: string;
};

type OfficialForm = {
  fullName: string;
  email: string;
  phoneNumber: string;
  roleType: string;
  certificationLevel: string;
  competitions: string;
  status: UnionAdminOfficialStatus;
  notes: string;
};

const EMPTY_FORM: OfficialForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  roleType: "",
  certificationLevel: "",
  competitions: "",
  status: "AVAILABLE",
  notes: "",
};

const STATUS_OPTIONS: Array<{ value: UnionAdminOfficialStatus; label: string }> = [
  { value: "AVAILABLE", label: "Available" },
  { value: "UNAVAILABLE", label: "Unavailable" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "RETIRED", label: "Retired" },
];

function messageFromError(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    const detail = response?.data?.detail;

    if (detail) return detail;
  }

  return fallback;
}

function formatMatchDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "MO";
}

export default function UnionAdminRefereesPanel({
  workspaceSlug,
  workspaceName,
  workspaceSport,
}: Props) {
  const [directory, setDirectory] = useState<UnionAdminMatchOfficialsResponse | null>(null);
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<OfficialForm>(EMPTY_FORM);
  const [editingOfficial, setEditingOfficial] = useState<UnionAdminMatchOfficial | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadOfficials = useCallback(
    async (search = "") => {
      setIsLoading(true);
      setError("");

      try {
        const data = await getUnionAdminMatchOfficials(workspaceSlug, search);
        setDirectory(data);
      } catch (loadError) {
        setDirectory(null);
        setError(
          messageFromError(
            loadError,
            "The match-official directory could not be loaded. Confirm the backend deployment and workspace permissions.",
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [workspaceSlug],
  );

  useEffect(() => {
    setQuery("");
    setForm(EMPTY_FORM);
    setEditingOfficial(null);
    setIsFormOpen(false);
    setNotice("");
    void loadOfficials();
  }, [loadOfficials]);

  const roleOptions = useMemo(
    () => directory?.role_options ?? [],
    [directory?.role_options],
  );
  const officials = useMemo(
    () => directory?.results ?? [],
    [directory?.results],
  );
  const currentSport = directory?.sport || workspaceSport;

  const statistics = useMemo(() => {
    return {
      total: directory?.count ?? officials.length,
      available: officials.filter((official) => official.status === "AVAILABLE").length,
      linked: officials.filter((official) => official.user !== null).length,
      appointed: officials.filter((official) => official.assignment_count > 0).length,
    };
  }, [directory?.count, officials]);

  useEffect(() => {
    if (!editingOfficial && !form.roleType && roleOptions[0]?.value) {
      setForm((current) => ({ ...current, roleType: roleOptions[0].value }));
    }
  }, [editingOfficial, form.roleType, roleOptions]);

  function resetForm(closeForm = false) {
    setEditingOfficial(null);
    setForm({
      ...EMPTY_FORM,
      roleType: roleOptions[0]?.value ?? "",
    });

    if (closeForm) {
      setIsFormOpen(false);
    }
  }

  function beginCreate() {
    resetForm();
    setIsFormOpen(true);
    setError("");
    setNotice("");
  }

  function beginEdit(official: UnionAdminMatchOfficial) {
    setIsFormOpen(true);
    setEditingOfficial(official);
    setForm({
      fullName: official.full_name,
      email: official.email,
      phoneNumber: official.phone_number,
      roleType: official.role_type,
      certificationLevel: official.certification_level,
      competitions: official.competitions,
      status: official.status,
      notes: official.notes,
    });
    setError("");
    setNotice("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!form.fullName.trim()) {
      setError("Enter the official's full name.");
      return;
    }

    if (!form.roleType) {
      setError("Select a sport-appropriate official role.");
      return;
    }

    setIsSaving(true);

    const payload = {
      workspace: workspaceSlug,
      full_name: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phone_number: form.phoneNumber.trim(),
      role_type: form.roleType,
      certification_level: form.certificationLevel.trim(),
      primary_sport: currentSport,
      competitions: form.competitions.trim(),
      status: form.status,
      notes: form.notes.trim(),
    };

    try {
      if (editingOfficial) {
        await updateUnionAdminMatchOfficial(editingOfficial.id, payload);
        setNotice(`${form.fullName.trim()} was updated successfully.`);
      } else {
        await createUnionAdminMatchOfficial(payload);
        setNotice(`${form.fullName.trim()} was added to ${workspaceName}.`);
      }

      resetForm(true);
      await loadOfficials(query);
    } catch (saveError) {
      setError(
        messageFromError(
          saveError,
          editingOfficial
            ? "The official profile could not be updated."
            : "The official profile could not be created.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(official: UnionAdminMatchOfficial) {
    const confirmed = window.confirm(
      `Remove ${official.full_name} from this union's match-official directory?`,
    );

    if (!confirmed) return;

    setDeletingId(official.id);
    setError("");
    setNotice("");

    try {
      await deleteUnionAdminMatchOfficial(official.id, workspaceSlug);
      setNotice(`${official.full_name} was removed from the directory.`);

      if (editingOfficial?.id === official.id) {
        resetForm(true);
      }

      await loadOfficials(query);
    } catch (deleteError) {
      setError(
        messageFromError(
          deleteError,
          "This official could not be removed. Officials with assignments should be marked unavailable, suspended or retired instead.",
        ),
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadOfficials(query);
  }

  return (
    <section className={styles.panel}>
      <header className={styles.header}>
        <div>
          <span>Official management</span>
          <h2>Referees and match officials</h2>
          <p>
            Manage the {currentSport.toLowerCase()} official pool attached to {workspaceName}.
            Roles are restricted to the workspace sport by the backend.
          </p>
        </div>
        <button className={styles.primaryButton} type="button" onClick={beginCreate}>
          <Plus size={17} aria-hidden="true" />
          Create official
        </button>
      </header>

      <div className={styles.statsGrid}>
        <article>
          <BadgeCheck size={22} aria-hidden="true" />
          <div><strong>{statistics.total}</strong><span>Total officials</span></div>
        </article>
        <article>
          <UserRoundCheck size={22} aria-hidden="true" />
          <div><strong>{statistics.available}</strong><span>Available</span></div>
        </article>
        <article>
          <Link2 size={22} aria-hidden="true" />
          <div><strong>{statistics.linked}</strong><span>Linked accounts</span></div>
        </article>
        <article>
          <BadgeCheck size={22} aria-hidden="true" />
          <div><strong>{statistics.appointed}</strong><span>With assignments</span></div>
        </article>
      </div>

      {error ? <div className={styles.errorBanner}>{error}</div> : null}
      {notice ? <div className={styles.successBanner}>{notice}</div> : null}

      <div className={`${styles.contentGrid} ${isFormOpen ? styles.contentGridWithForm : styles.contentGridSingle}`}>
        <div className={styles.directoryPanel}>
          <div className={styles.directoryToolbar}>
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <Search size={17} aria-hidden="true" />
              <input
                aria-label="Search match officials"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, role, grade or status"
              />
              <button type="submit">Search</button>
            </form>
            <button
              className={styles.iconButton}
              type="button"
              onClick={() => void loadOfficials(query)}
              aria-label="Refresh officials"
            >
              <RefreshCw size={17} aria-hidden="true" />
            </button>
          </div>

          {isLoading ? (
            <div className={styles.loadingState}>
              <LoaderCircle className={styles.spinner} size={24} aria-hidden="true" />
              Loading match officials…
            </div>
          ) : officials.length === 0 ? (
            <div className={styles.emptyState}>
              <BadgeCheck size={30} aria-hidden="true" />
              <h3>No officials found</h3>
              <p>Create the first official profile or adjust the search term.</p>
            </div>
          ) : (
            <div className={styles.tableShell}>
              <table>
                <thead>
                  <tr>
                    <th>Official</th>
                    <th>Role</th>
                    <th>Certification</th>
                    <th>Pool / competitions</th>
                    <th>Next match</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {officials.map((official) => (
                    <tr key={official.id}>
                      <td>
                        <div className={styles.personCell}>
                          <span>{initials(official.full_name)}</span>
                          <div>
                            <strong>{official.full_name}</strong>
                            <small>{official.email || "No email supplied"}</small>
                            <em>{official.user ? "League OS account linked" : "Official profile only"}</em>
                          </div>
                        </div>
                      </td>
                      <td>{official.role_type_display}</td>
                      <td>{official.certification_level || "Not recorded"}</td>
                      <td>{official.competitions || `${currentSport} union pool`}</td>
                      <td>
                        {official.next_match ? (
                          <div className={styles.matchCell}>
                            <strong>{official.next_match.label}</strong>
                            <small>{formatMatchDate(official.next_match.match_date)}</small>
                          </div>
                        ) : (
                          <span className={styles.muted}>No upcoming match</span>
                        )}
                      </td>
                      <td><span className={styles.statusPill}>{official.status_display}</span></td>
                      <td>
                        <div className={styles.rowActions}>
                          <button type="button" onClick={() => beginEdit(official)} aria-label={`Edit ${official.full_name}`}>
                            <Pencil size={15} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(official)}
                            disabled={deletingId === official.id}
                            aria-label={`Remove ${official.full_name}`}
                          >
                            {deletingId === official.id ? (
                              <LoaderCircle className={styles.spinner} size={15} aria-hidden="true" />
                            ) : (
                              <Trash2 size={15} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {isFormOpen ? (
          <form className={styles.formPanel} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <div>
              <span>{editingOfficial ? "Edit profile" : "New official"}</span>
              <h3>{editingOfficial ? editingOfficial.full_name : "Create official profile"}</h3>
            </div>
            <button
              type="button"
              onClick={() => resetForm(true)}
              aria-label="Close official form"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>

          <label>
            Full name
            <input
              required
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
              placeholder="Official's full name"
            />
          </label>

          <div className={styles.formColumns}>
            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="official@example.com"
              />
            </label>
            <label>
              Phone
              <input
                value={form.phoneNumber}
                onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
                placeholder="+256…"
              />
            </label>
          </div>

          <label>
            {currentSport} official role
            <select
              required
              value={form.roleType}
              onChange={(event) => setForm((current) => ({ ...current, roleType: event.target.value }))}
            >
              <option value="" disabled>Select role</option>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <div className={styles.formColumns}>
            <label>
              Certification / grade
              <input
                value={form.certificationLevel}
                onChange={(event) => setForm((current) => ({ ...current, certificationLevel: event.target.value }))}
                placeholder="Level 2, National Panel…"
              />
            </label>
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  status: event.target.value as UnionAdminOfficialStatus,
                }))}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Competition pools
            <input
              value={form.competitions}
              onChange={(event) => setForm((current) => ({ ...current, competitions: event.target.value }))}
              placeholder="Nile Special Rugby League, Uganda Cup"
            />
          </label>

          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Appointment restrictions, experience or administrative notes"
            />
          </label>

          <div className={styles.linkNotice}>
            <Link2 size={17} aria-hidden="true" />
            <p>
              The profile is attached to <strong>{workspaceName}</strong>. When the email matches an
              existing League OS user, the official account is linked automatically.
            </p>
          </div>

          <button className={styles.primaryButton} type="submit" disabled={isSaving}>
            {isSaving ? <LoaderCircle className={styles.spinner} size={17} aria-hidden="true" /> : <BadgeCheck size={17} aria-hidden="true" />}
            {editingOfficial ? "Save changes" : "Create official"}
          </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
