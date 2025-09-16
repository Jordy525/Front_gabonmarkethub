import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export interface Favorite {
  id: number;
  produit_id: number;
  utilisateur_id: number;
  date_ajout: string;
  produit?: {
    id: number;
    nom: string;
    prix_unitaire: number;
    image_url?: string;
    statut: string;
  };
}

export interface FavoritesResponse {
  favorites: Favorite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FavoriteStats {
  productId: number;
  totalFavorites: number;
  period: string;
}

class FavoritesService {
  // Récupérer les favoris d'un utilisateur
  async getUserFavorites(
    page: number = 1,
    limit: number = 20
  ): Promise<FavoritesResponse> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/favorites`,
        {
          params: { page, limit },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur récupération favoris:', error);
      throw error;
    }
  }

  // Ajouter un produit aux favoris
  async addToFavorites(productId: number): Promise<{ message: string; favoriteId: number }> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/favorites`,
        { produit_id: productId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur ajout favori:', error);
      throw error;
    }
  }

  // Supprimer un produit des favoris
  async removeFromFavorites(productId: number): Promise<{ message: string }> {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/users/favorites/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur suppression favori:', error);
      throw error;
    }
  }

  // Vérifier si un produit est en favori
  async isProductFavorite(productId: number): Promise<boolean> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/favorites/check/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );
      return response.data.isFavorite;
    } catch (error) {
      console.error('Erreur vérification favori:', error);
      return false;
    }
  }

  // Récupérer les statistiques des favoris pour un produit
  async getProductFavoriteStats(
    productId: number,
    period: string = '30d'
  ): Promise<FavoriteStats> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/favorites/stats/${productId}`,
        {
          params: { period }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur récupération stats favoris:', error);
      throw error;
    }
  }

  // Récupérer les favoris les plus populaires
  async getPopularFavorites(limit: number = 10): Promise<{
    products: Array<{
      id: number;
      nom: string;
      prix_unitaire: number;
      image_url?: string;
      totalFavorites: number;
    }>;
  }> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/favorites/popular`,
        {
          params: { limit }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur récupération favoris populaires:', error);
      throw error;
    }
  }

  // Basculer l'état favori d'un produit
  async toggleFavorite(productId: number): Promise<{
    isFavorite: boolean;
    message: string;
  }> {
    try {
      const isCurrentlyFavorite = await this.isProductFavorite(productId);
      
      if (isCurrentlyFavorite) {
        await this.removeFromFavorites(productId);
        return {
          isFavorite: false,
          message: 'Produit retiré des favoris'
        };
      } else {
        await this.addToFavorites(productId);
        return {
          isFavorite: true,
          message: 'Produit ajouté aux favoris'
        };
      }
    } catch (error) {
      console.error('Erreur basculement favori:', error);
      throw error;
    }
  }

  // Formater la date d'ajout aux favoris
  formatFavoriteDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Ajouté hier';
    } else if (diffDays < 7) {
      return `Ajouté il y a ${diffDays} jours`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Ajouté il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  // Obtenir le nombre total de favoris d'un utilisateur
  async getUserFavoritesCount(): Promise<number> {
    try {
      const response = await this.getUserFavorites(1, 1);
      return response.pagination.total;
    } catch (error) {
      console.error('Erreur récupération nombre favoris:', error);
      return 0;
    }
  }

  // Vérifier si l'utilisateur est connecté
  isUserAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  // Obtenir le message d'erreur approprié
  getErrorMessage(error: any): string {
    if (error.response?.status === 401) {
      return 'Vous devez être connecté pour gérer vos favoris';
    } else if (error.response?.status === 404) {
      return 'Produit non trouvé';
    } else if (error.response?.status === 409) {
      return 'Ce produit est déjà dans vos favoris';
    } else {
      return 'Une erreur est survenue lors de la gestion des favoris';
    }
  }
}

export const favoritesService = new FavoritesService();
export default favoritesService;


