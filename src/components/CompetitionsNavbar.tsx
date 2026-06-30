import Navbar from "./Navbar";

const competitionNavLinks = [
  { label: "Overview", route: "/" },
  { label: "Clubs", route: "/clubs" },
  { label: "Competitions", route: "/competitions" },
  { label: "Unions", route: "/unions" },
  { label: "News", route: "/news" },
];

function CompetitionsNavbar() {
  return <Navbar links={competitionNavLinks} />;
}

export default CompetitionsNavbar;
