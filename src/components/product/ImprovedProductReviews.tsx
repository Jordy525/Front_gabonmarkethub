import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Flag, CheckCircle, Clock, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import { reviewsService, Review, ReviewsResponse } from '@/services/reviewsService';
import { useAuth } from '@/hooks/api/useAuth';

interface ImprovedProductReviewsProps {
  productId: number;
  onReviewAdded?: () => void;
}

export const ImprovedProductReviews: React.FC<ImprovedProductReviewsProps> = ({
  productId,
  onReviewAdded
}) => {
  const { user: currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewsResponse | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'recent' | 'rating_high' | 'rating_low' | 'verified'>('recent');

  // Charger les avis
  const loadReviews = async (page: number = 1, sort: string = sortBy) => {
    try {
      setIsLoading(true);
      const data = await reviewsService.getProductReviews(productId, page, 10, sort as any);
      setReviews(data.reviews);
      setReviewStats(data);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
      toast.error('Erreur lors du chargement des avis');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(1, sortBy);
  }, [productId, sortBy]);

  // Soumettre un avis
  const handleSubmitReview = async () => {
    if (newReview.rating === 0) {
      toast.error('Veuillez donner une note');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Veuillez écrire un commentaire');
      return;
    }

    if (newReview.comment.length < 10) {
      toast.error('Le commentaire doit contenir au moins 10 caractères');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await reviewsService.addReview({
        produit_id: productId,
        note: newReview.rating,
        commentaire: newReview.comment
      });

      toast.success(result.message);
      setNewReview({ rating: 0, comment: '' });
      setShowReviewForm(false);
      
      if (result.needsModeration) {
        toast.info('Votre avis est en attente de modération');
      }
      
      onReviewAdded?.();
      loadReviews(1, sortBy);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout de l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Signaler un avis
  const handleReportReview = async (reviewId: number) => {
    try {
      await reviewsService.reportReview(reviewId, 'inapproprié');
      toast.success('Avis signalé avec succès');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors du signalement');
    }
  };

  // Calculer la note moyenne
  const averageRating = reviewStats?.ratingStats ? 
    reviewsService.calculateAverageRating(reviewStats.ratingStats) : 0;

  // Rendu des étoiles
  const renderStars = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onRatingChange?.(star) : undefined}
            className={`transition-colors ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
            disabled={!interactive}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Rendu de la distribution des notes
  const renderRatingDistribution = () => {
    if (!reviewStats?.ratingStats) return null;

    const totalReviews = reviewStats.ratingStats.reduce((acc, stat) => acc + stat.count, 0);

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const stat = reviewStats.ratingStats.find(s => s.note === rating);
          const count = stat?.count || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

          return (
            <div key={rating} className="flex items-center gap-2">
              <span className="text-sm font-medium w-8">{rating}</span>
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-8">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Avis clients</h3>
          {currentUser && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showReviewForm ? 'Annuler' : 'Écrire un avis'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Note moyenne */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {averageRating ? averageRating.toFixed(1) : '0.0'}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(averageRating || 0))}
            </div>
            <p className="text-sm text-gray-600">
              Basé sur {reviewStats?.pagination.total || 0} avis
            </p>
          </div>

          {/* Distribution des notes */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Distribution des notes</h4>
            {renderRatingDistribution()}
          </div>
        </div>
      </div>

      {/* Formulaire d'avis */}
      {showReviewForm && currentUser && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Votre avis</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note *
              </label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire *
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Partagez votre expérience avec ce produit..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                maxLength={1000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {newReview.comment.length}/1000 caractères
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Envoi...' : 'Publier l\'avis'}
              </button>
              <button
                onClick={() => setShowReviewForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtres et tri */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Plus récents</option>
            <option value="rating_high">Meilleures notes</option>
            <option value="rating_low">Moins bonnes notes</option>
            <option value="verified">Achats vérifiés</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          {reviewStats?.pagination.total || 0} avis au total
        </div>
      </div>

      {/* Liste des avis */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Chargement des avis...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Aucun avis pour ce produit</p>
            <p className="text-sm">Soyez le premier à donner votre avis !</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {review.avatar_url ? (
                      <img
                        src={review.avatar_url}
                        alt={review.utilisateur_nom}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {review.utilisateur_nom.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{review.utilisateur_nom}</p>
                    <div className="flex items-center gap-2">
                      {renderStars(review.note)}
                      {review.achat_verifie && (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Achat vérifié
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {new Date(review.date_creation).toLocaleDateString('fr-FR')}
                  </span>
                  {currentUser && (
                    <button
                      onClick={() => handleReportReview(review.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Signaler cet avis"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.commentaire}</p>

              {/* Réponse du fournisseur */}
              {review.reponse && (
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Réponse de {review.fournisseur_nom}
                    </span>
                    <span className="text-xs text-blue-600">
                      {new Date(review.date_reponse!).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-blue-800">{review.reponse}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {reviewStats && reviewStats.pagination.pages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadReviews(currentPage - 1, sortBy)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-600">
              Page {currentPage} sur {reviewStats.pagination.pages}
            </span>
            
            <button
              onClick={() => loadReviews(currentPage + 1, sortBy)}
              disabled={currentPage === reviewStats.pagination.pages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovedProductReviews;
