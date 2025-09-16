import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '@/services/socketService';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { isDebugMode } from '@/config/constants';
import type {
  RealtimeMessage,
  TypingData,
  UserStatusData,
  MessageStatusUpdate
} from '@/types/api';

export interface SocketConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectionAttempts: number;
  lastConnectedAt: Date | null;
}

export interface SocketEventHandlers {
  onMessage?: (message: RealtimeMessage) => void;
  onTyping?: (data: TypingData) => void;
  onUserStatus?: (data: UserStatusData) => void;
  onMessageStatus?: (data: MessageStatusUpdate) => void;
  onConversationUpdate?: (data: any) => void;
  onUserJoined?: (data: any) => void;
  onUserLeft?: (data: any) => void;
  onMessagesRead?: (data: any) => void;
  onMessageReceived?: (data: any) => void;
  onMessageDelivered?: (data: any) => void;
}

export interface UseSocketConnectionOptions {
  autoConnect?: boolean;
  reconnectOnUserChange?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  enableDebugLogs?: boolean;
}

export interface UseSocketConnectionReturn {
  // État de connexion
  connectionState: SocketConnectionState;

  // Méthodes de contrôle
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;

  // Méthodes de conversation
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;

  // Méthodes de typing
  startTyping: (conversationId: number) => void;
  stopTyping: (conversationId: number) => void;

  // Méthodes de messages
  markAsRead: (conversationId: number, messageIds?: number[]) => void;

  // Gestion des événements
  setEventHandlers: (handlers: SocketEventHandlers) => void;

  // Utilitaires
  isUserOnline: (userId: number) => boolean;
  getConnectionStats: () => any;
}

/**
 * Hook pour gérer la connexion Socket.IO et les événements temps réel
 */
export const useSocketConnection = (
  options: UseSocketConnectionOptions = {}
): UseSocketConnectionReturn => {
  const {
    autoConnect = true,
    reconnectOnUserChange = true,
    maxReconnectAttempts = 5,
    reconnectDelay = 2000,
    enableDebugLogs = isDebugMode
  } = options;

  const { data: currentUser } = useCurrentUser();

  const [connectionState, setConnectionState] = useState<SocketConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    connectionAttempts: 0,
    lastConnectedAt: null
  });

  const eventHandlersRef = useRef<SocketEventHandlers>({});
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const typingTimeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const onlineUsersRef = useRef<Set<number>>(new Set());

  // Logs de debug
  const debugLog = useCallback((message: string, data?: any) => {
    if (enableDebugLogs) {
      console.log(`🔌 [useSocketConnection] ${message}`, data || '');
    }
  }, [enableDebugLogs]);

  // Configurer les gestionnaires d'événements Socket.IO
  const setupSocketEventHandlers = useCallback(() => {
    socketService.setEventHandlers({
      onConnect: () => {
        debugLog('Connexion établie');
        setConnectionState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          lastConnectedAt: new Date()
        }));
      },

      onDisconnect: () => {
        debugLog('Déconnexion détectée');
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }));
      },

      onReconnect: () => {
        debugLog('Reconnexion réussie');
        setConnectionState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
          connectionAttempts: 0,
          lastConnectedAt: new Date()
        }));
      },

      onError: (error: any) => {
        debugLog('Erreur Socket.IO', error);
        setConnectionState(prev => ({
          ...prev,
          isConnecting: false,
          error: error.message || 'Erreur de connexion'
        }));
      },

      // Événements métier
      onMessage: (message: any) => {
        debugLog('Message reçu', { id: message.id, from: message.expediteur_id });
        eventHandlersRef.current.onMessage?.(message);
      },

      onTyping: (data: any) => {
        debugLog('Indicateur de frappe', { user: data.user_id, typing: data.is_typing });
        eventHandlersRef.current.onTyping?.(data);
      },

      onUserStatus: (data: any) => {
        debugLog('Statut utilisateur', data);

        // Mettre à jour le cache des utilisateurs en ligne
        if (data.status === 'online') {
          onlineUsersRef.current.add(data.user_id);
        } else {
          onlineUsersRef.current.delete(data.user_id);
        }

        eventHandlersRef.current.onUserStatus?.(data);
      },

      onMessageStatus: (data: any) => {
        debugLog('Statut de message', data);
        eventHandlersRef.current.onMessageStatus?.(data);
      },

      onConversationUpdate: (data: any) => {
        debugLog('Mise à jour de conversation', data);
        eventHandlersRef.current.onConversationUpdate?.(data);
      }
    });
  }, [debugLog]);

  // Configurer les événements Socket.IO étendus
  const setupExtendedEventHandlers = useCallback(() => {
    const socket = socketService.socket;
    if (!socket) return;

    // Événements de conversation
    socket.on('user_joined_conversation', (data: any) => {
      debugLog('Utilisateur rejoint conversation', data);
      eventHandlersRef.current.onUserJoined?.(data);
    });

    socket.on('user_left_conversation', (data: any) => {
      debugLog('Utilisateur quitte conversation', data);
      eventHandlersRef.current.onUserLeft?.(data);
    });

    // Événements de messages
    socket.on('message_received', (data: any) => {
      debugLog('Message reçu dans conversation', {
        conversationId: data.conversation_id,
        messageId: data.message?.id
      });
      eventHandlersRef.current.onMessageReceived?.(data);
    });

    socket.on('message_delivered', (data: any) => {
      debugLog('Message livré', data);
      eventHandlersRef.current.onMessageDelivered?.(data);
    });

    socket.on('messages_read', (data: any) => {
      debugLog('Messages lus', {
        conversationId: data.conversation_id,
        count: data.message_ids?.length
      });
      eventHandlersRef.current.onMessagesRead?.(data);
    });

    // Événements de typing améliorés
    socket.on('user_typing', (data: any) => {
      debugLog('Typing avancé', {
        user: data.user_name,
        typing: data.is_typing,
        conversation: data.conversation_id
      });
      eventHandlersRef.current.onTyping?.(data);
    });

    // Événements de debug
    socket.on('debug_info_response', (data: any) => {
      debugLog('Statistiques serveur', data);
    });

  }, [debugLog]);

  // Refs pour éviter les dépendances qui changent constamment
  const currentUserRef = useRef(currentUser);
  const maxReconnectAttemptsRef = useRef(maxReconnectAttempts);
  const reconnectDelayRef = useRef(reconnectDelay);
  const isConnectingRef = useRef(false);

  // Mettre à jour les refs sans causer de re-render
  useEffect(() => {
    currentUserRef.current = currentUser;
    maxReconnectAttemptsRef.current = maxReconnectAttempts;
    reconnectDelayRef.current = reconnectDelay;
  }, [currentUser, maxReconnectAttempts, reconnectDelay]);

  // Fonction de connexion CORRIGÉE avec backoff exponentiel
  const connect = useCallback(async () => {
    if (!currentUserRef.current) {
      debugLog('Pas d\'utilisateur connecté - connexion Socket.IO annulée');
      return;
    }

    if (isConnectingRef.current || socketService.isConnected) {
      debugLog('Connexion déjà en cours ou établie');
      return;
    }

    try {
      debugLog('Tentative de connexion Socket.IO', { userId: currentUserRef.current.id });

      isConnectingRef.current = true;
      setConnectionState(prev => ({
        ...prev,
        isConnecting: true,
        error: null,
        connectionAttempts: prev.connectionAttempts + 1
      }));

      setupSocketEventHandlers();
      await socketService.connect();
      setupExtendedEventHandlers();

      debugLog('Connexion Socket.IO réussie');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de connexion';
      debugLog('Échec de connexion Socket.IO', error);

      setConnectionState(prev => {
        const newState = {
          ...prev,
          isConnecting: false,
          error: errorMessage
        };

        // Programmer une reconnexion avec backoff exponentiel si on n'a pas atteint la limite
        if (prev.connectionAttempts < maxReconnectAttemptsRef.current) {
          // Backoff exponentiel : 2s, 4s, 8s, 16s, 32s
          const backoffDelay = Math.min(
            reconnectDelayRef.current * Math.pow(2, prev.connectionAttempts - 1),
            30000 // Max 30 secondes
          );
          
          debugLog(`Reconnexion programmée dans ${backoffDelay}ms (tentative ${prev.connectionAttempts})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, backoffDelay);
        } else {
          debugLog('Limite de reconnexions atteinte, arrêt des tentatives');
        }

        return newState;
      });
    } finally {
      isConnectingRef.current = false;
    }
  }, [setupSocketEventHandlers, setupExtendedEventHandlers, debugLog]); // SEULEMENT les fonctions stables

  // Fonction de déconnexion
  const disconnect = useCallback(() => {
    debugLog('Déconnexion Socket.IO demandée');

    // Annuler les timeouts de reconnexion
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Annuler les timeouts de typing
    typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    typingTimeoutsRef.current.clear();

    socketService.disconnect();

    setConnectionState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      connectionAttempts: 0
    }));
  }, [debugLog]);

  // Fonction de reconnexion
  const reconnect = useCallback(async () => {
    debugLog('Reconnexion manuelle demandée');
    disconnect();

    // Attendre un peu avant de reconnecter
    await new Promise(resolve => setTimeout(resolve, 1000));

    setConnectionState(prev => ({
      ...prev,
      connectionAttempts: 0,
      error: null
    }));

    await connect();
  }, [connect, disconnect, debugLog]);

  // Méthodes de conversation
  const joinConversation = useCallback((conversationId: number) => {
    debugLog('Rejoindre conversation', { conversationId });
    socketService.joinConversation(conversationId);
  }, [debugLog]);

  const leaveConversation = useCallback((conversationId: number) => {
    debugLog('Quitter conversation', { conversationId });
    socketService.leaveConversation(conversationId);
  }, [debugLog]);

  // Méthodes de typing avec debouncing
  const startTyping = useCallback((conversationId: number) => {
    debugLog('Commencer à taper', { conversationId });

    // Annuler le timeout précédent
    const existingTimeout = typingTimeoutsRef.current.get(conversationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    socketService.sendTypingIndicator(conversationId, true);

    // Auto-stop après 3 secondes
    const timeout = setTimeout(() => {
      stopTyping(conversationId);
    }, 3000);

    typingTimeoutsRef.current.set(conversationId, timeout);
  }, [debugLog]);

  const stopTyping = useCallback((conversationId: number) => {
    debugLog('Arrêter de taper', { conversationId });

    const timeout = typingTimeoutsRef.current.get(conversationId);
    if (timeout) {
      clearTimeout(timeout);
      typingTimeoutsRef.current.delete(conversationId);
    }

    socketService.sendTypingIndicator(conversationId, false);
  }, [debugLog]);

  // Méthode pour marquer comme lu
  const markAsRead = useCallback((conversationId: number, messageIds?: number[]) => {
    debugLog('Marquer comme lu', { conversationId, messageIds });

    if (messageIds && messageIds.length > 0) {
      messageIds.forEach(messageId => {
        socketService.markMessageAsRead(conversationId, messageId);
      });
    } else {
      // Marquer tous les messages comme lus
      socketService.markMessageAsRead(conversationId, 0);
    }
  }, [debugLog]);

  // Définir les gestionnaires d'événements
  const setEventHandlers = useCallback((handlers: SocketEventHandlers) => {
    debugLog('Mise à jour des gestionnaires d\'événements');
    eventHandlersRef.current = { ...eventHandlersRef.current, ...handlers };
  }, [debugLog]);

  // Vérifier si un utilisateur est en ligne
  const isUserOnline = useCallback((userId: number): boolean => {
    return onlineUsersRef.current.has(userId);
  }, []);

  // Obtenir les statistiques de connexion
  const getConnectionStats = useCallback(() => {
    const socket = socketService.socket;
    if (!socket) return null;

    return {
      connected: socketService.isConnected,
      transport: socket.io.engine?.transport?.name,
      connectionAttempts: connectionState.connectionAttempts,
      lastConnectedAt: connectionState.lastConnectedAt,
      onlineUsers: Array.from(onlineUsersRef.current)
    };
  }, [connectionState.connectionAttempts, connectionState.lastConnectedAt]);

  // Refs pour les options pour éviter les re-créations
  const autoConnectRef = useRef(autoConnect);
  const reconnectOnUserChangeRef = useRef(reconnectOnUserChange);
  const hasAutoConnectedRef = useRef(false);

  useEffect(() => {
    autoConnectRef.current = autoConnect;
    reconnectOnUserChangeRef.current = reconnectOnUserChange;
  }, [autoConnect, reconnectOnUserChange]);

  // Connexion automatique quand l'utilisateur change (CORRIGÉ)
  useEffect(() => {
    if (currentUser && autoConnectRef.current && !hasAutoConnectedRef.current) {
      debugLog('Utilisateur détecté - connexion automatique', { userId: currentUser.id });
      hasAutoConnectedRef.current = true;
      connect();
    }

    // Reset du flag si l'utilisateur change
    if (!currentUser) {
      hasAutoConnectedRef.current = false;
    }
  }, [currentUser]); // Seulement currentUser pour éviter les dépendances circulaires

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      debugLog('Nettoyage du hook useSocketConnection');

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      typingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutsRef.current.clear();

      // Déconnexion sans utiliser la fonction disconnect pour éviter les problèmes de dépendances
      socketService.disconnect();
    };
  }, []); // Pas de dépendances pour éviter les problèmes

  return {
    connectionState,
    connect,
    disconnect,
    reconnect,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    markAsRead,
    setEventHandlers,
    isUserOnline,
    getConnectionStats
  };
}