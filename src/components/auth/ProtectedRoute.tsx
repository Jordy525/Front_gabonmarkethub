import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { authService } from '@/services/authService';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: number; // 1 = Acheteur, 2 = Fournisseur, 3 = Admin
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const tokenExists = !!authService.getToken();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const location = useLocation();

  if (!tokenExists) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          <span>Vérification de l'authentification...</span>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'a pas été récupéré malgré un token, rediriger
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification des rôles requis
  if (requiredRole && currentUser.role_id !== requiredRole) {
    // Rediriger vers le dashboard approprié selon le rôle de l'utilisateur
    const redirectPath = getRoleBasedRedirect(currentUser.role_id);
    return <Navigate to={redirectPath} replace />;
  }

  // Redirections automatiques selon le rôle pour /dashboard générique
  if (location.pathname === '/dashboard') {
    const redirectPath = getRoleBasedRedirect(currentUser.role_id);
    return <Navigate to={redirectPath} replace />;
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

export default ProtectedRoute;