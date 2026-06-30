import './FantasyLeagues.css';
import uplLogo from '../assets/star-times-upl.svg';
import rugbyLogo from '../assets/nile-rugby.svg';
import smackLogo from '../assets/smack-league.svg';
import nblLogo from '../assets/national-basketball.svg';
import logo from '../assets/logo.png';
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";


const leagues = [
  {
    name: 'UPL Fantasy',
    season: '2025/26 Season',
    desc: 'Create your squad from UPL stars and manage them to victory.',
    logo: uplLogo,
  },
  {
    name: 'Rugby Premiership Fantasy',
    season: '2025/26 Season',
    desc: 'Pick your XV and dominate the pitch every weekend.',
    logo: rugbyLogo,
  },
  {
    name: 'SMACK League Fantasy',
    season: '2023/24 Season',
    desc: 'Create your squad from SMACK League stars and manage them to victory.',
    logo: smackLogo,
  },
  {
    name: 'NBL Fantasy',
    season: '2025/26 Season',
    desc: 'Assemble your five and climb the ranks to the top.',
    logo: nblLogo,
  },
];


// POPUP COMPONENT
function LoginPromptModal({
  onClose,
  onLogin,
  onRegister,
}: {
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}) {

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
    >

      <div 
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >

        <button 
          className="modal-close"
          onClick={onClose}
        >
          ✕
        </button>


        <img 
          src={logo}
          alt="League OS"
          className="modal-logo"
        />


        <h2 className="modal-title">
          Login Required
        </h2>


        <p className="modal-body">
          You need to be logged in to join a fantasy league.
          Create an account or login to continue.
        </p>


        <div className="modal-actions">

          <button 
            className="btn-primary"
            onClick={onLogin}
          >
            Login
          </button>


          <button 
            className="btn-secondary"
            onClick={onRegister}
          >
            Create Account
          </button>

        </div>


        <p className="modal-footnote">
          Join fantasy leagues and compete with other fans.
        </p>

      </div>

    </div>
  );
}



function FantasyLeagues() {

  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {

    if(showPopup){
      document.body.style.overflow = "hidden";
    }
    else{
      document.body.style.overflow = "auto";
    }


    return () => {
      document.body.style.overflow = "auto";
    };

  }, [showPopup]);



  return (

    <section className="fantasy-leagues">


      <div className="section-header">

        <h2 className="section-title">
          FANTASY PREMIER LEAGUES
        </h2>

        <a href="#" className="view-all-link">
          View All Fantasy Leagues
        </a>

      </div>



      <div className="fantasy-row">

        {leagues.map((league)=>(

          <div 
            className="fantasy-card" 
            key={league.name}
          >

            <div className="fantasy-header">

              <div className="fantasy-logo">
                <img 
                  src={league.logo} 
                  alt={league.name}
                />
              </div>


              <div>

                <h4 className="fantasy-name">
                  {league.name}
                </h4>

                <p className="fantasy-season">
                  {league.season}
                </p>

              </div>

            </div>



            <p className="fantasy-desc">
              {league.desc}
            </p>



            <button 
              className="join-league-btn"
              onClick={() => setShowPopup(true)}
            >
              Join League
            </button>


          </div>

        ))}



        {/*<button className="fantasy-arrow">
          →
        </button>*/}


      </div>




      {showPopup && (

        <LoginPromptModal

          onClose={() => setShowPopup(false)}

          onLogin={() => navigate("/login")}

          onRegister={() => navigate("/register")}

        />

      )}



    </section>

  );

}


export default FantasyLeagues;