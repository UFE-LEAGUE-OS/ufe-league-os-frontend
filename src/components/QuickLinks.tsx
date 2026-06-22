import './QuickLinks.css';
import fixturesIcon from '../assets/fixtures.png';
import resultsIcon from '../assets/results.png';
import standingsIcon from '../assets/standings.png';
import clubsIcon from '../assets/clubs.png';
import unionsIcon from '../assets/unions.png';
import newsIcon from '../assets/news.png';
import { useNavigate } from "react-router-dom";

type QuickLink = {
  title: string;
  desc: string;
  icon: string;
  path: string;
};
const links: QuickLink[] = [
  { title: 'Fixtures', desc: 'View upcoming fixtures & schedules', icon: fixturesIcon, path:'/' },
  { title: 'Results', desc: 'Live scores & match results', icon: resultsIcon,path:'/' },
  { title: 'Standings', desc: 'League tables & rankings', icon: standingsIcon,path:'/' },
  { title: 'Clubs', desc: 'Explore clubs & teams', icon: clubsIcon,path:'/'},
  { title: 'Unions', desc: 'Federations & governing bodies', icon: unionsIcon , path:'/'},
  { title: 'News', desc: 'Latest news & stories', icon: newsIcon, path: '/news' },
];



function QuickLinks() {
  const navigate = useNavigate();
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
          <button className="quick-link-arrow" onClick={() => navigate(link.path)}>→</button>
        </div>
      ))}
    </section>
  );
}

export default QuickLinks;