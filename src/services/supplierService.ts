import { apiClient } from './api';
import type { ApiResponse } from '../types/api';

export interface SupplierProfile {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  nom_complet: string;
  telephone_personnel: string;
  nom_entreprise: string;
  description?: string;
  site_web?: string;
  logo?: string;
  telephone_professionnel: string;
  adresse_ligne1: string;
  adresse_ligne2?: string;
  ville: string;
  code_postal: string;
  pays: string;
  numero_siret: string;
  numero_tva?: string;
  statut_verification: 'en_attente' | 'verifie' | 'rejete';
  date_inscription: string;
  secteur_activite?: string;
  type_entreprise?: string;
  annee_creation?: number;
  nombre_employes?: number;
  capacite_production?: string;
  certifications?: string;
  nom_banque?: string;
  iban?: string;
  nom_titulaire_compte?: string;
}

export interface SupplierStats {
  commandes: number;
  produits: number;
  clients: number;
  chiffre_affaires: number;
  messages: number;
  vues: number;
}

export interface SupplierDocument {
  id: number;
  entreprise_id: number;
  type_document: string;
  nom_fichier: string;
  chemin_fichier: string;
  taille_fichier: number;
  type_mime: string;
  statut_verification: 'en_attente' | 'verifie' | 'rejete';
  uploaded_at: string;
}

export interface SupplierProduct {
  id: number;
  nom: string;
  prix_unitaire: number;
  stock_disponible: number;
  moq: number;
  unite: string;
  statut: 'actif' | 'inactif' | 'brouillon';
  categorie_nom: string;
  image_principale?: string;
  note_moyenne: number;
  nombre_avis: number;
  date_creation: string;
  derniere_modification: string;
}

export interface CompleteProfileRequest {
  nom_entreprise: string;
  telephone_professionnel: string;
  site_web?: string;
  description?: string;
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

export interface SupplierRegistrationRequest extends CompleteProfileRequest {
  email: string;
  mot_de_passe: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  logo?: File;
}

export class SupplierService {
  // Profil fournisseur
  async getProfile(): Promise<SupplierProfile> {
    const response = await apiClient.get<{ data: SupplierProfile }>('/supplier/profile');
    return response.data;
  }

  async updateProfile(profileData: Partial<SupplierProfile>): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>('/supplier/profile', profileData);
    return response;
  }

  // Statistiques du dashboard
  async getDashboardStats(): Promise<SupplierStats> {
    const response = await apiClient.get<SupplierStats>('/supplier/dashboard/stats');
    return response;
  }

  async getSimpleStats(): Promise<SupplierStats> {
    const response = await apiClient.get<SupplierStats>('/supplier/stats-simple');
    return response;
  }

  // Produits du fournisseur
  async getProducts(): Promise<{ products: SupplierProduct[] }> {
    const response = await apiClient.get<{ products: SupplierProduct[] }>('/supplier/products');
    return response;
  }

  // Documents
  async getDocuments(): Promise<SupplierDocument[]> {
    const response = await apiClient.get<SupplierDocument[]>('/supplier/documents');
    return response || [];
  }

  async uploadDocument(file: File, type_document: string): Promise<{ message: string; filename: string }> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type_document', type_document);

    const response = await apiClient.request<{ message: string; filename: string }>('/supplier/documents/upload', {
      method: 'POST',
      body: formData
    });
    return response;
  }

  // Secteurs et types d'entreprise
  async getSecteurs(): Promise<{ secteurs: { id: number; nom: string }[] }> {
    const response = await apiClient.get<{ secteurs: { id: number; nom: string }[] }>('/supplier/secteurs');
    return response;
  }

  async getTypesEntreprise(): Promise<{ types: { id: number; nom: string }[] }> {
    const response = await apiClient.get<{ types: { id: number; nom: string }[] }>('/supplier/types-entreprise');
    return response;
  }

  // Inscription et profil complet
  async registerSupplier(data: SupplierRegistrationRequest): Promise<{
    message: string;
    data: {
      token: string;
      user: {
        id: number;
        email: string;
        role_id: number;
        entreprise_id: number;
      };
    };
  }> {
    const formData = new FormData();
    
    // Ajouter tous les champs au FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'logo' && value instanceof File) {
          formData.append('logo', value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await apiClient.request<{
      message: string;
      data: {
        token: string;
        user: {
          id: number;
          email: string;
          role_id: number;
          entreprise_id: number;
        };
      };
    }>('/supplier-registration/register-supplier', {
      method: 'POST',
      body: formData
    });
    return response;
  }

  async completeProfile(data: CompleteProfileRequest): Promise<{ message: string; entreprise_id?: number }> {
    const response = await apiClient.post<{ message: string; entreprise_id?: number }>('/supplier-registration/complete-profile', data);
    return response;
  }

  // Secteurs et types pour l'inscription
  async getSecteursForRegistration(): Promise<{ secteurs: { id: number; nom: string; description?: string }[] }> {
    const response = await apiClient.get<{ secteurs: { id: number; nom: string; description?: string }[] }>('/supplier-registration/secteurs');
    return response;
  }

  async getTypesEntrepriseForRegistration(): Promise<{ types: { id: number; nom: string; description?: string }[] }> {
    const response = await apiClient.get<{ types: { id: number; nom: string; description?: string }[] }>('/supplier-registration/types-entreprise');
    return response;
  }

  // Debug (temporaire)
  async getDebugInfo(): Promise<any> {
    const response = await apiClient.get('/supplier/debug');
    return response;
  }
}

export const supplierService = new SupplierService();