import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMail,
  FiGlobe,
  FiMapPin,
  FiChevronDown,
} from 'react-icons/fi';
import { useSponsorFormStore } from '../../store/sponsorFormStore';
import '../../styles/pages/landing.css';
import './CorporateSponsorSetup.css';

const steps = [
  { number: 1, label: 'Company Info' },
  { number: 2, label: 'Contact Person' },
  { number: 3, label: 'Verification' },
  { number: 4, label: 'Review' },
  { number: 5, label: 'Complete' },
];

const currentStep = 1;

const countries = [
  'Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Burundi',
  'South Sudan', 'Ethiopia', 'Nigeria', 'Ghana', 'Other',
];

const industries = [
  'Beverage Manufacturing', 'Telecommunications', 'Banking & Finance',
  'Insurance', 'Real Estate', 'Technology', 'Healthcare',
  'Retail', 'Energy', 'Media & Entertainment', 'Other',
];

const tinPattern = /^[0-9]{1,10}$/;
const brnPattern = /^[a-zA-Z0-9]{1,14}$/;

type FieldErrors = {
  companyName?: boolean;
  companyEmail?: boolean;
  phone?: boolean;
  city?: boolean;
  industry?: boolean;
  website?: boolean;
  brn?: boolean;
  tin?: boolean;
};

export default function CorporateSponsorSetup() {
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
    updateCorporate({ [name]: value });
    clearError(name as keyof FieldErrors);
  };

  const handleTinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    updateCorporate({ tin: digitsOnly });
    clearError('tin');
  };

  const handleBrnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const alphaNumOnly = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 14);
    updateCorporate({ brn: alphaNumOnly });
    clearError('brn');
  };

  const handleNext = () => {
    const nextErrors: FieldErrors = {};

    if (!form.companyName.trim()) nextErrors.companyName = true;
    if (!form.companyEmail.trim()) nextErrors.companyEmail = true;
    if (!form.phone.trim()) nextErrors.phone = true;
    if (!form.city.trim()) nextErrors.city = true;
    if (!form.industry.trim()) nextErrors.industry = true;
    if (!form.website.trim()) nextErrors.website = true;
    if (!form.brn.trim() || !brnPattern.test(form.brn.trim())) nextErrors.brn = true;
    if (!form.tin.trim() || !tinPattern.test(form.tin.trim())) nextErrors.tin = true;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setErrorMessage('Please fill in all required fields correctly before continuing.');
      return;
    }

    setErrors({});
    setErrorMessage('');
    navigate('/sponsor/corporatesetup/contact');
  };

  return (
    <div className="css-page">

      <main className="css-main landing-page">

        {/* Back link */}
        <button
          className="css-back-link"
          onClick={() => navigate('/sponsorhub')}
        >
          ‹ Back to Sponsorship Hub
        </button>

        {/* Page header */}
        <div className="css-header">
          <h1 className="css-title">Corporate Sponsor Setup</h1>
          <p className="css-subtitle">
            Tell us about your organization so we can tailor the best partnership experience.
          </p>
        </div>

        {/* Stepper */}
        <div className="css-stepper">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            return (
              <div key={step.number} className="css-step-wrap">
                <div className="css-step">
                  <div className={`css-step-circle ${isActive ? 'css-step-circle-active' : ''} ${isCompleted ? 'css-step-circle-completed' : ''}`}>
                    {isCompleted ? '✓' : step.number}
                  </div>
                  <div className={`css-step-label ${isActive ? 'css-step-label-active' : ''}`}>
                    {step.label}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`css-step-line ${isCompleted ? 'css-step-line-completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Body: form + sidebar panel */}
        <div className="css-body">

          {/* Form card */}
          <div className="css-form-card">
            <h2 className="css-form-title">Company Information</h2>
            <p className="css-form-subtitle">Provide your company details to get started.</p>

            {/* Company Name + Email */}
            <div className="css-field-row">
              <div className="css-field-group">
                <label className="css-label">
                  Company Name {errors.companyName && <span className="css-required">*</span>}
                </label>
                <input
                  className={`css-input ${errors.companyName ? 'css-input-error' : ''}`}
                  type="text"
                  name="companyName"
                  placeholder="Nile Breweries Limited"
                  value={form.companyName}
                  onChange={handleChange}
                />
              </div>
              <div className="css-field-group">
                <label className="css-label">
                  Company Email {errors.companyEmail && <span className="css-required">*</span>}
                </label>
                <div className="css-input-wrap">
                  <FiMail size={15} className="css-input-icon" />
                  <input
                    className={`css-input css-input-icon-pad ${errors.companyEmail ? 'css-input-error' : ''}`}
                    type="email"
                    name="companyEmail"
                    placeholder="partnerships@nilebreweries.co.ug"
                    value={form.companyEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Phone + Alt Phone */}
            <div className="css-field-row">
              <div className="css-field-group">
                <label className="css-label">
                  Phone Number {errors.phone && <span className="css-required">*</span>}
                </label>
                <div className={`css-phone-wrap ${errors.phone ? 'css-input-error' : ''}`}>
                  <div className="css-phone-prefix">
                    <span className="css-flag">🇺🇬</span>
                    <span className="css-code">+256</span>
                    <FiChevronDown size={12} />
                  </div>
                  <input
                    className="css-input css-phone-input"
                    type="tel"
                    name="phone"
                    placeholder="312 320 500"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="css-field-group">
                <label className="css-label">Alternative Phone <span className="css-optional">(Optional)</span></label>
                <div className="css-phone-wrap">
                  <div className="css-phone-prefix">
                    <span className="css-flag">🇺🇬</span>
                    <span className="css-code">+256</span>
                    <FiChevronDown size={12} />
                  </div>
                  <input
                    className="css-input css-phone-input"
                    type="tel"
                    name="altPhone"
                    placeholder="752 001 234"
                    value={form.altPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Country + City */}
            <div className="css-field-row">
              <div className="css-field-group">
                <label className="css-label">Country</label>
                <div className="css-select-wrap">
                  <select
                    className="css-input css-select"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                  >
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <FiChevronDown size={14} className="css-select-arrow" />
                </div>
              </div>
              <div className="css-field-group">
                <label className="css-label">
                  City {errors.city && <span className="css-required">*</span>}
                </label>
                <div className="css-input-wrap">
                  <FiMapPin size={15} className="css-input-icon" />
                  <input
                    className={`css-input css-input-icon-pad ${errors.city ? 'css-input-error' : ''}`}
                    type="text"
                    name="city"
                    placeholder="Kampala"
                    value={form.city}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Industry + Website */}
            <div className="css-field-row">
              <div className="css-field-group">
                <label className="css-label">
                  Industry {errors.industry && <span className="css-required">*</span>}
                </label>
                <div className="css-select-wrap">
                  <select
                    className={`css-input css-select ${errors.industry ? 'css-input-error' : ''}`}
                    name="industry"
                    value={form.industry}
                    onChange={handleChange}
                  >
                    <option value="">Select industry</option>
                    {industries.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <FiChevronDown size={14} className="css-select-arrow" />
                </div>
              </div>
              <div className="css-field-group">
                <label className="css-label">
                  Company Website {errors.website && <span className="css-required">*</span>}
                </label>
                <div className="css-input-wrap">
                  <FiGlobe size={15} className="css-input-icon" />
                  <input
                    className={`css-input css-input-icon-pad ${errors.website ? 'css-input-error' : ''}`}
                    type="url"
                    name="website"
                    placeholder="https://www.nilebreweries.co.ug"
                    value={form.website}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* BRN + TIN */}
            <div className="css-field-row">
              <div className="css-field-group">
                <label className="css-label">
                  BRN {errors.brn && <span className="css-required">*</span>}
                </label>
                <input
                  className={`css-input ${errors.brn ? 'css-input-error' : ''}`}
                  type="text"
                  name="brn"
                  placeholder="Enter BRN (max 14 characters, letters & numbers)"
                  value={form.brn}
                  onChange={handleBrnChange}
                  maxLength={14}
                />
              </div>
              <div className="css-field-group">
                <label className="css-label">
                  TIN Number {errors.tin && <span className="css-required">*</span>}
                </label>
                <input
                  className={`css-input ${errors.tin ? 'css-input-error' : ''}`}
                  type="text"
                  inputMode="numeric"
                  name="tin"
                  placeholder="Enter TIN Number (max 10 digits)"
                  value={form.tin}
                  onChange={handleTinChange}
                  maxLength={10}
                />
              </div>
            </div>

            {/* Info banner */}
            <div className="css-info-banner">
              <span>ℹ️</span>
              <p className="css-info-text">
                This information helps us connect you with the right opportunities
                and customize your sponsorship journey.
              </p>
            </div>

            {errorMessage && (
              <div className="css-error-banner">{errorMessage}</div>
            )}

            {/* Next button */}
            <button
              className="css-next-btn"
              onClick={handleNext}
            >
              Next: Contact Person →
            </button>
          </div>

          {/* Right info panel */}
          <div className="css-info-panel">
            <div className="css-sponsor-logo-card">
              <div className="css-nile-logo">
                <div className="css-nile-emblem">🦁</div>
                <div className="css-nile-name">NILE</div>
                <div className="css-nile-special">— SPECIAL —</div>
                <div className="css-nile-bars">
                  <span className="css-bar css-bar-orange" />
                  <span className="css-bar css-bar-red" />
                </div>
              </div>
            </div>

            <div className="css-why-section">
              <h4 className="css-why-title">Why we need this</h4>
              <p className="css-why-text">
                Your company information is used to create your sponsor profile,
                generate agreements, and match you with relevant opportunities.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}