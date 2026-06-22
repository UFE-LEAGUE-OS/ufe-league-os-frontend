import { useNavigate } from 'react-router-dom';
import './QuickLinks.css';

import fixturesIcon from '../assets/fixtures.png';
import resultsIcon from '../assets/results.png';
import standingsIcon from '../assets/standings.png';
import clubsIcon from '../assets/clubs.png';
import unionsIcon from '../assets/unions.png';
import newsIcon from '../assets/news.png';

type QuickLink = {
  title: string;
  desc: string;
  icon: string;
  route: string;
};

const links: QuickLink[] = [
  {
    title: 'Fixtures',
    desc: 'View upcoming fixtures & schedules',
    icon: fixturesIcon,
    route: '/fixtures',
  },
  {
    title: 'Results',
    desc: 'Live scores & match results',
    icon: resultsIcon,
    route: '/results',
  },
  {
    title: 'Standings',
    desc: 'League tables & rankings',
    icon: standingsIcon,
    route: '/standings',
  },
  {
    title: 'Clubs',
    desc: 'Explore clubs & teams',
    icon: clubsIcon,
    route: '/clubs',
  },
  {
    title: 'Unions',
    desc: 'Federations & governing bodies',
    icon: unionsIcon,
    route: '/unions',
  },
  {
    title: 'News',
    desc: 'Latest news & stories',
    icon: newsIcon,
    route: '/news',
  },
];

function QuickLinks() {
  const navigate = useNavigate();

  return (
    <section className="quick-links">
      {links.map((link) => (
        <button
          type="button"
          className="quick-link-card"
          key={link.title}
          onClick={() => navigate(link.route)}
        >
          <div className="quick-link-text">
            <h3>{link.title}</h3>
            <p>{link.desc}</p>
          </div>

          <div className="quick-link-icon">
            <img src={link.icon} alt="" />
          </div>

          <span className="quick-link-arrow">→</span>
        </button>
      ))}
    </section>
  );
}

export default QuickLinks;
