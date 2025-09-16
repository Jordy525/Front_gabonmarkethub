import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/services/api';

interface Review {
  id: number;
  utilisateur_nom: string;
  note: number;
  commentaire: string;
  date_creation: string;
  verified_purchase?: boolean;
}

interface ProductReviewsProps {
  productId: number;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onReviewAdded: () => void;
}

export const ProductReviews = ({ 
  productId, 
  reviews, 
  averageRating, 
  totalReviews,
  onReviewAdded 
}: ProductReviewsProps) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (newReview.rating === 0) {
      toast.error('Veuillez donner une note');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Veuillez écrire un commentaire');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post('/products/reviews', {
        produit_id: productId,
        note: newReview.rating,
        commentaire: newReview.comment
      });

      toast.success('Avis ajouté avec succès');
      setNewReview({ rating: 0, comment: '' });
      setShowReviewForm(false);
      onReviewAdded();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout de l\'avis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedReviews = reviews.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {(averageRating || 0).toFixed(1)}
          </div>
          <StarRating rating={averageRating} readonly size="lg" />
          <div className="text-sm text-gray-600 mt-1">
            {totalReviews} avis
          </div>
        </div>
        
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter(r => Math.floor(r.note) === stars).length;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            
            return (
              <div key={stars} className="flex items-center gap-2 mb-1">
                <span className="text-sm w-3">{stars}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Avis clients</h3>
        <Button 
          onClick={() => setShowReviewForm(!showReviewForm)}
          variant="outline"
        >
          Laisser un avis
        </Button>
      </div>

      {showReviewForm && (
        <Card>
          <CardHeader>
            <h4 className="font-semibold">Donner votre avis</h4>
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
                placeholder="Partagez votre expérience avec ce produit..."
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                className="bg-gabon-green hover:bg-gabon-green/90"
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

      <div className="space-y-4">
        {displayedReviews.length > 0 ? (
          displayedReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {review.utilisateur_nom.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{review.utilisateur_nom}</span>
                      {review.verified_purchase && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Achat vérifié
                        </span>
                      )}
                    </div>
                    
                    <StarRating rating={review.note} readonly size="sm" />
                    
                    <p className="text-gray-700 mt-2">{review.commentaire}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun avis pour ce produit.</p>
            <p className="text-sm mt-1">Soyez le premier à laisser un avis!</p>
          </div>
        )}
      </div>

      {reviews.length > 5 && (
        <div className="text-center">
          <Button variant="outline">
            Voir tous les {totalReviews} avis
          </Button>
        </div>
      )}
    </div>
  );
};