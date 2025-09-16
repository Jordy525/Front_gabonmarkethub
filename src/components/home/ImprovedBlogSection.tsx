import React, { useState } from 'react';
import { BookOpen, Clock, User, Eye, Heart, Share2, ArrowRight, TrendingUp, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { getImageUrl } from '@/config/constants';
import { cn } from '@/lib/utils';

// Fonction pour obtenir une image par défaut selon la catégorie
const getDefaultBlogImage = (category: string) => {
  const defaultImages: { [key: string]: string } = {
    'Conseils': 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop',
    'Tendances': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    'Actualités': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop',
    'Technologie': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
    'Business': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
    'Marketing': 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop',
    'Finance': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop',
    'Développement': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop'
  };
  
  return defaultImages[category] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop';
};

interface BlogArticle {
  id: number;
  titre: string;
  slug: string;
  extrait: string;
  image_principale: string;
  auteur_nom: string;
  categorie: string;
  tags: string[];
  est_a_la_une: boolean;
  date_publication: string;
  nombre_vues: number;
  nombre_likes: number;
  nombre_partages: number;
  temps_lecture_estime: number;
  produits_lies?: number[];
}

interface ImprovedBlogSectionProps {
  maxArticles?: number;
  showFeatured?: boolean;
  title?: string;
  subtitle?: string;
}

export const ImprovedBlogSection: React.FC<ImprovedBlogSectionProps> = ({
  maxArticles = 6,
  showFeatured = true,
  title = "Blog & Conseils",
  subtitle = "Découvrez nos articles, guides et conseils pour réussir dans le commerce B2B"
}) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'featured' | 'recent'>('featured');

  // Récupérer les articles à la une
  const { data: featuredArticles = [], isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['featured-articles'],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          limit: '2',
          featured: 'true',
          published: 'true'
        });
        
        const response = await apiClient.get(`/blog/featured?${params}`);
        return response.articles || response.data || response || [];
      } catch (error) {
        console.error('Erreur lors du chargement des articles à la une:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Récupérer les articles récents
  const { data: recentArticles = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ['recent-articles', selectedCategory],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          limit: maxArticles.toString(),
          category: selectedCategory !== 'all' ? selectedCategory : '',
          published: 'true',
          sort: 'date_desc'
        });
        
        const response = await apiClient.get(`/blog/recent?${params}`);
        return response.articles || response.data || response || [];
      } catch (error) {
        console.error('Erreur lors du chargement des articles récents:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Récupérer les catégories
  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/blog/categories');
        return response.categories || response.data || response || [];
      } catch (error) {
        return [];
      }
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Aujourd\'hui';
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffInDays / 30)} mois`;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Conseils': 'bg-blue-500',
      'Tendances': 'bg-purple-500',
      'Guide': 'bg-green-500',
      'Actualités': 'bg-orange-500',
      'Technologie': 'bg-indigo-500',
      'Marketing': 'bg-pink-500',
      'Finance': 'bg-yellow-500',
      'Ressources': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const isLoading = isLoadingFeatured || isLoadingRecent;

  if (isLoading) {
    return (
      <div className="py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des articles...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Contrôles */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'featured' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('featured')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                À la une
              </Button>
              <Button
                variant={viewMode === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('recent')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Récents
              </Button>
            </div>

            {viewMode === 'recent' && categories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  Toutes
                </Button>
                {categories.slice(0, 5).map((category: any) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {(featuredArticles?.length || 0) + (recentArticles?.length || 0)}
                </div>
                <div className="text-sm text-gray-600">Articles</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {categories?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Catégories</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {[...(featuredArticles || []), ...(recentArticles || [])].reduce((sum, a) => sum + (a.nombre_vues || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Vues totales</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {[...(featuredArticles || []), ...(recentArticles || [])].reduce((sum, a) => sum + (a.nombre_likes || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Likes</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Affichage des articles */}
        {viewMode === 'featured' ? (
          <div className="space-y-8">
            {/* Articles à la une */}
            {featuredArticles.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredArticles.map((article: BlogArticle) => (
                  <FeaturedArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun article à la une
                </h3>
                <p className="text-gray-600">
                  Revenez bientôt pour découvrir nos prochains articles !
                </p>
              </div>
            )}

            {/* Articles récents (aperçu) */}
            {recentArticles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Articles récents</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setViewMode('recent')}
                  >
                    Voir tout
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentArticles.slice(0, 3).map((article: BlogArticle) => (
                    <RecentArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article: BlogArticle) => (
              <RecentArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            onClick={() => navigate('/blog')}
            className="bg-green-600 hover:bg-green-700"
          >
            Voir tout le blog
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );

  // Composant FeaturedArticleCard
  function FeaturedArticleCard({ article }: { article: BlogArticle }) {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative h-64 bg-gray-100 overflow-hidden">
            <img
              src={article.image_principale ? getImageUrl(article.image_principale) : getDefaultBlogImage(article.categorie)}
              alt={article.titre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getDefaultBlogImage(article.categorie);
              }}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <Badge className={cn("text-xs", getCategoryColor(article.categorie))}>
                {article.categorie}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                À la une
              </Badge>
            </div>

            {/* Actions rapides */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <Button variant="secondary" size="sm">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="secondary" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                {article.titre}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {article.extrait}
              </p>
            </div>

            {/* Métadonnées */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {article.auteur_nom}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.temps_lecture_estime} min
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {article.nombre_vues}
              </div>
            </div>

            {/* Tags */}
            {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {article.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{article.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Date et action */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {getTimeAgo(article.date_publication)}
              </span>
              <Button 
                onClick={() => navigate(`/blog/${article.slug}`)}
                className="bg-green-600 hover:bg-green-700"
              >
                Lire l'article
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Composant RecentArticleCard
  function RecentArticleCard({ article }: { article: BlogArticle }) {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            <img
              src={article.image_principale ? getImageUrl(article.image_principale) : getDefaultBlogImage(article.categorie)}
              alt={article.titre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getDefaultBlogImage(article.categorie);
              }}
            />

            {/* Badge catégorie */}
            <div className="absolute top-2 left-2">
              <Badge className={cn("text-xs", getCategoryColor(article.categorie))}>
                {article.categorie}
              </Badge>
            </div>

            {/* Actions rapides */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <Button variant="secondary" size="sm" className="h-6 w-6 p-0">
                <Heart className="w-3 h-3" />
              </Button>
              <Button variant="secondary" size="sm" className="h-6 w-6 p-0">
                <Share2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Contenu */}
          <div className="p-4">
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {article.titre}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {article.extrait}
              </p>
            </div>

            {/* Métadonnées */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {article.auteur_nom}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.temps_lecture_estime} min
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.nombre_vues}
              </div>
            </div>

            {/* Date et action */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {getTimeAgo(article.date_publication)}
              </span>
              <Button 
                size="sm"
                onClick={() => navigate(`/blog/${article.slug}`)}
                className="bg-green-600 hover:bg-green-700"
              >
                Lire
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
};
