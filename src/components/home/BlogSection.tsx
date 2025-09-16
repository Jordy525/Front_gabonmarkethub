import { useState, useEffect } from "react";
import { Calendar, User, ArrowRight, BookOpen, TrendingUp, Lightbulb, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface BlogArticle {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  publishDate: string;
  readTime: number;
  category: string;
  tags: string[];
  views: number;
  featured?: boolean;
}

const BlogSection = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<BlogArticle[]>([]);

  const mockArticles: BlogArticle[] = [
    {
      id: 1,
      title: "Les tendances du commerce B2B au Gabon en 2024",
      excerpt: "Découvrez les principales évolutions du marché B2B gabonais et les opportunités à saisir pour développer votre entreprise.",
      content: "Article complet sur les tendances...",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
      author: "Marie Nzé",
      publishDate: "2024-01-15",
      readTime: 5,
      category: "Tendances",
      tags: ["B2B", "Gabon", "Économie", "2024"],
      views: 1250,
      featured: true
    },
    {
      id: 2,
      title: "Comment optimiser vos achats professionnels",
      excerpt: "Guide pratique pour réduire vos coûts d'approvisionnement et améliorer l'efficacité de vos processus d'achat.",
      content: "Guide détaillé sur l'optimisation...",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=300&fit=crop",
      author: "Jean-Paul Mbeng",
      publishDate: "2024-01-10",
      readTime: 7,
      category: "Conseils",
      tags: ["Achats", "Optimisation", "Coûts"],
      views: 890
    },
    {
      id: 3,
      title: "Digitalisation des PME : par où commencer ?",
      excerpt: "Les étapes clés pour réussir la transformation digitale de votre PME et tirer parti des nouvelles technologies.",
      content: "Guide de digitalisation...",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
      author: "Sylvie Ondo",
      publishDate: "2024-01-08",
      readTime: 6,
      category: "Digital",
      tags: ["PME", "Digital", "Transformation"],
      views: 1100,
      featured: true
    },
    {
      id: 4,
      title: "Négociation avec les fournisseurs : techniques gagnantes",
      excerpt: "Maîtrisez l'art de la négociation B2B pour obtenir les meilleurs prix et conditions auprès de vos fournisseurs.",
      content: "Techniques de négociation...",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=500&h=300&fit=crop",
      author: "Paul Ekomy",
      publishDate: "2024-01-05",
      readTime: 8,
      category: "Négociation",
      tags: ["Négociation", "Fournisseurs", "B2B"],
      views: 750
    },
    {
      id: 5,
      title: "L'importance de la logistique dans le commerce gabonais",
      excerpt: "Analyse des défis logistiques au Gabon et solutions pour optimiser vos chaînes d'approvisionnement.",
      content: "Analyse logistique...",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&h=300&fit=crop",
      author: "Christelle Mba",
      publishDate: "2024-01-03",
      readTime: 9,
      category: "Logistique",
      tags: ["Logistique", "Supply Chain", "Gabon"],
      views: 620
    },
    {
      id: 6,
      title: "Financement des entreprises : nouvelles opportunités",
      excerpt: "Tour d'horizon des solutions de financement disponibles pour les entreprises gabonaises en 2024.",
      content: "Solutions de financement...",
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=300&fit=crop",
      author: "Robert Nguema",
      publishDate: "2024-01-01",
      readTime: 6,
      category: "Finance",
      tags: ["Financement", "Entreprises", "Investissement"],
      views: 980
    }
  ];

  useEffect(() => {
    setArticles(mockArticles);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'Tendances':
        return { color: 'bg-blue-100 text-blue-800', icon: TrendingUp };
      case 'Conseils':
        return { color: 'bg-green-100 text-green-800', icon: Lightbulb };
      case 'Digital':
        return { color: 'bg-purple-100 text-purple-800', icon: Target };
      case 'Négociation':
        return { color: 'bg-orange-100 text-orange-800', icon: Target };
      case 'Logistique':
        return { color: 'bg-red-100 text-red-800', icon: Target };
      case 'Finance':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Target };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: BookOpen };
    }
  };

  const handleArticleClick = (articleId: number) => {
    navigate(`/blog/${articleId}`);
  };

  const featuredArticles = articles.filter(article => article.featured);
  const regularArticles = articles.filter(article => !article.featured);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900">Blog & Conseils</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Restez informé des dernières tendances du commerce B2B et découvrez nos conseils 
            d'experts pour développer votre entreprise au Gabon
          </p>
        </div>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              Articles à la une
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredArticles.map((article) => {
                const categoryInfo = getCategoryInfo(article.category);
                const CategoryIcon = categoryInfo.icon;
                
                return (
                  <Card 
                    key={article.id} 
                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-lg"
                    onClick={() => handleArticleClick(article.id)}
                  >
                    <div className="relative">
                      <div className="h-64 overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      
                      <div className="absolute top-4 left-4">
                        <Badge className={`${categoryInfo.color} font-medium`}>
                          <CategoryIcon className="w-3 h-3 mr-1" />
                          {article.category}
                        </Badge>
                      </div>

                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="text-sm font-medium text-gray-700">
                          {article.readTime} min
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(article.publishDate)}</span>
                          </div>
                        </div>
                        <span>{article.views.toLocaleString()} vues</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Button variant="ghost" className="w-full group/btn">
                        Lire l'article
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Articles */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-green-600" />
            Derniers articles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularArticles.map((article) => {
              const categoryInfo = getCategoryInfo(article.category);
              const CategoryIcon = categoryInfo.icon;
              
              return (
                <Card 
                  key={article.id} 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-md"
                  onClick={() => handleArticleClick(article.id)}
                >
                  <div className="relative">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="absolute top-4 left-4">
                      <Badge className={`${categoryInfo.color} font-medium text-xs`}>
                        <CategoryIcon className="w-3 h-3 mr-1" />
                        {article.category}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{article.author}</span>
                      <span>{article.readTime} min</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {formatDate(article.publishDate)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/blog')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            Voir tous les articles
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;