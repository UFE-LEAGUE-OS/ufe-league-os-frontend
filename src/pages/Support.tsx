import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const faqItems = [
  { q: 'How do I create an account?', a: 'Click "Sign Up" on the homepage, fill in your details, verify your email, and you\'re ready to follow your favourite Ugandan sports teams.' },
  { q: 'How do I buy tickets for matches?', a: 'Navigate to the Tickets section, select your match, choose your seats, and complete payment through our secure checkout.' },
  { q: 'Can I follow multiple sports?', a: 'Absolutely! League OS covers football, rugby, basketball, netball, cricket and more. Personalize your feed to follow all your favourite sports.' },
  { q: 'How do fantasy leagues work?', a: 'Create your squad from real players in the UPL, Rugby Premiership, NBL and SMACK League. Score points based on their real-life performances.' },
  { q: 'Is my personal data secure?', a: 'Yes. We use industry-standard encryption and never share your data with third parties without your consent.' },
  { q: 'How do I reset my password?', a: 'Click "Forgot Password" on the login page, enter your email, and we\'ll send you a secure reset code.' },
  { q: 'How do I follow a specific team?', a: 'Search for your team using the search bar, visit their profile page, and click the "Follow" button to get updates and notifications.' },
  { q: 'Can I get match notifications?', a: 'Yes! Enable push notifications in your account settings to receive real-time updates on scores, match starts, and important events.' },
];

const contactMethods = [
  { title: '📧 Email Support', detail: 'support@leagueos.ug', desc: 'We respond within 24 hours' },
  { title: '📞 Phone', detail: '+256 700 123 456', desc: 'Mon-Fri, 8:00 AM - 6:00 PM EAT' },
  { title: '📍 Visit Us', detail: 'Plot 42, Lugogo Road', desc: 'Kampala, Uganda' },
];

const helpTopics = [
  { title: 'Getting Started', desc: 'New to League OS? Learn the basics of navigating the platform.', link: '/support/getting-started', icon: '🚀' },
  { title: 'Account & Billing', desc: 'Manage your account settings, subscriptions and payment methods.', link: '/support/account', icon: '👤' },
  { title: 'Tickets & Events', desc: 'How to purchase, transfer and manage your match tickets.', link: '/support/tickets', icon: '🎫' },
  { title: 'Fantasy Leagues', desc: 'Rules, scoring, and tips for dominating your fantasy league.', link: '/support/fantasy', icon: '🏆' },
  { title: 'Technical Support', desc: 'Troubleshooting common issues with the platform.', link: '/support/technical', icon: '🔧' },
  { title: 'Safety & Privacy', desc: 'Our commitment to keeping your data safe and secure.', link: '/support/privacy', icon: '🔒' },
];

const quickLinks = [
  { title: 'Report a Bug', desc: 'Found something not working? Let us know.', link: '/support/report-bug' },
  { title: 'Feature Request', desc: 'Have an idea? We\'d love to hear it.', link: '/support/feature-request' },
  { title: 'Status Page', desc: 'Check the current operational status of League OS.', link: '/support/status' },
];

function Support() {
  return (
    <div style={{ background: '#00030D', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 56px' }}>
        <h1 style={{ fontFamily: 'League Spartan, sans-serif', fontSize: '2.8rem', fontStyle: 'italic', fontWeight: 800, marginBottom: 8 }}>
          SUPPORT <span style={{ color: '#F97316' }}>CENTER</span>
        </h1>
        <p style={{ color: '#9CA3AF', marginBottom: 48, fontSize: '0.95rem' }}>
          We're here to help you get the most out of League OS.
        </p>

        {/* Help Topics */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '1.3rem', marginBottom: 20 }}>HELP TOPICS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {helpTopics.map((topic) => (
              <Link key={topic.title} to={topic.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: '#12131F', borderRadius: 12, padding: 24, border: '1px solid #1F2937', transition: 'all 0.2s', cursor: 'pointer', height: '100%' }}
                     onMouseEnter={e => { e.currentTarget.style.borderColor = '#8135FA'; e.currentTarget.style.background = '#1a1f3a'; }}
                     onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F2937'; e.currentTarget.style.background = '#12131F'; }}>
                  <span style={{ fontSize: '1.5rem', marginBottom: 8, display: 'block' }}>{topic.icon}</span>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: '#fff' }}>{topic.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#9CA3AF', lineHeight: 1.5, margin: 0 }}>{topic.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '1.3rem', marginBottom: 20 }}>FREQUENTLY ASKED QUESTIONS</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {faqItems.map((item, i) => (
              <details key={i} style={{ background: '#12131F', borderRadius: 8, padding: '16px 20px', border: '1px solid #1F2937', cursor: 'pointer', transition: 'border-color 0.2s' }}
                       onMouseEnter={e => (e.currentTarget.style.borderColor = '#8135FA')}
                       onMouseLeave={e => (e.currentTarget.style.borderColor = '#1F2937')}>
                <summary style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '0.92rem', color: '#fff', outline: 'none' }}>
                  {item.q}
                </summary>
                <p style={{ marginTop: 12, fontSize: '0.85rem', color: '#9CA3AF', lineHeight: 1.6 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '1.3rem', marginBottom: 20 }}>CONTACT US</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {contactMethods.map((method) => (
              <div key={method.title} style={{ background: '#12131F', borderRadius: 12, padding: 24, border: '1px solid #1F2937', textAlign: 'center' }}>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: '#F97316' }}>{method.title}</h3>
                <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 4px', color: '#fff' }}>{method.detail}</p>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0 }}>{method.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: 24, background: '#12131F', borderRadius: 12, border: '1px solid #1F2937' }}>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1rem', fontWeight: 600, marginBottom: 12, color: '#fff' }}>Send us a message</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input type="text" placeholder="Your Name" style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #1F2937', background: 'rgba(255,255,255,0.04)', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', outline: 'none' }} />
                <input type="email" placeholder="Your Email" style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #1F2937', background: 'rgba(255,255,255,0.04)', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', outline: 'none' }} />
              </div>
              <textarea placeholder="How can we help?" rows={4} style={{ padding: '12px 16px', borderRadius: 8, border: '1px solid #1F2937', background: 'rgba(255,255,255,0.04)', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }} />
              <button style={{ justifySelf: 'start', padding: '12px 28px', borderRadius: 8, background: '#8135FA', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Send Message</button>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, fontSize: '1.3rem', marginBottom: 20 }}>QUICK LINKS</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {quickLinks.map((link) => (
              <Link key={link.title} to={link.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ background: '#12131F', borderRadius: 12, padding: 20, border: '1px solid #1F2937', transition: 'all 0.2s', cursor: 'pointer', height: '100%', textAlign: 'center' }}
                     onMouseEnter={e => { e.currentTarget.style.borderColor = '#F97316'; e.currentTarget.style.background = '#1a1f3a'; }}
                     onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F2937'; e.currentTarget.style.background = '#12131F'; }}>
                  <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.95rem', fontWeight: 600, marginBottom: 6, color: '#F97316' }}>{link.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#9CA3AF', lineHeight: 1.5, margin: 0 }}>{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Legal */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Link to="/support/terms" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#12131F', borderRadius: 12, padding: 24, border: '1px solid #1F2937', transition: 'border-color 0.2s' }}
                 onMouseEnter={e => (e.currentTarget.style.borderColor = '#8135FA')}
                 onMouseLeave={e => (e.currentTarget.style.borderColor = '#1F2937')}>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: '#fff' }}>Terms of Service</h3>
              <p style={{ fontSize: '0.85rem', color: '#9CA3AF', lineHeight: 1.5, margin: 0 }}>Read the terms governing your use of League OS and our services.</p>
            </div>
          </Link>
          <Link to="/support/privacy-policy" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#12131F', borderRadius: 12, padding: 24, border: '1px solid #1F2937', transition: 'border-color 0.2s' }}
                 onMouseEnter={e => (e.currentTarget.style.borderColor = '#8135FA')}
                 onMouseLeave={e => (e.currentTarget.style.borderColor = '#1F2937')}>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: '#fff' }}>Privacy Policy</h3>
              <p style={{ fontSize: '0.85rem', color: '#9CA3AF', lineHeight: 1.5, margin: 0 }}>Learn how we collect, use and protect your personal information.</p>
            </div>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Support;