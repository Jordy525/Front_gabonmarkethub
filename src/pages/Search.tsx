import React from 'react';
import Layout from '@/components/layout/Layout';
import { AdvancedSearch } from '@/components/search/AdvancedSearch';
import { TrendingUp, Search as SearchIcon, Filter, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Search: React.FC = () => {
  const popularSearches = [
    { term: 'Produits artisanaux', count: 1250 },
    { term: 'Fournisseurs locaux', count: 890 },
    { term: 'Textiles traditionnels', count: 650 },
    { term: 'Poterie gabonaise', count: 420 },
    { term: 'Vannerie', count: 380 },
    { term: 'Bijoux artisanaux', count: 320 }
  ];

  const recentSearches = [
    'Produits bio',
    'Fournisseurs Libreville',
    'Artisanat local',
    'Textiles africains'
  ];

  const searchTips = [
    {
      icon: <SearchIcon className="w-5 h-5" />,
      title: 'Recherche intelligente',
      description: 'Utilisez des mots-clés spécifiques pour des résultats plus précis'
    },
    {
      icon: <Filter className="w-5 h-5" />,
      title: 'Filtres avancés',
      description: 'Affinez votre recherche avec nos filtres par prix, catégorie et localisation'
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Tendances',
      description: 'Découvrez les recherches populaires et les produits tendance'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Recherche avancée
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trouvez exactement ce que vous cherchez parmi nos produits, fournisseurs et catégories
            </p>
          </div>

          {/* Barre de recherche principale */}
          <div className="mb-8">
            <AdvancedSearch />
          </div>

          {/* Contenu d'aide et suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recherches populaires */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                  Recherches populaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {popularSearches.map((search, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <span className="text-sm font-medium">{search.term}</span>
                      <Badge variant="secondary" className="text-xs">
                        {search.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recherches récentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Recherches récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <div key={index} className="p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <span className="text-sm">{search}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Conseils de recherche */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SearchIcon className="w-5 h-5 mr-2 text-purple-600" />
                  Conseils de recherche
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {searchTips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="text-gray-500 mt-0.5">
                        {tip.icon}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{tip.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{tip.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques de recherche */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques de recherche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">15,000+</div>
                    <div className="text-sm text-gray-600">Produits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">500+</div>
                    <div className="text-sm text-gray-600">Fournisseurs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">50+</div>
                    <div className="text-sm text-gray-600">Catégories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">24/7</div>
                    <div className="text-sm text-gray-600">Disponible</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
