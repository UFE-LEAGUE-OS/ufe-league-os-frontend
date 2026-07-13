import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CalendarDays, BarChart3, RefreshCw, Trophy, Banknote, Medal, Shirt, Ticket, Users, DollarSign, Clock, Gamepad2, CheckCircle2, Zap } from 'lucide-react';
import styles from './FantasyPage.module.css';
import fantasyHero from '../../assets/fantasylandingpage.png';
import FantasyLeaguesLeaderboard from './FantasyLeaguesLeaderboard';
import { fetchCompetitions, fetchMyTeam, fetchLeaderboard } from '../../services/fantasyService';
import type { Competition, MyTeam, LeaderboardEntry } from '../../services/fantasyService';

/* ── Types ── */
type TabId = 'overview' | 'myteam' | 'leagues' | 'transfers' | 'standings';

const HOW_IT_WORKS = [
  { step: 1, icon: <User size={24} />, title: 'Pick Your Squad',     desc: 'Select players within your budget limit.' },
  { step: 2, icon: <CalendarDays size={24} />, title: 'Set Your Lineup',     desc: 'Choose your captain and starting lineup each gameweek.' },
  { step: 3, icon: <BarChart3 size={24} />, title: 'Earn Points',         desc: 'Players score points based on real match performance.' },
  { step: 4, icon: <RefreshCw size={24} />, title: 'Make Transfers',      desc: 'Swap players before each gameweek deadline.' },
  { step: 5, icon: <Trophy size={24} />, title: 'Win Prizes',          desc: 'Top managers each season win cash and exclusive rewards.' },
];

const PRIZES = [
  { icon: <Banknote size={24} />, place: '1st Place',    prize: 'UGX 500,000 Cash' },
  { icon: <Medal size={24} />, place: '2nd Place',    prize: 'UGX 200,000 Cash' },
  { icon: <Medal size={24} />, place: '3rd Place',    prize: 'UGX 100,000 Cash' },
  { icon: <Shirt size={24} />, place: 'Top 10',       prize: 'Exclusive League OS Jersey' },
  { icon: <Ticket size={24} />, place: 'Weekly Best', prize: 'Match Ticket + Merch Pack' },
];

const statusStyle: Record<string, { bg: string; color: string }> = {
  'LIVE':        { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
  'OPEN':        { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' },
  'COMING SOON': { bg: 'rgba(156,163,175,0.12)', color: '#9ca3af' },
};

export default function FantasyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [myTeam, setMyTeam] = useState<MyTeam | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [compRes, teamRes, lbRes] = await Promise.all([
          fetchCompetitions(),
          fetchMyTeam(),
          fetchLeaderboard(),
        ]);
        setCompetitions(compRes.data);
        setMyTeam(teamRes.data);
        setLeaderboard(lbRes.data);
      } catch (err) {
        setError('Failed to load fantasy data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className={styles.page}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.page}>Error: {error}</div>;
  }

  const team = myTeam || {
    name: 'My Dream Squad',
    competition: '',
    totalPoints: 0,
    gameweekPoints: 0,
    rank: 0,
    budget: 0,
    players: [],
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview',   label: 'Overview' },
    { id: 'myteam',     label: 'My Team' },
    { id: 'leagues',    label: 'Leagues' },
    { id: 'transfers',  label: 'Transfers' },
    { id: 'standings',  label: 'Standings' },
  ];

  return (
    <div className={styles.page}>

      {/* ── HERO ── */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}><Zap size={18} /> FANTASY LEAGUES</div>
          <h1>BUILD YOUR SQUAD.<br /><span>BEAT THE LEAGUE.</span></h1>
          <p>Create your ultimate fantasy team across Rugby, Football & Basketball.<br />Compete with fans across Uganda for glory, bragging rights and epic rewards.</p>
          <div className={styles.heroBtns}>
            <button className={styles.btnPrimary} onClick={() => navigate('/fantasy/select')}>Create Team →</button>
            <button className={styles.btnOutline} onClick={() => navigate('/fantasy/select')}>Explore Competitions</button>
          </div>
          <div className={styles.heroBadges}>
            <span><Gamepad2 size={16} /> 3 SPORTS, 1 PLATFORM<br /><small>Rugby, Football, Basketball</small></span>
            <span><Users size={16} /> REAL FANS. REAL COMPETITION<br /><small>Compete with thousands</small></span>
            <span><Trophy size={16} /> EPIC REWARDS<br /><small>Win prizes every week</small></span>
            <span><CheckCircle2 size={16} /> 100% FREE TO PLAY<br /><small>Join, play and win</small></span>
          </div>
        </div>

        {/* Players image — right side */}
        <div className={styles.heroImageWrap}>
          <img src={fantasyHero} alt="Fantasy players" className={styles.heroImage} />
        </div>

        {/* Gameweek chip */}
        <div className={styles.gwChip}>
          <div className={styles.gwChipLabel}>Gameweek 12</div>
          <div className={styles.gwChipDeadline}>Deadline: 24 May, 17:00 EAT</div>
          <div className={styles.gwChipBadge}>OPEN FOR TRANSFERS</div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab}${activeTab === t.id ? ` ${styles.tabActive}` : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.body}>

        {/* ══════════════ OVERVIEW ══════════════ */}
        {activeTab === 'overview' && (
          <div className={styles.overviewGrid}>

            {/* Competition cards */}
            <div className={styles.section}>
              <div className={styles.sectionHead}>
                <h2>Featured Competitions</h2>
                <button className={styles.linkBtn} onClick={() => setActiveTab('leagues')}>View All →</button>
              </div>
              <div className={styles.compCards}>
                {competitions.map((c) => {
                  const ss = statusStyle[c.status];
                  return (
                    <div key={c.id} className={styles.compCard} style={{ '--accent': c.color } as React.CSSProperties}>
                      <div className={styles.compCardTop}>
                        <div className={styles.compLogoPlaceholder}>{c.sport[0]}</div>
                        <div>
                          <div className={styles.compName}>{c.name}</div>
                          <div className={styles.compSeason}>{c.sport} · {c.season}</div>
                          <span className={styles.compStatus} style={{ background: ss.bg, color: ss.color }}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                        <div className={styles.compMeta}>
                        <span><Users size={14} /> {c.teamsJoined.toLocaleString()} teams</span>
                        <span><DollarSign size={14} /> {c.entryFee === 0 ? 'Free' : `UGX ${c.entryFee.toLocaleString()}`}</span>
                        <span><Clock size={14} /> {c.deadline}</span>
                        <span><Trophy size={14} /> {c.prizePool}</span>
                      </div>
                      {c.status !== 'COMING SOON'
                        ? <button className={styles.compBtn} onClick={() => navigate(`/fantasy/select?sport=${c.id}`)}>Play Now →</button>
                        : <button className={styles.compBtnGhost}>Notify Me</button>
                      }
                    </div>
                  );
                })}
              </div>
            </div>

            {/* How it works */}
            <div className={styles.section}>
              <div className={styles.sectionHead}><h2>How Fantasy Works</h2></div>
              <div className={styles.howRow}>
                {HOW_IT_WORKS.map((h, i) => (
                  <div key={h.step} className={styles.howStep}>
                    <div className={styles.howNum}>{h.step}</div>
                    <div className={styles.howIcon}>{h.icon}</div>
                    <div className={styles.howTitle}>{h.title}</div>
                    <div className={styles.howDesc}>{h.desc}</div>
                    {i < HOW_IT_WORKS.length - 1 && <div className={styles.howArrow}>→</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Right sidebar */}
            <div className={styles.overviewSide}>

              {/* My team snapshot */}
              <div className={styles.widget}>
                <div className={styles.widgetHead}>My Team</div>
                <div className={styles.myTeamSnap}>
                  <div className={styles.myTeamName}>{team.name}</div>
                  <div className={styles.myTeamComp}>{team.competition}</div>
                  <div className={styles.myTeamStats}>
                    <div><strong>{team.gameweekPoints}</strong><span>GW Points</span></div>
                    <div><strong>{team.totalPoints}</strong><span>Total</span></div>
                    <div><strong>#{team.rank}</strong><span>Rank</span></div>
                  </div>
                </div>
                <button className={styles.btnPrimary} style={{ width: '100%', marginTop: 12 }}
                  onClick={() => setActiveTab('myteam')}>
                  Manage Team →
                </button>
              </div>

              {/* Prizes */}
              <div className={styles.widget} style={{ marginTop: 14 }}>
                <div className={styles.widgetHead}>🏆 Prize Pool</div>
                {PRIZES.map((p) => (
                  <div key={p.place} className={styles.prizeRow}>
                    <span className={styles.prizeIcon}>{p.icon}</span>
                    <div>
                      <strong>{p.place}</strong>
                      <p>{p.prize}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ MY TEAM ══════════════ */}
        {activeTab === 'myteam' && (
          <div className={styles.myTeamPage}>
            <div className={styles.myTeamHeader}>
              <div>
                <h2>{team.name}</h2>
                <p>{team.competition} · Season 2025/26</p>
              </div>
              <div className={styles.myTeamHeaderStats}>
                <div><strong>{team.gameweekPoints}</strong><span>GW12 Points</span></div>
                <div><strong>{team.totalPoints}</strong><span>Total Points</span></div>
                <div><strong>#{team.rank}</strong><span>Overall Rank</span></div>
                <div><strong>UGX {team.budget}m</strong><span>In The Bank</span></div>
              </div>
            </div>

            {/* Pitch visual */}
            <div className={styles.pitch}>
              <div className={styles.pitchLines} />
              <div className={styles.pitchLabel}>Your Squad</div>
              <div className={styles.pitchPlayers}>
                {team.players.map((p) => (
                  <div key={p.name} className={styles.pitchPlayer}>
                    <div className={styles.pitchPlayerAvatar}>{p.name[0]}</div>
                    <div className={styles.pitchPlayerName}>{p.name}</div>
                    <div className={styles.pitchPlayerPts}>{p.pts} pts</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Player list */}
            <div className={styles.playerTable}>
              <div className={styles.playerTableHead}>
                <span>Player</span><span>Club</span><span>Pos</span><span>Cost</span><span>GW Pts</span>
              </div>
              {team.players.map((p) => (
                <div key={p.name} className={styles.playerRow}>
                  <span><strong>{p.name}</strong></span>
                  <span>{p.club}</span>
                  <span><span className={styles.posBadge}>{p.pos}</span></span>
                  <span>UGX {p.cost}m</span>
                  <span className={styles.ptsCell}>{p.pts}</span>
                </div>
              ))}
            </div>

            <button className={styles.btnPrimary} style={{ marginTop: 16 }}
              onClick={() => setActiveTab('transfers')}>
              Make Transfers →
            </button>
          </div>
        )}

        {/* ══════════════ LEAGUES ══════════════ */}
        {activeTab === 'leagues' && (
          <FantasyLeaguesLeaderboard />
        )}

        {/* ══════════════ TRANSFERS ══════════════ */}
        {activeTab === 'transfers' && (
          <div className={styles.transfersPage}>
            <div className={styles.sectionHead}>
              <h2>Transfers</h2>
              <span className={styles.transferInfo}>1 free transfer remaining · Gameweek 12 deadline: {team.competition ? '24 May 17:00' : 'N/A'}</span>
            </div>
            <div className={styles.transferColumns}>
              {/* Current squad */}
              <div className={styles.widget} style={{ flex: 1 }}>
                <div className={styles.widgetHead}>Your Squad</div>
                {team.players.map((p) => (
                  <div key={p.name} className={styles.transferPlayerRow}>
                    <div className={styles.transferPlayerInfo}>
                      <div className={styles.transferAvatar}>{p.name[0]}</div>
                      <div>
                        <strong>{p.name}</strong>
                        <span>{p.club} · <span className={styles.posBadge}>{p.pos}</span></span>
                      </div>
                    </div>
                    <div className={styles.transferPlayerRight}>
                      <span className={styles.transferCost}>UGX {p.cost}m</span>
                      <button className={styles.transferOutBtn}>Transfer Out</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Available players */}
              <div className={styles.widget} style={{ flex: 1 }}>
                <div className={styles.widgetHead}>Available Players</div>
                <input className={styles.codeInput} placeholder="Search players..." style={{ marginBottom: 12, width: '100%' }} />
                {[
                  { name: 'P. Odeke',    club: 'Pirates RFC',  pos: 'WG',  cost: 9.0,  pts: 145 },
                  { name: 'C. Asiimwe',  club: 'KOBS',         pos: 'FH',  cost: 11.0, pts: 162 },
                  { name: 'B. Otim',     club: 'Jinja Hippos', pos: 'PR',  cost: 7.5,  pts: 98 },
                  { name: 'S. Mugisha',  club: 'Heathens RFC', pos: 'CTR', cost: 8.5,  pts: 121 },
                  { name: 'R. Okello',   club: 'Pirates RFC',  pos: 'HK',  cost: 8.0,  pts: 110 },
                ].map((p) => (
                  <div key={p.name} className={styles.transferPlayerRow}>
                    <div className={styles.transferPlayerInfo}>
                      <div className={styles.transferAvatar}>{p.name[0]}</div>
                      <div>
                        <strong>{p.name}</strong>
                        <span>{p.club} · <span className={styles.posBadge}>{p.pos}</span></span>
                      </div>
                    </div>
                    <div className={styles.transferPlayerRight}>
                      <span className={styles.transferCost}>UGX {p.cost}m</span>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{p.pts} pts</span>
                      <button className={styles.transferInBtn}>Transfer In</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ STANDINGS ══════════════ */}
        {activeTab === 'standings' && (
          <div>
            <div className={styles.sectionHead} style={{ marginBottom: 16 }}>
              <h2>Overall Standings</h2>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{team.competition} · GW12</span>
            </div>
            <div className={styles.widget}>
              <div className={styles.leaderHead}>
                <span>#</span><span>Manager</span><span>Team</span><span>GW Pts</span><span>Total</span>
              </div>
              {leaderboard.map((m) => (
                <div key={m.rank} className={`${styles.leaderRow}${m.isMe ? ` ${styles.leaderRowMe}` : ''}`}>
                   <span className={styles.leaderRank}>
                    {m.rank <= 3 ? <Medal size={18} /> : m.rank}
                  </span>
                  <div className={styles.leaderAvatar}>{m.name[0]}</div>
                  <div className={styles.leaderInfo}>
                    <strong>{m.name}</strong>
                    <small>{m.team}</small>
                  </div>
                  <span style={{ color: '#9ca3af', fontSize: 13 }}>{team.gameweekPoints}</span>
                  <span className={styles.leaderPts}>{m.pts.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
