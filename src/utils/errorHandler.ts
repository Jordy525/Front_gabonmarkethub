// Gestionnaire d'erreurs centralisé pour l'application
import { toast } from 'sonner';

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class ErrorHandler {
  static handle(error: any, context?: string): void {
    console.error(`[${context || 'App'}] Error:`, error);

    const appError = this.parseError(error);
    
    // Gestion spécifique selon le type d'erreur
    switch (appError.status) {
      case 401:
        this.handleAuthError(appError);
        break;
      case 403:
        this.handleForbiddenError(appError);
        break;
      case 404:
        this.handleNotFoundError(appError, context);
        break;
      case 422:
        this.handleValidationError(appError);
        break;
      case 500:
        this.handleServerError(appError);
        break;
      default:
        this.handleGenericError(appError);
    }
  }

  private static parseError(error: any): AppError {
    if (error.response) {
      // Erreur HTTP avec réponse
      return {
        message: error.response.data?.message || error.response.data?.error || 'Erreur serveur',
        code: error.response.data?.code,
        status: error.response.status,
        details: error.response.data
      };
    }

    if (error.message) {
      // Erreur avec message
      return {
        message: error.message,
        status: error.status || 0
      };
    }

    // Erreur générique
    return {
      message: 'Une erreur inattendue s\'est produite',
      status: 0
    };
  }

  private static handleAuthError(error: AppError): void {
    toast.error('Session expirée. Veuillez vous reconnecter.');
    // Redirection vers login gérée par apiClient
  }

  private static handleForbiddenError(error: AppError): void {
    toast.error('Accès non autorisé à cette ressource.');
  }

  private static handleNotFoundError(error: AppError, context?: string): void {
    if (context === 'API_FALLBACK') {
      // Ne pas afficher d'erreur pour les fallbacks API
      return;
    }
    toast.error('Ressource non trouvée.');
  }

  private static handleValidationError(error: AppError): void {
    const message = error.details?.errors 
      ? Object.values(error.details.errors).flat().join(', ')
      : error.message;
    toast.error(`Erreur de validation: ${message}`);
  }

  private static handleServerError(error: AppError): void {
    toast.error('Erreur serveur. Veuillez réessayer plus tard.');
  }

  private static handleGenericError(error: AppError): void {
    toast.error(error.message || 'Une erreur s\'est produite');
  }

  // Utilitaire pour les erreurs de réseau
  static isNetworkError(error: any): boolean {
    return !error.response && error.message && (
      error.message.includes('Network Error') ||
      error.message.includes('fetch') ||
      error.code === 'NETWORK_ERROR'
    );
  }

  // Utilitaire pour les erreurs de timeout
  static isTimeoutError(error: any): boolean {
    return error.code === 'ECONNABORTED' || 
           error.message?.includes('timeout');
  }

  // Wrapper pour les fonctions async avec gestion d'erreur
  static async withErrorHandling<T>(
    fn: () => Promise<T>,
    context?: string,
    fallback?: T
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error, context);
      return fallback;
    }
  }
}

// Hook pour la gestion d'erreurs dans les composants
export const useErrorHandler = () => {
  return {
    handleError: (error: any, context?: string) => ErrorHandler.handle(error, context),
    withErrorHandling: <T>(fn: () => Promise<T>, context?: string, fallback?: T) => 
      ErrorHandler.withErrorHandling(fn, context, fallback)
  };
};