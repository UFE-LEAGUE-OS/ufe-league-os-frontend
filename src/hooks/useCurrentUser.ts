import { useEffect, useMemo, useState } from 'react';
import { fetchProfile } from '../services/authService.js';
import { useAuthStore } from '../store/authStore.js';
import {
  currentUser as fallbackCurrentUser,
  mapProfileToCurrentUser,
  type BackendProfile,
} from '../data/currentUser.js';

export function useCurrentUser() {
  const authUser = useAuthStore((state) => state.user) as BackendProfile | null;
  const [profile, setProfile] = useState<BackendProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await fetchProfile();

        if (!active) return;

        setProfile(response.data as BackendProfile);
      } catch {
        if (!active) return;

        setErrorMessage('Could not load the latest profile details.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const currentUser = useMemo(() => {
    return mapProfileToCurrentUser(profile ?? authUser ?? null);
  }, [profile, authUser]);

  return {
    currentUser: currentUser ?? fallbackCurrentUser,
    profile: profile ?? authUser,
    isLoading,
    errorMessage,
  };
}
