import { useState, useEffect, useCallback, useRef } from 'react';
import { webSocketService, WebSocketEventHandlers } from '../services/webSocketService';
import type { 
  RealtimeMessage, 
  TypingData, 
  UserStatusData, 
  MessageStatusUpdate,
  WebSocketOptions 
} from '../types/api';

export interface UseWebSocketReturn {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: RealtimeMessage | null;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (conversationId: number, content: string, type?: string) => void;
  joinConversation: (conversationId: number) => void;
  leaveConversation: (conversationId: number) => void;
  sendTypingIndicator: (conversationId: number, isTyping: boolean) => void;
  markMessageAsRead: (conversationId: number, messageId: number) => void;
}

export const useWebSocket = (
  handlers?: Partial<WebSocketEventHandlers>,
  options?: WebSocketOptions
): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const handlersRef = useRef(handlers);

  // Mettre à jour les handlers sans déclencher de re-render
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  // Configuration des gestionnaires d'événements
  useEffect(() => {
    const eventHandlers: WebSocketEventHandlers = {
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
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      webSocketService.on(event as keyof WebSocketEventHandlers, handler);
    });

    // Nettoyer les gestionnaires lors du démontage
    return () => {
      Object.keys(eventHandlers).forEach(event => {
        webSocketService.off(event as keyof WebSocketEventHandlers);
      });
    };
  }, []);

  // Méthodes de connexion
  const connect = useCallback(async () => {
    try {
      setConnectionState('connecting');
      setError(null);
      await webSocketService.connect();
    } catch (err) {
      setError(err as Error);
      setConnectionState('error');
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  // Méthodes d'envoi de messages
  const sendMessage = useCallback((conversationId: number, content: string, type: string = 'texte') => {
    webSocketService.sendMessage(conversationId, content, type);
  }, []);

  const joinConversation = useCallback((conversationId: number) => {
    webSocketService.joinConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: number) => {
    webSocketService.leaveConversation(conversationId);
  }, []);

  const sendTypingIndicator = useCallback((conversationId: number, isTyping: boolean) => {
    webSocketService.sendTypingIndicator(conversationId, isTyping);
  }, []);

  const markMessageAsRead = useCallback((conversationId: number, messageId: number) => {
    webSocketService.markMessageAsRead(conversationId, messageId);
  }, []);

  // Synchroniser l'état de connexion
  useEffect(() => {
    const checkConnectionState = () => {
      const state = webSocketService.getConnectionState();
      setConnectionState(state);
      setIsConnected(state === 'connected');
    };

    // Vérifier l'état initial
    checkConnectionState();

    // Vérifier périodiquement l'état de connexion
    const interval = setInterval(checkConnectionState, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    connectionState,
    lastMessage,
    error,
    connect,
    disconnect,
    sendMessage,
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    markMessageAsRead
  };
};