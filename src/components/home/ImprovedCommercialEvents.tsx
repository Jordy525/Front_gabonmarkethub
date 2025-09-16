import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, MapPin, Users, Clock, ArrowRight, Star, Gift, Megaphone, Video, Globe, Building2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { getImageUrl } from '@/config/constants';
import { cn } from '@/lib/utils';

interface CommercialEvent {
  id: number;
  titre: string;
  description: string;
  description_courte: string;
  type: 'salon' | 'conference' | 'webinar' | 'promotion' | 'lancement' | 'flash_sale' | 'partenariat';
  date_debut: string;
  date_fin?: string;
  lieu: string;
  est_en_ligne: boolean;
  lien_webinaire?: string;
  image_principale: string;
  organisateur_nom: string;
  prix_participation: number;
  est_gratuit: boolean;
  nombre_participants: number;
  nombre_max_participants?: number;
  est_populaire: boolean;
  tags: string[];
  produits_lies?: number[];
  statut: 'brouillon' | 'programme' | 'en_cours' | 'termine' | 'annule';
  participants_inscrits?: number;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface ImprovedCommercialEventsProps {
  maxEvents?: number;
  showUpcoming?: boolean;
  title?: string;
  subtitle?: string;
}

export const ImprovedCommercialEvents: React.FC<ImprovedCommercialEventsProps> = ({
  maxEvents = 4,
  showUpcoming = true,
  title = "Événements Commerciaux",
  subtitle = "Découvrez les événements qui façonnent l'avenir du commerce au Gabon"
}) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: TimeLeft }>({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('all');

  // Récupérer les événements commerciaux
  const { data: rawCommercialEvents = [], isLoading } = useQuery({
    queryKey: ['commercial-events', selectedType],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          limit: maxEvents.toString(),
          upcoming_only: showUpcoming.toString(),
          type: selectedType !== 'all' ? selectedType : '',
          status: 'programme,en_cours'
        });
        
        const response = await apiClient.get(`/events/commercial?${params}`);
        return response.events || response.data || response || [];
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mémoriser les événements pour éviter les re-rendus
  const commercialEvents = useMemo(() => rawCommercialEvents, [rawCommercialEvents]);

  // Calculer le temps restant pour chaque événement
  useEffect(() => {
    const calculateTimeLeft = (startDate: string): TimeLeft => {
      const now = new Date().getTime();
      const start = new Date(startDate).getTime();
      const difference = start - now;

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
      commercialEvents.forEach((event: CommercialEvent) => {
        newTimeLeft[event.id] = calculateTimeLeft(event.date_debut);
      });
      setTimeLeft(newTimeLeft);
    };

    if (commercialEvents.length > 0) {
      // Initialiser les countdowns une seule fois
      updateCountdowns();
      
      // Configurer l'intervalle
      const interval = setInterval(updateCountdowns, 1000);
      return () => clearInterval(interval);
    }
  }, [commercialEvents.length]); // Seulement la longueur change, pas l'objet entier

  // Grouper les événements par type
  const groupedEvents = React.useMemo(() => {
    const groups: { [key: string]: CommercialEvent[] } = {
      salon: [],
      conference: [],
      webinar: [],
      promotion: [],
      lancement: [],
      flash_sale: [],
      partenariat: []
    };

    commercialEvents.forEach((event: CommercialEvent) => {
      if (groups[event.type]) {
        groups[event.type].push(event);
      }
    });

    return groups;
  }, [commercialEvents]);

  // Calculer le nombre de slides pour le carousel
  const eventsPerSlide = 2;
  const totalSlides = Math.ceil(commercialEvents.length / eventsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getEventTypeInfo = (type: string) => {
    switch (type) {
      case 'salon':
        return { 
          label: 'Salon', 
          icon: <Building2 className="w-4 h-4" />, 
          color: 'bg-blue-500',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700'
        };
      case 'conference':
        return { 
          label: 'Conférence', 
          icon: <Megaphone className="w-4 h-4" />, 
          color: 'bg-purple-500',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700'
        };
      case 'webinar':
        return { 
          label: 'Webinaire', 
          icon: <Video className="w-4 h-4" />, 
          color: 'bg-green-500',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700'
        };
      case 'promotion':
        return { 
          label: 'Promotion', 
          icon: <Gift className="w-4 h-4" />, 
          color: 'bg-orange-500',
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700'
        };
      case 'lancement':
        return { 
          label: 'Lancement', 
          icon: <Zap className="w-4 h-4" />, 
          color: 'bg-yellow-500',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700'
        };
      case 'flash_sale':
        return { 
          label: 'Flash Sale', 
          icon: <Zap className="w-4 h-4" />, 
          color: 'bg-red-500',
          bgColor: 'bg-red-50',
          textColor: 'text-red-700'
        };
      case 'partenariat':
        return { 
          label: 'Partenariat', 
          icon: <Users className="w-4 h-4" />, 
          color: 'bg-indigo-500',
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-700'
        };
      default:
        return { 
          label: 'Événement', 
          icon: <Calendar className="w-4 h-4" />, 
          color: 'bg-gray-500',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700'
        };
    }
  };

  const getEventStatus = (event: CommercialEvent) => {
    const now = new Date();
    const startDate = new Date(event.date_debut);
    const endDate = event.date_fin ? new Date(event.date_fin) : null;

    if (event.statut === 'annule') return { label: 'Annulé', color: 'bg-red-500' };
    if (event.statut === 'termine') return { label: 'Terminé', color: 'bg-gray-500' };
    if (now >= startDate && (!endDate || now <= endDate)) return { label: 'En cours', color: 'bg-green-500' };
    if (now < startDate) return { label: 'À venir', color: 'bg-blue-500' };
    return { label: 'Programmé', color: 'bg-yellow-500' };
  };

  const getUrgencyLevel = (timeLeft: TimeLeft) => {
    const totalHours = timeLeft.days * 24 + timeLeft.hours;
    if (totalHours <= 24) return 'critical';
    if (totalHours <= 72) return 'high';
    if (totalHours <= 168) return 'medium';
    return 'low';
  };

  const eventTypes = [
    { value: 'all', label: 'Tous' },
    { value: 'salon', label: 'Salons' },
    { value: 'conference', label: 'Conférences' },
    { value: 'webinar', label: 'Webinaires' },
    { value: 'promotion', label: 'Promotions' },
    { value: 'lancement', label: 'Lancements' },
    { value: 'flash_sale', label: 'Flash Sales' },
    { value: 'partenariat', label: 'Partenariats' }
  ];

  if (isLoading) {
    return (
      <div className="py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des événements...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Filtres par type */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {eventTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type.value)}
              >
                {type.label}
              </Button>
            ))}
          </div>

          {/* Statistiques des événements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {commercialEvents.length}
                </div>
                <div className="text-sm text-gray-600">Événements</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {commercialEvents.filter(e => e.est_gratuit).length}
                </div>
                <div className="text-sm text-gray-600">Gratuits</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {commercialEvents.reduce((sum, e) => sum + (e.participants_inscrits || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Participants</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {commercialEvents.filter(e => e.est_en_ligne).length}
                </div>
                <div className="text-sm text-gray-600">En ligne</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Affichage des événements */}
        {commercialEvents.length > 0 ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                  <div key={slideIndex} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {commercialEvents
                        .slice(slideIndex * eventsPerSlide, (slideIndex + 1) * eventsPerSlide)
                        .map((event: CommercialEvent) => (
                          <EventCard key={event.id} event={event} />
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
                      index === currentSlide ? "bg-blue-600" : "bg-gray-300"
                    )}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun événement programmé
            </h3>
            <p className="text-gray-600">
              Revenez bientôt pour découvrir nos prochains événements !
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            onClick={() => navigate('/events')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Voir tous les événements
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );

  // Composant EventCard
  function EventCard({ event }: { event: CommercialEvent }) {
    const eventTypeInfo = getEventTypeInfo(event.type);
    const eventStatus = getEventStatus(event);
    const currentTimeLeft = timeLeft[event.id];
    const urgencyLevel = currentTimeLeft ? getUrgencyLevel(currentTimeLeft) : 'low';
    const isUpcoming = new Date(event.date_debut) > new Date();

    return (
      <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            {event.image_principale ? (
              <img
                src={getImageUrl(event.image_principale)}
                alt={event.titre}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="w-16 h-16 text-gray-400" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              <Badge className={cn("text-xs flex items-center gap-1", eventTypeInfo.color)}>
                {eventTypeInfo.icon}
                {eventTypeInfo.label}
              </Badge>
              <Badge className={cn("text-xs", eventStatus.color)}>
                {eventStatus.label}
              </Badge>
              {event.est_populaire && (
                <Badge variant="secondary" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Populaire
                </Badge>
              )}
            </div>

            {/* Urgence pour les événements à venir */}
            {isUpcoming && urgencyLevel === 'critical' && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="text-xs animate-pulse">
                  Bientôt !
                </Badge>
              </div>
            )}

            {/* Overlay pour les événements en ligne */}
            {event.est_en_ligne && (
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  En ligne
                </Badge>
              </div>
            )}
          </div>

          {/* Contenu */}
          <div className="p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {event.titre}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {event.description_courte}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                Organisé par <span className="font-medium">{event.organisateur_nom}</span>
              </p>
            </div>

            {/* Informations de l'événement */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(event.date_debut).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              {!event.est_en_ligne && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{event.lieu}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>
                  {event.participants_inscrits || 0} participants
                  {event.nombre_max_participants && ` / ${event.nombre_max_participants} max`}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">
                  {formatPrice(event.prix_participation)}
                </span>
              </div>
            </div>

            {/* Countdown pour les événements à venir */}
            {isUpcoming && currentTimeLeft && (
              <div className={cn(
                "p-3 rounded-lg mb-4 text-center",
                urgencyLevel === 'critical' ? "bg-red-100" :
                urgencyLevel === 'high' ? "bg-orange-100" :
                urgencyLevel === 'medium' ? "bg-yellow-100" : "bg-green-100"
              )}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {urgencyLevel === 'critical' ? 'Démarre bientôt !' :
                     urgencyLevel === 'high' ? 'Dans moins de 3 jours' :
                     urgencyLevel === 'medium' ? 'Dans moins d\'une semaine' : 'Événement à venir'}
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
                </div>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {event.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {event.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{event.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                Voir détails
              </Button>
              {event.est_en_ligne && event.lien_webinaire && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(event.lien_webinaire, '_blank')}
                >
                  <Video className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
};
