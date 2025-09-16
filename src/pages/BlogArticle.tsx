import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Eye, ArrowLeft, Share2, BookOpen } from 'lucide-react';
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
  tags: string[];
}

const BlogArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Récupérer l'article de blog
  const { data: article, isLoading } = useQuery({
    queryKey: ['blog-article', slug],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/blog/article/${slug}`);
        return response.article || response.data;
      } catch (error) {
        console.error('Erreur lors du chargement de l\'article:', error);
        return null;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Articles mock pour le développement
  const mockArticles: { [key: string]: BlogArticle } = {
    'guide-commerce-b2b-gabon': {
      id: 1,
      title: "Guide Complet du Commerce B2B au Gabon",
      slug: "guide-commerce-b2b-gabon",
      excerpt: "Découvrez les meilleures pratiques pour réussir dans le commerce B2B au Gabon. Conseils d'experts et stratégies éprouvées.",
      content: `
        <h2>Introduction au Commerce B2B au Gabon</h2>
        <p>Le commerce B2B au Gabon connaît une transformation digitale importante. Avec l'émergence de plateformes comme Gabon Market Hub, les entreprises gabonaises ont accès à de nouveaux outils pour développer leurs activités commerciales.</p>
        
        <h3>Les Défis du Commerce B2B</h3>
        <p>Les entreprises gabonaises font face à plusieurs défis :</p>
        <ul>
          <li>La digitalisation des processus commerciaux</li>
          <li>La recherche de partenaires fiables</li>
          <li>La gestion des chaînes d'approvisionnement</li>
          <li>L'adaptation aux nouvelles technologies</li>
        </ul>
        
        <h3>Stratégies de Succès</h3>
        <p>Pour réussir dans le commerce B2B au Gabon, il est essentiel de :</p>
        <ol>
          <li>Développer une présence digitale forte</li>
          <li>Construire des relations de confiance</li>
          <li>Adapter son offre aux besoins locaux</li>
          <li>Investir dans la formation des équipes</li>
        </ol>
        
        <h3>Conclusion</h3>
        <p>Le commerce B2B au Gabon offre de nombreuses opportunités pour les entreprises qui savent s'adapter aux nouvelles technologies et aux besoins du marché local.</p>
      `,
      author: "Équipe Gabon Market Hub",
      publishedAt: "2025-09-15",
      category: "Conseils",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop",
      views: 1250,
      readTime: 8,
      featured: true,
      tags: ["B2B", "Commerce", "Gabon", "Stratégie"]
    },
    'choisir-fournisseur-b2b': {
      id: 2,
      title: "Comment Choisir le Bon Fournisseur B2B",
      slug: "choisir-fournisseur-b2b",
      excerpt: "Les critères essentiels pour sélectionner des fournisseurs fiables et performants pour votre entreprise.",
      content: `
        <h2>L'Importance du Choix du Fournisseur</h2>
        <p>Choisir le bon fournisseur B2B est crucial pour la réussite de votre entreprise. Un mauvais choix peut impacter votre réputation, vos coûts et la satisfaction de vos clients.</p>
        
        <h3>Critères de Sélection</h3>
        <p>Voici les critères essentiels à considérer :</p>
        <ul>
          <li><strong>Fiabilité :</strong> Respect des délais et des engagements</li>
          <li><strong>Qualité :</strong> Conformité aux standards de qualité</li>
          <li><strong>Prix :</strong> Compétitivité et transparence tarifaire</li>
          <li><strong>Service :</strong> Support client et réactivité</li>
          <li><strong>Innovation :</strong> Capacité d'adaptation et d'évolution</li>
        </ul>
        
        <h3>Processus de Sélection</h3>
        <p>Un processus structuré vous aidera à faire le bon choix :</p>
        <ol>
          <li>Définir vos besoins précis</li>
          <li>Rechercher des fournisseurs qualifiés</li>
          <li>Évaluer les propositions</li>
          <li>Effectuer des tests pilotes</li>
          <li>Négocier les conditions</li>
        </ol>
      `,
      author: "Marie Nguema",
      publishedAt: "2025-09-14",
      category: "Conseils",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
      views: 890,
      readTime: 6,
      featured: false,
      tags: ["Fournisseur", "Sélection", "B2B", "Qualité"]
    },
    'tendances-ecommerce-afrique-centrale': {
      id: 3,
      title: "Tendances du E-commerce en Afrique Centrale",
      slug: "tendances-ecommerce-afrique-centrale",
      excerpt: "Analyse des dernières tendances du commerce électronique dans la région et opportunités pour les entreprises gabonaises.",
      content: `
        <h2>L'Évolution du E-commerce en Afrique Centrale</h2>
        <p>Le e-commerce connaît une croissance exponentielle en Afrique Centrale, porté par l'augmentation de la connectivité et l'adoption des technologies mobiles.</p>
        
        <h3>Tendances Clés</h3>
        <p>Plusieurs tendances marquent le paysage du e-commerce :</p>
        <ul>
          <li>L'essor du mobile commerce</li>
          <li>L'importance des paiements digitaux</li>
          <li>La personnalisation de l'expérience client</li>
          <li>L'intégration des réseaux sociaux</li>
        </ul>
        
        <h3>Opportunités pour le Gabon</h3>
        <p>Le Gabon dispose d'atouts uniques pour développer le e-commerce :</p>
        <ul>
          <li>Une population jeune et connectée</li>
          <li>Un environnement politique stable</li>
          <li>Des infrastructures en développement</li>
          <li>Un potentiel d'innovation important</li>
        </ul>
      `,
      author: "Dr. Jean-Baptiste",
      publishedAt: "2025-09-13",
      category: "Actualités",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
      views: 2100,
      readTime: 10,
      featured: true,
      tags: ["E-commerce", "Afrique", "Tendances", "Innovation"]
    }
  };

  const displayArticle = article || mockArticles[slug || ''];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayArticle?.title,
        text: displayArticle?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Ici vous pourriez afficher une notification de succès
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de l'article...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!displayArticle) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
            <p className="text-gray-600 mb-6">L'article que vous recherchez n'existe pas.</p>
            <Button onClick={() => navigate('/blog')}>
              Retour au blog
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/blog')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au blog
            </Button>
            
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{displayArticle.category}</Badge>
              {displayArticle.featured && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  À la une
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {displayArticle.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-6">
              {displayArticle.excerpt}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{displayArticle.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(displayArticle.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{displayArticle.views} vues</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{displayArticle.readTime} min de lecture</span>
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-0">
                {/* Featured Image */}
                <div className="h-64 md:h-96 overflow-hidden rounded-t-lg">
                  <img
                    src={displayArticle.image}
                    alt={displayArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Article Content */}
                <div className="p-8">
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: displayArticle.content }}
                  />
                  
                  {/* Tags */}
                  {displayArticle.tags && displayArticle.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {displayArticle.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogArticle;
