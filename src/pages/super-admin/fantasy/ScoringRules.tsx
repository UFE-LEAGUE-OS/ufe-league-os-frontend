import { useState } from "react";
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  GripVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type ScoringRule = {
  id: string;
  event: string;
  points: number;
  sport: "football" | "basketball" | "rugby" | "all";
  enabled: boolean;
};

const DEFAULT_RULES: ScoringRule[] = [
  { id: "1", event: "Goal", points: 4, sport: "football", enabled: true },
  { id: "2", event: "Assist", points: 3, sport: "football", enabled: true },
  { id: "3", event: "Clean Sheet (GK/Def)", points: 4, sport: "football", enabled: true },
  { id: "4", event: "Save (every 3 saves)", points: 1, sport: "football", enabled: true },
  { id: "5", event: "Penalty Save", points: 5, sport: "football", enabled: true },
  { id: "6", event: "Penalty Miss", points: -2, sport: "football", enabled: true },
  { id: "7", event: "Yellow Card", points: -1, sport: "football", enabled: true },
  { id: "8", event: "Red Card", points: -3, sport: "football", enabled: true },
  { id: "9", event: "Own Goal", points: -2, sport: "football", enabled: true },
  { id: "10", event: "Bonus (top 3 performers)", points: 3, sport: "all", enabled: true },
  { id: "11", event: "Goal Conceded (every 2)", points: -1, sport: "football", enabled: true },
  { id: "12", event: "Appearance (60+ min)", points: 2, sport: "football", enabled: true },
  { id: "13", event: "Basketball Point", points: 1, sport: "basketball", enabled: true },
  { id: "14", event: "Rebound", points: 1.5, sport: "basketball", enabled: true },
  { id: "15", event: "Assist (Basketball)", points: 2, sport: "basketball", enabled: true },
  { id: "16", event: "Steal", points: 2, sport: "basketball", enabled: true },
  { id: "17", event: "Block", points: 2, sport: "basketball", enabled: true },
  { id: "18", event: "Try", points: 5, sport: "rugby", enabled: true },
  { id: "19", event: "Conversion", points: 2, sport: "rugby", enabled: true },
  { id: "20", event: "Penalty Kick (Rugby)", points: 3, sport: "rugby", enabled: true },
];

export default function ScoringRules() {
  const navigate = useNavigate();
  const [rules, setRules] = useState<ScoringRule[]>(DEFAULT_RULES);
  const [newEvent, setNewEvent] = useState("");
  const [newPoints, setNewPoints] = useState("");
  const [newSport, setNewSport] = useState<"football" | "basketball" | "rugby" | "all">("all");
  const [saved, setSaved] = useState(false);

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const updatePoints = (id: string, points: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, points } : r))
    );
  };

  const deleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const addRule = () => {
    if (!newEvent.trim()) return;
    const pts = parseFloat(newPoints);
    if (isNaN(pts)) return;
    const newRule: ScoringRule = {
      id: `custom-${Date.now()}`,
      event: newEvent.trim(),
      points: pts,
      sport: newSport,
      enabled: true,
    };
    setRules((prev) => [...prev, newRule]);
    setNewEvent("");
    setNewPoints("");
  };

  const handleSave = () => {
    // In real app, this would POST to API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fantasy-sub-page">
      <div className="fantasy-sub-header">
        <button className="back-btn" onClick={() => navigate("/super-admin/fantasy-config")}>
          <ArrowLeft size={16} />
          Back to Fantasy Config
        </button>
        <div>
          <h2>Scoring Rules Editor</h2>
          <p className="governance-subtitle">
            Define how fantasy points are awarded for each event across supported sports
          </p>
        </div>
      </div>

      {/* Add new rule */}
      <div className="panel" style={{ marginBottom: "1.5rem" }}>
        <div className="add-rule-row">
          <input
            type="text"
            placeholder="Event name (e.g. Hat-trick bonus)"
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            className="fantasy-input"
          />
          <input
            type="number"
            step="0.5"
            placeholder="Points"
            value={newPoints}
            onChange={(e) => setNewPoints(e.target.value)}
            className="fantasy-input fantasy-input-narrow"
          />
          <select
            value={newSport}
            onChange={(e) => setNewSport(e.target.value as "football" | "basketball" | "rugby" | "all")}
            className="fantasy-select"
          >
            <option value="all">All Sports</option>
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="rugby">Rugby</option>
          </select>
          <button className="action-btn" onClick={addRule}>
            <Plus size={16} /> Add Rule
          </button>
        </div>
      </div>

      {/* Rules table */}
      <div className="panel">
        <div className="panel-header">
          <h3>Scoring Rules ({rules.length})</h3>
          <button className="action-btn primary" onClick={handleSave}>
            <Save size={16} /> {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        <div className="scoring-rules-table">
          <div className="srt-header">
            <span className="srt-col-drag" />
            <span className="srt-col-enabled">Active</span>
            <span className="srt-col-event">Event</span>
            <span className="srt-col-points">Points</span>
            <span className="srt-col-sport">Sport</span>
            <span className="srt-col-actions">Actions</span>
          </div>
          {rules.map((rule) => (
            <div key={rule.id} className={`srt-row ${!rule.enabled ? "disabled" : ""}`}>
              <span className="srt-col-drag">
                <GripVertical size={14} className="drag-icon" />
              </span>
              <span className="srt-col-enabled">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleRule(rule.id)}
                  />
                  <span className="toggle-slider" />
                </label>
              </span>
              <span className="srt-col-event">{rule.event}</span>
              <span className="srt-col-points">
                <input
                  type="number"
                  step="0.5"
                  value={rule.points}
                  onChange={(e) => updatePoints(rule.id, parseFloat(e.target.value) || 0)}
                  className="points-input"
                />
              </span>
              <span className="srt-col-sport">
                <span className={`sport-badge sport-${rule.sport}`}>{rule.sport}</span>
              </span>
              <span className="srt-col-actions">
                <button className="icon-btn danger" onClick={() => deleteRule(rule.id)} title="Delete rule">
                  <Trash2 size={14} />
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}