import { useState, useEffect, useCallback } from 'react';
import type { AuthUser, LoginRequest, LoginResponse, ApiResponse } from '@/types/api';
import { API_BASE_URL } from '@/config/constants';
import { isTokenValid, getTokenInfo, cleanupInvalidTokens } from '@/utils/tokenValidator';

// État global partagé pour l'authentification
let globalAuthState = {
  user: null as AuthUser | null,
  isAuthenticated: false,
  isLoading: true,
  token: null as string | null
};

const authListeners = new Set<() => void>();

const notifyAuthListeners = () => {
  authListeners.forEach(listener => listener());
};

const updateGlobalAuthState = (updates: Partial<typeof globalAuthState>) => {
  globalAuthState = { ...globalAuthState, ...updates };
  notifyAuthListeners();
};

interface UseCurrentUserReturn {
  data: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

/**
 * Hook pour récupérer l'utilisateur actuel
 */
export const useCurrentUser = (): UseCurrentUserReturn => {
  const [data, setData] = useState<AuthUser | null>(globalAuthState.user);
  const [isLoading, setIsLoading] = useState(globalAuthState.isLoading);
  const [error, setError] = useState<string | null>(null);

  // S'abonner aux changements de l'état global
  useEffect(() => {
    const listener = () => {
      setData(globalAuthState.user);
      setIsLoading(globalAuthState.isLoading);
    };
    
    authListeners.add(listener);
    return () => {
      authListeners.delete(listener);
    };
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      updateGlobalAuthState({ isLoading: true });
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        updateGlobalAuthState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expiré ou invalide - mais on ne supprime que si on est sûr
          console.warn('🚫 Token invalide détecté, suppression du localStorage');
          localStorage.removeItem('authToken');
          updateGlobalAuthState({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }
        // Pour les autres erreurs, on ne supprime pas le token
        console.warn(`⚠️ Erreur ${response.status} lors de la vérification utilisateur:`, response.statusText);
        updateGlobalAuthState({ isLoading: false });
        return;
      }

      const user = await response.json();
      
      // Le backend renvoie directement l'objet utilisateur
      if (user && user.id) {
        updateGlobalAuthState({ user, isAuthenticated: true, isLoading: false });
      } else {
        throw new Error('Données utilisateur invalides');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur récupération utilisateur:', errorMessage);
      setError(errorMessage);
      
      // Ne pas supprimer le token sur les erreurs réseau
      if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Failed to fetch')) {
        console.warn('⚠️ Erreur réseau - token conservé');
        updateGlobalAuthState({ isLoading: false });
      } else {
        // Seulement pour les vraies erreurs d'authentification
        updateGlobalAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    }
  }, []);

  // Initialisation une seule fois
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // Vérifier d'abord si le token est valide côté client
      if (!isTokenValid(token)) {
        console.warn('🚫 Token expiré détecté côté client, suppression');
        localStorage.removeItem('authToken');
        updateGlobalAuthState({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      const tokenInfo = getTokenInfo(token);
      console.log('🔍 Token trouvé, expire dans:', Math.floor(tokenInfo?.timeRemaining || 0 / 60), 'minutes');
      
      if (!globalAuthState.user) {
        fetchUser();
      }
    } else {
      console.log('🔍 Aucun token trouvé');
      updateGlobalAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, [fetchUser]);

  // Écouter les changements de token
  useEffect(() => {
    const handleTokenChange = () => {
      fetchUser();
    };

    window.addEventListener('tokenChanged', handleTokenChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'authToken') {
        fetchUser();
      }
    });

    return () => {
      window.removeEventListener('tokenChanged', handleTokenChange);
      window.removeEventListener('storage', handleTokenChange);
    };
  }, [fetchUser]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchUser
  };
};

/**
 * Hook principal d'authentification
 */
export const useAuth = (): UseAuthReturn => {
  const { data: user, isLoading, error, refetch } = useCurrentUser();
  const [authError, setAuthError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      setAuthError(null);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Erreur de connexion');
      }

      // Stocker le token
      if (result.token) {
        localStorage.setItem('authToken', result.token);
        
        // Mettre à jour l'état global immédiatement avec les données de connexion
        if (result.user) {
          updateGlobalAuthState({ 
            user: result.user, 
            isAuthenticated: true, 
            isLoading: false,
            token: result.token
          });
        }
        
        // Déclencher l'événement pour notifier les autres hooks
        window.dispatchEvent(new Event('tokenChanged'));
        
        // Rafraîchir les données utilisateur pour avoir les données complètes
        setTimeout(() => refetch(), 100);
      }

      // Adapter la réponse au format attendu
      const adaptedResult: LoginResponse = {
        success: true,
        data: {
          user: result.user,
          token: result.token,
          expires_in: 24 * 60 * 60 // 24h en secondes
        },
        message: result.message
      };

      return adaptedResult;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setAuthError(errorMessage);
      throw err;
    }
  }, [refetch]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setAuthError(null);
    
    // Mettre à jour l'état global immédiatement
    updateGlobalAuthState({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false,
      token: null
    });
    
    // Déclencher l'événement pour notifier les autres hooks
    window.dispatchEvent(new Event('tokenChanged'));
  }, []);

  return {
    user,
    isAuthenticated: globalAuthState.isAuthenticated,
    isLoading,
    error: error || authError,
    login,
    logout,
    refetchUser: refetch
  };
};

// Hook simplifié pour vérifier si l'utilisateur est connecté
export const useIsAuthenticated = (): boolean => {
  const [isAuthenticated, setIsAuthenticated] = useState(globalAuthState.isAuthenticated);

  useEffect(() => {
    const listener = () => {
      setIsAuthenticated(globalAuthState.isAuthenticated);
    };
    
    authListeners.add(listener);
    return () => {
      authListeners.delete(listener);
    };
  }, []);

  return isAuthenticated;
};

// Hook pour récupérer seulement le token
export const useAuthToken = (): string | null => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    setToken(storedToken);

    // Écouter les changements de localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        setToken(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return token;
};

// Hook simplifié pour la déconnexion (alias pour compatibilité)
export const useLogout = () => {
  const { logout } = useAuth();
  return logout;
};

// Hook simplifié pour la connexion
export const useLogin = () => {
  const { login } = useAuth();
  return login;
};

// Hook pour l'inscription
export const useRegister = () => {
  const register = useCallback(async (userData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (!response.ok) {
        // Le backend retourne { error: "message" } pour les erreurs
        throw new Error(result.error || result.message || 'Erreur lors de l\'inscription');
      }

      // Succès - le backend retourne { message, token, user }
      return result;
    } catch (error) {
      console.error('Erreur inscription:', error);
      throw error;
    }
  }, []);

  return { register };
};

// Hook pour mettre à jour le profil
export const useUpdateProfile = () => {
  const { refetchUser } = useAuth();
  
  const updateProfile = useCallback(async (profileData: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la mise à jour du profil');
      }

      // Rafraîchir les données utilisateur
      await refetchUser();

      return result;
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      throw error;
    }
  }, [refetchUser]);

  return { updateProfile };
};