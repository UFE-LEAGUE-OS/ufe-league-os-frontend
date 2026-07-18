import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createClubRole,
  createClubUser,
  deleteClubUser,
  getClubManagedUsers,
  getClubRoles,
  getRolePermissionModules,
  getUserPerformance,
  setClubUserStatus,
  updateClubUser,
  updateRolePermissionModules,
  type ManagedUser,
  type PermissionModule,
  type RoleSummary,
} from "../../services/userManagementService";
import UserManagement from "./UserManagement";

vi.mock("../../services/userManagementService", () => ({
  createClubRole: vi.fn(),
  createClubUser: vi.fn(),
  deleteClubUser: vi.fn(),
  getClubManagedUsers: vi.fn(),
  getClubRoles: vi.fn(),
  getRolePermissionModules: vi.fn(),
  getUserPerformance: vi.fn(),
  setClubUserStatus: vi.fn(),
  updateClubUser: vi.fn(),
  updateRolePermissionModules: vi.fn(),
}));

const managedUser: ManagedUser = {
  id: 7,
  full_name: "Jane Admin",
  username: "jane.admin",
  email: "jane@example.com",
  phone_number: "+256700000007",
  avatar_url: null,
  role: "CLUB_ADMIN",
  role_display: "Club Administrator",
  permissions_count: 4,
  status: "ACTIVE",
  last_login: null,
  created_at: "2026-07-18T08:00:00Z",
};

const role: RoleSummary = {
  id: 3,
  key: "CLUB_ADMIN",
  label: "Club Administrator",
  description: "Manages Club workspace users.",
  is_system_role: true,
  permission_count: 4,
  user_count: 1,
};

const permissionModules: PermissionModule[] = [
  {
    key: "members",
    label: "Members",
    description: "Member administration",
    permissions: [
      {
        key: "club.admin.manage",
        label: "Manage administrators",
        description: "Manage Club workspace administrators.",
        enabled: true,
      },
    ],
  },
];

const forbidden = {
  response: {
    status: 403,
    data: {
      detail: "You cannot manage users in this Club workspace.",
    },
  },
};

const managementPermissions = ["club.admin.manage"] as const;

describe("UserManagement entitlement permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getClubManagedUsers).mockResolvedValue([managedUser]);
    vi.mocked(getClubRoles).mockResolvedValue([role]);
    vi.mocked(getRolePermissionModules).mockResolvedValue(permissionModules);
  });

  it("fails closed without club.admin.manage and makes no API calls", () => {
    render(
      <UserManagement
        clubId={17}
        permissions={["club.members.manage"]}
      />,
    );

    expect(screen.getByText("Permission required")).toBeInTheDocument();
    expect(screen.getByText(/club\.admin\.manage/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add user/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add role/i })).not.toBeInTheDocument();
    expect(getClubManagedUsers).not.toHaveBeenCalled();
    expect(getClubRoles).not.toHaveBeenCalled();
    expect(getRolePermissionModules).not.toHaveBeenCalled();
    expect(createClubUser).not.toHaveBeenCalled();
    expect(updateClubUser).not.toHaveBeenCalled();
    expect(deleteClubUser).not.toHaveBeenCalled();
    expect(setClubUserStatus).not.toHaveBeenCalled();
    expect(createClubRole).not.toHaveBeenCalled();
    expect(updateRolePermissionModules).not.toHaveBeenCalled();
    expect(getUserPerformance).not.toHaveBeenCalled();
  });

  it("loads data and exposes management controls with club.admin.manage", async () => {
    render(
      <UserManagement
        clubId={17}
        permissions={managementPermissions}
      />,
    );

    expect(await screen.findByText("Jane Admin")).toBeInTheDocument();
    expect(getClubManagedUsers).toHaveBeenCalledWith(17);
    expect(getClubRoles).toHaveBeenCalledWith(17);
    await waitFor(() =>
      expect(getRolePermissionModules).toHaveBeenCalledWith(17, role.id),
    );

    expect(screen.getByRole("button", { name: /add user/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add role/i })).toBeInTheDocument();
    expect(screen.getByTitle("Edit user")).toBeInTheDocument();
    expect(screen.getByTitle("Deactivate user")).toBeInTheDocument();
    expect(screen.getByTitle("Delete user")).toBeInTheDocument();
  });

  it("clears loaded Club data immediately when permission is removed", async () => {
    const { rerender } = render(
      <UserManagement
        clubId={17}
        permissions={managementPermissions}
      />,
    );

    expect(await screen.findByText("Jane Admin")).toBeInTheDocument();

    rerender(
      <UserManagement
        clubId={17}
        permissions={["club.members.manage"]}
      />,
    );

    expect(screen.getByText("Permission required")).toBeInTheDocument();
    expect(screen.queryByText("Jane Admin")).not.toBeInTheDocument();
    expect(getClubManagedUsers).toHaveBeenCalledTimes(1);
    expect(getClubRoles).toHaveBeenCalledTimes(1);
  });

  it("clears stale data and disables controls when a new Club load returns 403", async () => {
    const { rerender } = render(
      <UserManagement
        clubId={17}
        permissions={managementPermissions}
      />,
    );

    expect(await screen.findByText("Jane Admin")).toBeInTheDocument();

    vi.mocked(getClubManagedUsers).mockRejectedValueOnce(forbidden);
    vi.mocked(getClubRoles).mockResolvedValueOnce([role]);

    rerender(
      <UserManagement
        clubId={18}
        permissions={managementPermissions}
      />,
    );

    expect(
      await screen.findByText(
        "You cannot manage users in this Club workspace.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Jane Admin")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add user/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add role/i })).not.toBeInTheDocument();
    expect(createClubUser).not.toHaveBeenCalled();
    expect(updateClubUser).not.toHaveBeenCalled();
    expect(deleteClubUser).not.toHaveBeenCalled();
    expect(setClubUserStatus).not.toHaveBeenCalled();
  });

  it("shows a mutation 403 detail without changing the local user", async () => {
    vi.mocked(setClubUserStatus).mockRejectedValueOnce(forbidden);

    render(
      <UserManagement
        clubId={17}
        permissions={managementPermissions}
      />,
    );

    expect(await screen.findByText("Jane Admin")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Deactivate user"));

    expect(
      await screen.findByText(
        "You cannot manage users in this Club workspace.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.queryByText("Inactive")).not.toBeInTheDocument();
    expect(setClubUserStatus).toHaveBeenCalledWith(
      17,
      managedUser.id,
      "INACTIVE",
    );
    expect(updateClubUser).not.toHaveBeenCalled();
    expect(deleteClubUser).not.toHaveBeenCalled();
  });
});
