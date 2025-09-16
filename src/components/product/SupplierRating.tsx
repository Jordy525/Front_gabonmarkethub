import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';
import { useIsAuthenticated } from '@/hooks/api/useAuth';
import { supplierReviewsService, type SupplierReview, type SupplierReviewStats } from '@/services/supplierReviewsService';

interface SupplierRatingProps {
  fournisseurId: number;
  fournisseurNom: string;
  onReviewAdded?: () => void;
}

export const SupplierRating: React.FC<SupplierRatingProps> = ({
  fournisseurId,
  fournisseurNom,
  onReviewAdded
}) => {
  const [reviews, setReviews] = useState<SupplierReview[]>([]);
  const [stats, setStats] = useState<SupplierReviewStats | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'recent' | 'rating_high' | 'rating_low'>('recent');

  const isAuthenticated = useIsAuthenticated();

  // Charger les avis
  const loadReviews = async (page: number = 1, sort: string = sortBy) => {
    try {
      setIsLoading(true);
      const data = await supplierReviewsService.getSupplierReviews(fournisseurId, page, 10, sort as any);
      setReviews(data.reviews);
      setStats(data.stats);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erreur chargement avis fournisseur:', error);
      toast.error('Erreur lors du chargement des avis');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const data = await supplierReviewsService.getSupplierStats(fournisseurId);
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats fournisseur:', error);
    }
  };

  useEffect(() => {
    loadReviews(1, sortBy);
  }, [fournisseurId, sortBy]);

  // Soumettre un avis
  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour noter ce fournisseur');
      return;
    }

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
      const result = await supplierReviewsService.addSupplierReview({
        fournisseur_id: fournisseurId,
        note: newReview.rating,
        commentaire: newReview.comment
      });

      toast.success(result.message);
      setNewReview({ rating: 0, comment: '' });
      setShowReviewForm(false);
      
      onReviewAdded?.();
      loadReviews(1, sortBy);
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout de l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Signaler un avis
  const handleReportReview = async (reviewId: number) => {
    try {
      await supplierReviewsService.reportSupplierReview(reviewId, 'inapproprié');
      toast.success('Avis signalé avec succès');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors du signalement');
    }
  };

  // Calculer la note moyenne
  const averageRating = stats ? supplierReviewsService.calculateAverageRating(stats) : 0;

  // Rendu des étoiles
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Avis sur {fournisseurNom}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Mode démonstration - Les avis sont simulés
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mt-1">
                  {renderStars(Math.round(averageRating), 'lg')}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {stats?.nombre_avis || 0} avis
                </div>
              </div>
              
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats?.distribution?.[rating] || 0;
                  const percentage = stats?.nombre_avis ? (count / stats.nombre_avis) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="w-3">{rating}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-gray-600">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {isAuthenticated && (
              <Button 
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Star className="w-4 h-4 mr-2" />
                Noter ce fournisseur
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'avis */}
      {showReviewForm && (
        <Card>
          <CardHeader>
            <CardTitle>Donner votre avis sur {fournisseurNom}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Note</label>
              <StarRating 
                rating={newReview.rating}
                onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                size="lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Commentaire</label>
              <Textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Partagez votre expérience avec ce fournisseur..."
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Publication...' : 'Publier l\'avis'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(false)}
              >
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des avis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Avis récents</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
              >
                Récents
              </Button>
              <Button
                variant={sortBy === 'rating_high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('rating_high')}
              >
                Meilleures notes
              </Button>
              <Button
                variant={sortBy === 'rating_low' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('rating_low')}
              >
                Moins bonnes notes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {review.acheteur_nom} {review.acheteur_prenom}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.note)}
                        <span className="text-sm text-gray-600">
                          {review.note}/5
                        </span>
                      </div>
                      <p className="text-gray-700">{review.commentaire}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReportReview(review.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun avis pour ce fournisseur</p>
              <p className="text-sm text-gray-400 mt-1">
                Soyez le premier à donner votre avis !
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
