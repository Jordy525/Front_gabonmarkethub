import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, AlertCircle, Loader2, WifiOff } from 'lucide-react';

interface RetryWrapperProps {
  children: React.ReactNode;
  onRetry: () => Promise<void>;
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  showRetryButton?: boolean;
  autoRetry?: boolean;
  errorMessage?: string;
  loadingMessage?: string;
}

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  error: Error | null;
  nextRetryIn: number;
}

export const RetryWrapper: React.FC<RetryWrapperProps> = ({
  children,
  onRetry,
  maxRetries = 3,
  initialDelay = 1000,
  maxDelay = 10000,
  backoffMultiplier = 2,
  showRetryButton = true,
  autoRetry = false,
  errorMessage,
  loadingMessage = "Nouvelle tentative en cours..."
}) => {
  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    error: null,
    nextRetryIn: 0
  });

  // Calculer le délai avec backoff exponentiel
  const calculateDelay = useCallback((retryCount: number) => {
    const delay = Math.min(
      initialDelay * Math.pow(backoffMultiplier, retryCount),
      maxDelay
    );
    // Ajouter un peu de jitter pour éviter les thundering herd
    return delay + Math.random() * 1000;
  }, [initialDelay, backoffMultiplier, maxDelay]);

  // Fonction de retry
  const executeRetry = useCallback(async (isAutoRetry = false) => {
    if (state.retryCount >= maxRetries && !isAutoRetry) {
      return;
    }

    setState(prev => ({
      ...prev,
      isRetrying: true,
      error: null
    }));

    try {
      await onRetry();
      
      // Succès - réinitialiser l'état
      setState({
        isRetrying: false,
        retryCount: 0,
        error: null,
        nextRetryIn: 0
      });

    } catch (error) {
      const newRetryCount = state.retryCount + 1;
      const canRetryAgain = newRetryCount < maxRetries;
      
      setState(prev => ({
        ...prev,
        isRetrying: false,
        retryCount: newRetryCount,
        error: error as Error,
        nextRetryIn: canRetryAgain && autoRetry ? calculateDelay(newRetryCount) : 0
      }));

      // Auto-retry si activé et qu'on peut encore réessayer
      if (autoRetry && canRetryAgain) {
        const delay = calculateDelay(newRetryCount);
        
        // Countdown
        let remainingTime = Math.ceil(delay / 1000);
        setState(prev => ({ ...prev, nextRetryIn: remainingTime }));
        
        const countdownInterval = setInterval(() => {
          remainingTime -= 1;
          setState(prev => ({ ...prev, nextRetryIn: remainingTime }));
          
          if (remainingTime <= 0) {
            clearInterval(countdownInterval);
          }
        }, 1000);

        // Programmer le retry
        setTimeout(() => {
          clearInterval(countdownInterval);
          executeRetry(true);
        }, delay);
      }
    }
  }, [state.retryCount, maxRetries, onRetry, autoRetry, calculateDelay]);

  // Retry manuel
  const handleManualRetry = useCallback(() => {
    executeRetry(false);
  }, [executeRetry]);

  // Reset des erreurs
  const handleReset = useCallback(() => {
    setState({
      isRetrying: false,
      retryCount: 0,
      error: null,
      nextRetryIn: 0
    });
  }, []);

  // Déterminer le type d'erreur
  const getErrorType = (error: Error) => {
    if (!navigator.onLine) {
      return 'network';
    }
    
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'network';
    }
    
    return 'generic';
  };

  // Rendu conditionnel basé sur l'état
  if (state.isRetrying) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium mb-2">{loadingMessage}</p>
            <p className="text-sm text-muted-foreground">
              Tentative {state.retryCount + 1} sur {maxRetries}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state.error) {
    const errorType = getErrorType(state.error);
    const canRetry = state.retryCount < maxRetries;
    
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive" className="mb-4">
            {errorType === 'network' ? (
              <WifiOff className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">
                  {errorType === 'network' 
                    ? 'Problème de connexion'
                    : 'Une erreur s\'est produite'
                  }
                </p>
                <p className="text-sm">
                  {errorMessage || state.error.message}
                </p>
                {state.retryCount > 0 && (
                  <p className="text-xs">
                    Tentatives échouées : {state.retryCount}/{maxRetries}
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showRetryButton && canRetry && (
              <Button
                onClick={handleManualRetry}
                disabled={state.isRetrying}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
                {state.nextRetryIn > 0 && (
                  <span className="ml-1">({state.nextRetryIn}s)</span>
                )}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              Annuler
            </Button>
          </div>

          {autoRetry && canRetry && state.nextRetryIn > 0 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Nouvelle tentative automatique dans {state.nextRetryIn} secondes...</p>
            </div>
          )}

          {!canRetry && (
            <div className="mt-4 text-center">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Nombre maximum de tentatives atteint</p>
                  <p className="text-sm">
                    Veuillez vérifier votre connexion et recharger la page.
                  </p>
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};