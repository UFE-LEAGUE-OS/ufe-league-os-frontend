import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "../components/ui/button.js";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import resultsImg from "../assets/results.png";
import standingsImg from "../assets/standings.png";
import heroBg from "../assets/stadium-bg.svg";
import {
    getPublicCompetitions,
    getPublicResults,
    getPublicStandings,
    type PublicCompetitionApi,
    type PublicFixtureApi,
    type PublicStandingApi,
} from "../services/publicDashboardService";

const competitionColors = ["#F97316", "#10B981", "#3B82F6", "#A855F7", "#EC4899"];

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getMatchDateKey(value: string) {
    return new Date(value).toISOString().slice(0, 10);
}

function groupResultsByDate(items: PublicFixtureApi[]) {
    return items.reduce<Record<string, PublicFixtureApi[]>>((groups, item) => {
        const dateKey = getMatchDateKey(item.match_date);
        groups[dateKey] = groups[dateKey] ?? [];
        groups[dateKey].push(item);
        return groups;
    }, {});
}

function getCompetitionColor(index: number) {
    return competitionColors[index % competitionColors.length];
}

function getWinner(match: PublicFixtureApi) {
    if (typeof match.home_score !== "number" || typeof match.away_score !== "number") {
        return "draw";
    }

    if (match.home_score > match.away_score) {
        return "home";
    }

    if (match.away_score > match.home_score) {
        return "away";
    }

    return "draw";
}

function getScoreText(match: PublicFixtureApi) {
    const home = typeof match.home_score === "number" ? match.home_score : "—";
    const away = typeof match.away_score === "number" ? match.away_score : "—";

    return `${home} - ${away}`;
}

function normalizeStandingForm(form: PublicStandingApi["form"] | string | undefined) {
    if (Array.isArray(form)) {
        return form;
    }

    if (typeof form === "string") {
        return form.split("").filter(Boolean);
    }

    return [];
}

const styles = `
  @media (max-width: 768px) {
    .results-main { padding: 16px !important; }
    .results-hero { padding: 24px 16px !important; }
    .results-hero h1 { font-size: 1.6rem !important; }
    .results-hero p { font-size: 0.85rem !important; }
    .results-row { grid-template-columns: 1fr 70px 1fr !important; font-size: 0.75rem !important; }
    .results-row .comp-col, .results-row .time-col { display: none !important; }
    .results-standings-grid { grid-template-columns: 1fr !important; }
    .results-date-header { font-size: 0.75rem !important; }
    .results-score { font-size: 0.85rem !important; padding: 2px 8px !important; }
  }
  @media (max-width: 480px) {
    .results-main { padding: 12px !important; }
    .results-hero { padding: 16px !important; }
    .results-hero h1 { font-size: 1.3rem !important; }
    .results-hero p { font-size: 0.75rem !important; }
    .results-row { grid-template-columns: 1fr 55px 1fr !important; font-size: 0.7rem !important; }
    .results-row .comp-col, .results-row .time-col { display: none !important; }
    .results-standings-grid { grid-template-columns: 1fr !important; }
    .results-filter-btn { font-size: 0.7rem !important; padding: 6px 14px !important; }
    .results-standings-table { font-size: 0.75rem !important; }
    .results-standings-table .d-col { display: none !important; }
  }
`;

function Results() {
    const navigate = useNavigate();
    const [results, setResults] = useState<PublicFixtureApi[]>([]);
    const [competitions, setCompetitions] = useState<PublicCompetitionApi[]>([]);
    const [standingsByCompetition, setStandingsByCompetition] = useState<
        Record<number, PublicStandingApi[]>
    >({});
    const [selectedCompetitionId, setSelectedCompetitionId] = useState<number | "all">("all");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        async function loadResultsPageData() {
            setIsLoading(true);
            setError("");

            try {
                const [resultsData, competitionsData] = await Promise.all([
                    getPublicResults({ limit: 50 }),
                    getPublicCompetitions(),
                ]);

                const activeCompetitions = competitionsData.filter((competition) => competition.is_active !== false);
                const standingsEntries = await Promise.all(
                    activeCompetitions.map(async (competition) => {
                        const rows = await getPublicStandings(competition.id);
                        return [competition.id, rows] as const;
                    }),
                );

                if (!ignore) {
                    setResults(resultsData);
                    setCompetitions(activeCompetitions);
                    setStandingsByCompetition(Object.fromEntries(standingsEntries));
                }
            } catch (loadError) {
                if (!ignore) {
                    console.error("Failed to load public results page data", loadError);
                    setError("We could not load the latest results right now. Please try again shortly.");
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        void loadResultsPageData();

        return () => {
            ignore = true;
        };
    }, []);

    const competitionColorMap = useMemo(() => {
        return competitions.reduce<Record<number, string>>((colors, competition, index) => {
            colors[competition.id] = getCompetitionColor(index);
            return colors;
        }, {});
    }, [competitions]);

    const filteredResults = useMemo(() => {
        if (selectedCompetitionId === "all") {
            return results;
        }

        return results.filter((match) => match.competition === selectedCompetitionId);
    }, [results, selectedCompetitionId]);

    const groupedResults = useMemo(() => groupResultsByDate(filteredResults), [filteredResults]);

    const dates = useMemo(
        () => Object.keys(groupedResults).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
        [groupedResults],
    );

    const visibleCompetitions = useMemo(() => {
        if (selectedCompetitionId === "all") {
            return competitions;
        }

        return competitions.filter((competition) => competition.id === selectedCompetitionId);
    }, [competitions, selectedCompetitionId]);

    return (
        <div style={{ background: "#00030D", minHeight: "100vh", fontFamily: "var(--font-body)", color: "#fff" }}>
            <style>{styles}</style>
            <Navbar />

            {/* Hero Banner */}
            <div className="results-hero" style={{
                position: "relative",
                padding: "40px 56px",
                background: `linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(0,3,13,0.9) 100%), url(${heroBg}) center/cover`,
                overflow: "hidden",
            }}>
                <div style={{ position: "relative", zIndex: 1, maxWidth: 1400, margin: "0 auto" }}>
                    <Button variant="outline" className="mb-4" onClick={() => navigate("/")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Button>
                    <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "2.8rem", fontStyle: "italic", fontWeight: 800, marginBottom: 8 }}>
                        RESULTS
                    </h1>
                    <p style={{ color: "#9CA3AF", fontSize: "0.95rem", maxWidth: 600 }}>
                        Latest scores and standings from the League OS backend database.
                    </p>
                </div>
                <img src={resultsImg} alt="" style={{
                    position: "absolute", right: 0, top: 0, height: "100%",
                    opacity: 0.12, objectFit: "cover", width: "40%",
                }} />
            </div>

            <main className="results-main" style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 56px" }}>
                {/* League Filter Tabs */}
                <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
                    {[{ id: "all" as const, name: "All Leagues" }, ...competitions.map((competition) => ({ id: competition.id, name: competition.name }))].map((competition) => {
                        const isActive = selectedCompetitionId === competition.id;

                        return (
                            <button key={competition.id} className="results-filter-btn"
                                type="button"
                                onClick={() => setSelectedCompetitionId(competition.id)}
                                style={{
                                    padding: "8px 20px", borderRadius: 20,
                                    border: "1px solid #1F2937",
                                    background: isActive ? "#8135FA" : "transparent",
                                    color: isActive ? "#fff" : "#9CA3AF",
                                    fontFamily: "var(--font-heading)", fontWeight: 600,
                                    fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s",
                                }}
                                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = "#8135FA"; e.currentTarget.style.color = "#fff"; }}}
                                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = "#1F2937"; e.currentTarget.style.color = "#9CA3AF"; }}}
                            >
                                {competition.name}
                            </button>
                        );
                    })}
                </div>

                {isLoading && (
                    <div style={{ background: "#12131F", borderRadius: 12, padding: 24, border: "1px solid #1F2937", color: "#9CA3AF" }}>
                        Loading backend results…
                    </div>
                )}

                {!isLoading && error && (
                    <div style={{ background: "#12131F", borderRadius: 12, padding: 24, border: "1px solid rgba(248, 113, 113, 0.35)", color: "#FCA5A5" }}>
                        {error}
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        {/* Latest Results by Date */}
                        <section style={{ marginBottom: 48 }}>
                            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.15rem", marginBottom: 20 }}>LATEST RESULTS</h2>
                            {dates.length === 0 ? (
                                <div style={{ background: "#12131F", borderRadius: 12, padding: 24, border: "1px solid #1F2937", color: "#9CA3AF" }}>
                                    No completed backend results are available for this selection yet.
                                </div>
                            ) : (
                                dates.map(date => (
                                    <div key={date} style={{ marginBottom: 16 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                            <span className="results-date-header" style={{ fontFamily: "var(--font-heading)", fontSize: "0.85rem", fontWeight: 600, color: "#9CA3AF" }}>
                                                {formatDate(date)}
                                            </span>
                                            <div style={{ flex: 1, height: 1, background: "#1F2937" }} />
                                        </div>
                                        <div style={{ background: "#12131F", borderRadius: 8, overflow: "hidden" }}>
                                            {groupedResults[date].map((match) => {
                                                const winner = getWinner(match);
                                                const competitionColor = competitionColorMap[match.competition] ?? "#F97316";
                                                return (
                                                    <div key={match.id} className="results-row" style={{ display: "grid", gridTemplateColumns: "140px 1fr 90px 1fr 120px", gap: 12, alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #1F2937", fontSize: "0.85rem", transition: "background 0.2s" }}
                                                        onMouseEnter={e => (e.currentTarget.style.background = "#1a1f3a")}
                                                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                                                        <span className="comp-col" style={{ fontSize: "0.7rem", color: "#9CA3AF", fontFamily: "var(--font-heading)", fontWeight: 600 }}>
                                                            <span style={{ color: competitionColor, marginRight: 4 }}>●</span> {match.competition_name}
                                                        </span>
                                                        <span style={{ fontWeight: winner === "home" ? 800 : 400, textAlign: "right", color: winner === "home" ? "#fff" : "#9CA3AF" }}>{match.home_club_name}</span>
                                                        <span className="results-score" style={{ fontWeight: 800, color: "#F97316", textAlign: "center", fontSize: "1rem", background: "rgba(249, 115, 22, 0.08)", borderRadius: 6, padding: "4px 12px", justifySelf: "center" }}>
                                                            {getScoreText(match)}
                                                        </span>
                                                        <span style={{ fontWeight: winner === "away" ? 800 : 400, color: winner === "away" ? "#fff" : "#9CA3AF" }}>{match.away_club_name}</span>
                                                        <span className="time-col" style={{ color: "#6B7280", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 6 }}>
                                                            <span>{match.venue}</span>
                                                            <span style={{ fontSize: "0.7rem", color: "#4B5563" }}>{formatTime(match.match_date)}</span>
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </section>

                        {/* League Standings */}
                        <section>
                            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.15rem", margin: 0 }}>LEAGUE STANDINGS</h2>
                                <img src={standingsImg} alt="" style={{ height: 24, opacity: 0.4 }} />
                            </div>
                            <div className="results-standings-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                {visibleCompetitions.map((competition) => {
                                    const rows = standingsByCompetition[competition.id] ?? [];
                                    const competitionColor = competitionColorMap[competition.id] ?? "#F97316";

                                    return (
                                        <div key={competition.id} style={{ background: "#12131F", borderRadius: 8, padding: 16, border: "1px solid #1F2937" }}>
                                            <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "0.9rem", fontWeight: 600, marginBottom: 12, color: competitionColor, display: "flex", alignItems: "center", gap: 6 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: "50%", background: competitionColor }} />
                                                {competition.name}
                                            </h3>
                                            <div className="results-standings-table" style={{ display: "grid", gridTemplateColumns: "28px 1fr 28px 28px 28px 36px", gap: 8, padding: "8px 0", borderBottom: "1px solid #1F2937", color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}>
                                                <span>#</span><span>Team</span><span>P</span><span>W</span><span className="d-col">D</span><span style={{ textAlign: "right" }}>Pts</span>
                                            </div>
                                            {rows.length === 0 ? (
                                                <div style={{ padding: "14px 0", color: "#9CA3AF", fontSize: "0.82rem" }}>
                                                    No backend standings are available for this competition yet.
                                                </div>
                                            ) : (
                                                rows.map((row) => (
                                                    <div key={row.id} className="results-standings-table" style={{ display: "grid", gridTemplateColumns: "28px 1fr 28px 28px 28px 36px", gap: 8, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1F2937", fontSize: "0.82rem" }}>
                                                        <span style={{
                                                            color: row.position <= 2 ? competitionColor : "#9CA3AF", fontWeight: 700,
                                                            width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                                                            borderRadius: 4, background: row.position <= 2 ? `${competitionColor}20` : "transparent",
                                                        }}>{row.position}</span>
                                                        <span style={{ fontWeight: 600 }}>{row.club_name}</span>
                                                        <span style={{ color: "#9CA3AF" }}>{row.played}</span>
                                                        <span style={{ color: "#9CA3AF" }}>{row.won}</span>
                                                        <span className="d-col" style={{ color: "#9CA3AF" }}>{row.drawn}</span>
                                                        <span style={{ fontWeight: 800, textAlign: "right", color: "#fff", fontSize: "0.9rem" }}>{row.points}</span>
                                                        {normalizeStandingForm(row.form).length > 0 && (
                                                            <span style={{ gridColumn: "2 / -1", color: "#6B7280", fontSize: "0.7rem" }}>
                                                                Form: {normalizeStandingForm(row.form).join(" ")}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Results;
