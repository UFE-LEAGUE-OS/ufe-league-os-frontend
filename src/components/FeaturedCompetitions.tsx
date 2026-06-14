import './FeaturedCompetitions.css';

const competitions = [
  { name: 'Nile Special Rugby Premiership', logo: '🏉' },
  { name: 'Star Times Uganda Premier League', logo: '⚽' },
  { name: 'National Basketball League', logo: '🏀' },
  { name: 'The Budo League', logo: '🦁' },
  { name: 'SMACK League', logo: '🌍' },
];

function FeaturedCompetitions() {
  return (
    <section className="featured-competitions">
      <div className="section-header">
        <h2 className="section-title">FEATURED COMPETITONS</h2>
        <a href="#" className="view-all-link">View All Competitions</a>
      </div>

      <div className="competitions-row">
        {competitions.map((comp) => (
          <div className="competition-card" key={comp.name}>
            <div className="competition-logo">{comp.logo}</div>
            <span className="competition-name">{comp.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedCompetitions;