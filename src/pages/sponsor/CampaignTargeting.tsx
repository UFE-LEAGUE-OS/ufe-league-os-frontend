import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiMapPin,
  FiUsers,
  FiTarget,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { useSponsorCampaignStore } from '../../store/sponsorCampaignStore';
import '../../styles/pages/landing.css';
import './CampaignTargeting.css';

const steps = [
  { number: 1, label: 'Campaign Info' },
  { number: 2, label: 'Targeting' },
  { number: 3, label: 'Assets' },
  { number: 4, label: 'Placement' },
  { number: 5, label: 'Budget' },
  { number: 6, label: 'Review' },
  { number: 7, label: 'Launch' },
];

const currentStep = 2;

const sports = [
  'Football', 'Rugby', 'Basketball', 'Athletics',
  'Swimming', 'Netball', 'Cricket', 'Volleyball',
];

const leagues = [
  'Nile Special Rugby Premiership',
  'Star Times Uganda Premier League',
  'National Basketball League',
  'Budo League',
  'SMACK League',
  'Women\'s Football League',
];

const ageGroups = [
  { id: '13-17', label: '13 – 17', desc: 'Teens' },
  { id: '18-24', label: '18 – 24', desc: 'Young Adults' },
  { id: '25-34', label: '25 – 34', desc: 'Adults' },
  { id: '35-44', label: '35 – 44', desc: 'Mid Adults' },
  { id: '45-54', label: '45 – 54', desc: 'Mature Adults' },
  { id: '55+', label: '55+', desc: 'Seniors' },
];

const genders = ['All Genders', 'Male', 'Female'];

const locations = [
  'All Uganda', 'Kampala', 'Entebbe', 'Jinja',
  'Gulu', 'Mbarara', 'Mbale', 'Fort Portal',
];

const fanInterests = [
  'Match Attendees', 'Fantasy Players', 'Ticket Buyers',
  'Club Members', 'News Readers', 'Live Stream Viewers',
];

export default function CampaignTargeting() {
  const navigate = useNavigate();
  const audience = useSponsorCampaignStore((s) => s.audience);
  const updateAudience = useSponsorCampaignStore((s) => s.updateAudience);
  const saveDraft = useSponsorCampaignStore((s) => s.saveDraft);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggle = (arr: string[], val: string, key: keyof typeof audience) => {
    updateAudience({
      [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
    } as Partial<typeof audience>);
  };

  const handleNext = async () => {
    setErrorMessage('');
    setIsSaving(true);
    try {
      await saveDraft();
      navigate('/sponsor/campaigns/new/assets');
    } catch {
      setErrorMessage('We could not save your campaign. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="ct-page">
      <div className="ct-layout">
        <SponsorSidebar />

        <main className="ct-main landing-page">

          {/* Header */}
          <div className="ct-header">
            <button className="ct-back-btn" onClick={() => navigate('/sponsor/campaigns/new')}>
              <FiArrowLeft size={18} />
            </button>
            <h1 className="ct-title">Create Sponsor Campaign</h1>
          </div>

          {/* Stepper */}
          <div className="ct-stepper">
            {steps.map((step, index) => {
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              return (
                <div key={step.number} className="ct-step-wrap">
                  <div className="ct-step">
                    <div className={`ct-step-circle ${isActive ? 'ct-step-active' : ''} ${isCompleted ? 'ct-step-completed' : ''}`}>
                      {isCompleted ? '✓' : step.number}
                    </div>
                    <div className={`ct-step-label ${isActive ? 'ct-step-label-active' : ''}`}>
                      {step.label}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`ct-step-line ${isCompleted ? 'ct-step-line-done' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>

          <p className="ct-intro">Define who should see your campaign across the League OS platform.</p>

          {/* Form */}
          <div className="ct-form-card">
            <h2 className="ct-form-title">Audience Targeting</h2>

            {/* Sports */}
            <div className="ct-section">
              <div className="ct-section-header">
                <FiTarget size={16} className="ct-section-icon" />
                <label className="ct-section-label">Target Sports <span className="ct-required">*</span></label>
              </div>
              <p className="ct-section-hint">Select the sports your campaign should appear in.</p>
              <div className="ct-chips-grid">
                {sports.map((sport) => (
                  <div
                    key={sport}
                    className={`ct-chip ${audience.sports.includes(sport) ? 'ct-chip-selected' : ''}`}
                    onClick={() => toggle(audience.sports, sport, 'sports')}
                  >
                    {audience.sports.includes(sport) && <FiCheck size={12} />}
                    {sport}
                  </div>
                ))}
              </div>
            </div>

            {/* Leagues */}
            <div className="ct-section">
              <div className="ct-section-header">
                <FiTarget size={16} className="ct-section-icon" />
                <label className="ct-section-label">Target Leagues / Competitions <span className="ct-required">*</span></label>
              </div>
              <p className="ct-section-hint">Select specific leagues or competitions to target.</p>
              <div className="ct-chips-grid">
                {leagues.map((league) => (
                  <div
                    key={league}
                    className={`ct-chip ${audience.leagues.includes(league) ? 'ct-chip-selected' : ''}`}
                    onClick={() => toggle(audience.leagues, league, 'leagues')}
                  >
                    {audience.leagues.includes(league) && <FiCheck size={12} />}
                    {league}
                  </div>
                ))}
              </div>
            </div>

            {/* Age Groups */}
            <div className="ct-section">
              <div className="ct-section-header">
                <FiUsers size={16} className="ct-section-icon" />
                <label className="ct-section-label">Age Groups <span className="ct-required">*</span></label>
              </div>
              <p className="ct-section-hint">Select the age groups you want to reach.</p>
              <div className="ct-age-grid">
                {ageGroups.map((age) => (
                  <div
                    key={age.id}
                    className={`ct-age-card ${audience.ageGroups.includes(age.id) ? 'ct-age-selected' : ''}`}
                    onClick={() => toggle(audience.ageGroups, age.id, 'ageGroups')}
                  >
                    <div className={`ct-checkbox ${audience.ageGroups.includes(age.id) ? 'ct-checkbox-checked' : ''}`}>
                      {audience.ageGroups.includes(age.id) && <FiCheck size={11} />}
                    </div>
                    <div className="ct-age-label">{age.label}</div>
                    <div className="ct-age-desc">{age.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div className="ct-section">
              <div className="ct-section-header">
                <FiUsers size={16} className="ct-section-icon" />
                <label className="ct-section-label">Gender</label>
              </div>
              <div className="ct-gender-grid">
                {genders.map((g) => (
                  <div
                    key={g}
                    className={`ct-gender-card ${audience.gender === g ? 'ct-gender-selected' : ''}`}
                    onClick={() => updateAudience({ gender: g })}
                  >
                    <div className={`ct-radio ${audience.gender === g ? 'ct-radio-on' : ''}`} />
                    {g}
                  </div>
                ))}
              </div>
            </div>

            {/* Locations */}
            <div className="ct-section">
              <div className="ct-section-header">
                <FiMapPin size={16} className="ct-section-icon" />
                <label className="ct-section-label">Geographic Targeting <span className="ct-required">*</span></label>
              </div>
              <p className="ct-section-hint">Select the regions where your campaign should be shown.</p>
              <div className="ct-chips-grid">
                {locations.map((loc) => (
                  <div
                    key={loc}
                    className={`ct-chip ${audience.locations.includes(loc) ? 'ct-chip-selected' : ''}`}
                    onClick={() => toggle(audience.locations, loc, 'locations')}
                  >
                    {audience.locations.includes(loc) && <FiCheck size={12} />}
                    {loc}
                  </div>
                ))}
              </div>
            </div>

            {/* Fan Interests */}
            <div className="ct-section">
              <div className="ct-section-header">
                <FiUsers size={16} className="ct-section-icon" />
                <label className="ct-section-label">Fan Interests</label>
              </div>
              <p className="ct-section-hint">Reach fans based on their activity on League OS.</p>
              <div className="ct-chips-grid">
                {fanInterests.map((interest) => (
                  <div
                    key={interest}
                    className={`ct-chip ${audience.fanInterests.includes(interest) ? 'ct-chip-selected' : ''}`}
                    onClick={() => toggle(audience.fanInterests, interest, 'fanInterests')}
                  >
                    {audience.fanInterests.includes(interest) && <FiCheck size={12} />}
                    {interest}
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Reach */}
            <div className="ct-reach-card">
              <div className="ct-reach-info">
                <FiUsers size={18} className="ct-reach-icon" />
                <div>
                  <div className="ct-reach-label">Estimated Reach</div>
                  <div className="ct-reach-value">850K – 1.2M fans</div>
                </div>
              </div>
              <div className="ct-reach-breakdown">
                <div className="ct-reach-item">
                  <span className="ct-reach-item-label">Football fans</span>
                  <span className="ct-reach-item-val">520K</span>
                </div>
                <div className="ct-reach-item">
                  <span className="ct-reach-item-label">Rugby fans</span>
                  <span className="ct-reach-item-val">330K</span>
                </div>
                <div className="ct-reach-item">
                  <span className="ct-reach-item-label">Age 18–44</span>
                  <span className="ct-reach-item-val">78%</span>
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="ct-error-banner">{errorMessage}</div>
          )}

          {/* Bottom nav */}
          <div className="ct-bottom-nav">
            <button className="ct-back-nav-btn" onClick={() => navigate('/sponsor/campaigns/new')}>
              <FiArrowLeft size={15} /> Back: Campaign Info
            </button>
            <button className="ct-next-btn" disabled={isSaving} onClick={() => void handleNext()}>
              {isSaving ? 'Saving…' : 'Next: Assets'} <FiArrowRight size={15} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
