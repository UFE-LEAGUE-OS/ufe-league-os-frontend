import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import rugbyCard from '../../assets/rugby-card.png';
import ugandaRugby from '../../assets/uganda_rugby.jfif';
import rugbyChampions from '../../assets/rugbychampions.jfif';

export default function RugbyPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#00030D', minHeight: '100vh', color: '#ffffff' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid #7C3AED', color: '#7C3AED', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', marginBottom: 24, fontWeight: 600 }}>
          ← Back
        </button>
        <div style={{ background: 'linear-gradient(135deg, #4C1D95, #7C3AED)', borderRadius: 12, padding: '40px 32px', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: 0, top: 0, width: '40%', height: '100%', opacity: 0.3 }}>
            <img src={rugbyCard} alt="Rugby" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 8px' }}>Rugby</h1>
            <p style={{ color: '#ddd6fe', fontSize: '1.1rem', margin: 0 }}>Strength. Passion. Unity. Experience the power of Ugandan rugby.</p>
          </div>
        </div>
        <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 32, marginBottom: 32, border: '1px solid #2d2d44' }}>
          <h2 style={{ color: '#7C3AED', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 16px' }}>About Rugby Union</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center' }}>
            <div>
              <p style={{ color: '#9ca3af', lineHeight: 1.8, margin: '0 0 12px' }}>
                Rugby union football, commonly known simply as rugby union or often just rugby, is a close-contact team sport that originated at Rugby School in England in the first half of the 19th century. Rugby involves running with the ball in hand. In its most common form, the game is played between two teams of 15 players each, using an oval-shaped ball on a rectangular field called a pitch. The field has H-shaped goalposts at both ends.
              </p>
              <p style={{ color: '#9ca3af', lineHeight: 1.8, margin: '0 0 12px' }}>
                The objective of the game is to score more points than the opposing team by scoring tries, conversion kicks, penalties, and drop goals. Rugby union is a popular sport around the world, played by people regardless of gender, age or size. In 2023, there were more than 10 million players worldwide, of whom 8.4 million were registered.
              </p>
              <p style={{ color: '#9ca3af', lineHeight: 1.8, margin: 0 }}>
                World Rugby, previously called the International Rugby Football Board (IRFB) and the International Rugby Board (IRB), has been the governing body for rugby union since 1886, and currently has 116 countries as full members and 18 associate members. Major international competitions include the Rugby World Cup (first held in 1987), the Six Nations Championship in Europe, and The Rugby Championship in the Southern Hemisphere.
              </p>
            </div>
            <div style={{ borderRadius: 8, overflow: 'hidden', height: '250px' }}>
              <img src={ugandaRugby} alt="Uganda Rugby" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
        <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 32, marginBottom: 32, border: '1px solid #2d2d44' }}>
          <h2 style={{ color: '#7C3AED', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 16px' }}>Latest Rugby News & Updates</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            <div style={{ background: '#00030D', borderRadius: 8, overflow: 'hidden', border: '1px solid #2d2d44' }}>
              <div style={{ height: '180px', overflow: 'hidden' }}>
                <img src={rugbyChampions} alt="Rugby Champions" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 8px' }}>TALKING POINT: Lessons from FIFA that World Rugby should learn before 2031</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.95rem', margin: 0 }}>Key insights on how World Rugby can prepare for the 2031 World Cup by examining FIFA's approaches.</p>
              </div>
            </div>
            <div style={{ background: '#00030D', borderRadius: 8, overflow: 'hidden', border: '1px solid #2d2d44' }}>
              <div style={{ height: '180px', overflow: 'hidden' }}>
                <img src={ugandaRugby} alt="Uganda Rugby" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 8px' }}>BOK WRAP: Cheslin provides safety net for Rassie amidst Handre form concern</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.95rem', margin: 0 }}>Springboks analysis: How Cheslin Kolbe's performance provides cover for the coaching staff.</p>
              </div>
            </div>
            <div style={{ background: '#00030D', borderRadius: 8, overflow: 'hidden', border: '1px solid #2d2d44' }}>
              <div style={{ height: '180px', overflow: 'hidden' }}>
                <img src={rugbyCard} alt="Rugby" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 600, margin: '0 0 8px' }}>URC SEASON WRAP: It was the Stormers who really missed out</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.95rem', margin: 0 }}>United Rugby Championship season review: Examining the Stormers' campaign and what could have been.</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 24, border: '1px solid #2d2d44', cursor: 'pointer' }} onClick={() => navigate('/leagues/nile-special-premiership')}>
            <h3 style={{ color: '#7C3AED', margin: '0 0 12px' }}>Nile Special Rugby Premiership</h3>
            <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>Uganda's top-tier rugby union competition featuring 10 elite clubs.</p>
          </div>
          <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 24, border: '1px solid #2d2d44', cursor: 'pointer' }} onClick={() => navigate('/leagues/smack-league')}>
            <h3 style={{ color: '#7C3AED', margin: '0 0 12px' }}>SMACK League</h3>
            <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>Uganda's premier social rugby 7s league, powered by Guinness.</p>
          </div>
          <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 24, border: '1px solid #2d2d44' }}>
            <h3 style={{ color: '#7C3AED', margin: '0 0 12px' }}>Uganda Cup</h3>
            <p style={{ color: '#9ca3af', lineHeight: 1.6 }}>The knockout rugby competition showcasing the best of Ugandan rugby.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}