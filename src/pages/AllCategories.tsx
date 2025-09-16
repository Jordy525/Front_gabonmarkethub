import { useState, useMemo } from 'react';
import { Search, Grid3X3, List, ChevronRight, Package, Star, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import CategoryFilters from '@/components/categories/CategoryFilters';
import CategoryCard from '@/components/categories/CategoryCard';
import CategoryWithSubcategories from '@/components/categories/CategoryWithSubcategories';
import { apiClient } from '@/services/api';

interface Category {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  parent_id?: number;
  ordre: number;
  children?: Category[];
  productCount?: number;
}

const AllCategories = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFeatured, setShowFeatured] = useState(true);
  const [showSubcategories, setShowSubcategories] = useState(false);

  // Récupérer toutes les catégories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['all-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      const allCategories = response.categories || response.data || response || [];
      
      // Organiser en hiérarchie
      const categoryMap = new Map<number, Category>();
      const rootCategories: Category[] = [];
      
      allCategories.forEach((cat: Category) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });
      
      allCategories.forEach((cat: Category) => {
        const category = categoryMap.get(cat.id)!;
        if (cat.parent_id) {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            parent.children!.push(category);
          }
        } else {
          rootCategories.push(category);
        }
      });
      
      rootCategories.sort((a, b) => a.ordre - b.ordre);
      rootCategories.forEach(cat => {
        if (cat.children) {
          cat.children.sort((a, b) => a.ordre - b.ordre);
        }
      });
      
      return rootCategories;
    },
  });

  // Filtrer et trier les catégories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories.filter(category => {
      // Filtre de recherche
      if (searchTerm) {
        const matchesParent = category.nom.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesChild = category.children?.some(child => 
          child.nom.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (!matchesParent && !matchesChild) return false;
      }
      
      // Filtres avancés
      if (selectedFilters.includes('with-subcategories') && (!category.children || category.children.length === 0)) {
        return false;
      }
      if (selectedFilters.includes('leaf-categories') && category.children && category.children.length > 0) {
        return false;
      }
      
      return true;
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-desc':
          return b.nom.localeCompare(a.nom);
        case 'subcategories':
          return (b.children?.length || 0) - (a.children?.length || 0);
        case 'products':
          return (b.productCount || 0) - (a.productCount || 0);
        default: // 'name'
          return a.nom.localeCompare(b.nom);
      }
    });

    return filtered;
  }, [categories, searchTerm, selectedFilters, sortBy]);

  // Catégories en vedette (les plus populaires)
  const featuredCategories = useMemo(() => {
    return categories
      .filter(cat => cat.children && cat.children.length >= 3)
      .sort((a, b) => (b.children?.length || 0) - (a.children?.length || 0))
      .slice(0, 6);
  }, [categories]);

  const handleCategoryClick = (category: Category) => {
    if (category.children && category.children.length > 0) {
      navigate(`/categories/${category.slug}`);
    } else {
      navigate(`/products?category=${category.slug}`);
    }
  };

  const getTotalSubcategories = () => {
    return categories.reduce((total, cat) => total + (cat.children?.length || 0), 0);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Chargement des catégories...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Toutes les catégories
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explorez notre catalogue complet de {categories.length} catégories principales 
              et {getTotalSubcategories()} sous-catégories
            </p>
          </div>

          {/* Filtres avancés */}
          <CategoryFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
            totalResults={filteredAndSortedCategories.length}
          />

          {/* Contrôles d'affichage */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Button
                variant={showFeatured ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFeatured(!showFeatured)}
                className="text-xs sm:text-sm"
              >
                <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">En vedette</span>
                <span className="sm:hidden">Vedette</span>
              </Button>
              <Button
                variant={showSubcategories ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowSubcategories(!showSubcategories)}
                className="text-xs sm:text-sm"
              >
                <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Avec sous-catégories</span>
                <span className="sm:hidden">Sous-cat.</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="text-xs sm:text-sm"
              >
                <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Grille</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="text-xs sm:text-sm"
              >
                <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Liste</span>
              </Button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{categories.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Catégories principales</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600">{getTotalSubcategories()}</div>
                <div className="text-xs sm:text-sm text-gray-600">Sous-catégories</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600">{filteredAndSortedCategories.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Résultats affichés</div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">100%</div>
                <div className="text-xs sm:text-sm text-gray-600">Couverture marché</div>
              </CardContent>
            </Card>
          </div>

          {/* Catégories en vedette */}
          {showFeatured && featuredCategories.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Catégories en vedette</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={handleCategoryClick}
                    variant="featured"
                    showProductCount={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Toutes les catégories avec sous-catégories détaillées */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {showFeatured ? 'Toutes les catégories' : 'Catégories'} 
              <span className="text-lg font-normal text-gray-600 ml-2">
                ({filteredAndSortedCategories.length})
              </span>
            </h2>

            {showSubcategories ? (
              // Affichage avec sous-catégories détaillées
              <div className="space-y-6">
                {filteredAndSortedCategories.map((category) => (
                  <CategoryWithSubcategories
                    key={category.id}
                    category={category}
                    onClick={handleCategoryClick}
                    showProductCount={true}
                    variant="collapsed"
                  />
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredAndSortedCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={handleCategoryClick}
                    showProductCount={true}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {filteredAndSortedCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={handleCategoryClick}
                    variant="compact"
                    showProductCount={true}
                  />
                ))}
              </div>
            )}

            {filteredAndSortedCategories.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune catégorie trouvée</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedFilters.length > 0 
                    ? 'Essayez de modifier vos critères de recherche'
                    : 'Aucune catégorie disponible pour le moment'
                  }
                </p>
                {(searchTerm || selectedFilters.length > 0) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedFilters([]);
                    }}
                  >
                    Effacer les filtres
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AllCategories;