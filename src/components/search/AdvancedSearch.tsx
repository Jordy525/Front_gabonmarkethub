import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, MapPin, Star, Clock, TrendingUp, Users, Package, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { cn } from '@/lib/utils';

interface SearchFilters {
  query: string;
  type: 'all' | 'products' | 'suppliers' | 'categories';
  category: string;
  priceRange: [number, number];
  rating: number;
  location: string;
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  features: string[];
  availability: 'all' | 'in_stock' | 'out_of_stock';
  supplierType: 'all' | 'verified' | 'premium';
}

interface SearchResult {
  id: number;
  type: 'product' | 'supplier' | 'category';
  title: string;
  description: string;
  image?: string;
  price?: number;
  rating?: number;
  location?: string;
  category?: string;
  supplier?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  stock?: number;
  url: string;
}

export const AdvancedSearch: React.FC = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: 'all',
    category: 'all',
    priceRange: [0, 10000],
    rating: 0,
    location: 'all',
    sortBy: 'relevance',
    features: [],
    availability: 'all',
    supplierType: 'all'
  });

  // Récupérer les catégories pour les filtres
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      return response.categories || response.data || response || [];
    }
  });

  // Recherche avec les filtres
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['search', filters],
    queryFn: async () => {
      if (!filters.query.trim()) return [];
      
      const params = new URLSearchParams({
        q: filters.query,
        type: filters.type,
        category: filters.category,
        min_price: filters.priceRange[0].toString(),
        max_price: filters.priceRange[1].toString(),
        min_rating: filters.rating.toString(),
        location: filters.location,
        sort: filters.sortBy,
        availability: filters.availability,
        supplier_type: filters.supplierType,
        features: filters.features.join(',')
      });

      const response = await apiClient.get(`/search?${params}`);
      return response.results || response.data || response || [];
    },
    enabled: !!filters.query.trim()
  });

  // Suggestions de recherche
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const popularSearches = [
    'Produits artisanaux',
    'Fournisseurs locaux',
    'Textiles traditionnels',
    'Poterie gabonaise',
    'Vannerie',
    'Bijoux artisanaux'
  ];

  const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

  // Gérer les suggestions
  useEffect(() => {
    if (filters.query.length > 2) {
      // Simuler des suggestions basées sur la requête
      const mockSuggestions = [
        `${filters.query} artisanaux`,
        `${filters.query} traditionnels`,
        `${filters.query} locaux`,
        `Fournisseurs ${filters.query}`,
        `Produits ${filters.query}`
      ];
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [filters.query]);

  const handleSearch = (query?: string) => {
    const searchQuery = query || filters.query;
    if (!searchQuery.trim()) return;

    // Sauvegarder dans l'historique
    const newRecentSearches = [searchQuery, ...recentSearches.filter((s: string) => s !== searchQuery)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    setFilters(prev => ({ ...prev, query: searchQuery }));
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      type: 'all',
      category: 'all',
      priceRange: [0, 10000],
      rating: 0,
      location: 'all',
      sortBy: 'relevance',
      features: [],
      availability: 'all',
      supplierType: 'all'
    });
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4" />;
      case 'supplier':
        return <Building2 className="w-4 h-4" />;
      case 'category':
        return <Package className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'product':
        return 'Produit';
      case 'supplier':
        return 'Fournisseur';
      case 'category':
        return 'Catégorie';
      default:
        return 'Résultat';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Barre de recherche principale */}
      <div className="relative">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Rechercher des produits, fournisseurs, catégories..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10 pr-20 h-12 text-lg"
            />
            {filters.query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(prev => ({ ...prev, query: '' }))}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <Button 
            onClick={() => handleSearch()}
            size="lg"
            className="h-12 px-6"
          >
            <Search className="w-5 h-5 mr-2" />
            Rechercher
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-12 px-4"
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg">
            <CardContent className="p-0">
              {filters.query.length > 2 ? (
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2">Suggestions</div>
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => handleSearch(suggestion)}
                    >
                      <Search className="w-4 h-4 mr-2 text-gray-400" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="p-4">
                  <div className="space-y-3">
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-500 mb-2">Recherches récentes</div>
                        <div className="space-y-1">
                          {recentSearches.map((search: string, index: number) => (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-left h-auto p-2"
                              onClick={() => handleSearch(search)}
                            >
                              <Clock className="w-3 h-3 mr-2 text-gray-400" />
                              {search}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">Recherches populaires</div>
                      <div className="flex flex-wrap gap-1">
                        {popularSearches.map((search, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleSearch(search)}
                          >
                            {search}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filtres avancés */}
      {isExpanded && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtres avancés</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Effacer tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="products">Produits</TabsTrigger>
                <TabsTrigger value="suppliers">Fournisseurs</TabsTrigger>
                <TabsTrigger value="location">Localisation</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type de recherche</label>
                    <Select value={filters.type} onValueChange={(value: any) => setFilters(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tout</SelectItem>
                        <SelectItem value="products">Produits</SelectItem>
                        <SelectItem value="suppliers">Fournisseurs</SelectItem>
                        <SelectItem value="categories">Catégories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Trier par</label>
                    <Select value={filters.sortBy} onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Pertinence</SelectItem>
                        <SelectItem value="price_asc">Prix croissant</SelectItem>
                        <SelectItem value="price_desc">Prix décroissant</SelectItem>
                        <SelectItem value="rating">Note</SelectItem>
                        <SelectItem value="newest">Plus récent</SelectItem>
                        <SelectItem value="popular">Plus populaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Catégorie</label>
                  <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Prix: {filters.priceRange[0]}€ - {filters.priceRange[1]}€
                  </label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Note minimum: {filters.rating} étoiles
                  </label>
                  <Slider
                    value={[filters.rating]}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, rating: value[0] }))}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Disponibilité</label>
                  <Select value={filters.availability} onValueChange={(value: any) => setFilters(prev => ({ ...prev, availability: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="in_stock">En stock</SelectItem>
                      <SelectItem value="out_of_stock">Rupture de stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="suppliers" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type de fournisseur</label>
                  <Select value={filters.supplierType} onValueChange={(value: any) => setFilters(prev => ({ ...prev, supplierType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="verified">Vérifiés</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="location" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Localisation</label>
                  <Select value={filters.location} onValueChange={(value) => setFilters(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les régions</SelectItem>
                      <SelectItem value="libreville">Libreville</SelectItem>
                      <SelectItem value="port_gentil">Port-Gentil</SelectItem>
                      <SelectItem value="franceville">Franceville</SelectItem>
                      <SelectItem value="oyem">Oyem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Résultats de recherche */}
      {filters.query && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Résultats pour "{filters.query}"
                {searchResults.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2">Recherche en cours...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-3">
                {searchResults.map((result: SearchResult) => (
                  <Card 
                    key={`${result.type}-${result.id}`}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(result.url)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getResultIcon(result.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900 truncate">
                                {result.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {result.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <Badge variant="outline" className="text-xs">
                                {getResultTypeLabel(result.type)}
                              </Badge>
                              {result.isVerified && (
                                <Badge variant="default" className="text-xs bg-green-500">
                                  Vérifié
                                </Badge>
                              )}
                              {result.isFeatured && (
                                <Badge variant="default" className="text-xs bg-yellow-500">
                                  Vedette
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              {result.price && (
                                <span className="font-medium text-green-600">
                                  {result.price}€
                                </span>
                              )}
                              {result.rating && (
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                  {result.rating}
                                </div>
                              )}
                              {result.location && (
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {result.location}
                                </div>
                              )}
                              {result.category && (
                                <span>{result.category}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun résultat trouvé
                </h3>
                <p className="text-gray-600 mb-4">
                  Essayez de modifier vos critères de recherche
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Effacer les filtres
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
