import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiDollarSign,
  FiCalendar,
  FiCheck,
  FiInfo,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { useSponsorCampaignStore } from '../../store/sponsorCampaignStore';
import '../../styles/pages/landing.css';
import './CampaignBudget.css';

const steps = [
  { number: 1, label: 'Campaign Info' },
  { number: 2, label: 'Targeting' },
  { number: 3, label: 'Assets' },
  { number: 4, label: 'Placement' },
  { number: 5, label: 'Budget' },
  { number: 6, label: 'Review' },
  { number: 7, label: 'Launch' },
];

const currentStep = 5;

const budgetPresets = [
  { id: 'starter', label: 'Starter', amount: '5,000,000', desc: 'Good for small digital campaigns' },
  { id: 'growth', label: 'Growth', amount: '15,000,000', desc: 'Ideal for club or league sponsorships' },
  { id: 'pro', label: 'Pro', amount: '30,000,000', desc: 'High visibility across multiple properties' },
  { id: 'premium', label: 'Premium', amount: '50,000,000', desc: 'Maximum reach and brand exposure', popular: true },
];

const durations = [
  { id: '1month', label: '1 Month', desc: 'Short burst campaign' },
  { id: '3months', label: '3 Months', desc: 'Seasonal campaign' },
  { id: '6months', label: '6 Months', desc: 'Half season' },
  { id: '1year', label: '1 Year', desc: 'Full season commitment' },
];

const paymentSchedules = [
  { id: 'upfront', label: 'Pay Upfront', desc: 'Full payment before campaign starts' },
  { id: 'monthly', label: 'Monthly', desc: 'Split into equal monthly payments' },
  { id: 'milestone', label: 'Milestone Based', desc: 'Pay at key campaign milestones' },
];

export default function CampaignBudget() {
  const navigate = useNavigate();
  const budget = useSponsorCampaignStore((s) => s.budget);
  const updateBudget = useSponsorCampaignStore((s) => s.updateBudget);
  const saveDraft = useSponsorCampaignStore((s) => s.saveDraft);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const displayDuration = durations.find((d) => d.id === budget.duration)?.label ?? '';

  const handleNext = async () => {
    if (!budget.amount || !budget.duration || !budget.startDate || !budget.endDate) {
      setErrorMessage('Please set a budget, duration and campaign dates before continuing.');
      return;
    }

    setErrorMessage('');
    setIsSaving(true);
    try {
      await saveDraft();
      navigate('/sponsor/campaigns/new/review');
    } catch {
      setErrorMessage('We could not save your campaign. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="cb-page">
      <div className="cb-layout">
        <SponsorSidebar />

        <main className="cb-main landing-page">

          {/* Header */}
          <div className="cb-header">
            <button className="cb-back-btn" onClick={() => navigate('/sponsor/campaigns/new/placement')}>
              <FiArrowLeft size={18} />
            </button>
            <h1 className="cb-title">Create Sponsor Campaign</h1>
          </div>

          {/* Stepper */}
          <div className="cb-stepper">
            {steps.map((step, index) => {
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              return (
                <div key={step.number} className="cb-step-wrap">
                  <div className="cb-step">
                    <div className={`cb-step-circle ${isActive ? 'cb-step-active' : ''} ${isCompleted ? 'cb-step-completed' : ''}`}>
                      {isCompleted ? '✓' : step.number}
                    </div>
                    <div className={`cb-step-label ${isActive ? 'cb-step-label-active' : ''}`}>
                      {step.label}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`cb-step-line ${isCompleted ? 'cb-step-line-done' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>

          <p className="cb-intro">Set your campaign budget, duration and payment preferences.</p>

          {/* Body */}
          <div className="cb-body">

            {/* Form card */}
            <div className="cb-form-card">
              <h2 className="cb-form-title">Budget & Schedule</h2>

              {/* Budget presets */}
              <div className="cb-section">
                <label className="cb-section-label">
                  Campaign Budget <span className="cb-required">*</span>
                </label>
                <p className="cb-section-hint">Select a preset or enter a custom budget in UGX.</p>
                <div className="cb-preset-grid">
                  {budgetPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`cb-preset-card ${budget.presetId === preset.id && !budget.isCustom ? 'cb-preset-selected' : ''}`}
                      onClick={() => updateBudget({ presetId: preset.id, isCustom: false, amount: preset.amount })}
                    >
                      {preset.popular && <span className="cb-popular-badge">Most Popular</span>}
                      <div className="cb-preset-label">{preset.label}</div>
                      <div className="cb-preset-amount">UGX {preset.amount}</div>
                      <div className="cb-preset-desc">{preset.desc}</div>
                      {budget.presetId === preset.id && !budget.isCustom && (
                        <div className="cb-preset-check"><FiCheck size={14} /></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Custom budget */}
                <div
                  className={`cb-custom-wrap ${budget.isCustom ? 'cb-custom-active' : ''}`}
                  onClick={() => updateBudget({ isCustom: true, amount: '' })}
                >
                  <div className="cb-custom-left">
                    <div className={`cb-radio ${budget.isCustom ? 'cb-radio-on' : ''}`} />
                    <span className="cb-custom-label">Custom Budget</span>
                  </div>
                  {budget.isCustom && (
                    <div className="cb-custom-input-wrap">
                      <span className="cb-currency">UGX</span>
                      <input
                        className="cb-custom-input"
                        type="text"
                        placeholder="Enter amount"
                        value={budget.amount}
                        onChange={(e) => updateBudget({ amount: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div className="cb-section">
                <label className="cb-section-label">
                  Campaign Duration <span className="cb-required">*</span>
                </label>
                <div className="cb-duration-grid">
                  {durations.map((d) => (
                    <div
                      key={d.id}
                      className={`cb-duration-card ${budget.duration === d.id ? 'cb-duration-selected' : ''}`}
                      onClick={() => updateBudget({ duration: d.id })}
                    >
                      <div className={`cb-radio ${budget.duration === d.id ? 'cb-radio-on' : ''}`} />
                      <div>
                        <div className="cb-duration-label">{d.label}</div>
                        <div className="cb-duration-desc">{d.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start & End dates */}
              <div className="cb-section">
                <label className="cb-section-label">Campaign Dates <span className="cb-required">*</span></label>
                <div className="cb-date-grid">
                  <div className="cb-field-group">
                    <label className="cb-field-label">Start Date</label>
                    <div className="cb-input-wrap">
                      <FiCalendar size={15} className="cb-input-icon" />
                      <input
                        className="cb-input"
                        type="date"
                        value={budget.startDate}
                        onChange={(e) => updateBudget({ startDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="cb-field-group">
                    <label className="cb-field-label">End Date</label>
                    <div className="cb-input-wrap">
                      <FiCalendar size={15} className="cb-input-icon" />
                      <input
                        className="cb-input"
                        type="date"
                        value={budget.endDate}
                        onChange={(e) => updateBudget({ endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment schedule */}
              <div className="cb-section">
                <label className="cb-section-label">Payment Schedule <span className="cb-required">*</span></label>
                <div className="cb-payment-grid">
                  {paymentSchedules.map((p) => (
                    <div
                      key={p.id}
                      className={`cb-payment-card ${budget.paymentSchedule === p.id ? 'cb-payment-selected' : ''}`}
                      onClick={() => updateBudget({ paymentSchedule: p.id })}
                    >
                      <div className={`cb-radio ${budget.paymentSchedule === p.id ? 'cb-radio-on' : ''}`} />
                      <div>
                        <div className="cb-payment-label">{p.label}</div>
                        <div className="cb-payment-desc">{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Info banner */}
              <div className="cb-info-banner">
                <FiInfo size={15} className="cb-info-icon" />
                <p className="cb-info-text">
                  Your budget will be reviewed by our team before the campaign goes live.
                  Final pricing may vary based on selected properties and placements.
                </p>
              </div>
            </div>

            {/* Budget summary */}
            <div className="cb-summary-card">
              <h3 className="cb-summary-title">Budget Summary</h3>
              <div className="cb-summary-rows">
                <div className="cb-summary-row">
                  <span className="cb-summary-label">Campaign Budget</span>
                  <span className="cb-summary-val">UGX {budget.amount || '0'}</span>
                </div>
                <div className="cb-summary-row">
                  <span className="cb-summary-label">Duration</span>
                  <span className="cb-summary-val">{displayDuration}</span>
                </div>
                <div className="cb-summary-row">
                  <span className="cb-summary-label">Payment</span>
                  <span className="cb-summary-val">
                    {paymentSchedules.find((p) => p.id === budget.paymentSchedule)?.label}
                  </span>
                </div>
                <div className="cb-summary-row">
                  <span className="cb-summary-label">Start Date</span>
                  <span className="cb-summary-val">{budget.startDate || '—'}</span>
                </div>
                <div className="cb-summary-row">
                  <span className="cb-summary-label">End Date</span>
                  <span className="cb-summary-val">{budget.endDate || '—'}</span>
                </div>
              </div>
              <div className="cb-summary-divider" />
              <div className="cb-summary-total-row">
                <span className="cb-summary-total-label">Estimated Total</span>
                <span className="cb-summary-total-val">UGX {budget.amount || '0'}</span>
              </div>
              <div className="cb-summary-note">
                <FiDollarSign size={13} className="cb-summary-note-icon" />
                All amounts in Ugandan Shillings (UGX)
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="cb-error-banner">{errorMessage}</div>
          )}

          {/* Bottom nav */}
          <div className="cb-bottom-nav">
            <button className="cb-back-nav-btn" onClick={() => navigate('/sponsor/campaigns/new/placement')}>
              <FiArrowLeft size={15} /> Back: Placement
            </button>
            <button className="cb-next-btn" disabled={isSaving} onClick={() => void handleNext()}>
              {isSaving ? 'Saving…' : 'Next: Review'} <FiArrowRight size={15} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
