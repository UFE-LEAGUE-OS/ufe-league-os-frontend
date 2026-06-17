import './FeaturedClubs.css';
import kccaLogo from '../assets/kcca.png';
import kobsLogo from '../assets/kobs.jpg';
import impisLogo from '../assets/impis.jpg';
import scVillaLogo from '../assets/sc-villa.png';
import piratesLogo from '../assets/standic-pirates.png';
import platinumLogo from '../assets/platinum-heathens.jpg';
import blazersLogo from '../assets/nam-blazers.png';

const clubs = [
  { name: 'KCCA FC', type: 'Football Club', tagline: 'The Pride of Kampala', logo: kccaLogo },
  { name: 'KCB KOBS', type: 'Rugby Club', tagline: 'Poetry in Motion', logo: kobsLogo },
  { name: 'IMPIS RFC', type: 'Rugby Club', tagline: 'Arrogance', logo: impisLogo },
  { name: 'SC Villa', type: 'Football Club', tagline: 'Joogos for Life', logo: scVillaLogo },
  { name: 'STANBIC BLACK PIRATES', type: 'Rugby Club', tagline: 'Pirates Strong', logo: piratesLogo },
  { name: 'PLATINUM HEATHENS', type: 'Rugby Club', tagline: 'Yellow Machine', logo: platinumLogo },
  { name: 'NAMUWONGO BLAZERS', type: 'Basketball Club', tagline: 'The Slum Dwellers', logo: blazersLogo },
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
            <div className="club-logo">
              <img src={club.logo} alt={club.name} />
            </div>
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