import { apiClient } from './api';
import type { 
  Entreprise, 
  ApiResponse
} from '../types/api';

export interface CreateEntrepriseRequest {
  nom_entreprise: string;
  description?: string;
  site_web?: string;
  telephone_professionnel?: string;
  secteur_activite_id: number;
  type_entreprise_id: number;
  annee_creation?: number;
  nombre_employes?: number;
  adresse_ligne1: string;
  adresse_ligne2?: string;
  ville: string;
  code_postal: string;
  pays?: string;
  numero_siret: string;
  numero_registre_commerce?: string;
  numero_tva?: string;
  capacite_production?: string;
  certifications?: string;
  nom_banque?: string;
  iban?: string;
  nom_titulaire_compte?: string;
  bic_swift?: string;
}

export class EntrepriseService {
  async getEntreprises(): Promise<Entreprise[]> {
    const response = await apiClient.get<{ entreprises: Entreprise[] }>('/entreprises');
    return response.entreprises || [];
  }

  async getEntreprise(id: number): Promise<Entreprise> {
    const response = await apiClient.get<{ entreprise: Entreprise }>(`/entreprises/${id}`);
    return response.entreprise;
  }

  async getMyEntreprise(): Promise<Entreprise> {
    const response = await apiClient.get<Entreprise>('/entreprises/me');
    return response;
  }

  async createEntreprise(data: CreateEntrepriseRequest): Promise<Entreprise> {
    const response = await apiClient.post<ApiResponse<Entreprise>>('/entreprises', data);
    return response.data;
  }

  async updateEntreprise(id: number, data: Partial<CreateEntrepriseRequest>): Promise<Entreprise> {
    const response = await apiClient.put<ApiResponse<Entreprise>>(`/entreprises/${id}`, data);
    return response.data;
  }

  async updateMyEntreprise(data: Partial<CreateEntrepriseRequest>): Promise<Entreprise> {
    const response = await apiClient.put<ApiResponse<Entreprise>>('/entreprises/me', data);
    return response.data;
  }

  async uploadLogo(file: File): Promise<{ logo_url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await apiClient.request<{ logo_url: string }>('/entreprises/me/logo', {
      method: 'POST',
      body: formData
    });
    
    return response;
  }

  async getEntrepriseStats(id?: number): Promise<{
    total_produits: number;
    total_commandes: number;
    chiffre_affaires: number;
    note_moyenne: number;
    nombre_avis: number;
  }> {
    const url = id ? `/entreprises/${id}/stats` : '/entreprises/me/stats';
    const response = await apiClient.get<{
      total_produits: number;
      total_commandes: number;
      chiffre_affaires: number;
      note_moyenne: number;
      nombre_avis: number;
    }>(url);
    
    return response;
  }

  // Récupérer les secteurs d'activité
  async getSecteurs(): Promise<{ id: number; nom: string }[]> {
    const response = await apiClient.get<{ secteurs: { id: number; nom: string }[] }>('/entreprises/secteurs');
    return response.secteurs || [];
  }

  // Récupérer les types d'entreprise
  async getTypesEntreprise(): Promise<{ id: number; nom: string }[]> {
    const response = await apiClient.get<{ types: { id: number; nom: string }[] }>('/entreprises/types');
    return response.types || [];
  }
}

export const entrepriseService = new EntrepriseService();