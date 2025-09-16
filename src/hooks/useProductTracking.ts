import { useEffect, useRef } from 'react';
import { analyticsService } from '@/services/analyticsService';

interface UseProductTrackingOptions {
  productId: number;
  trackView?: boolean;
  trackClicks?: boolean;
  delay?: number; // Délai en ms avant d'enregistrer la vue
}

export const useProductTracking = ({
  productId,
  trackView = true,
  trackClicks = true,
  delay = 2000
}: UseProductTrackingOptions) => {
  const hasTrackedView = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Enregistrer une vue après un délai
  useEffect(() => {
    if (!trackView || !productId || hasTrackedView.current) {
      return;
    }

    // Annuler le timeout précédent s'il existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Enregistrer la vue après le délai
    timeoutRef.current = setTimeout(async () => {
      try {
        await analyticsService.trackProductView(productId);
        hasTrackedView.current = true;
        console.log(`Vue enregistrée pour le produit ${productId}`);
      } catch (error) {
        console.error('Erreur enregistrement vue:', error);
      }
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [productId, trackView, delay]);

  // Fonction pour enregistrer un clic
  const trackClick = async (action: 'view' | 'favorite' | 'share' = 'view') => {
    if (!trackClicks || !productId) {
      return;
    }

    try {
      await analyticsService.trackProductClick(productId, action);
      console.log(`Clic enregistré pour le produit ${productId}, action: ${action}`);
    } catch (error) {
      console.error('Erreur enregistrement clic:', error);
    }
  };

  // Fonction pour enregistrer un clic sur un lien externe
  const trackExternalClick = (url: string, action: 'share' = 'share') => {
    trackClick(action);
    // Ouvrir le lien après avoir enregistré le clic
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return {
    trackClick,
    trackExternalClick,
    hasTrackedView: hasTrackedView.current
  };
};




