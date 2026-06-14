import './QuickLinks.css';

const links = [
  { title: 'Fixtures', desc: 'View upcoming fixtures & schedules', icon: '📅' },
  { title: 'Results', desc: 'Live scores & match results', icon: '⏱️' },
  { title: 'Standings', desc: 'League tables & rankings', icon: '🏆' },
  { title: 'Clubs', desc: 'Explore clubs & teams', icon: '🛡️' },
  { title: 'Unions', desc: 'Federations & governing bodies', icon: '🎵' },
  { title: 'News', desc: 'Latest news & stories', icon: '📰' },
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
          <div className="quick-link-icon">{link.icon}</div>
          <button className="quick-link-arrow">→</button>
        </div>
      ))}
    </section>
  );
}

export default QuickLinks;