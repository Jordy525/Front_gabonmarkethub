import { apiClient } from './api';

export interface UnifiedNotification {
  id: number;
  type: 'message' | 'system' | 'promotion' | 'order' | 'product';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
  conversationId?: number;
  senderId?: number;
  senderName?: string;
}

export interface NotificationCounts {
  total: number;
  messages: number;
  system: number;
  promotion: number;
  order: number;
  product: number;
}

class UnifiedNotificationService {
  private listeners: ((counts: NotificationCounts) => void)[] = [];
  private currentCounts: NotificationCounts = {
    total: 0,
    messages: 0,
    system: 0,
    promotion: 0,
    order: 0,
    product: 0
  };

  // Ajouter un listener pour les mises à jour de compteur
  addListener(callback: (counts: NotificationCounts) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notifier tous les listeners
  private notifyListeners() {
    console.log('🔔 [UnifiedNotificationService] Notification des listeners:', {
      counts: this.currentCounts,
      listenersCount: this.listeners.length
    });
    this.listeners.forEach(listener => listener(this.currentCounts));
  }

  // Valider et formater une date
  private validateDate(dateString: string | null | undefined): string | null {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.toISOString();
    } catch (error) {
      return null;
    }
  }

  // Récupérer toutes les notifications
  async getAllNotifications(): Promise<UnifiedNotification[]> {
    try {
      // Récupérer les notifications système
      const systemNotifications = await this.getSystemNotifications();
      
      // Récupérer les messages non lus
      const messageNotifications = await this.getMessageNotifications();
      
      // Combiner et trier par date
      const allNotifications = [...systemNotifications, ...messageNotifications];
      return allNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Erreur récupération notifications unifiées:', error);
      return this.getMockNotifications();
    }
  }

  // Récupérer les notifications système
    private async getSystemNotifications(): Promise<UnifiedNotification[]> {
    try {
      console.log('🔔 [UnifiedNotificationService] Récupération des notifications système');
      const response = await apiClient.get('/notifications');
      const notifications = response?.data || response || [];
      
      console.log('📋 [UnifiedNotificationService] Notifications système récupérées:', {
        count: notifications.length,
        notifications: notifications
      });
      
      const formattedNotifications = notifications.map((notif: any) => ({
        id: notif.id,
        type: notif.type || 'system',
        title: notif.titre || notif.title || 'Notification',
        message: notif.message || notif.contenu || '',
        isRead: notif.lu || notif.isRead || false,
        createdAt: this.validateDate(notif.date_creation || notif.createdAt) || new Date().toISOString(),
        data: notif
      }));
      
      console.log('✅ [UnifiedNotificationService] Notifications système formatées:', formattedNotifications);
      return formattedNotifications;
    } catch (error) {
      console.error('❌ [UnifiedNotificationService] Erreur récupération notifications système:', error);
      return [];
    }
  }

  // Récupérer les notifications de messages
  private async getMessageNotifications(): Promise<UnifiedNotification[]> {
    try {
      console.log('💬 [UnifiedNotificationService] Récupération des notifications de messages');
      const response = await apiClient.get('/conversations');
      const conversations = response?.data || response || [];
      
      console.log('📋 [UnifiedNotificationService] Conversations récupérées:', {
        count: conversations.length,
        conversations: conversations
      });
      
      const messageNotifications: UnifiedNotification[] = [];
      
      conversations.forEach((conv: any) => {
        const unreadCount = (conv.messages_non_lus_acheteur || 0) + (conv.messages_non_lus_fournisseur || 0);
        
        console.log('🔍 [UnifiedNotificationService] Analyse conversation:', {
          convId: conv.id,
          unreadAcheteur: conv.messages_non_lus_acheteur || 0,
          unreadFournisseur: conv.messages_non_lus_fournisseur || 0,
          totalUnread: unreadCount
        });
        
        if (unreadCount > 0) {
          const notification = {
            id: `msg_${conv.id}`,
            type: 'message' as const,
            title: 'Nouveau message',
            message: `Vous avez ${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}`,
            isRead: false,
            createdAt: this.validateDate(conv.updated_at || conv.last_message_date) || new Date().toISOString(),
            conversationId: conv.id,
            senderId: conv.fournisseur_id || conv.acheteur_id,
            senderName: conv.nom_entreprise || conv.fournisseur_nom || 'Utilisateur'
          };
          messageNotifications.push(notification);
          console.log('✅ [UnifiedNotificationService] Notification de message créée:', notification);
        }
      });
      
      console.log('📊 [UnifiedNotificationService] Notifications de messages générées:', {
        count: messageNotifications.length,
        notifications: messageNotifications
      });
      
      return messageNotifications;
    } catch (error) {
      console.error('❌ [UnifiedNotificationService] Erreur récupération notifications messages:', error);
      return [];
    }
  }

  // Récupérer les compteurs de notifications
  async getNotificationCounts(): Promise<NotificationCounts> {
    try {
      console.log('🔢 [UnifiedNotificationService] Calcul des compteurs de notifications');
      const notifications = await this.getAllNotifications();
      
      console.log('📋 [UnifiedNotificationService] Notifications pour comptage:', {
        total: notifications.length,
        notifications: notifications
      });
      
      const counts: NotificationCounts = {
        total: 0,
        messages: 0,
        system: 0,
        promotion: 0,
        order: 0,
        product: 0
      };

      notifications.forEach(notif => {
        if (!notif.isRead) {
          counts.total++;
          if (notif.type in counts) {
            counts[notif.type as keyof NotificationCounts] = (counts[notif.type as keyof NotificationCounts] || 0) + 1;
          }
        }
      });

      console.log('📊 [UnifiedNotificationService] Compteurs calculés:', counts);

      this.currentCounts = counts;
      this.notifyListeners();
      
      return counts;
    } catch (error) {
      console.error('❌ [UnifiedNotificationService] Erreur récupération compteurs:', error);
      return this.currentCounts;
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: string | number): Promise<void> {
    try {
      if (typeof notificationId === 'string' && notificationId.startsWith('msg_')) {
        // C'est une notification de message
        const conversationId = parseInt(notificationId.replace('msg_', ''));
        await apiClient.patch(`/conversations/${conversationId}/mark-read`);
      } else {
        // C'est une notification système
        await apiClient.patch(`/notifications/${notificationId}/read`);
      }
      
      // Rafraîchir les compteurs
      await this.getNotificationCounts();
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/read-all');
      await apiClient.patch('/conversations/mark-all-read');
      
      // Rafraîchir les compteurs
      await this.getNotificationCounts();
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
    }
  }

  // Créer une notification de test
  async createTestNotification(type: UnifiedNotification['type'] = 'system'): Promise<UnifiedNotification> {
    const testNotification: UnifiedNotification = {
      id: Date.now(),
      type,
      title: `Notification ${type}`,
      message: `Ceci est une notification de test de type ${type}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // Rafraîchir les compteurs
    await this.getNotificationCounts();
    
    return testNotification;
  }

  // Notifications de test
  private getMockNotifications(): UnifiedNotification[] {
    return [
      {
        id: 1,
        type: 'message',
        title: 'Nouveau message',
        message: 'Vous avez reçu un nouveau message de la part d\'un fournisseur',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        conversationId: 1,
        senderName: 'Fournisseur Test'
      },
      {
        id: 2,
        type: 'system',
        title: 'Mise à jour système',
        message: 'Une nouvelle mise à jour est disponible',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
      },
      {
        id: 3,
        type: 'promotion',
        title: 'Promotion spéciale',
        message: 'Découvrez nos offres spéciales du mois',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
      }
    ];
  }

  // Démarrer le polling automatique
  startPolling(intervalMs: number = 30000) {
    const poll = async () => {
      await this.getNotificationCounts();
    };
    
    // Polling immédiat
    poll();
    
    // Puis à intervalles réguliers
    return setInterval(poll, intervalMs);
  }
}

export const unifiedNotificationService = new UnifiedNotificationService();
