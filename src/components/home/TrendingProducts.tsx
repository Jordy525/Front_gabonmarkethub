import { useState, useEffect, useMemo } from "react";
import { TrendingUp, Star, ShoppingCart, Eye, Heart, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { getImageUrl } from "@/config/constants";

interface TrendingProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  supplier: string;
  category: string;
  rating: number;
  reviewCount: number;
  views: number;
  sales: number;
  trend: 'up' | 'hot' | 'new';
  trendPercentage: number;
  inStock: boolean;
  minOrder: number;
  unit: string;
}

const TrendingProducts = () => {
  const navigate = useNavigate();

  // Récupérer les produits tendances depuis l'API
  const { data: apiProducts = [], isLoading } = useQuery({
    queryKey: ['trending-products'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/products/public?sort=trending&limit=6');
        return response.products || response.data || response || [];
      } catch (error) {
        console.error('Erreur lors du chargement des produits tendances:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Transformer les produits API en format d'affichage
  const products = useMemo(() => {
    if (apiProducts.length > 0) {
      return apiProducts.map((product: any, index: number) => ({
        id: product.id,
        name: product.nom || 'Produit sans nom',
        description: product.description || 'Description non disponible',
        price: product.prix_unitaire || 0,
        originalPrice: product.prix_promo ? product.prix_unitaire : undefined,
        image: product.image_principale 
          ? getImageUrl(product.image_principale)
          : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
        supplier: product.nom_entreprise || product.fournisseur || 'Fournisseur non spécifié',
        category: product.categorie || 'Non catégorisé',
        rating: product.note_moyenne || 4.0 + (index * 0.1),
        reviewCount: product.nombre_avis || Math.floor(Math.random() * 100) + 10,
        views: product.nombre_vues || Math.floor(Math.random() * 2000) + 500,
        sales: Math.floor(Math.random() * 200) + 10,
        trend: index < 2 ? 'hot' : index < 4 ? 'up' : 'new',
        trendPercentage: 10 + (index * 3),
        inStock: product.stock_disponible > 0,
        minOrder: product.quantite_minimale || 1,
        unit: product.unite || 'unité'
      }));
    }
    return [];
  }, [apiProducts]);

  const getTrendInfo = (trend: string) => {
    switch (trend) {
      case 'hot':
        return { color: 'bg-red-500 text-white', label: '🔥 Hot', icon: TrendingUp };
      case 'up':
        return { color: 'bg-green-500 text-white', label: '📈 Tendance', icon: TrendingUp };
      case 'new':
        return { color: 'bg-blue-500 text-white', label: '✨ Nouveau', icon: Star };
      default:
        return { color: 'bg-gray-500 text-white', label: 'Tendance', icon: TrendingUp };
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-900">Produits Tendance</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les produits les plus populaires et les mieux notés par nos clients professionnels
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Chargement des produits tendances...</span>
          </div>
        )}

        {/* No Products State */}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun produit tendance disponible</h3>
            <p className="text-gray-500 mb-6">Les produits tendances seront bientôt disponibles.</p>
            <Button onClick={() => navigate('/products')} variant="outline">
              Voir tous les produits
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {products.map((product) => {
            const trendInfo = getTrendInfo(product.trend);
            const hasDiscount = product.originalPrice && product.originalPrice > product.price;
            const discountPercentage = hasDiscount 
              ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
              : 0;

            return (
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
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className={`${trendInfo.color} font-bold px-3 py-1`}>
                      {trendInfo.label}
                    </Badge>
                    {hasDiscount && (
                      <Badge className="bg-red-600 text-white font-bold px-3 py-1">
                        -{discountPercentage}%
                      </Badge>
                    )}
                    {!product.inStock && (
                      <Badge className="bg-gray-500 text-white font-bold px-3 py-1">
                        Rupture
                      </Badge>
                    )}
                  </div>

                  {/* Trend Percentage */}
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    +{product.trendPercentage}%
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" className="p-2">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="p-2">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Category & Supplier */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {product.category}
                    </Badge>
                    <span className="text-xs text-gray-500">par {product.supplier}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Rating & Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{product.rating}</span>
                      <span className="text-gray-500">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>{product.views.toLocaleString()}</span>
                    </div>
                    <div className="text-green-600 font-medium">
                      {product.sales} vendus
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-gray-900">
                      {product.price.toLocaleString()} FCFA
                    </span>
                    {hasDiscount && (
                      <span className="text-lg text-gray-400 line-through">
                        {product.originalPrice!.toLocaleString()} FCFA
                      </span>
                    )}
                  </div>

                  {/* Min Order */}
                  <div className="text-sm text-gray-600 mb-4">
                    Commande minimum: {product.minOrder} {product.unit}
                    {product.minOrder > 1 && 's'}
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold group/btn"
                    disabled={!product.inStock}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.inStock ? 'Ajouter au panier' : 'Rupture de stock'}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/products?trending=true')}
            className="bg-green-600 hover:bg-green-700 text-white px-8"
          >
            Voir tous les produits tendance
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;