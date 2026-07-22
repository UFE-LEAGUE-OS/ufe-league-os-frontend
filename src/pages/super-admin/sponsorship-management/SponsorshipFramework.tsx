import { useMemo, useState, useEffect, useRef } from "react";
import type { FormEvent } from "react";
import "../../../styles/pages/super-admin/sponsorship-management/sponsorshipManagement.css";

interface SponsorFramework {
    id: number;
    name: string;
    category: SponsorshipCategory;
    sponsor: string;
    sport: Sport;
    entityType: EntityType;
    target: string;

    startDate: string;
    endDate: string;

    duration: string;
    value: string;
    status: SponsorshipStatus;
    updatedAt: string;
}

type Sport = "Football" | "Basketball" | "Rugby";
type EntityType = "League" | "Club" | "Fan Page";
type SportFilter = "All" | Sport;
type SponsorshipStatus =
    | "Draft"
    | "Pending Review"
    | "Approved"
    | "Active"
    | "Expired"
    | "Rejected";

type StatusFilter = "All" | SponsorshipStatus;

type FrameworkFormState = {
    name: string;
    category: SponsorshipCategory;
    sponsor: string;
    sport: Sport;
    entityType: EntityType;
    target: string;

    startDate: string;
    endDate: string;

    duration: string;
    value: string;
    status: SponsorFramework["status"];
};

type SponsorshipCategory =
    | "Title Sponsor"
    | "Official Partner"
    | "Technology Partner"
    | "Broadcast Partner"
    | "Beverage Partner"
    | "Medical Partner"
    | "Equipment Partner"
    | "Digital Partner";

// Mock directory of targetable entities, grouped by sport and entity type.
// Mirrors the directory used in Campaign Visibility Controls.
const ENTITY_DIRECTORY: Record<Sport, Record<EntityType, string[]>> = {
    Football: {
        League: ["Uganda Premier League", "StarTimes Uganda Cup"],
        Club: ["KCCA FC", "Vipers SC", "Express FC"],
        "Fan Page": ["KCCA FC Fan Page", "Cranes Nation", "Vipers SC Ultras"],
    },
    Basketball: {
        League: ["Uganda National Basketball League"],
        Club: ["City Oilers", "Kyambogo Angels", "UCU Canons"],
        "Fan Page": ["City Oilers Fan Page", "Angels Nation"],
    },
    Rugby: {
        League: ["Uganda Rugby Premier League"],
        Club: ["Kobs RFC", "Rugby Cranes", "Buffaloes RFC"],
        "Fan Page": ["Kobs RFC Fan Page", "Cranes Rugby Fans"],
    },
};
const SPONSORSHIP_CATEGORIES: SponsorshipCategory[] = [
    "Title Sponsor",
    "Official Partner",
    "Technology Partner",
    "Broadcast Partner",
    "Beverage Partner",
    "Medical Partner",
    "Equipment Partner",
    "Digital Partner",
];

const SPORTS: Sport[] = ["Football", "Basketball", "Rugby"];
const ENTITY_TYPES: EntityType[] = ["League", "Club", "Fan Page"];

const DURATIONS = ["1", "3", "6 ", "12", "24"];
const STATUSES: SponsorshipStatus[] = [
    "Draft",
    "Pending Review",
    "Approved",
    "Active",
    "Expired",
    "Rejected",
];

const initials = (name: string) =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();

function emptyForm(): FrameworkFormState {
    return {
        name: "",
        category: "Official Partner",
        sponsor: "",
        sport: "Football",
        entityType: "League",
        target: ENTITY_DIRECTORY.Football.League[0],

        startDate: "",
        endDate: "",

        duration: "3",
        value: "",
        status: "Draft",
    };
}

function formatValue(raw: string): string {
    const numeric = Number(raw.replace(/[^0-9.]/g, ""));
    if (!numeric) return raw.trim();
    return `$${numeric.toLocaleString()}`;
}

export default function SponsorFramework() {

    const [frameworks, setFrameworks] = useState<SponsorFramework[]>([
        {
            id: 1,
            name: "Gold Sponsorship Package",
            category: "Title Sponsor",
            sponsor: "MTN Uganda",
            sport: "Football",
            entityType: "League",
            target: "Uganda Premier League",
            duration: "12",
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            value: "$100,000",
            status: "Active",
            updatedAt: "Jul 08, 2026",
        },
        {
            id: 2,
            name: "Silver Sponsorship Package",
            category: "Technology Partner",
            sponsor: "Airtel Africa",
            sport: "Basketball",
            entityType: "Club",
            target: "City Oilers",
            duration: "6",
            startDate: "2026-07-01",
            endDate: "2026-12-31",
            value: "$50,000",
            status: "Draft",
            updatedAt: "Jul 03, 2026",
        },
        {
            id: 3,
            name: "Bronze Sponsorship Package",
            category: "Beverage Partner",
            sponsor: "Coca-Cola",
            sport: "Rugby",
            entityType: "Fan Page",
            target: "Kobs RFC Fan Page",
            duration: "3",
            startDate: "2026-02-01",
            endDate: "2026-05-01",
            value: "$20,000",
            status: "Expired",
            updatedAt: "May 21, 2026",
        },
    ]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [sportFilter, setSportFilter] = useState<SportFilter>("All");

    // Create/edit modal state
    const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<FrameworkFormState>(emptyForm());

    // View / duplicate / delete state
    const [viewingItem, setViewingItem] = useState<SponsorFramework | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const targetOptions = ENTITY_DIRECTORY[form.sport][form.entityType];

    const openCreate = () => {
        setForm(emptyForm());
        setEditingId(null);
        setModalMode("create");
    };

    const openEdit = (item: SponsorFramework) => {
        setForm({
            name: item.name,
            category: item.category,
            sponsor: item.sponsor,
            sport: item.sport,
            entityType: item.entityType,
            target: item.target,

            startDate: item.startDate,
            endDate: item.endDate,

            duration: item.duration,
            value: item.value,
            status: item.status,
        });

        setEditingId(item.id);
        setModalMode("edit");
    };


    const closeModal = () => {
        setModalMode(null);
        setEditingId(null);
        setForm(emptyForm());
    };

    const handleSportChange = (sport: Sport) => {
        const entityType = form.entityType;
        const target = ENTITY_DIRECTORY[sport][entityType][0];
        setForm({ ...form, sport, target });
    };

    const handleEntityTypeChange = (entityType: EntityType) => {
        const target = ENTITY_DIRECTORY[form.sport][entityType][0];
        setForm({ ...form, entityType, target });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.sponsor.trim() || !form.value.trim()) return;

        const cleanValue = formatValue(form.value);

        if (modalMode === "edit" && editingId !== null) {
            setFrameworks((prev) =>
                prev.map((item) =>
                    item.id === editingId
                        ? { ...item, ...form, value: cleanValue, updatedAt: "Today" }
                        : item
                )
            );
        } else {
            const newFramework: SponsorFramework = {
                id: Date.now(),
                ...form,
                value: cleanValue,
                updatedAt: "Today",
            };
            setFrameworks((prev) => [newFramework, ...prev]);
        }

        closeModal();
    };

    const handleDuplicate = (item: SponsorFramework) => {
        const copy: SponsorFramework = {
            ...item,
            id: Date.now(),
            name: `${item.name} (Copy)`,
            status: "Draft",
            updatedAt: "Today",
        };
        setFrameworks((prev) => [copy, ...prev]);
    };

    const handleDelete = (id: number) => {
        setFrameworks((prev) => prev.filter((item) => item.id !== id));
        setConfirmDeleteId(null);
    };

    const stats = useMemo(() => {
        const total = frameworks.length;
        const active = frameworks.filter(f => f.status === "Active").length;
        const draft = frameworks.filter(f => f.status === "Draft").length;
        const totalValue = frameworks.reduce((sum, f) => {
            const numeric = Number(f.value.replace(/[^0-9.]/g, "")) || 0;
            return sum + numeric;
        }, 0);
        return { total, active, draft, totalValue };
    }, [frameworks]);

    const filteredFrameworks = useMemo(() => {
        return frameworks.filter((item) => {
            const matchesStatus = statusFilter === "All" || item.status === statusFilter;
            const matchesSport = sportFilter === "All" || item.sport === sportFilter;
            const query = search.trim().toLowerCase();
            const matchesSearch =
                query.length === 0 ||
                item.name.toLowerCase().includes(query) ||
                item.sponsor.toLowerCase().includes(query) ||
                item.target.toLowerCase().includes(query);
            return matchesStatus && matchesSport && matchesSearch;
        });
    }, [frameworks, search, statusFilter, sportFilter]);

    const confirmDeleteItem = frameworks.find((f) => f.id === confirmDeleteId) ?? null;

    // Close the row action menu on outside click or Escape.
    useEffect(() => {
        if (openMenuId === null) return;

        const onClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenMenuId(null);
        };

        document.addEventListener("mousedown", onClick);
        window.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onClick);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [openMenuId]);

    // Close view/delete modals on Escape.
    useEffect(() => {
        if (!viewingItem && confirmDeleteId === null) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setViewingItem(null);
                setConfirmDeleteId(null);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [viewingItem, confirmDeleteId]);

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <span className="page-eyebrow">Sponsorship Management</span>
                    <h1>Sponsor Framework Editor</h1>
                    <p>Create and manage sponsorship packages, benefits and agreements.</p>
                </div>

                <button className="primary-btn" onClick={openCreate}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Create Framework
                </button>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon--total">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="16" rx="2" />
                            <path d="M3 9h18M8 4v3M16 4v3" />
                        </svg>
                    </div>
                    <div>
                        <span className="stat-label">Total Frameworks</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon--active">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <path d="M22 4 12 14.01l-3-3" />
                        </svg>
                    </div>
                    <div>
                        <span className="stat-label">Active</span>
                        <span className="stat-value">{stats.active}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon--draft">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                    </div>
                    <div>
                        <span className="stat-label">In Draft</span>
                        <span className="stat-value">{stats.draft}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon--value">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <div>
                        <span className="stat-label">Total Committed Value</span>
                        <span className="stat-value">${stats.totalValue.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="table-card">

                <div className="table-toolbar">
                    <div className="search-field">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="7" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by package, sponsor, or target..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    
                    <div className="filter-select">
                         <label htmlFor="sport-filter">Sport:   </label>
                        <select
                            value={sportFilter}
                            onChange={(e) => setSportFilter(e.target.value as SportFilter)}
                        >
                            {(["All", "Football", "Basketball", "Rugby"] as SportFilter[]).map(
                                (option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                    <div className="filter-select">
                        <label htmlFor="status-filter">Status: </label>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                        >
                            {(["All", "Draft", "Pending Review", "Approved", "Active", "Expired", "Rejected"] as StatusFilter[]).map(
                                (option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Package</th>
                            <th>Scope</th>

                            <th>Period</th>
                            <th>Duration (Months)</th>

                            <th>Sponsorship Value</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th aria-label="Actions" />
                        </tr>
                    </thead>

                    <tbody>
                        {filteredFrameworks.length === 0 && (
                            <tr>
                                <td colSpan={8} className="empty-row">
                                    No frameworks match your search. Try a different keyword or filter.
                                </td>
                            </tr>
                        )}

                        {filteredFrameworks.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <div className="package-cell">
                                        <span className="sponsor-avatar">{initials(item.sponsor)}</span>
                                        <div className="package-cell__text">
                                            <span className="package-name">{item.name}</span>
                                            <span className="package-category">{item.category}</span>
                                            <span className="package-sponsor">{item.sponsor}</span>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <div className="target-cell">
                                        <span className="sport-tag">{item.sport}</span>
                                        <span className="target-cell__name">{item.entityType}: {item.target}</span>
                                    </div>
                                </td>


                                <td>
                                    <div className="date-range">
                                        <span>{item.startDate}</span>
                                        <span> to </span>
                                        <span>{item.endDate}</span>
                                    </div>
                                </td>
                                <td>{item.duration}</td>

                                <td className="value-cell">{item.value}</td>

                                <td>
                                    <span className={`badge badge--${item.status.toLowerCase()}`}>
                                        <span className="badge-dot" />
                                        {item.status}
                                    </span>
                                </td>

                                <td className="muted-cell">{item.updatedAt}</td>

                                <td className="actions-cell">
                                    <div className="actions-menu" ref={openMenuId === item.id ? menuRef : undefined}>
                                        <button
                                            className="icon-btn"
                                            aria-label="Row actions"
                                            onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <circle cx="12" cy="5" r="1.8" />
                                                <circle cx="12" cy="12" r="1.8" />
                                                <circle cx="12" cy="19" r="1.8" />
                                            </svg>
                                        </button>

                                        {openMenuId === item.id && (
                                            <div className="actions-dropdown">
                                                <button onClick={() => { setViewingItem(item); setOpenMenuId(null); }}>
                                                    View
                                                </button>
                                                <button onClick={() => { openEdit(item); setOpenMenuId(null); }}>
                                                    Edit
                                                </button>
                                                <button onClick={() => { handleDuplicate(item); setOpenMenuId(null); }}>
                                                    Duplicate
                                                </button>
                                                <button
                                                    className="actions-dropdown__danger"
                                                    onClick={() => { setConfirmDeleteId(item.id); setOpenMenuId(null); }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ---------- Create / Edit modal ---------- */}
            {modalMode && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{modalMode === "edit" ? "Edit Sponsorship Framework" : "Create Sponsorship Framework"}</h3>
                            <button className="modal-close" onClick={closeModal} aria-label="Close">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form className="framework-form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <label className="form-field form-field--full">
                                    Package name
                                    <input
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="e.g. Gold Sponsorship Package"
                                    />
                                </label>

                                <label className="form-field form-field--full">
                                    Sponsorship Category
                                    <select
                                        value={form.category}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                category: e.target.value as SponsorshipCategory,
                                            })
                                        }
                                    >
                                        {SPONSORSHIP_CATEGORIES.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="form-field form-field--full">
                                    Sponsor
                                    <input
                                        required
                                        value={form.sponsor}
                                        onChange={(e) => setForm({ ...form, sponsor: e.target.value })}
                                        placeholder="e.g. MTN Uganda"
                                    />
                                </label>

                                <label className="form-field">
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

                                <label className="form-field">
                                    Entity type
                                    <select
                                        value={form.entityType}
                                        onChange={(e) => handleEntityTypeChange(e.target.value as EntityType)}
                                    >
                                        {ENTITY_TYPES.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="form-field form-field--full">
                                    Target
                                    <select
                                        value={form.target}
                                        onChange={(e) => setForm({ ...form, target: e.target.value })}
                                    >
                                        {targetOptions.map((t) => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="form-field">
                                    Start Date
                                    <input
                                        type="date"
                                        value={form.startDate}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                startDate: e.target.value,
                                            })
                                        }
                                    />
                                </label>
                                <label className="form-field">
                                    End Date
                                    <input
                                        type="date"
                                        value={form.endDate}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                endDate: e.target.value,
                                            })
                                        }
                                    />
                                </label>

                                <label className="form-field">
                                    Duration (Months)
                                    <select
                                        value={form.duration}
                                        onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                    >
                                        {DURATIONS.map((d) => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="form-field">
                                    Sponsorship value
                                    <input
                                        required
                                        inputMode="numeric"
                                        value={form.value}
                                        onChange={(e) => setForm({ ...form, value: e.target.value })}
                                        placeholder="e.g. 50,000"
                                    />
                                </label>

                                <label className="form-field form-field--full">
                                    Status
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value as SponsorFramework["status"] })}
                                    >
                                        {STATUSES.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="secondary-btn" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="primary-btn">
                                    {modalMode === "edit" ? "Save Changes" : "Create Framework"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ---------- View details modal ---------- */}
            {viewingItem && (
                <div className="modal-overlay" onClick={() => setViewingItem(null)}>
                    <div className="modal-panel modal-panel--view" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{viewingItem.name}</h3>
                            <button className="modal-close" onClick={() => setViewingItem(null)} aria-label="Close">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <dl className="view-details-grid">
                            <div className="view-details-item">
                                <dt>Sponsor</dt>
                                <dd>{viewingItem.sponsor}</dd>
                            </div>
                            <div className="view-details-item">
                                <dt>Sport</dt>
                                <dd>{viewingItem.sport}</dd>
                            </div>
                            <div className="view-details-item">
                                <dt>Entity Type</dt>
                                <dd>{viewingItem.entityType}</dd>
                            </div>
                            <div className="view-details-item">
                                <dt>Target</dt>
                                <dd>{viewingItem.target}</dd>
                            </div>
                            <div className="view-details-item">
                                <dt>Duration</dt>
                                <dd>{viewingItem.duration}</dd>
                            </div>
                            <div className="view-details-item">
                                <dt>Sponsorship Value</dt>
                                <dd>{viewingItem.value}</dd>
                            </div>
                            <div className="view-details-item">
                                <dt>Status</dt>
                                <dd>
                                    <span className={`badge badge--${viewingItem.status.toLowerCase()}`}>
                                        <span className="badge-dot" />
                                        {viewingItem.status}
                                    </span>
                                </dd>
                            </div>
                            <div className="view-details-item">
                                <dt>Last Updated</dt>
                                <dd>{viewingItem.updatedAt}</dd>
                            </div>
                        </dl>

                        <div className="modal-actions">
                            <button className="secondary-btn" onClick={() => setViewingItem(null)}>
                                Close
                            </button>
                            <button
                                className="primary-btn"
                                onClick={() => {
                                    const item = viewingItem;
                                    setViewingItem(null);
                                    openEdit(item);
                                }}
                            >
                                Edit Framework
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ---------- Delete confirmation modal ---------- */}
            {confirmDeleteItem && (
                <div className="modal-overlay" onClick={() => setConfirmDeleteId(null)}>
                    <div className="modal-panel modal-panel--confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Delete framework?</h3>
                            <button className="modal-close" onClick={() => setConfirmDeleteId(null)} aria-label="Close">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <p className="confirm-message">
                            This will permanently remove <strong>{confirmDeleteItem.name}</strong> ({confirmDeleteItem.sponsor}) from the framework list. This action cannot be undone.
                        </p>

                        <div className="modal-actions">
                            <button className="secondary-btn" onClick={() => setConfirmDeleteId(null)}>
                                Cancel
                            </button>
                            <button className="danger-btn" onClick={() => handleDelete(confirmDeleteItem.id)}>
                                Delete Framework
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
