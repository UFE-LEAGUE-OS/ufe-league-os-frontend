import { useState } from "react";
import "../../../styles/pages/super-admin/sponsorship-management/sponsorshipManagement.css";

type Sport = "Football" | "Basketball" | "Rugby";

interface SplitPolicy {
    league: number;
    club: number;
    player: number;
    updatedAt: string;
}

const SPORTS: Sport[] = ["Football", "Basketball", "Rugby"];

const DEFAULT_POLICIES: Record<Sport, SplitPolicy> = {
    Football: { league: 50, club: 30, player: 20, updatedAt: "Jul 08, 2026" },
    Basketball: { league: 45, club: 35, player: 20, updatedAt: "Jul 02, 2026" },
    Rugby: { league: 55, club: 30, player: 15, updatedAt: "Jun 24, 2026" },
};

export default function BenefitSharing() {

    const [policies, setPolicies] = useState<Record<Sport, SplitPolicy>>(DEFAULT_POLICIES);
    const [selectedSport, setSelectedSport] = useState<Sport>("Football");

    const [leagueInput, setLeagueInput] = useState(String(DEFAULT_POLICIES.Football.league));
    const [clubInput, setClubInput] = useState(String(DEFAULT_POLICIES.Football.club));
    const [playerInput, setPlayerInput] = useState(String(DEFAULT_POLICIES.Football.player));

    const handleSportChange = (sport: Sport) => {
        setSelectedSport(sport);
        setLeagueInput(String(policies[sport].league));
        setClubInput(String(policies[sport].club));
        setPlayerInput(String(policies[sport].player));
    };

    const league = Number(leagueInput) || 0;
    const club = Number(clubInput) || 0;
    const player = Number(playerInput) || 0;
    const total = league + club + player;
    const isValid =
        total === 100 &&
        league >= 0 &&
        club >= 0 &&
        player >= 0;

    const handleUpdate = () => {
        if (!isValid) return;
        setPolicies({
            ...policies,
            [selectedSport]: { league, club, player, updatedAt: "Today" },
        });
    };

    const savedPolicy = policies[selectedSport];

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <span className="page-eyebrow">Sponsorship Management</span>
                    <h1>Benefit Sharing Policy</h1>
                    <p>Define how sponsorship revenue is split between leagues, clubs, and players.</p>
                </div>
            </div>

            <div className="stats-grid">

                <div className="stat-card">
                    <div>
                        <span className="stat-label">
                            Total Policies
                        </span>
                        <span className="stat-value">
                            {SPORTS.length}
                        </span>
                    </div>
                </div>


                <div className="stat-card">
                    <div>
                        <span className="stat-label">
                            Active Policies
                        </span>
                        <span className="stat-value">
                            {SPORTS.length}
                        </span>
                    </div>
                </div>


                <div className="stat-card">
                    <div>
                        <span className="stat-label">
                            Last Updated
                        </span>
                        <span className="stat-value">
                            {savedPolicy.updatedAt}
                        </span>
                    </div>
                </div>

            </div>

            <div className="field-group sport-select-group">
                <label>Sport</label>
                <div className="segmented">
                    {SPORTS.map((sport) => (
                        <button
                            key={sport}
                            type="button"
                            className={`segmented__option ${selectedSport === sport ? "is-active" : ""}`}
                            onClick={() => handleSportChange(sport)}
                        >
                            {sport}
                        </button>
                    ))}
                </div>
            </div>

            <div className="benefit-layout">

                <div className="card">
                    <div className="card-header">
                        <h2>{selectedSport} Revenue Split</h2>
                        <p>Percentages must add up to exactly 100%.</p>
                    </div>

                    <div className="field-group">
                        <label htmlFor="league">League Percentage</label>
                        <div className="percent-field">
                            <input
                                id="league"
                                type="number"
                                min={0}
                                max={100}
                                value={leagueInput}
                                onChange={(e) => setLeagueInput(e.target.value)}
                            />
                            <span className="percent-suffix">%</span>
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="club">Club Percentage</label>
                        <div className="percent-field">
                            <input
                                id="club"
                                type="number"
                                min={0}
                                max={100}
                                value={clubInput}
                                onChange={(e) => setClubInput(e.target.value)}
                            />
                            <span className="percent-suffix">%</span>
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="player">Player Percentage</label>
                        <div className="percent-field">
                            <input
                                id="player"
                                type="number"
                                min={0}
                                max={100}
                                value={playerInput}
                                onChange={(e) => setPlayerInput(e.target.value)}
                            />
                            <span className="percent-suffix">%</span>
                        </div>
                    </div>

                    <div className={`total-row ${isValid ? "is-valid" : "is-invalid"}`}>
                        <span>Total Allocation</span>
                        <span className="total-value">{total}%</span>
                    </div>

                    {!isValid && (
                        <p className="validation-message">
                            Allocation must total 100%. Currently {total}%.
                        </p>
                    )}

                    <button className="primary-btn" onClick={handleUpdate} disabled={!isValid}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                            <path d="M17 21v-8H7v8M7 3v5h8" />
                        </svg>
                        Update Policy
                    </button>
                </div>

                <div className="card summary-card">
                    <div className="card-header">
                        <h2>Current Split</h2>
                        <p>Last saved allocation for {selectedSport}.</p>
                    </div>

                    <div className="split-bar">
                        <div className="split-bar__segment split-bar__segment--league" style={{ width: `${savedPolicy.league}%` }} />
                        <div className="split-bar__segment split-bar__segment--club" style={{ width: `${savedPolicy.club}%` }} />
                        <div className="split-bar__segment split-bar__segment--player" style={{ width: `${savedPolicy.player}%` }} />
                    </div>

                    <div className="split-legend">
                        <div className="split-legend__item">
                            <span className="split-legend__dot split-legend__dot--league" />
                            <span>League</span>
                            <span className="split-legend__value">{savedPolicy.league}%</span>
                        </div>
                        <div className="split-legend__item">
                            <span className="split-legend__dot split-legend__dot--club" />
                            <span>Club</span>
                            <span className="split-legend__value">{savedPolicy.club}%</span>
                        </div>
                        <div className="split-legend__item">
                            <span className="split-legend__dot split-legend__dot--player" />
                            <span>Player</span>
                            <span className="split-legend__value">{savedPolicy.player}%</span>
                        </div>
                    </div>

                    <span className="last-updated">Last updated {savedPolicy.updatedAt}</span>
                </div>

            </div>

            <div className="table-card">
                <div className="table-card__header">
                    <h2>All Sport Policies</h2>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Sport</th>
                            <th>League</th>
                            <th>Club</th>
                            <th>Player</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                        </tr>
                    </thead>
                    <tbody>
                        {SPORTS.map((sport) => (
                            <tr key={sport}>
                                <td>
                                    <span className="sport-tag">{sport}</span>
                                </td>
                                <td>{policies[sport].league}%</td>
                                <td>{policies[sport].club}%</td>
                                <td>{policies[sport].player}%</td>
                                <td>
                                    <span className="badge badge--active">
                                        <span className="badge-dot" />
                                        Active
                                    </span>
                                </td>
                                <td className="muted-cell">{policies[sport].updatedAt}</td>
                                
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
