import { useState } from 'react';
import {
  FiUsers,
  FiEye,
  FiHeart,
  FiTrendingUp,
  FiCalendar,
  FiChevronDown,
  FiDownload,
  FiInfo,
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import SponsorSidebar from '../../components/SponsorSidebar';
import '../../styles/pages/landing.css';
import './CampaignAnalytics.css';

const stats = [
  {
    icon: FiUsers,
    label: 'Total Reach',
    value: '2.4M',
    change: '▲ 48.5%',
    period: 'vs 01 Apr - 30 Apr',
  },
  {
    icon: FiEye,
    label: 'Impressions',
    value: '5.7M',
    change: '▲ 64.3%',
    period: 'vs 01 Apr - 30 Apr',
  },
  {
    icon: FiHeart,
    label: 'Engagements',
    value: '186K',
    change: '▲ 31.7%',
    period: 'vs 01 Apr - 30 Apr',
  },
  {
    icon: FiTrendingUp,
    label: 'ROI',
    value: '320%',
    change: '▲ 28.6%',
    period: 'vs 01 Apr - 30 Apr',
  },
];

const chartData = [
  { date: 'May 1',  reach: 1600, impressions: 1000, engagements: 290 },
  { date: 'May 6',  reach: 1350, impressions: 700,  engagements: 240 },
  { date: 'May 11', reach: 1450, impressions: 1500, engagements: 270 },
  { date: 'May 16', reach: 1750, impressions: 1100, engagements: 300 },
  { date: 'May 21', reach: 1400, impressions: 900,  engagements: 260 },
  { date: 'May 26', reach: 1550, impressions: 1600, engagements: 400 },
  { date: 'May 31', reach: 1700, impressions: 700,  engagements: 240 },
];

const platformData = [
  { name: 'Facebook',   value: 896,  pct: '37.3%', color: '#8135FA' },
  { name: 'Instagram',  value: 624,  pct: '26.0%', color: '#EC4899' },
  { name: 'YouTube',    value: 512,  pct: '21.3%', color: '#F97316' },
  { name: 'X (Twitter)',value: 236,  pct: '9.8%',  color: '#06B6D4' },
  { name: 'TikTok',     value: 132,  pct: '5.5%',  color: '#10B981' },
];

const engagementData = [
  { name: 'Likes',    value: 58, pct: '31.2%', color: '#8135FA' },
  { name: 'Comments', value: 46, pct: '24.7%', color: '#3B82F6' },
  { name: 'Shares',   value: 34, pct: '18.3%', color: '#EAB308' },
  { name: 'Saves',    value: 28, pct: '15.1%', color: '#10B981' },
  { name: 'Clicks',   value: 20, pct: '10.8%', color: '#EF4444' },
];

type TimeRange = 'Daily' | 'Weekly' | 'Monthly';

export default function CampaignAnalytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('Daily');

  return (
    <div className="ca-page">


      <div className="ca-layout">
        <SponsorSidebar />

        <main className="ca-main landing-page">

          {/* Header */}
          <div className="ca-header">
            <div className="ca-header-left">
              <h1 className="ca-title">Campaign Analytics / ROI</h1>
              <p className="ca-subtitle">
                Measure performance, engagement, and return on investment for your campaigns.
              </p>
            </div>
            <div className="ca-header-right">
              <div className="ca-filter-btn">
                <FiCalendar size={14} />
                <span>01 May 2024 - 31 May 2024</span>
                <FiChevronDown size={13} />
              </div>
              <div className="ca-filter-btn">
                <span className="ca-prop-dot" />
                <span>Nile Special Rugby Premiership</span>
                <FiChevronDown size={13} />
              </div>
              <button className="ca-export-btn">
                <FiDownload size={14} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="ca-stats-row">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="ca-stat-card">
                  <div className="ca-stat-top">
                    <span className="ca-stat-label">{stat.label}</span>
                    <div className="ca-stat-icon-wrap">
                      <Icon size={18} className="ca-stat-icon" />
                    </div>
                  </div>
                  <div className="ca-stat-value">{stat.value}</div>
                  <div className="ca-stat-change">
                    <span className="ca-change-positive">{stat.change}</span>
                    <span className="ca-change-period">{stat.period}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Performance Overview chart */}
          <div className="ca-chart-card">
            <div className="ca-chart-header">
              <div className="ca-chart-title-row">
                <span className="ca-chart-title">Performance Overview</span>
                <div className="ca-chart-legend">
                  <span className="ca-legend-item">
                    <span className="ca-legend-dot" style={{ background: '#8135FA' }} /> Reach
                  </span>
                  <span className="ca-legend-item">
                    <span className="ca-legend-dot" style={{ background: '#F97316' }} /> Impressions
                  </span>
                  <span className="ca-legend-item">
                    <span className="ca-legend-dot" style={{ background: '#EAB308' }} /> Engagements
                  </span>
                </div>
              </div>
              <div className="ca-chart-controls">
                <div className="ca-time-toggle">
                  {(['Daily', 'Weekly', 'Monthly'] as TimeRange[]).map((t) => (
                    <button
                      key={t}
                      className={`ca-toggle-btn ${timeRange === t ? 'ca-toggle-active' : ''}`}
                      onClick={() => setTimeRange(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button className="ca-dl-btn">
                  <FiDownload size={14} />
                </button>
              </div>
            </div>

            <div className="ca-chart-wrap">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 10, right: 60, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v/1000}M`}
                    domain={[600, 1800]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}K`}
                    domain={[220, 420]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#12131F',
                      border: '1px solid #1e2340',
                      borderRadius: 8,
                      color: '#ffffff',
                      fontSize: 12,
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="reach"
                    stroke="#8135FA"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="impressions"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="engagements"
                    stroke="#EAB308"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom two charts */}
          <div className="ca-bottom-charts">

            {/* Reach by Platform */}
            <div className="ca-donut-card">
              <div className="ca-donut-header">
                <span className="ca-donut-title">Reach by Platform</span>
                <FiInfo size={14} className="ca-info-icon" />
              </div>
              <div className="ca-donut-body">
                <div className="ca-donut-chart">
                  <PieChart width={160} height={160}>
                    <Pie
                      data={platformData}
                      cx={75}
                      cy={75}
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
                <div className="ca-donut-legend">
                  {platformData.map((item) => (
                    <div key={item.name} className="ca-donut-row">
                      <span className="ca-donut-dot" style={{ background: item.color }} />
                      <span className="ca-donut-name">{item.name}</span>
                      <span className="ca-donut-val">{item.value}K</span>
                      <span className="ca-donut-pct">{item.pct}</span>
                    </div>
                  ))}
                  <div className="ca-donut-total">
                    <span className="ca-total-label">Total Reach</span>
                    <span className="ca-total-val">2.4M</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Breakdown */}
            <div className="ca-donut-card">
              <div className="ca-donut-header">
                <span className="ca-donut-title">Engagement Breakdown</span>
                <FiInfo size={14} className="ca-info-icon" />
              </div>
              <div className="ca-donut-body">
                <div className="ca-donut-chart">
                  <PieChart width={160} height={160}>
                    <Pie
                      data={engagementData}
                      cx={75}
                      cy={75}
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {engagementData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
                <div className="ca-donut-legend">
                  {engagementData.map((item) => (
                    <div key={item.name} className="ca-donut-row">
                      <span className="ca-donut-dot" style={{ background: item.color }} />
                      <span className="ca-donut-name">{item.name}</span>
                      <span className="ca-donut-val">{item.value}K</span>
                      <span className="ca-donut-pct">{item.pct}</span>
                    </div>
                  ))}
                  <div className="ca-donut-total">
                    <span className="ca-total-label">Total Engagements</span>
                    <span className="ca-total-val">186K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Ad panel */}
        <div className="ca-ad-panel">
          <div className="ca-ad-card ca-ad-blue">
            <div className="ca-ad-content">
              <div className="ca-ad-shield">🛡️</div>
              <div className="ca-ad-brand">Stanbic</div>
              <div className="ca-ad-brand">Bank</div>
              <div className="ca-ad-tagline">A member of Standard Bank Group</div>
              <div className="ca-ad-sub">Moving Forward™ Together.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}