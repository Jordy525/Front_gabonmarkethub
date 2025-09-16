import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lock, 
  FileText, 
  Upload, 
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface ProductCreationBlockedProps {
  status: 'inactif' | 'suspendu';
  onUploadDocuments?: () => void;
}

export const ProductCreationBlocked: React.FC<ProductCreationBlockedProps> = ({
  status,
  onUploadDocuments
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'inactif':
        return {
          icon: <Clock className="h-8 w-8 text-yellow-600" />,
          title: 'Publication de produits bloquée',
          description: 'Votre compte est en attente de validation. Vous devez uploader et faire valider vos documents pour pouvoir publier des produits.',
          actionText: 'Uploader mes documents',
          actionIcon: <Upload className="h-4 w-4 mr-2" />
        };
      
      case 'suspendu':
        return {
          icon: <XCircle className="h-8 w-8 text-red-600" />,
          title: 'Compte suspendu',
          description: 'Votre compte a été suspendu. Contactez l\'administrateur pour plus d\'informations.',
          actionText: 'Contacter le support',
          actionIcon: <FileText className="h-4 w-4 mr-2" />
        };
      
      default:
        return {
          icon: <Lock className="h-8 w-8 text-gray-600" />,
          title: 'Accès restreint',
          description: 'Vous n\'avez pas les permissions nécessaires pour publier des produits.',
          actionText: 'En savoir plus',
          actionIcon: <FileText className="h-4 w-4 mr-2" />
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Card className="border-dashed border-2 border-gray-300">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {config.icon}
        </div>
        <CardTitle className="text-lg text-gray-700">
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            {config.description}
          </AlertDescription>
        </Alert>

        {status === 'inactif' && (
          <div className="text-left bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Documents requis :
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                Certificat d'enregistrement
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                Licence commerciale
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                Certificat fiscal
              </li>
              <li className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                Pièce d'identité du représentant
              </li>
            </ul>
          </div>
        )}

        <Button 
          onClick={onUploadDocuments}
          className="w-full"
          variant={status === 'suspendu' ? 'outline' : 'default'}
        >
          {config.actionIcon}
          {config.actionText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCreationBlocked;
