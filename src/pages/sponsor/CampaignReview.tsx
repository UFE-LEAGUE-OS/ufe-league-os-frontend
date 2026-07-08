import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiEdit2,
  FiFileText,
  FiTarget,
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import '../../styles/pages/landing.css';
import './CampaignReview.css';

const steps = [
  { number: 1, label: 'Campaign Info' },
  { number: 2, label: 'Targeting' },
  { number: 3, label: 'Budget' },
  { number: 4, label: 'Review' },
  { number: 5, label: 'Launch' },
];

const currentStep = 4;

const checklist = [
  { label: 'Campaign name and type defined', done: true },
  { label: 'Target property selected', done: true },
  { label: 'Campaign goals set', done: true },
  { label: 'Audience targeting configured', done: true },
  { label: 'Budget and duration set', done: true },
  { label: 'Payment schedule selected', done: true },
];

export default function CampaignReview() {
  const navigate = useNavigate();

  return (
    <div className="cr-page">
      <div className="cr-layout">
        <SponsorSidebar />

        <main className="cr-main landing-page">

          {/* Header */}
          <div className="cr-header">
            <button className="cr-back-btn" onClick={() => navigate('/sponsor/campaigns/new/budget')}>
              <FiArrowLeft size={18} />
            </button>
            <h1 className="cr-title">Create Sponsor Campaign</h1>
          </div>

          {/* Stepper */}
          <div className="cr-stepper">
            {steps.map((step, index) => {
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              return (
                <div key={step.number} className="cr-step-wrap">
                  <div className="cr-step">
                    <div className={`cr-step-circle ${isActive ? 'cr-step-active' : ''} ${isCompleted ? 'cr-step-completed' : ''}`}>
                      {isCompleted ? '✓' : step.number}
                    </div>
                    <div className={`cr-step-label ${isActive ? 'cr-step-label-active' : ''}`}>
                      {step.label}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`cr-step-line ${isCompleted ? 'cr-step-line-done' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>

          <p className="cr-intro">
            Review your campaign details before launching. You can go back to edit any section.
          </p>

          {/* Body */}
          <div className="cr-body">
            <div className="cr-content">

              {/* Campaign Info */}
              <div className="cr-section-card">
                <div className="cr-section-header">
                  <div className="cr-section-title-row">
                    <div className="cr-section-icon-wrap">
                      <FiFileText size={15} className="cr-section-icon" />
                    </div>
                    <h3 className="cr-section-title">Campaign Information</h3>
                  </div>
                  <button className="cr-edit-btn" onClick={() => navigate('/sponsor/campaigns/new')}>
                    <FiEdit2 size={13} /> Edit
                  </button>
                </div>
                <div className="cr-detail-grid">
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Campaign Name</span>
                    <span className="cr-detail-val">Nile Special Rugby Premiership – Brand Awareness Campaign</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Property</span>
                    <span className="cr-detail-val">Nile Special Rugby Premiership</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Campaign Type</span>
                    <span className="cr-detail-val">Brand Awareness</span>
                  </div>
                  <div className="cr-detail-row cr-detail-full">
                    <span className="cr-detail-label">Description</span>
                    <span className="cr-detail-val">
                      Position Nile Special as the official beer partner of the Nile Special Rugby Premiership.
                      Build brand visibility across matchdays, digital platforms, and fan communities.
                    </span>
                  </div>
                  <div className="cr-detail-row cr-detail-full">
                    <span className="cr-detail-label">Campaign Goals</span>
                    <div className="cr-chips">
                      <span className="cr-chip">Increase Brand Awareness</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Targeting */}
              <div className="cr-section-card">
                <div className="cr-section-header">
                  <div className="cr-section-title-row">
                    <div className="cr-section-icon-wrap">
                      <FiTarget size={15} className="cr-section-icon" />
                    </div>
                    <h3 className="cr-section-title">Audience Targeting</h3>
                  </div>
                  <button className="cr-edit-btn" onClick={() => navigate('/sponsor/campaigns/new/targeting')}>
                    <FiEdit2 size={13} /> Edit
                  </button>
                </div>
                <div className="cr-detail-grid">
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Target Sports</span>
                    <div className="cr-chips">
                      <span className="cr-chip">Football</span>
                      <span className="cr-chip">Rugby</span>
                    </div>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Target Leagues</span>
                    <div className="cr-chips">
                      <span className="cr-chip">Nile Special Rugby Premiership</span>
                    </div>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Age Groups</span>
                    <div className="cr-chips">
                      <span className="cr-chip">18–24</span>
                      <span className="cr-chip">25–34</span>
                      <span className="cr-chip">35–44</span>
                    </div>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Gender</span>
                    <span className="cr-detail-val">All Genders</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Location</span>
                    <span className="cr-detail-val">All Uganda</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Estimated Reach</span>
                    <span className="cr-detail-val cr-highlight">850K – 1.2M fans</span>
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="cr-section-card">
                <div className="cr-section-header">
                  <div className="cr-section-title-row">
                    <div className="cr-section-icon-wrap">
                      <FiDollarSign size={15} className="cr-section-icon" />
                    </div>
                    <h3 className="cr-section-title">Budget & Schedule</h3>
                  </div>
                  <button className="cr-edit-btn" onClick={() => navigate('/sponsor/campaigns/new/budget')}>
                    <FiEdit2 size={13} /> Edit
                  </button>
                </div>
                <div className="cr-detail-grid">
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Campaign Budget</span>
                    <span className="cr-detail-val cr-highlight">UGX 50,000,000</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Duration</span>
                    <span className="cr-detail-val">1 Year</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Start Date</span>
                    <span className="cr-detail-val">01 Jun 2026</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">End Date</span>
                    <span className="cr-detail-val">31 May 2027</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Payment Schedule</span>
                    <span className="cr-detail-val">Pay Upfront</span>
                  </div>
                </div>
              </div>

              {/* Declaration */}
              <div className="cr-declaration">
                <div className="cr-declaration-check">
                  <input type="checkbox" id="cr-declaration" className="cr-checkbox" />
                  <label htmlFor="cr-declaration" className="cr-declaration-label">
                    I confirm that all campaign information is accurate and I am authorised to
                    submit this sponsorship campaign on behalf of the organisation.
                  </label>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="cr-sidebar">
              <div className="cr-checklist-card">
                <h4 className="cr-checklist-title">Campaign Checklist</h4>
                <div className="cr-checklist-items">
                  {checklist.map((item) => (
                    <div key={item.label} className="cr-checklist-item">
                      {item.done
                        ? <FiCheckCircle size={15} className="cr-check-done" />
                        : <FiAlertCircle size={15} className="cr-check-pending" />
                      }
                      <span className={`cr-check-label ${item.done ? '' : 'cr-check-label-pending'}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="cr-checklist-divider" />
                <div className="cr-checklist-status">
                  <FiCheckCircle size={14} className="cr-check-done" />
                  <span>All checks passed — ready to launch</span>
                </div>
              </div>

              <div className="cr-summary-card">
                <h4 className="cr-summary-title">Campaign Summary</h4>
                <div className="cr-summary-rows">
                  <div className="cr-summary-row">
                    <span className="cr-summary-label">Budget</span>
                    <span className="cr-summary-val">UGX 50M</span>
                  </div>
                  <div className="cr-summary-row">
                    <span className="cr-summary-label">Duration</span>
                    <span className="cr-summary-val">1 Year</span>
                  </div>
                  <div className="cr-summary-row">
                    <span className="cr-summary-label">Est. Reach</span>
                    <span className="cr-summary-val">850K – 1.2M</span>
                  </div>
                  <div className="cr-summary-row">
                    <span className="cr-summary-label">Property</span>
                    <span className="cr-summary-val">NSRP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="cr-bottom-nav">
            <button className="cr-back-nav-btn" onClick={() => navigate('/sponsor/campaigns/new/budget')}>
              <FiArrowLeft size={15} /> Back: Budget
            </button>
            <button className="cr-next-btn" onClick={() => navigate('/sponsor/campaigns/preview')}>
              Proceed to Launch <FiArrowRight size={15} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}