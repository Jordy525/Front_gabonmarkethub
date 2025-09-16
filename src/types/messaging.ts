// Types unifiés pour la messagerie - SIMPLE ET CLAIR

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role_id: number;
}

export interface Message {
  id: number;
  conversation_id: number;
  expediteur_id: number;
  contenu: string;
  created_at: string;
  lu: boolean;
  expediteur?: User;
}

export interface Conversation {
  id: number;
  acheteur_id: number;
  fournisseur_id: number;
  sujet: string;
  statut: 'ouverte' | 'fermee';
  created_at: string;
  updated_at: string;
  derniere_activite?: string;
  messages_non_lus_acheteur?: number;
  messages_non_lus_fournisseur?: number;
  
  // Données dénormalisées pour l'affichage
  nom_entreprise?: string;
  fournisseur_nom?: string;
  fournisseur_prenom?: string;
  acheteur_nom?: string;
  acheteur_prenom?: string;
  dernier_message?: string;
}

export interface TypingData {
  user_id: number;
  conversation_id: number;
  is_typing: boolean;
  user_name?: string;
}

export interface SocketEvents {
  'message:new': (message: Message) => void;
  'typing:start': (data: TypingData) => void;
  'typing:stop': (data: TypingData) => void;
  'conversation:join': (conversationId: number) => void;
  'conversation:leave': (conversationId: number) => void;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}