import { ArrowLeft, FileText, Shield, Users, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Conditions d'utilisation</h1>
            </div>
            <p className="text-gray-600 mt-2">
              Dernière mise à jour : 15 janvier 2024
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  Bienvenue sur GabMarketHub, la première plateforme B2B du Gabon connectant les entreprises italiennes 
                  et les fournisseurs gabonais. En utilisant notre plateforme, vous acceptez les présentes conditions 
                  d'utilisation.
                </p>
              </CardContent>
            </Card>

            {/* Définitions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Définitions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Plateforme</h4>
                  <p className="text-gray-700">
                    Désigne le site web GabMarketHub et tous ses services associés.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Utilisateur</h4>
                  <p className="text-gray-700">
                    Toute personne physique ou morale utilisant la plateforme.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fournisseur</h4>
                  <p className="text-gray-700">
                    Entreprise gabonaise proposant des produits ou services sur la plateforme.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Acheteur</h4>
                  <p className="text-gray-700">
                    Entreprise italienne ou internationale recherchant des produits ou services.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Conditions d'accès */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Conditions d'accès et d'inscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Éligibilité</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Être une entreprise légalement constituée</li>
                    <li>Avoir la capacité juridique de contracter</li>
                    <li>Fournir des informations exactes et à jour</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Vérification</h4>
                  <p className="text-gray-700">
                    GabMarketHub se réserve le droit de vérifier l'identité et la légitimité 
                    de tous les utilisateurs avant l'activation de leur compte.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Utilisation de la plateforme */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Utilisation de la plateforme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Usages autorisés</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Recherche et achat de produits professionnels</li>
                    <li>Communication avec les fournisseurs</li>
                    <li>Gestion des favoris et produits</li>
                    <li>Évaluation des produits et services</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Usages interdits</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Utilisation à des fins illégales ou frauduleuses</li>
                    <li>Contournement des mesures de sécurité</li>
                    <li>Spam ou communications non sollicitées</li>
                    <li>Violation des droits de propriété intellectuelle</li>
                  </ul>
                </div>
              </CardContent>
            </Card>


            {/* Responsabilités */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Responsabilités et garanties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Responsabilité de GabMarketHub</h4>
                  <p className="text-gray-700">
                    GabMarketHub agit en tant qu'intermédiaire technique. Nous ne sommes pas responsables 
                    de la qualité des produits, des délais de livraison ou des litiges entre utilisateurs.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Responsabilité des utilisateurs</h4>
                  <p className="text-gray-700">
                    Chaque utilisateur est responsable de ses actions sur la plateforme et doit respecter 
                    la législation en vigueur au Gabon et en Italie.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Propriété intellectuelle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Propriété intellectuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Tous les éléments de la plateforme (design, logos, textes, images) sont protégés par 
                  les droits de propriété intellectuelle. Toute reproduction non autorisée est interdite.
                </p>
              </CardContent>
            </Card>

            {/* Modification des conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-yellow-600" />
                  Modification des conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  GabMarketHub se réserve le droit de modifier les présentes conditions à tout moment. 
                  Les utilisateurs seront informés des modifications par email et devront accepter 
                  les nouvelles conditions pour continuer à utiliser la plateforme.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Contact et support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Pour toute question concernant ces conditions d'utilisation, contactez-nous :
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email :</strong> legal@gabmarkethub.com</p>
                  <p><strong>Téléphone :</strong> +241 XX XX XX XX</p>
                  <p><strong>Adresse :</strong> Libreville, Gabon</p>
                </div>
              </CardContent>
            </Card>

            {/* Acceptation */}
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                En utilisant GabMarketHub, vous confirmez avoir lu et accepté ces conditions d'utilisation.
              </p>
              <Button onClick={() => navigate(-1)} size="lg">
                J'ai lu et j'accepte les conditions
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;