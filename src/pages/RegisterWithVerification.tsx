import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { apiClient } from "@/services/api";
import Layout from "@/components/layout/Layout";
import EmailVerification from "@/components/auth/EmailVerification";

const RegisterWithVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userType = searchParams.get('type') || 'acheteur';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [step, setStep] = useState<'form' | 'verification'>('form');

  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: '',
    confirm_password: '',
    nom: '',
    prenom: '',
    telephone: '',
    acceptTerms: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.mot_de_passe || !formData.nom) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return false;
    }

    if (formData.mot_de_passe !== formData.confirm_password) {
      toast.error("Les mots de passe ne correspondent pas");
      return false;
    }

    if (formData.mot_de_passe.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }

    if (!formData.acceptTerms) {
      toast.error("Vous devez accepter les conditions d'utilisation");
      return false;
    }

    return true;
  };

  const handleSendVerification = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await apiClient.post('/auth/register/send-verification', {
        email: formData.email
      });

      // Sauvegarder les données du formulaire
      localStorage.setItem('registrationData', JSON.stringify({
        mot_de_passe: formData.mot_de_passe,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        role_id: userType === 'fournisseur' ? 2 : 1
      }));

      setStep('verification');
      toast.success("Code de vérification envoyé par email !");
      
    } catch (error: any) {
      console.error('Erreur envoi vérification:', error);
      toast.error(error.response?.data?.error || "Erreur lors de l'envoi du code de vérification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      await apiClient.post('/auth/register/send-verification', {
        email: formData.email
      });
    } catch (error: any) {
      console.error('Erreur renvoi code:', error);
      toast.error("Erreur lors du renvoi du code");
      throw error;
    } finally {
      setIsResending(false);
    }
  };

  const handleVerificationSuccess = (userData: any) => {
    // Nettoyer les données temporaires
    localStorage.removeItem('registrationData');
    
    // Rediriger vers la page de connexion avec un message de succès
    navigate('/login?message=account_created');
  };

  const handleBack = () => {
    setStep('form');
    localStorage.removeItem('registrationData');
  };

  if (step === 'verification') {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
          <EmailVerification
            email={formData.email}
            onVerificationSuccess={handleVerificationSuccess}
            onBack={handleBack}
            onResendCode={handleResendCode}
            isResending={isResending}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Créer un compte {userType === 'fournisseur' ? 'Fournisseur' : 'Acheteur'}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                Commencez par vérifier votre adresse email
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleSendVerification(); }} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <Input
                    name="nom"
                    type="text"
                    required
                    placeholder="Votre nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Prénom */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <Input
                    name="prenom"
                    type="text"
                    placeholder="Votre prénom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <Input
                    name="telephone"
                    type="tel"
                    placeholder="+241 XX XX XX XX"
                    value={formData.telephone}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe *
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

                {/* Confirmation mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      name="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Confirmez votre mot de passe"
                      value={formData.confirm_password}
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
                </div>

                {/* Conditions d'utilisation */}
                <div className="flex items-start space-x-2">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-gabon-green focus:ring-gabon-green border-gray-300 rounded"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                    J'accepte les{' '}
                    <a href="/terms" className="text-gabon-green hover:underline">
                      conditions d'utilisation
                    </a>{' '}
                    et la{' '}
                    <a href="/privacy" className="text-gabon-green hover:underline">
                      politique de confidentialité
                    </a>
                  </label>
                </div>

                {/* Bouton de soumission */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Vérifier le mail
                    </>
                  )}
                </Button>

                {/* Lien de connexion */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Vous avez déjà un compte ?{' '}
                    <a
                      href={userType === 'fournisseur' ? '/supplier/login' : '/login'}
                      className="font-medium text-gabon-green hover:text-gabon-green/80"
                    >
                      Connectez-vous
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterWithVerification;
