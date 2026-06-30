import './FeaturedClubs.css';

import kccaLogo from '../assets/kcca.png';
import kobsLogo from '../assets/kobs.jpg';
import impisLogo from '../assets/impis.jpg';
import scVillaLogo from '../assets/sc-villa.png';
import piratesLogo from '../assets/standic-pirates.png';
import platinumLogo from '../assets/platinum-heathens.jpg';
import blazersLogo from '../assets/nam-blazers.png';
import logo from '../assets/logo.png';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../utils/tokenManager.js";


const clubs = [
  { name: 'KCCA FC', type: 'Football Club', tagline: 'The Pride of Kampala', logo: kccaLogo },
  { name: 'KCB KOBS', type: 'Rugby Club', tagline: 'Poetry in Motion', logo: kobsLogo },
  { name: 'IMPIS RFC', type: 'Rugby Club', tagline: 'Arrogance', logo: impisLogo },
  { name: 'SC Villa', type: 'Football Club', tagline: 'Joogos for Life', logo: scVillaLogo },
  { name: 'STANBIC BLACK PIRATES', type: 'Rugby Club', tagline: 'Pirates Strong', logo: piratesLogo },
  { name: 'PLATINUM HEATHENS', type: 'Rugby Club', tagline: 'Yellow Machine', logo: platinumLogo },
  { name: 'NAMUWONGO BLAZERS', type: 'Basketball Club', tagline: 'The Slum Dwellers', logo: blazersLogo },
];

function getMembershipSlug(clubName: string) {
  const slugMap: Record<string, string> = {
    'KCCA FC': 'kcca-fc',
    'KCB KOBS': 'kobs',
    'IMPIS RFC': 'impis-rfc',
    'SC Villa': 'sc-villa',
    'STANBIC BLACK PIRATES': 'black-pirates',
    'PLATINUM HEATHENS': 'platinum-heathens',
    'NAMUWONGO BLAZERS': 'namuwongo-blazers',
  };

  return slugMap[clubName] ?? 'kobs';
}



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
        onClick={(e)=> e.stopPropagation()}
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
          You need to be logged in to become a club member.
          Login or create an account to continue.
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
          Join clubs, connect with fans, and enjoy League OS.
        </p>


      </div>

    </div>

  );

}




function FeaturedClubs() {


  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

  function handleBecomeMember(clubName: string) {
    const membershipSlug = getMembershipSlug(clubName);

    if (getToken()) {
      navigate(`/memberships/${membershipSlug}`);
      return;
    }

    setShowPopup(true);
  }



  useEffect(()=>{

    if(showPopup){
      document.body.style.overflow = "hidden";
    }
    else{
      document.body.style.overflow = "auto";
    }


    return()=>{
      document.body.style.overflow = "auto";
    }

  },[showPopup]);




  return (

    <section className="featured-clubs">


      <div className="section-header">

        <h2 className="section-title">
          FEATURED CLUBS
        </h2>

        <button type="button" className="view-all-link" onClick={() => navigate('/clubs')}>
          View All Clubs
        </button>

      </div>



      <div className="clubs-row">


        {clubs.map((club)=>(

          <div 
            className="club-card"
            key={club.name}
          >

            <div className="club-logo">

              <img 
                src={club.logo}
                alt={club.name}
              />

            </div>


            <h4 className="club-name">
              {club.name}
            </h4>


            <p className="club-type">
              {club.type}
            </p>


            <p className="club-tagline">
              {club.tagline}
            </p>



            <button 
              className="become-member-btn"
              onClick={() => handleBecomeMember(club.name)}
            >
              Become Member
            </button>


          </div>

        ))}



       


      </div>




      {showPopup && (

        <LoginPromptModal

          onClose={()=>setShowPopup(false)}

          onLogin={()=>navigate("/login")}

          onRegister={()=>navigate("/register")}

        />

      )}


    </section>

  );

}


export default FeaturedClubs;