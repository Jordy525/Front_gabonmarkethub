import React, { useMemo } from 'react';
import { createSafeHtmlRenderer } from '../../utils/htmlSanitizer';

interface SafeHtmlRendererProps {
  html: string;
  className?: string;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

/**
 * Composant sécurisé pour le rendu HTML qui évite les erreurs React #418
 * et les problèmes de sécurité XSS
 */
export const SafeHtmlRenderer: React.FC<SafeHtmlRendererProps> = ({
  html,
  className = '',
  fallback = <p className="text-gray-500 italic">Contenu non disponible</p>,
  onError
}) => {
  const renderResult = useMemo(() => {
    try {
      return createSafeHtmlRenderer(html);
    } catch (error) {
      console.warn('Erreur lors de la sanitisation HTML:', error);
      onError?.(error as Error);
      return {
        html: '',
        isSafe: false,
        shouldRender: false
      };
    }
  }, [html, onError]);

  // Si le contenu n'est pas sûr ou vide, afficher le fallback
  if (!renderResult.shouldRender) {
    return <>{fallback}</>;
  }

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: renderResult.html }}
    />
  );
};

export default SafeHtmlRenderer;
