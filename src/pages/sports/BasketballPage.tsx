import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

import headerBasketImg from '../../assets/header_basket.jfif';
import basketChampionsImg from '../../assets/basket_champions.jfif';
import namBlazersImg from '../../assets/nam-blazers.png';
import basketballCardImg from '../../assets/basketball-card.png';
import nblImg1 from '../../assets/national basket league/images (1).jfif';
import nblImg2 from '../../assets/national basket league/images (2).jfif';
import nblImg3 from '../../assets/national basket league/images (3).jfif';
import nblImg4 from '../../assets/national basket league/images (4).jfif';
import nblDownload from '../../assets/national basket league/download.jfif';

const competitions = [
  {
    title: 'National Basketball League',
    description: "Uganda's premier basketball competition featuring 13 teams, with Namuwongo Blazers as current champions.",
    route: '/leagues/national-basketball-league',
    image: basketChampionsImg,
  },
  {
    title: 'FUBA Division One',
    description: 'The second tier of Ugandan basketball, serving as the main promotion pathway to the NBL.',
    route: null,
    image: nblImg1,
  },
  {
    title: 'FUBA Cup',
    description: 'The knockout cup competition in Uganda, open to all registered basketball clubs.',
    route: null,
    image: nblImg2,
  },
  {
    title: 'FIBA Basketball World Cup',
    description: "The top international tournament where men's national teams compete for global success.",
    route: null,
    image: nblImg3,
  },
  {
    title: 'Olympic Basketball Tournament',
    description: "Where the world's top national teams compete for gold on sport's biggest stage.",
    route: null,
    image: nblImg4,
  },
  {
    title: '3x3 Basketball',
    description: "Inspired by streetball and played globally, recognised as the world's leading urban team sport.",
    route: null,
    image: nblDownload,
  },
];

const rules = [
  { label: 'Teams', detail: 'Two teams of five players each, selected from a roster of up to 12.' },
  { label: 'Objective', detail: "Score by shooting the ball through the opponent's hoop while preventing them from scoring." },
  { label: 'Scoring', detail: 'Field goal = 2 pts. Beyond the three-point line = 3 pts. Free throw = 1 pt.' },
  { label: 'Duration', detail: 'Four 10-minute quarters. If tied, a 5-minute overtime is added.' },
  { label: 'Positions', detail: 'Guards handle the ball; forwards and centers play near the basket; wings are versatile.' },
  { label: 'Violations', detail: 'Players cannot lift or drag their pivot foot without dribbling or carry the ball.' },
];

const gallery = [
  { src: headerBasketImg, alt: 'Basketball action' },
  { src: nblImg1, alt: 'NBL game' },
  { src: nblImg2, alt: 'Basketball players' },
  { src: nblImg3, alt: 'Basketball match' },
  { src: namBlazersImg, alt: 'Nam Blazers' },
  { src: basketballCardImg, alt: 'Basketball card' },
];

export default function BasketballPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#00030D', minHeight: '100vh', color: '#ffffff', fontFamily: 'var(--font-body)' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0' }}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'transparent', border: '1px solid rgba(249,115,22,0.5)', color: '#F97316', padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}
        >
          ← Back
        </button>

        {/* Hero */}
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 40, position: 'relative', height: 420 }}>
          <img src={headerBasketImg} alt="Basketball" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(234,88,12,0.85) 0%, rgba(0,3,13,0.5) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 36, left: 40 }}>
            <p style={{ color: '#fed7aa', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>FIBA · Uganda · Global</p>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, margin: '0 0 10px', fontFamily: "var(--font-heading)", textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>Basketball</h1>
            <p style={{ color: '#fed7aa', fontSize: '1.05rem', margin: 0, maxWidth: 480, lineHeight: 1.6 }}>
              Fast breaks. Big plays. Over 3.3 billion fans worldwide.
            </p>
          </div>
        </div>

        {/* About */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 16px', color: '#fff' }}>Uniting Over a Billion People Across the Globe</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <p style={{ color: '#9ca3af', lineHeight: 1.8, marginBottom: 14 }}>
                Invented in 1891 by James Naismith in Springfield, Massachusetts, basketball has a long and rich history. Fast-paced, dynamic and exciting, it is one of the most popular sports globally with over 3.3 billion fans.
              </p>
              <p style={{ color: '#9ca3af', lineHeight: 1.8, margin: 0 }}>
                Basketball is played by millions — from local grassroots level to elite global stars competing at the FIBA Basketball World Cups and the Olympics. FIBA sanctions and organises international competitions for basketball, 3x3 and eFIBA.
              </p>
            </div>
            <img src={nblImg2} alt="Basketball community" style={{ width: '100%', height: 280, objectFit: 'cover', borderRadius: 12 }} />
          </div>
        </section>

        {/* How the Game Works */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 20px', color: '#fff' }}>How the Game Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {rules.map((rule) => (
              <div key={rule.label} style={{ background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.18)', borderRadius: 12, padding: '18px 20px' }}>
                <h4 style={{ color: '#F97316', margin: '0 0 7px', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{rule.label}</h4>
                <p style={{ color: '#d1d5db', margin: 0, fontSize: 14, lineHeight: 1.6 }}>{rule.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Gameplay image strip */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {gallery.slice(0, 3).map((img) => (
              <img key={img.src} src={img.src} alt={img.alt} style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 10 }} />
            ))}
          </div>
        </section>

        {/* Dynamic game section */}
        <section style={{ marginBottom: 48, background: 'rgba(249,115,22,0.05)', borderRadius: 16, padding: '32px 28px', border: '1px solid rgba(249,115,22,0.12)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center' }}>
          <img src={nblImg3} alt="Basketball game" style={{ width: '100%', height: 260, objectFit: 'cover', borderRadius: 12 }} />
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 14px', color: '#fff' }}>A Dynamic Sport Played in All Corners of the World</h2>
            <p style={{ color: '#9ca3af', lineHeight: 1.8, margin: '0 0 12px' }}>
              Players advance the ball by dribbling or passing. Offensive players use layups, jump shots, and dunks to score. Defensively, players attempt to intercept passes, steal the ball, or block shots without fouling.
            </p>
            <p style={{ color: '#9ca3af', lineHeight: 1.8, margin: 0 }}>
              While modern basketball is fluid, taller players typically play forward or center, guards are smaller and quicker, and wing players are versatile — switching between guard and forward positions.
            </p>
          </div>
        </section>

        {/* Competitions */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 20px', color: '#fff' }}>Competitions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {competitions.map((comp) => (
              <div
                key={comp.title}
                onClick={() => comp.route && navigate(comp.route)}
                style={{ background: '#0f1123', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(249,115,22,0.15)', cursor: comp.route ? 'pointer' : 'default', transition: 'border-color 0.15s ease' }}
                onMouseEnter={(e) => { if (comp.route) (e.currentTarget as HTMLDivElement).style.borderColor = '#F97316'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(249,115,22,0.15)'; }}
              >
                <img src={comp.image} alt={comp.title} style={{ width: '100%', height: 150, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '16px 18px' }}>
                  <h3 style={{ color: '#F97316', margin: '0 0 8px', fontSize: '0.95rem', fontWeight: 700 }}>
                    {comp.title} {comp.route && <span style={{ fontSize: 12 }}>→</span>}
                  </h3>
                  <p style={{ color: '#9ca3af', margin: 0, fontSize: 13, lineHeight: 1.6 }}>{comp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gallery strip */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 16px', color: '#fff' }}>Gallery</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {gallery.slice(3).map((img) => (
              <img key={img.src} src={img.src} alt={img.alt} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 10 }} />
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 48, position: 'relative' }}>
          <img src={nblImg4} alt="Basketball CTA" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(234,88,12,0.88), rgba(249,115,22,0.75))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
            <h2 style={{ margin: '0 0 10px', fontSize: '1.6rem', fontWeight: 800 }}>Experience Ugandan Hoops</h2>
            <p style={{ color: '#fed7aa', margin: '0 0 20px', fontSize: 15 }}>Follow the NBL, get live scores, and never miss a moment.</p>
            <button onClick={() => navigate('/register')} style={{ background: '#fff', color: '#EA580C', border: 'none', borderRadius: 8, padding: '12px 32px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Create Free Account
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
