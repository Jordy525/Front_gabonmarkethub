import { authUtils } from './api';
import { isDevelopmentMode } from '../config/constants';
import type { 
  RealtimeMessage, 
  TypingData, 
  UserStatusData, 
  MessageStatusUpdate,
  WebSocketOptions 
} from '../types/api';

export type WebSocketEventType = 'message' | 'typing' | 'read' | 'user_status' | 'conversation_update' | 'error';

export interface WebSocketEventHandlers {
  onMessage?: (message: RealtimeMessage) => void;
  onTyping?: (data: TypingData) => void;
  onUserStatus?: (data: UserStatusData) => void;
  onMessageStatus?: (data: MessageStatusUpdate) => void;
  onConversationUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private options: WebSocketOptions;
  private eventHandlers: WebSocketEventHandlers = {};
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isManuallyDisconnected = false;
  private joinedRooms: Set<string> = new Set();

  constructor(options: WebSocketOptions = {}) {
    // Pour Socket.IO, nous n'utilisons pas WebSocket directement
    // mais nous gardons cette structure pour la compatibilité
    this.url = import.meta.env.VITE_WS_URL || 'http://localhost:3001';
    
    this.options = {
      reconnect: true,
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...options
    };
  }

  async connect(): Promise<void> {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    // En mode développement, simuler une connexion réussie
    if (isDevelopmentMode) {
      console.log('Mode développement : simulation de connexion WebSocket');
      this.isConnecting = false;
      this.isManuallyDisconnected = false;
      this.reconnectAttempts = 0;
      
      // Simuler l'événement de connexion
      setTimeout(() => {
        this.eventHandlers.onConnect?.();
      }, 100);
      
      return;
    }

    const token = authUtils.getToken();
    if (!token) {
      throw new Error('Token d\'authentification requis pour la connexion WebSocket');
    }

    this.isConnecting = true;
    this.isManuallyDisconnected = false;

    try {
      this.ws = new WebSocket(`${this.url}?token=${encodeURIComponent(token)}`);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

      // Attendre la connexion ou l'erreur
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout de connexion WebSocket'));
        }, 10000);

        const originalOnOpen = this.ws!.onopen;
        const originalOnError = this.ws!.onerror;

        this.ws!.onopen = (event) => {
          clearTimeout(timeout);
          originalOnOpen?.(event);
          resolve();
        };

        this.ws!.onerror = (event) => {
          clearTimeout(timeout);
          originalOnError?.(event);
          reject(new Error('Erreur de connexion WebSocket'));
        };
      });
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  disconnect(): void {
    this.isManuallyDisconnected = true;
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Déconnexion manuelle');
      this.ws = null;
    }
    
    this.joinedRooms.clear();
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    if (isDevelopmentMode) {
      return !this.isManuallyDisconnected;
    }
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    if (isDevelopmentMode) {
      if (this.isConnecting) return 'connecting';
      if (this.isManuallyDisconnected) return 'disconnected';
      return 'connected';
    }
    
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'error';
    }
  }

  // Gestion des événements
  on(event: keyof WebSocketEventHandlers, handler: any): void {
    this.eventHandlers[event] = handler;
  }

  off(event: keyof WebSocketEventHandlers): void {
    delete this.eventHandlers[event];
  }

  // Méthodes pour rejoindre/quitter des salles de conversation
  joinConversation(conversationId: number): void {
    const room = `conversation_${conversationId}`;
    if (this.isConnected() && !this.joinedRooms.has(room)) {
      if (isDevelopmentMode) {
        console.log(`Mode développement : rejoindre la conversation ${conversationId}`);
        this.joinedRooms.add(room);
        return;
      }
      
      this.send({
        type: 'join_room',
        room,
        data: { conversation_id: conversationId }
      });
      this.joinedRooms.add(room);
    }
  }

  leaveConversation(conversationId: number): void {
    const room = `conversation_${conversationId}`;
    if (this.isConnected() && this.joinedRooms.has(room)) {
      if (isDevelopmentMode) {
        console.log(`Mode développement : quitter la conversation ${conversationId}`);
        this.joinedRooms.delete(room);
        return;
      }
      
      this.send({
        type: 'leave_room',
        room,
        data: { conversation_id: conversationId }
      });
      this.joinedRooms.delete(room);
    }
  }

  // Méthodes pour envoyer des messages
  sendMessage(conversationId: number, content: string, type: string = 'texte'): void {
    this.send({
      type: 'send_message',
      data: {
        conversation_id: conversationId,
        contenu: content,
        type
      }
    });
  }

  sendTypingIndicator(conversationId: number, isTyping: boolean): void {
    this.send({
      type: 'typing',
      data: {
        conversation_id: conversationId,
        is_typing: isTyping
      }
    });
  }

  markMessageAsRead(conversationId: number, messageId: number): void {
    this.send({
      type: 'mark_read',
      data: {
        conversation_id: conversationId,
        message_id: messageId
      }
    });
  }

  // Méthode générique pour envoyer des données
  private send(data: any): void {
    if (isDevelopmentMode) {
      console.log('Mode développement : envoi simulé WebSocket:', data);
      return;
    }
    
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      }));
    } else {
      console.warn('WebSocket non connecté, impossible d\'envoyer:', data);
    }
  }

  // Gestionnaires d'événements WebSocket
  private handleOpen(): void {
    console.log('WebSocket connecté');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    
    // Rejoindre les salles précédemment jointes
    this.joinedRooms.forEach(room => {
      const conversationId = parseInt(room.replace('conversation_', ''));
      if (!isNaN(conversationId)) {
        this.joinConversation(conversationId);
      }
    });

    // Démarrer le heartbeat
    this.startHeartbeat();
    
    this.eventHandlers.onConnect?.();
    
    if (this.reconnectAttempts > 0) {
      this.eventHandlers.onReconnect?.();
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: RealtimeMessage = JSON.parse(event.data);
      
      // Gérer les différents types de messages
      switch (message.type) {
        case 'message':
          this.eventHandlers.onMessage?.(message);
          break;
        case 'typing':
          this.eventHandlers.onTyping?.(message.data as TypingData);
          break;
        case 'user_status':
          this.eventHandlers.onUserStatus?.(message.data as UserStatusData);
          break;
        case 'read':
          this.eventHandlers.onMessageStatus?.(message.data as MessageStatusUpdate);
          break;
        case 'conversation_update':
          this.eventHandlers.onConversationUpdate?.(message.data);
          break;
        case 'pong':
          // Réponse au ping, ne rien faire
          break;
        default:
          console.log('Message WebSocket non géré:', message);
      }
    } catch (error) {
      console.error('Erreur lors du parsing du message WebSocket:', error);
      this.eventHandlers.onError?.(error as Error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket fermé:', event.code, event.reason);
    this.clearTimers();
    this.isConnecting = false;
    
    this.eventHandlers.onDisconnect?.();

    // Tentative de reconnexion si ce n'est pas une déconnexion manuelle
    if (!this.isManuallyDisconnected && this.options.reconnect) {
      this.attemptReconnect();
    }
  }

  private handleError(event: Event): void {
    console.error('Erreur WebSocket:', event);
    this.eventHandlers.onError?.(new Error('Erreur de connexion WebSocket'));
  }

  // Gestion de la reconnexion
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= (this.options.maxReconnectAttempts || 5)) {
      console.error('Nombre maximum de tentatives de reconnexion atteint');
      this.eventHandlers.onError?.(new Error('Impossible de se reconnecter au serveur'));
      return;
    }

    this.reconnectAttempts++;
    const delay = this.options.reconnectInterval! * Math.pow(2, this.reconnectAttempts - 1); // Backoff exponentiel
    
    console.log(`Tentative de reconnexion ${this.reconnectAttempts} dans ${delay}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Échec de la reconnexion:', error);
        this.attemptReconnect();
      });
    }, delay);
  }

  // Gestion du heartbeat
  private startHeartbeat(): void {
    if (this.options.heartbeatInterval && this.options.heartbeatInterval > 0) {
      this.heartbeatTimer = setInterval(() => {
        if (this.isConnected()) {
          this.send({ type: 'ping' });
        }
      }, this.options.heartbeatInterval);
    }
  }

  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// Instance singleton
export const webSocketService = new WebSocketService();