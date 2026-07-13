import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import { useSponsorFormStore } from '../../store/sponsorFormStore';
import '../../styles/pages/landing.css';
import './IndividualSponsorPreferences.css';

const steps = [
  { number: 1, label: 'Basic Info', sub: 'Tell us about yourself' },
  { number: 2, label: 'Interests', sub: 'Choose your interests' },
  { number: 3, label: 'Review', sub: 'Review your details' },
  { number: 4, label: 'Complete', sub: "You're all set!" },
];

const currentStep = 2;

const budgetRanges = [
  { id: 'under-1m', label: 'Under UGX 1M', desc: 'Entry level support' },
  { id: '1m-5m', label: 'UGX 1M – 5M', desc: 'Growing supporter' },
  { id: '5m-20m', label: 'UGX 5M – 20M', desc: 'Active sponsor' },
  { id: 'above-20m', label: 'Above UGX 20M', desc: 'Premium sponsor' },
];

const sponsorshipTypes = [
  { id: 'club', label: 'Club Sponsorship', desc: 'Sponsor a specific club or team' },
  { id: 'league', label: 'League Sponsorship', desc: 'Sponsor an entire league or competition' },
  { id: 'player', label: 'Player Sponsorship', desc: 'Support an individual athlete' },
  { id: 'event', label: 'Event Sponsorship', desc: 'Sponsor a specific match or event' },
  { id: 'grassroots', label: 'Grassroots Development', desc: 'Support youth and community sports' },
  { id: 'digital', label: 'Digital Campaigns', desc: 'Online and social media sponsorship' },
];

const goals = [
  { id: 'brand', label: 'Brand Visibility' },
  { id: 'community', label: 'Community Impact' },
  { id: 'networking', label: 'Networking' },
  { id: 'passion', label: 'Passion for Sport' },
  { id: 'recognition', label: 'Personal Recognition' },
  { id: 'business', label: 'Business Growth' },
];

type FieldErrors = {
  budget?: boolean;
  types?: boolean;
  goals?: boolean;
  duration?: boolean;
};

export default function IndividualSponsorPreferences() {
  const navigate = useNavigate();

  const form = useSponsorFormStore((state) => state.individual);
  const updateIndividual = useSponsorFormStore((state) => state.updateIndividual);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState('');

  const toggleType = (id: string) => {
    const current = form.sponsorshipTypes;
    const next = current.includes(id)
      ? current.filter((t) => t !== id)
      : [...current, id];

    updateIndividual({ sponsorshipTypes: next });

    if (next.length > 0) {
      setErrors((prev) => {
        if (!prev.types) return prev;
        const nextErrors = { ...prev };
        delete nextErrors.types;
        return nextErrors;
      });
    }
  };

  const toggleGoal = (id: string) => {
    const current = form.goals;
    const next = current.includes(id)
      ? current.filter((g) => g !== id)
      : [...current, id];

    updateIndividual({ goals: next });

    if (next.length > 0) {
      setErrors((prev) => {
        if (!prev.goals) return prev;
        const nextErrors = { ...prev };
        delete nextErrors.goals;
        return nextErrors;
      });
    }
  };

  const selectBudget = (id: string) => {
    updateIndividual({ preferredBudget: id });
    setErrors((prev) => {
      if (!prev.budget) return prev;
      const nextErrors = { ...prev };
      delete nextErrors.budget;
      return nextErrors;
    });
  };

  const selectDuration = (d: string) => {
    updateIndividual({ duration: d });
    setErrors((prev) => {
      if (!prev.duration) return prev;
      const nextErrors = { ...prev };
      delete nextErrors.duration;
      return nextErrors;
    });
  };

  const handleNext = () => {
    const nextErrors: FieldErrors = {};

    if (!form.preferredBudget) nextErrors.budget = true;
    if (form.sponsorshipTypes.length === 0) nextErrors.types = true;
    if (form.goals.length === 0) nextErrors.goals = true;
    if (!form.duration) nextErrors.duration = true;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setErrorMessage('Please complete all required sections before continuing.');
      return;
    }

    setErrors({});
    setErrorMessage('');
    navigate('/sponsor/individual/review');
  };

  return (
    <div className="isp-page">

      <main className="isp-main landing-page">

        {/* Header */}
        <div className="isp-header">
          <h1 className="isp-title">Individual Sponsor Setup</h1>
          <p className="isp-subtitle">
            Partner with Uganda's most exciting leagues, clubs and athletes.
          </p>
        </div>

        {/* Stepper */}
        <div className="isp-stepper">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            return (
              <div key={step.number} className="isp-step-wrap">
                <div className="isp-step">
                  <div className={`isp-step-circle ${isActive ? 'isp-step-circle-active' : ''} ${isCompleted ? 'isp-step-circle-completed' : ''}`}>
                    {isCompleted ? '✓' : step.number}
                  </div>
                  <div className="isp-step-text">
                    <div className={`isp-step-label ${isActive ? 'isp-step-label-active' : ''}`}>
                      {step.label}
                    </div>
                    <div className="isp-step-sub">{step.sub}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`isp-step-line ${isCompleted ? 'isp-step-line-completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <div className="isp-form-card">
          <h2 className="isp-form-title">Sponsorship Preferences</h2>
          <p className="isp-form-subtitle">
            Tell us about your sponsorship goals and budget so we can match you with the right opportunities.
          </p>

          {/* Budget */}
          <div className="isp-section">
            <label className="isp-section-label">
              Annual Sponsorship Budget {errors.budget && <span className="isp-required">*</span>}
            </label>
            <div className="isp-budget-grid">
              {budgetRanges.map((b) => (
                <div
                  key={b.id}
                  className={`isp-budget-card ${form.preferredBudget === b.id ? 'isp-budget-selected' : ''} ${errors.budget ? 'isp-card-error' : ''}`}
                  onClick={() => selectBudget(b.id)}
                >
                  <div className={`isp-radio ${form.preferredBudget === b.id ? 'isp-radio-selected' : ''}`}>
                    {form.preferredBudget === b.id && <FiCheck size={12} />}
                  </div>
                  <div>
                    <div className="isp-budget-label">{b.label}</div>
                    <div className="isp-budget-desc">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsorship types */}
          <div className="isp-section">
            <label className="isp-section-label">
              Type of Sponsorship {errors.types && <span className="isp-required">*</span>}
            </label>
            <p className="isp-section-hint">Select all that apply.</p>
            <div className="isp-types-grid">
              {sponsorshipTypes.map((type) => {
                const isSelected = form.sponsorshipTypes.includes(type.id);
                return (
                  <div
                    key={type.id}
                    className={`isp-type-card ${isSelected ? 'isp-type-selected' : ''} ${errors.types ? 'isp-card-error' : ''}`}
                    onClick={() => toggleType(type.id)}
                  >
                    <div className={`isp-checkbox ${isSelected ? 'isp-checkbox-checked' : ''}`}>
                      {isSelected && <span className="isp-checkmark">✓</span>}
                    </div>
                    <div>
                      <div className="isp-type-label">{type.label}</div>
                      <div className="isp-type-desc">{type.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goals */}
          <div className="isp-section">
            <label className="isp-section-label">
              Sponsorship Goals {errors.goals && <span className="isp-required">*</span>}
            </label>
            <p className="isp-section-hint">What do you hope to achieve?</p>
            <div className="isp-goals-grid">
              {goals.map((goal) => {
                const isSelected = form.goals.includes(goal.id);
                return (
                  <div
                    key={goal.id}
                    className={`isp-goal-chip ${isSelected ? 'isp-goal-selected' : ''} ${errors.goals ? 'isp-card-error' : ''}`}
                    onClick={() => toggleGoal(goal.id)}
                  >
                    {isSelected && <FiCheck size={13} />}
                    {goal.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Duration */}
          <div className="isp-section">
            <label className="isp-section-label">
              Preferred Sponsorship Duration {errors.duration && <span className="isp-required">*</span>}
            </label>
            <div className="isp-duration-grid">
              {['3 Months', '6 Months', '1 Year', '2+ Years'].map((d) => (
                <div
                  key={d}
                  className={`isp-duration-card ${form.duration === d ? 'isp-duration-selected' : ''} ${errors.duration ? 'isp-card-error' : ''}`}
                  onClick={() => selectDuration(d)}
                >
                  <div className={`isp-radio ${form.duration === d ? 'isp-radio-selected' : ''}`}>
                    {form.duration === d && <FiCheck size={12} />}
                  </div>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="isp-error-banner">{errorMessage}</div>
        )}

        {/* Bottom nav */}
        <div className="isp-bottom-nav">
          <button
            className="isp-back-btn"
            onClick={() => navigate('/sponsor/individualsetup')}
          >
            <FiArrowLeft size={15} />
            Back: Basic Info
          </button>
          <button
            className="isp-next-btn"
            onClick={handleNext}
          >
            Next: Review <FiArrowRight size={15} />
          </button>
        </div>
      </main>
    </div>
  );
}