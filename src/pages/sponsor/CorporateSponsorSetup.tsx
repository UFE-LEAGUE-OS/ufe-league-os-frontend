import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiMail,
  FiGlobe,
  FiMapPin,
  FiInfo,
  FiLock,
  FiChevronDown,
} from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import SponsorSidebar from '../../components/SponsorSidebar';
import '../../styles/pages/landing.css';
import './CorporateSponsorSetup.css';

const steps = [
  { number: 1, label: 'Company Info' },
  { number: 2, label: 'Contact Person' },
  { number: 3, label: 'Verification' },
  { number: 4, label: 'Review' },
  { number: 5, label: 'Complete' },
];

const countries = [
  'Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Burundi',
  'South Sudan', 'Ethiopia', 'Nigeria', 'Ghana', 'Other',
];

const industries = [
  'Beverage Manufacturing', 'Telecommunications', 'Banking & Finance',
  'Insurance', 'Real Estate', 'Technology', 'Healthcare',
  'Retail', 'Energy', 'Media & Entertainment', 'Other',
];

export default function CorporateSponsorSetup() {
  const navigate = useNavigate();
  const [currentStep] = useState(1);

  const [form, setForm] = useState({
    companyName: '',
    companyEmail: '',
    phone: '',
    altPhone: '',
    country: 'Uganda',
    city: '',
    industry: '',
    website: '',
    brn: '',
    tin: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="css-page">
      <Navbar />

      <div className="css-layout">
        <SponsorSidebar />

        <main className="css-main landing-page">

          {/* Back link */}
          <button
            className="css-back-link"
            onClick={() => navigate('/sponsorhub')}
          >
            <FiArrowLeft size={15} />
            Back to Sponsorship Hub
          </button>

          {/* Page header */}
          <div className="css-header">
            <h1 className="css-title">Corporate Sponsor Setup</h1>
            <p className="css-subtitle">
              Tell us about your organization so we can tailor the best partnership experience.
            </p>
          </div>

          {/* Progress stepper */}
          <div className="css-stepper">
            {steps.map((step, index) => {
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              return (
                <div key={step.number} className="css-step-wrap">
                  <div className="css-step">
                    <div className={`css-step-circle ${isActive ? 'css-step-circle-active' : ''} ${isCompleted ? 'css-step-circle-completed' : ''}`}>
                      {step.number}
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
                  <label className="css-label">Company Name <span className="css-required">*</span></label>
                  <input
                    className="css-input"
                    type="text"
                    name="companyName"
                    placeholder="Nile Breweries Limited"
                    value={form.companyName}
                    onChange={handleChange}
                  />
                </div>
                <div className="css-field-group">
                  <label className="css-label">Company Email <span className="css-required">*</span></label>
                  <div className="css-input-wrap">
                    <FiMail size={15} className="css-input-icon" />
                    <input
                      className="css-input css-input-icon-pad"
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
                  <label className="css-label">Phone Number <span className="css-required">*</span></label>
                  <div className="css-phone-wrap">
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
                  <label className="css-label">Country <span className="css-required">*</span></label>
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
                  <label className="css-label">City <span className="css-required">*</span></label>
                  <div className="css-input-wrap">
                    <FiMapPin size={15} className="css-input-icon" />
                    <input
                      className="css-input css-input-icon-pad"
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
                  <label className="css-label">Industry <span className="css-required">*</span></label>
                  <div className="css-select-wrap">
                    <select
                      className="css-input css-select"
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                    >
                      <option value="">Beverage Manufacturing</option>
                      {industries.map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                    <FiChevronDown size={14} className="css-select-arrow" />
                  </div>
                </div>
                <div className="css-field-group">
                  <label className="css-label">Company Website <span className="css-required">*</span></label>
                  <div className="css-input-wrap">
                    <FiGlobe size={15} className="css-input-icon" />
                    <input
                      className="css-input css-input-icon-pad"
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
                  <label className="css-label">BRN <span className="css-required">*</span></label>
                  <input
                    className="css-input"
                    type="text"
                    name="brn"
                    placeholder="Enter BRN"
                    value={form.brn}
                    onChange={handleChange}
                  />
                </div>
                <div className="css-field-group">
                  <label className="css-label">TIN Number <span className="css-required">*</span></label>
                  <input
                    className="css-input"
                    type="text"
                    name="tin"
                    placeholder="Enter TIN Number"
                    value={form.tin}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Info banner */}
              <div className="css-info-banner">
                <FiInfo size={16} className="css-info-icon" />
                <p className="css-info-text">
                  This information helps us connect you with the right opportunities
                  and customize your sponsorship journey.
                </p>
              </div>

              {/* Next button */}
              <button
                className="css-next-btn"
                onClick={() => navigate('/sponsor/corporatesetup/contact')}
              >
                Next: Contact Person →
              </button>
            </div>

            {/* Right info panel */}
            <div className="css-info-panel">
              <div className="css-sponsor-logo-card">
                <div className="css-sponsor-logo-inner">
                  <div className="css-nile-logo">
                    <div className="css-nile-emblem">🦁</div>
                    <div className="css-nile-text">
                      <span className="css-nile-name">NILE</span>
                      <span className="css-nile-special">— SPECIAL —</span>
                      <div className="css-nile-bars">
                        <span className="css-bar css-bar-orange" />
                        <span className="css-bar css-bar-red" />
                      </div>
                    </div>
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

              <div className="css-secure-section">
                <FiLock size={14} className="css-secure-icon" />
                <div>
                  <div className="css-secure-title">Your data is secure</div>
                  <div className="css-secure-text">
                    We never share your information without your consent.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}