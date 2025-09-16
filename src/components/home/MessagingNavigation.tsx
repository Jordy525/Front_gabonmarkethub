import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageCircle, 
  Building2, 
  Users, 
  ArrowRight,
  Star
} from 'lucide-react';

export const MessagingNavigation: React.FC = () => {
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-2 border-primary/20 shadow-xl">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Centre de Messagerie
          </h3>
          <p className="text-gray-600">
            Connectez-vous directement avec les fournisseurs et développez vos partenariats
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all"
            onClick={() => window.location.href = '/messages'}
          >
            <Building2 className="h-6 w-6 text-blue-600" />
            <div className="text-center">
              <div className="font-semibold text-gray-900">Voir les fournisseurs</div>
              <div className="text-sm text-gray-500">Découvrir tous les partenaires</div>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-600" />
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300 transition-all"
            onClick={() => window.location.href = '/messages?tab=conversations'}
          >
            <Users className="h-6 w-6 text-green-600" />
            <div className="text-center">
              <div className="font-semibold text-gray-900">Mes conversations</div>
              <div className="text-sm text-gray-500">Continuer les échanges</div>
            </div>
            <ArrowRight className="h-4 w-4 text-green-600" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>Accès direct depuis la page d'accueil</span>
        </div>
      </CardContent>
    </Card>
  );
};
