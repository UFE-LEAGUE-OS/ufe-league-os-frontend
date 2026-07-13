import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiEdit2,
  FiHome,
  FiUser,
  FiFileText,
  FiAlertCircle,
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useSponsorFormStore } from '../../store/sponsorFormStore';
import { getToken } from '../../utils/tokenManager';
import { becomeSponsor } from '../../services/sponsorshipService';
import { updateProfile } from '../../services/authService.js';
import '../../styles/pages/landing.css';
import './CorporateSponsorReview.css';

const steps = [
  { number: 1, label: 'Company Info' },
  { number: 2, label: 'Contact Person' },
  { number: 3, label: 'Verification' },
  { number: 4, label: 'Review' },
  { number: 5, label: 'Complete' },
];

const currentStep = 4;

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

export default function CorporateSponsorReview() {
  const navigate = useNavigate();

  const form = useSponsorFormStore((state) => state.corporate);
  const resetCorporate = useSponsorFormStore((state) => state.resetCorporate);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = Boolean(accessToken || getToken());

  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const dialCode = countryDialCodes[form.country] ?? '+256';

  const handleSubmit = async () => {
    setErrorMessage('');

    if (!declarationChecked) {
      setErrorMessage('Please confirm the declaration before submitting.');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          postLoginRedirect: '/sponsor/corporatesetup/review',
          message: 'Please log in or create an account to submit your sponsorship application.',
        },
      });
      return;
    }

    setIsSubmitting(true);

try {
      await becomeSponsor({
        sponsor_type: 'CORPORATE',
        name: form.companyName.trim(),
        registration_country: countryIsoCodes[form.country] ?? 'UG',
        brn: form.brn.trim(),
        tin: form.tin.trim(),
      });

      try {
        await updateProfile({ location: form.city.trim() });
      } catch {
        // Non-critical — sponsor account was created successfully either way.
      }

      resetCorporate();
      navigate('/sponsor/corporatesetup/complete');
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;

      if (status === 401) {
        navigate('/login', {
          state: {
            postLoginRedirect: '/sponsor/corporatesetup/review',
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
    <div className="csr-page">

      <main className="csr-main landing-page">

        {/* Back link */}
        <button
          className="csr-back-link"
          onClick={() => navigate('/sponsor/corporatesetup/verification')}
        >
          <FiArrowLeft size={15} />
          Back to Verification
        </button>

        {/* Header */}
        <div className="csr-header">
          <h1 className="csr-title">Corporate Sponsor Setup</h1>
          <p className="csr-subtitle">
            Tell us about your organization so we can tailor the best partnership experience.
          </p>
        </div>

        {/* Stepper */}
        <div className="csr-stepper">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            return (
              <div key={step.number} className="csr-step-wrap">
                <div className="csr-step">
                  <div className={`csr-step-circle ${isActive ? 'csr-step-circle-active' : ''} ${isCompleted ? 'csr-step-circle-completed' : ''}`}>
                    {isCompleted ? '✓' : step.number}
                  </div>
                  <div className={`csr-step-label ${isActive ? 'csr-step-label-active' : ''}`}>
                    {step.label}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`csr-step-line ${isCompleted ? 'csr-step-line-completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="csr-body">
          <div className="csr-content">

            <p className="csr-intro">
              Please review your information before submitting. You can go back to edit any section.
            </p>

            {/* Company Information */}
            <div className="csr-section-card">
              <div className="csr-section-header">
                <div className="csr-section-title-row">
                  <div className="csr-section-icon-wrap">
                    <FiHome size={16} className="csr-section-icon" />
                  </div>
                  <h3 className="csr-section-title">Company Information</h3>
                </div>
                <button
                  className="csr-edit-btn"
                  onClick={() => navigate('/sponsor/corporatesetup')}
                >
                  <FiEdit2 size={13} /> Edit
                </button>
              </div>
              <div className="csr-detail-grid">
                <div className="csr-detail-row">
                  <span className="csr-detail-label">Company Name</span>
                  <span className="csr-detail-val">{form.companyName || '—'}</span>
                </div>
                <div className="csr-detail-row">
                  <span className="csr-detail-label">Company Email</span>
                  <span className="csr-detail-val">{form.companyEmail || '—'}</span>
                </div>
                <div className="csr-detail-row">
                  <span className="csr-detail-label">Phone Number</span>
                  <span className="csr-detail-val">{form.phone ? `${dialCode} ${form.phone}` : '—'}</span>
                </div>
                <div className="csr-detail-row">
                  <span className="csr-detail-label">Country</span>
                  <span className="csr-detail-val">{form.country || '—'}</span>
                </div>
                <div className="csr-detail-row">
                  <span className="csr-detail-label">City</span>
                  <span className="csr-detail-val">{form.city || '—'}</span>
                </div>
                <div className="csr-detail-row">
                  <span className="csr-detail-label">Industry</span>
                  <span className="csr-detail-val">{form.industry || '—'}</span>
                </div>
                <div className="csr-detail-row">
                  <span className="csr-detail-label">Website</span>
                  <span className="csr-detail-val">{form.website || '—'}</span>
                </div>
                <div className="csr-detail-row">
                  <span className="csr-detail-label">BRN</span>
                  <span className="csr-detail-val">{form.brn || '—'}</span>
                </div>
                <div className="csr-detail-row">
                  <span className="csr-detail-label">TIN Number</span>
                  <span className="csr-detail-val">{form.tin || '—'}</span>
                </div>
              </div>
            </div>

            {/* Contact Person */}
            <div className="csr-section-card">
              <div className="csr-section-header">
                <div className="csr-section-title-row">
                  <div className="csr-section-icon-wrap">
                    <FiUser size={16} className="csr-section-icon" />
                  </div>
                  <h3 className="csr-section-title">Contact Person</h3>
                </div>
                <button
                  className="csr-edit-btn"
                  onClick={() => navigate('/sponsor/corporatesetup/contact')}
                >
                  <FiEdit2 size={13} /> Edit
                </button>
              </div>
              <div className="csr-detail-grid">
                <div className="csr-detail-row">
                  <span className="csr-detail-label">Full Name</span>
                  <span className="csr-detail-val">
                    {[form.contactTitle, form.contactFirstName, form.contactLastName]
                      .filter(Boolean)
                      .join(' ') || '—'}
                  </span>
                </div>
                <div className="csr-detail-row">
                  <span className="csr-detail-label">Email</span>
                  <span className="csr-detail-val">{form.contactEmail || '—'}</span>
                </div>
                <div className="csr-detail-row">
                  <span className="csr-detail-label">Phone</span>
                  <span className="csr-detail-val">{form.contactPhone ? `${dialCode} ${form.contactPhone}` : '—'}</span>
                </div>
                <div className="csr-detail-row">
                  <span className="csr-detail-label">Role</span>
                  <span className="csr-detail-val">{form.contactRole || '—'}</span>
                </div>
                <div className="csr-detail-row">
                  <span className="csr-detail-label">Primary Contact</span>
                  <span className={`csr-detail-val ${form.contactIsPrimary ? 'csr-badge-yes' : ''}`}>
                    {form.contactIsPrimary ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Documents */}
            <div className="csr-section-card">
              <div className="csr-section-header">
                <div className="csr-section-title-row">
                  <div className="csr-section-icon-wrap">
                    <FiFileText size={16} className="csr-section-icon" />
                  </div>
                  <h3 className="csr-section-title">Verification Documents</h3>
                </div>
                <button
                  className="csr-edit-btn"
                  onClick={() => navigate('/sponsor/corporatesetup/verification')}
                >
                  <FiEdit2 size={13} /> Edit
                </button>
              </div>
              <div className="csr-docs-list">
                <div className="csr-doc-item">
                  <FiCheckCircle size={16} className="csr-doc-icon-done" />
                  <span className="csr-doc-name">Certificate of Incorporation</span>
                  <span className="csr-doc-status csr-doc-uploaded">Uploaded</span>
                </div>
                <div className="csr-doc-item">
                  <FiCheckCircle size={16} className="csr-doc-icon-done" />
                  <span className="csr-doc-name">Tax Identification Number (TIN)</span>
                  <span className="csr-doc-status csr-doc-uploaded">Uploaded</span>
                </div>
                <div className="csr-doc-item">
                  <FiCheckCircle size={16} className="csr-doc-icon-done" />
                  <span className="csr-doc-name">Company Logo</span>
                  <span className="csr-doc-status csr-doc-uploaded">Uploaded</span>
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="csr-declaration">
              <div className="csr-declaration-check">
                <input
                  type="checkbox"
                  id="declaration"
                  className="csr-checkbox"
                  checked={declarationChecked}
                  onChange={(e) => {
                    setDeclarationChecked(e.target.checked);
                    setErrorMessage('');
                  }}
                />
                <label htmlFor="declaration" className="csr-declaration-label">
                  I confirm that all information provided is accurate and I am authorised
                  to submit this sponsorship application on behalf of the organisation.
                </label>
              </div>
            </div>

            {errorMessage && (
              <div className="csr-declaration" style={{ borderColor: 'rgba(220, 38, 38, 0.3)' }}>
                <div className="csr-declaration-check">
                  <FiAlertCircle size={16} style={{ color: '#DC2626', flexShrink: 0, marginTop: 2 }} />
                  <span className="csr-declaration-label" style={{ color: '#DC2626' }}>
                    {errorMessage}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right summary panel */}
          <div className="csr-sidebar">
            <div className="csr-summary-card">
              <h4 className="csr-summary-title">Submission Summary</h4>
              <div className="csr-summary-items">
                <div className="csr-summary-item">
                  <FiCheckCircle size={14} className="csr-check-done" />
                  <span>Company information complete</span>
                </div>
                <div className="csr-summary-item">
                  <FiCheckCircle size={14} className="csr-check-done" />
                  <span>Contact person added</span>
                </div>
                <div className="csr-summary-item">
                  <FiCheckCircle size={14} className="csr-check-done" />
                  <span>Documents uploaded</span>
                </div>
              </div>
              <div className="csr-summary-divider" />
              <p className="csr-summary-note">
                Your application will be reviewed by the League OS team within
                2-3 business days.
              </p>
            </div>

            <div className="csr-secure-section">
              <span className="csr-secure-icon">🔒</span>
              <div>
                <div className="csr-secure-title">Your data is secure</div>
                <div className="csr-secure-text">
                  We never share your information without your consent.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="csr-bottom-nav">
          <button
            className="csr-back-btn"
            onClick={() => navigate('/sponsor/corporatesetup/verification')}
          >
            <FiArrowLeft size={15} />
            Back: Verification
          </button>
          <button
            className="csr-submit-btn"
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