import { useState, useEffect } from "react";
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/ui/back-button";
import CategorySidebarWrapper from "@/components/categories/CategorySidebarWrapper";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { useIsAuthenticated } from "@/hooks/api/useAuth";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { getImageUrl } from "@/config/constants";

interface Category {
  id: number;
  nom: string;
  slug: string;
}

interface CartItem {
  produit_id: number;
  quantite: number;
  prix_unitaire: number;
}



const Products = () => {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showSidebar, setShowSidebar] = useState(true);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [page, setPage] = useState(1);

  // Synchroniser avec les paramètres URL
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    if (category) setSelectedCategory(category);
    if (search) setSearchTerm(search);
  }, [searchParams]);


  // Fonction pour gérer la sélection de catégorie depuis la sidebar
  const handleCategorySelect = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setPage(1);
    
    // Mettre à jour l'URL
    const newParams = new URLSearchParams(searchParams);
    if (categorySlug) {
      newParams.set('category', categorySlug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  // Récupérer les produits avec filtres (version publique pour acheteurs)
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['public-products', searchTerm, selectedCategory, priceMin, priceMax, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
        console.log('🔍 Recherche avec terme:', searchTerm.trim());
      }
      if (selectedCategory) params.append('categorie', selectedCategory);
      if (priceMin && !isNaN(parseFloat(priceMin))) params.append('prix_min', priceMin);
      if (priceMax && !isNaN(parseFloat(priceMax))) params.append('prix_max', priceMax);
      params.append('page', page.toString());
      params.append('limit', '20');
      
      const url = `/products/public?${params.toString()}`;
      console.log('🌐 URL de recherche:', url);
      
      const response = await apiClient.get(url);
      console.log('📦 Réponse API:', response);
      return response;
    },
    staleTime: 30000,
  });

  // Fonction pour effectuer une recherche
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
    
    // Mettre à jour l'URL
    const newParams = new URLSearchParams(searchParams);
    if (term.trim()) {
      newParams.set('search', term.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  // Fonction pour effacer les filtres
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceMin('');
    setPriceMax('');
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const products = (productsData as any)?.products || (productsData as any)?.data || [];
  const pagination = (productsData as any)?.pagination;

  // Fonction pour ajouter au panier
  const addToCart = async (product: any) => {
    try {
      if (!isAuthenticated) {
        toast.error('Veuillez vous connecter pour ajouter au panier');
        navigate('/login');
        return;
      }

      const cartItem: CartItem = {
        produit_id: product.id,
        quantite: product.moq || 1,
        prix_unitaire: product.prix_unitaire
      };

      await apiClient.post('/cart/add', cartItem);
      toast.success(`${product.nom} ajouté au panier`);
    } catch (error: any) {
      console.error('Erreur ajout panier:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout au panier');
    }
  };

  // Fonction pour ajouter aux favoris
  const addToFavorites = async (productId: number) => {
    try {
      if (!isAuthenticated) {
        toast.error('Veuillez vous connecter pour ajouter aux favoris');
        navigate('/login');
        return;
      }

      const response = await apiClient.post('/users/favorites', { produit_id: productId });
      toast.success('Produit ajouté aux favoris');
    } catch (error: any) {
      console.error('Erreur favoris:', error);
      if (error.response?.status === 401) {
        toast.error('Veuillez vous connecter');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout aux favoris');
      }
    }
  };

  // Fonction pour voir les détails
  const viewProduct = (productId: number) => {
    navigate(`/products/${productId}`);
  };



  if (error) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">Impossible de charger les produits</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <BackButton fallbackPath="/" className="mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Catalogue Produits</h1>
            
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <Input
                  placeholder="Rechercher des produits..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(searchTerm);
                    }
                  }}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowSidebar(!showSidebar)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showSidebar ? 'Masquer filtres' : 'Afficher filtres'}
              </Button>
            </div>

            {/* Filtres actifs */}
            {(selectedCategory || searchTerm || priceMin || priceMax) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Recherche: "{searchTerm}"
                    <button
                      onClick={() => handleSearch('')}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Catégorie: {selectedCategory}
                    <button
                      onClick={() => handleCategorySelect('')}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {(priceMin || priceMax) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Prix: {priceMin || '0'}€ - {priceMax || '∞'}€
                    <button
                      onClick={() => {
                        setPriceMin('');
                        setPriceMax('');
                      }}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  Effacer tout
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar des catégories et filtres */}
            {showSidebar && (
              <div className="w-80 space-y-6">
                {/* Sidebar des catégories */}
                <CategorySidebarWrapper
                  onCategorySelect={handleCategorySelect}
                  currentCategory={selectedCategory}
                  showSearch={true}
                  className="sticky top-4"
                />
                
                {/* Filtres de prix */}
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres de prix
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prix (€)</label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Min" 
                          type="number" 
                          value={priceMin}
                          onChange={(e) => setPriceMin(e.target.value)}
                          className="text-sm"
                        />
                        <Input 
                          placeholder="Max" 
                          type="number" 
                          value={priceMax}
                          onChange={(e) => setPriceMax(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gabon-green hover:bg-gabon-green/90"
                      size="sm"
                      onClick={() => setPage(1)}
                    >
                      Appliquer les filtres
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  {isLoading ? 'Chargement...' : `${pagination?.total || products.length} produits trouvés`}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="flex justify-between mb-4">
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                        <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products && Array.isArray(products) && products.length > 0 ? (
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                  {products.filter(product => product && product.id).map((product: any) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow p-4">
                      {product.featured && (
                        <Badge className="mb-2 bg-yellow-400 text-gray-800">Vedette</Badge>
                      )}
                      
                      <div className="relative">
                        <div className="relative w-full h-48 bg-gray-100 rounded-lg mb-4 cursor-pointer overflow-hidden" onClick={() => viewProduct(product.id)}>
                          {product.image_principale ? (
                            <img
                              src={getImageUrl(product.image_principale)}
                              alt={product.nom}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div className={`absolute inset-0 w-full h-full flex items-center justify-center ${product.image_principale ? 'hidden' : ''}`}>
                            <Package className="w-16 h-16 text-gray-400" />
                          </div>
                        </div>

                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-gabon-green" onClick={() => viewProduct(product.id)}>
                        {product.nom || 'Produit sans nom'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{product.nom_entreprise || product.fournisseur || 'Fournisseur non spécifié'}</p>
                      
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.note_moyenne || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({product.nombre_avis || 0})</span>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <span className="text-2xl font-bold text-green-600">{product.prix_unitaire || 0}€</span>
                          <span className="text-sm text-gray-600">/{product.unite || 'unité'}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">MOQ: {product.moq || 1}</p>
                          <p className="text-xs text-gray-600">Stock: {product.stock_disponible ?? 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => addToFavorites(product.id)}
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          Favoris
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-gabon-green hover:bg-gabon-green/90"
                          onClick={() => addToCart(product)}
                          disabled={product.stock_disponible === 0}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || selectedCategory || priceMin || priceMax
                      ? 'Essayez de modifier vos critères de recherche'
                      : 'Aucun produit disponible pour le moment'
                    }
                  </p>
                  {(searchTerm || selectedCategory || priceMin || priceMax) && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                    >
                      Effacer tous les filtres
                    </Button>
                  )}
                </div>
              )}
              
              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Précédent
                  </Button>
                  
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        onClick={() => setPage(pageNum)}
                        className={page === pageNum ? "bg-gabon-green hover:bg-gabon-green/90" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      

    </ResponsiveLayout>
  );
};

export default Products;