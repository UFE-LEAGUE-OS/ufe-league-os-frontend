import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiBriefcase,
  FiChevronDown,
  FiLinkedin,
} from 'react-icons/fi';
import { useSponsorFormStore } from '../../store/sponsorFormStore';
import '../../styles/pages/landing.css';
import './CorporateContactPerson.css';

const steps = [
  { number: 1, label: 'Company Info' },
  { number: 2, label: 'Contact Person' },
  { number: 3, label: 'Verification' },
  { number: 4, label: 'Review' },
  { number: 5, label: 'Complete' },
];

const currentStep = 2;

const titles = ['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'];

const roles = [
  'Chief Executive Officer (CEO)',
  'Chief Marketing Officer (CMO)',
  'Chief Financial Officer (CFO)',
  'Marketing Manager',
  'Brand Manager',
  'Partnerships Manager',
  'Sponsorship Manager',
  'Communications Director',
  'Other',
];

type FieldErrors = {
  firstName?: boolean;
  lastName?: boolean;
  email?: boolean;
  phone?: boolean;
  role?: boolean;
};

export default function CorporateContactPerson() {
  const navigate = useNavigate();

  const form = useSponsorFormStore((state) => state.corporate);
  const updateCorporate = useSponsorFormStore((state) => state.updateCorporate);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState('');

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    updateCorporate({ [`contact${name.charAt(0).toUpperCase()}${name.slice(1)}`]: value });
    clearError(name as keyof FieldErrors);
  };

  const handleNext = () => {
    const nextErrors: FieldErrors = {};

    if (!form.contactFirstName.trim()) nextErrors.firstName = true;
    if (!form.contactLastName.trim()) nextErrors.lastName = true;
    if (!form.contactEmail.trim()) nextErrors.email = true;
    if (!form.contactPhone.trim()) nextErrors.phone = true;
    if (!form.contactRole.trim()) nextErrors.role = true;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setErrorMessage('Please fill in all required fields before continuing.');
      return;
    }

    setErrors({});
    setErrorMessage('');
    navigate('/sponsor/corporatesetup/verification');
  };

  return (
    <div className="ccp-page">

      <main className="ccp-main landing-page">

        {/* Back link */}
        <button
          className="ccp-back-link"
          onClick={() => navigate('/sponsor/corporatesetup')}
        >
          <FiArrowLeft size={15} />
          Back to Company Info
        </button>

        {/* Header */}
        <div className="ccp-header">
          <h1 className="ccp-title">Corporate Sponsor Setup</h1>
          <p className="ccp-subtitle">
            Tell us about your organization so we can tailor the best partnership experience.
          </p>
        </div>

        {/* Stepper */}
        <div className="ccp-stepper">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            return (
              <div key={step.number} className="ccp-step-wrap">
                <div className="ccp-step">
                  <div className={`ccp-step-circle ${isActive ? 'ccp-step-circle-active' : ''} ${isCompleted ? 'ccp-step-circle-completed' : ''}`}>
                    {isCompleted ? '✓' : step.number}
                  </div>
                  <div className={`ccp-step-label ${isActive ? 'ccp-step-label-active' : ''}`}>
                    {step.label}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`ccp-step-line ${isCompleted ? 'ccp-step-line-completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="ccp-body">

          {/* Form card */}
          <div className="ccp-form-card">
            <h2 className="ccp-form-title">Contact Person</h2>
            <p className="ccp-form-subtitle">
              Provide details of the primary contact person for this sponsorship.
            </p>

            {/* Title + First Name + Last Name */}
            <div className="ccp-field-row ccp-field-row-three">
              <div className="ccp-field-group">
                <label className="ccp-label">Title</label>
                <div className="ccp-select-wrap">
                  <select
                    className="ccp-input ccp-select"
                    name="title"
                    value={form.contactTitle}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {titles.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <FiChevronDown size={14} className="ccp-select-arrow" />
                </div>
              </div>
              <div className="ccp-field-group">
                <label className="ccp-label">
                  First Name {errors.firstName && <span className="ccp-required">*</span>}
                </label>
                <div className="ccp-input-wrap">
                  <FiUser size={15} className="ccp-input-icon" />
                  <input
                    className={`ccp-input ccp-input-icon-pad ${errors.firstName ? 'ccp-input-error' : ''}`}
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={form.contactFirstName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="ccp-field-group">
                <label className="ccp-label">
                  Last Name {errors.lastName && <span className="ccp-required">*</span>}
                </label>
                <div className="ccp-input-wrap">
                  <FiUser size={15} className="ccp-input-icon" />
                  <input
                    className={`ccp-input ccp-input-icon-pad ${errors.lastName ? 'ccp-input-error' : ''}`}
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={form.contactLastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Email + Phone */}
            <div className="ccp-field-row">
              <div className="ccp-field-group">
                <label className="ccp-label">
                  Email Address {errors.email && <span className="ccp-required">*</span>}
                </label>
                <div className="ccp-input-wrap">
                  <FiMail size={15} className="ccp-input-icon" />
                  <input
                    className={`ccp-input ccp-input-icon-pad ${errors.email ? 'ccp-input-error' : ''}`}
                    type="email"
                    name="email"
                    placeholder="john.doe@company.com"
                    value={form.contactEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="ccp-field-group">
                <label className="ccp-label">
                  Phone Number {errors.phone && <span className="ccp-required">*</span>}
                </label>
                <div className={`ccp-phone-wrap ${errors.phone ? 'ccp-input-error' : ''}`}>
                  <div className="ccp-phone-prefix">
                    <span className="ccp-flag">🇺🇬</span>
                    <span className="ccp-code">+256</span>
                    <FiChevronDown size={12} />
                  </div>
                  <input
                    className="ccp-input ccp-phone-input"
                    type="tel"
                    name="phone"
                    placeholder="700 000 000"
                    value={form.contactPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Role + LinkedIn */}
            <div className="ccp-field-row">
              <div className="ccp-field-group">
                <label className="ccp-label">
                  Role / Position {errors.role && <span className="ccp-required">*</span>}
                </label>
                <div className="ccp-select-wrap">
                  <FiBriefcase size={15} className="ccp-select-icon-left" />
                  <select
                    className={`ccp-input ccp-select ccp-input-icon-pad ${errors.role ? 'ccp-input-error' : ''}`}
                    name="role"
                    value={form.contactRole}
                    onChange={handleChange}
                  >
                    <option value="">Select role</option>
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <FiChevronDown size={14} className="ccp-select-arrow" />
                </div>
              </div>
              <div className="ccp-field-group">
                <label className="ccp-label">LinkedIn Profile <span className="ccp-optional">(Optional)</span></label>
                <div className="ccp-input-wrap">
                  <FiLinkedin size={15} className="ccp-input-icon" />
                  <input
                    className="ccp-input ccp-input-icon-pad"
                    type="url"
                    name="linkedin"
                    placeholder="https://linkedin.com/in/johndoe"
                    value={form.contactLinkedin}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Primary contact toggle */}
            <div className="ccp-primary-row">
              <div className="ccp-primary-info">
                <div className="ccp-primary-label">Set as primary contact</div>
                <div className="ccp-primary-desc">
                  This person will receive all sponsorship communications and updates.
                </div>
              </div>
              <button
                className={`ccp-toggle ${form.contactIsPrimary ? 'ccp-toggle-on' : ''}`}
                onClick={() => updateCorporate({ contactIsPrimary: !form.contactIsPrimary })}
                type="button"
              >
                <span className="ccp-toggle-thumb" />
              </button>
            </div>

            {/* Info banner */}
            <div className="ccp-info-banner">
              <span className="ccp-info-icon">ℹ️</span>
              <p className="ccp-info-text">
                The contact person will be the main liaison between your organization
                and the League OS sponsorship team.
              </p>
            </div>

            {errorMessage && (
              <div className="ccp-error-banner">{errorMessage}</div>
            )}

            {/* Next button */}
            <button
              className="ccp-next-btn"
              onClick={handleNext}
            >
              Next: Verification →
            </button>
          </div>

          {/* Right info panel */}
          <div className="ccp-info-panel">
            <div className="ccp-why-section">
              <h4 className="ccp-why-title">Why we need this</h4>
              <p className="ccp-why-text">
                Your contact person details allow us to send sponsorship agreements,
                campaign updates, and important notifications to the right person
                in your organization.
              </p>
            </div>

            <div className="ccp-secure-section">
              <span className="ccp-secure-icon">🔒</span>
              <div>
                <div className="ccp-secure-title">Your data is secure</div>
                <div className="ccp-secure-text">
                  We never share your information without your consent.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className="ccp-bottom-nav">
          <button
            className="ccp-back-btn"
            onClick={() => navigate('/sponsor/corporatesetup')}
          >
            <FiArrowLeft size={15} />
            Back: Company Info
          </button>
          <button
            className="ccp-next-btn-bottom"
            onClick={handleNext}
          >
            Next: Verification →
          </button>
        </div>
      </main>
    </div>
  );
}