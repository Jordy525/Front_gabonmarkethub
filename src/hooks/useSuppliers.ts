import { useState, useEffect, useCallback } from 'react';

interface Supplier {
  id: number;
  utilisateur_id: number;
  nom_entreprise: string;
  nom: string;
  prenom: string;
  email: string;
  secteur?: string;
  description?: string;
  statut: string;
  created_at: string;
}

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      // Récupérer la liste des fournisseurs depuis la route entreprises
      const response = await fetch(`${import.meta.env.VITE_API_URL}/entreprises`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des fournisseurs');
      }

      const data = await response.json();
      
      if (data.entreprises && Array.isArray(data.entreprises)) {
        // Filtrer seulement les fournisseurs actifs
        const activeSuppliers = data.entreprises.filter((supplier: Supplier) => 
          supplier.statut === 'actif' || supplier.statut === 'verifie'
        );
        setSuppliers(activeSuppliers);
      } else {
        setSuppliers([]);
      }

    } catch (error: any) {
      console.error('Erreur récupération fournisseurs:', error);
      setError(error.message || 'Erreur lors de la récupération des fournisseurs');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les fournisseurs au montage
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Rafraîchir la liste
  const refetch = useCallback(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  return {
    suppliers,
    loading,
    error,
    refetch,
  };
};
