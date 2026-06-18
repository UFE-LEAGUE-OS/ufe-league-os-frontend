import { useNavigate } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { FaLinkedin } from 'react-icons/fa';
import './CompetitionsFooter.css';
import logo from '../assets/logo.png';

function CompetitionsFooter() {
  const navigate = useNavigate();

  return (
    <footer className="comp-footer">
      <div className="comp-footer-top">
        <div className="comp-footer-brand">
          <img src={logo} alt="League OS" className="comp-footer-logo" />
        </div>

        <div className="comp-footer-col">
          <h4>Platform</h4>
          <a onClick={() => navigate('/')}>Sports</a>
          <a href="#">Fixtures</a>
          <a href="#">Standings</a>
          <a href="#">News</a>
          <a onClick={() => navigate('/competitions')}>Competitions</a>
          <a href="#">Unions & Clubs</a>
        </div>

        <div className="comp-footer-col">
          <h4>Account</h4>
          <a onClick={() => navigate('/login')}>Signin</a>
          <a onClick={() => navigate('/register')}>Register</a>
          <a href="#">Become a sponsor</a>
        </div>

        <div className="comp-footer-col">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of use</a>
        </div>

        <div className="comp-footer-col">
          <h4>Follow</h4>
          <div className="comp-footer-socials">
            <div className="comp-social-icon">
              <FaLinkedin size={20} />
            </div>
            <div className="comp-social-icon">
              <FaFacebook size={20} />
            </div>
            <div className="comp-social-icon">
              <FaXTwitter size={20} />
            </div>
            <div className="comp-social-icon">
              <FaInstagram size={20} />
            </div>
            <div className="comp-social-icon">
              <FaYoutube size={20} />
            </div>
            <div className="comp-social-icon">
              <FaTiktok size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="comp-footer-bottom">
        <p>© 2026 LeagueOS. All rights reserved</p>
      </div>
    </footer>
  );
}

export default CompetitionsFooter;