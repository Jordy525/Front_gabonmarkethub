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
            {showIcon && <MessageCircle className="w-4 h-4 mr-2" />}
            {children || 'Contacter le fournisseur'}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Chat avec {supplier.nom_entreprise}</span>
              {product && (
                <span className="text-sm text-gray-600 font-normal">
                  • À propos de "{product.nom}"
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 p-6 pt-0">
            <div className="h-[60vh]">
              {/* TODO: Remplacer par SimpleChat */}
              <div className="p-4 text-center text-gray-500">
                Fonctionnalité de contact en cours de migration
              </div>
                productName={product?.nom}
                supplierName={supplier.nom_entreprise}
                compact={true}
              />
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Fermer
              </Button>
              <Button onClick={handleNavigateToMessages}>
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
        className="w-full"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Envoyer un message
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