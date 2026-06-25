import { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import "../../styles/pages/fan/PollsHub.css";

const pollOptions = [
  { id: 0, label: "Heathens", percent: 45 },
  { id: 1, label: "KOBS", percent: 30 },
  { id: 2, label: "Pirates", percent: 15 },
  { id: 3, label: "Buffaloes", percent: 10 },
];

const players = [
  { name: "Justin Kimono", percent: 45, initials: "JK" },
  { name: "Pius Ogena", percent: 30, initials: "PO" },
  { name: "James Ijongat", percent: 15, initials: "JI" },
];

const livePolls = [
  {
    id: 1,
    question: "Who is the player of the week?",
    timer: "Ends Tonight",
    icon: <TimerOutlinedIcon fontSize="small" />,
  },
  {
    id: 2,
    question: "Next Matchday Stadium Venue?",
    timer: "14h Left",
    icon: <AccessTimeIcon fontSize="small" />,
  },
];

const filters = ["All", "Rugby", "Basketball"];

const PollsHub = () => {
  const [selectedOption, setSelectedOption] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <Box className="polls-page">
      {/* Main Content */}
      <Box className="polls-main">
        {/* Header */}
        <Box className="polls-header">
          <Box>
            <Typography className="polls-title">Polls Hub</Typography>
            <Typography className="polls-subtitle">
              Have your say in the biggest decisions of the league.
            </Typography>
          </Box>
          <Box className="filter-tabs">
            {filters.map((f) => (
              <Button
                key={f}
                className={`filter-tab ${activeFilter === f ? "filter-tab-active" : ""}`}
                onClick={() => setActiveFilter(f)}
                disableRipple
              >
                {f}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Featured Poll */}
        <Box className="featured-poll-card">
          <Box className="poll-badges">
            <span className="badge-featured">● Featured Poll</span>
            <span className="badge-timer">
              <TimerOutlinedIcon sx={{ fontSize: 14 }} /> Closes in 2 days
            </span>
          </Box>

          <Typography className="poll-question">
            Which club will win the Nile Special Rugby Premiership title?
          </Typography>

          <Box className="poll-options">
            {pollOptions.map((opt) => {
              const isActive = selectedOption === opt.id;
              return (
                <Box
                  key={opt.id}
                  className={`poll-option ${isActive ? "poll-option-active" : ""}`}
                  onClick={() => setSelectedOption(opt.id)}
                >
                  <Box
                    className={`poll-option-fill ${isActive ? "poll-option-fill-active" : "poll-option-fill-default"}`}
                    style={{ width: `${opt.percent}%` }}
                  />
                  <Box className="poll-option-content">
                    <Box className="poll-option-left">
                      <Box className={`option-icon ${isActive ? "option-icon-active" : ""}`}>
                        {isActive && (
                          <CheckIcon sx={{ fontSize: 13, color: "#fff" }} />
                        )}
                      </Box>
                      <span className="option-label">{opt.label}</span>
                    </Box>
                    <span
                      className={`option-percent ${isActive ? "option-percent-active" : ""}`}
                    >
                      {opt.percent}%
                    </span>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box className="poll-footer">
            <Box className="poll-meta">
              <span className="poll-votes">
                <PeopleAltOutlinedIcon sx={{ fontSize: 16 }} /> 1,245 Votes
              </span>
              <span className="poll-share">
                <ShareOutlinedIcon sx={{ fontSize: 15 }} /> Share
              </span>
            </Box>
            <Button className="cast-vote-btn" disableRipple>
              Cast Your Vote
            </Button>
          </Box>
        </Box>

        {/* Live Polls Section */}
        <Box className="live-polls-section">
          <Box className="section-header">
            <Typography className="section-title">Live Polls</Typography>
            <span className="view-all-link">
              View All <ArrowForwardIosIcon sx={{ fontSize: 11 }} />
            </span>
          </Box>
          <Box className="live-polls-grid">
            {livePolls.map((poll) => (
              <Box key={poll.id} className="live-poll-card">
                <Box className="live-card-header">
                  <span className="badge-active">Active</span>
                  <span className="card-timer">
                    {poll.icon} {poll.timer}
                  </span>
                </Box>
                <Typography className="live-card-question">
                  {poll.question}
                </Typography>
                <Button className="vote-now-btn" fullWidth disableRipple>
                  Vote Now
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right Panel */}
      <Box className="polls-right-panel">
        {/* Best Try Card */}
        <Box className="best-try-card">
          <Typography className="best-try-title">Best Try of Matchday 5</Typography>
          <Box className="best-try-votes">
            <PeopleAltOutlinedIcon sx={{ fontSize: 14 }} /> 856 Total Votes
          </Box>

          {players.map((p) => (
            <Box key={p.name} className="player-row">
              <Box className="player-avatar">{p.initials}</Box>
              <Box className="player-info">
                <Typography className="player-name">{p.name}</Typography>
                <Box className="player-bar-wrap">
                  <Box
                    className="player-bar"
                    style={{ width: `${p.percent}%` }}
                  />
                </Box>
              </Box>
              <span className="player-percent">{p.percent}%</span>
            </Box>
          ))}

          <Button className="vote-choice-btn" fullWidth disableRipple>
            Vote for Your Choice ▶
          </Button>
        </Box>

        {/* Rewards Card */}
        <Box className="rewards-card">
          <Box style={{ flex: 1 }}>
            <span className="rewards-badge">Rewards</span>
            <Typography className="rewards-title">Earn 50 Points</Typography>
            <Typography className="rewards-desc">
              Vote on 3 polls today to boost your fan rank and unlock exclusive
              badge icons.
            </Typography>
            <Box className="rewards-toggle">
              <Box className="toggle-pill">
                <Box className="toggle-dot" />
              </Box>
              <span className="rewards-points-badge">+4k</span>
            </Box>
          </Box>
          <Box className="rewards-arrow">
            <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PollsHub;