import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/api/useAuth';
import SupplierDashboard from './SupplierDashboard';
import { Loader2 } from 'lucide-react';

const SupplierHome = () => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!currentUser) {
        // Non connecté - rediriger vers la connexion fournisseur
        navigate('/supplier/login', { replace: true });
      } else if (currentUser.role_id !== 2) {
        // Pas un fournisseur - rediriger vers l'accueil général
        navigate('/', { replace: true });
      }
      // Si c'est un fournisseur connecté, on affiche le dashboard
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          <span>Chargement de votre espace fournisseur...</span>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role_id !== 2) {
    return null; // La redirection est en cours
  }

  // Afficher directement le tableau de bord pour les fournisseurs
  return <SupplierDashboard />;
};

export default SupplierHome;