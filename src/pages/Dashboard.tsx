import { useState, useEffect } from "react";
import { Search, Package, ShoppingCart, Heart, User, FileText, Star, MessageCircle, Grid3X3, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import { useCurrentUser, useLogout } from "@/hooks/api/useAuth";
import { useDashboardStats, useRecentOrders, useFavoriteProducts } from "@/hooks/api/useDashboard";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  
  const { data: user } = useCurrentUser();
  
  // Rediriger les fournisseurs vers leur dashboard spécialisé
  useEffect(() => {
    if (user?.role_id === 2) {
      navigate('/supplier/dashboard', { replace: true });
    }
  }, [user?.role_id, navigate]);
  
  if (user?.role_id === 2) {
    return null;
  }
  
  const { data: stats } = useDashboardStats();
  const { data: recentOrders } = useRecentOrders();
  const { data: favoriteProducts } = useFavoriteProducts();
  
  const logoutMutation = useLogout();
  
  // Catégories de produits
  const categories = [
    { id: 'all', name: 'Toutes catégories', icon: Grid3X3 },
    { id: 'electronics', name: 'Électronique', icon: Package },
    { id: 'textile', name: 'Textile', icon: Package },
    { id: 'food', name: 'Agroalimentaire', icon: Package },
    { id: 'construction', name: 'Construction', icon: Package },
  ];
  
  // Produits en vedette (mock data)
  const featuredProducts = [
    { id: 1, name: 'Smartphone Samsung', price: 250000, image: '/api/placeholder/200/200', supplier: 'TechGabon', rating: 4.5, moq: 10 },
    { id: 2, name: 'Tissu Wax Premium', price: 15000, image: '/api/placeholder/200/200', supplier: 'TextileAfrica', rating: 4.8, moq: 50 },
    { id: 3, name: 'Café Arabica Bio', price: 8000, image: '/api/placeholder/200/200', supplier: 'CaféGabon', rating: 4.6, moq: 25 },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId !== 'all') {
      navigate(`/products?category=${categoryId}`);
    }
  };



  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          {/* Header avec barre de recherche */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Bienvenue, {user?.nom} 👋
                </h1>
                <p className="text-gray-600">
                  Découvrez et commandez des produits de qualité auprès de fournisseurs gabonais
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Mon profil
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </div>
            </div>
            
            {/* Barre de recherche */}
            <form onSubmit={handleSearch} className="mt-6">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Rechercher des produits, fournisseurs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
                <Button variant="outline" onClick={() => navigate('/products')}>
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                </Button>
              </div>
            </form>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar avec catégories et navigation */}
            <div className="lg:col-span-1">
              {/* Catégories */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Grid3X3 className="w-5 h-5 mr-2" />
                  Catégories
                </h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-green-100 text-green-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <category.icon className="w-4 h-4 mr-2" />
                        <span className="text-sm">{category.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Navigation rapide */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Navigation rapide
                </h3>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/orders')}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Mes commandes
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/favorites')}>
                    <Heart className="w-4 h-4 mr-2" />
                    Mes favoris
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/messages')}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Messages
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/invoices')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Factures
                  </Button>
                </div>
              </div>
            </div>

            
            {/* Contenu principal */}
            <div className="lg:col-span-3 space-y-6">
              {/* Statistiques rapides */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/orders')}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                      <Badge variant="secondary">{stats?.commandes || 0}</Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Mes commandes</p>
                    <p className="text-xs text-gray-600">Commandes passées</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/favorites')}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      <Badge variant="secondary">{stats?.favoris || 0}</Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Favoris</p>
                    <p className="text-xs text-gray-600">Produits sauvegardés</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Package className="w-5 h-5 text-green-600" />
                      <Badge variant="secondary">{stats?.fournisseurs || 0}</Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Fournisseurs</p>
                    <p className="text-xs text-gray-600">Partenaires actifs</p>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-5 h-5 text-yellow-600" />
                      <Badge variant="secondary">{stats?.economies || 0}€</Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Économies</p>
                    <p className="text-xs text-gray-600">Ce mois-ci</p>
                  </CardContent>
                </Card>
              </div>

              {/* Produits en vedette */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Produits en vedette
                  </h2>
                  <Button variant="outline" onClick={() => navigate('/products')}>
                    Voir tout
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProducts.map((product) => (
                    <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Par {product.supplier}
                        </p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-green-600">
                            {product.price.toLocaleString()} FCFA
                          </span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">
                              {product.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          MOQ: {product.moq} unités
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1">
                            Voir détails
                          </Button>
                          <Button size="sm" variant="outline">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              {/* Commandes récentes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Mes commandes récentes
                  </h2>
                  <Button variant="outline" onClick={() => navigate('/orders')}>
                    Voir toutes
                  </Button>
                </div>
                
                {recentOrders && recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium text-gray-900">#{order.id}</span>
                            <Badge className="bg-green-100 text-green-800">
                              {order.statut}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {order.produit} - {order.fournisseur}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {order.montant.toLocaleString()} FCFA
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Détails
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Aucune commande récente</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Commencez à explorer nos produits
                    </p>
                    <Button onClick={() => navigate('/products')}>
                      Découvrir les produits
                    </Button>
                  </div>
                )}
              </div>

              {/* Mes favoris */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Mes favoris
                  </h2>
                  <Button variant="outline" onClick={() => navigate('/favorites')}>
                    Voir tous
                  </Button>
                </div>
                
                {favoriteProducts && favoriteProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteProducts.slice(0, 3).map((product) => (
                      <Card key={product.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                            {product.nom}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {product.fournisseur}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-green-600">
                              {product.prix_unitaire.toLocaleString()} FCFA
                            </span>
                            <Button size="sm" variant="outline">
                              Voir
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Aucun produit favori</p>
                    <p className="text-sm text-gray-400 mb-4">
                      Ajoutez des produits à vos favoris pour les retrouver facilement
                    </p>
                    <Button onClick={() => navigate('/products')}>
                      Découvrir des produits
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};



export default Dashboard;