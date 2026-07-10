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
import '../../styles/pages/landing.css';
import './CampaignTargeting.css';

const steps = [
  { number: 1, label: 'Campaign Info' },
  { number: 2, label: 'Targeting' },
  { number: 3, label: 'Budget' },
  { number: 4, label: 'Review' },
  { number: 5, label: 'Launch' },
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

  const [selectedSports, setSelectedSports] = useState<string[]>(['Football', 'Rugby']);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>(['Nile Special Rugby Premiership']);
  const [selectedAges, setSelectedAges] = useState<string[]>(['18-24', '25-34', '35-44']);
  const [selectedGender, setSelectedGender] = useState('All Genders');
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['All Uganda']);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Match Attendees']);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
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
                    className={`ct-chip ${selectedSports.includes(sport) ? 'ct-chip-selected' : ''}`}
                    onClick={() => toggle(selectedSports, sport, setSelectedSports)}
                  >
                    {selectedSports.includes(sport) && <FiCheck size={12} />}
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
                    className={`ct-chip ${selectedLeagues.includes(league) ? 'ct-chip-selected' : ''}`}
                    onClick={() => toggle(selectedLeagues, league, setSelectedLeagues)}
                  >
                    {selectedLeagues.includes(league) && <FiCheck size={12} />}
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
                    className={`ct-age-card ${selectedAges.includes(age.id) ? 'ct-age-selected' : ''}`}
                    onClick={() => toggle(selectedAges, age.id, setSelectedAges)}
                  >
                    <div className={`ct-checkbox ${selectedAges.includes(age.id) ? 'ct-checkbox-checked' : ''}`}>
                      {selectedAges.includes(age.id) && <FiCheck size={11} />}
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
                    className={`ct-gender-card ${selectedGender === g ? 'ct-gender-selected' : ''}`}
                    onClick={() => setSelectedGender(g)}
                  >
                    <div className={`ct-radio ${selectedGender === g ? 'ct-radio-on' : ''}`} />
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
                    className={`ct-chip ${selectedLocations.includes(loc) ? 'ct-chip-selected' : ''}`}
                    onClick={() => toggle(selectedLocations, loc, setSelectedLocations)}
                  >
                    {selectedLocations.includes(loc) && <FiCheck size={12} />}
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
                    className={`ct-chip ${selectedInterests.includes(interest) ? 'ct-chip-selected' : ''}`}
                    onClick={() => toggle(selectedInterests, interest, setSelectedInterests)}
                  >
                    {selectedInterests.includes(interest) && <FiCheck size={12} />}
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

          {/* Bottom nav */}
          <div className="ct-bottom-nav">
            <button className="ct-back-nav-btn" onClick={() => navigate('/sponsor/campaigns/new')}>
              <FiArrowLeft size={15} /> Back: Campaign Info
            </button>
            <button className="ct-next-btn" onClick={() => navigate('/sponsor/campaigns/new/budget')}>
              Next: Budget <FiArrowRight size={15} />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}