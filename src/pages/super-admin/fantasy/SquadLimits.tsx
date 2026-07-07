import { useState } from "react";
import {
  Users,
  Save,
  ArrowLeft,
  Shield,
  Swords,
  Goal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type PositionLimit = {
  position: string;
  min: number;
  max: number;
  icon: string;
};

type SquadConfig = {
  totalSquadSize: number;
  startingXI: number;
  substitutes: number;
  maxPerClub: number;
  maxPerNationality: number;
  minAge: number;
  maxAge: number;
  formationLocked: boolean;
  allowedFormations: string[];
  positionLimits: PositionLimit[];
};

const DEFAULT_POSITION_LIMITS: PositionLimit[] = [
  { position: "Goalkeeper (GK)", min: 2, max: 3, icon: "🧤" },
  { position: "Defender (DEF)", min: 3, max: 5, icon: "🛡️" },
  { position: "Midfielder (MID)", min: 3, max: 5, icon: "⚡" },
  { position: "Forward (FWD)", min: 1, max: 3, icon: "⚽" },
];

const FORMATION_OPTIONS = [
  "4-4-2",
  "4-3-3",
  "3-5-2",
  "3-4-3",
  "5-3-2",
  "5-4-1",
  "4-5-1",
  "4-2-3-1",
  "3-6-1",
  "2-3-5",
];

export default function SquadLimits() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<SquadConfig>({
    totalSquadSize: 15,
    startingXI: 11,
    substitutes: 4,
    maxPerClub: 3,
    maxPerNationality: 5,
    minAge: 16,
    maxAge: 40,
    formationLocked: false,
    allowedFormations: ["4-4-2", "4-3-3", "3-5-2", "3-4-3"],
    positionLimits: DEFAULT_POSITION_LIMITS,
  });
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof SquadConfig>(key: K, value: SquadConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFormation = (formation: string) => {
    setConfig((prev) => ({
      ...prev,
      allowedFormations: prev.allowedFormations.includes(formation)
        ? prev.allowedFormations.filter((f) => f !== formation)
        : [...prev.allowedFormations, formation],
    }));
  };

  const updatePositionLimit = (index: number, field: "min" | "max", value: number) => {
    setConfig((prev) => ({
      ...prev,
      positionLimits: prev.positionLimits.map((pl, i) =>
        i === index ? { ...pl, [field]: value } : pl
      ),
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fantasy-sub-page">
      <div className="fantasy-sub-header">
        <button className="back-btn" onClick={() => navigate("..")}>
          <ArrowLeft size={16} />
          Back to Fantasy Config
        </button>
        <div>
          <h2>Squad Limits Configurator</h2>
          <p className="governance-subtitle">
            Define squad size, per-club caps, position requirements, and formation rules
          </p>
        </div>
      </div>

      <div className="squad-limits-grid">
        {/* Squad Size */}
        <div className="panel">
          <div className="panel-header">
            <h3><Users size={16} /> Squad Size</h3>
          </div>
          <div className="config-field-list">
            <div className="config-field">
              <label>Total squad size</label>
              <input
                type="number"
                min={11}
                max={30}
                value={config.totalSquadSize}
                onChange={(e) => update("totalSquadSize", parseInt(e.target.value) || 11)}
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Starting XI</label>
              <input
                type="number"
                min={11}
                max={11}
                value={config.startingXI}
                disabled
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Substitutes</label>
              <input
                type="number"
                min={0}
                max={12}
                value={config.substitutes}
                onChange={(e) => update("substitutes", parseInt(e.target.value) || 0)}
                className="fantasy-input"
              />
            </div>
          </div>
        </div>

        {/* Player Restrictions */}
        <div className="panel">
          <div className="panel-header">
            <h3><Shield size={16} /> Player Restrictions</h3>
          </div>
          <div className="config-field-list">
            <div className="config-field">
              <label>Max players per club</label>
              <input
                type="number"
                min={1}
                max={11}
                value={config.maxPerClub}
                onChange={(e) => update("maxPerClub", parseInt(e.target.value) || 1)}
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Max players per nationality</label>
              <input
                type="number"
                min={1}
                max={15}
                value={config.maxPerNationality}
                onChange={(e) => update("maxPerNationality", parseInt(e.target.value) || 1)}
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Minimum player age</label>
              <input
                type="number"
                min={14}
                max={21}
                value={config.minAge}
                onChange={(e) => update("minAge", parseInt(e.target.value) || 14)}
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Maximum player age</label>
              <input
                type="number"
                min={30}
                max={50}
                value={config.maxAge}
                onChange={(e) => update("maxAge", parseInt(e.target.value) || 30)}
                className="fantasy-input"
              />
            </div>
          </div>
        </div>

        {/* Position Limits */}
        <div className="panel">
          <div className="panel-header">
            <h3><Swords size={16} /> Position Limits</h3>
          </div>
          <div className="position-limits-table">
            <div className="plt-header">
              <span>Position</span>
              <span>Min</span>
              <span>Max</span>
            </div>
            {config.positionLimits.map((pl, i) => (
              <div key={pl.position} className="plt-row">
                <span className="plt-position">
                  <span className="plt-icon">{pl.icon}</span>
                  {pl.position}
                </span>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={pl.min}
                  onChange={(e) => updatePositionLimit(i, "min", parseInt(e.target.value) || 0)}
                  className="fantasy-input fantasy-input-narrow"
                />
                <input
                  type="number"
                  min={0}
                  max={8}
                  value={pl.max}
                  onChange={(e) => updatePositionLimit(i, "max", parseInt(e.target.value) || 0)}
                  className="fantasy-input fantasy-input-narrow"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Formations */}
        <div className="panel">
          <div className="panel-header">
            <h3><Goal size={16} /> Allowed Formations</h3>
          </div>
          <div className="config-field-list">
            <div className="config-field toggle-field">
              <label>Lock formation (players can't change)</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={config.formationLocked}
                  onChange={(e) => update("formationLocked", e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          </div>
          <div className="formations-grid">
            {FORMATION_OPTIONS.map((formation) => (
              <button
                key={formation}
                className={`formation-chip ${config.allowedFormations.includes(formation) ? "active" : ""}`}
                onClick={() => toggleFormation(formation)}
                type="button"
              >
                {formation}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="save-bar">
        <button className="action-btn primary" onClick={handleSave}>
          <Save size={16} /> {saved ? "Saved!" : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}