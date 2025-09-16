/**
 * Hook personnalisé pour gérer les règles métier de la messagerie
 */

import { useCurrentUser } from '@/hooks/api/useAuth';

export interface MessagingRules {
  canInitiateConversation: boolean;
  canReplyToConversation: boolean;
  canContactSupplier: boolean;
  userRole: 'buyer' | 'supplier' | 'admin' | 'unknown';
  roleId: number | null;
}

export function useMessagingRules(): MessagingRules {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return {
      canInitiateConversation: false,
      canReplyToConversation: false,
      canContactSupplier: false,
      userRole: 'unknown',
      roleId: null
    };
  }

  const roleId = currentUser.role_id;
  const isBuyer = roleId === 1;
  const isSupplier = roleId === 2;
  const isAdmin = roleId === 3;

  return {
    canInitiateConversation: isBuyer, // Seuls les acheteurs peuvent initier
    canReplyToConversation: isBuyer || isSupplier, // Les deux peuvent répondre
    canContactSupplier: isBuyer, // Seuls les acheteurs peuvent contacter
    userRole: isBuyer ? 'buyer' : isSupplier ? 'supplier' : isAdmin ? 'admin' : 'unknown',
    roleId
  };
}

export function useConversationPermissions(conversation: any) {
  const { data: currentUser } = useCurrentUser();
  const rules = useMessagingRules();

  if (!currentUser || !conversation) {
    return {
      canSendMessage: false,
      canViewConversation: false,
      isParticipant: false
    };
  }

  // Vérifier si l'utilisateur fait partie de la conversation
  const isAcheteur = conversation.acheteur_id === currentUser.id;
  const isFournisseur = conversation.fournisseur_id === currentUser.id || 
                       (conversation.fournisseur?.utilisateur_id === currentUser.id);
  
  const isParticipant = isAcheteur || isFournisseur;

  return {
    canSendMessage: isParticipant && rules.canReplyToConversation,
    canViewConversation: isParticipant,
    isParticipant
  };
}