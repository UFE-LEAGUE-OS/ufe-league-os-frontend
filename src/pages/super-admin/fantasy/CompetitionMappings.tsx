import { useState } from "react";
import { Save, ArrowLeft, GitBranch, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

type FantasyCompetition = {
  id: string;
  fantasyLeagueName: string;
  realCompetition: string;
  sport: string;
  season: string;
  gameweekMapping: "auto" | "manual";
  status: "active" | "inactive";
};

const DEFAULT_COMPETITIONS: FantasyCompetition[] = [
  { id: "1", fantasyLeagueName: "UPL Fantasy", realCompetition: "Uganda Premier League", sport: "Football", season: "2026", gameweekMapping: "auto", status: "active" },
  { id: "2", fantasyLeagueName: "NBL Fantasy", realCompetition: "National Basketball League", sport: "Basketball", season: "2026", gameweekMapping: "auto", status: "active" },
  { id: "3", fantasyLeagueName: "Nile Special Rugby", realCompetition: "Nile Special Premiership", sport: "Rugby", season: "2026", gameweekMapping: "manual", status: "active" },
  { id: "4", fantasyLeagueName: "Budo League Fantasy", realCompetition: "Budo League", sport: "Football", season: "2026", gameweekMapping: "auto", status: "inactive" },
];

const REAL_COMPETITIONS = [
  "Uganda Premier League",
  "National Basketball League",
  "Nile Special Premiership",
  "Budo League",
  "Smack League",
  "FUFA Women's Super League",
  "Uganda Cup",
  "East Africa Cup",
];

const SPORTS = ["Football", "Basketball", "Rugby"];

export default function CompetitionMappings() {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState<FantasyCompetition[]>(DEFAULT_COMPETITIONS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<FantasyCompetition>>({
    fantasyLeagueName: "",
    realCompetition: REAL_COMPETITIONS[0],
    sport: "Football",
    season: "2026",
    gameweekMapping: "auto",
    status: "active",
  });
  const [saved, setSaved] = useState(false);

  const updateRow = (id: string, field: keyof FantasyCompetition, value: string) => {
    setCompetitions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const deleteRow = (id: string) => {
    setCompetitions((prev) => prev.filter((c) => c.id !== id));
  };

  const addCompetition = () => {
    if (!newEntry.fantasyLeagueName?.trim()) return;
    const entry: FantasyCompetition = {
      id: `comp-${Date.now()}`,
      fantasyLeagueName: newEntry.fantasyLeagueName!.trim(),
      realCompetition: newEntry.realCompetition || REAL_COMPETITIONS[0],
      sport: newEntry.sport || "Football",
      season: newEntry.season || "2026",
      gameweekMapping: newEntry.gameweekMapping || "auto",
      status: newEntry.status || "active",
    };
    setCompetitions((prev) => [...prev, entry]);
    setShowAddForm(false);
    setNewEntry({
      fantasyLeagueName: "",
      realCompetition: REAL_COMPETITIONS[0],
      sport: "Football",
      season: "2026",
      gameweekMapping: "auto",
      status: "active",
    });
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
          <h2>Competition Mappings</h2>
          <p className="governance-subtitle">
            Map fantasy leagues to real-world competitions, configure gameweek alignment and season links
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3><GitBranch size={16} /> Mapped Competitions ({competitions.length})</h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {!showAddForm && (
              <button className="action-btn" onClick={() => setShowAddForm(true)}>
                <Plus size={16} /> Add Mapping
              </button>
            )}
            <button className="action-btn primary" onClick={handleSave}>
              <Save size={16} /> {saved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="add-mapping-form">
            <div className="add-mapping-grid">
              <div className="config-field">
                <label>Fantasy League Name</label>
                <input
                  type="text"
                  placeholder="e.g. UPL Fantasy"
                  value={newEntry.fantasyLeagueName || ""}
                  onChange={(e) => setNewEntry((p) => ({ ...p, fantasyLeagueName: e.target.value }))}
                  className="fantasy-input"
                />
              </div>
              <div className="config-field">
                <label>Real Competition</label>
                <select
                  value={newEntry.realCompetition || ""}
                  onChange={(e) => setNewEntry((p) => ({ ...p, realCompetition: e.target.value }))}
                  className="fantasy-select"
                >
                  {REAL_COMPETITIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="config-field">
                <label>Sport</label>
                <select
                  value={newEntry.sport || "Football"}
                  onChange={(e) => setNewEntry((p) => ({ ...p, sport: e.target.value }))}
                  className="fantasy-select"
                >
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="config-field">
                <label>Season</label>
                <input
                  type="text"
                  value={newEntry.season || ""}
                  onChange={(e) => setNewEntry((p) => ({ ...p, season: e.target.value }))}
                  className="fantasy-input"
                  placeholder="e.g. 2026"
                />
              </div>
              <div className="config-field">
                <label>Gameweek Mapping</label>
                <select
                  value={newEntry.gameweekMapping || "auto"}
                  onChange={(e) => setNewEntry((p) => ({ ...p, gameweekMapping: e.target.value as "auto" | "manual" }))}
                  className="fantasy-select"
                >
                  <option value="auto">Auto (sync with real fixtures)</option>
                  <option value="manual">Manual (admin assigns)</option>
                </select>
              </div>
              <div className="config-field">
                <label>Status</label>
                <select
                  value={newEntry.status || "active"}
                  onChange={(e) => setNewEntry((p) => ({ ...p, status: e.target.value as "active" | "inactive" }))}
                  className="fantasy-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="add-mapping-actions">
              <button className="action-btn primary" onClick={addCompetition}>
                <Plus size={16} /> Add Competition
              </button>
              <button className="action-btn subtle" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Mappings table */}
        <div className="mapping-table">
          <div className="mapping-header">
            <span>Fantasy League</span>
            <span>Real Competition</span>
            <span>Sport</span>
            <span>Season</span>
            <span>GW Mapping</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {competitions.map((comp) => (
            <div key={comp.id} className={`mapping-row ${comp.status === "inactive" ? "disabled" : ""}`}>
              <span>
                <input
                  type="text"
                  value={comp.fantasyLeagueName}
                  onChange={(e) => updateRow(comp.id, "fantasyLeagueName", e.target.value)}
                  className="fantasy-input"
                />
              </span>
              <span>
                <select
                  value={comp.realCompetition}
                  onChange={(e) => updateRow(comp.id, "realCompetition", e.target.value)}
                  className="fantasy-select"
                >
                  {REAL_COMPETITIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </span>
              <span>
                <select
                  value={comp.sport}
                  onChange={(e) => updateRow(comp.id, "sport", e.target.value)}
                  className="fantasy-select"
                >
                  {SPORTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </span>
              <span>
                <input
                  type="text"
                  value={comp.season}
                  onChange={(e) => updateRow(comp.id, "season", e.target.value)}
                  className="fantasy-input fantasy-input-narrow"
                />
              </span>
              <span>
                <select
                  value={comp.gameweekMapping}
                  onChange={(e) => updateRow(comp.id, "gameweekMapping", e.target.value)}
                  className="fantasy-select"
                >
                  <option value="auto">Auto</option>
                  <option value="manual">Manual</option>
                </select>
              </span>
              <span>
                <select
                  value={comp.status}
                  onChange={(e) => updateRow(comp.id, "status", e.target.value)}
                  className="fantasy-select"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </span>
              <span>
                <button className="icon-btn danger" onClick={() => deleteRow(comp.id)} title="Remove mapping">
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