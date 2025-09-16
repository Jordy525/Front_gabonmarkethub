import { useState } from 'react';
import { ChevronDown, ChevronRight, Package, ArrowRight, Grid3X3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

interface CategoryWithSubcategoriesProps {
    category: Category;
    onClick: (category: Category) => void;
    showProductCount?: boolean;
    maxSubcategories?: number;
    variant?: 'expanded' | 'collapsed';
}

export const CategoryWithSubcategories = ({
    category,
    onClick,
    showProductCount = true,
    maxSubcategories = 8,
    variant = 'collapsed'
}: CategoryWithSubcategoriesProps) => {
    const [isExpanded, setIsExpanded] = useState(variant === 'expanded');
    const hasSubcategories = category.children && category.children.length > 0;

    const handleMainCategoryClick = () => {
        onClick(category);
    };

    const handleSubcategoryClick = (subCategory: Category, e: React.MouseEvent) => {
        e.stopPropagation();
        onClick(subCategory);
    };

    const toggleExpanded = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
            <CardContent className="p-0">
                {/* Catégorie principale */}
                <div
                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={handleMainCategoryClick}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                            <div className="text-green-600 mt-1">
                                <Package className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-semibold text-gray-900 hover:text-green-600 transition-colors">
                                        {category.nom}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        {showProductCount && category.productCount && (
                                            <Badge variant="secondary" className="text-sm">
                                                {category.productCount} produits
                                            </Badge>
                                        )}
                                        {hasSubcategories && (
                                            <Badge variant="outline" className="text-sm">
                                                {category.children!.length} sous-catégories
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {category.description && (
                                    <p className="text-gray-600 mb-3 line-clamp-2">
                                        {category.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleMainCategoryClick}
                                        className="group"
                                    >
                                        Voir tous les produits
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>

                                    {hasSubcategories && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={toggleExpanded}
                                            className="flex items-center"
                                        >
                                            {isExpanded ? (
                                                <>
                                                    <ChevronDown className="w-4 h-4 mr-1" />
                                                    Masquer sous-catégories
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronRight className="w-4 h-4 mr-1" />
                                                    Voir sous-catégories
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sous-catégories */}
                {hasSubcategories && isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                    <Grid3X3 className="w-4 h-4 mr-2" />
                                    Sous-catégories ({category.children!.length})
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {category.children!.slice(0, maxSubcategories).map((subCategory) => (
                                    <button
                                        key={subCategory.id}
                                        onClick={(e) => handleSubcategoryClick(subCategory, e)}
                                        className="p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all duration-200 text-left group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors mb-1">
                                                    {subCategory.nom}
                                                </h5>
                                                {subCategory.description && (
                                                    <p className="text-xs text-gray-600 line-clamp-1">
                                                        {subCategory.description}
                                                    </p>
                                                )}
                                                {showProductCount && subCategory.productCount && (
                                                    <p className="text-xs text-green-600 mt-1">
                                                        {subCategory.productCount} produits
                                                    </p>
                                                )}
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors flex-shrink-0 ml-2" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {category.children!.length > maxSubcategories && (
                                <div className="mt-4 text-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleMainCategoryClick}
                                    >
                                        Voir toutes les {category.children!.length} sous-catégories
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Aperçu des sous-catégories (mode collapsed) */}
                {hasSubcategories && !isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                        <div className="flex flex-wrap gap-2">
                            {category.children!.slice(0, 6).map((subCategory) => (
                                <button
                                    key={subCategory.id}
                                    onClick={(e) => handleSubcategoryClick(subCategory, e)}
                                    className="text-xs bg-white hover:bg-green-50 text-gray-600 hover:text-green-700 px-3 py-1 rounded-full border border-gray-200 hover:border-green-300 transition-colors"
                                >
                                    {subCategory.nom}
                                </button>
                            ))}
                            {category.children!.length > 6 && (
                                <button
                                    onClick={toggleExpanded}
                                    className="text-xs text-green-600 hover:text-green-700 px-3 py-1 font-medium"
                                >
                                    +{category.children!.length - 6} autres
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CategoryWithSubcategories;