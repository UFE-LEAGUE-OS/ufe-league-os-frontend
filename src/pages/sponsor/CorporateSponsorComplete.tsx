import { useNavigate } from 'react-router-dom';
import {
  FiCheckCircle,
  FiArrowRight,
  FiHome,
  FiBarChart2,
} from 'react-icons/fi';
import '../../styles/pages/landing.css';
import './CorporateSponsorComplete.css';

const steps = [
  { number: 1, label: 'Company Info' },
  { number: 2, label: 'Contact Person' },
  { number: 3, label: 'Verification' },
  { number: 4, label: 'Review' },
  { number: 5, label: 'Complete' },
];

const nextSteps = [
  {
    icon: FiCheckCircle,
    title: 'Application Under Review',
    desc: 'Our team will review your application within 2-3 business days and reach out via email.',
  },
  {
    icon: FiBarChart2,
    title: 'Explore Packages',
    desc: 'Browse available sponsorship packages while you wait for your application to be approved.',
  },
  {
    icon: FiHome,
    title: 'Go to Dashboard',
    desc: 'Visit your sponsor dashboard to track your application status and manage your account.',
  },
];

export default function CorporateSponsorComplete() {
  const navigate = useNavigate();

  return (
    <div className="csc-page">

      <main className="csc-main landing-page">

        {/* Stepper */}
        <div className="csc-stepper">
          {steps.map((step, index) => {
            const isCompleted = step.number < 5;
            const isActive = step.number === 5;
            return (
              <div key={step.number} className="csc-step-wrap">
                <div className="csc-step">
                  <div className={`csc-step-circle ${isActive ? 'csc-step-circle-active' : ''} ${isCompleted ? 'csc-step-circle-completed' : ''}`}>
                    {isCompleted ? '✓' : step.number}
                  </div>
                  <div className={`csc-step-label ${isActive ? 'csc-step-label-active' : ''}`}>
                    {step.label}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="csc-step-line csc-step-line-completed" />
                )}
              </div>
            );
          })}
        </div>

        {/* Success card */}
        <div className="csc-success-card">
          <div className="csc-success-icon-wrap">
            <FiCheckCircle size={48} className="csc-success-icon" />
          </div>
          <h1 className="csc-success-title">Application Submitted!</h1>
          <p className="csc-success-desc">
            Thank you for applying to become a corporate sponsor on League OS.
            Your application has been successfully submitted and is now under review.
          </p>
          <div className="csc-ref-badge">
            Reference: <span className="csc-ref-num">SPO-2026-00142</span>
          </div>
        </div>

        {/* What happens next */}
        <div className="csc-next-section">
          <h2 className="csc-next-title">What happens next?</h2>
          <div className="csc-next-grid">
            {nextSteps.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="csc-next-card">
                  <div className="csc-next-icon-wrap">
                    <Icon size={22} className="csc-next-icon" />
                  </div>
                  <h3 className="csc-next-card-title">{item.title}</h3>
                  <p className="csc-next-card-desc">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="csc-actions">
          <button
            className="csc-btn-secondary"
            onClick={() => navigate('/sponsor/packages')}
          >
            Browse Packages
          </button>
          <button
            className="csc-btn-primary"
            onClick={() => navigate('/sponsor/dashboard')}
          >
            Go to Dashboard <FiArrowRight size={16} />
          </button>
        </div>
      </main>
    </div>
  );
}