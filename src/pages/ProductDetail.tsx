import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, MessageCircle, Shield, Truck, Award, ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { ImageModal } from "@/components/ui/image-modal";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ImprovedProductReviews } from "@/components/product/ImprovedProductReviews";
import { ProductStats } from "@/components/product/ProductStats";
import { SupplierProfile } from "@/components/product/SupplierProfile";
import { StarRating } from "@/components/ui/star-rating";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { BackButton } from "@/components/ui/back-button";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import { useProduct } from "@/hooks/api/useProducts";
import { useIsAuthenticated } from "@/hooks/api/useAuth";
import { useProductTracking } from "@/hooks/useProductTracking";
import { apiClient } from "@/services/api";
import { getImageUrl } from "@/config/constants";
import { useState as useStateSupplier, useEffect as useEffectSupplier } from "react";



const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const [selectedImage, setSelectedImage] = useState(0);

  const [activeTab, setActiveTab] = useState("description");

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [supplierData, setSupplierData] = useStateSupplier<any>(null);
  const [supplierLoading, setSupplierLoading] = useStateSupplier(false);

  const { product, isLoading, error } = useProduct(parseInt(id || '0'));
  
  // Suivi des vues et clics
  const { trackClick, trackExternalClick } = useProductTracking({
    productId: parseInt(id || '0'),
    trackView: true,
    trackClicks: true,
    delay: 2000
  });

  // Charger les avis
  const loadReviews = async () => {
    if (!id) return;
    try {
      setReviewsLoading(true);
      const response = await apiClient.get(`/reviews/product/${id}`);
      // L'API retourne { reviews: [...] } ou directement un tableau
      setReviews(response.reviews || response || []);
    } catch (error) {
      console.error('Erreur chargement avis:', error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Charger les données du fournisseur
  const loadSupplierData = async () => {
    if (!product?.fournisseur_id) return;
    try {
      setSupplierLoading(true);
      const response = await apiClient.get(`/entreprises/${product.fournisseur_id}`);
      setSupplierData(response);
    } catch (error) {
      console.error('Erreur chargement fournisseur:', error);
    } finally {
      setSupplierLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [id]);

  useEffectSupplier(() => {
    if (product?.fournisseur_id) {
      loadSupplierData();
    }
  }, [product?.fournisseur_id]);



  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gabon-green mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du produit...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h2>
            <p className="text-gray-600 mb-4">Le produit que vous recherchez n'existe pas.</p>
            <Button onClick={() => navigate('/products')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux produits
            </Button>
          </div>
        </div>
      </Layout>
    );
  }



  // Fonction pour ajouter aux favoris
  const addToFavorites = async () => {
    try {
      if (!isAuthenticated) {
        toast.error('Veuillez vous connecter pour ajouter aux favoris');
        navigate('/login');
        return;
      }

      await apiClient.post('/users/favorites', { produit_id: product.id });
      toast.success('Produit ajouté aux favoris');
      
      // Enregistrer le clic sur favoris
      trackClick('favorite');
    } catch (error: any) {
      console.error('Erreur favoris:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout aux favoris');
    }
  };

  // Préparer les images avec redimensionnement
  const images = product.images && product.images.length > 0
    ? product.images.map((img: any) => {
      const imageUrl = img.url || img;
      return getImageUrl(imageUrl);
    })
    : product.image_principale 
      ? [getImageUrl(product.image_principale)]
      : ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop'];



  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <BackButton fallbackPath="/products" className="mb-4" />
          <Breadcrumb
            items={[
              { label: "Produits", href: "/products" },
              { label: product.categorie || "Catégorie", href: `/products?categorie=${product.categorie || ''}` },
              { label: product.nom }
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-white rounded-lg overflow-hidden relative">
                <img
                  src={images[selectedImage]}
                  alt={product.nom}
                  className="w-full h-full object-contain cursor-pointer bg-white"
                  onClick={() => setImageModalOpen(true)}
                  crossOrigin="anonymous"
                  style={{ maxHeight: '500px' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop';
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                  onClick={() => setImageModalOpen(true)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                {images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImage === index ? 'border-green-600' : 'border-gray-200'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${product.nom} ${index + 1}`}
                      className="w-full h-full object-contain bg-white"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop';
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                {product.featured && (
                  <Badge className="mb-2 bg-yellow-400 text-gray-800">Produit Vedette</Badge>
                )}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.nom}</h1>
                <p className="text-gray-600 mb-4">{product.description}</p>

                {/* Supplier Info */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600">Par</span>
                    <span className="font-medium text-green-600">{product.fournisseur || 'Fournisseur'}</span>
                    {/* Vérification entreprise - à implémenter */}
                  </div>
                  <div className="flex items-center gap-1">
                    <StarRating rating={0} readonly size="sm" />
                    <span className="text-sm text-gray-600">
                      (0 avis)
                    </span>
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                {isAuthenticated ? (
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {product.prix_unitaire}€
                      </span>
                      {product.unite && product.unite !== 'kg' && (
                        <span className="text-gray-600">/ {product.unite}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Prix indicatif - Contactez le fournisseur pour un devis personnalisé
                    </p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-lg font-semibold text-blue-900 mb-2">Prix sur demande</div>
                      <p className="text-sm text-blue-700">
                        Connectez-vous pour voir les informations de prix et contacter le fournisseur
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <span className="text-gray-600">MOQ:</span>
                    <span className="font-medium ml-1">{product.moq || 1} unités</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Stock:</span>
                    <span className="font-medium ml-1">{product.stock_disponible || 'N/A'} disponibles</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isAuthenticated ? (
                    <>
                      <Button
                        size="lg"
                        className="w-full bg-gabon-green hover:bg-gabon-green/90"
                        onClick={() => {
                          trackClick('view');
                          navigate(`/messages?supplier=${product.fournisseur_id}&product=${product.id}&productName=${encodeURIComponent(product.nom)}`);
                        }}
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Contacter le fournisseur
                      </Button>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" size="lg" onClick={addToFavorites}>
                          <Heart className="w-4 h-4 mr-2" />
                          Favoris
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => {
                            trackClick('view');
                            navigate(`/messages?supplier=${product.fournisseur_id}&product=${product.id}&productName=${encodeURIComponent(product.nom)}&action=quote`);
                          }}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Demander un devis
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <h3 className="font-semibold text-blue-900 mb-2">
                          🔐 Fonctionnalités réservées aux membres
                        </h3>
                        <p className="text-sm text-blue-700 mb-4">
                          Connectez-vous pour contacter le fournisseur, demander un devis et accéder aux prix
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            onClick={() => navigate('/login')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Se connecter
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => navigate('/register')}
                            className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          >
                            Créer un compte
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-600" />
                    Paiement sécurisé
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4 text-blue-600" />
                    Livraison rapide
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-yellow-600" />
                    Qualité garantie
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {["description", "specifications", "avis", "statistiques", "fournisseur"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {tab === "description" && "Description"}
                    {tab === "specifications" && "Spécifications"}
                    {tab === "avis" && "Avis"}
                    {tab === "statistiques" && "Statistiques"}
                    {tab === "fournisseur" && "Fournisseur"}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "description" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {product.description}
                    </p>
                    {product.description_longue && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Description détaillée</h4>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {product.description_longue}
                        </p>
                      </div>
                    )}
                  </div>

                  {product.fonctionnalites && (
                    <div>
                      <h4 className="font-medium mb-2">Fonctionnalités principales</h4>
                      <div className="text-gray-700 whitespace-pre-line">
                        {product.fonctionnalites}
                      </div>
                    </div>
                  )}

                  {product.instructions_utilisation && (
                    <div>
                      <h4 className="font-medium mb-2">Instructions d'utilisation</h4>
                      <div className="text-gray-700 whitespace-pre-line">
                        {product.instructions_utilisation}
                      </div>
                    </div>
                  )}

                  {product.couleurs_disponibles && product.couleurs_disponibles.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Couleurs disponibles</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.couleurs_disponibles.map((couleur: string, index: number) => (
                          <Badge key={index} variant="outline">{couleur}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.certifications && product.certifications.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Certifications</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.certifications.map((cert: string, index: number) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {product.prix_degressifs && product.prix_degressifs.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Prix dégressifs</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 px-4 py-2 text-left">Quantité minimum</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Quantité maximum</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Prix unitaire</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Économie</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.prix_degressifs.map((prix: any, index: number) => (
                              <tr key={index}>
                                <td className="border border-gray-300 px-4 py-2">{prix.quantite_min}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {prix.quantite_max || 'Illimité'}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 font-medium">
                                  {prix.prix_unitaire}€
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-green-600">
                                  {product.prix_unitaire > prix.prix_unitaire 
                                    ? `-${((product.prix_unitaire - prix.prix_unitaire) / product.prix_unitaire * 100).toFixed(1)}%`
                                    : '-'
                                  }
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {(product.politique_retour || product.garantie) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {product.politique_retour && (
                        <div>
                          <h4 className="font-medium mb-2">Politique de retour</h4>
                          <p className="text-gray-700 text-sm">{product.politique_retour}</p>
                        </div>
                      )}
                      {product.garantie && (
                        <div>
                          <h4 className="font-medium mb-2">Garantie</h4>
                          <p className="text-gray-700 text-sm">{product.garantie}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-lg">Caractéristiques physiques</h4>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">Poids:</span>
                        <span className="text-gray-700">{product.poids ? `${product.poids} kg` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">Dimensions:</span>
                        <span className="text-gray-700">{product.dimensions || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">Matériaux:</span>
                        <span className="text-gray-700">{product.materiaux || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">Unité:</span>
                        <span className="text-gray-700">{product.unite || 'pièce'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-lg">Informations commerciales</h4>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">MOQ:</span>
                        <span className="text-gray-700">{product.moq || 1} {product.unite || 'pièce'}(s)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">Stock disponible:</span>
                        <span className="text-gray-700">{product.stock_disponible || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">Capacité d'approvisionnement:</span>
                        <span className="text-gray-700">
                          {product.capacite_approvisionnement ? `${product.capacite_approvisionnement}/mois` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="font-medium text-gray-900">Délai de traitement:</span>
                        <span className="text-gray-700">{product.delai_traitement || 7} jours</span>
                      </div>
                    </div>
                  </div>

                  {(product.port_depart || product.delai_livraison_estime) && (
                    <div>
                      <h4 className="font-medium text-lg mb-3">Expédition</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.port_depart && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-900">Port de départ:</span>
                            <span className="text-gray-700">{product.port_depart}</span>
                          </div>
                        )}
                        {product.delai_livraison_estime && (
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-900">Délai de livraison:</span>
                            <span className="text-gray-700">{product.delai_livraison_estime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {product.conditions_paiement && product.conditions_paiement.length > 0 && (
                    <div>
                      <h4 className="font-medium text-lg mb-3">Conditions de paiement acceptées</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.conditions_paiement.map((condition: string, index: number) => (
                          <Badge key={index} variant="outline">{condition}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "avis" && (
                <ImprovedProductReviews
                  productId={product.id}
                  onReviewAdded={loadReviews}
                />
              )}

              {activeTab === "statistiques" && (
                <ProductStats
                  productId={product.id}
                  showDetails={true}
                />
              )}

              {activeTab === "fournisseur" && (
                <div data-tab="fournisseur">
                  {supplierLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gabon-green mx-auto mb-4"></div>
                      <p className="text-gray-600">Chargement des informations du fournisseur...</p>
                    </div>
                  ) : supplierData ? (
                    <SupplierProfile
                      supplier={{
                        id: supplierData.id || product.fournisseur_id || 0,
                        nom_entreprise: supplierData.nom_entreprise || product.fournisseur || 'Fournisseur',
                        description: supplierData.description || supplierData.secteur_activite || 'Fournisseur professionnel',
                        note_moyenne: supplierData.note_moyenne || 0,
                        nombre_avis: supplierData.nombre_avis || 0,
                        statut_verification: supplierData.statut_verification || 'non_verifie',
                        delai_traitement: supplierData.delai_traitement || product.delai_traitement || 'N/A',
                        port_depart: supplierData.port_depart || product.port_depart || 'N/A',
                        capacite_approvisionnement: supplierData.capacite_approvisionnement || product.capacite_approvisionnement || 'N/A',
                        delai_livraison_estime: supplierData.delai_livraison_estime || product.delai_livraison_estime || 'N/A',
                        politique_retour: supplierData.politique_retour || product.politique_retour || 'N/A',
                        garantie: supplierData.garantie || product.garantie || 'N/A'
                      }}
                      productContext={{
                        id: product.id,
                        nom: product.nom
                      }}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Impossible de charger les informations du fournisseur</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ImageModal
        images={images}
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        initialIndex={selectedImage}
      />
    </Layout>
  );
};

export default ProductDetail;