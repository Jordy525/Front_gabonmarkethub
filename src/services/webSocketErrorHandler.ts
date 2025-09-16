/**
 * Gestionnaire d'erreurs centralisé pour les connexions WebSocket/Socket.IO
 */

export interface WebSocketError extends Error {
  code?: string;
  type?: 'namespace' | 'authentication' | 'connection' | 'timeout' | 'configuration';
  context?: Record<string, any>;
}

export class WebSocketErrorHandler {
  private static instance: WebSocketErrorHandler;
  private errorCounts: Map<string, number> = new Map();
  private lastErrors: Map<string, Date> = new Map();

  static getInstance(): WebSocketErrorHandler {
    if (!WebSocketErrorHandler.instance) {
      WebSocketErrorHandler.instance = new WebSocketErrorHandler();
    }
    return WebSocketErrorHandler.instance;
  }

  /**
   * Gère les erreurs de namespace Socket.IO
   */
  handleNamespaceError(error: Error, context: { url: string }): void {
    const enhancedError: WebSocketError = {
      ...error,
      type: 'namespace',
      context
    };

    this.logError(enhancedError, 'NAMESPACE_ERROR');
    
    console.error('❌ Erreur de namespace Socket.IO détectée:', {
      message: error.message,
      url: context.url,
      solution: 'Vérifiez que l\'URL WebSocket ne contient pas /api et correspond à la configuration serveur'
    });
  }

  /**
   * Gère les erreurs d'authentification
   */
  handleAuthenticationError(error: Error, context: { token?: string }): void {
    const enhancedError: WebSocketError = {
      ...error,
      type: 'authentication',
      context: { hasToken: !!context.token }
    };

    this.logError(enhancedError, 'AUTH_ERROR');
    
    console.error('🔐 Erreur d\'authentification Socket.IO:', {
      message: error.message,
      hasToken: !!context.token,
      solution: 'Vérifiez que le token JWT est valide et non expiré'
    });
  }

  /**
   * Gère les erreurs de connexion générale
   */
  handleConnectionError(error: Error, context: { url: string; attempts: number }): void {
    const enhancedError: WebSocketError = {
      ...error,
      type: 'connection',
      context
    };

    this.logError(enhancedError, 'CONNECTION_ERROR');
    
    if (context.attempts <= 3) {
      console.warn('⚠️ Erreur de connexion Socket.IO (tentative ' + context.attempts + '):', {
        message: error.message,
        url: context.url
      });
    } else {
      console.error('❌ Échec de connexion Socket.IO après plusieurs tentatives:', {
        message: error.message,
        url: context.url,
        attempts: context.attempts,
        solution: 'Vérifiez que le serveur Socket.IO est démarré et accessible'
      });
    }
  }

  /**
   * Gère les erreurs de timeout
   */
  handleConnectionTimeout(error: Error, context: { url: string; timeout: number }): void {
    const enhancedError: WebSocketError = {
      ...error,
      type: 'timeout',
      context
    };

    this.logError(enhancedError, 'TIMEOUT_ERROR');
    
    console.error('⏱️ Timeout de connexion Socket.IO:', {
      message: error.message,
      url: context.url,
      timeout: context.timeout,
      solution: 'Le serveur met trop de temps à répondre. Vérifiez la connectivité réseau.'
    });
  }

  /**
   * Gère les erreurs de configuration
   */
  handleConfigurationError(error: Error, context: Record<string, any>): void {
    const enhancedError: WebSocketError = {
      ...error,
      type: 'configuration',
      context
    };

    this.logError(enhancedError, 'CONFIG_ERROR');
    
    console.error('⚙️ Erreur de configuration Socket.IO:', {
      message: error.message,
      context,
      solution: 'Vérifiez les variables d\'environnement et la configuration Socket.IO'
    });
  }

  /**
   * Détermine si une erreur justifie une nouvelle tentative de connexion
   */
  shouldRetry(error: Error): boolean {
    // Ne pas réessayer pour les erreurs de configuration
    if (error.message.includes('Invalid namespace')) {
      return false;
    }

    // Ne pas réessayer pour les erreurs d'authentification
    if (error.message.includes('Token') || error.message.includes('Authentication')) {
      return false;
    }

    // Réessayer pour les erreurs de connexion temporaires
    return true;
  }

  /**
   * Calcule le délai de backoff exponentiel
   */
  calculateBackoffDelay(attempt: number, baseDelay: number = 1000): number {
    const maxDelay = 30000; // 30 secondes maximum
    const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    
    // Ajouter un peu de jitter pour éviter les reconnexions simultanées
    const jitter = Math.random() * 0.1 * delay;
    return delay + jitter;
  }

  /**
   * Enregistre l'erreur avec contexte structuré
   */
  private logError(error: WebSocketError, category: string): void {
    const errorKey = `${category}_${error.type || 'unknown'}`;
    const now = new Date();
    
    // Compter les erreurs
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);
    this.lastErrors.set(errorKey, now);

    // Log structuré pour le débogage
    const logData = {
      timestamp: now.toISOString(),
      category,
      type: error.type,
      message: error.message,
      context: error.context,
      count: count + 1,
      stack: error.stack
    };

    // En mode développement, afficher plus de détails
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.group(`🔍 Détails de l'erreur WebSocket`);
      console.table(logData);
      console.groupEnd();
    }
  }

  /**
   * Obtient les statistiques d'erreurs
   */
  getErrorStats(): Record<string, { count: number; lastOccurrence: Date }> {
    const stats: Record<string, { count: number; lastOccurrence: Date }> = {};
    
    for (const [key, count] of this.errorCounts.entries()) {
      const lastOccurrence = this.lastErrors.get(key);
      if (lastOccurrence) {
        stats[key] = { count, lastOccurrence };
      }
    }
    
    return stats;
  }

  /**
   * Remet à zéro les compteurs d'erreurs
   */
  resetErrorCounts(): void {
    this.errorCounts.clear();
    this.lastErrors.clear();
  }

  /**
   * Crée un message d'erreur utilisateur-friendly
   */
  createUserFriendlyMessage(error: WebSocketError): string {
    switch (error.type) {
      case 'namespace':
        return 'Problème de configuration de la messagerie. Veuillez rafraîchir la page.';
      
      case 'authentication':
        return 'Session expirée. Veuillez vous reconnecter.';
      
      case 'connection':
        return 'Problème de connexion au serveur. Vérifiez votre connexion internet.';
      
      case 'timeout':
        return 'Le serveur met trop de temps à répondre. Veuillez réessayer.';
      
      case 'configuration':
        return 'Problème de configuration. Contactez le support technique.';
      
      default:
        return 'Problème de connexion temporaire. La messagerie temps réel pourrait être indisponible.';
    }
  }
}

// Instance singleton exportée
export const webSocketErrorHandler = WebSocketErrorHandler.getInstance();