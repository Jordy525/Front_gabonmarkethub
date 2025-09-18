import React, { useState } from 'react';
import { Menu, X, ChevronRight, Grid3X3, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  count?: number;
  subcategories?: Category[];
  featured?: boolean;
}

interface MobileCategoryMenuProps {
  categories: Category[];
  selectedCategory?: string;
  onCategorySelect: (categorySlug: string) => void;
  className?: string;
}

export const MobileCategoryMenu: React.FC<MobileCategoryMenuProps> = ({
  categories,
  selectedCategory,
  onCategorySelect,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategorySelect = (categorySlug: string) => {
    onCategorySelect(categorySlug);
    setIsOpen(false);
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategory === category.slug;

    return (
      <div key={category.id} className="space-y-1">
        <div
          className={cn(
            "flex items-center justify-between p-2 rounded-lg transition-colors",
            level > 0 && "ml-4",
            isSelected && "bg-green-50 border border-green-200",
            !isSelected && "hover:bg-gray-50"
          )}
        >
          <button
            onClick={() => handleCategorySelect(category.slug)}
            className="flex items-center space-x-3 flex-1 text-left"
          >
            {category.icon ? (
              <span className="text-lg">{category.icon}</span>
            ) : (
              <Package className="w-4 h-4 text-gray-500" />
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-green-700" : "text-gray-900"
                )}>
                  {category.name}
                </span>
                {category.featured && (
                  <Badge variant="secondary" className="text-xs">
                    ⭐ Populaire
                  </Badge>
                )}
              </div>
              {category.count && (
                <span className="text-xs text-gray-500">
                  {category.count} produits
                </span>
              )}
            </div>
          </button>

          {hasSubcategories && (
            <button
              onClick={() => toggleCategory(category.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight
                className={cn(
                  "w-4 h-4 text-gray-500 transition-transform",
                  isExpanded && "rotate-90"
                )}
              />
            </button>
          )}
        </div>

        {hasSubcategories && isExpanded && (
          <div className="space-y-1">
            {category.subcategories!.map((subcategory) =>
              renderCategory(subcategory, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // Catégories populaires pour l'affichage rapide
  const featuredCategories = categories.filter(cat => cat.featured).slice(0, 4);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("relative", className)}
        >
          <Menu className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Catégories</span>
          <span className="sm:hidden">📂</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-full sm:w-80 p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-base flex items-center">
            <Grid3X3 className="w-4 h-4 mr-2" />
            Catégories
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Bouton "Toutes les catégories" */}
            <button
              onClick={() => handleCategorySelect('all')}
              className={cn(
                "w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors",
                selectedCategory === 'all' || !selectedCategory
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <Grid3X3 className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Toutes les catégories</div>
                <div className="text-xs text-gray-500">
                  Voir tous les produits
                </div>
              </div>
            </button>

            {/* Catégories populaires */}
            {featuredCategories.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  ⭐ Populaires
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {featuredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.slug)}
                      className={cn(
                        "p-3 rounded-lg border text-left transition-colors",
                        selectedCategory === category.slug
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className="text-lg mb-1">{category.icon || '📦'}</div>
                      <div className="text-xs font-medium truncate">
                        {category.name}
                      </div>
                      {category.count && (
                        <div className="text-xs text-gray-500">
                          {category.count}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Toutes les catégories */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Toutes les catégories
              </h3>
              <div className="space-y-1">
                {categories.map((category) => renderCategory(category))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-white">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="w-full"
          >
            Fermer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileCategoryMenu;