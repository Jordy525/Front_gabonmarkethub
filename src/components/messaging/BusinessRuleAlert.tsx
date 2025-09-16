import React from 'react';
import { Info, MessageCircle, Users } from 'lucide-react';
import { useCurrentUser } from '@/hooks/api/useAuth';

interface BusinessRuleAlertProps {
  className?: string;
}

export const BusinessRuleAlert: React.FC<BusinessRuleAlertProps> = ({ className = '' }) => {
  const { data: currentUser } = useCurrentUser();

  // Ne pas afficher l'alerte si l'utilisateur n'est pas connecté
  if (!currentUser) return null;

  // Affichage différent selon le rôle
  if (currentUser.role_id === 1) {
    // Acheteur - Information sur ses droits
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-start">
          <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-800">
              Messagerie acheteur
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              En tant qu'acheteur, vous pouvez initier des conversations avec tous les fournisseurs. 
              Une fois le premier contact établi, la conversation devient bidirectionnelle.
            </p>
          </div>
        </div>
      </div>
    );
  } else if (currentUser.role_id === 2) {
    // Fournisseur - Information sur les limitations
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-start">
          <Info className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-amber-800">
              Messagerie fournisseur
            </h4>
            <p className="text-sm text-amber-700 mt-1">
              En tant que fournisseur, vous pouvez répondre aux acheteurs qui vous ont contacté. 
              Vous ne pouvez pas initier de nouvelles conversations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

interface ConversationInitiationGuardProps {
  currentUser: any;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ConversationInitiationGuard: React.FC<ConversationInitiationGuardProps> = ({
  currentUser,
  children,
  fallback
}) => {
  // Seuls les acheteurs peuvent voir les éléments d'initiation de conversation
  if (currentUser?.role_id === 1) {
    return <>{children}</>;
  }

  // Afficher le fallback ou rien
  return fallback ? <>{fallback}</> : null;
};

interface SupplierContactButtonProps {
  supplierId: number;
  supplierName?: string;
  productName?: string;
  onContact: () => void;
  className?: string;
}

export const SupplierContactButton: React.FC<SupplierContactButtonProps> = ({
  supplierId,
  supplierName,
  productName,
  onContact,
  className = ''
}) => {
  const { data: currentUser } = useCurrentUser();

  // Ne pas afficher le bouton si l'utilisateur n'est pas un acheteur
  if (!currentUser || currentUser.role_id !== 1) {
    return null;
  }

  return (
    <button
      onClick={onContact}
      className={`inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${className}`}
    >
      <Users className="w-4 h-4 mr-2" />
      Contacter {supplierName || 'le fournisseur'}
    </button>
  );
};