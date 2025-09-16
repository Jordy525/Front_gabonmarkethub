// Service API unifié pour la messagerie - UNE SEULE SOURCE DE VÉRITÉ

import type { Conversation, Message, ApiResponse } from '@/types/messaging';

class MessagingApi {
  private baseUrl = '/api';
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // CONVERSATIONS
  async getConversations(): Promise<Conversation[]> {
    const response = await this.request<ApiResponse<Conversation[]>>('/conversations');
    return response.data || [];
  }

  async createConversation(fournisseurId: number, sujet: string): Promise<Conversation> {
    const response = await this.request<ApiResponse<Conversation>>('/conversations', {
      method: 'POST',
      body: JSON.stringify({
        fournisseur_id: fournisseurId,
        sujet: sujet
      })
    });
    
    if (!response.data) {
      throw new Error('Erreur lors de la création de la conversation');
    }
    
    return response.data;
  }

  // MESSAGES
  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await this.request<ApiResponse<Message[]>>(`/conversations/${conversationId}/messages`);
    return response.data || [];
  }

  async sendMessage(conversationId: number, contenu: string): Promise<Message> {
    const response = await this.request<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ contenu })
    });
    
    if (!response.data) {
      throw new Error('Erreur lors de l\'envoi du message');
    }
    
    return response.data;
  }

  async markAsRead(conversationId: number, messageIds: number[]): Promise<void> {
    await this.request(`/conversations/${conversationId}/messages/read`, {
      method: 'POST',
      body: JSON.stringify({ message_ids: messageIds })
    });
  }

  // FOURNISSEURS (pour les acheteurs)
  async getSuppliers(): Promise<any[]> {
    const response = await this.request<ApiResponse<any[]>>('/entreprises?type=fournisseur&limit=50');
    return response.data || response.entreprises || [];
  }
}

export const messagingApi = new MessagingApi();