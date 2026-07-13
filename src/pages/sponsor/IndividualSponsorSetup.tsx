import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiGlobe,
  FiMapPin,
  FiMessageSquare,
  FiPlus,
  FiChevronDown,
} from 'react-icons/fi';
import { GiSoccerBall, GiRugbyConversion } from 'react-icons/gi';
import { MdSportsBasketball } from 'react-icons/md';
import { useSponsorFormStore } from '../../store/sponsorFormStore';
import '../../styles/pages/landing.css';
import './IndividualSponsorSetup.css';

const steps = [
  { number: 1, label: 'Basic Info', sub: 'Tell us about yourself' },
  { number: 2, label: 'Interests', sub: 'Choose your interests' },
  { number: 3, label: 'Review', sub: 'Review your details' },
  { number: 4, label: 'Complete', sub: "You're all set!" },
];

const sportOptions = [
  { id: 'football', label: 'Football', icon: GiSoccerBall },
  { id: 'rugby', label: 'Rugby', icon: GiRugbyConversion },
  { id: 'basketball', label: 'Basketball', icon: MdSportsBasketball },
  { id: 'nile-rugby', label: 'Nile Special Rugby League', icon: null, imgText: 'NSR' },
  { id: 'kobs', label: 'KOBS RFC', icon: null, imgText: 'KRC' },
  { id: 'others', label: 'Add Others', icon: FiPlus },
];

const countries = [
  'Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Burundi',
  'South Sudan', 'Ethiopia', 'Nigeria', 'Ghana', 'Other',
];

const currentStep = 1;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = {
  firstName?: boolean;
  lastName?: boolean;
  email?: boolean;
  phone?: boolean;
  city?: boolean;
  reason?: boolean;
  sports?: boolean;
};

export default function IndividualSponsorSetup() {
  const navigate = useNavigate();

  const form = useSponsorFormStore((state) => state.individual);
  const updateIndividual = useSponsorFormStore((state) => state.updateIndividual);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    updateIndividual({ [name]: value });

    setErrors((prev) => {
      if (!prev[name as keyof FieldErrors]) return prev;
      const isNowValid = name === 'email' ? emailPattern.test(value.trim()) : Boolean(value.trim());
      if (!isNowValid) return prev;
      const next = { ...prev };
      delete next[name as keyof FieldErrors];
      return next;
    });
  };

  const toggleSport = (id: string) => {
    const current = form.selectedSports;
    const next = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];

    updateIndividual({ selectedSports: next });

    if (next.length > 0) {
      setErrors((prev) => {
        if (!prev.sports) return prev;
        const nextErrors = { ...prev };
        delete nextErrors.sports;
        return nextErrors;
      });
    }
  };

  const handleNext = () => {
    const nextErrors: FieldErrors = {};

    if (!form.firstName.trim()) nextErrors.firstName = true;
    if (!form.lastName.trim()) nextErrors.lastName = true;
    if (!form.email.trim() || !emailPattern.test(form.email.trim())) nextErrors.email = true;
    if (!form.phone.trim()) nextErrors.phone = true;
    if (!form.city.trim()) nextErrors.city = true;
    if (!form.reason.trim()) nextErrors.reason = true;
    if (form.selectedSports.length === 0) nextErrors.sports = true;

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setErrorMessage('Please fill in all required fields correctly before continuing.');
      return;
    }

    setErrors({});
    setErrorMessage('');
    navigate('/sponsor/individual/preferences');
  };

  return (
    <div className="iss-page">

      <main className="iss-main landing-page">

        {/* Page header */}
        <div className="iss-header">
          <h1 className="iss-title">Individual Sponsor Setup</h1>
          <p className="iss-subtitle">
            Partner with Uganda's most exciting leagues, clubs and athletes.
          </p>
        </div>

        {/* Progress stepper */}
        <div className="iss-stepper">
          {steps.map((step, index) => {
            const isActive = step.number === currentStep;
            const isCompleted = step.number < currentStep;
            return (
              <div key={step.number} className="iss-step-wrap">
                <div className={`iss-step ${isActive ? 'iss-step-active' : ''} ${isCompleted ? 'iss-step-completed' : ''}`}>
                  <div className={`iss-step-circle ${isActive ? 'iss-step-circle-active' : ''} ${isCompleted ? 'iss-step-circle-completed' : ''}`}>
                    {isCompleted ? '✓' : step.number}
                  </div>
                  <div className="iss-step-text">
                    <div className={`iss-step-label ${isActive ? 'iss-step-label-active' : ''}`}>
                      {step.label}
                    </div>
                    <div className="iss-step-sub">{step.sub}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`iss-step-line ${isCompleted ? 'iss-step-line-completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <div className="iss-form-card">
          <h2 className="iss-form-title">Basic Information</h2>
          <p className="iss-form-subtitle">Please provide your details to get started.</p>

          {/* First Name + Last Name */}
          <div className="iss-field-row">
            <div className="iss-field-group">
              <label className="iss-label">
                First Name {errors.firstName && <span className="iss-required">*</span>}
              </label>
              <div className="iss-input-wrap">
                <FiUser size={16} className="iss-input-icon" />
                <input
                  className={`iss-input ${errors.firstName ? 'iss-input-error' : ''}`}
                  type="text"
                  name="firstName"
                  placeholder="Jane"
                  value={form.firstName}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="iss-field-group">
              <label className="iss-label">
                Last Name {errors.lastName && <span className="iss-required">*</span>}
              </label>
              <div className="iss-input-wrap">
                <FiUser size={16} className="iss-input-icon" />
                <input
                  className={`iss-input ${errors.lastName ? 'iss-input-error' : ''}`}
                  type="text"
                  name="lastName"
                  placeholder="Kintu"
                  value={form.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Email + Phone */}
          <div className="iss-field-row">
            <div className="iss-field-group">
              <label className="iss-label">
                Email Address {errors.email && <span className="iss-required">*</span>}
              </label>
              <div className="iss-input-wrap">
                <FiMail size={16} className="iss-input-icon" />
                <input
                  className={`iss-input ${errors.email ? 'iss-input-error' : ''}`}
                  type="email"
                  name="email"
                  placeholder="jane.kintu@email.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="iss-field-group">
              <label className="iss-label">
                Phone Number {errors.phone && <span className="iss-required">*</span>}
              </label>
              <div className={`iss-phone-wrap ${errors.phone ? 'iss-input-error' : ''}`}>
                <div className="iss-phone-prefix">
                  <span className="iss-flag">🇺🇬</span>
                  <span className="iss-code">+256</span>
                  <FiChevronDown size={12} />
                </div>
                <input
                  className="iss-input iss-phone-input"
                  type="tel"
                  name="phone"
                  placeholder="700 123 456"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Country + City */}
          <div className="iss-field-row">
            <div className="iss-field-group">
              <label className="iss-label">Country</label>
              <div className="iss-select-wrap">
                <FiGlobe size={16} className="iss-input-icon" />
                <select
                  className="iss-input iss-select"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <FiChevronDown size={14} className="iss-select-arrow" />
              </div>
            </div>
            <div className="iss-field-group">
              <label className="iss-label">
                City {errors.city && <span className="iss-required">*</span>}
              </label>
              <div className="iss-input-wrap">
                <FiMapPin size={16} className="iss-input-icon" />
                <input
                  className={`iss-input ${errors.city ? 'iss-input-error' : ''}`}
                  type="text"
                  name="city"
                  placeholder="Kampala"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="iss-field-group iss-field-full">
            <label className="iss-label">
              Why do you want to become a sponsor? {errors.reason && <span className="iss-required">*</span>}
            </label>
            <div className="iss-input-wrap iss-textarea-wrap">
              <FiMessageSquare size={16} className="iss-input-icon iss-textarea-icon" />
              <textarea
                className={`iss-input iss-textarea ${errors.reason ? 'iss-input-error' : ''}`}
                name="reason"
                placeholder="To support grassroots development and inspire the next generation of athletes."
                value={form.reason}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          {/* Sports interests */}
          <div className="iss-field-group iss-field-full">
            <label className="iss-label">
              I'm interested in {errors.sports && <span className="iss-required">*</span>}
            </label>
            <p className="iss-field-hint">Select the sports you're passionate about.</p>
            <div className="iss-sports-grid">
              {sportOptions.map((sport) => {
                const Icon = sport.icon;
                const isSelected = form.selectedSports.includes(sport.id);
                return (
                  <div
                    key={sport.id}
                    className={`iss-sport-card ${isSelected ? 'iss-sport-card-selected' : ''}`}
                    onClick={() => toggleSport(sport.id)}
                  >
                    <div className={`iss-sport-checkbox ${isSelected ? 'iss-sport-checkbox-checked' : ''}`}>
                      {isSelected && <span className="iss-checkmark">✓</span>}
                    </div>
                    <div className="iss-sport-icon-wrap">
                      {Icon ? (
                        <Icon size={28} className="iss-sport-icon" />
                      ) : (
                        <span className="iss-sport-img-text">{sport.imgText}</span>
                      )}
                    </div>
                    <div className="iss-sport-label">{sport.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="iss-error-banner">{errorMessage}</div>
        )}

        {/* Footer */}
        <div className="iss-footer">
          <button
            className="iss-next-btn"
            onClick={handleNext}
          >
            Next: Preferences →
          </button>
        </div>
      </main>
    </div>
  );
}