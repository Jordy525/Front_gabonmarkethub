import React, { useEffect, useState } from 'react';

/**
 * Composant de debug simple pour mobile - ne bloque pas l'interface
 */
export const MobileDebugSimple: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // Seulement en développement et sur mobile
    if (process.env.NODE_ENV !== 'development') return;
    if (window.innerWidth > 640) return;

    const updateDebugInfo = () => {
      setDebugInfo({
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        timestamp: new Date().toLocaleTimeString()
      });
    };

    updateDebugInfo();
    
    // Mettre à jour toutes les 5 secondes seulement
    const interval = setInterval(updateDebugInfo, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Ne pas afficher en production
  if (process.env.NODE_ENV === 'production') return null;
  if (window.innerWidth > 640) return null;

  return (
    <>
      {/* Bouton pour afficher/masquer le debug */}
      <button
        onClick={() => setShowDebug(!showDebug)}
        style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '16px'
        }}
      >
        🔧
      </button>

      {/* Panneau de debug */}
      {showDebug && (
        <div
          style={{
            position: 'fixed',
            bottom: '60px',
            right: '10px',
            zIndex: 9998,
            backgroundColor: 'rgba(0,0,0,0.9)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '12px',
            maxWidth: '200px'
          }}
        >
          <div>📱 Mobile Debug</div>
          <div>Viewport: {debugInfo.viewport}</div>
          <div>Device: {debugInfo.userAgent}</div>
          <div>Time: {debugInfo.timestamp}</div>
        </div>
      )}
    </>
  );
};

export default MobileDebugSimple;