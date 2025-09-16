import { useState } from "react";
import { Search, Menu, User, Globe, MessageCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUnreadCount } from "@/hooks/api/useMessages";
import { useIsAuthenticated, useLogout, useCurrentUser } from "@/hooks/api/useAuth";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { UserNotificationBell } from "@/components/notifications/UserNotificationBell";
import Logo from "@/components/ui/Logo";

import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const { data: currentUser } = useCurrentUser();
  const logoutFunction = useLogout();
  const navigate = useNavigate();

  const { count: unreadCount = 0 } = useUnreadCount();
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
        <span className="font-medium">🇬🇦 GabMarketHub - Première plateforme B2B du Gabon</span>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Logo 
              size="md" 
              onClick={() => navigate('/')}
            />
          </div>

          {/* Search bar - Desktop */}
          {/* <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                placeholder="Rechercher produits, fournisseurs, catégories..."
                className="pl-12 pr-4 h-12 border-gray-300 focus:border-green-600"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const searchTerm = (e.target as HTMLInputElement).value;
                    if (searchTerm.trim()) {
                      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
                    }
                  }
                }}
              /> */}
              {/* <Button
                variant="default"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder*="Rechercher produits"]') as HTMLInputElement;
                  const searchTerm = searchInput?.value;
                  if (searchTerm?.trim()) {
                    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
                  } else {
                    navigate('/products');
                  }
                }}
              >
                Rechercher
              </Button> */}
            {/* </div>
          </div> */}

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-6">
            <button onClick={() => navigate('/')} className="text-gray-900 hover:text-green-600 transition-colors font-medium">
              Accueil
            </button>
            <button onClick={() => navigate('/products')} className="text-gray-900 hover:text-green-600 transition-colors">
              Produits
            </button>
            <button onClick={() => navigate('/search')} className="text-gray-900 hover:text-green-600 transition-colors">
              Recherche
            </button>
            <button 
              onClick={() => navigate('/categories')}
              className="text-gray-900 hover:text-green-600 font-medium transition-colors"
            >
              Catégories
            </button>
            <button onClick={() => navigate('/suppliers')} className="text-gray-900 hover:text-green-600 transition-colors">
              Fournisseurs
            </button>
            {isAuthenticated && (
              <>
                {/* <button onClick={() => navigate('/messages')} className="text-gray-900 hover:text-green-600 transition-colors">
                  Messages
                </button> */}
              </>
            )}
          </nav>

          {/* User actions */}
          <div className="flex items-center space-x-3">
            {/* Messages */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => navigate('/messages')}
              >
                <MessageCircle className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white rounded-full text-xs flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            )}

            {/* Notifications */}
            {isAuthenticated && <UserNotificationBell />}



            {/* Auth buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <ProfileAvatar
                        photoUrl={photoData?.photo_profil}
                        name={`${(currentUser as any)?.nom} ${(currentUser as any)?.prenom}`}
                        size="sm"
                      />
                      <span>{(currentUser as any)?.nom || (currentUser as any)?.prenom || 'Mon compte'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <User className="w-4 h-4 mr-2" />
                      Tableau de bord
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Mon profil
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
                  <Button variant="ghost" onClick={() => navigate('/login')}>Se connecter</Button>
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

        {/* Mobile search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 pr-4 h-10"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const searchTerm = (e.target as HTMLInputElement).value;
                  if (searchTerm.trim()) {
                    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-3">
              <button onClick={() => navigate('/')} className="text-gray-900 hover:text-green-600 py-2 text-left w-full font-medium">Accueil</button>
              <button onClick={() => navigate('/products')} className="text-gray-900 hover:text-green-600 py-2 text-left w-full">Produits</button>
              <button onClick={() => navigate('/search')} className="text-gray-900 hover:text-green-600 py-2 text-left w-full">Recherche</button>
              <button onClick={() => navigate('/categories')} className="text-gray-900 hover:text-green-600 py-2 text-left w-full">Catégories</button>
              <button onClick={() => navigate('/suppliers')} className="text-gray-900 hover:text-green-600 py-2 text-left w-full">Fournisseurs</button>
              {isAuthenticated && (
                <>
                  <button onClick={() => navigate('/messages')} className="text-gray-900 hover:text-green-600 py-2 text-left w-full">Messages</button>
                </>
              )}
              <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" className="justify-start" onClick={() => navigate('/dashboard')}>
                      <User className="w-4 h-4 mr-2" />
                      Tableau de bord
                    </Button>
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
                    <Button variant="ghost" className="justify-start" onClick={() => navigate('/login')}>Se connecter</Button>
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

export default Header;