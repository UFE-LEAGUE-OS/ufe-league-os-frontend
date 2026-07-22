import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useNavigate,
} from 'react-router-dom';
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
  FiDollarSign,
  FiEye,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUserPlus,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import {
  addSponsorAccountMember,
  getSponsorAccountMembers,
  getSponsorAccounts,
  removeSponsorAccountMember,
  updateSponsorAccountMember,
  type AddSponsorMemberPayload,
  type SponsorAccountMember,
  type SponsorAccountResponse,
  type SponsorMemberRole,
} from '../../services/sponsorshipService';
import { useAuthStore } from '../../store/authStore';
import '../../styles/pages/landing.css';
import './CorporateTeamManagement.css';

type ApiErrorShape = {
  response?: {
    data?: unknown;
  };
};

type RoleFilter =
  | 'ALL'
  | SponsorMemberRole;

type RoleDetails = {
  label: string;
  description: string;
  className: string;
};

const roleDetails: Record<
  SponsorMemberRole,
  RoleDetails
> = {
  OWNER: {
    label: 'Owner',
    description:
      'Full control of the sponsor account and team.',
    className: 'ctm-role-owner',
  },
  ADMIN: {
    label: 'Admin',
    description:
      'Can manage team members and sponsor activity.',
    className: 'ctm-role-admin',
  },
  FINANCE: {
    label: 'Finance',
    description:
      'Can access sponsorship finance and payment records.',
    className: 'ctm-role-finance',
  },
  VIEWER: {
    label: 'Viewer',
    description:
      'Read-only access to sponsor information.',
    className: 'ctm-role-viewer',
  },
};

const assignableRoles: Array<{
  value: AddSponsorMemberPayload['member_role'];
  label: string;
  description: string;
}> = [
  {
    value: 'ADMIN',
    label: 'Admin',
    description:
      'Manage members and sponsor activity.',
  },
  {
    value: 'FINANCE',
    label: 'Finance',
    description:
      'Review payments and finance information.',
  },
  {
    value: 'VIEWER',
    label: 'Viewer',
    description:
      'Read-only access to sponsor information.',
  },
];

const roleRank: Record<
  SponsorMemberRole,
  number
> = {
  OWNER: 1,
  ADMIN: 2,
  FINANCE: 3,
  VIEWER: 4,
};

function extractErrorMessage(
  value: unknown,
): string | null {
  if (
    typeof value === 'string' &&
    value.trim()
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message =
        extractErrorMessage(item);

      if (message) {
        return message;
      }
    }
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    for (
      const item of Object.values(
        value as Record<string, unknown>,
      )
    ) {
      const message =
        extractErrorMessage(item);

      if (message) {
        return message;
      }
    }
  }

  return null;
}

function getApiErrorMessage(
  error: unknown,
  fallback: string,
) {
  const responseData = (
    error as ApiErrorShape
  ).response?.data;

  return (
    extractErrorMessage(responseData) ??
    fallback
  );
}

function getMemberName(
  member: SponsorAccountMember,
) {
  const fullName =
    member.user.full_name?.trim();

  if (fullName) {
    return fullName;
  }

  const combinedName = [
    member.user.first_name,
    member.user.last_name,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    combinedName ||
    member.user.email ||
    'Sponsor member'
  );
}

function getMemberInitials(
  member: SponsorAccountMember,
) {
  const name = getMemberName(member);

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function sortMembers(
  members: SponsorAccountMember[],
) {
  return [...members].sort(
    (left, right) => {
      const roleDifference =
        roleRank[left.member_role] -
        roleRank[right.member_role];

      if (roleDifference !== 0) {
        return roleDifference;
      }

      return getMemberName(left).localeCompare(
        getMemberName(right),
      );
    },
  );
}

export default function CorporateTeamManagement() {
  const navigate = useNavigate();
  const authUser = useAuthStore(
    (state) => state.user,
  );

  const [allAccounts, setAllAccounts] =
    useState<SponsorAccountResponse[]>([]);
  const [
    selectedAccountId,
    setSelectedAccountId,
  ] = useState<number | null>(null);
  const [members, setMembers] = useState<
    SponsorAccountMember[]
  >([]);

  const [
    accountsLoading,
    setAccountsLoading,
  ] = useState(true);
  const [
    membersLoading,
    setMembersLoading,
  ] = useState(false);
  const [
    accountsError,
    setAccountsError,
  ] = useState('');
  const [
    membersError,
    setMembersError,
  ] = useState('');

  const [
    accountsRequestKey,
    setAccountsRequestKey,
  ] = useState(0);
  const [
    membersRequestKey,
    setMembersRequestKey,
  ] = useState(0);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>('ALL');

  const [
    showAddMember,
    setShowAddMember,
  ] = useState(false);
  const [memberEmail, setMemberEmail] =
    useState('');
  const [
    memberRole,
    setMemberRole,
  ] = useState<
    AddSponsorMemberPayload['member_role']
  >('VIEWER');
  const [submitting, setSubmitting] =
    useState(false);
  const [formError, setFormError] =
    useState('');
  const [successMessage, setSuccessMessage] =
    useState('');
  const [
    rowActionMemberId,
    setRowActionMemberId,
  ] = useState<number | null>(null);
  const [rowError, setRowError] = useState<
    Record<number, string>
  >({});

  const corporateAccounts = useMemo(
    () =>
      allAccounts.filter(
        (account) =>
          account.sponsor_type ===
          'CORPORATE',
      ),
    [allAccounts],
  );

  const individualAccounts = useMemo(
    () =>
      allAccounts.filter(
        (account) =>
          account.sponsor_type ===
          'INDIVIDUAL',
      ),
    [allAccounts],
  );

  const selectedAccount = useMemo(
    () =>
      corporateAccounts.find(
        (account) =>
          account.id === selectedAccountId,
      ) ?? null,
    [
      corporateAccounts,
      selectedAccountId,
    ],
  );

  useEffect(() => {
    let active = true;

    async function loadAccounts() {
      setAccountsLoading(true);
      setAccountsError('');

      try {
        const response =
          await getSponsorAccounts();

        if (!active) {
          return;
        }

        const accounts =
          response.data.results;

        const corporate = accounts.filter(
          (account) =>
            account.sponsor_type ===
            'CORPORATE',
        );

        const queryAccountId = Number(
          new URLSearchParams(
            window.location.search,
          ).get('account'),
        );

        const requestedAccount =
          corporate.find(
            (account) =>
              account.id === queryAccountId,
          );

        // Keep the team page in its loading state while the
        // selected corporate account members are requested.
        setMembersLoading(
          corporate.length > 0,
        );

        setAllAccounts(accounts);
        setSelectedAccountId(
          requestedAccount?.id ??
            corporate[0]?.id ??
            null,
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setAllAccounts([]);
        setSelectedAccountId(null);
        setMembersLoading(false);
        setAccountsError(
          getApiErrorMessage(
            error,
            'We could not load your sponsor accounts.',
          ),
        );
      } finally {
        if (active) {
          setAccountsLoading(false);
        }
      }
    }

    void loadAccounts();

    return () => {
      active = false;
    };
  }, [accountsRequestKey]);

  useEffect(() => {
    let active = true;

    if (selectedAccountId === null) {
      setMembers([]);
      setMembersLoading(false);
      setMembersError('');

      return () => {
        active = false;
      };
    }

    async function loadMembers() {
      setMembersLoading(true);
      setMembersError('');

      try {
        const response =
          await getSponsorAccountMembers(
            selectedAccountId as number,
          );

        if (!active) {
          return;
        }

        setMembers(
          sortMembers(
            response.data.results,
          ),
        );
      } catch (error) {
        if (!active) {
          return;
        }

        setMembers([]);
        setMembersError(
          getApiErrorMessage(
            error,
            'We could not load the sponsor team.',
          ),
        );
      } finally {
        if (active) {
          setMembersLoading(false);
        }
      }
    }

    void loadMembers();

    return () => {
      active = false;
    };
  }, [
    selectedAccountId,
    membersRequestKey,
  ]);

  const currentUserEmail =
    authUser?.email?.trim().toLowerCase() ??
    '';

  const currentUserId =
    authUser?.id === undefined ||
    authUser?.id === null
      ? ''
      : String(authUser.id);

  function isCurrentUser(
    member: SponsorAccountMember,
  ) {
    const memberEmail =
      member.user.email
        ?.trim()
        .toLowerCase() ?? '';

    const memberId =
      member.user.id === undefined ||
      member.user.id === null
        ? ''
        : String(member.user.id);

    return Boolean(
      (currentUserEmail &&
        memberEmail === currentUserEmail) ||
        (currentUserId &&
          memberId === currentUserId),
    );
  }

  const currentMembership =
    members.find(isCurrentUser) ?? null;

  const ownsSelectedAccount = Boolean(
    selectedAccount &&
      (
        String(
          selectedAccount.owner.id,
        ) === currentUserId ||
        selectedAccount.owner.email
          ?.trim()
          .toLowerCase() ===
          currentUserEmail
      ),
  );

  const effectiveRole:
    | SponsorMemberRole
    | null =
    currentMembership?.member_role ??
    (ownsSelectedAccount
      ? 'OWNER'
      : null);

  const canManageMembers =
    effectiveRole === 'OWNER' ||
    effectiveRole === 'ADMIN';

  const filteredMembers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !normalizedSearch ||
        getMemberName(member)
          .toLowerCase()
          .includes(normalizedSearch) ||
        member.user.email
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesRole =
        roleFilter === 'ALL' ||
        member.member_role === roleFilter;

      return (
        matchesSearch &&
        matchesRole
      );
    });
  }, [
    members,
    roleFilter,
    search,
  ]);

  const stats = useMemo(() => {
    const activeMembers =
      members.filter(
        (member) => member.is_active,
      );

    return [
      {
        icon: FiUsers,
        label: 'Team Members',
        value: activeMembers.length,
        description:
          'Active account members',
        className: 'ctm-icon-purple',
      },
      {
        icon: FiShield,
        label: 'Owners & Admins',
        value: activeMembers.filter(
          (member) =>
            member.member_role ===
              'OWNER' ||
            member.member_role ===
              'ADMIN',
        ).length,
        description:
          'Team management access',
        className: 'ctm-icon-orange',
      },
      {
        icon: FiDollarSign,
        label: 'Finance Members',
        value: activeMembers.filter(
          (member) =>
            member.member_role ===
            'FINANCE',
        ).length,
        description:
          'Finance access',
        className: 'ctm-icon-green',
      },
      {
        icon: FiEye,
        label: 'Viewers',
        value: activeMembers.filter(
          (member) =>
            member.member_role ===
            'VIEWER',
        ).length,
        description:
          'Read-only access',
        className: 'ctm-icon-blue',
      },
    ];
  }, [members]);

  function selectAccount(
    accountId: number,
  ) {
    setSelectedAccountId(accountId);
    setSearch('');
    setRoleFilter('ALL');
    setShowAddMember(false);
    setFormError('');
    setSuccessMessage('');

    navigate(
      `/sponsor/team?account=${accountId}`,
      {
        replace: true,
      },
    );
  }

  function closeAddMemberForm() {
    setShowAddMember(false);
    setMemberEmail('');
    setMemberRole('VIEWER');
    setFormError('');
  }

  async function handleAddMember(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !selectedAccountId ||
      !canManageMembers
    ) {
      return;
    }

    const normalizedEmail =
      memberEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      setFormError(
        'Enter the League OS email address of the member.',
      );
      return;
    }

    setSubmitting(true);
    setFormError('');
    setSuccessMessage('');

    try {
      const response =
        await addSponsorAccountMember(
          selectedAccountId,
          {
            email: normalizedEmail,
            member_role: memberRole,
          },
        );

      const addedMember =
        response.data.member;

      setMembers((currentMembers) =>
        sortMembers([
          ...currentMembers.filter(
            (member) =>
              member.id !== addedMember.id &&
              member.user.email
                ?.toLowerCase() !==
                addedMember.user.email
                  ?.toLowerCase(),
          ),
          addedMember,
        ]),
      );

      setSuccessMessage(
        response.data.message ||
          `${addedMember.user.email ?? 'The member'} was added successfully.`,
      );
      setMemberEmail('');
      setMemberRole('VIEWER');
      setShowAddMember(false);
    } catch (error) {
      setFormError(
        getApiErrorMessage(
          error,
          'We could not add this member. Confirm that the user already has a League OS account.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleChangeRole(
    member: SponsorAccountMember,
    newRole: SponsorMemberRole,
  ) {
    if (
      !selectedAccountId ||
      newRole === member.member_role
    ) {
      return;
    }

    setRowActionMemberId(member.id);
    setRowError((current) => {
      const next = { ...current };
      delete next[member.id];
      return next;
    });

    try {
      const response =
        await updateSponsorAccountMember(
          selectedAccountId,
          member.id,
          newRole,
        );

      setMembers((currentMembers) =>
        sortMembers(
          currentMembers.map((existing) =>
            existing.id === member.id
              ? response.data
              : existing,
          ),
        ),
      );
    } catch (error) {
      setRowError((current) => ({
        ...current,
        [member.id]: getApiErrorMessage(
          error,
          'We could not update this member’s role.',
        ),
      }));
    } finally {
      setRowActionMemberId(null);
    }
  }

  async function handleRemoveMember(
    member: SponsorAccountMember,
  ) {
    if (!selectedAccountId) {
      return;
    }

    const confirmed = window.confirm(
      `Remove ${getMemberName(member)} from this sponsor account? They will immediately lose access.`,
    );

    if (!confirmed) {
      return;
    }

    setRowActionMemberId(member.id);
    setRowError((current) => {
      const next = { ...current };
      delete next[member.id];
      return next;
    });

    try {
      await removeSponsorAccountMember(
        selectedAccountId,
        member.id,
      );

      setMembers((currentMembers) =>
        currentMembers.filter(
          (existing) =>
            existing.id !== member.id,
        ),
      );
    } catch (error) {
      setRowError((current) => ({
        ...current,
        [member.id]: getApiErrorMessage(
          error,
          'We could not remove this member.',
        ),
      }));
    } finally {
      setRowActionMemberId(null);
    }
  }

  function renderAccountsState() {
    if (accountsLoading) {
      return (
        <div
          className="ctm-state-card"
          role="status"
        >
          <div className="ctm-spinner" />
          <h2>Loading sponsor team</h2>
          <p>
            We are loading your corporate
            sponsor accounts.
          </p>
        </div>
      );
    }

    if (accountsError) {
      return (
        <div className="ctm-state-card">
          <FiAlertCircle size={28} />
          <h2>
            Sponsor accounts unavailable
          </h2>
          <p>{accountsError}</p>
          <button
            type="button"
            className="ctm-primary-btn"
            onClick={() =>
              setAccountsRequestKey(
                (value) => value + 1,
              )
            }
          >
            <FiRefreshCw size={16} />
            Retry
          </button>
        </div>
      );
    }

    if (
      corporateAccounts.length === 0
    ) {
      return (
        <div className="ctm-state-card">
          <FiUsers size={30} />
          <h2>
            Corporate team management is
            not available
          </h2>
          <p>
            {individualAccounts.length > 0
              ? 'Your current sponsor account is an individual account. Team members can only be added to corporate sponsor accounts.'
              : 'Create or join a corporate sponsor account before managing a sponsor team.'}
          </p>
          <button
            type="button"
            className="ctm-primary-btn"
            onClick={() =>
              navigate('/sponsor/dashboard')
            }
          >
            Return to dashboard
          </button>
        </div>
      );
    }

    return null;
  }

  const accountState =
    renderAccountsState();

  return (
    <div className="ctm-page">
      <div className="ctm-layout">
        <SponsorSidebar />

        <main className="ctm-main landing-page">
          <header className="ctm-header">
            <div>
              <div className="ctm-eyebrow">
                Sponsor workspace
              </div>
              <h1 className="ctm-title">
                Corporate Team
              </h1>
              <p className="ctm-subtitle">
                Manage the League OS users
                who can access your corporate
                sponsor account.
              </p>
            </div>

            <div className="ctm-header-actions">
              {selectedAccount &&
                canManageMembers && (
                  <button
                    type="button"
                    className="ctm-primary-btn"
                    onClick={() => {
                      setShowAddMember(true);
                      setFormError('');
                      setSuccessMessage('');
                    }}
                  >
                    <FiUserPlus size={16} />
                    Add team member
                  </button>
                )}
            </div>
          </header>

          {accountState}

          {!accountState &&
            selectedAccount && (
              <>
                <section className="ctm-account-card">
                  <div>
                    <div className="ctm-account-label">
                      Corporate sponsor
                    </div>
                    <h2>
                      {selectedAccount.name}
                    </h2>
                    <div className="ctm-account-meta">
                      <span
                        className={`ctm-account-status ctm-account-status-${selectedAccount.status.toLowerCase()}`}
                      >
                        {
                          selectedAccount.status_display
                        }
                      </span>
                      <span>
                        {
                          selectedAccount.registration_country
                        }
                      </span>
                      {selectedAccount.brn && (
                        <span>
                          BRN:{' '}
                          {
                            selectedAccount.brn
                          }
                        </span>
                      )}
                    </div>
                  </div>

                  {corporateAccounts.length >
                    1 && (
                    <label className="ctm-account-selector">
                      <span>
                        Switch account
                      </span>
                      <div className="ctm-select-wrap">
                        <select
                          value={
                            selectedAccountId ??
                            ''
                          }
                          onChange={(event) =>
                            selectAccount(
                              Number(
                                event.target
                                  .value,
                              ),
                            )
                          }
                          aria-label="Corporate sponsor account"
                        >
                          {corporateAccounts.map(
                            (account) => (
                              <option
                                key={
                                  account.id
                                }
                                value={
                                  account.id
                                }
                              >
                                {
                                  account.name
                                }
                              </option>
                            ),
                          )}
                        </select>
                        <FiChevronDown
                          size={15}
                        />
                      </div>
                    </label>
                  )}
                </section>

                {successMessage && (
                  <div
                    className="ctm-feedback ctm-feedback-success"
                    role="status"
                  >
                    <FiCheckCircle
                      size={18}
                    />
                    <span>
                      {successMessage}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSuccessMessage(
                          '',
                        )
                      }
                      aria-label="Dismiss success message"
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                )}

                {!canManageMembers &&
                  !membersLoading &&
                  !membersError && (
                    <div className="ctm-access-notice">
                      <FiShield size={19} />
                      <div>
                        <strong>
                          Read-only team
                          access
                        </strong>
                        <p>
                          Your{' '}
                          {effectiveRole
                            ? roleDetails[
                                effectiveRole
                              ].label
                            : 'current'}{' '}
                          role gives you
                          read-only access to
                          this corporate team.
                          Only owners and
                          administrators can
                          add members.
                        </p>
                      </div>
                    </div>
                  )}

                {showAddMember &&
                  canManageMembers && (
                    <section className="ctm-add-panel">
                      <div className="ctm-add-panel-header">
                        <div>
                          <h2>
                            Add existing
                            League OS user
                          </h2>
                          <p>
                            The person must
                            already have a
                            League OS account.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="ctm-close-btn"
                          onClick={
                            closeAddMemberForm
                          }
                          aria-label="Close add member form"
                        >
                          <FiX size={19} />
                        </button>
                      </div>

                      <form
                        className="ctm-add-form"
                        onSubmit={
                          handleAddMember
                        }
                      >
                        <label>
                          <span>
                            Member email
                          </span>
                          <input
                            type="email"
                            value={
                              memberEmail
                            }
                            onChange={(
                              event,
                            ) =>
                              setMemberEmail(
                                event.target
                                  .value,
                              )
                            }
                            placeholder="member@example.com"
                            autoComplete="email"
                            disabled={
                              submitting
                            }
                          />
                        </label>

                        <label>
                          <span>
                            Member role
                          </span>
                          <div className="ctm-select-wrap">
                            <select
                              value={
                                memberRole
                              }
                              onChange={(
                                event,
                              ) =>
                                setMemberRole(
                                  event.target
                                    .value as AddSponsorMemberPayload['member_role'],
                                )
                              }
                              aria-label="Member role"
                              disabled={
                                submitting
                              }
                            >
                              {assignableRoles.map(
                                (role) => (
                                  <option
                                    key={
                                      role.value
                                    }
                                    value={
                                      role.value
                                    }
                                  >
                                    {
                                      role.label
                                    }
                                  </option>
                                ),
                              )}
                            </select>
                            <FiChevronDown
                              size={15}
                            />
                          </div>
                        </label>

                        <div className="ctm-role-help">
                          {
                            assignableRoles.find(
                              (role) =>
                                role.value ===
                                memberRole,
                            )?.description
                          }
                        </div>

                        {formError && (
                          <div
                            className="ctm-form-error"
                            role="alert"
                          >
                            <FiAlertCircle
                              size={17}
                            />
                            {formError}
                          </div>
                        )}

                        <div className="ctm-form-actions">
                          <button
                            type="button"
                            className="ctm-secondary-btn"
                            onClick={
                              closeAddMemberForm
                            }
                            disabled={
                              submitting
                            }
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="ctm-primary-btn"
                            disabled={
                              submitting
                            }
                          >
                            <FiUserPlus
                              size={16}
                            />
                            {submitting
                              ? 'Adding member...'
                              : 'Add member'}
                          </button>
                        </div>
                      </form>
                    </section>
                  )}

                <section className="ctm-stats-row">
                  {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                      <div
                        key={stat.label}
                        className="ctm-stat-card"
                      >
                        <div
                          className={`ctm-stat-icon-wrap ${stat.className}`}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="ctm-stat-label">
                            {stat.label}
                          </div>
                          <div className="ctm-stat-value">
                            {stat.value}
                          </div>
                          <div className="ctm-stat-sub">
                            {
                              stat.description
                            }
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </section>

                <section className="ctm-controls">
                  <div className="ctm-search-wrap">
                    <FiSearch
                      size={16}
                      className="ctm-search-icon"
                    />
                    <input
                      type="search"
                      className="ctm-search"
                      placeholder="Search by member name or email"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value,
                        )
                      }
                    />
                  </div>

                  <div className="ctm-role-filter">
                    <FiShield size={15} />
                    <select
                      value={roleFilter}
                      onChange={(event) =>
                        setRoleFilter(
                          event.target
                            .value as RoleFilter,
                        )
                      }
                      aria-label="Filter members by role"
                    >
                      <option value="ALL">
                        All roles
                      </option>
                      <option value="OWNER">
                        Owners
                      </option>
                      <option value="ADMIN">
                        Administrators
                      </option>
                      <option value="FINANCE">
                        Finance
                      </option>
                      <option value="VIEWER">
                        Viewers
                      </option>
                    </select>
                    <FiChevronDown
                      size={15}
                    />
                  </div>
                </section>

                {membersLoading && (
                  <div
                    className="ctm-state-card ctm-members-state"
                    role="status"
                  >
                    <div className="ctm-spinner" />
                    <h2>
                      Loading team members
                    </h2>
                    <p>
                      We are retrieving the
                      members of{' '}
                      {
                        selectedAccount.name
                      }
                      .
                    </p>
                  </div>
                )}

                {!membersLoading &&
                  membersError && (
                    <div className="ctm-state-card ctm-members-state">
                      <FiAlertCircle
                        size={28}
                      />
                      <h2>
                        Team members
                        unavailable
                      </h2>
                      <p>
                        {membersError}
                      </p>
                      <button
                        type="button"
                        className="ctm-primary-btn"
                        onClick={() =>
                          setMembersRequestKey(
                            (value) =>
                              value + 1,
                          )
                        }
                      >
                        <FiRefreshCw
                          size={16}
                        />
                        Retry
                      </button>
                    </div>
                  )}

                {!membersLoading &&
                  !membersError && (
                    <section className="ctm-table-card">
                      <div className="ctm-table-heading">
                        <div>
                          <h2>
                            {
                              selectedAccount.name
                            }{' '}
                            team
                          </h2>
                          <p>
                            Active users with
                            access to this
                            sponsor account.
                          </p>
                        </div>
                        <span className="ctm-result-count">
                          {
                            filteredMembers.length
                          }{' '}
                          of {members.length}
                        </span>
                      </div>

                      {filteredMembers.length ===
                      0 ? (
                        <div className="ctm-empty-state">
                          <FiUsers
                            size={30}
                          />
                          <h3>
                            No members found
                          </h3>
                          <p>
                            {members.length >
                            0
                              ? 'No team members match the current search and role filter.'
                              : 'This sponsor account does not have any active team members yet.'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div
                            className={`ctm-table-header ${canManageMembers ? 'ctm-table-with-actions' : ''}`}
                          >
                            <div>
                              Member
                            </div>
                            <div>
                              Role
                            </div>
                            <div>
                              Access
                            </div>
                            <div>
                              Status
                            </div>
                            {canManageMembers && (
                              <div>
                                Actions
                              </div>
                            )}
                          </div>

                          <div className="ctm-table-body">
                            {filteredMembers.map(
                              (member) => {
                                const details =
                                  roleDetails[
                                    member
                                      .member_role
                                  ];

                                return (
                                  <article
                                    key={
                                      member.id
                                    }
                                    className={`ctm-table-row ${canManageMembers ? 'ctm-table-with-actions' : ''}`}
                                  >
                                    <div className="ctm-member-cell">
                                      <div className="ctm-avatar">
                                        {getMemberInitials(
                                          member,
                                        )}
                                      </div>
                                      <div className="ctm-member-info">
                                        <div className="ctm-member-name-row">
                                          <span className="ctm-member-name">
                                            {getMemberName(
                                              member,
                                            )}
                                          </span>
                                          {isCurrentUser(
                                            member,
                                          ) && (
                                            <span className="ctm-you-badge">
                                              You
                                            </span>
                                          )}
                                        </div>
                                        <span className="ctm-member-email">
                                          {member
                                            .user
                                            .email ??
                                            'Email unavailable'}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="ctm-role-cell">
                                      <span
                                        className={`ctm-role-badge ${details.className}`}
                                      >
                                        {
                                          details.label
                                        }
                                      </span>
                                    </div>

                                    <div className="ctm-access-cell">
                                      {
                                        details.description
                                      }
                                    </div>

                                    <div className="ctm-status-cell">
                                      <span
                                        className={`ctm-status-badge ${
                                          member.is_active
                                            ? 'ctm-status-active'
                                            : 'ctm-status-inactive'
                                        }`}
                                      >
                                        {member.is_active
                                          ? 'Active'
                                          : 'Inactive'}
                                      </span>
                                    </div>

                                    {canManageMembers && (
                                      <div className="ctm-actions-cell">
                                        {member.member_role !==
                                          'OWNER' &&
                                        !isCurrentUser(
                                          member,
                                        ) ? (
                                          <>
                                            <div className="ctm-select-wrap ctm-role-select">
                                              <select
                                                value={
                                                  member.member_role
                                                }
                                                disabled={
                                                  rowActionMemberId ===
                                                  member.id
                                                }
                                                onChange={(
                                                  event,
                                                ) =>
                                                  void handleChangeRole(
                                                    member,
                                                    event
                                                      .target
                                                      .value as SponsorMemberRole,
                                                  )
                                                }
                                                aria-label={`Change role for ${getMemberName(member)}`}
                                              >
                                                {assignableRoles.map(
                                                  (
                                                    role,
                                                  ) => (
                                                    <option
                                                      key={
                                                        role.value
                                                      }
                                                      value={
                                                        role.value
                                                      }
                                                    >
                                                      {
                                                        role.label
                                                      }
                                                    </option>
                                                  ),
                                                )}
                                              </select>
                                              <FiChevronDown
                                                size={
                                                  13
                                                }
                                              />
                                            </div>

                                            <button
                                              type="button"
                                              className="ctm-remove-btn"
                                              disabled={
                                                rowActionMemberId ===
                                                member.id
                                              }
                                              onClick={() =>
                                                void handleRemoveMember(
                                                  member,
                                                )
                                              }
                                            >
                                              Remove
                                            </button>
                                          </>
                                        ) : (
                                          <span className="ctm-actions-locked">
                                            {isCurrentUser(
                                              member,
                                            )
                                              ? 'This is you'
                                              : 'Owner'}
                                          </span>
                                        )}

                                        {rowError[
                                          member.id
                                        ] && (
                                          <div className="ctm-row-error">
                                            <FiAlertCircle
                                              size={
                                                13
                                              }
                                            />
                                            {
                                              rowError[
                                                member
                                                  .id
                                              ]
                                            }
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </article>
                                );
                              },
                            )}
                          </div>
                        </>
                      )}
                    </section>
                  )}
              </>
            )}
        </main>
      </div>
    </div>
  );
}
