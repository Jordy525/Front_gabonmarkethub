import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin } from "@/hooks/api/useAuth";
import { toast } from "sonner";
import Logo from "@/components/ui/Logo";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    mot_de_passe: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await login(formData);
      
      // Vérifier que c'est bien un admin (role_id = 3)
      if (response.data.user.role_id !== 3) {
        setError("Accès refusé. Seuls les administrateurs peuvent accéder à cette page.");
        return;
      }

      toast.success("Connexion administrateur réussie");
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
      toast.error("Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Logo 
              size="xl" 
              showText={false}
              onClick={() => navigate('/')}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Administration
          </h1>
          <p className="text-gray-600">
            Accès réservé aux administrateurs
          </p>
        </div>

        {/* Formulaire de connexion */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-gray-900">
              Connexion Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email administrateur
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@gabmarkethub.com"
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="mot_de_passe" className="text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    id="mot_de_passe"
                    name="mot_de_passe"
                    type={showPassword ? "text" : "password"}
                    value={formData.mot_de_passe}
                    onChange={handleChange}
                    placeholder="Votre mot de passe"
                    required
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connexion...
                  </div>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            {/* Informations de test */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Compte de test (développement)
              </h3>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Email:</strong> admin@gabmarkethub.com</p>
                <p><strong>Mot de passe:</strong> Admin123!</p>
                <p className="text-red-600 mt-2">
                  ⚠️ Changez ces identifiants en production !
                </p>
              </div>
            </div>

            {/* Lien retour */}
            <div className="mt-6 text-center">
              <Link 
                to="/" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Retour à l'accueil
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>GabMarketHub - Administration</p>
          <p>Accès sécurisé et surveillé</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;