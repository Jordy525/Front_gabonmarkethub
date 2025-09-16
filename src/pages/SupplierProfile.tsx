import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building, MapPin, Shield, MessageCircle,
  Package, Clock, Award, Globe, Phone,
  TrendingUp, CheckCircle, AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { getImageUrl } from "@/config/constants";

import { useIsAuthenticated } from "@/hooks/api/useAuth";
import { useCanContactSupplier } from "@/hooks/useUserRole";
import { StarRating } from "@/components/ui/star-rating";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { BackButton } from "@/components/ui/back-button";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const SupplierProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const { canContact, reason, suggestedAction } = useCanContactSupplier();

  // Récupérer les détails du fournisseur
  const { data: supplier, isLoading, error } = useQuery({
    queryKey: ['supplier', id],
    queryFn: async () => {
      try {
        // Essayer plusieurs endpoints pour récupérer les données complètes
        let response: any;
        try {
          // Endpoint principal avec détails complets
          response = await apiClient.get(`/entreprises/${id}?include=stats,products,certifications`) as any;
        } catch (error) {
          // Fallback vers l'endpoint simple
          response = await apiClient.get(`/entreprises/${id}`) as any;
        }

        const supplierData = response.entreprise || response.data || response;
        console.log('Données fournisseur récupérées:', supplierData);

        // Si on n'a pas toutes les statistiques, les récupérer séparément
        if (supplierData && !supplierData.nombre_produits) {
          try {
            const statsResponse = await apiClient.get(`/entreprises/${id}/stats`) as any;
            const stats = statsResponse.stats || statsResponse.data || {};
            console.log('Statistiques récupérées:', stats);
            Object.assign(supplierData, stats);
          } catch (error) {
            console.log('Impossible de récupérer les statistiques:', error);
          }
        }

        return supplierData;
      } catch (error) {
        console.error('Erreur lors de la récupération du fournisseur:', error);
        toast.error('Fournisseur non trouvé');
        throw error;
      }
    },
    enabled: !!id
  });

  // Récupérer les produits du fournisseur
  const { data: products } = useQuery({
    queryKey: ['supplier-products', id],
    queryFn: async () => {
      try {
        // Essayer plusieurs endpoints pour récupérer les produits
        const endpoints = [
          `/products?supplier_id=${id}`, // L'API utilise l'anglais
          `/products?fournisseur_id=${id}`,
          `/products?entreprise_id=${id}`,
          `/entreprises/${id}/produits`,
          `/produits?entreprise_id=${id}`,
          `/produits?fournisseur_id=${id}`
        ];

        let products = [];

        for (const endpoint of endpoints) {
          try {
            console.log(`Tentative de récupération des produits via: ${endpoint}`);
            const response = await apiClient.get(endpoint) as any;

            // Gérer différentes structures de réponse
            if (Array.isArray(response)) {
              products = response;
              break;
            } else if (response.produits && Array.isArray(response.produits)) {
              products = response.produits;
              break;
            } else if (response.data && Array.isArray(response.data)) {
              products = response.data;
              break;
            } else if (response.products && Array.isArray(response.products)) {
              products = response.products;
              break;
            }
          } catch (error) {
            console.log(`Échec pour ${endpoint}:`, error);
            continue;
          }
        }

        console.log(`Produits récupérés:`, products);
        return products;
      } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        return [];
      }
    },
    enabled: !!id
  });

  const handleContactSupplier = async () => {
    console.log('Tentative de contact avec le fournisseur:', supplier);

    // Vérifier l'authentification
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour contacter un fournisseur');
      navigate('/login');
      return;
    }

    // Vérifier les permissions de rôle
    if (!canContact) {
      toast.error(reason || 'Vous n\'êtes pas autorisé à contacter les fournisseurs');
      if (suggestedAction) {
        toast.info(suggestedAction);
        navigate('/register?role=buyer');
      }
      return;
    }

    if (!supplier?.id) {
      toast.error('Impossible de contacter ce fournisseur');
      return;
    }

    // Vérifier qu'on a un utilisateur_id valide
    const destinataireId = supplier.utilisateur_id || supplier.user_id;
    if (!destinataireId) {
      console.warn('Pas d\'utilisateur_id trouvé pour le fournisseur:', supplier);
      toast.error('Impossible de contacter ce fournisseur (pas d\'utilisateur associé)');
      return;
    }

    // Rediriger directement vers le chat
    const params = new URLSearchParams({
      supplier: supplier.id.toString(),
      supplierName: supplier.nom_entreprise
    });
    
    navigate(`/messages?${params.toString()}`);
    toast.success(`Redirection vers le chat avec ${supplier.nom_entreprise}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Chargement du profil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !supplier) {
    console.log('Erreur ou fournisseur non trouvé:', { error, supplier });
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Fournisseur non trouvé</h3>
            <p className="text-gray-600 mb-4">Ce fournisseur n'existe pas ou n'est plus disponible</p>
            <Button onClick={() => navigate('/suppliers')}>
              Retour aux fournisseurs
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  console.log('Fournisseur affiché:', supplier);
  console.log('Produits affichés:', products);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <BackButton fallbackPath="/suppliers" className="mb-4" />
          <Breadcrumb
            items={[
              { label: "Fournisseurs", href: "/suppliers" },
              { label: supplier.nom_entreprise }
            ]}
          />
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Logo et infos principales */}
              <div className="flex-1">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {supplier.logo ? (
                      <img
                        src={supplier.logo}
                        alt={supplier.nom_entreprise}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Building className="w-10 h-10 text-green-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {supplier.nom_entreprise}
                      </h1>
                      {supplier.statut_verification === 'verifie' && (
                        <Badge className="bg-green-100 text-green-800">
                          <Shield className="w-4 h-4 mr-1" />
                          Vérifié
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <StarRating rating={Number(supplier.note_moyenne) || 0} readonly />
                      <span className="text-gray-600">
                        ({supplier.nombre_avis || 0} avis)
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">
                      {supplier.description || 'Fournisseur professionnel spécialisé'}
                    </p>

                    {/* Localisation */}
                    {supplier.ville && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{supplier.ville}, {supplier.pays || 'Gabon'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="lg:w-80">
                <Card>
                  <CardContent className="p-6">
                    <Button
                      className={`w-full mb-4 ${canContact
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 hover:bg-gray-500'
                        }`}
                      onClick={handleContactSupplier}
                      disabled={!isAuthenticated}
                      title={
                        !isAuthenticated
                          ? 'Connectez-vous pour contacter'
                          : !canContact
                            ? 'Seuls les acheteurs peuvent contacter les fournisseurs'
                            : 'Contacter ce fournisseur'
                      }
                    >
                      {!canContact && isAuthenticated ? (
                        <AlertCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <MessageCircle className="w-4 h-4 mr-2" />
                      )}
                      {!canContact && isAuthenticated ? 'Acheteurs uniquement' : 'Contacter le fournisseur'}
                    </Button>

                    {/* Message d'information pour les non-acheteurs */}
                    {isAuthenticated && !canContact && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-amber-700">
                            <p className="font-medium">Acheteurs uniquement</p>
                            <p>Seuls les acheteurs peuvent initier des conversations avec les fournisseurs.</p>
                            <button
                              onClick={() => navigate('/register?role=buyer')}
                              className="text-amber-800 underline hover:no-underline mt-1"
                            >
                              Créer un compte acheteur
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Stats rapides */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-lg text-gray-900">
                          {supplier.nombre_produits || products?.length || 0}
                        </div>
                        <div className="text-gray-600">Produits</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-lg text-gray-900">
                          {supplier.delai_traitement || supplier.delai_livraison || 7}j
                        </div>
                        <div className="text-gray-600">Traitement</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="products">Produits</TabsTrigger>
              <TabsTrigger value="company">Entreprise</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            {/* Aperçu */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Statistiques */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Statistiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Produits actifs</span>
                      <span className="font-semibold">{supplier.nombre_produits || products?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Note moyenne</span>
                      <span className="font-semibold">{Number(supplier.note_moyenne || 0).toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avis clients</span>
                      <span className="font-semibold">{supplier.nombre_avis || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Commandes traitées</span>
                      <span className="font-semibold">{supplier.nombre_commandes || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Certifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {supplier.statut_verification === 'verifie' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Entreprise vérifiée</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Partenaire B2B</span>
                    </div>
                    {supplier.certifications && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-purple-600" />
                        <span className="text-sm">{supplier.certifications}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Informations rapides */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Informations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {supplier.annee_creation && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Créée en</span>
                        <span className="font-semibold">{supplier.annee_creation}</span>
                      </div>
                    )}
                    {(supplier.nombre_employes || supplier.taille_entreprise) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employés</span>
                        <span className="font-semibold">{supplier.nombre_employes || supplier.taille_entreprise}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Membre depuis</span>
                      <span className="font-semibold">
                        {supplier.created_at ? new Date(supplier.created_at).getFullYear() : 'N/A'}
                      </span>
                    </div>
                    {supplier.statut_verification && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Statut</span>
                        <span className="font-semibold capitalize">{supplier.statut_verification}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Produits */}
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Produits ({products?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {products && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.slice(0, 6).map((product: any) => (
                        <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                            {product.image_principale ? (
                              <img
                                src={getImageUrl(product.image_principale)}
                                alt={product.nom || product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center ${product.image_principale ? 'hidden' : ''}`}>
                              <Package className="w-12 h-12 text-gray-400" />
                            </div>
                          </div>
                          <h4 className="font-semibold mb-2 line-clamp-2">{product.nom || product.name}</h4>
                          <p className="text-green-600 font-bold">
                            {product.prix || product.price} {product.devise || 'FCFA'}
                          </p>
                          {product.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3"
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            Voir détails
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun produit disponible</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Informations entreprise */}
            <TabsContent value="company">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Secteur d'activité</label>
                      <p className="mt-1">{supplier.secteur_nom || supplier.secteur_activite || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Type d'entreprise</label>
                      <p className="mt-1">{supplier.type_nom || supplier.type_entreprise || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Taille de l'entreprise</label>
                      <p className="mt-1">{supplier.taille_entreprise || supplier.nombre_employes || 'Non spécifié'}</p>
                    </div>
                    {supplier.capacite_production && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Capacité de production</label>
                        <p className="mt-1">{supplier.capacite_production}</p>
                      </div>
                    )}
                    {supplier.siret && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">SIRET</label>
                        <p className="mt-1">{supplier.siret}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Adresse</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {supplier.adresse_ligne1 && <p>{supplier.adresse_ligne1}</p>}
                    {supplier.adresse_ligne2 && <p>{supplier.adresse_ligne2}</p>}
                    <p>{supplier.ville} {supplier.code_postal}</p>
                    <p>{supplier.pays || 'Gabon'}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Contact */}
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {supplier.telephone_professionnel && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Téléphone professionnel</p>
                          <p className="font-semibold">{supplier.telephone_professionnel}</p>
                        </div>
                      </div>
                    )}

                    {supplier.site_web && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Site web</p>
                          <a
                            href={supplier.site_web}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            {supplier.site_web}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t">
                    <Button
                      className={`${canContact
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 hover:bg-gray-500'
                        }`}
                      onClick={handleContactSupplier}
                      disabled={!isAuthenticated || !canContact}
                      title={
                        !isAuthenticated
                          ? 'Connectez-vous pour contacter'
                          : !canContact
                            ? 'Seuls les acheteurs peuvent contacter les fournisseurs'
                            : 'Envoyer un message'
                      }
                    >
                      {!canContact && isAuthenticated ? (
                        <AlertCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <MessageCircle className="w-4 h-4 mr-2" />
                      )}
                      {!canContact && isAuthenticated ? 'Acheteurs uniquement' : 'Envoyer un message'}
                    </Button>

                    {/* Message d'information pour les non-acheteurs */}
                    {isAuthenticated && !canContact && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-amber-700">
                            <p className="font-medium">Restriction d'accès</p>
                            <p>Seuls les acheteurs peuvent initier des conversations avec les fournisseurs.</p>
                            <button
                              onClick={() => navigate('/register?role=buyer')}
                              className="text-amber-800 underline hover:no-underline mt-1"
                            >
                              Créer un compte acheteur
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default SupplierProfile;