import { useState } from "react";
import { Save, ArrowLeft, Calendar, Plus, Trash2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Season = {
  id: string;
  name: string;
  sport: string;
  startDate: string;
  endDate: string;
  totalGameweeks: number;
  status: "upcoming" | "active" | "completed";
};

type Gameweek = {
  id: string;
  seasonId: string;
  number: number;
  label: string;
  deadline: string;
  status: "pending" | "open" | "locked" | "scored";
};

const DEFAULT_SEASONS: Season[] = [
  { id: "s1", name: "2026 Season", sport: "Football", startDate: "2026-01-15", endDate: "2026-06-30", totalGameweeks: 26, status: "active" },
  { id: "s2", name: "2026 Season", sport: "Basketball", startDate: "2026-02-01", endDate: "2026-07-31", totalGameweeks: 22, status: "active" },
  { id: "s3", name: "2026 Season", sport: "Rugby", startDate: "2026-03-01", endDate: "2026-09-30", totalGameweeks: 18, status: "upcoming" },
];

const GW_EXAMPLES: Gameweek[] = [
  { id: "gw1", seasonId: "s1", number: 1, label: "Matchweek 1", deadline: "2026-01-15T18:00", status: "scored" },
  { id: "gw2", seasonId: "s1", number: 2, label: "Matchweek 2", deadline: "2026-01-22T18:00", status: "scored" },
  { id: "gw3", seasonId: "s1", number: 3, label: "Matchweek 3", deadline: "2026-01-29T18:00", status: "open" },
  { id: "gw4", seasonId: "s1", number: 4, label: "Matchweek 4", deadline: "2026-02-05T18:00", status: "pending" },
  { id: "gw5", seasonId: "s1", number: 5, label: "Matchweek 5", deadline: "2026-02-12T18:00", status: "pending" },
];

export default function SeasonGameweekSettings() {
  const navigate = useNavigate();
  const [seasons, setSeasons] = useState<Season[]>(DEFAULT_SEASONS);
  const [gameweeks, setGameweeks] = useState<Gameweek[]>(GW_EXAMPLES);
  const [selectedSeason, setSelectedSeason] = useState<string>("s1");
  const [showAddSeason, setShowAddSeason] = useState(false);
  const [saved, setSaved] = useState(false);

  const [newSeason, setNewSeason] = useState({
    name: "",
    sport: "Football",
    startDate: "",
    endDate: "",
    totalGameweeks: 20,
  });

  const filteredGWs = gameweeks.filter((gw) => gw.seasonId === selectedSeason);
  const currentSeason = seasons.find((s) => s.id === selectedSeason);

  const addSeason = () => {
    if (!newSeason.name.trim() || !newSeason.startDate || !newSeason.endDate) return;
    const season: Season = {
      id: `season-${Date.now()}`,
      name: newSeason.name.trim(),
      sport: newSeason.sport,
      startDate: newSeason.startDate,
      endDate: newSeason.endDate,
      totalGameweeks: newSeason.totalGameweeks,
      status: "upcoming",
    };
    setSeasons((prev) => [...prev, season]);
    setShowAddSeason(false);
    setNewSeason({ name: "", sport: "Football", startDate: "", endDate: "", totalGameweeks: 20 });
  };

  const deleteSeason = (id: string) => {
    setSeasons((prev) => prev.filter((s) => s.id !== id));
    setGameweeks((prev) => prev.filter((gw) => gw.seasonId !== id));
    if (selectedSeason === id) setSelectedSeason(seasons[0]?.id || "");
  };



  const addGameweek = () => {
    const season = seasons.find((s) => s.id === selectedSeason);
    if (!season) return;
    const existing = filteredGWs;
    const nextNum = existing.length + 1;
    const newGW: Gameweek = {
      id: `gw-${Date.now()}`,
      seasonId: selectedSeason,
      number: nextNum,
      label: `Matchweek ${nextNum}`,
      deadline: "",
      status: "pending",
    };
    setGameweeks((prev) => [...prev, newGW]);
  };

  const updateGW = (id: string, field: keyof Gameweek, value: string | number) => {
    setGameweeks((prev) =>
      prev.map((gw) => (gw.id === id ? { ...gw, [field]: value } : gw))
    );
  };

  const deleteGW = (id: string) => {
    setGameweeks((prev) => prev.filter((gw) => gw.id !== id));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "var(--green)";
      case "upcoming": return "var(--amber)";
      case "completed": return "var(--muted)";
      case "open": return "var(--green)";
      case "locked": return "var(--purple)";
      case "scored": return "var(--muted)";
      default: return "var(--muted)";
    }
  };

  return (
    <div className="fantasy-sub-page">
      <div className="fantasy-sub-header">
        <button className="back-btn" onClick={() => navigate("/dashboard/super-admin/fantasy-config")}>
          <ArrowLeft size={16} />
          Back to Fantasy Config
        </button>
        <div>
          <h2>Season & Gameweek Settings</h2>
          <p className="governance-subtitle">
            Manage fantasy seasons and configure gameweek deadlines, statuses, and scheduling
          </p>
        </div>
      </div>

      {/* Seasons panel */}
      <div className="panel">
        <div className="panel-header">
          <h3><Calendar size={16} /> Seasons ({seasons.length})</h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {!showAddSeason && (
              <button className="action-btn" onClick={() => setShowAddSeason(true)}>
                <Plus size={16} /> Add Season
              </button>
            )}
            <button className="action-btn primary" onClick={handleSave}>
              <Save size={16} /> {saved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {showAddSeason && (
          <div className="add-mapping-form">
            <div className="add-mapping-grid">
              <div className="config-field">
                <label>Season Name</label>
                <input type="text" placeholder="e.g. 2026 Season" value={newSeason.name} onChange={(e) => setNewSeason((p) => ({ ...p, name: e.target.value }))} className="fantasy-input" />
              </div>
              <div className="config-field">
                <label>Sport</label>
                <select value={newSeason.sport} onChange={(e) => setNewSeason((p) => ({ ...p, sport: e.target.value }))} className="fantasy-select">
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Rugby">Rugby</option>
                </select>
              </div>
              <div className="config-field">
                <label>Start Date</label>
                <input type="date" value={newSeason.startDate} onChange={(e) => setNewSeason((p) => ({ ...p, startDate: e.target.value }))} className="fantasy-input" />
              </div>
              <div className="config-field">
                <label>End Date</label>
                <input type="date" value={newSeason.endDate} onChange={(e) => setNewSeason((p) => ({ ...p, endDate: e.target.value }))} className="fantasy-input" />
              </div>
              <div className="config-field">
                <label>Total Gameweeks</label>
                <input type="number" min={1} max={50} value={newSeason.totalGameweeks} onChange={(e) => setNewSeason((p) => ({ ...p, totalGameweeks: parseInt(e.target.value) || 1 }))} className="fantasy-input fantasy-input-narrow" />
              </div>
            </div>
            <div className="add-mapping-actions">
              <button className="action-btn primary" onClick={addSeason}><Plus size={16} /> Create Season</button>
              <button className="action-btn subtle" onClick={() => setShowAddSeason(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="seasons-grid">
          {seasons.map((season) => (
            <div
              key={season.id}
              className={`season-card ${selectedSeason === season.id ? "selected" : ""}`}
              onClick={() => setSelectedSeason(season.id)}
            >
              <div className="season-card-top">
                <strong>{season.name}</strong>
                <span className="season-sport">{season.sport}</span>
              </div>
              <div className="season-card-dates">
                <span>{season.startDate}</span> → <span>{season.endDate}</span>
              </div>
              <div className="season-card-bottom">
                <span className="season-gw-count">{season.totalGameweeks} GWs</span>
                <span className="season-status" style={{ color: statusColor(season.status) }}>
                  {season.status}
                </span>
              </div>
              <button className="icon-btn danger season-delete" onClick={(e) => { e.stopPropagation(); deleteSeason(season.id); }} title="Delete season">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gameweeks panel */}
      <div className="panel">
        <div className="panel-header">
          <h3><Clock size={16} /> Gameweeks for {currentSeason?.name || "..."} ({filteredGWs.length}/{currentSeason?.totalGameweeks || 0})</h3>
          <button className="action-btn" onClick={addGameweek}>
            <Plus size={16} /> Add Gameweek
          </button>
        </div>

        <div className="gameweeks-table">
          <div className="gw-header">
            <span>#</span>
            <span>Label</span>
            <span>Deadline</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filteredGWs.map((gw) => (
            <div key={gw.id} className="gw-row">
              <span className="gw-number">{gw.number}</span>
              <span>
                <input
                  type="text"
                  value={gw.label}
                  onChange={(e) => updateGW(gw.id, "label", e.target.value)}
                  className="fantasy-input"
                />
              </span>
              <span>
                <input
                  type="datetime-local"
                  value={gw.deadline}
                  onChange={(e) => updateGW(gw.id, "deadline", e.target.value)}
                  className="fantasy-input"
                />
              </span>
              <span>
                <select
                  value={gw.status}
                  onChange={(e) => updateGW(gw.id, "status", e.target.value)}
                  className="fantasy-select"
                  style={{ color: statusColor(gw.status) }}
                >
                  <option value="pending">Pending</option>
                  <option value="open">Open</option>
                  <option value="locked">Locked</option>
                  <option value="scored">Scored</option>
                </select>
              </span>
              <span>
                <button className="icon-btn danger" onClick={() => deleteGW(gw.id)} title="Delete gameweek">
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