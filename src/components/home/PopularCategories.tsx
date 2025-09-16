import { useState, useEffect, useMemo } from "react";
import {
  Smartphone,
  Shirt,
  Home,
  Wrench,
  Car,
  Utensils,
  Briefcase,
  Zap,
  ArrowRight,
  TrendingUp,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/services/api";

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

interface PopularCategory extends Category {
  icon: any;
  supplierCount: number;
  image: string;
  color: string;
  bgColor: string;
  trending?: boolean;
  growth?: string;
}

const PopularCategories = () => {
  const navigate = useNavigate();

  // Récupérer les vraies catégories depuis l'API
  const { data: apiCategories = [], isLoading } = useQuery({
    queryKey: ['popular-categories'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/categories');
        console.log('🔍 Réponse API reçue:', response);
        
        // Typage sécurisé de la réponse
        let allCategories: Category[] = [];
        if (response && typeof response === 'object') {
          const responseData = response as any;
          allCategories = responseData.categories || responseData.data || responseData || [];
          console.log('📋 Catégories extraites:', allCategories.length);
        }

        // Vérifier que nous avons un tableau
        if (!Array.isArray(allCategories)) {
          console.warn('❌ Réponse API inattendue:', response);
          return [];
        }

        // Organiser en hiérarchie et prendre les principales
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

        return rootCategories.sort((a, b) => a.ordre - b.ordre);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Données mock pour fallback
  const mockCategories: PopularCategory[] = [
    {
      id: 1,
      nom: "Électronique",
      slug: "electronique",
      description: "Smartphones, ordinateurs, équipements tech",
      ordre: 1,
      icon: Smartphone,
      productCount: 1250,
      supplierCount: 45,
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trending: true,
      growth: "+15%"
    },
    {
      id: 2,
      nom: "Vêtements",
      slug: "vetements",
      description: "Mode professionnelle, uniformes, textiles",
      ordre: 2,
      icon: Shirt,
      productCount: 890,
      supplierCount: 32,
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      growth: "+8%"
    },
    {
      id: 3,
      nom: "Maison & Jardin",
      slug: "maison-jardin",
      description: "Mobilier, décoration, équipements extérieurs",
      ordre: 3,
      icon: Home,
      productCount: 675,
      supplierCount: 28,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      color: "text-green-600",
      bgColor: "bg-green-50",
      trending: true,
      growth: "+12%"
    },
    {
      id: 4,
      nom: "Fournitures Industrielles",
      slug: "fournitures-industrielles",
      description: "Outils, machines, équipements professionnels",
      ordre: 4,
      icon: Wrench,
      productCount: 1100,
      supplierCount: 38,
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      growth: "+20%"
    },
    {
      id: 5,
      nom: "Automobile",
      slug: "automobile",
      description: "Pièces détachées, accessoires, équipements",
      ordre: 5,
      icon: Car,
      productCount: 520,
      supplierCount: 22,
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop",
      color: "text-red-600",
      bgColor: "bg-red-50",
      growth: "+5%"
    },
    {
      id: 6,
      nom: "Alimentation",
      slug: "alimentation",
      description: "Produits alimentaires, boissons, équipements",
      ordre: 6,
      icon: Utensils,
      productCount: 780,
      supplierCount: 35,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      trending: true,
      growth: "+18%"
    },
    {
      id: 7,
      nom: "Bureau & Papeterie",
      slug: "bureau-papeterie",
      description: "Fournitures de bureau, mobilier professionnel",
      ordre: 7,
      icon: Briefcase,
      productCount: 450,
      supplierCount: 18,
      image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=300&fit=crop",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      growth: "+7%"
    },
    {
      id: 8,
      nom: "Énergie & Électricité",
      slug: "energie-electricite",
      description: "Équipements électriques, solutions énergétiques",
      ordre: 8,
      icon: Zap,
      productCount: 320,
      supplierCount: 15,
      image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      growth: "+25%"
    }
  ];

  // Mapping des icônes et styles pour les catégories
  const getCategoryStyle = (categoryName: string, index: number) => {
    const styles = [
      { icon: Smartphone, color: "text-blue-600", bgColor: "bg-blue-50", image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop" },
      { icon: Shirt, color: "text-purple-600", bgColor: "bg-purple-50", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop" },
      { icon: Home, color: "text-green-600", bgColor: "bg-green-50", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop" },
      { icon: Wrench, color: "text-orange-600", bgColor: "bg-orange-50", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop" },
      { icon: Car, color: "text-red-600", bgColor: "bg-red-50", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=300&fit=crop" },
      { icon: Utensils, color: "text-yellow-600", bgColor: "bg-yellow-50", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop" },
      { icon: Briefcase, color: "text-indigo-600", bgColor: "bg-indigo-50", image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=300&fit=crop" },
      { icon: Zap, color: "text-cyan-600", bgColor: "bg-cyan-50", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=300&fit=crop" }
    ];

    // Essayer de matcher par nom de catégorie
    if (categoryName.toLowerCase().includes('électron') || categoryName.toLowerCase().includes('tech')) {
      return styles[0];
    } else if (categoryName.toLowerCase().includes('vêt') || categoryName.toLowerCase().includes('textile')) {
      return styles[1];
    } else if (categoryName.toLowerCase().includes('maison') || categoryName.toLowerCase().includes('jardin')) {
      return styles[2];
    } else if (categoryName.toLowerCase().includes('outil') || categoryName.toLowerCase().includes('industri')) {
      return styles[3];
    } else if (categoryName.toLowerCase().includes('auto') || categoryName.toLowerCase().includes('véhicule')) {
      return styles[4];
    } else if (categoryName.toLowerCase().includes('aliment') || categoryName.toLowerCase().includes('boisson')) {
      return styles[5];
    } else if (categoryName.toLowerCase().includes('bureau') || categoryName.toLowerCase().includes('papeterie')) {
      return styles[6];
    } else {
      return styles[index % styles.length];
    }
  };

  // Utiliser useMemo pour éviter les re-rendus infinis
  const displayCategories = useMemo(() => {
    if (apiCategories.length > 0) {
      // Transformer les vraies catégories en format d'affichage
      return apiCategories.slice(0, 8).map((category, index) => {
        const style = getCategoryStyle(category.nom, index);
        // Utiliser des valeurs fixes basées sur l'index pour éviter les re-rendus
        const baseProductCount = (index + 1) * 150;
        const baseSupplierCount = (index + 1) * 8;
        const baseGrowth = 5 + (index * 2);
        
        return {
          ...category,
          icon: style.icon,
          productCount: category.productCount || baseProductCount,
          supplierCount: baseSupplierCount,
          image: style.image,
          color: style.color,
          bgColor: style.bgColor,
          trending: index < 3,
          growth: `+${baseGrowth}%`
        };
      });
    } else {
      // Fallback vers les données mock si l'API échoue
      return mockCategories;
    }
  }, [apiCategories]);

  const handleCategoryClick = (category: PopularCategory) => {
    // Utiliser le slug pour la navigation
    if (category.children && category.children.length > 0) {
      navigate(`/categories/${category.slug}`);
    } else {
      navigate(`/products?category=${category.slug}`);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Catégories Populaires
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explorez nos catégories les plus demandées par les professionnels gabonais
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Chargement des catégories...</span>
          </div>
        )}

        {/* Categories Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {displayCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card
                  key={category.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden"
                  onClick={() => handleCategoryClick(category)}
                >
                  <div className="relative">
                    {/* Background Image */}
                    <div className="h-32 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.nom}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    </div>

                    {/* Trending Badge */}
                    {category.trending && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-red-500 text-white font-bold px-2 py-1 text-xs animate-pulse">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Tendance
                        </Badge>
                      </div>
                    )}


                  </div>

                  <CardContent className="p-4">
                    {/* Category Name */}
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {category.nom}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {category.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{(category.productCount || 0).toLocaleString()} produits</span>
                      <span>{category.supplierCount} fournisseurs</span>
                    </div>

                    {/* Growth */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {category.growth}
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}



        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={() => navigate('/categories')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            Voir toutes les catégories
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;