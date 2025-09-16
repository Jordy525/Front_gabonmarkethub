import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SocketConnectionState } from '@/hooks/useSocketConnection';

export interface ConnectionStatusProps {
  connectionState: SocketConnectionState;
  onReconnect?: () => void;
  onDismiss?: () => void;
  className?: string;
  showDetails?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

/**
 * Composant pour afficher le statut de connexion Socket.IO
 * et gérer les reconnexions automatiques
 */
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionState,
  onReconnect,
  onDismiss,
  className = '',
  showDetails = false,
  autoHide = true,
  autoHideDelay = 5000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastConnectionTime, setLastConnectionTime] = useState<string>('');

  const {
    isConnected,
    isConnecting,
    error,
    connectionAttempts,
    lastConnectedAt
  } = connectionState;

  // Show/hide logic avec nettoyage correct
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isConnecting || error || (!isConnected && connectionAttempts > 0)) {
      setIsVisible(true);
    } else if (isConnected && autoHide) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideDelay);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isConnected, isConnecting, error, connectionAttempts, autoHide, autoHideDelay]);

  // Update last connection time
  useEffect(() => {
    if (lastConnectedAt) {
      setLastConnectionTime(lastConnectedAt.toLocaleTimeString());
    }
  }, [lastConnectedAt]);

  if (!isVisible) {
    return null;
  }

  const getStatusInfo = () => {
    if (isConnected) {
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        title: 'Connecté',
        description: 'Connexion temps réel active',
        variant: 'default' as const,
        badgeVariant: 'default' as const
      };
    }

    if (isConnecting) {
      return {
        icon: <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />,
        title: 'Connexion en cours',
        description: connectionAttempts > 1 
          ? `Tentative ${connectionAttempts}...` 
          : 'Établissement de la connexion...',
        variant: 'default' as const,
        badgeVariant: 'secondary' as const
      };
    }

    if (error) {
      return {
        icon: <AlertCircle className="w-4 h-4 text-red-500" />,
        title: 'Erreur de connexion',
        description: error,
        variant: 'destructive' as const,
        badgeVariant: 'destructive' as const
      };
    }

    return {
      icon: <WifiOff className="w-4 h-4 text-gray-500" />,
      title: 'Déconnecté',
      description: 'Connexion temps réel indisponible',
      variant: 'default' as const,
      badgeVariant: 'secondary' as const
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <Alert 
      variant={statusInfo.variant} 
      className={cn('transition-all duration-300', className)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {statusInfo.icon}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">{statusInfo.title}</span>
              <Badge variant={statusInfo.badgeVariant} className="text-xs">
                {isConnected ? 'En ligne' : isConnecting ? 'Connexion' : 'Hors ligne'}
              </Badge>
            </div>
            <AlertDescription className="mt-1">
              {statusInfo.description}
            </AlertDescription>
            
            {showDetails && (
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                {connectionAttempts > 0 && (
                  <div>Tentatives: {connectionAttempts}</div>
                )}
                {lastConnectionTime && (
                  <div>Dernière connexion: {lastConnectionTime}</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isConnected && !isConnecting && onReconnect && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReconnect}
              className="text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reconnecter
            </Button>
          )}
          
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onDismiss();
                setIsVisible(false);
              }}
              className="text-xs h-6 w-6 p-0"
            >
              ×
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
};

/**
 * Indicateur compact de statut de connexion
 */
export const CompactConnectionStatus: React.FC<{
  isConnected: boolean;
  isConnecting: boolean;
  className?: string;
}> = ({ isConnected, isConnecting, className = '' }) => {
  const getStatusColor = () => {
    if (isConnected) return 'bg-green-500';
    if (isConnecting) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (isConnected) return 'En ligne';
    if (isConnecting) return 'Connexion...';
    return 'Hors ligne';
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn(
        'w-2 h-2 rounded-full transition-colors duration-300',
        getStatusColor(),
        isConnecting && 'animate-pulse'
      )} />
      <span className="text-xs text-gray-500">
        {getStatusText()}
      </span>
    </div>
  );
};

/**
 * Indicateur de connexion dans la barre de navigation
 */
export const NavConnectionStatus: React.FC<{
  connectionState: SocketConnectionState;
  onReconnect?: () => void;
}> = ({ connectionState, onReconnect }) => {
  const { isConnected, isConnecting, error } = connectionState;

  if (isConnected) {
    return (
      <div className="flex items-center space-x-1 text-green-600">
        <Wifi className="w-4 h-4" />
        <span className="text-xs hidden sm:inline">En ligne</span>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex items-center space-x-1 text-yellow-600">
        <Clock className="w-4 h-4 animate-pulse" />
        <span className="text-xs hidden sm:inline">Connexion...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={onReconnect}
        className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors"
        title={error || 'Connexion interrompue - Cliquer pour reconnecter'}
      >
        <WifiOff className="w-4 h-4" />
        <span className="text-xs hidden sm:inline">Hors ligne</span>
      </button>
    </div>
  );
};

export default ConnectionStatus;