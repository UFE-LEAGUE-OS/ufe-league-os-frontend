import "../styles/pages/NewsPage.css"
import { useNavigate } from "react-router-dom";

import { FaArrowRight } from "react-icons/fa6";
import heroB from "../assets/News/city oilers.jfif";
import newsR from "../assets/News/kobs.jfif";
import news2 from "../assets/images/rugby.jpeg";
import newsF from "../assets/News/kcca sports.jfif";
import news4 from "../assets/News/ucu.jfif";
import news5 from "../assets/News/kiu.jfif";
import news6 from "../assets/News/rhinos.jfif";
import news7 from "../assets/News/shewolves.jfif";
import news8 from "../assets/News/vipers.jfif";
import news9 from "../assets/News/ura.jfif";
import newsF2 from "../assets/News/kccanew.jfif";
import news3 from "../assets/basketball-card.png";
import heroF from "../assets/News/kcca sports.jfif";
import heroR from "../assets/News/kobs.jfif";
import Footer from "../components/Footer.tsx";
import Navbar from "../components/Navbar.tsx";

import { useState } from "react";

const newsNavLinks = [
    { label: "Overview", route: "/" },
    { label: "Clubs", route: "/clubs" },
    { label: "Competitions", route: "/competitions" },
    { label: "Unions", route: "/unions" },
    { label: "News", route: "/news" },
];

const sportTabs = ["All", "Football", "Basketball", "Rugby"];
//,......result card
const newsItems = [
    
    {
        id: 1,
        sport: "Rugby",
        img: newsR,
        title: "Heathens Dominate Kobs in Rugby Clash",
        desc: "A strong performance saw Heathens control possession and secure a decisive victory in a thrilling encounter.",
        time: "2h ago",
        views: "1.2k",
    },
    {
        id: 2,
        sport: "Rugby",
        img: news2,
        title: "Rugby Premiership Fixtures Released",
        desc: "The new season schedule has been announced with exciting matchups across all top teams.",
        time: "5h ago",
        views: "980",
    },
    {
        id: 3,
        sport: "Basketball",
        img: news3,
        title: "Players to Watch This Season",
        desc: "Rising stars are set to shake up the league with impressive early performances.",
        time: "1d ago",
        views: "2.4k",
    },
    {
        id: 4,
        sport: "Football",
        img: newsF2,
        title: "KCCA Announces New Signing",
        desc: "The club has strengthened its squad ahead of the new season with a key midfield addition.",
        time: "3h ago",
        views: "1.5k",
    },
    {
        id: 5,
        sport: "Basketball",
        img: heroB,
        title: "City Oilers Extend Winning Streak",
        desc: "A dominant fourth quarter secured another win as the team continues its strong league form.",
        time: "6h ago",
        views: "870",
    },
    {
        id: 6,
        sport: "Football",
        img: newsF,
        title: "Fixtures Released for New Season",
        desc: "Fans can now plan ahead as the full football league calendar has been published.",
        time: "1d ago",
        views: "3.1k",
    },
    {
        id: 7,
        sport: "Rugby",
        img: news6,
        title: "Rhinos Edge Buffaloes in Nail-Biting Finish",
        desc: "A last-minute penalty settled a tense contest as Rhinos held their nerve to snatch victory on the road.",
        time: "2h ago",
        views: "1.2k",
    },
    {
        id: 8,
        sport: "Rugby",
        img: news7,
        title: "She Wolves Handed Tough Draw in Cup Opener",
        desc: "The women's side will face last year's finalists in the opening round, setting up an early season test.",
        time: "5h ago",
        views: "980",
    },
    {
        id: 9,
        sport: "Basketball",
        img: news4,
        title: "UCU Canons Unveil Revamped Roster",
        desc: "Several new signings join the university powerhouse as they look to reclaim the league title this year.",
        time: "1d ago",
        views: "2.4k",
    },
    {
        id: 10,
        sport: "Football",
        img: news8,
        title: "Vipers SC Close Gap at Top of the Table",
        desc: "A hard-fought away win moves Vipers within two points of the leaders with six games left to play.",
        time: "3h ago",
        views: "1.5k",
    },
    {
        id: 11,
        sport: "Basketball",
        img: news5,
        title: "KIU Titans Snap Losing Streak with Statement Win",
        desc: "A balanced scoring effort helped the Titans end a three-game skid and climb back into playoff contention.",
        time: "6h ago",
        views: "870",
    },
    {
        id: 12,
        sport: "Football",
        img: news9,
        title: "URA FC Appoints New Head Coach",
        desc: "The club has confirmed a new tactical leader ahead of the second half of the season, promising a fresh approach.",
        time: "1d ago",
        views: "3.1k",
    },
];

type SportKey = "Rugby" | "Football" | "Basketball";
const resultsBySport = {
    Rugby: {
        matches: [
            { home: "Kobs", score: "12 - 24", away: "Heathens" },
            { home: "Rhinos", score: "18 - 18", away: "Buffaloes" },
            { home: "Warriors", score: "10 - 31", away: "She Wolves" },
        ],
    },
    Football: {
        matches: [
            { home: "KCCA", score: "2 - 1", away: "Vipers" },
            { home: "URA", score: "0 - 0", away: "Express" },
            { home: "Police", score: "1 - 3", away: "SC Villa" },
        ],
    },
    Basketball: {
        matches: [
            { home: "City Oilers", score: "88 - 76", away: "KIU Titans" },
            { home: "Rams", score: "71 - 74", away: "Falcons" },
            { home: "Warriors", score: "90 - 65", away: "Ambassadors" },
        ],
    },
};

//......Trends
type TrendItem = {
    id: number;
    sport: SportKey;
    text: string;
    time: string;
};

const trendingItems: TrendItem[] = [
    { id: 1, sport: "Football", text: "KCCA has added a new member", time: "2h ago" },
    { id: 2, sport: "Rugby", text: "Heathens dominate Kobs", time: "5h ago" },
    { id: 3, sport: "Football", text: "Fixtures released for new season", time: "1d ago" },
    { id: 4, sport: "Basketball", text: "City Oilers extend winning streak", time: "6h ago" },
    { id: 5, sport: "Basketball", text: "Rams sign new point guard", time: "8h ago" },
    { id: 6, sport: "Rugby", text: "Warriors fall to She Wolves in upset", time: "1d ago" },
];


//..hero section
type HeroStory = {
    sport: SportKey;
    image: string;
    title: string;
    description: string;
};

const heroBySport: Record<SportKey, HeroStory> = {
    Rugby: {
        sport: "Rugby",
        image: heroR,
        title: "Heathens Outmuscle Kobs in Gritty Kampala Derby",
        description:
            "A thrilling encounter saw Heathens dominate Kobs in a high-intensity match filled with tactical brilliance and strong defensive play.",
    },
    Football: {
        sport: "Football",
        image: heroF,
        title: "KCCA Edge Vipers in Tense Title Race Clash",
        description:
            "A late strike settled a tightly contested match as KCCA closed the gap at the top of the table.",
    },
    Basketball: {
        sport: "Basketball",
        image: heroB,
        title: "City Oilers Stay Unbeaten with Statement Win",
        description:
            "A dominant fourth quarter powered City Oilers to their sixth straight win of the season.",
    },
};





export default function NewsSection() {
    const navigate = useNavigate();
    const [activeSport, setActiveSport] = useState("All");
    const filteredNews =
        activeSport === "All"
            ? newsItems
            : newsItems.filter((item) => item.sport === activeSport);

    const filteredTrending =
        activeSport === "All"
            ? trendingItems
            : trendingItems.filter((item) => item.sport === activeSport);

    // fallback to Rugby if "All" is selected, since results need one sport
    const resultsSport: SportKey = activeSport === "All" ? "Rugby" : (activeSport as SportKey);

    const currentResults = resultsBySport[resultsSport]?.matches ?? [];

    //trends
    //hero section
    const heroStory = heroBySport[resultsSport];

    return (
        <div className="news-page" >
            <div>
            <Navbar links={newsNavLinks}
            showSignup={true}
            />

            </div>
              

            <section className="hero-section">
                <div className="hero-image">
                    <img src={heroStory.image} alt={heroStory.title} />
                    <div className="hero-overlay">
                        <h1 className="hero-title">{heroStory.title}</h1>
                        <p>{heroStory.description}</p>
                        <div className="hero-buttons">
                            <button className="nbtn-primary">
                                Read full story <FaArrowRight />
                            </button>
                            <button className="nbtn-secondary" onClick={() => navigate("/results")}>
                                Matches stats
                            </button>
                        </div>
                    </div>
                </div>

                <div className="hero-side">
                    <div className="hero-card trending-card">
                        <h3>Trending{activeSport !== "All" ? ` in ${activeSport}` : ""}</h3>
                        <div className="trend-list">
                            {filteredTrending.length > 0 ? (
                                filteredTrending.map((item, i) => (
                                    <div className="trend-item" key={item.id}>
                                        <div className="trend-top">
                                            <span className="trend-num">{String(i + 1).padStart(2, "0")}</span>
                                            <span className="trend-text">{item.text}</span>
                                        </div>
                                        <div className="trend-bottom">
                                            <span className="trend-sport">{item.sport}</span>
                                            <span className="trend-time">{item.time}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-trends">No trending stories for this sport yet.</p>
                            )}
                        </div>
                    </div>

                    <div className="hero-card">
                        <div className="results-header">
                            <h3>{resultsSport} Results</h3>
                            <button className="view-table" onClick={() => navigate("/results")}>View full table</button>
                        </div>
                        <div className="results-table">
                            <div className="results-row header">
                                <span>Home</span>
                                <span>Score</span>
                                <span>Away</span>
                            </div>
                            {currentResults.map((match, i) => (
                                <div className="results-row" key={i}>
                                    <span>{match.home}</span>
                                    <span>{match.score}</span>
                                    <span>{match.away}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="latest-headlines">
                <div className="headlines-top">
                    <h2 className="section-title">Latest Headlines</h2>

                    <div className="sport-tabs">
                        {sportTabs.map((sport) => (
                            <button
                                key={sport}
                                className={`sport-tab ${activeSport === sport ? "active" : ""}`}
                                onClick={() => setActiveSport(sport)}
                            >
                                {sport}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="news-grid">
                    {filteredNews.length > 0 ? (
                        filteredNews.map((item) => (
                            <div className="news-card" key={item.id}>
                                <img src={item.img} alt={item.title} />
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                                <div className="news-footer-info">
                                    <span>{item.time}</span>
                                    <span>{item.views}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-news">No news available for this sport yet.</p>
                    )}
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
                    <button className="btn-create" onClick={() => navigate("/register")}>Create Account</button>
                    <button className="btn-login" onClick={() => navigate("/login")}>Login</button>
                </div>
            </section>

            <Footer />


        </div>
    );
}