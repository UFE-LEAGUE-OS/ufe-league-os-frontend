import { useMemo, useState } from "react";
import "../../../styles/pages/super-admin/sponsorship-management/sponsorshipManagement.css";

type Sport = "All Sports" | "Football" | "Basketball" | "Rugby";
type EntityType = "Platform-wide" | "League" | "Club" | "Fan Page";
type PlacementStatus = "Active" | "Inactive" | "Scheduled";

interface Placement {
    id: number;
    location: string;
    sponsor: string;
    sport: Sport;
    entityType: EntityType;
    target: string;
    status: PlacementStatus;
    updatedAt: string;
}

const LOCATIONS = [
    "Homepage Banner",
    "Match Results Page",
    "League Standings Page",
    "Club Profile Page",
    "Fan Page Feed",
    "Live Match Overlay",
];

const SPORTS: Sport[] = ["All Sports", "Football", "Basketball", "Rugby"];

// Mock directory of targetable entities, grouped by sport and entity type.
// Mirrors the directory used in Sponsor Framework and Campaign Visibility.
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

export default function PlacementManager() {

    const [placements, setPlacements] = useState<Placement[]>([
        {
            id: 1,
            location: "Homepage Banner",
            sponsor: "MTN",
            sport: "All Sports",
            entityType: "Platform-wide",
            target: "Platform-wide",
            status: "Active",
            updatedAt: "Jul 09, 2026",
        },
        {
            id: 2,
            location: "Match Results Page",
            sponsor: "Airtel",
            sport: "Football",
            entityType: "League",
            target: "Uganda Premier League",
            status: "Inactive",
            updatedAt: "Jul 02, 2026",
        },
        {
            id: 3,
            location: "Club Profile Page",
            sponsor: "Coca-Cola",
            sport: "Basketball",
            entityType: "Club",
            target: "City Oilers",
            status: "Scheduled",
            updatedAt: "Jun 30, 2026",
        },
    ]);

    const [location, setLocation] = useState(LOCATIONS[0]);
    const [sponsor, setSponsor] = useState("");
    const [sport, setSport] = useState<Sport>("All Sports");
    const [entityType, setEntityType] = useState<EntityType>("Platform-wide");
    const [target, setTarget] = useState("Platform-wide");
    const [status, setStatus] = useState<PlacementStatus>("Active");

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
        const total = placements.length;
        const active = placements.filter(p => p.status === "Active").length;
        const scheduled = placements.filter(p => p.status === "Scheduled").length;
        return { total, active, scheduled };
    }, [placements]);

    const handleAdd = () => {
        if (!sponsor.trim()) return;

        const newPlacement: Placement = {
            id: placements.length + 1,
            location,
            sponsor: sponsor.trim(),
            sport,
            entityType,
            target,
            status,
            updatedAt: "Today",
        };

        setPlacements([newPlacement, ...placements]);
        setSponsor("");
    };

    const cycleStatus = (id: number) => {
        const order: PlacementStatus[] = ["Active", "Scheduled", "Inactive"];
        setPlacements(placements.map(p => {
            if (p.id !== id) return p;
            const nextStatus = order[(order.indexOf(p.status) + 1) % order.length];
            return { ...p, status: nextStatus, updatedAt: "Today" };
        }));
    };

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <span className="page-eyebrow">Sponsorship Management</span>
                    <h1>System Placements Manager</h1>
                    <p>Control where sponsor content appears across the platform.</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon--total">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="16" rx="2" />
                            <path d="M3 10h18" />
                        </svg>
                    </div>
                    <div>
                        <span className="stat-label">Total Placements</span>
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
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 3" />
                        </svg>
                    </div>
                    <div>
                        <span className="stat-label">Scheduled</span>
                        <span className="stat-value">{stats.scheduled}</span>
                    </div>
                </div>
            </div>

            <div className="placement-layout">

                <div className="card">
                    <div className="card-header">
                        <h2>New Placement</h2>
                        <p>Assign a sponsor to a location on the platform.</p>
                    </div>

                    <div className="field-group">
                        <label htmlFor="location">Location</label>
                        <div className="select-wrap">
                            <select id="location" value={location} onChange={(e) => setLocation(e.target.value)}>
                                {LOCATIONS.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <svg className="select-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="sponsor">Sponsor</label>
                        <input
                            id="sponsor"
                            placeholder="MTN"
                            value={sponsor}
                            onChange={(e) => setSponsor(e.target.value)}
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
                        <label>Status</label>
                        <div className="segmented">
                            {(["Active", "Scheduled", "Inactive"] as PlacementStatus[]).map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={`segmented__option ${status === option ? "is-active" : ""}`}
                                    onClick={() => setStatus(option)}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="primary-btn" onClick={handleAdd}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Add Placement
                    </button>
                </div>

                <div className="card summary-card">
                    <div className="card-header">
                        <h2>Preview</h2>
                        <p>How this placement will be scoped.</p>
                    </div>

                    <div className="preview-chip">
                        <span className="preview-chip__label">Location</span>
                        <div className="preview-chip__body">
                            <span className="preview-chip__name">{location}</span>
                            <span className={`badge badge--${status.toLowerCase()}`}>
                                <span className="badge-dot" />
                                {status}
                            </span>
                        </div>
                        <span className="preview-chip__audience">
                            Sponsor: {sponsor.trim() || "Unassigned"}
                        </span>
                        <span className="preview-chip__audience">
                            {sport} &middot; {entityType}{entityType !== "Platform-wide" ? ` · ${target}` : ""}
                        </span>
                    </div>
                </div>

            </div>

            <div className="table-card">
                <div className="table-card__header">
                    <h2>Configured Placements</h2>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Location</th>
                            <th>Sponsor</th>
                            <th>Scope</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th aria-label="Actions" />
                        </tr>
                    </thead>

                    <tbody>
                        {placements.map((item) => (
                            <tr key={item.id}>
                                <td className="package-name">{item.location}</td>
                                <td>{item.sponsor}</td>
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
                                <td>
                                    <span className={`badge badge--${item.status.toLowerCase()}`}>
                                        <span className="badge-dot" />
                                        {item.status}
                                    </span>
                                </td>
                                <td className="muted-cell">{item.updatedAt}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => cycleStatus(item.id)}>
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
