import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Users,
  Shield,
  Trophy,
  Eye,
  Pencil,
  Trash2,
  X,
  UserCog,
  ClipboardList,
  Send,
} from "lucide-react";

import "../../../styles/pages/club-admin/ClubManagement.css";
import AdminWorkspaceLayout from "../../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";

interface Team {
  id: number;
  name: string;
  sport: "Football" | "Basketball" | "Rugby";
  category: string;
  season: string;
  squad: string;
  players: number;
  coach: string;
  captain: string;
  status: "Active" | "Inactive";
}

interface Squad {
  id: number;
  name: string;
  players: number;
}

const teamsData: Team[] = [
  {
    id: 1,
    name: "Senior Men",
    sport: "Football",
    category: "Senior",
    season: "2026",
    squad: "League Squad",
    players: 26,
    coach: "John Doe",
    captain: "Allan Okello",
    status: "Active",
  },
  {
    id: 2,
    name: "Senior Women",
    sport: "Football",
    category: "Senior",
    season: "2026",
    squad: "Women's Squad",
    players: 24,
    coach: "Sarah Namusoke",
    captain: "Faith Nankya",
    status: "Active",
  },
  {
    id: 3,
    name: "U20 Boys",
    sport: "Football",
    category: "U20",
    season: "2026",
    squad: "Development Squad",
    players: 22,
    coach: "Brian Kato",
    captain: "Isaac Ochen",
    status: "Active",
  },
  {
    id: 4,
    name: "U17 Boys",
    sport: "Football",
    category: "U17",
    season: "2026",
    squad: "Youth Squad",
    players: 20,
    coach: "Peter Ojara",
    captain: "Brian Opio",
    status: "Active",
  },
  {
    id: 5,
    name: "Reserve Team",
    sport: "Football",
    category: "Reserve",
    season: "2026",
    squad: "Reserve Squad",
    players: 23,
    coach: "David Okello",
    captain: "Ronald Ssemanda",
    status: "Active",
  },
];

const initialSquads: Squad[] = [
  { id: 1, name: "League Squad", players: 26 },
  { id: 2, name: "Reserve Squad", players: 18 },
  { id: 3, name: "Youth Squad", players: 22 },
];

const categoryOptions = ["Senior", "Women", "U20", "U17", "Reserve"];

const emptyTeamForm = {
  name: "",
  category: categoryOptions[0],
  season: "2026",
  squad: "",
  coach: "",
  captain: "",
  status: "Active" as "Active" | "Inactive",
};

const emptySquadForm = { name: "", players: 0 };

const navItems = [
  {
    label: "Club Management",
    items: [
      { key: "teams", label: "Teams & Squads", icon: Shield, path: "/club-management/teams" },
      { key: "players", label: "Player Registration", icon: UserCog, path: "/club-management/players" },
      { key: "staff", label: "Staff & Officials", icon: UserCog, path: "/club-management/staff" },
      { key: "roster", label: "Roster Update", icon: ClipboardList, path: "/club-management/roster" },
      { key: "squad-submission", label: "Squad Submission", icon: Send, path: "/club-management/squad-submission" },
    ],
  },
];

const TeamsManagement = () => {
  const navigate = useNavigate();

  const [teams, setTeams] = useState<Team[]>(teamsData);
  const [squads, setSquads] = useState<Squad[]>(initialSquads);
  const [search, setSearch] = useState("");

  const loggedInClub = {
    id: 1,
    name: "KCCA FC",
    sport: "Football" as const,
  };

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [teamForm, setTeamForm] = useState(emptyTeamForm);

  const [showSquadModal, setShowSquadModal] = useState(false);
  const [squadForm, setSquadForm] = useState(emptySquadForm);

  const filteredTeams = teams.filter((team) => {
    return (
      team.name.toLowerCase().includes(search.toLowerCase()) &&
      team.sport === loggedInClub.sport
    );
  });

  const totalPlayers = filteredTeams.reduce((sum, t) => sum + t.players, 0);

  const openCreateTeam = () => {
    setEditingTeamId(null);
    setTeamForm(emptyTeamForm);
    setShowTeamModal(true);
  };

  const openEditTeam = (team: Team) => {
    setEditingTeamId(team.id);
    setTeamForm({
      name: team.name,
      category: team.category,
      season: team.season,
      squad: team.squad,
      coach: team.coach,
      captain: team.captain,
      status: team.status,
    });
    setShowTeamModal(true);
  };

  const saveTeam = () => {
    if (!teamForm.name.trim()) return;

    if (editingTeamId) {
      setTeams(
        teams.map((t) =>
          t.id === editingTeamId
            ? {
                ...t,
                name: teamForm.name,
                category: teamForm.category,
                season: teamForm.season,
                squad: teamForm.squad || t.squad,
                coach: teamForm.coach,
                captain: teamForm.captain,
                status: teamForm.status,
              }
            : t
        )
      );
    } else {
      const newTeam: Team = {
        id: Math.max(0, ...teams.map((t) => t.id)) + 1,
        name: teamForm.name,
        sport: loggedInClub.sport,
        category: teamForm.category,
        season: teamForm.season,
        squad: teamForm.squad || "Unassigned",
        players: 0,
        coach: teamForm.coach || "Unassigned",
        captain: teamForm.captain || "TBD",
        status: teamForm.status,
      };
      setTeams([...teams, newTeam]);
    }

    setShowTeamModal(false);
  };

  const deleteTeam = (id: number) => {
    setTeams(teams.filter((team) => team.id !== id));
    if (selectedTeam?.id === id) setSelectedTeam(null);
  };

  const openCreateSquad = () => {
    setSquadForm(emptySquadForm);
    setShowSquadModal(true);
  };

  const saveSquad = () => {
    if (!squadForm.name.trim()) return;
    setSquads([
      ...squads,
      {
        id: Math.max(0, ...squads.map((s) => s.id)) + 1,
        name: squadForm.name,
        players: squadForm.players,
      },
    ]);
    setShowSquadModal(false);
  };

  return (
    <AdminWorkspaceLayout
      workspaceTitle={loggedInClub.name}
      workspaceSubtitle={`${loggedInClub.sport} Club`}
      eyebrow="Club Management"
      title="Teams & Squads"
      description="Manage your club's teams, categories and squads."
      navItems={navItems}
      activeTab="teams"
      hideAdminSidebar
      onTabChange={(key: string) => {
        const allItems = navItems.flatMap((g) => g.items);
        const item = allItems.find((i) => i.key === key);
        if (item) navigate(item.path);
      }}
    >
      <div className="club-page">
        <div className="club-header">
          <div>
            <h1>{loggedInClub.name}</h1>
            <p>{loggedInClub.sport} Club</p>
          </div>

          <button className="primary-btn" onClick={openCreateTeam}>
            <Plus size={18} />
            Create Team
          </button>
        </div>

        <div className="club-stats">
          <div className="club-stat-card">
            <Shield />
            <div>
              <span>Total Teams</span>
              <h2>{filteredTeams.length}</h2>
            </div>
          </div>

          <div className="club-stat-card">
            <Users />
            <div>
              <span>Total Squads</span>
              <h2>{squads.length}</h2>
            </div>
          </div>

          <div className="club-stat-card">
            <Trophy />
            <div>
              <span>Registered Players</span>
              <h2>{totalPlayers}</h2>
            </div>
          </div>
        </div>

        <div className="club-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search teams..."
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
                  <th>Team</th>
                  <th>Category</th>
                  <th>Season</th>
                  <th>Players</th>
                  <th>Coach</th>
                  <th>Captain</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTeams.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-row">
                      No teams match your search.
                    </td>
                  </tr>
                )}
                {filteredTeams.map((team) => (
                  <tr key={team.id}>
                    <td>
                      <strong>{team.name}</strong>
                    </td>
                    <td>{team.category}</td>
                    <td>{team.season}</td>
                    <td>{team.players}</td>
                    <td>{team.coach}</td>
                    <td>{team.captain}</td>
                    <td>
                      <span className={team.status === "Active" ? "status active" : "status expired"}>
                        {team.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button title="View" onClick={() => setSelectedTeam(team)}>
                          <Eye size={17} />
                        </button>
                        <button title="Edit" onClick={() => openEditTeam(team)}>
                          <Pencil size={17} />
                        </button>
                        <button title="Delete" onClick={() => deleteTeam(team.id)}>
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedTeam && (
          <div className="side-panel">
            <div className="panel-header">
              <div>
                <h2>{selectedTeam.name}</h2>
                <p>{selectedTeam.sport}</p>
              </div>
              <button onClick={() => setSelectedTeam(null)}>
                <X />
              </button>
            </div>

            <div className="team-info">
              <div>
                <span>Category</span>
                <strong>{selectedTeam.category}</strong>
              </div>
              <div>
                <span>Season</span>
                <strong>{selectedTeam.season}</strong>
              </div>
              <div>
                <span>Coach</span>
                <strong>{selectedTeam.coach}</strong>
              </div>
              <div>
                <span>Captain</span>
                <strong>{selectedTeam.captain}</strong>
              </div>
              <div>
                <span>Players</span>
                <strong>{selectedTeam.players}</strong>
              </div>
            </div>

            <h3>Squads</h3>

            <div className="squad-list">
              {squads.map((squad) => (
                <div className="squad-item" key={squad.id}>
                  <div>
                    <strong>{squad.name}</strong>
                    <p>{squad.players} Players</p>
                  </div>
                  <button>Edit</button>
                </div>
              ))}
            </div>

            <button className="primary-btn full" onClick={openCreateSquad}>
              <Plus size={18} />
              Create Squad
            </button>
          </div>
        )}

        {showTeamModal && (
          <div className="modal-overlay">
            <div className="club-modal">
              <div className="modal-header">
                <h2>{editingTeamId ? "Edit Team" : "Create Team"}</h2>
                <button onClick={() => setShowTeamModal(false)}>
                  <X />
                </button>
              </div>

              <div className="form-grid">
                <input
                  placeholder="Team Name"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                />

                <div className="readonly-field">Sport: {loggedInClub.sport}</div>

                <select
                  value={teamForm.category}
                  onChange={(e) => setTeamForm({ ...teamForm, category: e.target.value })}
                >
                  {categoryOptions.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>

                <input
                  placeholder="Season"
                  value={teamForm.season}
                  onChange={(e) => setTeamForm({ ...teamForm, season: e.target.value })}
                />

                <select
                  value={teamForm.squad}
                  onChange={(e) => setTeamForm({ ...teamForm, squad: e.target.value })}
                >
                  <option value="">Assign Squad</option>
                  {squads.map((s) => (
                    <option key={s.id}>{s.name}</option>
                  ))}
                </select>

                <input
                  placeholder="Coach Name"
                  value={teamForm.coach}
                  onChange={(e) => setTeamForm({ ...teamForm, coach: e.target.value })}
                />

                <input
                  placeholder="Captain"
                  value={teamForm.captain}
                  onChange={(e) => setTeamForm({ ...teamForm, captain: e.target.value })}
                />

                <select
                  value={teamForm.status}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, status: e.target.value as "Active" | "Inactive" })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="modal-actions">
                <button className="secondary-btn" onClick={() => setShowTeamModal(false)}>
                  Cancel
                </button>
                <button className="primary-btn" onClick={saveTeam}>
                  Save Team
                </button>
              </div>
            </div>
          </div>
        )}

        {showSquadModal && (
          <div className="modal-overlay">
            <div className="club-modal">
              <div className="modal-header">
                <h2>Create Squad</h2>
                <button onClick={() => setShowSquadModal(false)}>
                  <X />
                </button>
              </div>

              <div className="form-grid">
                <input
                  placeholder="Squad Name"
                  value={squadForm.name}
                  onChange={(e) => setSquadForm({ ...squadForm, name: e.target.value })}
                />

                <input
                  placeholder="Maximum Players"
                  type="number"
                  value={squadForm.players}
                  onChange={(e) =>
                    setSquadForm({ ...squadForm, players: Number(e.target.value) })
                  }
                />
              </div>

              <div className="modal-actions">
                <button className="secondary-btn" onClick={() => setShowSquadModal(false)}>
                  Cancel
                </button>
                <button className="primary-btn" onClick={saveSquad}>
                  Save Squad
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminWorkspaceLayout>
  );
};

export default TeamsManagement;