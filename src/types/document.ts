export interface Document {
  id: number;
  entreprise_id: number;
  nom_fichier: string;
  chemin_fichier: string;
  type_document: DocumentType;
  statut_verification: DocumentStatus;
  uploaded_at: string;
  verified_at?: string;
  commentaire_verification?: string;
  taille_fichier?: number;
  type_mime?: string;
}

export type DocumentType = 
  | 'certificat_enregistrement'
  | 'certificat_fiscal'
  | 'piece_identite_representant'
  | 'licence_commerciale'
  | 'certificat_origine'
  | 'conformite_ce'
  | 'certificat_sanitaire'
  | 'autre';

export type DocumentStatus = 
  | 'en_attente'
  | 'valide'
  | 'rejete';

export interface DocumentValidation {
  document_id: number;
  action: 'valider' | 'rejeter';
  commentaire?: string;
}

export interface DocumentUpload {
  type_document: DocumentType;
  fichier: File;
  description?: string;
}

export interface DocumentStats {
  total: number;
  en_attente: number;
  valides: number;
  rejetes: number;
}

export const DOCUMENT_TYPES: Record<DocumentType, string> = {
  certificat_enregistrement: 'Certificat d\'enregistrement (registre de commerce)',
  certificat_fiscal: 'Certificat fiscal (attestation fiscale à jour)',
  piece_identite_representant: 'Pièce d\'identité du représentant légal',
  licence_commerciale: 'Licence commerciale',
  certificat_origine: 'Certificat d\'origine',
  conformite_ce: 'Conformité CE (marquage "CE")',
  certificat_sanitaire: 'Certificat sanitaire',
  autre: 'Autre document'
};

export const DOCUMENT_STATUS_COLORS: Record<DocumentStatus, string> = {
  en_attente: 'bg-yellow-100 text-yellow-800',
  valide: 'bg-green-100 text-green-800',
  rejete: 'bg-red-100 text-red-800'
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  en_attente: 'En attente',
  valide: 'Validé',
  rejete: 'Rejeté'
};
