import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export interface SupplierProduct {
  id: number;
  nom: string;
  prix_unitaire: number;
  stock_disponible: number;
  moq: number;
  unite: string;
  statut: string;
  categorie_nom: string;
  image_principale?: string;
  note_moyenne: number;
  nombre_avis: number;
  date_creation: string;
  derniere_modification?: string;
  created_at: string;
  updated_at?: string;
}

export const useSupplierProducts = () => {
  return useQuery<SupplierProduct[]>({
    queryKey: ['supplier-products'],
    queryFn: async (): Promise<SupplierProduct[]> => {
      try {
        // Utiliser la route spécifique fournisseur qui retourne des données enrichies
        const response = await apiClient.get('/supplier/products');
        const products = response.products || response.data || response || [];
        
        // S'assurer que les données sont correctement typées
        const typedProducts: SupplierProduct[] = Array.isArray(products) ? products.map(product => ({
          ...product,
          prix_unitaire: Number(product.prix_unitaire) || 0,
          stock_disponible: Number(product.stock_disponible) || 0,
          moq: Number(product.moq) || 1,
          note_moyenne: Number(product.note_moyenne) || 0,
          nombre_avis: Number(product.nombre_avis) || 0,
          unite: product.unite || 'pièce',
          statut: product.statut || 'actif',
          categorie_nom: product.categorie_nom || 'Non catégorisé'
        })) : [];
        
        return typedProducts;
      } catch (error) {
        console.log('Erreur lors du chargement des produits fournisseur:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000,
    enabled: !!localStorage.getItem('authToken'), // Seulement si authentifié
  });
};