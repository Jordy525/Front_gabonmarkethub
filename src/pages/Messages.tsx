import React from 'react';
import { BuyerMessageCenter } from '@/components/messaging/BuyerMessageCenter';
import { SupplierMessageCenter } from '@/components/messaging/SupplierMessageCenter';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { Loader2 } from 'lucide-react';

const Messages: React.FC = () => {
  const { data: currentUser, loading } = useCurrentUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  // Afficher le bon composant selon le rôle
  if (currentUser?.role_id === 1) {
    // Acheteur
    return <BuyerMessageCenter />;
  } else if (currentUser?.role_id === 2) {
    // Fournisseur
    return <SupplierMessageCenter />;
  } else {
    // Rôle non reconnu
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
          <p className="text-muted-foreground">
            Vous devez être connecté en tant qu'acheteur ou fournisseur pour accéder à la messagerie.
          </p>
        </div>
      </div>
    );
  }
};

export default Messages;