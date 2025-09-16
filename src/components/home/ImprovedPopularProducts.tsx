import React, { useState, useEffect } from 'react';
import { Eye, Star, ArrowRight, TrendingUp, Package, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { getImageUrl } from '@/config/constants';
import { cn } from '@/lib/utils';

interface PopularProduct {
  id: number;
  nom: string;
  description: string;
  image_principale: string;
  fournisseur_nom: string;
  categorie_nom: string;
  prix_unitaire: number;
  prix_promo?: number;
  note_moyenne: number;
  nombre_avis: number;
  vues_30j: number;
  ventes_30j: number;
  score_popularite: number;
  stock_disponible: number;
  est_en_offre: boolean;
  date_fin_promo?: string;
  pourcentage_reduction?: number;
  derniere_activite: string;
}

interface PopularProductsProps {
  maxProducts?: number;
  showByCategory?: boolean;
  title?: string;
  subtitle?: string;
}

export const ImprovedPopularProducts: React.FC<PopularProductsProps> = ({
  maxProducts = 8,
  showByCategory = true,
  title = "Produits Populaires",
  subtitle = "Découvrez les produits les plus appréciés par notre communauté"
}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('carousel');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Récupérer les produits populaires
  const { data: popularProducts = [], isLoading } = useQuery({
    queryKey: ['popular-products', selectedCategory],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          limit: maxProducts.toString(),
          category: selectedCategory
        });
        
        const response = await apiClient.get(`/products/featured?${params}`);
        return response.products || response.data || response || [];
      } catch (error) {
        console.error('Erreur lors du chargement des produits populaires:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Récupérer les catégories pour le filtre
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-for-popular'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/categories?limit=6');
        return response.categories || response.data || response || [];
      } catch (error) {
        return [];
      }
    }
  });

  // Grouper les produits par catégorie si demandé
  const groupedProducts = React.useMemo(() => {
    if (!showByCategory) return { all: popularProducts };
    
    const groups: { [key: string]: PopularProduct[] } = { all: popularProducts };
    
    popularProducts.forEach((product: PopularProduct) => {
      const category = product.categorie_nom || 'Autres';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(product);
    });
    
    return groups;
  }, [popularProducts, showByCategory]);

  // Calculer le nombre de slides pour le carousel
  const productsPerSlide = 4;
  const totalSlides = Math.ceil(popularProducts.length / productsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 168) return `Il y a ${Math.floor(diffInHours / 24)}j`;
    return `Il y a ${Math.floor(diffInHours / 168)} sem`;
  };

  const getPopularityBadge = (score: number) => {
    if (score >= 100) return { text: '🔥 Très populaire', color: 'bg-red-500' };
    if (score >= 50) return { text: '⭐ Populaire', color: 'bg-orange-500' };
    if (score >= 20) return { text: '📈 En hausse', color: 'bg-green-500' };
    return { text: '🆕 Nouveau', color: 'bg-blue-500' };
  };

  if (isLoading) {
    return (
      <div className="py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des produits populaires...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Filtres et contrôles */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {showByCategory && categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  Toutes les catégories
                </Button>
                {categories.slice(0, 5).map((category: any) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.slug ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.slug)}
                  >
                    {category.nom}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'carousel' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('carousel')}
              >
                Carousel
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grille
              </Button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {popularProducts.length}
              </div>
              <div className="text-sm text-gray-600">Produits populaires</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {popularProducts.reduce((sum: number, p: PopularProduct) => sum + p.vues_30j, 0)}
              </div>
              <div className="text-sm text-gray-600">Vues (30j)</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {popularProducts.reduce((sum: number, p: PopularProduct) => sum + p.ventes_30j, 0)}
              </div>
              <div className="text-sm text-gray-600">Ventes (30j)</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(popularProducts.reduce((sum: number, p: PopularProduct) => sum + p.note_moyenne, 0) / popularProducts.length * 10) / 10}
              </div>
              <div className="text-sm text-gray-600">Note moyenne</div>
            </CardContent>
          </Card>
        </div>

        {/* Affichage des produits */}
        {viewMode === 'carousel' ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {popularProducts
                        .slice(slideIndex * productsPerSlide, (slideIndex + 1) * productsPerSlide)
                        .map((product: PopularProduct) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contrôles du carousel */}
            {totalSlides > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg"
                  onClick={prevSlide}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg"
                  onClick={nextSlide}
                >
                  →
                </Button>
              </>
            )}

            {/* Indicateurs */}
            {totalSlides > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentSlide ? "bg-green-600" : "bg-gray-300"
                    )}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {popularProducts.map((product: PopularProduct) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            onClick={() => navigate('/products?sort=popularity')}
            className="bg-green-600 hover:bg-green-700"
          >
            Voir tous les produits populaires
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );

  // Composant ProductCard
  function ProductCard({ product }: { product: PopularProduct }) {
    const popularityBadge = getPopularityBadge(product.score_popularite);
    const finalPrice = product.est_en_offre && product.prix_promo ? product.prix_promo : product.prix_unitaire;
    const hasDiscount = product.est_en_offre && product.prix_promo && product.prix_promo < product.prix_unitaire;

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            {product.image_principale ? (
              <img
                src={getImageUrl(product.image_principale)}
                alt={product.nom}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <Badge className={cn("text-xs", popularityBadge.color)}>
                {popularityBadge.text}
              </Badge>
              {hasDiscount && (
                <Badge variant="destructive" className="text-xs">
                  -{product.pourcentage_reduction}%
                </Badge>
              )}
            </div>

            {/* Actions rapides */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/${product.id}`);
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-4">
            <div className="mb-2">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {product.nom}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{product.fournisseur_nom}</p>
            </div>

            {/* Note et avis */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < Math.floor(product.note_moyenne)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({product.nombre_avis})
              </span>
            </div>

            {/* Prix */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(finalPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    {formatPrice(product.prix_unitaire)}
                  </span>
                )}
              </div>
            </div>

            {/* Statistiques */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {product.vues_30j}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {product.ventes_30j}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {getTimeAgo(product.derniere_activite)}
              </div>
            </div>

            {/* Action */}
            <Button 
              className="w-full"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              Voir le produit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
};
