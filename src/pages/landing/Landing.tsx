import {
  ButtonLink,
  ClubCard,
  DetailRow,
  FixtureRow,
  GlassCard,
  HeroBadge,
  LeagueLogo,
  MatchCard,
  PageShell,
  SectionTitle,
  StatCard,
  Tag,
  TopNav,
} from '../../components/site/LeagueUI.js';
import '../../styles/pages/landing.css';

const featuredClubs = [
  { name: 'SC Villa', label: 'Supporters club', tone: 'tone-villa' },
  { name: 'Vipers SC', label: 'Title contenders', tone: 'tone-vipers' },
  { name: 'KCCA FC', label: 'Urban rivals', tone: 'tone-kcca' },
  { name: 'BUL FC', label: 'Fast rising', tone: 'tone-bul' },
];

const fixtures = [
  { left: 'URA vs Wakiso Giants', middle: 'Tonight', right: '19:00' },
  { left: 'Express vs Kitara', middle: 'Fri', right: '21:00' },
  { left: 'NEC vs Bright Stars', middle: 'Sat', right: '18:30' },
  { left: 'Maroons vs BUL', middle: 'Sun', right: '20:00' },
];

const matches = [
  { home: 'SC Villa', away: 'Vipers SC', time: 'LIVE NOW', date: 'Star match', score: '2 - 1', accent: 'match-accent-gold' },
  { home: 'KCCA FC', away: 'URA FC', time: '19:30', date: 'Namboole', score: '0 - 0', accent: 'match-accent-blue' },
  { home: 'Maroons', away: 'Express', time: '21:00', date: 'Friday night', score: '1 - 0', accent: 'match-accent-purple' },
];

export default function Landing() {
  return (
    <PageShell>
      <TopNav />

      <main className="page landing-page">
        <section className="hero-slab">
          <div className="hero-copy">
            <HeroBadge label="New season live" />
            <h1>
              Every game.
              <br />
              Every fan.
              <br />
              <span>One platform.</span>
            </h1>
            <p>
              Follow fixtures, watch highlights, join supporter chats, and earn rewards every
              time you show up for the game.
            </p>

            <div className="hero-actions">
              <ButtonLink to="/register">Get started</ButtonLink>
              <ButtonLink to="/login" variant="ghost">
                Sign in
              </ButtonLink>
            </div>

            <div className="hero-tags">
              <Tag>Live scores</Tag>
              <Tag>Fan rewards</Tag>
              <Tag>Match alerts</Tag>
            </div>
          </div>

          <GlassCard className="hero-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">Today at Namboole</span>
                <strong>League OS Match Center</strong>
              </div>
              <LeagueLogo compact className="panel-logo" />
            </div>
            <div className="hero-scoreboard">
              <div>
                <span>SC Villa</span>
                <strong>2</strong>
              </div>
              <div className="hero-divider">FULL TIME</div>
              <div>
                <span>Vipers SC</span>
                <strong>1</strong>
              </div>
            </div>
            <div className="hero-mini-grid">
              <DetailRow title="Possession" value="58%" tone="good" />
              <DetailRow title="Shots on target" value="9" tone="good" />
              <DetailRow title="Attendance" value="34,200" tone="neutral" />
              <DetailRow title="Fan rating" value="4.9/5" tone="warn" />
            </div>
          </GlassCard>
        </section>

        <section className="stat-strip">
          <StatCard label="clubs on board" value="16" hint="And counting" />
          <StatCard label="fans engaged" value="124k" hint="Monthly active" />
          <StatCard label="live updates" value="24/7" hint="Match center online" />
          <StatCard label="reward drops" value="87" hint="This week" />
        </section>

        <section className="feature-section">
          <SectionTitle
            eyebrow="Featured clubs"
            title="Built for the whole"
            accent="league."
            description="Fast access to club pages, supporter activity, and match-day moments."
          />

          <div className="club-grid">
            {featuredClubs.map((club) => (
              <ClubCard key={club.name} {...club} />
            ))}
          </div>
        </section>

        <section className="split-grid">
          <GlassCard className="content-card">
            <SectionTitle
              eyebrow="Live matches"
              title="The biggest stories,"
              accent="in one feed."
            />
            <div className="match-list">
              {matches.map((match) => (
                <MatchCard key={`${match.home}-${match.away}`} {...match} />
              ))}
            </div>
          </GlassCard>

          <GlassCard className="content-card">
            <SectionTitle
              eyebrow="Next fixtures"
              title="What's coming up"
              accent="this week."
            />
            <div className="fixture-board">
              {fixtures.map((fixture) => (
                <FixtureRow key={fixture.left} {...fixture} />
              ))}
            </div>
          </GlassCard>
        </section>

        <section className="cta-banner">
          <div>
            <p className="eyebrow">Join. Engage. Be rewarded.</p>
            <h2>Turn every match into a richer fan experience.</h2>
          </div>
          <ButtonLink to="/register">Create your account</ButtonLink>
        </section>
      </main>
    </PageShell>
  );
}
