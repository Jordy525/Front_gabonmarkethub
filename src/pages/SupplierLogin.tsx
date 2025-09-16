import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useLogin } from '@/hooks/api/useAuth';
import Layout from '@/components/layout/Layout';

const SupplierLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const loginFunction = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.mot_de_passe) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      await loginFunction(formData);
      navigate('/supplier/dashboard');
    } catch (error) {
      // L'erreur est gérée par le hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
          <Building className="mx-auto h-12 w-12 text-gabon-green" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Espace Fournisseur
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous à votre compte fournisseur
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Connexion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email professionnel
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    name="email"
                    type="email"
                    required
                    placeholder="contact@votre-entreprise.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    name="mot_de_passe"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Votre mot de passe"
                    value={formData.mot_de_passe}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-gabon-green focus:ring-gabon-green border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Se souvenir de moi
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/supplier/forgot-password"
                    className="font-medium text-gabon-green hover:text-gabon-green/80"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gabon-green hover:bg-gabon-green/90"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Pas encore inscrit ?{' '}
                  <Link
                    to="/supplier/register"
                    className="font-medium text-gabon-green hover:text-gabon-green/80"
                  >
                    Créer un compte fournisseur
                  </Link>
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Vous êtes un client ?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-gabon-green hover:text-gabon-green/80"
                  >
                    Connexion client
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Avantages de l'espace fournisseur</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Gestion complète de vos produits</li>
            <li>• Statistiques de vente détaillées</li>
            <li>• Communication directe avec les clients</li>
            <li>• Gestion des documents et certifications</li>
          </ul>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default SupplierLogin;