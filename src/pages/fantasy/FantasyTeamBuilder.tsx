import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SPORT_CONFIGS, PLAYERS } from './fantasyData';
import type { Sport, Format, FantasyPlayer } from './fantasyData';
import styles from './FantasyTeamBuilder.module.css';

/* ─── Rugby position rows (formation layout) ─── */
const RUGBY_FORMATION: { row: string; positions: string[] }[] = [
  { row: 'Front Row',  positions: ['PR', 'HK', 'PR'] },
  { row: 'Second Row', positions: ['LK', 'LK'] },
  { row: 'Back Row',   positions: ['FL', 'NO8', 'FL'] },
  { row: 'Half Backs', positions: ['SH', 'FH'] },
  { row: 'Centres',    positions: ['CTR', 'CTR'] },
  { row: 'Back Three', positions: ['WG', 'FB', 'WG'] },
];

const FOOTBALL_FORMATION: { row: string; positions: string[] }[] = [
  { row: 'Goalkeeper', positions: ['GK'] },
  { row: 'Defence',    positions: ['DEF', 'DEF', 'DEF', 'DEF'] },
  { row: 'Midfield',   positions: ['MID', 'MID', 'MID'] },
  { row: 'Attack',     positions: ['FWD', 'FWD', 'FWD'] },
];

const BASKETBALL_FORMATION: { row: string; positions: string[] }[] = [
  { row: 'Guard',   positions: ['PG', 'SG'] },
  { row: 'Forward', positions: ['SF', 'PF'] },
  { row: 'Centre',  positions: ['C'] },
];

function getFormation(sport: Sport) {
  if (sport === 'football')   return FOOTBALL_FORMATION;
  if (sport === 'basketball') return BASKETBALL_FORMATION;
  return RUGBY_FORMATION;
}

/* ─── Position slot tracker ─── */
function buildSlots(formation: { row: string; positions: string[] }[]) {
  const slots: { pos: string; slotId: string }[] = [];
  const counter: Record<string, number> = {};
  formation.forEach(row => {
    row.positions.forEach(pos => {
      counter[pos] = (counter[pos] ?? 0) + 1;
      slots.push({ pos, slotId: `${pos}_${counter[pos]}` });
    });
  });
  return slots;
}

export default function FantasyTeamBuilder() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sport  = (params.get('sport')  ?? 'rugby')   as Sport;
  const format = (params.get('format') ?? 'classic') as Format;
  const league = params.get('league')  ?? 'My League';

  const cfg        = SPORT_CONFIGS[sport];
  const allPlayers = PLAYERS[sport];
  const formation  = getFormation(sport);
  const allSlots   = buildSlots(formation);

  /* squad: slotId → player */
  const [squad, setSquad] = useState<Record<string, FantasyPlayer>>({});
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [captainId, setCaptainId] = useState<string | null>(null);
  const [saved] = useState(false);

  const squadPlayers = Object.values(squad);
  const spent        = squadPlayers.reduce((s, p) => s + p.cost, 0);
  const remaining    = +(cfg.budget - spent).toFixed(1);
  const budgetPct    = Math.min((spent / cfg.budget) * 100, 100);
  const filledSlots  = Object.keys(squad).length;
  const totalSlots   = allSlots.length;

  /* club count */
  const clubCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    squadPlayers.forEach(p => { counts[p.club] = (counts[p.club] ?? 0) + 1; });
    return counts;
  }, [squadPlayers]);

  const maxClub   = 4;
  const topClub   = Object.entries(clubCounts).sort((a, b) => b[1] - a[1])[0];

  /* Row summary */
  const rowSummary = formation.map(row => {
    const total    = row.positions.length;
    const rowSlots = allSlots.filter(s => row.positions.includes(s.pos));
    const filled   = rowSlots.filter(s => squad[s.slotId]).length;
    return { label: row.row.toUpperCase(), filled, total };
  });

  /* active slot position */
  const activePos = activeSlot
    ? allSlots.find(s => s.slotId === activeSlot)?.pos ?? null
    : null;

  /* player pool filtered */
  const usedIds = new Set(squadPlayers.map(p => p.id));
  const pool = useMemo(() => {
    return allPlayers
      .filter(p => !usedIds.has(p.id))
      .filter(p => posFilter === 'ALL' || p.position === posFilter)
      .filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.club.toLowerCase().includes(search.toLowerCase())
      )
      .filter(p => !activePos || p.position === activePos)
      .filter(p => remaining >= p.cost)
      .filter(p => !p.club || (clubCounts[p.club] ?? 0) < maxClub)
      .sort((a, b) => b.totalPts - a.totalPts);
  }, [allPlayers, usedIds, posFilter, search, activePos, remaining, clubCounts]);

  const assignPlayer = (slotId: string, player: FantasyPlayer) => {
    setSquad(prev => ({ ...prev, [slotId]: player }));
    if (!captainId) setCaptainId(player.id);
    setActiveSlot(null);
  };

  const removePlayer = (slotId: string) => {
    const removed = squad[slotId];
    setSquad(prev => { const n = { ...prev }; delete n[slotId]; return n; });
    if (captainId === removed?.id) {
      const remaining_ = Object.values(squad).filter(p => p.id !== removed?.id);
      setCaptainId(remaining_[0]?.id ?? null);
    }
  };

  const autoPick = () => {
    const newSquad: Record<string, FantasyPlayer> = { ...squad };
    let budgetLeft = remaining;
    const usedInAuto = new Set(Object.values(newSquad).map(p => p.id));
    const clubInAuto: Record<string, number> = {};
    Object.values(newSquad).forEach(p => { clubInAuto[p.club] = (clubInAuto[p.club] ?? 0) + 1; });

    allSlots.forEach(slot => {
      if (newSquad[slot.slotId]) return;
      const candidates = allPlayers
        .filter(p => p.position === slot.pos)
        .filter(p => !usedInAuto.has(p.id))
        .filter(p => p.cost <= budgetLeft)
        .filter(p => (clubInAuto[p.club] ?? 0) < maxClub)
        .sort((a, b) => b.totalPts - a.totalPts);

      if (candidates[0]) {
        const pick = candidates[0];
        newSquad[slot.slotId] = pick;
        usedInAuto.add(pick.id);
        clubInAuto[pick.club] = (clubInAuto[pick.club] ?? 0) + 1;
        budgetLeft -= pick.cost;
      }
    });
    setSquad(newSquad);
    const players = Object.values(newSquad);
    if (players.length > 0 && !captainId) setCaptainId(players[0].id);
  };

  const clearSquad = () => { setSquad({}); setCaptainId(null); };

  const isValid = filledSlots === totalSlots;
  const canContinue = filledSlots > 0; // allow review with partial squad for testing

  const handleContinue = () => {
    if (!canContinue) return;
    navigate(`/fantasy/player-market?sport=${sport}&league=${encodeURIComponent(league)}&budget=${remaining}`);
  };

  /* ─── colour helper ─── */
  const posColor: Record<string, string> = {
    PR:'#7c3aed', HK:'#2563eb', LK:'#059669', FL:'#d97706',
    NO8:'#dc2626', SH:'#0891b2', FH:'#7c3aed', CTR:'#059669',
    WG:'#f97316', FB:'#8b5cf6',
    GK:'#1d4ed8', DEF:'#059669', MID:'#d97706', FWD:'#dc2626',
    PG:'#7c3aed', SG:'#2563eb', SF:'#059669', PF:'#d97706', C:'#dc2626',
  };

  return (
    <div className={styles.page}>

      {/* ── TOP NAV ── */}
      <div className={styles.topNav}>
        <div className={styles.breadcrumb}>
          <span onClick={() => navigate('/fantasy')} className={styles.breadLink}>Home</span>
          <span className={styles.breadSep}>›</span>
          <span onClick={() => navigate('/fantasy')} className={styles.breadLink}>Fantasy</span>
          <span className={styles.breadSep}>›</span>
          <span className={styles.breadLink}>{league}</span>
          <span className={styles.breadSep}>›</span>
          <span>Create Team</span>
        </div>
        <div className={styles.topNavActions}>
          <div className={styles.competitionBadge}>
            <span className={styles.compBadgeEmoji}>{cfg.emoji}</span>
            <span>{cfg.formats.find(f => f.id === format)?.label ?? 'Rugby XV'}</span>
            <span className={styles.dropArrow}>▾</span>
          </div>
          <button className={styles.autoPickBtn} onClick={autoPick}>
            ✦ Auto Pick
          </button>
          <button className={styles.clearBtn} onClick={clearSquad}>
            🗑 Clear Squad
          </button>
        </div>
      </div>

      {/* ── PAGE HEADER ── */}
      <div className={styles.pageHeader}>
        <div className={styles.leagueBadge}>
          <div className={styles.leagueBadgeIcon}>{cfg.emoji}</div>
          <div>
            <h1>CREATE YOUR TEAM</h1>
            <p>{league} · 2025/26 Season ⓘ</p>
          </div>
        </div>
      </div>

      {saved ? (
        <div className={styles.savedState}>
          <div className={styles.savedIcon}>✅</div>
          <h2>Team Saved!</h2>
          <p>Your squad for <strong>{league}</strong> is ready. Good luck!</p>
        </div>
      ) : (
        <div className={styles.mainLayout}>

          {/* ── LEFT SIDEBAR ── */}
          <div className={styles.leftSidebar}>
            <div className={styles.sideWidget}>
              <div className={styles.sideWidgetLabel}>BUDGET</div>
              <div className={styles.budgetDisplay}>
                <div className={styles.budgetRing}>
                  <svg viewBox="0 0 40 40" className={styles.ringsvg}>
                    <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#8135FA" strokeWidth="4"
                      strokeDasharray={`${budgetPct} 100`} strokeLinecap="round"
                      transform="rotate(-90 20 20)" />
                  </svg>
                  <span className={styles.ringLabel}>💰</span>
                </div>
                <div>
                  <div className={styles.budgetTotal}>{cfg.budget}</div>
                  <div className={styles.budgetCurrency}>CREDITS</div>
                </div>
              </div>
              <div className={styles.budgetRemaining}>
                <span className={styles.budgetRemainingLabel}>Remaining Budget</span>
                <span className={styles.budgetRemainingValue} style={{ color: remaining < 10 ? '#ef4444' : '#22c55e' }}>
                  {remaining.toFixed(1)}
                </span>
                <span className={styles.budgetRemainingCurrency}>Credits</span>
              </div>
            </div>

            <div className={styles.sideWidget}>
              <div className={styles.sideWidgetLabel}>SQUAD SIZE</div>
              <div className={styles.squadSizeDisplay}>
                <span className={styles.squadSizeIcon}>👥</span>
                <div className={styles.squadSizeCount}>
                  <strong>{filledSlots}</strong> / {totalSlots}
                </div>
              </div>
              <div className={styles.squadSizeRemaining}>
                {totalSlots - filledSlots} players remaining
              </div>
            </div>

            <div className={styles.sideWidget}>
              <div className={styles.sideWidgetLabel}>MAX PLAYERS PER CLUB</div>
              <div className={styles.clubLimit}>
                <span className={styles.clubLimitIcon}>🛡</span>
                <div className={styles.clubLimitNum}>
                  <strong>3</strong>
                  <span>Max {maxClub}</span>
                </div>
              </div>
              {topClub && (
                <div className={styles.topClubRow}>
                  You have {topClub[1]} players from <strong>{topClub[0]}</strong>
                </div>
              )}
            </div>

            <button className={styles.viewMarketBtn} onClick={() => navigate(`/fantasy/player-market?sport=${sport}&league=${encodeURIComponent(league)}&budget=${remaining}`)}>
              View Player Market ↗
            </button>
          </div>

          {/* ── PITCH ── */}
          <div className={styles.pitchArea}>
            <div className={styles.pitch}>
              {/* Pitch markings */}
              <div className={styles.pitchCenter} />
              <div className={styles.pitchLine} style={{ top: '22%' }} />
              <div className={styles.pitchLine} style={{ top: '44%' }} />
              <div className={styles.pitchLine} style={{ top: '66%' }} />
              <div className={styles.pitchLine} style={{ top: '88%' }} />

              {/* Formation rows */}
              {formation.map((row, ri) => {
                const rowSlots = allSlots.filter(s => {
                  // get slots for this row in order
                  let idx = 0;
                  for (let i = 0; i < ri; i++) idx += formation[i].positions.length;
                  return allSlots.indexOf(s) >= idx && allSlots.indexOf(s) < idx + row.positions.length;
                });
                return (
                  <div key={row.row} className={styles.pitchRow}>
                    {rowSlots.map(slot => {
                      const player = squad[slot.slotId];
                      const isActive = activeSlot === slot.slotId;
                      const color = posColor[slot.pos] ?? '#8135FA';

                      return (
                        <div
                          key={slot.slotId}
                          className={`${styles.pitchSlot}${isActive ? ` ${styles.pitchSlotActive}` : ''}`}
                          onClick={() => setActiveSlot(isActive ? null : slot.slotId)}
                        >
                          {player ? (
                            <div className={styles.playerCard}>
                              <button className={styles.removeX} onClick={e => { e.stopPropagation(); removePlayer(slot.slotId); }}>×</button>
                              {captainId === player.id && <div className={styles.captainC}>C</div>}
                              <div className={styles.playerCardAvatar} style={{ background: color }}>
                                {player.name.split(' ')[0][0]}{player.name.split(' ').slice(-1)[0][0]}
                              </div>
                              <div className={styles.playerCardName}>{player.name.split(' ').slice(-1)[0]}</div>
                              <div className={styles.playerCardClub}>{player.club.split(' ').slice(0,2).join(' ')}</div>
                              <div className={styles.playerCardCost} style={{ background: color }}>{player.cost} CR</div>
                              <button
                                className={styles.setCaptainBtn}
                                onClick={e => { e.stopPropagation(); setCaptainId(player.id); }}
                                title="Set as captain"
                              >★</button>
                            </div>
                          ) : (
                            <div className={styles.emptySlot} style={{ borderColor: color }}>
                              <span className={styles.emptySlotPos} style={{ color }}>{slot.pos}</span>
                              <span className={styles.emptySlotPlus}>+</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Add player CTA */}
            <div className={styles.pitchFooter}>
              <button className={styles.addPlayerBtn} onClick={() => {
                const emptySlot = allSlots.find(s => !squad[s.slotId]);
                if (emptySlot) setActiveSlot(emptySlot.slotId);
              }}>
                + Add Player
              </button>
              <span className={styles.pitchHint}>Drag &amp; drop players to change positions</span>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className={styles.rightSidebar}>

            {/* Squad summary */}
            <div className={styles.sideWidget}>
              <div className={styles.sideWidgetLabel}>
                SQUAD SUMMARY
                <span className={styles.summaryCount}>{filledSlots} / {totalSlots}</span>
              </div>
              {rowSummary.map(r => (
                <div key={r.label} className={styles.summaryRow}>
                  <div className={styles.summaryRowLeft}>
                    <div className={`${styles.summaryDot} ${r.filled === r.total ? styles.summaryDotFull : ''}`} />
                    <span>{r.label} ({r.filled}/{r.total})</span>
                  </div>
                  <div className={styles.summaryBar}>
                    <div className={styles.summaryBarFill}
                      style={{ width: `${(r.filled / r.total) * 100}%`, background: r.filled === r.total ? '#22c55e' : '#8135FA' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Budget breakdown */}
            <div className={styles.sideWidget} style={{ marginTop: 12 }}>
              <div className={styles.sideWidgetLabel}>BUDGET BREAKDOWN</div>
              <div className={styles.budgetBreakdown}>
                <div className={styles.bbRow}><span>Total Budget</span><span>{cfg.budget}.0 CR</span></div>
                <div className={styles.bbRow}><span>Spent</span><span style={{ color: '#f97316' }}>{spent.toFixed(1)} CR</span></div>
                <div className={styles.bbRow}><span>Remaining</span><span style={{ color: '#22c55e' }}>{remaining.toFixed(1)} CR</span></div>
              </div>
            </div>

            {/* Squad validation */}
            <div className={styles.sideWidget} style={{ marginTop: 12 }}>
              <div className={styles.sideWidgetLabel}>SQUAD VALIDATION</div>
              <div className={styles.validationList}>
                <div className={`${styles.valItem} ${filledSlots === totalSlots ? styles.valOk : styles.valErr}`}>
                  {filledSlots === totalSlots ? '✓' : '✗'} Exactly {totalSlots} players required
                </div>
                <div className={`${styles.valItem} ${Object.values(clubCounts).every(c => c <= maxClub) ? styles.valOk : styles.valErr}`}>
                  {Object.values(clubCounts).every(c => c <= maxClub) ? '✓' : '✗'} Max {maxClub} players per club
                </div>
                <div className={`${styles.valItem} ${remaining >= 0 ? styles.valOk : styles.valErr}`}>
                  {remaining >= 0 ? '✓' : '✗'} Within budget
                </div>
                <div className={`${styles.valItem} ${styles.valOk}`}>✓ Valid {cfg.label} positions</div>
              </div>
            </div>

            <button
              className={`${styles.continueBtn}${canContinue ? ` ${styles.continueBtnActive}` : ''}`}
              disabled={!canContinue}
              onClick={handleContinue}
            >
              Continue to Review →
            </button>
            {isValid && (
              <p className={styles.continueNote}>You can still make changes before confirming your squad.</p>
            )}
          </div>
        </div>
      )}

      {/* ── PLAYER MARKET DRAWER ── */}
      {activeSlot && (
        <div className={styles.marketDrawer}>
          <div className={styles.marketHeader}>
            <div>
              <strong>Player Market</strong>
              {activePos && <span className={styles.marketPos}> — {activePos} position</span>}
            </div>
            <button className={styles.marketClose} onClick={() => setActiveSlot(null)}>✕</button>
          </div>
          <div className={styles.marketControls}>
            <input
              className={styles.marketSearch}
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            <div className={styles.marketPosFilters}>
              {['ALL', ...cfg.positions].map(p => (
                <button
                  key={p}
                  className={`${styles.marketPosBtn}${posFilter === p ? ` ${styles.marketPosBtnActive}` : ''}`}
                  onClick={() => setPosFilter(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.marketList}>
            {pool.length === 0 && (
              <div className={styles.marketEmpty}>No players available for this slot</div>
            )}
            {pool.map(p => (
              <div key={p.id} className={styles.marketPlayer} onClick={() => assignPlayer(activeSlot, p)}>
                <div className={styles.marketPlayerAvatar} style={{ background: posColor[p.position] ?? '#8135FA' }}>
                  {p.name[0]}
                </div>
                <div className={styles.marketPlayerInfo}>
                  <strong>{p.name}</strong>
                  <span>{p.club} · <span style={{ color: posColor[p.position] ?? '#8135FA' }}>{p.position}</span></span>
                </div>
                <div className={styles.marketPlayerStats}>
                  <span className={styles.marketPts}>{p.totalPts} pts</span>
                  <span className={styles.marketForm}>Form: {p.form}</span>
                </div>
                <div className={styles.marketPlayerCost}>{p.cost} CR</div>
                <button className={styles.marketAddBtn}>+</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
