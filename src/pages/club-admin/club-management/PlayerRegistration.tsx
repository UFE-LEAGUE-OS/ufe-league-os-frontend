import { useState } from "react";
import { Plus, Search, Pencil, Trash2, ArrowRightLeft, X, Eye } from "lucide-react";

import "../../../styles/pages/club-admin/ClubManagement.css";

interface Player {
  id: number;
  clubId: number;
  name: string;
  team: string;
  position: string;
  jersey: number;
  status: "Active" | "Inactive";
}

// Example data from KCCA FC only
const playersData: Player[] = [
  { id: 1, clubId: 1, name: "John Okello", team: "Senior Men", position: "Midfielder", jersey: 8, status: "Active" },
  { id: 2, clubId: 1, name: "Allan Okello", team: "Senior Men", position: "Forward", jersey: 9, status: "Active" },
  { id: 3, clubId: 1, name: "Faith Nankya", team: "Senior Women", position: "Forward", jersey: 11, status: "Active" },
];

const emptyForm = {
  name: "",
  team: "",
  position: "",
  jersey: 0,
  status: "Active" as "Active" | "Inactive",
};

const emptyTransferForm = { playerName: "", transferTo: "", reason: "" };

const PlayerRegistration = () => {
  const [players, setPlayers] = useState<Player[]>(playersData);
const [showProfile, setShowProfile] = useState(false);
const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
const [search, setSearch] = useState("");

  // This will come from authentication later
  const loggedInClub = {
    id: 1,
    name: "KCCA FC",
    sport: "Football",
  };

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [showTransfer, setShowTransfer] = useState(false);
  const [transferringPlayer, setTransferringPlayer] = useState<Player | null>(null);
  const [transferForm, setTransferForm] = useState(emptyTransferForm);

  // Only this club's players
  const filteredPlayers = players.filter((player) => {
    return (
      player.clubId === loggedInClub.id &&
      player.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  const openRegister = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (player: Player) => {
    setEditingId(player.id);
    setForm({
      name: player.name,
      team: player.team,
      position: player.position,
      jersey: player.jersey,
      status: player.status,
    });
    setShowForm(true);
  };

  const savePlayer = () => {
    if (!form.name.trim()) return;

    if (editingId) {
      setPlayers(
        players.map((p) =>
          p.id === editingId
            ? {
              ...p,
              name: form.name,
              team: form.team,
              position: form.position,
              jersey: form.jersey,
              status: form.status,
            }
            : p
        )
      );
    } else {
      const newPlayer: Player = {
        id: Math.max(0, ...players.map((p) => p.id)) + 1,
        clubId: loggedInClub.id,
        name: form.name,
        team: form.team || "Unassigned",
        position: form.position || "Unassigned",
        jersey: form.jersey,
        status: form.status,
      };
      setPlayers([...players, newPlayer]);
    }

    setShowForm(false);
  };

  const deletePlayer = (id: number) => {
    setPlayers(players.filter((player) => player.id !== id));
  };

  const openTransfer = (player: Player) => {
    setTransferringPlayer(player);
    setTransferForm({ playerName: player.name, transferTo: "", reason: "" });
    setShowTransfer(true);
  };

  const openProfile = (player: Player) => {
    setSelectedPlayer(player);
    setShowProfile(true);
  };

  const confirmTransfer = () => {
    if (!transferringPlayer || !transferForm.transferTo.trim()) return;
    setPlayers(players.filter((p) => p.id !== transferringPlayer.id));
    setShowTransfer(false);
    setTransferringPlayer(null);
  };

  return (
    <div className="club-page">
      <div className="club-header">
        <div>
          <h1>{loggedInClub.name}</h1>
          <p>{loggedInClub.sport} Player Registration</p>
        </div>

        <button className="primary-btn" onClick={openRegister}>
          <Plus size={18} />
          Register Player
        </button>
      </div>

      <div className="club-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="club-card">
        <div className="table-wrapper">
          <table className="club-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Team</th>
                <th>Position</th>
                <th>Jersey</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-row">
                    No players match your search.
                  </td>
                </tr>
              )}
              {filteredPlayers.map((player) => (
                <tr key={player.id}>
                  <td>
                    <strong>{player.name}</strong>
                  </td>
                  <td>{player.team}</td>
                  <td>{player.position}</td>
                  <td>{player.jersey}</td>
                  <td>
                    <span
                      className={player.status === "Active" ? "status active" : "status expired"}
                    >
                      {player.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        title="View Profile"
                        onClick={() => openProfile(player)}
                      >
                        <Eye size={16} />
                      </button>
                      <button title="Edit" onClick={() => openEdit(player)}>
                        <Pencil size={16} />
                      </button>
                      <button title="Transfer" onClick={() => openTransfer(player)}>
                        <ArrowRightLeft size={16} />
                      </button>
                      <button title="Delete" onClick={() => deletePlayer(player.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="club-modal">
            <div className="modal-header">
              <h4>{editingId ? "Edit Player" : "Register Player"}</h4>
              <button onClick={() => setShowForm(false)}>
                <X />
              </button>
            </div>

            <div className="form-grid">
              <input
                placeholder="Player Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <div className="readonly-field">Club: {loggedInClub.name}</div>
              <div className="readonly-field">Sport: {loggedInClub.sport}</div>

              <input
                placeholder="Team"
                value={form.team}
                onChange={(e) => setForm({ ...form, team: e.target.value })}
              />

              <input
                placeholder="Position"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />

              <input
                type="number"
                placeholder="Jersey Number"
                value={form.jersey}
                onChange={(e) => setForm({ ...form, jersey: Number(e.target.value) })}
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as "Active" | "Inactive" })
                }
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button className="primary-btn" onClick={savePlayer}>
                Save Player
              </button>
            </div>
          </div>
        </div>
      )}


      {showProfile && selectedPlayer && (
  <div className="modal-overlay">

    <div className="club-modal">

      <div className="modal-header">
        <h4>Player Profile</h4>

        <button onClick={() => setShowProfile(false)}>
          <X />
        </button>
      </div>


      <div className="player-profile">

        <div className="player-avatar-large">
          {selectedPlayer.name.charAt(0)}
        </div>


        <h2>
          {selectedPlayer.name}
        </h2>


        <p>
          {selectedPlayer.position}
        </p>


        <div className="profile-details">

          <div>
            <strong>Club</strong>
            <span>
              {loggedInClub.name}
            </span>
          </div>


          <div>
            <strong>Team</strong>
            <span>
              {selectedPlayer.team}
            </span>
          </div>


          <div>
            <strong>Jersey Number</strong>
            <span>
              #{selectedPlayer.jersey}
            </span>
          </div>


          <div>
            <strong>Status</strong>
            <span>
              {selectedPlayer.status}
            </span>
          </div>

        </div>

      </div>

    </div>

  </div>
)}

      {showTransfer && transferringPlayer && (
        <div className="modal-overlay">
          <div className="club-modal">
            <div className="modal-header">
              <h4>Transfer Player</h4>
              <button onClick={() => setShowTransfer(false)}>
                <X />
              </button>
            </div>

            <div className="form-grid">
              <div className="readonly-field">Player: {transferringPlayer.name}</div>

              <input
                placeholder="Transfer To"
                value={transferForm.transferTo}
                onChange={(e) => setTransferForm({ ...transferForm, transferTo: e.target.value })}
              />

              <textarea
                placeholder="Reason"
                value={transferForm.reason}
                onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
              />
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowTransfer(false)}>
                Cancel
              </button>
              <button className="primary-btn" onClick={confirmTransfer}>
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerRegistration;