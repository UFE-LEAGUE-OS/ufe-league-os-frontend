import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompetitionsNavbar from '../components/CompetitionsNavbar';
import Footer from '../components/Footer';
import {
    getPublicClubs,
    getPublicCompetitions,
    getPublicFixtures,
    getPublicResults,
    getPublicStandings,
    type PublicClubApi,
    type PublicCompetitionApi,
    type PublicFixtureApi,
    type PublicStandingApi,
} from '../services/publicDashboardService';
import '../styles/pages/landing/Competitions.css';
import '../styles/pages/landing.css';

type SportFilter = 'ALL' | 'RUGBY' | 'FOOTBALL' | 'BASKETBALL' | 'OTHER';

type CompetitionSummary = {
    sport: SportFilter;
    type: string;
    clubsCount: number;
    fixtures: PublicFixtureApi[];
    results: PublicFixtureApi[];
    standings: PublicStandingApi[];
};

const sportTabs: Array<{ label: string; value: SportFilter }> = [
    { label: 'All', value: 'ALL' },
    { label: 'Rugby', value: 'RUGBY' },
    { label: 'Football', value: 'FOOTBALL' },
    { label: 'Basketball', value: 'BASKETBALL' },
    { label: 'Other', value: 'OTHER' },
];

function inferCompetitionSport(competition: PublicCompetitionApi): SportFilter {
    const text = `${competition.name} ${competition.league_name ?? ''}`.toUpperCase();

    if (text.includes('RUGBY')) return 'RUGBY';
    if (text.includes('FOOTBALL') || text.includes('SOCCER') || text.includes('PREMIER LEAGUE')) return 'FOOTBALL';
    if (text.includes('BASKETBALL')) return 'BASKETBALL';

    return 'OTHER';
}

function inferCompetitionType(competition: PublicCompetitionApi): string {
    const text = `${competition.name} ${competition.league_name ?? ''}`.toUpperCase();

    if (text.includes('CUP')) return 'Cup';
    if (text.includes('SEVENS') || text.includes('7S')) return 'Circuit';
    if (text.includes('TOURNAMENT')) return 'Tournament';
    if (text.includes('SCHOOL') || text.includes('BUDO') || text.includes('SMACK') || text.includes('NTARE')) return 'Community';
    if (text.includes('PLAYOFF')) return 'Playoffs';

    return 'League';
}

function formatDate(value?: string) {
    if (!value) return 'To be confirmed';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'To be confirmed';

    return new Intl.DateTimeFormat('en-UG', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function formatMatchDate(value?: string) {
    if (!value) return 'TBC';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'TBC';

    return new Intl.DateTimeFormat('en-UG', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function sportLabel(sport: SportFilter) {
    if (sport === 'ALL') return 'All Sports';
    if (sport === 'OTHER') return 'Other';
    return sport.charAt(0) + sport.slice(1).toLowerCase();
}

function getSportInitials(sport: SportFilter) {
    if (sport === 'RUGBY') return 'RU';
    if (sport === 'FOOTBALL') return 'FB';
    if (sport === 'BASKETBALL') return 'BB';
    return 'OS';
}

function Competitions() {
    const navigate = useNavigate();
    const [competitions, setCompetitions] = useState<PublicCompetitionApi[]>([]);
    const [clubs, setClubs] = useState<PublicClubApi[]>([]);
    const [fixtures, setFixtures] = useState<PublicFixtureApi[]>([]);
    const [results, setResults] = useState<PublicFixtureApi[]>([]);
    const [standingsByCompetition, setStandingsByCompetition] = useState<Record<number, PublicStandingApi[]>>({});
    const [activeSport, setActiveSport] = useState<SportFilter>('ALL');
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedCompetitionId, setExpandedCompetitionId] = useState<number | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadCompetitions() {
            try {
                setIsLoading(true);
                setError(null);

                const [competitionData, clubData, fixtureData, resultData] = await Promise.all([
                    getPublicCompetitions(),
                    getPublicClubs(),
                    getPublicFixtures(),
                    getPublicResults({ limit: 30 }),
                ]);

                const standingsEntries = await Promise.all(
                    competitionData.slice(0, 12).map(async (competition) => {
                        try {
                            const rows = await getPublicStandings(competition.id);
                            return [competition.id, rows] as const;
                        } catch {
                            return [competition.id, []] as const;
                        }
                    }),
                );

                if (!isMounted) return;

                setCompetitions(competitionData);
                setClubs(clubData);
                setFixtures(fixtureData);
                setResults(resultData);
                setStandingsByCompetition(Object.fromEntries(standingsEntries));
            } catch {
                if (isMounted) {
                    setError('We could not load competitions from the backend. Please try again.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadCompetitions();

        return () => {
            isMounted = false;
        };
    }, []);

    const summaries = useMemo(() => {
        return competitions.reduce<Record<number, CompetitionSummary>>((acc, competition) => {
            const sport = inferCompetitionSport(competition);
            const competitionFixtures = fixtures.filter((fixture) => fixture.competition === competition.id);
            const competitionResults = results.filter((result) => result.competition === competition.id);
            const sportClubs = clubs.filter((club) => (club.sport ?? '').toUpperCase() === sport);

            acc[competition.id] = {
                sport,
                type: inferCompetitionType(competition),
                clubsCount: sport === 'OTHER' ? clubs.length : sportClubs.length,
                fixtures: competitionFixtures,
                results: competitionResults,
                standings: standingsByCompetition[competition.id] ?? [],
            };

            return acc;
        }, {});
    }, [clubs, competitions, fixtures, results, standingsByCompetition]);

    const filteredCompetitions = useMemo(() => {
        const search = query.trim().toLowerCase();

        return competitions.filter((competition) => {
            const summary = summaries[competition.id];
            const sport = summary?.sport ?? inferCompetitionSport(competition);
            const matchesSport = activeSport === 'ALL' || activeSport === sport;
            const matchesSearch =
                !search ||
                competition.name.toLowerCase().includes(search) ||
                (competition.league_name ?? '').toLowerCase().includes(search) ||
                (competition.season ?? '').toLowerCase().includes(search) ||
                sportLabel(sport).toLowerCase().includes(search);

            return matchesSport && matchesSearch;
        });
    }, [activeSport, competitions, query, summaries]);

    const activeCount = competitions.filter((competition) => competition.is_active !== false).length;
    const totalFixtures = fixtures.length;
    const totalResults = results.length;

    function toggleCompetitionCard(competitionId: number) {
        setExpandedCompetitionId((currentId) => (currentId === competitionId ? null : competitionId));
    }

    return (
        <div className="competitions-page landing-page">
            <CompetitionsNavbar />

            <main className="competitions-shell">
                <section className="competitions-hero">
                    <div className="competitions-breadcrumb">
                        <button type="button" onClick={() => navigate('/')}>Home</button>
                        <span>/</span>
                        <span>Competitions</span>
                    </div>

                    <div className="competitions-hero-grid">
                        <div>
                            <h1>Competitions</h1>
                            <p className="competitions-intro">
                                Browse active league, cup, tournament and community competitions powered by the League OS backend.
                            </p>
                        </div>

                        <div className="competitions-hero-panel" aria-label="Competition summary">
                            <div>
                                <strong>{activeCount}</strong>
                                <span>Active</span>
                            </div>
                            <div>
                                <strong>{totalFixtures}</strong>
                                <span>Fixtures</span>
                            </div>
                            <div>
                                <strong>{totalResults}</strong>
                                <span>Results</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="competitions-content">
                    <div className="competitions-toolbar">
                        <div className="competitions-tabs" aria-label="Filter competitions by sport">
                            {sportTabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    className={activeSport === tab.value ? 'active' : ''}
                                    onClick={() => setActiveSport(tab.value)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <label className="competitions-search">
                            <span>Search</span>
                            <input
                                type="search"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by competition, league or season..."
                            />
                        </label>
                    </div>

                    {error && <div className="competitions-state error">{error}</div>}
                    {isLoading && <div className="competitions-state">Loading backend competitions...</div>}

                    {!isLoading && !error && (
                        <div className="competitions-list">
                            <p className="competitions-count">
                                Showing {filteredCompetitions.length} of {competitions.length} competitions
                            </p>

                            {filteredCompetitions.length === 0 ? (
                                <div className="competitions-empty">
                                    <h2>No competitions found</h2>
                                    <p>Try another sport filter or search term.</p>
                                </div>
                            ) : (
                                <div className="competitions-card-grid">
                                    {filteredCompetitions.map((competition) => {
                                        const summary = summaries[competition.id];
                                        const sport = summary?.sport ?? inferCompetitionSport(competition);
                                        const nextMatch = summary?.fixtures[0];
                                        const latestResult = summary?.results[0];
                                        const leader = summary?.standings[0];

                                        return (
                                            <article
                                                key={competition.id}
                                                className={`competition-card ${expandedCompetitionId === competition.id ? 'is-expanded' : ''}`}
                                                role="button"
                                                tabIndex={0}
                                                aria-expanded={expandedCompetitionId === competition.id}
                                                onClick={() => toggleCompetitionCard(competition.id)}
                                                onKeyDown={(event) => {
                                                    if (event.key === 'Enter' || event.key === ' ') {
                                                        event.preventDefault();
                                                        toggleCompetitionCard(competition.id);
                                                    }
                                                }}
                                            >
                                                <div className="competition-card-hero">
                                                    <div className="competition-mark" aria-hidden="true">
                                                        {getSportInitials(sport)}
                                                    </div>

                                                    <div className="competition-card-topline">
                                                        <span>{sportLabel(sport)}</span>
                                                        <span>{summary?.type ?? 'Competition'}</span>
                                                        {competition.season && <span>{competition.season}</span>}
                                                    </div>
                                                </div>

                                                <div className="competition-card-main">

                                                    <h2>{competition.name}</h2>
                                                    <p className="competition-league">
                                                        {competition.league_name ?? 'Independent competition'}
                                                    </p>

                                                    <div className="competition-reveal">
                                                        <div className="competition-meta-grid">
                                                            <div>
                                                                <span>Clubs</span>
                                                                <strong>{summary?.clubsCount ?? 0}</strong>
                                                            </div>
                                                            <div>
                                                                <span>Upcoming</span>
                                                                <strong>{summary?.fixtures.length ?? 0}</strong>
                                                            </div>
                                                            <div>
                                                                <span>Results</span>
                                                                <strong>{summary?.results.length ?? 0}</strong>
                                                            </div>
                                                        </div>

                                                        <div className="competition-snapshot">
                                                        <div>
                                                            <span>Next match</span>
                                                            <strong>
                                                                {nextMatch
                                                                    ? `${nextMatch.home_club_name} vs ${nextMatch.away_club_name}`
                                                                    : 'Fixture pending'}
                                                            </strong>
                                                            <small>{nextMatch ? formatMatchDate(nextMatch.match_date) : 'Awaiting schedule'}</small>
                                                        </div>
                                                        <div>
                                                            <span>Table leader</span>
                                                            <strong>{leader?.club_name ?? 'Standings pending'}</strong>
                                                            <small>{leader ? `${leader.points} pts` : 'No table yet'}</small>
                                                        </div>
                                                        <div>
                                                            <span>Latest result</span>
                                                            <strong>
                                                                {latestResult
                                                                    ? `${latestResult.home_club_name} ${latestResult.home_score ?? '-'} - ${latestResult.away_score ?? '-'} ${latestResult.away_club_name}`
                                                                    : 'No result yet'}
                                                            </strong>
                                                            <small>{latestResult ? formatDate(latestResult.match_date) : 'Awaiting full time'}</small>
                                                        </div>
                                                    </div>

                                                        <div className="competition-actions">
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    navigate(`/fixtures?competition=${competition.id}`);
                                                                }}
                                                            >
                                                                Fixtures
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    navigate(`/results?competition=${competition.id}`);
                                                                }}
                                                            >
                                                                Results
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    navigate(`/standings?competition=${competition.id}`);
                                                                }}
                                                            >
                                                                Standings
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    navigate('/tickets');
                                                                }}
                                                            >
                                                                Tickets
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default Competitions;
