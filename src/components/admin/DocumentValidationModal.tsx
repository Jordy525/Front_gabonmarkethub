import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAdminDocuments } from '@/hooks/api/useAdminDocuments';
import { 
  DOCUMENT_TYPES, 
  DOCUMENT_STATUS_COLORS, 
  DOCUMENT_STATUS_LABELS,
  type Document 
} from '@/types/document';
import { toast } from 'sonner';

interface DocumentValidationModalProps {
  supplierId: number;
  supplierName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentValidationModal: React.FC<DocumentValidationModalProps> = ({
  supplierId,
  supplierName,
  isOpen,
  onClose
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loading: apiLoading, error, fetchSupplierDocuments, validateDocument, rejectDocument } = useAdminDocuments();

  useEffect(() => {
    if (isOpen && supplierId) {
      loadDocuments();
    }
  }, [isOpen, supplierId]);

  const loadDocuments = async () => {
    setLoading(true);
    const docs = await fetchSupplierDocuments(supplierId);
    setDocuments(docs);
    setLoading(false);
  };

  const handleValidate = async (document: Document) => {
    const result = await validateDocument(document.id, commentaire);
    
    if (result.success) {
      toast.success('Document validé avec succès');
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, statut: 'valide' as const, commentaire_admin: commentaire }
            : doc
        )
      );
      setCommentaire('');
      setSelectedDocument(null);
    } else {
      toast.error(result.error || 'Erreur lors de la validation');
    }
  };

  const handleReject = async (document: Document) => {
    if (!commentaire.trim()) {
      toast.error('Veuillez ajouter un commentaire pour le rejet');
      return;
    }

    const result = await rejectDocument(document.id, commentaire);
    
    if (result.success) {
      toast.success('Document rejeté');
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === document.id 
            ? { ...doc, statut: 'rejete' as const, commentaire_admin: commentaire }
            : doc
        )
      );
      setCommentaire('');
      setSelectedDocument(null);
    } else {
      toast.error(result.error || 'Erreur lors du rejet');
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/documents/${doc.id}/download`, {
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

  const pendingDocuments = documents.filter(doc => doc.statut === 'en_attente');
  const validatedDocuments = documents.filter(doc => doc.statut === 'valide');
  const rejectedDocuments = documents.filter(doc => doc.statut === 'rejete');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents de {supplierName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Statistiques rapides */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{pendingDocuments.length}</div>
              <div className="text-sm text-yellow-800">En attente</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{validatedDocuments.length}</div>
              <div className="text-sm text-green-800">Validés</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{rejectedDocuments.length}</div>
              <div className="text-sm text-red-800">Rejetés</div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading || apiLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Chargement des documents...</p>
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun document
              </h3>
              <p className="text-gray-600">
                Ce fournisseur n'a pas encore uploadé de documents
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Liste des documents */}
                <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
                  <h3 className="font-semibold text-gray-900 sticky top-0 bg-white pb-2">Liste des documents</h3>
                  
                  {documents.map((document) => (
                    <div
                      key={document.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDocument?.id === document.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedDocument(document)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{document.nom_fichier}</h4>
                            <p className="text-sm text-gray-600">
                              {DOCUMENT_TYPES[document.type_document]}
                            </p>
                          </div>
                        </div>
                        
                        <Badge className={DOCUMENT_STATUS_COLORS[document.statut]}>
                          {getStatusIcon(document.statut)}
                          <span className="ml-1">{DOCUMENT_STATUS_LABELS[document.statut]}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-500">
                        Uploadé le {new Date(document.date_upload).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Détails et actions */}
                <div className="space-y-4">
                  {selectedDocument ? (
                    <>
                      <h3 className="font-semibold text-gray-900">Détails du document</h3>
                      
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">{selectedDocument.nom_fichier}</h4>
                          <Badge className={DOCUMENT_STATUS_COLORS[selectedDocument.statut]}>
                            {getStatusIcon(selectedDocument.statut)}
                            <span className="ml-1">{DOCUMENT_STATUS_LABELS[selectedDocument.statut]}</span>
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <p><strong>Type :</strong> {DOCUMENT_TYPES[selectedDocument.type_document]}</p>
                          <p><strong>Uploadé le :</strong> {new Date(selectedDocument.date_upload).toLocaleDateString('fr-FR')}</p>
                          {selectedDocument.date_validation && (
                            <p><strong>Validé le :</strong> {new Date(selectedDocument.date_validation).toLocaleDateString('fr-FR')}</p>
                          )}
                        </div>

                        {selectedDocument.commentaire_admin && (
                          <div className="p-3 bg-gray-50 rounded-lg mb-4">
                            <p className="text-sm text-gray-700">
                              <strong>Commentaire admin :</strong> {selectedDocument.commentaire_admin}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 mb-4">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Aperçu
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownload(selectedDocument)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Télécharger
                          </Button>
                        </div>

                        {selectedDocument.statut === 'en_attente' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Commentaire (optionnel)
                              </label>
                              <Textarea
                                value={commentaire}
                                onChange={(e) => setCommentaire(e.target.value)}
                                placeholder="Ajoutez un commentaire..."
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleValidate(selectedDocument)}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={apiLoading}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Valider
                              </Button>
                              <Button
                                onClick={() => handleReject(selectedDocument)}
                                variant="destructive"
                                disabled={apiLoading}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Rejeter
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-2" />
                      <p>Sélectionnez un document pour voir les détails</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
