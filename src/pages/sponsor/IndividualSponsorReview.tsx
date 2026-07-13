import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiEdit2,
  FiUser,
  FiHeart,
  FiAlertCircle,
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useSponsorFormStore } from '../../store/sponsorFormStore';
import { getToken } from '../../utils/tokenManager';
import { becomeSponsor } from '../../services/sponsorshipService';
import '../../styles/pages/landing.css';
import './IndividualSponsorReview.css';

const steps = [
  { number: 1, label: 'Basic Info', sub: 'Tell us about yourself' },
  { number: 2, label: 'Interests', sub: 'Choose your interests' },
  { number: 3, label: 'Review', sub: 'Review your details' },
  { number: 4, label: 'Complete', sub: "You're all set!" },
];

const currentStep = 3;

const countryDialCodes: Record<string, string> = {
  Uganda: '+256',
  Kenya: '+254',
  Tanzania: '+255',
  Rwanda: '+250',
  Burundi: '+257',
};

const countryIsoCodes: Record<string, string> = {
  Uganda: 'UG',
  Kenya: 'KE',
  Tanzania: 'TZ',
  Rwanda: 'RW',
  Burundi: 'BI',
  'South Sudan': 'SS',
  Ethiopia: 'ET',
  Nigeria: 'NG',
  Ghana: 'GH',
};

const sportLabels: Record<string, string> = {
  football: 'Football',
  rugby: 'Rugby',
  basketball: 'Basketball',
  'nile-rugby': 'Nile Special Rugby League',
  kobs: 'KOBS RFC',
  others: 'Other',
};

const budgetLabels: Record<string, string> = {
  'under-1m': 'Under UGX 1M',
  '1m-5m': 'UGX 1M – 5M',
  '5m-20m': 'UGX 5M – 20M',
  'above-20m': 'Above UGX 20M',
};

const typeLabels: Record<string, string> = {
  club: 'Club Sponsorship',
  league: 'League Sponsorship',
  player: 'Player Sponsorship',
  event: 'Event Sponsorship',
  grassroots: 'Grassroots Development',
  digital: 'Digital Campaigns',
};

const goalLabels: Record<string, string> = {
  brand: 'Brand Visibility',
  community: 'Community Impact',
  networking: 'Networking',
  passion: 'Passion for Sport',
  recognition: 'Personal Recognition',
  business: 'Business Growth',
};

function extractErrorMessage(error: unknown): string {
  const responseData = (error as { response?: { data?: unknown } })?.response?.data;

  if (!responseData || typeof responseData !== 'object') {
    return 'We could not submit your application right now. Please try again.';
  }

  const values = Object.values(responseData as Record<string, unknown>);
  const messages = values.flatMap((value) =>
    Array.isArray(value) ? value : [String(value)]
  );

  return messages.length > 0
    ? messages.join(' ')
    : 'We could not submit your application right now. Please try again.';
}

export default function IndividualSponsorReview() {
  const navigate = useNavigate();

  const form = useSponsorFormStore((state) => state.individual);
  const resetIndividual = useSponsorFormStore((state) => state.resetIndividual);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = Boolean(accessToken || getToken());

  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const dialCode = countryDialCodes[form.country] ?? '+256';
  const fullName = [form.firstName, form.lastName].filter(Boolean).join(' ');

  const handleSubmit = async () => {
    setErrorMessage('');

    if (!declarationChecked) {
      setErrorMessage('Please confirm the declaration before submitting.');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          postLoginRedirect: '/sponsor/individual/review',
          message: 'Please log in or create an account to submit your sponsorship application.',
        },
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await becomeSponsor({
        sponsor_type: 'INDIVIDUAL',
        name: fullName.trim(),
        registration_country: countryIsoCodes[form.country] ?? 'UG',
      });

      resetIndividual();
      navigate('/sponsor/individual/complete');
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;

      if (status === 401) {
        navigate('/login', {
          state: {
            postLoginRedirect: '/sponsor/individual/review',
            message: 'Your session has expired. Please log in again to continue.',
          },
        });
        return;
      }

      setErrorMessage(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="isr-page">

      <main className="isr-main landing-page">

        {/* Header */}
        <div className="isr-header">
          <h1 className="isr-title">Individual Sponsor Setup</h1>
          <p className="isr-subtitle">
            Partner with Uganda's most exciting leagues, clubs and athletes.
          </p>
        </div>

        {/* Stepper */}
        <div className="isr-stepper">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            return (
              <div key={step.number} className="isr-step-wrap">
                <div className="isr-step">
                  <div className={`isr-step-circle ${isActive ? 'isr-step-circle-active' : ''} ${isCompleted ? 'isr-step-circle-completed' : ''}`}>
                    {isCompleted ? '✓' : step.number}
                  </div>
                  <div className="isr-step-text">
                    <div className={`isr-step-label ${isActive ? 'isr-step-label-active' : ''}`}>
                      {step.label}
                    </div>
                    <div className="isr-step-sub">{step.sub}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`isr-step-line ${isCompleted ? 'isr-step-line-completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="isr-body">
          <div className="isr-content">

            <p className="isr-intro">
              Please review your information before submitting. You can go back to edit any section.
            </p>

            {/* Basic Information */}
            <div className="isr-section-card">
              <div className="isr-section-header">
                <div className="isr-section-title-row">
                  <div className="isr-section-icon-wrap">
                    <FiUser size={16} className="isr-section-icon" />
                  </div>
                  <h3 className="isr-section-title">Basic Information</h3>
                </div>
                <button
                  className="isr-edit-btn"
                  onClick={() => navigate('/sponsor/individualsetup')}
                >
                  <FiEdit2 size={13} /> Edit
                </button>
              </div>
              <div className="isr-detail-grid">
                <div className="isr-detail-row">
                  <span className="isr-detail-label">Full Name</span>
                  <span className="isr-detail-val">{fullName || '—'}</span>
                </div>
                <div className="isr-detail-row">
                  <span className="isr-detail-label">Email Address</span>
                  <span className="isr-detail-val">{form.email || '—'}</span>
                </div>
                <div className="isr-detail-row">
                  <span className="isr-detail-label">Phone Number</span>
                  <span className="isr-detail-val">{form.phone ? `${dialCode} ${form.phone}` : '—'}</span>
                </div>
                <div className="isr-detail-row">
                  <span className="isr-detail-label">Country</span>
                  <span className="isr-detail-val">{form.country || '—'}</span>
                </div>
                <div className="isr-detail-row">
                  <span className="isr-detail-label">City</span>
                  <span className="isr-detail-val">{form.city || '—'}</span>
                </div>
                <div className="isr-detail-row">
                  <span className="isr-detail-label">Sports Interests</span>
                  <span className="isr-detail-val">
                    {form.selectedSports.length > 0
                      ? form.selectedSports.map((id) => sportLabels[id] ?? id).join(', ')
                      : '—'}
                  </span>
                </div>
                <div className="isr-detail-row isr-detail-full">
                  <span className="isr-detail-label">Why Sponsoring</span>
                  <span className="isr-detail-val">
                    {form.reason || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="isr-section-card">
              <div className="isr-section-header">
                <div className="isr-section-title-row">
                  <div className="isr-section-icon-wrap">
                    <FiHeart size={16} className="isr-section-icon" />
                  </div>
                  <h3 className="isr-section-title">Sponsorship Preferences</h3>
                </div>
                <button
                  className="isr-edit-btn"
                  onClick={() => navigate('/sponsor/individual/preferences')}
                >
                  <FiEdit2 size={13} /> Edit
                </button>
              </div>
              <div className="isr-detail-grid">
                <div className="isr-detail-row">
                  <span className="isr-detail-label">Annual Budget</span>
                  <span className="isr-detail-val">{budgetLabels[form.preferredBudget] ?? '—'}</span>
                </div>
                <div className="isr-detail-row">
                  <span className="isr-detail-label">Duration</span>
                  <span className="isr-detail-val">{form.duration || '—'}</span>
                </div>
                <div className="isr-detail-row isr-detail-full">
                  <span className="isr-detail-label">Sponsorship Types</span>
                  <div className="isr-chips">
                    {form.sponsorshipTypes.length > 0 ? (
                      form.sponsorshipTypes.map((id) => (
                        <span key={id} className="isr-chip">{typeLabels[id] ?? id}</span>
                      ))
                    ) : (
                      <span className="isr-detail-val">—</span>
                    )}
                  </div>
                </div>
                <div className="isr-detail-row isr-detail-full">
                  <span className="isr-detail-label">Goals</span>
                  <div className="isr-chips">
                    {form.goals.length > 0 ? (
                      form.goals.map((id) => (
                        <span key={id} className="isr-chip">{goalLabels[id] ?? id}</span>
                      ))
                    ) : (
                      <span className="isr-detail-val">—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="isr-declaration">
              <div className="isr-declaration-check">
                <input
                  type="checkbox"
                  id="declaration"
                  className="isr-checkbox"
                  checked={declarationChecked}
                  onChange={(e) => {
                    setDeclarationChecked(e.target.checked);
                    setErrorMessage('');
                  }}
                />
                <label htmlFor="declaration" className="isr-declaration-label">
                  I confirm that all information provided is accurate and I agree to the
                  League OS sponsorship terms and conditions.
                </label>
              </div>
            </div>

            {errorMessage && (
              <div className="isr-declaration" style={{ borderColor: 'rgba(220, 38, 38, 0.3)' }}>
                <div className="isr-declaration-check">
                  <FiAlertCircle size={16} style={{ color: '#DC2626', flexShrink: 0, marginTop: 2 }} />
                  <span className="isr-declaration-label" style={{ color: '#DC2626' }}>
                    {errorMessage}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right summary panel */}
          <div className="isr-sidebar">
            <div className="isr-summary-card">
              <h4 className="isr-summary-title">Submission Summary</h4>
              <div className="isr-summary-items">
                <div className="isr-summary-item">
                  <FiCheckCircle size={14} className="isr-check-done" />
                  <span>Basic information complete</span>
                </div>
                <div className="isr-summary-item">
                  <FiCheckCircle size={14} className="isr-check-done" />
                  <span>Preferences selected</span>
                </div>
              </div>
              <div className="isr-summary-divider" />
              <p className="isr-summary-note">
                Your application will be reviewed by the League OS team within
                2-3 business days.
              </p>
            </div>

            <div className="isr-secure-section">
              <span className="isr-secure-icon">🔒</span>
              <div>
                <div className="isr-secure-title">Your data is secure</div>
                <div className="isr-secure-text">
                  We never share your information without your consent.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="isr-bottom-nav">
          <button
            className="isr-back-btn"
            onClick={() => navigate('/sponsor/individual/preferences')}
          >
            <FiArrowLeft size={15} />
            Back: Preferences
          </button>
          <button
            className="isr-submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'} <FiArrowRight size={15} />
          </button>
        </div>
      </main>
    </div>
  );
}