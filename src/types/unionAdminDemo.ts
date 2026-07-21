export type UnionAdminDataSourceMode = "api" | "demo";

export type DemoRecordStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED"
  | "SCHEDULED"
  | "COMPLETED"
  | "SUSPENDED";

export interface UnionDemoWorkspace {
  id: string;
  name: string;
  acronym: string;
  sport: string;
  type: "FEDERATION" | "UNION" | "LEAGUE";
}

export interface UnionDemoRecord {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  meta?: string;
}

export interface UnionDemoEdition extends UnionDemoRecord {
  competitionId: string;
  season: string;
  startDate: string;
  endDate: string;
  registrationWindow: string;
  clubEntries: number;
  fixtureReadiness: string;
}

export interface UnionDemoData {
  workspaces: UnionDemoWorkspace[];
  competitions: UnionDemoRecord[];
  editions: UnionDemoEdition[];
  clubs: UnionDemoRecord[];
  registrations: UnionDemoRecord[];
  players: UnionDemoRecord[];
  eligibility: UnionDemoRecord[];
  transfers: UnionDemoRecord[];
  nationalTeams: UnionDemoRecord[];
  officials: UnionDemoRecord[];
  appointments: UnionDemoRecord[];
  finance: UnionDemoRecord[];
  announcements: UnionDemoRecord[];
  sponsors: UnionDemoRecord[];
  users: UnionDemoRecord[];
  approvals: UnionDemoRecord[];
  auditEvents: UnionDemoRecord[];
  statistics: UnionDemoRecord[];
}
