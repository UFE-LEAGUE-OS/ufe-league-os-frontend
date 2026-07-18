export const DASHBOARD_IDENTIFIERS = [
  'FAN',
  'SPONSOR',
  'SUPER_ADMIN',
  'UNION_WORKSPACE',
  'LEAGUE_ADMIN',
  'CLUB_ADMIN',
  'TICKETING_OFFICER',
] as const;

export type DashboardIdentifier = (typeof DASHBOARD_IDENTIFIERS)[number];

export interface DashboardEntitlement {
  id: string;
  dashboard: DashboardIdentifier;
  route: string;
  scope_type: string | null;
  scope_id: string | number | null;
  workspace_role: string | null;
  permissions: string[];
}

export interface DashboardAccess {
  version: 1;
  default_entitlement_id: string | null;
  entitlements: DashboardEntitlement[];
}

export interface AuthenticatedUser {
  id?: string | number;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  roles?: string[];
  sponsor_type?: 'INDIVIDUAL' | 'CORPORATE';
  dashboard_access?: DashboardAccess | null;
  [key: string]: unknown;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isDashboardIdentifier(
  value: unknown,
): value is DashboardIdentifier {
  return (
    typeof value === 'string' &&
    DASHBOARD_IDENTIFIERS.includes(value as DashboardIdentifier)
  );
}

export function isAuthenticatedUser(
  value: unknown,
): value is AuthenticatedUser {
  return isRecord(value);
}
