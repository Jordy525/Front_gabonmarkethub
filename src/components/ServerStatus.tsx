// Composant pour afficher le statut du serveur

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/services/api';

export const ServerStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [lastError, setLastError] = useState<string | null>(null);

  // Vérifier le statut du serveur
  const checkServerStatus = async () => {
    try {
      setServerStatus('checking');
      setLastError(null);
      
      // Utiliser le client API configuré
      await apiClient.get('/health');
      
      setServerStatus('online');
    } catch (error) {
      console.warn('Serveur non accessible:', error);
      setServerStatus('offline');
      
      // Capturer le message d'erreur pour l'affichage
      if (error instanceof Error) {
        setLastError(error.message);
      } else {
        setLastError('Erreur de connexion au serveur');
      }
    }
  };

  // Vérifier la connexion internet
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérification initiale
    setIsOnline(navigator.onLine);
    checkServerStatus();

    // Vérification périodique du serveur
    const interval = setInterval(checkServerStatus, 30000); // Toutes les 30 secondes

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Ne rien afficher si tout va bien
  if (isOnline && serverStatus === 'online') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {!isOnline && (
        <Alert variant="destructive" className="mb-2">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            <strong>Pas de connexion internet</strong>
            <br />
            Vérifiez votre connexion réseau.
          </AlertDescription>
        </Alert>
      )}
      
      {isOnline && serverStatus === 'offline' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Serveur backend inaccessible</strong>
            <br />
            Vérifiez que le serveur backend est démarré sur le port 3001.
            {lastError && (
              <span className="text-sm block mt-1">
                Erreur: {lastError}
              </span>
            )}
            <div className="text-xs mt-2 text-red-700">
              💡 Solution: Démarrez le serveur avec <code>npm run dev</code> dans le dossier Backend_Ecommerce
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {isOnline && serverStatus === 'checking' && (
        <Alert>
          <Wifi className="h-4 w-4 animate-pulse" />
          <AlertDescription>
            <strong>Vérification du serveur...</strong>
            <br />
            Test de connexion en cours...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};