import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/services/api';

interface ServerStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

const ServerStatusIndicator: React.FC<ServerStatusIndicatorProps> = ({ 
  className = '', 
  showDetails = false 
}) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkServerStatus = async () => {
    try {
      setStatus('checking');
      setError(null);
      
      // Test simple de connexion au serveur
      await apiClient.get('/health');
      
      setStatus('online');
      setLastCheck(new Date());
    } catch (err) {
      setStatus('offline');
      setError(err instanceof Error ? err.message : 'Serveur inaccessible');
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkServerStatus();
    
    // Vérifier le statut toutes les 30 secondes
    const interval = setInterval(checkServerStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-red-600" />;
      case 'checking':
        return <Wifi className="w-4 h-4 text-yellow-600 animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Serveur en ligne';
      case 'offline':
        return 'Serveur hors ligne';
      case 'checking':
        return 'Vérification...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'checking':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (status === 'online' && !showDetails) {
    return null; // Ne pas afficher si tout va bien et qu'on ne veut pas les détails
  }

  return (
    <div className={className}>
      {status === 'offline' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="flex items-center justify-between">
              <span>
                <strong>Serveur backend inaccessible</strong>
                <br />
                Certaines fonctionnalités peuvent ne pas fonctionner correctement.
                {error && (
                  <span className="text-sm text-red-600 block mt-1">
                    Erreur: {error}
                  </span>
                )}
              </span>
              <Badge 
                variant="outline" 
                className={`ml-2 ${getStatusColor()}`}
              >
                {getStatusIcon()}
                <span className="ml-1">{getStatusText()}</span>
              </Badge>
            </div>
            {lastCheck && (
              <div className="text-xs text-red-600 mt-2">
                Dernière vérification: {lastCheck.toLocaleTimeString()}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {status === 'checking' && showDetails && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Wifi className="h-4 w-4 text-yellow-600 animate-pulse" />
          <AlertDescription className="text-yellow-800">
            Vérification de la connexion au serveur...
          </AlertDescription>
        </Alert>
      )}

      {status === 'online' && showDetails && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <div className="flex items-center justify-between">
              <span>Serveur backend opérationnel</span>
              <Badge 
                variant="outline" 
                className={`ml-2 ${getStatusColor()}`}
              >
                {getStatusIcon()}
                <span className="ml-1">{getStatusText()}</span>
              </Badge>
            </div>
            {lastCheck && (
              <div className="text-xs text-green-600 mt-2">
                Dernière vérification: {lastCheck.toLocaleTimeString()}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ServerStatusIndicator;
