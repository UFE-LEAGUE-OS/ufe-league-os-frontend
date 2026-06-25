import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import SportsIcon from "@mui/icons-material/Sports";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import "Sidebar.css";

interface SidebarProps {
  activeItem?: string;
}

const mainItems = [
  { label: "Fantasy", icon: <SportsIcon /> },
  { label: "Polls Hub", icon: <PollOutlinedIcon /> },
  { label: "Live Quizzes", icon: <QuizOutlinedIcon /> },
  { label: "Match Center", icon: <SportsSoccerOutlinedIcon /> },
  { label: "Rankings", icon: <LeaderboardOutlinedIcon /> },
];

const bottomItems = [
  { label: "Settings", icon: <SettingsOutlinedIcon /> },
  { label: "Support", icon: <HelpOutlineOutlinedIcon /> },
];

const Sidebar = ({ activeItem = "Polls Hub" }: SidebarProps) => {
  return (
    <Box className="sidebar">
      {/* Main Navigation */}
      <List className="sidebar-list" disablePadding>
        {mainItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              className={`sidebar-item ${activeItem === item.label ? "sidebar-item-active" : ""}`}
            >
              <ListItemIcon className="sidebar-item-icon">{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { className: "sidebar-item-label" } }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box className="sidebar-spacer" />

      {/* Join Premium */}
      <Box className="sidebar-premium">
        <Button
          variant="contained"
          fullWidth
          className="premium-btn"
          startIcon={<WorkspacePremiumOutlinedIcon />}
        >
          Join Premium
        </Button>
      </Box>

      {/* Bottom Items */}
      <List className="sidebar-list" disablePadding>
        {bottomItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton className="sidebar-item">
              <ListItemIcon className="sidebar-item-icon">{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { className: "sidebar-item-label" } }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;