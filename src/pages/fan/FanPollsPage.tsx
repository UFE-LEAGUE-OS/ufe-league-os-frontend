import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import Navbar from "../../components/FanInteraction/Navbar";
import Sidebar from "../../components/FanInteraction/Sidebar";
import PollsHub from "./PollsHub";   // ← relative path
import "./styles/global.css";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0e0e1f",
      paper: "#12122a",
    },
    primary: {
      main: "#a855f7",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif',
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiListItem: {
      defaultProps: { disablePadding: false },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Navbar activeLink="Polls" />
      <Sidebar activeItem="Polls Hub" />
      <PollsHub />
    </ThemeProvider>
  );
}

export default App;