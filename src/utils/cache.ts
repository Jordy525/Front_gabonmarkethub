import React from 'react';

// Système de cache simple pour les données de messagerie

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Si le cache est plein, supprimer les éléments les plus anciens
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Vérifier si l'élément a expiré
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Vérifier si l'élément a expiré
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Nettoyer les éléments expirés
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    // Si le cache est encore trop plein, supprimer les plus anciens
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  // Obtenir les statistiques du cache
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instance globale du cache
export const messageCache = new SimpleCache(200);

// Clés de cache standardisées
export const CacheKeys = {
  conversations: (userId: number, filters?: string) => 
    `conversations:${userId}${filters ? `:${filters}` : ''}`,
  messages: (conversationId: number, page: number = 1) => 
    `messages:${conversationId}:${page}`,
  unreadCount: (userId: number) => `unread:${userId}`,
  typingUsers: (conversationId: number) => `typing:${conversationId}`,
  userProfile: (userId: number) => `user:${userId}`,
  conversationDetails: (conversationId: number) => `conversation:${conversationId}`
};

// Hook pour utiliser le cache avec React Query-like behavior
export const useCachedData = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      // Vérifier le cache d'abord
      const cachedData = messageCache.get<T>(key);
      if (cachedData) {
        setData(cachedData);
        return;
      }

      // Sinon, récupérer les données
      setLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        messageCache.set(key, result, ttl);
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [key, ttl]);

  const invalidate = React.useCallback(() => {
    messageCache.delete(key);
  }, [key]);

  const refetch = React.useCallback(async () => {
    messageCache.delete(key);
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      messageCache.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);

  return { data, loading, error, invalidate, refetch };
};

// Utilitaires pour la gestion du cache
export const CacheUtils = {
  // Invalider toutes les conversations d'un utilisateur
  invalidateUserConversations: (userId: number) => {
    const keys = messageCache.getStats().keys;
    keys.forEach(key => {
      if (key.startsWith(`conversations:${userId}`)) {
        messageCache.delete(key);
      }
    });
  },

  // Invalider tous les messages d'une conversation
  invalidateConversationMessages: (conversationId: number) => {
    const keys = messageCache.getStats().keys;
    keys.forEach(key => {
      if (key.startsWith(`messages:${conversationId}`)) {
        messageCache.delete(key);
      }
    });
  },

  // Invalider le cache d'un utilisateur spécifique
  invalidateUser: (userId: number) => {
    const keys = messageCache.getStats().keys;
    keys.forEach(key => {
      if (key.includes(`:${userId}`) || key.includes(`${userId}:`)) {
        messageCache.delete(key);
      }
    });
  },

  // Nettoyer tout le cache de messagerie
  clearMessagingCache: () => {
    messageCache.clear();
  }
};

export default messageCache;