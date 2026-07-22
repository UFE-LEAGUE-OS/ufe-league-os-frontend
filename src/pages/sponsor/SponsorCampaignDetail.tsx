import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiCircle,
  FiRefreshCw,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import {
  getSponsorAgreement,
  type SponsorWorkflowEvent,
} from '../../services/sponsorshipService';
import {
  getSponsorCampaign,
  type SponsorCampaign,
} from '../../services/sponsorCampaignService';
import { placementOptions } from './campaignPlacementOptions';
import './SponsorCampaignDetail.css';

function money(value: number) {
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: 'UGX',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not set';
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? 'Not set'
    : parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
}

function formatTimestamp(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

export default function SponsorCampaignDetail() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const parsedCampaignId = Number(campaignId);

  const [campaign, setCampaign] = useState<SponsorCampaign | null>(null);
  const [workflowEvents, setWorkflowEvents] = useState<
    SponsorWorkflowEvent[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const campaignResponse = await getSponsorCampaign(parsedCampaignId);
        if (!active) {
          return;
        }
        setCampaign(campaignResponse.data);

        if (campaignResponse.data.agreement_id) {
          const agreementResponse = await getSponsorAgreement(
            campaignResponse.data.agreement_id,
          );
          if (active) {
            setWorkflowEvents(agreementResponse.data.workflow_events);
          }
        }
      } catch {
        if (active) {
          setError('We could not load this campaign.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (Number.isInteger(parsedCampaignId) && parsedCampaignId > 0) {
      void load();
    } else {
      setLoading(false);
      setError('The campaign number is invalid.');
    }

    return () => {
      active = false;
    };
  }, [parsedCampaignId]);

  const spend = campaign?.spend_to_date ?? null;
  const budgetAmount = campaign ? Number(campaign.budget.amount) : 0;

  return (
    <div className="scd-page">
      <div className="scd-layout">
        <SponsorSidebar />

        <main className="scd-main">
          <button
            type="button"
            className="scd-back"
            onClick={() => navigate('/sponsor/campaigns')}
          >
            <FiArrowLeft size={16} />
            Back to Campaigns
          </button>

          {loading && (
            <div className="scd-state">
              <FiRefreshCw className="scd-spin" size={28} />
              <h2>Loading campaign</h2>
            </div>
          )}

          {!loading && error && (
            <div className="scd-state">
              <FiAlertCircle size={28} />
              <h2>Campaign unavailable</h2>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && campaign && (
            <>
              <header className="scd-header">
                <div>
                  <span className={`scd-status scd-status-${campaign.status.toLowerCase()}`}>
                    {campaign.status.replace('_', ' ')}
                  </span>
                  <h1>{campaign.name || 'Untitled Campaign'}</h1>
                  <p>{campaign.property || 'Property not set'}</p>
                </div>
              </header>

              <div className="scd-grid">
                <section className="scd-panel">
                  <h2>Placement Breakdown</h2>
                  <div className="scd-placement-list">
                    {placementOptions.map((option) => {
                      const isSelected = campaign.placement_preferences.includes(
                        option.id,
                      );
                      return (
                        <div key={option.id} className="scd-placement-item">
                          {isSelected ? (
                            <FiCheckCircle size={16} className="scd-check-done" />
                          ) : (
                            <FiCircle size={16} className="scd-check-todo" />
                          )}
                          <div>
                            <div
                              className={`scd-placement-label ${isSelected ? 'scd-placement-label-done' : ''}`}
                            >
                              {option.id}
                            </div>
                            <div className="scd-placement-desc">{option.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="scd-panel">
                  <h2>Budget vs Spend</h2>
                  <div className="scd-budget-row">
                    <span>Budget</span>
                    <strong>{money(budgetAmount)}</strong>
                  </div>
                  <div className="scd-budget-row">
                    <span>Spend to date</span>
                    {spend != null ? (
                      <strong>{money(spend)}</strong>
                    ) : (
                      <strong className="scd-not-tracked">
                        Not yet available
                      </strong>
                    )}
                  </div>
                  {spend == null && (
                    <p className="scd-hint">
                      Spend tracking will appear here once placements have
                      been served and recorded inside League OS.
                    </p>
                  )}
                </section>

                <section className="scd-panel scd-panel-wide">
                  <h2>Timeline</h2>
                  <div className="scd-timeline">
                    <div className="scd-timeline-item">
                      <div className="scd-timeline-dot" />
                      <div>
                        <strong>Campaign starts</strong>
                        <span>{formatDate(campaign.budget.starts_at)}</span>
                      </div>
                    </div>

                    {workflowEvents
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(a.created_at).getTime() -
                          new Date(b.created_at).getTime(),
                      )
                      .map((event) => (
                        <div key={event.id} className="scd-timeline-item">
                          <div className="scd-timeline-dot" />
                          <div>
                            <strong>{event.event_type_display}</strong>
                            <span>
                              {formatTimestamp(event.created_at)}
                              {event.note ? ` — ${event.note}` : ''}
                            </span>
                          </div>
                        </div>
                      ))}

                    <div className="scd-timeline-item">
                      <div className="scd-timeline-dot" />
                      <div>
                        <strong>Campaign ends</strong>
                        <span>{formatDate(campaign.budget.ends_at)}</span>
                      </div>
                    </div>
                  </div>

                  {!campaign.agreement_id && (
                    <p className="scd-hint">
                      This campaign is not linked to a sponsorship agreement,
                      so only its start and end dates are shown here.
                    </p>
                  )}
                </section>

                <section className="scd-panel scd-panel-wide">
                  <h2>Performance</h2>
                  <p className="scd-hint">
                    Financial and benefit-delivery performance is tracked at
                    the sponsorship-agreement level.{' '}
                    <button
                      type="button"
                      className="scd-inline-link"
                      onClick={() => navigate('/sponsor/analytics')}
                    >
                      View Sponsorship Performance
                    </button>
                  </p>
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
