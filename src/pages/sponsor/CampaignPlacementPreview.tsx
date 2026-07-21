import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiCircle,
  FiFile,
  FiImage,
  FiMonitor,
  FiRefreshCw,
  FiSmartphone,
  FiVideo,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { useSponsorCampaignStore } from '../../store/sponsorCampaignStore';
import { placementOptions } from './campaignPlacementOptions';
import '../../styles/pages/landing.css';
import './CampaignPlacementPreview.css';

const ACCEPTED_VIDEO_TYPES = ['video/mp4'];
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];

function assetIcon(fileType: string) {
  if (ACCEPTED_VIDEO_TYPES.includes(fileType)) return FiVideo;
  if (ACCEPTED_IMAGE_TYPES.includes(fileType)) return FiImage;
  return FiFile;
}

function formatDate(value: string) {
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

const statusLabels: Record<string, string> = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER REVIEW',
  APPROVED: 'APPROVED',
  ACTIVE: 'ACTIVE',
  REJECTED: 'REJECTED',
};

const statusBadgeClass: Record<string, string> = {
  DRAFT: 'cpp-draft-badge',
  SUBMITTED: 'cpp-pending-badge',
  UNDER_REVIEW: 'cpp-pending-badge',
  APPROVED: 'cpp-status-approved-badge',
  ACTIVE: 'cpp-status-approved-badge',
  REJECTED: 'cpp-status-rejected-badge',
};

export default function CampaignPlacementPreview() {
  const navigate = useNavigate();
  const { campaignId: campaignIdParam } = useParams();

  const campaignId = useSponsorCampaignStore((s) => s.campaignId);
  const status = useSponsorCampaignStore((s) => s.status);
  const info = useSponsorCampaignStore((s) => s.info);
  const budget = useSponsorCampaignStore((s) => s.budget);
  const placements = useSponsorCampaignStore((s) => s.placements);
  const assets = useSponsorCampaignStore((s) => s.assets);
  const hydrating = useSponsorCampaignStore((s) => s.hydrating);
  const saving = useSponsorCampaignStore((s) => s.saving);
  const error = useSponsorCampaignStore((s) => s.error);
  const hydrate = useSponsorCampaignStore((s) => s.hydrate);
  const submit = useSponsorCampaignStore((s) => s.submit);

  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const idFromRoute = campaignIdParam ? Number(campaignIdParam) : null;

    if (idFromRoute && idFromRoute !== campaignId) {
      void hydrate(idFromRoute);
    }
  }, [campaignIdParam, campaignId, hydrate]);

  const handleSubmit = async () => {
    setSubmitError('');
    try {
      await submit();
    } catch {
      setSubmitError('We could not submit your campaign for approval. Please try again.');
    }
  };

  const hasCampaign = campaignId != null;

  return (
    <div className="cpp-page">
      <div className="cpp-layout">
        <SponsorSidebar />

        <main className="cpp-main landing-page">
          <div className="cpp-header">
            <div className="cpp-header-left">
              <h1 className="cpp-title">Campaign Placement Preview</h1>
              <p className="cpp-subtitle">
                Review how your campaign will appear across the League OS ecosystem before activation.
              </p>
            </div>

            <div className="cpp-view-toggle">
              <button
                type="button"
                className={`cpp-toggle-btn ${device === 'desktop' ? 'cpp-toggle-active' : ''}`}
                onClick={() => setDevice('desktop')}
              >
                <FiMonitor size={14} /> Desktop
              </button>
              <button
                type="button"
                className={`cpp-toggle-btn ${device === 'mobile' ? 'cpp-toggle-active' : ''}`}
                onClick={() => setDevice('mobile')}
              >
                <FiSmartphone size={14} /> Mobile
              </button>
            </div>
          </div>

          {hydrating && (
            <div className="cpp-state">
              <FiRefreshCw className="cpp-spin" size={28} />
              <h2>Loading campaign</h2>
            </div>
          )}

          {!hydrating && !hasCampaign && (
            <div className="cpp-state">
              <FiAlertCircle size={28} />
              <h2>No campaign to preview</h2>
              <p>Start or resume a campaign draft to see its placement preview here.</p>
              <button
                type="button"
                className="cpp-publish-btn"
                onClick={() => navigate('/sponsor/campaigns/new')}
              >
                Start a Campaign
              </button>
            </div>
          )}

          {!hydrating && hasCampaign && (
            <div className={`cpp-body ${device === 'mobile' ? 'cpp-body-mobile' : ''}`}>
              <div className="cpp-content">
                <div className={`cpp-assets-grid ${device === 'mobile' ? 'cpp-assets-grid-mobile' : ''}`}>
                  {assets.length === 0 && (
                    <div className="cpp-preview-card cpp-preview-empty">
                      <div className="cpp-preview-card-header">
                        <span className="cpp-preview-label">Creative Assets</span>
                      </div>
                      <div className="cpp-preview-content">
                        <p className="cpp-empty-text">
                          No creative assets uploaded yet. Add assets in the Assets step to see them
                          here.
                        </p>
                      </div>
                    </div>
                  )}

                  {assets.map((asset, index) => {
                    const Icon = assetIcon(asset.file_type);
                    const isImage = ACCEPTED_IMAGE_TYPES.includes(asset.file_type);

                    return (
                      <div key={asset.id} className="cpp-preview-card">
                        <div className="cpp-preview-card-header">
                          <span className="cpp-preview-num">{index + 1}</span>
                          <span className="cpp-preview-label">{asset.file_name}</span>
                          {asset.placement && (
                            <span className="cpp-live-badge">{asset.placement}</span>
                          )}
                        </div>
                        <div className="cpp-preview-content">
                          {isImage ? (
                            <img
                              src={asset.file_url}
                              alt={asset.file_name}
                              className="cpp-asset-preview-img"
                            />
                          ) : (
                            <div className="cpp-asset-preview-file">
                              <Icon size={22} />
                              <span>{asset.file_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="cpp-comments-card">
                  <h3 className="cpp-comments-title">Status</h3>
                  <p className="cpp-status-text">
                    {status === 'DRAFT' &&
                      'This campaign is still a draft. Submit it for approval when you are ready.'}
                    {status === 'SUBMITTED' &&
                      'This campaign has been submitted and is waiting to be reviewed.'}
                    {status === 'UNDER_REVIEW' && 'This campaign is currently under review.'}
                    {status === 'APPROVED' && 'This campaign has been approved.'}
                    {status === 'ACTIVE' && 'This campaign is active.'}
                    {status === 'REJECTED' &&
                      'This campaign was rejected. Update it and submit again.'}
                    {!status && 'This campaign has not been submitted yet.'}
                  </p>
                  {(submitError || error) && (
                    <p className="cpp-status-error">
                      <FiAlertCircle size={13} /> {submitError || error}
                    </p>
                  )}
                </div>
              </div>

              <div className="cpp-sidebar">
                <div className="cpp-summary-card">
                  <div className="cpp-summary-header">
                    <span className="cpp-summary-title">Campaign Summary</span>
                    <span className={statusBadgeClass[status ?? 'DRAFT'] ?? 'cpp-draft-badge'}>
                      {statusLabels[status ?? 'DRAFT'] ?? 'DRAFT'}
                    </span>
                  </div>
                  <div className="cpp-summary-campaign">
                    <div>
                      <div className="cpp-summary-campaign-name">
                        {info.campaignName || 'Untitled Campaign'}
                      </div>
                      <div className="cpp-summary-campaign-type">
                        {info.campaignType || 'Campaign type not set'}
                      </div>
                    </div>
                  </div>
                  <div className="cpp-summary-details">
                    <div className="cpp-summary-row">
                      <span className="cpp-summary-label">Run Dates</span>
                      <span className="cpp-summary-val">
                        {formatDate(budget.startDate)} – {formatDate(budget.endDate)}
                      </span>
                    </div>
                    <div className="cpp-summary-row">
                      <span className="cpp-summary-label">Property</span>
                      <span className="cpp-summary-val">
                        {info.property || 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="cpp-checklist-card">
                  <div className="cpp-checklist-header">
                    <span className="cpp-checklist-title">Selected Placements</span>
                    <span className="cpp-checklist-count">
                      {placements.length} / {placementOptions.length}
                    </span>
                  </div>
                  <div className="cpp-checklist-items">
                    {placementOptions.map((option) => {
                      const isSelected = placements.includes(option.id);
                      return (
                        <div key={option.id} className="cpp-checklist-item">
                          {isSelected ? (
                            <FiCheckCircle size={16} className="cpp-check-done" />
                          ) : (
                            <FiCircle size={16} className="cpp-check-todo" />
                          )}
                          <div>
                            <div
                              className={`cpp-check-label ${isSelected ? 'cpp-check-label-done' : ''}`}
                            >
                              {option.id}
                            </div>
                            <div className="cpp-check-desc">{option.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {status === 'DRAFT' && (
                  <div className="cpp-action-btns">
                    <button
                      type="button"
                      className="cpp-publish-btn"
                      disabled={saving}
                      onClick={() => void handleSubmit()}
                    >
                      <FiCheckCircle size={15} />
                      {saving ? 'Submitting…' : 'Submit for Approval'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
