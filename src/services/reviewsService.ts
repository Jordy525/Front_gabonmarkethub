import { apiClient } from './api';

export interface Review {
  id: number;
  note: number;
  commentaire: string;
  achat_verifie: boolean;
  date_creation: string;
  statut: string;
  utilisateur_nom: string;
  avatar_url?: string;
  reponse?: string;
  date_reponse?: string;
  fournisseur_nom?: string;
}

export interface ReviewStats {
  note: number;
  count: number;
}

export interface ReviewsResponse {
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  ratingStats: ReviewStats[];
  sort: string;
}

export interface AddReviewRequest {
  produit_id: number;
  note: number;
  commentaire: string;
}

export interface AddReviewResponse {
  message: string;
  reviewId: number;
  status: string;
  needsModeration: boolean;
}

class ReviewsService {
  // Récupérer les avis d'un produit
  async getProductReviews(
    productId: number,
    page: number = 1,
    limit: number = 10,
    sort: string = 'recent'
  ): Promise<ReviewsResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort
      });
      const response = await apiClient.get(`/reviews/product/${productId}?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Erreur récupération avis:', error);
      throw error;
    }
  }

  // Ajouter un avis
  async addReview(reviewData: AddReviewRequest): Promise<AddReviewResponse> {
    try {
      const response = await apiClient.post('/reviews', reviewData);
      return response;
    } catch (error) {
      console.error('Erreur ajout avis:', error);
      throw error;
    }
  }

  // Répondre à un avis (fournisseur)
  async replyToReview(reviewId: number, reponse: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/reply`, { reponse });
      return response;
    } catch (error) {
      console.error('Erreur réponse avis:', error);
      throw error;
    }
  }

  // Signaler un avis
  async reportReview(
    reviewId: number,
    raison: 'inapproprié' | 'faux' | 'spam' | 'autre',
    description?: string
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/report`, { raison, description });
      return response;
    } catch (error) {
      console.error('Erreur signalement avis:', error);
      throw error;
    }
  }

  // Récupérer les avis en attente de modération (admin)
  async getPendingReviews(page: number = 1, limit: number = 20): Promise<{
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await apiClient.get(`/reviews/pending?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Erreur récupération avis en attente:', error);
      throw error;
    }
  }

  // Modérer un avis (admin)
  async moderateReview(
    reviewId: number,
    action: 'approve' | 'reject',
    reason?: string
  ): Promise<{ message: string; status: string }> {
    try {
      const response = await apiClient.put(
        `/reviews/${reviewId}/moderate`,
        { action, reason }
      );
      return response;
    } catch (error) {
      console.error('Erreur modération avis:', error);
      throw error;
    }
  }

  // Calculer la note moyenne d'un produit
  calculateAverageRating(ratingStats: ReviewStats[]): number {
    if (ratingStats.length === 0) return 0;
    
    const totalReviews = ratingStats.reduce((sum, stat) => sum + stat.count, 0);
    const totalScore = ratingStats.reduce((sum, stat) => sum + (stat.note * stat.count), 0);
    
    return totalReviews > 0 ? totalScore / totalReviews : 0;
  }

  // Obtenir la distribution des notes
  getRatingDistribution(ratingStats: ReviewStats[]): { [key: number]: number } {
    const distribution: { [key: number]: number } = {};
    
    // Initialiser toutes les notes de 1 à 5
    for (let i = 1; i <= 5; i++) {
      distribution[i] = 0;
    }
    
    // Remplir avec les données réelles
    ratingStats.forEach(stat => {
      distribution[stat.note] = stat.count;
    });
    
    return distribution;
  }

  // Formater la date d'un avis
  formatReviewDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Vérifier si un utilisateur peut noter un produit
  canUserReview(userId: number | null, existingReviews: Review[]): boolean {
    if (!userId) return false;
    return !existingReviews.some(review => 
      review.utilisateur_nom.includes(userId.toString())
    );
  }
}

export const reviewsService = new ReviewsService();
export default reviewsService;
