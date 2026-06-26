import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPORT_CONFIGS } from './fantasyData';
import type { Sport, Format } from './fantasyData';
import styles from './FantasySportSelect.module.css';

export default function FantasySportSelect() {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<Format | null>(null);

  const sport = selectedSport ? SPORT_CONFIGS[selectedSport] : null;

  const handleContinue = () => {
    if (selectedSport && selectedFormat) {
      navigate(`/fantasy/create-league?sport=${selectedSport}&format=${selectedFormat}`);
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/fantasy')}>← Back</button>
        <div className={styles.steps}>
          <span className={`${styles.step} ${styles.stepActive}`}>1 Sport &amp; Format</span>
          <span className={styles.stepArrow}>›</span>
          <span className={styles.step}>2 Create / Join</span>
          <span className={styles.stepArrow}>›</span>
          <span className={styles.step}>3 Build Team</span>
        </div>
      </div>

      <div className={styles.body}>
        {/* Step 1 — Sport */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.stepNum}>1</span>
            Choose Your Sport
          </h2>
          <p className={styles.sectionSub}>Select the sport you want to play fantasy for this season.</p>

          <div className={styles.sportGrid}>
            {Object.values(SPORT_CONFIGS).map((s) => (
              <button
                key={s.id}
                className={`${styles.sportCard}${selectedSport === s.id ? ` ${styles.sportCardSelected}` : ''}`}
                style={{ '--accent': s.color } as React.CSSProperties}
                onClick={() => { setSelectedSport(s.id); setSelectedFormat(null); }}
              >
                <span className={styles.sportEmoji}>{s.emoji}</span>
                <strong>{s.label}</strong>
                <div className={styles.sportMeta}>
                  <span>💰 Budget: {s.budget}m</span>
                  <span>👥 Squad: {s.squadSize} players</span>
                </div>
                <div className={styles.sportFormats}>
                  {s.formats.map(f => (
                    <span key={f.id} className={styles.formatChip}>{f.label}</span>
                  ))}
                </div>
                {selectedSport === s.id && (
                  <div className={styles.selectedTick}>✓</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Format (shown after sport selected) */}
        {sport && (
          <div className={`${styles.section} ${styles.sectionFadeIn}`}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.stepNum}>2</span>
              Choose a Format
            </h2>
            <p className={styles.sectionSub}>How do you want to compete?</p>

            <div className={styles.formatGrid}>
              {sport.formats.map((f) => (
                <button
                  key={f.id}
                  className={`${styles.formatCard}${selectedFormat === f.id ? ` ${styles.formatCardSelected}` : ''}`}
                  style={{ '--accent': sport.color } as React.CSSProperties}
                  onClick={() => setSelectedFormat(f.id)}
                >
                  <div className={styles.formatIcon}>
                    {f.id === 'classic' ? '🏆' : f.id === 'draft' ? '📋' : '⚔️'}
                  </div>
                  <strong>{f.label}</strong>
                  <p>{f.desc}</p>
                  {selectedFormat === f.id && <div className={styles.selectedTick}>✓</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary + Continue */}
        {selectedSport && selectedFormat && sport && (
          <div className={`${styles.summary} ${styles.sectionFadeIn}`}>
            <div className={styles.summaryInfo}>
              <span>{sport.emoji} <strong>{sport.label}</strong></span>
              <span>·</span>
              <span>📋 <strong>{sport.formats.find(f => f.id === selectedFormat)?.label}</strong></span>
              <span>·</span>
              <span>💰 Budget: <strong>{sport.budget}m UGX</strong></span>
              <span>·</span>
              <span>👥 Squad: <strong>{sport.squadSize} players</strong></span>
            </div>
            <button className={styles.continueBtn} onClick={handleContinue}>
              Continue to Create / Join →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
