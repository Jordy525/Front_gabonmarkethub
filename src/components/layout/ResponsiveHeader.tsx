import { useState, useEffect } from "react";
import { Search, Menu, User, Globe, MessageCircle, LogOut, X, ChevronDown, Heart, Settings } from "lucide-react";
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
import MobileNavigation from "@/components/navigation/MobileNavigation";
import { RESPONSIVE_CLASSES, useBreakpoint } from "@/config/responsive";

import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ResponsiveHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const breakpoint = useBreakpoint();
  
  const isAuthenticated = useIsAuthenticated();
  const { data: currentUser } = useCurrentUser();
  const logoutFunction = useLogout();
  const navigate = useNavigate();

  const { count: unreadCount = 0 } = useUnreadCount();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Hook pour la photo de profil
  const { photoData } = useProfilePhoto();

  // Détecter le scroll pour l'effet sticky
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile quand on change de breakpoint
  useEffect(() => {
    if (breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl') {
      setIsMenuOpen(false);
      setIsSearchOpen(false);
    }
  }, [breakpoint]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      logoutFunction();
      toast.success("Déconnexion réussie");
      
      setTimeout(() => {
        navigate('/');
        setIsLoggingOut(false);
        setIsMenuOpen(false);
      }, 100);
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
      setIsLoggingOut(false);
    }
  };


  return (
    <header className={`bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 transition-all duration-200 ${
      isScrolled ? 'shadow-lg' : 'shadow-sm'
    }`}>
      {/* Top banner - Masqué sur mobile */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 text-center text-sm hidden sm:block">
        <span className="font-medium">🇬🇦 GabMarketHub - Première plateforme B2B du Gabon</span>
      </div>

      {/* Main header */}
      <div className={RESPONSIVE_CLASSES.container}>
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Logo 
              size={breakpoint === 'xs' ? 'sm' : 'md'} 
              onClick={() => {
                navigate('/');
                setIsMenuOpen(false);
              }}
            />
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <button
              onClick={() => navigate('/')}
              className="text-gray-900 hover:text-green-600 transition-colors font-medium text-sm xl:text-base"
            >
              Accueil
            </button>
            <button
              onClick={() => navigate('/products')}
              className="text-gray-900 hover:text-green-600 transition-colors font-medium text-sm xl:text-base"
            >
              Produits
            </button>
            <button
              onClick={() => navigate('/search')}
              className="text-gray-900 hover:text-green-600 transition-colors font-medium text-sm xl:text-base"
            >
              Recherche
            </button>
            <button
              onClick={() => navigate('/suppliers')}
              className="text-gray-900 hover:text-green-600 transition-colors font-medium text-sm xl:text-base"
            >
              Fournisseurs
            </button>
          </nav>

          {/* Actions Desktop */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
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

            {/* User menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <ProfileAvatar
                      photoUrl={photoData?.photo_profil}
                      name={`${(currentUser as any)?.nom} ${(currentUser as any)?.prenom}`}
                      size="sm"
                    />
                    <span className="hidden xl:inline">
                      {(currentUser as any)?.nom || (currentUser as any)?.prenom || 'Mon compte'}
                    </span>
                    <ChevronDown className="w-4 h-4 hidden xl:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <User className="w-4 h-4 mr-2" />
                    Tableau de bord
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="w-4 h-4 mr-2" />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favorites')}>
                    <Heart className="w-4 h-4 mr-2" />
                    Favoris
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-red-600 hover:bg-red-50 min-h-[44px] touch-target"
                  >
                    <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Se connecter
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate('/user-type')}>
                  S'inscrire
                </Button>
              </div>
            )}
          </div>

          {/* Actions Mobile/Tablet */}
          <div className="flex lg:hidden items-center space-x-2">
            {/* Search button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>

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
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-600 text-white rounded-full text-xs flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            )}

            {/* Notifications */}
            {isAuthenticated && <UserNotificationBell />}

            {/* Menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Search Mobile */}
        {isSearchOpen && (
          <div className="lg:hidden pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Rechercher produits, fournisseurs..."
                className="pl-10 pr-4 h-10 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const searchTerm = (e.target as HTMLInputElement).value;
                    if (searchTerm.trim()) {
                      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
                      setIsSearchOpen(false);
                    }
                  }
                }}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation Component */}
        <MobileNavigation 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
        />
      </div>
    </header>
  );
};

export default ResponsiveHeader;
