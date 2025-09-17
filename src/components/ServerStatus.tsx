// Composant pour afficher le statut du serveur

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { apiClient } from '@/services/api';

export const ServerStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [lastError, setLastError] = useState<string | null>(null);
  const [isProduction, setIsProduction] = useState(false);
  const [failureCount, setFailureCount] = useState(0);

  // Détecter l'environnement de production
  useEffect(() => {
    const isProd = import.meta.env.PROD || window.location.hostname !== 'localhost';
    setIsProduction(isProd);
  }, []);

  // Vérifier le statut du serveur
  const checkServerStatus = async () => {
    try {
      setServerStatus('checking');
      setLastError(null);
      
      // Utiliser le client API configuré
      await apiClient.get('/health');
      
      setServerStatus('online');
      setFailureCount(0); // Reset du compteur d'échecs en cas de succès
    } catch (error) {
      console.warn('Serveur non accessible:', error);
      
      // Incrémenter le compteur d'échecs
      const newFailureCount = failureCount + 1;
      setFailureCount(newFailureCount);
      
      // En production, attendre 3 échecs avant de marquer comme offline
      if (isProduction && newFailureCount < 3) {
        setServerStatus('checking');
        return;
      }
      
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
    
    // En production, vérifier le serveur moins fréquemment et avec plus de tolérance
    if (isProduction) {
      // Vérification initiale avec un délai
      setTimeout(checkServerStatus, 2000);
      // Vérification périodique moins fréquente en production (toutes les 2 minutes)
      const interval = setInterval(checkServerStatus, 120000);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(interval);
      };
    } else {
      // En développement, comportement normal
      checkServerStatus();
      const interval = setInterval(checkServerStatus, 30000); // Toutes les 30 secondes
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(interval);
      };
    }
  }, [isProduction]);

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
            {isProduction ? (
              <>
                Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.
                {lastError && (
                  <span className="text-sm block mt-1">
                    Erreur: {lastError}
                  </span>
                )}
                <div className="text-xs mt-2 text-red-700">
                  💡 Si le problème persiste, contactez l'administrateur du système.
                </div>
              </>
            ) : (
              <>
                Vérifiez que le serveur backend est démarré sur le port 3001.
                {lastError && (
                  <span className="text-sm block mt-1">
                    Erreur: {lastError}
                  </span>
                )}
                <div className="text-xs mt-2 text-red-700">
                  💡 Solution: Démarrez le serveur avec <code>npm run dev</code> dans le dossier Backend_Ecommerce
                </div>
              </>
            )}
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
