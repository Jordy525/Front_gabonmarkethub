import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { currencyService } from '@/services/currencyService';
import { RefreshCw, Globe, Flag, Euro, DollarSign } from 'lucide-react';

export const CurrencyDebugger: React.FC = () => {
  const { 
    currentCurrency, 
    currentCurrencyInfo, 
    getUserCountry, 
    forceUpdateRates,
    isLoading 
  } = useCurrency();
  
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshCurrencyDetection = async () => {
    setIsRefreshing(true);
    try {
      // Forcer la réinitialisation du service
      await currencyService.forceUpdateRates();
      
      // Récupérer les informations de débogage
      const info = {
        currentCurrency: currencyService.getCurrentCurrency(),
        userCountry: currencyService.getUserCountry(),
        browserLang: navigator.language || navigator.languages?.[0] || 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        userAgent: navigator.userAgent,
        localStorage: {
          userCurrency: localStorage.getItem('userCurrency'),
          userCountry: localStorage.getItem('userCountry'),
          exchangeRates: localStorage.getItem('exchangeRates'),
          exchangeRatesTimestamp: localStorage.getItem('exchangeRatesTimestamp')
        }
      };
      
      setDebugInfo(info);
      
      // Forcer le re-render
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const forceFCFA = () => {
    try {
      currencyService.setCurrency('XAF');
      localStorage.setItem('userCurrency', 'XAF');
      localStorage.setItem('userCountry', 'GA');
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors du forçage FCFA:', error);
    }
  };

  const forceEUR = () => {
    try {
      currencyService.setCurrency('EUR');
      localStorage.setItem('userCurrency', 'EUR');
      localStorage.setItem('userCountry', 'IT');
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors du forçage EUR:', error);
    }
  };

  const clearLocalStorage = () => {
    try {
      localStorage.removeItem('userCurrency');
      localStorage.removeItem('userCountry');
      localStorage.removeItem('exchangeRates');
      localStorage.removeItem('exchangeRatesTimestamp');
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Débogueur de Devise
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informations actuelles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {currentCurrencyInfo.flag}
            </div>
            <div className="text-lg font-semibold">{currentCurrency}</div>
            <div className="text-sm text-gray-600">{currentCurrencyInfo.name}</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {getUserCountry() || 'Non détecté'}
            </div>
            <div className="text-sm text-gray-600">Pays détecté</div>
          </div>
          
          <div className="text-center p-4 border rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {navigator.language || 'Non détecté'}
            </div>
            <div className="text-sm text-gray-600">Langue navigateur</div>
          </div>
        </div>

        {/* Actions de débogage */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={refreshCurrencyDetection}
            disabled={isRefreshing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir la détection'}
          </Button>
          
          <Button 
            onClick={forceFCFA}
            variant="outline"
            className="flex items-center gap-2 bg-green-50 border-green-200 hover:bg-green-100"
          >
            <Flag className="h-4 w-4" />
            Forcer FCFA (Gabon)
          </Button>
          
          <Button 
            onClick={forceEUR}
            variant="outline"
            className="flex items-center gap-2 bg-blue-50 border-blue-200 hover:bg-blue-100"
          >
            <Euro className="h-4 w-4" />
            Forcer EUR (Italie)
          </Button>
          
          <Button 
            onClick={clearLocalStorage}
            variant="outline"
            className="flex items-center gap-2 bg-red-50 border-red-200 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4" />
            Nettoyer le cache
          </Button>
        </div>

        {/* Informations de débogage détaillées */}
        {debugInfo && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Informations de débogage :</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* Test de conversion */}
        <div className="mt-4 p-4 border rounded-lg">
          <h4 className="font-semibold mb-2">Test de conversion :</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Prix en Euro :</p>
              <p className="text-lg font-semibold">29.99 €</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prix converti :</p>
              <p className="text-lg font-semibold text-green-600">
                {currencyService.formatPrice(29.99)}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Instructions :</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Rafraîchir la détection</strong> : Force la redétection automatique du pays</li>
            <li>• <strong>Forcer FCFA</strong> : Active manuellement le Franc CFA (Gabon)</li>
            <li>• <strong>Forcer EUR</strong> : Active manuellement l'Euro (Italie)</li>
            <li>• <strong>Nettoyer le cache</strong> : Supprime toutes les préférences sauvegardées</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

