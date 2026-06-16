import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProfile, removeAvatar, updateProfile } from '../../services/authService.js';
import { useAuthStore } from '../../store/authStore.js';
import {
  GlassCard,
  PageShell,
  SectionTitle,
  StatCard,
  Tag,
  TopNav,
} from '../../components/site/LeagueUI.js';
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const badges = useMemo(() => ['Verified fan', 'Premium alerts', 'Match-day regular'], []);

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
        setFirstName(data.first_name ?? '');
        setLastName(data.last_name ?? '');
        setPhoneNumber(data.phone_number ?? '');
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
      const payload =
        avatarFile !== null
          ? (() => {
              const formData = new FormData();
              formData.append('first_name', firstName);
              formData.append('last_name', lastName);
              formData.append('phone_number', phoneNumber);
              formData.append('avatar', avatarFile);
              return formData;
            })()
          : {
              first_name: firstName,
              last_name: lastName,
              phone_number: phoneNumber,
            };

      const response = await updateProfile(payload);
      const updatedProfile = response.data?.user as ProfileData | undefined;

      if (updatedProfile) {
        setProfile(updatedProfile);
        setFirstName(updatedProfile.first_name ?? '');
        setLastName(updatedProfile.last_name ?? '');
        setPhoneNumber(updatedProfile.phone_number ?? '');
      }

      setAvatarFile(null);
      setStatusMessage('Profile updated successfully.');
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

  return (
    <PageShell className="profile-page">
      <TopNav compact />

      <main className="page profile-layout">
        <GlassCard className="profile-hero">
          <div className="profile-avatar">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile avatar"
                style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }}
              />
            ) : (
              initials
            )}
          </div>
          <div className="profile-copy">
            <p className="eyebrow">Fan profile</p>
            <h1>{profile?.full_name ?? 'Your profile'}</h1>
            <p>Track your clubs, keep your settings in sync, and build your fan identity inside League OS.</p>
            <div className="story-badges">
              {badges.map((badge) => (
                <Tag key={badge}>{badge}</Tag>
              ))}
            </div>
          </div>
        </GlassCard>

        <section className="dashboard-grid">
          <GlassCard className="content-card">
            <SectionTitle eyebrow="Account" title="Update your details" />

            {isLoading ? <p>Loading profile...</p> : null}
            {errorMessage ? (
              <p role="alert" style={{ color: '#ffd08a', fontWeight: 700 }}>
                {errorMessage}
              </p>
            ) : null}
            {statusMessage ? (
              <p role="status" aria-live="polite" style={{ color: '#c8ffd5', fontWeight: 700 }}>
                {statusMessage}
              </p>
            ) : null}

            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <label>
                First name
                <div className="field-shell">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                  />
                </div>
              </label>

              <label>
                Last name
                <div className="field-shell">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                  />
                </div>
              </label>

              <label>
                Phone number
                <div className="field-shell">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                  />
                </div>
              </label>

              <label>
                Avatar
                <div className="field-shell">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                </div>
              </label>

              <div className="story-badges">
                <button type="submit" className="login-submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={handleRemoveAvatar}
                  disabled={isRemovingAvatar}
                >
                  {isRemovingAvatar ? 'Removing...' : 'Remove Avatar'}
                </button>
              </div>
            </form>
          </GlassCard>

          <GlassCard className="content-card">
            <SectionTitle eyebrow="Season snapshot" title="Your fan activity" />
            <div className="stat-grid">
              <StatCard label="matches watched" value="36" hint="This season" />
              <StatCard label="comments posted" value="89" hint="Community activity" />
              <StatCard label="rewards claimed" value="7" hint="Across events" />
              <StatCard label="clubs followed" value="11" hint="Saved to profile" />
            </div>
          </GlassCard>
        </section>
      </main>
    </PageShell>
  );
}
