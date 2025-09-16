import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface MessageStatusIndicatorProps {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  // New props for error handling
  error?: string;
  retryCount?: number;
  maxRetries?: number;
  onRetry?: () => void;
  onRemove?: () => void;
}

export const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({
  status,
  className = '',
  size = 'sm',
  error,
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  onRemove
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return (
          <Clock 
            className={cn(
              sizeClasses[size], 
              'text-gray-400 animate-pulse',
              className
            )} 
          />
        );
      case 'sent':
        return (
          <Check 
            className={cn(
              sizeClasses[size], 
              'text-gray-400',
              className
            )} 
          />
        );
      case 'delivered':
        return (
          <CheckCheck 
            className={cn(
              sizeClasses[size], 
              'text-gray-400',
              className
            )} 
          />
        );
      case 'read':
        return (
          <CheckCheck 
            className={cn(
              sizeClasses[size], 
              'text-blue-500',
              className
            )} 
          />
        );
      case 'error':
        return (
          <div className="flex items-center space-x-1">
            <AlertCircle 
              className={cn(
                sizeClasses[size], 
                'text-red-500',
                className
              )} 
            />
            {/* Error actions */}
            {(onRetry || onRemove) && (
              <div className="flex items-center space-x-1">
                {onRetry && retryCount < maxRetries && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={onRetry}
                          className="h-5 w-5 p-0 hover:bg-red-100"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Réessayer ({retryCount}/{maxRetries})
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {onRemove && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={onRemove}
                          className="h-5 w-5 p-0 hover:bg-red-100"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Supprimer le message
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return getStatusIcon();
};

// Composant pour afficher le statut avec texte
export interface MessageStatusWithTextProps extends MessageStatusIndicatorProps {
  showText?: boolean;
}

export const MessageStatusWithText: React.FC<MessageStatusWithTextProps> = ({
  status,
  showText = true,
  className = '',
  size = 'sm',
  error,
  retryCount = 0,
  maxRetries = 3,
  onRetry,
  onRemove
}) => {
  const getStatusText = () => {
    switch (status) {
      case 'sending':
        return 'Envoi...';
      case 'sent':
        return 'Envoyé';
      case 'delivered':
        return 'Livré';
      case 'read':
        return 'Lu';
      case 'error':
        return error || 'Erreur d\'envoi';
      default:
        return '';
    }
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <MessageStatusIndicator 
        status={status} 
        size={size}
        error={error}
        retryCount={retryCount}
        maxRetries={maxRetries}
        onRetry={onRetry}
        onRemove={onRemove}
      />
      {showText && (
        <span className={cn(
          'text-xs',
          status === 'error' ? 'text-red-500' : 'text-gray-500'
        )}>
          {getStatusText()}
          {status === 'error' && retryCount > 0 && (
            <span className="ml-1">({retryCount}/{maxRetries})</span>
          )}
        </span>
      )}
    </div>
  );
};