import { useState } from "react";
import { Menu, User, Globe, MessageCircle, LogOut, Package, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsAuthenticated, useLogout, useCurrentUser } from "@/hooks/api/useAuth";
import { SupplierNotificationBell } from "@/components/notifications/SupplierNotificationBell";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import Logo from "@/components/ui/Logo";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SupplierHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const { data: currentUser } = useCurrentUser();
  const logoutFunction = useLogout();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Hook pour la photo de profil
  const { photoData } = useProfilePhoto();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      logoutFunction();
      toast.success("Déconnexion réussie");
      
      // Attendre un peu avant de naviguer pour éviter les conflits de re-rendu
      setTimeout(() => {
        navigate('/');
        setIsLoggingOut(false);
      }, 100);
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* Top banner */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 text-center text-sm">
        <span className="font-medium">🇬🇦 GabMarketHub - Espace Fournisseur</span>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Logo 
              size="md" 
              text="GabMarketHub - Fournisseur"
              onClick={() => navigate('/supplier/dashboard')}
            />
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <button
              onClick={() => navigate('/supplier/dashboard')}
              className="text-gray-900 hover:text-green-600 transition-colors flex items-center"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Tableau de bord
            </button>
            <button
              onClick={() => navigate('/supplier/dashboard?tab=products')}
              className="text-gray-900 hover:text-green-600 transition-colors flex items-center"
            >
              <Package className="w-4 h-4 mr-1" />
              Mes produits
            </button>
            {isAuthenticated && (
              <button
                onClick={() => navigate('/messages')}
                className="text-gray-900 hover:text-green-600 transition-colors flex items-center"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Messages
              </button>
            )}
          </nav>

          {/* User actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            {isAuthenticated && <SupplierNotificationBell />}

            {/* Auth buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <ProfileAvatar
                        photoUrl={photoData?.photo_profil}
                        name={`${currentUser?.prenom} ${currentUser?.nom}`}
                        size="sm"
                      />
                      <span>{currentUser?.prenom || currentUser?.nom || 'Mon compte'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Mon profil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Paramètres
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" onClick={() => navigate('/supplier/login')}>Se connecter</Button>
                  <Button variant="default" onClick={() => navigate('/user-type')}>S'inscrire</Button>
                </>
              )}
            </div>

            {/* Mobile menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <button
                onClick={() => navigate('/supplier/dashboard')}
                className="text-gray-900 hover:text-green-600 py-2 text-left w-full flex items-center"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Tableau de bord
              </button>
              <button
                onClick={() => navigate('/supplier/dashboard?tab=products')}
                className="text-gray-900 hover:text-green-600 py-2 text-left w-full flex items-center"
              >
                <Package className="w-4 h-4 mr-2" />
                Mes produits
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => navigate('/messages')}
                  className="text-gray-900 hover:text-green-600 py-2 text-left w-full flex items-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Messages
                </button>
              )}
              <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Mon profil
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-red-600"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => navigate('/supplier/login')}>Se connecter</Button>
                    <Button variant="default" className="justify-start" onClick={() => navigate('/user-type')}>S'inscrire</Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default SupplierHeader;