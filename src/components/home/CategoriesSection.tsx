import { 
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoryService } from "@/services/categoryService";
import { useQuery } from "@tanstack/react-query";



const CategoriesSection = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getMainCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Chargement des catégories...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error || !categories) {
    return (
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600">Erreur lors du chargement des catégories</p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Découvrez nos produits
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des produits italiens de qualité aux créations artisanales gabonaises authentiques. 
            Explorez la richesse de nos deux cultures.
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category, index) => {
            return (
              <div
                key={category.id}
                className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2 cursor-pointer opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => window.location.href = `/categories?id=${category.id}`}
              >
                {/* Active badge */}
                {category.actif && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full shadow-sm z-10">
                    Actif
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors text-lg">
                    {category.nom}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {category.description || 'Catégorie de produits'}
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    Voir les produits →
                  </p>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-green-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            );
          })}
        </div>

        {/* View all button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
            onClick={() => window.location.href = '/categories'}
          >
            Voir toutes les catégories
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;