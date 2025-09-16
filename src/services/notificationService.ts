import { apiClient } from './api';

export interface Notification {
  id: number;
  titre: string;
  message: string;
  type: 'message' | 'promotion' | 'systeme' | 'commande' | 'produit';
  lu: boolean;
  date_creation: string;
  url?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}

class NotificationService {
  // Récupérer les notifications
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await apiClient.get('/notifications');
      return response?.data || response || [];
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      // Fallback : retourner des notifications de test
      return this.getMockNotifications();
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId: number): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      // En mode fallback, on ne fait rien
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/read-all');
    } catch (error) {
      console.error('Erreur marquage toutes notifications:', error);
      // En mode fallback, on ne fait rien
    }
  }

  // Supprimer une notification
  async deleteNotification(notificationId: number): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Erreur suppression notification:', error);
      // En mode fallback, on ne fait rien
    }
  }

  // Créer une notification (pour les tests)
  async createNotification(data: Partial<Notification>): Promise<Notification> {
    try {
      const response = await apiClient.post('/notifications', data);
      return response;
    } catch (error) {
      console.error('Erreur création notification:', error);
      // En mode fallback, simuler une notification
      return {
        id: Date.now(),
        titre: data.titre || 'Notification',
        message: data.message || 'Message de notification',
        type: data.type || 'systeme',
        lu: false,
        date_creation: new Date().toISOString(),
        ...data
      };
    }
  }

  // Notifications de test
  private getMockNotifications(): Notification[] {
    return [
      {
        id: 1,
        titre: 'Nouveau message',
        message: 'Vous avez reçu un nouveau message de la part d\'un fournisseur',
        type: 'message',
        lu: false,
        date_creation: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        priority: 'high'
      },
      {
        id: 2,
        titre: 'Produit ajouté',
        message: 'Un nouveau produit a été ajouté à votre liste de favoris',
        type: 'produit',
        lu: false,
        date_creation: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
        priority: 'medium'
      },
      {
        id: 3,
        titre: 'Promotion spéciale',
        message: 'Découvrez nos offres spéciales du mois',
        type: 'promotion',
        lu: true,
        date_creation: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        priority: 'low'
      }
    ];
  }

  // Simuler une notification en temps réel
  simulateRealtimeNotification(): Notification {
    const types: Notification['type'][] = ['message', 'promotion', 'systeme', 'commande', 'produit'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: Date.now(),
      titre: `Notification ${randomType}`,
      message: `Vous avez reçu une nouvelle notification de type ${randomType}`,
      type: randomType,
      lu: false,
      date_creation: new Date().toISOString(),
      priority: 'medium'
    };
  }
}

export const notificationService = new NotificationService();