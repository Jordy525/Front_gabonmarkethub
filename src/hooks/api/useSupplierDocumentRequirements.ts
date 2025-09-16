import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { DocumentType } from '@/types/document';
import { 
  calculateRequiredDocuments, 
  calculateMissingDocuments,
  canPublishProducts 
} from '@/utils/documentRequirements';

interface DocumentRequirement {
  type: DocumentType;
  required: boolean;
  uploaded: boolean;
  validated: boolean;
  missing: boolean;
  description: string;
}

interface SupplierDocumentRequirements {
  requirements: DocumentRequirement[];
  canPublish: boolean;
  missingCount: number;
  totalRequired: number;
}

export const useSupplierDocumentRequirements = () => {
  const [data, setData] = useState<SupplierDocumentRequirements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les catégories de produits du fournisseur
      const [categoriesResponse, documentsResponse] = await Promise.all([
        apiClient.get('/supplier/products/categories'),
        apiClient.get('/supplier/documents')
      ]);

      const categories = categoriesResponse || [];
      const documents = documentsResponse?.documents || [];

      // Extraire les slugs des catégories pour le mapping
      const categorySlugs = categories.map((cat: any) => cat.slug);
      
      // Calculer les documents requis
      const requiredDocuments = calculateRequiredDocuments(categorySlugs);
      
      // Calculer les documents manquants
      const missingDocuments = calculateMissingDocuments(requiredDocuments, documents);
      
      // Vérifier si le fournisseur peut publier des produits
      const canPublish = canPublishProducts(requiredDocuments, documents);
      
      // Créer la liste des exigences
      const requirements: DocumentRequirement[] = requiredDocuments.map(docType => {
        const uploadedDoc = documents.find((doc: any) => doc.type_document === docType);
        const isUploaded = !!uploadedDoc;
        const isValidated = uploadedDoc?.statut_verification === 'verifie';
        const isMissing = missingDocuments.includes(docType);
        
        return {
          type: docType,
          required: true,
          uploaded: isUploaded,
          validated: isValidated,
          missing: isMissing,
          description: getDocumentDescription(docType)
        };
      });

      setData({
        requirements,
        canPublish,
        missingCount: missingDocuments.length,
        totalRequired: requiredDocuments.length
      });

    } catch (err: any) {
      console.error('Erreur récupération exigences documents:', err);
      setError(err.message || 'Erreur lors du chargement des exigences');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentDescription = (documentType: DocumentType): string => {
    const descriptions: Record<DocumentType, string> = {
      certificat_enregistrement: 'Obligatoire pour tous les fournisseurs',
      certificat_fiscal: 'Obligatoire pour tous les fournisseurs',
      piece_identite_representant: 'Obligatoire pour tous les fournisseurs',
      licence_commerciale: 'Requis pour : produits pharmaceutiques, alcoolisés, agroalimentaires sensibles, électroniques soumis à autorisation',
      certificat_origine: 'Requis pour : produits alimentaires, agricoles, manufacturés (tous les produits importés)',
      conformite_ce: 'Requis pour : produits électroniques, jouets, cosmétiques, équipements de protection',
      certificat_sanitaire: 'Requis pour : produits alimentaires frais, cosmétiques, pharmaceutiques',
      autre: 'Document spécifique selon vos besoins'
    };
    
    return descriptions[documentType] || '';
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchRequirements
  };
};
