import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  XCircle,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface SupplierStatusBannerProps {
  status: 'actif' | 'inactif' | 'suspendu';
  documentsValidated: boolean;
  companyName?: string;
  onUploadDocuments?: () => void;
}

export const SupplierStatusBanner: React.FC<SupplierStatusBannerProps> = ({
  status,
  documentsValidated,
  companyName,
  onUploadDocuments
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'actif':
        return {
          variant: 'default' as const,
          icon: <CheckCircle className="h-4 w-4" />,
          title: 'Compte validé',
          description: 'Votre compte est actif. Vous pouvez publier des produits.',
          badge: <Badge className="bg-green-100 text-green-800">Actif</Badge>
        };
      
      case 'inactif':
        return {
          variant: 'destructive' as const,
          icon: <Clock className="h-4 w-4" />,
          title: 'Compte en attente de validation',
          description: 'Votre compte est en attente de validation. Televersez et faites valider vos documents pour accéder à toutes les fonctionnalités.',
          badge: <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
        };
      
      case 'suspendu':
        return {
          variant: 'destructive' as const,
          icon: <XCircle className="h-4 w-4" />,
          title: 'Compte suspendu',
          description: 'Votre compte a été suspendu. Contactez l\'administrateur pour plus d\'informations.',
          badge: <Badge className="bg-red-100 text-red-800">Suspendu</Badge>
        };
      
      default:
        return {
          variant: 'default' as const,
          icon: <AlertCircle className="h-4 w-4" />,
          title: 'Statut inconnu',
          description: 'Impossible de déterminer le statut de votre compte.',
          badge: <Badge className="bg-gray-100 text-gray-800">Inconnu</Badge>
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Alert variant={config.variant} className="mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {config.icon}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{config.title}</h3>
              {config.badge}
            </div>
            <AlertDescription className="text-sm">
              {config.description}
            </AlertDescription>
            
            {status === 'inactif' && (
              <div className="mt-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <FileText className="h-4 w-4" />
                  <span>Documents requis :</span>
                </div>
                <ul className="text-xs text-gray-600 ml-6 space-y-1">
                  <li>• Certificat d'enregistrement</li>
                  <li>• Certificat fiscal</li>
                  <li>• Pièce d'identité du représentant</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        
        {status === 'inactif' && onUploadDocuments && (
          <Button 
            onClick={onUploadDocuments}
            size="sm"
            className="ml-4"
          >
            <Upload className="h-4 w-4 mr-1" />
            Uploader documents
          </Button>
        )}
      </div>
    </Alert>
  );
};

export default SupplierStatusBanner;
