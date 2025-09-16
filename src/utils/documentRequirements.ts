import { DocumentType } from '@/types/document';

// Documents obligatoires pour TOUS les fournisseurs
export const MANDATORY_DOCUMENTS: DocumentType[] = [
  'certificat_enregistrement',
  'certificat_fiscal', 
  'piece_identite_representant'
];

// Mapping des catégories de produits vers les documents requis
export const CATEGORY_DOCUMENT_MAPPING: Record<string, DocumentType[]> = {
  // Produits pharmaceutiques
  'pharmaceutique': ['licence_commerciale', 'certificat_sanitaire'],
  'medicaments': ['licence_commerciale', 'certificat_sanitaire'],
  'complements-alimentaires': ['licence_commerciale', 'certificat_sanitaire'],
  
  // Produits alcoolisés
  'boissons-alcoolisees': ['licence_commerciale'],
  'vins': ['licence_commerciale'],
  'spiritueux': ['licence_commerciale'],
  'bieres': ['licence_commerciale'],
  
  // Produits agroalimentaires sensibles
  'viande': ['licence_commerciale', 'certificat_sanitaire', 'certificat_origine'],
  'produits-laitiers': ['licence_commerciale', 'certificat_sanitaire', 'certificat_origine'],
  'poisson': ['certificat_sanitaire', 'certificat_origine'],
  'produits-frais': ['certificat_sanitaire', 'certificat_origine'],
  
  // Produits électroniques
  'electronique': ['conformite_ce'],
  'telephones': ['conformite_ce'],
  'ordinateurs': ['conformite_ce'],
  'electromenager': ['conformite_ce'],
  'telecoms': ['licence_commerciale', 'conformite_ce'],
  'materiel-medical': ['licence_commerciale', 'conformite_ce'],
  
  // Produits alimentaires
  'alimentaire': ['certificat_origine'],
  'pates': ['certificat_origine'],
  'conserves': ['certificat_origine'],
  'huiles': ['certificat_origine'],
  
  // Produits agricoles
  'agricole': ['certificat_origine'],
  'cacao': ['certificat_origine'],
  'cafe': ['certificat_origine'],
  'fruits': ['certificat_origine'],
  
  // Produits manufacturés
  'textile': ['certificat_origine'],
  'meubles': ['certificat_origine'],
  'manufacture': ['certificat_origine'],
  
  // Jouets
  'jouets': ['conformite_ce'],
  
  // Cosmétiques
  'cosmetiques': ['conformite_ce', 'certificat_sanitaire'],
  'maquillage': ['conformite_ce', 'certificat_sanitaire'],
  'soins': ['conformite_ce', 'certificat_sanitaire'],
  
  // Équipements de protection
  'epi': ['conformite_ce'],
  'casques': ['conformite_ce'],
  'gants': ['conformite_ce'],
  'protection-individuelle': ['conformite_ce']
};

// Fonction pour calculer les documents requis selon les catégories de produits
export const calculateRequiredDocuments = (productCategories: string[]): DocumentType[] => {
  const requiredDocuments = new Set<DocumentType>();
  
  // Ajouter les documents obligatoires
  MANDATORY_DOCUMENTS.forEach(doc => requiredDocuments.add(doc));
  
  // Ajouter les documents spécifiques aux catégories
  productCategories.forEach(category => {
    const categoryDocs = CATEGORY_DOCUMENT_MAPPING[category.toLowerCase()];
    if (categoryDocs) {
      categoryDocs.forEach(doc => requiredDocuments.add(doc));
    }
  });
  
  return Array.from(requiredDocuments);
};

// Fonction pour calculer les documents manquants
export const calculateMissingDocuments = (
  requiredDocuments: DocumentType[],
  uploadedDocuments: Array<{ type_document: DocumentType; statut_verification: string }>
): DocumentType[] => {
  const validatedDocuments = uploadedDocuments
    .filter(doc => doc.statut_verification === 'verifie')
    .map(doc => doc.type_document);
  
  return requiredDocuments.filter(doc => !validatedDocuments.includes(doc));
};

// Fonction pour obtenir la description d'un document requis
export const getDocumentDescription = (documentType: DocumentType): string => {
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

// Fonction pour vérifier si un fournisseur peut publier des produits
export const canPublishProducts = (
  requiredDocuments: DocumentType[],
  uploadedDocuments: Array<{ type_document: DocumentType; statut_verification: string }>
): boolean => {
  const missingDocuments = calculateMissingDocuments(requiredDocuments, uploadedDocuments);
  return missingDocuments.length === 0;
};
