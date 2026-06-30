import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sponsor.module.css';

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  city: string;
  occupation: string;
  bio: string;
  sportsInterests: string[];
  sponsorshipAmount: string;
  motivation: string;
  agreeTerms: boolean;
};

const SPORTS = ['Rugby', 'Football', 'Basketball', 'Cricket', 'Netball', 'Athletics'];
const AMOUNTS = ['UGX 500,000', 'UGX 1,000,000', 'UGX 2,500,000', 'UGX 5,000,000', 'UGX 10,000,000+', 'To be discussed'];

export default function SponsorIndividual() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    firstName: '', lastName: '', email: '', phone: '',
    nationality: 'Ugandan', city: '', occupation: '', bio: '',
    sportsInterests: [], sponsorshipAmount: '', motivation: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const toggleSport = (sport: string) => {
    setForm(p => ({
      ...p,
      sportsInterests: p.sportsInterests.includes(sport)
        ? p.sportsInterests.filter(s => s !== sport)
        : [...p.sportsInterests, sport],
    }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required.';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required.';
    if (!form.phone.trim())  e.phone  = 'Phone number is required.';
    if (!form.city.trim())   e.city   = 'City is required.';
    if (form.sportsInterests.length === 0) e.sportsInterests = 'Select at least one sport.';
    if (!form.sponsorshipAmount) e.sponsorshipAmount = 'Select a sponsorship amount.';
    if (!form.motivation.trim()) e.motivation = 'Please tell us your motivation.';
    if (!form.agreeTerms) e.agreeTerms = 'You must agree to the terms.';
    return e;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.successState}>
          <div className={styles.successIcon}>🎉</div>
          <h2>Application Submitted!</h2>
          <p>Thank you for applying as an Individual Sponsor. Our team will review your profile within 2–3 business days and contact you at <strong>{form.email}</strong>.</p>
          <button className={styles.primaryBtn} onClick={() => navigate('/dashboard/fan')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/sponsor/apply')}>← Back</button>
        <div className={styles.steps}>
          <span className={styles.step}>1 Choose Type</span>
          <span className={styles.stepArrow}>›</span>
          <span className={`${styles.step} ${styles.stepActive}`}>2 Your Profile</span>
          <span className={styles.stepArrow}>›</span>
          <span className={styles.step}>3 Review &amp; Submit</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.formHeader}>
          <div className={styles.formHeaderIcon}>👤</div>
          <div>
            <h1>Individual Sponsor Profile</h1>
            <p>Tell us about yourself so clubs and leagues can recognise your support.</p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* Personal info */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Personal Information</h3>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>First Name *</label>
                <input type="text" placeholder="Enter first name" value={form.firstName}
                  onChange={e => set('firstName', e.target.value)} />
                {errors.firstName && <span className={styles.fieldError}>{errors.firstName}</span>}
              </div>
              <div className={styles.field}>
                <label>Last Name *</label>
                <input type="text" placeholder="Enter last name" value={form.lastName}
                  onChange={e => set('lastName', e.target.value)} />
                {errors.lastName && <span className={styles.fieldError}>{errors.lastName}</span>}
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Email Address *</label>
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => set('email', e.target.value)} />
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
              </div>
              <div className={styles.field}>
                <label>Phone Number *</label>
                <input type="tel" placeholder="+256 7XX XXX XXX" value={form.phone}
                  onChange={e => set('phone', e.target.value)} />
                {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Nationality</label>
                <input type="text" value={form.nationality}
                  onChange={e => set('nationality', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>City / Town *</label>
                <input type="text" placeholder="e.g. Kampala" value={form.city}
                  onChange={e => set('city', e.target.value)} />
                {errors.city && <span className={styles.fieldError}>{errors.city}</span>}
              </div>
            </div>
            <div className={styles.field}>
              <label>Occupation / Profession</label>
              <input type="text" placeholder="e.g. Engineer, Business Owner" value={form.occupation}
                onChange={e => set('occupation', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Short Bio</label>
              <textarea rows={3} placeholder="Tell us a little about yourself (optional)"
                value={form.bio} onChange={e => set('bio', e.target.value)} />
            </div>
          </div>

          {/* Sports interests */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Sports Interests *</h3>
            <p className={styles.sectionHint}>Select all sports you want to sponsor or follow.</p>
            <div className={styles.chipGrid}>
              {SPORTS.map(s => (
                <button type="button" key={s}
                  className={`${styles.chip}${form.sportsInterests.includes(s) ? ` ${styles.chipActive}` : ''}`}
                  onClick={() => toggleSport(s)}>
                  {s}
                </button>
              ))}
            </div>
            {errors.sportsInterests && <span className={styles.fieldError}>{errors.sportsInterests}</span>}
          </div>

          {/* Sponsorship details */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Sponsorship Details</h3>
            <div className={styles.field}>
              <label>Estimated Sponsorship Amount *</label>
              <select value={form.sponsorshipAmount} onChange={e => set('sponsorshipAmount', e.target.value)}>
                <option value="">Select amount range</option>
                {AMOUNTS.map(a => <option key={a}>{a}</option>)}
              </select>
              {errors.sponsorshipAmount && <span className={styles.fieldError}>{errors.sponsorshipAmount}</span>}
            </div>
            <div className={styles.field}>
              <label>Why do you want to become a sponsor? *</label>
              <textarea rows={4}
                placeholder="Tell us your motivation — e.g. supporting local talent, brand visibility, community involvement..."
                value={form.motivation} onChange={e => set('motivation', e.target.value)} />
              {errors.motivation && <span className={styles.fieldError}>{errors.motivation}</span>}
            </div>
          </div>

          {/* Terms */}
          <div className={styles.formSection}>
            <label className={styles.checkRow}>
              <input type="checkbox" checked={form.agreeTerms}
                onChange={e => set('agreeTerms', e.target.checked)} />
              <span>I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a>. I understand my application will be reviewed before approval.</span>
            </label>
            {errors.agreeTerms && <span className={styles.fieldError}>{errors.agreeTerms}</span>}
          </div>

          <button type="submit" className={styles.primaryBtn}>
            Submit Application →
          </button>
        </form>
      </div>
    </div>
  );
}
