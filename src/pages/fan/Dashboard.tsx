import {
  ClubCard,
  DetailRow,
  GlassCard,
  HeroBadge,
  PageShell,
  SectionTitle,
  StatCard,
  Tag,
  TopNav,
} from '../../components/site/LeagueUI.js';
import '../../styles/pages/dashboard.css';

const preferences = ['SC Villa', "Women's league", 'Live match alerts', 'Stadium updates'];
const cards = [
  { name: 'SC Villa', label: 'Selected club', tone: 'tone-villa' },
  { name: 'KCCA FC', label: 'Followed club', tone: 'tone-kcca' },
  { name: 'Vipers SC', label: 'Rival watch', tone: 'tone-vipers' },
  { name: 'BUL FC', label: 'Trending', tone: 'tone-bul' },
];

export default function Dashboard() {
  return (
    <PageShell className="dashboard-page">
      <TopNav compact />

      <main className="page dashboard-layout">
        <section className="dashboard-hero">
          <div className="hero-copy hero-copy-tight">
            <HeroBadge label="Personalize your experience" />
            <h1>
              Every game.
              <br />
              Every fan.
              <br />
              <span>One platform.</span>
            </h1>
            <p>
              Choose the clubs, updates, and match-day topics that matter to you. League OS will
              keep the feed tuned to your world.
            </p>
          </div>

          <GlassCard className="dashboard-panel">
            <SectionTitle eyebrow="Your feed" title="What you care about" />
            <div className="tag-cloud">
              {preferences.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
            </div>

            <div className="dashboard-mini-grid">
              <DetailRow title="Alerts enabled" value="18 clubs" tone="good" />
              <DetailRow title="Match reminders" value="On" tone="good" />
              <DetailRow title="Fan points" value="1,240" tone="warn" />
              <DetailRow title="Recommendations" value="Live" tone="neutral" />
            </div>
          </GlassCard>
        </section>

        <section className="dashboard-grid">
          <GlassCard className="content-card">
            <SectionTitle eyebrow="Popular clubs" title="Pick your favourites" />
            <div className="club-grid club-grid-tight">
              {cards.map((card) => (
                <ClubCard key={card.name} {...card} />
              ))}
            </div>
          </GlassCard>

          <GlassCard className="content-card">
            <SectionTitle eyebrow="Fan summary" title="Your activity at a glance" />
            <div className="stat-grid">
              <StatCard label="prediction streak" value="12" hint="Matches in a row" />
              <StatCard label="clubs followed" value="8" hint="Across the league" />
              <StatCard label="badges earned" value="14" hint="Fan milestones" />
              <StatCard label="reward balance" value="320" hint="Points available" />
            </div>
          </GlassCard>
        </section>
      </main>
    </PageShell>
  );
}
