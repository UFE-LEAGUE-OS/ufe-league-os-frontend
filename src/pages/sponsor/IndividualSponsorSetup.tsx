import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMapPin,
  FiMessageSquare,
  FiPlus,
} from 'react-icons/fi';
import { GiSoccerBall, GiRugbyConversion } from 'react-icons/gi';
import { MdSportsBasketball } from 'react-icons/md';
import Navbar from '../../components/Navbar';
import SponsorSidebar from '../../components/SponsorSidebar';
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

export default function IndividualSponsorSetup() {
  const navigate = useNavigate();
  const [currentStep] = useState(1);
  const [selectedSports, setSelectedSports] = useState<string[]>(['football', 'basketball']);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'Uganda',
    city: '',
    reason: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleSport = (id: string) => {
    setSelectedSports((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="iss-page">
      <Navbar />

      <div className="iss-layout">
        <SponsorSidebar />

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
                      {step.number}
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

            {/* Full Name + Email */}
            <div className="iss-field-row">
              <div className="iss-field-group">
                <label className="iss-label">Full Name <span className="iss-required">*</span></label>
                <div className="iss-input-wrap">
                  <FiUser size={16} className="iss-input-icon" />
                  <input
                    className="iss-input"
                    type="text"
                    name="fullName"
                    placeholder="Jane Kintu"
                    value={form.fullName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="iss-field-group">
                <label className="iss-label">Email Address <span className="iss-required">*</span></label>
                <div className="iss-input-wrap">
                  <FiMail size={16} className="iss-input-icon" />
                  <input
                    className="iss-input"
                    type="email"
                    name="email"
                    placeholder="jane.kintu@email.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Phone + Country */}
            <div className="iss-field-row">
              <div className="iss-field-group">
                <label className="iss-label">Phone Number <span className="iss-required">*</span></label>
                <div className="iss-input-wrap">
                  <FiPhone size={16} className="iss-input-icon" />
                  <input
                    className="iss-input"
                    type="tel"
                    name="phone"
                    placeholder="+256 700 123 456"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="iss-field-group">
                <label className="iss-label">Country <span className="iss-required">*</span></label>
                <div className="iss-input-wrap iss-select-wrap">
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
                  <span className="iss-select-arrow">▾</span>
                </div>
              </div>
            </div>

            {/* City */}
            <div className="iss-field-group iss-field-full">
              <label className="iss-label">City <span className="iss-required">*</span></label>
              <div className="iss-input-wrap">
                <FiMapPin size={16} className="iss-input-icon" />
                <input
                  className="iss-input"
                  type="text"
                  name="city"
                  placeholder="Kampala"
                  value={form.city}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Reason */}
            <div className="iss-field-group iss-field-full">
              <label className="iss-label">
                Why do you want to become a sponsor? <span className="iss-required">*</span>
              </label>
              <div className="iss-input-wrap iss-textarea-wrap">
                <FiMessageSquare size={16} className="iss-input-icon iss-textarea-icon" />
                <textarea
                  className="iss-input iss-textarea"
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
                I'm interested in <span className="iss-required">*</span>
              </label>
              <p className="iss-field-hint">Select the sports you're passionate about.</p>
              <div className="iss-sports-grid">
                {sportOptions.map((sport) => {
                  const Icon = sport.icon;
                  const isSelected = selectedSports.includes(sport.id);
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

          {/* Next button */}
          <div className="iss-footer">
            <button
              className="iss-next-btn"
              onClick={() => navigate('/sponsor/individual/preferences')}
            >
              Next: Preferences →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}