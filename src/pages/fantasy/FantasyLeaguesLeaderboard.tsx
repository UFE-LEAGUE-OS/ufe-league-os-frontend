import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Lock, User, Globe, Plus, DollarSign, ClipboardList, PartyPopper } from 'lucide-react';
import { GiRugbyConversion, GiSoccerBall } from 'react-icons/gi';
import { MdSportsBasketball } from 'react-icons/md';
import styles from './FantasyLeaguesLeaderboard.module.css';
import { fetchMyLeagues, fetchPublicLeagues, joinLeague } from '../../services/fantasyService';
import type { League, PublicLeague } from '../../services/fantasyService';

type Tab = 'my' | 'public' | 'private' | 'create';

export default function FantasyLeaguesLeaderboard() {
  const navigate = useNavigate();
  const [tab, setTab]         = useState<Tab>('my');
  const [joinCode, setJoinCode] = useState('');
  const [joined, setJoined]   = useState<string | null>(null);
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [publicLeagues, setPublicLeagues] = useState<PublicLeague[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeagues = async () => {
      try {
        setLoading(true);
        const [myRes, publicRes] = await Promise.all([
          fetchMyLeagues(),
          fetchPublicLeagues(),
        ]);
        setMyLeagues(myRes.data);
        setPublicLeagues(publicRes.data);
      } catch (err) {
        setError('Failed to load leagues');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLeagues();
  }, []);

  const handleJoin = async () => {
    if (joinCode.trim().length >= 4) {
      try {
        await joinLeague(joinCode.trim().toUpperCase());
        setJoined(joinCode.trim().toUpperCase());
        setJoinCode('');
      } catch (err) {
        console.error('Failed to join league:', err);
      }
    }
  };

  const rankColor = (rank: number | null) => {
    if (!rank) return '#9ca3af';
    if (rank === 1) return '#facc15';
    if (rank <= 3)  return '#22c55e';
    if (rank <= 5)  return '#8135FA';
    return '#9ca3af';
  };

  const rankIcon = (rank: number | null) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank && rank > 3) return `↑`;
    return '—';
  };

  const SportIcon = ({ sport }: { sport: string }) => {
    if (sport === 'Rugby') return <GiRugbyConversion size={16} />;
    if (sport === 'Football') return <GiSoccerBall size={16} />;
    return <MdSportsBasketball size={16} />;
  };

  if (loading) {
    return <div className={styles.page}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.page}>Error: {error}</div>;
  }

  return (
    <div className={styles.page}>

      {/* ── LEFT PANEL ── */}
      <div className={styles.left}>

        {/* Page header */}
        <div className={styles.pageHeader}>
          <h1>FANTASY LEAGUES & <span className={styles.accent}>LEADERBOARDS</span></h1>
          <p>Compete with friends. Climb the rankings. Win epic rewards.</p>
        </div>

        {/* Stats row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div>
              <div className={styles.statValue}>{myLeagues.length}</div>
              <div className={styles.statLabel}>Your Leagues</div>
              <div className={styles.statSub}>You're competing</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div>
              <div className={styles.statValue}>{myLeagues.reduce((sum, l) => sum + l.members, 0).toLocaleString()}</div>
              <div className={styles.statLabel}>Total Members</div>
              <div className={styles.statSub}>Across your leagues</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏆</div>
            <div>
              <div className={styles.statValue}>Top 12%</div>
              <div className={styles.statLabel}>Your Global Rank</div>
              <div className={styles.statSub}>Keep climbing!</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎁</div>
            <div>
              <div className={styles.statValue}>UGX 2.5M</div>
              <div className={styles.statLabel}>Total Prizes Won</div>
              <div className={styles.statSub}>This season</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab}${tab === 'my'      ? ` ${styles.tabActive}` : ''}`} onClick={() => setTab('my')}>
            <User size={16} /> My Leagues
          </button>
          <button className={`${styles.tab}${tab === 'public'  ? ` ${styles.tabActive}` : ''}`} onClick={() => setTab('public')}>
            <Globe size={16} /> Public Leagues
          </button>
          <button className={`${styles.tab}${tab === 'private' ? ` ${styles.tabActive}` : ''}`} onClick={() => setTab('private')}>
            <Lock size={16} /> Join Private
          </button>
          <button className={`${styles.tab}${tab === 'create'  ? ` ${styles.tabActive}` : ''}`} onClick={() => setTab('create')}>
            <Plus size={16} /> Create League
          </button>
        </div>

        {/* ── MY LEAGUES ── */}
        {tab === 'my' && (
          <div className={styles.panel}>
            <div className={styles.panelHeaderRow}>
              <h2>Your Leagues <span className={styles.leagueCount}>({myLeagues.length})</span></h2>
            </div>

            {/* Table head */}
            <div className={styles.leagueTableHead}>
              <span>LEAGUE</span>
              <span>MEMBERS</span>
              <span>YOUR RANK</span>
              <span>POINTS</span>
              <span>LAST UPDATED</span>
              <span>ACTION</span>
            </div>

            {/* League rows */}
            {myLeagues.map(l => (
              <div key={l.id} className={styles.leagueRow}>
                <div className={styles.leagueInfo}>
                  <div className={styles.leagueBadge}>
                    {l.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.leagueName}>
                      {l.name}
                      {l.isOwn && <span className={styles.ownTag}>Your League</span>}
                    </div>
                    <div className={styles.leagueMeta}>{l.type} · {l.members} Members</div>
                  </div>
                </div>

                 <div className={styles.membersCell}>
                   <span><Users size={14} /> {l.members} / {l.maxMembers}</span>
                 </div>

                <div className={styles.rankCell}>
                  <span className={styles.rankIcon}>{rankIcon(l.rank)}</span>
                  <div>
                    <div className={styles.rankNum} style={{ color: rankColor(l.rank) }}>
                      {l.rank ? `${l.rank}${['st','nd','rd'][l.rank - 1] ?? 'th'}` : '—'}
                    </div>
                    <div className={styles.rankSub}>{l.rankLabel}</div>
                  </div>
                </div>

                <div className={styles.pointsCell}>
                  <div className={styles.pointsNum}>{l.points.toLocaleString()}</div>
                  <div className={styles.pointsSub}>Pts</div>
                </div>

                <div className={styles.updatedCell}>
                  <div>{l.lastUpdated}</div>
                  <div className={`${styles.liveIndicator}${l.live ? '' : ` ${styles.offline}`}`}>
                    ● {l.live ? 'Live' : 'Offline'}
                  </div>
                </div>

                <div className={styles.actionCell}>
                  {l.rank ? (
                    <button className={styles.viewBtn}>View</button>
                  ) : (
                    <button className={styles.joinAnotherBtn} onClick={() => setTab('public')}>
                      Join Another League
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className={styles.tableFooter}>Showing {myLeagues.length} of {myLeagues.length} leagues</div>
          </div>
        )}

        {/* ── PUBLIC LEAGUES ── */}
        {tab === 'public' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Public Leagues</h2>
            <div className={styles.publicGrid}>
              {publicLeagues.map(l => (
                <div key={l.id} className={styles.publicCard}>
                  <div className={styles.publicCardTop}>
                    <div className={styles.publicCardBadge}>
                      {l.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.publicCardName}>{l.name}</div>
                      <div className={styles.publicCardSport}><SportIcon sport={l.sport} /> {l.sport}</div>
                    </div>
                  </div>
                   <div className={styles.publicCardMeta}>
                     <span><ClipboardList size={14} /> {l.format}</span>
                     <span><Users size={14} /> {l.members.toLocaleString()}/{l.maxMembers.toLocaleString()}</span>
                     <span><DollarSign size={14} /> {l.entry}</span>
                     <span className={styles.prize}><Trophy size={14} /> {l.prize}</span>
                   </div>
                  <button className={styles.joinPublicBtn}
                    onClick={() => navigate(`/fantasy/team-builder?league=${encodeURIComponent(l.name)}`)}>
                    Join League →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── JOIN PRIVATE ── */}
        {tab === 'private' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Join a Private League</h2>
            <p className={styles.panelSub}>Enter the league code shared by your friend to join their private league.</p>
            {joined ? (
              <div className={styles.successMsg}>
                <PartyPopper size={20} /> You've joined league <strong>{joined}</strong>!
                <button className={styles.viewBtn} style={{ marginLeft: 12 }} onClick={() => setTab('my')}>View My Leagues</button>
              </div>
            ) : (
              <div className={styles.codeForm}>
                <input
                  className={styles.codeInput}
                  type="text"
                  placeholder="Enter League Code (e.g. XK84JF)"
                  maxLength={8}
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />
                <button className={styles.joinCodeBtn} onClick={handleJoin} disabled={joinCode.trim().length < 4}>
                  Join
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CREATE LEAGUE ── */}
        {tab === 'create' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Create Your Own League</h2>
            <p className={styles.panelSub}>Start your own league and invite friends to compete for glory.</p>
            <button className={styles.createLeagueBtn}
              onClick={() => navigate('/fantasy/create-league')}>
              <Trophy size={18} /> Create League →
            </button>
          </div>
        )}
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className={styles.right}>

        {/* Global Leaderboard */}
        <div className={styles.widget}>
          <div className={styles.widgetHead}>
          <div className={styles.widgetTitle}><Trophy size={18} /> GLOBAL LEADERBOARD</div>
            <select className={styles.seasonSelect}>
              <option>This Season</option>
              <option>Last Season</option>
            </select>
          </div>

          <div className={styles.lbHead}>
            <span>#</span><span>MANAGER</span><span>POINTS</span>
          </div>

          {myLeagues.slice(0, 5).map((l, idx) => (
            <div key={l.id} className={styles.lbRow}>
              <span className={styles.lbRank}>{idx + 1}</span>
              <div className={styles.lbManager}>
                <div className={styles.lbAvatar}>{l.name[0]}</div>
                <div>
                  <div className={styles.lbName}>{l.name}</div>
                  <div className={styles.lbTeam}>{l.type}</div>
                </div>
              </div>
              <span className={styles.lbPts}>{l.points.toLocaleString()}</span>
            </div>
          ))}

          <button className={styles.viewFullLbBtn}>View Full Leaderboard →</button>
        </div>

        {/* Join Private */}
        <div className={`${styles.widget} ${styles.widgetJoin}`}>
          <div className={styles.widgetTitle}><Lock size={18} /> JOIN PRIVATE LEAGUE</div>
          <p>Enter a league code to join your friends' private league.</p>
          <div className={styles.miniCodeRow}>
            <input
              className={styles.miniCodeInput}
              type="text"
              placeholder="Enter League Code"
              maxLength={8}
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
            />
            <button className={styles.miniJoinBtn} onClick={handleJoin}>Join</button>
          </div>
        </div>

        {/* Create League CTA */}
        <div className={styles.createCta}>
          <div>
            <div className={styles.createCtaTitle}>CREATE YOUR OWN LEAGUE</div>
            <div className={styles.createCtaSub}>Start your own league and invite friends to compete for glory.</div>
          </div>
          <div className={styles.createCtaTrophy}><Trophy size={28} /></div>
          <button className={styles.createCtaBtn} onClick={() => navigate('/fantasy/create-league')}>
            Create League →
          </button>
        </div>
      </div>
    </div>
  );
}
