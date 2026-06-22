import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  Trophy,
  Users,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { publicClubs, publicTeams } from '../../data/publicBrowseCatalog';
import './TeamsPage.css';

type TeamCard = {
  slug: string;
  name: string;
  clubName: string;
  clubSlug: string;
  sport: string;
  league: string;
  squadSize: number;
  image: string;
  logo: string;
  form: string[];
  ranking: number;
};

const PAGE_SIZE = 7;
const sports = ['All Sports', 'Football', 'Rugby', 'Basketball'];

function makeExtraTeams(): TeamCard[] {
  const labels = ['Academy Team', 'Development Squad', 'U21 Team', 'Women’s Team', 'Reserve Team'];

  return publicClubs.flatMap((club, clubIndex) =>
    labels.slice(0, club.sport === 'Basketball' ? 2 : 3).map((label, labelIndex) => ({
      slug: `${club.slug}-${label.toLowerCase().replaceAll(' ', '-').replace('’', '')}`,
      name: `${club.name} ${label}`,
      clubName: club.name,
      clubSlug: club.slug,
      sport: club.sport,
      league: club.league,
      squadSize: club.sport === 'Rugby' ? 28 - labelIndex : club.sport === 'Football' ? 26 - labelIndex : 15 - labelIndex,
      image: club.logo,
      logo: club.logo,
      form: labelIndex % 2 === 0 ? ['W', 'W', 'L', 'W', 'W'] : ['W', 'L', 'W', 'D', 'W'],
      ranking: clubIndex + labelIndex + 8,
    })),
  );
}

function normalizeTeams(): TeamCard[] {
  const existingTeams: TeamCard[] = publicTeams.map((team, index) => {
    const club = publicClubs.find((item) => item.slug === team.clubSlug);

    return {
      slug: team.slug,
      name: team.name,
      clubName: team.clubName,
      clubSlug: team.clubSlug,
      sport: team.sport,
      league: team.league,
      squadSize: team.squadSize,
      image: team.image,
      logo: club?.logo ?? team.image,
      form: team.form,
      ranking: index + 1,
    };
  });

  const generatedTeams = makeExtraTeams();
  const seen = new Set(existingTeams.map((team) => team.slug));

  return [
    ...existingTeams,
    ...generatedTeams.filter((team) => !seen.has(team.slug)),
  ];
}

function TeamsPage() {
  const [activeSport, setActiveSport] = useState('All Sports');
  const [selectedLeague, setSelectedLeague] = useState('All Leagues');
  const [selectedClub, setSelectedClub] = useState('All Clubs');
  const [sortBy, setSortBy] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const teams = useMemo(() => normalizeTeams(), []);

  const leagues = useMemo(() => {
    return ['All Leagues', ...Array.from(new Set(teams.map((team) => team.league)))];
  }, [teams]);

  const clubs = useMemo(() => {
    return ['All Clubs', ...Array.from(new Set(teams.map((team) => team.clubName)))];
  }, [teams]);

  const filteredTeams = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = teams.filter((team) => {
      const matchesSport = activeSport === 'All Sports' || team.sport === activeSport;
      const matchesLeague = selectedLeague === 'All Leagues' || team.league === selectedLeague;
      const matchesClub = selectedClub === 'All Clubs' || team.clubName === selectedClub;
      const matchesSearch =
        !query ||
        team.name.toLowerCase().includes(query) ||
        team.clubName.toLowerCase().includes(query) ||
        team.league.toLowerCase().includes(query) ||
        team.sport.toLowerCase().includes(query);

      return matchesSport && matchesLeague && matchesClub && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'Squad Size') return b.squadSize - a.squadSize;
      if (sortBy === 'Newest') return b.ranking - a.ranking;
      return a.ranking - b.ranking;
    });
  }, [activeSport, searchQuery, selectedClub, selectedLeague, sortBy, teams]);

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const visibleTeams = filteredTeams.slice(startIndex, startIndex + PAGE_SIZE);
  const featuredTeams = teams.slice(0, 5);

  function resetToFirstPage() {
    setCurrentPage(1);
  }

  function goToPage(pageNumber: number) {
    setCurrentPage(Math.min(Math.max(pageNumber, 1), totalPages));
  }

  return (
    <>
      <Navbar />

      <main className="teams-public-page">
        <section className="teams-public-hero">
          <div className="teams-public-breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <strong>Teams</strong>
          </div>

          <h1>Teams</h1>

          <p>Browse teams across Uganda&apos;s clubs and competitions.</p>

          <div className="teams-public-stats">
            <span>
              <Users size={18} />
              120+ Teams
            </span>
            <span>
              <Trophy size={18} />
              7 Sports
            </span>
            <span>
              <Shield size={18} />
              10+ Leagues
            </span>
            <span>
              <Users size={18} />
              50+ Clubs
            </span>
          </div>
        </section>

        <section className="teams-public-content">
          <div className="teams-public-toolbar">
            <select
              value={activeSport}
              onChange={(event) => {
                setActiveSport(event.target.value);
                resetToFirstPage();
              }}
            >
              {sports.map((sport) => (
                <option key={sport}>{sport}</option>
              ))}
            </select>

            <select
              value={selectedLeague}
              onChange={(event) => {
                setSelectedLeague(event.target.value);
                resetToFirstPage();
              }}
            >
              {leagues.map((league) => (
                <option key={league}>{league}</option>
              ))}
            </select>

            <select
              value={selectedClub}
              onChange={(event) => {
                setSelectedClub(event.target.value);
                resetToFirstPage();
              }}
            >
              {clubs.map((club) => (
                <option key={club}>{club}</option>
              ))}
            </select>

            <label>
              <Search size={18} />
              <input
                type="search"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  resetToFirstPage();
                }}
              />
            </label>

            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value);
                resetToFirstPage();
              }}
            >
              <option>Popular</option>
              <option>Squad Size</option>
              <option>Newest</option>
            </select>
          </div>

          <div className="teams-public-layout">
            <section className="teams-public-main">
              <p className="teams-public-count">
                Showing {visibleTeams.length} of {filteredTeams.length} teams
              </p>

              <div className="teams-public-grid">
                {visibleTeams.map((team) => (
                  <article key={team.slug} className="teams-public-card">
                    <div className="teams-public-image">
                      <img src={team.image} alt={team.name} />
                      <span>{team.sport}</span>
                    </div>

                    <div className="teams-public-logo">
                      <img src={team.logo} alt="" />
                    </div>

                    <div className="teams-public-card-body">
                      <h2>{team.name}</h2>
                      <p>{team.clubName}</p>

                      <div className="teams-public-card-meta">
                        <span>{team.league}</span>
                        <span>
                          Squad Size
                          <strong>{team.squadSize}</strong>
                        </span>
                      </div>

                      <div className="teams-public-form">
                        <small>Form</small>
                        <div>
                          {team.form.map((item, index) => (
                            <span
                              key={`${team.slug}-${item}-${index}`}
                              className={
                                item === 'W'
                                  ? 'teams-public-win'
                                  : item === 'L'
                                    ? 'teams-public-loss'
                                    : 'teams-public-draw'
                              }
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="teams-public-actions">
                        <Link to={`/clubs/${team.clubSlug}`}>View Team</Link>
                        <Link to={`/teams/${team.slug}/squad`}>View Squad</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="teams-public-pagination">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={safeCurrentPage === 1}
                  onClick={() => goToPage(safeCurrentPage - 1)}
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    className={safeCurrentPage === pageNumber ? 'is-active' : ''}
                    onClick={() => goToPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  aria-label="Next page"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => goToPage(safeCurrentPage + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </section>

            <aside className="teams-public-sidebar">
              <section className="teams-public-panel">
                <div className="teams-public-panel-header">
                  <h2>Featured Teams</h2>
                  <Link to="/teams">
                    View All Teams <ArrowRight size={15} />
                  </Link>
                </div>

                <div className="teams-public-featured-list">
                  {featuredTeams.map((team, index) => (
                    <article key={team.slug}>
                      <span>{index + 1}</span>
                      <img src={team.logo} alt="" />
                      <div>
                        <h3>{team.name}</h3>
                        <p>{team.sport} • {team.league}</p>
                      </div>
                      <button type="button" data-auth-required data-auth-action="follow">Follow</button>
                    </article>
                  ))}
                </div>
              </section>

              <section className="teams-public-support">
                <h2>Support Your Team</h2>
                <p>Follow your favorite teams for updates, fixtures, results and more.</p>
                <Link to="/memberships">
                  Explore Memberships
                  <ArrowRight size={16} />
                </Link>
              </section>
            </aside>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}

export default TeamsPage;