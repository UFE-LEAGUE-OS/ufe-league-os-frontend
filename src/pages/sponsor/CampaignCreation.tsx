import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiChevronDown,
  FiEye,
  FiUsers,
  FiShoppingCart,
  FiHeart,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { useSponsorCampaignStore } from '../../store/sponsorCampaignStore';
import '../../styles/pages/landing.css';
import './CampaignCreation.css';

const steps = [
  { number: 1, label: 'Campaign Info' },
  { number: 2, label: 'Targeting' },
  { number: 3, label: 'Assets' },
  { number: 4, label: 'Placement' },
  { number: 5, label: 'Budget' },
  { number: 6, label: 'Review' },
  { number: 7, label: 'Launch' },
];

const campaignTypes = [
  'Brand Awareness',
  'Lead Generation',
  'Product Launch',
  'Fan Engagement',
  'Event Sponsorship',
  'Digital Campaign',
];

const properties = [
  'Nile Special Rugby Premiership',
  'Uganda Premier League',
  'National Basketball League',
  'Kobs FC',
  'KCCA FC',
];

const goals = [
  {
    id: 'brand-awareness',
    icon: FiEye,
    title: 'Increase Brand Awareness',
    desc: 'Grow brand visibility and recognition',
  },
  {
    id: 'generate-leads',
    icon: FiUsers,
    title: 'Generate Leads',
    desc: 'Capture leads and build prospect pipeline',
  },
  {
    id: 'drive-sales',
    icon: FiShoppingCart,
    title: 'Drive Sales',
    desc: 'Drive product sales and conversions',
  },
  {
    id: 'community',
    icon: FiHeart,
    title: 'Community Engagement',
    desc: 'Engage with fans and build community',
  },
];

const currentStep = 1;

export default function CampaignCreation() {
  const navigate = useNavigate();
  const info = useSponsorCampaignStore((s) => s.info);
  const updateInfo = useSponsorCampaignStore((s) => s.updateInfo);
  const saveDraft = useSponsorCampaignStore((s) => s.saveDraft);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    updateInfo({ [e.target.name]: e.target.value });
  };

  const toggleGoal = (id: string) => {
    updateInfo({
      goals: info.goals.includes(id)
        ? info.goals.filter((g) => g !== id)
        : [...info.goals, id],
    });
  };

  const handleNext = async () => {
    if (!info.campaignName.trim()) {
      setErrorMessage('Please enter a campaign name before continuing.');
      return;
    }
    if (info.goals.length === 0) {
      setErrorMessage('Please select at least one campaign goal.');
      return;
    }

    setErrorMessage('');
    setIsSaving(true);
    try {
      await saveDraft();
      navigate('/sponsor/campaigns/new/targeting');
    } catch {
      setErrorMessage('We could not save your campaign. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="cc-page">

      <div className="cc-layout">
        <SponsorSidebar />

        <main className="cc-main landing-page">

          {/* Header */}
          <div className="cc-header">
            <button
              className="cc-back-btn"
              onClick={() => navigate('/sponsor/campaigns')}
            >
              <FiArrowLeft size={18} />
            </button>
            <h1 className="cc-title">Create Sponsor Campaign</h1>
          </div>

          {/* Stepper */}
          <div className="cc-stepper">
            {steps.map((step, index) => {
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              return (
                <div key={step.number} className="cc-step-wrap">
                  <div className="cc-step">
                    <div className={`cc-step-circle ${isActive ? 'cc-step-active' : ''} ${isCompleted ? 'cc-step-completed' : ''}`}>
                      {step.number}
                    </div>
                    <div className={`cc-step-label ${isActive ? 'cc-step-label-active' : ''}`}>
                      {step.label}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`cc-step-line ${isCompleted ? 'cc-step-line-done' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form intro */}
          <p className="cc-form-intro">
            Define the basic information for your sponsorship campaign.
          </p>

          {/* Form */}
          <div className="cc-form">

            {/* Campaign Name + Select Property */}
            <div className="cc-field-row">
              <div className="cc-field-group">
                <label className="cc-label">
                  Campaign Name <span className="cc-required">*</span>
                </label>
                <textarea
                  className="cc-input cc-textarea"
                  name="campaignName"
                  value={info.campaignName}
                  onChange={handleChange}
                  maxLength={100}
                  rows={3}
                />
                <div className="cc-char-count">
                  {info.campaignName.length}/100
                </div>
              </div>

              <div className="cc-field-group">
                <label className="cc-label">
                  Select Property <span className="cc-required">*</span>
                </label>
                <div className="cc-select-wrap">
                  <span className="cc-select-emoji">🏉</span>
                  <select
                    className="cc-input cc-select cc-select-icon-pad"
                    name="property"
                    value={info.property}
                    onChange={handleChange}
                  >
                    <option value="">Select a property</option>
                    {properties.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <FiChevronDown size={14} className="cc-select-arrow" />
                </div>
              </div>
            </div>

            {/* Campaign Type + Campaign Description */}
            <div className="cc-field-row">
              <div className="cc-field-group">
                <label className="cc-label">
                  Campaign Type <span className="cc-required">*</span>
                </label>
                <div className="cc-select-wrap">
                  <span className="cc-select-icon-left">📢</span>
                  <select
                    className="cc-input cc-select cc-select-icon-pad"
                    name="campaignType"
                    value={info.campaignType}
                    onChange={handleChange}
                  >
                    <option value="">Select a campaign type</option>
                    {campaignTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <FiChevronDown size={14} className="cc-select-arrow" />
                </div>
              </div>

              <div className="cc-field-group">
                <label className="cc-label">
                  Campaign Description <span className="cc-required">*</span>
                </label>
                <textarea
                  className="cc-input cc-textarea cc-textarea-tall"
                  name="description"
                  value={info.description}
                  onChange={handleChange}
                  maxLength={500}
                  rows={5}
                />
                <div className="cc-char-count cc-char-count-right">
                  {info.description.length}/500
                </div>
              </div>
            </div>

            {/* Campaign Goals */}
            <div className="cc-goals-section">
              <div className="cc-goals-header">
                <label className="cc-label">
                  Campaign Goals <span className="cc-required">*</span>
                </label>
                <span className="cc-goals-hint">Select all that apply</span>
              </div>
              <div className="cc-goals-grid">
                {goals.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = info.goals.includes(goal.id);
                  return (
                    <div
                      key={goal.id}
                      className={`cc-goal-card ${isSelected ? 'cc-goal-selected' : ''}`}
                      onClick={() => toggleGoal(goal.id)}
                    >
                      <div className={`cc-goal-checkbox ${isSelected ? 'cc-goal-checkbox-checked' : ''}`}>
                        {isSelected && <span className="cc-checkmark">✓</span>}
                      </div>
                      <div className="cc-goal-icon-wrap">
                        <Icon size={22} className="cc-goal-icon" />
                      </div>
                      <div className="cc-goal-text">
                        <div className="cc-goal-title">{goal.title}</div>
                        <div className="cc-goal-desc">{goal.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {errorMessage && (
              <div className="cc-error-banner">{errorMessage}</div>
            )}
          </div>

          {/* Footer */}
          <div className="cc-footer">
            <button
              className="cc-next-btn"
              disabled={isSaving}
              onClick={() => void handleNext()}
            >
              {isSaving ? 'Saving…' : 'Next: Targeting'} <FiArrowRight size={16} />
            </button>
          </div>
        </main>

        {/* Ad panel */}
        <div className="cc-ad-panel">
          <div className="cc-ad-card cc-ad-green">
            <div className="cc-ad-content">
              <div className="cc-ad-logo">KCB</div>
              <div className="cc-ad-brand">BANK</div>
              <div className="cc-ad-tagline">For People. <strong>For Better.</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
