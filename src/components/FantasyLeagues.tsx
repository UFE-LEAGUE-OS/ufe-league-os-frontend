import "./FantasyLeagues.css";
import uplLogo from "../assets/star-times-upl.svg";
import rugbyLogo from "../assets/nile-rugby.svg";
import smackLogo from "../assets/smack-league.svg";
import nblLogo from "../assets/national-basketball.svg";
import { useNavigate } from "react-router-dom";

const leagues = [
  {
    name: "UPL Fantasy",
    season: "2025/26 Season",
    desc: "Create your squad from UPL stars and manage them to victory.",
    logo: uplLogo,
  },
  {
    name: "Rugby Premiership Fantasy",
    season: "2025/26 Season",
    desc: "Pick your XV and dominate the pitch every weekend.",
    logo: rugbyLogo,
  },
  {
    name: "SMACK League Fantasy",
    season: "2023/24 Season",
    desc: "Create your squad from SMACK League stars and manage them to victory.",
    logo: smackLogo,
  },
  {
    name: "NBL Fantasy",
    season: "2025/26 Season",
    desc: "Assemble your five and climb the ranks to the top.",
    logo: nblLogo,
  },
];

function FantasyLeagues() {
  const navigate = useNavigate();

  function goToFantasyHub() {
    navigate("/fantasy");
  }

  return (
    <section className="fantasy-leagues">
      <div className="section-header">
        <h2 className="section-title">FANTASY PREMIER LEAGUES</h2>

        <button
          type="button"
          className="view-all-link"
          onClick={goToFantasyHub}
        >
          View All Fantasy Leagues
        </button>
      </div>

      <div className="fantasy-row">
        {leagues.map((league) => (
          <div className="fantasy-card" key={league.name}>
            <div className="fantasy-header">
              <div className="fantasy-logo">
                <img src={league.logo} alt={league.name} />
              </div>

              <div>
                <h4 className="fantasy-name">{league.name}</h4>
                <p className="fantasy-season">{league.season}</p>
              </div>
            </div>

            <p className="fantasy-desc">{league.desc}</p>

            <button
              type="button"
              className="join-league-btn"
              onClick={goToFantasyHub}
            >
              Join League
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FantasyLeagues;
