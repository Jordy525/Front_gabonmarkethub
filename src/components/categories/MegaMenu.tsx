import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Grid3X3, ArrowRight, Package, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

interface MegaMenuProps {
  className?: string;
}

export const MegaMenu = ({ className = '' }: MegaMenuProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Récupérer les catégories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories-mega-menu'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      const allCategories = response.categories || response.data || response || [];
      
      // Organiser en hiérarchie et prendre seulement les principales
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
      
      return rootCategories.slice(0, 12); // Limiter à 12 catégories principales
    },
    staleTime: 5 * 60 * 1000,
  });

  // Catégories populaires (avec le plus de sous-catégories)
  const popularCategories = categories
    .filter(cat => cat.children && cat.children.length >= 3)
    .sort((a, b) => (b.children?.length || 0) - (a.children?.length || 0))
    .slice(0, 4);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setHoveredCategory(null);
    }, 150);
  };

  const handleCategoryClick = (category: Category) => {
    setIsOpen(false);
    if (category.children && category.children.length > 0) {
      navigate(`/categories/${category.slug}`);
    } else {
      navigate(`/products?category=${category.slug}`);
    }
  };

  const handleSubCategoryClick = (subCategory: Category) => {
    setIsOpen(false);
    navigate(`/products?category=${subCategory.slug}`);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <button className="flex items-center space-x-1 px-4 py-2 text-gray-700">
          <Grid3X3 className="w-4 h-4" />
          <span>Catégories</span>
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={menuRef}
    >
      {/* Bouton déclencheur */}
      <button className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-green-600 transition-colors">
        <Grid3X3 className="w-4 h-4" />
        <span>Catégories</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Mega menu */}
      <div className={`absolute left-0 top-full mt-1 w-screen max-w-6xl bg-white border border-gray-200 rounded-lg shadow-xl transition-all duration-200 z-50 ${
        isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
      }`}>
        <div className="p-8">
          {/* Section populaires */}
          {popularCategories.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                <h3 className="font-semibold text-gray-900">Catégories populaires</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {popularCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg hover:from-green-100 hover:to-blue-100 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Package className="w-5 h-5 text-green-600" />
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </div>
                    <h4 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors mb-1">
                      {category.nom}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {category.children?.length} sous-catégories
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toutes les catégories */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Toutes les catégories</h3>
            <div className="grid grid-cols-4 gap-8">
              {categories.map((category) => (
                <div 
                  key={category.id} 
                  className="space-y-3"
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className="font-semibold text-gray-900 hover:text-green-600 transition-colors text-left block group"
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.nom}</span>
                      {category.children && category.children.length > 0 && (
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                      )}
                    </div>
                  </button>
                  
                  {category.children && category.children.length > 0 && (
                    <div className={`space-y-2 transition-all duration-200 ${
                      hoveredCategory === category.id ? 'opacity-100' : 'opacity-70'
                    }`}>
                      {category.children.slice(0, 6).map((subCategory) => (
                        <button
                          key={subCategory.id}
                          onClick={() => handleSubCategoryClick(subCategory)}
                          className="block text-sm text-gray-600 hover:text-green-600 transition-colors text-left py-1"
                        >
                          {subCategory.nom}
                        </button>
                      ))}
                      {category.children.length > 6 && (
                        <button
                          onClick={() => handleCategoryClick(category)}
                          className="text-sm text-green-600 hover:text-green-700 font-medium py-1"
                        >
                          +{category.children.length - 6} autres
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Footer du menu */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {categories.length} catégories principales • {categories.reduce((total, cat) => total + (cat.children?.length || 0), 0)} sous-catégories
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                navigate('/categories');
              }}
            >
              Voir toutes les catégories
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;