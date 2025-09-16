import { ArrowLeft, Shield, Eye, Database, Lock, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";

const Privacy = () => {
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
              <Shield className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">Politique de confidentialité</h1>
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
                  Notre engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  GabMarketHub s'engage à protéger votre vie privée et vos données personnelles. 
                  Cette politique explique comment nous collectons, utilisons et protégeons vos informations 
                  dans le cadre de notre plateforme B2B reliant l'Italie et le Gabon.
                </p>
              </CardContent>
            </Card>

            {/* Données collectées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Données que nous collectons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informations d'entreprise</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Raison sociale et forme juridique</li>
                    <li>Numéro d'identification (SIRET, TVA intracommunautaire)</li>
                    <li>Adresse du siège social</li>
                    <li>Secteur d'activité et certifications</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Informations de contact</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Nom et prénom du représentant</li>
                    <li>Adresse email professionnelle</li>
                    <li>Numéro de téléphone</li>
                    <li>Fonction dans l'entreprise</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Données d'utilisation</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Historique de navigation et recherches</li>
                    <li>Interactions avec les fournisseurs</li>
                    <li>Favoris et interactions</li>
                    <li>Évaluations et commentaires</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Utilisation des données */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Comment nous utilisons vos données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Services de la plateforme</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Création et gestion de votre compte</li>
                    <li>Mise en relation avec des partenaires commerciaux</li>
                    <li>Traitement des demandes et communications</li>
                    <li>Support client et résolution de litiges</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Amélioration de l'expérience</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Personnalisation des recommandations</li>
                    <li>Analyse des tendances du marché</li>
                    <li>Optimisation de la plateforme</li>
                    <li>Prévention de la fraude</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Communication</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Notifications sur vos favoris</li>
                    <li>Alertes de sécurité importantes</li>
                    <li>Newsletter (avec votre consentement)</li>
                    <li>Enquêtes de satisfaction</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Partage des données */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  Partage de vos données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Avec les autres utilisateurs</h4>
                  <p className="text-gray-700">
                    Vos informations d'entreprise (nom, secteur, localisation) sont visibles 
                    par les autres utilisateurs pour faciliter les échanges commerciaux.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Avec nos partenaires</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Services de validation (pour les documents)</li>
                    <li>Services de livraison (pour l'expédition)</li>
                    <li>Organismes de vérification (pour la certification)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Obligations légales</h4>
                  <p className="text-gray-700">
                    Nous pouvons divulguer vos données si requis par la loi, une décision de justice 
                    ou les autorités compétentes du Gabon ou d'Italie.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sécurité */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-600" />
                  Sécurité de vos données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mesures techniques</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Chiffrement SSL/TLS pour toutes les communications</li>
                    <li>Stockage sécurisé dans des centres de données certifiés</li>
                    <li>Authentification à deux facteurs disponible</li>
                    <li>Surveillance continue des accès</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mesures organisationnelles</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Accès limité aux données selon le principe du moindre privilège</li>
                    <li>Formation régulière de nos équipes</li>
                    <li>Audits de sécurité périodiques</li>
                    <li>Plan de réponse aux incidents</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Vos droits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Vos droits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Droits d'accès et de rectification</h4>
                  <p className="text-gray-700">
                    Vous pouvez consulter et modifier vos données personnelles à tout moment 
                    depuis votre espace utilisateur.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Droit à l'effacement</h4>
                  <p className="text-gray-700">
                    Vous pouvez demander la suppression de votre compte et de vos données, 
                    sous réserve de nos obligations légales de conservation.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Droit à la portabilité</h4>
                  <p className="text-gray-700">
                    Vous pouvez récupérer vos données dans un format structuré et lisible 
                    pour les transférer vers un autre service.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Droit d'opposition</h4>
                  <p className="text-gray-700">
                    Vous pouvez vous opposer au traitement de vos données à des fins de marketing 
                    ou d'analyse statistique.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Transferts internationaux */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  Transferts internationaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Dans le cadre de notre activité reliant l'Italie et le Gabon, vos données peuvent 
                  être transférées entre ces pays. Nous nous assurons que ces transferts respectent 
                  les réglementations en vigueur et offrent un niveau de protection adéquat.
                </p>
              </CardContent>
            </Card>

            {/* Conservation des données */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-yellow-600" />
                  Conservation des données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Durées de conservation</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Données de compte : pendant la durée d'utilisation + 3 ans</li>
                    <li>Données de transaction : 10 ans (obligations comptables)</li>
                    <li>Données de navigation : 13 mois maximum</li>
                    <li>Données de support : 3 ans après résolution</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Suppression automatique</h4>
                  <p className="text-gray-700">
                    À l'expiration des délais de conservation, vos données sont automatiquement 
                    supprimées de nos systèmes de manière sécurisée et irréversible.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Contact et réclamations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits :
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Délégué à la protection des données :</strong> dpo@gabmarkethub.com</p>
                  <p><strong>Support :</strong> privacy@gabmarkethub.com</p>
                  <p><strong>Téléphone :</strong> +241 XX XX XX XX</p>
                  <p><strong>Adresse :</strong> Libreville, Gabon</p>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Autorité de contrôle :</strong> En cas de litige, vous pouvez saisir 
                    l'autorité de protection des données compétente de votre pays de résidence.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Modifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Modifications de cette politique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Nous pouvons modifier cette politique de confidentialité pour refléter les évolutions 
                  de nos services ou de la réglementation. Vous serez informé de tout changement significatif 
                  par email et devrez accepter la nouvelle politique pour continuer à utiliser nos services.
                </p>
              </CardContent>
            </Card>

            {/* Acceptation */}
            <div className="text-center py-8">
              <p className="text-gray-600 mb-6">
                En utilisant GabMarketHub, vous confirmez avoir lu et compris cette politique de confidentialité.
              </p>
              <Button onClick={() => navigate(-1)} size="lg">
                J'ai lu et j'accepte la politique
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;