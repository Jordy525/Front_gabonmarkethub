import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '@/types/api';
import { apiClient } from '@/services/api';

/**
 * Hook pour récupérer le nombre de messages non lus
 */
export const useUnreadCount = () => {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        setCount(0);
        setIsLoading(false);
        return;
      }

      // Utiliser l'endpoint des conversations pour calculer les messages non lus
      const result = await apiClient.get('/conversations');
      const conversations = result?.data || result || [];
      
      // Calculer le nombre total de messages non lus
      const totalUnreadCount = conversations.reduce((total: number, conv: any) => {
        return total + (conv.messages_non_lus_acheteur || 0) + (conv.messages_non_lus_fournisseur || 0);
      }, 0);
      
      setCount(totalUnreadCount);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur récupération compteur messages:', errorMessage);
      
      // Retry automatique pour les erreurs de réseau (max 2 tentatives)
      if (retryCount < 2 && (
        errorMessage.includes('connexion') || 
        errorMessage.includes('timeout') || 
        errorMessage.includes('réseau')
      )) {
        console.log(`Tentative de reconnexion ${retryCount + 1}/2...`);
        setTimeout(() => fetchUnreadCount(retryCount + 1), 2000);
        return;
      }
      
      setError(errorMessage);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    count,
    isLoading,
    error,
    refetch: fetchUnreadCount
  };
};