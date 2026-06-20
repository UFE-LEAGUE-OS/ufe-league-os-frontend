import './Footer.css';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img src={logo} alt="League OS" className="footer-logo" />
          <p className="footer-tagline">
            The unified fan engagement and league platform for Ugandan sports.
          </p>
        </div>

        <div className="footer-col">
          <h4>PLATFORM</h4>
          <a href="#">About Us</a>
          <a href="#">How It Works</a>
          <a href="#">For Leagues</a>
          <a href="#">For Clubs</a>
        </div>

        <div className="footer-col">
          <h4>COMPETITIONS</h4>
          <a href="#">Football</a>
          <a href="#">Rugby</a>
          <a href="#">Basketball</a>
          <a href="#">All Competitions</a>
        </div>

        <div className="footer-col">
          <h4>SUPPORT</h4>
          <Link to="/support">Help Center</Link>
          <Link to="/support">Contact Us</Link>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
        </div>

        <div className="footer-col">
          <h4>FOLLOW US</h4>
          <div className="footer-socials">
            <FaFacebook size={20} />
            <FaXTwitter size={20} />
            <FaInstagram size={20} />
            <FaYoutube size={20} />
            <FaTiktok size={20} />
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>2026 League OS. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;