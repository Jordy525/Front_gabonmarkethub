import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '@/types/api';
import { apiClient } from '@/services/api';

interface Product {
  id: number;
  nom: string;
  description: string;
  description_longue?: string;
  prix_unitaire: number;
  stock_disponible: number;
  image_principale?: string;
  images?: Array<{
    id: number;
    url: string;
    alt_text?: string;
    principale?: boolean;
  }>;
  categorie?: string;
  categorie_id?: number;
  fournisseur_id?: number;
  fournisseur?: string;
  nom_entreprise?: string;
  description_fournisseur?: string;
  note_moyenne_fournisseur?: number;
  nombre_avis_fournisseur?: number;
  statut_verification?: string;
  entreprise_id?: number;
  statut: 'actif' | 'inactif' | 'rupture';
  created_at: string;
  updated_at: string;
  moq?: number;
  unite?: string;
  poids?: number;
  dimensions?: string;
  materiaux?: string;
  fonctionnalites?: string;
  instructions_utilisation?: string;
  couleurs_disponibles?: string[];
  certifications?: string[];
  prix_degressifs?: Array<{
    quantite_min: number;
    quantite_max?: number;
    prix_unitaire: number;
  }>;
  politique_retour?: string;
  garantie?: string;
  port_depart?: string;
  delai_livraison_estime?: string;
  delai_traitement?: number;
  capacite_approvisionnement?: number;
  conditions_paiement?: string[];
  featured?: boolean;
  note_moyenne?: number;
  nombre_avis?: number;
  entreprise?: {
    id: number;
    nom_entreprise: string;
    secteur_activite: string;
  };
  rating?: number;
  reviews_count?: number;
  specifications?: Array<{
    nom: string;
    valeur: string;
  }>;
}

/**
 * Hook pour récupérer un produit par ID
 */
export const useProduct = (productId: number) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId || productId <= 0) {
      setProduct(null);
      setError('ID de produit invalide');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get(`/products/${productId}`);
      // L'API retourne { data: product }, donc on accède à response.data
      setProduct(response.data || response);

    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Erreur lors de la récupération du produit';
      console.error('Erreur récupération produit:', errorMessage);
      setError(errorMessage);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    isLoading,
    error,
    refetch: fetchProduct
  };
};

/**
 * Hook pour récupérer une liste de produits
 */
export const useProducts = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  supplier?: number;
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.supplier) searchParams.set('supplier', params.supplier.toString());

      const response = await apiClient.get(`/products?${searchParams.toString()}`);
      
      if (Array.isArray(response)) {
        setProducts(response);
      } else if (response.products) {
        setProducts(response.products);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setProducts([]);
      }

    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || 'Erreur lors de la récupération des produits';
      console.error('Erreur récupération produits:', errorMessage);
      setError(errorMessage);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    pagination,
    isLoading,
    error,
    refetch: fetchProducts
  };
};