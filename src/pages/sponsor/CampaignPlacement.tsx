import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { useSponsorCampaignStore } from '../../store/sponsorCampaignStore';
import '../../styles/pages/landing.css';
import './CampaignPlacement.css';

const steps = [
  { number: 1, label: 'Campaign Info' },
  { number: 2, label: 'Targeting' },
  { number: 3, label: 'Assets' },
  { number: 4, label: 'Placement' },
  { number: 5, label: 'Budget' },
  { number: 6, label: 'Review' },
  { number: 7, label: 'Launch' },
];

const currentStep = 4;

const placementOptions = [
  { id: 'Landing Page Hero', desc: 'Homepage hero banner' },
  { id: 'Fixtures Page Card', desc: 'Sponsored fixture highlight' },
  { id: 'Team Profile Banner', desc: 'Partner banner on team pages' },
  { id: 'Match Center Branding', desc: 'In-game branding & overlays' },
  { id: 'Membership Section', desc: 'Sponsor tile in membership' },
  { id: 'Ticketing Flow Branding', desc: 'Branding in ticket purchase flow' },
];

export default function CampaignPlacement() {
  const navigate = useNavigate();
  const placements = useSponsorCampaignStore((s) => s.placements);
  const updatePlacements = useSponsorCampaignStore((s) => s.updatePlacements);

  const toggle = (id: string) => {
    updatePlacements(
      placements.includes(id)
        ? placements.filter((p) => p !== id)
        : [...placements, id],
    );
  };

  return (
    <div className="cp-page">
      <div className="cp-layout">
        <SponsorSidebar />

        <main className="cp-main landing-page">

          {/* Header */}
          <div className="cp-header">
            <button className="cp-back-btn" onClick={() => navigate('/sponsor/campaigns/new/assets')}>
              <FiArrowLeft size={18} />
            </button>
            <h1 className="cp-title">Create Sponsor Campaign</h1>
          </div>

          {/* Stepper */}
          <div className="cp-stepper">
            {steps.map((step, index) => {
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              return (
                <div key={step.number} className="cp-step-wrap">
                  <div className="cp-step">
                    <div className={`cp-step-circle ${isActive ? 'cp-step-active' : ''} ${isCompleted ? 'cp-step-completed' : ''}`}>
                      {isCompleted ? '✓' : step.number}
                    </div>
                    <div className={`cp-step-label ${isActive ? 'cp-step-label-active' : ''}`}>
                      {step.label}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`cp-step-line ${isCompleted ? 'cp-step-line-done' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>

          <p className="cp-intro">Choose where your campaign should appear across League OS.</p>

          {/* Form */}
          <div className="cp-form-card">
            <h2 className="cp-form-title">Placement Preferences</h2>
            <p className="cp-section-hint">Select all the placements you'd like your campaign considered for.</p>

            <div className="cp-placement-grid">
              {placementOptions.map((option) => {
                const isSelected = placements.includes(option.id);
                return (
                  <div
                    key={option.id}
                    className={`cp-placement-card ${isSelected ? 'cp-placement-selected' : ''}`}
                    onClick={() => toggle(option.id)}
                  >
                    <div className={`cp-checkbox ${isSelected ? 'cp-checkbox-checked' : ''}`}>
                      {isSelected && <FiCheck size={11} />}
                    </div>
                    <div>
                      <div className="cp-placement-title">{option.id}</div>
                      <div className="cp-placement-desc">{option.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom nav */}
          <div className="cp-bottom-nav">
            <button className="cp-back-nav-btn" onClick={() => navigate('/sponsor/campaigns/new/assets')}>
              <FiArrowLeft size={15} /> Back: Assets
            </button>
            <button className="cp-next-btn" onClick={() => navigate('/sponsor/campaigns/new/budget')}>
              Next: Budget <FiArrowRight size={15} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
