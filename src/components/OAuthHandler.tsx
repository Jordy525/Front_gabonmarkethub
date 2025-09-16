import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * Composant pour gérer les redirections OAuth
 * À utiliser dans toutes les pages qui peuvent recevoir des callbacks OAuth
 */
const OAuthHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const oauth = searchParams.get('oauth');
    const token = searchParams.get('token');
    const user = searchParams.get('user');

    if (oauth === 'success' && token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        
        // Sauvegarder les données d'authentification
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success(`Connexion OAuth réussie avec ${userData.email} !`);
        
        // Rediriger selon le rôle
        if (userData.role_id === 1) {
          navigate('/dashboard');
        } else if (userData.role_id === 2) {
          navigate('/supplier/dashboard');
        } else if (userData.role_id === 3) {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Erreur parsing OAuth data:', error);
        toast.error('Erreur lors de la connexion OAuth');
      }
    } else if (oauth === 'error') {
      const error = searchParams.get('error');
      toast.error(`Erreur de connexion OAuth: ${error || 'Erreur inconnue'}`);
    }
  }, [searchParams, navigate]);

  return null; // Ce composant ne rend rien
};

export default OAuthHandler;
