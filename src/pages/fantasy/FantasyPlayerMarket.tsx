import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SPORT_CONFIGS, PLAYERS } from './fantasyData';
import type { Sport, FantasyPlayer } from './fantasyData';
import styles from './FantasyPlayerMarket.module.css';

const ROWS_PER_PAGE = 10;

type SortKey = 'cost' | 'selected' | 'form' | 'totalPts';
type SortDir = 'asc' | 'desc';

/* Fake recent form for each player */
function getForm(seed: number): ('W' | 'L' | 'D')[] {
  const pool: ('W' | 'L' | 'D')[] = ['W','W','W','L','D','W','L','W'];
  return Array.from({ length: 5 }, (_, i) => pool[(seed + i) % pool.length]);
}

const formColor: Record<string, string> = { W: '#22c55e', L: '#ef4444', D: '#f97316' };

/* Fake per-player stats */
function playerStats(p: FantasyPlayer) {
  const seed = p.id.charCodeAt(1) ?? 5;
  return {
    tries:       Math.floor(seed % 8) + 1,
    conversions: Math.floor(seed % 20) + 5,
    penalties:   Math.floor(seed % 15) + 3,
    dropGoals:   Math.floor(seed % 4),
    avgPts:      +(p.totalPts / 10).toFixed(1),
    gamesPlayed: 10,
    about:       `${p.name} is a key player for ${p.club}, consistently delivering strong performances at ${p.position}.`,
  };
}

export default function FantasyPlayerMarket() {
  const navigate  = useNavigate();
  const [params]  = useSearchParams();
  const sport     = (params.get('sport') ?? 'rugby') as Sport;
  const league    = params.get('league') ?? 'My League';
  const budgetLeft = parseFloat(params.get('budget') ?? '100');

  const cfg     = SPORT_CONFIGS[sport];
  const players = PLAYERS[sport];

  const [search,    setSearch]    = useState('');
  const [clubFilter,setClubFilter]= useState('All Clubs');
  const [posFilter, setPosFilter] = useState('All Positions');
  const [sortKey,   setSortKey]   = useState<SortKey>('totalPts');
  const [sortDir,   setSortDir]   = useState<SortDir>('desc');
  const [page,      setPage]      = useState(1);
  const [selected,  setSelected]  = useState<FantasyPlayer | null>(null);

  const clubs = useMemo(() => ['All Clubs', ...Array.from(new Set(players.map(p => p.club)))], [players]);

  const filtered = useMemo(() => {
    return players
      .filter(p => clubFilter === 'All Clubs' || p.club === clubFilter)
      .filter(p => posFilter  === 'All Positions' || p.position === posFilter)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) ||
                   p.club.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const va = sortKey === 'cost' ? a.cost : sortKey === 'selected' ? a.selected :
                   sortKey === 'form' ? a.form : a.totalPts;
        const vb = sortKey === 'cost' ? b.cost : sortKey === 'selected' ? b.selected :
                   sortKey === 'form' ? b.form : b.totalPts;
        return sortDir === 'asc' ? va - vb : vb - va;
      });
  }, [players, clubFilter, posFilter, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const pageRows   = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const posColor: Record<string, string> = {
    PR:'#7c3aed', HK:'#2563eb', LK:'#059669', FL:'#d97706',
    NO8:'#dc2626', SH:'#0891b2', FH:'#7c3aed', CTR:'#059669',
    WG:'#f97316', FB:'#8b5cf6',
    GK:'#1d4ed8', DEF:'#059669', MID:'#d97706', FWD:'#dc2626',
    PG:'#7c3aed', SG:'#2563eb', SF:'#059669', PF:'#d97706', C:'#dc2626',
  };

  const paginationPages = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const stats = selected ? playerStats(selected) : null;
  const form  = selected ? getForm(selected.id.charCodeAt(1) ?? 0) : [];

  return (
    <div className={styles.page}>

      {/* ── HEADER ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back to Squad
          </button>
          <div className={styles.leagueBadge}>
            <div className={styles.leagueBadgeIcon}>{cfg.emoji}</div>
          </div>
          <div>
            <h1 className={styles.title}>PLAYER MARKET</h1>
            <div className={styles.subtitle}>
              {league}
              <span className={styles.verifiedBadge}>🔒</span>
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.budgetChip}>
            <div>
              <div className={styles.budgetLabel}>Budget Remaining</div>
              <div className={styles.budgetValue}>{budgetLeft.toFixed(1)}</div>
              <div className={styles.budgetSub}>Credits</div>
            </div>
            <div className={styles.budgetIcon}>💳</div>
          </div>
        </div>
      </div>

      {/* ── FILTERS ── */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search players by name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select className={styles.filterSelect}
          value={clubFilter} onChange={e => { setClubFilter(e.target.value); setPage(1); }}>
          {clubs.map(c => <option key={c}>{c}</option>)}
        </select>

        <select className={styles.filterSelect}
          value={posFilter} onChange={e => { setPosFilter(e.target.value); setPage(1); }}>
          <option>All Positions</option>
          {cfg.positions.map(p => <option key={p}>{p}</option>)}
        </select>

        <select className={styles.filterSelect}
          value={`${sortKey}_${sortDir}`}
          onChange={e => {
            const [k, d] = e.target.value.split('_');
            setSortKey(k as SortKey); setSortDir(d as SortDir); setPage(1);
          }}>
          <option value="cost_asc">Price: Low to High</option>
          <option value="cost_desc">Price: High to Low</option>
          <option value="totalPts_desc">Season Points: High</option>
          <option value="form_desc">Form: Best</option>
          <option value="selected_desc">Most Selected</option>
        </select>

        <select className={styles.filterSelect}>
          <option>All Form</option>
          <option>In Form (W)</option>
          <option>Poor Form (L)</option>
        </select>

        <button className={styles.filterBtn}>
          ⚙ Filters <span className={styles.filterCount}>2</span>
        </button>
      </div>

      <div className={styles.body}>
        {/* ── TABLE ── */}
        <div className={styles.tableWrap}>
          {/* Table header */}
          <div className={styles.tableHead}>
            <span className={styles.thPlayer}>PLAYER</span>
            <span className={styles.thClub}>CLUB</span>
            <span className={styles.thPos}>POSITION</span>
            <span className={styles.thSortable} onClick={() => toggleSort('cost')}>
              PRICE (CREDITS) {sortKey === 'cost' ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
            </span>
            <span className={styles.thSortable} onClick={() => toggleSort('selected')}>
              SELECTED BY % {sortKey === 'selected' ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
            </span>
            <span className={styles.thForm}>FORM (LAST 5)</span>
            <span className={styles.thSortable} onClick={() => toggleSort('totalPts')}>
              SEASON POINTS {sortKey === 'totalPts' ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
            </span>
            <span className={styles.thAction}>ACTION</span>
          </div>

          {/* Rows */}
          {pageRows.map((p, i) => {
            const isSelected = selected?.id === p.id;
            const form_ = getForm(p.id.charCodeAt(1) ?? i);
            const color = posColor[p.position] ?? '#8135FA';

            return (
              <div
                key={p.id}
                className={`${styles.tableRow}${isSelected ? ` ${styles.tableRowActive}` : ''}`}
                onClick={() => setSelected(isSelected ? null : p)}
              >
                <div className={styles.tdPlayer}>
                  <div className={styles.playerAvatar} style={{ background: color }}>
                    {p.name[0]}
                  </div>
                  <div>
                    <div className={styles.playerName}>{p.name}</div>
                    <div className={styles.playerSubPos} style={{ color }}>{p.position} · {p.club.split(' ')[0]}</div>
                  </div>
                </div>
                <div className={styles.tdClub}>
                  <div className={styles.clubBadge}>{p.club.split(' ').map(w => w[0]).join('').slice(0,3)}</div>
                  <span>{p.club}</span>
                </div>
                <div className={styles.tdPos}>
                  <span className={styles.posBadge} style={{ background: color }}>{p.position}</span>
                </div>
                <div className={styles.tdPrice}>{p.cost}</div>
                <div className={styles.tdSelected}>{p.selected}%</div>
                <div className={styles.tdForm}>
                  {form_.map((f, fi) => (
                    <span key={fi} className={styles.formBadge} style={{ background: formColor[f] }}>{f}</span>
                  ))}
                </div>
                <div className={styles.tdPts}>{p.totalPts}</div>
                <div className={styles.tdAction}>
                  <button
                    className={styles.addBtn}
                    onClick={e => { e.stopPropagation(); setSelected(p); }}
                  >+</button>
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div className={styles.tableFooter}>
            <span>Showing {(page - 1) * ROWS_PER_PAGE + 1} to {Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length} players</span>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(1)}>⟨⟨</button>
            <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>⟨</button>
            {paginationPages().map((pg, i) =>
              pg === '...'
                ? <span key={`e${i}`} className={styles.pageEllipsis}>...</span>
                : <button key={pg}
                    className={`${styles.pageBtn}${page === pg ? ` ${styles.pageBtnActive}` : ''}`}
                    onClick={() => setPage(pg as number)}>{pg}</button>
            )}
            <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>⟩</button>
            <button className={styles.pageBtn} disabled={page === totalPages} onClick={() => setPage(totalPages)}>⟩⟩</button>
          </div>
        </div>

        {/* ── PLAYER DETAIL PANEL ── */}
        {selected && stats && (
          <div className={styles.detailPanel}>
            <button className={styles.detailClose} onClick={() => setSelected(null)}>✕</button>

            <div className={styles.detailHero}>
              <div className={styles.detailInForm}>In Form</div>
              <div className={styles.detailAvatarLarge} style={{ background: posColor[selected.position] ?? '#8135FA' }}>
                {selected.name[0]}
              </div>
            </div>

            <div className={styles.detailBody}>
              <h2 className={styles.detailName}>{selected.name}</h2>
              <div className={styles.detailPos} style={{ color: posColor[selected.position] ?? '#8135FA' }}>
                {selected.position === 'FH' ? 'Fly Half' : selected.position === 'SH' ? 'Scrum Half' :
                 selected.position === 'CTR' ? 'Centre' : selected.position === 'PR' ? 'Prop' :
                 selected.position === 'HK' ? 'Hooker' : selected.position === 'LK' ? 'Lock' :
                 selected.position === 'FL' ? 'Flanker' : selected.position === 'NO8' ? 'Number 8' :
                 selected.position === 'WG' ? 'Wing' : selected.position === 'FB' ? 'Full Back' :
                 selected.position === 'GK' ? 'Goalkeeper' : selected.position === 'DEF' ? 'Defender' :
                 selected.position === 'MID' ? 'Midfielder' : selected.position === 'FWD' ? 'Forward' :
                 selected.position}
              </div>

              <div className={styles.detailClubRow}>
                <div className={styles.detailClubBadge}>{selected.club.split(' ').map(w=>w[0]).join('').slice(0,3)}</div>
                <span>{selected.club}</span>
              </div>

              <div className={styles.detailCost}>{selected.cost.toFixed(1)} Credits</div>

              <div className={styles.detailStats}>
                <div className={styles.detailStat}>
                  <span>{selected.selected}%</span><small>Selected By</small>
                </div>
                <div className={styles.detailStat}>
                  <span>{selected.totalPts}</span><small>Total Points</small>
                </div>
                <div className={styles.detailStat}>
                  <span>{stats.avgPts}</span><small>Avg Points</small>
                </div>
                <div className={styles.detailStat}>
                  <span>{stats.gamesPlayed}</span><small>Games Played</small>
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.detailSectionTitle}>RECENT FORM (LAST 5)</div>
                <div className={styles.detailForm}>
                  {form.map((f, i) => (
                    <span key={i} className={styles.detailFormBadge} style={{ background: formColor[f] }}>{f}</span>
                  ))}
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.detailSectionTitle}>SEASON STATS</div>
                <div className={styles.seasonStats}>
                  <div className={styles.seasonStat}><span>{stats.tries}</span><small>Tries</small></div>
                  <div className={styles.seasonStat}><span>{stats.conversions}</span><small>Conversions</small></div>
                  <div className={styles.seasonStat}><span>{stats.penalties}</span><small>Penalties</small></div>
                  <div className={styles.seasonStat}><span>{stats.dropGoals}</span><small>Drop Goals</small></div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <div className={styles.detailSectionTitle}>ABOUT</div>
                <p className={styles.detailAbout}>{stats.about}</p>
              </div>

              <button
                className={styles.addToSquadBtn}
                onClick={() => navigate('/fantasy')}
              >
                Add to Squad · {selected.cost.toFixed(1)} Credits →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
