import { apiClient } from './api';

export interface AdminNotification {
  id: number;
  type: 'user_management' | 'product_management' | 'system' | 'order_management';
  category: 'new_user' | 'verification_request' | 'user_suspension' | 'user_report' | 
           'product_moderation' | 'product_report' | 'product_modification_request' |
           'system_error' | 'security_alert' | 'performance_stats' | 'maintenance';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  data?: any;
  userId?: number;
  productId?: number;
  orderId?: number;
}

export interface AdminNotificationCounts {
  total: number;
  unread: number;
  byType: {
    user_management: number;
    product_management: number;
    system: number;
    order_management: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

class AdminNotificationService {
  private listeners: ((counts: AdminNotificationCounts) => void)[] = [];
  private pollingInterval: NodeJS.Timeout | null = null;

  // Récupérer toutes les notifications admin
  async getAllNotifications(): Promise<AdminNotification[]> {
    try {
      console.log('🔔 [AdminNotificationService] Récupération des notifications admin');
      const response = await apiClient.get('/admin/notifications');
      const data = response.data || response;
      
      // L'API retourne un objet avec notifications, total, etc.
      if (data && data.notifications && Array.isArray(data.notifications)) {
        return data.notifications;
      }
      
      // Fallback si la structure est différente
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('❌ [AdminNotificationService] Erreur récupération notifications:', error);
      return [];
    }
  }

  // Récupérer les compteurs de notifications
  async getNotificationCounts(): Promise<AdminNotificationCounts> {
    try {
      console.log('📊 [AdminNotificationService] Récupération des compteurs');
      const response = await apiClient.get('/admin/notifications/counts');
      return response.data || response || {
        total: 0,
        unread: 0,
        byType: { user_management: 0, product_management: 0, system: 0, order_management: 0 },
        byPriority: { low: 0, medium: 0, high: 0, urgent: 0 }
      };
    } catch (error) {
      console.error('❌ [AdminNotificationService] Erreur récupération compteurs:', error);
      return {
        total: 0,
        unread: 0,
        byType: { user_management: 0, product_management: 0, system: 0, order_management: 0 },
        byPriority: { low: 0, medium: 0, high: 0, urgent: 0 }
      };
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await apiClient.patch(`/admin/notifications/${notificationId}/read`);
      console.log('✅ [AdminNotificationService] Notification marquée comme lue:', notificationId);
    } catch (error) {
      console.error('❌ [AdminNotificationService] Erreur marquage notification:', error);
      throw error;
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/admin/notifications/mark-all-read');
      console.log('✅ [AdminNotificationService] Toutes les notifications marquées comme lues');
    } catch (error) {
      console.error('❌ [AdminNotificationService] Erreur marquage toutes notifications:', error);
      throw error;
    }
  }

  // Supprimer une notification
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      await apiClient.delete(`/admin/notifications/${notificationId}`);
      console.log('✅ [AdminNotificationService] Notification supprimée:', notificationId);
    } catch (error) {
      console.error('❌ [AdminNotificationService] Erreur suppression notification:', error);
      throw error;
    }
  }

  // Supprimer toutes les notifications lues
  async deleteAllRead(): Promise<void> {
    try {
      await apiClient.delete('/admin/notifications/delete-read');
      console.log('✅ [AdminNotificationService] Toutes les notifications lues supprimées');
    } catch (error) {
      console.error('❌ [AdminNotificationService] Erreur suppression notifications lues:', error);
      throw error;
    }
  }

  // Filtrer les notifications par type
  async getNotificationsByType(type: AdminNotification['type']): Promise<AdminNotification[]> {
    try {
      const response = await apiClient.get(`/admin/notifications?type=${type}`);
      return response.data || response || [];
    } catch (error) {
      console.error('❌ [AdminNotificationService] Erreur récupération par type:', error);
      return [];
    }
  }

  // Filtrer les notifications par priorité
  async getNotificationsByPriority(priority: AdminNotification['priority']): Promise<AdminNotification[]> {
    try {
      const response = await apiClient.get(`/admin/notifications?priority=${priority}`);
      return response.data || response || [];
    } catch (error) {
      console.error('❌ [AdminNotificationService] Erreur récupération par priorité:', error);
      return [];
    }
  }

  // Actions spécifiques aux notifications

  // Approuver un utilisateur
  async approveUser(userId: number): Promise<void> {
    try {
      await apiClient.patch(`/admin/users/${userId}/approve`);
      console.log('✅ [AdminNotificationService] Utilisateur approuvé:', userId);
    } catch (error) {
      console.error('❌ [AdminNotificationService] Erreur approbation utilisateur:', error);
      throw error;
    }
  }

  // Suspendre un utilisateur
  async suspendUser(userId: number, reason: string): Promise<void> {
    try {
      await apiClient.patch(`/admin/users/${userId}/suspend`, { reason });
      console.log('✅ [AdminNotificationService] Utilisateur suspendu:', userId);
    } catch (error) {
      console.error('❌ [AdminNotificationService] Erreur suspension utilisateur:', error);
      throw error;
    }
  }

  // Approuver un produit
  async approveProduct(productId: number): Promise<void> {
    try {
      await apiClient.patch(`/admin/products/${productId}/approve`);
      console.log('✅ [AdminNotificationService] Produit approuvé:', productId);
    } catch (error) {
      console.error('❌ [AdminNotificationService] Erreur approbation produit:', error);
      throw error;
    }
  }

  // Rejeter un produit
  async rejectProduct(productId: number, reason: string): Promise<void> {
    try {
      await apiClient.patch(`/admin/products/${productId}/reject`, { reason });
      console.log('✅ [AdminNotificationService] Produit rejeté:', productId);
    } catch (error) {
      console.error('❌ [AdminNotificationService] Erreur rejet produit:', error);
      throw error;
    }
  }

  // Gestion des listeners
  addListener(listener: (counts: AdminNotificationCounts) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(counts: AdminNotificationCounts): void {
    this.listeners.forEach(listener => listener(counts));
  }

  // Démarrer le polling automatique
  startPolling(intervalMs: number = 30000): NodeJS.Timeout {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }

    this.pollingInterval = setInterval(async () => {
      try {
        const counts = await this.getNotificationCounts();
        this.notifyListeners(counts);
      } catch (error) {
        console.error('❌ [AdminNotificationService] Erreur polling:', error);
      }
    }, intervalMs);

    return this.pollingInterval;
  }

  // Arrêter le polling
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // Obtenir l'icône pour le type de notification
  getNotificationIcon(type: AdminNotification['type'], category: AdminNotification['category']): string {
    switch (type) {
      case 'user_management':
        switch (category) {
          case 'new_user': return '👤';
          case 'verification_request': return '✅';
          case 'user_suspension': return '⚠️';
          case 'user_report': return '🚨';
          default: return '👥';
        }
      case 'product_management':
        switch (category) {
          case 'product_moderation': return '📦';
          case 'product_report': return '🚨';
          case 'product_modification_request': return '✏️';
          default: return '📦';
        }
      case 'system':
        switch (category) {
          case 'system_error': return '❌';
          case 'security_alert': return '🔒';
          case 'performance_stats': return '📊';
          case 'maintenance': return '🔧';
          default: return '⚙️';
        }
      case 'order_management':
        return '🛒';
      default:
        return '🔔';
    }
  }

  // Obtenir la couleur pour la priorité
  getPriorityColor(priority: AdminNotification['priority']): string {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }
}

export const adminNotificationService = new AdminNotificationService();
