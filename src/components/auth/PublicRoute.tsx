import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAuthenticated, useCurrentUser } from '@/hooks/api/useAuth';
import { Loader2 } from 'lucide-react';

interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const PublicRoute = ({ children, redirectTo }: PublicRouteProps) => {
  const isAuthenticated = useIsAuthenticated();
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Rediriger selon le rôle de l'utilisateur
    const roleBasedRedirect = getRoleBasedRedirect(user.role_id);
    return <Navigate to={redirectTo || roleBasedRedirect} replace />;
  }

  return <>{children}</>;
};

// Fonction utilitaire pour déterminer la redirection selon le rôle
const getRoleBasedRedirect = (roleId: number): string => {
  switch (roleId) {
    case 1: // Acheteur
      return '/buyer/dashboard';
    case 2: // Fournisseur
      return '/supplier/dashboard';
    case 3: // Admin
      return '/admin/dashboard';
    default:
      return '/';
  }
};

export default PublicRoute;