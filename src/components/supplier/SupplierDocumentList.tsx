import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useSupplierDocuments } from '@/hooks/api/useSupplierDocuments';
import { useSupplierDocumentRequirements } from '@/hooks/api/useSupplierDocumentRequirements';
import { 
  DOCUMENT_TYPES, 
  DOCUMENT_STATUS_COLORS, 
  DOCUMENT_STATUS_LABELS,
  type Document,
  type DocumentType 
} from '@/types/document';
import { toast } from 'sonner';

export const SupplierDocumentList: React.FC = () => {
  const { documents, stats, loading, error, uploadDocument, deleteDocument, fetchDocuments } = useSupplierDocuments();
  const { data: requirements, loading: requirementsLoading, refetch: refetchRequirements } = useSupplierDocumentRequirements();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>('piece_identite_representant');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 10MB)');
      return;
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Type de fichier non supporté (JPG, PNG, PDF uniquement)');
      return;
    }

    setUploading(true);
    
    const result = await uploadDocument({
      type_document: selectedDocumentType,
      fichier: file
    });

    setUploading(false);
    
    if (result.success) {
      toast.success('Document uploadé avec succès');
      setShowUploadForm(false);
      // Rafraîchir les documents et les exigences
      await fetchDocuments();
      refetchRequirements();
    } else {
      toast.error(result.error || 'Erreur lors de l\'upload');
    }
  };

  const handleDeleteDocument = async (document: Document) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le document "${document.nom_fichier}" ?`)) {
      return;
    }

    const result = await deleteDocument(document.id);
    
    if (result.success) {
      toast.success('Document supprimé avec succès');
      // Rafraîchir les documents et les exigences
      await fetchDocuments();
      refetchRequirements();
    } else {
      toast.error(result.error || 'Erreur lors de la suppression');
    }
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/supplier/documents/${doc.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.nom_fichier;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Document téléchargé avec succès');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error('Erreur lors du téléchargement du document');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en_attente':
        return <Clock className="w-4 h-4" />;
      case 'valide':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejete':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      {requirements && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total requis</p>
                  <p className="text-2xl font-bold">{requirements.totalRequired}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {requirements.requirements.filter(r => r.uploaded && !r.validated).length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Validés</p>
                  <p className="text-2xl font-bold text-green-600">
                    {requirements.requirements.filter(r => r.validated).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Manquants</p>
                  <p className="text-2xl font-bold text-red-600">{requirements.missingCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mes documents</h3>
        <div className="flex gap-2">
          {!showUploadForm && (
            <Button onClick={() => setShowUploadForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un document
            </Button>
          )}
        </div>
      </div>

      {/* Formulaire d'upload */}
      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de document
                </label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedDocumentType}
                  onChange={(e) => setSelectedDocumentType(e.target.value as DocumentType)}
                >
                  {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier (JPG, PNG, PDF - max 10MB)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUploadForm(false)}
                  disabled={uploading}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des documents requis */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {requirementsLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Chargement des documents requis...</p>
          </div>
        </div>
      ) : requirements ? (
        <div className="space-y-4">
          {/* En-tête avec statistiques */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">Documents requis selon vos produits</h3>
                <p className="text-sm text-blue-700">
                  {requirements.missingCount} document(s) manquant(s) sur {requirements.totalRequired} requis
                </p>
              </div>
              {requirements.canPublish && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Prêt à publier
                </Badge>
              )}
            </div>
          </div>

          {/* Liste des documents requis */}
          {requirements.requirements.map((requirement) => {
            const uploadedDoc = documents.find(doc => doc.type_document === requirement.type && doc.statut_verification !== 'rejete');
            
            return (
              <Card key={requirement.type} className={requirement.missing ? 'border-red-200 bg-red-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        requirement.validated ? 'bg-green-100' : 
                        requirement.uploaded ? 'bg-yellow-100' : 
                        'bg-gray-100'
                      }`}>
                        {requirement.validated ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : requirement.uploaded ? (
                          <Clock className="w-6 h-6 text-yellow-600" />
                        ) : (
                          <FileText className="w-6 h-6 text-gray-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {DOCUMENT_TYPES[requirement.type]}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {requirement.description}
                        </p>
                        {uploadedDoc && (
                          <p className="text-xs text-gray-500">
                            Fichier: {uploadedDoc.nom_fichier} - 
                            Uploadé le {new Date(uploadedDoc.uploaded_at).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge className={
                        requirement.validated ? 'bg-green-100 text-green-800' :
                        requirement.uploaded ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {requirement.validated ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Validé
                          </>
                        ) : requirement.uploaded ? (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            En attente
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Manquant
                          </>
                        )}
                      </Badge>
                      
                      {uploadedDoc && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadDocument(uploadedDoc)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteDocument(uploadedDoc)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {uploadedDoc?.commentaire_verification && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Commentaire admin :</strong> {uploadedDoc.commentaire_verification}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Section des documents rejetés */}
          {documents.filter(doc => doc.statut_verification === 'rejete').length > 0 && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Documents rejetés
              </h4>
              <div className="space-y-3">
                {documents
                  .filter(doc => doc.statut_verification === 'rejete')
                  .map((document) => (
                    <Card key={document.id} className="border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-red-900">{document.nom_fichier}</h5>
                              <p className="text-sm text-red-700">
                                {DOCUMENT_TYPES[document.type_document]}
                              </p>
                              {document.commentaire_verification && (
                                <p className="text-xs text-red-600 mt-1">
                                  <strong>Raison du rejet :</strong> {document.commentaire_verification}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteDocument(document)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun document requis
            </h3>
            <p className="text-gray-600 mb-4">
              Publiez des produits pour voir les documents requis
            </p>
            <Button onClick={() => setShowUploadForm(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Uploader un document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
