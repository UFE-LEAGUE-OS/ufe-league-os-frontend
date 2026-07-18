import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, Search, Save, CheckCircle2 } from "lucide-react";

import "../../../styles/pages/club-admin/ClubManagement.css";

import AdminWorkspaceLayout from "../../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import { clubAdminNavItems } from "./clubAdminNav";

interface Player {
  id: number;
  clubId: number;
  name: string;
  position: string;
  team: string;
}

const currentPlayersData: Player[] = [
  { id: 1, clubId: 1, name: "John Okello", position: "Midfielder", team: "Senior Men" },
  { id: 2, clubId: 1, name: "Brian Kato", position: "Defender", team: "Senior Men" },
  { id: 3, clubId: 1, name: "Musa Ali", position: "Forward", team: "Senior Men" },
  { id: 4, clubId: 1, name: "David Peter", position: "Goalkeeper", team: "Senior Men" },
];

const availablePlayersData: Player[] = [
  { id: 5, clubId: 1, name: "Samuel Ivan", position: "Midfielder", team: "" },
  { id: 6, clubId: 1, name: "Isaac James", position: "Forward", team: "" },
  { id: 7, clubId: 1, name: "Daniel Mark", position: "Defender", team: "" },
];

export default function RosterUpdate() {
  const navigate = useNavigate();

  const loggedInClub = {
    id: 1,
    name: "KCCA FC",
    sport: "Football",
  };

  const [team, setTeam] = useState("Senior Men");
  const [squad, setSquad] = useState("League Squad");

  const [currentPlayers, setCurrentPlayers] = useState<Player[]>(currentPlayersData);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>(availablePlayersData);

  const [search, setSearch] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const addPlayer = (player: Player) => {
    setCurrentPlayers([...currentPlayers, { ...player, team }]);
    setAvailablePlayers(availablePlayers.filter((item) => item.id !== player.id));
    setDirty(true);
  };

  const removePlayer = (player: Player) => {
    setAvailablePlayers([...availablePlayers, { ...player, team: "" }]);
    setCurrentPlayers(currentPlayers.filter((item) => item.id !== player.id));
    setDirty(true);
  };

  const saveRoster = () => {
    setSavedMessage(`Roster for ${team} - ${squad} saved with ${currentPlayers.length} players.`);
    setDirty(false);
    setTimeout(() => setSavedMessage(null), 3000);
  };

  return (
    <AdminWorkspaceLayout
      workspaceTitle={loggedInClub.name}
      workspaceSubtitle="Football Club"
      eyebrow="Club Management"
      title="Roster Update"
      description="Manage club player rosters."
      navItems={clubAdminNavItems}
      activeTab="roster"
      onTabChange={(key) => {
        const item = clubAdminNavItems.find((i) => i.key === key);
        if (item) navigate(item.path);
      }}
    >
      <div className="club-page">
        <div className="club-header">
          <div>
            <h1>   {loggedInClub.name}</h1>
            <p>
              {loggedInClub.sport}
            </p>
          </div>

          <button className="primary-btn" onClick={saveRoster} disabled={!dirty}>
            <Save size={18} />
            Save Roster
          </button>

        </div>

        {savedMessage && (
          <div className="review-box success-box">
            <CheckCircle2 size={18} />
            <p>{savedMessage}</p>
          </div>
        )}

        <div className="club-toolbar">
          <select value={team} onChange={(e) => setTeam(e.target.value)}>
            <option>Senior Men</option>
            <option>Senior Women</option>
            <option>U20 Boys</option>
            <option>U17 Boys</option>
          </select>

          <select value={squad} onChange={(e) => setSquad(e.target.value)}>
            <option>League Squad</option>
            <option>Reserve Squad</option>
            <option>Youth Squad</option>
          </select>

          <div className="search-box">
            <Search size={18} />
            <input
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="roster-container">
          <div className="roster-card">
            <h4>Current Squad</h4>
            <p>
              {team} - {squad}
            </p>

            <div className="player-list">
              {currentPlayers
                .filter(
                  (player) =>
                    player.clubId === loggedInClub.id &&
                    player.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((player) => (
                  <div className="player-item" key={player.id}>
                    <div>
                      <strong>{player.name}</strong>
                      <span>{player.position}</span>
                    </div>

                    <button className="remove-btn" onClick={() => removePlayer(player)}>
                      Remove
                    </button>
                  </div>
                ))}
              {currentPlayers.filter((p) => p.clubId === loggedInClub.id).length === 0 && (
                <p className="empty-row">No players assigned to this squad yet.</p>
              )}
            </div>
          </div>

          <div className="roster-middle">
            <ArrowLeftRight size={30} />
          </div>

          <div className="roster-card">
            <h4>Available Players</h4>
            <p>Unassigned {loggedInClub.sport} players</p>

            <div className="player-list">
              {availablePlayers
                .filter(
                  (player) =>
                    player.clubId === loggedInClub.id &&
                    player.name.toLowerCase().includes(search.toLowerCase())
                )
                .map((player) => (
                  <div className="player-item" key={player.id}>
                    <div>
                      <strong>{player.name}</strong>
                      <span>{player.position}</span>
                    </div>

                    <button className="add-btn" onClick={() => addPlayer(player)}>
                      Add
                    </button>
                  </div>
                ))}
              {availablePlayers.filter((p) => p.clubId === loggedInClub.id).length === 0 && (
                <p className="empty-row">No unassigned players remaining.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminWorkspaceLayout>
  );
}
