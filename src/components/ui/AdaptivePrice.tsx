import React from 'react';
import { usePriceFormatter } from '@/contexts/CurrencyContext';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AdaptivePriceProps {
  priceInEuro: number;
  originalCurrency?: string;
  showOriginal?: boolean;
  showConversion?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'highlight' | 'muted' | 'success';
  className?: string;
  tooltip?: boolean;
}

const AdaptivePrice: React.FC<AdaptivePriceProps> = ({
  priceInEuro,
  originalCurrency = 'EUR',
  showOriginal = false,
  showConversion = false,
  size = 'md',
  variant = 'default',
  className = '',
  tooltip = false
}) => {
  const { format, convert, currentCurrency } = usePriceFormatter();
  
  const convertedPrice = convert(priceInEuro);
  const formattedPrice = format(priceInEuro);
  const isOriginalCurrency = currentCurrency === originalCurrency;

  // Classes de taille
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  // Classes de variante
  const variantClasses = {
    default: 'text-gray-900',
    highlight: 'text-blue-600 font-semibold',
    muted: 'text-gray-500',
    success: 'text-green-600 font-semibold'
  };

  // Contenu du prix
  const priceContent = (
    <span className={`${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {formattedPrice}
    </span>
  );

  // Contenu avec conversion
  if (showConversion && !isOriginalCurrency) {
    return (
      <div className="flex items-center gap-2">
        {priceContent}
        <Badge variant="outline" className="text-xs">
          {originalCurrency} {priceInEuro.toFixed(2)}
        </Badge>
      </div>
    );
  }

  // Contenu avec prix original
  if (showOriginal && !isOriginalCurrency) {
    return (
      <div className="flex items-center gap-2">
        {priceContent}
        <span className="text-xs text-gray-500 line-through">
          {originalCurrency} {priceInEuro.toFixed(2)}
        </span>
      </div>
    );
  }

  // Contenu avec tooltip
  if (tooltip && !isOriginalCurrency) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {priceContent}
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <div className="font-medium">{formattedPrice}</div>
              <div className="text-xs text-gray-500">
                {originalCurrency} {priceInEuro.toFixed(2)}
              </div>
              <div className="text-xs text-blue-600">
                Taux: 1 {originalCurrency} = {convert(1).toFixed(2)} {currentCurrency}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Prix simple
  return priceContent;
};

// Composant pour les prix de produits
export const ProductPrice: React.FC<{
  priceInEuro: number;
  originalPrice?: number;
  discount?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ priceInEuro, originalPrice, discount, size = 'md', className = '' }) => {
  const { format, convert } = usePriceFormatter();
  
  const hasDiscount = originalPrice && originalPrice > priceInEuro;
  const discountAmount = hasDiscount ? originalPrice - priceInEuro : 0;
  const discountPercentage = hasDiscount ? Math.round((discountAmount / originalPrice) * 100) : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Prix actuel */}
      <AdaptivePrice
        priceInEuro={priceInEuro}
        size={size}
        variant="highlight"
      />
      
      {/* Prix original barré */}
      {hasDiscount && (
        <span className="text-sm text-gray-500 line-through">
          {format(originalPrice)}
        </span>
      )}
      
      {/* Badge de réduction */}
      {hasDiscount && (
        <Badge variant="destructive" className="text-xs">
          -{discountPercentage}%
        </Badge>
      )}
    </div>
  );
};

// Composant pour les totaux
export const TotalPrice: React.FC<{
  totalInEuro: number;
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ totalInEuro, currency, size = 'lg', className = '' }) => {
  const { format, convert } = usePriceFormatter();
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`${size === 'xl' ? 'text-2xl' : size === 'lg' ? 'text-xl' : size === 'md' ? 'text-lg' : 'text-base'} font-bold text-green-600`}>
        {format(totalInEuro)}
      </span>
      
      {currency && currency !== 'EUR' && (
        <Badge variant="outline" className="text-xs">
          Total: {totalInEuro.toFixed(2)} €
        </Badge>
      )}
    </div>
  );
};

// Composant pour les prix de comparaison
export const ComparisonPrice: React.FC<{
  priceInEuro: number;
  compareWith?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ priceInEuro, compareWith, size = 'md', className = '' }) => {
  const { format, convert } = usePriceFormatter();
  
  if (!compareWith) {
    return <AdaptivePrice priceInEuro={priceInEuro} size={size} className={className} />;
  }

  const difference = priceInEuro - compareWith;
  const isHigher = difference > 0;
  const isLower = difference < 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <AdaptivePrice
        priceInEuro={priceInEuro}
        size={size}
        variant={isLower ? 'success' : isHigher ? 'muted' : 'default'}
      />
      
      {difference !== 0 && (
        <Badge 
          variant={isLower ? 'default' : 'secondary'} 
          className={`text-xs ${isLower ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
        >
          {isLower ? '↓' : '↑'} {format(Math.abs(difference))}
        </Badge>
      )}
    </div>
  );
};

export default AdaptivePrice;
