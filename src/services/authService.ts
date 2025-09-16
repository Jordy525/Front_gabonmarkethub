import { apiClient, authUtils } from './api';
import type { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  ApiResponse 
} from '../types/api';

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);

    // Hydrater la session locale
    if (response.token) {
      authUtils.setToken(response.token);
    }
    if (response.user) {
      authUtils.setUserType(response.user.role_id);
      authUtils.setUserData(response.user);
    }

    return {
      message: response.message,
      data: {
        user: response.user,
        token: response.token
      }
    };
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', userData);

    // Hydrater session
    if (response.token) {
      authUtils.setToken(response.token);
    }
    if (response.user) {
      authUtils.setUserType(response.user.role_id);
      authUtils.setUserData(response.user);
    }

    return {
      message: response.message,
      data: {
        user: response.user,
        token: response.token
      }
    };
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignorer les erreurs de déconnexion côté serveur
    } finally {
      authUtils.removeToken();
      authUtils.clearUserMeta();
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data || response;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiClient.put<ApiResponse<User>>('/users/profile', userData);
    return response.data;
  }

  isAuthenticated(): boolean {
    return authUtils.isAuthenticated();
  }

  getToken(): string | null {
    return authUtils.getToken();
  }
}

export const authService = new AuthService();