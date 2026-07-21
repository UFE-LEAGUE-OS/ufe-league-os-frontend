import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";

import UnionAdminManagementWorkflow from "../../components/UnionAdminManagementWorkflow/UnionAdminManagementWorkflow";
import {
    DemoNotice,
    InternalTabs,
    RecordList,
    ScreenHeader,
    StatusBadge,
} from "../../components/union-admin/UnionAdminUi";
import { unionDemoData } from "../../data/unionAdminDemoData";
import type { UnionWorkspaceOption } from "../../services/unionAdminService";
import { getUnionAdminDataSourceMode } from "../../utils/unionAdminDemoMode";
import UnionAdminScreenToolbar from "./UnionAdminScreenToolbar";
import styles from "./UnionCompetitionsScreen.module.css";

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
    { key: "createCompetition", label: "Create Competition" },
    { key: "addSeason", label: "Add Season" },
];

interface CreateCompetitionFormState {
    title: string;
    slug: string;
    competitionType: string;
    format: string;
    category: string;
    gender: string;
    ageGroup: string;
    status: string;
    description: string;
}

interface AddSeasonFormState {
    competitionId: string;
    title: string;
    seasonLabel: string;
    startDate: string;
    endDate: string;
    registrationStart: string;
    registrationEnd: string;
    entryCap: string;
    status: string;
    notes: string;
}

const initialCreateCompetitionForm: CreateCompetitionFormState = {
    title: "",
    slug: "",
    competitionType: "LEAGUE",
    format: "Rugby 15s",
    category: "Senior",
    gender: "Mixed / Open",
    ageGroup: "Senior",
    status: "DRAFT",
    description: "",
};

const initialAddSeasonForm: AddSeasonFormState = {
    competitionId: "comp-rugby-prem",
    title: "2027 Premiership",
    seasonLabel: "2027",
    startDate: "2027-02-06",
    endDate: "2027-11-27",
    registrationStart: "2026-10-01",
    registrationEnd: "2027-01-15",
    entryCap: "12",
    status: "DRAFT",
    notes: "",
};

export interface UnionCompetitionsScreenProps {
    workspace: UnionWorkspaceOption;
}

export default function UnionCompetitionsScreen({
    workspace,
}: UnionCompetitionsScreenProps) {
    const [view, setView] = useState<CompetitionView>("directory");
    const [selectedId, setSelectedId] = useState(unionDemoData.competitions[0].id);
    const [createForm, setCreateForm] = useState<CreateCompetitionFormState>(
        initialCreateCompetitionForm,
    );
    const [seasonForm, setSeasonForm] = useState<AddSeasonFormState>(
        initialAddSeasonForm,
    );
    const [workflowNotice, setWorkflowNotice] = useState("");

    const competition =
        unionDemoData.competitions.find((item) => item.id === selectedId) ??
        unionDemoData.competitions[0];

    const editions = useMemo(
        () =>
            unionDemoData.editions.filter(
                (item) => item.competitionId === competition.id,
            ),
        [competition.id],
    );

    const addSeasonCompetition =
        unionDemoData.competitions.find(
            (item) => item.id === seasonForm.competitionId,
        ) ?? unionDemoData.competitions[0];

    function handleCreateFormChange(
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) {
        const { name, value } = event.target;

        setCreateForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleSeasonFormChange(
        event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) {
        const { name, value } = event.target;

        setSeasonForm((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleCreateCompetition(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setWorkflowNotice(
            `Draft competition prepared: "${createForm.title || "Untitled competition"}". This is a local preview only and is not persisted yet.`,
        );
        setView("identity");
    }

    function handleAddSeason(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setWorkflowNotice(
            `Season draft prepared for "${addSeasonCompetition.title}" → "${seasonForm.title}". This is a local preview only and is not persisted yet.`,
        );
        setView("editions");
    }

    if (getUnionAdminDataSourceMode() === "api") {
        return (
            <section className={styles.screen}>
                <ScreenHeader
                    eyebrow="Competitions"
                    title="Competition management"
                    description="Create maintained competition editions, manage club entries, and prepare fixtures through the connected Union APIs."
                />
                <UnionAdminManagementWorkflow
                    workspaceSlug={workspace.slug}
                    workspaceLabel={workspace.name}
                />
            </section>
        );
    }

    return (
        <section className={styles.screen}>
            <ScreenHeader
                eyebrow="Competitions"
                title="Competition control room"
                description="Manage competition identities, create seasonal editions and prepare the competition lifecycle from setup through publication."
                actions={
                    <div className={styles.inlineActionGroup}>
                        <button
                            type="button"
                            onClick={() => setView("createCompetition")}
                        >
                            Create Competition
                        </button>
                        <button
                            type="button"
                            className={styles.subtleButton}
                            onClick={() => setView("addSeason")}
                        >
                            Add Season
                        </button>
                    </div>
                }
            />

            <DemoNotice />

            {workflowNotice ? (
                <div className={styles.workflowNotice}>{workflowNotice}</div>
            ) : null}

            <InternalTabs<CompetitionView>
                label="Competition views"
                active={view}
                onChange={setView}
                items={views}
            />

            {(view === "directory" ||
                view === "identity" ||
                view === "editions" ||
                view === "entries" ||
                view === "scheduling" ||
                view === "publication") && (
                <div className={styles.heroSummaryGrid}>
                    <article>
                        <span>Total competition identities</span>
                        <strong>{unionDemoData.competitions.length}</strong>
                        <small>Managed under {workspace.name}</small>
                    </article>
                    <article>
                        <span>Seasonal editions</span>
                        <strong>{unionDemoData.editions.length}</strong>
                        <small>Published and planned seasons</small>
                    </article>
                    <article>
                        <span>Current selection</span>
                        <strong>{competition.title}</strong>
                        <small>{competition.subtitle}</small>
                    </article>
                </div>
            )}

            {view === "directory" ? (
                <div className={styles.workflowGrid}>
                    <div className={styles.formCard}>
                        <UnionAdminScreenToolbar placeholder="Search competitions" />

                        <RecordList
                            records={unionDemoData.competitions}
                            selectedId={selectedId}
                            onSelect={(id) => {
                                setSelectedId(id);
                                setView("identity");
                            }}
                        />
                    </div>

                    <aside className={styles.supportCard}>
                        <h3>Competition workflow</h3>
                        <ul className={styles.helperList}>
                            <li>Create the master competition identity.</li>
                            <li>Add a new season / edition to that identity.</li>
                            <li>Attach clubs and define participation rules.</li>
                            <li>Prepare fixtures and publish the competition lifecycle.</li>
                        </ul>

                        <div className={styles.miniStatGrid}>
                            <article>
                                <strong>{unionDemoData.competitions.length}</strong>
                                <span>identities</span>
                            </article>
                            <article>
                                <strong>{unionDemoData.editions.length}</strong>
                                <span>editions</span>
                            </article>
                            <article>
                                <strong>{unionDemoData.clubs.length}</strong>
                                <span>sample clubs</span>
                            </article>
                        </div>
                    </aside>
                </div>
            ) : null}

            {view === "identity" ? (
                <div className={styles.detailGrid}>
                    <article className={styles.formCard}>
                        <h3>{competition.title}</h3>
                        <dl>
                            <dt>Short name</dt>
                            <dd>National Premiership</dd>

                            <dt>Slug</dt>
                            <dd>{competition.meta}</dd>

                            <dt>Sport</dt>
                            <dd>{workspace.sport}</dd>

                            <dt>Format</dt>
                            <dd>{competition.subtitle}</dd>

                            <dt>Workspace</dt>
                            <dd>{workspace.name}</dd>

                            <dt>Status</dt>
                            <dd>{competition.status}</dd>
                        </dl>
                    </article>

                    <aside className={styles.supportCard}>
                        <h3>Identity actions</h3>
                        <div className={styles.linkGroup}>
                            <button
                                type="button"
                                onClick={() => setView("addSeason")}
                            >
                                Add season to this competition
                            </button>
                            <button
                                type="button"
                                className={styles.subtleButton}
                                onClick={() => setView("publication")}
                            >
                                Review lifecycle
                            </button>
                        </div>
                        <p className={styles.mutedText}>
                            Use the master identity to control repeat seasons and
                            preserve long-term competition history.
                        </p>
                    </aside>
                </div>
            ) : null}

            {view === "editions" ? (
                <div className={styles.cardGrid}>
                    {editions.map((item) => (
                        <article key={item.id}>
                            <StatusBadge>{item.status.replaceAll("_", " ")}</StatusBadge>
                            <h3>{item.title}</h3>
                            <dl>
                                <dt>Season</dt>
                                <dd>{item.season}</dd>

                                <dt>Dates</dt>
                                <dd>
                                    {item.startDate} — {item.endDate}
                                </dd>

                                <dt>Registration</dt>
                                <dd>{item.registrationWindow}</dd>

                                <dt>Club entries</dt>
                                <dd>{item.clubEntries}</dd>

                                <dt>Fixture readiness</dt>
                                <dd>{item.fixtureReadiness}</dd>
                            </dl>
                        </article>
                    ))}

                    <article className={styles.formCard}>
                        <StatusBadge>DRAFT WORKFLOW</StatusBadge>
                        <h3>Add a new season</h3>
                        <p className={styles.mutedText}>
                            Create the next edition while keeping the competition
                            identity consistent.
                        </p>
                        <button type="button" onClick={() => setView("addSeason")}>
                            Open add season screen
                        </button>
                    </article>
                </div>
            ) : null}

            {view === "entries" ? (
                <>
                    <div className={styles.actionRow}>
                        <button type="button">Bulk-add Clubs</button>
                        <button type="button" className={styles.subtleButton}>
                            Promotion / Relegation
                        </button>
                    </div>

                    <RecordList
                        records={unionDemoData.clubs.map((club, index) => ({
                            ...club,
                            status:
                                index === 2
                                    ? "INVITED"
                                    : index === 1
                                      ? "PROMOTED"
                                      : "ACTIVE",
                        }))}
                    />
                </>
            ) : null}

            {view === "scheduling" ? (
                <div className={styles.detailGrid}>
                    <form className={styles.formCard}>
                        <h3>Fixture generation preview</h3>

                        <label>
                            Edition
                            <select defaultValue="2027 Premiership">
                                <option>2027 Premiership</option>
                            </select>
                        </label>

                        <label>
                            First match date
                            <input type="date" defaultValue="2027-02-06" />
                        </label>

                        <label>
                            Match day
                            <select defaultValue="Saturday">
                                <option>Saturday</option>
                                <option>Sunday</option>
                            </select>
                        </label>

                        <label>
                            Number of rounds
                            <select defaultValue="Home and away">
                                <option>Home and away</option>
                                <option>Single round robin</option>
                            </select>
                        </label>

                        <button type="button">Preview fixtures</button>
                    </form>

                    <aside className={styles.supportCard}>
                        <h3>Preview only</h3>
                        <p>
                            Round 1 · Kampala Rugby Club vs Nile Rugby Club
                        </p>
                        <p>
                            Saturday 6 February 2027 · Venue TBC
                        </p>
                        <small className={styles.mutedText}>
                            No fixture history is persisted from demo mode.
                        </small>
                    </aside>
                </div>
            ) : null}

            {view === "publication" ? (
                <div className={styles.timeline}>
                    <article>
                        <StatusBadge>REGISTRATION OPEN</StatusBadge>
                        <h3>2027 Premiership</h3>
                        <p>Available local transition: Close registration.</p>
                        <button type="button">Close registration (demo)</button>
                    </article>

                    <article>
                        <StatusBadge>ACTIVE</StatusBadge>
                        <h3>2026 Premiership</h3>
                        <p>
                            The active edition has no premature completion action in
                            this review state.
                        </p>
                    </article>
                </div>
            ) : null}

            {view === "createCompetition" ? (
                <div className={styles.workflowGrid}>
                    <form className={styles.formCard} onSubmit={handleCreateCompetition}>
                        <h3>Create competition identity</h3>
                        <p className={styles.mutedText}>
                            Create the master competition record first. Seasonal
                            editions can then be added underneath it.
                        </p>

                        <div className={styles.fieldGrid}>
                            <label>
                                Competition title
                                <input
                                    name="title"
                                    value={createForm.title}
                                    onChange={handleCreateFormChange}
                                    placeholder="National Rugby Championship"
                                />
                            </label>

                            <label>
                                Slug
                                <input
                                    name="slug"
                                    value={createForm.slug}
                                    onChange={handleCreateFormChange}
                                    placeholder="national-rugby-championship"
                                />
                            </label>

                            <label>
                                Competition type
                                <select
                                    name="competitionType"
                                    value={createForm.competitionType}
                                    onChange={handleCreateFormChange}
                                >
                                    <option value="LEAGUE">League</option>
                                    <option value="KNOCKOUT">Knockout</option>
                                    <option value="CUP">Cup</option>
                                    <option value="FESTIVAL">Festival</option>
                                </select>
                            </label>

                            <label>
                                Format
                                <select
                                    name="format"
                                    value={createForm.format}
                                    onChange={handleCreateFormChange}
                                >
                                    <option value="Rugby 15s">Rugby 15s</option>
                                    <option value="Rugby 7s">Rugby 7s</option>
                                    <option value="Rugby 10s">Rugby 10s</option>
                                </select>
                            </label>

                            <label>
                                Category
                                <select
                                    name="category"
                                    value={createForm.category}
                                    onChange={handleCreateFormChange}
                                >
                                    <option value="Senior">Senior</option>
                                    <option value="Women">Women</option>
                                    <option value="Youth">Youth</option>
                                    <option value="Schools">Schools</option>
                                </select>
                            </label>

                            <label>
                                Gender
                                <select
                                    name="gender"
                                    value={createForm.gender}
                                    onChange={handleCreateFormChange}
                                >
                                    <option value="Mixed / Open">Mixed / Open</option>
                                    <option value="Women">Women</option>
                                    <option value="Men">Men</option>
                                </select>
                            </label>

                            <label>
                                Age group
                                <select
                                    name="ageGroup"
                                    value={createForm.ageGroup}
                                    onChange={handleCreateFormChange}
                                >
                                    <option value="Senior">Senior</option>
                                    <option value="U20">U20</option>
                                    <option value="U18">U18</option>
                                    <option value="U16">U16</option>
                                </select>
                            </label>

                            <label>
                                Initial status
                                <select
                                    name="status"
                                    value={createForm.status}
                                    onChange={handleCreateFormChange}
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                    <option value="ACTIVE">Active</option>
                                </select>
                            </label>
                        </div>

                        <label>
                            Description
                            <textarea
                                name="description"
                                value={createForm.description}
                                onChange={handleCreateFormChange}
                                placeholder="Describe the competition, participation scope and governance notes."
                            />
                        </label>

                        <div className={styles.inlineActionGroup}>
                            <button type="submit">Save competition draft</button>
                            <button
                                type="button"
                                className={styles.subtleButton}
                                onClick={() => setView("directory")}
                            >
                                Back to directory
                            </button>
                        </div>
                    </form>

                    <aside className={styles.supportCard}>
                        <h3>What this screen does</h3>
                        <ul className={styles.helperList}>
                            <li>Creates the permanent competition identity.</li>
                            <li>Separates competition metadata from seasonal editions.</li>
                            <li>Prepares the competition for later season setup.</li>
                            <li>Allows consistent multi-season reporting over time.</li>
                        </ul>
                    </aside>
                </div>
            ) : null}

            {view === "addSeason" ? (
                <div className={styles.workflowGrid}>
                    <form className={styles.formCard} onSubmit={handleAddSeason}>
                        <h3>Add a new season / edition</h3>
                        <p className={styles.mutedText}>
                            Attach a new edition to an existing competition identity.
                        </p>

                        <div className={styles.fieldGrid}>
                            <label>
                                Competition
                                <select
                                    name="competitionId"
                                    value={seasonForm.competitionId}
                                    onChange={handleSeasonFormChange}
                                >
                                    {unionDemoData.competitions.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.title}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Edition title
                                <input
                                    name="title"
                                    value={seasonForm.title}
                                    onChange={handleSeasonFormChange}
                                    placeholder="2027 Premiership"
                                />
                            </label>

                            <label>
                                Season label
                                <input
                                    name="seasonLabel"
                                    value={seasonForm.seasonLabel}
                                    onChange={handleSeasonFormChange}
                                    placeholder="2027"
                                />
                            </label>

                            <label>
                                Status
                                <select
                                    name="status"
                                    value={seasonForm.status}
                                    onChange={handleSeasonFormChange}
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="REGISTRATION_OPEN">Registration Open</option>
                                    <option value="ACTIVE">Active</option>
                                </select>
                            </label>

                            <label>
                                Start date
                                <input
                                    type="date"
                                    name="startDate"
                                    value={seasonForm.startDate}
                                    onChange={handleSeasonFormChange}
                                />
                            </label>

                            <label>
                                End date
                                <input
                                    type="date"
                                    name="endDate"
                                    value={seasonForm.endDate}
                                    onChange={handleSeasonFormChange}
                                />
                            </label>

                            <label>
                                Registration start
                                <input
                                    type="date"
                                    name="registrationStart"
                                    value={seasonForm.registrationStart}
                                    onChange={handleSeasonFormChange}
                                />
                            </label>

                            <label>
                                Registration end
                                <input
                                    type="date"
                                    name="registrationEnd"
                                    value={seasonForm.registrationEnd}
                                    onChange={handleSeasonFormChange}
                                />
                            </label>

                            <label>
                                Entry cap
                                <input
                                    name="entryCap"
                                    value={seasonForm.entryCap}
                                    onChange={handleSeasonFormChange}
                                    placeholder="12"
                                />
                            </label>
                        </div>

                        <label>
                            Notes
                            <textarea
                                name="notes"
                                value={seasonForm.notes}
                                onChange={handleSeasonFormChange}
                                placeholder="Any season-specific governance or scheduling notes."
                            />
                        </label>

                        <div className={styles.inlineActionGroup}>
                            <button type="submit">Save season draft</button>
                            <button
                                type="button"
                                className={styles.subtleButton}
                                onClick={() => setView("editions")}
                            >
                                Back to editions
                            </button>
                        </div>
                    </form>

                    <aside className={styles.supportCard}>
                        <h3>Selected competition</h3>
                        <p>
                            <strong>{addSeasonCompetition.title}</strong>
                        </p>
                        <p className={styles.mutedText}>
                            {addSeasonCompetition.subtitle}
                        </p>

                        <div className={styles.miniStatGrid}>
                            <article>
                                <strong>{editions.length}</strong>
                                <span>existing editions</span>
                            </article>
                            <article>
                                <strong>{seasonForm.entryCap}</strong>
                                <span>club entry cap</span>
                            </article>
                        </div>

                        <ul className={styles.helperList}>
                            <li>Preserve competition identity across seasons.</li>
                            <li>Track registration windows and entry readiness.</li>
                            <li>Prepare the edition before club assignment and fixtures.</li>
                        </ul>
                    </aside>
                </div>
            ) : null}
        </section>
    );
}
