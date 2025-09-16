import { Shield, Users, Globe, Award, ArrowRight, CheckCircle, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CompanyInfo = () => {
  const stats = [
    { label: "Fournisseurs vérifiés", value: "500+", icon: Users, color: "text-blue-600" },
    { label: "Produits disponibles", value: "10,000+", icon: Globe, color: "text-green-600" },
    { label: "Commandes traitées", value: "25,000+", icon: TrendingUp, color: "text-purple-600" },
    { label: "Clients satisfaits", value: "98%", icon: Star, color: "text-yellow-600" }
  ];

  const features = [
    {
      icon: Shield,
      title: "Sécurité garantie",
      description: "Tous nos fournisseurs sont vérifiés et certifiés pour garantir la qualité de vos achats professionnels."
    },
    {
      icon: Users,
      title: "Réseau étendu",
      description: "Accédez au plus grand réseau de fournisseurs B2B du Gabon, couvrant tous les secteurs d'activité."
    },
    {
      icon: Globe,
      title: "Plateforme moderne",
      description: "Interface intuitive et outils avancés pour faciliter vos achats et optimiser votre gestion des commandes."
    },
    {
      icon: Award,
      title: "Service premium",
      description: "Support client dédié, livraison rapide et garantie satisfaction pour tous vos achats professionnels."
    }
  ];

  const certifications = [
    "Certifié ISO 27001",
    "Agréé Chambre de Commerce",
    "Partenaire officiel ANPME",
    "Membre CGECI"
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">À propos de GabMarketHub</h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            La première plateforme B2B du Gabon, connectant entreprises locales et fournisseurs 
            pour développer l'économie gabonaise
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Content */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Votre partenaire de confiance pour le commerce B2B au Gabon
            </h3>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-600 leading-relaxed">
                GabMarketHub révolutionne le commerce B2B au Gabon en connectant directement 
                les entreprises locales avec un réseau de fournisseurs vérifiés et de qualité.
              </p>
              
              <p className="text-gray-600 leading-relaxed">
                Notre mission est de faciliter les échanges commerciaux, réduire les coûts 
                d'approvisionnement et stimuler la croissance économique du pays en digitalisant 
                les processus d'achat professionnel.
              </p>
            </div>

            {/* Certifications */}
            <div className="mb-8">
              <h4 className="font-semibold text-gray-900 mb-4">Nos certifications et partenariats</h4>
              <div className="grid grid-cols-2 gap-3">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              En savoir plus sur notre entreprise
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Right Image */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop"
              alt="Équipe GabMarketHub"
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">Leader B2B</div>
                  <div className="text-sm text-gray-600">Gabon 2024</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Rejoignez la révolution du commerce B2B gabonais
            </h3>
            <p className="text-gray-600 mb-6">
              Que vous soyez acheteur ou fournisseur, GabMarketHub vous offre les outils 
              pour développer votre activité et optimiser vos échanges commerciaux.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Devenir fournisseur
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                Créer un compte acheteur
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyInfo;