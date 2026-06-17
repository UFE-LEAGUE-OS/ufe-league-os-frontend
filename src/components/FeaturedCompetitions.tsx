import './FeaturedCompetitions.css';
import nileRugby from '../assets/nile-rugby.svg';
import starTimesUpl from '../assets/star-times-upl.svg';
import nationalBasketball from '../assets/national-basketball.svg';
import buddoLeague from '../assets/buddo-league.svg';
import smackLeague from '../assets/smack-league.svg';

const competitions = [
  { name: 'Nile Special Rugby Premiership', logo: nileRugby },
  { name: 'Star Times Uganda Premier League', logo: starTimesUpl },
  { name: 'National Basketball League', logo: nationalBasketball },
  { name: 'The Budo League', logo: buddoLeague },
  { name: 'SMACK League', logo: smackLeague },
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
            <div className="competition-logo">
              <img src={comp.logo} alt={comp.name} />
            </div>
            <span className="competition-name">{comp.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedCompetitions;