import { useState } from 'react';
import { apiClient } from '@/services/api';
import type { Document, DocumentValidation } from '@/types/document';

export const useAdminDocuments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplierDocuments = async (supplierId: number): Promise<Document[]> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useAdminDocuments] Récupération documents pour supplierId:', supplierId);
      
      const response = await apiClient.get(`/admin/users/${supplierId}/documents`);
      
      console.log('📄 [useAdminDocuments] Réponse API:', response);
      
      if (response && response.documents) {
        console.log('✅ [useAdminDocuments] Documents trouvés:', response.documents.length);
        return response.documents;
      }
      
      console.log('⚠️ [useAdminDocuments] Aucun document trouvé');
      return [];
    } catch (err: any) {
      console.error('❌ [useAdminDocuments] Erreur récupération documents fournisseur:', err);
      setError(err.message || 'Erreur lors du chargement des documents');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const validateDocument = async (documentId: number, commentaire?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const validationData = {
        status: 'approved',
        commentaire
      };

      const response = await apiClient.patch(`/admin/documents/${documentId}/validate`, validationData);
      
      if (response && response.document) {
        return { success: true, document: response.document };
      }
      
      return { success: false, error: 'Erreur lors de la validation' };
    } catch (err: any) {
      console.error('Erreur validation document:', err);
      const errorMessage = err.message || 'Erreur lors de la validation du document';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const rejectDocument = async (documentId: number, commentaire: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const validationData = {
        status: 'rejected',
        commentaire
      };

      const response = await apiClient.patch(`/admin/documents/${documentId}/validate`, validationData);
      
      if (response && response.document) {
        return { success: true, document: response.document };
      }
      
      return { success: false, error: 'Erreur lors du rejet' };
    } catch (err: any) {
      console.error('Erreur rejet document:', err);
      const errorMessage = err.message || 'Erreur lors du rejet du document';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchSupplierDocuments,
    validateDocument,
    rejectDocument
  };
};
