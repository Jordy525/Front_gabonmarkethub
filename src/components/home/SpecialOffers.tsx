import { useState, useEffect } from "react";
import { Clock, Star, ArrowRight, Zap, Gift, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/services/api";

interface SpecialOffer {
  id: number;
  title: string;
  description: string;
  discount: number;
  originalPrice: number;
  salePrice: number;
  image: string;
  endDate: string;
  category: string;
  supplier: string;
  isFlashSale?: boolean;
  isLimitedTime?: boolean;
}

const SpecialOffers = () => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});

  // Données d'exemple (à remplacer par des vraies données API)
  const mockOffers: SpecialOffer[] = [
    {
      id: 1,
      title: "Équipements Électroniques",
      description: "Smartphones, tablettes et accessoires professionnels",
      discount: 25,
      originalPrice: 150000,
      salePrice: 112500,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
      endDate: "2024-12-31T23:59:59",
      category: "Électronique",
      supplier: "TechGabon",
      isFlashSale: true
    },
    {
      id: 2,
      title: "Vêtements Professionnels",
      description: "Uniformes et tenues de travail de qualité",
      discount: 30,
      originalPrice: 45000,
      salePrice: 31500,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
      endDate: "2024-12-25T23:59:59",
      category: "Vêtements",
      supplier: "ModePro",
      isLimitedTime: true
    },
    {
      id: 3,
      title: "Fournitures de Bureau",
      description: "Pack complet pour équiper votre bureau",
      discount: 20,
      originalPrice: 75000,
      salePrice: 60000,
      image: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=300&fit=crop",
      endDate: "2024-12-30T23:59:59",
      category: "Bureau",
      supplier: "OfficeGab"
    }
  ];

  useEffect(() => {
    setOffers(mockOffers);
    
    // Calculer le temps restant pour chaque offre
    const calculateTimeLeft = () => {
      const newTimeLeft: { [key: number]: string } = {};
      
      mockOffers.forEach(offer => {
        const endTime = new Date(offer.endDate).getTime();
        const now = new Date().getTime();
        const difference = endTime - now;
        
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
          
          if (days > 0) {
            newTimeLeft[offer.id] = `${days}j ${hours}h`;
          } else if (hours > 0) {
            newTimeLeft[offer.id] = `${hours}h ${minutes}m`;
          } else {
            newTimeLeft[offer.id] = `${minutes}m`;
          }
        } else {
          newTimeLeft[offer.id] = "Expiré";
        }
      });
      
      setTimeLeft(newTimeLeft);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Mise à jour chaque minute

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-red-600" />
            <h2 className="text-3xl font-bold text-gray-900">Offres du Moment</h2>
            <Gift className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Profitez de nos offres exceptionnelles sur une sélection de produits professionnels
          </p>
        </div>

        {/* Offres Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <Card key={offer.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-lg">
              <div className="relative">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className="bg-red-600 text-white font-bold px-3 py-1">
                      <Percent className="w-3 h-3 mr-1" />
                      -{offer.discount}%
                    </Badge>
                    {offer.isFlashSale && (
                      <Badge className="bg-orange-500 text-white font-bold px-3 py-1 animate-pulse">
                        <Zap className="w-3 h-3 mr-1" />
                        Flash Sale
                      </Badge>
                    )}
                    {offer.isLimitedTime && (
                      <Badge className="bg-purple-600 text-white font-bold px-3 py-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Temps limité
                      </Badge>
                    )}
                  </div>

                  {/* Countdown */}
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {timeLeft[offer.id] || "Calcul..."}
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Category & Supplier */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {offer.category}
                    </Badge>
                    <span className="text-xs text-gray-500">par {offer.supplier}</span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {offer.description}
                  </p>

                  {/* Pricing */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-red-600">
                      {offer.salePrice.toLocaleString()} FCFA
                    </span>
                    <span className="text-lg text-gray-400 line-through">
                      {offer.originalPrice.toLocaleString()} FCFA
                    </span>
                  </div>

                  {/* Savings */}
                  <div className="bg-green-50 text-green-800 px-3 py-2 rounded-lg text-sm font-medium mb-4">
                    💰 Vous économisez {(offer.originalPrice - offer.salePrice).toLocaleString()} FCFA
                  </div>

                  {/* Action Button */}
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold group">
                    Voir l'offre
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline" 
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            onClick={() => window.location.href = '/products?category=promotions'}
          >
            Voir toutes les offres
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;