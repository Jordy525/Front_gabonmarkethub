import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Appeler le callback d'erreur si fourni
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Envoyer l'erreur à un service de monitoring (optionnel)
    // this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Ici vous pouvez envoyer l'erreur à un service comme Sentry, LogRocket, etc.
    console.log('Logging error to monitoring service:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Utiliser le fallback personnalisé si fourni
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Interface d'erreur par défaut
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Une erreur s'est produite</CardTitle>
              <p className="text-muted-foreground">
                Désolé, quelque chose s'est mal passé. Nous avons été notifiés du problème.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Détails de l'erreur en mode développement */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert variant="destructive">
                  <Bug className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Erreur technique :</p>
                      <p className="text-sm font-mono bg-muted p-2 rounded">
                        {this.state.error.message}
                      </p>
                      {this.state.error.stack && (
                        <details className="text-xs">
                          <summary className="cursor-pointer font-medium">
                            Stack trace (cliquez pour voir)
                          </summary>
                          <pre className="mt-2 bg-muted p-2 rounded overflow-auto text-xs">
                            {this.state.error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Réessayer
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Recharger la page
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </div>

              {/* Conseils pour l'utilisateur */}
              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>Si le problème persiste, essayez :</p>
                <ul className="text-left max-w-md mx-auto space-y-1">
                  <li>• Vider le cache de votre navigateur</li>
                  <li>• Vérifier votre connexion internet</li>
                  <li>• Contacter le support technique</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook pour utiliser l'ErrorBoundary de manière programmatique
export const useErrorBoundary = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return {
    captureError,
    resetError
  };
};