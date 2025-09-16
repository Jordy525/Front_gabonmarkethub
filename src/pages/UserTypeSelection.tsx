import { useState } from "react";
import { Building2, Palette, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import Logo from "@/components/ui/Logo";

const UserTypeSelection = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const userTypes = [
    {
      id: "fournisseur",
      title: "Fournisseur / Entreprise",
      description: "Vous êtes une entreprise souhaitant vendre vos produits sur GabMarketHub",
      icon: Building2,
      benefits: [
        "Accès à un large réseau d'acheteurs B2B",
        "Gestion simplifiée de votre catalogue",
        "Outils de communication intégrés",
        "Système de validation des documents",
        "Analytics et statistiques de vente"
      ],
      products: ["Électronique", "Électroménager", "Textile", "Artisanat", "Machines industrielles"]
    },
    {
      id: "acheteur",
      title: "Acheteur Professionnel",
      description: "Vous êtes un acheteur professionnel recherchant des produits de qualité",
      icon: Palette,
      benefits: [
        "Accès à des milliers de produits",
        "Négociation directe avec les fournisseurs",
        "Prix préférentiels pour achats en gros",
        "Suivi en temps réel de vos favoris",
        "Support client dédié"
      ],
      products: ["Produits artisanaux", "Équipements professionnels", "Matières premières", "Produits finis"]
    }
  ];

  const handleContinue = () => {
    if (selectedType) {
      const params = new URLSearchParams({ type: selectedType });
      window.location.href = `/register?${params.toString()}`;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <Logo 
                  size="xl" 
                  onClick={() => navigate('/')}
                />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Rejoignez GabMarketHub
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choisissez votre profil pour commencer à développer vos échanges commerciaux 
                sur la première plateforme B2B du Gabon
              </p>
            </div>

            {/* User Type Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {userTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                
                return (
                  <Card 
                    key={type.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isSelected 
                        ? 'ring-2 ring-green-600 shadow-lg transform scale-105' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                        isSelected ? 'bg-green-600' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {type.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {type.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      {/* Benefits */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Avantages :</h4>
                        <ul className="space-y-2">
                          {type.benefits.map((benefit, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Products */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Produits typiques :</h4>
                        <div className="flex flex-wrap gap-2">
                          {type.products.map((product, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {product}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Continue Button */}
            <div className="text-center">
              <Button 
                onClick={handleContinue}
                disabled={!selectedType}
                size="lg"
                className="px-8 py-3 text-lg"
              >
                Continuer l'inscription
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              {selectedType && (
                <p className="text-sm text-gray-600 mt-4">
                  Vous avez sélectionné : <strong>
                    {userTypes.find(t => t.id === selectedType)?.title}
                  </strong>
                </p>
              )}
            </div>

            {/* Support Info */}
            <div className="mt-12 text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Besoin d'aide ?
                </h3>
                <p className="text-gray-600 mb-4">
                  Notre équipe est là pour vous accompagner dans votre inscription et 
                  vos premiers pas sur GabMarketHub.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline">
                    📧 support@gabmarkethub.com
                  </Button>
                  <Button variant="outline">
                    📞 +241 01 23 45 67
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserTypeSelection;