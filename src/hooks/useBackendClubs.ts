import { useEffect, useState } from 'react';
import { fetchPublicClubs, type BackendClub } from '../services/membershipService.js';

export function useBackendClubs() {
  const [clubs, setClubs] = useState<BackendClub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadClubs() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await fetchPublicClubs();

        if (!active) return;

        setClubs(response.data);
      } catch {
        if (!active) return;

        setErrorMessage('Could not load backend clubs. Showing local membership catalogue.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadClubs();

    return () => {
      active = false;
    };
  }, []);

  return {
    clubs,
    isLoading,
    errorMessage,
  };
}
