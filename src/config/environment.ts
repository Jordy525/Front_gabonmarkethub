// Configuration centralisée des URLs et variables d'environnement
// Ce fichier centralise toutes les URLs pour éviter les URLs codées en dur

// Variables d'environnement Vite
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key];
  return value || defaultValue || '';
};

// Configuration de l'API
export const API_CONFIG = {
  BASE_URL: getEnvVar('VITE_API_URL'),
  WS_URL: getEnvVar('VITE_WS_URL'),
  SOCKET_URL: getEnvVar('VITE_SOCKET_URL'),
} as const;

// Configuration des URLs d'images
export const IMAGE_CONFIG = {
  // URL de base pour les images du backend
  BACKEND_BASE_URL: getEnvVar('VITE_BACKEND_URL'),
  
  // Fonction utilitaire pour construire l'URL complète d'une image
  getImageUrl: (imagePath: string): string => {
    if (!imagePath) return '';
    
    // Si l'image est déjà une URL complète (http/https), la retourner telle quelle
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Sinon, construire l'URL complète avec le backend
    if (!API_CONFIG.BACKEND_BASE_URL) {
      console.error('VITE_BACKEND_URL n\'est pas définie dans les variables d\'environnement');
      return '';
    }
    return `${API_CONFIG.BACKEND_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  },
  
  // Fonction pour vérifier si une URL est valide
  isValidImageUrl: (url: string): boolean => {
    return !!(url && (url.startsWith('http://') || url.startsWith('https://')));
  }
} as const;

// Configuration des URLs de téléchargement
export const DOWNLOAD_CONFIG = {
  // URLs pour les téléchargements de documents
  ADMIN_DOCUMENTS: (docId: string) => `${API_CONFIG.BASE_URL}/admin/documents/${docId}/download`,
  SUPPLIER_DOCUMENTS: (docId: string) => `${API_CONFIG.BASE_URL}/supplier/documents/${docId}/download`,
  USER_DOCUMENTS: (docId: string) => `${API_CONFIG.BASE_URL}/user/documents/${docId}/download`,
} as const;

// Configuration Socket.IO
export const SOCKET_CONFIG = {
  URL: API_CONFIG.SOCKET_URL,
  OPTIONS: {
    transports: ['websocket', 'polling'],
    timeout: 10000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    maxReconnectionDelay: 10000,
    reconnectionDelayGrowthFactor: 1.5
  }
} as const;

// Configuration des URLs de redirection
export const REDIRECT_CONFIG = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SUPPLIER_DASHBOARD: '/supplier/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  HOME: '/',
} as const;

// Configuration des URLs externes
export const EXTERNAL_CONFIG = {
  // URLs de fallback pour les images
  FALLBACK_IMAGES: {
    PRODUCT: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop',
    USER: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    COMPANY: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
  }
} as const;

// Fonction utilitaire pour construire des URLs avec paramètres
export const buildUrl = (baseUrl: string, params: Record<string, any> = {}): string => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
};

// Fonction utilitaire pour valider les URLs
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Export de toutes les configurations
export const ENV_CONFIG = {
  API: API_CONFIG,
  IMAGE: IMAGE_CONFIG,
  DOWNLOAD: DOWNLOAD_CONFIG,
  SOCKET: SOCKET_CONFIG,
  REDIRECT: REDIRECT_CONFIG,
  EXTERNAL: EXTERNAL_CONFIG,
} as const;
