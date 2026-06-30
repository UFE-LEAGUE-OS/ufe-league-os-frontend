import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sponsor.module.css';
import qStyles from './SponsorQuickForm.module.css';

const SPORTS = ['Rugby', 'Football', 'Basketball'];

export default function SponsorQuickForm() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    sport: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const set = (k: keyof typeof form, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Valid email is required.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    if (!form.sport) e.sport = 'Select a sport.';
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
          <h2>Interest Registered!</h2>
          <p>
            Thanks <strong>{form.fullName}</strong>! We've noted your interest in sponsoring{' '}
            <strong>{form.sport}</strong>. Create a free account to complete your sponsor profile
            and start engaging with clubs and leagues.
          </p>
          <div className={qStyles.successActions}>
            <button className={styles.primaryBtn} onClick={() => navigate('/register')}>
              Create Free Account →
            </button>
            <button className={qStyles.ghostBtn} onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/sponsor/apply')}>
          ← Back
        </button>
        <div className={styles.steps}>
          <span className={styles.step}>1 Choose Type</span>
          <span className={styles.stepArrow}>›</span>
          <span className={`${styles.step} ${styles.stepActive}`}>2 Quick Interest Form</span>
          <span className={styles.stepArrow}>›</span>
          <span className={styles.step}>3 Create Account</span>
        </div>
      </div>

      <div className={styles.body}>
        {/* Heading */}
        <div className={styles.formHeader}>
          <div className={styles.formHeaderIcon}>👤</div>
          <div>
            <h1>Individual Sponsor</h1>
            <p>Fill in your details and we'll get you started. No account needed yet.</p>
          </div>
        </div>

        {/* Info banner */}
        <div className={qStyles.infoBanner}>
          <span className={qStyles.infoIcon}>ℹ</span>
          <span>
            This is a quick interest form. After submitting, create a free League OS account
            to complete your full sponsor profile and access all sponsor features.
          </span>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Your Details</h3>

            <div className={styles.field}>
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
              />
              {errors.fullName && <span className={styles.fieldError}>{errors.fullName}</span>}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                />
                {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
              </div>
              <div className={styles.field}>
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+256 7XX XXX XXX"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                />
                {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
              </div>
            </div>

            <div className={styles.field}>
              <label>Sport you want to sponsor *</label>
              <div className={styles.chipGrid}>
                {SPORTS.map(s => (
                  <button
                    type="button"
                    key={s}
                    className={`${styles.chip}${form.sport === s ? ` ${styles.chipActive}` : ''}`}
                    onClick={() => set('sport', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {errors.sport && <span className={styles.fieldError}>{errors.sport}</span>}
            </div>

            <div className={styles.field}>
              <label>Message <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                rows={3}
                placeholder="Any specific clubs, leagues, or teams you'd like to support?"
                value={form.message}
                onChange={e => set('message', e.target.value)}
              />
            </div>
          </div>

          <button type="submit" data-auth-skip className={styles.primaryBtn}>
            Submit Interest →
          </button>

          <p className={qStyles.loginHint}>
            Already have an account?{' '}
            <button type="button" className={qStyles.loginLink} onClick={() => navigate('/login')}>
              Log in
            </button>{' '}
            to access the full sponsor profile.
          </p>
        </form>
      </div>
    </div>
  );
}
