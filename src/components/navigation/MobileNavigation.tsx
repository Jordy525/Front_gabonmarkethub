import { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  Home, 
  Package, 
  Search, 
  Users, 
  MessageCircle, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Heart,
  FileText,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticated, useLogout, useCurrentUser } from "@/hooks/api/useAuth";
import { useUnreadCount } from "@/hooks/api/useMessages";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { UserNotificationBell } from "@/components/notifications/UserNotificationBell";
import { RESPONSIVE_CLASSES, useBreakpoint } from "@/config/responsive";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const MobileNavigation = ({ isOpen, onClose, className }: MobileNavigationProps) => {
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const isAuthenticated = useIsAuthenticated();
  const { data: currentUser } = useCurrentUser();
  const logoutFunction = useLogout();
  const { count: unreadCount = 0 } = useUnreadCount();
  const { photoData } = useProfilePhoto();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Fermer le menu si on change de breakpoint vers desktop
  useEffect(() => {
    if (breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl') {
      onClose();
    }
  }, [breakpoint, onClose]);

  // Fermer le menu lors de la navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      logoutFunction();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Navigation principale
  const mainNavigation = [
    { 
      label: 'Accueil', 
      path: '/', 
      icon: Home,
      description: 'Retour à l\'accueil'
    },
    { 
      label: 'Produits', 
      path: '/products', 
      icon: Package,
      description: 'Catalogue des produits'
    },
    { 
      label: 'Recherche', 
      path: '/search', 
      icon: Search,
      description: 'Recherche avancée'
    },
    { 
      label: 'Fournisseurs', 
      path: '/suppliers', 
      icon: Users,
      description: 'Liste des fournisseurs'
    },
  ];

  // Navigation utilisateur
  const userNavigation = [
    { 
      label: 'Tableau de bord', 
      path: '/dashboard', 
      icon: User,
      description: 'Votre espace personnel'
    },
    { 
      label: 'Messages', 
      path: '/messages', 
      icon: MessageCircle,
      description: 'Vos conversations',
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    { 
      label: 'Favoris', 
      path: '/favorites', 
      icon: Heart,
      description: 'Vos produits favoris'
    },
    { 
      label: 'Profil', 
      path: '/profile', 
      icon: User,
      description: 'Gérer votre profil'
    },
    { 
      label: 'Paramètres', 
      path: '/settings', 
      icon: Settings,
      description: 'Préférences du compte'
    },
  ];

  // Navigation support
  const supportNavigation = [
    { 
      label: 'Centre d\'aide', 
      path: '/help', 
      icon: HelpCircle,
      description: 'FAQ et support'
    },
    { 
      label: 'Blog', 
      path: '/blog', 
      icon: FileText,
      description: 'Articles et actualités'
    },
    { 
      label: 'Contact', 
      path: '/contact', 
      icon: MessageCircle,
      description: 'Nous contacter'
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Navigation Panel */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Menu
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full overflow-y-auto">
          {/* User Info */}
          {isAuthenticated && currentUser && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <ProfileAvatar
                  photoUrl={photoData?.photo_profil}
                  name={`${(currentUser as any)?.nom} ${(currentUser as any)?.prenom}`}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {(currentUser as any)?.nom} {(currentUser as any)?.prenom}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {(currentUser as any)?.email}
                  </p>
                </div>
                <UserNotificationBell />
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <div className="flex-1 p-4 space-y-2">
            {/* Navigation principale */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Navigation
              </h3>
              {mainNavigation.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start h-12 px-3 text-left"
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="h-5 w-5 mr-3 text-gray-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Navigation utilisateur */}
            {isAuthenticated && (
              <div className="space-y-1 pt-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Mon compte
                </h3>
                {userNavigation.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    className="w-full justify-start h-12 px-3 text-left"
                    onClick={() => handleNavigation(item.path)}
                  >
                    <item.icon className="h-5 w-5 mr-3 text-gray-600" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          {item.label}
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2">
                            {item.badge > 9 ? '9+' : item.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {/* Navigation support */}
            <div className="space-y-1 pt-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Support
              </h3>
              {supportNavigation.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start h-12 px-3 text-left"
                  onClick={() => handleNavigation(item.path)}
                >
                  <item.icon className="h-5 w-5 mr-3 text-gray-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? 'Déconnexion...' : 'Se déconnecter'}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleNavigation('/login')}
                >
                  Se connecter
                </Button>
                <Button
                  className="w-full"
                  onClick={() => handleNavigation('/user-type')}
                >
                  S'inscrire
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
