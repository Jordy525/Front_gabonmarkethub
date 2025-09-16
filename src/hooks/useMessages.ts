// Hook simple pour gérer les messages d'une conversation

import { useState, useEffect, useCallback } from 'react';
import { messagingApi } from '@/services/messagingApi';
import { useMessagingSocket } from './useMessagingSocket';
import type { Message } from '@/types/messaging';

export const useMessages = (conversationId: number | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Gestionnaires Socket.IO
  const socketHandlers = {
    onMessage: useCallback((newMessage: Message) => {
      // Ajouter le message seulement s'il appartient à cette conversation
      if (newMessage.conversation_id === conversationId) {
        setMessages(prev => {
          // Éviter les doublons
          if (prev.some(m => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
      }
    }, [conversationId])
  };

  const { isConnected, joinConversation, leaveConversation } = useMessagingSocket(socketHandlers);

  // Charger les messages
  const loadMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement messages conversation:', conversationId);
      const messagesData = await messagingApi.getMessages(conversationId);
      console.log('✅ Messages chargés:', messagesData.length);
      setMessages(messagesData);
      
      // Rejoindre la room Socket.IO
      if (isConnected) {
        joinConversation(conversationId);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
      console.error('❌ Erreur chargement messages:', err);
      
      // Vérifier si c'est une erreur de parsing JSON (HTML reçu)
      if (errorMessage.includes('Unexpected token')) {
        setError('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [conversationId, isConnected, joinConversation]);

  // Envoyer un message
  const sendMessage = useCallback(async (contenu: string) => {
    if (!conversationId || !contenu.trim()) return;

    try {
      setSending(true);
      setError(null);
      
      const newMessage = await messagingApi.sendMessage(conversationId, contenu.trim());
      
      // Le message sera ajouté via Socket.IO, pas besoin de l'ajouter manuellement
      console.log('✅ Message envoyé:', newMessage);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur d\'envoi';
      setError(errorMessage);
      console.error('Erreur envoi message:', err);
      throw err; // Re-throw pour que le composant puisse gérer l'erreur
    } finally {
      setSending(false);
    }
  }, [conversationId]);

  // Marquer comme lu
  const markAsRead = useCallback(async (messageIds?: number[]) => {
    if (!conversationId) return;

    try {
      const idsToMark = messageIds || messages
        .filter(m => !m.lu && m.expediteur_id !== getCurrentUserId())
        .map(m => m.id);
      
      if (idsToMark.length === 0) return;

      await messagingApi.markAsRead(conversationId, idsToMark);
      
      // Mettre à jour localement
      setMessages(prev => prev.map(m => 
        idsToMark.includes(m.id) ? { ...m, lu: true } : m
      ));
      
    } catch (err) {
      console.error('Erreur marquage lu:', err);
    }
  }, [conversationId, messages]);

  // Charger les messages quand la conversation change
  useEffect(() => {
    loadMessages();
    
    // Quitter l'ancienne room
    return () => {
      if (conversationId && isConnected) {
        leaveConversation(conversationId);
      }
    };
  }, [conversationId, loadMessages, isConnected, leaveConversation]);

  // Rejoindre la room quand la socket se connecte
  useEffect(() => {
    if (conversationId && isConnected) {
      joinConversation(conversationId);
    }
  }, [conversationId, isConnected, joinConversation]);

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    markAsRead,
    reload: loadMessages
  };
};

// Utilitaire pour récupérer l'ID utilisateur actuel
function getCurrentUserId(): number | null {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id;
    }
  } catch (error) {
    console.error('Erreur récupération user ID:', error);
  }
  return null;
}