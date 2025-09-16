import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse, Notification } from '@/types/api';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalProducts: number;
  activeProducts: number;
  totalSuppliers: number;
  newMessages: number;
  pendingReviews: number;
}

interface RecentOrder {
  id: number;
  numero_commande: string;
  statut: string;
  total: number;
  created_at: string;
  fournisseur?: {
    nom_entreprise: string;
  };
  items?: Array<{
    produit_nom: string;
    quantite: number;
    prix_unitaire: number;
  }>;
}

interface FavoriteProduct {
  id: number;
  nom: string;
  prix: number;
  image_url?: string;
  fournisseur?: {
    nom_entreprise: string;
  };
  rating?: number;
  reviews_count?: number;
}

/**
 * Hook pour récupérer les statistiques du dashboard
 */
export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<DashboardStats> = await response.json();
      
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        throw new Error(result.error || 'Erreur lors de la récupération des statistiques');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur récupération stats:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats
  };
};

/**
 * Hook pour récupérer les commandes récentes
 */
export const useRecentOrders = (limit: number = 5) => {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/recent?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<RecentOrder[]> = await response.json();
      
      if (result.success && result.data) {
        setOrders(result.data);
      } else {
        throw new Error(result.error || 'Erreur lors de la récupération des commandes');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur récupération commandes:', errorMessage);
      setError(errorMessage);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders
  };
};

/**
 * Hook pour récupérer les produits favoris
 */
export const useFavoriteProducts = (limit: number = 6) => {
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/favorites?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<FavoriteProduct[]> = await response.json();
      
      if (result.success && result.data) {
        setProducts(result.data);
      } else {
        throw new Error(result.error || 'Erreur lors de la récupération des favoris');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur récupération favoris:', errorMessage);
      setError(errorMessage);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchFavorites
  };
};

/**
 * Hook pour récupérer les notifications
 */
export const useNotifications = (limit: number = 10) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Vérifier si c'est la nouvelle structure (userNotificationService)
      if (result.notifications && Array.isArray(result.notifications)) {
        setNotifications(result.notifications);
        // Compter les non lues
        const unread = result.notifications.filter(n => !n.lu).length;
        setUnreadCount(unread);
      } 
      // Vérifier si c'est l'ancienne structure (ApiResponse)
      else if (result.success && result.data) {
        setNotifications(result.data);
        // Compter les non lues
        const unread = result.data.filter(n => !n.lu).length;
        setUnreadCount(unread);
      } else {
        throw new Error(result.error || 'Erreur lors de la récupération des notifications');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur récupération notifications:', errorMessage);
      setError(errorMessage);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Mettre à jour localement
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, lu: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Erreur marquage notification:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Mettre à jour localement
        setNotifications(prev => 
          prev.map(n => ({ ...n, lu: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Erreur marquage toutes notifications:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead
  };
};