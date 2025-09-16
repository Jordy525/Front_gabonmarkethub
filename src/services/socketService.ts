import { io, Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_CONFIG, AUTH_CONFIG } from '@/config/constants';

interface SocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
  onError?: (error: any) => void;
  onMessage?: (message: any) => void;
  onTyping?: (data: any) => void;
  onUserStatus?: (data: any) => void;
  onMessageStatus?: (data: any) => void;
  onConversationUpdate?: (data: any) => void;
}

class SocketService {
  public socket: Socket | null = null;
  private eventHandlers: SocketEventHandlers = {};
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  /**
   * Vérifier si le socket est connecté
   */
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Configurer les gestionnaires d'événements
   */
  setEventHandlers(handlers: SocketEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Se connecter au serveur Socket.IO
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        setTimeout(() => {
          if (this.isConnected) {
            resolve();
          } else {
            reject(new Error('Timeout de connexion'));
          }
        }, 10000);
        return;
      }

      this.isConnecting = true;

      // Récupérer le token depuis localStorage avec la clé centralisée
      const token = localStorage.getItem(AUTH_CONFIG.tokenKey) || '';
      
      this.socket = io(SOCKET_URL, {
        auth: { token },
        ...SOCKET_CONFIG
      });

      // Événements de connexion
      this.socket.on('connect', () => {
        console.log('✅ Socket.IO connecté:', this.socket?.id);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.eventHandlers.onConnect?.();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erreur connexion Socket.IO:', error);
        this.isConnecting = false;
        this.eventHandlers.onError?.(error);
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            this.connect().then(resolve).catch(reject);
          }, this.reconnectDelay * this.reconnectAttempts);
        } else {
          reject(error);
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('👋 Socket.IO déconnecté:', reason);
        this.isConnecting = false;
        this.eventHandlers.onDisconnect?.();
      });

      this.socket.on('reconnect', () => {
        console.log('🔄 Socket.IO reconnecté');
        this.reconnectAttempts = 0;
        this.eventHandlers.onReconnect?.();
      });

      // Événements métier
      this.socket.on('new_message', (message) => {
        this.eventHandlers.onMessage?.(message);
      });

      this.socket.on('user_typing', (data) => {
        this.eventHandlers.onTyping?.(data);
      });

      this.socket.on('user_stopped_typing', (data) => {
        this.eventHandlers.onTyping?.({ ...data, is_typing: false });
      });

      this.socket.on('user_status_change', (data) => {
        this.eventHandlers.onUserStatus?.(data);
      });

      this.socket.on('message_status_update', (data) => {
        this.eventHandlers.onMessageStatus?.(data);
      });

      this.socket.on('conversation_updated', (data) => {
        this.eventHandlers.onConversationUpdate?.(data);
      });

      // Timeout de sécurité
      setTimeout(() => {
        if (this.isConnecting) {
          this.isConnecting = false;
          reject(new Error('Timeout de connexion Socket.IO'));
        }
      }, 15000);
    });
  }

  /**
   * Se déconnecter du serveur
   */
  disconnect(): void {
    if (this.socket) {
      console.log('👋 Déconnexion Socket.IO...');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  /**
   * Rejoindre une conversation
   */
  joinConversation(conversationId: number): void {
    if (!this.isConnected) {
      console.warn('⚠️ Socket non connecté pour rejoindre la conversation');
      return;
    }

    console.log('🏠 Rejoindre conversation:', conversationId);
    this.socket?.emit('join_conversation', { conversation_id: conversationId });
  }

  /**
   * Quitter une conversation
   */
  leaveConversation(conversationId: number): void {
    if (!this.isConnected) return;

    console.log('🚪 Quitter conversation:', conversationId);
    this.socket?.emit('leave_conversation', { conversation_id: conversationId });
  }

  /**
   * Envoyer un message
   */
  sendMessage(conversationId: number, content: string): void {
    if (!this.isConnected) {
      console.warn('⚠️ Socket non connecté pour envoyer le message');
      return;
    }

    this.socket?.emit('send_message', {
      conversation_id: conversationId,
      contenu: content
    });
  }

  /**
   * Envoyer un indicateur de frappe
   */
  sendTypingIndicator(conversationId: number, isTyping: boolean): void {
    if (!this.isConnected) return;

    const event = isTyping ? 'typing_start' : 'typing_stop';
    this.socket?.emit(event, { conversation_id: conversationId });
  }

  /**
   * Marquer un message comme lu
   */
  markMessageAsRead(conversationId: number, messageId: number): void {
    if (!this.isConnected) return;

    this.socket?.emit('mark_as_read', {
      conversation_id: conversationId,
      message_id: messageId
    });
  }

  /**
   * Demander les statistiques de debug
   */
  requestDebugInfo(): void {
    if (!this.isConnected) return;

    this.socket?.emit('debug_info_request');
  }
}

// Instance singleton
export const socketService = new SocketService();
export default socketService;