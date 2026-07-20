import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiArrowRight,
  FiBarChart2,
  FiList,
  FiPlus,
  FiShare2,
  FiCopy,
  FiCalendar,
  FiUsers,
  FiDollarSign,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { useSponsorCampaignStore } from '../../store/sponsorCampaignStore';
import type { SponsorCampaign } from '../../services/sponsorCampaignService';
import '../../styles/pages/landing.css';
import './CampaignLaunch.css';

const steps = [
  { number: 1, label: 'Campaign Info' },
  { number: 2, label: 'Targeting' },
  { number: 3, label: 'Assets' },
  { number: 4, label: 'Placement' },
  { number: 5, label: 'Budget' },
  { number: 6, label: 'Review' },
  { number: 7, label: 'Launch' },
];

const nextSteps = [
  {
    icon: FiBarChart2,
    title: 'Track Performance',
    desc: 'Monitor your campaign reach, engagements and ROI in real time from your analytics dashboard.',
    action: 'View Analytics',
    route: '/sponsor/analytics',
  },
  {
    icon: FiList,
    title: 'Manage Campaigns',
    desc: 'View and manage all your active and upcoming campaigns from one place.',
    action: 'Go to Campaigns',
    route: '/sponsor/campaigns',
  },
  {
    icon: FiPlus,
    title: 'Create Another Campaign',
    desc: 'Launch another sponsorship campaign to maximise your brand exposure across League OS.',
    action: 'Create Campaign',
    route: '/sponsor/campaigns/new',
  },
];

export default function CampaignLaunch() {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const store = useSponsorCampaignStore();
  const { info, budget } = store;

  const campaign = (location.state as { campaign?: SponsorCampaign } | null)?.campaign;
  const campaignRef = campaign?.reference || `Pending review (ID ${campaign?.id ?? '—'})`;

  const handleCopy = () => {
    navigator.clipboard.writeText(campaignRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAnother = () => {
    store.reset();
    navigate('/sponsor/campaigns/new');
  };

  return (
    <div className="cl-page">
      <div className="cl-layout">
        <SponsorSidebar />

        <main className="cl-main landing-page">

          {/* Stepper */}
          <div className="cl-stepper">
            {steps.map((step, index) => {
              const isCompleted = step.number < 7;
              const isActive = step.number === 7;
              return (
                <div key={step.number} className="cl-step-wrap">
                  <div className="cl-step">
                    <div className={`cl-step-circle ${isActive ? 'cl-step-active' : ''} ${isCompleted ? 'cl-step-completed' : ''}`}>
                      {isCompleted ? '✓' : step.number}
                    </div>
                    <div className={`cl-step-label ${isActive ? 'cl-step-label-active' : ''}`}>
                      {step.label}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`cl-step-line ${isCompleted ? 'cl-step-line-done' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Success card */}
          <div className="cl-success-card">
            <div className="cl-success-icon-wrap">
              <FiCheckCircle size={52} className="cl-success-icon" />
            </div>
            <h1 className="cl-success-title">Campaign Launched! 🎉</h1>
            <p className="cl-success-desc">
              Your sponsorship campaign has been successfully submitted and is now pending
              review by the League OS team. You'll receive a confirmation email once it goes live.
            </p>

            {/* Reference */}
            <div className="cl-ref-row">
              <div className="cl-ref-badge">
                Campaign Reference: <span className="cl-ref-num">{campaignRef}</span>
              </div>
              <button className="cl-copy-btn" onClick={handleCopy}>
                {copied ? <FiCheckCircle size={14} /> : <FiCopy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Share */}
            <button className="cl-share-btn">
              <FiShare2 size={15} /> Share Campaign
            </button>
          </div>

          {/* Campaign summary */}
          <div className="cl-summary-section">
            <h2 className="cl-section-title">Campaign Summary</h2>
            <div className="cl-summary-grid">
              <div className="cl-summary-card">
                <div className="cl-summary-icon-wrap">
                  <FiList size={18} className="cl-summary-icon" />
                </div>
                <div className="cl-summary-label">Campaign</div>
                <div className="cl-summary-val">
                  {info.campaignName || campaign?.name || '—'}
                </div>
              </div>
              <div className="cl-summary-card">
                <div className="cl-summary-icon-wrap">
                  <FiCalendar size={18} className="cl-summary-icon" />
                </div>
                <div className="cl-summary-label">Duration</div>
                <div className="cl-summary-val">
                  {budget.startDate || '—'} – {budget.endDate || '—'}
                </div>
              </div>
              <div className="cl-summary-card">
                <div className="cl-summary-icon-wrap">
                  <FiUsers size={18} className="cl-summary-icon" />
                </div>
                <div className="cl-summary-label">Placements</div>
                <div className="cl-summary-val">{store.placements.length} selected</div>
              </div>
              <div className="cl-summary-card">
                <div className="cl-summary-icon-wrap">
                  <FiDollarSign size={18} className="cl-summary-icon" />
                </div>
                <div className="cl-summary-label">Total Budget</div>
                <div className="cl-summary-val">UGX {budget.amount || '—'}</div>
              </div>
            </div>
          </div>

          {/* Status timeline */}
          <div className="cl-timeline-section">
            <h2 className="cl-section-title">What happens next?</h2>
            <div className="cl-timeline">
              <div className="cl-timeline-item cl-timeline-done">
                <div className="cl-timeline-dot cl-dot-done">
                  <FiCheckCircle size={14} />
                </div>
                <div className="cl-timeline-content">
                  <div className="cl-timeline-title">Campaign Submitted</div>
                  <div className="cl-timeline-desc">
                    Your campaign details have been successfully submitted.
                  </div>
                  <div className="cl-timeline-time">Just now</div>
                </div>
              </div>
              <div className="cl-timeline-item cl-timeline-active">
                <div className="cl-timeline-dot cl-dot-active" />
                <div className="cl-timeline-content">
                  <div className="cl-timeline-title">Under Review</div>
                  <div className="cl-timeline-desc">
                    Our team is reviewing your campaign for compliance and placement.
                  </div>
                  <div className="cl-timeline-time">Expected within 24–48 hours</div>
                </div>
              </div>
              <div className="cl-timeline-item">
                <div className="cl-timeline-dot" />
                <div className="cl-timeline-content">
                  <div className="cl-timeline-title">Payment Processing</div>
                  <div className="cl-timeline-desc">
                    Once approved, payment will be processed as per your selected schedule.
                  </div>
                  <div className="cl-timeline-time">After approval</div>
                </div>
              </div>
              <div className="cl-timeline-item">
                <div className="cl-timeline-dot" />
                <div className="cl-timeline-content">
                  <div className="cl-timeline-title">Campaign Goes Live</div>
                  <div className="cl-timeline-desc">
                    Your campaign will be activated across selected League OS properties.
                  </div>
                  <div className="cl-timeline-time">On your start date</div>
                </div>
              </div>
              <div className="cl-timeline-item">
                <div className="cl-timeline-dot" />
                <div className="cl-timeline-content">
                  <div className="cl-timeline-title">Performance Tracking</div>
                  <div className="cl-timeline-desc">
                    Track real-time reach, engagements and ROI from your analytics dashboard.
                  </div>
                  <div className="cl-timeline-time">Throughout campaign</div>
                </div>
              </div>
            </div>
          </div>

          {/* Next steps */}
          <div className="cl-next-section">
            <h2 className="cl-section-title">Explore more</h2>
            <div className="cl-next-grid">
              {nextSteps.map((item) => {
                const Icon = item.icon;
                const isCreateAnother = item.route === '/sponsor/campaigns/new';
                return (
                  <div key={item.title} className="cl-next-card">
                    <div className="cl-next-icon-wrap">
                      <Icon size={22} className="cl-next-icon" />
                    </div>
                    <h3 className="cl-next-title">{item.title}</h3>
                    <p className="cl-next-desc">{item.desc}</p>
                    <button
                      className="cl-next-btn"
                      onClick={() => (isCreateAnother ? handleCreateAnother() : navigate(item.route))}
                    >
                      {item.action} <FiArrowRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Go to dashboard */}
          <div className="cl-footer">
            <button
              className="cl-dashboard-btn"
              onClick={() => navigate('/sponsor/dashboard')}
            >
              Go to Dashboard <FiArrowRight size={16} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
