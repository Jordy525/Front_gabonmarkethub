import { useState, useEffect } from "react";
import { Eye, Star, ArrowRight, Lock, LogIn, UserPlus, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useIsAuthenticated } from "@/hooks/api/useAuth";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { getImageUrl } from "@/config/constants";

interface PublicProduct {
  id: number;
  name: string;
  description: string;
  image: string;
  supplier: string;
  category: string;
  rating: number;
  reviewCount: number;
  views: number;
  inStock: boolean;
  unit: string;
  hasPromotion?: boolean;
}

const PublicProductsPreview = () => {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const [displayProducts, setDisplayProducts] = useState<PublicProduct[]>([]);

  // Récupérer les vrais produits depuis l'API
  const { data: apiProducts = [], isLoading } = useQuery({
    queryKey: ['public-products-preview'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/products/public?limit=6&featured=true');
        return response.products || response.data || response || [];
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Données mock supprimées pour éviter les erreurs 404

  useEffect(() => {
    if (apiProducts.length > 0) {
      // Transformer les vrais produits en format d'affichage
      const transformedProducts = apiProducts.slice(0, 6).map((product: any) => ({
        id: product.id,
        name: product.nom || 'Produit sans nom',
        description: product.description || 'Description non disponible',
        image: product.image_principale 
          ? getImageUrl(product.image_principale)
          : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
        supplier: product.nom_entreprise || product.fournisseur || 'Fournisseur non spécifié',
        category: product.categorie || 'Non catégorisé',
        rating: product.note_moyenne || 4.0 + Math.random(),
        reviewCount: product.nombre_avis || Math.floor(Math.random() * 100) + 10,
        views: Math.floor(Math.random() * 3000) + 500,
        inStock: product.stock_disponible > 0,
        unit: product.unite || 'unité',
        hasPromotion: Math.random() > 0.7 // 30% de chance d'avoir une promotion
      }));
      setDisplayProducts(transformedProducts);
    } else {
      // Ne pas utiliser les données mock pour éviter les erreurs 404
      setDisplayProducts([]);
    }
  }, [apiProducts]);

  const handleProductClick = (productId: number) => {
    // Permettre l'accès aux produits sans connexion obligatoire
    navigate(`/products/${productId}`);
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Aperçu des Produits Populaires
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez notre sélection de produits professionnels. 
            {!isAuthenticated && (
              <span className="text-blue-600 font-medium">
                {" "}Connectez-vous pour voir les prix et passer commande.
              </span>
            )}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Chargement des produits...</span>
          </div>
        )}

        {/* No Products State */}
        {!isLoading && displayProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun produit disponible</h3>
            <p className="text-gray-500 mb-6">Les produits seront bientôt disponibles.</p>
            <Button onClick={handleViewAllProducts} variant="outline">
              Voir tous les produits
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && displayProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {displayProducts.map((product) => (
            <Card 
              key={product.id} 
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-md"
              onClick={() => handleProductClick(product.id)}
            >
              <div className="relative">
                {/* Image */}
                <div className="h-64 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Overlay for non-authenticated users */}
                  {!isAuthenticated && (
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  )}
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <Badge variant="outline" className="bg-white/90 text-gray-700">
                    {product.category}
                  </Badge>
                  {product.hasPromotion && (
                    <Badge className="bg-red-500 text-white">
                      Promotion
                    </Badge>
                  )}
                  {!product.inStock && (
                    <Badge className="bg-gray-500 text-white">
                      Rupture
                    </Badge>
                  )}
                </div>

                {/* Auth indicator */}
                {!isAuthenticated && (
                  <div className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full">
                    <Lock className="w-4 h-4" />
                  </div>
                )}

                {/* Quick View Button */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Supplier */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">par {product.supplier}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-xs text-gray-500">({product.reviewCount})</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{product.views.toLocaleString()} vues</span>
                  </div>
                  <span>•</span>
                  <span>Unité: {product.unit}</span>
                </div>

                {/* Price Section */}
                <div className="mb-4">
                  {isAuthenticated ? (
                    <div className="text-2xl font-bold text-gray-900">
                      Prix disponible
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                      <Lock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-sm text-gray-600 font-medium">
                        Connectez-vous pour voir le prix
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Voir les détails
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                {!isAuthenticated && (
                  <div className="mt-2 space-y-1">
                    <Button 
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/login');
                      }}
                    >
                      <LogIn className="w-3 h-3 mr-1" />
                      Se connecter pour acheter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        )}

        {/* Empty State */}
        {!isLoading && displayProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit disponible</h3>
            <p className="text-gray-600 mb-4">Les produits seront bientôt disponibles</p>
            <Button onClick={() => navigate('/products')} variant="outline">
              Voir tous les produits
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleViewAllProducts}
            className="bg-green-600 hover:bg-green-700 text-white px-8"
          >
            Voir tous les produits
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          {!isAuthenticated && (
            <div className="mt-6 p-6 bg-blue-50 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🔓 Débloquez tous les avantages
              </h3>
              <p className="text-blue-700 mb-4">
                Créez votre compte pour accéder aux prix, contacter les fournisseurs et passer des commandes
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Se connecter
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/register')}
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Créer un compte gratuit
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PublicProductsPreview;