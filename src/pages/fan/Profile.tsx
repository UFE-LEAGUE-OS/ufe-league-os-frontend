import {
  GlassCard,
  PageShell,
  SectionTitle,
  StatCard,
  Tag,
  TopNav,
} from '../../components/site/LeagueUI.js';
import '../../styles/pages/fan/homeProfile.css';

const badges = ['Verified fan', 'Premium alerts', 'Match-day regular'];

export default function Profile() {
  return (
    <PageShell className="profile-page">
      <TopNav compact />

      <main className="page profile-layout">
        <GlassCard className="profile-hero">
          <div className="profile-avatar">AM</div>
          <div className="profile-copy">
            <p className="eyebrow">Fan profile</p>
            <h1>Amina Nabatanzi</h1>
            <p>
              Track your clubs, keep your settings in sync, and build your fan identity inside
              League OS.
            </p>
            <div className="story-badges">
              {badges.map((badge) => (
                <Tag key={badge}>{badge}</Tag>
              ))}
            </div>
          </div>
        </GlassCard>

        <section className="dashboard-grid">
          <GlassCard className="content-card">
            <SectionTitle eyebrow="Account" title="Your details" />
            <div className="profile-details">
              <div>
                <span>Email</span>
                <strong>amina@leagueos.ug</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>+256 700 000 000</strong>
              </div>
              <div>
                <span>Favourite club</span>
                <strong>SC Villa</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>Kampala</strong>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="content-card">
            <SectionTitle eyebrow="Season snapshot" title="Your fan activity" />
            <div className="stat-grid">
              <StatCard label="matches watched" value="36" hint="This season" />
              <StatCard label="comments posted" value="89" hint="Community activity" />
              <StatCard label="rewards claimed" value="7" hint="Across events" />
              <StatCard label="clubs followed" value="11" hint="Saved to profile" />
            </div>
          </GlassCard>
        </section>
      </main>
    </PageShell>
  );
}
