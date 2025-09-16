import { useState, useEffect } from 'react';

interface ProfilePhotoData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  photo_profil: string | null;
}

interface UseProfilePhotoReturn {
  photoData: ProfilePhotoData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProfilePhoto = (userId?: number): UseProfilePhotoReturn => {
  const [photoData, setPhotoData] = useState<ProfilePhotoData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotoData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        // Pas d'erreur si pas de token, juste pas de données
        setPhotoData(null);
        setIsLoading(false);
        return;
      }

      const url = userId 
        ? `${import.meta.env.VITE_API_URL}/profile-photo/${userId}`
        : `${import.meta.env.VITE_API_URL}/profile-photo`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la récupération');
      }

      setPhotoData(result.data);

    } catch (error) {
      // Ne pas logger les erreurs d'authentification comme des erreurs
      if (error instanceof Error && !error.message.includes('Token d\'authentification manquant')) {
        console.error('Erreur récupération photo profil:', error);
      }
      setError(error instanceof Error ? error.message : 'Erreur lors de la récupération');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotoData();
  }, [userId]);

  return {
    photoData,
    isLoading,
    error,
    refetch: fetchPhotoData
  };
};
