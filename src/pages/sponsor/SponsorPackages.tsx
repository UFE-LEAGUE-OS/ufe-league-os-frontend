import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiCheckCircle,
  FiInfo,
  FiChevronRight,
  FiStar,
} from 'react-icons/fi';
import { FiSliders } from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import '../../styles/pages/landing.css';
import './SponsorPackages.css';

const filterTabs = ['All', 'Popular', 'Clubs', 'Leagues', 'Events', 'Athletes'];

const packages = [
  {
    id: 'platinum',
    tier: 'PLATINUM',
    name: 'PARTNER',
    icon: '👑',
    iconBg: 'pkg-icon-grey',
    price: '50,000,000',
    currency: 'UGX',
    priceColor: 'pkg-price-purple',
    desc: 'Maximum visibility and impact across all platforms and touchpoints.',
    features: [
      'Logo on all league & club kits',
      'Logo on backdrops & press interviews',
      'Stadium LED & perimeter branding',
      'Match-day activation rights',
      '8 Social media mentions / month',
      'Hospitality: 20 VIP tickets / season',
      'Digital promotion across platforms',
      'Rights to use league marks',
    ],
    checkColor: 'pkg-check-purple',
    btnClass: 'pkg-btn-purple',
    cardClass: '',
    popular: false,
  },
  {
    id: 'gold',
    tier: 'GOLD',
    name: 'PARTNER',
    icon: '⭐',
    iconBg: 'pkg-icon-gold',
    price: '30,000,000',
    currency: 'UGX',
    priceColor: 'pkg-price-orange',
    desc: 'High-impact visibility with strong brand association and fan engagement.',
    features: [
      'Logo on front of club/training kits',
      'Logo on website & digital platforms',
      'Stadium signage (static)',
      'Match-day activation rights',
      '4 Social media mentions / month',
      'Hospitality: 10 VIP tickets / season',
      'Digital promotion & campaign support',
      'Category exclusivity (club level)',
    ],
    checkColor: 'pkg-check-orange',
    btnClass: 'pkg-btn-orange',
    cardClass: 'pkg-card-gold',
    popular: true,
  },
  {
    id: 'silver',
    tier: 'SILVER',
    name: 'PARTNER',
    icon: '🛡️',
    iconBg: 'pkg-icon-grey',
    price: '20,000,000',
    currency: 'UGX',
    priceColor: 'pkg-price-white',
    desc: 'Great visibility with regular brand exposure across key channels.',
    features: [
      'Logo on website & digital platforms',
      'Stadium signage (shared)',
      '2 Social media mentions / month',
      'Hospitality: 5 VIP tickets / season',
      'Digital promotion support',
      'Right to run promotions',
      'Acknowledgement in media releases',
    ],
    checkColor: 'pkg-check-grey',
    btnClass: 'pkg-btn-purple',
    cardClass: '',
    popular: false,
  },
  {
    id: 'bronze',
    tier: 'BRONZE',
    name: 'PARTNER',
    icon: '🔰',
    iconBg: 'pkg-icon-orange',
    price: '10,000,000',
    currency: 'UGX',
    priceColor: 'pkg-price-orange',
    desc: 'Entry-level sponsorship with essential brand exposure.',
    features: [
      'Logo on digital platforms',
      '1 Social media mention / month',
      'Stadium announcement mentions',
      'Hospitality: 2 VIP tickets / season',
      'Inclusion in sponsor roll call',
      'Access to promotional opportunities',
    ],
    checkColor: 'pkg-check-orange',
    btnClass: 'pkg-btn-purple',
    cardClass: '',
    popular: false,
  },
];

export default function SponsorPackages() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  return (
    <div className="spkg-page">

      <div className="spkg-layout">
        <SponsorSidebar />

        <main className="spkg-main landing-page">

          {/* Header */}
          <div className="spkg-header">
            <div className="spkg-header-left">
              <h1 className="spkg-title">Sponsor Packages</h1>
              <p className="spkg-subtitle">
                Explore sponsorship opportunities across our ecosystem.
              </p>
            </div>
            <div className="spkg-header-right">
              <div className="spkg-search-wrap">
                <FiSearch size={15} className="spkg-search-icon" />
                <input
                  className="spkg-search"
                  type="text"
                  placeholder="Search packages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="spkg-compare-btn">
                <FiSliders size={15} />
                Compare Packages
              </button>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="spkg-filter-tabs">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                className={`spkg-filter-tab ${activeFilter === tab ? 'spkg-filter-active' : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Package cards */}
          <div className="spkg-cards-grid">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`spkg-card ${pkg.cardClass}`}
              >
                {pkg.popular && (
                  <div className="spkg-popular-badge">
                    <FiStar size={11} /> Most Popular
                  </div>
                )}

                {/* Card header */}
                <div className="spkg-card-top">
                  <div className={`spkg-pkg-icon ${pkg.iconBg}`}>
                    <span className="spkg-pkg-emoji">{pkg.icon}</span>
                  </div>
                  <div>
                    <div className="spkg-tier-label">{pkg.tier}</div>
                    <div className="spkg-tier-name">{pkg.name}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="spkg-price-row">
                  <span className={`spkg-currency ${pkg.priceColor}`}>UGX</span>
                  <span className={`spkg-price ${pkg.priceColor}`}>{pkg.price}</span>
                </div>
                <div className="spkg-per-year">/ year</div>

                {/* Description */}
                <p className="spkg-desc">{pkg.desc}</p>

                <div className="spkg-divider" />

                {/* Features */}
                <ul className="spkg-features">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="spkg-feature-item">
                      <FiCheckCircle
                        size={15}
                        className={`spkg-check ${pkg.checkColor}`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  className={`spkg-btn ${pkg.btnClass}`}
                  onClick={() => navigate(`/sponsor/packages/${pkg.id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Bottom banner */}
          <div className="spkg-bottom-banner">
            <FiInfo size={16} className="spkg-banner-icon" />
            <p className="spkg-banner-text">
              All packages are customizable. Contact our sponsorship team to tailor a{' '}
              <span className="spkg-banner-link">package</span> that fits your goals.
            </p>
            <button
              className="spkg-talk-btn"
              onClick={() => navigate('/support')}
            >
              Talk to Sponsorship Team <FiChevronRight size={14} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}