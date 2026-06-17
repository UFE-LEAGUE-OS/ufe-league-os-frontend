import './QuickLinks.css';
import fixturesIcon from '../assets/fixtures.png';
import resultsIcon from '../assets/results.png';
import standingsIcon from '../assets/standings.png';
import clubsIcon from '../assets/clubs.png';
import unionsIcon from '../assets/unions.png';
import newsIcon from '../assets/news.png';

const links = [
  { title: 'Fixtures', desc: 'View upcoming fixtures & schedules', icon: fixturesIcon },
  { title: 'Results', desc: 'Live scores & match results', icon: resultsIcon },
  { title: 'Standings', desc: 'League tables & rankings', icon: standingsIcon },
  { title: 'Clubs', desc: 'Explore clubs & teams', icon: clubsIcon },
  { title: 'Unions', desc: 'Federations & governing bodies', icon: unionsIcon },
  { title: 'News', desc: 'Latest news & stories', icon: newsIcon },
];

function QuickLinks() {
  return (
    <section className="quick-links">
      {links.map((link) => (
        <div className="quick-link-card" key={link.title}>
          <div className="quick-link-text">
            <h3>{link.title}</h3>
            <p>{link.desc}</p>
          </div>
          <div className="quick-link-icon">
            <img src={link.icon} alt={link.title} />
          </div>
          <button className="quick-link-arrow">→</button>
        </div>
      ))}
    </section>
  );
}

export default QuickLinks;