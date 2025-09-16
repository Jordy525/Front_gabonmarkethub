import { apiClient } from './api';
import type { 
  Conversation, 
  Message, 
  ApiResponse,
  PaginatedResponse,
  CreateConversationExtendedRequest,
  SendMessageExtendedRequest,
  FileUploadRequest,
  FileUploadResponse,
  ConversationFilters,
  SearchFilters,
  PaginationParams,
  TypingIndicator,
  MessageStatusUpdate
} from '../types/api';

// Interfaces déplacées vers types/api.ts pour une meilleure organisation

export class MessageService {
  async getConversations(filters?: ConversationFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Conversation>> {
    const queryParams = new URLSearchParams();
    if (pagination?.page) queryParams.append('page', pagination.page.toString());
    if (pagination?.limit) queryParams.append('limit', pagination.limit.toString());
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    console.log('📡 SERVICE - Requête conversations vers API:', {
      url: `/conversations?${queryParams}`,
      filters,
      pagination
    });
    
    const response = await apiClient.get<PaginatedResponse<Conversation>>(`/conversations?${queryParams}`) as any;
    
    console.log('📡 SERVICE - Réponse API conversations:', {
      hasData: !!response.data,
      dataLength: response.data?.length || 0,
      hasPagination: !!response.pagination,
      rawResponse: response
    });
    
    // Normaliser la réponse pour s'assurer qu'elle a la bonne structure
    const normalizedResponse = {
      data: response.data || response.conversations || [],
      pagination: response.pagination || {
        total: response.total || 0,
        pages: response.pages || 1,
        page: response.page || 1,
        limit: response.limit || 20
      }
    };
    
    console.log('📡 SERVICE - Réponse normalisée:', normalizedResponse);
    
    return normalizedResponse;
  }

  async createConversation(data: CreateConversationExtendedRequest): Promise<Conversation> {
    const response = await apiClient.post<ApiResponse<Conversation>>('/conversations', data) as any;
    
    // Normaliser la réponse pour gérer différentes structures
    if (response.data) {
      return response.data;
    } else if (response.conversation) {
      return response.conversation;
    } else if (response.id) {
      return response;
    } else {
      throw new Error('Structure de réponse inattendue pour la création de conversation');
    }
  }

  async getConversation(id: number): Promise<Conversation> {
    const response = await apiClient.get<ApiResponse<Conversation>>(`/conversations/${id}`) as any;
    
    // Normaliser la réponse pour gérer différentes structures
    if (response.data) {
      return response.data;
    } else if (response.conversation) {
      return response.conversation;
    } else if (response.id) {
      return response;
    } else {
      throw new Error('Structure de réponse inattendue pour la récupération de conversation');
    }
  }

  async getMessages(conversationId: number, page: number = 1, limit: number = 50): Promise<PaginatedResponse<Message>> {
    const response = await apiClient.get<PaginatedResponse<Message>>(`/conversations/${conversationId}/messages?page=${page}&limit=${limit}`) as any;
    
    // Normaliser la réponse pour s'assurer qu'elle a la bonne structure
    return {
      data: response.data || response.messages || [],
      pagination: response.pagination || {
        total: response.total || 0,
        pages: response.pages || 1,
        page: response.page || 1,
        limit: response.limit || limit
      }
    };
  }

  async sendMessage(conversationId: number, messageData: SendMessageExtendedRequest): Promise<Message> {
    const response = await apiClient.post<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, messageData);
    return response.data;
  }

  async markAsRead(conversationId: number): Promise<void> {
    await apiClient.patch(`/conversations/${conversationId}/mark-read`);
  }

  async closeConversation(conversationId: number): Promise<Conversation> {
    const response = await apiClient.patch<ApiResponse<Conversation>>(`/conversations/${conversationId}/close`);
    return response.data;
  }

  async reopenConversation(conversationId: number): Promise<Conversation> {
    const response = await apiClient.patch<ApiResponse<Conversation>>(`/conversations/${conversationId}/reopen`);
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/messages/unread-count');
    return response.data?.count || 0;
  }

  async searchConversations(query: string, filters?: SearchFilters): Promise<Conversation[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await apiClient.get<ApiResponse<Conversation[]>>(`/conversations/search?${queryParams}`);
    return response.data || [];
  }

  async uploadFile(fileData: FileUploadRequest): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', fileData.file);
    formData.append('conversation_id', fileData.conversation_id.toString());
    if (fileData.message_id) {
      formData.append('message_id', fileData.message_id.toString());
    }

    const response = await apiClient.request<ApiResponse<FileUploadResponse>>('/messages/upload', {
      method: 'POST',
      body: formData
    });
    return response.data;
  }

  async markMessagesAsRead(conversationId: number, messageIds?: number[]): Promise<void> {
    const data = messageIds ? { message_ids: messageIds } : {};
    await apiClient.patch(`/conversations/${conversationId}/mark-read`, data);
  }

  async getTypingIndicators(conversationId: number): Promise<TypingIndicator[]> {
    const response = await apiClient.get<ApiResponse<TypingIndicator[]>>(`/conversations/${conversationId}/typing`);
    return response.data || [];
  }

  async setTypingStatus(conversationId: number, isTyping: boolean): Promise<void> {
    await apiClient.post(`/conversations/${conversationId}/typing`, { is_typing: isTyping });
  }

  async updateMessageStatus(messageId: number, status: 'delivered' | 'read'): Promise<void> {
    await apiClient.patch(`/conversations/messages/${messageId}/status`, { status });
  }

  async archiveConversation(conversationId: number): Promise<Conversation> {
    const response = await apiClient.patch<ApiResponse<Conversation>>(`/conversations/${conversationId}/archive`);
    return response.data;
  }

  async unarchiveConversation(conversationId: number): Promise<Conversation> {
    const response = await apiClient.patch<ApiResponse<Conversation>>(`/conversations/${conversationId}/unarchive`);
    return response.data;
  }

  async updateConversationPriority(conversationId: number, priorite: 'normale' | 'haute' | 'urgente'): Promise<Conversation> {
    const response = await apiClient.patch<ApiResponse<Conversation>>(`/conversations/${conversationId}/priority`, { priorite });
    return response.data;
  }

  async addConversationTags(conversationId: number, tags: string[]): Promise<Conversation> {
    const response = await apiClient.post<ApiResponse<Conversation>>(`/conversations/${conversationId}/tags`, { tags });
    return response.data;
  }

  async removeConversationTags(conversationId: number, tags: string[]): Promise<Conversation> {
    const response = await apiClient.delete<ApiResponse<Conversation>>(`/conversations/${conversationId}/tags`, { tags });
    return response.data;
  }

  async searchMessages(conversationId: number, query: string): Promise<Message[]> {
    const response = await apiClient.get<ApiResponse<Message[]>>(`/conversations/${conversationId}/search?q=${encodeURIComponent(query)}`);
    return response.data || [];
  }

  async getConversationsByProduct(productId: number): Promise<Conversation[]> {
    const response = await apiClient.get<ApiResponse<Conversation[]>>(`/conversations/product/${productId}`);
    return response.data || [];
  }

  async getConversationsByOrder(orderId: number): Promise<Conversation[]> {
    const response = await apiClient.get<ApiResponse<Conversation[]>>(`/conversations/order/${orderId}`);
    return response.data || [];
  }
}

export const messageService = new MessageService();