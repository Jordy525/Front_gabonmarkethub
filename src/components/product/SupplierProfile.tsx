import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, Star, MapPin, Clock, Truck, Package, 
  MessageCircle, Award, CheckCircle, Building
} from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { toast } from "sonner";
import { useIsAuthenticated } from "@/hooks/api/useAuth";
import { SupplierRating } from "./SupplierRating";

interface SupplierProfileProps {
  supplier: {
    id: number;
    nom_entreprise: string;
    description: string;
    note_moyenne: number | string;
    nombre_avis: number | string;
    statut_verification: string;
    delai_traitement?: number | string;
    port_depart?: string;
    capacite_approvisionnement?: number | string;
    delai_livraison_estime?: string;
    politique_retour?: string;
    garantie?: string;
  };
  productContext?: {
    id: number;
    nom: string;
  };
}

export const SupplierProfile = ({ supplier, productContext }: SupplierProfileProps) => {
  const navigate = useNavigate();
  const [isContacting, setIsContacting] = useState(false);
  const isAuthenticated = useIsAuthenticated();

  const handleContact = async () => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour contacter le fournisseur');
      navigate('/login');
      return;
    }

    setIsContacting(true);
    try {
      // Rediriger vers les messages avec le contexte
      const params = new URLSearchParams({
        supplier: supplier.id.toString(),
        ...(productContext && {
          product: productContext.id.toString(),
          productName: productContext.nom
        })
      });
      navigate(`/messages?${params.toString()}`);
    } catch (error) {
      toast.error('Erreur lors de la redirection');
    } finally {
      setIsContacting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête fournisseur */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {supplier.nom_entreprise}
                  {supplier.statut_verification === 'verifie' && (
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Vérifié
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={Number(supplier.note_moyenne) || 0} readonly size="sm" />
                  <span className="text-sm text-gray-600">
                    {(Number(supplier.note_moyenne) || 0).toFixed(1)} ({supplier.nombre_avis || 0} avis)
                  </span>
                </div>
                <p className="text-gray-600 mt-2">{supplier.description}</p>
              </div>
            </div>
            <Button 
              onClick={handleContact}
              disabled={isContacting}
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {isContacting ? 'Redirection...' : 'Contacter'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Informations détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations commerciales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Informations commerciales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.delai_traitement && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Délai de traitement
                </span>
                <span className="font-medium">{supplier.delai_traitement} jours</span>
              </div>
            )}
            
            {supplier.capacite_approvisionnement && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Capacité d'approvisionnement
                </span>
                <span className="font-medium">{Number(supplier.capacite_approvisionnement).toLocaleString()} unités/mois</span>
              </div>
            )}

            {supplier.port_depart && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Port de départ
                </span>
                <span className="font-medium">{supplier.port_depart}</span>
              </div>
            )}

            {supplier.delai_livraison_estime && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Délai de livraison estimé
                </span>
                <span className="font-medium">{supplier.delai_livraison_estime}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Politiques et garanties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Politiques et garanties
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {supplier.garantie && (
              <div>
                <span className="text-gray-600 flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4" />
                  Garantie
                </span>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{supplier.garantie}</p>
              </div>
            )}

            {supplier.politique_retour && (
              <div>
                <span className="text-gray-600 flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4" />
                  Politique de retour
                </span>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{supplier.politique_retour}</p>
              </div>
            )}

            {/* Certifications */}
            <div>
              <span className="text-gray-600 flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4" />
                Certifications
              </span>
              <div className="flex flex-wrap gap-2">
                {supplier.statut_verification === 'verifie' && (
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Entreprise vérifiée
                  </Badge>
                )}
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  <Award className="w-3 h-3 mr-1" />
                  Fournisseur certifié
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section contact avec contexte produit */}
      {productContext && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-900 mb-1">
                  Intéressé par ce produit ?
                </h3>
                <p className="text-green-700 text-sm">
                  Contactez {supplier.nom_entreprise} pour "{productContext.nom}"
                </p>
              </div>
              <Button 
                onClick={handleContact}
                disabled={isContacting}
                className="bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {isContacting ? 'Redirection...' : 'Envoyer un message'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section notation fournisseur */}
      <SupplierRating 
        fournisseurId={supplier.id}
        fournisseurNom={supplier.nom_entreprise}
        onReviewAdded={() => {
          // Recharger les données du fournisseur si nécessaire
        }}
      />
    </div>
  );
};