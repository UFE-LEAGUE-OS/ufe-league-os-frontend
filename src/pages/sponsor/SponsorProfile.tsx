import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiEdit2,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiCamera,
  FiCheck,
  FiX,
  FiAtSign,
} from 'react-icons/fi';
import SponsorSidebar from '../../components/SponsorSidebar';
import { fetchProfile, updateProfile, uploadAvatar } from '../../services/authService.js';
import { getSponsorAccounts, type SponsorAccountResponse } from '../../services/sponsorshipService';
import '../../styles/pages/landing.css';
import './SponsorProfile.css';

type ProfileData = {
  id?: number | string;
  email?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  username?: string;
  location?: string;
  sponsor_type?: string;
  avatar_url?: string;
  is_email_verified?: boolean;
  is_phone_verified?: boolean;
  date_joined?: string;
};

const statusConfig: Record<string, { icon: typeof FiCheckCircle; label: string; className: string }> = {
  APPROVED: { icon: FiCheckCircle, label: 'Approved', className: 'spf-status-approved' },
  PENDING: { icon: FiClock, label: 'Pending Review', className: 'spf-status-pending' },
  REJECTED: { icon: FiXCircle, label: 'Rejected', className: 'spf-status-rejected' },
};

const usernamePattern = /^[A-Za-z0-9#$_@]{4,14}$/;

export default function SponsorProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [sponsorAccounts, setSponsorAccounts] = useState<SponsorAccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [profileRes, accountsRes] = await Promise.all([
          fetchProfile(),
          getSponsorAccounts(),
        ]);

        if (!isMounted) return;

        setProfile(profileRes.data as ProfileData);
        setSponsorAccounts(accountsRes.data.results ?? []);
      } catch {
        if (isMounted) {
          setLoadError('We could not load your profile right now. Please try again.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  const isIndividual = profile?.sponsor_type === 'INDIVIDUAL';
  const displayName = profile?.full_name
    || [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
    || 'Sponsor';

  const initials = displayName
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const joinedDate = profile?.date_joined
    ? new Date(profile.date_joined).toLocaleDateString('en-UG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const startEditingUsername = () => {
    setUsernameDraft(profile?.username ?? '');
    setUsernameError('');
    setIsEditingUsername(true);
  };

  const cancelEditingUsername = () => {
    setIsEditingUsername(false);
    setUsernameDraft('');
    setUsernameError('');
  };

  const saveUsername = async () => {
    const trimmed = usernameDraft.trim();

    if (!usernamePattern.test(trimmed)) {
      setUsernameError(
        'Username must be 4–14 characters using letters, numbers, or # $ _ @ only.'
      );
      return;
    }

    setIsSavingUsername(true);
    setUsernameError('');

    try {
      const response = await updateProfile({ username: trimmed });
      setProfile((prev) => (prev ? { ...prev, username: (response.data as ProfileData).username } : prev));
      setIsEditingUsername(false);
    } catch (error) {
      const responseData = (error as { response?: { data?: unknown } })?.response?.data;
      const message =
        responseData && typeof responseData === 'object'
          ? Object.values(responseData as Record<string, unknown>).flat().join(' ')
          : '';
      setUsernameError(message || 'That username could not be saved. Please try another.');
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError('');

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Please upload a JPEG, PNG, WEBP, or GIF image.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Avatar file size must not exceed 2MB.');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const response = await uploadAvatar(file);
      setProfile((prev) => (prev ? { ...prev, avatar_url: (response.data as ProfileData).avatar_url } : prev));
    } catch {
      setAvatarError('We could not upload your photo right now. Please try again.');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="spf-page">
        <div className="spf-layout">
          <SponsorSidebar />
          <main className="spf-main landing-page">
            <div className="spf-loading">Loading profile...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="spf-page">
      <div className="spf-layout">
        <SponsorSidebar />

        <main className="spf-main landing-page">

          {/* Header */}
          <div className="spf-header">
            <h1 className="spf-title">My Profile</h1>
            <p className="spf-subtitle">
              View and manage your {isIndividual ? 'individual' : 'corporate'} sponsor profile.
            </p>
          </div>

          {loadError && (
            <div className="spf-error-banner">{loadError}</div>
          )}

          {/* Profile hero card */}
          <div className="spf-hero-card">
            <div className="spf-avatar-wrap">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="spf-avatar-img" />
              ) : (
                <div className="spf-avatar-fallback">{initials}</div>
              )}
              <input
                type="file"
                ref={avatarInputRef}
                className="spf-avatar-input"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
              />
              <button
                className="spf-avatar-edit"
                title="Change photo"
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
              >
                <FiCamera size={13} />
              </button>
            </div>

            <div className="spf-hero-info">
              <div className="spf-name-row">
                <h2 className="spf-name">{displayName}</h2>
                {profile?.is_email_verified && (
                  <span className="spf-verified-badge">
                    <FiCheckCircle size={12} /> Verified
                  </span>
                )}
              </div>
              <div className="spf-meta-row">
                <span className="spf-meta-item">
                  <FiShield size={13} /> {isIndividual ? 'Individual Sponsor' : 'Corporate Sponsor'}
                </span>
                {profile?.location && (
                  <>
                    <span className="spf-meta-divider">•</span>
                    <span className="spf-meta-item">
                      <FiMapPin size={13} /> {profile.location}
                    </span>
                  </>
                )}
                <span className="spf-meta-divider">•</span>
                <span className="spf-meta-item">
                  <FiCalendar size={13} /> Joined {joinedDate}
                </span>
              </div>
              {avatarError && <p className="spf-inline-error">{avatarError}</p>}
              {isUploadingAvatar && <p className="spf-inline-hint">Uploading photo...</p>}
            </div>

            <button className="spf-edit-btn" onClick={() => navigate('/sponsor/settings')}>
              <FiEdit2 size={14} /> Edit Profile
            </button>
          </div>

          {/* Contact info */}
          <div className="spf-section-card">
            <h3 className="spf-section-title">Contact Information</h3>
            <div className="spf-detail-grid">
              <div className="spf-detail-row">
                <span className="spf-detail-label"><FiMail size={13} /> Email</span>
                <span className="spf-detail-val">{profile?.email || '—'}</span>
              </div>
              <div className="spf-detail-row">
                <span className="spf-detail-label"><FiPhone size={13} /> Phone</span>
                <span className="spf-detail-val">{profile?.phone_number || '—'}</span>
              </div>

              {/* Username — inline editable */}
              <div className="spf-detail-row">
                <span className="spf-detail-label"><FiAtSign size={13} /> Username</span>
                {isEditingUsername ? (
                  <div className="spf-username-edit">
                    <input
                      className={`spf-username-input ${usernameError ? 'spf-username-input-error' : ''}`}
                      type="text"
                      value={usernameDraft}
                      maxLength={14}
                      placeholder="e.g. jane_kintu"
                      onChange={(e) => {
                        setUsernameDraft(e.target.value);
                        setUsernameError('');
                      }}
                      autoFocus
                    />
                    <button
                      className="spf-username-btn spf-username-save"
                      onClick={saveUsername}
                      disabled={isSavingUsername}
                      title="Save"
                    >
                      <FiCheck size={14} />
                    </button>
                    <button
                      className="spf-username-btn spf-username-cancel"
                      onClick={cancelEditingUsername}
                      disabled={isSavingUsername}
                      title="Cancel"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="spf-detail-val spf-detail-editable" onClick={startEditingUsername}>
                    {profile?.username ? `@${profile.username}` : 'Set a username'}
                    <FiEdit2 size={11} className="spf-detail-edit-icon" />
                  </span>
                )}
                {usernameError && <p className="spf-inline-error">{usernameError}</p>}
                {isEditingUsername && !usernameError && (
                  <p className="spf-inline-hint">4–14 characters: letters, numbers, or # $ _ @</p>
                )}
              </div>

              <div className="spf-detail-row">
                <span className="spf-detail-label"><FiMapPin size={13} /> Location</span>
                <span className="spf-detail-val">{profile?.location || '—'}</span>
              </div>
            </div>
          </div>

          {/* Sponsor accounts */}
          <div className="spf-section-card">
            <h3 className="spf-section-title">
              {isIndividual ? 'Sponsorship Account' : 'Company Account'}
            </h3>

            {sponsorAccounts.length === 0 ? (
              <div className="spf-empty-account">
                <p>You don't have a sponsor account yet.</p>
                <button
                  className="spf-become-btn"
                  onClick={() => navigate('/sponsorhub')}
                >
                  Become a Sponsor
                </button>
              </div>
            ) : (
              sponsorAccounts.map((account) => {
                const status = statusConfig[account.status] ?? statusConfig.PENDING;
                const StatusIcon = status.icon;
                return (
                  <div key={account.id} className="spf-account-row">
                    <div className="spf-account-info">
                      <div className="spf-account-name-row">
                        <span className="spf-account-name">{account.name}</span>
                        <span className={`spf-status-badge ${status.className}`}>
                          <StatusIcon size={11} /> {status.label}
                        </span>
                      </div>
                      <div className="spf-account-type">{account.sponsor_type_display}</div>
                    </div>
                    <div className="spf-account-detail-grid">
                      <div className="spf-account-detail">
                        <span className="spf-account-detail-label">Registration Country</span>
                        <span className="spf-account-detail-val">{account.registration_country}</span>
                      </div>
                      {!isIndividual && (
                        <>
                          <div className="spf-account-detail">
                            <span className="spf-account-detail-label">BRN</span>
                            <span className="spf-account-detail-val">{account.brn || '—'}</span>
                          </div>
                          <div className="spf-account-detail">
                            <span className="spf-account-detail-label">TIN</span>
                            <span className="spf-account-detail-val">{account.tin || '—'}</span>
                          </div>
                          <div className="spf-account-detail">
                            <span className="spf-account-detail-label">Team Members</span>
                            <span className="spf-account-detail-val">{account.member_count}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Account security */}
          <div className="spf-section-card">
            <h3 className="spf-section-title">Account Security</h3>
            <div className="spf-security-row">
              <div>
                <div className="spf-security-label">Email Verification</div>
                <div className="spf-security-desc">
                  {profile?.is_email_verified ? 'Your email is verified.' : 'Your email is not yet verified.'}
                </div>
              </div>
              <span className={`spf-status-badge ${profile?.is_email_verified ? 'spf-status-approved' : 'spf-status-pending'}`}>
                {profile?.is_email_verified ? <FiCheckCircle size={11} /> : <FiClock size={11} />}
                {profile?.is_email_verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <div className="spf-security-row">
              <div>
                <div className="spf-security-label">Phone Verification</div>
                <div className="spf-security-desc">
                  {profile?.is_phone_verified ? 'Your phone number is verified.' : 'Your phone number is not yet verified.'}
                </div>
              </div>
              <span className={`spf-status-badge ${profile?.is_phone_verified ? 'spf-status-approved' : 'spf-status-pending'}`}>
                {profile?.is_phone_verified ? <FiCheckCircle size={11} /> : <FiClock size={11} />}
                {profile?.is_phone_verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
            <button className="spf-manage-security-btn" onClick={() => navigate('/sponsor/settings')}>
              Manage Security Settings
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}