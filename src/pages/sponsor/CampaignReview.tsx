import { useState } from 'react';
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
  FiImage,
  FiMapPin,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { useSponsorCampaignStore } from '../../store/sponsorCampaignStore';
import '../../styles/pages/landing.css';
import './CampaignReview.css';

const steps = [
  { number: 1, label: 'Campaign Info' },
  { number: 2, label: 'Targeting' },
  { number: 3, label: 'Assets' },
  { number: 4, label: 'Placement' },
  { number: 5, label: 'Budget' },
  { number: 6, label: 'Review' },
  { number: 7, label: 'Launch' },
];

const currentStep = 6;

const durationLabels: Record<string, string> = {
  '1month': '1 Month',
  '3months': '3 Months',
  '6months': '6 Months',
  '1year': '1 Year',
};

const paymentLabels: Record<string, string> = {
  upfront: 'Pay Upfront',
  monthly: 'Monthly',
  milestone: 'Milestone Based',
};

const goalLabels: Record<string, string> = {
  'brand-awareness': 'Increase Brand Awareness',
  'generate-leads': 'Generate Leads',
  'drive-sales': 'Drive Sales',
  community: 'Community Engagement',
};

export default function CampaignReview() {
  const navigate = useNavigate();
  const store = useSponsorCampaignStore();
  const { info, audience, assets, placements, budget } = store;

  const [declared, setDeclared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const checklist = [
    { label: 'Campaign name and goals defined', done: Boolean(info.campaignName.trim()) && info.goals.length > 0 },
    { label: 'Audience targeting configured', done: audience.sports.length > 0 && audience.leagues.length > 0 && audience.ageGroups.length > 0 && audience.locations.length > 0 },
    { label: 'Creative assets uploaded', done: assets.length > 0 },
    { label: 'Placement preferences selected', done: placements.length > 0 },
    { label: 'Budget and duration set', done: Boolean(budget.amount) && Boolean(budget.duration) && Boolean(budget.startDate) && Boolean(budget.endDate) },
    { label: 'Payment schedule selected', done: Boolean(budget.paymentSchedule) },
  ];

  const allChecksPassed = checklist.every((item) => item.done);

  const handleSaveDraft = async () => {
    setErrorMessage('');
    setIsSavingDraft(true);
    try {
      await store.saveDraft();
      navigate('/sponsor/activations');
    } catch {
      setErrorMessage('We could not save your campaign draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!allChecksPassed) {
      setErrorMessage('Please complete all required sections before submitting.');
      return;
    }
    if (!declared) {
      setErrorMessage('Please confirm the declaration before submitting.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await store.saveDraft();
      const campaign = await store.submit();
      navigate('/sponsor/campaigns/new/launch', { state: { campaign } });
    } catch {
      setErrorMessage('We could not submit your campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                    <span className="cr-detail-val">{info.campaignName || '—'}</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Property</span>
                    <span className="cr-detail-val">{info.property || '—'}</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Campaign Type</span>
                    <span className="cr-detail-val">{info.campaignType || '—'}</span>
                  </div>
                  <div className="cr-detail-row cr-detail-full">
                    <span className="cr-detail-label">Description</span>
                    <span className="cr-detail-val">{info.description || '—'}</span>
                  </div>
                  <div className="cr-detail-row cr-detail-full">
                    <span className="cr-detail-label">Campaign Goals</span>
                    <div className="cr-chips">
                      {info.goals.length > 0
                        ? info.goals.map((g) => (
                            <span key={g} className="cr-chip">{goalLabels[g] ?? g}</span>
                          ))
                        : <span className="cr-detail-val">—</span>}
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
                      {audience.sports.length > 0
                        ? audience.sports.map((s) => <span key={s} className="cr-chip">{s}</span>)
                        : <span className="cr-detail-val">—</span>}
                    </div>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Target Leagues</span>
                    <div className="cr-chips">
                      {audience.leagues.length > 0
                        ? audience.leagues.map((l) => <span key={l} className="cr-chip">{l}</span>)
                        : <span className="cr-detail-val">—</span>}
                    </div>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Age Groups</span>
                    <div className="cr-chips">
                      {audience.ageGroups.length > 0
                        ? audience.ageGroups.map((a) => <span key={a} className="cr-chip">{a}</span>)
                        : <span className="cr-detail-val">—</span>}
                    </div>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Gender</span>
                    <span className="cr-detail-val">{audience.gender || '—'}</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Location</span>
                    <div className="cr-chips">
                      {audience.locations.length > 0
                        ? audience.locations.map((l) => <span key={l} className="cr-chip">{l}</span>)
                        : <span className="cr-detail-val">—</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Creative Assets */}
              <div className="cr-section-card">
                <div className="cr-section-header">
                  <div className="cr-section-title-row">
                    <div className="cr-section-icon-wrap">
                      <FiImage size={15} className="cr-section-icon" />
                    </div>
                    <h3 className="cr-section-title">Creative Assets</h3>
                  </div>
                  <button className="cr-edit-btn" onClick={() => navigate('/sponsor/campaigns/new/assets')}>
                    <FiEdit2 size={13} /> Edit
                  </button>
                </div>
                <div className="cr-detail-grid">
                  <div className="cr-detail-row cr-detail-full">
                    <span className="cr-detail-label">Uploaded Files</span>
                    <div className="cr-chips">
                      {assets.length > 0
                        ? assets.map((a) => <span key={a.id} className="cr-chip">{a.file_name}</span>)
                        : <span className="cr-detail-val">No assets uploaded yet</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Placement Preferences */}
              <div className="cr-section-card">
                <div className="cr-section-header">
                  <div className="cr-section-title-row">
                    <div className="cr-section-icon-wrap">
                      <FiMapPin size={15} className="cr-section-icon" />
                    </div>
                    <h3 className="cr-section-title">Placement Preferences</h3>
                  </div>
                  <button className="cr-edit-btn" onClick={() => navigate('/sponsor/campaigns/new/placement')}>
                    <FiEdit2 size={13} /> Edit
                  </button>
                </div>
                <div className="cr-detail-grid">
                  <div className="cr-detail-row cr-detail-full">
                    <span className="cr-detail-label">Selected Placements</span>
                    <div className="cr-chips">
                      {placements.length > 0
                        ? placements.map((p) => <span key={p} className="cr-chip">{p}</span>)
                        : <span className="cr-detail-val">—</span>}
                    </div>
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
                    <span className="cr-detail-val cr-highlight">UGX {budget.amount || '—'}</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Duration</span>
                    <span className="cr-detail-val">{durationLabels[budget.duration] ?? '—'}</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Start Date</span>
                    <span className="cr-detail-val">{budget.startDate || '—'}</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">End Date</span>
                    <span className="cr-detail-val">{budget.endDate || '—'}</span>
                  </div>
                  <div className="cr-detail-row">
                    <span className="cr-detail-label">Payment Schedule</span>
                    <span className="cr-detail-val">{paymentLabels[budget.paymentSchedule] ?? '—'}</span>
                  </div>
                </div>
              </div>

              {/* Declaration */}
              <div className="cr-declaration">
                <div className="cr-declaration-check">
                  <input
                    type="checkbox"
                    id="cr-declaration"
                    className="cr-checkbox"
                    checked={declared}
                    onChange={(e) => setDeclared(e.target.checked)}
                  />
                  <label htmlFor="cr-declaration" className="cr-declaration-label">
                    I confirm that all campaign information is accurate and I am authorised to
                    submit this sponsorship campaign on behalf of the organisation.
                  </label>
                </div>
              </div>

              {errorMessage && (
                <div className="cr-error-banner">{errorMessage}</div>
              )}
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
                  {allChecksPassed
                    ? <FiCheckCircle size={14} className="cr-check-done" />
                    : <FiAlertCircle size={14} className="cr-check-pending" />}
                  <span>
                    {allChecksPassed ? 'All checks passed — ready to launch' : 'Some sections still need attention'}
                  </span>
                </div>
              </div>

              <div className="cr-summary-card">
                <h4 className="cr-summary-title">Campaign Summary</h4>
                <div className="cr-summary-rows">
                  <div className="cr-summary-row">
                    <span className="cr-summary-label">Budget</span>
                    <span className="cr-summary-val">UGX {budget.amount || '—'}</span>
                  </div>
                  <div className="cr-summary-row">
                    <span className="cr-summary-label">Duration</span>
                    <span className="cr-summary-val">{durationLabels[budget.duration] ?? '—'}</span>
                  </div>
                  <div className="cr-summary-row">
                    <span className="cr-summary-label">Assets</span>
                    <span className="cr-summary-val">{assets.length}</span>
                  </div>
                  <div className="cr-summary-row">
                    <span className="cr-summary-label">Property</span>
                    <span className="cr-summary-val">{info.property || '—'}</span>
                  </div>
                </div>
              </div>

              <button
                className="cr-draft-btn"
                disabled={isSavingDraft || isSubmitting}
                onClick={() => void handleSaveDraft()}
              >
                {isSavingDraft ? 'Saving…' : 'Save as Draft'}
              </button>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="cr-bottom-nav">
            <button className="cr-back-nav-btn" onClick={() => navigate('/sponsor/campaigns/new/budget')}>
              <FiArrowLeft size={15} /> Back: Budget
            </button>
            <button
              className="cr-next-btn"
              disabled={isSubmitting}
              onClick={() => void handleSubmit()}
            >
              {isSubmitting ? 'Submitting…' : 'Submit Campaign'} <FiArrowRight size={15} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
