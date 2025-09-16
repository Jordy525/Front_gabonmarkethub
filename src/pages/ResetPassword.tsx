import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { apiClient } from "@/services/api";
import Layout from "@/components/layout/Layout";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  // Vérifier la validité du token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        return;
      }

      try {
        const response = await apiClient.get(`/auth/reset-password/verify/${token}`);
        setIsValidToken(true);
        setUserInfo(response);
      } catch (error: any) {
        console.error('Erreur vérification token:', error);
        setIsValidToken(false);
        toast.error("Lien de réinitialisation invalide ou expiré");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    
    return {
      minLength,
      hasNumber,
      hasLetter,
      isValid: minLength && hasNumber && hasLetter
    };
  };

  const passwordValidation = validatePassword(formData.newPassword);
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordValidation.isValid) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères, un chiffre et une lettre");
      return;
    }

    if (!passwordsMatch) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword: formData.newPassword
      });

      toast.success("Mot de passe réinitialisé avec succès !");
      navigate('/login');
      
    } catch (error: any) {
      console.error('Erreur reset password:', error);
      toast.error(error.response?.data?.error || "Erreur lors de la réinitialisation");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gabon-green mx-auto"></div>
                <p className="mt-4 text-gray-600">Vérification du lien...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!isValidToken) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Lien invalide
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Ce lien de réinitialisation est invalide ou a expiré.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link to="/forgot-password">
                    Demander un nouveau lien
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">
                    Retour à la connexion
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Nouveau mot de passe
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Créez un nouveau mot de passe pour
            </p>
            <p className="text-gabon-green font-semibold">
              {userInfo?.user?.email}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Votre nouveau mot de passe"
                    value={formData.newPassword}
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
                
                {/* Validation du mot de passe */}
                {formData.newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className={`flex items-center text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Au moins 6 caractères
                    </div>
                    <div className={`flex items-center text-xs ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Contient un chiffre
                    </div>
                    <div className={`flex items-center text-xs ${passwordValidation.hasLetter ? 'text-green-600' : 'text-red-600'}`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Contient une lettre
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmation du mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Validation de la confirmation */}
                {formData.confirmPassword && (
                  <div className="mt-2">
                    <div className={`flex items-center text-xs ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {passwordsMatch ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || !passwordValidation.isValid || !passwordsMatch}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Réinitialisation...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Réinitialiser le mot de passe
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-gabon-green hover:text-gabon-green/80"
                >
                  Retour à la connexion
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ResetPassword;
