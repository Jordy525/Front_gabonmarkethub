import React, { useState, useEffect } from 'react';
import { Clock, Star, ArrowRight, Zap, Gift, Percent, Timer, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { getImageUrl } from '@/config/constants';
import { cn } from '@/lib/utils';

interface SpecialOffer {
  id: number;
  nom: string;
  description: string;
  prix_unitaire: number;
  prix_promo: number;
  pourcentage_reduction: number;
  image_principale: string;
  date_fin_promo: string;
  categorie_nom: string;
  fournisseur_nom: string;
  type_offre: 'reduction' | 'flash_sale' | 'bundle' | 'clearance';
  quantite_offre?: number;
  stock_disponible: number;
  note_moyenne: number;
  nombre_avis: number;
  vues_30j: number;
  ventes_30j: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface ImprovedSpecialOffersProps {
  maxOffers?: number;
  showCountdown?: boolean;
  title?: string;
  subtitle?: string;
}

export const ImprovedSpecialOffers: React.FC<ImprovedSpecialOffersProps> = ({
  maxOffers = 6,
  showCountdown = true,
  title = "Offres du Moment",
  subtitle = "Découvrez nos meilleures promotions limitées dans le temps"
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: TimeLeft }>({});
  const [currentSlide, setCurrentSlide] = useState(0);

  // Récupérer les offres spéciales
  const { data: specialOffers = [], isLoading } = useQuery({
    queryKey: ['special-offers'],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          limit: maxOffers.toString(),
          sort: 'created_at_desc'
        });
        
        const response = await apiClient.get(`/products/public?${params}`);
        // Filtrer les produits qui ont des offres spéciales (prix réduit)
        const products = response.products || response.data || response || [];
        return products.filter((product: any) => 
          product.prix_reduit && 
          product.prix_reduit < product.prix && 
          new Date(product.date_fin_offre || product.created_at) > new Date()
        );
      } catch (error) {
        console.error('Erreur lors du chargement des offres spéciales:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for countdown
  });

  // Calculer le temps restant pour chaque offre
  useEffect(() => {
    const calculateTimeLeft = (endDate: string): TimeLeft => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const updateCountdowns = () => {
      const newTimeLeft: { [key: number]: TimeLeft } = {};
      specialOffers.forEach((offer: SpecialOffer) => {
        newTimeLeft[offer.id] = calculateTimeLeft(offer.date_fin_promo);
      });
      setTimeLeft(newTimeLeft);
    };

    if (specialOffers.length > 0) {
      updateCountdowns();
      const interval = setInterval(updateCountdowns, 1000);
      return () => clearInterval(interval);
    }
  }, [specialOffers.length]); // Seulement la longueur change, pas l'objet entier

  // Grouper les offres par type
  const groupedOffers = React.useMemo(() => {
    const groups: { [key: string]: SpecialOffer[] } = {
      flash_sale: [],
      reduction: [],
      bundle: [],
      clearance: []
    };

    specialOffers.forEach((offer: SpecialOffer) => {
      if (groups[offer.type_offre]) {
        groups[offer.type_offre].push(offer);
      }
    });

    return groups;
  }, [specialOffers]);

  // Calculer le nombre de slides pour le carousel
  const offersPerSlide = 3;
  const totalSlides = Math.ceil(specialOffers.length / offersPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getOfferTypeInfo = (type: string) => {
    switch (type) {
      case 'flash_sale':
        return { 
          label: 'Flash Sale', 
          icon: <Zap className="w-4 h-4" />, 
          color: 'bg-red-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700'
        };
      case 'bundle':
        return { 
          label: 'Pack', 
          icon: <Gift className="w-4 h-4" />, 
          color: 'bg-purple-500',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700'
        };
      case 'clearance':
        return { 
          label: 'Liquidation', 
          icon: <AlertCircle className="w-4 h-4" />, 
          color: 'bg-orange-500',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700'
        };
      default:
        return { 
          label: 'Réduction', 
          icon: <Percent className="w-4 h-4" />, 
          color: 'bg-green-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700'
        };
    }
  };

  const isOfferExpired = (endDate: string) => {
    return new Date(endDate).getTime() <= new Date().getTime();
  };

  const getUrgencyLevel = (timeLeft: TimeLeft) => {
    const totalHours = timeLeft.days * 24 + timeLeft.hours;
    if (totalHours <= 2) return 'critical';
    if (totalHours <= 24) return 'high';
    if (totalHours <= 72) return 'medium';
    return 'low';
  };

  if (isLoading) {
    return (
      <div className="py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des offres spéciales...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-red-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Statistiques des offres */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {specialOffers.length}
                </div>
                <div className="text-sm text-gray-600">Offres actives</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.max(...specialOffers.map((o: SpecialOffer) => o.pourcentage_reduction))}%
                </div>
                <div className="text-sm text-gray-600">Plus forte réduction</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {specialOffers.filter((o: SpecialOffer) => o.type_offre === 'flash_sale').length}
                </div>
                <div className="text-sm text-gray-600">Flash Sales</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {specialOffers.reduce((sum: number, o: SpecialOffer) => sum + o.ventes_30j, 0)}
                </div>
                <div className="text-sm text-gray-600">Ventes (30j)</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Affichage des offres */}
        {specialOffers.length > 0 ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {specialOffers
                        .slice(slideIndex * offersPerSlide, (slideIndex + 1) * offersPerSlide)
                        .map((offer: SpecialOffer) => (
                          <OfferCard key={offer.id} offer={offer} />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contrôles du carousel */}
            {totalSlides > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg"
                  onClick={prevSlide}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg"
                  onClick={nextSlide}
                >
                  →
                </Button>
              </>
            )}

            {/* Indicateurs */}
            {totalSlides > 1 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      index === currentSlide ? "bg-red-600" : "bg-gray-300"
                    )}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune offre spéciale pour le moment
            </h3>
            <p className="text-gray-600">
              Revenez bientôt pour découvrir nos prochaines promotions !
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            onClick={() => navigate('/products?offers=true')}
            className="bg-red-600 hover:bg-red-700"
          >
            Voir toutes les offres
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );

  // Composant OfferCard
  function OfferCard({ offer }: { offer: SpecialOffer }) {
    const offerTypeInfo = getOfferTypeInfo(offer.type_offre);
    const currentTimeLeft = timeLeft[offer.id];
    const urgencyLevel = currentTimeLeft ? getUrgencyLevel(currentTimeLeft) : 'low';
    const isExpired = isOfferExpired(offer.date_fin_promo);

    return (
      <Card className={cn(
        "group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden",
        isExpired ? "opacity-60" : "",
        urgencyLevel === 'critical' ? "ring-2 ring-red-500" : ""
      )}>
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            {offer.image_principale ? (
              <img
                src={getImageUrl(offer.image_principale)}
                alt={offer.nom}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gift className="w-16 h-16 text-gray-400" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <Badge className={cn("text-xs flex items-center gap-1", offerTypeInfo.color)}>
                {offerTypeInfo.icon}
                {offerTypeInfo.label}
              </Badge>
              <Badge variant="destructive" className="text-xs font-bold">
                -{offer.pourcentage_reduction}%
              </Badge>
            </div>

            {/* Urgence */}
            {urgencyLevel === 'critical' && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="text-xs animate-pulse">
                  URGENT
                </Badge>
              </div>
            )}

            {/* Overlay pour les offres expirées */}
            {isExpired && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Badge variant="secondary" className="text-lg">
                  Offre expirée
                </Badge>
              </div>
            )}
          </div>

          {/* Contenu */}
          <div className="p-4">
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {offer.nom}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{offer.fournisseur_nom}</p>
            </div>

            {/* Prix */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(offer.prix_promo)}
                </span>
                <span className="text-sm text-gray-500 line-through ml-2">
                  {formatPrice(offer.prix_unitaire)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-red-600">
                  Économisez {formatPrice(offer.prix_unitaire - offer.prix_promo)}
                </div>
              </div>
            </div>

            {/* Countdown */}
            {showCountdown && currentTimeLeft && !isExpired && (
              <div className={cn(
                "p-3 rounded-lg mb-3 text-center",
                urgencyLevel === 'critical' ? "bg-red-100" :
                urgencyLevel === 'high' ? "bg-orange-100" :
                urgencyLevel === 'medium' ? "bg-yellow-100" : "bg-green-100"
              )}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Timer className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {urgencyLevel === 'critical' ? 'Dernière chance !' :
                     urgencyLevel === 'high' ? 'Bientôt terminé' :
                     urgencyLevel === 'medium' ? 'Temps limité' : 'Offre limitée'}
                  </span>
                </div>
                <div className="flex justify-center gap-2 text-sm">
                  {currentTimeLeft.days > 0 && (
                    <div className="text-center">
                      <div className="font-bold">{currentTimeLeft.days}</div>
                      <div className="text-xs">j</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="font-bold">{currentTimeLeft.hours}</div>
                    <div className="text-xs">h</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{currentTimeLeft.minutes}</div>
                    <div className="text-xs">m</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">{currentTimeLeft.seconds}</div>
                    <div className="text-xs">s</div>
                  </div>
                </div>
              </div>
            )}

            {/* Stock limité */}
            {offer.quantite_offre && offer.quantite_offre <= 10 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-600 font-medium">Stock limité</span>
                  <span className="text-gray-600">{offer.quantite_offre} restants</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(offer.quantite_offre / 10) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Note */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < Math.floor(offer.note_moyenne)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({offer.nombre_avis}) • {offer.vues_30j} vues
              </span>
            </div>

            {/* Action */}
            <Button 
              className={cn(
                "w-full",
                isExpired ? "opacity-50 cursor-not-allowed" : ""
              )}
              disabled={isExpired}
              onClick={() => !isExpired && navigate(`/products/${offer.id}`)}
            >
              {isExpired ? 'Offre expirée' : 'Voir l\'offre'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
};
