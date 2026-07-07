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
import Navbar from '../../components/Navbar';
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

export default function CorporateContactPerson() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    linkedin: '',
    isPrimary: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="ccp-page">
      <Navbar />

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
                    value={form.title}
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
                <label className="ccp-label">First Name <span className="ccp-required">*</span></label>
                <div className="ccp-input-wrap">
                  <FiUser size={15} className="ccp-input-icon" />
                  <input
                    className="ccp-input ccp-input-icon-pad"
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="ccp-field-group">
                <label className="ccp-label">Last Name <span className="ccp-required">*</span></label>
                <div className="ccp-input-wrap">
                  <FiUser size={15} className="ccp-input-icon" />
                  <input
                    className="ccp-input ccp-input-icon-pad"
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Email + Phone */}
            <div className="ccp-field-row">
              <div className="ccp-field-group">
                <label className="ccp-label">Email Address <span className="ccp-required">*</span></label>
                <div className="ccp-input-wrap">
                  <FiMail size={15} className="ccp-input-icon" />
                  <input
                    className="ccp-input ccp-input-icon-pad"
                    type="email"
                    name="email"
                    placeholder="john.doe@company.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="ccp-field-group">
                <label className="ccp-label">Phone Number <span className="ccp-required">*</span></label>
                <div className="ccp-phone-wrap">
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
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Role + LinkedIn */}
            <div className="ccp-field-row">
              <div className="ccp-field-group">
                <label className="ccp-label">Role / Position <span className="ccp-required">*</span></label>
                <div className="ccp-select-wrap">
                  <FiBriefcase size={15} className="ccp-select-icon-left" />
                  <select
                    className="ccp-input ccp-select ccp-input-icon-pad"
                    name="role"
                    value={form.role}
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
                    value={form.linkedin}
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
                className={`ccp-toggle ${form.isPrimary ? 'ccp-toggle-on' : ''}`}
                onClick={() => setForm({ ...form, isPrimary: !form.isPrimary })}
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

            {/* Next button */}
            <button
              className="ccp-next-btn"
              onClick={() => navigate('/sponsor/corporatesetup/verification')}
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
            onClick={() => navigate('/sponsor/corporatesetup/verification')}
          >
            Next: Verification →
          </button>
        </div>
      </main>
    </div>
  );
}