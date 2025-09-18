import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResponsiveProductCard from "@/components/ui/ResponsiveProductCard";
import ResponsiveProductGrid from "@/components/ui/ResponsiveProductGrid";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { RESPONSIVE_CLASSES, useBreakpoint } from "@/config/responsive";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { cn } from "@/lib/utils";

const ResponsiveProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const breakpoint = useBreakpoint();
  
  // États de filtrage
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    sort: searchParams.get('sort') || 'newest',
    inStock: searchParams.get('inStock') === 'true'
  });

  // Requête des produits
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.priceMin) params.append('priceMin', filters.priceMin);
      if (filters.priceMax) params.append('priceMax', filters.priceMax);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.inStock) params.append('inStock', 'true');
      
      const response = await apiClient.get(`/products?${params.toString()}`);
      return response.products || response.data || [];
    }
  });

  // Requête des catégories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      return response.categories || response.data || [];
    }
  });

  // Mettre à jour les paramètres URL
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Gestion des filtres
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      priceMin: '',
      priceMax: '',
      sort: 'newest',
      inStock: false
    });
  };

  // Compteurs de filtres actifs
  const activeFiltersCount = Object.values(filters).filter(value => 
    value && value !== 'newest' && value !== false
  ).length;

  const products = productsData || [];

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-gray-50">
        <div className={RESPONSIVE_CLASSES.container}>
          {/* Header */}
          <div className="py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Produits
                </h1>
                <p className="text-gray-600 mt-2">
                  {products.length} produit{products.length > 1 ? 's' : ''} trouvé{products.length > 1 ? 's' : ''}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Bouton filtres mobile */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                
                {/* Mode d'affichage */}
                <div className="flex border border-gray-300 rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6 lg:gap-8">
            {/* Sidebar filtres */}
            <div className={cn(
              "w-full lg:w-64 flex-shrink-0",
              showFilters ? "block" : "hidden lg:block"
            )}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Filtres
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-sm"
                    >
                      Effacer
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Recherche */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Recherche
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Rechercher..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Catégorie */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Catégorie
                    </label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => handleFilterChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Toutes les catégories</SelectItem>
                        {categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Prix */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Prix (FCFA)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={filters.priceMin}
                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        value={filters.priceMax}
                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Tri */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Trier par
                    </label>
                    <Select
                      value={filters.sort}
                      onValueChange={(value) => handleFilterChange('sort', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Plus récents</SelectItem>
                        <SelectItem value="oldest">Plus anciens</SelectItem>
                        <SelectItem value="price_asc">Prix croissant</SelectItem>
                        <SelectItem value="price_desc">Prix décroissant</SelectItem>
                        <SelectItem value="rating">Mieux notés</SelectItem>
                        <SelectItem value="popular">Plus populaires</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* En stock */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="inStock" className="text-sm text-gray-700">
                      En stock uniquement
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contenu principal */}
            <div className="flex-1 min-w-0">
              {/* Résultats */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Erreur lors du chargement des produits</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun produit trouvé</p>
                </div>
              ) : (
                <ResponsiveProductGrid
                  columns={{
                    xs: 1,
                    sm: 2,
                    md: 2,
                    lg: 3,
                    xl: 4
                  }}
                  gap="md"
                >
                  {products.map((product: any) => (
                    <ResponsiveProductCard
                      key={product.id}
                      product={product}
                      onView={(id) => window.open(`/products/${id}`, '_blank')}
                      onAddToCart={(id) => console.log('Add to cart:', id)}
                      onToggleFavorite={(id) => console.log('Toggle favorite:', id)}
                    />
                  ))}
                </ResponsiveProductGrid>
              )}
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default ResponsiveProducts;

