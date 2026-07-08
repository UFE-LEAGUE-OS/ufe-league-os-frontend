import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiSearch,
  FiEdit2,
  FiBarChart2,
  FiEye,
  FiMoreVertical,
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiActivity,
  FiCalendar,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { useAuthStore } from '../../store/authStore';
import '../../styles/pages/landing.css';
import './SponsorCampaigns.css';

const statusFilters = ['All', 'Live', 'Draft', 'Pending', 'Completed'];

const campaigns = [
  {
    id: 1,
    name: 'Nile Special Rugby Premiership — Brand Awareness',
    type: 'Brand Awareness',
    property: 'Nile Special Rugby Premiership',
    status: 'Live',
    startDate: '01 May 2024',
    endDate: '31 May 2025',
    reach: '850K',
    reachChange: '+28%',
    engagements: '64K',
    engagementsChange: '+34%',
    roi: 'UGX 1.1B',
    roiChange: '+29%',
    budget: 'UGX 50M',
    logo: '🏉',
  },
  {
    id: 2,
    name: 'Kobs FC Jersey Sponsorship Campaign',
    type: 'Club Sponsorship',
    property: 'Kobs FC',
    status: 'Live',
    startDate: '01 Apr 2024',
    endDate: '31 Mar 2025',
    reach: '420K',
    reachChange: '+22%',
    engagements: '28K',
    engagementsChange: '+18%',
    roi: 'UGX 650M',
    roiChange: '+21%',
    budget: 'UGX 30M',
    logo: '🦅',
  },
  {
    id: 3,
    name: 'UPL Harvest League Official Partner',
    type: 'League Sponsorship',
    property: 'Uganda Premier League',
    status: 'Live',
    startDate: '01 Feb 2024',
    endDate: '31 Jan 2025',
    reach: '310K',
    reachChange: '+16%',
    engagements: '21K',
    engagementsChange: '+12%',
    roi: 'UGX 380M',
    roiChange: '+15%',
    budget: 'UGX 20M',
    logo: '🦁',
  },
  {
    id: 4,
    name: 'Basketball Season Fan Engagement',
    type: 'Fan Engagement',
    property: 'National Basketball League',
    status: 'Pending',
    startDate: '01 Jun 2025',
    endDate: '30 Nov 2025',
    reach: '—',
    reachChange: '—',
    engagements: '—',
    engagementsChange: '—',
    roi: '—',
    roiChange: '—',
    budget: 'UGX 15M',
    logo: '🏀',
  },
  {
    id: 5,
    name: 'Digital Brand Campaign Q3',
    type: 'Digital Campaign',
    property: 'League OS Platform',
    status: 'Draft',
    startDate: '—',
    endDate: '—',
    reach: '—',
    reachChange: '—',
    engagements: '—',
    engagementsChange: '—',
    roi: '—',
    roiChange: '—',
    budget: 'UGX 10M',
    logo: '📱',
  },
  {
    id: 6,
    name: 'Women\'s Football Cup Sponsorship',
    type: 'Event Sponsorship',
    property: 'Women\'s Football Cup',
    status: 'Completed',
    startDate: '01 Jan 2024',
    endDate: '31 Jan 2024',
    reach: '180K',
    reachChange: '+12%',
    engagements: '14K',
    engagementsChange: '+8%',
    roi: 'UGX 220M',
    roiChange: '+10%',
    budget: 'UGX 12M',
    logo: '⚽',
  },
];

const metrics = [
  {
    icon: FiActivity,
    label: 'Active Campaigns',
    value: '3',
    change: '+1 this month',
    changePositive: true,
  },
  {
    icon: FiUsers,
    label: 'Total Reach',
    value: '1.58M',
    change: '+22% vs last month',
    changePositive: true,
  },
  {
    icon: FiTrendingUp,
    label: 'Total Engagements',
    value: '113K',
    change: '+26% vs last month',
    changePositive: true,
  },
  {
    icon: FiDollarSign,
    label: 'Total ROI / Value',
    value: 'UGX 2.13B',
    change: '+24% vs last month',
    changePositive: true,
  },
];

const statusColors: Record<string, string> = {
  Live: 'sc-status-live',
  Draft: 'sc-status-draft',
  Pending: 'sc-status-pending',
  Completed: 'sc-status-completed',
};

export default function SponsorCampaigns() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const sponsorType = (user?.sponsor_type as string) ?? 'CORPORATE';
  const isIndividual = sponsorType === 'INDIVIDUAL';

  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const filtered = campaigns.filter((c) => {
    const matchesFilter = activeFilter === 'All' || c.status === activeFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.property.toLowerCase().includes(search.toLowerCase()) ||
      c.type.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const displayedCampaigns = isIndividual ? filtered.slice(0, 2) : filtered;

  return (
    <div className="sc-page">
  <div className="sc-layout">
    <SponsorSidebar />
    <main className="sc-main landing-page">

          {/* Header */}
          <div className="sc-header">
            <div className="sc-header-left">
              <h1 className="sc-title">Campaigns</h1>
              <p className="sc-subtitle">
                {isIndividual
                  ? 'Manage your personal sponsorship campaigns and track their impact.'
                  : 'Manage your corporate sponsorship campaigns, track performance and ROI.'}
              </p>
            </div>
            <button
              className="sc-create-btn"
              onClick={() => navigate('/sponsor/campaigns/new')}
            >
              <FiPlus size={16} />
              Create Campaign
            </button>
          </div>

          {/* Metrics */}
          <div className="sc-metrics">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="sc-metric-card">
                  <div className="sc-metric-icon-wrap">
                    <Icon size={18} className="sc-metric-icon" />
                  </div>
                  <div className="sc-metric-info">
                    <div className="sc-metric-label">{metric.label}</div>
                    <div className="sc-metric-value">{metric.value}</div>
                    <div className={`sc-metric-change ${metric.changePositive ? 'sc-change-positive' : 'sc-change-negative'}`}>
                      {metric.change}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters + Search */}
          <div className="sc-controls">
            <div className="sc-filter-tabs">
              {statusFilters.map((f) => (
                <button
                  key={f}
                  className={`sc-filter-tab ${activeFilter === f ? 'sc-filter-active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="sc-search-wrap">
              <FiSearch size={15} className="sc-search-icon" />
              <input
                className="sc-search"
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Campaigns table */}
          <div className="sc-table-card">
            <div className="sc-table-header">
              <div className="sc-th sc-th-campaign">CAMPAIGN</div>
              <div className="sc-th sc-th-status">STATUS</div>
              <div className="sc-th sc-th-dates">DATES</div>
              <div className="sc-th sc-th-reach">REACH</div>
              <div className="sc-th sc-th-eng">ENGAGEMENTS</div>
              <div className="sc-th sc-th-roi">ROI / VALUE</div>
              <div className="sc-th sc-th-budget">BUDGET</div>
              <div className="sc-th sc-th-actions">ACTIONS</div>
            </div>

            <div className="sc-table-body">
              {displayedCampaigns.length === 0 ? (
                <div className="sc-empty">
                  <FiActivity size={32} className="sc-empty-icon" />
                  <div className="sc-empty-text">No campaigns found</div>
                  <button
                    className="sc-create-btn sc-empty-btn"
                    onClick={() => navigate('/sponsor/campaigns/new')}
                  >
                    <FiPlus size={14} /> Create your first campaign
                  </button>
                </div>
              ) : (
                displayedCampaigns.map((campaign) => (
                  <div key={campaign.id} className="sc-table-row">

                    {/* Campaign info */}
                    <div className="sc-td sc-td-campaign">
                      <div className="sc-campaign-logo">{campaign.logo}</div>
                      <div className="sc-campaign-info">
                        <div className="sc-campaign-name">{campaign.name}</div>
                        <div className="sc-campaign-meta">
                          <span className="sc-campaign-type">{campaign.type}</span>
                          <span className="sc-campaign-dot">·</span>
                          <span className="sc-campaign-property">{campaign.property}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="sc-td sc-td-status">
                      <span className={`sc-status-badge ${statusColors[campaign.status]}`}>
                        {campaign.status}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="sc-td sc-td-dates">
                      <div className="sc-dates">
                        <FiCalendar size={11} className="sc-dates-icon" />
                        <div>
                          <div className="sc-date">{campaign.startDate}</div>
                          <div className="sc-date sc-date-end">{campaign.endDate}</div>
                        </div>
                      </div>
                    </div>

                    {/* Reach */}
                    <div className="sc-td sc-td-stat">
                      <div className="sc-stat-value">{campaign.reach}</div>
                      {campaign.reachChange !== '—' && (
                        <div className="sc-stat-change">{campaign.reachChange}</div>
                      )}
                    </div>

                    {/* Engagements */}
                    <div className="sc-td sc-td-stat">
                      <div className="sc-stat-value">{campaign.engagements}</div>
                      {campaign.engagementsChange !== '—' && (
                        <div className="sc-stat-change">{campaign.engagementsChange}</div>
                      )}
                    </div>

                    {/* ROI */}
                    <div className="sc-td sc-td-stat">
                      <div className="sc-stat-value">{campaign.roi}</div>
                      {campaign.roiChange !== '—' && (
                        <div className="sc-stat-change">{campaign.roiChange}</div>
                      )}
                    </div>

                    {/* Budget */}
                    <div className="sc-td sc-td-budget">
                      <div className="sc-budget-val">{campaign.budget}</div>
                    </div>

                    {/* Actions */}
                    <div className="sc-td sc-td-actions">
                      <button
                        className="sc-action-btn"
                        title="Edit"
                        onClick={() => navigate('/sponsor/campaigns/new')}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="sc-action-btn"
                        title="Analytics"
                        onClick={() => navigate('/sponsor/analytics')}
                      >
                        <FiBarChart2 size={14} />
                      </button>
                      <button
                        className="sc-action-btn"
                        title="Preview"
                        onClick={() => navigate('/sponsor/campaigns/preview')}
                      >
                        <FiEye size={14} />
                      </button>
                      <div className="sc-more-wrap">
                        <button
                          className="sc-action-btn"
                          title="More"
                          onClick={() => setOpenMenu(openMenu === campaign.id ? null : campaign.id)}
                        >
                          <FiMoreVertical size={14} />
                        </button>
                        {openMenu === campaign.id && (
                          <div className="sc-dropdown">
                            <button className="sc-dropdown-item">Duplicate</button>
                            <button className="sc-dropdown-item">Archive</button>
                            <button className="sc-dropdown-item sc-dropdown-danger">Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="sc-table-footer">
              <span className="sc-table-count">
                Showing {displayedCampaigns.length} of {campaigns.length} campaigns
              </span>
              <div className="sc-pagination">
                <button className="sc-page-btn">‹</button>
                <button className="sc-page-num sc-page-active">1</button>
                <button className="sc-page-num">2</button>
                <button className="sc-page-btn">›</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}