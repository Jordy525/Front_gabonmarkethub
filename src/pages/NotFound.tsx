import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ShoppingBag } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page introuvable</p>
        <p className="text-gray-500 mb-8">La page que vous recherchez n'existe pas.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/')}
            className="bg-gabon-green hover:bg-gabon-green/90"
          >
            <Home className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Button>
          <Button 
            onClick={() => navigate('/products')}
            variant="outline"
            className="border-gabon-green text-gabon-green hover:bg-gabon-green hover:text-white"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continuer les achats
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
