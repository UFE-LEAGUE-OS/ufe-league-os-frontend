import {
  CalendarCheck,
  ChevronRight,
  ClipboardCheck,
  LogOut,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import OfficialAppointmentsPanel from "../../components/OfficialAppointmentsPanel/OfficialAppointmentsPanel";
import logoHorizontal from "../../assets/logos/league-os-horizontal.png";
import styles from "./LeagueAdminDashboard.module.css";

export default function LeagueAdminDashboard() {
  function logout() {
    [
      "league_os_access_token",
      "league_os_refresh_token",
      "league_os_user",
      "accessToken",
      "refreshToken",
    ].forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    window.location.assign("/login");
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.brand}>
          <img src={logoHorizontal} alt="League OS" />
        </Link>
        <div className={styles.workspaceBadge}>
          <ShieldCheck size={20} />
          <div>
            <strong>League Operations</strong>
            <span>Competition-scoped access</span>
          </div>
        </div>
        <nav>
          <button className={styles.activeNav} type="button">
            <CalendarCheck size={19} /> Match Officials
          </button>
          <Link to="/competitions"><Trophy size={19} /> Competitions <ChevronRight size={16} /></Link>
          <Link to="/fixtures"><ClipboardCheck size={19} /> Fixtures <ChevronRight size={16} /></Link>
        </nav>
        <button className={styles.logout} type="button" onClick={logout}>
          <LogOut size={18} /> Log out
        </button>
      </aside>

      <main className={styles.main}>
        <header className={styles.hero}>
          <div>
            <span>League / Competition Administration</span>
            <h1>Matchday Operations</h1>
            <p>
              Assign union-approved officials to fixtures, monitor responses and
              replace declined appointments without exceeding your authorised scope.
            </p>
          </div>
          <Link to="/dashboard/fan" className={styles.fanLink}>Fan dashboard</Link>
        </header>

        <section className={styles.policyStrip}>
          <div><ShieldCheck size={20} /><strong>Union-owned directory</strong><span>Certification and discipline remain with the federation.</span></div>
          <div><Trophy size={20} /><strong>Competition-scoped control</strong><span>League administrators only see their assigned competitions.</span></div>
          <div><CalendarCheck size={20} /><strong>Official responses</strong><span>Only the appointed official can accept or decline.</span></div>
        </section>

        <OfficialAppointmentsPanel mode="league" />
      </main>
    </div>
  );
}
