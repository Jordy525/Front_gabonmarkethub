import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
// import { SimpleChat } from './SimpleChat'; // TODO: Migrer vers SimpleChat
import { useCurrentUser } from '@/hooks/api/useAuth';
import type { Product, Entreprise } from '@/types/api';

export interface ContactSupplierButtonProps {
  supplier: Entreprise;
  product?: Product;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ContactSupplierButton: React.FC<ContactSupplierButtonProps> = ({
  supplier,
  product,
  variant = 'default',
  size = 'default',
  showIcon = true,
  className = '',
  children
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();

  const handleContactClick = () => {
    if (!currentUser) {
      // Rediriger vers la page de connexion
      navigate('/login', { 
        state: { 
          returnTo: `/messages?supplier=${supplier.id}&product=${product?.id}&productName=${product?.nom}&supplierName=${supplier.nom_entreprise}` 
        }
      });
      return;
    }

    // Si l'utilisateur est connecté, ouvrir le dialog de chat
    setIsDialogOpen(true);
  };

  const handleNavigateToMessages = () => {
    const params = new URLSearchParams({
      supplier: supplier.id.toString(),
      ...(product && { 
        product: product.id.toString(),
        productName: product.nom,
      }),
      supplierName: supplier.nom_entreprise
    });
    
    navigate(`/messages?${params.toString()}`);
    setIsDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleContactClick}
            className={className}
          >
            {showIcon && <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />}
            <span className="text-xs sm:text-sm">
              {children || (
                <>
                  <span className="hidden sm:inline">Contacter le fournisseur</span>
                  <span className="sm:hidden">Contacter</span>
                </>
              )}
            </span>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl h-[90vh] sm:h-[80vh] p-0 m-2 sm:m-4">
          <DialogHeader className="p-4 sm:p-6 pb-0">
            <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base truncate">Chat avec {supplier.nom_entreprise}</span>
              </div>
              {product && (
                <span className="text-xs sm:text-sm text-gray-600 font-normal truncate">
                  • À propos de "{product.nom}"
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 p-4 sm:p-6 pt-0">
            <div className="h-[60vh] sm:h-[60vh]">
              {/* TODO: Remplacer par SimpleChat */}
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm sm:text-base">Fonctionnalité de contact en cours de migration</p>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs sm:text-sm"
              >
                Fermer
              </Button>
              <Button 
                onClick={handleNavigateToMessages}
                className="text-xs sm:text-sm"
              >
                Ouvrir dans Messages
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Composant pour les options de contact multiples
export interface ContactSupplierOptionsProps {
  supplier: Entreprise;
  product?: Product;
  className?: string;
}

export const ContactSupplierOptions: React.FC<ContactSupplierOptionsProps> = ({
  supplier,
  product,
  className = ''
}) => {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <ContactSupplierButton
        supplier={supplier}
        product={product}
        variant="default"
        className="w-full text-xs sm:text-sm"
      >
        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Envoyer un message</span>
        <span className="sm:hidden">Message</span>
      </ContactSupplierButton>
      
      {supplier.site_web && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open(supplier.site_web, '_blank')}
        >
          <Mail className="w-4 h-4 mr-2" />
          Visiter le site web
        </Button>
      )}
      
      <div className="text-xs text-gray-500 text-center mt-2">
        Réponse généralement sous 24h
      </div>
    </div>
  );
};

// Hook pour créer des liens de contact
export const useContactSupplierLink = () => {
  const navigate = useNavigate();
  
  return (supplier: Entreprise, product?: Product) => {
    const params = new URLSearchParams({
      supplier: supplier.id.toString(),
      ...(product && { 
        product: product.id.toString(),
        productName: product.nom,
      }),
      supplierName: supplier.nom_entreprise
    });
    
    return `/messages?${params.toString()}`;
  };
};