import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Clock, ArrowRight, Star, Gift, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CommercialEvent {
  id: number;
  title: string;
  description: string;
  type: 'salon' | 'conference' | 'webinar' | 'promotion' | 'lancement';
  date: string;
  endDate?: string;
  location: string;
  isOnline: boolean;
  participants: number;
  maxParticipants?: number;
  image: string;
  organizer: string;
  price: number;
  isFree: boolean;
  isPopular?: boolean;
  tags: string[];
}

const CommercialEvents = () => {
  const [events, setEvents] = useState<CommercialEvent[]>([]);

  const mockEvents: CommercialEvent[] = [
    {
      id: 1,
      title: "Salon du Commerce B2B Gabon 2024",
      description: "Le plus grand événement commercial du Gabon réunissant fournisseurs et acheteurs professionnels",
      type: 'salon',
      date: "2024-03-15T09:00:00",
      endDate: "2024-03-17T18:00:00",
      location: "Centre de Conférences de Libreville",
      isOnline: false,
      participants: 1250,
      maxParticipants: 2000,
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop",
      organizer: "GabMarketHub",
      price: 25000,
      isFree: false,
      isPopular: true,
      tags: ["B2B", "Networking", "Commerce"]
    },
    {
      id: 2,
      title: "Webinaire : E-commerce et Digitalisation",
      description: "Découvrez les meilleures stratégies pour digitaliser votre entreprise et développer vos ventes en ligne",
      type: 'webinar',
      date: "2024-02-20T14:00:00",
      location: "En ligne",
      isOnline: true,
      participants: 450,
      maxParticipants: 500,
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop",
      organizer: "Digital Gabon",
      price: 0,
      isFree: true,
      tags: ["Digital", "E-commerce", "Formation"]
    },
    {
      id: 3,
      title: "Lancement : Nouvelle Plateforme Logistique",
      description: "Présentation de notre nouvelle solution logistique pour optimiser vos livraisons au Gabon",
      type: 'lancement',
      date: "2024-02-28T10:00:00",
      location: "Hôtel Hilton Libreville",
      isOnline: false,
      participants: 180,
      maxParticipants: 200,
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&h=300&fit=crop",
      organizer: "LogiGab",
      price: 15000,
      isFree: false,
      tags: ["Logistique", "Innovation", "Transport"]
    },
    {
      id: 4,
      title: "Conférence : Financement des PME",
      description: "Solutions de financement et opportunités d'investissement pour les petites et moyennes entreprises",
      type: 'conference',
      date: "2024-03-05T09:30:00",
      location: "Chambre de Commerce de Libreville",
      isOnline: false,
      participants: 320,
      maxParticipants: 400,
      image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=300&fit=crop",
      organizer: "Chambre de Commerce",
      price: 0,
      isFree: true,
      isPopular: true,
      tags: ["Finance", "PME", "Investissement"]
    }
  ];

  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  const getEventTypeInfo = (type: string) => {
    switch (type) {
      case 'salon':
        return { color: 'bg-blue-100 text-blue-800', icon: Users, label: 'Salon' };
      case 'conference':
        return { color: 'bg-green-100 text-green-800', icon: Megaphone, label: 'Conférence' };
      case 'webinar':
        return { color: 'bg-purple-100 text-purple-800', icon: Calendar, label: 'Webinaire' };
      case 'promotion':
        return { color: 'bg-red-100 text-red-800', icon: Gift, label: 'Promotion' };
      case 'lancement':
        return { color: 'bg-orange-100 text-orange-800', icon: Star, label: 'Lancement' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Calendar, label: 'Événement' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Événements Commerciaux
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Participez aux événements business incontournables du Gabon et développez votre réseau professionnel
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {events.map((event) => {
            const typeInfo = getEventTypeInfo(event.type);
            const TypeIcon = typeInfo.icon;
            
            return (
              <Card key={event.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-lg">
                <div className="relative">
                  {/* Image */}
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <Badge className={typeInfo.color}>
                      <TypeIcon className="w-3 h-3 mr-1" />
                      {typeInfo.label}
                    </Badge>
                    {event.isPopular && (
                      <Badge className="bg-red-500 text-white animate-pulse">
                        <Star className="w-3 h-3 mr-1" />
                        Populaire
                      </Badge>
                    )}
                    {event.isFree && (
                      <Badge className="bg-green-500 text-white">
                        Gratuit
                      </Badge>
                    )}
                  </div>

                  {/* Date */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {new Date(event.date).getDate()}
                    </div>
                    <div className="text-xs text-gray-600 uppercase">
                      {new Date(event.date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Title */}
                  <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {event.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      {formatDate(event.date)} à {formatTime(event.date)}
                      {event.endDate && ` - ${formatDate(event.endDate)}`}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-red-500" />
                      {event.location}
                      {event.isOnline && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          En ligne
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-green-500" />
                      {event.participants.toLocaleString()} participants
                      {event.maxParticipants && (
                        <span className="text-gray-400">
                          /{event.maxParticipants.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      par <span className="font-medium">{event.organizer}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {!event.isFree && (
                        <span className="font-bold text-lg text-gray-900">
                          {event.price.toLocaleString()} FCFA
                        </span>
                      )}
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        S'inscrire
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
            Voir tous les événements
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CommercialEvents;