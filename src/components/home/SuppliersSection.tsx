import { Star, MapPin, CheckCircle, Users, Package, MessageCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";

import { useIsAuthenticated } from "@/hooks/api/useAuth";
import { useCanContactSupplier } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState } from "react";

const topSuppliers = [
  {
    id: 1,
    name: "TechnoElite Gabon",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
    country: "Gabon",
    city: "Libreville",
    rating: 4.9,
    reviews: 1247,
    yearsActive: 8,
    employees: "50-100",
    productsCount: 2543,
    verified: true,
    goldSupplier: true,
    certifications: ["ISO 9001", "CE", "RoHS"],
    specialties: ["Électronique", "Télécommunications", "Informatique"],
    description: "Leader en équipements électroniques et solutions IT pour l'Afrique centrale"
  },
  {
    id: 2,
    name: "AfricaTextile Pro",
    logo: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=100&h=100&fit=crop",
    country: "Cameroun",
    city: "Douala",
    rating: 4.8,
    reviews: 856,
    yearsActive: 12,
    employees: "100-200",
    productsCount: 1892,
    verified: true,
    goldSupplier: true,
    certifications: ["OEKO-TEX", "GOTS", "ISO 14001"],
    specialties: ["Textile", "Mode", "Artisanat"],
    description: "Fabricant de textiles écologiques et vêtements personnalisés"
  },
  {
    id: 3,
    name: "SolarTech Solutions",
    logo: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=100&h=100&fit=crop",
    country: "Sénégal",
    city: "Dakar",
    rating: 4.7,
    reviews: 634,
    yearsActive: 6,
    employees: "20-50",
    productsCount: 687,
    verified: true,
    goldSupplier: false,
    certifications: ["IEC 61215", "TUV", "ISO 9001"],
    specialties: ["Énergie solaire", "Éclairage LED", "Batteries"],
    description: "Solutions énergétiques durables pour l'Afrique de l'Ouest"
  },
  {
    id: 4,
    name: "EquipHotel Afrique",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
    country: "Côte d'Ivoire",
    city: "Abidjan",
    rating: 4.6,
    reviews: 423,
    yearsActive: 15,
    employees: "200-500",
    productsCount: 1234,
    verified: true,
    goldSupplier: true,
    certifications: ["CE", "NSF", "ISO 22000"],
    specialties: ["Équipement hôtelier", "Restauration", "Cuisine professionnelle"],
    description: "Équipements professionnels pour l'hôtellerie et la restauration"
  }
];

const SuppliersSection = () => {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const { canContact, reason, suggestedAction } = useCanContactSupplier();
  const [selectedCountry, setSelectedCountry] = useState<string>('all');

  // Récupérer les vrais fournisseurs depuis l'API
  const { data: realSuppliers } = useQuery({
    queryKey: ['home-suppliers'],
    queryFn: async () => {
      try {
        // Essayer plusieurs endpoints possibles
        let response;
        try {
          response = await apiClient.get('/entreprises?limit=4&verified=true') as any;
        } catch (firstError) {
          console.log('Premier endpoint échoué, essai avec /suppliers');
          try {
            response = await apiClient.get('/suppliers?limit=4&verified=true') as any;
          } catch (secondError) {
            console.log('Deuxième endpoint échoué, essai avec /users?role=supplier');
            response = await apiClient.get('/users?role=supplier&limit=4') as any;
          }
        }
        
        // Normaliser la réponse selon différentes structures possibles
        return response.entreprises || response.suppliers || response.data || response.users || [];
      } catch (error) {
        console.error('Erreur lors de la récupération des fournisseurs:', error);
        // Retourner un tableau vide en cas d'erreur pour utiliser les données mock
        return [];
      }
    },
    // Ne pas faire échouer la requête, juste utiliser les mocks en cas d'erreur
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Combiner les données mock avec les vraies données (les vraies en premier)
  const allSuppliers = [
    ...(realSuppliers || []).map((supplier: any) => ({
      id: `real-${supplier.id}`,
      name: supplier.nom_entreprise,
      logo: supplier.logo || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop",
      country: supplier.pays || "Gabon",
      city: supplier.ville || "Libreville",
      rating: Number(supplier.note_moyenne) || 4.5,
      reviews: supplier.nombre_avis || 0,
      yearsActive: supplier.annee_creation ? new Date().getFullYear() - new Date(supplier.annee_creation).getFullYear() : 5,
      employees: supplier.taille_entreprise || "10-50",
      productsCount: supplier.nombre_produits || 0,
      verified: supplier.statut_verification === 'verifie',
      goldSupplier: supplier.statut_verification === 'verifie' && supplier.note_moyenne >= 4.5,
      certifications: supplier.certifications ? supplier.certifications.split(',') : ["Certifié B2B"],
      specialties: supplier.secteur_activite ? [supplier.secteur_activite] : ["Commerce général"],
      description: supplier.description || "Fournisseur professionnel spécialisé",
      realSupplierId: supplier.id,
      utilisateur_id: supplier.utilisateur_id || supplier.user_id
    })),
    // Ajouter les données mock seulement si on a moins de 4 vrais fournisseurs
    ...((realSuppliers?.length || 0) < 4 ? topSuppliers.slice(0, 4 - (realSuppliers?.length || 0)) : [])
  ];

  // Filtrer par pays
  const filteredSuppliers = selectedCountry === 'all' 
    ? allSuppliers 
    : allSuppliers.filter(supplier => supplier.country === selectedCountry);

  const handleViewProfile = (supplier: any) => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour voir le profil du fournisseur');
      navigate('/login');
      return;
    }

    if (supplier.realSupplierId) {
      navigate(`/suppliers/${supplier.realSupplierId}`);
    } else {
      // Pour les données mock, rediriger vers la page des fournisseurs
      navigate('/suppliers');
    }
  };

  const handleContactSupplier = async (supplier: any) => {
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

    if (supplier.realSupplierId) {
      // Vérifier qu'on a un utilisateur_id valide
      const destinataireId = supplier.utilisateur_id;
      if (!destinataireId) {
        console.warn('Pas d\'utilisateur_id trouvé pour le fournisseur:', supplier);
        toast.error('Impossible de contacter ce fournisseur (pas d\'utilisateur associé)');
        return;
      }

      // Rediriger directement vers le chat
      const params = new URLSearchParams({
        supplier: supplier.realSupplierId,
        supplierName: supplier.name
      });
      
      navigate(`/messages?${params.toString()}`);
      toast.success(`Redirection vers le chat avec ${supplier.name}`);
    } else {
      // Pour les données mock, rediriger vers la page des fournisseurs
      toast.info('Découvrez nos fournisseurs vérifiés');
      navigate('/suppliers');
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Fournisseurs vérifiés
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez nos partenaires de confiance. Tous nos fournisseurs sont vérifiés et certifiés
            pour garantir la qualité et la fiabilité de vos achats.
          </p>
        </div>

        {/* Filtre par pays */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setSelectedCountry('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCountry === 'all'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedCountry('Gabon')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCountry === 'Gabon'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🇬🇦 Gabon
            </button>
            <button
              onClick={() => setSelectedCountry('Italie')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedCountry === 'Italie'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🇮🇹 Italie
            </button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">100% Vérifiés</h3>
            <p className="text-sm text-gray-600">Documents légaux validés</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Notes élevées</h3>
            <p className="text-sm text-gray-600">Moyenne 4.7/5 étoiles</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Livraison sûre</h3>
            <p className="text-sm text-gray-600">Garantie de livraison</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Support 24/7</h3>
            <p className="text-sm text-gray-600">Assistance dédiée</p>
          </div>
        </div>

        {/* Suppliers grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {filteredSuppliers.map((supplier, index) => (
            <div
              key={supplier.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 group opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <img
                    src={supplier.logo}
                    alt={supplier.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  {supplier.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      {supplier.name}
                    </h3>
                    {supplier.goldSupplier && (
                      <Badge className="bg-yellow-400 text-gray-800 text-xs">
                        🏆 Gold
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{supplier.city}, {supplier.country}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(supplier.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-400'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {supplier.rating}
                    </span>
                    <span className="text-xs text-gray-600">
                      ({supplier.reviews} avis)
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4">
                {supplier.description}
              </p>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1 mb-4">
                {supplier.specialties.map((specialty: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="text-lg font-bold text-gray-900">{supplier.yearsActive}</div>
                  <div className="text-xs text-gray-600">Années</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{supplier.productsCount.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Produits</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">{supplier.employees}</div>
                  <div className="text-xs text-gray-600">Employés</div>
                </div>
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap gap-1 mb-4">
                {supplier.certifications.map((cert: string, idx: number) => (
                  <Badge key={idx} variant="secondary" className="text-xs bg-blue-100">
                    {cert}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewProfile(supplier)}
                >
                  Voir profil
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className={`flex-1 ${
                    canContact 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 hover:bg-gray-500'
                  }`}
                  onClick={() => handleContactSupplier(supplier)}
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
                    <AlertCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-1" />
                  )}
                  {!canContact && isAuthenticated ? 'Acheteurs uniquement' : 'Contacter'}
                </Button>
              </div>
              
              {/* Message d'information pour les non-acheteurs */}
              {isAuthenticated && !canContact && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-amber-700">
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
            </div>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/suppliers')}
          >
            Voir tous les fournisseurs
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SuppliersSection;