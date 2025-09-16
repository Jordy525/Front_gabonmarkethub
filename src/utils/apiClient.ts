interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

interface ApiError extends Error {
  status?: number;
  response?: {
    status: number;
    data: any;
    statusText: string;
  };
  request?: any;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultRetries: number;
  private defaultRetryDelay: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 10000;
    this.defaultRetries = config.retries || 3;
    this.defaultRetryDelay = config.retryDelay || 1000;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  private async executeRequest<T>(
    url: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.timeout,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      ...fetchConfig
    } = config;

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    // Ajouter le token d'authentification automatiquement
    const token = localStorage.getItem('authToken');
    const headers = new Headers(fetchConfig.headers);
    
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    if (!headers.has('Content-Type') && fetchConfig.body && typeof fetchConfig.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    const requestConfig: RequestInit = {
      ...fetchConfig,
      headers
    };

    let lastError: ApiError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const fetchPromise = fetch(fullUrl, requestConfig);
        const timeoutPromise = this.createTimeoutPromise(timeout);
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        // Vérifier si la réponse est ok
        if (!response.ok) {
          let errorData: any;
          
          try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              errorData = await response.json();
            } else {
              errorData = { error: await response.text() };
            }
          } catch {
            errorData = { error: response.statusText };
          }

          const error: ApiError = new Error(errorData.error || `HTTP ${response.status}`);
          error.status = response.status;
          error.response = {
            status: response.status,
            data: errorData,
            statusText: response.statusText
          };

          throw error;
        }

        // Parser la réponse
        let data: T;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text() as unknown as T;
        }

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        };

      } catch (error) {
        lastError = error as ApiError;
        
        // Ne pas retry pour certaines erreurs
        if (lastError.status && [400, 401, 403, 404, 422].includes(lastError.status)) {
          throw lastError;
        }

        // Si c'est la dernière tentative, throw l'erreur
        if (attempt === retries) {
          throw lastError;
        }

        // Attendre avant le retry avec backoff exponentiel
        const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await this.delay(Math.min(delay, 10000)); // Max 10s
      }
    }

    throw lastError!;
  }

  async get<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, { ...config, method: 'GET' });
  }

  async post<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.executeRequest<T>(url, { ...config, method: 'POST', body });
  }

  async put<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.executeRequest<T>(url, { ...config, method: 'PUT', body });
  }

  async patch<T = any>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return this.executeRequest<T>(url, { ...config, method: 'PATCH', body });
  }

  async delete<T = any>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, { ...config, method: 'DELETE' });
  }

  // Méthodes utilitaires
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  setDefaultRetries(retries: number): void {
    this.defaultRetries = retries;
  }

  // Intercepteurs (optionnel)
  private requestInterceptors: Array<(config: RequestConfig) => RequestConfig> = [];
  private responseInterceptors: Array<(response: ApiResponse) => ApiResponse> = [];

  addRequestInterceptor(interceptor: (config: RequestConfig) => RequestConfig): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: ApiResponse) => ApiResponse): void {
    this.responseInterceptors.push(interceptor);
  }
}

// Instance par défaut
export const apiClient = new ApiClient({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000
});

// Hook React pour utiliser l'API client
import { useState, useCallback } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export function useApi<T = any>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (
    requestFn: () => Promise<ApiResponse<T>>
  ): Promise<T> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await requestFn();
      setState({ data: response.data, loading: false, error: null });
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({ ...prev, loading: false, error: apiError }));
      throw apiError;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
}

// Utilitaires pour les erreurs communes
export const isNetworkError = (error: ApiError): boolean => {
  return !error.status || error.message.includes('fetch') || error.message.includes('network');
};

export const isAuthError = (error: ApiError): boolean => {
  return error.status === 401;
};

export const isValidationError = (error: ApiError): boolean => {
  return error.status === 422 || error.status === 400;
};

export const isServerError = (error: ApiError): boolean => {
  return error.status ? error.status >= 500 : false;
};

export default apiClient;