import {
  BarChart3,
  Boxes,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  Download,
  Eye,
  FileBarChart,
  FileText,
  Image as ImageIcon,
  Inbox,
  Layers,
  MapPin,
  Megaphone,
  MessageSquare,
  Palette,
  Plus,
  Radio,
  RefreshCw,
  ScanLine,
  Search,
  Send,
  Settings as SettingsIcon,
  ShieldCheck,
  Tag,
  TicketCheck,
  Trophy,
  UserCircle,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminWorkspaceLayout, {
  type AdminWorkspaceNavGroup,
  WorkspaceEmpty,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
  WorkspaceStatGrid,
  WorkspaceStatus,
  adminWorkspaceStyles as styles,
  formatWorkspaceDate,
} from "../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import {
  getApiErrorMessage,
  getSelectedClubWorkspace,
  validateWorkspaceTicket,
  type AdminWorkspaceMatch,
  type ClubAdminWorkspaceData,
  type TicketValidationResult,
} from "../../services/adminWorkspaceService";
import { useAuthStore } from "../../store/authStore";
import { useClubWorkspaceStore } from "../../store/clubWorkspaceStore";
import {
  CLUB_ADMIN_ROUTE,
  CLUB_TICKETING_ROUTE,
  getClubWorkspaceOptions,
  getFirstPermittedClubTab,
  isClubTabPermitted,
  resolveActiveClubWorkspace,
  type ActiveClubWorkspace,
  type ClubWorkspaceTab,
} from "../../utils/clubWorkspace";
import {
  getClubSubscriptions,
  getClubMembershipPlans,
  createMembershipPlan,
  updateMembershipPlan,
  formatMembershipCurrency,
  type BackendMembershipSubscription,
  type BackendMembershipPlan,
} from "../../services/membershipService";
import {
  createTicketType,
  formatTicketCurrency,
  getClubSalesSummary,
  getMatchGateConfig,
  getMatchTicketTypes,
  saveMatchGateConfig,
  setTicketTypeStatus,
  updateTicketType,
  type CreateTicketTypePayload,
  type GateConfigPayload,
  type MatchSalesSummary,
  type TicketTypeApi,
  type TicketTypeStatus,
} 
from "../../services/clubTicketingService";
import "./ClubMembershipManagement.css";
import "../../styles/pages/ClubAdmin.css";
import ComplianceDocuments from "./ComplianceDocuments";
import BrandingEditor from "./BrandingEditor";
import ClubProfileEdit from "./ClubProfileEdit";
import MediaAssetLibrary from "./MediaAssetLibrary";
import PublicClubPagePreview from "./PublicClubPagePreview";
import UserManagement from "./UserManagement";
import VenueManagement from "./VenueManagement";
import AnnouncementsCompose from "./AnnouncementsCompose";
import AnnouncementsPublish from "./AnnouncementsPublish";

type TabKey =
  | "overview"
  | "membership"
  | "membershipDirectory"
  | "membershipRenewals"
  | "membershipTiers"
  | "membershipRequests"
  | "membershipReports"
  | "teams"
  | "matches"
  | "finances"
  | "financeMembershipPayments"
  | "financeTicketingPayments"
  | "financeIncomeExpense"
  | "financeInvoicesReceipts"
  | "financeAuditTrail"
  | "ticketing"
  | "ticketingGames"
  | "ticketingPricing"
  | "ticketingInventory"
  | "ticketingPublish"
  | "ticketingPerformance"
  | "ticketingScanner"
  | "ticketingEntryLogs"
  | "facilities"
  | "profileBranding"
  | "profileBrandingProfile"
  | "profileBrandingBrand"
  | "profileBrandingVenues"
  | "profileBrandingMedia"
  | "profileBrandingPreview"
  | "sponsorshipMatchday"
  | "communicationCompliance"
  | "compliance"
  | "complianceChecklist"
  | "reports"
  | "communications"
  | "announcements"
  | "announcementsCompose"
  | "announcementsPublish"
  | "clubUsers"
  | "settings";

const navItems: AdminWorkspaceNavGroup<TabKey>[] = [
  {
    label: "Overview",
    items: [
      {
        key: "overview",
        label: "Dashboard",
        icon: BarChart3,
        requiredClubPermissions: [],
        clubWorkspaceFamily: "CLUB_ADMIN",
      },
    ],
  },
  {
    label: "Club Operations",
    items: [
      {
        key: "membership",
        label: "Membership",
        icon: CreditCard,
        requiredClubPermissions: ["club.members.manage"],
        clubWorkspaceFamily: "CLUB_ADMIN",
        children: [
          {
            key: "membershipDirectory",
            label: "Members Directory",
            icon: Users,
            requiredClubPermissions: ["club.members.manage"],
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "membershipRenewals",
            label: "Renewals & Expiry",
            icon: RefreshCw,
            requiredClubPermissions: ["club.members.manage"],
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "membershipTiers",
            label: "Tiers & Pricing",
            icon: Layers,
            requiredClubPermissions: ["club.members.manage"],
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "membershipRequests",
            label: "Requests Queue",
            icon: ClipboardList,
            requiredClubPermissions: ["club.members.manage"],
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "membershipReports",
            label: "Export Reports",
            icon: Download,
            requiredClubPermissions: ["club.members.manage"],
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
        ],
      },
      {
        key: "teams",
        label: "Teams",
        icon: Trophy,
        requiredClubPermissions: [
          "club.squad.manage",
          "club.training.manage",
        ],
        clubPermissionMode: "any",
        clubWorkspaceFamily: "CLUB_ADMIN",
      },
      {
        key: "matches",
        label: "Matches",
        icon: CalendarDays,
        requiredClubPermissions: [
          "club.matches.manage",
          "club.events.manage",
        ],
        clubPermissionMode: "any",
        clubWorkspaceFamily: "CLUB_ADMIN",
      },
      {
        key: "finances",
        label: "Finance & Audit",
        icon: Wallet,
        requiredClubPermissions: [
          "club.finance.view",
          "club.finance.manage",
        ],
        clubPermissionMode: "any",
        clubWorkspaceFamily: "CLUB_ADMIN",
        children: [
          {
            key: "financeMembershipPayments",
            label: "Membership payments overview",
            icon: CreditCard,
            requiredClubPermissions: [
              "club.finance.view",
              "club.finance.manage",
            ],
            clubPermissionMode: "any",
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "financeTicketingPayments",
            label: "Ticketing payments overview",
            icon: TicketCheck,
            requiredClubPermissions: [
              "club.finance.view",
              "club.finance.manage",
            ],
            clubPermissionMode: "any",
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "financeIncomeExpense",
            label: "Income & expense summary",
            icon: BarChart3,
            requiredClubPermissions: [
              "club.finance.view",
              "club.finance.manage",
            ],
            clubPermissionMode: "any",
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "financeInvoicesReceipts",
            label: "Invoices & receipts list",
            icon: FileText,
            requiredClubPermissions: [
              "club.finance.view",
              "club.finance.manage",
            ],
            clubPermissionMode: "any",
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "financeAuditTrail",
            label: "Audit trail log viewer",
            icon: ClipboardList,
            requiredClubPermissions: [
              "club.finance.view",
              "club.finance.manage",
            ],
            clubPermissionMode: "any",
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
        ],
      },
      {
        key: "ticketing",
        label: "Tickets",
        icon: TicketCheck,
        requiredClubPermissions: [
          "club.ticketing.manage",
          "club.ticketing.validate",
        ],
        clubPermissionMode: "any",
        clubWorkspaceFamily: [
          "CLUB_ADMIN",
          "TICKETING_OFFICER",
        ],
        children: [
          {
            key: "ticketingGames",
            label: "Home Games & Gates",
            icon: CalendarDays,
            requiredClubPermissions: ["club.ticketing.manage"],
            clubWorkspaceFamily: [
              "CLUB_ADMIN",
              "TICKETING_OFFICER",
            ],
          },
          {
            key: "ticketingPricing",
            label: "Ticket Pricing",
            icon: Tag,
            requiredClubPermissions: ["club.ticketing.manage"],
            clubWorkspaceFamily: [
              "CLUB_ADMIN",
              "TICKETING_OFFICER",
            ],
          },
          {
            key: "ticketingInventory",
            label: "Inventory",
            icon: Boxes,
            requiredClubPermissions: ["club.ticketing.manage"],
            clubWorkspaceFamily: [
              "CLUB_ADMIN",
              "TICKETING_OFFICER",
            ],
          },
          {
            key: "ticketingPublish",
            label: "Publish & Go-Live",
            icon: Radio,
            requiredClubPermissions: ["club.ticketing.manage"],
            clubWorkspaceFamily: [
              "CLUB_ADMIN",
              "TICKETING_OFFICER",
            ],
          },
          {
            key: "ticketingPerformance",
            label: "Sales Performance",
            icon: BarChart3,
            requiredClubPermissions: ["club.ticketing.manage"],
            clubWorkspaceFamily: [
              "CLUB_ADMIN",
              "TICKETING_OFFICER",
            ],
          },
          {
            key: "ticketingScanner",
            label: "Ticket Scanner",
            icon: ScanLine,
            requiredClubPermissions: [
              "club.ticketing.validate",
            ],
            clubWorkspaceFamily: [
              "CLUB_ADMIN",
              "TICKETING_OFFICER",
            ],
          },
          {
            key: "ticketingEntryLogs",
            label: "Entry Logs",
            icon: ClipboardList,
            requiredClubPermissions: [
              "club.ticketing.validate",
            ],
            clubWorkspaceFamily: [
              "CLUB_ADMIN",
              "TICKETING_OFFICER",
            ],
          },
        ],
      },
      {
        key: "facilities",
        label: "Facilities",
        icon: Building2,
        requiredClubPermissions: [],
        clubWorkspaceFamily: "CLUB_ADMIN",
      },
    ],
  },
  {
    label: "Governance",
    items: [
      {
        key: "profileBranding",
        label: "Profile & Branding",
        icon: UserCircle,
        requiredClubPermissions: [
          "club.profile.view",
          "club.profile.edit",
        ],
        clubPermissionMode: "any",
        clubWorkspaceFamily: "CLUB_ADMIN",
        children: [
          {
            key: "profileBrandingProfile",
            label: "Club Profile",
            icon: Building2,
            requiredClubPermissions: ["club.profile.edit"],
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "profileBrandingBrand",
            label: "Branding Editor",
            icon: Palette,
            requiredClubPermissions: ["club.profile.edit"],
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "profileBrandingVenues",
            label: "Venues",
            icon: MapPin,
            requiredClubPermissions: [],
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "profileBrandingMedia",
            label: "Media Assets",
            icon: ImageIcon,
            requiredClubPermissions: ["club.profile.edit"],
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "profileBrandingPreview",
            label: "Public Page Preview",
            icon: Eye,
            requiredClubPermissions: ["club.profile.view"],
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
        ],
      },
      {
        key: "sponsorshipMatchday",
        label: "Sponsorship & Matchday Operations",
        icon: Megaphone,
        requiredClubPermissions: [
          "club.sponsorship.view",
          "club.sponsorship.manage",
        ],
        clubPermissionMode: "any",
        clubWorkspaceFamily: "CLUB_ADMIN",
      },
    ],
  },
  {
    label: "Communication & Compliance",
    items: [
      {
        key: "communicationCompliance",
        label: "Communication & Compliance",
        icon: FileText,
        requiredClubPermissions: [],
        clubWorkspaceFamily: "CLUB_ADMIN",
        children: [
          {
            key: "compliance",
            label: "Compliance Documents",
            icon: ShieldCheck,
            requiredClubPermissions: [],
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "complianceChecklist",
            label: "Compliance Checklist",
            icon: ClipboardCheck,
            requiredClubPermissions: [],
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "communications",
            label: "Communications",
            icon: MessageSquare,
            requiredClubPermissions: [],
            clubWorkspaceFamily: "CLUB_ADMIN",
          },
          {
            key: "announcements",
            label: "Announcements",
            icon: Megaphone,
            requiredClubPermissions: [],
            clubWorkspaceFamily: "CLUB_ADMIN",
            children: [
              {
                key: "announcementsCompose",
                label: "Compose",
                icon: Plus,
                requiredClubPermissions: [],
                clubWorkspaceFamily: "CLUB_ADMIN",
              },
              {
                key: "announcementsPublish",
                label: "Publish",
                icon: Send,
                requiredClubPermissions: [],
                clubWorkspaceFamily: "CLUB_ADMIN",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        key: "reports",
        label: "Reports",
        icon: FileBarChart,
        requiredClubPermissions: ["club.reports.view"],
        clubWorkspaceFamily: "CLUB_ADMIN",
      },
      {
        key: "clubUsers",
        label: "User & Permission Management",
        icon: Users,
        requiredClubPermissions: [],
        clubWorkspaceFamily: "CLUB_ADMIN",
      },
      {
        key: "settings",
        label: "Settings",
        icon: SettingsIcon,
        requiredClubPermissions: ["club.settings.manage"],
        clubWorkspaceFamily: "CLUB_ADMIN",
      },
    ],
  },
];

const CLUB_ADMIN_BASE_PATH = CLUB_ADMIN_ROUTE;

const TAB_TO_PATH: Record<TabKey, string> = {
  overview: CLUB_ADMIN_BASE_PATH,
  membership: `${CLUB_ADMIN_BASE_PATH}/membership`,
  membershipDirectory: `${CLUB_ADMIN_BASE_PATH}/membership/directory`,
  membershipRenewals: `${CLUB_ADMIN_BASE_PATH}/membership/renewals`,
  membershipTiers: `${CLUB_ADMIN_BASE_PATH}/membership/tiers`,
  membershipRequests: `${CLUB_ADMIN_BASE_PATH}/membership/requests`,
  membershipReports: `${CLUB_ADMIN_BASE_PATH}/membership/reports`,
  teams: `${CLUB_ADMIN_BASE_PATH}/teams`,
  matches: `${CLUB_ADMIN_BASE_PATH}/matches`,
  finances: `${CLUB_ADMIN_BASE_PATH}/finances`,
  financeMembershipPayments: `${CLUB_ADMIN_BASE_PATH}/finances/membership-payments`,
  financeTicketingPayments: `${CLUB_ADMIN_BASE_PATH}/finances/ticketing-payments`,
  financeIncomeExpense: `${CLUB_ADMIN_BASE_PATH}/finances/income-expense`,
  financeInvoicesReceipts: `${CLUB_ADMIN_BASE_PATH}/finances/invoices-receipts`,
  financeAuditTrail: `${CLUB_ADMIN_BASE_PATH}/finances/audit-trail`,
  ticketing: `${CLUB_ADMIN_BASE_PATH}/ticketing`,
  ticketingGames: `${CLUB_ADMIN_BASE_PATH}/ticketing/games`,
  ticketingPricing: `${CLUB_ADMIN_BASE_PATH}/ticketing/pricing`,
  ticketingInventory: `${CLUB_ADMIN_BASE_PATH}/ticketing/inventory`,
  ticketingPublish: `${CLUB_ADMIN_BASE_PATH}/ticketing/publish`,
  ticketingPerformance: `${CLUB_ADMIN_BASE_PATH}/ticketing/performance`,
  ticketingScanner: `${CLUB_ADMIN_BASE_PATH}/ticketing/scanner`,
  ticketingEntryLogs: `${CLUB_ADMIN_BASE_PATH}/ticketing/entry-logs`,
  facilities: `${CLUB_ADMIN_BASE_PATH}/facilities`,
  profileBranding: `${CLUB_ADMIN_BASE_PATH}/profile-branding`,
  profileBrandingProfile: `${CLUB_ADMIN_BASE_PATH}/profile-branding/profile`,
  profileBrandingBrand: `${CLUB_ADMIN_BASE_PATH}/profile-branding/branding`,
  profileBrandingVenues: `${CLUB_ADMIN_BASE_PATH}/profile-branding/venues`,
  profileBrandingMedia: `${CLUB_ADMIN_BASE_PATH}/profile-branding/media`,
  profileBrandingPreview: `${CLUB_ADMIN_BASE_PATH}/profile-branding/preview`,
  sponsorshipMatchday: `${CLUB_ADMIN_BASE_PATH}/sponsorship-matchday`,
  communicationCompliance: `${CLUB_ADMIN_BASE_PATH}/communication-compliance`,
  compliance: `${CLUB_ADMIN_BASE_PATH}/compliance`,
  complianceChecklist: `${CLUB_ADMIN_BASE_PATH}/compliance-checklist`,
  reports: `${CLUB_ADMIN_BASE_PATH}/reports`,
  communications: `${CLUB_ADMIN_BASE_PATH}/communications`,
  announcements: `${CLUB_ADMIN_BASE_PATH}/announcements`,
  announcementsCompose: `${CLUB_ADMIN_BASE_PATH}/announcements/compose`,
  announcementsPublish: `${CLUB_ADMIN_BASE_PATH}/announcements/publish`,
  clubUsers: `${CLUB_ADMIN_BASE_PATH}/users`,
  settings: `${CLUB_ADMIN_BASE_PATH}/settings`,
};

const PATH_TO_TAB = new Map<string, TabKey>(
  Object.entries(TAB_TO_PATH).map(([tab, path]) => [
    path,
    tab as TabKey,
  ]),
);

function normalizePath(pathname: string) {
  if (pathname.length > 1) {
    return pathname.replace(/\/+$/, "");
  }

  return pathname;
}

function getTabFromPath(
  pathname: string,
  basePath: string,
): TabKey | null {
  const normalized = normalizePath(pathname);
  const canonicalPath = normalized.startsWith(basePath)
    ? `${CLUB_ADMIN_BASE_PATH}${normalized.slice(basePath.length)}`
    : normalized;

  return PATH_TO_TAB.get(canonicalPath) ?? null;
}

function getPathForTab(tab: TabKey, basePath: string) {
  return `${basePath}${TAB_TO_PATH[tab].slice(
    CLUB_ADMIN_BASE_PATH.length,
  )}`;
}

const TAB_TO_MODULE: Record<TabKey, ClubWorkspaceTab> = {
  overview: "overview",
  membership: "membership",
  membershipDirectory: "membership",
  membershipRenewals: "membership",
  membershipTiers: "membership",
  membershipRequests: "membership",
  membershipReports: "membership",
  teams: "teams",
  matches: "matches",
  finances: "finances",
  financeMembershipPayments: "finances",
  financeTicketingPayments: "finances",
  financeIncomeExpense: "finances",
  financeInvoicesReceipts: "finances",
  financeAuditTrail: "finances",
  ticketing: "ticketing",
  ticketingGames: "ticketing",
  ticketingPricing: "ticketing",
  ticketingInventory: "ticketing",
  ticketingPublish: "ticketing",
  ticketingPerformance: "ticketing",
  ticketingScanner: "ticketing",
  ticketingEntryLogs: "ticketing",
  facilities: "facilities",
  profileBranding: "profileBranding",
  profileBrandingProfile: "profileBranding",
  profileBrandingBrand: "profileBranding",
  profileBrandingVenues: "facilities",
  profileBrandingMedia: "profileBranding",
  profileBrandingPreview: "profileBranding",
  sponsorshipMatchday: "sponsorshipMatchday",
  communicationCompliance: "compliance",
  compliance: "compliance",
  complianceChecklist: "compliance",
  reports: "reports",
  communications: "communications",
  announcements: "communications",
  announcementsCompose: "communications",
  announcementsPublish: "communications",
  clubUsers: "clubUsers",
  settings: "settings",
};

const MODULE_TO_DEFAULT_TAB: Record<ClubWorkspaceTab, TabKey> = {
  overview: "overview",
  membership: "membership",
  teams: "teams",
  matches: "matches",
  finances: "finances",
  ticketing: "ticketing",
  facilities: "facilities",
  profileBranding: "profileBranding",
  sponsorshipMatchday: "sponsorshipMatchday",
  compliance: "compliance",
  reports: "reports",
  communications: "communications",
  clubUsers: "clubUsers",
  settings: "settings",
};

const TAB_PERMISSION_OVERRIDES: Partial<
  Record<TabKey, readonly string[]>
> = {
  overview: [],
  facilities: [],
  profileBrandingProfile: ["club.profile.edit"],
  profileBrandingBrand: ["club.profile.edit"],
  profileBrandingVenues: [],
  profileBrandingMedia: ["club.profile.edit"],
  profileBrandingPreview: ["club.profile.view"],
  ticketingGames: ["club.ticketing.manage"],
  ticketingPricing: ["club.ticketing.manage"],
  ticketingInventory: ["club.ticketing.manage"],
  ticketingPublish: ["club.ticketing.manage"],
  ticketingPerformance: ["club.ticketing.manage"],
  ticketingScanner: ["club.ticketing.validate"],
  ticketingEntryLogs: ["club.ticketing.validate"],
  compliance: [],
  communications: [],
  announcements: [],
  announcementsCompose: [],
  announcementsPublish: [],
  clubUsers: [],
};

function isWorkspaceTabPermitted(
  tab: TabKey,
  workspace: ActiveClubWorkspace,
) {
  const module = TAB_TO_MODULE[tab];

  if (
    workspace.dashboard === "TICKETING_OFFICER" &&
    module !== "ticketing"
  ) {
    return false;
  }

  const tabPermissions = TAB_PERMISSION_OVERRIDES[tab];

  if (tabPermissions) {
    if (tabPermissions.length === 0) {
      return true;
    }

    return tabPermissions.some((permission) =>
      workspace.permissions.includes(permission),
    );
  }

  return isClubTabPermitted(module, workspace.permissions);
}

function getDefaultWorkspaceTab(
  workspace: ActiveClubWorkspace,
): TabKey | null {
  if (workspace.dashboard === "TICKETING_OFFICER") {
    return isClubTabPermitted(
      "ticketing",
      workspace.permissions,
    )
      ? "ticketing"
      : null;
  }

  if (
    workspace.workspace_role === "TREASURER" &&
    isClubTabPermitted(
      "finances",
      workspace.permissions,
    )
  ) {
    return "finances";
  }

  if (
    workspace.workspace_role === "TEAM_MANAGER" &&
    isClubTabPermitted("teams", workspace.permissions)
  ) {
    return "teams";
  }

  const module = getFirstPermittedClubTab(
    workspace.permissions,
  );

  return module ? MODULE_TO_DEFAULT_TAB[module] : null;
}

function formatWorkspaceRole(role: string) {
  return role
    .replace(/_ADMIN$/, " ADMIN")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const STATUS_FILTERS = [
  "ALL",
  "ACTIVE",
  "PENDING_PAYMENT",
  "PAUSED",
  "EXPIRED",
  "CANCELLED",
  "FAILED",
];

const emptyPlanForm = {
  name: "",
  description: "",
  tier: "STANDARD",
  billing_cycle: "MONTHLY",
  price_amount: "",
  currency: "UGX",
  benefits: "",
  is_active: true,
  is_visible: true,
};

const emptyTicketTypeForm = {
  name: "",
  description: "",
  price: "",
  currency: "UGX",
  quantity_available: "",
  sale_start_at: "",
  sale_end_at: "",
};

const emptyGateConfigForm = {
  gate_name: "",
  capacity: "",
  notes: "",
  is_ticketing_enabled: false,
};

function daysUntil(dateString: string | null): number | null {
  if (!dateString) return null;
  const target = new Date(dateString).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

function downloadCsv(filename: string, rows: string[][]) {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

type HomeMatch = AdminWorkspaceMatch & {
  ticket_types?: number;
  tickets_sold?: number;
  checked_in?: number;
};

function MatchSelector({
  matches,
  selectedMatchId,
  onChange,
}: {
  matches: HomeMatch[];
  selectedMatchId: number | null;
  onChange: (matchId: number) => void;
}) {
  return (
    <div className="ctm-match-selector">
      <label htmlFor="ctm-match-select">Home game</label>
      <select
        id="ctm-match-select"
        value={selectedMatchId ?? ""}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {matches.map((match) => (
          <option key={match.id} value={match.id}>
            {match.label} · {formatWorkspaceDate(match.match_date)}
          </option>
        ))}
      </select>
    </div>
  );
}

function InventoryRow({
  ticketType,
  onSave,
}: {
  ticketType: TicketTypeApi;
  onSave: (nextQuantity: number) => void;
}) {
  const [value, setValue] = useState(String(ticketType.quantity_available));

  useEffect(() => {
    setValue(String(ticketType.quantity_available));
  }, [ticketType.quantity_available]);

  const sellThrough =
    ticketType.quantity_available > 0
      ? Math.round((ticketType.quantity_sold / ticketType.quantity_available) * 100)
      : 0;

  return (
    <tr>
      <td>
        <span className={styles.tablePrimary}>{ticketType.name}</span>
      </td>
      <td>
        <div className="ctm-inline-edit">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            type="button"
            className="ctm-link-button"
            onClick={() => onSave(Number(value) || 0)}
          >
            Save
          </button>
        </div>
      </td>
      <td>{ticketType.quantity_sold}</td>
      <td>{ticketType.active_reserved_quantity}</td>
      <td>{ticketType.remaining_quantity}</td>
      <td>{sellThrough}%</td>
    </tr>
  );
}

export default function ClubAdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const selectedEntitlementId = useClubWorkspaceStore(
    (state) => state.selectedEntitlementId,
  );
  const selectEntitlement = useClubWorkspaceStore(
    (state) => state.selectEntitlement,
  );
  const clubWorkspaceOptions = useMemo(
    () => getClubWorkspaceOptions(user?.dashboard_access),
    [user?.dashboard_access],
  );
  const activeWorkspace = useMemo(
    () =>
      resolveActiveClubWorkspace(
        user?.dashboard_access,
        selectedEntitlementId,
      ),
    [selectedEntitlementId, user?.dashboard_access],
  );
  const basePath =
    activeWorkspace?.route ??
    (location.pathname.startsWith(CLUB_TICKETING_ROUTE)
      ? CLUB_TICKETING_ROUTE
      : CLUB_ADMIN_ROUTE);
  const routeTab = useMemo(
    () => getTabFromPath(location.pathname, basePath),
    [basePath, location.pathname],
  );
  const defaultWorkspaceTab = activeWorkspace
    ? getDefaultWorkspaceTab(activeWorkspace)
    : null;
  const activeTab =
    activeWorkspace &&
    routeTab &&
    isWorkspaceTabPermitted(routeTab, activeWorkspace)
      ? routeTab
      : (defaultWorkspaceTab ?? "overview");
  const [data, setData] =
    useState<ClubAdminWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const loadRequestId = useRef(0);

  // Membership directory / plans state (shared across the five
  // membership child tabs, loaded alongside the main workspace).
  const [subscriptions, setSubscriptions] = useState<
    BackendMembershipSubscription[]
  >([]);
  const [plans, setPlans] = useState<BackendMembershipPlan[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(
    null,
  );
  const [planForm, setPlanForm] = useState(emptyPlanForm);
  const [planFormError, setPlanFormError] = useState("");
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Ticketing state (shared across the five ticketing child tabs,
  // mirroring the membership state above — see ClubTicketingManagement.tsx
  // for the standalone-page version of this same feature).
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(
    null,
  );
  const [ticketTypesByMatch, setTicketTypesByMatch] = useState<
    Record<number, TicketTypeApi[]>
  >({});
  const [isLoadingTicketTypes, setIsLoadingTicketTypes] = useState(false);
  const [ticketTypesError, setTicketTypesError] = useState("");

  const [showTicketTypeForm, setShowTicketTypeForm] = useState(false);
  const [editingTicketTypeId, setEditingTicketTypeId] = useState<
    number | null
  >(null);
  const [ticketTypeForm, setTicketTypeForm] = useState(emptyTicketTypeForm);
  const [ticketTypeFormError, setTicketTypeFormError] = useState("");
  const [isSavingTicketType, setIsSavingTicketType] = useState(false);

  const [gateConfigForm, setGateConfigForm] = useState(emptyGateConfigForm);
  const [isLoadingGateConfig, setIsLoadingGateConfig] = useState(false);
  const [isSavingGateConfig, setIsSavingGateConfig] = useState(false);
  const [gateConfigError, setGateConfigError] = useState("");

  const [salesSummaries, setSalesSummaries] = useState<
    MatchSalesSummary[] | null
  >(null);
  const [isLoadingSales, setIsLoadingSales] = useState(false);
  const [salesError, setSalesError] = useState("");
  const [scannedCode, setScannedCode] = useState("");
  const [validationMatchId, setValidationMatchId] =
    useState("");
  const [validationResult, setValidationResult] =
    useState<TicketValidationResult | null>(null);
  const [validationError, setValidationError] =
    useState("");
  const [isValidatingTicket, setIsValidatingTicket] =
    useState(false);

  useEffect(() => {
    if (!activeWorkspace || !defaultWorkspaceTab) return;

    const isCorrectWorkspaceRoute =
      location.pathname === activeWorkspace.route ||
      location.pathname.startsWith(
        `${activeWorkspace.route}/`,
      );
    const isAllowedRouteTab =
      routeTab &&
      isWorkspaceTabPermitted(routeTab, activeWorkspace);

    if (!isCorrectWorkspaceRoute || !isAllowedRouteTab) {
      navigate(
        getPathForTab(
          defaultWorkspaceTab,
          activeWorkspace.route,
        ),
        { replace: true },
      );
    }
  }, [
    activeWorkspace,
    defaultWorkspaceTab,
    location.pathname,
    navigate,
    routeTab,
  ]);

  // Membership's five sub-pages, and ticketing's five sub-pages,
  // render inline in this same workspace shell. The URL now carries
  // the active location, while the shell keeps the existing content.
  const handleTabChange = useCallback(
    (tab: TabKey) => {
      if (
        !activeWorkspace ||
        !isWorkspaceTabPermitted(tab, activeWorkspace)
      ) {
        return;
      }

      navigate(getPathForTab(tab, activeWorkspace.route));
    },
    [activeWorkspace, navigate],
  );

  const handleWorkspaceSelection = useCallback(
    (entitlementId: string) => {
      const nextWorkspace = clubWorkspaceOptions.find(
        (option) =>
          option.entitlement_id === entitlementId,
      );

      if (!nextWorkspace) return;

      selectEntitlement(nextWorkspace.entitlement_id);
      navigate(nextWorkspace.route, { replace: true });
    },
    [clubWorkspaceOptions, navigate, selectEntitlement],
  );

  const loadWorkspace = useCallback(async () => {
    const requestId = ++loadRequestId.current;
    setData(null);
    setSubscriptions([]);
    setPlans([]);
    setSelectedMatchId(null);
    setTicketTypesByMatch({});
    setSalesSummaries(null);
    setTicketTypesError("");
    setGateConfigError("");
    setSalesError("");
    setScannedCode("");
    setValidationMatchId("");
    setValidationResult(null);
    setValidationError("");
    setIsValidatingTicket(false);

    if (!activeWorkspace || !defaultWorkspaceTab) {
      setIsLoading(false);
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const workspaceData =
        await getSelectedClubWorkspace(activeWorkspace);

      if (requestId !== loadRequestId.current) return;

      setData(workspaceData);
      setValidationMatchId(
        String(workspaceData.ticket_events[0]?.id ?? ""),
      );

      if (
        activeWorkspace.permissions.includes(
          "club.members.manage",
        )
      ) {
        const clubId = workspaceData.club.id;
        const [subsResult, plansResult] =
          await Promise.all([
            getClubSubscriptions(clubId),
            getClubMembershipPlans(clubId),
          ]);

        if (requestId !== loadRequestId.current) return;

        setSubscriptions(subsResult);
        setPlans(plansResult);
      }
    } catch (loadError) {
      if (requestId !== loadRequestId.current) return;

      setData(null);
      setError(
        getApiErrorMessage(
          loadError,
          "The club workspace could not be loaded.",
        ),
      );
    } finally {
      if (requestId === loadRequestId.current) {
        setIsLoading(false);
      }
    }
  }, [activeWorkspace, defaultWorkspaceTab]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesStatus =
        statusFilter === "ALL" || sub.status === statusFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        sub.user_email.toLowerCase().includes(query) ||
        sub.plan_name.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [subscriptions, statusFilter, searchQuery]);

  const renewalSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === "ACTIVE" && sub.ends_at)
      .map((sub) => ({ ...sub, daysLeft: daysUntil(sub.ends_at) }))
      .filter((sub) => sub.daysLeft !== null && sub.daysLeft <= 30)
      .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));
  }, [subscriptions]);

  const expiredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => sub.status === "EXPIRED");
  }, [subscriptions]);

  const pendingSubscriptions = useMemo(() => {
    return subscriptions.filter(
      (sub) => sub.status === "PENDING_PAYMENT",
    );
  }, [subscriptions]);

  const stats = useMemo(
    () => [
      {
        label: "Competitions",
        value: data?.summary.competitions ?? 0,
        detail: "Competitions featuring this club",
        icon: Trophy,
      },
      {
        label: "Upcoming Fixtures",
        value: data?.summary.upcoming_fixtures ?? 0,
        detail: "Scheduled club matches",
        icon: CalendarDays,
      },
      {
        label: "Tickets Sold",
        value: data?.summary.tickets_sold ?? 0,
        detail: "Issued match tickets",
        icon: TicketCheck,
      },
      {
        label: "User & Permission Management",
        value: data?.summary.club_users ?? 0,
        detail: "Accounts attached to the club",
        icon: Users,
      },
    ],
    [data],
  );

  // ---------------------------------------------------------------- //
  // Ticketing derived data and effects                                //
  // ---------------------------------------------------------------- //

  const homeMatches = useMemo<HomeMatch[]>(() => {
    if (!data) return [];

    const byId = new Map<number, HomeMatch>();

    data.upcoming_fixtures
      .filter((match) => match.home_club_id === data.club.id)
      .forEach((match) => byId.set(match.id, match));

    data.ticket_events
      .filter((match) => match.home_club_id === data.club.id)
      .forEach((match) => {
        byId.set(match.id, { ...byId.get(match.id), ...match });
      });

    return Array.from(byId.values()).sort(
      (a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
    );
  }, [data]);

  useEffect(() => {
    if (!selectedMatchId && homeMatches.length > 0) {
      setSelectedMatchId(homeMatches[0].id);
    }
  }, [homeMatches, selectedMatchId]);

  const loadTicketTypesForMatch = useCallback(async (matchId: number) => {
    setIsLoadingTicketTypes(true);
    setTicketTypesError("");

    try {
      const { ticket_types } = await getMatchTicketTypes(matchId);
      setTicketTypesByMatch((prev) => ({ ...prev, [matchId]: ticket_types }));
    } catch (loadError) {
      setTicketTypesError(
        getApiErrorMessage(
          loadError,
          "Ticket types for this match could not be loaded.",
        ),
      );
    } finally {
      setIsLoadingTicketTypes(false);
    }
  }, []);

  useEffect(() => {
    if (
      selectedMatchId &&
      (activeTab === "ticketingPricing" ||
        activeTab === "ticketingInventory" ||
        activeTab === "ticketingPublish") &&
      !ticketTypesByMatch[selectedMatchId]
    ) {
      void loadTicketTypesForMatch(selectedMatchId);
    }
  }, [selectedMatchId, activeTab, ticketTypesByMatch, loadTicketTypesForMatch]);

  const loadGateConfigForMatch = useCallback(async (matchId: number) => {
    setIsLoadingGateConfig(true);
    setGateConfigError("");

    try {
      const config = await getMatchGateConfig(matchId);
      setGateConfigForm(
        config
          ? {
              gate_name: config.gate_name,
              capacity: config.capacity !== null ? String(config.capacity) : "",
              notes: config.notes,
              is_ticketing_enabled: config.is_ticketing_enabled,
            }
          : emptyGateConfigForm,
      );
    } catch {
      // Treated as "not configured yet" — no error banner on a missing gate config.
      setGateConfigForm(emptyGateConfigForm);
    } finally {
      setIsLoadingGateConfig(false);
    }
  }, []);

  useEffect(() => {
    if (selectedMatchId && activeTab === "ticketingGames") {
      void loadGateConfigForMatch(selectedMatchId);
    }
  }, [selectedMatchId, activeTab, loadGateConfigForMatch]);

  const loadSalesSummary = useCallback(async () => {
    setIsLoadingSales(true);
    setSalesError("");

    try {
      const summaries = await getClubSalesSummary(
        homeMatches.map((match) => ({
          id: match.id,
          label: match.label,
          match_date: match.match_date,
        })),
      );
      setSalesSummaries(summaries);
    } catch (loadError) {
      setSalesError(
        getApiErrorMessage(loadError, "Sales performance data could not be loaded."),
      );
    } finally {
      setIsLoadingSales(false);
    }
  }, [homeMatches]);

  useEffect(() => {
    if (
      activeTab === "ticketingPerformance" &&
      salesSummaries === null &&
      homeMatches.length > 0
    ) {
      void loadSalesSummary();
    }
  }, [activeTab, salesSummaries, homeMatches, loadSalesSummary]);

  function handleSelectMatch(matchId: number) {
    setSelectedMatchId(matchId);
  }

  function goToPricingForMatch(matchId: number) {
    setSelectedMatchId(matchId);
    handleTabChange("ticketingPricing");
    handleTabChange("ticketingPricing");
  }

  const selectedTicketTypes = selectedMatchId
    ? ticketTypesByMatch[selectedMatchId] ?? []
    : [];

  function openCreateTicketType() {
    setEditingTicketTypeId(null);
    setTicketTypeForm(emptyTicketTypeForm);
    setTicketTypeFormError("");
    setShowTicketTypeForm(true);
  }

  function openEditTicketType(ticketType: TicketTypeApi) {
    setEditingTicketTypeId(ticketType.id);
    setTicketTypeForm({
      name: ticketType.name,
      description: ticketType.description,
      price: ticketType.price,
      currency: ticketType.currency,
      quantity_available: String(ticketType.quantity_available),
      sale_start_at: ticketType.sale_start_at ?? "",
      sale_end_at: ticketType.sale_end_at ?? "",
    });
    setTicketTypeFormError("");
    setShowTicketTypeForm(true);
  }

  function closeTicketTypeForm() {
    setShowTicketTypeForm(false);
    setEditingTicketTypeId(null);
    setTicketTypeForm(emptyTicketTypeForm);
    setTicketTypeFormError("");
  }

  async function saveTicketType() {
    if (!selectedMatchId) return;

    if (!ticketTypeForm.name.trim() || !ticketTypeForm.price.trim()) {
      setTicketTypeFormError("Ticket name and price are required.");
      return;
    }

    setIsSavingTicketType(true);
    setTicketTypeFormError("");

    const payload: CreateTicketTypePayload = {
      name: ticketTypeForm.name.trim(),
      description: ticketTypeForm.description.trim(),
      price: ticketTypeForm.price.trim(),
      currency: ticketTypeForm.currency,
      quantity_available: Number(ticketTypeForm.quantity_available) || 0,
      sale_start_at: ticketTypeForm.sale_start_at || null,
      sale_end_at: ticketTypeForm.sale_end_at || null,
    };

    try {
      const saved = editingTicketTypeId
        ? await updateTicketType(editingTicketTypeId, payload)
        : await createTicketType(selectedMatchId, payload);

      setTicketTypesByMatch((prev) => {
        const existing = prev[selectedMatchId] ?? [];
        const next = editingTicketTypeId
          ? existing.map((ticketType) =>
              ticketType.id === saved.id ? saved : ticketType,
            )
          : [...existing, saved];

        return { ...prev, [selectedMatchId]: next };
      });

      closeTicketTypeForm();
    } catch (saveError) {
      setTicketTypeFormError(
        getApiErrorMessage(saveError, "The ticket type could not be saved."),
      );
    } finally {
      setIsSavingTicketType(false);
    }
  }

  async function saveGateConfig() {
    if (!selectedMatchId) return;

    setIsSavingGateConfig(true);
    setGateConfigError("");

    const payload: GateConfigPayload = {
      match: selectedMatchId,
      gate_name: gateConfigForm.gate_name.trim(),
      capacity: gateConfigForm.capacity ? Number(gateConfigForm.capacity) : null,
      notes: gateConfigForm.notes.trim(),
      is_ticketing_enabled: gateConfigForm.is_ticketing_enabled,
    };

    try {
      await saveMatchGateConfig(selectedMatchId, payload);
    } catch (saveError) {
      setGateConfigError(
        getApiErrorMessage(saveError, "Gate settings could not be saved."),
      );
    } finally {
      setIsSavingGateConfig(false);
    }
  }

  async function updateInventoryQuantity(
    ticketType: TicketTypeApi,
    nextQuantity: number,
  ) {
    if (!selectedMatchId) return;

    const floor = ticketType.quantity_sold + ticketType.active_reserved_quantity;

    if (nextQuantity < floor) {
      setTicketTypesError(
        `Inventory can't drop below ${floor} (already sold or reserved).`,
      );
      return;
    }

    try {
      const updated = await updateTicketType(ticketType.id, {
        quantity_available: nextQuantity,
      });

      setTicketTypesByMatch((prev) => ({
        ...prev,
        [selectedMatchId]: (prev[selectedMatchId] ?? []).map((t) =>
          t.id === updated.id ? updated : t,
        ),
      }));
    } catch (updateError) {
      setTicketTypesError(
        getApiErrorMessage(updateError, "Inventory could not be updated."),
      );
    }
  }

  async function handleStatusChange(
    ticketType: TicketTypeApi,
    status: TicketTypeStatus,
  ) {
    if (!selectedMatchId) return;

    try {
      const updated = await setTicketTypeStatus(ticketType.id, status);

      setTicketTypesByMatch((prev) => ({
        ...prev,
        [selectedMatchId]: (prev[selectedMatchId] ?? []).map((t) =>
          t.id === updated.id ? updated : t,
        ),
      }));
    } catch (updateError) {
      setTicketTypesError(
        getApiErrorMessage(updateError, "Ticket status could not be updated."),
      );
    }
  }

  async function handleBulkStatusChange(
    from: TicketTypeStatus,
    to: TicketTypeStatus,
  ) {
    if (!selectedMatchId) return;

    const targets = selectedTicketTypes.filter((t) => t.status === from);
    if (targets.length === 0) return;

    try {
      const updated = await Promise.all(targets.map((t) => setTicketTypeStatus(t.id, to)));
      const updatedById = new Map(updated.map((t) => [t.id, t]));

      setTicketTypesByMatch((prev) => ({
        ...prev,
        [selectedMatchId]: (prev[selectedMatchId] ?? []).map(
          (t) => updatedById.get(t.id) ?? t,
        ),
      }));
    } catch (updateError) {
      setTicketTypesError(getApiErrorMessage(updateError, "Bulk status update failed."));
    }
  }

  function exportSalesCsv() {
    if (!salesSummaries) return;

    const rows = [
      ["Match", "Date", "Revenue", "Tickets Sold", "Available", "Sell-Through %"],
      ...salesSummaries.map((summary) => [
        summary.match_label,
        summary.match_date,
        String(summary.revenue),
        String(summary.tickets_sold),
        String(summary.quantity_available),
        (summary.sell_through_rate * 100).toFixed(1),
      ]),
    ];

    downloadCsv(`${data?.club.slug ?? "club"}-ticket-sales.csv`, rows);
  }

  function renderFixtureTable(
    rows: ClubAdminWorkspaceData["upcoming_fixtures"],
    mode: "fixture" | "result",
  ) {
    if (rows.length === 0) {
      return (
        <WorkspaceEmpty
          title={
            mode === "fixture"
              ? "No upcoming fixtures"
              : "No completed results"
          }
          description={
            mode === "fixture"
              ? "Scheduled matches involving this club will appear here."
              : "Completed match results will appear here."
          }
        />
      );
    }

    return (
      <div className={styles.tableShell}>
        <table>
          <thead>
            <tr>
              <th>Match</th>
              <th>Competition</th>
              <th>Date</th>
              <th>Venue</th>
              {mode === "result" ? <th>Score</th> : null}
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((match) => (
              <tr key={match.id}>
                <td>
                  <span className={styles.tablePrimary}>
                    {match.label}
                  </span>
                  <span className={styles.tableSecondary}>
                    {match.league}
                  </span>
                </td>
                <td>{match.competition}</td>
                <td>
                  {formatWorkspaceDate(match.match_date)}
                </td>
                <td>{match.venue || "TBC"}</td>
                {mode === "result" ? (
                  <td>
                    {match.home_score ?? "—"} –{" "}
                    {match.away_score ?? "—"}
                  </td>
                ) : null}
                <td>
                  <WorkspaceStatus value={match.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderFinancialChart() {
    return data?.financial_overview?.length ? (
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data.financial_overview}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
            />
            <XAxis dataKey="month" stroke="var(--muted)" />
            <YAxis stroke="var(--muted)" />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
            />
            <Legend />
            <Bar
              dataKey="income"
              fill="var(--green)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ) : (
      <WorkspaceEmpty
        title="No financial data"
        description="Income and expense records will appear here once available."
      />
    );
  }

  function renderOverview() {
    return (
      <>
        <WorkspaceStatGrid stats={stats} />

        <div className={styles.gridTwo}>
          <WorkspacePanel
            eyebrow="League participation"
            title="League memberships"
            description="Current league and season relationships recorded for this club."
          >
            {data?.league_memberships.length ? (
              <div className={styles.scopeGrid}>
                {data.league_memberships.map(
                  (membership) => (
                    <article
                      className={styles.scopeCard}
                      key={membership.id}
                    >
                      <span>
                        {membership.status_display}
                      </span>
                      <strong>{membership.league}</strong>
                      <small>
                        {membership.season ??
                          "No season assigned"}
                      </small>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <WorkspaceEmpty
                title="No league memberships"
                description="This club is not currently linked to a league season."
              />
            )}
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Ticketing readiness"
            title="Matchday access"
            description="Live ticket inventory and check-in totals for matches involving this club."
          >
            <div className={styles.scopeGrid}>
              <article className={styles.scopeCard}>
                <span>Ticket types</span>
                <strong>
                  {data?.summary.ticket_types ?? 0}
                </strong>
                <small>Configured inventory records</small>
              </article>

              <article className={styles.scopeCard}>
                <span>Checked in</span>
                <strong>
                  {data?.summary.checked_in ?? 0}
                </strong>
                <small>Tickets admitted at the gate</small>
              </article>
            </div>
          </WorkspacePanel>
        </div>

        <div className={styles.gridTwo}>
          <WorkspacePanel
            eyebrow="Club activity"
            title="Recent activity"
            description="The latest updates across your club."
          >
            {data?.recent_activity?.length ? (
              <div className={styles.scopeGrid}>
                {data.recent_activity.map((activity) => (
                  <article
                    className={styles.scopeCard}
                    key={activity.id}
                  >
                    <span>
                      {formatWorkspaceDate(
                        activity.timestamp,
                      )}
                    </span>
                    <strong>{activity.title}</strong>
                    <small>{activity.description}</small>
                  </article>
                ))}
              </div>
            ) : (
              <WorkspaceEmpty
                title="No recent activity"
                description="Updates like new members, results, and payments will appear here."
              />
            )}
          </WorkspacePanel>

          <WorkspacePanel
            eyebrow="Club finances"
            title="Financial overview"
            description="Income vs expense across recent months."
            actions={
              <button
                type="button"
                className={styles.publicLink}
                onClick={() => handleTabChange("finances")}
              >
                View full finances
              </button>
            }
          >
            {renderFinancialChart()}
          </WorkspacePanel>
        </div>

        <WorkspacePanel
          eyebrow="Next matches"
          title="Upcoming fixtures"
          description="The next scheduled matches involving your club."
          actions={
            <button
              type="button"
              className={styles.publicLink}
              onClick={() => handleTabChange("matches")}
            >
              View all matches
            </button>
          }
        >
          {renderFixtureTable(
            data?.upcoming_fixtures ?? [],
            "fixture",
          )}
        </WorkspacePanel>
      </>
    );
  }

  function renderMatches() {
    return (
      <>
        <WorkspacePanel
          eyebrow="Club schedule"
          title="Upcoming fixtures"
          description="Every scheduled fixture involving this club."
        >
          {renderFixtureTable(
            data?.upcoming_fixtures ?? [],
            "fixture",
          )}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Club performance"
          title="Recent results"
          description="Completed match records involving this club."
        >
          {renderFixtureTable(
            data?.recent_results ?? [],
            "result",
          )}
        </WorkspacePanel>
      </>
    );
  }

  function renderFinances() {
    return (
      <WorkspacePanel
        eyebrow="Club finance & audit"
        title="Finance & Audit"
        description="Income, payments, invoices, receipts, and audit controls for this club."
      >
        {renderFinancialChart()}
      </WorkspacePanel>
    );
  }

  function renderFinanceMembershipPayments() {
    const membershipStats = [
      {
        label: "Subscriptions",
        value: subscriptions.length,
        detail: "Membership payment records tracked",
        icon: CreditCard,
      },
      {
        label: "Active Members",
        value: subscriptions.filter((sub) => sub.status === "ACTIVE").length,
        detail: "Paid or currently valid subscriptions",
        icon: Users,
      },
      {
        label: "Pending Payment",
        value: pendingSubscriptions.length,
        detail: "Memberships awaiting payment completion",
        icon: Inbox,
      },
      {
        label: "Expired",
        value: expiredSubscriptions.length,
        detail: "Past-due or expired memberships",
        icon: RefreshCw,
      },
    ];

    return (
      <>
        <WorkspaceStatGrid stats={membershipStats} />
        {renderMembershipDirectory()}
      </>
    );
  }

  function renderFinanceTicketingPayments() {
    return (
      <>
        <WorkspacePanel
          eyebrow="Ticketing payments"
          title="Ticketing payments overview"
          description="Review ticket revenue, sales volume, and sell-through across home fixtures."
        >
          <WorkspaceEmpty
            title="Ticketing payment summary"
            description="The detailed sales performance section below uses current ticketing revenue and inventory records."
          />
        </WorkspacePanel>
        {renderTicketingPerformance()}
      </>
    );
  }

  function renderFinanceIncomeExpense() {
    const totals = (data?.financial_overview ?? []).reduce(
      (summary, point) => ({
        income: summary.income + point.income,
        expense: summary.expense + point.expense,
      }),
      { income: 0, expense: 0 },
    );

    const financeStats = [
      {
        label: "Total Income",
        value: formatTicketCurrency(totals.income),
        detail: "Across available finance periods",
        icon: Wallet,
      },
      {
        label: "Total Expense",
        value: formatTicketCurrency(totals.expense),
        detail: "Across available finance periods",
        icon: FileBarChart,
      },
      {
        label: "Net Position",
        value: formatTicketCurrency(totals.income - totals.expense),
        detail: "Income less expense",
        icon: BarChart3,
      },
    ];

    return (
      <>
        <WorkspaceStatGrid stats={financeStats} />
        <WorkspacePanel
          eyebrow="Income & expense"
          title="Income & expense summary"
          description="Compare incoming funds and outgoing expenses across recent months."
        >
          {renderFinancialChart()}
        </WorkspacePanel>
      </>
    );
  }

  function renderFinanceInvoicesReceipts() {
    return (
      <WorkspacePanel
        eyebrow="Invoices & receipts"
        title="Invoices & receipts list"
        description="Central register for generated invoices, receipts, payment references, and exportable finance documents."
      >
        <WorkspaceEmpty
          title="No invoices or receipts yet"
          description="Invoice and receipt records will appear here once finance document endpoints are connected."
        />
      </WorkspacePanel>
    );
  }

  function renderFinanceAuditTrail() {
    return (
      <WorkspacePanel
        eyebrow="Audit trail"
        title="Audit trail log viewer"
        description="Review recent club finance and administration activity for audit follow-up."
      >
        {data?.recent_activity?.length ? (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Details</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_activity.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className={styles.tablePrimary}>{item.title}</span>
                    </td>
                    <td>{item.description}</td>
                    <td>{formatWorkspaceDate(item.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <WorkspaceEmpty
            title="No audit activity yet"
            description="Finance audit events will appear here as tracked actions are recorded."
          />
        )}
      </WorkspacePanel>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Membership sub-pages (real content, ported from                    */
  /* ClubMembershipManagement.tsx so both entry points stay in sync)     */
  /* ------------------------------------------------------------------ */

  function openCreatePlan() {
    setEditingPlanId(null);
    setPlanForm(emptyPlanForm);
    setPlanFormError("");
    setShowPlanForm(true);
  }

  function openEditPlan(plan: BackendMembershipPlan) {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      description: plan.description,
      tier: plan.tier,
      billing_cycle: plan.billing_cycle,
      price_amount: plan.price_amount,
      currency: plan.currency,
      benefits: (plan.benefits ?? []).join("\n"),
      is_active: plan.is_active,
      is_visible: plan.is_visible,
    });
    setPlanFormError("");
    setShowPlanForm(true);
  }

  function closePlanForm() {
    setShowPlanForm(false);
    setEditingPlanId(null);
    setPlanForm(emptyPlanForm);
    setPlanFormError("");
  }

  async function savePlan() {
    if (!data) return;

    if (!planForm.name.trim() || !planForm.price_amount.trim()) {
      setPlanFormError("Plan name and price are required.");
      return;
    }

    setIsSavingPlan(true);
    setPlanFormError("");

    const payload = {
      club: data.club.id,
      name: planForm.name.trim(),
      description: planForm.description.trim(),
      tier: planForm.tier,
      billing_cycle: planForm.billing_cycle,
      price_amount: planForm.price_amount.trim(),
      currency: planForm.currency,
      benefits: planForm.benefits
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean),
      is_active: planForm.is_active,
      is_visible: planForm.is_visible,
    };

    try {
      if (editingPlanId) {
        const updated = await updateMembershipPlan(
          editingPlanId,
          payload,
        );
        setPlans((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
      } else {
        const created = await createMembershipPlan(payload);
        setPlans((prev) => [...prev, created]);
      }
      closePlanForm();
    } catch (saveError) {
      setPlanFormError(
        getApiErrorMessage(
          saveError,
          "The membership plan could not be saved.",
        ),
      );
    } finally {
      setIsSavingPlan(false);
    }
  }

  function exportDirectoryCsv() {
    const rows = [
      ["Email", "Plan", "Status", "Starts", "Ends", "Created"],
      ...filteredSubscriptions.map((sub) => [
        sub.user_email,
        sub.plan_name,
        sub.status,
        sub.starts_at ?? "",
        sub.ends_at ?? "",
        sub.created_at,
      ]),
    ];
    downloadCsv(
      `${data?.club.slug ?? "club"}-members-directory.csv`,
      rows,
    );
  }

  function exportRenewalsCsv() {
    const rows = [
      ["Email", "Plan", "Ends", "Days Left"],
      ...renewalSubscriptions.map((sub) => [
        sub.user_email,
        sub.plan_name,
        sub.ends_at ?? "",
        String(sub.daysLeft ?? ""),
      ]),
    ];
    downloadCsv(`${data?.club.slug ?? "club"}-renewals.csv`, rows);
  }

  function renderMembershipDirectory() {
    return (
      <WorkspacePanel
        eyebrow="Members"
        title="Members Directory"
        description="All fan memberships recorded for your club."
        actions={
          <div className="cmm-filter-bar">
            <div className="cmm-search-wrap">
              <Search size={15} className="cmm-search-icon" />
              <input
                className="cmm-search-input"
                type="text"
                placeholder="Search by email or plan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="cmm-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All Statuses" : s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {filteredSubscriptions.length === 0 ? (
          <WorkspaceEmpty
            title="No members found"
            description="No memberships match the current filters."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <span className={styles.tablePrimary}>
                        {sub.user_email}
                      </span>
                    </td>
                    <td>{sub.plan_name}</td>
                    <td>
                      <WorkspaceStatus value={sub.status} />
                    </td>
                    <td>
                      {sub.starts_at
                        ? formatWorkspaceDate(sub.starts_at)
                        : "—"}
                    </td>
                    <td>
                      {sub.ends_at
                        ? formatWorkspaceDate(sub.ends_at)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderMembershipRenewals() {
    return (
      <>
        <WorkspacePanel
          eyebrow="Renewals"
          title="Renewing within 30 days"
          description="Active members whose subscription is about to expire."
        >
          {renewalSubscriptions.length === 0 ? (
            <WorkspaceEmpty
              title="No upcoming renewals"
              description="No active members are due to renew in the next 30 days."
            />
          ) : (
            <div className={styles.tableShell}>
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Plan</th>
                    <th>Ends</th>
                    <th>Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  {renewalSubscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <span className={styles.tablePrimary}>
                          {sub.user_email}
                        </span>
                      </td>
                      <td>{sub.plan_name}</td>
                      <td>
                        {sub.ends_at
                          ? formatWorkspaceDate(sub.ends_at)
                          : "—"}
                      </td>
                      <td>
                        {sub.daysLeft} day
                        {sub.daysLeft === 1 ? "" : "s"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Expired"
          title="Expired Memberships"
          description="Members whose subscription has already lapsed."
        >
          {expiredSubscriptions.length === 0 ? (
            <WorkspaceEmpty
              title="No expired memberships"
              description="All memberships are currently in good standing."
            />
          ) : (
            <div className={styles.tableShell}>
              <table>
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Plan</th>
                    <th>Expired On</th>
                  </tr>
                </thead>
                <tbody>
                  {expiredSubscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <span className={styles.tablePrimary}>
                          {sub.user_email}
                        </span>
                      </td>
                      <td>{sub.plan_name}</td>
                      <td>
                        {sub.ends_at
                          ? formatWorkspaceDate(sub.ends_at)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WorkspacePanel>
      </>
    );
  }

  function renderMembershipTiers() {
    return (
      <WorkspacePanel
        eyebrow="Membership Plans"
        title="Tiers & Pricing"
        description="Configure the membership tiers available for your club."
        actions={
          <button
            type="button"
            className={styles.primaryButton}
            onClick={openCreatePlan}
          >
            <Plus size={15} /> New Plan
          </button>
        }
      >
        {plans.length === 0 ? (
          <WorkspaceEmpty
            title="No membership plans yet"
            description="Create your first membership tier to start accepting members."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Tier</th>
                  <th>Billing</th>
                  <th>Price</th>
                  <th>Visibility</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td>
                      <span className={styles.tablePrimary}>
                        {plan.name}
                      </span>
                    </td>
                    <td>{plan.tier}</td>
                    <td>{plan.billing_cycle}</td>
                    <td>
                      {formatMembershipCurrency(
                        Number(plan.price_amount),
                        plan.currency,
                      )}
                    </td>
                    <td>
                      <WorkspaceStatus
                        value={
                          plan.is_visible ? "ACTIVE" : "HIDDEN"
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cmm-link-button"
                        onClick={() => openEditPlan(plan)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showPlanForm && (
          <div className="cmm-form-overlay" onClick={closePlanForm}>
            <div
              className="cmm-form-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="cmm-form-header">
                <h3>
                  {editingPlanId
                    ? "Edit Membership Plan"
                    : "New Membership Plan"}
                </h3>
                <button
                  type="button"
                  onClick={closePlanForm}
                  className="cmm-form-close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="cmm-form-grid">
                <label>
                  Plan Name
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Gold Membership"
                  />
                </label>
                <label>
                  Tier
                  <select
                    value={planForm.tier}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        tier: e.target.value,
                      })
                    }
                  >
                    <option value="BRONZE">Bronze</option>
                    <option value="SILVER">Silver</option>
                    <option value="GOLD">Gold</option>
                    <option value="PLATINUM">Platinum</option>
                    <option value="STANDARD">Standard</option>
                  </select>
                </label>
                <label>
                  Billing Cycle
                  <select
                    value={planForm.billing_cycle}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        billing_cycle: e.target.value,
                      })
                    }
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="SEMI_ANNUAL">
                      Semi-Annual
                    </option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </label>
                <label>
                  Price Amount
                  <input
                    type="text"
                    inputMode="decimal"
                    value={planForm.price_amount}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        price_amount: e.target.value,
                      })
                    }
                    placeholder="150000"
                  />
                </label>
                <label>
                  Currency
                  <input
                    type="text"
                    value={planForm.currency}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        currency: e.target.value,
                      })
                    }
                    placeholder="UGX"
                  />
                </label>
                <label className="cmm-form-full">
                  Description
                  <textarea
                    value={planForm.description}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </label>
                <label className="cmm-form-full">
                  Benefits (one per line)
                  <textarea
                    value={planForm.benefits}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        benefits: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder={
                      "Priority ticket access\nExclusive merchandise discount"
                    }
                  />
                </label>
                <label className="cmm-checkbox-row">
                  <input
                    type="checkbox"
                    checked={planForm.is_visible}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        is_visible: e.target.checked,
                      })
                    }
                  />
                  Visible to fans
                </label>
                <label className="cmm-checkbox-row">
                  <input
                    type="checkbox"
                    checked={planForm.is_active}
                    onChange={(e) =>
                      setPlanForm({
                        ...planForm,
                        is_active: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
              </div>

              {planFormError && (
                <p className="cmm-form-error">{planFormError}</p>
              )}

              <div className="cmm-form-actions">
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={closePlanForm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => void savePlan()}
                  disabled={isSavingPlan}
                >
                  {isSavingPlan
                    ? "Saving..."
                    : editingPlanId
                      ? "Save Changes"
                      : "Create Plan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderMembershipRequests() {
    return (
      <WorkspacePanel
        eyebrow="Requests"
        title="Membership Requests Queue"
        description="Members with a subscription awaiting completed payment."
      >
        <div className="cmm-notice-banner">
          Approve/reject actions are not yet available —
          membership activation currently happens automatically
          once payment is confirmed. This list is read-only until a
          manual review workflow is added on the backend.
        </div>
        {pendingSubscriptions.length === 0 ? (
          <WorkspaceEmpty
            title="No pending requests"
            description="There are no memberships currently awaiting payment."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Requested</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingSubscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <span className={styles.tablePrimary}>
                        {sub.user_email}
                      </span>
                    </td>
                    <td>{sub.plan_name}</td>
                    <td>
                      {formatWorkspaceDate(sub.created_at)}
                    </td>
                    <td>
                      <WorkspaceStatus value={sub.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderMembershipReports() {
    return (
      <WorkspacePanel
        eyebrow="Reports"
        title="Export Reports"
        description="Download membership data as CSV files for offline reporting."
      >
        <div className="cmm-report-grid">
          <div className="cmm-report-card">
            <h4>Members Directory</h4>
            <p>
              Export the currently filtered members directory
              list.
            </p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={exportDirectoryCsv}
              disabled={filteredSubscriptions.length === 0}
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
          <div className="cmm-report-card">
            <h4>Upcoming Renewals</h4>
            <p>Export members renewing within the next 30 days.</p>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={exportRenewalsCsv}
              disabled={renewalSubscriptions.length === 0}
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>
      </WorkspacePanel>
    );
  }

  function renderMembershipOverview() {
    // Landing tab for "Membership" itself — a quick summary with
    // links into each sub-section, rather than a bare placeholder.
    const membershipStats = [
      {
        label: "Total Members",
        value: subscriptions.length,
        detail: "All subscriptions on record",
        icon: Users,
      },
      {
        label: "Active",
        value: subscriptions.filter((s) => s.status === "ACTIVE")
          .length,
        detail: "Currently active members",
        icon: Users,
      },
      {
        label: "Renewing Soon",
        value: renewalSubscriptions.length,
        detail: "Expiring within 30 days",
        icon: RefreshCw,
      },
      {
        label: "Pending Payment",
        value: pendingSubscriptions.length,
        detail: "Awaiting completed payment",
        icon: Inbox,
      },
    ];

    return (
      <>
        <WorkspaceStatGrid stats={membershipStats} />
        {renderMembershipDirectory()}
      </>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Ticketing sub-pages (CLUB-005 — ported from                        */
  /* ClubTicketingManagement.tsx so both entry points stay in sync)      */
  /* ------------------------------------------------------------------ */

  function renderTicketingGames() {
    return (
      <>
        <WorkspacePanel
          eyebrow="Home fixtures"
          title="Home Games"
          description="Fixtures where your club is the home side. Select a match to configure ticketing and gate details."
        >
          {homeMatches.length === 0 ? (
            <WorkspaceEmpty
              title="No home fixtures yet"
              description="Ticketing can be configured once your club has upcoming home fixtures."
            />
          ) : (
            <div className={styles.tableShell}>
              <table>
                <thead>
                  <tr>
                    <th>Match</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Ticket Types</th>
                    <th>Sold</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {homeMatches.map((match) => (
                    <tr key={match.id}>
                      <td>
                        <span className={styles.tablePrimary}>{match.label}</span>
                        <span className={styles.tableSecondary}>
                          {match.competition}
                        </span>
                      </td>
                      <td>{formatWorkspaceDate(match.match_date)}</td>
                      <td>{match.venue || "TBC"}</td>
                      <td>{match.ticket_types ?? 0}</td>
                      <td>{match.tickets_sold ?? 0}</td>
                      <td>
                        <button
                          type="button"
                          className="ctm-link-button"
                          onClick={() => goToPricingForMatch(match.id)}
                        >
                          Configure pricing →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WorkspacePanel>

        {selectedMatchId ? (
          <WorkspacePanel
            eyebrow="Gate & venue settings"
            title="Home gate configuration"
            description="Configure gate details and enable ticketing for the selected home game."
            actions={
              <MatchSelector
                matches={homeMatches}
                selectedMatchId={selectedMatchId}
                onChange={handleSelectMatch}
              />
            }
          >
            {isLoadingGateConfig ? (
              <WorkspaceLoading label="Loading gate settings…" />
            ) : (
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="gate-name">Gate name</label>
                  <input
                    id="gate-name"
                    value={gateConfigForm.gate_name}
                    onChange={(e) =>
                      setGateConfigForm({ ...gateConfigForm, gate_name: e.target.value })
                    }
                    placeholder="Main Gate"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="gate-capacity">Capacity</label>
                  <input
                    id="gate-capacity"
                    type="number"
                    min={0}
                    value={gateConfigForm.capacity}
                    onChange={(e) =>
                      setGateConfigForm({ ...gateConfigForm, capacity: e.target.value })
                    }
                    placeholder="5000"
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label htmlFor="gate-notes">Notes</label>
                  <textarea
                    id="gate-notes"
                    rows={3}
                    value={gateConfigForm.notes}
                    onChange={(e) =>
                      setGateConfigForm({ ...gateConfigForm, notes: e.target.value })
                    }
                    placeholder="Entry points, security instructions, accessibility notes…"
                  />
                </div>

                <label className="ctm-checkbox-row">
                  <input
                    type="checkbox"
                    checked={gateConfigForm.is_ticketing_enabled}
                    onChange={(e) =>
                      setGateConfigForm({
                        ...gateConfigForm,
                        is_ticketing_enabled: e.target.checked,
                      })
                    }
                  />
                  Ticketing enabled for this match
                </label>

                {gateConfigError ? <p className="ctm-form-error">{gateConfigError}</p> : null}

                <div className={`${styles.toolbar} ${styles.fieldFull}`}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => void saveGateConfig()}
                    disabled={isSavingGateConfig}
                  >
                    {isSavingGateConfig ? "Saving…" : "Save gate settings"}
                  </button>
                </div>
              </div>
            )}
          </WorkspacePanel>
        ) : null}
      </>
    );
  }

  function renderTicketingPricing() {
    return (
      <WorkspacePanel
        eyebrow="Ticket types"
        title="Ticket Type & Pricing Builder"
        description="Create and edit ticket types for the selected home game."
        actions={
          <div className="ctm-match-selector">
            <MatchSelector
              matches={homeMatches}
              selectedMatchId={selectedMatchId}
              onChange={handleSelectMatch}
            />
            <button
              type="button"
              className={styles.primaryButton}
              onClick={openCreateTicketType}
              disabled={!selectedMatchId}
            >
              <Plus size={15} /> New Ticket Type
            </button>
          </div>
        }
      >
        {ticketTypesError ? (
          <div className={styles.validationCard}>
            <strong>Something went wrong</strong>
            <span>{ticketTypesError}</span>
          </div>
        ) : null}

        {isLoadingTicketTypes ? (
          <WorkspaceLoading label="Loading ticket types…" />
        ) : selectedTicketTypes.length === 0 ? (
          <WorkspaceEmpty
            title="No ticket types yet"
            description="Create a ticket type to start selling tickets for this match."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Sale Window</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {selectedTicketTypes.map((ticketType) => (
                  <tr key={ticketType.id}>
                    <td>
                      <span className={styles.tablePrimary}>{ticketType.name}</span>
                      <span className={styles.tableSecondary}>
                        {ticketType.description}
                      </span>
                    </td>
                    <td>
                      {formatTicketCurrency(Number(ticketType.price), ticketType.currency)}
                    </td>
                    <td>
                      {ticketType.sale_start_at
                        ? formatWorkspaceDate(ticketType.sale_start_at)
                        : "—"}
                      {" – "}
                      {ticketType.sale_end_at
                        ? formatWorkspaceDate(ticketType.sale_end_at)
                        : "—"}
                    </td>
                    <td>
                      <WorkspaceStatus value={ticketType.status} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="ctm-link-button"
                        onClick={() => openEditTicketType(ticketType)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showTicketTypeForm && (
          <div className="ctm-form-overlay" onClick={closeTicketTypeForm}>
            <div className="ctm-form-card" onClick={(e) => e.stopPropagation()}>
              <div className="ctm-form-header">
                <h3>{editingTicketTypeId ? "Edit Ticket Type" : "New Ticket Type"}</h3>
                <button type="button" onClick={closeTicketTypeForm} className="ctm-form-close">
                  <X size={18} />
                </button>
              </div>

              <div className="ctm-form-grid">
                <label>
                  Name
                  <input
                    type="text"
                    value={ticketTypeForm.name}
                    onChange={(e) =>
                      setTicketTypeForm({ ...ticketTypeForm, name: e.target.value })
                    }
                    placeholder="General Admission"
                  />
                </label>
                <label>
                  Price
                  <input
                    type="text"
                    inputMode="decimal"
                    value={ticketTypeForm.price}
                    onChange={(e) =>
                      setTicketTypeForm({ ...ticketTypeForm, price: e.target.value })
                    }
                    placeholder="20000"
                  />
                </label>
                <label>
                  Currency
                  <input
                    type="text"
                    value={ticketTypeForm.currency}
                    onChange={(e) =>
                      setTicketTypeForm({ ...ticketTypeForm, currency: e.target.value })
                    }
                    placeholder="UGX"
                  />
                </label>
                <label>
                  Quantity available
                  <input
                    type="number"
                    min={0}
                    value={ticketTypeForm.quantity_available}
                    onChange={(e) =>
                      setTicketTypeForm({
                        ...ticketTypeForm,
                        quantity_available: e.target.value,
                      })
                    }
                    placeholder="500"
                  />
                </label>
                <label>
                  Sale start
                  <input
                    type="datetime-local"
                    value={ticketTypeForm.sale_start_at}
                    onChange={(e) =>
                      setTicketTypeForm({
                        ...ticketTypeForm,
                        sale_start_at: e.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Sale end
                  <input
                    type="datetime-local"
                    value={ticketTypeForm.sale_end_at}
                    onChange={(e) =>
                      setTicketTypeForm({ ...ticketTypeForm, sale_end_at: e.target.value })
                    }
                  />
                </label>
                <label className="ctm-form-full">
                  Description
                  <textarea
                    rows={2}
                    value={ticketTypeForm.description}
                    onChange={(e) =>
                      setTicketTypeForm({ ...ticketTypeForm, description: e.target.value })
                    }
                  />
                </label>
              </div>

              {ticketTypeFormError && <p className="ctm-form-error">{ticketTypeFormError}</p>}

              <div className="ctm-form-actions">
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={closeTicketTypeForm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => void saveTicketType()}
                  disabled={isSavingTicketType}
                >
                  {isSavingTicketType
                    ? "Saving..."
                    : editingTicketTypeId
                      ? "Save Changes"
                      : "Create Ticket Type"}
                </button>
              </div>
            </div>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderTicketingInventory() {
    return (
      <WorkspacePanel
        eyebrow="Inventory"
        title="Inventory Management"
        description="Track and adjust available capacity per ticket type for the selected home game."
        actions={
          <MatchSelector
            matches={homeMatches}
            selectedMatchId={selectedMatchId}
            onChange={handleSelectMatch}
          />
        }
      >
        {ticketTypesError ? (
          <div className={styles.validationCard}>
            <strong>Something went wrong</strong>
            <span>{ticketTypesError}</span>
          </div>
        ) : null}

        {isLoadingTicketTypes ? (
          <WorkspaceLoading label="Loading inventory…" />
        ) : selectedTicketTypes.length === 0 ? (
          <WorkspaceEmpty
            title="No ticket types configured"
            description="Create ticket types in the Ticket Pricing tab before managing inventory."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Ticket Type</th>
                  <th>Available</th>
                  <th>Sold</th>
                  <th>Reserved</th>
                  <th>Remaining</th>
                  <th>Sell-through</th>
                </tr>
              </thead>
              <tbody>
                {selectedTicketTypes.map((ticketType) => (
                  <InventoryRow
                    key={ticketType.id}
                    ticketType={ticketType}
                    onSave={(nextQuantity) =>
                      void updateInventoryQuantity(ticketType, nextQuantity)
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderTicketingPublish() {
    const draftCount = selectedTicketTypes.filter((t) => t.status === "DRAFT").length;
    const onSaleCount = selectedTicketTypes.filter((t) => t.status === "ON_SALE").length;

    return (
      <WorkspacePanel
        eyebrow="Go-live control"
        title="Publish & Go-Live"
        description="Move ticket types between draft, on sale, and closed for the selected home game."
        actions={
          <MatchSelector
            matches={homeMatches}
            selectedMatchId={selectedMatchId}
            onChange={handleSelectMatch}
          />
        }
      >
        <div className="ctm-bulk-actions">
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => void handleBulkStatusChange("DRAFT", "ON_SALE")}
            disabled={draftCount === 0}
          >
            <Radio size={15} /> Go Live ({draftCount} draft)
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => void handleBulkStatusChange("ON_SALE", "CLOSED")}
            disabled={onSaleCount === 0}
          >
            Close Sales ({onSaleCount} on sale)
          </button>
        </div>

        {ticketTypesError ? (
          <div className={styles.validationCard}>
            <strong>Something went wrong</strong>
            <span>{ticketTypesError}</span>
          </div>
        ) : null}

        {isLoadingTicketTypes ? (
          <WorkspaceLoading label="Loading ticket types…" />
        ) : selectedTicketTypes.length === 0 ? (
          <WorkspaceEmpty
            title="No ticket types configured"
            description="Create ticket types in the Ticket Pricing tab before publishing."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Ticket Type</th>
                  <th>Current Status</th>
                  <th>Change To</th>
                </tr>
              </thead>
              <tbody>
                {selectedTicketTypes.map((ticketType) => (
                  <tr key={ticketType.id}>
                    <td>
                      <span className={styles.tablePrimary}>{ticketType.name}</span>
                    </td>
                    <td>
                      <WorkspaceStatus value={ticketType.status} />
                    </td>
                    <td>
                      <select
                        value={ticketType.status}
                        onChange={(e) =>
                          void handleStatusChange(
                            ticketType,
                            e.target.value as TicketTypeStatus,
                          )
                        }
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="ON_SALE">On Sale</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderTicketingPerformance() {
    const totals = (salesSummaries ?? []).reduce(
      (acc, summary) => ({
        revenue: acc.revenue + summary.revenue,
        sold: acc.sold + summary.tickets_sold,
        available: acc.available + summary.quantity_available,
        matchesWithSales: acc.matchesWithSales + (summary.tickets_sold > 0 ? 1 : 0),
      }),
      { revenue: 0, sold: 0, available: 0, matchesWithSales: 0 },
    );

    const sellThroughRate =
      totals.available > 0 ? (totals.sold / totals.available) * 100 : 0;

    const performanceStats = [
      {
        label: "Total Revenue",
        value: formatTicketCurrency(totals.revenue),
        detail: "Across all home games",
        icon: BarChart3,
      },
      {
        label: "Tickets Sold",
        value: totals.sold,
        detail: "Total tickets issued",
        icon: Tag,
      },
      {
        label: "Sell-Through Rate",
        value: `${sellThroughRate.toFixed(1)}%`,
        detail: "Sold vs available inventory",
        icon: Boxes,
      },
      {
        label: "Home Matches With Sales",
        value: totals.matchesWithSales,
        detail: `Of ${homeMatches.length} home games`,
        icon: CalendarDays,
      },
    ];

    return (
      <>
        <WorkspaceStatGrid stats={performanceStats} loading={isLoadingSales} />

        <div className="ctm-notice-banner">
          Figures are computed live from ticket type inventory and sales counts. There is
          no historical trend data yet — a revenue-over-time chart will need a backend
          sales-aggregation endpoint (see the backend requirements handoff).
        </div>

        {salesError ? (
          <WorkspaceError message={salesError} onRetry={() => void loadSalesSummary()} />
        ) : isLoadingSales ? (
          <WorkspaceLoading label="Loading sales performance…" />
        ) : !salesSummaries || salesSummaries.length === 0 ? (
          <WorkspaceEmpty
            title="No sales data yet"
            description="Sales performance will appear here once ticket types have been created for your home games."
          />
        ) : (
          <>
            <WorkspacePanel
              eyebrow="Revenue"
              title="Revenue by home game"
              description="Ticket revenue recorded per home fixture."
              actions={
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={exportSalesCsv}
                >
                  <Download size={15} /> Export CSV
                </button>
              }
            >
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={salesSummaries.map((summary) => ({
                      name: summary.match_label,
                      revenue: summary.revenue,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" stroke="var(--muted)" />
                    <YAxis stroke="var(--muted)" />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="var(--green)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </WorkspacePanel>

            <WorkspacePanel
              eyebrow="Breakdown"
              title="Sales by home game"
              description="Revenue, tickets sold, and sell-through rate per home fixture."
            >
              <div className={styles.tableShell}>
                <table>
                  <thead>
                    <tr>
                      <th>Match</th>
                      <th>Date</th>
                      <th>Revenue</th>
                      <th>Sold</th>
                      <th>Available</th>
                      <th>Sell-Through</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesSummaries.map((summary) => (
                      <tr key={summary.match_id}>
                        <td>
                          <span className={styles.tablePrimary}>
                            {summary.match_label}
                          </span>
                        </td>
                        <td>{formatWorkspaceDate(summary.match_date)}</td>
                        <td>{formatTicketCurrency(summary.revenue)}</td>
                        <td>{summary.tickets_sold}</td>
                        <td>{summary.quantity_available}</td>
                        <td>{(summary.sell_through_rate * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </WorkspacePanel>
          </>
        )}
      </>
    );
  }

  async function handleTicketValidation(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !activeWorkspace?.permissions.includes(
        "club.ticketing.validate",
      )
    ) {
      setValidationError(
        "The selected Club entitlement cannot validate tickets.",
      );
      return;
    }

    if (!scannedCode.trim()) {
      setValidationError(
        "Enter or scan a ticket code first.",
      );
      return;
    }

    setIsValidatingTicket(true);
    setValidationResult(null);
    setValidationError("");

    try {
      const result = await validateWorkspaceTicket({
        scannedCode,
        matchId: validationMatchId
          ? Number(validationMatchId)
          : undefined,
      });
      setValidationResult(result);
      setScannedCode("");
    } catch (validationFailure) {
      const responseData =
        typeof validationFailure === "object" &&
        validationFailure !== null &&
        "response" in validationFailure
          ? (
              validationFailure as {
                response?: {
                  data?: TicketValidationResult;
                };
              }
            ).response?.data
          : undefined;

      if (responseData?.result) {
        setValidationResult(responseData);
      } else {
        setValidationError(
          getApiErrorMessage(
            validationFailure,
            "The ticket could not be validated.",
          ),
        );
      }
    } finally {
      setIsValidatingTicket(false);
    }
  }

  function renderTicketScanner() {
    return (
      <WorkspacePanel
        eyebrow="Gate operations"
        title="Validate a ticket"
        description="Scan a QR code or paste its ticket UUID for this selected Club scope."
      >
        <form
          className={styles.formGrid}
          onSubmit={handleTicketValidation}
        >
          <div
            className={`${styles.field} ${styles.fieldFull}`}
          >
            <label htmlFor="club-ticket-code">
              Ticket code
            </label>
            <input
              id="club-ticket-code"
              autoComplete="off"
              value={scannedCode}
              onChange={(event) =>
                setScannedCode(event.target.value)
              }
              placeholder="Paste UUID or LOS-TICKET:UUID"
            />
          </div>

          <div
            className={`${styles.field} ${styles.fieldFull}`}
          >
            <label htmlFor="club-ticket-match">
              Match
            </label>
            <select
              id="club-ticket-match"
              value={validationMatchId}
              onChange={(event) =>
                setValidationMatchId(event.target.value)
              }
            >
              <option value="">
                Validate against ticket match
              </option>
              {(data?.ticket_events ?? []).map((match) => (
                <option
                  key={match.id}
                  value={match.id}
                >
                  {match.label} ·{" "}
                  {formatWorkspaceDate(match.match_date)}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`${styles.toolbar} ${styles.fieldFull}`}
          >
            <button
              className={styles.primaryButton}
              type="submit"
              disabled={isValidatingTicket}
            >
              <ScanLine size={18} />
              {isValidatingTicket
                ? "Validating…"
                : "Validate ticket"}
            </button>
          </div>
        </form>

        {validationError ? (
          <div
            className={`${styles.validationCard} ${styles.validationFailure}`}
          >
            <strong>Validation failed</strong>
            <span>{validationError}</span>
          </div>
        ) : null}

        {validationResult ? (
          <div
            className={`${styles.validationCard} ${
              validationResult.result === "VALID"
                ? styles.validationSuccess
                : styles.validationFailure
            }`}
          >
            <WorkspaceStatus
              value={validationResult.result}
            />
            <strong>
              {validationResult.result_display ??
                validationResult.result}
            </strong>
            <span>{validationResult.message}</span>
          </div>
        ) : null}
      </WorkspacePanel>
    );
  }

  function renderTicketEntryLogs() {
    const logs = data?.ticketing_logs ?? [];

    return (
      <WorkspacePanel
        eyebrow="Attendance audit"
        title="Recent entry logs"
        description="Latest ticket validation attempts for the selected Club scope."
      >
        {logs.length === 0 ? (
          <WorkspaceEmpty
            title="No entry logs"
            description="Validation attempts will appear after tickets are scanned."
          />
        ) : (
          <div className={styles.tableShell}>
            <table>
              <thead>
                <tr>
                  <th>Match</th>
                  <th>Officer</th>
                  <th>Result</th>
                  <th>Message</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.match}</td>
                    <td>{log.scanned_by}</td>
                    <td>
                      <WorkspaceStatus
                        value={log.result}
                      />
                    </td>
                    <td>{log.message || "—"}</td>
                    <td>
                      {formatWorkspaceDate(
                        log.created_at,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </WorkspacePanel>
    );
  }

  function renderTicketingOverview() {
    // Landing tab for "Tickets" itself — mirrors renderMembershipOverview().
    return (
      <>
        <WorkspaceStatGrid
          stats={[
            {
              label: "Home Games",
              value: homeMatches.length,
              detail: "Upcoming home fixtures",
              icon: CalendarDays,
            },
            {
              label: "Ticket Types",
              value: data?.summary.ticket_types ?? 0,
              detail: "Configured inventory records",
              icon: Tag,
            },
            {
              label: "Tickets Sold",
              value: data?.summary.tickets_sold ?? 0,
              detail: "Issued match tickets",
              icon: TicketCheck,
            },
            {
              label: "Checked In",
              value: data?.summary.checked_in ?? 0,
              detail: "Tickets admitted at the gate",
              icon: ShieldCheck,
            },
          ]}
        />
        {renderTicketingGames()}
      </>
    );
  }

  function renderPlaceholder(
    title: string,
    description: string,
  ) {
    return (
      <WorkspacePanel
        eyebrow="Club administration"
        title={title}
        description={description}
      >
        <WorkspaceEmpty
          title={`${title} is not yet built out`}
          description="This section will surface full detail here once available."
        />
      </WorkspacePanel>
    );
  }

  function renderProfileBrandingOverview() {
    const profileSections = [
      {
        key: "profileBrandingProfile" as const,
        title: "Club Profile",
        description: "Edit public club details, contact information, and description.",
        icon: Building2,
        permissions: ["club.profile.edit"],
      },
      {
        key: "profileBrandingBrand" as const,
        title: "Branding Editor",
        description: "Manage logo uploads, brand colours, and kit previews.",
        icon: Palette,
        permissions: ["club.profile.edit"],
      },
      {
        key: "profileBrandingVenues" as const,
        title: "Venues",
        description: "Maintain home venues, locations, capacity, and status.",
        icon: MapPin,
        permissions: [],
      },
      {
        key: "profileBrandingMedia" as const,
        title: "Media Assets",
        description: "Organize club images, documents, videos, and downloads.",
        icon: ImageIcon,
        permissions: ["club.profile.edit"],
      },
      {
        key: "profileBrandingPreview" as const,
        title: "Public Page Preview",
        description: "Preview how fans will see the club page before publishing.",
        icon: Eye,
        permissions: ["club.profile.view"],
      },
    ];

    return (
      <WorkspacePanel
        eyebrow="Governance"
        title="Profile & Branding"
        description="Manage your club's public identity and page assets."
      >
        <div className="branding-grid">
          {profileSections
            .filter((section) =>
              section.permissions.some((permission) =>
                activeWorkspace?.permissions.includes(
                  permission,
                ),
              ),
            )
            .map((section) => {
            const Icon = section.icon;

            return (
              <button
                type="button"
                key={section.key}
                className="club-panel"
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  width: "100%",
                }}
                onClick={() => handleTabChange(section.key)}
              >
                <Icon size={22} aria-hidden="true" />
                <h2 style={{ marginTop: 12 }}>{section.title}</h2>
                <p className="panel-desc" style={{ marginBottom: 0 }}>
                  {section.description}
                </p>
              </button>
            );
            })}
        </div>
      </WorkspacePanel>
    );
  }

  let content;

  if (!defaultWorkspaceTab) {
    content = (
      <WorkspaceEmpty
        title="No Club modules are available"
        description="The selected Club entitlement does not grant access to a maintained workspace module."
      />
    );
  } else if (isLoading && !data) {
    content = (
      <WorkspaceLoading label="Loading club operations…" />
    );
  } else if (error && !data) {
    content = (
      <WorkspaceError
        message={error}
        onRetry={loadWorkspace}
      />
    );
  } else if (activeTab === "membership") {
    content = renderMembershipOverview();
  } else if (activeTab === "membershipDirectory") {
    content = renderMembershipDirectory();
  } else if (activeTab === "membershipRenewals") {
    content = renderMembershipRenewals();
  } else if (activeTab === "membershipTiers") {
    content = renderMembershipTiers();
  } else if (activeTab === "membershipRequests") {
    content = renderMembershipRequests();
  } else if (activeTab === "membershipReports") {
    content = renderMembershipReports();
  } else if (activeTab === "teams") {
    content = renderPlaceholder(
      "Teams",
      "Manage all teams belonging to this club.",
    );
  } else if (activeTab === "matches") {
    content = renderMatches();
  } else if (activeTab === "finances") {
    content = renderFinances();
  } else if (activeTab === "financeMembershipPayments") {
    content = renderFinanceMembershipPayments();
  } else if (activeTab === "financeTicketingPayments") {
    content = renderFinanceTicketingPayments();
  } else if (activeTab === "financeIncomeExpense") {
    content = renderFinanceIncomeExpense();
  } else if (activeTab === "financeInvoicesReceipts") {
    content = renderFinanceInvoicesReceipts();
  } else if (activeTab === "financeAuditTrail") {
    content = renderFinanceAuditTrail();
  } else if (activeTab === "ticketing") {
    content = renderTicketingOverview();
  } else if (activeTab === "ticketingGames") {
    content = renderTicketingGames();
  } else if (activeTab === "ticketingPricing") {
    content = renderTicketingPricing();
  } else if (activeTab === "ticketingInventory") {
    content = renderTicketingInventory();
  } else if (activeTab === "ticketingPublish") {
    content = renderTicketingPublish();
  } else if (activeTab === "ticketingPerformance") {
    content = renderTicketingPerformance();
  } else if (activeTab === "ticketingScanner") {
    content = renderTicketScanner();
  } else if (activeTab === "ticketingEntryLogs") {
    content = renderTicketEntryLogs();
  } else if (activeTab === "facilities") {
    content = renderPlaceholder(
      "Facilities",
      "Manage grounds and facilities for this club.",
    );
  } else if (activeTab === "profileBranding") {
    content = renderProfileBrandingOverview();
  } else if (activeTab === "profileBrandingProfile") {
    content = <ClubProfileEdit />;
  } else if (activeTab === "profileBrandingBrand") {
    content = <BrandingEditor />;
  } else if (activeTab === "profileBrandingVenues") {
    content = <VenueManagement />;
  } else if (activeTab === "profileBrandingMedia") {
    content = <MediaAssetLibrary />;
  } else if (activeTab === "profileBrandingPreview") {
    content = <PublicClubPagePreview />;
  } else if (activeTab === "sponsorshipMatchday") {
    content = renderPlaceholder(
      "Sponsorship",
      "Manage sponsors and matchday operational details.",
    );
  } else if (activeTab === "compliance") {
    content = <ComplianceDocuments />;
  } else if (activeTab === "reports") {
    content = renderPlaceholder(
      "Reports",
      "Analytics and reports for this club.",
    );
  } else if (activeTab === "communications") {
    content = renderPlaceholder(
      "Communications",
      "Messages and alerts for this club.",
    );
  } else if (activeTab === "announcements") {
    content = renderPlaceholder(
      "Announcements",
      "Compose and publish announcements for your club.",
    );
  } else if (activeTab === "announcementsCompose") {
    content = <AnnouncementsCompose />;
  } else if (activeTab === "announcementsPublish") {
    content = <AnnouncementsPublish />;
  } else if (activeTab === "clubUsers") {
    content = data ? (
      <UserManagement clubId={data.club.id} />
    ) : (
      <WorkspaceLoading label="Loading club users…" />
    );
  } else if (activeTab === "settings") {
    content = renderPlaceholder(
      "Settings",
      "Club-wide configuration and preferences.",
    );
  } else {
    content = renderOverview();
  }

  if (!activeWorkspace) {
    const requiresSelection =
      clubWorkspaceOptions.length > 1 &&
      !selectedEntitlementId;

    return (
      <main className={styles.page}>
        <section className={styles.stateCard}>
          <strong>
            {requiresSelection
              ? "Choose a Club workspace"
              : "Club workspace access is unavailable"}
          </strong>
          <span>
            {requiresSelection
              ? "Select the exact Club entitlement you want to use. Permissions remain isolated between Clubs."
              : "The selected Club entitlement is missing or invalid. No Club workspace has been opened."}
          </span>

          {requiresSelection ? (
            <div className={styles.panelActions}>
              {clubWorkspaceOptions.map((option) => (
                <button
                  type="button"
                  className={styles.primaryButton}
                  key={option.entitlement_id}
                  onClick={() =>
                    handleWorkspaceSelection(
                      option.entitlement_id,
                    )
                  }
                >
                  Club {option.scope_id} ·{" "}
                  {formatWorkspaceRole(
                    option.workspace_role,
                  )}
                </button>
              ))}
            </div>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <AdminWorkspaceLayout<TabKey>
      workspaceTitle={data?.club.name ?? "Club Operations"}
      workspaceSubtitle={
        data
          ? `${data.club.sport_display} club administration`
          : "Club-scoped access"
      }
      eyebrow="Club administration"
      title={data?.club.name ?? "Club Operations"}
      description="Review your club's competitions, fixtures, ticketing activity and administrative users using live League OS records."
      navItems={navItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      activeClubWorkspace={activeWorkspace}
      publicPath={
        data?.club.slug
          ? `/clubs/${data.club.slug}`
          : undefined
      }
      publicLabel={
        data?.club.slug ? "View club page" : undefined
      }
      headerActions={
        <>
          {clubWorkspaceOptions.length > 1 ? (
            <label>
              <span className="sr-only">
                Club workspace
              </span>
              <select
                aria-label="Club workspace"
                value={activeWorkspace.entitlement_id}
                onChange={(event) =>
                  handleWorkspaceSelection(
                    event.target.value,
                  )
                }
              >
                {clubWorkspaceOptions.map((option) => (
                  <option
                    key={option.entitlement_id}
                    value={option.entitlement_id}
                  >
                    Club {option.scope_id} ·{" "}
                    {formatWorkspaceRole(
                      option.workspace_role,
                    )}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <button
            type="button"
            className={styles.publicLink}
            disabled={isLoading || !defaultWorkspaceTab}
            onClick={() => void loadWorkspace()}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </>
      }
    >
      {error && data ? (
        <div className={styles.validationCard}>
          <ShieldCheck size={18} />
          <strong>Some information may be stale</strong>
          <span>{error}</span>
        </div>
      ) : null}

      {content}
    </AdminWorkspaceLayout>
  );
}
