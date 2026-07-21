import { useMemo, useState } from "react";
import "../../../styles/pages/super-admin/sponsorship-management/sponsorshipManagement.css";

type Sport = "Football" | "Basketball" | "Rugby";
type EntityType = "League" | "Club" | "Fan Page";
type VisibilityStatus = "All" | "Visible" | "Hidden";
type SportFilter = "All" | Sport;

interface VisibilityRule {
    id: number;
    campaignName: string;
    sport: Sport;
    entityType: EntityType;
    target: string;

    startDate: string;
    endDate: string;

    status: "Visible" | "Hidden";
    updatedAt: string;
}

const SPORTS: Sport[] = ["Football", "Basketball", "Rugby"];
const ENTITY_TYPES: EntityType[] = ["League", "Club", "Fan Page"];

// Mock directory of targetable entities, grouped by sport and entity type.
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

export default function CampaignVisibility() {

    const [rules, setRules] = useState<VisibilityRule[]>([
        {
            id: 1,
            campaignName: "MTN Season Campaign",
            sport: "Football",
            entityType: "League",
            target: "Uganda Premier League",

            startDate: "2026-01-01",
            endDate: "2026-12-31",

            status: "Visible",
            updatedAt: "Jul 09, 2026",
        },
        {
            id: 2,
            campaignName: "Airtel Matchday Takeover",
            sport: "Basketball",
            entityType: "Club",
            target: "City Oilers",

            startDate: "2026-07-01",
            endDate: "2026-12-31",

            status: "Visible",
            updatedAt: "Jul 06, 2026",
        },
        {
            id: 3,
            campaignName: "Coca-Cola Premium Banner",
            sport: "Rugby",
            entityType: "Fan Page",
            target: "Kobs RFC Fan Page",

            startDate: "2026-02-01",
            endDate: "2026-05-31",

            status: "Hidden",
            updatedAt: "Jun 28, 2026",
        },
    ]);

    const [campaignName, setCampaignName] = useState("");
    const [sport, setSport] = useState<Sport>("Football");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [entityType, setEntityType] = useState<EntityType>("League");
    const [target, setTarget] = useState(ENTITY_DIRECTORY.Football.League[0]);
    const [isVisible, setIsVisible] = useState(true);
    const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
    const [deleteRuleId, setDeleteRuleId] = useState<number | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<VisibilityStatus>("All");
    const [sportFilter, setSportFilter] = useState<SportFilter>("All");

    const targetOptions = useMemo(
        () => ENTITY_DIRECTORY[sport][entityType],
        [sport, entityType]
    );

    const handleSportChange = (next: Sport) => {
        setSport(next);
        setTarget(ENTITY_DIRECTORY[next][entityType][0]);
    };

    const handleEntityTypeChange = (next: EntityType) => {
        setEntityType(next);
        setTarget(ENTITY_DIRECTORY[sport][next][0]);
    };

    const visibleCount = useMemo(
        () => rules.filter(r => r.status === "Visible").length,
        [rules]
    );

    const filteredRules = useMemo(() => {
        return rules.filter((rule) => {

            const matchesSearch =
                search.trim() === "" ||
                rule.campaignName.toLowerCase().includes(search.toLowerCase()) ||
                rule.target.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "All" ||
                rule.status === statusFilter;

            const matchesSport =
                sportFilter === "All" ||
                rule.sport === sportFilter;

            return matchesSearch && matchesStatus && matchesSport;
        });
    }, [rules, search, statusFilter, sportFilter]);

    const handleSave = () => {
        if (!campaignName.trim()) return;

        if (editingRuleId !== null) {

            setRules(rules.map(rule =>
                rule.id === editingRuleId
                    ? {
                        ...rule,
                        campaignName,
                        sport,
                        entityType,
                        target,
                        startDate,
                        endDate,
                        status: isVisible ? "Visible" : "Hidden",
                        updatedAt: "Today",
                    }
                    : rule
            ));

            setEditingRuleId(null);
            setCampaignName("");
            setStartDate("");
            setEndDate("");
            setIsVisible(true);

            return;
        }

        const newRule: VisibilityRule = {
            id: rules.length + 1,
            campaignName: campaignName.trim(),
            sport,
            entityType,
            target,

            startDate,
            endDate,

            status: isVisible ? "Visible" : "Hidden",
            updatedAt: "Today",
        };

        setRules([newRule, ...rules]);

        setCampaignName("");
        setSport("Football");
        setEntityType("League");
        setTarget(ENTITY_DIRECTORY.Football.League[0]);
        setStartDate("");
        setEndDate("");
        setIsVisible(true);
    };

    const toggleRuleStatus = (id: number) => {
        setRules(rules.map(rule =>
            rule.id === id
                ? { ...rule, status: rule.status === "Visible" ? "Hidden" : "Visible", updatedAt: "Today" }
                : rule
        ));
    };

    const handleDelete = () => {
        if (deleteRuleId === null) return;

        setRules(rules.filter(rule => rule.id !== deleteRuleId));
        setDeleteRuleId(null);
    };
    const handleEdit = (rule: VisibilityRule) => {
        setEditingRuleId(rule.id);

        setCampaignName(rule.campaignName);
        setSport(rule.sport);
        setEntityType(rule.entityType);
        setTarget(rule.target);

        setStartDate(rule.startDate);
        setEndDate(rule.endDate);

        setIsVisible(rule.status === "Visible");
    };

    return (
        <div className="page-container campaign-visibility-page">

            <div className="page-header">
                <div>
                    <span className="page-eyebrow">Sponsorship Management</span>
                    <h1>Campaign Visibility Controls</h1>
                    <p>Decide which leagues, clubs, or fan pages see sponsor campaigns.</p>
                </div>
            </div>

            <div className="visibility-layout">

                <div className="card">
                    <div className="card-header">
                        <h2>
                            {editingRuleId ? "Edit Visibility Rule" : "New Visibility Rule"}
                        </h2>
                        <p>Target a campaign to a specific league, club, or fan page.</p>
                    </div>

                    <div className="field-group">
                        <label htmlFor="campaignName">Campaign Name</label>
                        <input
                            id="campaignName"
                            placeholder="MTN Season Campaign"
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                        />
                    </div>

                    <div className="field-group">
                        <label>Sport</label>
                        <div className="segmented">
                            {SPORTS.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={`segmented__option ${sport === option ? "is-active" : ""}`}
                                    onClick={() => handleSportChange(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="field-group">
                        <label>Entity Type</label>
                        <div className="segmented">
                            {ENTITY_TYPES.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={`segmented__option ${entityType === option ? "is-active" : ""}`}
                                    onClick={() => handleEntityTypeChange(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="target">{entityType}</label>
                        <div className="select-wrap">
                            <select
                                id="target"
                                value={target}
                                onChange={(e) => setTarget(e.target.value)}
                            >
                                {targetOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <svg className="select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="startDate">Visibility Start Date</label>
                        <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="endDate">Visibility End Date</label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className="field-group">
                        <label>Status</label>
                        <button
                            type="button"
                            className={`status-toggle ${isVisible ? "is-visible" : "is-hidden"}`}
                            onClick={() => setIsVisible(!isVisible)}
                        >
                            <span className="status-toggle__track">
                                <span className="status-toggle__thumb" />
                            </span>
                            <span className="status-toggle__label">
                                {isVisible ? "Visible to selected audience" : "Hidden from all audiences"}
                            </span>
                        </button>
                    </div>

                    <div className="form-actions">
                        <button className="primary-btn" onClick={handleSave}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                                <path d="M17 21v-8H7v8M7 3v5h8" />
                            </svg>
                            {editingRuleId ? "Update Settings" : "Save Settings"}
                        </button>

                        {editingRuleId && (
                            <button
                                className="secondary-btn"
                                onClick={() => {
                                    setEditingRuleId(null);
                                    setCampaignName("");
                                    setSport("Football");
                                    setEntityType("League");
                                    setTarget(ENTITY_DIRECTORY.Football.League[0]);
                                    setStartDate("");
                                    setEndDate("");
                                    setIsVisible(true);
                                }}
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </div>

                <div className="card summary-card">
                    <div className="card-header">
                        <h2>Visibility Snapshot</h2>
                        <p>Current state across all configured campaigns.</p>
                    </div>

                    <div className="summary-row">
                        <span className="summary-label">Total Rules</span>
                        <span className="summary-value">{rules.length}</span>
                    </div>

                    <div className="summary-row">
                        <span className="summary-label">Currently Visible</span>
                        <span className="summary-value summary-value--accent">{visibleCount}</span>
                    </div>

                    <div className="summary-row">
                        <span className="summary-label">Hidden</span>
                        <span className="summary-value">{rules.length - visibleCount}</span>
                    </div>

                    <div className="preview-chip">
                        <span className="preview-chip__label">Live Preview</span>
                        <div className="preview-chip__body">
                            <span className="preview-chip__name">
                                {campaignName.trim() || "Untitled Campaign"}
                            </span>
                            <span className={`badge badge--${isVisible ? "visible" : "hidden"}`}>
                                <span className="badge-dot" />
                                {isVisible ? "Visible" : "Hidden"}
                            </span>
                        </div>
                        <span className="preview-chip__audience">
                            {sport} &middot; {entityType} &middot; {target}
                        </span>
                    </div>
                </div>

            </div>

            <div className="table-card">

                <div className="table-card__header">
                    <h2>Configured Campaigns</h2>
                </div>

                <div className="table-toolbar">

                    <div className="search-field">
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="toolbar-filters">

                        <div className="filter-select">
                            <label>Sport:</label>
                            <select
                                value={sportFilter}
                                onChange={(e) =>
                                    setSportFilter(e.target.value as SportFilter)
                                }
                            >
                                <option value="All">All Sports</option>

                                {SPORTS.map((sport) => (
                                    <option key={sport} value={sport}>
                                        {sport}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-select">
                            <label>Status:</label>
                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value as VisibilityStatus)
                                }
                            >
                                <option value="All">All Statuses</option>
                                <option value="Visible">Visible</option>
                                <option value="Hidden">Hidden</option>
                            </select>
                        </div>

                    </div>

                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Campaign</th>
                            <th>Sport</th>
                            <th>Target</th>
                            <th>Visibility Period</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th aria-label="Actions" />
                        </tr>
                    </thead>

                    <tbody>
                        {filteredRules.map((rule) => (
                            <tr key={rule.id}>
                                <td className="package-name">{rule.campaignName}</td>
                                <td>
                                    <span className="sport-tag">{rule.sport}</span>
                                </td>
                                <td>
                                    <div className="target-cell">
                                        <span className="target-cell__type">{rule.entityType}</span>
                                        <span className="target-cell__name">{rule.target}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="date-range">
                                        <span>{rule.startDate}</span>
                                        <span> to </span>
                                        <span>{rule.endDate}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge badge--${rule.status.toLowerCase()}`}>
                                        <span className="badge-dot" />
                                        {rule.status}
                                    </span>
                                </td>
                                <td className="muted-cell">{rule.updatedAt}</td>
                                <td>
                                    <div className="actions-cell">

                                        <button
                                            className="edit-btn"
                                            onClick={() => handleEdit(rule)}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="edit-btn"
                                            onClick={() => toggleRuleStatus(rule.id)}
                                        >
                                            {rule.status === "Visible" ? "Hide" : "Show"}
                                        </button>
                                        <button
                                            className="delete-btn"
                                            onClick={() => setDeleteRuleId(rule.id)}
                                        >
                                            Delete
                                        </button>

                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {deleteRuleId !== null && (
                <div
                    className="modal-overlay"
                    onClick={() => setDeleteRuleId(null)}
                >
                    <div
                        className="modal-panel modal-panel--confirm"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="modal-header">
                            <h3>Delete Visibility Rule</h3>
                        </div>

                        <p className="confirm-message">
                            Are you sure you want to delete this visibility rule?
                            This action cannot be undone.
                        </p>

                        <div className="modal-actions">

                            <button
                                className="secondary-btn"
                                onClick={() => setDeleteRuleId(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="danger-btn"
                                onClick={handleDelete}
                            >
                                Delete Rule
                            </button>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

