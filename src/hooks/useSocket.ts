import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService, SocketEventHandlers } from '../services/socketService';
import type { 
  RealtimeMessage, 
  TypingData, 
  UserStatusData, 
  MessageStatusUpdate,
  WebSocketOptions 
} from '../types/api';

export interface UseSocketReturn {
  isConnected: boolean;
  connectionState: string;
  lastMessage: RealtimeMessage | null;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;
  sendTypingIndicator: (conversationId: number, isTyping: boolean) => void;
  markMessageAsRead: (conversationId: number, messageId: number) => void;
}

export const useSocket = (
  handlers?: Partial<SocketEventHandlers>,
  options?: WebSocketOptions
): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const handlersRef = useRef(handlers);

  // Mettre à jour les handlers sans déclencher de re-render
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  // Configuration des gestionnaires d'événements
  useEffect(() => {
    const eventHandlers: SocketEventHandlers = {
      onConnect: () => {
        setIsConnected(true);
        setConnectionState('connected');
        setError(null);
        handlersRef.current?.onConnect?.();
      },
      onDisconnect: () => {
        setIsConnected(false);
        setConnectionState('disconnected');
        handlersRef.current?.onDisconnect?.();
      },
      onReconnect: () => {
        setIsConnected(true);
        setConnectionState('connected');
        setError(null);
        handlersRef.current?.onReconnect?.();
      },
      onError: (err: Error) => {
        setError(err);
        setConnectionState('error');
        handlersRef.current?.onError?.(err);
      },
      onMessage: (message: RealtimeMessage) => {
        setLastMessage(message);
        
        // ✅ Notification pour les nouveaux messages
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification('Nouveau message', {
            body: message.contenu || 'Vous avez reçu un nouveau message',
            icon: '/favicon.ico',
            tag: `message-${message.id}`
          });
          
          // Fermer automatiquement après 5 secondes
          setTimeout(() => notification.close(), 5000);
        }
        
        handlersRef.current?.onMessage?.(message);
      },
      onTyping: (data: TypingData) => {
        handlersRef.current?.onTyping?.(data);
      },
      onUserStatus: (data: UserStatusData) => {
        handlersRef.current?.onUserStatus?.(data);
      },
      onMessageStatus: (data: MessageStatusUpdate) => {
        handlersRef.current?.onMessageStatus?.(data);
      },
      onConversationUpdate: (data: any) => {
        handlersRef.current?.onConversationUpdate?.(data);
      }
    };

    // Enregistrer les gestionnaires d'événements
    socketService.setEventHandlers(eventHandlers);

    // Pas besoin de nettoyer car on utilise un singleton
    return () => {
      // Le singleton persiste entre les composants
    };
  }, []);

  // Méthodes de connexion
  const connect = useCallback(async () => {
    try {
      setConnectionState('connecting');
      setError(null);
      await socketService.connect();
    } catch (err) {
      setError(err as Error);
      setConnectionState('error');
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  const joinConversation = useCallback((conversationId: number) => {
    socketService.joinConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: number) => {
    socketService.leaveConversation(conversationId);
  }, []);

  const sendTypingIndicator = useCallback((conversationId: number, isTyping: boolean) => {
    socketService.sendTypingIndicator(conversationId, isTyping);
  }, []);

  const markMessageAsRead = useCallback((conversationId: number, messageId: number) => {
    socketService.markMessageAsRead(conversationId, messageId);
  }, []);

  // Synchroniser l'état de connexion (CORRIGÉ: éviter les vérifications trop fréquentes)
  useEffect(() => {
    const checkConnectionState = () => {
      const currentState = socketService.state;
      const currentConnected = socketService.isConnected;
      
      // Mettre à jour seulement si l'état a changé
      setConnectionState(prevState => {
        if (prevState !== currentState) {
          console.log('🔄 État connexion changé:', prevState, '->', currentState);
          return currentState;
        }
        return prevState;
      });
      
      setIsConnected(prevConnected => {
        if (prevConnected !== currentConnected) {
          console.log('🔄 Connexion changée:', prevConnected, '->', currentConnected);
          return currentConnected;
        }
        return prevConnected;
      });
    };

    // Vérifier l'état initial une seule fois
    checkConnectionState();

    // Vérifier l'état moins fréquemment (toutes les 5 secondes au lieu de 1)
    const interval = setInterval(checkConnectionState, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []); // AUCUNE dépendance pour éviter les re-créations

  return {
    isConnected,
    connectionState,
    lastMessage,
    error,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    markMessageAsRead
  };
};