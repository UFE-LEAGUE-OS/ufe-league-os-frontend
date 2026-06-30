import { useNavigate } from 'react-router-dom';
import styles from './Sponsor.module.css';

export default function SponsorApply() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <div className={styles.steps}>
          <span className={`${styles.step} ${styles.stepActive}`}>1 Choose Type</span>
          <span className={styles.stepArrow}>›</span>
          <span className={styles.step}>2 Your Profile</span>
          <span className={styles.stepArrow}>›</span>
          <span className={styles.step}>3 Review &amp; Submit</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.heroText}>
          <h1>Become a <span className={styles.accent}>Sponsor</span></h1>
          <p>
            Support Ugandan sport. Follow, engage, and partner with teams, leagues,
            and competitions on League OS. Choose the type of sponsorship that fits you.
          </p>
        </div>

        <div className={styles.typeGrid}>
          {/* Individual */}
          <button
            data-auth-skip
            className={styles.typeCard}
            onClick={() => navigate('/sponsor/individual-quick')}
          >
            <div className={styles.typeIconWrap} style={{ background: 'rgba(129,53,250,0.15)', borderColor: 'rgba(129,53,250,0.4)' }}>
              <span className={styles.typeIcon}>👤</span>
            </div>
            <h2>Individual Sponsor</h2>
            <p>
              Sponsor as a person. Support your favourite clubs, leagues, and athletes
              directly and get exclusive fan recognition.
            </p>
            <ul className={styles.typePerks}>
              <li>✓ Personal sponsor profile &amp; badge</li>
              <li>✓ Follow clubs &amp; leagues you support</li>
              <li>✓ Appear in club sponsor listings</li>
              <li>✓ Exclusive sponsor content access</li>
              <li>✓ Direct engagement with teams</li>
            </ul>
            <div className={styles.typeAction}>
              Get Started as Individual →
            </div>
          </button>

          {/* Corporate */}
          <button
            data-auth-skip
            className={styles.typeCard}
            onClick={() => navigate('/sponsor/corporate')}
          >
            <div className={styles.typeIconWrap} style={{ background: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.4)' }}>
              <span className={styles.typeIcon}>🏢</span>
            </div>
            <h2>Corporate Sponsor</h2>
            <p>
              Sponsor as a business or organisation. Get brand visibility, activation
              rights, and partnership opportunities across Ugandan sport.
            </p>
            <ul className={styles.typePerks}>
              <li>✓ Company/brand profile with logo</li>
              <li>✓ BRN/TIN verified business identity</li>
              <li>✓ Brand featured on sponsored pages</li>
              <li>✓ Activation &amp; matchday rights</li>
              <li>✓ Sponsorship analytics dashboard</li>
            </ul>
            <div className={styles.typeAction} style={{ background: '#f97316' }}>
              Get Started as Corporate →
            </div>
          </button>
        </div>

        <p className={styles.disclaimer}>
          All sponsorship applications are reviewed by the League OS team within 2–3 business days.
          You will be notified via email once your profile is approved.
        </p>
      </div>
    </div>
  );
}
