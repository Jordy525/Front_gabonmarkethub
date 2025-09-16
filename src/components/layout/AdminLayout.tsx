import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser, useLogout } from "@/hooks/api/useAuth";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { AdminNotificationBell } from "@/components/admin/AdminNotificationBell";
import Logo from "@/components/ui/Logo";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const AdminLayout = ({ children, activeTab, onTabChange }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: currentUser } = useCurrentUser();
  const logout = useLogout();
  const navigate = useNavigate();
  
  // Hook pour la photo de profil
  const { photoData } = useProfilePhoto();

  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie");
    navigate("/admin/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const query = searchQuery.trim();
      
      // Recherche intelligente basée sur le contenu
      if (query.includes('@') || query.includes('email')) {
        // Recherche d'utilisateur par email
        navigate(`/admin/users?search=${encodeURIComponent(query)}`);
        toast.info(`Recherche d'utilisateur: ${query}`);
      } else {
        // Recherche générale d'utilisateur
        navigate(`/admin/users?search=${encodeURIComponent(query)}`);
        toast.info(`Recherche: ${query}`);
      }
      
      setSearchQuery(''); // Vider la barre après recherche
    }
  };

  const handleNavigation = (tab: string) => {
    // Navigation directe vers les pages
    switch (tab) {
      case "overview":
        navigate("/admin/dashboard");
        break;
      case "users":
        navigate("/admin/users");
        break;
      case "analytics":
        // Pour l'instant, on reste sur le dashboard avec l'onglet actif
        navigate("/admin/dashboard");
        onTabChange?.(tab);
        break;
      case "settings":
        navigate("/admin/settings");
        break;
      default:
        onTabChange?.(tab);
        break;
    }
    setSidebarOpen(false);
  };

  const menuItems = [
    {
      key: "overview",
      label: "Vue d'ensemble",
      icon: BarChart3,
      description: "Statistiques générales"
    },
    {
      key: "users",
      label: "Utilisateurs",
      icon: Users,
      description: "Gestion des comptes"
    },
    {
      key: "analytics",
      label: "Analyses",
      icon: BarChart3,
      description: "Rapports détaillés"
    },
    {
      key: "settings",
      label: "Paramètres",
      icon: Settings,
      description: "Configuration système"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm fixed top-0 left-0 right-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo et titre */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden mr-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>

              <div className="flex items-center space-x-3">
                <Logo 
                  size="sm" 
                  showText={false}
                  onClick={() => navigate('/admin/dashboard')}
                />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Administration
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    GabMarketHub
                  </p>
                </div>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher utilisateurs..."
                  className="pl-10 pr-4 h-9 border-gray-300"
                />
              </form>
            </div>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-3">
              {/* Notifications Admin */}
              <AdminNotificationBell />

              {/* Menu utilisateur */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <ProfileAvatar
                      photoUrl={photoData?.photo_profil}
                      name={`${(currentUser as any)?.nom} ${(currentUser as any)?.prenom}`}
                      size="sm"
                    />
                    <span className="hidden sm:block text-sm font-medium">
                      {(currentUser as any)?.nom || "Admin"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-medium">{(currentUser as any)?.nom}</p>
                    <p className="text-xs text-gray-500">{(currentUser as any)?.email}</p>
                    <Badge className="mt-1 bg-red-100 text-red-800 text-xs">
                      Administrateur
                    </Badge>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/admin/profile')}>
                    <Shield className="w-4 h-4 mr-2" />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.key)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${activeTab === item.key
                      ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div>{item.label}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Footer sidebar */}
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                <p>GabMarketHub Admin</p>
                <p>Version 1.0.0</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay pour mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenu principal */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="p-6 max-h-screen overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;