import React from 'react';
import { MessageCircle, Building2, Users, ArrowRight, Home, Package, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const MessagingHeroSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200/50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Titre et description */}
          <div className="flex-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                <span className="hidden sm:inline">Centre de Messagerie</span>
                <span className="sm:hidden">Messages</span>
              </h1>
            </div>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl px-2 sm:px-0">
              <span className="hidden sm:inline">Connectez-vous directement avec les fournisseurs et développez vos partenariats commerciaux entre l'Italie et le Gabon</span>
              <span className="sm:hidden">Connectez-vous avec les fournisseurs</span>
            </p>
          </div>

          {/* Navigation rapide */}
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-1 sm:gap-2 hover:bg-blue-50 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Home className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Accueil</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/products'}
              className="flex items-center gap-1 sm:gap-2 hover:bg-green-50 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Produits</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/suppliers'}
              className="flex items-center gap-1 sm:gap-2 hover:bg-purple-50 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Fournisseurs</span>
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="mt-4 sm:mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto lg:mx-0">
          <div className="text-center">
            <div className="text-base sm:text-lg font-semibold text-blue-600">150+</div>
            <div className="text-xs text-gray-500">Fournisseurs</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-semibold text-green-600">500+</div>
            <div className="text-xs text-gray-500">Produits</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-semibold text-purple-600">50+</div>
            <div className="text-xs text-gray-500">Catégories</div>
          </div>
          <div className="text-center">
            <div className="text-base sm:text-lg font-semibold text-orange-600">1M+</div>
            <div className="text-xs text-gray-500">€ d'échanges</div>
          </div>
        </div>
      </div>
    </div>
  );
};
