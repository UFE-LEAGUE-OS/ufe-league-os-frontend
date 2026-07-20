import "../../styles/pages/NewsPage.css";
import "../../styles/pages/About.css";
import Footer from "../../components/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useState } from "react";

// Sport images
import footballImg from "../../assets/football-card.png";
import rugbyImg from "../../assets/women.jfif";
import basketballImg from "../../assets/story4.jfif";
import aboutImage from "../../assets/fantasylandingpage.png";
import heroImage from "../../assets/hero.png"

type LocationState = { tab?: string };

export default function AboutUs() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [activeTab, setActiveTab] = useState(state?.tab ?? "about");
  const [sportTab, setSportTab] = useState("football");
  const [clubTab, setClubTab] = useState("football");

  // ..........................Nav................... 
  const navItems = [
    { key: "about", label: "About Us" },
    { key: "how-it-works", label: "How It Works" },
    { key: "league", label: "About Leagues" },
    { key: "a-club", label: "About Clubs" },
  ];

  // .....................League data ...............
  const leagues = {
    football: {
      img: footballImg,
      title: "Football in Uganda",
      items: [
        { name: "Uganda Premier League", desc: "Top professional league.", meta: "16+ clubs" },
        { name: "FUFA Big League", desc: "Second division competition.", meta: "12+ clubs" },
        { name: "Regional Leagues", desc: "Grassroots football development.", meta: "100+ clubs" },
        { name: "University League", desc: "Student football competition.", meta: "30+ clubs" },
      ],
    },
    rugby: {
      img: rugbyImg,
      title: "Rugby in Uganda",
      items: [
        { name: "Nile Special Premiership", desc: "Top rugby league.", meta: "12 clubs" },
        { name: "Rugby Championship", desc: "Development league.", meta: "10+ clubs" },
        { name: "University Rugby League", desc: "Talent pipeline system.", meta: "15+ clubs" },
        { name: "East Africa Cup", desc: "Regional competition.", meta: "8+ clubs" },
      ],
    },
    basketball: {
      img: basketballImg,
      title: "Basketball in Uganda",
      items: [
        { name: "National Basketball League", desc: "Top tier competition.", meta: "14 clubs" },
        { name: "Division Leagues", desc: "Development structure.", meta: "20+ clubs" },
        { name: "University League", desc: "Student competition.", meta: "10+ clubs" },
        { name: "Street Basketball League", desc: "Urban grassroots culture.", meta: "25+ clubs" },
      ],
    },
  };

  // .............. Club data ..........................
  const clubs = {
    football: {
      img: footballImg,
      items: [
        { name: "Vipers SC", desc: "Modern dominant Ugandan club.", meta: "6+ UPL titles · 1M+ fans" },
        { name: "KCCA FC", desc: "Most successful club historically.", meta: "13+ league titles · 2M+ fans" },
        { name: "SC Villa", desc: "Record league champions.", meta: "16+ titles · 3M+ fans" },
        { name: "BUL FC", desc: "Fast rising competitive club.", meta: "Growing · 500K+ fans" },
        { name: "Express FC", desc: "Historic Kampala club.", meta: "Multiple league wins · 800K+ fans" },
        { name: "URA FC", desc: "Government-backed football club.", meta: "Multiple UPL wins" },
        { name: "Police FC", desc: "Consistent top-flight competitor.", meta: "Defensive discipline" },
        { name: "Onduparaka FC", desc: "Western Uganda fan powerhouse.", meta: "Passionate fanbase" },
        { name: "Wakiso Giants", desc: "Modern ambitious football project.", meta: "Rising club" },
        { name: "Maroons FC", desc: "One of Uganda's oldest clubs.", meta: "Strong discipline" },
      ],
    },
    rugby: {
      img: rugbyImg,
      items: [
        { name: "Heathens RFC", desc: "Most dominant rugby club.", meta: "15+ trophies" },
        { name: "Kobs RFC", desc: "Historic university-linked club.", meta: "10+ trophies" },
        { name: "Stanbic Pirates", desc: "Fast growing elite club.", meta: "Competitive" },
        { name: "Rhinos RFC", desc: "Physical and disciplined squad.", meta: "Strong contender" },
        { name: "Buffaloes RFC", desc: "Traditional rugby powerhouse.", meta: "Elite" },
        { name: "Elgon Wolves", desc: "Fast improving Eastern Uganda club.", meta: "" },
        { name: "Plascon Mongers", desc: "Experienced coastal-style team.", meta: "" },
        { name: "She Cranes Rugby", desc: "Women's rugby development force.", meta: "" },
        { name: "Black Pirates Academy", desc: "Youth development pipeline.", meta: "" },
        { name: "Jinja Hippos", desc: "Strong emerging rugby squad.", meta: "" },
      ],
    },
    basketball: {
      img: basketballImg,
      items: [
        { name: "City Oilers", desc: "Most dominant basketball team.", meta: "10+ NBL titles" },
        { name: "UCU Canons", desc: "University powerhouse.", meta: "NBL" },
        { name: "KIU Titans", desc: "Highly competitive club.", meta: "Rising" },
        { name: "JT Jaguars", desc: "Fast improving basketball club.", meta: "Emerging" },
        { name: "Namuwongo Blazers", desc: "Fan-favorite Kampala club.", meta: "Popular" },
        { name: "Power Basketball Club", desc: "Strong Kampala-based team.", meta: "" },
        { name: "Rez Life Saints", desc: "Fast rising competitive squad.", meta: "" },
        { name: "UPDF Tomahawks", desc: "Military-backed disciplined team.", meta: "" },
        { name: "Jinja Jaguars", desc: "Eastern Uganda basketball force.", meta: "" },
        { name: "Sommet BC", desc: "Young talent-driven club.", meta: "" },
      ],
    },
  };

  const currentLeague = leagues[sportTab as keyof typeof leagues];
  const currentClub = clubs[clubTab as keyof typeof clubs];

  return (
    <div className="about-us">

      {/*................... NAVBAR .....................*/}
      <nav className="news-navbar">
        <div className="navbar-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <img src={logo} alt="Logo" />
        </div>

        <div className="navbar-links">
          {navItems.map(({ key, label }) => (
            <li
              key={key}
              className={activeTab === key ? "active" : ""}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </li>
          ))}
        </div>

        <div className="navbar-actions">
          <button className="login-btn" onClick={() => navigate("/login")}>Login</button>
          <button className="signup-btn" onClick={() => navigate("/register")}>Sign Up</button>
        </div>
      </nav>

      <div className="about-main-hero">

        {/* ............... ABOUT ......................... */}
        {activeTab === "about" && (
          <div className="about-main-overlay">
            <div className="about-main-content">

              <h1>About <span>UFE League</span></h1>

              <p>
                A unified sports ecosystem connecting fans, clubs, leagues, and federations
                into one digital platform for engagement, management, and growth.
              </p>

              <img src={aboutImage} alt="League OS" />

              <div className="about-features">
                {[
                  { title: "Fan Engagement", desc: "Connect fans with teams, matches, and live updates in real time." },
                  { title: "League Management", desc: "Manage fixtures, standings, and competition structures seamlessly." },
                  { title: "Club Operations", desc: "Handle squads, registrations, and club performance tracking." },
                  { title: "Digital Ticketing", desc: "Secure ticketing, memberships, and stadium access control." },
                  { title: "Analytics", desc: "Real-time insights for sponsors, leagues, and performance tracking." },
                  { title: "Sponsorships", desc: "Enable sponsor activation, visibility, and engagement tracking." },
                ].map(({ title, desc }) => (
                  <div className="feature-card" key={title}>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                ))}
              </div>

              <div className="about-stats">
                {[["16+", "Leagues"], ["50+", "Clubs"], ["10K+", "Fans"]].map(([num, label]) => (
                  <div className="stat" key={label}>
                    <h2>{num}</h2>
                    <p>{label}</p>
                  </div>
                ))}
              </div>

              <button className="aboutus-main-btn">Learn More</button>

            </div>
          </div>
        )}

        {/* ................... HOW IT WORKS .......................... */}
        {activeTab === "how-it-works" && (
          <div className="how-it-works-page">

            <section className="league-h-hero" 
             style={{
    backgroundImage: `
      linear-gradient(90deg, rgba(10, 10, 16, 0.88), rgba(0, 0, 0, 0.4)),
      url(${heroImage})
    `,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  }}
            >
              <div className="hero-h-content">
                <h1>The Operating System <span>For Connected Sports</span></h1>
                <p>
                  League OS connects leagues, clubs, fans, and sponsors into one powerful
                  digital sports ecosystem built to manage, grow, and transform sport.
                </p>
                <div className="hero-h-buttons">
                  <button className="primary-h-btn" onClick={() => navigate("/")}>Explore Platform</button>
                  <button className="outline-h-btn" onClick={() => navigate("/login")}>Join</button>
                </div>
                <div className="hero-h-stats">
                  {[["16", "Leagues"], ["56", "Clubs"], ["10K+", "Fans"]].map(([num, label]) => (
                    <div key={label}><h2>{num}</h2><p>{label}</p></div>
                  ))}
                </div>
              </div>
            </section>

            <section className="about-los">
              <div className="los-image">
                <img src={aboutImage} alt="League OS" />
              </div>
              <div className="h-los-content">
                <h2>One Platform. <span>Every Part Of The Game.</span></h2>
                <p>
                  Managing sports involves competitions, clubs, players, fans and sponsorships.
                  UFE League OS brings everything together into one connected platform.
                </p>
                <div className="h-los-points">
                  {["League Management", "Club Operations", "Development", "Fan Engagement", "Sponsorship Management", "Sports Analytics"].map(pt => (
                    <p key={pt}>✔ {pt}</p>
                  ))}
                </div>
              </div>
            </section>

            <section className="h-process-section">
              <h2>How The System Works</h2>
              <p>A simple process that connects the entire sports ecosystem.</p>
              <div className="h-process-grid">
                {[
                  ["01", "Create Your Profile", "Fans, clubs and leagues create their digital identity."],
                  ["02", "Manage Competitions", "Organize fixtures, results, rankings and operations."],
                  ["03", "Connect Community", "Bring together fans, players, clubs and sponsors."],
                  ["04", "Grow The Game", "Use insights and analytics to improve sports."],
                ].map(([num, title, desc]) => (
                  <div className="h-process-card" key={num}>
                    <span>{num}</span>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="h-users-section">
              <h2>Built For The Entire Sports Ecosystem</h2>
              <div className="h-users-grid">
                {[
                  ["", "Leagues", "Manage competitions, governance and standings."],
                  ["", "Clubs", "Manage teams, players and operations."],
                  ["", "Fans", "Follow teams and engage with sports."],
                  ["", "Sponsors", "Build profiles and track development."],
                ].map(([icon, title, desc]) => (
                  <div className="h-user-card" key={title}>
                    <h3>{icon} {title}</h3>
                    <p>{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="h-cta-section">
              <h2>Build The Future Of Sports With League OS</h2>
              <p>Join a connected sports ecosystem designed for growth.</p>
              <button onClick={() => navigate("/login")}>Get Started</button>
            </section>

          </div>
        )}

        {/* .............. LEAGUES...........................*/}
        {activeTab === "league" && (
          <div className="about-leagues">
            <div className="sport-tabs">
              {(["football", "rugby", "basketball"] as const).map(sport => (
                <button
                  key={sport}
                  className={sportTab === sport ? "active" : ""}
                  onClick={() => setSportTab(sport)}
                >
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </button>
              ))}
            </div>

            <div className="sport-section">
              <img src={currentLeague.img} className="sport-banner" alt={currentLeague.title} />
              <h2>{currentLeague.title}</h2>
              <div className="league-row">
                {currentLeague.items.map(({ name, desc, meta }) => (
                  <div className="league-card" key={name}>
                    <h3>{name}</h3>
                    <p>{desc}</p>
                    {meta && <p><strong>{meta}</strong></p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ................... CLUBS ......................... */}
        {activeTab === "a-club" && (
          <div className="about-leagues">
            <div className="sport-tabs">
              {(["football", "rugby", "basketball"] as const).map(sport => (
                <button
                  key={sport}
                  className={clubTab === sport ? "active" : ""}
                  onClick={() => setClubTab(sport)}
                >
                  {sport.charAt(0).toUpperCase() + sport.slice(1)} Clubs
                </button>
              ))}
            </div>

            <div className="sport-section">
              <img src={currentClub.img} className="sport-banner" alt="Club banner" />
              <div className="league-row">
                {currentClub.items.map(({ name, desc, meta }) => (
                  <div className="league-card" key={name}>
                    <h3>{name}</h3>
                    <p>{desc}</p>
                    {meta && <p><strong>{meta}</strong></p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      <Footer />
    </div>
  );
}
