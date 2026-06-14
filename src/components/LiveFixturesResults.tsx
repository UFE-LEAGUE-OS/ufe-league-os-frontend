import './LiveFixturesResults.css';

const liveFixtures = [
  { league: 'UPL', teamA: 'KCCA FC', scoreA: 2, scoreB: 1, teamB: 'Vipers SC', time: '35`' },
  { league: 'NSRPL', teamA: 'Betway KOBS', scoreA: 45, scoreB: 12, teamB: 'Stanbic Black Pirates', time: '71`' },
  { league: 'NBL', teamA: 'Namuwongo Blazers', scoreA: 20, scoreB: 12, teamB: 'City Oilers', time: '10`' },
  { league: 'TBL', teamA: 'Midnight Express', scoreA: 1, scoreB: 0, teamB: 'Dujay FC', time: '65`' },
];

const latestResults = [
  { league: 'UPL', teamA: 'SC Villa', scoreA: 0, scoreB: 3, teamB: 'Express FC' },
  { league: 'NSRPL', teamA: 'IMPIS RFC', scoreA: 25, scoreB: 7, teamB: 'Toyota Buffaloes' },
  { league: 'NSRPL', teamA: 'WARRIORS RFC', scoreA: 12, scoreB: 15, teamB: 'Jina Hippos' },
  { league: 'UPL', teamA: 'SOLITO BRIGHT STARS', scoreA: 2, scoreB: 1, teamB: 'Kitara FC' },
];

function LiveFixturesResults() {
  return (
    <section className="fixtures-results">
      <div className="fixtures-col">
        <div className="section-header">
          <div className="title-with-badge">
            <h2 className="section-title">LIVE FIXTURES</h2>
            <span className="live-badge">● Live</span>
          </div>
          <a href="#" className="view-all-link">View All Live Fixtures</a>
        </div>

        <div className="match-table">
          {liveFixtures.map((m, i) => (
            <div className="match-row" key={i}>
              <span className="match-league">{m.league}</span>
              <span className="match-team">{m.teamA}</span>
              <span className="match-score">{m.scoreA} - {m.scoreB}</span>
              <span className="match-team">{m.teamB}</span>
              <span className="match-time">{m.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="fixtures-col">
        <div className="section-header">
          <h2 className="section-title">LATEST RESULTS</h2>
          <a href="#" className="view-all-link">View All Results</a>
        </div>

        <div className="match-table">
          {latestResults.map((m, i) => (
            <div className="match-row" key={i}>
              <span className="match-league">{m.league}</span>
              <span className="match-team">{m.teamA}</span>
              <span className="match-score">{m.scoreA} - {m.scoreB}</span>
              <span className="match-team">{m.teamB}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LiveFixturesResults;