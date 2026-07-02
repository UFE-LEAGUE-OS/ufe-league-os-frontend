import "../styles/pages/JoinFantasy.css"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import ctaBanner from "../assets/cta-banner.png"

type Sport = "football" | "basketball" | "rugby";

type Player = {
  id: number;
  name: string;
  position: string;
  points: number;
  price: number;
};

type RivalManager = {
  manager: string;
  team: string;
  points: number;
};

export default function JoinFantasy() {
  const navigate = useNavigate();

  // ---------------- SPORT ----------------
  const [sport, setSport] = useState<Sport>("football");
  const [activeTab, setActiveTab] = useState("Transfers");
  const [search, setSearch] = useState("");

  // ---------------- FANTASY STATE ----------------
  const [team, setTeam] = useState<number[]>([]);
  const [startingXI, setStartingXI] = useState<number[]>([]);
  const [bench, setBench] = useState<number[]>([]);
  const [captain, setCaptain] = useState<number | null>(null);

  // ---------------- RULES ----------------
  const sportRules: Record<Sport, { budget: number }> = {
    football: { budget: 1000 },
    basketball: { budget: 1200 },
    rugby: { budget: 1100 },
  };

  // Starting-lineup slots per position, ordered top-of-pitch to bottom.
  // Counts are sized to the sample player pool below.
  const positionConfig: Record<
    Sport,
    { order: string[]; starters: Record<string, number> }
  > = {
    football: {
      order: ["FWD", "MID", "DEF", "GK"],
      starters: { FWD: 1, MID: 2, DEF: 1, GK: 1 },
    },
    basketball: {
      order: ["C", "PF", "SF", "SG", "PG"],
      starters: { C: 1, PF: 1, SF: 1, SG: 1, PG: 1 },
    },
    rugby: {
      order: ["BACK", "FLYHALF", "SCRUMHALF", "FORWARD"],
      starters: { BACK: 1, FLYHALF: 1, SCRUMHALF: 1, FORWARD: 1 },
    },
  };

  const [budget, setBudget] = useState(sportRules[sport].budget);

  const changeSport = (newSport: Sport) => {
    setSport(newSport);
    setTeam([]);
    setStartingXI([]);
    setBench([]);
    setCaptain(null);
    setBudget(sportRules[newSport].budget);
  };

  // ---------------- PLAYERS ----------------
  const allPlayers: Record<Sport, Player[]> = {
    football: [
      { id: 1, name: "Allan Okello", position: "MID", points: 92, price: 140 },
      { id: 2, name: "Emmanuel Okwi", position: "FWD", points: 88, price: 160 },
      { id: 3, name: "Timothy Awany", position: "DEF", points: 80, price: 120 },
      { id: 4, name: "Charles Lukwago", position: "GK", points: 85, price: 110 },
      { id: 13, name: "Paul Mucureezi", position: "MID", points: 78, price: 100 },
      { id: 14, name: "Shafik Kagimu", position: "MID", points: 75, price: 95 },
    ],
    basketball: [
      { id: 5, name: "John Mukiibi", position: "PG", points: 98, price: 220 },
      { id: 6, name: "Ivan Lumanyika", position: "C", points: 95, price: 240 },
      { id: 7, name: "Jimmy Enabu", position: "SG", points: 90, price: 200 },
      { id: 8, name: "Arthur Kaluma", position: "SF", points: 97, price: 230 },
      { id: 15, name: "Tonny Drileba", position: "PF", points: 89, price: 190 },
    ],
    rugby: [
      { id: 9, name: "Philip Wokorach", position: "BACK", points: 96, price: 210 },
      { id: 10, name: "Alex Aturinda", position: "FLYHALF", points: 89, price: 180 },
      { id: 11, name: "Ivan Magomu", position: "SCRUMHALF", points: 91, price: 190 },
      { id: 12, name: "Edgar Lutaaya", position: "FORWARD", points: 87, price: 170 },
    ],
  };

  // Other managers in your mini-league, used on the Rankings tab.
  const rivalManagers: Record<Sport, RivalManager[]> = {
    football: [
      { manager: "Brian Ssali", team: "Kibuli Kings", points: 71 },
      { manager: "Doreen Namatovu", team: "Nakawa United XI", points: 64 },
      { manager: "Hassan Mbowa", team: "Jinja Road Rovers", points: 58 },
    ],
    basketball: [
      { manager: "Grace Nansubuga", team: "Wakiso Wolves FC", points: 88 },
      { manager: "Moses Tumwine", team: "Lugogo Lakers", points: 76 },
    ],
    rugby: [
      { manager: "Esther Birungi", team: "Ntinda Nomads", points: 67 },
      { manager: "Patrick Ogwal", team: "Mukono Marauders", points: 55 },
    ],
  };

  const players = allPlayers[sport];
  const config = positionConfig[sport];

  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------- HELPERS ----------------
  const isInTeam = (id: number) => team.includes(id);
  const getPlayer = (id: number) => players.find((p) => p.id === id);

  const startersInPosition = (position: string) =>
    startingXI
      .map(getPlayer)
      .filter((p): p is Player => !!p && p.position === position).length;

  const hasOpenStartingSlot = (position: string) =>
    startersInPosition(position) < (config.starters[position] ?? 0);

  const addPlayer = (player: Player) => {
    if (team.length >= players.length) return alert("No more players available to sign!");
    if (budget < player.price) return alert("Not enough budget!");

    setTeam([...team, player.id]);
    setBudget(budget - player.price);

    if (hasOpenStartingSlot(player.position)) {
      setStartingXI((prev) => [...prev, player.id]);
    } else {
      setBench((prev) => [...prev, player.id]);
    }
  };

  const removePlayer = (player: Player) => {
    const wasStarting = startingXI.includes(player.id);

    setTeam((prev) => prev.filter((id) => id !== player.id));
    setStartingXI((prev) => prev.filter((id) => id !== player.id));
    setBench((prev) => prev.filter((id) => id !== player.id));
    setBudget((prev) => prev + player.price);
    if (captain === player.id) setCaptain(null);

    // Auto-promote the first eligible bench player into the now-empty slot.
    if (wasStarting) {
      const replacement = bench
        .map(getPlayer)
        .find((p): p is Player => !!p && p.position === player.position);

      if (replacement) {
        setBench((prev) => prev.filter((id) => id !== replacement.id));
        setStartingXI((prev) => [...prev, replacement.id]);
      }
    }
  };

  const toggleBench = (id: number) => {
    const player = getPlayer(id);
    if (!player) return;

    if (startingXI.includes(id)) {
      setStartingXI((prev) => prev.filter((x) => x !== id));
      setBench((prev) => [...prev, id]);
      if (captain === id) setCaptain(null);
      return;
    }

    if (bench.includes(id)) {
      if (!hasOpenStartingSlot(player.position)) {
        alert(`No open ${player.position} slot in the starting lineup. Bench another ${player.position} first.`);
        return;
      }
      setBench((prev) => prev.filter((x) => x !== id));
      setStartingXI((prev) => [...prev, id]);
    }
  };

  // ---------------- POINTS ENGINE ----------------
  const teamPoints = startingXI.reduce((total, id) => {
    const p = getPlayer(id);
    if (!p) return total;
    const pts = captain === id ? p.points * 2 : p.points;
    return total + pts;
  }, 0);

  // ---------------- MINI-LEAGUE TABLE ----------------
  const leagueTable = [
    { manager: "You", team: "My Fantasy XI", points: teamPoints, isYou: true },
    ...rivalManagers[sport].map((r) => ({ ...r, isYou: false })),
  ].sort((a, b) => b.points - a.points);

  const tabs = ["Transfers", "Captain", "Bench", "Rankings"];

  return (
    <div className="rankings-page" style={{ backgroundImage: `url(${ctaBanner})` }}>

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="League OS" className="logo-img" />
        </div>

        <ul className="navbar-links">
          {tabs.map((tab) => (
            <li
              key={tab}
              className={activeTab === tab ? "active-link" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </li>
          ))}
        </ul>

        <div className="navbar-profile">
          <div className="profile-circle">OW</div>
          Osbert Will
        </div>
      </nav>

      {/* SPORT SWITCH */}
      <div className="sport-nav">
        {(["football", "basketball", "rugby"] as Sport[]).map((s) => (
          <button
            key={s}
            className={sport === s ? "sport-active" : ""}
            onClick={() => changeSport(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* HEADER */}
      <section className="rank-header">
        <div>
          <span className="gameweek">{sport} · gameweek</span>
          <h1>{activeTab}</h1>
        </div>

        <div className="stats-card">
          <div>
            <small>Points</small>
            <strong>{teamPoints}</strong>
          </div>
          <div>
            <small>Squad</small>
            <strong>{team.length}/{players.length}</strong>
          </div>
          <div>
            <small>Budget</small>
            <strong>${budget}</strong>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="rank-content">

        {/* TRANSFERS */}
        {activeTab === "Transfers" && (
          <div className="transfer-layout">
            
            {/* LEFT SIDE - AVAILABLE PLAYERS */}
            <div className="transfer-left">
              <h2>Transfer Market</h2>

              <input
                placeholder="Search player..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />

              <div className="player-grid">
                {filteredPlayers.map((p) => {
                  const inTeam = isInTeam(p.id);

                  return (
                    <div key={p.id} className={`player-card ${inTeam ? "owned" : ""}`}>
                      <div className="player-avatar">{p.position}</div>

                      <div className="player-meta">
                        <h3>{p.name}</h3>
                        <p>{p.points} pts</p>
                      </div>

                      <span className="player-price">${p.price}</span>

                      <button
                        className={inTeam ? "btn-remove" : "btn-add"}
                        onClick={() => (inTeam ? removePlayer(p) : addPlayer(p))}
                      >
                        {inTeam ? "Remove" : "Sign"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT SIDE - PITCH / LINEUP */}
            <div className="transfer-right">
              <h2>Starting Lineup</h2>

              <div className={`pitch pitch-${sport}`}>
                {config.order.map((pos) => {
                  const starters = startingXI
                    .map(getPlayer)
                    .filter((p): p is Player => !!p && p.position === pos);
                  const emptySlots = (config.starters[pos] ?? 0) - starters.length;

                  return (
                    <div key={pos} className="pitch-row">
                      {starters.map((p) => (
                        <div key={p.id} className="pitch-chip">
                          {captain === p.id && <span className="captain-badge">C</span>}
                          <div className="chip-initials">
                            {p.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <span className="chip-name">{p.name.split(" ")[0]}</span>
                          <span className="chip-pos">{pos}</span>
                        </div>
                      ))}
                      {Array.from({ length: Math.max(emptySlots, 0) }).map((_, i) => (
                        <div key={`empty-${pos}-${i}`} className="pitch-chip empty">
                          <div className="chip-initials">{pos}</div>
                          <span className="chip-name">Empty</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              <h4 className="bench-label">Bench</h4>
              <div className="bench-row">
                {bench.length === 0 && <p className="empty-state">No players benched.</p>}
                {bench.map(getPlayer).filter((p): p is Player => !!p).map((p) => (
                  <div key={p.id} className="bench-chip">
                    <span>{p.name}</span>
                    <small>{p.position} · {p.points} pts</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CAPTAIN */}
        {activeTab === "Captain" && (
          <div>
            <h2>Captain</h2>
            <p className="section-hint">Your captain scores double points. Pick from your starting lineup.</p>

            {startingXI.length === 0 && (
              <p className="empty-state">Sign players and slot them into your starting lineup first.</p>
            )}

            <div className="player-grid">
              {startingXI.map(getPlayer).filter((p): p is Player => !!p).map((p) => (
                <div key={p.id} className={`player-card ${captain === p.id ? "owned" : ""}`}>
                  <div className="player-avatar">{p.position}</div>
                  <div className="player-meta">
                    <h3>{p.name}</h3>
                    <p>{p.points} pts {captain === p.id && `→ ${p.points * 2} as captain`}</p>
                  </div>
                  <button
                    className={captain === p.id ? "btn-remove" : "btn-add"}
                    onClick={() => setCaptain(p.id)}
                  >
                    {captain === p.id ? "Captain ⭐" : "Make Captain"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BENCH */}
        {activeTab === "Bench" && (
          <div>
            <h2>Bench System</h2>
            <p className="section-hint">Swap players between your starting lineup and bench. A slot must be open at that position to promote a player.</p>

            <div className="player-grid">
              {team.map(getPlayer).filter((p): p is Player => !!p).map((p) => {
                const isBench = bench.includes(p.id);

                return (
                  <div key={p.id} className="player-card">
                    <div className="player-avatar">{p.position}</div>
                    <div className="player-meta">
                      <h3>{p.name}</h3>
                      <p>{isBench ? "Bench" : "Starting"}</p>
                    </div>
                    <button
                      className={isBench ? "btn-add" : "btn-remove"}
                      onClick={() => toggleBench(p.id)}
                    >
                      {isBench ? "Promote" : "Bench"}
                    </button>
                  </div>
                );
              })}
              {team.length === 0 && <p className="empty-state">Your squad is empty — sign players from Transfers.</p>}
            </div>
          </div>
        )}

        {/* RANKINGS */}
        {activeTab === "Rankings" && (
          <div>
            <h2>{sport.toUpperCase()} Mini-League</h2>
            <p className="section-hint">Ranked by total fantasy points this gameweek.</p>

            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Manager</th>
                  <th>Team</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                {leagueTable.map((row, i) => (
                  <tr key={row.manager} className={row.isYou ? "you-row" : ""}>
                    <td>{i + 1}</td>
                    <td>{row.manager}</td>
                    <td>{row.team}</td>
                    <td>{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
