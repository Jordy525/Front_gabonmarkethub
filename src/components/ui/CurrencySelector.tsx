import React, { useState } from 'react';
import { ChevronDown, Globe, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Currency } from '@/services/currencyService';

interface CurrencySelectorProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ 
  className = '', 
  showLabel = true,
  variant = 'default'
}) => {
  const { 
    currentCurrency, 
    currentCurrencyInfo, 
    supportedCurrencies, 
    setCurrency, 
    isLoading, 
    error,
    forceUpdateRates 
  } = useCurrency();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCurrencyChange = (currency: string) => {
    setCurrency(currency);
    setIsOpen(false);
  };

  const handleForceUpdate = async () => {
    setIsUpdating(true);
    try {
      await forceUpdateRates();
    } finally {
      setIsUpdating(false);
    }
  };

  const renderCurrencyOption = (currency: Currency) => (
    <button
      key={currency.code}
      onClick={() => handleCurrencyChange(currency.code)}
      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors ${
        currentCurrency === currency.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
      }`}
    >
      <span className="text-lg">{currency.flag}</span>
      <div className="flex-1">
        <div className="font-medium">{currency.code}</div>
        <div className="text-sm text-gray-500">{currency.name}</div>
      </div>
      {currentCurrency === currency.code && (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Actuel
        </Badge>
      )}
    </button>
  );

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-lg">{currentCurrencyInfo.flag}</span>
        <span className="font-medium">{currentCurrencyInfo.code}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 px-2 gap-1"
        >
          <span className="text-sm">{currentCurrencyInfo.flag}</span>
          <span className="text-xs font-medium">{currentCurrencyInfo.code}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2 space-y-1">
              {supportedCurrencies.map(renderCurrencyOption)}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3 gap-2 min-w-[140px]"
        disabled={isLoading}
      >
        <Globe className="w-4 h-4" />
        <span className="text-lg">{currentCurrencyInfo.flag}</span>
        <span className="font-medium">{currentCurrencyInfo.code}</span>
        <ChevronDown className="w-4 h-4 ml-auto" />
      </Button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Choisir la devise</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleForceUpdate}
                disabled={isUpdating}
                className="h-6 px-2"
              >
                <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {showLabel && (
              <p className="text-xs text-gray-500 mt-1">
                Devise détectée automatiquement selon votre localisation
              </p>
            )}
          </div>

          {/* Liste des devises */}
          <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
            {supportedCurrencies.map(renderCurrencyOption)}
          </div>

          {/* Footer avec informations */}
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <div className="text-xs text-gray-600">
              <div className="flex items-center gap-1 mb-1">
                <span>🌍 Pays détecté:</span>
                <Badge variant="outline" className="text-xs">
                  {currentCurrencyInfo.flag} {currentCurrencyInfo.name}
                </Badge>
              </div>
              <div className="text-gray-500">
                Taux mis à jour automatiquement
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay pour fermer le menu */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        </div>
      )}

      {/* Indicateur d'erreur */}
      {error && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-red-500 rounded-full" title={error} />
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
