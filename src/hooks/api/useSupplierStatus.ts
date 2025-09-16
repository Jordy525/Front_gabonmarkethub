import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';

interface SupplierStatus {
  status: 'actif' | 'inactif' | 'suspendu';
  documentsValidated: boolean;
  companyName?: string;
  documentsRequired: string[];
  documentsUploaded: string[];
  documentsValidated: string[];
}

export const useSupplierStatus = () => {
  const [status, setStatus] = useState<SupplierStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/supplier/status');
      
      if (response) {
        setStatus(response);
      } else {
        setError('Impossible de récupérer le statut');
      }
    } catch (err: any) {
      console.error('Erreur récupération statut fournisseur:', err);
      setError(err.message || 'Erreur lors du chargement du statut');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus
  };
};
