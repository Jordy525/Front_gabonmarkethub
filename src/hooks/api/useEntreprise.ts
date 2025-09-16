import { useState, useCallback } from 'react';
import type { ApiResponse } from '@/types/api';

interface Entreprise {
  id: number;
  nom_entreprise: string;
  secteur_activite: string;
  description?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  logo_url?: string;
  utilisateur_id: number;
  created_at: string;
  updated_at: string;
}

interface UseEntrepriseReturn {
  entreprise: Entreprise | null;
  isLoading: boolean;
  error: string | null;
  fetchEntreprise: (id: number) => Promise<void>;
}

interface UseUpdateEntrepriseReturn {
  updateEntreprise: (id: number, data: Partial<Entreprise>) => Promise<ApiResponse>;
  isUpdating: boolean;
  error: string | null;
}

/**
 * Hook pour récupérer les données d'une entreprise
 */
export const useEntreprise = (entrepriseId?: number): UseEntrepriseReturn => {
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntreprise = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/entreprises/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<Entreprise> = await response.json();
      
      if (result.success && result.data) {
        setEntreprise(result.data);
      } else {
        throw new Error(result.error || 'Erreur lors de la récupération de l\'entreprise');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur récupération entreprise:', errorMessage);
      setError(errorMessage);
      setEntreprise(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Charger automatiquement si un ID est fourni
  useState(() => {
    if (entrepriseId) {
      fetchEntreprise(entrepriseId);
    }
  });

  return {
    entreprise,
    isLoading,
    error,
    fetchEntreprise
  };
};

/**
 * Hook pour mettre à jour une entreprise
 */
export const useUpdateEntreprise = (): UseUpdateEntrepriseReturn => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEntreprise = useCallback(async (id: number, data: Partial<Entreprise>): Promise<ApiResponse> => {
    try {
      setIsUpdating(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/entreprises/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour de l\'entreprise');
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur mise à jour entreprise:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    updateEntreprise,
    isUpdating,
    error
  };
};