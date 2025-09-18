import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import SuppliersSection from "@/components/home/SuppliersSection";
import { ImprovedSpecialOffers } from "@/components/home/ImprovedSpecialOffers";
import { ImprovedCommercialEvents } from "@/components/home/ImprovedCommercialEvents";
import PopularCategories from "@/components/home/PopularCategories";
import TrendingProducts from "@/components/home/TrendingProducts";
import NewsletterSection from "@/components/home/NewsletterSection";
import { ImprovedPopularProducts } from "@/components/home/ImprovedPopularProducts";
import CompanyInfo from "@/components/home/CompanyInfo";
import { ImprovedBlogSection } from "@/components/home/ImprovedBlogSection";
import FeaturedCategories from "@/components/home/FeaturedCategories";

const Index = () => {
  return (
    <ResponsiveLayout>
      <HeroSection />
      <PopularCategories />
      
      {/* Section Produits Populaires améliorée */}
      <ImprovedPopularProducts 
        title="Produits Populaires"
        subtitle="Découvrez les produits les plus appréciés par notre communauté B2B"
        maxProducts={8}
        showByCategory={true}
      />
      
      <FeaturedCategories 
        title="Explorez nos catégories"
        subtitle="Découvrez notre gamme complète de produits organisés par secteurs d'activité"
        maxCategories={6}
        showViewAll={true}
      />
      
      {/* Section Offres Spéciales améliorée */}
      <ImprovedSpecialOffers 
        title="Offres du Moment"
        subtitle="Découvrez nos meilleures promotions limitées dans le temps"
        maxOffers={6}
        showCountdown={true}
      />
      
      <TrendingProducts />
      
      {/* Section Événements Commerciaux améliorée */}
      <ImprovedCommercialEvents 
        title="Événements Commerciaux"
        subtitle="Découvrez les événements qui façonnent l'avenir du commerce au Gabon"
        maxEvents={4}
        showUpcoming={true}
      />
      
      <SuppliersSection />
      <CompanyInfo />
      
      {/* Section Blog améliorée */}
      <ImprovedBlogSection 
        title="Blog & Conseils"
        subtitle="Découvrez nos articles, guides et conseils pour réussir dans le commerce B2B"
        maxArticles={6}
        showFeatured={true}
      />
      
      <NewsletterSection />
    </ResponsiveLayout>
  );
};

export default Index;
