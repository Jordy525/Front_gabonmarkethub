import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, User, Eye, ArrowRight, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';

interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  category: string;
  image: string;
  views: number;
  readTime: number;
  featured: boolean;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  articleCount: number;
}

const Blog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Récupérer les articles de blog
  const { data: articles = [], isLoading: articlesLoading } = useQuery({
    queryKey: ['blog-articles', searchTerm, selectedCategory],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedCategory) params.append('category', selectedCategory);
        
        const response = await apiClient.get(`/blog/recent?${params}`);
        return response.articles || response.data || [];
      } catch (error) {
        console.error('Erreur lors du chargement des articles:', error);
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
        const categoryNames = response.categories || response.data || [];
        
        // Transformer les noms de catégories en objets
        return categoryNames.map((name: string, index: number) => ({
          id: index + 1,
          name: name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          articleCount: Math.floor(Math.random() * 20) + 5 // Nombre d'articles simulé
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Articles mock pour le développement
  const mockArticles: BlogArticle[] = [
    {
      id: 1,
      title: "Guide Complet du Commerce B2B au Gabon",
      slug: "guide-commerce-b2b-gabon",
      excerpt: "Découvrez les meilleures pratiques pour réussir dans le commerce B2B au Gabon. Conseils d'experts et stratégies éprouvées.",
      content: "Contenu complet de l'article...",
      author: "Équipe Gabon Market Hub",
      publishedAt: "2025-09-15",
      category: "Conseils",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
      views: 1250,
      readTime: 8,
      featured: true
    },
    {
      id: 2,
      title: "Comment Choisir le Bon Fournisseur B2B",
      slug: "choisir-fournisseur-b2b",
      excerpt: "Les critères essentiels pour sélectionner des fournisseurs fiables et performants pour votre entreprise.",
      content: "Contenu complet de l'article...",
      author: "Marie Nguema",
      publishedAt: "2025-09-14",
      category: "Conseils",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
      views: 890,
      readTime: 6,
      featured: false
    },
    {
      id: 3,
      title: "Tendances du E-commerce en Afrique Centrale",
      slug: "tendances-ecommerce-afrique-centrale",
      excerpt: "Analyse des dernières tendances du commerce électronique dans la région et opportunités pour les entreprises gabonaises.",
      content: "Contenu complet de l'article...",
      author: "Dr. Jean-Baptiste",
      publishedAt: "2025-09-13",
      category: "Actualités",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
      views: 2100,
      readTime: 10,
      featured: true
    }
  ];

  const mockCategories: BlogCategory[] = [
    { id: 1, name: "Conseils", slug: "conseils", articleCount: 15 },
    { id: 2, name: "Actualités", slug: "actualites", articleCount: 8 },
    { id: 3, name: "Tendances", slug: "tendances", articleCount: 12 },
    { id: 4, name: "Technologie", slug: "technologie", articleCount: 6 }
  ];

  const displayArticles = articles.length > 0 ? articles : mockArticles;
  const displayCategories = categories.length > 0 ? categories : mockCategories;

  const handleArticleClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Blog & Conseils
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Découvrez nos articles, guides et conseils pour réussir dans le commerce B2B au Gabon
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Rechercher</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Catégories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === '' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Toutes les catégories
                  </button>
                  {displayCategories.map((category, index) => (
                    <button
                      key={`category-${category.slug}-${index}`}
                      onClick={() => setSelectedCategory(category.slug)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors flex justify-between items-center ${
                        selectedCategory === category.slug 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {category.articleCount}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {articlesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Chargement des articles...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {displayArticles.map((article) => (
                    <Card 
                      key={article.id} 
                      className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                      onClick={() => handleArticleClick(article.slug)}
                    >
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Image */}
                          <div className="md:w-1/3 h-48 md:h-auto">
                            <img
                              src={article.image}
                              alt={article.title}
                              className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                            />
                          </div>
                          
                          {/* Content */}
                          <div className="md:w-2/3 p-6">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={article.featured ? "default" : "secondary"}>
                                {article.category}
                              </Badge>
                              {article.featured && (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                  À la une
                                </Badge>
                              )}
                            </div>
                            
                            <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {article.title}
                            </h2>
                            
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {article.excerpt}
                            </p>
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{article.author}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDate(article.publishedAt)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  <span>{article.views} vues</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>{article.readTime} min de lecture</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {displayArticles.length === 0 && (
                    <div className="text-center py-12">
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Aucun article trouvé
                      </h3>
                      <p className="text-gray-500">
                        Essayez de modifier vos critères de recherche
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
