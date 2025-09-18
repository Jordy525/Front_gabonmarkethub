import { useState } from "react";
import { 
  Package, 
  Users, 
  TrendingUp, 
  MessageCircle, 
  Bell, 
  ShoppingCart,
  Eye,
  Heart,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import ResponsiveProductGrid from "@/components/ui/ResponsiveProductGrid";
import ResponsiveProductCard from "@/components/ui/ResponsiveProductCard";
import { RESPONSIVE_CLASSES, useBreakpoint } from "@/config/responsive";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { cn } from "@/lib/utils";

const ResponsiveDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const breakpoint = useBreakpoint();

  // Statistiques
  const stats = [
    {
      title: "Produits vus",
      value: "1,234",
      change: "+12%",
      changeType: "positive",
      icon: Eye,
      color: "text-blue-600"
    },
    {
      title: "Favoris",
      value: "56",
      change: "+8%",
      changeType: "positive",
      icon: Heart,
      color: "text-red-600"
    },
    {
      title: "Messages",
      value: "23",
      change: "+3",
      changeType: "positive",
      icon: MessageCircle,
      color: "text-green-600"
    },
    {
      title: "Commandes",
      value: "12",
      change: "-2",
      changeType: "negative",
      icon: ShoppingCart,
      color: "text-purple-600"
    }
  ];

  // Requête des produits récents
  const { data: recentProducts = [] } = useQuery({
    queryKey: ['recent-products'],
    queryFn: async () => {
      const response = await apiClient.get('/products?limit=6&sort=newest');
      return response.products || response.data || [];
    }
  });

  // Requête des fournisseurs populaires
  const { data: popularSuppliers = [] } = useQuery({
    queryKey: ['popular-suppliers'],
    queryFn: async () => {
      const response = await apiClient.get('/entreprises?limit=4&sort=popular');
      return response.entreprises || response.data || [];
    }
  });

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'suppliers', label: 'Fournisseurs', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageCircle }
  ];

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gray-50">
        <div className={RESPONSIVE_CLASSES.container}>
          {/* Header */}
          <div className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Tableau de bord
                </h1>
                <p className="text-gray-600 mt-2">
                  Bienvenue sur votre espace personnel
                </p>
              </div>
              
              {/* Notifications */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  <Badge variant="secondary" className="ml-2">3</Badge>
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="mb-6 sm:mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
                      activeTab === tab.id
                        ? "border-green-500 text-green-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Statistiques */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            {stat.title}
                          </p>
                          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                            {stat.value}
                          </p>
                        </div>
                        <div className={cn("p-3 rounded-full", stat.color, "bg-opacity-10")}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex items-center mt-4">
                        {stat.changeType === 'positive' ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                        )}
                        <span className={cn(
                          "text-sm font-medium",
                          stat.changeType === 'positive' ? "text-green-600" : "text-red-600"
                        )}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Produits récents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Produits récents</span>
                    <Button variant="outline" size="sm">
                      Voir tout
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveProductGrid
                    columns={{
                      xs: 1,
                      sm: 2,
                      md: 3,
                      lg: 3,
                      xl: 6
                    }}
                    gap="md"
                  >
                    {recentProducts.map((product: any) => (
                      <ResponsiveProductCard
                        key={product.id}
                        product={product}
                        variant="compact"
                        onView={(id) => window.open(`/products/${id}`, '_blank')}
                        onAddToCart={(id) => console.log('Add to cart:', id)}
                        onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
                      />
                    ))}
                  </ResponsiveProductGrid>
                </CardContent>
              </Card>

              {/* Fournisseurs populaires */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Fournisseurs populaires</span>
                    <Button variant="outline" size="sm">
                      Voir tout
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {popularSuppliers.map((supplier: any) => (
                      <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">
                                {supplier.nom_entreprise}
                              </h3>
                              <div className="flex items-center space-x-1 mt-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-gray-600">
                                  {supplier.note_moyenne?.toFixed(1) || '0.0'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({supplier.nombre_avis || 0})
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mes produits favoris</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun produit favori pour le moment</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fournisseurs suivis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun fournisseur suivi pour le moment</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Messages récents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Aucun message pour le moment</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default ResponsiveDashboard;
