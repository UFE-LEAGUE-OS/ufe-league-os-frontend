import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SPORT_CONFIGS, PUBLIC_LEAGUES } from './fantasyData';
import type { Sport, Format } from './fantasyData';
import styles from './FantasyCreateJoin.module.css';

type Tab = 'create' | 'join';

export default function FantasyCreateJoin() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sport = (params.get('sport') ?? 'rugby') as Sport;
  const format = (params.get('format') ?? 'classic') as Format;
  const cfg = SPORT_CONFIGS[sport];

  const [tab, setTab] = useState<Tab>('create');
  const [leagueName, setLeagueName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxTeams, setMaxTeams] = useState('20');
  const [entryFee, setEntryFee] = useState('0');
  const [joinCode, setJoinCode] = useState('');
  const [sportFilter, setSportFilter] = useState<Sport | 'all'>('all');
  const [created, setCreated] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  const filteredLeagues = PUBLIC_LEAGUES.filter(l =>
    sportFilter === 'all' || l.sport === sportFilter
  );

  const handleCreate = () => {
    if (!leagueName.trim()) return;
    setCreated(true);
    setTimeout(() => {
      navigate(`/fantasy/team-builder?sport=${sport}&format=${format}&league=${encodeURIComponent(leagueName.trim())}`);
    }, 1400);
  };

  const handleJoinPublic = (leagueId: string, leagueName: string) => {
    setJoinSuccess(leagueName);
    setTimeout(() => {
      const league = PUBLIC_LEAGUES.find(l => l.id === leagueId)!;
      navigate(`/fantasy/team-builder?sport=${league.sport}&format=${league.format}&league=${encodeURIComponent(leagueName)}`);
    }, 1400);
  };

  const handleJoinCode = () => {
    if (joinCode.trim().length < 4) return;
    setJoinSuccess(`League #${joinCode.trim().toUpperCase()}`);
    setTimeout(() => {
      navigate(`/fantasy/team-builder?sport=${sport}&format=${format}&league=${joinCode.trim().toUpperCase()}`);
    }, 1400);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(`/fantasy/select?sport=${sport}&format=${format}`)}>
          ← Back
        </button>
        <div className={styles.steps}>
          <span className={styles.step}>1 Sport &amp; Format</span>
          <span className={styles.stepArrow}>›</span>
          <span className={`${styles.step} ${styles.stepActive}`}>2 Create / Join</span>
          <span className={styles.stepArrow}>›</span>
          <span className={styles.step}>3 Build Team</span>
        </div>
      </div>

      {/* Context pill */}
      <div className={styles.contextPill}>
        <span>{cfg.emoji} {cfg.label}</span>
        <span className={styles.dot}>·</span>
        <span>{cfg.formats.find(f => f.id === format)?.label ?? format}</span>
        <span className={styles.dot}>·</span>
        <span>Budget: {cfg.budget}m UGX</span>
      </div>

      <div className={styles.body}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab}${tab === 'create' ? ` ${styles.tabActive}` : ''}`} onClick={() => setTab('create')}>
            🏆 Create New League
          </button>
          <button className={`${styles.tab}${tab === 'join' ? ` ${styles.tabActive}` : ''}`} onClick={() => setTab('join')}>
            🔗 Join a League
          </button>
        </div>

        {/* ── CREATE ── */}
        {tab === 'create' && (
          <div className={styles.panel}>
            {created ? (
              <div className={styles.successState}>
                <div className={styles.successIcon}>🎉</div>
                <h3>League Created!</h3>
                <p>Taking you to the team builder…</p>
              </div>
            ) : (
              <>
                <h3 className={styles.panelTitle}>Set Up Your League</h3>

                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label>League Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. KadagaFC Fantasy"
                      value={leagueName}
                      maxLength={40}
                      onChange={e => setLeagueName(e.target.value)}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Max Teams</label>
                    <select value={maxTeams} onChange={e => setMaxTeams(e.target.value)}>
                      {['10','20','50','100'].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label>Entry Fee (UGX)</label>
                    <select value={entryFee} onChange={e => setEntryFee(e.target.value)}>
                      {['0','2000','5000','10000','20000'].map(n => (
                        <option key={n} value={n}>{n === '0' ? 'Free' : `UGX ${Number(n).toLocaleString()}`}</option>
                      ))}
                    </select>
                  </div>

                  <div className={`${styles.field} ${styles.fieldRow}`}>
                    <label>Privacy</label>
                    <div className={styles.toggleRow}>
                      <button
                        className={`${styles.toggleBtn}${!isPrivate ? ` ${styles.toggleBtnActive}` : ''}`}
                        onClick={() => setIsPrivate(false)}
                      >🌍 Public</button>
                      <button
                        className={`${styles.toggleBtn}${isPrivate ? ` ${styles.toggleBtnActive}` : ''}`}
                        onClick={() => setIsPrivate(true)}
                      >🔒 Private</button>
                    </div>
                  </div>
                </div>

                {/* League preview */}
                {leagueName && (
                  <div className={styles.leaguePreview}>
                    <div className={styles.leaguePreviewIcon}>{cfg.emoji}</div>
                    <div>
                      <strong>{leagueName}</strong>
                      <p>{cfg.label} · {cfg.formats.find(f => f.id === format)?.label} · {isPrivate ? '🔒 Private' : '🌍 Public'} · Max {maxTeams} teams · {entryFee === '0' ? 'Free' : `UGX ${Number(entryFee).toLocaleString()} entry`}</p>
                    </div>
                  </div>
                )}

                <button
                  className={styles.primaryBtn}
                  onClick={handleCreate}
                  disabled={!leagueName.trim()}
                >
                  Create League &amp; Build Team →
                </button>
              </>
            )}
          </div>
        )}

        {/* ── JOIN ── */}
        {tab === 'join' && (
          <div className={styles.panel}>
            {joinSuccess ? (
              <div className={styles.successState}>
                <div className={styles.successIcon}>🎉</div>
                <h3>You've Joined!</h3>
                <p>Taking you to build your team for <strong>{joinSuccess}</strong>…</p>
              </div>
            ) : (
              <>
                {/* Join by code */}
                <div className={styles.joinCodeSection}>
                  <h3 className={styles.panelTitle}>Join by Private Code</h3>
                  <div className={styles.codeRow}>
                    <input
                      className={styles.codeInput}
                      type="text"
                      placeholder="Enter league code (e.g. XK84JF)"
                      maxLength={8}
                      value={joinCode}
                      onChange={e => setJoinCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleJoinCode()}
                    />
                    <button
                      className={styles.primaryBtn}
                      onClick={handleJoinCode}
                      disabled={joinCode.trim().length < 4}
                    >
                      Join
                    </button>
                  </div>
                </div>

                <div className={styles.divider}><span>or browse public leagues</span></div>

                {/* Public leagues */}
                <div>
                  <div className={styles.publicHeader}>
                    <h3 className={styles.panelTitle}>Public Leagues</h3>
                    <div className={styles.filterRow}>
                      {(['all','rugby','football','basketball'] as const).map(s => (
                        <button
                          key={s}
                          className={`${styles.filterBtn}${sportFilter === s ? ` ${styles.filterBtnActive}` : ''}`}
                          onClick={() => setSportFilter(s)}
                        >
                          {s === 'all' ? 'All' : SPORT_CONFIGS[s].emoji + ' ' + SPORT_CONFIGS[s].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.leagueTable}>
                    <div className={styles.leagueTableHead}>
                      <span>League</span>
                      <span>Sport</span>
                      <span>Format</span>
                      <span>Teams</span>
                      <span>Entry</span>
                      <span>Prize Pool</span>
                      <span></span>
                    </div>
                    {filteredLeagues.map(l => (
                      <div key={l.id} className={styles.leagueTableRow}>
                        <span className={styles.leagueName}>{l.name}</span>
                        <span>{SPORT_CONFIGS[l.sport].emoji} {SPORT_CONFIGS[l.sport].label}</span>
                        <span><span className={styles.formatBadge}>{l.format}</span></span>
                        <span>{l.teams.toLocaleString()} / {l.maxTeams.toLocaleString()}</span>
                        <span>{l.entryFee === 0 ? <span className={styles.free}>Free</span> : `UGX ${l.entryFee.toLocaleString()}`}</span>
                        <span className={styles.prize}>{l.prizePool}</span>
                        <button
                          className={styles.joinBtn}
                          onClick={() => handleJoinPublic(l.id, l.name)}
                        >
                          Join →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
