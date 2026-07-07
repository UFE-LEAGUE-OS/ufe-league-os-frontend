import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiEdit2,
  FiUser,
  FiHeart,
} from 'react-icons/fi';
import Navbar from '../../components/Navbar';
import '../../styles/pages/landing.css';
import './IndividualSponsorReview.css';

const steps = [
  { number: 1, label: 'Basic Info', sub: 'Tell us about yourself' },
  { number: 2, label: 'Interests', sub: 'Choose your interests' },
  { number: 3, label: 'Review', sub: 'Review your details' },
  { number: 4, label: 'Complete', sub: "You're all set!" },
];

const currentStep = 3;

export default function IndividualSponsorReview() {
  const navigate = useNavigate();

  return (
    <div className="isr-page">
      <Navbar />

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
                  <span className="isr-detail-val">Jane Kintu</span>
                </div>
                <div className="isr-detail-row">
                  <span className="isr-detail-label">Email Address</span>
                  <span className="isr-detail-val">jane.kintu@email.com</span>
                </div>
                <div className="isr-detail-row">
                  <span className="isr-detail-label">Phone Number</span>
                  <span className="isr-detail-val">+256 700 123 456</span>
                </div>
                <div className="isr-detail-row">
                  <span className="isr-detail-label">Country</span>
                  <span className="isr-detail-val">Uganda</span>
                </div>
                <div className="isr-detail-row">
                  <span className="isr-detail-label">City</span>
                  <span className="isr-detail-val">Kampala</span>
                </div>
                <div className="isr-detail-row">
                  <span className="isr-detail-label">Sports Interests</span>
                  <span className="isr-detail-val">Football, Basketball</span>
                </div>
                <div className="isr-detail-row isr-detail-full">
                  <span className="isr-detail-label">Why Sponsoring</span>
                  <span className="isr-detail-val">
                    To support grassroots development and inspire the next generation of athletes.
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
                  <span className="isr-detail-val">UGX 1M – 5M</span>
                </div>
                <div className="isr-detail-row">
                  <span className="isr-detail-label">Duration</span>
                  <span className="isr-detail-val">1 Year</span>
                </div>
                <div className="isr-detail-row isr-detail-full">
                  <span className="isr-detail-label">Sponsorship Types</span>
                  <div className="isr-chips">
                    <span className="isr-chip">Club Sponsorship</span>
                    <span className="isr-chip">Grassroots Development</span>
                  </div>
                </div>
                <div className="isr-detail-row isr-detail-full">
                  <span className="isr-detail-label">Goals</span>
                  <div className="isr-chips">
                    <span className="isr-chip">Brand Visibility</span>
                    <span className="isr-chip">Community Impact</span>
                    <span className="isr-chip">Passion for Sport</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Declaration */}
            <div className="isr-declaration">
              <div className="isr-declaration-check">
                <input type="checkbox" id="declaration" className="isr-checkbox" />
                <label htmlFor="declaration" className="isr-declaration-label">
                  I confirm that all information provided is accurate and I agree to the
                  League OS sponsorship terms and conditions.
                </label>
              </div>
            </div>
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
            onClick={() => navigate('/sponsor/individual/complete')}
          >
            Submit Application <FiArrowRight size={15} />
          </button>
        </div>
      </main>
    </div>
  );
}