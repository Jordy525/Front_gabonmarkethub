// Hook Socket.IO simple et centralisé - UNE SEULE CONNEXION

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Message, TypingData } from '@/types/messaging';

interface SocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

interface SocketHandlers {
  onMessage?: (message: Message) => void;
  onTyping?: (data: TypingData) => void;
}

export const useMessagingSocket = (handlers: SocketHandlers = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    isConnecting: false,
    error: null
  });

  // Mettre à jour les handlers sans déclencher de re-rendu
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  // Connexion Socket.IO
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    const token = localStorage.getItem('authToken');
    if (!token) {
      setState(prev => ({ ...prev, isConnecting: false, error: 'Token manquant' }));
      return;
    }

    console.log('🔌 Tentative de connexion Socket.IO...');
    
    // Utiliser l'URL complète du backend pour Socket.IO
    const socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 10000, // Augmenter le timeout
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connecté');
      setState({ isConnected: true, isConnecting: false, error: null });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket déconnecté');
      setState(prev => ({ ...prev, isConnected: false }));
    });

    socket.on('connect_error', (error) => {
      console.error('🚨 Erreur Socket:', error);
      setState({ isConnected: false, isConnecting: false, error: error.message });
    });

    // Événements métier
    socket.on('message:new', (message: Message) => {
      console.log('📨 Nouveau message:', message);
      handlersRef.current.onMessage?.(message);
    });

    socket.on('typing:start', (data: TypingData) => {
      console.log('⌨️ Frappe démarrée:', data);
      handlersRef.current.onTyping?.({ ...data, is_typing: true });
    });

    socket.on('typing:stop', (data: TypingData) => {
      console.log('⌨️ Frappe arrêtée:', data);
      handlersRef.current.onTyping?.({ ...data, is_typing: false });
    });

    socketRef.current = socket;
  }, []); // Plus de dépendance sur handlers

  // Déconnexion
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setState({ isConnected: false, isConnecting: false, error: null });
    }
  }, []);

  // Actions Socket
  const joinConversation = useCallback((conversationId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('conversation:join', conversationId);
      console.log('🏠 Rejoint conversation:', conversationId);
    }
  }, []);

  const leaveConversation = useCallback((conversationId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('conversation:leave', conversationId);
      console.log('🚪 Quitté conversation:', conversationId);
    }
  }, []);

  const startTyping = useCallback((conversationId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:start', { conversation_id: conversationId });
    }
  }, []);

  const stopTyping = useCallback((conversationId: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing:stop', { conversation_id: conversationId });
    }
  }, []);

  // Connexion automatique - SEULEMENT au montage/démontage
  useEffect(() => {
    connect();
    return () => disconnect();
  }, []); // Dépendances vides pour éviter la boucle

  return {
    ...state,
    connect,
    disconnect,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping
  };
};