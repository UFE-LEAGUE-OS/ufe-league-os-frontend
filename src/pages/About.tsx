import "../styles/pages/NewsPage.css";
import "../styles/pages/About.css";
import Footer from "../components/Footer";
import { FiSearch } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { useState } from "react";
import aboutImage from "../assets/logo.png";

type LocationState = {
  tab?: string;
};

export default function AboutUs() {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;

  const [activeTab, setActiveTab] = useState(state?.tab ?? "about");

  return (
    <div className="about-us">

      {/*....Nav Bar...... */}
      <nav className="news-navbar">
        <div
          className="navbar-logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <img src={logo} alt="Logo" />
        </div>

        <div className="navbar-links">
          <li
            className={activeTab === "about" ? "active" : ""}
            onClick={() => setActiveTab("about")}
          >
            About Us
          </li>

          <li
            className={activeTab === "how-it-works" ? "active" : ""}
            onClick={() => setActiveTab("how-it-works")}
          >
            How It Works
          </li>
           <li
            className={activeTab === "a-league" ? "active" : ""}
            onClick={() => setActiveTab("league")}
          >
            About Leagues
          </li>
           <li
            className={activeTab === "a-club" ? "active" : ""}
            onClick={() => setActiveTab("a-club")}
          >
            About Club
          </li>
        </div>

        <div className="navbar-icons">
          <div className="search-container">
           
            <FiSearch
              className="icon"
              
            />
          </div>
        </div>
      </nav>

      {/*.....Heros sections..... */}
      <div className="about-main-hero">

        {/*......About Us..... */}
        {activeTab === "about" && (
          <div className="about-main-overlay">
            <div className="about-main-content">
              <h1>
                About <span>UFE League</span>
              </h1>
              <p>
                Building the future of sports in Uganda by connecting clubs,
                athletes, fans, and communities through a unified league platform.
              </p>
              <button className="aboutus-main-btn">Learn More</button>
            </div>
            
          </div>
        )}

        {/*.....How it works..... */}
        {activeTab === "how-it-works" && (
          <div className="how-it-works-page">

            {/* HERO SECTION */}
            <section className="league-h-hero">
              <div className="hero-h-content">
                <h1>
                  The Operating System
                  <span>For Connected Sports</span>
                </h1>
                <p>
                  League OS connects leagues, clubs, fans,
                  and Sponsors into one powerful digital sports ecosystem
                  built to manage, grow, and transform sports system.
                </p>
                <div className="hero-h-buttons">
                  <button className="primary-h-btn" onClick={() => navigate('/')} style={{ cursor: "pointer" }}>
                    Explore Platform
                  </button>
                  <button className="outline-h-btn" onClick={() => navigate('/login')} style={{ cursor: "pointer" }}>
                    Join
                  </button>
                </div>
                <div className="hero-h-stats">
                  <div>
                    <h2>16</h2>
                    <p>Leagues</p>
                  </div>
                  <div>
                    <h2>56</h2>
                    <p>Clubs</p>
                  </div>
                  <div>
                    <h2>10K+</h2>
                    <p>Fans</p>
                  </div>
                </div>
              </div>
            </section>

            {/* WHAT IS LEAGUE OS */}
            <section className="about-los">
              <div className="los-image">
                <img src={aboutImage} alt="League OS" />
              </div>
              <div className="h-los-content">
                <h2>
                  One Platform.
                  <span> Every Part Of The Game.</span>
                </h2>
                <p>
                  Managing sports involves multiple areas including
                  competitions, clubs, players, fans and sponsorships.
                  UFE League OS brings everything together into one
                  connected platform.
                </p>
                <div className="h-los-points">
                  <p>✔ League Management</p>
                  <p>✔ Club Operations</p>
                  <p>✔ Development</p>
                  <p>✔ Fan Engagement</p>
                  <p>✔ Sponsorship Management</p>
                  <p>✔ Sports Analytics</p>
                </div>
              </div>
            </section>

            {/* HOW SYSTEM WORKS */}
            <section className="h-process-section">
              <h2>How The System Works</h2>
              <p>A simple process that connects the entire sports ecosystem.</p>
              <div className="h-process-grid">
                <div className="h-process-card">
                  <span>01</span>
                  <h3>Create Your Profile</h3>
                  <p>Fans, Clubs and leagues create their digital identity.</p>
                </div>
                <div className="h-process-card">
                  <span>02</span>
                  <h3>Manage Competitions</h3>
                  <p>Organize fixtures, results, rankings and operations.</p>
                </div>
                <div className="h-process-card">
                  <span>03</span>
                  <h3>Connect Community</h3>
                  <p>Bring together fans, players, clubs and sponsors.</p>
                </div>
                <div className="h-process-card">
                  <span>04</span>
                  <h3>Grow The Game</h3>
                  <p>Use insights and analytics to improve sports.</p>
                </div>
              </div>
            </section>

            {/* USERS */}
            <section className="h-users-section">
              <h2>Built For The Entire Sports Ecosystem</h2>
              <div className="h-users-grid">
                <div className="h-user-card">
                  <h3>🟟 Leagues</h3>
                  <p>Manage competitions, governance and standings.</p>
                </div>
                <div className="h-user-card">
                  <h3>⚽ Clubs</h3>
                  <p>Manage teams, players and operations.</p>
                </div>
                <div className="h-user-card">
                  <h3>👥 Fans</h3>
                  <p>Follow teams and engage with sports.</p>
                </div>
                <div className="h-user-card">
                  <h3>👥 Sponsors</h3>
                  <p>Build profiles and track development.</p>
                </div>
              </div>
            </section>

            {/* Last section */}
            <section className="h-cta-section">
              <h2>Build The Future Of Sports With League OS</h2>
              <p>Join a connected sports ecosystem designed for growth.</p>
              <button onClick={() => navigate('/login')} style={{ cursor: "pointer" }}>
                Get Started
              </button>
            </section>
          </div>
        )}

        
      </div>

      <Footer />
    </div>
  );
}