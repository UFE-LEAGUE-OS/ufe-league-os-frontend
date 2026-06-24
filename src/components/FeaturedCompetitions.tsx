import './FeaturedCompetitions.css';
import nileRugby from '../assets/nile-rugby.svg';
import starTimesUpl from '../assets/star-times-upl.svg';
import nationalBasketball from '../assets/national-basketball.svg';
import buddoLeague from '../assets/buddo-league.svg';
import smackLeague from '../assets/smack-league.svg';
import { useNavigate } from 'react-router-dom';

const competitions = [
  { name: 'Nile Special Rugby Premiership', logo: nileRugby, route: '/leagues/nile-special-premiership' },
  { name: 'Star Times Uganda Premier League', logo: starTimesUpl, route: '/leagues/uganda-premier-league' },
  { name: 'National Basketball League', logo: nationalBasketball, route: '/leagues/national-basketball-league' },
  { name: 'The Budo League', logo: buddoLeague, route: '/leagues/budo-league' },
  { name: 'SMACK League', logo: smackLeague, route: '/leagues/smack-league' },
];

function FeaturedCompetitions() {
  const navigate = useNavigate();

  return (
    <section className="featured-competitions">
      <div className="section-header">
        <h2 className="section-title">FEATURED COMPETITONS</h2>
        <a href="#" className="view-all-link" onClick={(e) => { e.preventDefault(); navigate('/competitions'); }}>View All Competitions</a>
      </div>

      <div className="competitions-row">
        {competitions.map((comp) => (
          <div className="competition-card" key={comp.name} onClick={() => navigate(comp.route)}>
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