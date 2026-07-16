// src/services/userManagementService.ts
//
// Service layer backing the club "User & Permission Management" page
// (see pages/club-admin/UserManagement.tsx).
//
// This mirrors the conventions already used in membershipService.ts and
// adminWorkspaceService.ts, so it assumes:
//   1. You have a shared `apiClient` (axios instance with baseURL + auth
//      header already configured) exported from "./apiClient". If your
//      existing services import it from a different path/name, update the
//      import below to match.
//   2. `getApiErrorMessage` already exists in adminWorkspaceService.ts and
//      is safe to re-use here.
//   3. Endpoint paths follow the same `/clubs/:clubId/...` shape as the
//      rest of the club-admin API. Adjust BASE()/paths below to match your
//      actual DRF routes if they differ — everything else in this file is
//      independent of the exact URL shape.

import apiClient from "./apiClient";
import { getApiErrorMessage } from "./adminWorkspaceService";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface ManagedUser {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone_number: string;
  avatar_url: string | null;
  role: string; // role key, e.g. "CUSTOM_ADMIN"
  role_display: string; // e.g. "Custom Admin"
  permissions_count: number;
  status: UserStatus;
  last_login: string | null;
  created_at: string;
}

export interface CreateUserPayload {
  club: number;
  full_name: string;
  username: string;
  email: string;
  phone_number: string;
  password: string;
  role: string;
  permission_keys: string[];
  avatar?: File | null;
}

export type UpdateUserPayload = Partial<
  Omit<CreateUserPayload, "club" | "password">
> & { password?: string };

export interface RoleSummary {
  id: number;
  key: string;
  label: string;
  description: string;
  is_system_role: boolean;
  permission_count: number;
  user_count: number;
}

export interface PermissionItem {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface PermissionModule {
  key: string;
  label: string;
  description: string;
  permissions: PermissionItem[];
}

export interface UserPerformanceMetrics {
  logins_last_30_days: number;
  actions_last_30_days: number;
  last_active: string | null;
  avg_session_minutes: number;
  activity_by_module: { module: string; count: number }[];
  recent_actions: {
    id: number;
    description: string;
    timestamp: string;
  }[];
}

/* ------------------------------------------------------------------ */
/* Endpoint helpers                                                    */
/* ------------------------------------------------------------------ */

const usersBase = (clubId: number) => `/clubs/${clubId}/users`;
const rolesBase = (clubId: number) => `/clubs/${clubId}/roles`;

/* ------------------------------------------------------------------ */
/* Users                                                               */
/* ------------------------------------------------------------------ */

export async function getClubManagedUsers(
  clubId: number,
): Promise<ManagedUser[]> {
  const { data } = await apiClient.get(`${usersBase(clubId)}/`);
  return data;
}

export async function createClubUser(
  payload: CreateUserPayload,
): Promise<ManagedUser> {
  const { data } = await apiClient.post(
    `${usersBase(payload.club)}/`,
    payload,
  );
  return data;
}

export async function updateClubUser(
  clubId: number,
  userId: number,
  payload: UpdateUserPayload,
): Promise<ManagedUser> {
  const { data } = await apiClient.patch(
    `${usersBase(clubId)}/${userId}/`,
    payload,
  );
  return data;
}

export async function deleteClubUser(
  clubId: number,
  userId: number,
): Promise<void> {
  await apiClient.delete(`${usersBase(clubId)}/${userId}/`);
}

export async function setClubUserStatus(
  clubId: number,
  userId: number,
  status: UserStatus,
): Promise<ManagedUser> {
  const { data } = await apiClient.patch(
    `${usersBase(clubId)}/${userId}/status/`,
    { status },
  );
  return data;
}

export async function getUserPerformance(
  clubId: number,
  userId: number,
): Promise<UserPerformanceMetrics> {
  const { data } = await apiClient.get(
    `${usersBase(clubId)}/${userId}/performance/`,
  );
  return data;
}

/* ------------------------------------------------------------------ */
/* Roles & permissions                                                 */
/* ------------------------------------------------------------------ */

export interface CreateRolePayload {
  label: string;
  description: string;
}

export async function createClubRole(
  clubId: number,
  payload: CreateRolePayload,
): Promise<RoleSummary> {
  const { data } = await apiClient.post(`${rolesBase(clubId)}/`, payload);
  return data;
}


export async function getClubRoles(
  clubId: number,
): Promise<RoleSummary[]> {
  const { data } = await apiClient.get(`${rolesBase(clubId)}/`);
  return data;
}

export async function getRolePermissionModules(
  clubId: number,
  roleId: number,
): Promise<PermissionModule[]> {
  const { data } = await apiClient.get(
    `${rolesBase(clubId)}/${roleId}/permissions/`,
  );
  return data;
}

export async function updateRolePermissionModules(
  clubId: number,
  roleId: number,
  modules: PermissionModule[],
): Promise<PermissionModule[]> {
  const { data } = await apiClient.put(
    `${rolesBase(clubId)}/${roleId}/permissions/`,
    { modules },
  );
  return data;
}

export { getApiErrorMessage };
