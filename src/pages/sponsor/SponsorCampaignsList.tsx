import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertCircle,
  FiBarChart2,
  FiCopy,
  FiEdit2,
  FiExternalLink,
  FiPlus,
  FiRefreshCw,
  FiTag,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { getSponsorAccounts } from '../../services/sponsorshipService';
import {
  createSponsorCampaignDraft,
  getSponsorCampaigns,
  type CampaignStatus,
  type SponsorCampaign,
} from '../../services/sponsorCampaignService';
import { useSponsorCampaignStore } from '../../store/sponsorCampaignStore';
import './SponsorCampaignsList.css';

interface StatusTab {
  id: string;
  label: string;
  statuses: CampaignStatus[] | null;
}

const statusTabs: StatusTab[] = [
  { id: 'all', label: 'All', statuses: null },
  { id: 'draft', label: 'Draft', statuses: ['DRAFT'] },
  {
    id: 'review',
    label: 'Submitted / Under Review',
    statuses: ['SUBMITTED', 'UNDER_REVIEW'],
  },
  { id: 'live', label: 'Approved / Active', statuses: ['APPROVED', 'ACTIVE'] },
  { id: 'rejected', label: 'Rejected', statuses: ['REJECTED'] },
];

function date(value: string | null) {
  if (!value) {
    return 'Not set';
  }
  return new Intl.DateTimeFormat('en-UG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function SponsorCampaignsList() {
  const navigate = useNavigate();
  const hydrate = useSponsorCampaignStore((s) => s.hydrate);
  const resetCampaignStore = useSponsorCampaignStore((s) => s.reset);

  const [campaigns, setCampaigns] = useState<SponsorCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [actionError, setActionError] = useState('');
  const [busyCampaignId, setBusyCampaignId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const accountsResponse = await getSponsorAccounts();
        const account = accountsResponse.data.results[0];

        if (!account) {
          if (active) {
            setCampaigns([]);
          }
          return;
        }

        const campaignsResponse = await getSponsorCampaigns({
          sponsor_account: account.id,
        });

        if (active) {
          setCampaigns(campaignsResponse.data.results);
        }
      } catch {
        if (active) {
          setError('We could not load your campaigns.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const filteredCampaigns = useMemo(() => {
    const tab = statusTabs.find((item) => item.id === activeTab);
    if (!tab || !tab.statuses) {
      return campaigns;
    }
    return campaigns.filter((campaign) =>
      tab.statuses?.includes(campaign.status),
    );
  }, [campaigns, activeTab]);

  const handleNewCampaign = () => {
    resetCampaignStore();
    navigate('/sponsor/campaigns/new');
  };

  const handleEditDraft = async (campaignId: number) => {
    setBusyCampaignId(campaignId);
    setActionError('');
    try {
      await hydrate(campaignId);
      navigate('/sponsor/campaigns/new');
    } catch {
      setActionError('We could not open this draft. Please try again.');
    } finally {
      setBusyCampaignId(null);
    }
  };

  const handleDuplicate = async (campaign: SponsorCampaign) => {
    setBusyCampaignId(campaign.id);
    setActionError('');
    try {
      const response = await createSponsorCampaignDraft({
        sponsor_account: campaign.sponsor_account,
        agreement_id: campaign.agreement_id,
        name: `${campaign.name} (Copy)`,
        property: campaign.property,
        campaign_type: campaign.campaign_type,
        description: campaign.description,
        goals: campaign.goals,
        audience: campaign.audience,
        budget: campaign.budget,
        placement_preferences: campaign.placement_preferences,
      });

      setCampaigns((prev) => [response.data, ...prev]);
    } catch {
      setActionError('We could not duplicate this campaign. Please try again.');
    } finally {
      setBusyCampaignId(null);
    }
  };

  return (
    <div className="scl-page">
      <div className="scl-layout">
        <SponsorSidebar />

        <main className="scl-main">
          <header className="scl-header">
            <div>
              <span>Creative & placement</span>
              <h1>Campaigns</h1>
              <p>
                Manage the campaigns you've built — audience targeting,
                creative assets, placements and approval status.
              </p>
            </div>

            <button type="button" onClick={handleNewCampaign}>
              <FiPlus size={16} />
              New Campaign
            </button>
          </header>

          {loading && (
            <div className="scl-state">
              <FiRefreshCw className="scl-spin" size={28} />
              <h2>Loading campaigns</h2>
            </div>
          )}

          {!loading && error && (
            <div className="scl-state">
              <FiAlertCircle size={28} />
              <h2>Campaigns unavailable</h2>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="scl-tabs">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`scl-tab ${activeTab === tab.id ? 'scl-tab-active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {actionError && (
                <p className="scl-action-error">
                  <FiAlertCircle size={13} /> {actionError}
                </p>
              )}

              {filteredCampaigns.length === 0 && (
                <div className="scl-state">
                  <FiTag size={28} />
                  <h2>No campaigns here yet</h2>
                  <p>Start a new campaign or switch tabs to see other statuses.</p>
                </div>
              )}

              {filteredCampaigns.length > 0 && (
                <div className="scl-grid">
                  {filteredCampaigns.map((campaign) => (
                    <article key={campaign.id} className="scl-card">
                      <div className="scl-card-top">
                        <span className={`scl-status scl-status-${campaign.status.toLowerCase()}`}>
                          {campaign.status.replace('_', ' ')}
                        </span>
                        {campaign.reference && <span>{campaign.reference}</span>}
                      </div>

                      <h2>{campaign.name || 'Untitled Campaign'}</h2>
                      <p>{campaign.property || 'Property not set'}</p>

                      <div className="scl-dates">
                        {date(campaign.budget.starts_at)} –{' '}
                        {date(campaign.budget.ends_at)}
                      </div>

                      <div className="scl-actions">
                        {campaign.status === 'DRAFT' && (
                          <button
                            type="button"
                            disabled={busyCampaignId === campaign.id}
                            onClick={() => void handleEditDraft(campaign.id)}
                          >
                            <FiEdit2 size={14} /> Edit Draft
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/sponsor/campaigns/${campaign.id}`)
                          }
                        >
                          <FiBarChart2 size={14} /> View Stats
                        </button>

                        <button
                          type="button"
                          disabled={busyCampaignId === campaign.id}
                          onClick={() => void handleDuplicate(campaign)}
                        >
                          <FiCopy size={14} /> Duplicate
                        </button>

                        {campaign.agreement_id && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/sponsor/payments?agreement=${campaign.agreement_id}`,
                              )
                            }
                          >
                            <FiExternalLink size={14} /> View Agreement
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
