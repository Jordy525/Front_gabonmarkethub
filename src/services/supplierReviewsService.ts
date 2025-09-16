import { apiClient } from './api';

export interface SupplierReview {
  id: number;
  fournisseur_id: number;
  acheteur_id: number;
  note: number;
  commentaire: string;
  created_at: string;
  updated_at: string;
  acheteur_nom?: string;
  acheteur_prenom?: string;
}

export interface SupplierReviewStats {
  note_moyenne: number;
  nombre_avis: number;
  distribution: { [key: number]: number };
}

export interface SupplierReviewResponse {
  reviews: SupplierReview[];
  stats: SupplierReviewStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class SupplierReviewsService {
  // Ajouter un avis sur un fournisseur
  async addSupplierReview(data: {
    fournisseur_id: number;
    note: number;
    commentaire: string;
  }): Promise<{ message: string; review: SupplierReview }> {
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simuler un succès (en attendant que l'API backend soit créée)
    const mockReview: SupplierReview = {
      id: Date.now(),
      fournisseur_id: data.fournisseur_id,
      acheteur_id: 1, // ID utilisateur simulé
      note: data.note,
      commentaire: data.commentaire,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      acheteur_nom: 'Utilisateur',
      acheteur_prenom: 'Test'
    };

    return {
      message: 'Avis ajouté avec succès (simulation)',
      review: mockReview
    };
  }

  // Récupérer les avis d'un fournisseur
  async getSupplierReviews(
    fournisseurId: number,
    page: number = 1,
    limit: number = 10,
    sortBy: 'recent' | 'rating_high' | 'rating_low' = 'recent'
  ): Promise<SupplierReviewResponse> {
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Données de test pour démonstration
    const mockReviews: SupplierReview[] = [
      {
        id: 1,
        fournisseur_id: fournisseurId,
        acheteur_id: 1,
        note: 5,
        commentaire: 'Excellent fournisseur, très professionnel et réactif.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 jour
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        acheteur_nom: 'Dupont',
        acheteur_prenom: 'Jean'
      },
      {
        id: 2,
        fournisseur_id: fournisseurId,
        acheteur_id: 2,
        note: 4,
        commentaire: 'Très bon service, produits de qualité.',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 jours
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        acheteur_nom: 'Martin',
        acheteur_prenom: 'Marie'
      },
      {
        id: 3,
        fournisseur_id: fournisseurId,
        acheteur_id: 3,
        note: 5,
        commentaire: 'Je recommande vivement ce fournisseur !',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 jours
        updated_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        acheteur_nom: 'Bernard',
        acheteur_prenom: 'Pierre'
      }
    ];

    return {
      reviews: mockReviews,
      stats: {
        note_moyenne: 4.7,
        nombre_avis: 3,
        distribution: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 }
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 3,
        pages: 1
      }
    };
  }

  // Récupérer les statistiques d'un fournisseur
  async getSupplierStats(fournisseurId: number): Promise<SupplierReviewStats> {
    // Simuler un délai d'API
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Stats de test pour démonstration
    return {
      note_moyenne: 4.7,
      nombre_avis: 3,
      distribution: { 5: 2, 4: 1, 3: 0, 2: 0, 1: 0 }
    };
  }

  // Signaler un avis fournisseur
  async reportSupplierReview(reviewId: number, reason: string): Promise<{ message: string }> {
    try {
      // Fallback : simuler un signalement réussi
      return { message: 'Avis signalé avec succès' };
    } catch (error) {
      console.error('Erreur signalement avis fournisseur:', error);
      throw error;
    }
  }

  // Calculer la note moyenne
  calculateAverageRating(stats: SupplierReviewStats): number {
    return stats.note_moyenne || 0;
  }

  // Obtenir la distribution des notes
  getRatingDistribution(stats: SupplierReviewStats): { [key: number]: number } {
    return stats.distribution || {};
  }
}

export const supplierReviewsService = new SupplierReviewsService();
