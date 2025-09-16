/**
 * Utilitaires pour valider les tokens JWT
 */

interface TokenPayload {
  id: number;
  email: string;
  role_id: number;
  iat: number;
  exp: number;
}

/**
 * Décoder un token JWT sans vérification de signature
 */
export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    console.error('Erreur décodage token:', error);
    return null;
  }
};

/**
 * Vérifier si un token est expiré
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

/**
 * Obtenir le temps restant avant expiration (en secondes)
 */
export const getTokenTimeRemaining = (token: string): number => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - currentTime);
};

/**
 * Vérifier si un token est valide (format et non expiré)
 */
export const isTokenValid = (token: string): boolean => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const payload = decodeToken(token);
  if (!payload) {
    return false;
  }

  return !isTokenExpired(token);
};

/**
 * Obtenir les informations du token
 */
export const getTokenInfo = (token: string) => {
  const payload = decodeToken(token);
  if (!payload) {
    return null;
  }

  return {
    userId: payload.id,
    email: payload.email,
    roleId: payload.role_id,
    issuedAt: new Date(payload.iat * 1000),
    expiresAt: new Date(payload.exp * 1000),
    isExpired: isTokenExpired(token),
    timeRemaining: getTokenTimeRemaining(token)
  };
};

/**
 * Nettoyer les tokens invalides du localStorage
 */
export const cleanupInvalidTokens = () => {
  const token = localStorage.getItem('authToken');
  if (token && !isTokenValid(token)) {
    console.warn('🧹 Suppression du token expiré');
    localStorage.removeItem('authToken');
    return true;
  }
  return false;
};