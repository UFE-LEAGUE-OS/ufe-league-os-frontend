import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ctaBanner from '../../assets/cta-banner.png';
import footballImage from '../../assets/football-card.png';
import rugbyImage from '../../assets/rugby-card.png';
import basketballImage from '../../assets/basketball-card.png';
import '../../styles/pages/landing/unions.css';

type Union = {
  id: number;
  name: string;
  acronym: string;
  sport: string;
  description: string;
  members: string;
  founded: string;
  focus: string[];
  competitions: number;
  athletes: string;
  color: string;
  accentColor: string;
  emoji: string;
  website?: string;
  status: 'active' | 'developing';
  image: string;
};

const unions: Union[] = [
  {
    id: 1,
    name: 'Uganda Football Association',
    acronym: 'FUFA',
    sport: 'Football',
    description: 'The national governing body for football in Uganda, overseeing all competitive football from grassroots to the national teams — the Uganda Cranes.',
    members: '350+ clubs',
    founded: '1924',
    focus: ['Youth development', 'League administration', 'National team support', 'Referee training'],
    competitions: 12,
    athletes: '5,000+',
    color: 'rgba(255, 69, 0, 0.12)',
    accentColor: '#FF4500',
    emoji: '⚽',
    website: 'https://fufa.co.ug',
    status: 'active',
    image: footballImage,
  },
  {
    id: 2,
    name: 'Uganda Rugby Union',
    acronym: 'URU',
    sport: 'Rugby',
    description: 'The national governing body for rugby union in Uganda, developing the sport at all levels and fielding the Uganda Rugby Cranes on the international stage.',
    members: '18 clubs',
    founded: '1955',
    focus: ['Rugby development', 'Competition governance', 'National team support', 'Coaching accreditation'],
    competitions: 6,
    athletes: '800+',
    color: 'rgba(234, 88, 12, 0.12)',
    accentColor: '#EA580C',
    emoji: '🏉',
    website: 'https://ugandaragby.com',
    status: 'active',
    image: rugbyImage,
  },
  {
    id: 3,
    name: 'Uganda Basketball Federation',
    acronym: 'FUBA',
    sport: 'Basketball',
    description: 'Leads basketball growth across Uganda, managing elite competitions and developing the national teams — the Uganda Silverbacks and She Cranes.',
    members: '60 clubs',
    founded: '1968',
    focus: ['Talent pathways', 'Coaching development', 'League organization', 'School programs'],
    competitions: 5,
    athletes: '1,200+',
    color: 'rgba(2, 132, 199, 0.12)',
    accentColor: '#0284C7',
    emoji: '🏀',
    status: 'active',
    image: basketballImage,
  },
];

const stats = [
  { label: 'National Federations', value: '3', color: '#7C3AED' },
  { label: 'Registered Athletes', value: '8,000+', color: '#0284C7' },
  { label: 'Active Competitions', value: '22', color: '#10B981' },
  { label: 'Member Clubs', value: '425+', color: '#F59E0B' },
];

const sportFilters = ['All Sports', 'Football', 'Rugby', 'Basketball'];

export default function Unions() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Sports');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = unions.filter((u) => {
    const matchesSport = activeFilter === 'All Sports' || u.sport === activeFilter;
    const matchesSearch =
      searchQuery === '' ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.acronym.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  return (
    <div
      className="unions-page"
      style={{
        background: `linear-gradient(rgba(3,4,11,0.3), rgba(3,4,11,0.7)), url(${ctaBanner}) center/cover no-repeat`,
        backgroundAttachment: 'fixed',
      }}
    >
      <Navbar />

      <header className="unions-hero">
        <div className="unions-hero__orb--left" />
        <div className="unions-hero__orb--right" />

        <p className="unions-hero__eyebrow">Federations & Governing Bodies</p>
        <h1 className="unions-hero__title">
          The Unions Shaping <span>Sport Across Uganda</span>
        </h1>
        <p className="unions-hero__subtitle">
          Discover the national federations behind Uganda's competitions, athlete
          development and grassroots growth.
        </p>

        <div className="unions-stats">
          {stats.map((stat) => (
            <div key={stat.label} className="unions-stats__card">
              <p className="unions-stats__value" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="unions-stats__label">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      <main className="unions-main">

        <div className="unions-controls">
          <input
            type="text"
            placeholder="Search unions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="unions-search"
          />
          <div className="unions-sport-filters">
            {sportFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`unions-sport-filters__btn ${
                  activeFilter === filter ? 'unions-sport-filters__btn--active' : ''
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <p className="unions-results-count">
          Showing {filtered.length} of {unions.length} federations
        </p>

        <div className="unions-grid">
          {filtered.map((union) => (
            <article
              key={union.id}
              onClick={() => setExpandedId(expandedId === union.id ? null : union.id)}
              className="union-card"
              style={{
                border: `1px solid ${
                  expandedId === union.id ? union.accentColor : 'rgba(148,163,184,0.08)'
                }`,
                boxShadow:
                  expandedId === union.id
                    ? `0 0 40px ${union.color}`
                    : '0 4px 24px rgba(0,0,0,0.2)',
              }}
            >
              <div className="union-card__header">
                <div className="union-card__header-left">
                  <div className="union-card__image-wrap">
                    <img
                      src={union.image}
                      alt={`${union.name} card`}
                      className="union-card__image"
                    />
                  </div>
                  <div className="union-card__body">
                    <p className="union-card__sport">{union.sport}</p>
                    <h3 className="union-card__title">{union.name}</h3>
                  </div>
                </div>

                <div className="union-card__founded">
                  <p className="union-card__founded-label">Est.</p>
                  <p className="union-card__founded-year" style={{ color: union.accentColor }}>
                    {union.founded}
                  </p>
                </div>
              </div>

              <p className="union-card__description">{union.description}</p>

              <div className="union-card__stats">
                {[
                  { label: 'Members', value: union.members },
                  { label: 'Athletes', value: union.athletes },
                  { label: 'Competitions', value: String(union.competitions) },
                ].map((stat) => (
                  <div key={stat.label} className="union-card__stat">
                    <p className="union-card__stat-value">{stat.value}</p>
                    <p className="union-card__stat-label">{stat.label}</p>
                  </div>
                ))}
              </div>

              {expandedId === union.id && (
                <div className="union-card__expanded">
                  <p className="union-card__focus-heading">Key Focus Areas</p>
                  <div className="union-card__focus-tags">
                    {union.focus.map((f) => (
                      <span
                        key={f}
                        className="union-card__focus-tag"
                        style={{
                          background: union.color,
                          border: `1px solid ${union.accentColor}33`,
                          color: union.accentColor,
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="union-card__actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/competitions');
                      }}
                      className="union-card__action-btn"
                      style={{ background: union.accentColor }}
                    >
                      View Competitions →
                    </button>
                    {union.website && (
                      
                      <a href={union.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="union-card__website-link"
                      >
                        Official Website ↗
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="union-card__expand-hint">
                <span>{expandedId === union.id ? '▲ Less' : '▼ More details'}</span>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="unions-empty">
            <p className="unions-empty__icon">🔍</p>
            <p className="unions-empty__title">No unions found for "{searchQuery}"</p>
            <p className="unions-empty__hint">Try a different search term or filter</p>
          </div>
        )}

        <div className="unions-cta">
          <h2 className="unions-cta__title">Is Your Federation on League OS?</h2>
          <p className="unions-cta__subtitle">
            Partner with us to digitise your competitions, manage registrations,
            and engage your fan base.
          </p>
          <button onClick={() => navigate('/register')} className="unions-cta__btn">
            Get Started →
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}