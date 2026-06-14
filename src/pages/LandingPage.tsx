import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturedCompetitions from '../components/FeaturedCompetitions';
import SportCategories from '../components/SportCategories';
import QuickLinks from '../components/QuickLinks';
import FeaturedClubs from '../components/FeaturedClubs';
import LiveFixturesResults from '../components/LiveFixturesResults';
import FantasyLeagues from '../components/FantasyLeagues';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';

function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedCompetitions />
      <SportCategories />
      <QuickLinks />
      <FeaturedClubs />
      <LiveFixturesResults />
      <FantasyLeagues />
      <CTABanner />
      <Footer />
    </>
  );
}

export default LandingPage;