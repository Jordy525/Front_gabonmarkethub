// Fichier de compatibilité pour les types API
// Réexporte les types de messaging pour éviter les erreurs d'import

export type {
  User,
  Message,
  Conversation,
  TypingData,
  ApiResponse
} from './messaging';

// Types additionnels pour compatibilité
export interface AuthUser extends User {
  token?: string;
}

export interface LoginRequest {
  email: string;
  mot_de_passe: string;
}

export interface LoginResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}

export interface RealtimeMessage extends Message {}

export interface UserStatusData {
  user_id: number;
  status: 'online' | 'offline' | 'away' | 'busy';
  last_seen?: string;
  timestamp: string;
}

export interface MessageStatusUpdate {
  message_id: number;
  conversation_id: number;
  status: 'sent' | 'delivered' | 'read';
  user_id: number;
  timestamp: string;
}

export interface FileUploadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  size?: number;
  error?: string;
}

export interface Notification {
  id: number;
  utilisateur_id: number;
  titre: string;
  message: string;
  type: 'commande' | 'message' | 'promotion' | 'systeme';
  lu: boolean;
  created_at: string;
  url?: string;
  metadata?: any;
}

export interface ConversationFilters {
  status?: 'ouverte' | 'fermee';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateConversationExtendedRequest {
  fournisseur_id: number;
  produit_id?: number;
  sujet: string;
  message_initial?: string;
}

export interface Product {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  image_url?: string;
}

export interface Entreprise {
  id: number;
  nom_entreprise: string;
  secteur_activite?: string;
  description?: string;
  ville?: string;
  pays?: string;
}

export interface Order {
  id: number;
  acheteur_id: number;
  fournisseur_id: number;
  statut: string;
  total: number;
  created_at: string;
}