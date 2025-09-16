// Configuration et utilitaires pour les appels API

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private getAuthHeadersOnly(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Ne pas ajouter Content-Type si c'est FormData (le navigateur le fait automatiquement)
    const isFormData = options.body instanceof FormData;
    
    const config: RequestInit = {
      headers: isFormData ? this.getAuthHeadersOnly() : this.getAuthHeaders(),
      ...options,
    };

    try {
      // Ajouter un timeout de 10 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // 401: ne pas supprimer le token automatiquement pour éviter les déconnexions immédiates
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Non autorisé');
      }
      
      if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        
        // Si c'est un token invalide, nettoyer et rediriger
        if (errorData.error === 'Token invalide') {
          authUtils.removeToken();
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const publicPaths = ['/login', '/register', '/user-type', '/'];
            if (!publicPaths.includes(currentPath)) {
              window.location.href = '/login';
            }
          }
          throw new Error('Token invalide, veuillez vous reconnecter');
        }
        
        // Pour les autres erreurs 403, ne pas déconnecter automatiquement
        throw new Error(errorData.error || errorData.message || 'Accès refusé');
      }
      
      if (!response.ok) {
        let errorData = {};
        try {
          const responseText = await response.text();
          console.error(`❌ [ApiClient] Erreur ${response.status} pour ${url}:`, responseText);
          if (responseText) {
            errorData = JSON.parse(responseText);
          }
        } catch {
          // Si le parsing JSON échoue, utiliser le texte brut
          errorData = { message: `Erreur HTTP ${response.status}` };
        }
        
        const errorMessage = errorData.error || errorData.message || `Erreur HTTP ${response.status}`;
        console.error(`❌ [ApiClient] Message d'erreur final:`, errorMessage);
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      if (!responseText) {
        return {}; // Réponse vide
      }
      
      try {
        const data = JSON.parse(responseText);
        return data;
      } catch (error) {
        console.error('Erreur parsing JSON:', responseText);
        throw new Error('Réponse invalide du serveur (JSON invalide)');
      }
    } catch (error) {
      console.error('API request failed:', error);
      
      // Gestion spécifique des erreurs de timeout et de réseau
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Délai d\'attente dépassé. Vérifiez votre connexion internet.');
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw new Error('Erreur de connexion réseau. Vérifiez votre connexion internet.');
        }
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

// Alias pour la compatibilité avec les imports existants
export const api = apiClient;

// Utilitaires pour la gestion des tokens
export const authUtils = {
  setToken: (token: string) => {
    // Normaliser le token: retirer un éventuel préfixe 'Bearer '
    let normalized = token?.trim() || '';
    if (normalized.toLowerCase().startsWith('bearer ')) {
      normalized = normalized.slice(7).trim();
    }
    localStorage.setItem('authToken', normalized);
  },
  
  getToken: (): string | null => {
    const stored = localStorage.getItem('authToken');
    if (!stored) return null;
    let token = stored.trim();
    // Retirer des guillemets accidentels
    if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
      token = token.slice(1, -1).trim();
    }
    // Retirer un préfixe Bearer éventuel
    if (token.toLowerCase().startsWith('bearer ')) {
      token = token.slice(7).trim();
    }
    return token;
  },
  
  removeToken: () => {
    localStorage.removeItem('authToken');
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
  
  // Gestion des méta-infos utilisateur pour l'UI
  setUserType: (roleId: number) => {
    const type = roleId === 2 ? 'supplier' : roleId === 3 ? 'admin' : 'buyer';
    localStorage.setItem('user_type', type);
  },
  getUserType: (): string | null => localStorage.getItem('user_type'),
  setUserData: (user: any) => localStorage.setItem('user_data', JSON.stringify(user || {})),
  getUserData: (): any => {
    try {
      const raw = localStorage.getItem('user_data');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  clearUserMeta: () => {
    localStorage.removeItem('user_type');
    localStorage.removeItem('user_data');
  }
};

// Utilitaires pour construire les URLs avec paramètres
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};