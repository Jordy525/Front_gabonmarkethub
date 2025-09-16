import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/api/useAuth";
import { authService } from "@/services/authService";
import { toast } from "sonner";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Logo from "@/components/ui/Logo";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    mot_de_passe: ""
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const loginFunction = useLogin();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Vérifier si on vient de la création de compte
  useEffect(() => {
    if (searchParams.get('message') === 'account_created') {
      setShowSuccessMessage(true);
      toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
    }
  }, [searchParams]);

  // Gestion des callbacks OAuth
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

        toast.success(`Connexion réussie avec ${userData.email} !`);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.mot_de_passe) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    try {
      const loginData = {
        email: formData.email,
        mot_de_passe: formData.mot_de_passe
      };
      const response = await loginFunction(loginData);

      // Vérifier immédiatement que le token fonctionne avant de rediriger
      try {
        const me = await authService.getCurrentUser();
        const userRole = me?.role_id ?? response?.user?.role_id;
        if (userRole === 2) {
          window.location.href = '/supplier/dashboard';
        } else {
          window.location.href = '/buyer/dashboard';
        }
      } catch (e) {
        toast.error("Impossible de valider la session. Veuillez réessayer.");
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Logo
                size="lg"
                onClick={() => navigate('/')}
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Connexion à votre compte
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Ou{' '}
              <button
                onClick={() => navigate('/user-type')}
                className="font-medium text-green-600 hover:text-green-500 underline"
              >
                créez un nouveau compte
              </button>
            </p>
          </div>

          {/* Message de succès */}
          {showSuccessMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Compte créé avec succès !
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Votre compte a été créé. Vous pouvez maintenant vous connecter avec vos identifiants.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="mot_de_passe" className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="mot_de_passe"
                    name="mot_de_passe"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Votre mot de passe"
                    value={formData.mot_de_passe}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="font-medium text-green-600 hover:text-green-500 underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connexion en cours...
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </div>

            {/* OAuth Buttons */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {/* Google Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>

                {/* Facebook Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/facebook`}
                >
                  <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>


          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              En vous connectant, vous acceptez nos{' '}
              <button
                onClick={() => navigate('/terms')}
                className="text-green-600 hover:text-green-500 underline"
              >
                Conditions d'utilisation
              </button>{' '}
              et notre{' '}
              <button
                onClick={() => navigate('/privacy')}
                className="text-green-600 hover:text-green-500 underline"
              >
                Politique de confidentialité
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;