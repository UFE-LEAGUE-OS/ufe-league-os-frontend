import './FantasyLeagues.css';

const leagues = [
  {
    name: 'UPL Fantasy',
    season: '2025/26 Season',
    desc: 'Create your squad from UPL stars and manage them to victory.',
    logo: '🇺🇬',
  },
  {
    name: 'Rugby Premiership Fantasy',
    season: '2025/26 Season',
    desc: 'Pick your XV and dominate the pitch every weekend.',
    logo: '🏉',
  },
  {
    name: 'SMACK League Fantasy',
    season: '2023/24 Season',
    desc: 'Create your squad from SMACK League stars and manage them to victory.',
    logo: '🌍',
  },
  {
    name: 'NBL Fantasy',
    season: '2025/26 Season',
    desc: 'Assemble your five and climb the ranks to the top.',
    logo: '🏀',
  },
];

function FantasyLeagues() {
  return (
    <section className="fantasy-leagues">
      <div className="section-header">
        <h2 className="section-title">FANTASY PREMIER LEAGUES</h2>
        <a href="#" className="view-all-link">View All Fantasy Leagues</a>
      </div>

      <div className="fantasy-row">
        {leagues.map((league) => (
          <div className="fantasy-card" key={league.name}>
            <div className="fantasy-header">
              <div className="fantasy-logo">{league.logo}</div>
              <div>
                <h4 className="fantasy-name">{league.name}</h4>
                <p className="fantasy-season">{league.season}</p>
              </div>
            </div>
            <p className="fantasy-desc">{league.desc}</p>
            <button className="join-league-btn">Join League</button>
          </div>
        ))}
        <button className="fantasy-arrow">→</button>
      </div>
    </section>
  );
}

export default FantasyLeagues;