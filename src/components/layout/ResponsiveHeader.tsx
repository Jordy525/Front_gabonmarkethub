import { useState, useEffect } from "react";
import { Search, Menu, User, Globe, MessageCircle, LogOut, X, ChevronDown } from "lucide-react";
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

  const navigationItems = [
    { label: 'Accueil', path: '/', icon: null },
    { label: 'Produits', path: '/products', icon: null },
    { label: 'Recherche', path: '/search', icon: Search },
    { label: 'Catégories', path: '/categories', icon: null },
    { label: 'Fournisseurs', path: '/suppliers', icon: null },
  ];

  const userMenuItems = [
    { label: 'Tableau de bord', path: '/dashboard', icon: User },
    { label: 'Mon profil', path: '/profile', icon: User },
  ];

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
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="text-gray-900 hover:text-green-600 transition-colors font-medium text-sm xl:text-base"
              >
                {item.label}
              </button>
            ))}
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
                  {userMenuItems.map((item) => (
                    <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
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

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-1">
              {navigationItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center px-3 py-3 text-gray-900 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors text-left w-full font-medium"
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                  {item.label}
                </button>
              ))}
              
              {isAuthenticated && (
                <button
                  onClick={() => {
                    navigate('/messages');
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center px-3 py-3 text-gray-900 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors text-left w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  Messages
                </button>
              )}
            </nav>

            {/* User section mobile */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center px-3 py-2">
                    <ProfileAvatar
                      photoUrl={photoData?.photo_profil}
                      name={`${(currentUser as any)?.nom} ${(currentUser as any)?.prenom}`}
                      size="sm"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {(currentUser as any)?.nom} {(currentUser as any)?.prenom}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(currentUser as any)?.email}
                      </p>
                    </div>
                  </div>
                  
                  {userMenuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </button>
                  ))}
                  
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                  >
                    Se connecter
                  </Button>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      navigate('/user-type');
                      setIsMenuOpen(false);
                    }}
                  >
                    S'inscrire
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default ResponsiveHeader;
