import type { LucideIcon } from "lucide-react";
import {
  Shield,
  UserCog,
  ClipboardList,
  Send,
  LayoutDashboard
} from "lucide-react";
// Central nav config so every club-admin page renders the same sidebar
// via AdminWorkspaceLayout and stays in sync with the router.
// Adjust the `path` values to match your actual route definitions.

export type ClubAdminTabKey =
  |"dashboard"
  | "teams"
  | "staff"
  |"players"
  | "roster"
  | "squad-submission"
 

export interface ClubAdminNavItem {
  key: ClubAdminTabKey;
  label: string;
  icon: LucideIcon;
  path: string;
}

export const clubAdminNavItems: ClubAdminNavItem[] = [
  { key: "dashboard", label: "Dashboard", icon:  LayoutDashboard, path: "/Dashboard/club-admin" },
  { key: "teams", label: "Teams & Squads", icon: Shield, path: "/club-management/teams" },
  { key: "players", label: "Player Registration", icon: UserCog, path: "/club-management/players" },
  { key: "staff", label: "Staff & Officials", icon: UserCog, path: "/club-management/staff" },
  { key: "roster", label: "Roster Update", icon: ClipboardList, path: "/club-management/roster" },
  {key: "squad-submission", label: "Squad Submission", icon: Send, path: "/club-management/squad-submission"},
 
];
