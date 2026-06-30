import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import PollsHub from "./PollsHub";
import "../../styles/pages/FanInteractionGlobal.css";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0e0e1f", paper: "#12122a" },
    primary: { main: "#a855f7" },
  },
  typography: { fontFamily: '"Inter", "Roboto", "Helvetica", sans-serif' },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiListItem: { defaultProps: { disablePadding: false } },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <PollsHub />
    </ThemeProvider>
  );
}

export default App;