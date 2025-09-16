/**
 * Gestionnaire des erreurs de rate limiting (429)
 */

interface RateLimitError {
  status: number;
  message: string;
  retryAfter?: number;
  code?: string;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 seconde
  maxDelay: 30000, // 30 secondes
  backoffFactor: 2
};

/**
 * Attendre un délai spécifié
 */
const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Calculer le délai de retry avec backoff exponentiel
 */
const calculateRetryDelay = (
  attempt: number, 
  retryAfter?: number, 
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number => {
  // Si le serveur spécifie un retryAfter, l'utiliser
  if (retryAfter && retryAfter > 0) {
    return Math.min(retryAfter * 1000, config.maxDelay);
  }

  // Sinon, utiliser un backoff exponentiel
  const exponentialDelay = config.baseDelay * Math.pow(config.backoffFactor, attempt - 1);
  
  // Ajouter un peu de jitter pour éviter les thundering herds
  const jitter = Math.random() * 0.1 * exponentialDelay;
  
  return Math.min(exponentialDelay + jitter, config.maxDelay);
};

/**
 * Vérifier si une erreur est une erreur de rate limiting
 */
export const isRateLimitError = (error: any): error is RateLimitError => {
  return error && (error.status === 429 || error.response?.status === 429);
};

/**
 * Extraire les informations de rate limiting d'une réponse d'erreur
 */
export const extractRateLimitInfo = (error: any): { retryAfter?: number; message?: string } => {
  if (!isRateLimitError(error)) {
    return {};
  }

  const response = error.response || error;
  const headers = response.headers || {};
  
  // Essayer différents headers pour retryAfter
  const retryAfter = 
    headers['retry-after'] || 
    headers['x-ratelimit-reset'] || 
    response.data?.retryAfter ||
    error.retryAfter;

  const message = 
    response.data?.error || 
    response.data?.message || 
    error.message || 
    'Trop de requêtes, veuillez patienter';

  return {
    retryAfter: retryAfter ? parseInt(retryAfter.toString()) : undefined,
    message
  };
};

/**
 * Wrapper pour retry automatique avec gestion du rate limiting
 */
export const withRateLimitRetry = async <T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> => {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: any;

  for (let attempt = 1; attempt <= finalConfig.maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Si ce n'est pas une erreur de rate limiting, ne pas retry
      if (!isRateLimitError(error)) {
        throw error;
      }

      // Si c'est la dernière tentative, throw l'erreur
      if (attempt > finalConfig.maxRetries) {
        throw error;
      }

      const { retryAfter, message } = extractRateLimitInfo(error);
      const retryDelay = calculateRetryDelay(attempt, retryAfter, finalConfig);

      console.warn(`🚦 Rate limit atteint (tentative ${attempt}/${finalConfig.maxRetries}): ${message}`);
      console.warn(`⏳ Retry dans ${retryDelay}ms...`);

      await delay(retryDelay);
    }
  }

  throw lastError;
};

/**
 * Hook React pour gérer les erreurs de rate limiting
 */
export const useRateLimitHandler = () => {
  const handleRateLimitError = (error: any): boolean => {
    if (isRateLimitError(error)) {
      const { retryAfter, message } = extractRateLimitInfo(error);
      
      // Afficher une notification à l'utilisateur
      console.warn('🚦 Rate limit:', message);
      
      // Vous pouvez ici déclencher une notification toast
      // toast.warning(message, { duration: retryAfter ? retryAfter * 1000 : 5000 });
      
      return true;
    }
    return false;
  };

  return { handleRateLimitError };
};

/**
 * Intercepteur Axios pour gérer automatiquement les erreurs 429
 */
export const createRateLimitInterceptor = (axiosInstance: any, config: Partial<RetryConfig> = {}) => {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };

  axiosInstance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      const originalRequest = error.config;

      // Éviter les boucles infinies
      if (originalRequest._retryCount >= finalConfig.maxRetries) {
        return Promise.reject(error);
      }

      if (isRateLimitError(error) && !originalRequest._isRetry) {
        originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
        originalRequest._isRetry = true;

        const { retryAfter } = extractRateLimitInfo(error);
        const retryDelay = calculateRetryDelay(originalRequest._retryCount, retryAfter, finalConfig);

        console.warn(`🚦 Rate limit sur ${originalRequest.url} - Retry dans ${retryDelay}ms`);

        await delay(retryDelay);
        return axiosInstance(originalRequest);
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Classe pour gérer un pool de requêtes avec rate limiting
 */
export class RateLimitedRequestPool {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsPerSecond: number;
  private lastRequestTime = 0;

  constructor(requestsPerSecond: number = 10) {
    this.requestsPerSecond = requestsPerSecond;
  }

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const minInterval = 1000 / this.requestsPerSecond;

      if (timeSinceLastRequest < minInterval) {
        await delay(minInterval - timeSinceLastRequest);
      }

      const request = this.queue.shift();
      if (request) {
        this.lastRequestTime = Date.now();
        try {
          await request();
        } catch (error) {
          console.error('Erreur dans le pool de requêtes:', error);
        }
      }
    }

    this.processing = false;
  }
}

export default {
  isRateLimitError,
  extractRateLimitInfo,
  withRateLimitRetry,
  useRateLimitHandler,
  createRateLimitInterceptor,
  RateLimitedRequestPool
};