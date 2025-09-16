import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/api/useAuth';
import { Loader2 } from 'lucide-react';

const SupplierRedirect = () => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.role_id === 2) {
        // Fournisseur - rediriger vers le tableau de bord fournisseur
        navigate('/supplier/dashboard', { replace: true });
      } else {
        // Acheteur - rediriger vers le tableau de bord client
        navigate('/dashboard', { replace: true });
      }
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          <span>Redirection en cours...</span>
        </div>
      </div>
    );
  }

  return null;
};

export default SupplierRedirect;