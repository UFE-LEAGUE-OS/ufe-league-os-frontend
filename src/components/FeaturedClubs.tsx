import './FeaturedClubs.css';

const clubs = [
  { name: 'KCCA FC', type: 'Football Club', tagline: 'The Pride of Kampala', logo: '🦁' },
  { name: 'KCB KOBS', type: 'Rugby Club', tagline: 'Poetry in Motion', logo: '🐺' },
  { name: 'IMPIS RFC', type: 'Rugby Club', tagline: 'Arrogance', logo: '🌿' },
  { name: 'SC Villa', type: 'Football Club', tagline: 'Joogos for Life', logo: '🛡️' },
  { name: 'STANBIC BLACK PIRATES', type: 'Rugby Club', tagline: 'Pirates Strong', logo: '☠️' },
  { name: 'PLATINUM HEATHENS', type: 'Rugby Club', tagline: 'Yellow Machine', logo: '⚔️' },
  { name: 'NAMUWONGO BLAZERS', type: 'Basketball Club', tagline: 'The Slum Dwellers', logo: '🔥' },
];

function FeaturedClubs() {
  return (
    <section className="featured-clubs">
      <div className="section-header">
        <h2 className="section-title">FEATURED CLUBS</h2>
        <a href="#" className="view-all-link">View All Clubs</a>
      </div>

      <div className="clubs-row">
        {clubs.map((club) => (
          <div className="club-card" key={club.name}>
            <div className="club-logo">{club.logo}</div>
            <h4 className="club-name">{club.name}</h4>
            <p className="club-type">{club.type}</p>
            <p className="club-tagline">{club.tagline}</p>
            <button className="become-member-btn">Become Member</button>
          </div>
        ))}
        <button className="clubs-arrow">→</button>
      </div>
    </section>
  );
}

export default FeaturedClubs;