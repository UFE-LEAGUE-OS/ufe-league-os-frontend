import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import FeaturedCompetitions from '../../components/FeaturedCompetitions';
import SportCategories from '../../components/SportCategories';
import QuickLinks from '../../components/QuickLinks';
import FeaturedClubs from '../../components/FeaturedClubs';
import LiveFixturesResults from '../../components/LiveFixturesResults';
import FantasyLeagues from '../../components/FantasyLeagues';
import CTABanner from '../../components/CTABanner';
import Footer from '../../components/Footer';
import '../../styles/pages/landing.css';

const landingNavLinks = [
  { label: 'Sport', route: '/sports' },
  { label: 'Leagues', route: '/leagues', showArrow: true },
  { label: 'Clubs', route: '/clubs' },
  { label: 'Competitions', route: '/competitions' },
  { label: 'News', route: '/news' },
  { label: 'Tickets', route: '/tickets' },
];

export default function Landing() {
  return (
    <div className="landing-page">
      <Navbar links={landingNavLinks} />
      <Hero />
      <FeaturedCompetitions />
      <SportCategories />
      <QuickLinks />
      <FeaturedClubs />
      <LiveFixturesResults />
      <FantasyLeagues />
      <CTABanner />
      <Footer />
    </div>
  );
}