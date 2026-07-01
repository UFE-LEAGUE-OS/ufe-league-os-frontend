import { Link } from "react-router-dom";
import leagueOsWordmark from "../../assets/league-os-wordmark.svg";
import styles from "./AuthenticatedFooter.module.css";

function AuthenticatedFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.identity}>
                <Link to="/" className={styles.logoLink} aria-label="Go to League OS landing page">
                    <img src={leagueOsWordmark} alt="League OS" />
                </Link>

                <div>
                    <p className={styles.brand}>League OS © {currentYear}</p>
                    <p className={styles.credit}>
                        Fonts made from{" "}
                        <a href="http://www.onlinewebfonts.com" target="_blank" rel="noreferrer">
                            Web Fonts
                        </a>{" "}
                        is licensed by{" "}
                        <a
                            href="https://creativecommons.org/licenses/by/4.0/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            CC BY 4.0
                        </a>
                        .
                    </p>
                </div>
            </div>

            <nav className={styles.links} aria-label="Authenticated footer links">
                <Link to="/support">Support</Link>
                <Link to="/terms">Terms</Link>
                <Link to="/privacy">Privacy</Link>
                <Link to="/about">About</Link>
            </nav>
        </footer>
    );
}

export default AuthenticatedFooter;
