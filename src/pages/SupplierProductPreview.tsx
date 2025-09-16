import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, Package, Eye, Star, MapPin, Calendar, 
  Truck, Shield, Award, Info, Image as ImageIcon, Building
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SupplierLayout from "@/components/layout/SupplierLayout";
import { apiClient } from "@/services/api";
import { getImageUrl } from "@/config/constants";
import { formatPrice, formatRating, safeInteger } from "@/utils/formatters";

const SupplierProductPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);

  // Récupérer les détails du produit
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product-preview', id],
    queryFn: async () => {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  if (isLoading) {
    return (
      <SupplierLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Chargement du produit...</p>
          </div>
        </div>
      </SupplierLayout>
    );
  }

  if (error || !product) {
    return (
      <SupplierLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Produit non trouvé</h2>
            <p className="text-gray-600 mb-4">Ce produit n'existe pas ou vous n'avez pas les droits pour le voir.</p>
            <Button onClick={() => navigate('/supplier/dashboard?tab=products')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à mes produits
            </Button>
          </div>
        </div>
      </SupplierLayout>
    );
  }

  const images = product.images || [];
  const mainImage = images.length > 0 ? images[selectedImage] : null;

  return (
    <SupplierLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          {/* Header avec navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/supplier/dashboard?tab=products')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à mes produits
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Aperçu produit</h1>
                <p className="text-gray-600">Vue publique de votre produit</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className={product.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {product.statut === 'actif' ? 'Actif' : 'Inactif'}
              </Badge>
              <Button 
                variant="outline"
                onClick={() => navigate(`/supplier/products/edit/${product.id}`)}
              >
                Modifier le produit
              </Button>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images du produit */}
            <div className="space-y-4">
              {/* Image principale */}
              <div className="aspect-square bg-white rounded-lg border overflow-hidden">
                {mainImage ? (
                  <img
                    src={getImageUrl(mainImage.url)}
                    alt={mainImage.alt_text || product.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Miniatures */}
              {images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                        selectedImage === index ? 'border-green-500' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={getImageUrl(image.url)}
                        alt={image.alt_text}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations du produit */}
            <div className="space-y-6">
              {/* Titre et prix */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.nom}</h2>
                {product.marque && (
                  <p className="text-lg text-gray-600 mb-4">Marque: {product.marque}</p>
                )}
                
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-3xl font-bold text-green-600">
                    {formatPrice(product.prix_unitaire)}
                  </span>
                  <span className="text-gray-600">/unité</span>
                </div>

                {/* Note et avis */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.note_moyenne || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatRating(product.note_moyenne)} ({safeInteger(product.nombre_avis)} avis)
                  </span>
                </div>
              </div>

              {/* Informations clés */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">MOQ</p>
                      <p className="text-xl font-bold text-gray-900">
                        {safeInteger(product.moq)} {product.unite}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Stock</p>
                      <p className="text-xl font-bold text-gray-900">
                        {safeInteger(product.stock_disponible)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description courte */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{product.description}</p>
                </div>
              )}

              {/* Informations fournisseur */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Informations fournisseur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Entreprise:</strong> {product.nom_entreprise}</p>
                    {product.port_depart && (
                      <p className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Port de départ: {product.port_depart}
                      </p>
                    )}
                    {product.delai_livraison_estime && (
                      <p className="flex items-center">
                        <Truck className="w-4 h-4 mr-2" />
                        Délai de livraison: {product.delai_livraison_estime}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Onglets avec détails */}
          <div className="mt-8">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="specifications">Spécifications</TabsTrigger>
                <TabsTrigger value="shipping">Livraison</TabsTrigger>
                <TabsTrigger value="certifications">Certifications</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Description détaillée</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      {product.description_longue ? (
                        <p className="text-gray-700 whitespace-pre-wrap">{product.description_longue}</p>
                      ) : (
                        <p className="text-gray-500 italic">Aucune description détaillée disponible</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Spécifications techniques</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.materiaux && (
                        <div>
                          <h4 className="font-semibold text-gray-900">Matériaux</h4>
                          <p className="text-gray-700">{product.materiaux}</p>
                        </div>
                      )}
                      {product.dimensions && (
                        <div>
                          <h4 className="font-semibold text-gray-900">Dimensions</h4>
                          <p className="text-gray-700">{product.dimensions}</p>
                        </div>
                      )}
                      {product.poids && (
                        <div>
                          <h4 className="font-semibold text-gray-900">Poids</h4>
                          <p className="text-gray-700">{product.poids} kg</p>
                        </div>
                      )}
                      {product.couleurs_disponibles && (
                        <div>
                          <h4 className="font-semibold text-gray-900">Couleurs disponibles</h4>
                          <p className="text-gray-700">{product.couleurs_disponibles}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="shipping" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de livraison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {product.delai_traitement && (
                        <div>
                          <h4 className="font-semibold text-gray-900">Délai de traitement</h4>
                          <p className="text-gray-700">{product.delai_traitement} jours</p>
                        </div>
                      )}
                      {product.port_depart && (
                        <div>
                          <h4 className="font-semibold text-gray-900">Port de départ</h4>
                          <p className="text-gray-700">{product.port_depart}</p>
                        </div>
                      )}
                      {product.politique_retour && (
                        <div>
                          <h4 className="font-semibold text-gray-900">Politique de retour</h4>
                          <p className="text-gray-700">{product.politique_retour}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="certifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications et garanties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {product.certifications && (
                        <div>
                          <h4 className="font-semibold text-gray-900">Certifications</h4>
                          <p className="text-gray-700">{product.certifications}</p>
                        </div>
                      )}
                      {product.garantie && (
                        <div>
                          <h4 className="font-semibold text-gray-900">Garantie</h4>
                          <p className="text-gray-700">{product.garantie}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SupplierLayout>
  );
};

export default SupplierProductPreview;