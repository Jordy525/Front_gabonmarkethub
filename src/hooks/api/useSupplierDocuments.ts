import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import type { Document, DocumentUpload, DocumentStats } from '@/types/document';

export const useSupplierDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/supplier/documents');
      
      if (response && response.documents) {
        setDocuments(response.documents);
        setStats(response.stats);
      } else {
        setDocuments([]);
        setStats(null);
      }
    } catch (err: any) {
      console.error('Erreur récupération documents:', err);
      setError(err.message || 'Erreur lors du chargement des documents');
      setDocuments([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (documentData: DocumentUpload) => {
    try {
      setError(null);
      
      const formData = new FormData();
      formData.append('type_document', documentData.type_document);
      formData.append('document', documentData.fichier);
      if (documentData.description) {
        formData.append('description', documentData.description);
      }

      // Debug: vérifier le contenu de FormData
      console.log('📤 Upload document:', {
        type_document: documentData.type_document,
        fichier: documentData.fichier.name,
        fichier_size: documentData.fichier.size,
        fichier_type: documentData.fichier.type
      });

      // Debug: vérifier FormData
      for (let [key, value] of formData.entries()) {
        console.log(`FormData: ${key} =`, value);
      }

      const response = await apiClient.post('/supplier/documents/upload', formData);

      if (response && response.message) {
        // L'upload a réussi, rafraîchir la liste des documents
        await fetchDocuments();
        return { success: true, message: response.message };
      }
      
      return { success: false, error: 'Erreur lors de l\'upload' };
    } catch (err: any) {
      console.error('Erreur upload document:', err);
      const errorMessage = err.message || 'Erreur lors de l\'upload du document';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deleteDocument = async (documentId: number) => {
    try {
      setError(null);
      
      await apiClient.delete(`/supplier/documents/${documentId}`);
      
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      await fetchDocuments(); // Rafraîchir les stats
      
      return { success: true };
    } catch (err: any) {
      console.error('Erreur suppression document:', err);
      const errorMessage = err.message || 'Erreur lors de la suppression du document';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    stats,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument
  };
};
