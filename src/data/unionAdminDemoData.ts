import type { UnionDemoData } from "../types/unionAdminDemo";

// Development review fixtures only. Names and identifiers are deterministic and
// contact details deliberately use the reserved example.test domain.
export const unionDemoData: UnionDemoData = {
  workspaces: [
    { id: "demo-uru", name: "Uganda Rugby Union", acronym: "URU", sport: "Rugby", type: "FEDERATION" },
    { id: "demo-fufa", name: "Federation of Uganda Football Associations", acronym: "FUFA", sport: "Football", type: "FEDERATION" },
    { id: "demo-fuba", name: "Federation of Uganda Basketball Associations", acronym: "FUBA", sport: "Basketball", type: "FEDERATION" },
    { id: "demo-budo", name: "Budo League", acronym: "BL", sport: "Football", type: "LEAGUE" },
    { id: "demo-smack", name: "SMACK League", acronym: "SL", sport: "Football", type: "LEAGUE" },
  ],
  competitions: [
    { id: "comp-rugby-prem", title: "National Rugby Premiership", subtitle: "League · Rugby", status: "ACTIVE", meta: "national-rugby-premiership" },
    { id: "comp-womens-cup", title: "Women’s National Cup", subtitle: "Knockout · Rugby", status: "DRAFT", meta: "womens-national-cup" },
    { id: "comp-youth-series", title: "National Youth Series", subtitle: "Festival · Rugby", status: "PUBLISHED", meta: "national-youth-series" },
  ],
  editions: [
    { id: "edition-2026", competitionId: "comp-rugby-prem", title: "2026 Premiership", subtitle: "Current edition", status: "ACTIVE", season: "2026", startDate: "2026-02-07", endDate: "2026-11-28", registrationWindow: "2025-11-01 — 2026-01-20", clubEntries: 10, fixtureReadiness: "Published" },
    { id: "edition-2027", competitionId: "comp-rugby-prem", title: "2027 Premiership", subtitle: "Next edition", status: "REGISTRATION_OPEN", season: "2027", startDate: "2027-02-06", endDate: "2027-11-27", registrationWindow: "2026-10-01 — 2027-01-15", clubEntries: 4, fixtureReadiness: "Not scheduled" },
  ],
  clubs: [
    { id: "club-kampala", title: "Kampala Rugby Club", subtitle: "Rugby · Member Club", status: "ACTIVE", meta: "Premiership, National Cup" },
    { id: "club-nile", title: "Nile Rugby Club", subtitle: "Rugby · Member Club", status: "ACTIVE", meta: "Premiership" },
    { id: "club-lakeside", title: "Lakeside Rugby Club", subtitle: "Rugby · Entry under review", status: "PENDING", meta: "National Cup" },
  ],
  registrations: [
    { id: "reg-001", title: "Amina Kato", subtitle: "URU-2026-0014 · Kampala Rugby Club", status: "PENDING", meta: "Assigned to Competition Registrar" },
    { id: "reg-002", title: "Daniel Okello", subtitle: "URU-2025-0388 · Nile Rugby Club", status: "APPROVED", meta: "Identity and evidence verified" },
  ],
  players: [
    { id: "player-001", title: "Amina Kato", subtitle: "URU-2026-0014 · Kampala Rugby Club", status: "PENDING", meta: "Identity unlinked" },
    { id: "player-002", title: "Daniel Okello", subtitle: "URU-2025-0388 · Nile Rugby Club", status: "ACTIVE", meta: "Identity verified" },
  ],
  eligibility: [
    { id: "elig-001", title: "Daniel Okello", subtitle: "2026 Premiership · Nile Rugby Club", status: "APPROVED", meta: "Effective 2026-02-01 — 2026-11-30" },
    { id: "elig-002", title: "Amina Kato", subtitle: "2026 Women’s National Cup · Kampala Rugby Club", status: "PENDING", meta: "Awaiting registration approval" },
  ],
  transfers: [
    { id: "transfer-001", title: "Permanent transfer · Joel Ssenyonga", subtitle: "Nile Rugby Club → Kampala Rugby Club", status: "PENDING", meta: "Club consent recorded offline" },
    { id: "transfer-002", title: "Loan transfer · Ruth Achieng", subtitle: "Kampala Rugby Club → Lakeside Rugby Club", status: "APPROVED", meta: "Return due 2026-12-15" },
  ],
  nationalTeams: [{ id: "team-001", title: "Uganda Senior Women", subtitle: "Senior Women · 28 members", status: "ACTIVE", meta: "Captain: squad record maintained" }],
  officials: [
    { id: "official-001", title: "Jordan Namuli", subtitle: "Centre Referee · Level 2", status: "READY", meta: "Certification valid to 2027-06-30" },
    { id: "official-002", title: "Morgan Kibuuka", subtitle: "Assistant Referee · Level 1", status: "ACTION_REQUIRED", meta: "Medical clearance expires soon" },
  ],
  appointments: [{ id: "appointment-001", title: "National Premiership · Matchday 8", subtitle: "Kampala Rugby Club vs Nile Rugby Club", status: "CONFIRMED", meta: "2026-08-15 · Centre referee" }],
  finance: [{ id: "fin-001", title: "Competition entry fees", subtitle: "UGX 24,000,000", status: "RECONCILED", meta: "2026 season" }],
  announcements: [
    { id: "ann-001", title: "Registration window reminder", subtitle: "All member Clubs · Portal and email", status: "SCHEDULED", meta: "Publishes 2026-07-25" },
    { id: "ann-002", title: "Official certification clinic", subtitle: "Match Officials · Portal", status: "PUBLISHED", meta: "Published 2026-07-12" },
  ],
  sponsors: [{ id: "sponsor-001", title: "Example Sports Foundation", subtitle: "Corporate · Community programme", status: "ACTIVE", meta: "partnerships@example.test" }],
  users: [{ id: "user-001", title: "Workspace Registrar", subtitle: "registrar@example.test · Registrar", status: "ACTIVE", meta: "Registrations and players" }],
  approvals: [{ id: "approval-001", title: "Competition publication", subtitle: "2027 Premiership · requested by Competition Manager", status: "PENDING", meta: "Submitted 2026-07-18" }],
  auditEvents: [{ id: "audit-001", title: "Registration reviewer assigned", subtitle: "Registration URU-2026-0014", status: "COMPLETED", meta: "Competition Registrar · 2026-07-19 09:30 EAT" }],
  statistics: [
    { id: "stat-001", title: "Most competition editions", subtitle: "National Rugby Premiership", status: "12 editions", meta: "Competition record" },
    { id: "stat-002", title: "Club participation", subtitle: "Kampala Rugby Club", status: "11 editions", meta: "Participation record" },
  ],
};
