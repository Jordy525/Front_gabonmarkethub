import { useCurrentUser } from './api/useAuth';

export interface UserRoleInfo {
  isBuyer: boolean;
  isSupplier: boolean;
  canInitiateConversation: boolean;
  canRespondToConversation: boolean;
  roleId: number | null;
  roleName: string;
}

export const useUserRole = (): UserRoleInfo => {
  const { data: currentUser } = useCurrentUser();

  if (!currentUser) {
    return {
      isBuyer: false,
      isSupplier: false,
      canInitiateConversation: false,
      canRespondToConversation: false,
      roleId: null,
      roleName: 'Non connecté'
    };
  }

  // Déterminer le rôle basé sur role_id
  // Généralement : 1 = Acheteur, 2 = Fournisseur
  const isBuyer = currentUser.role_id === 1;
  const isSupplier = currentUser.role_id === 2;

  return {
    isBuyer,
    isSupplier,
    canInitiateConversation: isBuyer, // Seuls les acheteurs peuvent initier
    canRespondToConversation: true, // Tous peuvent répondre
    roleId: currentUser.role_id,
    roleName: isBuyer ? 'Acheteur' : isSupplier ? 'Fournisseur' : 'Utilisateur'
  };
};

export const useCanContactSupplier = () => {
  const { canInitiateConversation, isBuyer } = useUserRole();
  
  return {
    canContact: canInitiateConversation,
    reason: !canInitiateConversation 
      ? 'Seuls les acheteurs peuvent initier des conversations avec les fournisseurs'
      : null,
    suggestedAction: !isBuyer 
      ? 'Créer un compte acheteur pour contacter les fournisseurs'
      : null
  };
};