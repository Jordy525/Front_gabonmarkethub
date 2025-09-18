 import { Search, Users, Package, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { RESPONSIVE_CLASSES } from "@/config/responsive";

import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  // Récupérer les statistiques dynamiques
  const { data: stats } = useQuery({
    queryKey: ['hero-stats'],
    queryFn: async () => {
      try {
        // Récupérer les produits pour compter
        const productsResponse = await apiClient.get('/products/public?limit=1') as any;
        const totalProducts = productsResponse.pagination?.total || productsResponse.total || 500;

        // Récupérer les catégories pour compter
        const categoriesResponse = await apiClient.get('/categories') as any;
        const categories = categoriesResponse.categories || categoriesResponse.data || [];
        const totalCategories = categories.length;

        return {
          products: totalProducts,
          categories: totalCategories,
          suppliers: Math.floor(totalProducts / 3) + 50, // Estimation basée sur les produits
          exchanges: Math.floor(totalProducts * 150) // Estimation des échanges
        };
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        return {
          products: 500,
          categories: 50,
          suppliers: 150,
          exchanges: 1000000
        };
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)}k`;
    }
    return num.toString();
  };

  return (
    <section className="relative bg-gradient-to-r from-green-600 to-blue-600 text-white overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-400/20 rounded-full blur-xl"></div>

      <div className={`relative ${RESPONSIVE_CLASSES.container} py-12 sm:py-16 lg:py-20 xl:py-32`}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Main heading */}
          <h1 className={`${RESPONSIVE_CLASSES.text?.h1 || 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl'} font-bold mb-6 opacity-0 animate-[fadeIn_0.5s_ease-in-out_forwards]`}>
            Connecter l'<span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Italie</span> et le
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">Gabon</span>
          </h1>

          <p className={`${RESPONSIVE_CLASSES.text?.large || 'text-base sm:text-lg lg:text-xl'} mb-8 text-white/90 opacity-0 animate-[slideUp_0.3s_ease-out_0.2s_forwards]`}>
            Plateforme dédiée aux échanges commerciaux entre entreprises italiennes et artisans gabonais.
            Découvrez des produits authentiques, négociez directement et développez vos partenariats.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-12 opacity-0 animate-[slideUp_0.3s_ease-out_0.4s_forwards]">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 w-6 h-6" />
              <Input
                placeholder="Rechercher des produits (ex: masques traditionnels, électronique, vêtements...)"
                className="pl-16 pr-6 h-16 text-lg border-2 border-green-400/30 bg-white/10 backdrop-blur-sm text-gray-900 placeholder:text-gray-500 focus:border-yellow-400"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const searchTerm = (e.target as HTMLInputElement).value;
                    if (searchTerm.trim()) {
                      window.location.href = `/products?search=${encodeURIComponent(searchTerm.trim())}`;
                    } else {
                      window.location.href = '/products';
                    }
                  }
                }}
              />
              <Button
                variant="accent"
                size="lg"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => {
                  const searchInput = document.querySelector('input[placeholder*="masques traditionnels"]') as HTMLInputElement;
                  const searchTerm = searchInput?.value;
                  if (searchTerm?.trim()) {
                    window.location.href = `/products?search=${encodeURIComponent(searchTerm.trim())}`;
                  } else {
                    window.location.href = '/products';
                  }
                }}
              >
                Rechercher
              </Button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              onClick={() => window.location.href = '/register?userType=2&origin=italian-company'}
            >
              Entreprise italienne
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              onClick={() => window.location.href = '/supplier/login'}
            >
              Fournisseur gabonais
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
              onClick={() => window.location.href = '/products'}
            >
              Découvrir les produits
            </Button>
          </div>

          {/* Navigation vers la messagerie */}
          <div className="max-w-2xl mx-auto mb-16">

          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div className="text-center animate-[bounceSoft_1s_ease-in-out_infinite]">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400/20 rounded-full mx-auto mb-3">
                <Package className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats ? formatNumber(stats.products) : '500'}+</div>
              <div className="text-sm text-white/80">Produits</div>
            </div>

            <div className="text-center animate-[bounceSoft_1s_ease-in-out_infinite] [animation-delay:0.1s]">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400/20 rounded-full mx-auto mb-3">
                <Users className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats ? formatNumber(stats.suppliers) : '150'}+</div>
              <div className="text-sm text-white/80">Partenaires</div>
            </div>

            <div className="text-center animate-[bounceSoft_1s_ease-in-out_infinite] [animation-delay:0.2s]">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400/20 rounded-full mx-auto mb-3">
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats ? stats.categories : '50'}+</div>
              <div className="text-sm text-white/80">Catégories</div>
            </div>

            <div className="text-center animate-[bounceSoft_1s_ease-in-out_infinite] [animation-delay:0.3s]">
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400/20 rounded-full mx-auto mb-3">
                <Package className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold mb-1">{stats ? formatNumber(stats.exchanges) : '1M'}+</div>
              <div className="text-sm text-white/80">€ d'échanges</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;