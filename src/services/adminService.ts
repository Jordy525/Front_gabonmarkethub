import { apiClient, buildQueryString } from './api';
import type { ApiResponse } from '../types/api';

export interface AdminStats {
  total_fournisseurs: number;
  total_acheteurs: number;
}


export interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role_id: number;
  role_nom: string;
  statut: string;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  last_login: string;
  login_attempts: number;
  locked_until: string;
  suspension_reason: string;
  suspended_by: number;
  suspended_at: string;
  notes_admin: string;
  created_at: string;
  updated_at: string;
  nom_entreprise?: string;
  secteur_activite?: string;
  suspended_by_name?: string;
}

export interface CreateUserRequest {
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  mot_de_passe: string;
  role_id: number;
  statut?: string;
  email_verified?: boolean;
  notes_admin?: string;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  role?: number;
  statut?: string;
  search?: string;
  dateInscription?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export class AdminService {
  // Statistiques générales
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>('/admin/stats');
    return response;
  }


  // Gestion des utilisateurs
  async getUsers(filters?: UserFilters): Promise<{
    users: AdminUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    roleStats: any[];
  }> {
    const queryString = buildQueryString(filters || {});
    const response = await apiClient.get<{
      users: AdminUser[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      roleStats: any[];
    }>(`/admin/users${queryString}`);
    return response;
  }

  async createUser(userData: CreateUserRequest): Promise<{ message: string; user: AdminUser }> {
    const response = await apiClient.post<{ message: string; user: AdminUser }>('/admin/users', userData);
    return response;
  }

  async getUser(id: number): Promise<{
    user: AdminUser;
    auditLogs: any[];
    stats: {
      total_commandes: number;
      total_depense: number;
      commandes_en_attente: number;
    };
  }> {
    const response = await apiClient.get<{
      user: AdminUser;
      auditLogs: any[];
      stats: {
        total_commandes: number;
        total_depense: number;
        commandes_en_attente: number;
      };
    }>(`/admin/users/${id}`);
    return response;
  }

  async updateUser(id: number, userData: Partial<AdminUser>): Promise<{ message: string; user: AdminUser }> {
    const response = await apiClient.put<{ message: string; user: AdminUser }>(`/admin/users/${id}`, userData);
    return response;
  }

  async suspendUser(id: number, suspension_reason: string): Promise<{ message: string; user_id: number }> {
    const response = await apiClient.patch<{ message: string; user_id: number }>(`/admin/users/${id}/suspend`, {
      suspension_reason
    });
    return response;
  }

  async activateUser(id: number): Promise<{ message: string; user_id: number }> {
    const response = await apiClient.patch<{ message: string; user_id: number }>(`/admin/users/${id}/activate`);
    return response;
  }
}

export const adminService = new AdminService();