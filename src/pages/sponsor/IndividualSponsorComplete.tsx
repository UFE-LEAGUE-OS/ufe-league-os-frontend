import { useLocation, useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiArrowRight,
  FiHome,
  FiPackage,
} from 'react-icons/fi';
import '../../styles/pages/landing.css';
import './IndividualSponsorComplete.css';

type CompleteLocationState = {
  accountId?: number;
  createdAt?: string;
} | null;

const steps = [
  { number: 1, label: 'Basic Info', sub: 'Tell us about yourself' },
  { number: 2, label: 'Interests', sub: 'Choose your interests' },
  { number: 3, label: 'Review', sub: 'Review your details' },
  { number: 4, label: 'Complete', sub: "You're all set!" },
];

const nextSteps = [
  {
    icon: FiCheckCircle,
    title: 'Application Under Review',
    desc: 'Our team will review your application within 2-3 business days and reach out via email.',
  },
  {
    icon: FiPackage,
    title: 'Explore Packages',
    desc: 'Browse available sponsorship packages while you wait for your application to be approved.',
  },
  {
    icon: FiHome,
    title: 'Go to Dashboard',
    desc: 'Visit your sponsor dashboard to track your application status and manage your account.',
  },
];

export default function IndividualSponsorComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CompleteLocationState;

  const reference = state?.accountId
    ? `ISP-${
        state.createdAt
          ? new Date(state.createdAt).getFullYear()
          : new Date().getFullYear()
      }-${String(state.accountId).padStart(5, '0')}`
    : null;

  return (
    <div className="isc-page">

      <main className="isc-main landing-page">

        {/* Stepper */}
        <div className="isc-stepper">
          {steps.map((step, index) => {
            const isCompleted = step.number < 4;
            const isActive = step.number === 4;
            return (
              <div key={step.number} className="isc-step-wrap">
                <div className="isc-step">
                  <div className={`isc-step-circle ${isActive ? 'isc-step-circle-active' : ''} ${isCompleted ? 'isc-step-circle-completed' : ''}`}>
                    {isCompleted ? '✓' : step.number}
                  </div>
                  <div className="isc-step-text">
                    <div className={`isc-step-label ${isActive ? 'isc-step-label-active' : ''}`}>
                      {step.label}
                    </div>
                    <div className="isc-step-sub">{step.sub}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`isc-step-line ${isCompleted ? 'isc-step-line-completed' : ''}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Success card */}
        <div className="isc-success-card">
          <div className="isc-success-icon-wrap">
            <FiCheckCircle size={48} className="isc-success-icon" />
          </div>
          <h1 className="isc-success-title">Application Submitted!</h1>
          <p className="isc-success-desc">
            Thank you for applying to become an individual sponsor on League OS.
            Your application has been successfully submitted and is now under review.
          </p>
          {reference && (
            <div className="isc-ref-badge">
              Reference: <span className="isc-ref-num">{reference}</span>
            </div>
          )}
        </div>

        {/* What happens next */}
        <div className="isc-next-section">
          <h2 className="isc-next-title">What happens next?</h2>
          <div className="isc-next-grid">
            {nextSteps.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="isc-next-card">
                  <div className="isc-next-icon-wrap">
                    <Icon size={22} className="isc-next-icon" />
                  </div>
                  <h3 className="isc-next-card-title">{item.title}</h3>
                  <p className="isc-next-card-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="isc-actions">
          <button
            className="isc-btn-secondary"
            onClick={() => navigate('/sponsor/packages')}
          >
            Browse Packages
          </button>
          <button
            className="isc-btn-primary"
            onClick={() => navigate('/sponsor/dashboard')}
          >
            Go to Dashboard <FiArrowRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}