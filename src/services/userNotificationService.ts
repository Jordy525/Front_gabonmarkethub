import { apiClient } from './api';

export interface UserNotification {
  id: number;
  utilisateur_id: number;
  type: 'message' | 'commande' | 'promotion' | 'systeme' | 'produit' | 'user_management' | 'product_management' | 'order_management';
  category: 'new_message' | 'conversation_created' | 'new_product' | 'price_change' | 'out_of_stock' | 
           'contact_request' | 'product_approved' | 'product_rejected' | 'modification_request' | 
           'pending_moderation' | 'system_message' | 'maintenance' | 'important_update' | 'general';
  titre: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  data?: any;
  lu: boolean;
  date_creation: string;
  read_at?: string;
  related_user_id?: number;
  related_product_id?: number;
  related_conversation_id?: number;
  related_order_id?: number;
  related_user_nom?: string;
  related_user_prenom?: string;
  related_product_nom?: string;
}

export interface UserNotificationCounts {
  total: number;
  unread: number;
  urgent: number;
  high: number;
  messages: number;
  products: number;
  system: number;
}

export interface UserNotificationFilters {
  page?: number;
  limit?: number;
  type?: string;
  category?: string;
  unread?: boolean;
}

class UserNotificationService {
  private listeners: ((counts: UserNotificationCounts) => void)[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;

  // Récupérer les notifications de l'utilisateur
  async getNotifications(filters: UserNotificationFilters = {}): Promise<{
    notifications: UserNotification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      console.log('🔔 [UserNotificationService] Récupération des notifications');
      const response = await apiClient.get('/notifications', { params: filters });
      return response.data || response;
    } catch (error) {
      console.error('❌ [UserNotificationService] Erreur récupération notifications:', error);
      return {
        notifications: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0
      };
    }
  }

  // Récupérer les compteurs de notifications
  async getNotificationCounts(): Promise<UserNotificationCounts> {
    try {
      console.log('📊 [UserNotificationService] Récupération des compteurs');
      const response = await apiClient.get('/notifications/counts');
      return response.data || response;
    } catch (error) {
      console.error('❌ [UserNotificationService] Erreur récupération compteurs:', error);
      return {
        total: 0,
        unread: 0,
        urgent: 0,
        high: 0,
        messages: 0,
        products: 0,
        system: 0
      };
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      console.log('✅ [UserNotificationService] Notification marquée comme lue:', notificationId);
    } catch (error) {
      console.error('❌ [UserNotificationService] Erreur marquage notification:', error);
      throw error;
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/mark-all-read');
      console.log('✅ [UserNotificationService] Toutes les notifications marquées comme lues');
    } catch (error) {
      console.error('❌ [UserNotificationService] Erreur marquage toutes notifications:', error);
      throw error;
    }
  }

  // Supprimer une notification
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      console.log('✅ [UserNotificationService] Notification supprimée:', notificationId);
    } catch (error) {
      console.error('❌ [UserNotificationService] Erreur suppression notification:', error);
      throw error;
    }
  }

  // Supprimer toutes les notifications lues
  async deleteAllRead(): Promise<void> {
    try {
      await apiClient.delete('/notifications/delete-read');
      console.log('✅ [UserNotificationService] Notifications lues supprimées');
    } catch (error) {
      console.error('❌ [UserNotificationService] Erreur suppression notifications lues:', error);
      throw error;
    }
  }

  // Créer des notifications de test
  async createTestNotifications(type: string, count: number = 5): Promise<void> {
    try {
      await apiClient.post('/notifications/test', { type, count });
      console.log('✅ [UserNotificationService] Notifications de test créées');
    } catch (error) {
      console.error('❌ [UserNotificationService] Erreur création notifications test:', error);
      throw error;
    }
  }

  // Gestion des listeners pour les mises à jour en temps réel
  addListener(listener: (counts: UserNotificationCounts) => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: (counts: UserNotificationCounts) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  private notifyListeners(counts: UserNotificationCounts) {
    this.listeners.forEach(listener => listener(counts));
  }

  // Démarrer le polling pour les mises à jour en temps réel
  startPolling(interval: number = 30000) {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      try {
        const counts = await this.getNotificationCounts();
        this.notifyListeners(counts);
      } catch (error) {
        console.error('❌ [UserNotificationService] Erreur polling:', error);
      }
    }, interval);

    console.log('🔄 [UserNotificationService] Polling démarré');
  }

  // Arrêter le polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      console.log('⏹️ [UserNotificationService] Polling arrêté');
    }
  }

  // Obtenir l'icône pour le type de notification
  getNotificationIcon(type: string, category: string): string {
    switch (type) {
      case 'message':
        return '💬';
      case 'produit':
        return '📦';
      case 'commande':
        return '🛒';
      case 'promotion':
        return '🎉';
      case 'systeme':
        return '⚙️';
      default:
        return '📢';
    }
  }

  // Obtenir la couleur pour la priorité
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-blue-600 bg-blue-50';
      case 'low':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  }

  // Obtenir le label pour le type
  getTypeLabel(type: string): string {
    switch (type) {
      case 'message':
        return 'Message';
      case 'produit':
        return 'Produit';
      case 'commande':
        return 'Commande';
      case 'promotion':
        return 'Promotion';
      case 'systeme':
        return 'Système';
      default:
        return 'Autre';
    }
  }

  // Obtenir le label pour la catégorie
  getCategoryLabel(category: string): string {
    switch (category) {
      case 'new_message':
        return 'Nouveau message';
      case 'conversation_created':
        return 'Conversation créée';
      case 'new_product':
        return 'Nouveau produit';
      case 'price_change':
        return 'Prix modifié';
      case 'out_of_stock':
        return 'Rupture de stock';
      case 'contact_request':
        return 'Demande de contact';
      case 'product_approved':
        return 'Produit approuvé';
      case 'product_rejected':
        return 'Produit rejeté';
      case 'modification_request':
        return 'Modification demandée';
      case 'pending_moderation':
        return 'En attente de modération';
      case 'system_message':
        return 'Message système';
      case 'maintenance':
        return 'Maintenance';
      case 'important_update':
        return 'Mise à jour importante';
      default:
        return 'Général';
    }
  }
}

export const userNotificationService = new UserNotificationService();
