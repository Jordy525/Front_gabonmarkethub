import { apiClient } from './api';
import type { Conversation, CreateConversationExtendedRequest } from '@/types/api';

export interface FindOrCreateConversationRequest {
  acheteur_id: number;
  fournisseur_id: number;
  produit_id?: number;
  sujet?: string;
}

export interface FindOrCreateConversationResponse {
  conversation: Conversation;
  isNew: boolean;
}

export class ConversationService {
  /**
   * Trouve une conversation existante ou en crée une nouvelle
   * Cette fonction centralise la logique pour éviter les doublons
   */
  async findOrCreateConversation(data: FindOrCreateConversationRequest): Promise<FindOrCreateConversationResponse> {
    console.log('🔍 SERVICE - Recherche ou création conversation:', data);
    
    try {
      const response = await apiClient.post<FindOrCreateConversationResponse>('/conversations/find-or-create', data);
      
      console.log('✅ SERVICE - Conversation trouvée/créée:', {
        conversationId: response.conversation?.id,
        isNew: response.isNew,
        sujet: response.conversation?.sujet
      });
      
      return response;
    } catch (error) {
      console.error('❌ SERVICE - Erreur find-or-create:', error);
      throw error;
    }
  }

  /**
   * Ouvre une conversation avec un fournisseur depuis un produit
   */
  async openConversationFromProduct(
    fournisseurId: number, 
    produitId: number, 
    sujet?: string
  ): Promise<Conversation> {
    const response = await this.findOrCreateConversation({
      acheteur_id: 0, // Sera rempli côté serveur avec l'utilisateur connecté
      fournisseur_id: fournisseurId,
      produit_id: produitId,
      sujet: sujet || `Demande concernant le produit #${produitId}`
    });
    
    return response.conversation;
  }

  /**
   * Ouvre une conversation directe avec un fournisseur
   */
  async openConversationWithSupplier(
    fournisseurId: number,
    sujet?: string
  ): Promise<Conversation> {
    const response = await this.findOrCreateConversation({
      acheteur_id: 0, // Sera rempli côté serveur avec l'utilisateur connecté
      fournisseur_id: fournisseurId,
      sujet: sujet || 'Demande de renseignements'
    });
    
    return response.conversation;
  }

  /**
   * Récupère toutes les conversations d'un utilisateur
   */
  async getUserConversations(userId: number): Promise<Conversation[]> {
    try {
      const response = await apiClient.get<{ conversations: Conversation[] }>(`/conversations/user/${userId}`);
      return response.conversations || [];
    } catch (error) {
      console.error('Erreur récupération conversations utilisateur:', error);
      return [];
    }
  }
}

export const conversationService = new ConversationService();