import { apiClient as api } from './api';

export interface ProductStats {
  product: {
    id: number;
    nom: string;
    vues_30j: number;
    score_popularite: number;
    note_moyenne: number;
    nombre_avis: number;
    derniere_activite: string;
  } | null;
  stats: {
    total_vues: number;
    total_clics: number;
    total_favoris: number;
    total_partages: number;
  };
  dailyStats: Array<{
    date: string;
    vues: number;
    clics: number;
    ajouts_favoris: number;
    partages: number;
  }>;
  period: string;
}

export interface GlobalStats {
  global: {
    produits_vus: number;
    total_vues: number;
    total_clics: number;
    total_favoris: number;
    total_partages: number;
  };
  topProducts: Array<{
    id: number;
    nom: string;
    vues_30j: number;
    score_popularite: number;
    note_moyenne: number;
    nombre_avis: number;
    fournisseur: string;
  }>;
  categoryStats: Array<{
    categorie: string;
    nombre_produits: number;
    total_vues: number;
    note_moyenne: number;
  }>;
  period: string;
}

export interface UserStats {
  supplier: {
    nombre_produits: number;
    total_vues: number;
    total_clics: number;
    total_favoris: number;
    total_partages: number;
    note_moyenne: number;
    total_avis: number;
  };
  topProducts: Array<{
    id: number;
    nom: string;
    vues_30j: number;
    score_popularite: number;
    note_moyenne: number;
    nombre_avis: number;
  }>;
  period: string;
}

export const analyticsService = {
  // Enregistrer une vue de produit
  trackProductView: async (productId: number): Promise<{ success: boolean; message: string; productId: number }> => {
    const response = await api.post(`/analytics/products/${productId}/view`);
    return response;
  },

  // Enregistrer un clic sur un produit
  trackProductClick: async (productId: number, action: 'view' | 'favorite' | 'share' = 'view'): Promise<{ success: boolean; message: string; action: string; productId: number }> => {
    const response = await api.post(`/analytics/products/${productId}/click`, { action });
    return response;
  },

  // Récupérer les statistiques d'un produit
  getProductStats: async (productId: number, period: '7d' | '30d' | '90d' = '30d'): Promise<ProductStats> => {
    const response = await api.get(`/analytics/products/${productId}/stats?period=${period}`);
    return response;
  },

  // Récupérer les statistiques globales
  getGlobalStats: async (period: '7d' | '30d' | '90d' = '30d'): Promise<GlobalStats> => {
    const response = await api.get(`/analytics/stats/global?period=${period}`);
    return response;
  },

  // Récupérer les statistiques d'un utilisateur (fournisseur)
  getUserStats: async (period: '7d' | '30d' | '90d' = '30d'): Promise<UserStats> => {
    const response = await api.get(`/analytics/user/stats?period=${period}`);
    return response;
  }
};
