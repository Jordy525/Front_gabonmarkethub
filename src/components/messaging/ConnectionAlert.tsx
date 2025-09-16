import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { socketService } from '@/services/socketService';

export const ConnectionAlert: React.FC = () => {
  const [connectionState, setConnectionState] = useState(socketService.state);
  const [showAlert, setShowAlert] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    const checkConnection = () => {
      const state = socketService.state;
      const isConnected = socketService.isConnected;
      
      setConnectionState(state);
      
      // Afficher l'alerte si déconnecté ou en erreur
      if (state === 'error' || (!isConnected && state !== 'connecting')) {
        setShowAlert(true);
      } else if (isConnected) {
        setShowAlert(false);
      }
    };

    const interval = setInterval(checkConnection, 2000);
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  const handleForceStop = () => {
    socketService.disconnect();
    setShowAlert(false);
  };

  const handleRetry = () => {
    socketService.connect().catch(console.error);
    setShowAlert(false);
  };

  if (!showAlert) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              Problème de connexion WebSocket
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                La messagerie temps réel rencontre des difficultés de connexion.
                {reconnectAttempts > 0 && (
                  <span className="block mt-1">
                    Tentatives de reconnexion : {reconnectAttempts}
                  </span>
                )}
              </p>
            </div>
            <div className="mt-3 flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
              >
                <Wifi className="w-4 h-4 mr-1" />
                Réessayer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleForceStop}
                className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
              >
                <WifiOff className="w-4 h-4 mr-1" />
                Arrêter
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowAlert(false)}
            className="text-yellow-600 hover:text-yellow-800 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};