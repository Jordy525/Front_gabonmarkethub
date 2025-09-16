import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { apiClient } from "@/services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Veuillez saisir votre adresse email");
      return;
    }

    setIsLoading(true);
    
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setEmailSent(true);
      toast.success("Si cet email existe dans notre système, vous recevrez un lien de réinitialisation");
    } catch (error: any) {
      console.error('Erreur forgot password:', error);
      toast.error(error.response?.data?.error || "Erreur lors de l'envoi de l'email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {emailSent ? "Email envoyé !" : "Mot de passe oublié ?"}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {emailSent 
                ? "Vérifiez votre boîte email pour réinitialiser votre mot de passe"
                : "Saisissez votre email pour recevoir un lien de récupération"
              }
            </p>
          </CardHeader>

          <CardContent>
            {emailSent ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Un email a été envoyé à <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/login')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Retour à la connexion
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }}
                    className="w-full"
                  >
                    Renvoyer l'email
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                    className="w-full"
                  />
                </div>

                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer le lien de récupération
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate('/login')}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour à la connexion
                  </Button>
                </div>
              </form>
            )}

            {/* Aide */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                Besoin d'aide ?
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Vérifiez votre dossier spam/courrier indésirable</li>
                <li>• L'email peut prendre quelques minutes à arriver</li>
                <li>• Le lien expire après 24 heures</li>
              </ul>
              <p className="text-sm text-blue-800 mt-3">
                Problème persistant ? Contactez notre support à{' '}
                <a href="mailto:support@gabmarkethub.com" className="underline">
                  support@gabmarkethub.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ForgotPassword;