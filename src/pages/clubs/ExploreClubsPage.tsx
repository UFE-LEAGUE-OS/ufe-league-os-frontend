import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  getPublicClubs,
  type PublicClubApi,
} from '../../services/publicDashboardService';
import './ExploreClubsPage.css';

const sports = ['All Sports', 'Football', 'Rugby', 'Basketball'];
const PAGE_SIZE = 6;

const preferredOrder = [
  'kobs',
  'heathens-rfc',
  'black-pirates',
  'impis-rfc',
  'sc-villa',
  'vipers-sc',
  'kcca-fc',
  'city-oilers',
  'namuwongo-blazers',
];

type SportName = 'Rugby' | 'Football' | 'Basketball' | 'Other';

type PublicClubCard = {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  sport: SportName;
  league: string;
  location: string;
  founded: string;
  logo: string;
  featured: boolean;
  trophies: number;
  followers: string;
  ranking: number;
  matchesPlayed: number;
  winRate: string;
  description: string;
};

function normalizeSport(club: PublicClubApi): SportName {
  const rawSport = `${club.sport_display || club.sport || ''}`.toLowerCase();

  if (rawSport.includes('rugby')) return 'Rugby';
  if (rawSport.includes('football')) return 'Football';
  if (rawSport.includes('basketball')) return 'Basketball';

  return 'Other';
}

function leagueNameFromSport(sport: SportName) {
  if (sport === 'Football') return 'StarTimes Uganda Premier League';
  if (sport === 'Rugby') return 'Nile Special Rugby Premiership';
  if (sport === 'Basketball') return 'National Basketball League';

  return 'League OS';
}

function shortLeagueName(league: string) {
  if (league.includes('StarTimes')) return 'StarTimes Uganda Premier League';
  if (league.includes('Nile Special')) return 'Nile Special Rugby Premiership';
  if (league.includes('Basketball')) return 'National Basketball League';
  return league;
}

function shortSportLine(sport: string) {
  if (sport === 'Football') return 'Football Club';
  if (sport === 'Rugby') return 'Rugby Club';
  if (sport === 'Basketball') return 'Basketball Club';
  return `${sport} Club`;
}

function cityFromLocation(location: string) {
  return location.split(',')[0]?.trim() || 'Uganda';
}

function yearFromDate(value?: string) {
  if (!value) return 'N/A';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'N/A';

  return String(date.getFullYear());
}

function buildClubInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function mapBackendClubToCard(club: PublicClubApi, index: number): PublicClubCard {
  const sport = normalizeSport(club);
  const shortName = club.short_name || buildClubInitials(club.name) || club.name;
  const rankingIndex = preferredOrder.indexOf(club.slug);
  const ranking = rankingIndex === -1 ? index + preferredOrder.length + 1 : rankingIndex + 1;

  return {
    id: club.id,
    slug: club.slug,
    name: club.name,
    shortName,
    sport,
    league: leagueNameFromSport(sport),
    location: 'Uganda',
    founded: yearFromDate(club.created_at),
    logo: club.logo_url || club.logo || '',
    featured: index < 5,
    trophies: 0,
    followers: '0',
    ranking,
    matchesPlayed: 0,
    winRate: '0%',
    description: `${club.name} is a ${shortSportLine(sport).toLowerCase()} registered in the League OS backend catalogue.`,
  };
}

function ExploreClubsPage() {
  const [searchParams] = useSearchParams();
  const sportFromUrl = searchParams.get('sport');
  const initialSport =
    sportFromUrl === 'Rugby' || sportFromUrl === 'Football' || sportFromUrl === 'Basketball'
      ? sportFromUrl
      : 'All Sports';
  const [activeSport, setActiveSport] = useState(initialSport);
  const [selectedLeague, setSelectedLeague] = useState('All Leagues');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [sortBy, setSortBy] = useState('Popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [clubs, setClubs] = useState<PublicClubCard[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);
  const [clubError, setClubError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadClubs() {
      setIsLoadingClubs(true);
      setClubError('');

      try {
        const backendClubs = await getPublicClubs();

        if (!active) return;

        setClubs(
          backendClubs
            .map(mapBackendClubToCard)
            .filter((club) => club.sport !== 'Other')
            .sort((a, b) => a.ranking - b.ranking),
        );
      } catch {
        if (!active) return;

        setClubs([]);
        setClubError('Could not load clubs from the backend. Please confirm the public clubs API is available.');
      } finally {
        if (active) {
          setIsLoadingClubs(false);
        }
      }
    }

    void loadClubs();

    return () => {
      active = false;
    };
  }, []);

  const leagues = useMemo(() => {
    return ['All Leagues', ...Array.from(new Set(clubs.map((club) => club.league)))];
  }, [clubs]);

  const cities = useMemo(() => {
    return ['All Cities', ...Array.from(new Set(clubs.map((club) => cityFromLocation(club.location))))];
  }, [clubs]);

  const filteredClubs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = clubs.filter((club) => {
      const matchesSport = activeSport === 'All Sports' || club.sport === activeSport;
      const matchesLeague = selectedLeague === 'All Leagues' || club.league === selectedLeague;
      const matchesCity = selectedCity === 'All Cities' || cityFromLocation(club.location) === selectedCity;
      const matchesSearch =
        !query ||
        club.name.toLowerCase().includes(query) ||
        club.sport.toLowerCase().includes(query) ||
        club.league.toLowerCase().includes(query) ||
        club.location.toLowerCase().includes(query);

      return matchesSport && matchesLeague && matchesCity && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'Trophies') return b.trophies - a.trophies;
      if (sortBy === 'Followers') return Number.parseFloat(b.followers) - Number.parseFloat(a.followers);
      if (sortBy === 'Newest') return Number(b.founded) - Number(a.founded);
      return a.ranking - b.ranking;
    });
  }, [activeSport, clubs, searchQuery, selectedCity, selectedLeague, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredClubs.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const visibleClubs = filteredClubs.slice(startIndex, startIndex + PAGE_SIZE);
  const featuredClubs = clubs.slice(0, 5);
  const sportCount = new Set(clubs.map((club) => club.sport).filter((sport) => sport !== 'Other')).size;
  const leagueCount = new Set(clubs.map((club) => club.league)).size;

  function resetToFirstPage() {
    setCurrentPage(1);
  }

  function goToPage(pageNumber: number) {
    setCurrentPage(Math.min(Math.max(pageNumber, 1), totalPages));
  }

  return (
    <>
      <Navbar />

      <main className="clubs-public-page">
        <section className="clubs-public-hero">
          <div className="clubs-public-breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <strong>Clubs</strong>
          </div>

          <h1>Clubs</h1>

          <p>Explore Uganda&apos;s clubs across football, rugby and basketball.</p>

          <div className="clubs-public-stats">
            <span>
              <Users size={18} />
              {isLoadingClubs ? 'Loading Clubs' : `${clubs.length} Clubs`}
            </span>
            <span>
              <Trophy size={18} />
              {sportCount || 3} Sports
            </span>
            <span>
              <Trophy size={18} />
              {leagueCount || 3} Leagues
            </span>
            <span>
              <Users size={18} />
              Backend Data
            </span>
          </div>
        </section>

        <section className="clubs-public-content">
          <div className="clubs-public-topbar">
            <div className="clubs-public-tabs">
              {sports.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  className={activeSport === sport ? 'is-active' : ''}
                  onClick={() => {
                    setActiveSport(sport);
                    resetToFirstPage();
                  }}
                >
                  {sport}
                </button>
              ))}
            </div>

            <div className="clubs-public-controls">
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

              <label>
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Search clubs..."
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    resetToFirstPage();
                  }}
                />
              </label>

              <select
                value={selectedCity}
                onChange={(event) => {
                  setSelectedCity(event.target.value);
                  resetToFirstPage();
                }}
              >
                {cities.map((city) => (
                  <option key={city}>{city}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value);
                  resetToFirstPage();
                }}
              >
                <option value="Popular">Sort by: Popular</option>
                <option value="Trophies">Sort by: Trophies</option>
                <option value="Followers">Sort by: Followers</option>
                <option value="Newest">Sort by: Newest</option>
              </select>
            </div>
          </div>

          <div className="clubs-public-layout">
            <section className="clubs-public-main">
              <p className="clubs-public-count">
                Showing {visibleClubs.length} of {filteredClubs.length} clubs
              </p>

              {isLoadingClubs ? (
                <p className="clubs-public-count">Loading clubs from the backend...</p>
              ) : null}

              {!isLoadingClubs && clubError ? (
                <p className="clubs-public-count">{clubError}</p>
              ) : null}

              {!isLoadingClubs && !clubError && filteredClubs.length === 0 ? (
                <p className="clubs-public-count">No clubs matched your filters.</p>
              ) : null}

              <div className="clubs-public-grid">
                {visibleClubs.map((club) => (
                  <article key={club.slug} className="clubs-public-card">
                    {club.featured ? <span className="clubs-public-featured">Featured</span> : null}

                    <div className="clubs-public-logo">
                      {club.logo ? <img src={club.logo} alt={club.name} /> : <span>{club.shortName}</span>}
                    </div>

                    <div className="clubs-public-card-copy">
                      <h2>{club.name}</h2>
                      <p>{shortSportLine(club.sport)}</p>

                      <div className="clubs-public-meta">
                        <span>{shortLeagueName(club.league)}</span>
                        <span>
                          <MapPin size={14} />
                          {club.location}
                        </span>
                      </div>
                    </div>

                    <div className="clubs-public-card-stats">
                      <span>
                        <small>Added</small>
                        <strong>{club.founded}</strong>
                      </span>
                      <span>
                        <small>Matches</small>
                        <strong>{club.matchesPlayed}</strong>
                      </span>
                      <span>
                        <small>Followers</small>
                        <strong>{club.followers}</strong>
                      </span>
                    </div>

                    <div className="clubs-public-card-actions">
                      <Link to={`/clubs/${club.slug}`}>View Club</Link>
                      <Link to={`/memberships/${club.slug}`}>View Membership</Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="clubs-public-pagination">
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

            <aside className="clubs-public-sidebar">
              <section className="clubs-public-panel">
                <div className="clubs-public-panel-header">
                  <h2>
                    <Star size={20} />
                    Featured Clubs
                  </h2>
                  <Link to="/clubs">View All</Link>
                </div>

                <div className="clubs-public-featured-list">
                  {featuredClubs.map((club, index) => (
                    <article key={club.slug} className="clubs-public-featured-item">
                      <span>{index + 1}</span>
                      {club.logo ? <img src={club.logo} alt="" /> : <strong>{club.shortName}</strong>}
                      <div>
                        <h3>{club.name}</h3>
                        <p>{club.sport} Club</p>
                      </div>
                      <button type="button" data-auth-required data-auth-action="follow">Follow</button>
                    </article>
                  ))}
                </div>
              </section>

              <section className="clubs-public-support">
                <h2>Support Your Club</h2>
                <p>Join your club, get exclusive content, early access and more.</p>
                <Link to="/memberships">
                  Explore Memberships
                  <span>→</span>
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

export default ExploreClubsPage;
