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
      <div className="featured-competitions-header">
        <h2 className="featured-competitions-title">FEATURED COMPETITONS</h2>
        <a
          href="#"
          className="featured-competitions-view-all"
          onClick={(e) => {
            e.preventDefault();
            navigate('/competitions');
          }}
        >
          View All Competitions
        </a>
      </div>

      <div className="featured-competitions-row">
        {competitions.map((comp) => (
          <button
            type="button"
            className="featured-competition-card"
            key={comp.name}
            onClick={() => navigate(comp.route)}
          >
            <span className="featured-competition-logo">
              <img src={comp.logo} alt="" aria-hidden="true" />
            </span>
            <span className="featured-competition-name">{comp.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default FeaturedCompetitions;
