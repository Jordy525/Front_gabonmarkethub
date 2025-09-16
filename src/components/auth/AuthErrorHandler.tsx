import { useEffect } from 'react';
import { toast } from 'sonner';
import { authUtils } from '@/services/api';

export const AuthErrorHandler = () => {
  useEffect(() => {
    // Désactivé temporairement pour éviter les déconnexions automatiques
    // La gestion des erreurs d'authentification se fait maintenant dans api.ts
    console.log('AuthErrorHandler: Vérification des tokens désactivée');
  }, []);

  return null;
};

export default AuthErrorHandler;