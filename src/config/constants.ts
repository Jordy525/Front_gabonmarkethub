// Configuration de l'environnement - Safe for client-side
const getNodeEnv = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV;
  }
  return 'development'; // Fallback pour le client
};

export const isDevelopment = getNodeEnv() === 'development';
export const isProduction = getNodeEnv() === 'production';
export const isTest = getNodeEnv() === 'test';

// Alias pour la compatibilité
export const isDevelopmentMode = isDevelopment;

// Mode debug
export const isDebugMode = isDevelopment || (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DEBUG === 'true');

// URLs de l'API - Utilisation des variables d'environnement uniquement
export const API_BASE_URL = import.meta.env.VITE_API_URL;
export const SOCKET_URL = import.meta.env.VITE_WS_URL;
export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Configuration Socket.IO
export const SOCKET_CONFIG = {
  transports: ['websocket'],
  timeout: 10000,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  maxReconnectionDelay: 10000,
  reconnectionDelayGrowthFactor: 1.5
} as const;

// Configuration de l'authentification
export const AUTH_CONFIG = {
  tokenKey: 'authToken',
  refreshTokenKey: 'refreshToken',
  tokenExpirationBuffer: 5 * 60 * 1000, // 5 minutes en millisecondes
} as const;

// Configuration des messages
export const MESSAGE_CONFIG = {
  maxLength: 5000,
  typingTimeout: 3000, // 3 secondes
  markAsReadDelay: 1000, // 1 seconde
  messageLoadLimit: 50,
  conversationLoadLimit: 20
} as const;

// Configuration des notifications
export const NOTIFICATION_CONFIG = {
  maxVisible: 5,
  autoHideDelay: 5000, // 5 secondes
  types: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
  }
} as const;

// Rôles utilisateur
export const USER_ROLES = {
  ACHETEUR: 1,
  FOURNISSEUR: 2,
  ADMIN: 3
} as const;

// Statuts des conversations
export const CONVERSATION_STATUS = {
  OUVERTE: 'ouverte',
  FERMEE: 'fermee'
} as const;

// Types de notifications
export const NOTIFICATION_TYPES = {
  COMMANDE: 'commande',
  MESSAGE: 'message',
  PROMOTION: 'promotion',
  SYSTEME: 'systeme'
} as const;

// Statuts des messages
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read'
} as const;

// Statuts des utilisateurs
export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away',
  BUSY: 'busy'
} as const;

// Configuration des fichiers
export const FILE_CONFIG = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  imageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
} as const;

// Configuration de la pagination
export const PAGINATION_CONFIG = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultPage: 1
} as const;

// Configuration du cache
export const CACHE_CONFIG = {
  userCacheDuration: 5 * 60 * 1000, // 5 minutes
  conversationCacheDuration: 2 * 60 * 1000, // 2 minutes
  messageCacheDuration: 1 * 60 * 1000, // 1 minute
} as const;

// Événements Socket.IO
export const SOCKET_EVENTS = {
  // Connexion
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Conversations
  JOIN_CONVERSATION: 'join_conversation',
  LEAVE_CONVERSATION: 'leave_conversation',
  USER_JOINED_CONVERSATION: 'user_joined_conversation',
  USER_LEFT_CONVERSATION: 'user_left_conversation',
  
  // Messages
  SEND_MESSAGE: 'send_message',
  NEW_MESSAGE: 'new_message',
  MESSAGE_RECEIVED: 'message_received',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGES_READ: 'messages_read',
  MARK_AS_READ: 'mark_as_read',
  
  // Typing
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',
  
  // Statuts
  USER_STATUS_CHANGE: 'user_status_change',
  MESSAGE_STATUS_UPDATE: 'message_status_update',
  
  // Notifications
  NEW_NOTIFICATION: 'new_notification',
  NOTIFICATION_READ: 'notification_read',
  
  // Debug
  DEBUG_INFO_REQUEST: 'debug_info_request',
  DEBUG_INFO_RESPONSE: 'debug_info_response'
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de réseau. Vérifiez votre connexion internet.',
  UNAUTHORIZED: 'Vous devez être connecté pour effectuer cette action.',
  FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires.',
  NOT_FOUND: 'Ressource non trouvée.',
  SERVER_ERROR: 'Erreur serveur. Veuillez réessayer plus tard.',
  VALIDATION_ERROR: 'Données invalides.',
  SOCKET_CONNECTION_ERROR: 'Impossible de se connecter au serveur temps réel.',
  MESSAGE_SEND_ERROR: 'Impossible d\'envoyer le message.',
  FILE_TOO_LARGE: 'Le fichier est trop volumineux.',
  FILE_TYPE_NOT_ALLOWED: 'Type de fichier non autorisé.'
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message envoyé avec succès',
  CONVERSATION_CREATED: 'Conversation créée avec succès',
  NOTIFICATION_MARKED_READ: 'Notification marquée comme lue',
  FILE_UPLOADED: 'Fichier téléchargé avec succès',
  SETTINGS_SAVED: 'Paramètres sauvegardés'
} as const;

// Configuration des logs
export const LOG_CONFIG = {
  enableConsoleLog: isDevelopment,
  enableSocketLog: isDevelopment,
  enableApiLog: isDevelopment,
  logLevel: isDevelopment ? 'debug' : 'error'
} as const;

// Fonction utilitaire pour construire l'URL d'une image
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // Si l'image est déjà une URL complète (http/https), la retourner telle quelle
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Sinon, construire l'URL complète avec le backend
  if (!BACKEND_BASE_URL) {
    console.error('VITE_BACKEND_URL n\'est pas définie dans les variables d\'environnement');
    return imagePath; // Retourner le chemin tel quel si pas de variable
  }
  
  return `${BACKEND_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};