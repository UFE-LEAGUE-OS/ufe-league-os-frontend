import { Box } from "@mui/material";
import type { ReactNode } from "react";
import Navbar from "../../components/LoggedInHeader/LoggedInHeader";
import Sidebar from "../../components/UserSidebar/UserSidebar";
import Footer from "../../components/Footer";
import "../../styles/pages/fan/MVPVoting.css";

interface MVPVoting {
  /** The page-specific content (score card, voting card, etc.) */
  children: ReactNode;
}

const MVPVoting = ({ children }: MVPVoting) => {
  return (
    <Box className="shell-root">
      <Navbar />
      <Box className="shell-body">
        <Sidebar />
        <Box component="main" className="shell-content">
          {children}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default MVPVoting;