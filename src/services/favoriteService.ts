import { apiClient as api } from './api';

export interface FavoriteProduct {
  id: number;
  nom: string;
  prix_unitaire: number;
  image_url?: string;
  fournisseur: string;
  date_ajout: string;
}

export const favoriteService = {
  // Récupérer les favoris de l'utilisateur
  getFavorites: async (): Promise<{ favoris: FavoriteProduct[] }> => {
    const response = await api.get('/users/favorites');
    return response.data;
  },

  // Ajouter un produit aux favoris
  addFavorite: async (productId: number): Promise<{ message: string }> => {
    const response = await api.post('/users/favorites', { produit_id: productId });
    return response.data;
  },

  // Supprimer un produit des favoris
  removeFavorite: async (productId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/users/favorites/${productId}`);
    return response.data;
  },

  // Vérifier si un produit est en favori
  isFavorite: async (productId: number): Promise<{ is_favorite: boolean }> => {
    const response = await api.get(`/users/favorites/check/${productId}`);
    return response.data;
  }
};