import { Star, Heart, MessageCircle, ShoppingCart, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { getImageUrl } from "@/config/constants";



const FeaturedProducts = () => {
  const { data: featuredProducts, isLoading, error } = useQuery({
    queryKey: ['featured-products-public'],
    queryFn: async () => {
      try {
        return await productService.getFeaturedProducts();
      } catch (error) {
        console.error('Erreur chargement produits vedettes:', error);
        return []; // Retourner un tableau vide en cas d'erreur
      }
    },
    retry: false, // Ne pas réessayer automatiquement
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Chargement des produits...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600">Erreur lors du chargement des produits</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredProducts || featuredProducts.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Aucun produit vedette disponible</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Produits vedettes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez notre sélection de produits populaires avec les meilleurs fournisseurs vérifiés.
            Prix compétitifs et qualité garantie.
          </p>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards] overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Product image */}
              <div className="relative overflow-hidden bg-gray-100">
                {product.image_principale ? (
                  <img
                    src={getImageUrl(product.image_principale)}
                    alt={product.nom}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-48 flex items-center justify-center ${product.image_principale ? 'hidden' : ''}`}>
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
                
                {product.statut === 'actif' && (
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Disponible
                    </Badge>
                  </div>
                )}
              </div>

              {/* Product info */}
              <div className="p-5">
                {/* Product name */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                  {product.nom}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Price and MOQ */}
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      {product.prix_unitaire}€
                    </span>
                    <span className="text-sm text-gray-600 ml-1">/unité</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">MOQ</p>
                    <p className="text-sm font-medium text-gray-900">{product.moq} {product.unite}</p>
                  </div>
                </div>

                {/* Supplier info */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900">
                    {product.nom_entreprise || 'Fournisseur'}
                  </p>
                  <div className="flex items-center gap-1">
                    <StarRating rating={product.note_moyenne || 0} readonly size="sm" />
                    <span className="text-xs text-gray-600">
                      {(product.note_moyenne || 0).toFixed(1)} ({product.nombre_avis || 0} avis)
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Demander un devis
                  </Button>
                  <Button variant="default" size="sm" className="flex-1">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center">
          <Button variant="hero" size="lg">
            Voir tous les produits
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;