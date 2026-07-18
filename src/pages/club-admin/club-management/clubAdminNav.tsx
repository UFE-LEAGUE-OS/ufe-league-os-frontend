import type { LucideIcon } from "lucide-react";
import {
  Shield,
  UserCog,
  ClipboardList,
  Send,
  Users,
  UserPlus,
  RotateCw,
  Tag,
  FileBarChart,
} from "lucide-react";
// Central nav config so every club-admin page renders the same sidebar
// via AdminWorkspaceLayout and stays in sync with the router.
// Adjust the `path` values to match your actual route definitions.

export type ClubAdminTabKey =
  | "teams"
  | "staff"
  |"players"
  | "roster"
  | "squad-submission"
  | "members"
  | "requests"
  | "renewals"
  | "pricing"
  | "reports";

export interface ClubAdminNavItem {
  key: ClubAdminTabKey;
  label: string;
  icon: LucideIcon;
  path: string;
}

export const clubAdminNavItems: ClubAdminNavItem[] = [
  { key: "teams", label: "Teams & Squads", icon: Shield, path: "/club-management/teams" },
  { key: "players", label: "Player Registration", icon: Shield, path: "/club-management/players" },
  { key: "staff", label: "Staff & Officials", icon: UserCog, path: "/club-management/staff" },
  { key: "roster", label: "Roster Update", icon: ClipboardList, path: "/club-management/roster" },
  {key: "squad-submission", label: "Squad Submission", icon: Send, path: "/club-management/squad-submission"},
  { key: "members", label: "Members", icon: Users, path: "/club-admin/members" },
  { key: "requests", label: "Membership Requests", icon: UserPlus, path: "/club-admin/requests" },
  { key: "renewals", label: "Renewals & Expiry", icon: RotateCw, path: "/club-admin/renewals" },
  { key: "pricing", label: "Tier & Pricing", icon: Tag, path: "/club-admin/pricing" },
  { key: "reports", label: "Reports & Exports", icon: FileBarChart, path: "/club-admin/reports" },
];
