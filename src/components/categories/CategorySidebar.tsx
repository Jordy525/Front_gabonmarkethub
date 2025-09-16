import { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronRight, Filter, X, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

interface CategorySidebarProps {
  className?: string;
  onCategorySelect?: (categorySlug: string) => void;
  showSearch?: boolean;
  showProductCount?: boolean;
  maxDepth?: number;
}

export const CategorySidebar = ({
  className = '',
  onCategorySelect,
  showSearch = true,
  showProductCount = true,
  maxDepth = 2
}: CategorySidebarProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(true);

  const currentCategory = searchParams.get('category');

  // Récupérer les catégories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories-sidebar'],
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
    staleTime: 5 * 60 * 1000,
  });

  // Filtrer les catégories selon la recherche
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    
    return categories.filter(category => {
      const matchesParent = category.nom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesChild = category.children?.some(child => 
        child.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchesParent || matchesChild;
    });
  }, [categories, searchTerm]);

  const toggleExpanded = useCallback((categoryId: number) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  }, []);

  const handleCategoryClick = useCallback((category: Category) => {
    if (onCategorySelect) {
      onCategorySelect(category.slug);
    } else {
      if (category.children && category.children.length > 0) {
        navigate(`/categories/${category.slug}`);
      } else {
        navigate(`/products?category=${category.slug}`);
      }
    }
  }, [onCategorySelect, navigate]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    if (onCategorySelect) {
      onCategorySelect('');
    } else {
      navigate('/products');
    }
  }, [onCategorySelect, navigate]);

  const renderCategory = (category: Category, depth = 0) => {
    if (depth >= maxDepth) return null;

    const isExpanded = expandedCategories.has(category.id);
    const isSelected = currentCategory === category.slug;
    const hasChildren = category.children && category.children.length > 0;

    return (
      <div key={category.id} className="space-y-1">
        <div className={`flex items-center justify-between group ${depth > 0 ? 'ml-4' : ''}`}>
          <button
            onClick={() => handleCategoryClick(category)}
            className={`flex-1 text-left py-2 px-3 rounded-md transition-colors ${
              isSelected 
                ? 'bg-green-100 text-green-700 font-medium' 
                : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">{category.nom}</span>
              {showProductCount && category.productCount && (
                <Badge variant="secondary" className="text-xs ml-2">
                  {category.productCount}
                </Badge>
              )}
            </div>
          </button>
          
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(category.id)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {category.children!.map((subCategory) => 
              renderCategory(subCategory, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-8 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
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
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
          </Button>
        </div>

        {/* Recherche */}
        {showSearch && showFilters && (
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
      {showFilters && (
        <div className="p-4">
          {/* Filtre actuel */}
          {currentCategory && (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Filtre actuel:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-3 h-3 mr-1" />
                  Effacer
                </Button>
              </div>
              <Badge variant="secondary" className="mt-1">
                {categories.find(cat => cat.slug === currentCategory)?.nom || currentCategory}
              </Badge>
              <Separator className="mt-3" />
            </div>
          )}

          {/* Liste des catégories */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              <>
                {/* Bouton "Toutes les catégories" */}
                <button
                  onClick={() => handleCategoryClick({ id: 0, nom: 'Toutes les catégories', slug: '', ordre: 0 })}
                  className={`w-full text-left py-2 px-3 rounded-md transition-colors text-sm ${
                    !currentCategory 
                      ? 'bg-green-100 text-green-700 font-medium' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  Toutes les catégories
                </button>
                
                <Separator className="my-2" />
                
                {filteredCategories.map((category) => renderCategory(category))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Filter className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucune catégorie trouvée</p>
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchTerm('')}
                    className="mt-2"
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
      )}
    </div>
  );
};

export default CategorySidebar;