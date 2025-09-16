import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

interface Document {
  id: number;
  type_document: string;
  nom_fichier: string;
  statut_verification: 'en_attente' | 'verifie' | 'rejete';
  uploaded_at: string;
  commentaire_verification?: string;
}

const DOCUMENT_TYPES = [
  { key: 'certificat_enregistrement', label: 'Certificat d\'enregistrement', required: true },
  { key: 'licence_commerciale', label: 'Licence commerciale', required: true },
  { key: 'certificat_fiscal', label: 'Certificat fiscal', required: true },
  { key: 'piece_identite_representant', label: 'Pièce d\'identité du représentant', required: true }
];

export const DocumentUpload = () => {
  const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});
  const queryClient = useQueryClient();

  // Récupérer les documents existants
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['supplier-documents'],
    queryFn: () => apiClient.get('/supplier/documents')
  });

  // Mutation pour uploader un document
  const uploadMutation = useMutation({
    mutationFn: async ({ type, file }: { type: string; file: File }) => {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type_document', type);
      
      return apiClient.post('/supplier/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    onSuccess: (_, variables) => {
      toast.success(`Document ${variables.type} uploadé avec succès`);
      queryClient.invalidateQueries({ queryKey: ['supplier-documents'] });
      setUploadingFiles(prev => ({ ...prev, [variables.type]: false }));
    },
    onError: (error: any, variables) => {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'upload');
      setUploadingFiles(prev => ({ ...prev, [variables.type]: false }));
    }
  });

  const getDocumentByType = (type: string) => {
    return documents.find((doc: Document) => doc.type_document === type);
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'verifie':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejete':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'verifie':
        return <Badge className="bg-green-100 text-green-800">Vérifié</Badge>;
      case 'rejete':
        return <Badge className="bg-red-100 text-red-800">Rejeté</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
    }
  };

  const handleFileSelect = (type: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Le fichier ne doit pas dépasser 5MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez PDF, JPG ou PNG');
      return;
    }

    setUploadingFiles(prev => ({ ...prev, [type]: true }));
    uploadMutation.mutate({ type, file });
    
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Documents Justificatifs</h2>
        <p className="text-gray-600">
          Uploadez vos documents pour valider votre compte fournisseur
        </p>
      </div>

      <div className="grid gap-6">
        {DOCUMENT_TYPES.map((docType) => (
          <Card key={docType.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {docType.label}
                {docType.required && (
                  <Badge variant="destructive" className="text-xs">
                    Obligatoire
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const existingDoc = getDocumentByType(docType.key);
                const isUploading = uploadingFiles[docType.key];
                
                if (existingDoc) {
                  return (
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(existingDoc.statut_verification)}
                            <span className="text-sm font-medium">{existingDoc.nom_fichier}</span>
                          </div>
                          {getStatusBadge(existingDoc.statut_verification)}
                        </div>
                        <p className="text-xs text-gray-500">
                          Uploadé le {new Date(existingDoc.uploaded_at).toLocaleDateString('fr-FR')}
                        </p>
                        {existingDoc.commentaire_verification && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-xs text-yellow-800">
                              <strong>Commentaire:</strong> {existingDoc.commentaire_verification}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          Remplacer le document
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileSelect(docType.key, e)}
                          className="text-sm"
                          disabled={isUploading}
                        />
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                          <p className="text-sm text-gray-600">Upload en cours...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Sélectionnez un fichier
                          </p>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileSelect(docType.key, e)}
                            className="text-sm"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            PDF, JPG, PNG (max 5MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">
                Informations importantes
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Documents obligatoires pour l'activation du compte</li>
                <li>• Vérification sous 2-5 jours ouvrables</li>
                <li>• Notification par email du statut</li>
                <li>• Vous pouvez remplacer un document rejeté</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};