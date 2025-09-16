import { ChevronRight, Package, Tag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface CategoryCardProps {
  category: Category;
  onClick: (category: Category) => void;
  variant?: 'default' | 'compact' | 'featured';
  showProductCount?: boolean;
}

export const CategoryCard = ({ 
  category, 
  onClick, 
  variant = 'default',
  showProductCount = false 
}: CategoryCardProps) => {
  const getIcon = () => {
    // Vous pouvez personnaliser les icônes selon les catégories
    return <Package className="w-6 h-6" />;
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={() => onClick(category)}
        className="w-full p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 text-left group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-green-600 group-hover:text-green-700">
              {getIcon()}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                {category.nom}
              </h3>
              {showProductCount && category.productCount && (
                <p className="text-xs text-gray-500">
                  {category.productCount} produits
                </p>
              )}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
        </div>
      </button>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 group-hover:from-green-100 group-hover:to-blue-100 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="text-green-600 group-hover:text-green-700 transition-colors">
                {getIcon()}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-2">
              {category.nom}
            </h3>
            
            {category.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                {category.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              {category.children && category.children.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {category.children.length} sous-catégories
                </Badge>
              )}
              
              {showProductCount && category.productCount && (
                <Badge variant="outline" className="text-xs">
                  {category.productCount} produits
                </Badge>
              )}
            </div>
          </div>
          
          {category.children && category.children.length > 0 && (
            <div className="p-4 bg-white border-t border-gray-100">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Sous-catégories populaires :</h4>
              <div className="flex flex-wrap gap-1">
                {category.children.slice(0, 3).map((subCategory) => (
                  <button
                    key={subCategory.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick(subCategory);
                    }}
                    className="text-xs bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700 px-2 py-1 rounded-full transition-colors"
                  >
                    {subCategory.nom}
                  </button>
                ))}
                {category.children.length > 3 && (
                  <span className="text-xs text-green-600 px-2 py-1 font-medium">
                    +{category.children.length - 3} autres
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Variant par défaut
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardContent className="p-6" onClick={() => onClick(category)}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="text-green-600 group-hover:text-green-700 transition-colors mt-1">
              {getIcon()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors mb-2">
                {category.nom}
              </h3>
              {category.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0 ml-2" />
        </div>
        
        <div className="flex items-center justify-between">
          {category.children && category.children.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {category.children.length} sous-catégories
            </Badge>
          )}
          
          {showProductCount && category.productCount && (
            <Badge variant="secondary" className="text-xs">
              {category.productCount} produits
            </Badge>
          )}
        </div>
        
        {category.children && category.children.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Sous-catégories :</h4>
            <div className="flex flex-wrap gap-1">
              {category.children.slice(0, 4).map((subCategory) => (
                <button
                  key={subCategory.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(subCategory);
                  }}
                  className="text-xs bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-700 px-2 py-1 rounded transition-colors"
                >
                  {subCategory.nom}
                </button>
              ))}
              {category.children.length > 4 && (
                <span className="text-xs text-green-600 px-2 py-1 font-medium">
                  +{category.children.length - 4} autres
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryCard;