import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CategoryCard from '@/components/categories/CategoryCard';
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

interface FeaturedCategoriesProps {
  title?: string;
  subtitle?: string;
  maxCategories?: number;
  showViewAll?: boolean;
}

export const FeaturedCategories = ({
  title = "Catégories populaires",
  subtitle = "Découvrez nos catégories les plus demandées",
  maxCategories = 8,
  showViewAll = true
}: FeaturedCategoriesProps) => {
  const navigate = useNavigate();

  // Récupérer les catégories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['featured-categories'],
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
      
      // Trier par popularité (nombre de sous-catégories) et prendre les meilleures
      return rootCategories
        .sort((a, b) => (b.children?.length || 0) - (a.children?.length || 0))
        .slice(0, maxCategories);
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleCategoryClick = (category: Category) => {
    if (category.children && category.children.length > 0) {
      navigate(`/categories/${category.slug}`);
    } else {
      navigate(`/products?category=${category.slug}`);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Catégories en vedette (les 4 premières) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.slice(0, 4).map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={handleCategoryClick}
              variant="featured"
              showProductCount={true}
            />
          ))}
        </div>

        {/* Catégories supplémentaires en format compact */}
        {categories.length > 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {categories.slice(4, maxCategories).map((category) => (
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

        {/* Statistiques */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {categories.length}+
              </div>
              <div className="text-gray-600">Catégories principales</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {categories.reduce((total, cat) => total + (cat.children?.length || 0), 0)}+
              </div>
              <div className="text-gray-600">Sous-catégories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {categories.reduce((total, cat) => total + (cat.productCount || 0), 0) || '1000+'}
              </div>
              <div className="text-gray-600">Produits disponibles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-gray-600">Marché gabonais</div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        {showViewAll && (
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate('/categories')}
              className="group"
            >
              Voir toutes les catégories
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-sm text-gray-600 mt-4">
              Explorez notre catalogue complet de produits B2B
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCategories;