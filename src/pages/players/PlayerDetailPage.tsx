import { Link, useParams } from 'react-router-dom';
import { CalendarDays, Dumbbell, Flag, Hand, Ruler, Star, Weight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { getClubBySlug, getPlayerBySlug, getPlayersByTeamSlug } from '../../data/publicBrowseCatalog';
import styles from '../publicBrowse/PublicBrowsePages.module.css';

function PlayerDetailPage() {
  const { playerSlug } = useParams();
  const player = getPlayerBySlug(playerSlug);
  const club = getClubBySlug(player?.clubSlug);
  const squadMates = getPlayersByTeamSlug(player?.teamSlug).filter((item) => item.slug !== player?.slug);

  if (!player) {
    return (
      <>
        <Navbar />
        <main className={styles.page}>
          <div className={styles.notFound}>
            <div>
              <h1>Player not found</h1>
              <Link to="/teams" className={styles.primaryButton}>Back to Teams</Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.breadcrumb}>
            <span>Home</span>
            <span>›</span>
            <span>Leagues</span>
            <span>›</span>
            <span>{club?.name ?? player.clubName}</span>
            <span>›</span>
            <strong>{player.name}</strong>
          </div>

          <section className={styles.playerHero}>
            <div className={styles.playerPortrait}>
              <strong className={styles.bigNumber}>{player.jerseyNumber}</strong>
              <div className={styles.portraitFrame}>
                <img src={player.image} alt={player.name} />
              </div>
            </div>

            <div>
              <h1 className={styles.title}>{player.name}</h1>
              <p className={styles.kicker}>{player.position} · Jersey #{player.jerseyNumber}</p>
              <div className={styles.metaRow}>
                <span><Flag size={16} /> {player.country}</span>
                <span><CalendarDays size={16} /> {player.age} Age</span>
                <span><Ruler size={16} /> {player.height}</span>
                <span><Weight size={16} /> {player.weight}</span>
                <span><Hand size={16} /> {player.dominantSide}</span>
              </div>
              <div className={styles.actions}>
                <Link to={`/clubs/${player.clubSlug}`} className={styles.secondaryButton}>{player.clubName}</Link>
                <Link to={`/teams/${player.teamSlug}/squad`} className={styles.primaryButton}>View Squad</Link>
              </div>
            </div>

            <div className={styles.actions}>
              <Link to="/profile" className={styles.secondaryButton}><Star size={18} /> Follow Player</Link>
            </div>
          </section>

          <nav className={styles.tabs}>
            <span className={styles.active}>Overview</span>
            <span>Stats</span>
            <span>Career</span>
            <span>Fixtures</span>
            <span>News</span>
          </nav>

          <section className={styles.layout}>
            <div className={styles.sideStack}>
              <article className={styles.panel}>
                <h2>2025/26 Season Stats</h2>
                <div className={styles.statGrid}>
                  <span className={styles.statBox}><strong>{player.apps}</strong><span>Appearances</span></span>
                  <span className={styles.statBox}><strong>{player.tries}</strong><span>Tries</span></span>
                  <span className={styles.statBox}><strong>{player.tackles}</strong><span>Tackles</span></span>
                  <span className={styles.statBox}><strong>{player.metres}</strong><span>Metres Carried</span></span>
                  <span className={styles.statBox}><strong>{player.assists}</strong><span>Try Assists</span></span>
                  <span className={styles.statBox}><strong>{player.cleanBreaks}</strong><span>Clean Breaks</span></span>
                  <span className={styles.statBox}><strong>{player.playerOfMatch}</strong><span>Player of Match</span></span>
                  <span className={styles.statBox}><strong>{player.rating}</strong><span>Avg Rating</span></span>
                </div>
              </article>

              <article className={styles.panel}>
                <h2>About {player.name}</h2>
                <p className={styles.subtitle}>{player.bio}</p>
                <div className={styles.actions}>
                  {player.tags.map((tag) => (
                    <span key={tag} className={styles.secondaryButton}>
                      <Dumbbell size={16} /> {tag}
                    </span>
                  ))}
                </div>
              </article>

              <article className={styles.panel}>
                <h2>Squad Mates</h2>
                <div className={styles.playerGrid}>
                  {squadMates.slice(0, 6).map((mate) => (
                    <Link key={mate.slug} to={`/players/${mate.slug}`} className={styles.playerCard}>
                      <div className={styles.playerThumb}>
                        <img src={mate.image} alt={mate.name} />
                      </div>
                      <strong className={styles.jerseyNumber}>{mate.jerseyNumber}</strong>
                      <h3>{mate.name}</h3>
                      <p>{mate.position}</p>
                      <span>{mate.country}</span>
                    </Link>
                  ))}
                </div>
              </article>
            </div>

            <aside className={styles.sideStack}>
              <article className={styles.sideCard}>
                <h2>Next Fixture</h2>
                <p className={styles.subtitle}>KCB Kobs vs Heathens RFC · Sat, 24 May 2025 · 4:00 PM EAT</p>
                <Link to="/fixtures" className={styles.primaryButton}>View Match Centre</Link>
              </article>

              <article className={styles.sideCard}>
                <h2>Recent Results</h2>
                <div className={styles.miniList}>
                  <span className={styles.miniItem}>vs Impis RFC <strong>28 - 17</strong></span>
                  <span className={styles.miniItem}>vs Namuwongo Blazers <strong>34 - 12</strong></span>
                  <span className={styles.miniItem}>vs SC Villa <strong>17 - 21</strong></span>
                </div>
              </article>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}

export default PlayerDetailPage;
