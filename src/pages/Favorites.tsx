import { useState, useMemo } from "react";
import { Heart, Trash2, ShoppingCart, Eye, Star, Search, Filter, Grid3X3, List, Share2, Download, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackButton } from "@/components/ui/back-button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { getImageUrl } from "@/config/constants";

const Favorites = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // États pour les nouvelles fonctionnalités
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_added');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFavorites, setSelectedFavorites] = useState<number[]>([]);

  // Récupérer les favoris
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => apiClient.get('/users/favorites')
  });

  // Mutation pour supprimer un favori
  const removeFavoriteMutation = useMutation({
    mutationFn: (productId: number) => apiClient.delete(`/users/favorites/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Produit retiré des favoris');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  });

  // Fonction pour ajouter au panier
  const addToCart = async (product: any) => {
    try {
      const cartItem = {
        produit_id: product.id,
        quantite: product.moq || 1,
        prix_unitaire: product.prix_unitaire
      };

      await apiClient.post('/cart/add', cartItem);
      toast.success(`${product.nom} ajouté au panier`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout au panier');
    }
  };

  // Filtrer et trier les favoris
  const filteredAndSortedFavorites = useMemo(() => {
    let filtered = favorites.filter((product: any) => {
      // Filtre de recherche
      if (searchTerm) {
        const matchesName = product.nom.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSupplier = product.fournisseur_nom?.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesName && !matchesSupplier) return false;
      }
      
      // Filtre par catégorie
      if (selectedCategory !== 'all' && product.categorie_nom !== selectedCategory) {
        return false;
      }
      
      return true;
    });

    // Tri
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'name_asc':
          return a.nom.localeCompare(b.nom);
        case 'name_desc':
          return b.nom.localeCompare(a.nom);
        case 'price_asc':
          return a.prix_unitaire - b.prix_unitaire;
        case 'price_desc':
          return b.prix_unitaire - a.prix_unitaire;
        case 'rating':
          return (b.note_moyenne || 0) - (a.note_moyenne || 0);
        default: // 'date_added'
          return new Date(b.date_ajout || b.created_at).getTime() - new Date(a.date_ajout || a.created_at).getTime();
      }
    });

    return filtered;
  }, [favorites, searchTerm, selectedCategory, sortBy]);

  // Obtenir les catégories uniques
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(favorites.map((product: any) => product.categorie_nom).filter(Boolean))];
    return uniqueCategories;
  }, [favorites]);

  // Fonctions pour la sélection multiple
  const toggleSelection = (productId: number) => {
    setSelectedFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAll = () => {
    setSelectedFavorites(filteredAndSortedFavorites.map((product: any) => product.id));
  };

  const clearSelection = () => {
    setSelectedFavorites([]);
  };

  // Supprimer les favoris sélectionnés
  const removeSelectedFavorites = async () => {
    if (selectedFavorites.length === 0) return;
    
    try {
      await Promise.all(
        selectedFavorites.map(id => apiClient.delete(`/users/favorites/${id}`))
      );
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(`${selectedFavorites.length} favori(s) supprimé(s)`);
      setSelectedFavorites([]);
    } catch (error: any) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Partager les favoris
  const shareFavorites = () => {
    const selectedProducts = filteredAndSortedFavorites.filter((product: any) => 
      selectedFavorites.includes(product.id)
    );
    
    const shareText = `Mes favoris GabMarketHub:\n${selectedProducts.map((p: any) => `• ${p.nom} - ${p.prix_unitaire}€`).join('\n')}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mes favoris GabMarketHub',
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('Liste copiée dans le presse-papiers');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos favoris...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <BackButton fallbackPath="/dashboard" className="mb-4" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Mes Favoris</h1>
                  <p className="text-gray-600">
                    {favorites.length} produit{favorites.length > 1 ? 's' : ''} dans vos favoris
                  </p>
                </div>
              </div>
              
              {selectedFavorites.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {selectedFavorites.length} sélectionné{selectedFavorites.length > 1 ? 's' : ''}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={shareFavorites}>
                    <Share2 className="w-4 h-4 mr-1" />
                    Partager
                  </Button>
                  <Button variant="destructive" size="sm" onClick={removeSelectedFavorites}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              )}
            </div>

            {/* Barre de recherche et filtres */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher dans vos favoris..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_added">Date d'ajout</SelectItem>
                    <SelectItem value="name_asc">Nom (A-Z)</SelectItem>
                    <SelectItem value="name_desc">Nom (Z-A)</SelectItem>
                    <SelectItem value="price_asc">Prix (croissant)</SelectItem>
                    <SelectItem value="price_desc">Prix (décroissant)</SelectItem>
                    <SelectItem value="rating">Note</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            {favorites.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Tout sélectionner
                </Button>
                {selectedFavorites.length > 0 && (
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Désélectionner tout
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Aucun favori pour le moment</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Découvrez nos produits et ajoutez-les à vos favoris pour les retrouver facilement
              </p>
              <Button size="lg" onClick={() => navigate('/products')}>
                Découvrir les produits
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((product: any) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    {/* Image */}
                    <div className="relative w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                      {product.image_principale ? (
                        <img
                          src={getImageUrl(product.image_principale)}
                          alt={product.nom}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => navigate(`/products/${product.id}`)}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center cursor-pointer"
                             onClick={() => navigate(`/products/${product.id}`)}>
                          <Eye className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Bouton supprimer */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                        onClick={() => removeFavoriteMutation.mutate(product.id)}
                        disabled={removeFavoriteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>

                    {/* Informations produit */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1 cursor-pointer hover:text-green-600"
                            onClick={() => navigate(`/products/${product.id}`)}>
                          {product.nom}
                        </h3>
                        <p className="text-sm text-gray-600">{product.fournisseur_nom}</p>
                      </div>

                      {/* Note */}
                      <div className="flex items-center gap-1">
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

                      {/* Prix */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-green-600">
                            {product.prix_unitaire}€
                          </span>
                          <span className="text-sm text-gray-600">/{product.unite}</span>
                        </div>
                        {product.featured && (
                          <Badge className="bg-yellow-400 text-gray-800">Vedette</Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => addToCart(product)}
                          disabled={product.stock_disponible === 0}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Panier
                        </Button>
                      </div>

                      {product.stock_disponible === 0 && (
                        <p className="text-sm text-red-600 text-center">Stock épuisé</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Actions rapides */}
          {favorites.length > 0 && (
            <div className="mt-12 text-center space-y-4">
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline" onClick={() => navigate('/products')}>
                  Continuer mes achats
                </Button>
                <Button onClick={() => navigate('/cart')}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Voir mon panier
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Favorites;