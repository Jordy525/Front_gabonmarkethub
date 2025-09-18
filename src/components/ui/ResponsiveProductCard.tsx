import { Star, Heart, ShoppingCart, Eye, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RESPONSIVE_CLASSES, useBreakpoint } from "@/config/responsive";
import { getImageUrl } from "@/config/constants";
import { cn } from "@/lib/utils";

interface ResponsiveProductCardProps {
  product: {
    id: number;
    nom: string;
    description?: string;
    prix_unitaire: number;
    prix_promo?: number;
    image_principale?: string;
    images?: Array<{ url: string }>;
    note_moyenne?: number;
    nombre_avis?: number;
    stock_disponible?: number;
    fournisseur?: string;
    localisation?: string;
    categorie?: string;
    quantite_minimale?: number;
    unite?: string;
  };
  onView?: (id: number) => void;
  onAddToCart?: (id: number) => void;
  onToggleFavorite?: (id: number) => void;
  isFavorite?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

const ResponsiveProductCard = ({
  product,
  onView,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  className,
  variant = 'default'
}: ResponsiveProductCardProps) => {
  const breakpoint = useBreakpoint();
  
  // Déterminer la variante selon la taille d'écran
  const getVariant = () => {
    if (variant === 'compact') return 'compact';
    if (variant === 'detailed') return 'detailed';
    
    // Auto-adaptation selon la taille d'écran
    if (breakpoint === 'xs' || breakpoint === 'sm') return 'compact';
    if (breakpoint === 'md') return 'default';
    return 'detailed';
  };

  const currentVariant = getVariant();
  
  // Images du produit
  const productImages = product.images && product.images.length > 0 
    ? product.images.map(img => img.url)
    : product.image_principale 
      ? [product.image_principale]
      : [];

  const mainImage = productImages[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
  
  // Prix
  const hasDiscount = product.prix_promo && product.prix_promo < product.prix_unitaire;
  const displayPrice = hasDiscount ? product.prix_promo : product.prix_unitaire;
  const originalPrice = hasDiscount ? product.prix_unitaire : null;

  // Note
  const rating = product.note_moyenne || 0;
  const reviewCount = product.nombre_avis || 0;

  // Stock
  const isInStock = (product.stock_disponible || 0) > 0;

  if (currentVariant === 'compact') {
    return (
      <Card className={cn("group hover:shadow-lg transition-all duration-200", className)}>
        <CardContent className="p-2 sm:p-3">
          <div className="flex gap-2 sm:gap-3">
            {/* Image compacte - PLEIN ÉCRAN sur mobile */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0">
              <img
                src={getImageUrl(mainImage)}
                alt={product.nom}
                className="w-full h-full object-cover rounded-md sm:rounded-lg"
              />
            </div>
            
            {/* Contenu compact */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-xs sm:text-sm md:text-base line-clamp-2 mb-1">
                {product.nom}
              </h3>
              
              {product.fournisseur && (
                <p className="text-xs text-gray-500 mb-1 truncate">
                  {product.fournisseur}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="font-semibold text-green-600 text-xs sm:text-sm">
                    {displayPrice?.toLocaleString()} FCFA
                  </span>
                  {originalPrice && (
                    <span className="text-xs text-gray-500 line-through">
                      {originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                {rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentVariant === 'detailed') {
    return (
      <Card className={cn("group hover:shadow-xl transition-all duration-300", className)}>
        <div className="relative">
          {/* Image principale - PLEIN ÉCRAN */}
          <div className="aspect-square overflow-hidden rounded-t-lg">
            <img
              src={getImageUrl(mainImage)}
              alt={product.nom}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge className="bg-red-500 text-white">
                -{Math.round(((product.prix_unitaire - product.prix_promo!) / product.prix_unitaire) * 100)}%
              </Badge>
            )}
            {!isInStock && (
              <Badge variant="secondary">Rupture de stock</Badge>
            )}
          </div>
          
          {/* Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="w-8 h-8"
              onClick={() => onToggleFavorite?.(product.id)}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-red-500 text-red-500")} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="w-8 h-8"
              onClick={() => onView?.(product.id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <CardContent className="p-3 sm:p-4 lg:p-6">
          {/* Catégorie */}
          {product.categorie && (
            <Badge variant="outline" className="mb-2 text-xs">
              {product.categorie}
            </Badge>
          )}
          
          {/* Titre */}
          <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-2 line-clamp-2">
            {product.nom}
          </h3>
          
          {/* Description */}
          {product.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          
          {/* Fournisseur et localisation */}
          <div className="space-y-1 mb-4">
            {product.fournisseur && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="font-medium">{product.fournisseur}</span>
              </div>
            )}
            {product.localisation && (
              <div className="flex items-center text-xs text-gray-500">
                <MapPin className="w-3 h-3 mr-1" />
                {product.localisation}
              </div>
            )}
          </div>
          
          {/* Note et avis */}
          {rating > 0 && (
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {rating.toFixed(1)} ({reviewCount} avis)
              </span>
            </div>
          )}
          
          {/* Prix */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-bold text-green-600">
                {displayPrice?.toLocaleString()} FCFA
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  {originalPrice.toLocaleString()} FCFA
                </span>
              )}
            </div>
            {product.quantite_minimale && (
              <span className="text-xs text-gray-500">
                Min: {product.quantite_minimale} {product.unite || 'unité'}
              </span>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-3 sm:p-4 lg:p-6 pt-0">
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 text-xs sm:text-sm"
              onClick={() => onView?.(product.id)}
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Voir</span>
              <span className="sm:hidden">👁</span>
            </Button>
            <Button
              className="flex-1 text-xs sm:text-sm"
              onClick={() => onAddToCart?.(product.id)}
              disabled={!isInStock}
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{isInStock ? 'Ajouter' : 'Indisponible'}</span>
              <span className="sm:hidden">{isInStock ? '🛒' : '❌'}</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Variant par défaut
  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-200", className)}>
      <div className="relative">
        {/* Image */}
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={getImageUrl(mainImage)}
            alt={product.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2">
          {hasDiscount && (
            <Badge className="bg-red-500 text-white text-xs">
              -{Math.round(((product.prix_unitaire - product.prix_promo!) / product.prix_unitaire) * 100)}%
            </Badge>
          )}
        </div>
        
        {/* Actions */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8"
            onClick={() => onToggleFavorite?.(product.id)}
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-red-500 text-red-500")} />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        {/* Titre */}
        <h3 className="font-semibold text-base mb-2 line-clamp-2">
          {product.nom}
        </h3>
        
        {/* Fournisseur */}
        {product.fournisseur && (
          <p className="text-sm text-gray-600 mb-2 truncate">
            {product.fournisseur}
          </p>
        )}
        
        {/* Note */}
        {rating > 0 && (
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">
              {rating.toFixed(1)} ({reviewCount})
            </span>
          </div>
        )}
        
        {/* Prix */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-green-600">
              {displayPrice?.toLocaleString()} FCFA
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 sm:p-4 pt-0">
        <Button
          className="w-full text-xs sm:text-sm"
          onClick={() => onAddToCart?.(product.id)}
          disabled={!isInStock}
        >
          <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">{isInStock ? 'Ajouter au panier' : 'Indisponible'}</span>
          <span className="sm:hidden">{isInStock ? '🛒 Ajouter' : '❌'}</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResponsiveProductCard;

