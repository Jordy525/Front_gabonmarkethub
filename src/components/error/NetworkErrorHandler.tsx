import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, Wifi, AlertCircle, RefreshCw } from 'lucide-react';

interface NetworkErrorHandlerProps {
  children: React.ReactNode;
}

export const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérifier la connexion au montage
    if (!navigator.onLine) {
      setShowOfflineMessage(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      setShowOfflineMessage(false);
      window.location.reload();
    }
  };

  return (
    <>
      {showOfflineMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div>
                <p className="font-medium">Connexion perdue</p>
                <p className="text-sm">Vérifiez votre connexion internet</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="ml-4"
                disabled={!isOnline}
              >
                {isOnline ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Réessayer
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Hors ligne
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Indicateur de statut réseau */}
      <div className="fixed bottom-4 right-4 z-40">
        {!isOnline && (
          <div className="bg-destructive text-destructive-foreground px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm">
            <WifiOff className="h-4 w-4" />
            Hors ligne
          </div>
        )}
      </div>
      
      {children}
    </>
  );
};