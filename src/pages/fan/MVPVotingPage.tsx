import { useState, useEffect } from "react";
import { Box, Typography, Avatar, LinearProgress, Button, Chip, Divider } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import MVPVoting from "./MVPVoting";
import "../../styles/pages/fan/MVPVotingPage.css";

// ---- Types ----

interface Player {
  id: number;
  name: string;
  votes: number;
  avatarUrl?: string;
}

interface MatchInfo {
  home: { code: string; name: string; score: number };
  away: { code: string; name: string; score: number };
  status: string;
  votingEndsIn: number;
}

interface PreviousMvp {
  match: string;
  player: string;
  date: string;
}

interface TopVoter {
  name: string;
  votes: number;
  rank: number;
}

// ---- Static data (replace with API calls) ----

const MATCH_DATA: MatchInfo = {
  home: { code: "KOBS RFC", name: "Kampala Old Boys", score: 24 },
  away: { code: "HTHNS", name: "Heathens RFC", score: 18 },
  status: "FULL TIME",
  votingEndsIn: 14 * 60 + 32,
};

const PLAYERS: Player[] = [
  { id: 1, name: "JUSTIN KIMONO", votes: 45 },
  { id: 2, name: "PIUS OGENA", votes: 30 },
  { id: 3, name: "JAMES IJONGAT", votes: 15 },
  { id: 4, name: "IAN MUNYANI", votes: 10 },
];

const FAN_ACTIVITY = {
  totalVotes: 12458,
  topFanRegion: "Kampala Central",
  engagementTarget: 82,
};

const PREVIOUS_MVPS: PreviousMvp[] = [
  { match: "KOBS vs Black Pirates", player: "DENIS BUKOLI", date: "Jun 21" },
  { match: "KOBS vs Buffaloes", player: "JUSTIN KIMONO", date: "Jun 7" },
  { match: "KOBS vs Mongers", player: "PIUS OGENA", date: "May 24" },
];

const TOP_VOTERS: TopVoter[] = [
  { name: "Brian K.", votes: 38, rank: 1 },
  { name: "Sarah N.", votes: 31, rank: 2 },
  { name: "Tom O.", votes: 27, rank: 3 },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m + "m " + String(s).padStart(2, "0") + "s";
}

export default function MVPVotingPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(MATCH_DATA.votingEndsIn);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = () => {
    if (selectedPlayer && !submitted) setSubmitted(true);
  };

  return (
    <MVPVoting>
      <Box className="mvp-page">
        {/* Score Card */}
        <Box className="mvp-score-card">
          <Chip label="VOTING LIVE" className="mvp-live-chip" size="small" />

          <Box className="mvp-score-row">
            <Box className="mvp-team">
              <Box className="mvp-team-avatar mvp-team-avatar--home">
                <ShieldOutlinedIcon sx={{ fontSize: 36, color: "#a78bfa" }} />
              </Box>
              <Typography className="mvp-team-code">{MATCH_DATA.home.code}</Typography>
              <Typography className="mvp-team-name">{MATCH_DATA.home.name}</Typography>
            </Box>

            <Box className="mvp-score-center">
              <Box className="mvp-scoreline">
                <Typography className="mvp-score mvp-score--home">
                  {MATCH_DATA.home.score}
                </Typography>
                <Typography className="mvp-score-dash">-</Typography>
                <Typography className="mvp-score mvp-score--away">
                  {MATCH_DATA.away.score}
                </Typography>
              </Box>
              <Chip label={MATCH_DATA.status} className="mvp-status-chip" size="small" />
            </Box>

            <Box className="mvp-team">
              <Box className="mvp-team-avatar mvp-team-avatar--away">
                <SportsKabaddiIcon sx={{ fontSize: 32, color: "#f59e0b" }} />
              </Box>
              <Typography className="mvp-team-code">{MATCH_DATA.away.code}</Typography>
              <Typography className="mvp-team-name">{MATCH_DATA.away.name}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Voting + Activity Row */}
        <Box className="mvp-content-row">
          {/* Voting Panel */}
          <Box className="mvp-vote-panel">
            <Box className="mvp-vote-header">
              <Box>
                <Typography className="mvp-vote-title">
                  Who is your KOBS Man of the Match?
                </Typography>
                <Typography className="mvp-vote-subtitle">
                  Select a player to cast your vote. Results are updated live.
                </Typography>
              </Box>
              <Box className="mvp-timer">
                <AccessTimeIcon sx={{ fontSize: 14, mr: 0.5 }} />
                <Typography variant="caption">Ends in {formatTime(timeLeft)}</Typography>
              </Box>
            </Box>

            <Box className="mvp-player-list">
              {PLAYERS.map((player) => {
                const isSelected = selectedPlayer === player.id;
                return (
                  <Box
                    key={player.id}
                    className={"mvp-player-row" + (isSelected ? " mvp-player-row--selected" : "")}
                    onClick={() => setSelectedPlayer(player.id)}
                  >
                    <Avatar className="mvp-player-avatar" src={player.avatarUrl}>
                      {player.name[0]}
                    </Avatar>
                    <Box className="mvp-player-info">
                      <Typography className="mvp-player-name">{player.name}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={player.votes}
                        className={"mvp-progress" + (isSelected ? " mvp-progress--selected" : "")}
                      />
                    </Box>
                    <Typography className="mvp-player-pct">{player.votes}%</Typography>
                    <Box className={"mvp-radio" + (isSelected ? " mvp-radio--checked" : "")}>
                      {isSelected && <CheckIcon sx={{ fontSize: 13, color: "#fff" }} />}
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Button
              fullWidth
              className={"mvp-submit-btn" + (submitted ? " mvp-submit-btn--done" : "")}
              onClick={handleSubmit}
              disabled={submitted}
            >
              {submitted ? "VOTE SUBMITTED" : "SUBMIT VOTE"}
            </Button>
          </Box>

          {/* Right Column */}
          <Box className="mvp-right-col">
            {/* Fan Activity */}
            <Box className="mvp-activity-card">
              <Box className="mvp-activity-header">
                <GroupsOutlinedIcon sx={{ fontSize: 18, mr: 1 }} />
                <Typography className="mvp-card-title">Fan Activity</Typography>
              </Box>

              <Box className="mvp-activity-row">
                <Typography className="mvp-activity-label">TOTAL VOTES</Typography>
                <Typography className="mvp-activity-value">
                  {FAN_ACTIVITY.totalVotes.toLocaleString()}
                </Typography>
              </Box>

              <Box className="mvp-activity-row">
                <Typography className="mvp-activity-label">TOP FAN REGION</Typography>
                <Typography className="mvp-activity-value">
                  {FAN_ACTIVITY.topFanRegion}
                </Typography>
              </Box>

              <Divider className="mvp-divider" />

              <Box className="mvp-engagement">
                <Box className="mvp-engagement-header">
                  <Typography className="mvp-activity-label">Engagement Target</Typography>
                  <Typography className="mvp-engagement-pct">
                    {FAN_ACTIVITY.engagementTarget}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={FAN_ACTIVITY.engagementTarget}
                  className="mvp-engagement-bar"
                />
              </Box>
            </Box>

            {/* Earn Points */}
            <Box className="mvp-rewards-card">
              <Box className="mvp-rewards-icon-wrap">
                <EmojiEventsOutlinedIcon className="mvp-rewards-icon" />
              </Box>
              <Chip label="+50 PTS" className="mvp-pts-chip" size="small" />
              <Typography className="mvp-rewards-title">Earn Points</Typography>
              <Typography className="mvp-rewards-body">
                Vote for your Man of the Match and unlock exclusive badges and digital
                collectibles.
              </Typography>
              <Button
                endIcon={<NavigateNextIcon />}
                className="mvp-rewards-link"
                size="small"
              >
                VIEW REWARDS
              </Button>
            </Box>

            {/* Top Voters Leaderboard */}
            <Box className="mvp-leaderboard-card">
              <Typography className="mvp-card-title" sx={{ mb: 2 }}>
                Top Voters This Week
              </Typography>
              {TOP_VOTERS.map((voter) => (
                <Box className="mvp-leaderboard-row" key={voter.name}>
                  <Typography className="mvp-leaderboard-rank">#{voter.rank}</Typography>
                  <Typography className="mvp-leaderboard-name">{voter.name}</Typography>
                  <Typography className="mvp-leaderboard-votes">{voter.votes} votes</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Previous Match MVPs */}
        <Box className="mvp-history-card">
          <Typography className="mvp-card-title" sx={{ mb: 2 }}>
            Previous Man of the Match
          </Typography>
          <Box className="mvp-history-list">
            {PREVIOUS_MVPS.map((entry) => (
              <Box className="mvp-history-row" key={entry.match}>
                <Box>
                  <Typography className="mvp-history-player">{entry.player}</Typography>
                  <Typography className="mvp-history-match">{entry.match}</Typography>
                </Box>
                <Typography className="mvp-history-date">{entry.date}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </MVPVoting>
  );
}