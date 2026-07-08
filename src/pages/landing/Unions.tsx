import { ArrowRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getPublicUnions, type PublicUnionApi } from "../../services/publicUnionService";
import "../../styles/pages/landing/unions.css";

type UnionSport = "ALL" | "RUGBY" | "FOOTBALL" | "BASKETBALL";

type UnionCard = {
    id: number;
    name: string;
    slug: string;
    acronym: string;
    sport: Exclude<UnionSport, "ALL">;
    type: string;
    description: string;
    members: string;
    founded: string;
    focus: string[];
    competitions: number;
    athletes: string;
    accentColor: string;
    ownerRole: string;
    workspaceAccess: string;
    logo?: string | null;
    isBackend: boolean;
};

const sportTabs: Array<{ label: string; value: UnionSport }> = [
    { label: "All", value: "ALL" },
    { label: "Rugby", value: "RUGBY" },
    { label: "Football", value: "FOOTBALL" },
    { label: "Basketball", value: "BASKETBALL" },
];

const fallbackUnions: UnionCard[] = [
    {
        id: 1,
        name: "Uganda Rugby Union",
        slug: "uganda-rugby-union",
        acronym: "URU",
        sport: "RUGBY",
        type: "National Federation",
        description:
            "National rugby federation for club competitions, player registration, referee development and national rugby programmes.",
        members: "18 clubs",
        founded: "1955",
        focus: ["Competition governance", "Player registration", "Referees", "Club compliance"],
        competitions: 6,
        athletes: "800+",
        accentColor: "#7b3ff2",
        ownerRole: "Union Owner",
        workspaceAccess: "Owner, Union Admin, Registrar, Referee Manager, Finance Officer",
        logo: null,
        isBackend: false,
    },
    {
        id: 2,
        name: "Federation of Uganda Football Associations",
        slug: "federation-of-uganda-football-associations",
        acronym: "FUFA",
        sport: "FOOTBALL",
        type: "National Federation",
        description:
            "National football administration for competitions, club licensing, match officials, football development and national teams.",
        members: "350+ clubs",
        founded: "1924",
        focus: ["League administration", "Club licensing", "Referee pathways", "National teams"],
        competitions: 12,
        athletes: "5,000+",
        accentColor: "#f97316",
        ownerRole: "Federation Owner",
        workspaceAccess: "Owner, Competitions Manager, Registrar, Viewer",
        logo: null,
        isBackend: false,
    },
    {
        id: 3,
        name: "Federation of Uganda Basketball Associations",
        slug: "federation-of-uganda-basketball-associations",
        acronym: "FUBA",
        sport: "BASKETBALL",
        type: "National Federation",
        description:
            "Basketball federation supporting elite leagues, club development, athlete pathways and national team structures.",
        members: "60 clubs",
        founded: "1968",
        focus: ["League operations", "Talent pathways", "Club support", "Technical development"],
        competitions: 5,
        athletes: "1,200+",
        accentColor: "#2563eb",
        ownerRole: "Federation Owner",
        workspaceAccess: "Owner, Registrar, Competitions Manager, Viewer",
        logo: null,
        isBackend: false,
    },
    {
        id: 4,
        name: "Budo League",
        slug: "budo-league",
        acronym: "BUDO",
        sport: "FOOTBALL",
        type: "Community League",
        description:
            "Community alumni league workspace for teams, fixtures, player registration, matchday administration and competition operations.",
        members: "20+ teams",
        founded: "2010",
        focus: ["Community league", "Team registration", "Fixtures", "Results"],
        competitions: 2,
        athletes: "600+",
        accentColor: "#10b981",
        ownerRole: "League Owner",
        workspaceAccess: "Owner, League Admin, Competitions Manager, Viewer",
        logo: null,
        isBackend: false,
    },
    {
        id: 5,
        name: "SMACK League",
        slug: "smack-league",
        acronym: "SMACK",
        sport: "FOOTBALL",
        type: "Community League",
        description:
            "Community football league workspace for alumni teams, competition rules, fixtures, standings and player participation.",
        members: "18+ teams",
        founded: "2012",
        focus: ["Community competition", "Player registration", "Standings", "Matchday"],
        competitions: 2,
        athletes: "500+",
        accentColor: "#a855f7",
        ownerRole: "League Owner",
        workspaceAccess: "Owner, League Admin, Viewer",
        logo: null,
        isBackend: false,
    },
];

function normalise(value: string) {
    return value.trim().toLowerCase();
}

function inferAcronym(union: PublicUnionApi) {
    const name = normalise(union.name);

    if (name.includes("rugby")) return "URU";
    if (name.includes("football") || name.includes("fufa")) return "FUFA";
    if (name.includes("basketball") || name.includes("fuba")) return "FUBA";
    if (name.includes("budo")) return "BUDO";
    if (name.includes("smack")) return "SMACK";

    return union.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 5)
        .toUpperCase();
}

function inferSport(name: string): Exclude<UnionSport, "ALL"> {
    const lower = normalise(name);

    if (lower.includes("rugby")) return "RUGBY";
    if (lower.includes("basketball") || lower.includes("fuba")) return "BASKETBALL";

    return "FOOTBALL";
}

function sportLabel(value: UnionSport) {
    if (value === "ALL") return "All Sports";

    return value.charAt(0) + value.slice(1).toLowerCase();
}

function getInitials(name: string, acronym: string) {
    if (acronym) return acronym;

    return name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 4)
        .toUpperCase();
}

function mergeBackendUnion(union: PublicUnionApi): UnionCard {
    const acronym = inferAcronym(union);
    const fallback =
        fallbackUnions.find((item) => item.acronym === acronym) ??
        fallbackUnions.find((item) => normalise(item.name) === normalise(union.name));

    const sport = fallback?.sport ?? inferSport(union.name);

    return {
        id: union.id,
        name: union.name,
        slug: union.slug,
        acronym,
        sport,
        type:
            fallback?.type ??
            (normalise(union.name).includes("league") ? "Community League" : "National Federation"),
        description: union.description || fallback?.description || "League OS federation workspace.",
        members: fallback?.members ?? "—",
        founded: union.founded_year ? String(union.founded_year) : fallback?.founded ?? "—",
        focus: fallback?.focus ?? ["Competitions", "Clubs", "Registrations", "Officials"],
        competitions: fallback?.competitions ?? 0,
        athletes: fallback?.athletes ?? "—",
        accentColor: fallback?.accentColor ?? "#7b3ff2",
        ownerRole: fallback?.ownerRole ?? "Workspace Owner",
        workspaceAccess: fallback?.workspaceAccess ?? "Owner, Admin, Viewer",
        logo: union.logo ?? fallback?.logo ?? null,
        isBackend: true,
    };
}

function Unions() {
    const navigate = useNavigate();
    const [activeSport, setActiveSport] = useState<UnionSport>("ALL");
    const [query, setQuery] = useState("");
    const [expandedUnionId, setExpandedUnionId] = useState<number | null>(null);
    const [backendUnions, setBackendUnions] = useState<UnionCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [, setIsUsingFallback] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function loadUnions() {
            try {
                const unionsFromApi = await getPublicUnions();

                if (!isMounted) return;

                setBackendUnions(unionsFromApi.map(mergeBackendUnion));
                setIsUsingFallback(false);
                setLoadError("");
            } catch {
                if (!isMounted) return;

                setBackendUnions(fallbackUnions);
                setIsUsingFallback(true);
                setLoadError("Showing preview data because backend unions could not be loaded.");
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadUnions();

        return () => {
            isMounted = false;
        };
    }, []);

    const unionCards = backendUnions;

    const filteredUnions = useMemo(() => {
        const normalizedSearch = query.trim().toLowerCase();

        return unionCards.filter((union) => {
            const matchesSport = activeSport === "ALL" || union.sport === activeSport;
            const matchesSearch =
                !normalizedSearch ||
                `${union.name} ${union.acronym} ${union.sport} ${union.type} ${union.description}`
                    .toLowerCase()
                    .includes(normalizedSearch);

            return matchesSport && matchesSearch;
        });
    }, [activeSport, query, unionCards]);

    const totalCompetitions = unionCards.reduce((total, union) => total + union.competitions, 0);

    function toggleUnionCard(unionId: number) {
        setExpandedUnionId((currentId) => (currentId === unionId ? null : unionId));
    }

    return (
        <div className="unions-page landing-page">
            <Navbar />

            <main className="unions-shell">
                <section className="unions-hero">
                    <div className="unions-breadcrumb">
                        <button type="button" onClick={() => navigate("/")}>
                            Home
                        </button>
                        <span>/</span>
                        <span>Unions</span>
                    </div>

                    <div className="unions-hero-grid">
                        <div>
                            <span className="unions-eyebrow">
                                "Federations & governing bodies"
                            </span>
                            <h1>Federations and Unions</h1>
                            <p className="unions-intro">
                                Browse national federations, unions and community league workspaces
                                that manage competitions, clubs, registrations, officials and
                                governance through League OS.
                            </p>
                            {loadError ? <p className="unions-results-count">{loadError}</p> : null}
                        </div>

                        <div className="unions-hero-panel" aria-label="Union summary">
                            <div>
                                <strong>{isLoading ? "…" : unionCards.length}</strong>
                                <span>Workspaces</span>
                            </div>
                            <div>
                                <strong>{totalCompetitions}</strong>
                                <span>Competitions</span>
                            </div>
                            <div>
                                <strong>465+</strong>
                                <span>Clubs & teams</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="unions-content">
                    <div className="unions-toolbar">
                        <div className="unions-tabs" aria-label="Filter unions by sport">
                            {sportTabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    className={activeSport === tab.value ? "active" : ""}
                                    onClick={() => {
                                        setActiveSport(tab.value);
                                        setExpandedUnionId(null);
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <label className="unions-search">
                            <span>Search</span>
                            <Search size={17} strokeWidth={2.3} aria-hidden="true" />
                            <input
                                type="search"
                                placeholder="Search URU, FUFA, FUBA, Budo, SMACK..."
                                value={query}
                                onChange={(event) => {
                                    setQuery(event.target.value);
                                    setExpandedUnionId(null);
                                }}
                            />
                        </label>
                    </div>

                    <div className="unions-layout">
                        <p className="unions-results-count">
                            Showing {filteredUnions.length} of {unionCards.length} union workspaces
                        </p>

                        <div className="unions-card-grid">
                            {filteredUnions.map((union) => (
                                <article
                                    key={`${union.slug}-${union.id}`}
                                    className={`union-card ${
                                        expandedUnionId === union.id ? "is-expanded" : ""
                                    }`}
                                    tabIndex={0}
                                    role="button"
                                    aria-expanded={expandedUnionId === union.id}
                                    onClick={() => toggleUnionCard(union.id)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            toggleUnionCard(union.id);
                                        }
                                    }}
                                >
                                    <div className="union-card-hero union-card-profile-hero">
                                        <div
                                            className="union-profile-mark"
                                            style={{ backgroundColor: union.accentColor }}
                                            aria-hidden="true"
                                        >
                                            {union.logo ? (
                                                <img src={union.logo} alt="" />
                                            ) : (
                                                <span>{getInitials(union.name, union.acronym)}</span>
                                            )}
                                        </div>

                                        <div className="union-card-topline">
                                            <span>{sportLabel(union.sport)}</span>
                                            <span>{union.type}</span>
                                        </div>
                                    </div>

                                    <div className="union-card-main">
                                        <h2>{union.name}</h2>
                                        <p className="union-card-summary">{union.description}</p>

                                        <div className="union-card-reveal">
                                            <div className="union-meta-grid">
                                                <div>
                                                    <span>Members</span>
                                                    <strong>{union.members}</strong>
                                                </div>
                                                <div>
                                                    <span>Athletes</span>
                                                    <strong>{union.athletes}</strong>
                                                </div>
                                                <div>
                                                    <span>Founded</span>
                                                    <strong>{union.founded}</strong>
                                                </div>
                                            </div>
<div className="union-actions union-actions-public">
                                                <Link
                                                    to="/competitions"
                                                    onClick={(event) => event.stopPropagation()}
                                                >
                                                    View Competitions
                                                </Link>
                                                <Link
                                                    to="/clubs"
                                                    onClick={(event) => event.stopPropagation()}
                                                >
                                                    View Clubs
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {!isLoading && filteredUnions.length === 0 ? (
                            <div className="unions-empty">
                                <h2>No union workspaces found</h2>
                                <p>
                                    If the backend is connected, run the union workspace seed command
                                    against the Neon database.
                                </p>
                            </div>
                        ) : null}
                    </div>
                </section>

                <section className="unions-cta">
                    <div>
                        <span>Federation operations</span>
                        <h2>Run unions, competitions and community leagues from one portal.</h2>
                        <p>
                            League OS brings federation governance, player registration, officials,
                            fixtures, reporting and fan engagement into one workspace-based operating
                            system.
                        </p>
                    </div>
                    <Link to="/register">
                        Get Started
                        <ArrowRight size={17} strokeWidth={2.4} aria-hidden="true" />
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Unions;
