import { useState, useCallback, useRef } from 'react';
import { messageService } from '../services/messageService';
import type { Message } from '../types/api';

export interface OptimisticMessage extends Omit<Message, 'id' | 'created_at'> {
  id: string; // Temporary ID for optimistic messages
  created_at: string;
  status: 'sending' | 'sent' | 'error';
  error?: string;
  retryCount?: number;
}

export interface UseOptimisticMessagesOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export interface UseOptimisticMessagesReturn {
  messages: (Message | OptimisticMessage)[];
  sendingCount: number;
  errorCount: number;
  sendMessage: (content: string, type?: string, metadata?: any) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
  removeMessage: (messageId: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string | number, updates: Partial<Message | OptimisticMessage>) => void;
  setMessages: React.Dispatch<React.SetStateAction<(Message | OptimisticMessage)[]>>;
  clearErrors: () => void;
}

export const useOptimisticMessages = (
  conversationId: number,
  options: UseOptimisticMessagesOptions = {}
): UseOptimisticMessagesReturn => {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  
  const [messages, setMessages] = useState<(Message | OptimisticMessage)[]>([]);
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const currentUserId = useRef<number | null>(null);

  // Get current user ID from auth context or localStorage
  const getCurrentUserId = useCallback((): number => {
    if (currentUserId.current !== null) {
      return currentUserId.current;
    }
    
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        currentUserId.current = user.id;
        return user.id;
      }
    } catch (error) {
      console.error('Error getting current user ID:', error);
    }
    
    return 0; // Fallback
  }, []);

  // Generate unique temporary ID
  const generateTempId = useCallback((): string => {
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Check if message is optimistic (has temporary ID)
  const isOptimisticMessage = useCallback((message: Message | OptimisticMessage): message is OptimisticMessage => {
    return typeof message.id === 'string' && message.id.startsWith('temp-');
  }, []);

  // Count messages by status
  const sendingCount = messages.filter(msg => 
    isOptimisticMessage(msg) && msg.status === 'sending'
  ).length;

  const errorCount = messages.filter(msg => 
    isOptimisticMessage(msg) && msg.status === 'error'
  ).length;

  // Send message with optimistic update
  const sendMessage = useCallback(async (
    content: string,
    type: string = 'texte',
    metadata?: any
  ): Promise<void> => {
    if (!conversationId) {
      throw new Error('ID de conversation requis');
    }

    if (!content.trim()) {
      throw new Error('Le contenu du message ne peut pas être vide');
    }

    const tempId = generateTempId();
    const userId = getCurrentUserId();
    
    // Create optimistic message
    const optimisticMessage: OptimisticMessage = {
      id: tempId,
      conversation_id: conversationId,
      expediteur_id: userId,
      contenu: content.trim(),
      type: type as any,
      metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lu: false,
      status: 'sending',
      retryCount: 0,
      expediteur: null
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Send to server
      const serverMessage = await messageService.sendMessage(conversationId, {
        contenu: content.trim(),
        type: type as any,
        metadata
      });

      // Replace optimistic message with server response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? { ...serverMessage, status: 'sent' } : msg
        )
      );
    } catch (error) {
      // Mark message as error
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi du message';
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { 
                ...msg, 
                status: 'error' as const, 
                error: errorMessage,
                retryCount: (msg as OptimisticMessage).retryCount || 0
              }
            : msg
        )
      );

      // Auto-retry if under max retries
      const currentMessage = messages.find(msg => msg.id === tempId) as OptimisticMessage;
      const retryCount = currentMessage?.retryCount || 0;
      
      if (retryCount < maxRetries) {
        const timeout = setTimeout(() => {
          retryMessage(tempId);
        }, retryDelay * Math.pow(2, retryCount)); // Exponential backoff
        
        retryTimeouts.current.set(tempId, timeout);
      }

      console.error('Erreur lors de l\'envoi du message:', error);
    }
  }, [conversationId, generateTempId, getCurrentUserId, maxRetries, retryDelay, messages]);

  // Retry failed message
  const retryMessage = useCallback(async (messageId: string): Promise<void> => {
    const message = messages.find(msg => msg.id === messageId) as OptimisticMessage;
    
    if (!message || !isOptimisticMessage(message)) {
      console.warn('Message non trouvé pour retry:', messageId);
      return;
    }

    // Clear existing retry timeout
    const existingTimeout = retryTimeouts.current.get(messageId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      retryTimeouts.current.delete(messageId);
    }

    // Update retry count and status
    const newRetryCount = (message.retryCount || 0) + 1;
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              status: 'sending' as const, 
              error: undefined,
              retryCount: newRetryCount
            }
          : msg
      )
    );

    try {
      // Retry sending to server
      const serverMessage = await messageService.sendMessage(conversationId, {
        contenu: message.contenu,
        type: message.type,
        metadata: message.metadata
      });

      // Replace with server response
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...serverMessage, status: 'sent' } : msg
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du retry';
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                status: 'error' as const, 
                error: errorMessage,
                retryCount: newRetryCount
              }
            : msg
        )
      );

      // Schedule next retry if under max retries
      if (newRetryCount < maxRetries) {
        const timeout = setTimeout(() => {
          retryMessage(messageId);
        }, retryDelay * Math.pow(2, newRetryCount));
        
        retryTimeouts.current.set(messageId, timeout);
      }

      console.error('Erreur lors du retry du message:', error);
    }
  }, [messages, isOptimisticMessage, conversationId, maxRetries, retryDelay]);

  // Remove message (for failed messages that user wants to discard)
  const removeMessage = useCallback((messageId: string) => {
    // Clear retry timeout if exists
    const existingTimeout = retryTimeouts.current.get(messageId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      retryTimeouts.current.delete(messageId);
    }

    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  // Add message (for real-time updates from server)
  const addMessage = useCallback((message: Message) => {
    if (!message || !message.id || !message.created_at || message.expediteur_id === undefined) {
      console.warn('Message invalide ignoré dans addMessage:', message);
      return;
    }

    setMessages(prev => {
      // Check if message already exists
      const exists = prev.some(msg => 
        (typeof msg.id === 'number' && msg.id === message.id) ||
        (typeof msg.id === 'string' && msg.id === message.id.toString())
      );
      
      if (exists) {
        // Update existing message
        return prev.map(msg => 
          (typeof msg.id === 'number' && msg.id === message.id) ||
          (typeof msg.id === 'string' && msg.id === message.id.toString())
            ? { ...message, status: 'sent' }
            : msg
        );
      } else {
        // Add new message
        return [...prev, { ...message, status: 'sent' }];
      }
    });
  }, []);

  // Update message
  const updateMessage = useCallback((
    messageId: string | number, 
    updates: Partial<Message | OptimisticMessage>
  ) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, ...updates }
          : msg
      )
    );
  }, []);

  // Clear all error messages
  const clearErrors = useCallback(() => {
    setMessages(prev => prev.filter(msg => 
      !isOptimisticMessage(msg) || msg.status !== 'error'
    ));
    
    // Clear all retry timeouts
    retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
    retryTimeouts.current.clear();
  }, [isOptimisticMessage]);

  // Cleanup timeouts on unmount
  const cleanup = useCallback(() => {
    retryTimeouts.current.forEach(timeout => clearTimeout(timeout));
    retryTimeouts.current.clear();
  }, []);

  // Return hook interface
  return {
    messages,
    sendingCount,
    errorCount,
    sendMessage,
    retryMessage,
    removeMessage,
    addMessage,
    updateMessage,
    setMessages,
    clearErrors
  };
};

export default useOptimisticMessages;