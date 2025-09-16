import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Package, Heart, MessageCircle, User, 
  TrendingUp, Eye, Bell, LogOut, Search, Star
} from "lucide-react";
import { useCurrentUser, useLogout } from "@/hooks/api/useAuth";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import Layout from "@/components/layout/Layout";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Hook pour la photo de profil
  const { photoData } = useProfilePhoto();

  // Récupérer les messages de l'acheteur
  const { data: messages } = useQuery({
    queryKey: ['buyer-messages'],
    queryFn: () => apiClient.get('/messages')
  });

  // Récupérer les favoris
  const { data: favorites } = useQuery({
    queryKey: ['buyer-favorites'],
    queryFn: () => apiClient.get('/users/favorites')
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getBuyerStats = () => {
    return [
      {
        title: "Messages",
        value: messages?.length?.toString() || "0",
        icon: MessageCircle,
        color: "text-purple-600",
        action: () => navigate('/messages')
      },
      {
        title: "Favoris",
        value: favorites?.length?.toString() || "0",
        icon: Heart,
        color: "text-red-600",
        action: () => setActiveTab('favorites')
      },
      {
        title: "Produits vus",
        value: "0",
        icon: Eye,
        color: "text-yellow-600",
        action: () => navigate('/products')
      },
      {
        title: "Fournisseurs",
        value: "0",
        icon: Package,
        color: "text-green-600",
        action: () => navigate('/suppliers')
      }
    ];
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <div className="text-center mb-4 lg:mb-6">
                  <div className="flex justify-center mb-3">
                    <ProfileAvatar
                      photoUrl={photoData?.photo_profil}
                      name={`${user?.nom} ${user?.prenom}`}
                      size="lg"
                      className="mx-auto"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{user?.nom} {user?.prenom}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{user?.email}</p>
                  <Badge variant="outline" className="mt-2 text-xs bg-blue-50 text-blue-700">
                    Acheteur
                  </Badge>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab("overview")}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Vue d'ensemble
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => navigate('/suppliers')}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Fournisseurs
                  </Button>
                  <Button
                    variant={activeTab === "favorites" ? "default" : "ghost"}
                    className="w-full justify-start text-sm"
                    onClick={() => setActiveTab("favorites")}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Mes favoris
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm"
                    onClick={() => navigate('/products')}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Parcourir produits
                  </Button>
                </nav>

                <div className="mt-4 lg:mt-8 pt-4 lg:pt-6 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700 text-sm"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {logoutMutation.isPending ? "Déconnexion..." : "Déconnexion"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Welcome */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Tableau de bord acheteur 🛒
                    </h1>
                    <p className="text-gray-600">
                      Bienvenue sur votre espace personnel GabMarketHub
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {getBuyerStats().map((stat, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={stat.action}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="p-2 rounded-lg bg-gray-50">
                              <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gray-900 mb-1">
                              {stat.value}
                            </p>
                            <p className="text-sm text-gray-600">{stat.title}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Actions rapides
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Button 
                        className="flex flex-col items-center p-6 h-auto space-y-2" 
                        onClick={() => navigate('/products')}
                      >
                        <Search className="w-8 h-8" />
                        <span>Parcourir produits</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center p-6 h-auto space-y-2"
                        onClick={() => navigate('/messages')}
                      >
                        <MessageCircle className="w-8 h-8" />
                        <span>Contacter fournisseurs</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center p-6 h-auto space-y-2"
                        onClick={() => setActiveTab('favorites')}
                      >
                        <Heart className="w-8 h-8" />
                        <span>Mes favoris</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}


              {activeTab === "favorites" && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes favoris</h2>
                  {favorites?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favorites.map((product: any) => (
                        <div key={product.id} className="border rounded-lg p-4">
                          <h3 className="font-medium">{product.nom}</h3>
                          <p className="text-sm text-gray-600">{product.prix_unitaire} €</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Aucun favori pour le moment</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BuyerDashboard;