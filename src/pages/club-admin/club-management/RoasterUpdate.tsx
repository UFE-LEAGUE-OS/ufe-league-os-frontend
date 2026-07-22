import { useState } from "react";
import { ArrowLeftRight, Search, Save, CheckCircle2 } from "lucide-react";

import "../../../styles/pages/club-admin/ClubManagement.css";

interface Player {
  id: number;
  clubId: number;
  name: string;
  position: string;
  team: string;
  jerseyNumber?: number;
  status: "Active" | "Injured" | "Suspended" | "Loaned";
}
const currentPlayersData: Player[] = [
  {
    id: 1,
    clubId: 1,
    name: "John Okello",
    position: "Midfielder",
    team: "Senior Men",
    jerseyNumber: 10,
    status: "Active",
  },

  {
    id: 2,
    clubId: 1,
    name: "Brian Kato",
    position: "Defender",
    team: "Senior Men",
    jerseyNumber: 5,
    status: "Active",
  },

  {
    id: 3,
    clubId: 1,
    name: "Musa Ali",
    position: "Forward",
    team: "Senior Men",
    jerseyNumber: 9,
    status: "Injured",
  },

  {
    id: 4,
    clubId: 1,
    name: "David Peter",
    position: "Goalkeeper",
    team: "Senior Men",
    jerseyNumber: 1,
    status: "Active",
  },
];

const availablePlayersData: Player[] = [
  {
    id: 5,
    clubId: 1,
    name: "Samuel Ivan",
    position: "Midfielder",
    team: "",
    status: "Active"
  },

  {
    id: 6,
    clubId: 1,
    name: "Isaac James",
    position: "Forward",
    team: "",
    status: "Active"
  },

  {
    id: 7,
    clubId: 1,
    name: "Daniel Mark",
    position: "Defender",
    team: "",
    status: "Active"
  }
];

export default function RosterUpdate() {
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
  const [position, setPosition] = useState("All");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const addPlayer = (player: Player) => {

    setCurrentPlayers([
      ...currentPlayers,
      {
        ...player,
        team,
        status: "Active"
      }
    ]);

    setAvailablePlayers(
      availablePlayers.filter(
        item => item.id !== player.id
      )
    );

    setDirty(true);

  };

  const removePlayer = (player: Player) => {
    setAvailablePlayers([...availablePlayers, { ...player, team: "" }]);
    setCurrentPlayers(currentPlayers.filter((item) => item.id !== player.id));
    setDirty(true);
  };

  const saveRoster = () => {

    const maxPlayers =
      loggedInClub.sport === "Football"
        ? 30
        : loggedInClub.sport === "Basketball"
          ? 15
          : 35;


    if (currentPlayers.length > maxPlayers) {
      setSavedMessage(
        `Maximum squad size for ${loggedInClub.sport} is ${maxPlayers}`
      );

      return;
    }


    setSavedMessage(
      `Roster for ${team} - ${squad} saved with ${currentPlayers.length} players.`
    );

    setDirty(false);


    setTimeout(() => {
      setSavedMessage(null);
    }, 3000);

  };

  return (
    <div className="club-page">
      

      <div className="club-header">
        <div>
          <h1>   {loggedInClub.name}</h1>
          <p>
            {loggedInClub.sport}
          </p>
        </div>
        <div className="button-group">
          <button
            className="secondary-btn"
            disabled={dirty}
            onClick={() => setSavedMessage(
              "Squad submitted for league approval"
            )}
          >
            Submit Squad
          </button>

          <button className="primary-btn" onClick={saveRoster} disabled={!dirty}>
            <Save size={18} />
            Save Roster
          </button>
        </div>
        

        

      </div>

      {savedMessage && (
        <div className="review-box success-box">
          <CheckCircle2 size={18} />
          <p>{savedMessage}</p>
        </div>
      )}

      <div className="club-toolbar">

    <div className="toolbar-group">
        <label>Team</label>

        <select 
            value={team} 
            onChange={(e) => setTeam(e.target.value)}
        >
            <option>Senior Men</option>
            <option>Senior Women</option>
            <option>U20 Boys</option>
            <option>U17 Boys</option>
        </select>
    </div>


    <div className="toolbar-group">
        <label>Squad Type</label>

        <select 
            value={squad} 
            onChange={(e) => setSquad(e.target.value)}
        >
            <option>League Squad</option>
            <option>Reserve Squad</option>
            <option>Youth Squad</option>
        </select>
    </div>


    <div className="toolbar-group">
        <label>Position</label>

        <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
        >
            <option>All</option>
            <option>Goalkeeper</option>
            <option>Defender</option>
            <option>Midfielder</option>
            <option>Forward</option>
        </select>
    </div>


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
                  player.name
                    .toLowerCase()
                    .includes(search.toLowerCase())
                  &&
                  (position === "All" || player.position === position)
              )
              .map((player) => (
                <div className="player-item" key={player.id}>
                  <div>
                    <strong>
                      {player.jerseyNumber} {player.name}
                    </strong>

                    <span>
                      {player.position}
                    </span>

                    <span>
                      Status: {player.status}
                    </span>
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
                    <strong>
                      {player.jerseyNumber} {player.name}
                    </strong>

                    <span>
                      {player.position}
                    </span>

                    <span>
                      Status: {player.status}
                    </span>
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
  );
}