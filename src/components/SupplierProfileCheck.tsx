import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Building, User } from 'lucide-react';

interface SupplierProfileCheckProps {
  children: React.ReactNode;
}

const SupplierProfileCheck = ({ children }: SupplierProfileCheckProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkProfile();
  }, []);

  const checkProfile = async () => {
    try {
      const profile = await apiClient.get('/auth/me');
      setUserProfile(profile);

      // Vérifier si c'est un fournisseur
      if (profile.role_id !== 2) {
        toast.error('Accès réservé aux fournisseurs');
        navigate('/dashboard');
        return;
      }

      // Vérifier si l'entreprise existe et est complète
      if (!profile.entreprise) {
        setProfileComplete(false);
        toast.error('Veuillez compléter votre profil entreprise avant d\'ajouter des produits');
      } else {
        // Vérifier les champs obligatoires
        const required = [
          'nom_entreprise',
          'secteur_activite_id',
          'type_entreprise_id',
          'adresse_ligne1',
          'ville',
          'code_postal',
          'pays'
        ];

        const missing = required.filter(field => !profile.entreprise[field]);
        
        if (missing.length > 0) {
          setProfileComplete(false);
          toast.error(`Profil entreprise incomplet. Champs manquants: ${missing.join(', ')}`);
        } else {
          setProfileComplete(true);
        }
      }
    } catch (error: any) {
      console.error('Erreur vérification profil:', error);
      toast.error('Erreur lors de la vérification du profil');
      navigate('/supplier/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gabon-green mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification du profil...</p>
        </div>
      </div>
    );
  }

  if (!profileComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-orange-800">Profil entreprise incomplet</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-orange-700">
                Vous devez compléter votre profil entreprise avant de pouvoir ajouter des produits.
              </p>
              
              {userProfile?.entreprise ? (
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    Informations manquantes
                  </h3>
                  <p className="text-sm text-orange-600">
                    Certains champs obligatoires de votre profil entreprise ne sont pas renseignés.
                  </p>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Aucune entreprise associée
                  </h3>
                  <p className="text-sm text-orange-600">
                    Vous devez d'abord créer votre profil entreprise.
                  </p>
                </div>
              )}

              <div className="flex gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => navigate('/supplier/dashboard')}
                >
                  Retour au tableau de bord
                </Button>
                <Button
                  className="bg-gabon-green hover:bg-gabon-green/90"
                  onClick={() => navigate('/supplier/profile')}
                >
                  Compléter le profil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SupplierProfileCheck;