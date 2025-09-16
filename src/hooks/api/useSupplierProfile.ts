import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/api';

export interface SupplierProfile {
  // Données utilisateur
  id: number;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  nom_complet: string;
  telephone_personnel: string;
  
  // Données entreprise
  nom_entreprise: string;
  description: string;
  site_web: string;
  logo: string;
  telephone_professionnel: string;
  adresse_ligne1: string;
  adresse_ligne2: string;
  ville: string;
  code_postal: string;
  pays: string;
  numero_siret: string;
  numero_tva: string;
  statut_verification: string;
  date_inscription: string;
  
  // Informations secteur
  secteur_activite: string;
  type_entreprise: string;
  annee_creation: number;
  nombre_employes: number;
  capacite_production: string;
  certifications: string;
  
  // Informations bancaires
  nom_banque: string;
  iban: string;
  nom_titulaire_compte: string;
}

export const useSupplierProfile = () => {
  return useQuery({
    queryKey: ['supplier-profile'],
    queryFn: async (): Promise<SupplierProfile | null> => {
      try {
        // Essayer d'abord le nouveau endpoint
        const response = await apiClient.get('/supplier/company-info');
        console.log('📋 Profil fournisseur récupéré:', response.data);
        return response.data?.entreprise || response.data?.data || response.data;
      } catch (error: any) {
        console.log('⚠️ Nouveau endpoint non disponible, essai de l\'ancien...');
        
        // Fallback vers l'ancien endpoint si le nouveau n'existe pas
        if (error.message?.includes('404') || error.message?.includes('Route non trouvée')) {
          try {
            const fallbackResponse = await apiClient.get('/supplier/profile');
            console.log('📋 Profil fournisseur récupéré (fallback):', fallbackResponse.data);
            return fallbackResponse.data?.data || fallbackResponse.data;
          } catch (fallbackError) {
            console.error('❌ Erreur récupération profil fournisseur (fallback):', fallbackError);
            return null;
          }
        }
        
        console.error('❌ Erreur récupération profil fournisseur:', error);
        return null;
      }
    },
    retry: 1,
    staleTime: 30000,
  });
};

export const useUpdateSupplierProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: Partial<SupplierProfile>) => {
      // Utiliser FormData si des fichiers sont présents
      const hasFiles = Object.values(profileData).some(value => value instanceof File);
      
      try {
        if (hasFiles) {
          const formData = new FormData();
          Object.entries(profileData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              if (value instanceof File) {
                formData.append(key, value);
              } else {
                formData.append(key, value.toString());
              }
            }
          });
          
          const response = await apiClient.request('/supplier/company-info', {
            method: 'PUT',
            body: formData,
            headers: {}
          });
          return response.data;
        } else {
          const response = await apiClient.put('/supplier/company-info', profileData);
          return response.data;
        }
      } catch (error: any) {
        // Fallback vers l'ancien endpoint si le nouveau n'existe pas
        if (error.message?.includes('404') || error.message?.includes('Route non trouvée')) {
          console.log('⚠️ Fallback vers ancien endpoint de mise à jour...');
          const response = await apiClient.put('/supplier/profile', profileData);
          return response.data;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-profile'] });
    },
  });
};

export const useCompleteSupplierProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: any) => {
      console.log('📤 Envoi données profil complet:', profileData);
      const response = await apiClient.post('/supplier/complete-profile', profileData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-profile'] });
    },
  });
};