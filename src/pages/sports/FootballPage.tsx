import { useNavigate } from 'react-router-dom';
import { FiClock, FiExternalLink, FiHome } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import '../../components/SportCategories.css';
import bbcFeed from '../../data/bbcFootballFeed.json';

interface BBCItem {
  title: string;
  desc: string;
  link: string;
  pubDate: string;
  thumb: string;
}

const bbcItems: BBCItem[] = bbcFeed as BBCItem[];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function FootballPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#00030D', minHeight: '100vh', color: '#ffffff' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        {/* Back to Home button */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: '1px solid #2563EB',
              color: '#2563EB',
              padding: '8px 16px',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FiHome size={16} />
            Back to Home
          </button>
        </div>

        {/* Hero Section */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
            borderRadius: 12,
            padding: '40px 32px',
            marginBottom: 32,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <GiSoccerBall size={40} color="#93C5FD" />
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0 }}>Football</h1>
          </div>
          <p style={{ color: '#bfdbfe', fontSize: '1.1rem', margin: 0 }}>
            The world's game. From the local pitch to the big stage.
          </p>
        </div>

        {/* BBC Football News Feed */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 4,
                height: 28,
                background: '#2563EB',
                borderRadius: 2,
              }}
            />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
              Latest Football News
            </h2>
            <span style={{ color: '#6B7280', fontSize: '0.85rem' }}>
              via BBC Sport
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: 16,
            }}
          >
            {bbcItems.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: '#1a1a2e',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid #2d2d44',
                    transition: 'border-color 0.2s, transform 0.2s',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2d2d44';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {item.thumb && (
                    <div
                      style={{
                        width: '100%',
                        height: 180,
                        overflow: 'hidden',
                        background: '#0f0f23',
                      }}
                    >
                      <img
                        src={item.thumb}
                        alt={item.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        margin: '0 0 8px',
                        color: '#E5E7EB',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        color: '#9CA3AF',
                        fontSize: '0.85rem',
                        lineHeight: 1.5,
                        margin: '0 0 12px',
                        flex: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.desc}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'auto',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          color: '#6B7280',
                          fontSize: '0.8rem',
                        }}
                      >
                        <FiClock size={12} />
                        <span>{formatDate(item.pubDate)}</span>
                      </div>
                      <FiExternalLink size={14} color="#2563EB" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Ugandan Leagues Section */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div
              style={{
                width: 4,
                height: 28,
                background: '#10B981',
                borderRadius: 2,
              }}
            />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
              Ugandan Football Leagues
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            <div
              style={{
                background: '#1a1a2e',
                borderRadius: 12,
                padding: 24,
                border: '1px solid #2d2d44',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onClick={() => navigate('/leagues/uganda-premier-league')}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563EB')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2d2d44')}
            >
              <h3 style={{ color: '#2563EB', margin: '0 0 12px' }}>Uganda Premier League</h3>
              <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>
                Uganda's elite football division featuring 16 historic clubs.
              </p>
            </div>
            <div
              style={{
                background: '#1a1a2e',
                borderRadius: 12,
                padding: 24,
                border: '1px solid #2d2d44',
              }}
            >
              <h3 style={{ color: '#2563EB', margin: '0 0 12px' }}>FUFA Big League</h3>
              <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>
                The second tier of Ugandan football with promotion to the Premier League.
              </p>
            </div>
            <div
              style={{
                background: '#1a1a2e',
                borderRadius: 12,
                padding: 24,
                border: '1px solid #2d2d44',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onClick={() => navigate('/leagues/budo-league')}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563EB')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2d2d44')}
            >
              <h3 style={{ color: '#2563EB', margin: '0 0 12px' }}>Budo League</h3>
              <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>
                The premier old students football competition from King's College Budo.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}