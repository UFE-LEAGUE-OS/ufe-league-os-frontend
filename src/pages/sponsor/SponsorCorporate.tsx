import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Sponsor.module.css';

type FormState = {
  companyName: string;
  tradingName: string;
  brn: string;
  tin: string;
  industry: string;
  website: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  companyAddress: string;
  city: string;
  companyBio: string;
  sportsInterests: string[];
  sponsorshipBudget: string;
  sponsorshipGoals: string[];
  additionalInfo: string;
  agreeTerms: boolean;
};

const SPORTS = ['Rugby', 'Football', 'Basketball'];
const BUDGETS = ['UGX 5,000,000', 'UGX 10,000,000', 'UGX 25,000,000', 'UGX 50,000,000', 'UGX 100,000,000+', 'To be discussed'];
const GOALS = ['Brand Visibility', 'Community Engagement', 'Employee Activation', 'Product/Service Promotion', 'CSR Initiative', 'Matchday Activation', 'Digital/Social Media', 'Kit/Jersey Sponsorship'];

export default function SponsorCorporate() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({
    companyName: '', tradingName: '', brn: '', tin: '',
    industry: '', website: '', contactName: '', contactTitle: '',
    contactEmail: '', contactPhone: '', companyAddress: '', city: '',
    companyBio: '', sportsInterests: [], sponsorshipBudget: '',
    sponsorshipGoals: [], additionalInfo: '', agreeTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm(p => ({ ...p, [k]: v }));
    setErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const toggleSport = (s: string) =>
    setForm(p => ({ ...p, sportsInterests: p.sportsInterests.includes(s) ? p.sportsInterests.filter(x => x !== s) : [...p.sportsInterests, s] }));

  const toggleGoal = (g: string) =>
    setForm(p => ({ ...p, sponsorshipGoals: p.sponsorshipGoals.includes(g) ? p.sponsorshipGoals.filter(x => x !== g) : [...p.sponsorshipGoals, g] }));

  const validate = () => {
    const e: typeof errors = {};
    if (!form.companyName.trim())  e.companyName  = 'Company name is required.';
    if (!form.brn.trim())          e.brn          = 'Business Registration Number is required.';
    if (!form.tin.trim())          e.tin          = 'TIN is required.';
    if (!form.contactName.trim())  e.contactName  = 'Contact name is required.';
    if (!form.contactEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) e.contactEmail = 'Valid email is required.';
    if (!form.contactPhone.trim()) e.contactPhone = 'Contact phone is required.';
    if (!form.city.trim())         e.city         = 'City is required.';
    if (form.sportsInterests.length === 0) e.sportsInterests = 'Select at least one sport.';
    if (!form.sponsorshipBudget)   e.sponsorshipBudget = 'Select a budget range.';
    if (!form.agreeTerms)          e.agreeTerms   = 'You must agree to the terms.';
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
          <p>Thank you for applying as a Corporate Sponsor. Our partnerships team will review <strong>{form.companyName}</strong>'s application within 2–3 business days and contact you at <strong>{form.contactEmail}</strong>.</p>
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
        <button className={styles.backBtn} onClick={() => navigate('/')}>← Back to Home</button>
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
          <div className={styles.formHeaderIcon} style={{ background: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.4)' }}>🏢</div>
          <div>
            <h1>Corporate Sponsor Profile</h1>
            <p>Register your organisation as an official sponsor on League OS.</p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* Company info */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Company Information</h3>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Registered Company Name *</label>
                <input type="text" placeholder="As on certificate of incorporation"
                  value={form.companyName} onChange={e => set('companyName', e.target.value)} />
                {errors.companyName && <span className={styles.fieldError}>{errors.companyName}</span>}
              </div>
              <div className={styles.field}>
                <label>Trading / Brand Name</label>
                <input type="text" placeholder="If different from registered name"
                  value={form.tradingName} onChange={e => set('tradingName', e.target.value)} />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Business Registration Number (BRN) *</label>
                <input type="text" placeholder="e.g. 80000001234"
                  value={form.brn} onChange={e => set('brn', e.target.value)} />
                {errors.brn && <span className={styles.fieldError}>{errors.brn}</span>}
                <span className={styles.fieldHint}>Issued by Uganda Registration Services Bureau (URSB)</span>
              </div>
              <div className={styles.field}>
                <label>Tax Identification Number (TIN) *</label>
                <input type="text" placeholder="e.g. 1000123456"
                  value={form.tin} onChange={e => set('tin', e.target.value)} />
                {errors.tin && <span className={styles.fieldError}>{errors.tin}</span>}
                <span className={styles.fieldHint}>Issued by Uganda Revenue Authority (URA)</span>
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Industry / Sector</label>
                <select value={form.industry} onChange={e => set('industry', e.target.value)}>
                  <option value="">Select industry</option>
                  {['Telecommunications','Banking & Finance','Insurance','FMCG / Consumer Goods','Media & Entertainment','Energy & Utilities','Real Estate','Healthcare','Technology','Hospitality & Tourism','Retail','Education','Other'].map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label>Company Website</label>
                <input type="url" placeholder="https://www.example.com"
                  value={form.website} onChange={e => set('website', e.target.value)} />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Company Address</label>
                <input type="text" placeholder="Physical address"
                  value={form.companyAddress} onChange={e => set('companyAddress', e.target.value)} />
              </div>
              <div className={styles.field}>
                <label>City / Town *</label>
                <input type="text" placeholder="e.g. Kampala"
                  value={form.city} onChange={e => set('city', e.target.value)} />
                {errors.city && <span className={styles.fieldError}>{errors.city}</span>}
              </div>
            </div>
            <div className={styles.field}>
              <label>Company Overview</label>
              <textarea rows={3} placeholder="Brief description of your company and what you do"
                value={form.companyBio} onChange={e => set('companyBio', e.target.value)} />
            </div>
          </div>

          {/* Primary contact */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Primary Contact Person</h3>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Full Name *</label>
                <input type="text" placeholder="Contact person's name"
                  value={form.contactName} onChange={e => set('contactName', e.target.value)} />
                {errors.contactName && <span className={styles.fieldError}>{errors.contactName}</span>}
              </div>
              <div className={styles.field}>
                <label>Job Title</label>
                <input type="text" placeholder="e.g. Marketing Director"
                  value={form.contactTitle} onChange={e => set('contactTitle', e.target.value)} />
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label>Email Address *</label>
                <input type="email" placeholder="contact@company.com"
                  value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
                {errors.contactEmail && <span className={styles.fieldError}>{errors.contactEmail}</span>}
              </div>
              <div className={styles.field}>
                <label>Phone Number *</label>
                <input type="tel" placeholder="+256 7XX XXX XXX"
                  value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
                {errors.contactPhone && <span className={styles.fieldError}>{errors.contactPhone}</span>}
              </div>
            </div>
          </div>

          {/* Sports interests */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Sports &amp; Leagues to Sponsor *</h3>
            <p className={styles.sectionHint}>Which sports does your company want to be associated with?</p>
            <div className={styles.chipGrid}>
              {SPORTS.map(s => (
                <button type="button" key={s}
                  className={`${styles.chip}${form.sportsInterests.includes(s) ? ` ${styles.chipActiveOrange}` : ''}`}
                  onClick={() => toggleSport(s)}>{s}</button>
              ))}
            </div>
            {errors.sportsInterests && <span className={styles.fieldError}>{errors.sportsInterests}</span>}
          </div>

          {/* Sponsorship details */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Sponsorship Details</h3>
            <div className={styles.field}>
              <label>Annual Sponsorship Budget *</label>
              <select value={form.sponsorshipBudget} onChange={e => set('sponsorshipBudget', e.target.value)}>
                <option value="">Select budget range</option>
                {BUDGETS.map(b => <option key={b}>{b}</option>)}
              </select>
              {errors.sponsorshipBudget && <span className={styles.fieldError}>{errors.sponsorshipBudget}</span>}
            </div>
            <div className={styles.field}>
              <label>Sponsorship Goals</label>
              <p className={styles.sectionHint}>What do you want to achieve through sponsorship?</p>
              <div className={styles.chipGrid}>
                {GOALS.map(g => (
                  <button type="button" key={g}
                    className={`${styles.chip}${form.sponsorshipGoals.includes(g) ? ` ${styles.chipActiveOrange}` : ''}`}
                    onClick={() => toggleGoal(g)}>{g}</button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label>Additional Information</label>
              <textarea rows={4}
                placeholder="Any specific requirements, preferred teams/leagues, or other information you'd like to share..."
                value={form.additionalInfo} onChange={e => set('additionalInfo', e.target.value)} />
            </div>
          </div>

          {/* Terms */}
          <div className={styles.formSection}>
            <label className={styles.checkRow}>
              <input type="checkbox" checked={form.agreeTerms}
                onChange={e => set('agreeTerms', e.target.checked)} />
              <span>I confirm the information provided is accurate and I agree to the <a href="/terms" target="_blank">Terms of Service</a>, <a href="/privacy" target="_blank">Privacy Policy</a>, and <a href="#" target="_blank">Sponsorship Guidelines</a>.</span>
            </label>
            {errors.agreeTerms && <span className={styles.fieldError}>{errors.agreeTerms}</span>}
          </div>

          <button type="submit" data-auth-skip className={`${styles.primaryBtn} ${styles.primaryBtnOrange}`}>
            Submit Corporate Application →
          </button>
        </form>
      </div>
    </div>
  );
}
