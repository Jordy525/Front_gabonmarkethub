// Hook simple pour gérer les conversations

import { useState, useEffect, useCallback } from 'react';
import { useCurrentUser } from '@/hooks/api/useAuth';
import type { Conversation } from '@/types/messaging';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: currentUser } = useCurrentUser();

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentUser) {
        setConversations([]);
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des conversations');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setConversations(data.data);
      } else {
        setConversations([]);
      }

    } catch (error: any) {
      console.error('Erreur récupération conversations:', error);
      setError(error.message || 'Erreur lors de la récupération des conversations');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Charger les conversations au montage et quand l'utilisateur change
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Rafraîchir les conversations
  const refetch = useCallback(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Ajouter une nouvelle conversation
  const addConversation = useCallback((conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev]);
  }, []);

  // Mettre à jour une conversation
  const updateConversation = useCallback((conversationId: number, updates: Partial<Conversation>) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, ...updates }
          : conv
      )
    );
  }, []);

  // Supprimer une conversation
  const removeConversation = useCallback((conversationId: number) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
  }, []);

  // Marquer une conversation comme lue
  const markConversationAsRead = useCallback((conversationId: number) => {
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          if (currentUser?.role_id === 1) {
            return { ...conv, messages_non_lus_acheteur: 0 };
          } else if (currentUser?.role_id === 2) {
            return { ...conv, messages_non_lus_fournisseur: 0 };
          }
        }
        return conv;
      })
    );
  }, [currentUser?.role_id]);

  // Incrémenter le compteur de messages non lus
  const incrementUnreadCount = useCallback((conversationId: number, senderId: number) => {
    setConversations(prev => 
      prev.map(conv => {
        if (conv.id === conversationId) {
          // Ne pas incrémenter si c'est l'utilisateur actuel qui envoie
          if (senderId === currentUser?.id) {
            return conv;
          }

          if (currentUser?.role_id === 1 && senderId !== conv.acheteur_id) {
            return { ...conv, messages_non_lus_acheteur: (conv.messages_non_lus_acheteur || 0) + 1 };
          } else if (currentUser?.role_id === 2 && senderId !== conv.fournisseur_id) {
            return { ...conv, messages_non_lus_fournisseur: (conv.messages_non_lus_fournisseur || 0) + 1 };
          }
        }
        return conv;
      })
    );
  }, [currentUser?.id, currentUser?.role_id]);

  return {
    conversations,
    loading,
    error,
    refetch,
    addConversation,
    updateConversation,
    removeConversation,
    markConversationAsRead,
    incrementUnreadCount,
  };
};