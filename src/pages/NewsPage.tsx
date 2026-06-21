import "../styles/pages/landing/NewsPage.css"
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiBell, FiUser, FiSearch } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaXTwitter, FaArrowRight } from "react-icons/fa6";
import logo from "../assets/logo.png";
import heroImg from "../assets/basketball-card.png";
import news1 from "../assets/news.png";
import news2 from "../assets/news.png";
import news3 from "../assets/news.png";

type Notification = {
  id: number;
  message: string;
  read: boolean;
};

export default function NewsSection() {
    const [profile, setProfile] = useState<Record<string, string> | null>(null);
    const navigate = useNavigate();
    const [expand, setExpand] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/profile/")
            .then(res => setProfile(res.data));
    }, []);

    useEffect(() => {
        axios.get("http://127.0.0.1:8000/api/notifications/")
            .then(res => setNotifications(res.data));
    }, []);

    return (
        <div className="news-page">
            <nav className="news-navbar">
                <div className="navbar-logo"><img src={logo} alt="Logo" /></div>
                <div className="navbar-links">
                    <a href="#">Overview</a>
                    <a href="#">Clubs</a>
                    <a href="#">Competitions</a>
                    <a href="#">Unions</a>
                    <a href="#">News</a>
                </div>
                <div className="navbar-icons">
                    <div className="search-container">
                        {showSearch && <input type="text" placeholder="Search..." className="search-input" />}
                        <FiSearch className="icon" onClick={() => setShowSearch(!showSearch)} />
                    </div>

                    <div className="notification-wrapper">
                        <FiBell className="icon" onClick={() => setOpen(!open)} />
                        {notifications.length > 0 && (
                            <span className="badge">
                                {notifications.filter(n => !n.read).length}
                            </span>
                        )}
                        {open && (
                            <div className="notification-dropdown">
                                {notifications.length === 0 ? (
                                    <p>No notifications</p>
                                ) : (
                                    notifications.map((n) => (
                                        <div key={n.id} className="notification-item">
                                            {n.message}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className="profile-wrapper">
                        {profile?.image ? (
                            <img
                                src={profile.image}
                                className="profile-img"
                                onClick={() => setExpand(!expand)}
                            />
                        ) : (
                            <FiUser
                                className="icon"
                                onClick={() => setExpand(!expand)}
                            />
                        )}
                        {expand && (
                            <div className="profile-dropdown">
                                <div className="item" onClick={() => navigate("/edit-profile")}>Edit Profile</div>
                                <div className="item" onClick={() => navigate("/edit-profile")}>Settings</div>
                                <div className="item logout" onClick={() => navigate("/")}>Logout</div>
                            </div>
                        )}
                        <span className="username">
                            {profile?.username}
                        </span>
                    </div>
                </div>
            </nav>

            <section className="hero-section">
                <div className="hero-image">
                    <img src={heroImg} alt="Hero" />
                    <div className="hero-overlay">
                        <h1 className="hero-title">
                            <span>Heathens Outmuscle Kobs in</span>
                            <br />
                            Gritty Kampala Derby
                        </h1>
                        <p>
                            A thrilling encounter saw Heathens dominate Kobs in a high-intensity
                            match filled with tactical brilliance and strong defensive play.
                        </p>
                        <div className="hero-buttons">
                            <button className="btn-primary">
                                Read full story <FaArrowRight />
                            </button>
                            <button className="btn-secondary">
                                Matches stats
                            </button>
                        </div>
                    </div>
                </div>

                <div className="hero-side">
                    <div className="hero-card trending-card">
                        <h3>Trending</h3>
                        <div className="trend-list">
                            <div className="trend-item">
                                <div className="trend-top">
                                    <span className="trend-num">01</span>
                                    <span className="trend-text">KCCA has added a new member</span>
                                </div>
                                <div className="trend-bottom">
                                    <span className="trend-sport">Football</span>
                                    <span className="trend-time">2h ago</span>
                                </div>
                            </div>
                            <div className="trend-item">
                                <div className="trend-top">
                                    <span className="trend-num">02</span>
                                    <span className="trend-text">Heathens dominate Kobs</span>
                                </div>
                                <div className="trend-bottom">
                                    <span className="trend-sport">Rugby</span>
                                    <span className="trend-time">5h ago</span>
                                </div>
                            </div>
                            <div className="trend-item">
                                <div className="trend-top">
                                    <span className="trend-num">03</span>
                                    <span className="trend-text">Fixtures released for new season</span>
                                </div>
                                <div className="trend-bottom">
                                    <span className="trend-sport">Football</span>
                                    <span className="trend-time">1d ago</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-card">
                        <div className="results-header">
                            <h3>Rugby Results</h3>
                            <button className="view-table">View full table</button>
                        </div>
                        <div className="results-table">
                            <div className="results-row header">
                                <span>Team</span>
                                <span>Score</span>
                                <span>Team</span>
                            </div>
                            <div className="results-row">
                                <span>Kobs</span>
                                <span>12 - 24</span>
                                <span>Heathens</span>
                            </div>
                            <div className="results-row">
                                <span>Rhinos</span>
                                <span>18 - 18</span>
                                <span>Buffaloes</span>
                            </div>
                            <div className="results-row">
                                <span>Warriors</span>
                                <span>10 - 31</span>
                                <span>She Wolves</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="latest-headlines">
                <h2 className="section-title">Latest Headlines</h2>
                <div className="news-grid">
                    <div className="news-card">
                        <img src={news1} alt="news" />
                        <h3>Heathens Dominate Kobs in Rugby Clash</h3>
                        <p>
                            A strong performance saw Heathens control possession and secure a
                            decisive victory in a thrilling encounter.
                        </p>
                        <div className="news-footer-info">
                            <span>2h ago</span>
                            <span>1.2k</span>
                        </div>
                    </div>
                    <div className="news-card">
                        <img src={news2} alt="news" />
                        <h3>Rugby Premiership Fixtures Released</h3>
                        <p>
                            The new season schedule has been announced with exciting matchups
                            across all top teams.
                        </p>
                        <div className="news-footer-info">
                            <span>5h ago</span>
                            <span>980</span>
                        </div>
                    </div>
                    <div className="news-card">
                        <img src={news3} alt="news" />
                        <h3>Players to Watch This Season</h3>
                        <p>
                            Rising stars are set to shake up the league with impressive early
                            performances.
                        </p>
                        <div className="news-footer-info">
                            <span>1d ago</span>
                            <span>2.4k</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="join-elite">
                <div className="join-text">
                    <h2>Join the Elite Experience</h2>
                    <p>
                        Create an account to unlock premium match tracking, exclusive Ugandan
                        sports insights, and compete for epic fantasy rewards.
                    </p>
                </div>
                <div className="join-actions">
                    <button className="btn-create">Create Account</button>
                    <button className="btn-login">Login</button>
                </div>
            </section>

            <footer className="news-footer">
                <div>
                    <img src={logo} alt="Logo" />
                </div>
                <div>
                    <h3>Platform</h3>
                    <ul>
                        <li><a>Sports</a></li>
                        <li><a>Fixtures</a></li>
                        <li><a>Standings</a></li>
                        <li><a>News</a></li>
                        <li><a>Competition</a></li>
                        <li><a>Clubs</a></li>
                    </ul>
                </div>
                <div>
                    <h3>Accounts</h3>
                    <ul>
                        <li><a>Signin</a></li>
                        <li><a>Register</a></li>
                        <li><a>Become a Sponsor</a></li>
                    </ul>
                </div>
                <div>
                    <h3>Company</h3>
                    <ul>
                        <li><a>About Us</a></li>
                        <li><a>Contact</a></li>
                        <li><a>Privacy Policy</a></li>
                        <li><a>Tearms of use</a></li>
                    </ul>
                </div>
                <div>
                    <h3>Follow</h3>
                    <ul>
                        <li><a href="https://x.com" target="_blank" rel="noreferrer">
                            <FaXTwitter />
                        </a></li>
                        <li><a href="https://instagram.com" target="_blank" rel="noreferrer">
                            <FaInstagram />
                        </a></li>
                        <li><a href="https://facebook.com" target="_blank" rel="noreferrer">
                            <FaFacebookF />
                        </a></li>
                    </ul>
                </div>
            </footer>

            <div className="footer-bottom-bar">
                <p>© 2026 Leagues OS. All rights reserved.</p>
            </div>
        </div>
    );
}
