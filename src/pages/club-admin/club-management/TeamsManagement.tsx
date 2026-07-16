import { useState } from "react";
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
} from "lucide-react";

import "../../../styles/pages/club-admin/clubManagement.css";

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


const squadsData: Squad[] = [
  {
    id: 1,
    name: "League Squad",
    players: 26,
  },
  {
    id: 2,
    name: "Reserve Squad",
    players: 18,
  },
  {
    id: 3,
    name: "Youth Squad",
    players: 22,
  },
];


const TeamsManagement = () => {

  const [teams, setTeams] = useState<Team[]>(teamsData);

  const [search, setSearch] = useState("");

 const loggedInClub = {
  id: 1,
  name: "KCCA FC",
  sport: "Football",
  title: "Football Teams & Squads",
};


  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);


  const [showTeamModal, setShowTeamModal] =
    useState(false);


  const [showSquadModal, setShowSquadModal] =
    useState(false);


  const filteredTeams = teams.filter((team) => {
    return (
      team.name.toLowerCase().includes(search.toLowerCase()) &&
      team.sport === loggedInClub.sport
    );
  });



  const deleteTeam = (id: number) => {

    setTeams(
      teams.filter(
        (team) => team.id !== id
      )
    );

  };



  return (

    <div className="club-page">


      {/* HEADER */}

      <div className="club-header">

        <div>

          <h1>{loggedInClub.name}</h1>

          <p>{loggedInClub.sport} Club</p>

        </div>


        <button
          className="primary-btn"
          onClick={() =>
            setShowTeamModal(true)
          }
        >

          <Plus size={18} />

          Create Team

        </button>


      </div>



      {/* STAT CARDS */}

      <div className="club-stats">


        <div className="club-stat-card">

          <Shield />

          <div>

            <span>
              Total Teams
            </span>

            <h2>
              {filteredTeams.length}
            </h2>

          </div>

        </div>




        <div className="club-stat-card">

          <Users />

          <div>

            <span>
              Total Squads
            </span>

            <h2>
              12
            </h2>

          </div>

        </div>




        <div className="club-stat-card">

          <Trophy />

          <div>

            <span>
              Registered Players
            </span>

            <h2>
              285
            </h2>

          </div>

        </div>


      </div>



      {/* FILTERS */}


      <div className="club-toolbar">


        <div className="search-box">

          <Search size={18} />

          <input

            type="text"

            placeholder="Search teams..."

            value={search}

            onChange={(e) =>
              setSearch(e.target.value)
            }

          />

        </div>





      </div>
      {/* TEAMS TABLE */}

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

              {
                filteredTeams.map((team) => (

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
                      <span className="status active">
                        {team.status}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          title="View"
                          onClick={() => setSelectedTeam(team)}
                        >
                          <Eye size={17} />
                        </button>

                        <button title="Edit">
                          <Pencil size={17} />
                        </button>

                        <button
                          title="Delete"
                          onClick={() => deleteTeam(team.id)}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>

                  </tr>


                ))
              }


            </tbody>


          </table>


        </div>


      </div>





      {/* TEAM DETAILS PANEL */}


      {
        selectedTeam && (

          <div className="side-panel">


            <div className="panel-header">


              <div>

                <h2>
                  {selectedTeam.name}
                </h2>

                <p>
                  {selectedTeam.sport}
                </p>

              </div>



              <button

                onClick={() =>
                  setSelectedTeam(null)
                }

              >

                <X />

              </button>


            </div>




            <div className="team-info">


              <div>

                <span>
                  Category
                </span>

                <strong>
                  {selectedTeam.category}
                </strong>

              </div>

              <div>
                <span>Season</span>
                <strong>{selectedTeam.season}</strong>
              </div>



              <div>

                <span>
                  Coach
                </span>

                <strong>
                  {selectedTeam.coach}
                </strong>

              </div>

              <div>
                <span>Captain</span>
                <strong>{selectedTeam.captain}</strong>
              </div>



              <div>

                <span>
                  Players
                </span>

                <strong>
                  {selectedTeam.players}
                </strong>

              </div>



            </div>




            <h3>
              Squads
            </h3>



            <div className="squad-list">


              {
                squadsData.map((squad) => (

                  <div
                    className="squad-item"
                    key={squad.id}
                  >


                    <div>

                      <strong>
                        {squad.name}
                      </strong>

                      <p>
                        {squad.players} Players
                      </p>

                    </div>


                    <button>

                      Edit

                    </button>


                  </div>


                ))
              }


            </div>




            <button

              className="primary-btn full"

              onClick={() =>
                setShowSquadModal(true)
              }

            >

              <Plus size={18} />

              Create Squad

            </button>



          </div>

        )

      }







      {/* CREATE TEAM MODAL */}


      {
        showTeamModal && (

          <div className="modal-overlay">


            <div className="club-modal">


              <div className="modal-header">


                <h2>
                  Create Team
                </h2>


                <button

                  onClick={() =>
                    setShowTeamModal(false)
                  }

                >

                  <X />

                </button>


              </div>





              <div className="form-grid">


                <input
                  placeholder="Team Name"
                />



                <div className="readonly-field">
                  Sport: {loggedInClub.sport}
                </div>




                <select>

                  <option>
                    Senior
                  </option>

                  <option>
                    Women
                  </option>

                  <option>
                    U20
                  </option>

                  <option>
                    U17
                  </option>

                </select>



                <input
                  placeholder="Coach Name"
                />


              </div>




              <div className="modal-actions">


                <button

                  className="secondary-btn"

                  onClick={() =>
                    setShowTeamModal(false)
                  }

                >

                  Cancel

                </button>



                <button

                  className="primary-btn"

                >

                  Save Team

                </button>


              </div>



            </div>


          </div>

        )

      }






      {/* CREATE SQUAD MODAL */}


      {
        showSquadModal && (

          <div className="modal-overlay">


            <div className="club-modal">


              <div className="modal-header">


                <h2>
                  Create Squad
                </h2>


                <button

                  onClick={() =>
                    setShowSquadModal(false)
                  }

                >

                  <X />

                </button>


              </div>




              <div className="form-grid">


                <input
                  placeholder="Squad Name"
                />



                <input

                  placeholder="Maximum Players"

                  type="number"

                />



              </div>



              <div className="modal-actions">


                <button

                  className="secondary-btn"

                  onClick={() =>
                    setShowSquadModal(false)
                  }

                >

                  Cancel

                </button>



                <button

                  className="primary-btn"

                >

                  Save Squad

                </button>



              </div>



            </div>


          </div>


        )

      }




    </div>

  );

};


export default TeamsManagement;