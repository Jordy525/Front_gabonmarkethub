import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Grid3X3, List } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: number;
  nom: string;
  slug: string;
  description?: string;
  parent_id?: number;
  ordre: number;
  children?: Category[];
}

interface CategoriesMenuProps {
  variant?: 'dropdown' | 'sidebar' | 'grid';
  showAllLink?: boolean;
}

export const CategoriesMenu = ({ variant = 'dropdown', showAllLink = true }: CategoriesMenuProps) => {
  const navigate = useNavigate();
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  // Récupérer toutes les catégories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories-hierarchy'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      const allCategories = response.categories || response.data || response || [];
      
      // Organiser en hiérarchie
      const categoryMap = new Map<number, Category>();
      const rootCategories: Category[] = [];
      
      // Créer la map de toutes les catégories
      allCategories.forEach((cat: Category) => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });
      
      // Organiser la hiérarchie
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
      
      // Trier par ordre
      rootCategories.sort((a, b) => a.ordre - b.ordre);
      rootCategories.forEach(cat => {
        if (cat.children) {
          cat.children.sort((a, b) => a.ordre - b.ordre);
        }
      });
      
      return rootCategories;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleCategoryClick = (category: Category) => {
    if (category.children && category.children.length > 0) {
      // Si c'est une catégorie principale avec des sous-catégories
      navigate(`/categories/${category.slug}`);
    } else {
      // Si c'est une sous-catégorie ou une catégorie sans enfants
      navigate(`/products?category=${category.slug}`);
    }
  };

  const toggleExpanded = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Rendu pour menu déroulant (header)
  if (variant === 'dropdown') {
    return (
      <div className="relative group">
        <button className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-green-600 transition-colors">
          <Grid3X3 className="w-4 h-4" />
          <span>Catégories</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        
        {/* Mega menu */}
        <div className="absolute left-0 top-full mt-1 w-screen max-w-4xl bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              {categories.slice(0, 12).map((category) => (
                <div key={category.id} className="space-y-2">
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="font-semibold text-gray-900 hover:text-green-600 transition-colors text-left block"
                  >
                    {category.nom}
                  </button>
                  {category.children && category.children.length > 0 && (
                    <div className="space-y-1">
                      {category.children.slice(0, 6).map((subCategory) => (
                        <button
                          key={subCategory.id}
                          onClick={() => handleCategoryClick(subCategory)}
                          className="block text-sm text-gray-600 hover:text-green-600 transition-colors text-left"
                        >
                          {subCategory.nom}
                        </button>
                      ))}
                      {category.children.length > 6 && (
                        <button
                          onClick={() => navigate(`/categories/${category.slug}`)}
                          className="text-sm text-green-600 hover:text-green-700 font-medium"
                        >
                          Voir tout ({category.children.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {showAllLink && (
              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <button
                  onClick={() => navigate('/categories')}
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  <List className="w-4 h-4 mr-2" />
                  Voir toutes les catégories
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Rendu pour sidebar
  if (variant === 'sidebar') {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 mb-4">Catégories</h3>
        {categories.map((category) => (
          <div key={category.id} className="space-y-1">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleCategoryClick(category)}
                className="flex-1 text-left text-gray-700 hover:text-green-600 transition-colors py-1"
              >
                {category.nom}
              </button>
              {category.children && category.children.length > 0 && (
                <button
                  onClick={() => toggleExpanded(category.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
            
            {expandedCategories.has(category.id) && category.children && (
              <div className="ml-4 space-y-1">
                {category.children.map((subCategory) => (
                  <button
                    key={subCategory.id}
                    onClick={() => handleCategoryClick(subCategory)}
                    className="block text-sm text-gray-600 hover:text-green-600 transition-colors py-1 text-left"
                  >
                    {subCategory.nom}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {showAllLink && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => navigate('/categories')}
              className="flex items-center text-green-600 hover:text-green-700 font-medium text-sm"
            >
              <List className="w-4 h-4 mr-2" />
              Toutes les catégories
            </button>
          </div>
        )}
      </div>
    );
  }

  // Rendu pour grille (page d'accueil)
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleCategoryClick(category)}
          className="p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
              {category.nom}
            </h3>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
          {category.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {category.description}
            </p>
          )}
          {category.children && category.children.length > 0 && (
            <p className="text-xs text-green-600 mt-2">
              {category.children.length} sous-catégories
            </p>
          )}
        </button>
      ))}
      
      {showAllLink && (
        <button
          onClick={() => navigate('/categories')}
          className="p-4 bg-green-50 border-2 border-dashed border-green-300 rounded-lg hover:bg-green-100 transition-colors text-center"
        >
          <List className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <span className="text-green-600 font-medium">Voir toutes</span>
        </button>
      )}
    </div>
  );
};

export default CategoriesMenu;