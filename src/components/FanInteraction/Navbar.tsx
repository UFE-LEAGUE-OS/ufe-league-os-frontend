import {
  AppBar,
  Toolbar,
  Box,
  InputBase,
  IconButton,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import "./Navbar.css";


interface NavbarProps {
  activeLink?: string;
}

const navLinks = ["Games", "Polls", "Quizzes", "MVP Voting", "News"];

const Navbar = ({ activeLink = "Polls" }: NavbarProps) => {
  return (
    <AppBar position="fixed" className="navbar" elevation={0}>
      <Toolbar className="navbar-toolbar">
        {/* Logo */}
        <Box className="navbar-logo">
          <Box className="logo-icon">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="18" fill="#7C3AED" opacity="0.2" />
              <path d="M10 26L18 10L26 26H10Z" fill="#A855F7" />
              <circle cx="18" cy="14" r="4" fill="#F97316" />
            </svg>
          </Box>
          <Box className="logo-text">
            <span className="logo-league">LEAGUE</span>
            <span className="logo-os">OS</span>
          </Box>
        </Box>

        {/* Nav Links */}
        <Box className="navbar-links">
          {navLinks.map((link) => (
            <Button
              key={link}
              className={`nav-link ${activeLink === link ? "nav-link-active" : ""}`}
              disableRipple
            >
              {link}
            </Button>
          ))}
        </Box>

        {/* Search + Actions */}
        <Box className="navbar-actions">
          <Box className="search-box">
            <SearchIcon className="search-icon" />
            <InputBase
              placeholder="Search polls..."
              className="search-input"
            />
          </Box>
          <IconButton className="icon-btn">
            <NotificationsNoneOutlinedIcon />
          </IconButton>
          <IconButton className="icon-btn">
            <AccountCircleOutlinedIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;