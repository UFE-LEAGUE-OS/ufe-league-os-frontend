import {
  Activity,
  Award,
  Building2,
  CalendarDays,
  Camera,
  ClipboardList,
  Clock,
  CreditCard,
  Eye,
  FileBarChart,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Pencil,
  Plus,
  Power,
  Search,
  Settings as SettingsIcon,
  Shield,
  TicketCheck,
  Trash2,
  Trophy,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  WorkspaceEmpty,
  WorkspacePanel,
  adminWorkspaceStyles as styles,
  formatWorkspaceDate,
} from "../../components/AdminWorkspaceLayout/AdminWorkspaceLayout";
import {
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
  type UserPerformanceMetrics,
  type UserStatus,
} from "../../services/userManagementService";
import { getApiErrorMessage } from "../../services/adminWorkspaceService";
import "../../styles/pages/club-admin/UserManagement.css";

/* ------------------------------------------------------------------ */
/* Local constants                                                     */
/* ------------------------------------------------------------------ */

const PAGE_SIZE = 8;

const STATUS_FILTERS: Array<"ALL" | UserStatus> = [
  "ALL",
  "ACTIVE",
  "INACTIVE",
];

const COUNTRY_CODES = [
  { code: "+256", label: "🇺🇬 +256" },
  { code: "+254", label: "🇰🇪 +254" },
  { code: "+255", label: "🇹🇿 +255" },
  { code: "+250", label: "🇷🇼 +250" },
  { code: "+257", label: "🇧🇮 +257" },
];

const MODULE_ICONS: Record<string, typeof Layers> = {
  dashboard: LayoutDashboard,
  members: UsersIcon,
  teams: Trophy,
  matches: CalendarDays,
  finances: CreditCard,
  tickets: TicketCheck,
  ticketing: TicketCheck,
  facilities: Building2,
  reports: FileBarChart,
  communications: MessageSquare,
  settings: SettingsIcon,
};

function moduleIcon(key: string) {
  return MODULE_ICONS[key.toLowerCase()] ?? Layers;
}

const emptyUserForm = {
  full_name: "",
  username: "",
  email: "",
  country_code: "+256",
  phone_number: "",
  password: "",
  role: "",
  permission_keys: [] as string[],
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function countPermissionModules(modules: PermissionModule[]): number {
  return modules.reduce(
    (total, mod) =>
      total + mod.permissions.filter((p) => p.enabled).length,
    0,
  );
}

function totalPermissionModules(modules: PermissionModule[]): number {
  return modules.reduce((total, mod) => total + mod.permissions.length, 0);
}

/* ------------------------------------------------------------------ */
/* Shared permission toggle grid (used by both the per-user permission */
/* picker and the role permission template editor)                    */
/* ------------------------------------------------------------------ */

function PermissionToggleList({
  permissions,
  onToggle,
}: {
  permissions: { key: string; label: string; description: string; enabled: boolean; moduleLabel?: string }[];
  onToggle: (key: string) => void;
}) {
  if (permissions.length === 0) {
    return (
      <WorkspaceEmpty
        title="No permissions in this module"
        description="There is nothing to configure here yet."
      />
    );
  }

  return (
    <div>
      {permissions.map((perm) => (
        <div className="upm-permission-row" key={perm.key}>
          <div>
            <div className="upm-permission-label">{perm.label}</div>
            {perm.moduleLabel && (
              <span className="upm-role-badge" style={{ marginTop: 4 }}>
                {perm.moduleLabel}
              </span>
            )}
          </div>
          <div className="upm-permission-desc">{perm.description}</div>
          <button
            type="button"
            className={`upm-toggle ${perm.enabled ? "on" : ""}`}
            aria-pressed={perm.enabled}
            aria-label={`Toggle ${perm.label}`}
            onClick={() => onToggle(perm.key)}
          />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export interface UserManagementProps {
  clubId: number;
}

export default function UserManagement({ clubId }: UserManagementProps) {
  /* ---------------- Users & roles data ---------------- */

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<RoleSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsersAndRoles = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [usersResult, rolesResult] = await Promise.all([
        getClubManagedUsers(clubId),
        getClubRoles(clubId),
      ]);
      setUsers(usersResult);
      setRoles(rolesResult);
      setSelectedRoleId((prev) => prev ?? rolesResult[0]?.id ?? null);
    } catch (loadError) {
      setError(
        getApiErrorMessage(
          loadError,
          "Club users and roles could not be loaded.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    void loadUsersAndRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  /* ---------------- Table filters / pagination ---------------- */

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>(
    "ALL",
  );
  const [page, setPage] = useState(1);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery =
        !query ||
        user.full_name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, roleFilter, statusFilter]);

  /* ---------------- Create / edit user form ---------------- */

  const formRef = useRef<HTMLDivElement | null>(null);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [showPermissionPicker, setShowPermissionPicker] = useState(false);
  const [formPermissionModules, setFormPermissionModules] = useState<
    PermissionModule[]
  >([]);

  function resetForm() {
    setUserForm(emptyUserForm);
    setEditingUserId(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    setFormError("");
    setShowPassword(false);
    setFormPermissionModules([]);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  }

  async function beginEditUser(user: ManagedUser) {
    setEditingUserId(user.id);
    setFormError("");
    setAvatarFile(null);
    setAvatarPreview(user.avatar_url);
    const [code, ...rest] =
      COUNTRY_CODES.find((c) => user.phone_number.startsWith(c.code))
        ?.code === undefined
        ? ["+256", user.phone_number]
        : [
            COUNTRY_CODES.find((c) => user.phone_number.startsWith(c.code))!
              .code,
            user.phone_number.replace(
              COUNTRY_CODES.find((c) => user.phone_number.startsWith(c.code))!
                .code,
              "",
            ),
          ];
    setUserForm({
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      country_code: code,
      phone_number: rest.join("").trim(),
      password: "",
      role: user.role,
      permission_keys: [],
    });

    try {
      const role = roles.find((r) => r.key === user.role);
      if (role) {
        const modules = await getRolePermissionModules(clubId, role.id);
        setFormPermissionModules(modules);
        setUserForm((prev) => ({
          ...prev,
          permission_keys: modules
            .flatMap((m) => m.permissions)
            .filter((p) => p.enabled)
            .map((p) => p.key),
        }));
      }
    } catch {
      // Non-fatal — the permission picker will just start empty.
    }

    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleRoleChange(roleKey: string) {
    setUserForm((prev) => ({ ...prev, role: roleKey }));
    const role = roles.find((r) => r.key === roleKey);
    if (!role) return;
    try {
      const modules = await getRolePermissionModules(clubId, role.id);
      setFormPermissionModules(modules);
      setUserForm((prev) => ({
        ...prev,
        permission_keys: modules
          .flatMap((m) => m.permissions)
          .filter((p) => p.enabled)
          .map((p) => p.key),
      }));
    } catch {
      // Leave permissions as-is if the template can't be loaded.
    }
  }

  function toggleFormPermission(key: string) {
    setUserForm((prev) => {
      const has = prev.permission_keys.includes(key);
      return {
        ...prev,
        permission_keys: has
          ? prev.permission_keys.filter((k) => k !== key)
          : [...prev.permission_keys, key],
      };
    });
    setFormPermissionModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        permissions: mod.permissions.map((p) =>
          p.key === key ? { ...p, enabled: !p.enabled } : p,
        ),
      })),
    );
  }

  async function submitUserForm() {
    setFormError("");

    if (
      !userForm.full_name.trim() ||
      !userForm.username.trim() ||
      !userForm.email.trim() ||
      !userForm.phone_number.trim() ||
      !userForm.role
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (!editingUserId && !userForm.password.trim()) {
      setFormError("A password is required for new users.");
      return;
    }

    setIsSavingUser(true);
    try {
      if (editingUserId) {
        const updated = await updateClubUser(clubId, editingUserId, {
          full_name: userForm.full_name.trim(),
          username: userForm.username.trim(),
          email: userForm.email.trim(),
          phone_number: `${userForm.country_code}${userForm.phone_number.trim()}`,
          role: userForm.role,
          permission_keys: userForm.permission_keys,
          ...(userForm.password.trim()
            ? { password: userForm.password.trim() }
            : {}),
          avatar: avatarFile,
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u)),
        );
      } else {
        const created = await createClubUser({
          club: clubId,
          full_name: userForm.full_name.trim(),
          username: userForm.username.trim(),
          email: userForm.email.trim(),
          phone_number: `${userForm.country_code}${userForm.phone_number.trim()}`,
          password: userForm.password.trim(),
          role: userForm.role,
          permission_keys: userForm.permission_keys,
          avatar: avatarFile,
        });
        setUsers((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (saveError) {
      setFormError(
        getApiErrorMessage(saveError, "The user could not be saved."),
      );
    } finally {
      setIsSavingUser(false);
    }
  }

  /* ---------------- Row actions: status toggle / delete ---------------- */

  async function toggleUserStatus(user: ManagedUser) {
    const nextStatus: UserStatus =
      user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const updated = await setClubUserStatus(clubId, user.id, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? updated : u)),
      );
    } catch (statusError) {
      setError(
        getApiErrorMessage(
          statusError,
          "The user status could not be updated.",
        ),
      );
    }
  }

  async function removeUser(user: ManagedUser) {
    const confirmed = window.confirm(
      `Remove ${user.full_name}? This cannot be undone.`,
    );
    if (!confirmed) return;
    try {
      await deleteClubUser(clubId, user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (deleteError) {
      setError(
        getApiErrorMessage(deleteError, "The user could not be removed."),
      );
    }
  }

  /* ---------------- Performance modal ---------------- */

  const [performanceUser, setPerformanceUser] = useState<ManagedUser | null>(
    null,
  );
  const [performanceData, setPerformanceData] =
    useState<UserPerformanceMetrics | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState("");

  async function openPerformance(user: ManagedUser) {
    setPerformanceUser(user);
    setPerformanceData(null);
    setPerformanceError("");
    setPerformanceLoading(true);
    try {
      const metrics = await getUserPerformance(clubId, user.id);
      setPerformanceData(metrics);
    } catch (perfError) {
      setPerformanceError(
        getApiErrorMessage(
          perfError,
          "Performance data could not be loaded for this user.",
        ),
      );
    } finally {
      setPerformanceLoading(false);
    }
  }

  function closePerformance() {
    setPerformanceUser(null);
    setPerformanceData(null);
    setPerformanceError("");
  }

  /* ---------------- Role permission template editor ---------------- */

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [roleModules, setRoleModules] = useState<PermissionModule[]>([]);
  const [activeModuleKey, setActiveModuleKey] = useState<string | null>(
    null,
  );
  const [permissionTab, setPermissionTab] = useState<
    "byModule" | "byPermission"
  >("byModule");
  const [isRoleModulesLoading, setIsRoleModulesLoading] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [permissionsDirty, setPermissionsDirty] = useState(false);
  const [permissionsError, setPermissionsError] = useState("");

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;

  const loadRolePermissions = useCallback(
    async (roleId: number) => {
      setIsRoleModulesLoading(true);
      setPermissionsError("");
      try {
        const modules = await getRolePermissionModules(clubId, roleId);
        setRoleModules(modules);
        setActiveModuleKey(modules[0]?.key ?? null);
        setPermissionsDirty(false);
      } catch (loadError) {
        setPermissionsError(
          getApiErrorMessage(
            loadError,
            "Permissions for this role could not be loaded.",
          ),
        );
      } finally {
        setIsRoleModulesLoading(false);
      }
    },
    [clubId],
  );

  useEffect(() => {
    if (selectedRoleId != null) {
      void loadRolePermissions(selectedRoleId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleId]);

  function toggleRolePermission(key: string) {
    setRoleModules((prev) =>
      prev.map((mod) => ({
        ...mod,
        permissions: mod.permissions.map((p) =>
          p.key === key ? { ...p, enabled: !p.enabled } : p,
        ),
      })),
    );
    setPermissionsDirty(true);
  }

  function toggleModuleSelectAll(moduleKey: string, enableAll: boolean) {
    setRoleModules((prev) =>
      prev.map((mod) =>
        mod.key === moduleKey
          ? {
              ...mod,
              permissions: mod.permissions.map((p) => ({
                ...p,
                enabled: enableAll,
              })),
            }
          : mod,
      ),
    );
    setPermissionsDirty(true);
  }

  async function saveRolePermissions() {
    if (!selectedRoleId) return;
    setIsSavingPermissions(true);
    setPermissionsError("");
    try {
      const saved = await updateRolePermissionModules(
        clubId,
        selectedRoleId,
        roleModules,
      );
      setRoleModules(saved);
      setPermissionsDirty(false);
      const enabledCount = countPermissionModules(saved);
      setRoles((prev) =>
        prev.map((r) =>
          r.id === selectedRoleId
            ? { ...r, permission_count: enabledCount }
            : r,
        ),
      );
    } catch (saveError) {
      setPermissionsError(
        getApiErrorMessage(
          saveError,
          "Permission changes could not be saved.",
        ),
      );
    } finally {
      setIsSavingPermissions(false);
    }
  }

  function cancelRolePermissionChanges() {
    if (selectedRoleId != null) {
      void loadRolePermissions(selectedRoleId);
    }
  }

  const activeModule = roleModules.find((m) => m.key === activeModuleKey);
  const flattenedRoleModules = useMemo(
    () =>
      roleModules.flatMap((mod) =>
        mod.permissions.map((p) => ({ ...p, moduleLabel: mod.label })),
      ),
    [roleModules],
  );

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  if (isLoading && users.length === 0) {
    return (
      <WorkspacePanel
        eyebrow="Club administration"
        title="User & Permission Management"
        description="Loading club users and roles…"
      >
        <WorkspaceEmpty
          title="Loading…"
          description="Fetching users, roles and permissions for this club."
        />
      </WorkspacePanel>
    );
  }

  return (
    <>
      {error && (
        <div className={styles.validationCard}>
          <Shield size={18} />
          <strong>Some information may be stale</strong>
          <span>{error}</span>
        </div>
      )}

      <div className="upm-grid-top">
        <div ref={formRef}>
          <WorkspacePanel
            eyebrow="User accounts"
            title={editingUserId ? "Edit User" : "Create New User"}
            description={
              editingUserId
                ? "Update this club user's details, role and permissions."
                : "Add a new administrator, officer or coach to this club."
            }
          >
            <div className="upm-form">
              <div className="upm-avatar-field">
                <div className="upm-avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="" />
                  ) : (
                    initials(userForm.full_name || "New User")
                  )}
                </div>
                <label className="upm-avatar-upload">
                  <Camera size={15} />
                  Upload Photo
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    hidden
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>

              <label className="upm-field">
                Full Name *
                <input
                  type="text"
                  value={userForm.full_name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, full_name: e.target.value })
                  }
                  placeholder="Jane Mukasa"
                />
              </label>

              <label className="upm-field">
                Username *
                <input
                  type="text"
                  value={userForm.username}
                  onChange={(e) =>
                    setUserForm({ ...userForm, username: e.target.value })
                  }
                  placeholder="jane.mukasa"
                />
              </label>

              <label className="upm-field">
                Email *
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  placeholder="jane.mukasa@club.com"
                />
              </label>

              <div className="upm-field">
                Phone Number *
                <div className="upm-phone-row">
                  <select
                    value={userForm.country_code}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        country_code: e.target.value,
                      })
                    }
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={userForm.phone_number}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        phone_number: e.target.value,
                      })
                    }
                    placeholder="701 234 567"
                  />
                </div>
              </div>

              <label className="upm-field upm-password-field">
                {editingUserId
                  ? "New Password (optional)"
                  : "Password *"}
                <input
                  type={showPassword ? "text" : "password"}
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <Eye size={15} />
                </button>
              </label>

              <label className="upm-field">
                Role *
                <select
                  value={userForm.role}
                  onChange={(e) => void handleRoleChange(e.target.value)}
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.key}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="upm-field">
                Permissions *
                <button
                  type="button"
                  className="upm-permissions-trigger"
                  onClick={() => setShowPermissionPicker(true)}
                  disabled={formPermissionModules.length === 0}
                >
                  <span>
                    {userForm.permission_keys.length} permissions
                    selected
                  </span>
                  <span>Manage</span>
                </button>
              </div>

              {formError && <p className="upm-form-error">{formError}</p>}

              <div className="upm-form-actions">
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => void submitUserForm()}
                  disabled={isSavingUser}
                >
                  {isSavingUser
                    ? "Saving…"
                    : editingUserId
                      ? "Save Changes"
                      : "Save User"}
                </button>
              </div>
            </div>
          </WorkspacePanel>
        </div>

        <WorkspacePanel
          eyebrow="Access control"
          title={`User Management`}
          description={`${filteredUsers.length} user${filteredUsers.length === 1 ? "" : "s"} across this club`}
          actions={
            <div className="upm-toolbar">
              <div className="upm-search-wrap">
                <Search size={15} className="upm-search-icon" />
                <input
                  className="upm-search-input"
                  type="text"
                  placeholder="Search users…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="upm-filter-select"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.key}>
                    {role.label}
                  </option>
                ))}
              </select>
              <select
                className="upm-filter-select"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as "ALL" | UserStatus)
                }
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL" ? "All Statuses" : s}
                  </option>
                ))}
              </select>
            </div>
          }
        >
          {pagedUsers.length === 0 ? (
            <WorkspaceEmpty
              title="No users found"
              description="No club users match the current filters."
            />
          ) : (
            <>
              <div className={styles.tableShell}>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Permissions</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedUsers.map((user, index) => (
                      <tr key={user.id}>
                        <td>
                          {(currentPage - 1) * PAGE_SIZE + index + 1}
                        </td>
                        <td>
                          <div className="upm-user-cell">
                            <div
                              className="upm-user-avatar"
                              onClick={() => void openPerformance(user)}
                              title="View performance"
                            >
                              {user.avatar_url ? (
                                <img src={user.avatar_url} alt="" />
                              ) : (
                                initials(user.full_name)
                              )}
                            </div>
                            <div className="upm-user-name-block">
                              <strong
                                onClick={() => void openPerformance(user)}
                              >
                                {user.username}
                              </strong>
                              <span className={styles.tableSecondary}>
                                {user.full_name}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="upm-role-badge">
                            {user.role_display}
                          </span>
                        </td>
                        <td>{user.phone_number}</td>
                        <td>{user.permissions_count}</td>
                        <td>
                          <span className="upm-status-cell">
                            <span
                              className={`upm-status-dot ${
                                user.status === "INACTIVE" ? "inactive" : ""
                              }`}
                            />
                            {user.status === "ACTIVE"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>
                        <td>
                          {user.last_login
                            ? formatWorkspaceDate(user.last_login)
                            : "Never"}
                        </td>
                        <td>
                          <div className="upm-row-actions">
                            <button
                              type="button"
                              className="upm-icon-btn"
                              title="View performance"
                              onClick={() => void openPerformance(user)}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              className="upm-icon-btn"
                              title="Edit user"
                              onClick={() => void beginEditUser(user)}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              className="upm-icon-btn warn"
                              title={
                                user.status === "ACTIVE"
                                  ? "Deactivate user"
                                  : "Activate user"
                              }
                              onClick={() => void toggleUserStatus(user)}
                            >
                              <Power size={15} />
                            </button>
                            <button
                              type="button"
                              className="upm-icon-btn danger"
                              title="Delete user"
                              onClick={() => void removeUser(user)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="upm-pagination">
                <button
                  type="button"
                  className="upm-page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      className={`upm-page-btn ${
                        p === currentPage ? "active" : ""
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  className="upm-page-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  ›
                </button>
              </div>
            </>
          )}
        </WorkspacePanel>
      </div>

      <div className="upm-grid-bottom">
        <WorkspacePanel
          eyebrow="Roles"
          title="Role-based Permissions"
          description="Roles available for this club."
          actions={
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() =>
                window.alert(
                  "Custom role creation isn't wired up yet — add a handler in UserManagement.tsx.",
                )
              }
            >
              <Plus size={14} /> Add Role
            </button>
          }
        >
          <div className="upm-roles-list">
            {roles.map((role) => {
              const Icon = moduleIcon(role.key);
              return (
                <button
                  type="button"
                  key={role.id}
                  className={`upm-role-item ${
                    role.id === selectedRoleId ? "active" : ""
                  }`}
                  onClick={() => setSelectedRoleId(role.id)}
                >
                  <span className="upm-role-icon">
                    <Icon size={15} />
                  </span>
                  <span className="upm-role-item-text">
                    <strong>{role.label}</strong>
                    <small>{role.description}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          eyebrow="Permissions"
          title={
            selectedRole
              ? `Edit Permissions: ${selectedRole.label}`
              : "Edit Permissions"
          }
          description="Configure permissions for this role."
          actions={
            <div className="upm-form-actions" style={{ marginTop: 0 }}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={cancelRolePermissionChanges}
                disabled={!permissionsDirty || isSavingPermissions}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => void saveRolePermissions()}
                disabled={!permissionsDirty || isSavingPermissions}
              >
                {isSavingPermissions ? "Saving…" : "Save Changes"}
              </button>
            </div>
          }
        >
          {!selectedRole ? (
            <WorkspaceEmpty
              title="No role selected"
              description="Choose a role on the left to configure its permissions."
            />
          ) : isRoleModulesLoading ? (
            <WorkspaceEmpty
              title="Loading permissions…"
              description="Fetching the permission template for this role."
            />
          ) : (
            <>
              {permissionsError && (
                <p className="upm-form-error">{permissionsError}</p>
              )}

              <div className="upm-permission-tabs">
                <button
                  type="button"
                  className={`upm-permission-tab ${
                    permissionTab === "byModule" ? "active" : ""
                  }`}
                  onClick={() => setPermissionTab("byModule")}
                >
                  By Module
                </button>
                <button
                  type="button"
                  className={`upm-permission-tab ${
                    permissionTab === "byPermission" ? "active" : ""
                  }`}
                  onClick={() => setPermissionTab("byPermission")}
                >
                  By Permission
                </button>
              </div>

              {permissionTab === "byModule" ? (
                <div className="upm-permission-layout">
                  <div className="upm-module-list">
                    {roleModules.map((mod) => {
                      const Icon = moduleIcon(mod.key);
                      return (
                        <button
                          type="button"
                          key={mod.key}
                          className={`upm-module-item ${
                            mod.key === activeModuleKey ? "active" : ""
                          }`}
                          onClick={() => setActiveModuleKey(mod.key)}
                        >
                          <Icon size={15} />
                          <span className="upm-module-item-text">
                            <strong>{mod.label}</strong>
                            <small>
                              {mod.permissions.length} permissions
                            </small>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    {activeModule && (
                      <>
                        <div className="upm-permission-detail-header">
                          <div>
                            <h4>{activeModule.label}</h4>
                            <p>{activeModule.description}</p>
                          </div>
                          <label className="upm-select-all">
                            Select All
                            <button
                              type="button"
                              className={`upm-toggle ${
                                activeModule.permissions.every(
                                  (p) => p.enabled,
                                )
                                  ? "on"
                                  : ""
                              }`}
                              onClick={() =>
                                toggleModuleSelectAll(
                                  activeModule.key,
                                  !activeModule.permissions.every(
                                    (p) => p.enabled,
                                  ),
                                )
                              }
                            />
                          </label>
                        </div>

                        <PermissionToggleList
                          permissions={activeModule.permissions}
                          onToggle={toggleRolePermission}
                        />
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <PermissionToggleList
                  permissions={flattenedRoleModules}
                  onToggle={toggleRolePermission}
                />
              )}

              <div className="upm-permission-footer">
                <span className="upm-summary">
                  {countPermissionModules(roleModules)} of{" "}
                  {totalPermissionModules(roleModules)} permissions enabled
                </span>
              </div>
            </>
          )}
        </WorkspacePanel>
      </div>

      {/* ---------------- Per-user permission picker modal ---------------- */}
      {showPermissionPicker && (
        <div
          className="upm-modal-overlay"
          onClick={() => setShowPermissionPicker(false)}
        >
          <div
            className="upm-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="upm-modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Edit User Permissions</h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 12.5,
                    color: "var(--muted, #8b93a7)",
                  }}
                >
                  Overrides the default permissions for this user's role.
                </p>
              </div>
              <button
                type="button"
                className="upm-modal-close"
                onClick={() => setShowPermissionPicker(false)}
              >
                <X size={18} />
              </button>
            </div>

            {formPermissionModules.length === 0 ? (
              <WorkspaceEmpty
                title="Select a role first"
                description="Choose a role above to load its default permission set."
              />
            ) : (
              formPermissionModules.map((mod) => (
                <div key={mod.key} style={{ marginBottom: 16 }}>
                  <div className="upm-perf-section-title">{mod.label}</div>
                  <PermissionToggleList
                    permissions={mod.permissions}
                    onToggle={toggleFormPermission}
                  />
                </div>
              ))
            )}

            <div className="upm-form-actions">
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => setShowPermissionPicker(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Performance modal ---------------- */}
      {performanceUser && (
        <div className="upm-modal-overlay" onClick={closePerformance}>
          <div
            className="upm-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="upm-modal-header">
              <div className="upm-modal-user">
                <div className="upm-avatar-preview" style={{ width: 46, height: 46 }}>
                  {performanceUser.avatar_url ? (
                    <img src={performanceUser.avatar_url} alt="" />
                  ) : (
                    initials(performanceUser.full_name)
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>{performanceUser.full_name}</h3>
                  <span className="upm-role-badge">
                    {performanceUser.role_display}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="upm-modal-close"
                onClick={closePerformance}
              >
                <X size={18} />
              </button>
            </div>

            {performanceLoading ? (
              <WorkspaceEmpty
                title="Loading performance…"
                description="Fetching activity metrics for this user."
              />
            ) : performanceError ? (
              <WorkspaceEmpty
                title="Performance data unavailable"
                description={performanceError}
              />
            ) : performanceData ? (
              <>
                <div className="upm-perf-grid">
                  <div className="upm-perf-card">
                    <span>Logins (30d)</span>
                    <strong>{performanceData.logins_last_30_days}</strong>
                  </div>
                  <div className="upm-perf-card">
                    <span>Actions (30d)</span>
                    <strong>{performanceData.actions_last_30_days}</strong>
                  </div>
                  <div className="upm-perf-card">
                    <span>Avg. Session</span>
                    <strong>
                      {performanceData.avg_session_minutes}m
                    </strong>
                  </div>
                </div>

                <div style={{ marginBottom: 8, fontSize: 12.5, color: "var(--muted, #8b93a7)" }}>
                  <Clock size={13} style={{ marginRight: 6, verticalAlign: -2 }} />
                  Last active:{" "}
                  {performanceData.last_active
                    ? formatWorkspaceDate(performanceData.last_active)
                    : "Never"}
                </div>

                <p className="upm-perf-section-title">
                  <Activity size={13} style={{ marginRight: 6, verticalAlign: -2 }} />
                  Activity by module
                </p>
                {performanceData.activity_by_module.length === 0 ? (
                  <WorkspaceEmpty
                    title="No module activity yet"
                    description="This user hasn't logged any tracked actions."
                  />
                ) : (
                  performanceData.activity_by_module.map((row) => (
                    <div className="upm-activity-row" key={row.module}>
                      <span>{row.module}</span>
                      <strong>{row.count}</strong>
                    </div>
                  ))
                )}

                <p
                  className="upm-perf-section-title"
                  style={{ marginTop: 18 }}
                >
                  <Award size={13} style={{ marginRight: 6, verticalAlign: -2 }} />
                  Recent actions
                </p>
                {performanceData.recent_actions.length === 0 ? (
                  <WorkspaceEmpty
                    title="No recent actions"
                    description="Actions this user takes will show up here."
                  />
                ) : (
                  performanceData.recent_actions.map((action) => (
                    <div className="upm-recent-action" key={action.id}>
                      <p>{action.description}</p>
                      <time>{formatWorkspaceDate(action.timestamp)}</time>
                    </div>
                  ))
                )}
              </>
            ) : null}
          </div>
        </div>
      )}

      {editingUserId && (
        <ClipboardList size={0} style={{ display: "none" }} aria-hidden />
      )}
    </>
  );
}