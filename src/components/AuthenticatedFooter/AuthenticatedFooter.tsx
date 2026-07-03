import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import leagueOsWordmark from "../../assets/league-os-wordmark.svg";
import styles from "./AuthenticatedFooter.module.css";

function AuthenticatedFooter() {
    const currentYear = new Date().getFullYear();
    const navigate = useNavigate();

    return (
        <footer className={styles.footer}>
            <div className={styles.footerTop}>
                <div className={styles.footerBrand}>
                    <Link to="/" className={styles.logoLink} aria-label="Go to League OS landing page">
                        <img src={leagueOsWordmark} alt="League OS" />
                    </Link>
                    <p className={styles.footerTagline}>
                        The unified fan engagement and league platform for Ugandan sports.
                    </p>
                </div>

                <div className={styles.footerCol}>
                    <h4>Platform</h4>
                    <Link to="/about" state={{ tab: "about" }}>About Us</Link>
                    <Link to="/about" state={{ tab: "how-it-works" }}>How It Works</Link>
                    <Link to="/about" state={{ tab: "a-league" }}>For Leagues</Link>
                    <Link to="/about" state={{ tab: "a-club" }}>For Clubs</Link>
                </div>

                <div className={styles.footerCol}>
                    <h4>Competitions</h4>
                    <button type="button" onClick={() => navigate("/competitions#football-card")}>Football</button>
                    <button type="button" onClick={() => navigate("/competitions#rugby-card")}>Rugby</button>
                    <button type="button" onClick={() => navigate("/competitions#basketball-card")}>Basketball</button>
                    <button type="button" onClick={() => navigate("/competitions")}>All Competitions</button>
                </div>

                <div className={styles.footerCol}>
                    <h4>Support</h4>
                    <Link to="/support">Help Center</Link>
                    <Link to="/support">Contact Us</Link>
                    <Link to="/terms">Terms of Service</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                </div>

                <div className={styles.footerCol}>
                    <h4>Follow Us</h4>
                    <div className={styles.footerSocials} aria-label="League OS social links">
                        <FaFacebook size={18} aria-hidden="true" />
                        <FaXTwitter size={18} aria-hidden="true" />
                        <FaInstagram size={18} aria-hidden="true" />
                        <FaYoutube size={18} aria-hidden="true" />
                        <FaTiktok size={18} aria-hidden="true" />
                    </div>
                </div>
            </div>

            <div className={styles.footerBottom}>
                <p>{currentYear} League OS. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default AuthenticatedFooter;
