import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  Clock,
  ShieldCheck,
  Flag,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

import '../../styles/pages/SuperAdminFinance/SuperAdminFinance.css';
import '../../styles/pages/SuperAdminFinance/SecurityEvents.css';

const threatTrend = [
  { name: 'May 29', critical: 10, high: 20, medium: 60, low: 45 },
  { name: 'May 30', critical: 12, high: 22, medium: 45, low: 27 },
  { name: 'May 31', critical: 9, high: 18, medium: 55, low: 35 },
  { name: 'Jun 1', critical: 15, high: 27, medium: 60, low: 40 },
  { name: 'Jun 2', critical: 13, high: 25, medium: 63, low: 32 },
  { name: 'Jun 3', critical: 11, high: 23, medium: 57, low: 38 },
  { name: 'Jun 4', critical: 19, high: 28, medium: 63, low: 42 },
];

const attackTypes = [
  { name: 'Failed Logins', value: 42 },
  { name: 'SQL Injection', value: 20 },
  { name: 'XSS Attacks', value: 15 },
  { name: 'Brute Force', value: 13 },
  { name: 'Other', value: 10 },
];

const attackColors = ['#8B5CF6', '#6D28D9', '#F97316', '#14B8A6', '#EC4899'];

interface LiveFeedItem {
  id: number;
  time: string;
  title: string;
  detail: string;
  severity: 'critical' | 'high' | 'low';
}

const liveFeed: LiveFeedItem[] = [
  { id: 1, time: '10:24 AM', title: 'Failed Login', detail: '192.168.1.45', severity: 'high' },
  { id: 2, time: '10:21 AM', title: 'SQL Injection Attempt', detail: '203.0.113.12', severity: 'critical' },
  { id: 3, time: '10:18 AM', title: 'Blocked IP', detail: '198.51.100.23', severity: 'high' },
  { id: 4, time: '10:15 AM', title: 'Password Reset', detail: 'user@example.com', severity: 'low' },
  { id: 5, time: '10:12 AM', title: 'Admin Login', detail: 'Merab Apio', severity: 'low' },
];

const feedSeverityLabel: Record<LiveFeedItem['severity'], string> = {
  critical: 'Critical',
  high: 'High',
  low: 'Low',
};

interface AlertStat {
  label: string;
  value: string;
  delta: string;
  sentiment: 'good' | 'bad';
  icon: typeof AlertTriangle;
  tone: string;
}

const alertStats: AlertStat[] = [
  { label: 'Critical Alerts', value: '8', delta: '+2', sentiment: 'bad', icon: AlertTriangle, tone: 'red' },
  { label: 'High Alerts', value: '15', delta: '+3', sentiment: 'bad', icon: AlertCircle, tone: 'orange' },
  { label: 'Medium Alerts', value: '32', delta: '+6', sentiment: 'bad', icon: AlertOctagon, tone: 'amber' },
  { label: 'Low Alerts', value: '52', delta: '+4', sentiment: 'bad', icon: Clock, tone: 'blue' },
  { label: 'Blocked Requests', value: '128', delta: '+18', sentiment: 'good', icon: ShieldCheck, tone: 'green' },
  { label: 'Open Incidents', value: '4', delta: '+1', sentiment: 'bad', icon: Flag, tone: 'purple' },
];

function getTrendIcon(delta: string) {
  return delta.trim().startsWith('-') ? TrendingDown : TrendingUp;
}

export default function SecurityEventsPage() {
  return (
    <main className="super-admin-page finance-child">
      <section className="page-heading">
        <div className="title-group">
          <h1>Security Events & Alerts</h1>
          <p>Finance & Security · Security Events</p>
        </div>
        <div className="page-actions">
          <button className="button-secondary">View all events</button>
          <button className="button-primary">Investigate</button>
        </div>
      </section>

      <section className="alert-stats-grid">
        {alertStats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = getTrendIcon(stat.delta);
          return (
            <article className={`alert-stat-card ${stat.tone}`} key={stat.label}>
              <div className="alert-stat-label">
                <Icon size={15} />
                {stat.label}
              </div>
              <div className="alert-stat-value">{stat.value}</div>
              <div className={`alert-stat-delta ${stat.sentiment}`}>
                <TrendIcon size={13} />
                {stat.delta}
              </div>
            </article>
          );
        })}
      </section>

      <section className="threat-overview-grid">
        <article className="chart-card threat-trend-card">
          <div className="chart-header">
            <h2>Threat Trend (Last 7 Days)</h2>
          </div>
          <div className="chart-svg">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={threatTrend} margin={{ top: 10, right: 10, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip wrapperStyle={{ backgroundColor: '#09101F', borderRadius: 12, border: '1px solid rgba(148,163,184,0.16)' }} />
                <Legend wrapperStyle={{ color: '#94A3B8', fontSize: 12 }} />
                <Line type="monotone" dataKey="critical" name="Critical" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="high" name="High" stroke="#F97316" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="medium" name="Medium" stroke="#F7C548" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="low" name="Low" stroke="#38BDF8" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="chart-card attack-types-card">
          <div className="chart-header">
            <h2>Attack Types</h2>
          </div>
          <div className="donut-with-legend">
            <div className="chart-svg donut-svg">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={attackTypes}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {attackTypes.map((entry, index) => (
                      <Cell key={entry.name} fill={attackColors[index % attackColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    wrapperStyle={{ backgroundColor: '#09101F', borderRadius: 12, border: '1px solid rgba(148,163,184,0.16)' }}
                    formatter={(value) => `${value}%`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="legend-list">
              {attackTypes.map((type, index) => (
                <div className="legend-item" key={type.name}>
                  <span className="legend-swatch" style={{ background: attackColors[index % attackColors.length] }} />
                  <span className="legend-label">{type.name}</span>
                  <span className="legend-pct">{type.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="chart-card live-feed-card">
          <div className="chart-header">
            <h2>Live Security Feed</h2>
          </div>
          <ul className="live-feed-list">
            {liveFeed.map((item) => (
              <li className="live-feed-row" key={item.id}>
                <span className="live-feed-time">{item.time}</span>
                <div className="live-feed-main">
                  <span className="live-feed-title">{item.title}</span>
                  <span className="live-feed-detail">{item.detail}</span>
                </div>
                <span className={`feed-badge feed-${item.severity}`}>
                  {feedSeverityLabel[item.severity]}
                </span>
              </li>
            ))}
          </ul>
          <button className="button-secondary view-all-btn">View All Events</button>
        </article>
      </section>

      <section className="table-section">
        <div className="table-toolbar">
          <div className="filter-group">
            <div className="filter-item">
              Alert severity
              <select>
                <option>All</option>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="filter-item">
              Source
              <select>
                <option>All sources</option>
                <option>Auth</option>
                <option>Network</option>
                <option>Access</option>
              </select>
            </div>
          </div>
          <div className="table-actions">
            <button className="button-secondary">View more</button>
          </div>
        </div>

        <div className="table-section-title">Security event log</div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Triggered By</th>
                <th>Location</th>
                <th>Time</th>
                <th>Source IP</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Failed Login</td>
                <td>Auth</td>
                <td><span className="badge badge-danger">Critical</span></td>
                <td>john.doe@email.com</td>
                <td>Kampala, UG</td>
                <td>Jun 4, 2025 05:21 PM</td>
                <td>202.58.230.143</td>
                <td>Lockout</td>
              </tr>
              <tr>
                <td>Blocked IP</td>
                <td>Network</td>
                <td><span className="badge badge-warning">Medium</span></td>
                <td>202.58.230.143</td>
                <td>Kampala, UG</td>
                <td>Jun 4, 2025 04:50 PM</td>
                <td>202.58.230.143</td>
                <td>IP blocked</td>
              </tr>
              <tr>
                <td>Admin Login</td>
                <td>Access</td>
                <td><span className="badge badge-success">Low</span></td>
                <td>Merab Apio</td>
                <td>Kampala, UG</td>
                <td>Jun 3, 2025 02:15 PM</td>
                <td>10.0.0.5</td>
                <td>Successful</td>
              </tr>
              <tr>
                <td>Data export</td>
                <td>Compliance</td>
                <td><span className="badge badge-warning">Medium</span></td>
                <td>Jane Smith</td>
                <td>Nairobi, KE</td>
                <td>Jun 3, 2025 01:08 PM</td>
                <td>41.89.12.22</td>
                <td>Exported</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}