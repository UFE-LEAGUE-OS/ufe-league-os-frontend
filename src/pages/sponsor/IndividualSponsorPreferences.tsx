import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheck } from 'react-icons/fi';
import Navbar from '../../components/Navbar';
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

export default function IndividualSponsorPreferences() {
  const navigate = useNavigate();
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [duration, setDuration] = useState('');

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleGoal = (id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  return (
    <div className="isp-page">
      <Navbar />

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
              Annual Sponsorship Budget <span className="isp-required">*</span>
            </label>
            <div className="isp-budget-grid">
              {budgetRanges.map((b) => (
                <div
                  key={b.id}
                  className={`isp-budget-card ${selectedBudget === b.id ? 'isp-budget-selected' : ''}`}
                  onClick={() => setSelectedBudget(b.id)}
                >
                  <div className={`isp-radio ${selectedBudget === b.id ? 'isp-radio-selected' : ''}`}>
                    {selectedBudget === b.id && <FiCheck size={12} />}
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
              Type of Sponsorship <span className="isp-required">*</span>
            </label>
            <p className="isp-section-hint">Select all that apply.</p>
            <div className="isp-types-grid">
              {sponsorshipTypes.map((type) => {
                const isSelected = selectedTypes.includes(type.id);
                return (
                  <div
                    key={type.id}
                    className={`isp-type-card ${isSelected ? 'isp-type-selected' : ''}`}
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
              Sponsorship Goals <span className="isp-required">*</span>
            </label>
            <p className="isp-section-hint">What do you hope to achieve?</p>
            <div className="isp-goals-grid">
              {goals.map((goal) => {
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <div
                    key={goal.id}
                    className={`isp-goal-chip ${isSelected ? 'isp-goal-selected' : ''}`}
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
              Preferred Sponsorship Duration <span className="isp-required">*</span>
            </label>
            <div className="isp-duration-grid">
              {['3 Months', '6 Months', '1 Year', '2+ Years'].map((d) => (
                <div
                  key={d}
                  className={`isp-duration-card ${duration === d ? 'isp-duration-selected' : ''}`}
                  onClick={() => setDuration(d)}
                >
                  <div className={`isp-radio ${duration === d ? 'isp-radio-selected' : ''}`}>
                    {duration === d && <FiCheck size={12} />}
                  </div>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>

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
            onClick={() => navigate('/sponsor/individual/review')}
          >
            Next: Review <FiArrowRight size={15} />
          </button>
        </div>
      </main>
    </div>
  );
}