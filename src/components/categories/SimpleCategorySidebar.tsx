import { useState } from 'react';
import { ChevronRight, Filter, X, Search, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface SimpleCategorySidebarProps {
  className?: string;
  onCategorySelect?: (categorySlug: string) => void;
  currentCategory?: string;
  showSearch?: boolean;
}

export const SimpleCategorySidebar = ({
  className = '',
  onCategorySelect,
  currentCategory = '',
  showSearch = true
}: SimpleCategorySidebarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // Récupérer les catégories principales seulement
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories-simple'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/categories');
        const allCategories = response.categories || response.data || response || [];
        
        // Prendre seulement les catégories principales (sans parent)
        const rootCategories = allCategories.filter((cat: Category) => !cat.parent_id);
        return rootCategories.sort((a: Category, b: Category) => a.ordre - b.ordre);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Filtrer les catégories selon la recherche
  const filteredCategories = categories.filter((category: Category) =>
    category.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategoryClick = (categorySlug: string) => {
    if (onCategorySelect) {
      onCategorySelect(categorySlug);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    if (onCategorySelect) {
      onCategorySelect('');
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!isVisible) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="w-full"
        >
          <Filter className="w-4 h-4 mr-2" />
          Afficher les filtres
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Catégories
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Recherche */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        {/* Filtre actuel */}
        {currentCategory && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Filtre actuel:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 h-auto p-1"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <Badge variant="secondary" className="text-xs">
              {categories.find((cat: Category) => cat.slug === currentCategory)?.nom || currentCategory}
            </Badge>
            <div className="border-t border-gray-200 mt-3 mb-3"></div>
          </div>
        )}

        {/* Bouton "Toutes les catégories" */}
        <button
          onClick={() => handleCategoryClick('')}
          className={`w-full text-left py-2 px-3 rounded-md transition-colors text-sm mb-2 ${
            !currentCategory 
              ? 'bg-green-100 text-green-700 font-medium' 
              : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
          }`}
        >
          Toutes les catégories
        </button>

        {/* Liste des catégories */}
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category: Category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.slug)}
                className={`w-full text-left py-2 px-3 rounded-md transition-colors text-sm flex items-center justify-between group ${
                  currentCategory === category.slug
                    ? 'bg-green-100 text-green-700 font-medium' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                <span>{category.nom}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucune catégorie trouvée</p>
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-xs"
                >
                  Effacer la recherche
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''} disponible{filteredCategories.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleCategorySidebar;