import { useMemo, useState } from "react";
import "../../../styles/pages/super-admin/sponsorship-management/sponsorshipManagement.css";

type Sport = "All Sports" | "Football" | "Basketball" | "Rugby";
type EntityType = "Platform-wide" | "League" | "Club" | "Fan Page";
type AssetStatus = "Available" | "Occupied" | "Reserved";

interface InventoryAsset {
    id: number;
    name: string;
    assetType: string;
    sport: Sport;
    entityType: EntityType;
    target: string;
    status: AssetStatus;
    assignedSponsor: string;
    estimatedValue: string;
}

const ASSET_TYPES = ["Digital Banner", "Jersey Branding", "Social Media Post", "Stadium LED Board", "Broadcast Overlay"];
const SPORTS: Sport[] = ["All Sports", "Football", "Basketball", "Rugby"];

// Mock directory of targetable entities, grouped by sport and entity type.
// Mirrors the directory used across Sponsor Framework, Visibility, and Placements.
const ENTITY_DIRECTORY: Record<Exclude<Sport, "All Sports">, Record<Exclude<EntityType, "Platform-wide">, string[]>> = {
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

const entityTypesFor = (sport: Sport): EntityType[] =>
    sport === "All Sports" ? ["Platform-wide"] : ["Platform-wide", "League", "Club", "Fan Page"];

const targetsFor = (sport: Sport, entityType: EntityType): string[] => {
    if (sport === "All Sports" || entityType === "Platform-wide") return ["Platform-wide"];
    return ENTITY_DIRECTORY[sport][entityType];
};

type StatusFilter = "All" | AssetStatus;

export default function SponsorshipInventory() {

    const [assets, setAssets] = useState<InventoryAsset[]>([
        {
            id: 1,
            name: "Homepage Banner",
            assetType: "Digital Banner",
            sport: "All Sports",
            entityType: "Platform-wide",
            target: "Platform-wide",
            status: "Available",
            assignedSponsor: "—",
            estimatedValue: "$15,000",
        },
        {
            id: 2,
            name: "Match Jersey Logo",
            assetType: "Jersey Branding",
            sport: "Football",
            entityType: "Club",
            target: "KCCA FC",
            status: "Occupied",
            assignedSponsor: "MTN Uganda",
            estimatedValue: "$40,000",
        },
        {
            id: 3,
            name: "Social Media Post",
            assetType: "Social Media Post",
            sport: "Basketball",
            entityType: "Fan Page",
            target: "City Oilers Fan Page",
            status: "Available",
            assignedSponsor: "—",
            estimatedValue: "$3,000",
        },
    ]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

    // New asset form state
    const [name, setName] = useState("");
    const [assetType, setAssetType] = useState(ASSET_TYPES[0]);
    const [sport, setSport] = useState<Sport>("All Sports");
    const [entityType, setEntityType] = useState<EntityType>("Platform-wide");
    const [target, setTarget] = useState("Platform-wide");
    const [estimatedValue, setEstimatedValue] = useState("");

    const entityTypeOptions = useMemo(() => entityTypesFor(sport), [sport]);
    const targetOptions = useMemo(() => targetsFor(sport, entityType), [sport, entityType]);

    const handleSportChange = (next: Sport) => {
        setSport(next);
        const nextEntityType = entityTypesFor(next)[0];
        setEntityType(nextEntityType);
        setTarget(targetsFor(next, nextEntityType)[0]);
    };

    const handleEntityTypeChange = (next: EntityType) => {
        setEntityType(next);
        setTarget(targetsFor(sport, next)[0]);
    };

    const stats = useMemo(() => {
        const total = assets.length;
        const available = assets.filter(a => a.status === "Available").length;
        const occupied = assets.filter(a => a.status === "Occupied").length;
        return { total, available, occupied };
    }, [assets]);

    const filteredAssets = useMemo(() => {
        return assets.filter((item) => {
            const matchesStatus = statusFilter === "All" || item.status === statusFilter;
            const query = search.trim().toLowerCase();
            const matchesSearch =
                query.length === 0 ||
                item.name.toLowerCase().includes(query) ||
                item.assignedSponsor.toLowerCase().includes(query) ||
                item.target.toLowerCase().includes(query);
            return matchesStatus && matchesSearch;
        });
    }, [assets, search, statusFilter]);

    const handleAdd = () => {
        if (!name.trim()) return;

        const newAsset: InventoryAsset = {
            id: assets.length + 1,
            name: name.trim(),
            assetType,
            sport,
            entityType,
            target,
            status: "Available",
            assignedSponsor: "—",
            estimatedValue: estimatedValue.trim() || "$0",
        };

        setAssets([newAsset, ...assets]);
        setName("");
        setEstimatedValue("");
    };

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <span className="page-eyebrow">Sponsorship Management</span>
                    <h1>Sponsorship Inventory</h1>
                    <p>Track available sponsor assets across the platform.</p>
                </div>
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
                        <span className="stat-label">Total Assets</span>
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
                        <span className="stat-label">Available</span>
                        <span className="stat-value">{stats.available}</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-icon--draft">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="4" y="4" width="16" height="16" rx="3" />
                            <path d="M9 9h6v6H9z" />
                        </svg>
                    </div>
                    <div>
                        <span className="stat-label">Occupied</span>
                        <span className="stat-value">{stats.occupied}</span>
                    </div>
                </div>
            </div>

            <div className="inventory-layout">

                <div className="card">
                    <div className="card-header">
                        <h2>New Asset</h2>
                        <p>Register a sponsorable asset and its scope.</p>
                    </div>

                    <div className="field-group">
                        <label htmlFor="assetName">Asset Name</label>
                        <input
                            id="assetName"
                            placeholder="Homepage Banner"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="assetType">Asset Type</label>
                        <div className="select-wrap">
                            <select id="assetType" value={assetType} onChange={(e) => setAssetType(e.target.value)}>
                                {ASSET_TYPES.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <svg className="select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </div>
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

                    {entityTypeOptions.length > 1 && (
                        <div className="field-group">
                            <label>Entity Type</label>
                            <div className="segmented">
                                {entityTypeOptions.map((option) => (
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
                    )}

                    {entityType !== "Platform-wide" && (
                        <div className="field-group">
                            <label htmlFor="target">{entityType}</label>
                            <div className="select-wrap">
                                <select id="target" value={target} onChange={(e) => setTarget(e.target.value)}>
                                    {targetOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <svg className="select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </div>
                        </div>
                    )}

                    <div className="field-group">
                        <label htmlFor="estimatedValue">Estimated Value</label>
                        <input
                            id="estimatedValue"
                            placeholder="$15,000"
                            value={estimatedValue}
                            onChange={(e) => setEstimatedValue(e.target.value)}
                        />
                    </div>

                    <button className="primary-btn" onClick={handleAdd}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add Asset
                    </button>
                </div>

                <div className="card summary-card">
                    <div className="card-header">
                        <h2>Preview</h2>
                        <p>How this asset will appear in inventory.</p>
                    </div>

                    <div className="preview-chip">
                        <span className="preview-chip__label">{assetType}</span>
                        <div className="preview-chip__body">
                            <span className="preview-chip__name">{name.trim() || "Untitled Asset"}</span>
                            <span className="badge badge--available">
                                <span className="badge-dot" />
                                Available
                            </span>
                        </div>
                        <span className="preview-chip__audience">
                            {sport} &middot; {entityType}{entityType !== "Platform-wide" ? ` · ${target}` : ""}
                        </span>
                        <span className="preview-chip__audience">
                            Value: {estimatedValue.trim() || "$0"}
                        </span>
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
                            placeholder="Search by asset, sponsor, or target..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="filter-pills">
                        {(["All", "Available", "Occupied", "Reserved"] as StatusFilter[]).map((option) => (
                            <button
                                key={option}
                                className={`filter-pill ${statusFilter === option ? "is-active" : ""}`}
                                onClick={() => setStatusFilter(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Scope</th>
                            <th>Assigned Sponsor</th>
                            <th>Estimated Value</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredAssets.length === 0 && (
                            <tr>
                                <td colSpan={5} className="empty-row">
                                    No assets match your search. Try a different keyword or filter.
                                </td>
                            </tr>
                        )}

                        {filteredAssets.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <div className="package-cell__text">
                                        <span className="package-name">{item.name}</span>
                                        <span className="package-sponsor">{item.assetType}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="target-cell">
                                        <span className="sport-tag">{item.sport}</span>
                                        <span className="target-cell__name">
                                            {item.entityType === "Platform-wide"
                                                ? "Platform-wide"
                                                : `${item.entityType}: ${item.target}`}
                                        </span>
                                    </div>
                                </td>
                                <td>{item.assignedSponsor}</td>
                                <td className="value-cell">{item.estimatedValue}</td>
                                <td>
                                    <span className={`badge badge--${item.status.toLowerCase()}`}>
                                        <span className="badge-dot" />
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}

