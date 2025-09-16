import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ApiError {
  error: string;
  details?: string;
}

interface ErrorResponse {
  response?: {
    status: number;
    data: ApiError;
  };
  request?: any;
  message?: string;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((error: ErrorResponse, context: string = '') => {
    console.error(`Erreur ${context}:`, error);
    
    let errorMessage = 'Une erreur inattendue s\'est produite';
    let shouldRedirect = false;
    
    if (error.response) {
      // Erreur HTTP avec réponse du serveur
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = data?.error || 'Données invalides';
          break;
        case 401:
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          shouldRedirect = true;
          break;
        case 403:
          errorMessage = 'Accès non autorisé à cette ressource';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 409:
          errorMessage = data?.error || 'Conflit de données';
          break;
        case 422:
          errorMessage = data?.error || 'Données de validation incorrectes';
          break;
        case 429:
          errorMessage = 'Trop de requêtes. Veuillez patienter quelques instants.';
          break;
        case 500:
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
          break;
        case 502:
          errorMessage = 'Service temporairement indisponible';
          break;
        case 503:
          errorMessage = 'Service en maintenance. Veuillez réessayer plus tard.';
          break;
        default:
          errorMessage = data?.error || `Erreur ${status}`;
      }
    } else if (error.request) {
      // Erreur réseau
      if (navigator.onLine === false) {
        errorMessage = 'Pas de connexion internet. Vérifiez votre connexion.';
      } else {
        errorMessage = 'Problème de connexion au serveur. Vérifiez votre connexion internet.';
      }
    } else {
      // Autre erreur
      errorMessage = error.message || errorMessage;
    }

    // Afficher le toast d'erreur
    toast({
      title: "Erreur",
      description: errorMessage,
      variant: "destructive",
    });

    // Redirection si nécessaire
    if (shouldRedirect) {
      // Nettoyer le localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Rediriger vers la page de connexion après un délai
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }

    return {
      message: errorMessage,
      status: error.response?.status,
      shouldRedirect
    };
  }, [toast]);

  const handleSuccess = useCallback((message: string, title: string = "Succès") => {
    toast({
      title,
      description: message,
    });
  }, [toast]);

  const handleWarning = useCallback((message: string, title: string = "Attention") => {
    toast({
      title,
      description: message,
      variant: "default", // ou créer un variant warning
    });
  }, [toast]);

  const handleInfo = useCallback((message: string, title: string = "Information") => {
    toast({
      title,
      description: message,
      variant: "default",
    });
  }, [toast]);

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo
  };
};