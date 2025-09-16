import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Grid3X3, List, Package, Search, ChevronRight } from 'lucide-react';

import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import CategoryBreadcrumb from '@/components/categories/CategoryBreadcrumb';
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

const CategoryDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Récupérer les détails de la catégorie
  const { data: categoryData, isLoading, error } = useQuery({
    queryKey: ['category-detail', slug],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/categories/${slug}`);
        return response.data || response;
      } catch (error: any) {
        console.error(`Erreur lors de la récupération de la catégorie ${slug}:`, error);
        
        // Si 404, essayer de trouver la catégorie dans la liste générale
        if (error.response?.status === 404) {
          try {
            const allCategoriesResponse = await apiClient.get('/categories');
            const allCategories = allCategoriesResponse.categories || allCategoriesResponse.data || [];
            
            // Chercher la catégorie par slug dans toutes les catégories
            const foundCategory = allCategories.find((cat: any) => cat.slug === slug);
            if (foundCategory) {
              return { category: foundCategory };
            }
          } catch (fallbackError) {
            console.error('Erreur fallback:', fallbackError);
          }
        }
        
        throw error;
      }
    },
    enabled: !!slug,
    retry: 1,
  });

  // Récupérer toutes les catégories pour construire le breadcrumb
  const { data: allCategories = [] } = useQuery({
    queryKey: ['all-categories-for-breadcrumb'],
    queryFn: async () => {
      const response = await apiClient.get('/categories');
      return response.categories || response.data || response || [];
    },
  });

  const category = categoryData?.category || categoryData;
  const subcategories = category?.children || [];

  // Filtrer les sous-catégories selon la recherche
  const filteredSubcategories = subcategories.filter((subcat: Category) =>
    subcat.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Construire le breadcrumb
  const buildBreadcrumb = () => {
    if (!category || !allCategories.length) return [];
    
    const breadcrumb = [];
    let currentCategory = category;
    
    // Remonter la hiérarchie
    while (currentCategory) {
      breadcrumb.unshift({
        label: currentCategory.nom,
        href: `/categories/${currentCategory.slug}`
      });
      
      if (currentCategory.parent_id) {
        currentCategory = allCategories.find((cat: Category) => cat.id === currentCategory.parent_id);
      } else {
        break;
      }
    }
    
    // Ajouter "Toutes les catégories" au début
    breadcrumb.unshift({
      label: 'Toutes les catégories',
      href: '/categories'
    });
    
    return breadcrumb;
  };

  const handleCategoryClick = (clickedCategory: Category) => {
    if (clickedCategory.children && clickedCategory.children.length > 0) {
      navigate(`/categories/${clickedCategory.slug}`);
    } else {
      navigate(`/products?category=${clickedCategory.slug}`);
    }
  };

  const handleViewProducts = () => {
    navigate(`/products?category=${category.slug}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p>Chargement de la catégorie...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur de chargement</h2>
            <p className="text-gray-600 mb-4">
              {error.response?.status === 404 
                ? `La catégorie "${slug}" n'existe pas ou a été supprimée.`
                : 'Une erreur est survenue lors du chargement de la catégorie.'
              }
            </p>
            <div className="space-x-4">
              <Button onClick={() => navigate('/categories')}>
                Voir toutes les catégories
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Catégorie non trouvée</h2>
            <p className="text-gray-600 mb-4">Cette catégorie n'existe pas ou a été supprimée.</p>
            <Button onClick={() => navigate('/categories')}>
              Voir toutes les catégories
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <CategoryBreadcrumb items={buildBreadcrumb()} />

          {/* Header de la catégorie */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="mr-4"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {category.nom}
                </h1>
                
                {category.description && (
                  <p className="text-lg text-gray-600 mb-6 max-w-3xl">
                    {category.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-4">
                  {subcategories.length > 0 && (
                    <Badge variant="outline" className="text-sm">
                      {subcategories.length} sous-catégories
                    </Badge>
                  )}
                  
                  {category.productCount && (
                    <Badge variant="secondary" className="text-sm">
                      {category.productCount} produits
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions principales */}
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleViewProducts} className="flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Voir tous les produits
              </Button>
              
              {subcategories.length > 0 && (
                <Button variant="outline">
                  Explorer les sous-catégories
                </Button>
              )}
            </div>
          </div>

          {/* Sous-catégories */}
          {subcategories.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Sous-catégories ({subcategories.length})
                  </h2>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Barre de recherche */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  {/* Contrôles d'affichage */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Affichage des sous-catégories */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredSubcategories.map((subCategory: Category) => (
                    <div key={subCategory.id} className="bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 p-4 group cursor-pointer">
                      <button
                        onClick={() => handleCategoryClick(subCategory)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-green-600 group-hover:text-green-700">
                            <Package className="w-6 h-6" />
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors mb-2">
                          {subCategory.nom}
                        </h3>
                        
                        {subCategory.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {subCategory.description}
                          </p>
                        )}
                        
                        {subCategory.productCount && (
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">
                              {subCategory.productCount} produits
                            </Badge>
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSubcategories.map((subCategory: Category) => (
                    <div key={subCategory.id} className="bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all duration-200 p-4 group cursor-pointer">
                      <button
                        onClick={() => handleCategoryClick(subCategory)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="text-green-600 group-hover:text-green-700">
                              <Package className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                                {subCategory.nom}
                              </h3>
                              {subCategory.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                  {subCategory.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            {subCategory.productCount && (
                              <Badge variant="secondary" className="text-xs">
                                {subCategory.productCount} produits
                              </Badge>
                            )}
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {filteredSubcategories.length === 0 && searchTerm && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucune sous-catégorie trouvée
                  </h3>
                  <p className="text-gray-600">
                    Essayez avec d'autres mots-clés ou 
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-green-600 hover:text-green-700 ml-1"
                    >
                      effacez la recherche
                    </button>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Catégories similaires ou recommandées */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Catégories similaires
            </h3>
            <p className="text-gray-600 mb-4">
              Découvrez d'autres catégories qui pourraient vous intéresser
            </p>
            <Button variant="outline" onClick={() => navigate('/categories')}>
              Parcourir toutes les catégories
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryDetail;