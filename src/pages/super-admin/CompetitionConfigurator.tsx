import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import "../../components/SuperAdminSideBar.css";
import "../../styles/pages/SuperAdminDashboard.css";
import "../../styles/pages/SuperVariantsPage.css";

import {
   
    X,
    Plus,
    Pencil,
    Search,
    Users,
    Repeat,
    Trophy,
    Inbox,
    ListOrdered,
    Layers,
} from "lucide-react";



import "../../styles/pages/SuperAdminDashboard.css";


/* ---------------- TYPES ---------------- */

type Sport = "Football" | "Basketball" | "Rugby";

type FormatType =
    | "League"
    | "Knockout"
    | "Group + Knockout"
    | "Hybrid";

type Status = "Active" | "Draft" | "Archived";

type Legs = "Single" | "Double";

type FormatFilter = FormatType | "All";
type StatusFilter = Status | "All";


type SportVariantRef = {
    id: string;
    sport: Sport;
    name: string;
    shortCode: string;
};

type CompetitionFormat = {
    id: string;
    sport: Sport;
    variantId: string;
    name: string;
    type: FormatType;
    legs: Legs;

    pointsWin: number;
    pointsDraw: number;
    pointsLoss: number;

    groups: number | null;
    teamsPerGroup: number | null;
    advancing: number | null;

    tiebreakers: string;

    status: Status;

    leaguesUsing: number;

    updated: string;
};

type FormState = {
    sport: Sport;
    variantId: string;
    name: string;
    type: FormatType;
    legs: Legs;
    pointsWin: string;
    pointsDraw: string;
    pointsLoss: string;
    groups: string;
    teamsPerGroup: string;
    advancing: string;
    tiebreakers: string;
    status: Status;
};
type CompetitionFormatAPIResponse = {
    id: number;
    sport: Sport;

    variantId?: string;
    variant_id?: string;

    name: string;

    type?: FormatType;
    format_type?: FormatType;
    competition_type?: FormatType;

    legs?: Legs;

    pointsWin?: number;
    points_win?: number;

    pointsDraw?: number;
    points_draw?: number;

    pointsLoss?: number;
    points_loss?: number;

    groups?: number | null;

    teamsPerGroup?: number;
    teams_per_group?: number;

    advancing?: number | null;

    tiebreakers?: string;

    status?: Status;

    leaguesUsing?: number;
    leagues_using?: number;

    updated?: string;
};
/* ---------------- CONSTANTS ---------------- */

const SPORTS: Sport[] = ["Football", "Basketball", "Rugby"];
const FORMAT_TYPES: FormatType[] = ["League", "Knockout", "Group + Knockout", "Hybrid"];
const LEGS_OPTIONS: Legs[] = ["Single", "Double"];

const SPORT_ACCENT: Record<Sport, string> = {
    Football: "green",
    Basketball: "amber",
    Rugby: "purple",
};

const TYPE_TONE: Record<FormatType, string> = {
    League: "green",
    Knockout: "amber",
    "Group + Knockout": "muted",
    Hybrid: "muted",
};

const STATUS_TONE: Record<Status, string> = {
    Active: "green",
    Draft: "amber",
    Archived: "muted",
};

/* ---------------- DATA ---------------- */
/* Mirrors the ids/names used on the Sport Variants page so formats can reference a real variant */

const VARIANTS: SportVariantRef[] = [
    { id: "v1", sport: "Football", name: "11-a-side", shortCode: "FB-11" },
    { id: "v2", sport: "Football", name: "7-a-side", shortCode: "FB-07" },
    { id: "v3", sport: "Football", name: "Futsal", shortCode: "FB-FS" },
    { id: "v4", sport: "Basketball", name: "5-on-5", shortCode: "BB-05" },
    { id: "v5", sport: "Basketball", name: "3x3", shortCode: "BB-03" },
];

const EMPTY_FORM: FormState = {
    sport: "Football",
    variantId: "v1",
    name: "",
    type: "League",
    legs: "Single",
    pointsWin: "3",
    pointsDraw: "1",
    pointsLoss: "0",
    groups: "",
    teamsPerGroup: "",
    advancing: "",
    tiebreakers: "",
    status: "Draft",
};

/* ---------------- COMPONENT ---------------- */

export default function CompetitionFormatConfigurator() {
   
   const [formats, setFormats] = useState<CompetitionFormat[]>([]);

    const [activeSport, setActiveSport] = useState<"All" | Sport>("All");
    const [typeFilter, setTypeFilter] = useState<FormatFilter>("All");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [query, setQuery] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);


useEffect(() => {
    axios
        .get("/api/governance/competition-formats/")
        .then((response) => {
            console.log("Competition Formats API:", response.data);

            const apiFormats = response.data.map(
                (item: CompetitionFormatAPIResponse): CompetitionFormat => ({
                    id: String(item.id),

                    sport: item.sport,

                    variantId:
                        item.variantId ||
                        item.variant_id ||
                        "",

                    name: item.name,

                    type:
                        item.type ||
                        item.format_type ||
                        item.competition_type ||
                        "League",

                    legs:
                        item.legs ||
                        "Single",

                    pointsWin:
                        item.pointsWin ||
                        item.points_win ||
                        0,

                    pointsDraw:
                        item.pointsDraw ||
                        item.points_draw ||
                        0,

                    pointsLoss:
                        item.pointsLoss ||
                        item.points_loss ||
                        0,

                    groups:
                        item.groups ?? null,

                    teamsPerGroup:
                        item.teamsPerGroup ||
                        item.teams_per_group ||
                        null,

                    advancing:
                        item.advancing ?? null,

                    tiebreakers:
                        item.tiebreakers ||
                        "",

                    status:
                        item.status ||
                        "Draft",

                    leaguesUsing:
                        item.leaguesUsing ||
                        item.leagues_using ||
                        0,

                    updated:
                        item.updated ||
                        "Recently",
                })
            );

            setFormats(apiFormats);
        })
        .catch((error) => {
            console.error(
                "Failed to load competition formats:",
                error
            );
        });
}, []);
    /* ---------------- FILTERED ---------------- */

    const filtered = useMemo(() => {
        return formats.filter((f) => {
            if (activeSport !== "All" && f.sport !== activeSport) return false;
            if (typeFilter !== "All" && f.type !== typeFilter) return false;
            if (statusFilter !== "All" && f.status !== statusFilter) return false;
            if (query && !f.name.toLowerCase().includes(query.toLowerCase())) return false;
            return true;
        });
    }, [formats, activeSport, typeFilter, statusFilter, query]);

    /* ---------------- COUNTS ---------------- */

    const counts = useMemo(() => {
        const c: Record<string, number> = {
            All: formats.length,
            Football: 0,
            Basketball: 0,
            Rugby: 0,
        };
        formats.forEach((f) => {
            c[f.sport]++;
        });
        return c;
    }, [formats]);

    /* ---------------- HELPERS ---------------- */

    function variantsForSport(sport: Sport) {
        return VARIANTS.filter((v) => v.sport === sport);
    }

    function variantLabel(variantId: string) {
        const v = VARIANTS.find((v) => v.id === variantId);
        return v ? `${v.name} (${v.shortCode})` : "Unknown variant";
    }

    /* ---------------- ACTIONS ---------------- */

    function openCreate() {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    }

    function openEdit(format: CompetitionFormat) {
        setEditingId(format.id);
        setForm({
            sport: format.sport,
            variantId: format.variantId,
            name: format.name,
            type: format.type,
            legs: format.legs,
            pointsWin: String(format.pointsWin),
            pointsDraw: String(format.pointsDraw),
            pointsLoss: String(format.pointsLoss),
            groups: format.groups !== null ? String(format.groups) : "",
            teamsPerGroup: format.teamsPerGroup !== null ? String(format.teamsPerGroup) : "",
            advancing: format.advancing !== null ? String(format.advancing) : "",
            tiebreakers: format.tiebreakers,
            status: format.status,
        });
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
    }

    function handleSportChange(sport: Sport) {
        const firstVariant = variantsForSport(sport)[0];
        setForm({ ...form, sport, variantId: firstVariant ? firstVariant.id : "" });
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const isGroupBased = form.type === "Group + Knockout" || form.type === "Hybrid";

        const normalized: Omit<CompetitionFormat, "id" | "leaguesUsing" | "updated"> = {
            sport: form.sport,
            variantId: form.variantId,
            name: form.name,
            type: form.type,
            legs: form.legs,
            pointsWin: Number(form.pointsWin) || 0,
            pointsDraw: Number(form.pointsDraw) || 0,
            pointsLoss: Number(form.pointsLoss) || 0,
            groups: isGroupBased && form.groups ? Number(form.groups) : null,
            teamsPerGroup: isGroupBased && form.teamsPerGroup ? Number(form.teamsPerGroup) : null,
            advancing: isGroupBased && form.advancing ? Number(form.advancing) : null,
            tiebreakers: form.tiebreakers,
            status: form.status,
        };

        if (editingId) {
            setFormats((prev) =>
                prev.map((f) =>
                    f.id === editingId ? { ...f, ...normalized, updated: "Just now" } : f
                )
            );
        } else {
            const newFormat: CompetitionFormat = {
                id: `cf${Date.now()}`,
                ...normalized,
                leaguesUsing: 0,
                updated: "Just now",
            };
            setFormats((prev) => [newFormat, ...prev]);
        }

        closeModal();
    }

    function setStatus(format: CompetitionFormat, status: Status) {
        if (status === format.status) return;
        setFormats((prev) =>
            prev.map((f) => (f.id === format.id ? { ...f, status, updated: "Just now" } : f))
        );
    }

    /* ---------------- UI ---------------- */

    return (
        <div
        >
           

            <div className="dashboard-layout">
                

                <main className="main-content">
                    <div className="variants-page-header">
                        <div>
                            <h2>Competition Formats</h2>
                            <p>Define how leagues are played — from round robins to knockouts.</p>
                        </div>
                        <button className="icon-action-btn" onClick={openCreate} style={{ flex: "0 0 auto" }}>
                            <Plus size={16} /> New Format
                        </button>
                    </div>

                    {/* TOOLBAR */}
                    <div className="variants-toolbar">
                        <div className="sport-tabs">
                            <button
                                className={`sport-tab ${activeSport === "All" ? "active" : ""}`}
                                onClick={() => setActiveSport("All")}
                            >
                                All <span className="tab-count">{counts.All}</span>
                            </button>
                            {SPORTS.map((sport) => (
                                <button
                                    key={sport}
                                    className={`sport-tab ${activeSport === sport ? "active" : ""}`}
                                    onClick={() => setActiveSport(sport)}
                                >
                                    {sport} <span className="tab-count">{counts[sport]}</span>
                                </button>
                            ))}
                        </div>

                        <div className="toolbar-right">
                            <select
                                className="status-select"
                                value={typeFilter}
                                onChange={(e) =>
                                    setTypeFilter(e.target.value as FormatFilter)
                                }
                            >
                                <option value="All">All formats</option>
                                {FORMAT_TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>

                            <select
                                className="status-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)
                                }
                            >
                                <option value="All">All statuses</option>
                                <option value="Active">Active</option>
                                <option value="Draft">Draft</option>
                                <option value="Archived">Archived</option>
                            </select>

                            <div className="toolbar-search">
                                <Search size={14} />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search formats..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* GRID */}
                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <Inbox size={32} />
                            <h3>No formats match your filters</h3>
                            <p>Try a different sport, type, or search term — or create a new format.</p>
                        </div>
                    ) : (
                        <section className="variant-grid">
                            {filtered.map((f) => {
                                const isGroupBased = f.type === "Group + Knockout" || f.type === "Hybrid";
                                return (
                                    <div key={f.id} className={`variant-card accent-${SPORT_ACCENT[f.sport]}`}>
                                        <div className="variant-card-top">
                                            <span className={`sport-pill accent-${SPORT_ACCENT[f.sport]}`}>
                                                {f.sport}
                                            </span>
                                            <span className={`status-badge tone-${STATUS_TONE[f.status]}`}>
                                                {f.status}
                                            </span>
                                        </div>

                                        <h3 className="variant-name">{f.name}</h3>
                                        <div className="variant-code">{variantLabel(f.variantId)}</div>

                                        <div className="variant-meta">
                                            <div className="variant-meta-item">
                                                <span className={`status-badge tone-${TYPE_TONE[f.type]}`}>
                                                    {f.type}
                                                </span>
                                            </div>
                                            <div className="variant-meta-item">
                                                <Repeat size={14} />
                                                {f.legs} leg{f.legs === "Double" ? "s" : ""}
                                            </div>
                                            <div className="variant-meta-item">
                                                <ListOrdered size={14} />
                                                {f.pointsWin}W / {f.pointsDraw}D / {f.pointsLoss}L
                                            </div>
                                            {isGroupBased && (
                                                <div className="variant-meta-item">
                                                    <Layers size={14} />
                                                    {f.groups ?? "—"} groups &middot; {f.teamsPerGroup ?? "—"} per group &middot; top {f.advancing ?? "—"} advance
                                                </div>
                                            )}
                                            <div className="variant-meta-item">
                                                <Users size={14} />
                                                Tiebreakers: {f.tiebreakers || "Not set"}
                                            </div>
                                        </div>

                                        <div className="variant-card-footer">
                                            <span className="variant-leagues">
                                                <Trophy size={12} style={{ marginRight: 4, verticalAlign: "-2px" }} />
                                                {f.leaguesUsing} {f.leaguesUsing === 1 ? "league" : "leagues"}
                                            </span>
                                            <span className="variant-updated">Updated {f.updated}</span>
                                        </div>

                                        <div className="variant-actions">
                                            <button className="icon-action-btn subtle" onClick={() => openEdit(f)}>
                                                <Pencil size={14} /> Edit
                                            </button>
                                            <select
                                                className={`status-select tone-${STATUS_TONE[f.status]}`}
                                                value={f.status}
                                                onChange={(e) => setStatus(f, e.target.value as Status)}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Draft">Draft</option>
                                                <option value="Archived">Archived</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </section>
                    )}
                </main>
            </div>

          

            {/* MODAL */}
            {modalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingId ? "Edit Format" : "New Format"}</h3>
                            <button className="modal-close" onClick={closeModal}>
                                <X size={16} />
                            </button>
                        </div>

                        <form className="variant-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <label>
                                    Sport
                                    <select
                                        value={form.sport}
                                        onChange={(e) => handleSportChange(e.target.value as Sport)}
                                    >
                                        {SPORTS.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Applies to variant
                                    <select
                                        value={form.variantId}
                                        onChange={(e) => setForm({ ...form, variantId: e.target.value })}
                                    >
                                        {variantsForSport(form.sport).map((v) => (
                                            <option key={v.id} value={v.id}>{v.name} ({v.shortCode})</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="form-row">
                                <label>
                                    Format name
                                    <input
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Premier League Format"
                                    />
                                </label>
                                <label>
                                    Status
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value as Status })}
                                    >
                                        <option value="Draft">Draft</option>
                                        <option value="Active">Active</option>
                                        <option value="Archived">Archived</option>
                                    </select>
                                </label>
                            </div>

                            <div className="form-row">
                                <label>
                                    Competition type
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as FormatType })}
                                    >
                                        {FORMAT_TYPES.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Legs
                                    <select
                                        value={form.legs}
                                        onChange={(e) => setForm({ ...form, legs: e.target.value as Legs })}
                                    >
                                        {LEGS_OPTIONS.map((l) => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="form-row">
                                <label>
                                    Points — win
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.pointsWin}
                                        onChange={(e) => setForm({ ...form, pointsWin: e.target.value })}
                                    />
                                </label>
                                <label>
                                    Points — draw
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.pointsDraw}
                                        onChange={(e) => setForm({ ...form, pointsDraw: e.target.value })}
                                    />
                                </label>
                                <label>
                                    Points — loss
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.pointsLoss}
                                        onChange={(e) => setForm({ ...form, pointsLoss: e.target.value })}
                                    />
                                </label>
                            </div>

                            {(form.type === "Group + Knockout" || form.type === "Hybrid") && (
                                <div className="form-row">
                                    <label>
                                        Groups
                                        <input
                                            type="number"
                                            min={1}
                                            value={form.groups}
                                            onChange={(e) => setForm({ ...form, groups: e.target.value })}
                                            placeholder="e.g. 4"
                                        />
                                    </label>
                                    <label>
                                        Teams per group
                                        <input
                                            type="number"
                                            min={1}
                                            value={form.teamsPerGroup}
                                            onChange={(e) => setForm({ ...form, teamsPerGroup: e.target.value })}
                                            placeholder="e.g. 4"
                                        />
                                    </label>
                                    <label>
                                        Advance per group
                                        <input
                                            type="number"
                                            min={1}
                                            value={form.advancing}
                                            onChange={(e) => setForm({ ...form, advancing: e.target.value })}
                                            placeholder="e.g. 2"
                                        />
                                    </label>
                                </div>
                            )}

                            <div className="form-row">
                                <label style={{ flex: "1 1 100%" }}>
                                    Tiebreakers
                                    <input
                                        value={form.tiebreakers}
                                        onChange={(e) => setForm({ ...form, tiebreakers: e.target.value })}
                                        placeholder="e.g. Goal difference, Head-to-head, Goals scored"
                                    />
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="icon-action-btn subtle" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="icon-action-btn">
                                    {editingId ? "Save changes" : "Create format"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
