import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProfile, removeAvatar, updateProfile } from '../../services/authService.js';
import { useAuthStore } from '../../store/authStore.js';
import { GlassCard, PageShell, SectionTitle } from '../../components/site/LeagueUI.js';
import '../../styles/pages/profile.css';

type ProfileData = {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email?: string;
  avatar_url?: string | null;
  full_name?: string;
};

export default function Profile() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await fetchProfile();

        if (!active) {
          return;
        }

        const data = response.data as ProfileData;
        setProfile(data);
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;

        if (status === 401 || status === 403) {
          clearAuth();
          navigate('/login', {
            replace: true,
            state: {
              message: 'Please log in to view your profile.',
            },
          });
          return;
        }

        setErrorMessage('We could not load your profile right now. Please try again.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [clearAuth, navigate]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAvatarFile(event.target.files?.[0] ?? null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSaving(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      if (avatarFile === null) {
        setErrorMessage('Choose a profile picture before saving.');
        return;
      }

      const payload = new FormData();
      payload.append('avatar', avatarFile);

      const response = await updateProfile(payload);
      const updatedProfile = response.data?.user as ProfileData | undefined;

      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      setAvatarFile(null);
      setStatusMessage('Profile picture updated successfully.');
    } catch (error) {
      const responseData = (error as { response?: { data?: unknown } })?.response?.data;

      if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
        const messages = Object.values(responseData as Record<string, unknown>)
          .flatMap((value) => (Array.isArray(value) ? value : [value]))
          .filter((value): value is string => typeof value === 'string');

        if (messages.length > 0) {
          setErrorMessage(messages[0]);
          return;
        }
      }

      setErrorMessage('We could not update your profile right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsRemovingAvatar(true);
    setErrorMessage('');
    setStatusMessage('');

    try {
      const response = await removeAvatar();
      const updatedProfile = response.data?.user as ProfileData | undefined;

      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      setAvatarFile(null);
      setStatusMessage('Avatar removed successfully.');
    } catch {
      setErrorMessage('We could not remove your avatar right now. Please try again.');
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const initials = useMemo(() => {
    const sourceName =
      profile?.full_name ??
      [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ??
      'Fan';

    return sourceName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [profile]);

  const profileName = profile?.full_name ?? [profile?.first_name, profile?.last_name].filter(Boolean).join(' ');
  const displayName = profileName || 'Your profile';
  const email = profile?.email ?? 'Not provided';
  const phoneNumber = profile?.phone_number ?? 'Not provided';

  return (
    <PageShell className="profile-page">
      <main className="page profile-layout">
        <GlassCard className="content-card profile-picture-card">
          <Link to="/dashboard/fan" className="profile-back-button">
            <ArrowBackIcon />
            Back to dashboard
          </Link>

          <SectionTitle eyebrow="Profile" title="Update profile picture" />

          {isLoading ? <p className="profile-message">Loading profile...</p> : null}
          {errorMessage ? (
            <p className="profile-message profile-message-warn" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {statusMessage ? (
            <p className="profile-message profile-message-success" role="status" aria-live="polite">
              {statusMessage}
            </p>
          ) : null}

          <div className="profile-picture-layout">
            <div className="profile-avatar profile-avatar-large">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile avatar" />
              ) : (
                initials
              )}
            </div>

            <div className="profile-account-summary">
              <h1>{displayName}</h1>
              <div className="profile-details">
                <div>
                  <span>Email address</span>
                  <strong>{email}</strong>
                </div>
                <div>
                  <span>Phone number</span>
                  <strong>{phoneNumber}</strong>
                </div>
              </div>
            </div>
          </div>

          <form className="register-form profile-picture-form" onSubmit={handleSubmit} noValidate>
            <label>
              Profile picture
              <div className="field-shell">
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </div>
            </label>

            <div className="profile-actions">
              <button type="submit" className="login-submit" disabled={isSaving || avatarFile === null}>
                {isSaving ? 'Saving...' : 'Save picture'}
              </button>
              <button
                type="button"
                className="text-button"
                onClick={handleRemoveAvatar}
                disabled={isRemovingAvatar || !profile?.avatar_url}
              >
                {isRemovingAvatar ? 'Removing...' : 'Remove picture'}
              </button>
            </div>
          </form>
        </GlassCard>
      </main>
    </PageShell>
  );
}
