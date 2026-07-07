import { useState } from "react";
import {
  UserCheck,
  Save,
  ArrowLeft,
  Users,
  Globe,
  Shield,
  Ban,
  Calendar,
  Hash,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../../styles/pages/SuperAdminDashboard.css";

type EligibilityRule = {
  minAge: number;
  maxAge: number;
  nationalityRestriction: string;
  playerStatus: string[];
  maxForeignPlayers: number;
  minClubTrained: number;
  maxLoanPlayers: number;
  registrationDeadlineDays: number;
  allowYouthPlayers: boolean;
  youthMinAge: number;
};

type RosterRule = {
  minSquadSize: number;
  maxSquadSize: number;
  minStartingXI: number;
  maxSubs: number;
  minDefenders: number;
  minMidfielders: number;
  minForwards: number;
  maxFromOneClub: number;
  captainMandatory: boolean;
  viceCaptainAllowed: boolean;
  formationRestrictions: string[];
};

type Sport = "Global" | "Football" | "Basketball" | "Rugby";

export default function EligibilityRosterRules() {
  const navigate = useNavigate();
  const [activeSport, setActiveSport] = useState<Sport>("Global");
  const [saved, setSaved] = useState(false);

  const [eligibility, setEligibility] = useState<EligibilityRule>({
    minAge: 16,
    maxAge: 40,
    nationalityRestriction: "none",
    playerStatus: ["registered", "active"],
    maxForeignPlayers: 5,
    minClubTrained: 3,
    maxLoanPlayers: 2,
    registrationDeadlineDays: 14,
    allowYouthPlayers: true,
    youthMinAge: 14,
  });

  const [roster, setRoster] = useState<RosterRule>({
    minSquadSize: 15,
    maxSquadSize: 25,
    minStartingXI: 11,
    maxSubs: 7,
    minDefenders: 3,
    minMidfielders: 3,
    minForwards: 1,
    maxFromOneClub: 3,
    captainMandatory: true,
    viceCaptainAllowed: true,
    formationRestrictions: ["4-4-2", "4-3-3", "3-5-2", "4-2-3-1"],
  });

  const SPORTS: Sport[] = ["Global", "Football", "Basketball", "Rugby"];

  const updateEligibility = <K extends keyof EligibilityRule>(
    key: K,
    value: EligibilityRule[K]
  ) => {
    setEligibility((prev) => ({ ...prev, [key]: value }));
  };

  const updateRoster = <K extends keyof RosterRule>(
    key: K,
    value: RosterRule[K]
  ) => {
    setRoster((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (
    arr: string[],
    item: string,
    setter: (val: string[]) => void
  ) => {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fantasy-sub-page">
      <div className="fantasy-sub-header">
        <button
          className="back-btn"
          onClick={() => navigate("..")}
        >
          <ArrowLeft size={16} />
          Back to Fantasy Config
        </button>
        <div>
          <h2>Eligibility & Roster Rules</h2>
          <p className="governance-subtitle">
            Configure player eligibility criteria, squad size limits, position
            requirements, and formation rules per sport
          </p>
        </div>
      </div>

      {/* Sport Scope Tabs */}
      <div className="sport-tabs" style={{ marginBottom: "1.5rem" }}>
        {SPORTS.map((sport) => (
          <button
            key={sport}
            className={`sport-tab ${activeSport === sport ? "active" : ""}`}
            onClick={() => setActiveSport(sport)}
          >
            {sport}
          </button>
        ))}
      </div>

      <div className="transfer-rules-grid">
        {/* ── Eligibility Rules ── */}
        <div className="panel">
          <div className="panel-header">
            <h3>
              <UserCheck size={16} /> Player Eligibility
            </h3>
          </div>
          <div className="config-field-list config-field-list--horizontal">
            <div className="config-field">
              <label>Minimum age</label>
              <input
                type="number"
                min={0}
                value={eligibility.minAge}
                onChange={(e) =>
                  updateEligibility("minAge", parseInt(e.target.value) || 0)
                }
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Maximum age</label>
              <input
                type="number"
                min={0}
                value={eligibility.maxAge}
                onChange={(e) =>
                  updateEligibility("maxAge", parseInt(e.target.value) || 0)
                }
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Nationality restriction</label>
              <select
                value={eligibility.nationalityRestriction}
                onChange={(e) =>
                  updateEligibility("nationalityRestriction", e.target.value)
                }
                className="fantasy-select"
              >
                <option value="none">None (open to all)</option>
                <option value="local">Local players only</option>
                <option value="regional">Regional (EAC)</option>
                <option value="continental">Continental (Africa)</option>
              </select>
            </div>
            <div className="config-field">
              <label>Max foreign players</label>
              <input
                type="number"
                min={0}
                value={eligibility.maxForeignPlayers}
                onChange={(e) =>
                  updateEligibility(
                    "maxForeignPlayers",
                    parseInt(e.target.value) || 0
                  )
                }
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Min club-trained players</label>
              <input
                type="number"
                min={0}
                value={eligibility.minClubTrained}
                onChange={(e) =>
                  updateEligibility(
                    "minClubTrained",
                    parseInt(e.target.value) || 0
                  )
                }
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Max loan players</label>
              <input
                type="number"
                min={0}
                value={eligibility.maxLoanPlayers}
                onChange={(e) =>
                  updateEligibility(
                    "maxLoanPlayers",
                    parseInt(e.target.value) || 0
                  )
                }
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Registration deadline (days before season)</label>
              <input
                type="number"
                min={0}
                value={eligibility.registrationDeadlineDays}
                onChange={(e) =>
                  updateEligibility(
                    "registrationDeadlineDays",
                    parseInt(e.target.value) || 0
                  )
                }
                className="fantasy-input"
              />
            </div>
            <div className="config-field toggle-field">
              <label>Allow youth players</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={eligibility.allowYouthPlayers}
                  onChange={(e) =>
                    updateEligibility("allowYouthPlayers", e.target.checked)
                  }
                />
                <span className="toggle-slider" />
              </label>
            </div>
            {eligibility.allowYouthPlayers && (
              <div className="config-field">
                <label>Youth minimum age</label>
                <input
                  type="number"
                  min={0}
                  value={eligibility.youthMinAge}
                  onChange={(e) =>
                    updateEligibility(
                      "youthMinAge",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="fantasy-input"
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Player Status ── */}
        <div className="panel" style={{ gridColumn: "1 / -1" }}>
          <div className="panel-header">
            <h3>
              <Shield size={16} /> Player Status Requirements
            </h3>
          </div>
          <div className="config-field-list">
            <div className="config-field">
              <label>Required player statuses</label>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.75rem 1.5rem",
                  marginTop: "0.5rem",
                }}
              >
                {["registered", "active", "fit", "cleared", "certified"].map(
                  (status) => (
                    <label
                      key={status}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        color: "#c8ccd4",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={eligibility.playerStatus.includes(status)}
                        onChange={() =>
                          toggleArrayItem(
                            eligibility.playerStatus,
                            status,
                            (val) => updateEligibility("playerStatus", val)
                          )
                        }
                        style={{
                          accentColor: "#6366f1",
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                        }}
                      />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </label>
                  )
                )}
              </div>
            </div>

            <div
              className="config-field"
              style={{ borderTop: "1px solid var(--border, #2a2f3a)", paddingTop: "1rem" }}
            >
              <label>Current status restrictions for {activeSport}</label>
              <div className="info-card">
                <span className="info-icon">
                  <Globe size={14} />
                </span>
                <span>
                  Eligibility rules for <strong>{activeSport}</strong> apply to
                  all fantasy leagues under this sport variant.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Squad Size Limits ── */}
        <div className="panel">
          <div className="panel-header">
            <h3>
              <Users size={16} /> Squad Size Limits
            </h3>
          </div>
          <div className="config-field-list">
            <div className="config-field">
              <label>Minimum squad size</label>
              <input
                type="number"
                min={0}
                value={roster.minSquadSize}
                onChange={(e) =>
                  updateRoster("minSquadSize", parseInt(e.target.value) || 0)
                }
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Maximum squad size</label>
              <input
                type="number"
                min={0}
                value={roster.maxSquadSize}
                onChange={(e) =>
                  updateRoster("maxSquadSize", parseInt(e.target.value) || 0)
                }
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Minimum starting XI</label>
              <input
                type="number"
                min={0}
                value={roster.minStartingXI}
                onChange={(e) =>
                  updateRoster("minStartingXI", parseInt(e.target.value) || 0)
                }
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Maximum substitutes</label>
              <input
                type="number"
                min={0}
                value={roster.maxSubs}
                onChange={(e) =>
                  updateRoster("maxSubs", parseInt(e.target.value) || 0)
                }
                className="fantasy-input"
              />
            </div>
          </div>
        </div>

        {/* ── Position Requirements ── */}
        <div className="panel">
          <div className="panel-header">
            <h3>
              <Hash size={16} /> Position Requirements
            </h3>
          </div>
          <div className="config-field-list">
            <div className="config-field">
              <label>Minimum defenders</label>
              <input
                type="number"
                min={0}
                value={roster.minDefenders}
                onChange={(e) =>
                  updateRoster("minDefenders", parseInt(e.target.value) || 0)
                }
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Minimum midfielders</label>
              <input
                type="number"
                min={0}
                value={roster.minMidfielders}
                onChange={(e) =>
                  updateRoster("minMidfielders", parseInt(e.target.value) || 0)
                }
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Minimum forwards</label>
              <input
                type="number"
                min={0}
                value={roster.minForwards}
                onChange={(e) =>
                  updateRoster("minForwards", parseInt(e.target.value) || 0)
                }
                className="fantasy-input"
              />
            </div>
            <div className="config-field">
              <label>Max players from one club</label>
              <input
                type="number"
                min={0}
                value={roster.maxFromOneClub}
                onChange={(e) =>
                  updateRoster("maxFromOneClub", parseInt(e.target.value) || 0)
                }
                className="fantasy-input"
              />
            </div>
          </div>
        </div>

        {/* ── Captain & Formation ── */}
        <div className="panel">
          <div className="panel-header">
            <h3>
              <Ban size={16} /> Captain & Formation Rules
            </h3>
          </div>
          <div className="config-field-list">
            <div className="config-field toggle-field">
              <label>Captain mandatory</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={roster.captainMandatory}
                  onChange={(e) =>
                    updateRoster("captainMandatory", e.target.checked)
                  }
                />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="config-field toggle-field">
              <label>Vice-captain allowed</label>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={roster.viceCaptainAllowed}
                  onChange={(e) =>
                    updateRoster("viceCaptainAllowed", e.target.checked)
                  }
                />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="config-field">
              <label>Allowed formations</label>
              <div className="checkbox-group">
                {["4-4-2", "4-3-3", "3-5-2", "4-2-3-1", "3-4-3", "5-3-2", "4-5-1"].map(
                  (formation) => (
                    <label key={formation} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={roster.formationRestrictions.includes(formation)}
                        onChange={() =>
                          toggleArrayItem(
                            roster.formationRestrictions,
                            formation,
                            (val) => updateRoster("formationRestrictions", val)
                          )
                        }
                      />
                      <span className="checkbox-text">{formation}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Registration Timeline ── */}
        <div className="panel">
          <div className="panel-header">
            <h3>
              <Calendar size={16} /> Registration Timeline
            </h3>
          </div>
          <div className="config-field-list">
            <div className="info-card">
              <span className="info-icon">
                <Calendar size={14} />
              </span>
              <span>
                Registration deadline is set to{" "}
                <strong>{eligibility.registrationDeadlineDays} days</strong>{" "}
                before season start. Youth players from age{" "}
                <strong>{eligibility.youthMinAge}</strong> are{" "}
                {eligibility.allowYouthPlayers ? "allowed" : "not allowed"}.
              </span>
            </div>
            <div className="info-card">
              <span className="info-icon">
                <Globe size={14} />
              </span>
              <span>
                These rules apply to <strong>{activeSport}</strong> scope.
                Switch tabs above to configure rules for other sports.
              </span>
            </div>
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